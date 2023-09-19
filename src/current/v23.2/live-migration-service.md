---
title: Use the Live Migration Service
summary: Learn how to use the Live Migration Service to shadow application traffic, perform cutover, and migrate a database to CockroachDB.
toc: true
docs_area: migrate
---

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

MOLT LMS (Live Migration Service) is used to perform a [live migration]({% link {{ page.version.version }}/migration-overview.md %}#minimal-downtime) to CockroachDB.

The LMS is a self-hosted, horizontally scalable proxy that routes traffic between an application, a source database, and a target CockroachDB database. You can use the LMS to control which database, as the "source of truth", is serving reads and writes to an application. You can optionally configure the LMS to [shadow production traffic](#shadowing-modes) from the source database and validate the query results on CockroachDB. When you have sufficiently tested your application and are confident with its consistency and performance on CockroachDB, you use the LMS to [perform the cutover](#perform-a-cutover) to CockroachDB.

MOLT LMS is self-hosted on [Kubernetes](https://kubernetes.io/) and [configured using Helm](#configuration). At a high level, the LMS consists of the following:

- A number of proxy [instances](#lms-instances) (running in separate Kubernetes pods) across which application traffic is distributed and routed to the source and target databases.
- An "orchestrator" service (running in a single Kubernetes pod) that coordinates the proxy instances and sends the cutover commands.

This page describes how to [install](#installation), [configure](#configuration), [secure](#security), and [use the LMS](#molt-lms-cli) to perform a live migration. {% comment %}For more information, see [Migration Strategy: Live Migration]({% link {{ page.version.version }}/migration-strategy-live-migration.md %}).{% endcomment %}

## Terminology

- A *live migration* involves maintaining two production databases (a source and target database) and replicating data between them until a final cutover.
- The *source of truth* is the database that serves reads and writes to the application during a live migration. A cutover switches the source of truth.
- *Shadowing* is the replication of writes from the source of truth to the target database. The LMS supports multiple [shadowing modes](#shadowing-modes).

## Requirements

- [Kubernetes](https://kubernetes.io/) cluster
- [Helm](https://helm.sh/docs/intro/install/) package manager for Kubernetes

#### Supported databases

- [PostgreSQL]({% link {{ page.version.version }}/migrate-from-postgres.md %}) (source)
- [MySQL]({% link {{ page.version.version }}/migrate-from-mysql.md %}) (source)
- CockroachDB (target)

## Installation

The LMS definitions are located in the [`molt` repository](https://molt.cockroachdb.com/):

- [`molt-lms` Helm chart](https://molt.cockroachdb.com/charts/lms/Chart.yaml)
- [`molt-lms` values file](https://molt.cockroachdb.com/charts/lms/values.yaml) for [configuration](#configuration)

When you install the `molt-lms` chart, the LMS proxy instances and orchestrator are initialized as Kubernetes pods:

{% include_cached copy-clipboard.html %}
~~~ shell
kubectl get pods
~~~

~~~
NAME                                          READY   STATUS      RESTARTS      AGE
lms-molt-lms-5cbd7c748-bzbgn                  1/1     Running     0             2m30s
lms-molt-lms-5cbd7c748-g5zqf                  1/1     Running     0             2m34s
lms-molt-lms-5cbd7c748-lbjjz                  1/1     Running     0             2m3
lms-molt-lms-orchestrator-596d4b54d8-c4v97    1/1     Running     0             21m
...
~~~

You will see `lms-molt-lms` pods that match the configured [number of LMS instances](#lms-instances), along with one `lms-molt-lms-orchestrator` pod.

## Configuration

To configure the LMS, override the values defined in [`values.yaml`](https://molt.cockroachdb.com/charts/lms/values.yaml). For information on setting Helm chart values, see the [Helm documentation](https://helm.sh/docs/helm/helm_upgrade/).

{{site.data.alerts.callout_info}}
Values that are specified in both `lms` and `orchestrator` must have the identical setting.
{{site.data.alerts.end}}

This section describes the most important and commonly used values.

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
- `crdb`: CockroachDB

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

`lms.replicaCount` determines the number of LMS instances created as `lms-molt-lms` pods on the Kubernetes cluster, across which application traffic is distributed. This defaults to `3`.

#### Source and target connections

The connections to the source database and CockroachDB are defined with the configuration keys:

- `INIT_SOURCE`: Connection string for the source database.
- `INIT_TARGET`: Connection string for a CockroachDB database.

Include client authentication details in the connection strings. For more details, see [Configure source and target certificates](#configure-source-and-target-certificates).

{{site.data.alerts.callout_success}}
For details about writing a CockroachDB connection string, see [Connect using a URL]({% link {{ page.version.version }}/connection-parameters.md %}#connect-using-a-url).
{{site.data.alerts.end}}

You should specify the config keys in an external Kubernetes secret and inside a JSON object. The JSON **must** be named `config.json`.

For example:

~~~ json
config.json: |
  {
    "INIT_SOURCE": "mysql://{username}:{password}@{protocol}({host}:{port})/{database}?sslmode=verify-full?sslrootcert=path/to/mysql.ca&sslcert=path/to/mysql.crt&sslkey=path/to/mysql.key",
    "INIT_TARGET": "postgresql://{username}:{password}@{host}:{port}/{database}?sslmode=verify-full?sslrootcert=path/to/ca.crt&sslcert=path/to/client.username.crt&sslkey=path/to/client.username.key"
  }
~~~

For more details on storing the LMS configuration in an external secret, see [Manage external secret](#manage-external-secret).

#### Certificates

~~~ yaml
lms:
  sslVolumes: {}
  sslVolumeMounts: {}
...
orchestrator:
  sslVolumes: {}
  sslVolumeMounts: {}
~~~

`sslVolumes` and `sslVolumeMounts` specify [volumes](https://kubernetes.io/docs/concepts/storage/volumes/#secret) and mount paths that contain server-side certificates for the LMS instances and orchestrator. For security recommendations, see [Security](#security).

<a name="cert-var"></a>

When you specify a volume in `sslVolumes` and `sslVolumeMounts`, you must also [set its corresponding config key](#manage-external-secret) to the path specified in `sslVolumeMounts.mountPath`.

|      Key      |                        Description                         |
|---------------|------------------------------------------------------------|
| `SSL_CA`      | Mount path to the SSL CA certificate for the LMS.          |
| `SSL_CERT`    | Mount path to the SSL certificate for the LMS.             |
| `SSL_KEY`     | Mount path to the SSL key for the LMS.                     |
| `CA_TLS_CERT` | Mount path to the TLS CA certificate for the orchestrator. |
| `TLS_CERT`    | Mount path to the TLS certificate for the orchestrator.    |
| `TLS_KEY`     | Mount path to the TLS key for the orchestrator.            |

{{site.data.alerts.callout_success}}
Cockroach Labs recommends mounting certificates to `/app/certs`.
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

Cockroach Labs recommends the following:

- Manage your LMS configuration in an [external Kubernetes secret](#manage-external-secret).
- To establish secure connections between the LMS pods and with your client, set up TLS certificates for the [LMS](#configure-lms-certificate), [source database and CockroachDB](#configure-source-and-target-certificates), and [orchestrator and client](#configure-orchestrator-and-client-certificates).

#### Manage external secret

Use an external secrets manager such as [External Secrets Operator](https://external-secrets.io/latest/) to create and manage a Kubernetes secret containing your LMS configuration. For information on Kubernetes secrets, see the [Kubernetes documentation](https://kubernetes.io/docs/concepts/configuration/secret/).

In the [LMS configuration](#configuration), specify the name of your external secret with `configSecretName`:

~~~ yaml
lms:
  configSecretName: "secret-name"
...
orchestrator:
  configSecretName: "secret-name"
~~~

WIthin the secret, set LMS config keys inside a JSON object named `config.json`. For example, in an `ExternalSecret` named `lms-config` created with External Secrets Operator:

~~~ yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: lms-config
spec:
  ...
  target:
    name: lms-config
    ...
      data:
        config.json: |
          {
            "INIT_SOURCE": "mysql://{username}:{password}@{protocol}({host}:{port})/{database}?sslmode=verify-full?sslrootcert=path/to/mysql.ca&sslcert=path/to/mysql.crt&sslkey=path/to/mysql.key",
            "INIT_TARGET": "postgresql://{username}:{password}@{host}:{port}/{database}?sslmode=verify-full?sslrootcert=path/to/ca.crt&sslcert=path/to/client.username.crt&sslkey=path/to/client.username.key",
            "SSL_CA": "/app/certs",
            "SSL_CERT": "/app/certs",
            "SSL_KEY": "/app/certs",
            "CA_TLS_CERT": "/app/certs",
            "TLS_CERT": "/app/certs",
            "TLS_KEY": "/app/certs",
            ...
          }
...
~~~

The preceding example defines config keys for the [source and target database connections](#source-and-target-connections) and mount paths for various [certificates](#certificates).

#### Configure LMS certificate

Mount the LMS certificate, key, and (optional) CA certificate to separate volumes. Cockroach Labs recommends mounting certificates to `/app/certs`.

For example:

~~~ yaml
lms:
  sslVolumes:
    - name: lms-ca
      secret:
        secretName: lms-ca
    - name: lms-cert
      secret:
        secretName: lms-cert
    - name: lms-key
      secret:
        secretName: lms-key
  sslVolumeMounts:
    - mountPath: "/app/certs"
      name: lms-ca
      readOnly: true
    - mountPath: "/app/certs"
      name: lms-cert
      readOnly: true
    - mountPath: "/app/certs"
      name: lms-key
      readOnly: true
~~~

Set the [corresponding config keys](#cert-var) to the same mount path. For example, within `config.json` in the [external secret](#manage-external-secret):

~~~ yaml
config.json: |
  {
    "SSL_CA": "/app/certs",
    "SSL_CERT": "/app/certs",
    "SSL_KEY": "/app/certs",
  }
~~~

#### Configure source and target certificates

Mount the source and target certificate, key, and (optional) CA certificate to separate volumes. Cockroach Labs recommends mounting certificates to `/app/certs`.

For example:

~~~ yaml
lms:
  sslVolumes:
    - name: source-ca
      secret:
        secretName: source-ca
    - name: source-cert
      secret:
        secretName: source-cert
    - name: source-key
      secret:
        secretName: source-key
    - name: cockroach-ca
      secret:
        secretName: cockroach-ca
    - name: cockroach-cert
      secret:
        secretName: cockroach-cert
    - name: cockroach-key
      secret:
        secretName: cockroach-key
  sslVolumeMounts:
    - mountPath: "/app/certs"
      name: source-ca
      readOnly: true
    - mountPath: "/app/certs"
      name: source-cert
      readOnly: true
    - mountPath: "/app/certs"
      name: source-key
      readOnly: true
    - mountPath: "/app/certs"
      name: cockroach-ca
      readOnly: true
    - mountPath: "/app/certs"
      name: cockroach-cert
      readOnly: true
    - mountPath: "/app/certs"
      name: cockroach-key
      readOnly: true
~~~

Specify the corresponding client certificates and keys in the [database connection strings](#source-and-target-connections). For example, within `config.json` in the [external secret](#manage-external-secret):

~~~ json
config.json: |
  {
    "INIT_SOURCE": "mysql://{username}:{password}@{protocol}({host}:{port})/{database}?sslmode=verify-full?sslrootcert=path/to/mysql.ca&sslcert=path/to/mysql.crt&sslkey=path/to/mysql.key",
    "INIT_TARGET": "postgresql://{username}:{password}@{host}:{port}/{database}?sslmode=verify-full?sslrootcert=path/to/ca.crt&sslcert=path/to/client.username.crt&sslkey=path/to/client.username.key"
  }
~~~

#### Configure orchestrator and client certificates

Mount the orchestrator certificate, key, and (optional) CA certificate to separate volumes. Cockroach Labs recommends mounting certificates to `/app/certs`.

For example:

~~~ yaml
orchestrator:
  sslVolumes:
    - name: orch-ca
      secret:
        secretName: orch-ca
    - name: orch-cert
      secret:
        secretName: orch-cert
    - name: orch-key
      secret:
        secretName: orch-key
  sslVolumeMounts:
    - mountPath: "/app/certs"
      name: orch-ca
      readOnly: true
    - mountPath: "/app/certs"
      name: orch-cert
      readOnly: true
    - mountPath: "/app/certs"
      name: orch-key
      readOnly: true
~~~

Set the [corresponding config keys](#cert-var) to the same mount path. For example, within `config.json` in the [external secret](#manage-external-secret):

~~~ yaml
config.json: |
  {
    "CA_TLS_CERT": "/app/certs",
    "TLS_CERT": "/app/certs",
    "TLS_KEY": "/app/certs",
  }
~~~

This also requires that you create and specify a CLI client certificate, key, and (optional) CA certificate. It's easiest to specify these with the following environment variables:

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

To install `molt-lms-cli`, [download the binary](https://molt.cockroachdb.com/).

### Commands

|       Command        |                                                                                     Usage                                                                                      |
|----------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `initialize`         | Set up the required objects for running the LMS. You must run this before using the LMS.                                                                                       |
| `connections list`   | List all client connections to the LMS and their most recent queries.                                                                                                          |
| `cutover consistent` | Specify a [consistent cutover](#consistent-cutover). You must also specify `begin`, `commit`, or `abort`. For usage details, see [Consistent cutover](#consistent-cutover).    |
| `begin`              | Begin a consistent cutover. This pauses traffic to the source of truth.                                                                                                        |
| `commit`             | Commit a consistent cutover. This switches the source of truth to the target database.                                                                                         |
| `abort`              | Abort a consistent cutover after running `consistent cutover begin`, unless you have also run `consistent cutover commit`. This resumes traffic to the source of truth.        |
| `cutover immediate`  | Initiate an [immediate cutover](#immediate-cutover). This switches the source of truth to the target database. For usage details, see [Immediate cutover](#immediate-cutover). |
| `status`             | Display the current configuration of the LMS instances.                                                                                                                        |

### Flags

|         Flag         |                                                                                                    Description                                                                                                    |
|----------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `--orchestrator-url` | The URL for the orchestrator, using the [configured port](#service-type). This flag is required unless the value is exported as an environment variable using `export CLI_ORCHESTRATOR_URL="{orchestrator-URL}"`. |
| `--tls-ca-cert`      | The path to the TLS CA certificate. This can also be [exported](#configure-orchestrator-and-client-certificates) as an environment variable using `export CLI_TLS_CA_CERT="{path-to-cli-ca-cert}"`.               |
| `--tls-client-cert`  | The path to the TLS client certificate. This can also be [exported](#configure-orchestrator-and-client-certificates) as an environment variable using `export "{path-to-cli-client-cert}"`.                       |
| `--tls-client-key`   | The path to the TLS client key. This can also be [exported](#configure-orchestrator-and-client-certificates) as an environment variable using `export "{path-to-cli-client-key}"`.                                |

## Shadowing modes

The LMS can be configured to shadow production traffic from the source database and validate the query results on the target. The exact behavior is configured with the [`shadowMode`](#shadowing) Helm value.

### `none`

<img src="{{ 'images/v23.2/migrations/lms_none.svg' | relative_url }}" alt="MOLT LMS shadowing mode - none" />

`shadowMode: none` disables shadowing.

- The LMS sends application requests to the source of truth only.
- Results from the source of truth are returned to the application.
- Writes must be manually replicated from the source database to the target database.

You can use this mode to perform a [consistent cutover](#consistent-cutover), along with another tool such as [change data capture (CDC)]({% link {{ page.version.version }}/cdc-queries.md %}) that replicates writes to the target database. {% comment %}For an example, see [Consistent cutover without shadowing](#consistent-cutover-without-shadowing).{% endcomment %}

### `async`

<img src="{{ 'images/v23.2/migrations/lms_async.svg' | relative_url }}" alt="MOLT LMS shadowing mode - async" />

`shadowMode: async` writes to both databases.

- The LMS sends application requests to the source of truth and target database in asynchronous threads, and waits only for the source of truth to respond.
- Results from the source of truth are returned to the application.

You can use this mode to confirm that your queries succeed on CockroachDB without verifying performance or correctness.

### `sync`

<img src="{{ 'images/v23.2/migrations/lms_sync.svg' | relative_url }}" alt="MOLT LMS shadowing mode - sync" />

`shadowMode: sync` writes to both databases.

- The LMS sends application requests to the source of truth and the target database, and waits for each to respond.
- Results from the source of truth are returned to the application.
- Results from the non-source of truth are discarded.

You can use this mode to perform an [immediate cutover](#immediate-cutover).

### `strict-sync`

<img src="{{ 'images/v23.2/migrations/lms_strict-sync.svg' | relative_url }}" alt="MOLT LMS shadowing mode - strict-sync" />

`shadowMode: strict-sync` writes to both databases and enforces correctness on both databases.

- The LMS sends application requests to the source of truth and the target database, and waits for each to respond.
- Results from the source of truth are returned to the application.
- If the non-source of truth returns an error, that error is returned instead of the result from the source of truth.

You can use this mode to perform an [immediate cutover](#immediate-cutover).

## Perform a cutover

### Consistent cutover

A consistent cutover maintains data consistency with [minimal downtime]({% link {{ page.version.version }}/migration-overview.md %}#minimal-downtime). When using the LMS, consistent cutover is handled using the [`molt-lms-cli`](#molt-lms-cli) commands `cutover consistent begin` and `cutover consistent commit`, between which downtime occurs. The amount of downtime depends on the maximum duration of any transactions and queries that need to complete, and the time it takes for replication to catch up from the source to the target database.

{% comment %}
For more information about the consistent cutover approach, see [Migration Strategy: Live Migration]({% link {{ page.version.version }}/migration-strategy-live-migration.md %}).
{% endcomment %}

To perform a consistent cutover with the LMS:

{{site.data.alerts.callout_info}}
These steps assume you have already followed the overall steps to [prepare for migration]({% link {{ page.version.version }}/migration-overview.md %}#prepare-for-migration). In particular, [update your schema and application queries]({% link {{ page.version.version }}/migration-overview.md %}#update-the-schema-and-queries) to work with CockroachDB.
{{site.data.alerts.end}}

1. [Configure the LMS](#configuration) with your deployment details, and follow our [security recommendations](#security).

1. Set the shadowing mode to [`none`](#none).

	{{site.data.alerts.callout_danger}}
	Do not use the [`sync`](#sync) or [`strict-sync`](#strict-sync) shadowing modes when performing a consistent cutover. Data correctness and consistency cannot be guaranteed in these configurations.
	{{site.data.alerts.end}}

1. Set up ongoing replication between the source database and CockroachDB, using a tool such as [change data capture (CDC)]({% link {{ page.version.version }}/cdc-queries.md %}).

1. Send application requests to the LMS, which routes the traffic to the source database. The source database is designated the source of truth.

1. Use [MOLT Verify]({% link {{ page.version.version }}/molt-verify.md %}) to validate that the replicated data on CockroachDB is consistent with the source of truth.

1. Begin the consistent cutover. **This begins downtime**:

	{% include_cached copy-clipboard.html %}
	~~~ shell
	molt-lms-cli cutover consistent begin {flags}
	~~~

	This command tells the LMS to pause all application traffic to the source of truth. The LMS then waits for transactions to complete and prepared statements to close.

1. Verify that replication on CockroachDB has caught up with the source of truth. For example, write a marker record to the source database and check that it exists on CockroachDB.

	If you have an implementation that replicates back to the source database, this should be enabled before committing the cutover.

1. Once all writes have been replicated to the target database, commit the consistent cutover:

	{% include_cached copy-clipboard.html %}
	~~~ shell
	molt-lms-cli cutover consistent commit {flags}
	~~~

	This command tells the LMS to switch the source of truth to CockroachDB. Application traffic resumes on CockroachDB, and this ends downtime.

	To verify that CockroachDB is now the source of truth, you can run `molt-lms-cli status`.

1. Again, use [MOLT Verify]({% link {{ page.version.version }}/molt-verify.md %}) to validate that the data on the source database and CockroachDB are consistent.

If any problems arise during a consistent cutover:

- After running `cutover consistent begin`: 

	{% include_cached copy-clipboard.html %}
	~~~ shell
	molt-lms-cli cutover consistent abort {flags}
	~~~

	This command tells the LMS to resume application traffic to the source of truth, which has not yet been switched. Cutover **cannot** be aborted after running `cutover consistent commit`.

- After running `cutover consistent commit`: 

	Reissue the `cutover consistent begin` and `cutover consistent commit` commands to revert the source of truth to the source database.

### Immediate cutover

An immediate cutover can potentially [reduce downtime to zero]({% link {{ page.version.version }}/migration-overview.md %}#minimal-downtime), at the likely risk of introducing data inconsistencies between the source and target databases. The LMS is configured to dual write to the source and target databases, while the [`molt-lms-cli`](#molt-lms-cli) command `cutover immediate` initiates cutover.

{% comment %}
For more information about the immediate cutover approach, see [Migration Strategy: Live Migration]({% link {{ page.version.version }}/migration-strategy-live-migration.md %}).
{% endcomment %}

To perform an immediate cutover with the LMS:

{{site.data.alerts.callout_info}}
These steps assume you have already followed the overall steps to [prepare for migration]({% link {{ page.version.version }}/migration-overview.md %}#prepare-for-migration). In particular, [update your schema and application queries]({% link {{ page.version.version }}/migration-overview.md %}#update-the-schema-and-queries) to work with CockroachDB.
{{site.data.alerts.end}}

1. [Configure the LMS](#configuration) with your deployment details, and follow our [security recommendations](#security).

1. Set the shadowing mode to [`sync`](#sync) or [`strict-sync`](#strict-sync).

1. Send application requests to the LMS, which routes the traffic to the source database and to CockroachDB. The source database is designated the source of truth.

1. Use [MOLT Verify]({% link {{ page.version.version }}/molt-verify.md %}) to validate that the replicated data on CockroachDB is consistent with the source of truth.

	To ensure data integrity, shadowing must be enabled for a sufficient duration with a low error rate. All LMS instances should have been continuously shadowing your workload for the past **seven days** at minimum, with only transient inconsistencies caused by events such as [transaction retry errors]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}). The longer shadowing has been enabled, the better this allows you to evaluate consistency.

1. Once nearly all data from the source database is replicated to CockroachDB (for example, with a <1 second delay or <1000 rows), initiate the cutover:

	{% include_cached copy-clipboard.html %}
	~~~ shell
	molt-lms-cli cutover immediate {flags}
	~~~

	This command tells the LMS to switch the source of truth to CockroachDB. Application traffic is immediatedly directed to CockroachDB.

1. Any writes that were made during the cutover will have been missed on CockroachDB. Use [MOLT Verify]({% link {{ page.version.version }}/molt-verify.md %}) to identify the inconsistencies. These will need to be manually reconciled.

## See also

- [Migration Overview]({% link {{ page.version.version }}/migration-overview.md %})
{% comment %}- [Migration Strategy: Live Migration]({% link {{ page.version.version }}/migration-strategy-live-migration.md %}){% endcomment %}
- [Use the Schema Conversion Tool](https://www.cockroachlabs.com/docs/cockroachcloud/migrations-page)
- [MOLT Verify]({% link {{ page.version.version }}/molt-verify.md %})
- [Migrate from PostgreSQL]({% link {{ page.version.version }}/migrate-from-postgres.md %})
- [Migrate from MySQL]({% link {{ page.version.version }}/migrate-from-mysql.md %})