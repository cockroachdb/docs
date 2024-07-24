---
title: MOLT Live Migration Service
summary: Learn how to use the Live Migration Service to shadow application traffic, perform cutover, and migrate a database to CockroachDB.
toc: true
docs_area: migrate
---

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

MOLT Live Migration Service (LMS) is used during a [live migration]({% link {{site.current_cloud_version}}/migration-overview.md %}#minimal-downtime) to CockroachDB.

The LMS is a self-hosted, horizontally scalable proxy that routes traffic between an application, a source database, and a target CockroachDB database. You use the LMS to control which database, as the "source of truth", is serving reads and writes to an application. You can optionally configure the LMS to [shadow production traffic](#shadowing-modes) from the source database and validate the query results on CockroachDB. When you have sufficiently tested your application and are confident with its consistency and performance on CockroachDB, you use the LMS to [perform the cutover](#perform-a-cutover) to CockroachDB.

MOLT LMS is self-hosted on [Kubernetes](https://kubernetes.io/) and [configured using Helm](#configuration). At a high level, the LMS consists of the following:

- A number of proxy [instances](#lms-instances) (running in separate Kubernetes pods) across which application traffic is distributed and routed to the source and target databases.
- An "orchestrator" service (running in a single Kubernetes pod) that coordinates the proxy instances and sends the cutover commands.

This page describes how to [install](#installation), [configure](#configuration), [secure](#security), and [use the LMS](#molt-lms-cli) to perform a live migration. {% comment %}For more information, see [Migration Strategy: Live Migration]({% link {{site.current_cloud_version}}/migration-strategy-live-migration.md %}).{% endcomment %}

Watch a demo of the Live Migration Service in action:

{% include_cached youtube.html video_id="HA8ec9e_a-s" %}

## Terminology

- A *live migration* keeps two production databases online (a source and a target database) and uses either replication or dual writing to keep data identical between them until a final cutover.
- The *source of truth* is the database that serves reads and writes to the application during a live migration. A cutover switches the source of truth.
- *Shadowing* is the execution of source SQL statements on the target database in parallel. The LMS supports multiple [shadowing modes](#shadowing-modes).

## Requirements

- [Kubernetes](https://kubernetes.io/) cluster
- [Helm](https://helm.sh/docs/intro/install/) package manager for Kubernetes

#### Supported database technologies

- [PostgreSQL]({% link {{site.current_cloud_version}}/migrate-from-postgres.md %}) (source)
- [MySQL]({% link {{site.current_cloud_version}}/migrate-from-mysql.md %}) (source)
- CockroachDB (source and target)

## Installation

1. Add the Helm chart repository at `https://molt.cockroachdb.com/lms/charts/` with [`helm repo add`](https://helm.sh/docs/helm/helm_repo_add/). Then install the chart with [`helm install`](https://helm.sh/docs/helm/helm_install/). For example:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    helm repo add lms https://molt.cockroachdb.com/lms/charts/
    helm install lms lms/lms
    ~~~

1. Port-forward from your local machine to the orchestrator, using the release name that you specified with `helm install`. The orchestrator port is configurable and is [`4200` by default](#service-type).

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl port-forward svc/{releasename}-lms-orchestrator 4200:4200 
    ~~~

    {{site.data.alerts.callout_success}}
    If you named the release `lms`, exclude `{releasename}-` from the command.
    {{site.data.alerts.end}}

1. The LMS proxy instances and orchestrator are initialized as Kubernetes pods:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl get pods
    ~~~

    ~~~
    NAME                                READY   STATUS    RESTARTS   AGE
    lms-orchestrator-86779b87f7-qrk9q   1/1     Running   0          52s
    lms-576bffdd8c-pmh6g                1/1     Running   0          52s
    lms-576bffdd8c-pbdvl                1/1     Running   0          52s
    lms-576bffdd8c-s7kx4                1/1     Running   0          52s
    ...
    ~~~

    You will see `lms` pods that match the configured [number of LMS instances](#lms-instances), along with one `lms-orchestrator` pod. 

    The pod names are prefixed with the release name you specified when running `helm install`, unless you named the release `lms`.

## Configuration

To configure the LMS, override the [Helm chart values](https://github.com/cockroachdb/molt-helm-charts/blob/main/lms/values.yaml). This involves a rolling restart of your pods. For information on setting Helm chart values, see the [Helm documentation](https://helm.sh/docs/helm/helm_upgrade/).

This section describes the most important and commonly used values. For details on all configurable values, refer to the [`values.yaml`](https://github.com/cockroachdb/molt-helm-charts/blob/main/lms/values.yaml) file.

#### LMS version

{% include molt/update-lms-version.md %}

{{site.data.alerts.callout_success}}
For release details, see the [MOLT changelog]({% link releases/molt.md %}?filters=lms).
{{site.data.alerts.end}}

#### Source dialect

~~~ yaml
lms:
  sourceDialect: ""
...
orchestrator:
  sourceDialect: ""
~~~

You **must** provide a string value for `sourceDialect`, which specifies the dialect of your source database. Supported dialects are:

- `postgres`: PostgreSQL
- `mysql`: MySQL
- `cockroach`: CockroachDB

#### Shadowing

~~~ yaml
lms:
  shadowMode: none
~~~

`lms.shadowMode` specifies the shadowing behavior used by the LMS. This should depend on your specific migration requirements. For details, see [Shadowing modes](#shadowing-modes).

#### LMS instances

~~~ yaml
lms:
  replicaCount: 3
~~~

`lms.replicaCount` determines the number of LMS instances created as `lms` pods on the Kubernetes cluster, across which application traffic is distributed. This defaults to `3`.

#### LMS connection

~~~ yaml
lms:
  allowTLSDisable: false
~~~

`lms.allowTLSDisable` enables insecure LMS connections to databases, and is disabled by default. Enable insecure connections **only** if a secure SSL/TLS connection to the source or target database is not possible. When possible, [secure SSL/TLS connections](#security) should be used.

{{site.data.alerts.callout_success}}
You can also set the `--allow-tls-mode-disable` [flag](#global-flags) to enable insecure LMS connections.
{{site.data.alerts.end}}

By default, `allowTLSDisable` is set to `false`, and initiating an insecure connection will return the following error:

~~~
SSL key or cert is not found. By default, secure (TLS) connections are required. If a secure connection is not possible, set the --allow-tls-mode-disable flag to skip this check.
~~~

#### Connection strings

The following connection strings are specific to your configuration:

- External connection string for the source database.
- External connection string for the target CockroachDB database.
- Internal connection string for the LMS.

You should specify these in external Kubernetes secrets. For details, see [Manage external secret](#manage-external-secrets).

{{site.data.alerts.callout_danger}}
Storing sensitive keys in external secrets is **strongly** recommended.
{{site.data.alerts.end}}

#### Service type

~~~ yaml
lms:
  service:
    type: ClusterIP
    port: 9043
    metricsPort: 9044
...
orchestrator:
  service:
    type: ClusterIP
    port: 4200
    metricsPort: 4201
~~~

`service` specifies the [Kubernetes service type](https://kubernetes.io/docs/concepts/services-networking/service/#publishing-services-service-types) and ports for the LMS instances and orchestrator.

#### Prometheus Operator

~~~ yaml
serviceMonitor:
  enabled: false
  labels: {}
  annotations: {}
  interval: 30s
  namespaced: false
~~~

`serviceMonitor` is a custom resource used with the [Prometheus Operator](https://github.com/prometheus-operator/prometheus-operator/tree/main) for monitoring Kubernetes. For more information, see the [Prometheus Operator documentation](https://github.com/prometheus-operator/prometheus-operator/blob/main/Documentation/user-guides/getting-started.md).

## Security

{{site.data.alerts.callout_danger}}
Cockroach Labs **strongly** recommends the following:

- Manage your LMS and orchestrator configurations in [external Kubernetes secrets](#manage-external-secrets).
- To establish secure connections between the LMS pods and with your client, generate and set up TLS certificates for the [source database and CockroachDB](#configure-an-lms-secret), [LMS](#configure-the-lms-certificates), and [orchestrator](#configure-the-orchestrator-and-client-certificates).
{{site.data.alerts.end}}

By default, initiating an insecure connection will return an error. You can override this check by setting either the `--allow-tls-mode-disable` [flag](#global-flags) or `allowTLSDisable` in the [Helm configuration](#lms-connection). Enable insecure connections **only** if secure SSL/TLS connections to the source or target database are not possible.

#### Manage external secrets

Cockroach Labs recommends using [External Secrets Operator](https://external-secrets.io/latest/) to [create and manage Kubernetes secrets](https://external-secrets.io/latest/introduction/getting-started/#create-your-first-externalsecret) that contain:

- [Your LMS configuration](#configure-an-lms-secret), which includes the source and target database connection strings.
- [Your orchestrator configuration](#configure-an-orchestrator-secret), which includes the LMS and target database connection strings.
- Your [LMS](#configure-the-lms-certificates) and [orchestrator](#configure-the-orchestrator-and-client-certificates) certificates, which you should have generated separately.

For information on Kubernetes secrets, see the [Kubernetes documentation](https://kubernetes.io/docs/concepts/configuration/secret/).

#### Configure an LMS secret

Create an external secret that specifies the connection strings for the source and target CockroachDB database.

For example, the following `ExternalSecret` called `lms-config` uses AWS Secrets Manager as the [`SecretStore`](https://external-secrets.io/latest/introduction/getting-started/#create-your-first-secretstore), and references a remote [AWS secret](https://docs.aws.amazon.com/secretsmanager/latest/userguide/create_secret.html) called `lms-secret`:

~~~ yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: lms-config
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secret-store
    kind: SecretStore
  target:
    name: lms-config
    creationPolicy: Owner
    template:
      engineVersion: v2
      data:
        config.json: |
          {
            "INIT_SOURCE": "{% raw %}{{ .source }}{% endraw %}",
            "INIT_TARGET": "{% raw %}{{ .target }}{% endraw %}"
          }
  data:
  - secretKey: source
    remoteRef:
      key: lms-secret
      property: INIT_SOURCE
  - secretKey: target
    remoteRef:
      key: lms-secret
      property: INIT_TARGET
~~~

The connection strings are specified with the following keys inside `config.json`:

- `INIT_SOURCE`: External connection string for the source database, including the paths to your client certificate and keys.
- `INIT_TARGET`: External [connection string for the CockroachDB database]({% link {{site.current_cloud_version}}/connection-parameters.md %}#connect-using-a-url), including the paths to your client certificate and keys.

The remote secret `lms-secret` will contain the full connection strings and paths, such that the `config.json` keys resolve to:

~~~ json
"INIT_SOURCE": "mysql://{username}:{password}@{host}:{port}/{database}?sslmode=verify-full?sslrootcert=path/to/mysql.ca&sslcert=path/to/mysql.crt&sslkey=path/to/mysql.key",
"INIT_TARGET": "postgresql://{username}:{password}@{host}:{port}/{database}?sslmode=verify-full?sslrootcert=path/to/ca.crt&sslcert=path/to/client.username.crt&sslkey=path/to/client.username.key"
~~~

In the [Helm configuration](#configuration), `lms.configSecretName` must specify the external secret `name`:

~~~ yaml
lms:
  configSecretName: "lms-config"
~~~

#### Configure an orchestrator secret

Create an external secret that specifies the connection strings for the LMS and target CockroachDB database.

For example, the following `ExternalSecret` called `orch-config` uses AWS Secrets Manager as the [`SecretStore`](https://external-secrets.io/latest/introduction/getting-started/#create-your-first-secretstore), and references a remote [AWS secret](https://docs.aws.amazon.com/secretsmanager/latest/userguide/create_secret.html) called `orch-secret`:

~~~ yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: orch-config
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secret-store
    kind: SecretStore
  target:
    name: orch-config
    creationPolicy: Owner
    template:
      engineVersion: v2
      data:
        config.json: |
          {
            "LMS_URL": "{% raw %}{{ .lmsUrl }}{% endraw %}",
            "CRDB_URL": "{% raw %}{{ .crdbUrl }}{% endraw %}"
          }
  data:
  - secretKey: lmsUrl
    remoteRef:
      key: orch-secret
      property: LMS_URL
  - secretKey: crdbUrl
    remoteRef:
      key: orch-secret
      property: CRDB_URL
~~~

The connection strings are specified with the following keys inside `config.json`:

- `LMS_URL`: Internal connection string for the LMS, specifying the username and password of the source database. The format depends on your source dialect:

  - MySQL: `{username}:{password}@({releasename}-lms.{namespace}.svc.cluster.local:{port})/{database}`
  - PostgreSQL: `postgresql://{username}:{password}@{releasename}-lms.{namespace}.svc.cluster.local:{port}/{database}`

    {{site.data.alerts.callout_success}}
    If you named the release `lms` during [installation](#installation), exclude `{releasename}-` from the LMS connection string.
    {{site.data.alerts.end}}

- `CRDB_URL`: External [connection string for the CockroachDB database]({% link {{site.current_cloud_version}}/connection-parameters.md %}#connect-using-a-url), including the paths to your client certificate and keys.

The remote secret `orch-secret` will contain the full connection strings, such that the `config.json` keys resolve to:

~~~ json
"LMS_URL": "{username}:{password}@({releasename}-molt-lms.{namespace}.svc.cluster.local:{port})/{database}",
"CRDB_URL": "postgresql://{username}:{password}@{host}:{port}/{database}?sslmode=verify-full?sslrootcert=path/to/ca.crt&sslcert=path/to/client.username.crt&sslkey=path/to/client.username.key"
~~~ 

In the [Helm configuration](#configuration), `orchestrator.configSecretName` must specify the external secret `name`:

~~~ yaml
orchestrator:
  configSecretName: "orch-config"
~~~

#### Configure the LMS certificates

Create an external secret that specifies the LMS certificate, key, and (optional) CA certificate.

For example, the following `ExternalSecret` called `lms-tls` uses AWS Secrets Manager as the [`SecretStore`](https://external-secrets.io/latest/introduction/getting-started/#create-your-first-secretstore), and references a remote [AWS secret](https://docs.aws.amazon.com/secretsmanager/latest/userguide/create_secret.html) called `lms-certs`:

~~~ yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: lms-tls
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secret-store
    kind: SecretStore
  target:
    name: lms-tls
    creationPolicy: Owner
    template:
      engineVersion: v2
      data:
        lms-ca.crt: '{% raw %}{{ .caCert }}{% endraw %}'
        lms-tls.crt: '{% raw %}{{ .serverCert }}{% endraw %}'
        lms-tls.key: '{% raw %}{{ .serverKey }}{% endraw %}'
  data:
  - secretKey: caCert
    remoteRef:
      key: lms-certs
      property: caCert
  - secretKey: serverCert
    remoteRef:
      key: lms-certs
      property: serverCert
  - secretKey: serverKey
    remoteRef:
      key: lms-certs
      property: serverKey
~~~

In the preceding example, each `.crt` and `.key` filename is associated with its corresponding value in the remote secret `lms-certs`.

In the [Helm configuration](#configuration), `lms.sslVolumes` and `lms.sslVolumeMounts` must specify [volumes](https://kubernetes.io/docs/concepts/storage/volumes/#secret) and mount paths that contain the server-side certificates. The path to each file is specified as an environment variable in `lms.env`. Cockroach Labs recommends mounting certificates to `/app/certs`. 

{{site.data.alerts.callout_info}}
Certificates **must** be mounted in a readable format, or the LMS will error. The format should match the output of `cat {certificate}` on your host machine.
{{site.data.alerts.end}}

~~~ yaml
lms:
  sslVolumes:
    - name: lms-tls
      secret:
        secretName: lms-tls
  sslVolumeMounts:
    - mountPath: "/app/certs"
      name: lms-tls
      readOnly: true
  env:
    - name: LMS_SSL_CA
      value: /app/certs/lms-ca.crt
    - name: LMS_SSL_CERT
      value: /app/certs/lms-tls.crt
    - name: LMS_SSL_KEY
      value: /app/certs/lms-tls.key
~~~

#### Configure the orchestrator and client certificates

Create an external secret that specifies the orchestrator certificate, key, and (optional) CA certificate.

For example, the following `ExternalSecret` called `orch-tls` uses AWS Secrets Manager as the [`SecretStore`](https://external-secrets.io/latest/introduction/getting-started/#create-your-first-secretstore), and references a remote [AWS secret](https://docs.aws.amazon.com/secretsmanager/latest/userguide/create_secret.html) called `orch-certs`:

~~~ yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: orch-tls
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secret-store
    kind: SecretStore
  target:
    name: orch-tls
    creationPolicy: Owner
    template:
      engineVersion: v2
      data:
        orch-ca.crt: '{% raw %}{{ .caCert }}{% endraw %}'
        orch-tls.crt: '{% raw %}{{ .serverCert }}{% endraw %}'
        orch-tls.key: '{% raw %}{{ .serverKey }}{% endraw %}'
  data:
  - secretKey: caCert
    remoteRef:
      key: orch-certs
      property: caCert
  - secretKey: serverCert
    remoteRef:
      key: orch-certs
      property: serverCert
  - secretKey: serverKey
    remoteRef:
      key: orch-certs
      property: serverKey
~~~

In the preceding example, each `.crt` and `.key` filename is associated with its corresponding value in the remote secret `orch-certs`.

In the [Helm configuration](#configuration), `orchestrator.sslVolumes` and `orchestrator.sslVolumeMounts` must specify [volumes](https://kubernetes.io/docs/concepts/storage/volumes/#secret) and mount paths that contain the server-side certificates. The path to each file is specified as an environment variable in `orchestrator.env`. Cockroach Labs recommends mounting certificates to `/app/certs`.

{{site.data.alerts.callout_info}}
Certificates **must** be mounted in a readable format, or the LMS will error. The format should match the output of `cat {certificate}`.
{{site.data.alerts.end}}

~~~ yaml
orchestrator:
  sslVolumes:
    - name: orch-tls
      secret:
        secretName: orch-tls
  sslVolumeMounts:
    - mountPath: "/app/certs"
      name: orch-tls
      readOnly: true
  env:
    - name: ORCH_CA_TLS_CERT
      value: /app/certs/orch-ca.crt
    - name: ORCH_TLS_CERT
      value: /app/certs/orch-tls.crt
    - name: ORCH_TLS_KEY
      value: /app/certs/orch-tls.key
~~~

You will also need to create and specify a CLI client certificate, key, and (optional) CA certificate. It's easiest to specify these as environment variables in the shell that is running `molt-lms-cli`:

{% include_cached copy-clipboard.html %}
~~~ shell
export CLI_TLS_CA_CERT="{path-to-cli-ca-cert}"
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
export CLI_TLS_CLIENT_CERT="{path-to-cli-client-cert}"
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
export CLI_TLS_CLIENT_KEY="{path-to-cli-client-key}"
~~~

## `molt-lms-cli`

The `molt-lms-cli` command-line interface is used to inspect the LMS instances and [perform cutover](#perform-a-cutover).

To install `molt-lms-cli`, download the binary that matches your system. To download the latest binary:

| Operating System |                                       AMD 64-bit                                       |                                       ARM 64-bit                                       |
|------------------|----------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------|
| Windows          | [Download](https://molt.cockroachdb.com/lms/cli/molt-lms-cli-latest.windows-amd64.tgz) | [Download](https://molt.cockroachdb.com/lms/cli/molt-lms-cli-latest.windows-arm64.tgz) |
| Linux            | [Download](https://molt.cockroachdb.com/lms/cli/molt-lms-cli-latest.linux-amd64.tgz)   | [Download](https://molt.cockroachdb.com/lms/cli/molt-lms-cli-latest.linux-arm64.tgz)   |
| Mac              | [Download](https://molt.cockroachdb.com/lms/cli/molt-lms-cli-latest.darwin-amd64.tgz)  | [Download](https://molt.cockroachdb.com/lms/cli/molt-lms-cli-latest.darwin-arm64.tgz)  |

For previous binaries, see the [MOLT version manifest](https://molt.cockroachdb.com/lms/cli/versions.html). The `molt-lms-cli` version **must** match the [configured LMS version](#lms-version).

### Commands

|        Command         |                                                                                                                Usage                                                                                                                |
|------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `connections list`     | List all client connections to the LMS and their most recent queries. See additional [flags](#connections-list-flags) and [usage example](#connections-list).                                                                       |
| `cutover consistent`   | Specify a [consistent cutover](#consistent-cutover). You must also specify `begin`, `commit`, or `abort`. See [subcommands](#subcommands) and [usage example](#consistent-cutover).                                                 |
| `cutover get_metadata` | Display metadata for a cutover attempt, specified with its cutover attempt ID. For example, `cutover get_metadata -i {cutover attempt ID}`. See additional [flags](#cutover-get_metadata-flags) and [usage example](#cutover-get_metadata). |
| `status`               | Display the current configuration of the LMS instances. See additonal [flags](#status-flags) and [usage example](#status).                                                                                                          |


{% comment %}
| `cutover immediate`  | Initiate an [immediate cutover](#immediate-cutover). This switches the source of truth to the target database. For usage details, see [Immediate cutover](#immediate-cutover). |
{% endcomment %}

#### Subcommands

The following subcommands are run after the `cutover consistent` command.

| Subcommand |                                                                                                               Usage                                                                                                                |
|------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `begin`    | Begin a consistent cutover. This pauses traffic to the source database. See additional [flags](#cutover-consistent-begin-flags) and [example](#consistent-cutover).                                                                |
| `commit`   | Commit a consistent cutover. This resumes traffic and sends it to the **target** database, which becomes the source of truth. This is only effective after running `cutover consistent begin`. See [example](#consistent-cutover). |
| `abort`    | Abort a consistent cutover after running `cutover consistent begin`, unless you have also run `cutover consistent commit`. This resumes traffic to the source database.                                                            |

### Flags

#### Global flags

|            Flag            |                                                                                                                                                          Description                                                                                                                                                          |
|----------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `--allow-tls-mode-disable` | Allow insecure LMS connections to databases. [Secure SSL/TLS connections](#security) should be used by default. This should be enabled **only** if secure SSL/TLS connections to the source or target database are not possible.<br><br>Alternatively, set `lms.allowTLSDisable` in the [Helm configuration](#lms-connection). |
| `--orchestrator-url`       | The URL for the orchestrator, using the [configured port](#service-type). Prefix the URL with `https` instead of `http` when using [certificates](#security). This flag is **required** unless the value is exported as an environment variable using `export CLI_ORCHESTRATOR_URL="{orchestrator-URL}"`.                     |
| `--tls-ca-cert`            | The path to the CA certificate. This can also be [exported](#configure-the-orchestrator-and-client-certificates) as an environment variable using `export CLI_TLS_CA_CERT="{path-to-cli-ca-cert}"`.                                                                                                                           |
| `--tls-client-cert`        | The path to the client certificate. This can also be [exported](#configure-the-orchestrator-and-client-certificates) as an environment variable using `export CLI_TLS_CLIENT_CERT="{path-to-cli-client-cert}"`.                                                                                                               |
| `--tls-client-key`         | The path to the client key. This can also be [exported](#configure-the-orchestrator-and-client-certificates) as an environment variable using `export CLI_TLS_CLIENT_KEY="{path-to-cli-client-key}"`.                                                                                                                         |

#### `connections list` flags

|           Flag          |                                                                                                Description                                                                                                 |
|-------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `-l`, `--lms-addresses` | LMS instances to run the command against. This can be a comma-separated list of IP addresses (e.g., `127.0.0.1`), IP addresses and ports (e.g., `127.0.0.1:1024`), or hostnames (e.g., `https://lms.net`). |
| `-o`, `--output-type`   | Specify whether `molt-lms-cli` output is formatted in `json` or `table` format.<br><br>**Default:** `table`                                                                                                |

#### `cutover consistent begin` flags


|           Flag          |                                                                                                                                                                                                                                                                                                                                     Description                                                                                                                                                                                                                                                                                                                                      |
|-------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `--abort-begin-timeout` | Maximum duration for the orchestrator to wait for confirmation from all LMS instances that cutover successfully aborted, after receiving a `ctrl-c` command from `molt-lms-cli`. This affects the performance of the `ctrl-c` command only. <br><br>**Default:** `"2s"`                                                                                                                                                                                                                                                                                                                                                                                                              |
| `--begin-timeout`       | Maximum duration to wait before traffic to the LMS is paused for consistent cutover; i.e., time limit for all connections to be transaction- and query-free. This should be the approximate length of the longest-running transaction, e.g., `30s`. If no `--begin-timeout` value is specified, the LMS waits for all transactions and queries to finish before pausing traffic.                                                                                                                                                                                                                                                                                                     |
| `-l`, `--lms-addresses` | LMS instances to run the command against. This can be a comma-separated list of IP addresses (e.g., `127.0.0.1`), IP addresses and ports (e.g., `127.0.0.1:1024`), or hostnames (e.g., `https://lms.net`). By default, cutover is performed on all LMS instances deployed in the same namespace as the orchestrator. For example, if the orchestrator and all LMS instances are deployed on the same namespace on a Kubernetes cluster, the orchestrator automatically detects the addresses of all LMS instances, and no user configuration is needed. LMS addresses should only be manually specified if the orchestrator is deployed in a different namespace than the instances. |

#### `cutover consistent abort` flags

|          Flag         |                                                 Description                                                 |
|-----------------------|-------------------------------------------------------------------------------------------------------------|
| `-o`, `--output-type` | Specify whether `molt-lms-cli` output is formatted in `json` or `table` format.<br><br>**Default:** `table` |

#### `cutover get_metadata` flags

|          Flag         |                                                                                      Description                                                                                       |
|-----------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `-i`, `--cutover-id`  | ID of the cutover attempt.                                                                                                                                                             |
| `-o`, `--output-type` | Specify whether `molt-lms-cli` output is formatted in `json` or `table` format.<br><br>**Default:** `table` |

#### `status` flags

|           Flag          |                                                                                                Description                                                                                                 |
|-------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `-l`, `--lms-addresses` | LMS instances to run the command against. This can be a comma-separated list of IP addresses (e.g., `127.0.0.1`), IP addresses and ports (e.g., `127.0.0.1:1024`), or hostnames (e.g., `https://lms.net`). |
| `-o`, `--output-type`   | Specify whether `molt-lms-cli` output is formatted in `json` or `table` format.<br><br>**Default:** `table`                                                                                                |

## Shadowing modes

The LMS can be configured to shadow production traffic from the source database and validate the query results on the target. The exact behavior is configured with the [`shadowMode`](#shadowing) Helm value.

### `none`

<img src="{{ 'images/v24.1/migrations/lms_none.svg' | relative_url }}" alt="MOLT LMS shadowing mode - none" />

`shadowMode: none` disables shadowing.

- The LMS sends application requests to the source of truth only.
- Query results from the source of truth are returned to the application.
- Writes must be manually replicated from the source database to the target database.

You **must** use the `none` shadowing mode to perform a [consistent cutover](#consistent-cutover), along with a database replication technology that replicates writes to the target database.

### `async`

<img src="{{ 'images/v24.1/migrations/lms_async.svg' | relative_url }}" alt="MOLT LMS shadowing mode - async" />

`shadowMode: async` writes to both databases.

- The LMS sends application requests to the source of truth and target database in asynchronous threads, and waits only for the source of truth to respond.
- Query results from the source of truth are returned to the application.
- If an asynchronous request has not yet completed, subsequent asynchronous requests will be permanently dropped.

You can use this mode to confirm that your queries succeed on CockroachDB without verifying performance or correctness.

{{site.data.alerts.callout_info}}
`async` mode is intended for testing purposes.
{{site.data.alerts.end}}

### `sync`

<img src="{{ 'images/v24.1/migrations/lms_sync.svg' | relative_url }}" alt="MOLT LMS shadowing mode - sync" />

`shadowMode: sync` writes to both databases.

- The LMS sends application requests to the source of truth and the target database, and waits for each to respond.
- Query results from the source of truth are returned to the application.
- Query results from the non-source of truth are discarded.

{% comment %}
You can use this mode to perform an [immediate cutover](#immediate-cutover).
{% endcomment %}

### `strict-sync`

<img src="{{ 'images/v24.1/migrations/lms_strict-sync.svg' | relative_url }}" alt="MOLT LMS shadowing mode - strict-sync" />

`shadowMode: strict-sync` writes to both databases and enforces correctness on both databases.

- The LMS sends application requests to the source of truth and the target database, and waits for each to respond.
- Query results from the source of truth are returned to the application.
- If the query returns an error on the source of truth, that error is returned to the application. If the query succeeds on the source of truth but fails on the target, the error from the target is returned to the application.
- If the query fails on both databases, the target will return the error from the source of truth.

{% comment %}
You can use this mode to perform an [immediate cutover](#immediate-cutover).
{% endcomment %}

## Perform a cutover

### Consistent cutover

A consistent cutover maintains data consistency with [minimal downtime]({% link {{site.current_cloud_version}}/migration-overview.md %}#minimal-downtime). The goal of consistent cutover is to stop application traffic long enough for replication to catch up and ensure that the cutover achieves consistency across the two databases.

When using the LMS, consistent cutover is handled using the [`molt-lms-cli`](#molt-lms-cli) commands `cutover consistent begin` and `cutover consistent commit`, during which application requests are queued and will be responded to after cutover. This delay in response time is related to the maximum duration of any transactions and queries that need to complete, and the time it takes for replication to catch up from the source to the target database.

{% comment %}
For more information about the consistent cutover approach, see [Migration Strategy: Live Migration]({% link {{site.current_cloud_version}}/migration-strategy-live-migration.md %}).
{% endcomment %}

{{site.data.alerts.callout_info}}
These steps assume you have already followed the overall steps to [prepare for migration]({% link {{site.current_cloud_version}}/migration-overview.md %}#prepare-for-migration). In particular, [update your schema and application queries]({% link {{site.current_cloud_version}}/migration-overview.md %}#update-the-schema-and-queries) to work with CockroachDB.
{{site.data.alerts.end}}

To perform a consistent cutover with the LMS:

1. [Configure the LMS](#configuration) with your deployment details, and follow our [security recommendations](#security).

1. Set the shadowing mode to [`none`](#none).

  {% comment %}
  {{site.data.alerts.callout_danger}}
  Do not use the [`sync`](#sync) or [`strict-sync`](#strict-sync) shadowing modes when performing a consistent cutover. Data correctness and consistency cannot be guaranteed in these configurations.
  {{site.data.alerts.end}}
  {% endcomment %}

1. Set up ongoing replication between the source database and CockroachDB, using a tool that replicates writes to the target database.

1. Send application requests to the LMS, which routes the traffic to the source database. The source database is designated the source of truth.

1. Use [MOLT Verify]({% link molt/molt-verify.md %}) to validate that the replicated data on CockroachDB is consistent with the source of truth.

1. Begin the consistent cutover. **Requests are now queued in the LMS**, including queries from existing connections and new connection requests to the LMS:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    molt-lms-cli cutover consistent begin {flags}
    ~~~

    ~~~
    Pausing traffic, press Ctrl-C to exit cutover and resume the traffic.
    Successfully began consistent cutover with ID 1.

    To check the status of this command, please run:
    molt-lms-cli cutover get_metadata -i 1
    ~~~

    This command tells the LMS to pause all application traffic to the source of truth. The LMS then waits for transactions to complete and prepared statements to close.

1. Verify that replication on CockroachDB has caught up with the source of truth. For example, insert a row on the source database and check that the row exists on CockroachDB.

    If you have an implementation that replicates back to the source database, this should be enabled before committing the cutover.

1. Once all writes have been replicated to the target database, commit the consistent cutover:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    molt-lms-cli cutover consistent commit {flags}
    ~~~

    ~~~
    |-----------------|-----------------|-----------------|----------------------------|----------------------------|----------------------------|
    |   LMS ADDRESS   | SOURCE OF TRUTH |      STATUS     |        TRIGGER TIME        |    TRAFFIC PAUSED TIME     |        COMMIT TIME         |
    |-----------------|-----------------|-----------------|----------------------------|----------------------------|----------------------------|
    | demo-lms-1:9043 | Cockroach       | CommitCompleted | 2024-02-15 19:10:06.991048 | 2024-02-15 19:10:06.991048 | 2024-02-15 19:14:22.95108  |
    |                 |                 |                 | +0000 UTC                  | +0000 UTC                  | +0000 UTC                  |
    | demo-lms-2:9043 | Cockroach       | CommitCompleted | 2024-02-15 19:10:06.991063 | 2024-02-15 19:10:06.991063 | 2024-02-15 19:14:22.950753 |
    |                 |                 |                 | +0000 UTC                  | +0000 UTC                  | +0000 UTC                  |
    | demo-lms-3:9043 | Cockroach       | CommitCompleted | 2024-02-15 19:10:06.992059 | 2024-02-15 19:10:06.992059 | 2024-02-15 19:14:22.950753 |
    |                 |                 |                 | +0000 UTC                  | +0000 UTC                  | +0000 UTC                  |
    |-----------------|-----------------|-----------------|----------------------------|----------------------------|----------------------------|
    LMS-Specific Consistent Cutover Metadata.
    ~~~

    This command tells the LMS to switch the source of truth to the target database. Application traffic is now routed to the target database, and requests are processed from the queue in the LMS.

    To verify that CockroachDB is now the source of truth, you can run `molt-lms-cli status`.

1. Again, use [MOLT Verify]({% link molt/molt-verify.md %}) to validate that the data on the source database and CockroachDB are consistent.

If any problems arise during a consistent cutover:

- After running `cutover consistent begin`: 

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    molt-lms-cli cutover consistent abort {flags}
    ~~~

    This command tells the LMS to resume application traffic to the source of truth, which has not yet been switched. Cutover **cannot** be aborted after running `cutover consistent commit`.

- After running `cutover consistent commit`: 

    Reissue the `cutover consistent begin` and `cutover consistent commit` commands to revert the source of truth to the source database.

{% comment %}
### Immediate cutover

An immediate cutover can potentially [reduce downtime to zero]({% link {{site.current_cloud_version}}/migration-overview.md %}#minimal-downtime), at the likely risk of introducing data inconsistencies between the source and target databases. The LMS is configured to dual write to the source and target databases, while the [`molt-lms-cli`](#molt-lms-cli) command `cutover immediate` initiates cutover.

For more information about the immediate cutover approach, see [Migration Strategy: Live Migration]({% link {{site.current_cloud_version}}/migration-strategy-live-migration.md %}).

To perform an immediate cutover with the LMS:

{{site.data.alerts.callout_info}}
These steps assume you have already followed the overall steps to [prepare for migration]({% link {{site.current_cloud_version}}/migration-overview.md %}#prepare-for-migration). In particular, [update your schema and application queries]({% link {{site.current_cloud_version}}/migration-overview.md %}#update-the-schema-and-queries) to work with CockroachDB.
{{site.data.alerts.end}}

1. [Configure the LMS](#configuration) with your deployment details, and follow our [security recommendations](#security).

1. Set the shadowing mode to [`sync`](#sync) or [`strict-sync`](#strict-sync).

1. Send application requests to the LMS, which routes the traffic to the source database and to CockroachDB. The source database is designated the source of truth.

1. Use [MOLT Verify]({% link molt/molt-verify.md %}) to validate that the replicated data on CockroachDB is consistent with the source of truth.

    To ensure data integrity, shadowing must be enabled for a sufficient duration with a low error rate. All LMS instances should have been continuously shadowing your workload for the past **seven days** at minimum, with only transient inconsistencies caused by events such as [transaction retry errors]({% link {{site.current_cloud_version}}/transaction-retry-error-reference.md %}). The longer shadowing has been enabled, the better this allows you to evaluate consistency.

1. Once nearly all data from the source database is replicated to CockroachDB (for example, with a <1 second delay or <1000 rows), initiate the cutover:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    molt-lms-cli cutover immediate {flags}
    ~~~

    This command tells the LMS to switch the source of truth to CockroachDB. Application traffic is immediately directed to CockroachDB.

1. Any writes that were made during the cutover will have been missed on CockroachDB. Use [MOLT Verify]({% link molt/molt-verify.md %}) to identify the inconsistencies. These will need to be manually reconciled.
{% endcomment %}

### Monitor cutover

You can monitor your cutover attempts with the following commands.

#### `connections list`

`molt-lms-cli connections list` outputs client connection details from each LMS instance, including the most recent query and error, if any.

For example:

{% include_cached copy-clipboard.html %}
~~~ shell
molt-lms-cli connections list --output-type=json
~~~

~~~ json
{
    "error": "",
    "last_query": "",
    "remote_address": "10.42.0.2:9043",
    "source_address": "10.42.0.5:36676",
    "source_of_truth": "MySQL"
}
{
    "error": "",
    "last_query": "",
    "remote_address": "10.42.0.4:9043",
    "source_address": "10.42.0.5:34620",
    "source_of_truth": "MySQL"
}
{
    "error": "",
    "last_query": "",
    "remote_address": "10.42.0.6:9043",
    "source_address": "10.42.0.5:41052",
    "source_of_truth": "MySQL"
}
Connections Details.
~~~

In the preceding output, `remote_address` is the address of the LMS instance, and `source_address` is the address of the client connected to the LMS instance.

#### `cutover get_metadata`

`molt-lms-cli cutover get_metadata` outputs the metadata for a specific cutover attempt initiated with `cutover consistent begin`.

For example, specifying cutover attempt `1`:

{% include_cached copy-clipboard.html %}
~~~ shell
molt-lms-cli cutover get_metadata --cutover-id=1
~~~

~~~
cutover metadata for attempt id 1:
+-----------------+-----------------+--------------------------------+--------------------------------+--------------------------------+
| SOURCE OF TRUTH |     STATUS      |          TRIGGER TIME          |      TRAFFIC PAUSED TIME       |          COMMIT TIME           |
+-----------------+-----------------+--------------------------------+--------------------------------+--------------------------------+
| Cockroach       | CommitCompleted | 2024-02-15 19:10:06.974503749  | 2024-02-15 19:10:06.998836442  | 2024-02-15 19:14:22.951534482  |
|                 |                 | +0000 UTC m=+736.110121156     | +0000 UTC m=+736.134453848     | +0000 UTC m=+992.087151888     |
+-----------------+-----------------+--------------------------------+--------------------------------+--------------------------------+
Summarized Consistent Cutover Metadata.
+-----------------+-----------------+-----------------+--------------------------------+--------------------------------+--------------------------------+
|   LMS ADDRESS   | SOURCE OF TRUTH |     STATUS      |          TRIGGER TIME          |      TRAFFIC PAUSED TIME       |          COMMIT TIME           |
+-----------------+-----------------+-----------------+--------------------------------+--------------------------------+--------------------------------+
| demo-lms-1:9043 | Cockroach       | CommitCompleted | 2024-02-15 19:10:06.991048     | 2024-02-15 19:10:06.991048     | 2024-02-15 19:14:22.95108      |
|                 |                 |                 | +0000 UTC                      | +0000 UTC                      | +0000 UTC                      |
| demo-lms-2:9043 | Cockroach       | CommitCompleted | 2024-02-15 19:10:06.991063     | 2024-02-15 19:10:06.991063     | 2024-02-15 19:14:22.950753     |
|                 |                 |                 | +0000 UTC                      | +0000 UTC                      | +0000 UTC                      |
| demo-lms-3:9043 | Cockroach       | CommitCompleted | 2024-02-15 19:10:06.992059     | 2024-02-15 19:10:06.992059     | 2024-02-15 19:14:22.950753     |
|                 |                 |                 | +0000 UTC                      | +0000 UTC                      | +0000 UTC                      |
+-----------------+-----------------+-----------------+--------------------------------+--------------------------------+--------------------------------+
LMS-Specific Consistent Cutover Metadata.
~~~

In the preceding output:

- `LMS ADDRESS` is the IP address and port number of the running LMS instance.
- `SOURCE OF TRUTH` is the database that was serving reads and writes to the LMS instance at the time that `cutover get_metadata` was run.
- `STATUS` is the status of the cutover attempt. This can indicate whether the cutover attempt began, aborted, paused traffic, committed, or encountered an error. In this example, `CommitCompleted` indicates that a consistent cutover was committed successfully with `cutover consistent commit`.
- `TRIGGER TIME` is the timestamp when the cutover attempt was initiated on the LMS instance.
- `TRAFFIC PAUSED TIME` is the timestamp when traffic to the LMS instance was paused during a consistent cutover attempt.
- `COMMIT TIME` is the timestamp when the cutover attempt was completed on the LMS instance.
- `ERROR` is the error encountered by the cutover attempt, if any.

#### `status`

`molt-lms-cli status` outputs the overall status of the LMS, including its [shadowing mode](#shadowing-modes), source and target database addresses, and any errors encountered on the LMS instances.

{% include_cached copy-clipboard.html %}
~~~ shell
molt-lms-cli status --lms-addresses="demo-lms-1:9043,demo-lms-2:9043"
~~~

~~~
+----------------+----------------+---------------+
| SOURCE DIALECT | TARGET DIALECT | TRANSITIONING |
+----------------+----------------+---------------+
| MySQL          | Cockroach      | false         |
+----------------+----------------+---------------+
Proxy Settings Table.
+-----------------+-------------+----------------+----------------+----------------+----------------+-------+
|   LMS ADDRESS   | SHADOW MODE | SOURCE DIALECT | TARGET DIALECT | SOURCE ADDRESS | TARGET ADDRESS | ERROR |
+-----------------+-------------+----------------+----------------+----------------+----------------+-------+
| demo-lms-1:9043 | None        | MySQL          | Cockroach      | mysql:3306     | crdb:26257     |       |
| demo-lms-2:9043 | None        | MySQL          | Cockroach      | mysql:3306     | crdb:26257     |       |
+-----------------+-------------+----------------+----------------+----------------+----------------+-------+
Individual LMS Proxy Status.
~~~

## See also

- [Migration Overview]({% link {{site.current_cloud_version}}/migration-overview.md %})
{% comment %}- [Migration Strategy: Live Migration]({% link {{site.current_cloud_version}}/migration-strategy-live-migration.md %}){% endcomment %}
- [Use the Schema Conversion Tool](https://www.cockroachlabs.com/docs/cockroachcloud/migrations-page)
- [MOLT Verify]({% link molt/molt-verify.md %})
- [Migrate from PostgreSQL]({% link {{site.current_cloud_version}}/migrate-from-postgres.md %})
- [Migrate from MySQL]({% link {{site.current_cloud_version}}/migrate-from-mysql.md %})
