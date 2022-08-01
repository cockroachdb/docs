---
title: Operate CockroachDB on Kubernetes
summary: How to operate and manage a secure 3-node CockroachDB cluster with Kubernetes.
toc: true
toc_not_nested: true
secure: true
---

{{site.data.alerts.callout_info}}
This article assumes you have already [deployed CockroachDB securely on a single Kubernetes cluster](deploy-cockroachdb-with-kubernetes.html). However, it's possible to configure these settings before starting CockroachDB on Kubernetes.
{{site.data.alerts.end}}

You can configure, scale, and upgrade a CockroachDB deployment on Kubernetes by updating its StatefulSet values. This page describes how to:

<section class="filter-content" markdown="1" data-scope="operator">
- [Allocate CPU and memory resources](#allocate-resources)
- [Use a custom CA](#use-a-custom-ca)
- [Rotate security certificates](#rotate-security-certificates)
- [Secure webhooks](#secure-the-webhooks)
- [Provision and expand volumes](#provision-volumes)
- [Scale the cluster](#scale-the-cluster)
- [Configure ports](#configure-ports)
- [Perform rolling upgrades](#upgrade-the-cluster)
</section>

<section class="filter-content" markdown="1" data-scope="manual">
- [Allocate CPU and memory resources](#allocate-resources)
- [Provision and expand volumes](#provision-volumes)
- [Scale the cluster](#scale-the-cluster)
- [Perform rolling upgrades](#upgrade-the-cluster)
</section>

<section class="filter-content" markdown="1" data-scope="helm">
- [Allocate CPU and memory resources](#allocate-resources)
- [Use a custom CA](#use-a-custom-ca)
- [Rotate security certificates](#rotate-security-certificates)
- [Provision and expand volumes](#provision-volumes)
- [Scale the cluster](#scale-the-cluster)
- [Perform rolling upgrades](#upgrade-the-cluster)
</section>

<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="operator">Operator</button>
    <button class="filter-button" data-scope="manual">Manual Configs</button>
    <button class="filter-button" data-scope="helm">Helm</button>
</div>

<section class="filter-content" markdown="1" data-scope="operator">
{% include {{ page.version.version }}/orchestration/operator-check-namespace.md %}

{{site.data.alerts.callout_success}}
If you [deployed CockroachDB on Red Hat OpenShift](deploy-cockroachdb-with-kubernetes-openshift.html), substitute `kubectl` with `oc` in the following commands.
{{site.data.alerts.end}}
</section>

<section class="filter-content" markdown="1" data-scope="operator">
## Apply settings

Cluster parameters are configured in a `CrdbCluster` custom resource object. This tells the Operator how to configure the Kubernetes cluster. We provide a custom resource template called [`example.yaml`](https://raw.github.com/cockroachdb/cockroach-operator/v{{ latest_operator_version }}/examples/example.yaml):

~~~ yaml
{% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach-operator/v{{ latest_operator_version }}/examples/example.yaml %}
~~~

It's simplest to download and customize a local copy of the custom resource manifest. After you modify its parameters, run this command to apply the new values to the cluster:

{% include_cached copy-clipboard.html %}
~~~ shell
$ kubectl apply -f example.yaml
~~~

You will see:

~~~
crdbcluster.crdb.cockroachlabs.com/{cluster-name} configured
~~~

The Operator will trigger a rolling restart of the pods to effect the change, if necessary. You can observe its progress by running `kubectl get pods`.
</section>

<section class="filter-content" markdown="1" data-scope="manual">
## Apply settings

Cluster parameters are configured in the StatefulSet manifest. We provide a [StatefulSet template](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/bring-your-own-certs/cockroachdb-statefulset.yaml) for use in our [deployment tutorial](deploy-cockroachdb-with-kubernetes.html).

It's simplest to download and customize a local copy of the manifest file. After you modify its parameters, run this command to apply the new values to the cluster:

{% include_cached copy-clipboard.html %}
~~~ shell
$ kubectl apply -f {manifest-filename}.yaml
~~~

You will see:

~~~
crdbcluster.crdb.cockroachlabs.com/{cluster-name} configured
~~~
</section>

## Allocate resources

On a production cluster, the resources you allocate to CockroachDB should be proportionate to your machine types and workload. We recommend that you determine and set these values before deploying the cluster, but you can also update the values on a running cluster.

{{site.data.alerts.callout_success}}
Run `kubectl describe nodes` to see the available resources on the instances that you have provisioned.
{{site.data.alerts.end}}

### Memory and CPU

You can set the CPU and memory resources allocated to the CockroachDB container on each pod.

{{site.data.alerts.callout_info}}
1 CPU in Kubernetes is equivalent to 1 vCPU or 1 hyperthread. For best practices on provisioning CPU and memory for CockroachDB, see the [Production Checklist](recommended-production-settings.html#hardware).
{{site.data.alerts.end}}

<section class="filter-content" markdown="1" data-scope="operator">
Specify CPU and memory values in `resources.requests` and `resources.limits` in the custom resource:

~~~ yaml
spec:
  resources:
    requests:
      cpu: "4"
      memory: "16Gi"
    limits:
      cpu: "4"
      memory: "16Gi"
~~~

Then [apply](#apply-settings) the new values to the cluster.
</section>

<section class="filter-content" markdown="1" data-scope="manual">
Specify CPU and memory values in `resources.requests` and `resources.limits` in the StatefulSet manifest:

~~~ yaml
spec:
  template:
    containers:
    - name: cockroachdb
      resources:
        requests:
          cpu: "4"
          memory: "16Gi"
        limits:
          cpu: "4"
          memory: "16Gi"
~~~

Then [apply](#apply-settings) the new values to the cluster.
</section>

<section class="filter-content" markdown="1" data-scope="helm">
Specify CPU and memory values in `resources.requests` and `resources.limits` in a custom [values file](deploy-cockroachdb-with-kubernetes.html?filters=helm#step-2-start-cockroachdb):

~~~ yaml
statefulset:
  resources:
    limits:
      cpu: "4"
      memory: "16Gi"
    requests:
      cpu: "4"
      memory: "16Gi"
~~~

Apply the custom values to override the default Helm chart [values](https://github.com/cockroachdb/helm-charts/blob/master/cockroachdb/values.yaml):

{% include_cached copy-clipboard.html %}
~~~ shell
$ helm upgrade {release-name} --values {custom-values}.yaml cockroachdb/cockroachdb
~~~
</section>

We recommend using identical values for `resources.requests` and `resources.limits`. When setting the new values, note that not all of a pod's resources will be available to the CockroachDB container. This is because a fraction of the CPU and memory is reserved for Kubernetes. For more information on how Kubernetes handles resource requests and limits, see the [Kubernetes documentation](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/).

{{site.data.alerts.callout_info}}
If no resource limits are specified, the pods will be able to consume the maximum available CPUs and memory. However, to avoid overallocating resources when another memory-intensive workload is on the same instance, always set resource requests and limits explicitly.
{{site.data.alerts.end}}

<section class="filter-content" markdown="1" data-scope="operator">
### Cache and SQL memory size

Each CockroachDB node reserves a portion of its available memory for its cache and for storing temporary data for SQL queries. For more information on these settings, see the [Production Checklist](recommended-production-settings.html#cache-and-sql-memory-size).

Our Kubernetes manifests dynamically set cache size and SQL memory size each to 1/4 (the recommended fraction) of the available memory, which depends on the memory request and limit you [specified](#memory-and-cpu) for your configuration. If you want to customize these values, set them explicitly.

Specify `cache` and `maxSQLMemory` in the custom resource:

~~~ yaml
spec:
  cache: "4Gi"
  maxSQLMemory: "4Gi"
~~~

Then [apply](#apply-settings) the new values to the cluster.

{{site.data.alerts.callout_info}}
Specifying these values is equivalent to using the `--cache` and `--max-sql-memory` flags with [`cockroach start`](cockroach-start.html#flags).
{{site.data.alerts.end}}
</section>

For more information on resources, see the [Kubernetes documentation](https://kubernetes.io/docs/concepts/configuration/manage-compute-resources-container/).

## Provision volumes

When you start your cluster, Kubernetes dynamically provisions and mounts a persistent volume into each pod. For more information on persistent volumes, see the [Kubernetes documentation](https://kubernetes.io/docs/concepts/storage/persistent-volumes/).

<section class="filter-content" markdown="1" data-scope="operator">
The storage capacity of each volume is set in `pvc.spec.resources` in the custom resource:

~~~ yaml
spec:
  dataStore:
    pvc:
      spec:
        resources:
          limits:
            storage: "60Gi"
          requests:
            storage: "60Gi"
~~~
</section>

<section class="filter-content" markdown="1" data-scope="manual">
The storage capacity of each volume is initially set in `volumeClaimTemplates.spec.resources` in the StatefulSet manifest:

~~~ yaml
volumeClaimTemplates:
  spec:
    resources:
      requests:
        storage: 100Gi
~~~
</section>

<section class="filter-content" markdown="1" data-scope="helm">
The storage capacity of each volume is initially set in the Helm chart's [`values.yaml`](https://github.com/cockroachdb/helm-charts/blob/master/cockroachdb/values.yaml):

~~~ yaml
persistentVolume:
  size: 100Gi
~~~
</section>

You should provision an appropriate amount of disk storage for your workload. For recommendations on this, see the [Production Checklist](recommended-production-settings.html#storage).

### Expand disk size

If you discover that you need more capacity, you can expand the persistent volumes on a running cluster. Increasing disk size is often [beneficial for CockroachDB performance](kubernetes-performance.html#disk-size).

<section class="filter-content" markdown="1" data-scope="operator">
Specify a new volume size in `resources.requests` and `resources.limits` in the custom resource:

~~~ yaml
spec:
  dataStore:
    pvc:
      spec:
        resources:
          limits:
            storage: "100Gi"
          requests:
            storage: "100Gi"
~~~

Then [apply](#apply-settings) the new values to the cluster. The Operator updates the StatefulSet and triggers a rolling restart of the pods with the new storage capacity.

To verify that the storage capacity has been updated, run `kubectl get pvc` to view the persistent volume claims (PVCs). It will take a few minutes before the PVCs are completely updated.
</section>

<section class="filter-content" markdown="1" data-scope="manual">
{% include {{ page.version.version }}/orchestration/kubernetes-expand-disk-manual.md %}
</section>

<section class="filter-content" markdown="1" data-scope="helm">
{% include {{ page.version.version }}/orchestration/kubernetes-expand-disk-helm.md %}
</section>

<section class="filter-content" markdown="1" data-scope="operator">
## Use a custom CA

By default, the Operator will generate and sign 1 client and 1 node certificate to secure the cluster.

To use your own certificate authority instead, add `clientTLSSecret` and `nodeTLSSecret` to the custom resource. These should specify the names of Kubernetes secrets that contain your generated certificates and keys. For details on creating Kubernetes secrets, see the [Kubernetes documentation](https://kubernetes.io/docs/tasks/configmap-secret/managing-secret-using-kubectl/).

{{site.data.alerts.callout_info}}
Currently, the Operator requires that the client and node secrets each contain the filenames `tls.crt` and `tls.key`. For an example of working with this, see [Authenticating with `cockroach cert`](#example-authenticating-with-cockroach-cert).
{{site.data.alerts.end}}

~~~ yaml
spec:
  nodeTLSSecret: {node secret name}
  clientTLSSecret: {client secret name}
~~~

Then [apply](#apply-settings) the new values to the cluster.

### Example: Authenticating with `cockroach cert`

These steps demonstrate how certificates and keys generated by [`cockroach cert`](https://www.cockroachlabs.com/docs/v21.1/cockroach-cert) can be used by the Operator.

1. Create two directories:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ mkdir certs my-safe-directory
    ~~~

    Directory | Description
    ----------|------------
    `certs` | You'll generate your CA certificate and all node and client certificates and keys in this directory.
    `my-safe-directory` | You'll generate your CA key in this directory and then reference the key when generating node and client certificates.

1. Create the CA certificate and key pair:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-ca \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

1. Create a client certificate and key pair for the root user:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-client \
    root \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

1. Upload the client certificate and key to the Kubernetes cluster as a secret, renaming them to the filenames required by the Operator:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl create secret \
    generic cockroachdb.client.root \
    --from-file=tls.key=certs/client.root.key \
    --from-file=tls.crt=certs/client.root.crt \
    --from-file=ca.crt=certs/ca.crt
    ~~~

    ~~~
    secret/cockroachdb.client.root created
    ~~~

1. Create the certificate and key pair for your CockroachDB nodes:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach cert create-node \
    localhost 127.0.0.1 \
    cockroachdb-public \
    cockroachdb-public.default \
    cockroachdb-public.default.svc.cluster.local \
    *.cockroachdb \
    *.cockroachdb.default \
    *.cockroachdb.default.svc.cluster.local \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

1. Upload the node certificate and key to the Kubernetes cluster as a secret, renaming them to the filenames required by the Operator:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl create secret \
    generic cockroachdb.node \
    --from-file=tls.key=certs/node.key \
    --from-file=tls.crt=certs/node.crt \
    --from-file=ca.crt=certs/ca.crt
    ~~~

    ~~~
    secret/cockroachdb.node created
    ~~~

1. Check that the secrets were created on the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get secrets
    ~~~

    ~~~
    NAME                      TYPE                                  DATA   AGE
    cockroachdb.client.root   Opaque                                3      13s
    cockroachdb.node          Opaque                                3      3s
    default-token-6js7b       kubernetes.io/service-account-token   3      9h
    ~~~

1. Add `nodeTLSSecret` and `clientTLSSecret` to the custom resource, specifying the generated secret names:

    ~~~ yaml
    spec:
      clientTLSSecret: cockroachdb.client.root
      nodeTLSSecret: cockroachdb.node
    ~~~

    Then [apply](#apply-settings) the new values to the cluster.

## Rotate security certificates

You may need to rotate the node, client, or CA certificates in the following scenarios:

- The node, client, or CA certificates are expiring soon.
- Your organization's compliance policy requires periodic certificate rotation.
- The key (for a node, client, or CA) is compromised.
- You need to modify the contents of a certificate, for example, to add another DNS name or the IP address of a load balancer through which a node can be reached. In this case, you would need to rotate only the node certificates.

### Example: Rotating certificates signed with `cockroach cert`

If you previously [authenticated with `cockroach cert`](#example-authenticating-with-cockroach-cert), follow these steps to rotate the certificates using the same CA:

1. Create a new client certificate and key pair for the root user, overwriting the previous certificate and key:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-client \
    root \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    --overwrite
    ~~~

1. Delete the existing client secret:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl delete secret cockroachdb.client.root
    ~~~

    ~~~
    secret "cockroachdb.client.root" deleted
    ~~~

1. Upload the new client certificate and key to the Kubernetes cluster as a secret, renaming them to the filenames required by the Operator:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl create secret \
    generic cockroachdb.client.root \
    --from-file=tls.key=certs/client.root.key \
    --from-file=tls.crt=certs/client.root.crt \
    --from-file=ca.crt=certs/ca.crt
    ~~~

    ~~~
    secret/cockroachdb.client.root created
    ~~~

1. Create a new certificate and key pair for your CockroachDB nodes, overwriting the previous certificate and key:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach cert create-node \
    localhost 127.0.0.1 \
    cockroachdb-public \
    cockroachdb-public.default \
    cockroachdb-public.default.svc.cluster.local \
    *.cockroachdb \
    *.cockroachdb.default \
    *.cockroachdb.default.svc.cluster.local \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    --overwrite
    ~~~

1. Delete the existing node secret:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl delete secret cockroachdb.node
    ~~~

    ~~~
    secret "cockroachdb.node" deleted
    ~~~

1. Upload the new node certificate and key to the Kubernetes cluster as a secret, renaming them to the filenames required by the Operator:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl create secret \
    generic cockroachdb.node \
    --from-file=tls.key=certs/node.key \
    --from-file=tls.crt=certs/node.crt \
    --from-file=ca.crt=certs/ca.crt
    ~~~

    ~~~
    secret/cockroachdb.node created
    ~~~

1. Check that the secrets were created on the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get secrets
    ~~~

    ~~~
    NAME                      TYPE                                  DATA   AGE
    cockroachdb.client.root   Opaque                                3      4s
    cockroachdb.node          Opaque                                3      1s
    default-token-6js7b       kubernetes.io/service-account-token   3      9h
    ~~~

    {{site.data.alerts.callout_info}}
    Remember that `nodeTLSSecret` and `clientTLSSecret` in the custom resource must specify these secret names. For details, see [Use a custom CA](#use-a-custom-ca).
    {{site.data.alerts.end}}

1. Trigger a rolling restart of the pods by annotating the cluster (named `cockroachdb` in our [example](#apply-settings)):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl annotate {cluster-name} cockroachdb crdb.io/restarttype='rolling'
    ~~~

    {{site.data.alerts.callout_success}}
    If you used a different CA to sign the new certificates, trigger a full restart of the cluster instead: `kubectl annotate {cluster-name} cockroachdb crdb.io/restarttype='fullcluster'`.

    **Note:** A full restart will cause a temporary database outage.
    {{site.data.alerts.end}}

    ~~~
    crdbcluster.crdb.cockroachlabs.com/cockroachdb annotated
    ~~~

    The pods will terminate and restart one at a time, using the new certificates.

1. You can observe this process:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods
    ~~~

    ~~~
    NAME                                  READY   STATUS        RESTARTS   AGE
    cockroach-operator-655fbf7847-lvz6x   1/1     Running       0          4h29m
    cockroachdb-0                         1/1     Running       0          4h16m
    cockroachdb-1                         1/1     Terminating   0          4h16m
    cockroachdb-2                         1/1     Running       0          43s
    ~~~

## Secure the webhooks

The Operator ships with both [mutating](https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/#mutatingadmissionwebhook) and [validating](https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/#validatingadmissionwebhook) webhooks. Communication between the Kubernetes API server and the webhook service must be secured with TLS.

By default, the Operator searches for the TLS secret `cockroach-operator-webhook-ca`, which contains a CA certificate. If the secret is not found, the Operator auto-generates `cockroach-operator-webhook-ca` with a CA certificate for future runs.

The Operator then generates a one-time server certificate for the webhook server that is signed with `cockroach-operator-webhook-ca`. Finally, the CA bundle for both mutating and validating webhook configurations is patched with the CA certificate.

You can also use your own certificate authority rather than `cockroach-operator-webhook-ca`. Both the certificate and key files you generate must be PEM-encoded. See the following [example](#example-using-openssl-to-secure-the-webhooks).

### Example: Using OpenSSL to secure the webhooks

These steps demonstrate how to use the [`openssl genrsa`](https://www.openssl.org/docs/manmaster/man1/genrsa.html) and [`openssl req`](https://www.openssl.org/docs/manmaster/man1/req.html) subcommands to secure the webhooks on a running Kubernetes cluster:

1. Generate a 4096-bit RSA private key:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    openssl genrsa -out tls.key 4096
    ~~~

1. Generate an X.509 certificate, valid for 10 years. You will be prompted for the certificate field values.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    openssl req -x509 -new -nodes -key tls.key -sha256 -days 3650 -out tls.crt
    ~~~

1. Create the secret, making sure that [you are in the correct namespace](deploy-cockroachdb-with-kubernetes.html#install-the-operator):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl create secret tls cockroach-operator-webhook-ca --cert=tls.crt --key=tls.key
    ~~~

    ~~~
    secret/cockroach-operator-webhook-ca created
    ~~~

1. Remove the certificate and key from your local environment:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    rm tls.crt tls.key
    ~~~

1. Roll the Operator deployment to ensure a new server certificate is generated:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl rollout restart deploy/cockroach-operator-manager
    ~~~

    ~~~
    deployment.apps/cockroach-operator-manager restarted
    ~~~
</section>

<section class="filter-content" markdown="1" data-scope="helm">
## Use a custom CA

By default on secure deployments, the Helm chart will generate and sign 1 client and 1 node certificate to secure the cluster.

{{site.data.alerts.callout_danger}}
If you are running a secure Helm deployment on Kubernetes 1.22 and later, you must migrate away from using the Kubernetes CA for cluster authentication. For details, see [Migration to self-signer](#migration-to-self-signer).
{{site.data.alerts.end}}

To use your own certificate authority instead, specify the following in a custom [values file](deploy-cockroachdb-with-kubernetes.html?filters=helm#step-2-start-cockroachdb):

{% include_cached copy-clipboard.html %}
~~~ yaml
tls:
  enabled: true
  certs:
    provided: true
    clientRootSecret: {client secret name}
    nodeSecret: {node secret name}
~~~

`clientRootSecret` and `nodeSecret` should specify the names of Kubernetes secrets that contain your generated certificates and keys:

- `clientRootSecret` specifies the client secret name.
- `nodeSecret` specifies the node secret name.

Apply the custom values to override the default Helm chart [values](https://github.com/cockroachdb/helm-charts/blob/master/cockroachdb/values.yaml):

{% include_cached copy-clipboard.html %}
~~~ shell
$ helm upgrade {release-name} --values {custom-values}.yaml cockroachdb/cockroachdb
~~~

### Example: Authenticating with `cockroach cert`

{{site.data.alerts.callout_info}}
The below steps use [`cockroach cert` commands](cockroach-cert.html) to quickly generate and sign the CockroachDB node and client certificates. Read our [Authentication](authentication.html#using-digital-certificates-with-cockroachdb) docs to learn about other methods of signing certificates.
{{site.data.alerts.end}}

1. Create two directories:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ mkdir certs my-safe-directory
    ~~~

    Directory | Description
    ----------|------------
    `certs` | You'll generate your CA certificate and all node and client certificates and keys in this directory.
    `my-safe-directory` | You'll generate your CA key in this directory and then reference the key when generating node and client certificates.

1. Create the CA certificate and key pair:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-ca \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

1. Create a client certificate and key pair for the root user:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-client \
    root \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

1. Upload the client certificate and key to the Kubernetes cluster as a secret:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl create secret \
    generic cockroachdb.client.root \
    --from-file=certs
    ~~~

    ~~~
    secret/cockroachdb.client.root created
    ~~~

1. Create the certificate and key pair for your CockroachDB nodes:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-node \
    localhost 127.0.0.1 \
    my-release-cockroachdb-public \
    my-release-cockroachdb-public.default \
    my-release-cockroachdb-public.default.svc.cluster.local \
    *.my-release-cockroachdb \
    *.my-release-cockroachdb.default \
    *.my-release-cockroachdb.default.svc.cluster.local \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

    {{site.data.alerts.callout_info}}
    This example assumes that you followed our [deployment example](deploy-cockroachdb-with-kubernetes.html?filters=helm), which uses `my-release` as the release name. If you used a different value, be sure to adjust the release name in this command.
    {{site.data.alerts.end}}

1. Upload the node certificate and key to the Kubernetes cluster as a secret:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl create secret \
    generic cockroachdb.node \
    --from-file=certs
    ~~~

    ~~~
    secret/cockroachdb.node created
    ~~~

1. Check that the secrets were created on the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get secrets
    ~~~

    ~~~
    NAME                      TYPE                                  DATA   AGE
    cockroachdb.client.root   Opaque                                3      41m
    cockroachdb.node          Opaque                                5      14s
    default-token-6qjdb       kubernetes.io/service-account-token   3      4m
    ~~~

1. Specify the following in a custom [values file](deploy-cockroachdb-with-kubernetes.html?filters=helm#step-2-start-cockroachdb), using the generated secret names:

    {% include_cached copy-clipboard.html %}
    ~~~
    tls:
      enabled: true
      certs:
        provided: true
      clientRootSecret: cockroachdb.client.root
      nodeSecret: cockroachdb.node
    ~~~

1. Apply the custom values to override the default Helm chart [values](https://github.com/cockroachdb/helm-charts/blob/master/cockroachdb/values.yaml):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ helm upgrade {release-name} --values {custom-values}.yaml cockroachdb/cockroachdb
    ~~~

## Rotate security certificates

You may need to rotate the node, client, or CA certificates in the following scenarios:

- The node, client, or CA certificates are expiring soon.
- Your organization's compliance policy requires periodic certificate rotation.
- The key (for a node, client, or CA) is compromised.
- You need to modify the contents of a certificate, for example, to add another DNS name or the IP address of a load balancer through which a node can be reached. In this case, you would need to rotate only the node certificates.

### Example: Rotating certificates signed with `cockroach cert`

The Helm chart includes [values](https://github.com/cockroachdb/helm-charts/blob/master/cockroachdb/values.yaml) to configure a Kubernetes [cron job](https://kubernetes.io/docs/tasks/job/automated-tasks-with-cron-jobs/) that regularly rotates certificates before they expire.

If you previously [authenticated with `cockroach cert`](#example-authenticating-with-cockroach-cert), follow these steps to ensure the certificates are rotated:

1. Upload the CA certificate that you previously created to the Kubernetes cluster as a secret:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl create secret \
    generic cockroachdb.ca \
    --from-file=certs/ca.crt
    ~~~

    ~~~
    secret/cockroachdb.ca created
    ~~~

1. Specify the following in a custom [values file](deploy-cockroachdb-with-kubernetes.html?filters=helm#step-2-start-cockroachdb), using the generated secret name:

    {% include_cached copy-clipboard.html %}
    ~~~ yaml
    selfSigner:
      enabled: true
      caProvided: true
      caSecret: cockroachdb.ca
      rotateCerts: true
    ~~~

    {{site.data.alerts.callout_info}}
    `selfSigner.enabled` and `selfSigner.rotateCerts` are `true` by default in the Helm chart [values](https://github.com/cockroachdb/helm-charts/blob/master/cockroachdb/values.yaml).
    {{site.data.alerts.end}}

1. Customize the following `selfSigner` fields to set the frequency of certificate rotation. These should correspond to the durations of the CA, client, and node certificates.

    {% include_cached copy-clipboard.html %}
    ~~~ yaml
    selfSigner:
      minimumCertDuration: 624h
      caCertDuration: 43800h
      caCertExpiryWindow: 648h
      clientCertDuration: 672h
      clientCertExpiryWindow: 48h
      nodeCertDuration: 8760h
      nodeCertExpiryWindow: 168h
    ~~~

    <ul>
        <li><code>caCertDuration</code>, <code>clientCertDuration</code>, and <code>nodeCertDuration</code> specify the duration in hours of the CA, client, and node certificates, respectively.</li>
        <li><code>caCertExpiryWindow</code>, <code>clientCertExpiryWindow</code>, and <code>nodeCertExpiryWindow</code> specify the timeframe in hours during which the CA, client, and node certificates, respectively, should be rotated before they expire.</li>
        <li><code>minimumCertDuration</code> specifies the minimum duration in hours for all certificates. This is to ensure that the client and node certificates are rotated within the duration of the CA certificate. This value must be less than:
            <ul><li><code>cacertExpiryWindow</code></li>
                <li>The difference of <code>clientCertDuration</code> and <code>clientExpiryWindow</code></li>
                <li>The difference of <code>nodeCertDuration</code> and <code>nodeCertExpiryWindow</code></li>
            </ul>
    </ul>

    Certificate duration is configured when running [`cockroach cert`](cockroach-cert.html#general). You can check the expiration dates of the `cockroach cert` certificates by running:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach cert list --certs-dir=certs
    ~~~

    ~~~
    Certificate directory: certs
      Usage  | Certificate File |    Key File     |  Expires   |                                                                                                                                  Notes                                                                                                                                  | Error
    ---------+------------------+-----------------+------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+--------
      CA     | ca.crt           |                 | 2031/09/07 | num certs: 1                                                                                                                                                                                                                                                            |
      Node   | node.crt         | node.key        | 2026/09/03 | addresses: localhost,my-release-cockroachdb-public,my-release-cockroachdb-public.default,my-release-cockroachdb-public.default.svc.cluster.local,*.my-release-cockroachdb,*.my-release-cockroachdb.default,*.my-release-cockroachdb.default.svc.cluster.local,127.0.0.1 |
      Client | client.root.crt  | client.root.key | 2026/09/03 | user: root                                                                                                                                                                                                                                                              |
    ~~~

1. Apply the custom values to override the default Helm chart [values](https://github.com/cockroachdb/helm-charts/blob/master/cockroachdb/values.yaml):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ helm upgrade {release-name} --values {custom-values}.yaml cockroachdb/cockroachdb
    ~~~

    The certificates will be rotated during the specified expiry windows.

## Migration to self-signer

Previous versions of the Helm chart used the Kubernetes CA to sign certificates. However, the Kubernetes CA is deprecated from Kubernetes 1.22 and later. The Helm chart now uses a self-signer for cluster authentication.

To migrate your Helm deployment to use the self-signer:

1. Set the cluster's upgrade strategy to `OnDelete`, which specifies that only pods deleted by the user will be upgraded.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    helm upgrade {release-name} cockroachdb/cockroachdb --set statefulset.updateStrategy.type="OnDelete"
    ~~~

1. Confirm that the `init` pod has been created:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods
    ~~~

    ~~~
    NAME                                READY     STATUS     RESTARTS   AGE
    my-release-cockroachdb-0            1/1       Running    0          6m
    my-release-cockroachdb-1            1/1       Running    0          6m
    my-release-cockroachdb-2            1/1       Running    0          6m
    my-release-cockroachdb-init-59ndf   0/1       Completed  0          8s
    ~~~

1. Delete the cluster pods to start the upgrade process.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl delete pods -l app.kubernetes.io/component=cockroachdb
    ~~~

    ~~~
    pod "my-release-cockroachdb-0" deleted
    pod "my-release-cockroachdb-1" deleted
    pod "my-release-cockroachdb-2" deleted
    ~~~

    All pods will be restarted with new certificates generated by the self-signer. Note that this is not a rolling upgrade, so the cluster will experience some downtime. You can monitor this process:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods
    ~~~

    ~~~
    NAME                       READY   STATUS              RESTARTS   AGE
    my-release-cockroachdb-0   0/1     ContainerCreating   0          14s
    my-release-cockroachdb-1   0/1     ContainerCreating   0          4s
    my-release-cockroachdb-2   0/1     Terminating         0          7m16s
    ~~~
</section>

<section class="filter-content" markdown="1" data-scope="operator">
## Configure ports

The Operator separates traffic into three ports:

| Protocol | Default | Description                                                         | Custom Resource Field |
|----------|---------|---------------------------------------------------------------------|-----------------------|
| gRPC     | 26258   | Used for node connections                                           | `grpcPort`            |
| HTTP     | 8080    | Used to [access the DB Console](ui-overview.html#db-console-access) | `httpPort`            |
| SQL      | 26257   | Used for SQL shell access                                           | `sqlPort`             |

Specify alternate port numbers in the custom resource (for example, to match the default port `5432` on PostgreSQL):

~~~ yaml
spec:
  sqlPort: 5432
~~~

Then [apply](#apply-settings) the new values to the cluster. The Operator updates the StatefulSet and triggers a rolling restart of the pods with the new port settings.

{{site.data.alerts.callout_danger}}
Currently, only the pods are updated with new ports. To connect to the cluster, you need to ensure that the `public` service is also updated to use the new port. You can do this by deleting the service with `kubectl delete service {cluster-name}-public`. When service is recreated by the Operator, it will use the new port. This is a known limitation that will be fixed in an Operator update.
{{site.data.alerts.end}}
</section>

## Scale the cluster

### Add nodes

<section class="filter-content" markdown="1" data-scope="operator">
Before scaling up CockroachDB, note the following [topology recommendations](recommended-production-settings.html#topology):

- Each CockroachDB node (running in its own pod) should run on a separate Kubernetes worker node.
- Each availability zone should have the same number of CockroachDB nodes.

If your cluster has 3 CockroachDB nodes distributed across 3 availability zones (as in our [deployment example](deploy-cockroachdb-with-kubernetes.html)), we recommend scaling up by a multiple of 3 to retain an even distribution of nodes. You should therefore scale up to a minimum of 6 CockroachDB nodes, with 2 nodes in each zone.

1. Run `kubectl get nodes` to list the worker nodes in your Kubernetes cluster. There should be at least as many worker nodes as pods you plan to add. This ensures that no more than one pod will be placed on each worker node.

1. If you need to add worker nodes, resize your GKE cluster by specifying the desired number of worker nodes in each zone:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    gcloud container clusters resize {cluster-name} --region {region-name} --num-nodes 2
    ~~~

    This example distributes 2 worker nodes across the default 3 zones, raising the total to 6 worker nodes.

  1. If you are adding nodes after previously [scaling down](#remove-nodes), and have not enabled [automatic PVC pruning](#automatic-pvc-pruning), you must first manually delete any persistent volumes that were orphaned by node removal.

        {{site.data.alerts.callout_info}}
        Due to a [known issue](https://github.com/cockroachdb/cockroach-operator/issues/542), automatic pruning of PVCs is currently disabled by default. This means that after decommissioning and removing a node, the Operator will not remove the persistent volume that was mounted to its pod.
        {{site.data.alerts.end}}

        View the PVCs on the cluster:

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        kubectl get pvc
        ~~~

        ~~~
        NAME                    STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
        datadir-cockroachdb-0   Bound    pvc-f1ce6ed2-ceda-40d2-8149-9e5b59faa9df   60Gi       RWO            standard       24m
        datadir-cockroachdb-1   Bound    pvc-308da33c-ec77-46c7-bcdf-c6e610ad4fea   60Gi       RWO            standard       24m
        datadir-cockroachdb-2   Bound    pvc-6816123f-29a9-4b86-a4e2-b67f7bb1a52c   60Gi       RWO            standard       24m
        datadir-cockroachdb-3   Bound    pvc-63ce836a-1258-4c58-8b37-d966ed12d50a   60Gi       RWO            standard       24m
        datadir-cockroachdb-4   Bound    pvc-1ylabv86-6512-6n12-bw3g-i0dh2zxvfhd0   60Gi       RWO            standard       24m
        datadir-cockroachdb-5   Bound    pvc-2vka2c9x-7824-41m5-jk45-mt7dzq90q97x   60Gi       RWO            standard       24m
        ~~~

  1. The PVC names correspond to the pods they are bound to. For example, if the pods `cockroachdb-3`, `cockroachdb-4`, and `cockroachdb-5` had been removed by [scaling the cluster down](#remove-nodes) from 6 to 3 nodes, `datadir-cockroachdb-3`, `datadir-cockroachdb-4`, and `datadir-cockroachdb-5` would be the PVCs for the orphaned persistent volumes. To verify that a PVC is not currently bound to a pod:

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        kubectl describe pvc datadir-cockroachdb-5
        ~~~

        The output will include the following line:

        ~~~
        Mounted By:    <none>
        ~~~

        If the PVC is bound to a pod, it will specify the pod name.

  1. Remove the orphaned persistent volumes by deleting their PVCs:

        {{site.data.alerts.callout_danger}}
        Before deleting any persistent volumes, be sure you have a backup copy of your data. Data **cannot** be recovered once the persistent volumes are deleted. For more information, see the [Kubernetes documentation](https://kubernetes.io/docs/tasks/run-application/delete-stateful-set/#persistent-volumes).
        {{site.data.alerts.end}}

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        kubectl delete pvc datadir-cockroachdb-3 datadir-cockroachdb-4 datadir-cockroachdb-5
        ~~~

        ~~~
        persistentvolumeclaim "datadir-cockroachdb-3" deleted
        persistentvolumeclaim "datadir-cockroachdb-4" deleted
        persistentvolumeclaim "datadir-cockroachdb-5" deleted
        ~~~

1. Update `nodes` in the custom resource with the target size of the CockroachDB cluster. This value refers to the number of CockroachDB nodes, each running in one pod:

    ~~~
    nodes: 6
    ~~~

    {{site.data.alerts.callout_info}}
    Note that you must scale by updating the `nodes` value in the custom resource. Using `kubectl scale statefulset <cluster-name> --replicas=4` will result in new pods immediately being terminated.
    {{site.data.alerts.end}}

1. [Apply](#apply-settings) the new value.

1. Verify that the new pods were successfully started:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl get pods
    ~~~

    ~~~
    NAME                                  READY   STATUS    RESTARTS   AGE
    cockroach-operator-655fbf7847-zn9v8   1/1     Running   0          30m
    cockroachdb-0                         1/1     Running   0          24m
    cockroachdb-1                         1/1     Running   0          24m
    cockroachdb-2                         1/1     Running   0          24m
    cockroachdb-3                         1/1     Running   0          30s
    cockroachdb-4                         1/1     Running   0          30s
    cockroachdb-5                         1/1     Running   0          30s
    ~~~

    Each pod should be running in one of the 6 worker nodes.
</section>

<section class="filter-content" markdown="1" data-scope="manual">
{% include {{ page.version.version }}/orchestration/kubernetes-scale-cluster-manual.md %}
</section>

<section class="filter-content" markdown="1" data-scope="helm">
{% include {{ page.version.version }}/orchestration/kubernetes-scale-cluster-helm.md %}
</section>

### Remove nodes

{{site.data.alerts.callout_danger}}
Do **not** scale down to fewer than 3 nodes. This is considered an anti-pattern on CockroachDB and will cause errors.
{{site.data.alerts.end}}

<section class="filter-content" markdown="1" data-scope="operator">
{{site.data.alerts.callout_danger}}
Due to a [known issue](https://github.com/cockroachdb/cockroach-operator/issues/542), automatic pruning of PVCs is currently disabled by default. This means that after decommissioning and removing a node, the Operator will not remove the persistent volume that was mounted to its pod.

If you plan to eventually [scale up](#add-nodes) the cluster after scaling down, you will need to manually delete any PVCs that were orphaned by node removal before scaling up. For more information, see [Add nodes](#add-nodes).
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
If you want to enable the Operator to automatically prune PVCs when scaling down, see [Automatic PVC pruning](#automatic-pvc-pruning). However, note that this workflow is currently unsupported.
{{site.data.alerts.end}}

Before scaling down CockroachDB, note the following [topology recommendation](recommended-production-settings.html#topology):

- Each availability zone should have the same number of CockroachDB nodes.

If your nodes are distributed across 3 availability zones (as in our [deployment example](deploy-cockroachdb-with-kubernetes.html)), we recommend scaling down by a multiple of 3 to retain an even distribution. If your cluster has 6 CockroachDB nodes, you should therefore scale down to 3, with 1 node in each zone.

1. Update `nodes` in the custom resource with the target size of the CockroachDB cluster. For instance, to scale down to 3 nodes:

    ~~~
    nodes: 3
    ~~~

    {{site.data.alerts.callout_info}}
    Before removing a node, the Operator first decommissions the node. This lets a node finish in-flight requests, rejects any new requests, and transfers all range replicas and range leases off the node.
    {{site.data.alerts.end}}

1. [Apply](#apply-settings) the new value.

    The Operator will remove nodes from the cluster one at a time, starting from the pod with the highest number in its address.

1. Verify that the pods were successfully removed:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl get pods
    ~~~

    ~~~
    NAME                                  READY   STATUS    RESTARTS   AGE
    cockroach-operator-655fbf7847-zn9v8   1/1     Running   0          32m
    cockroachdb-0                         1/1     Running   0          26m
    cockroachdb-1                         1/1     Running   0          26m
    cockroachdb-2                         1/1     Running   0          26m
    ~~~

#### Automatic PVC pruning

To enable the Operator to automatically remove persistent volumes when [scaling down](#remove-nodes) a cluster, turn on automatic PVC pruning through a feature gate.

{{site.data.alerts.callout_danger}}
This workflow is unsupported and should be enabled at your own risk.
{{site.data.alerts.end}}

{% capture latest_operator_version %}{% include_cached latest_operator_version.md %}{% endcapture %}

1. Download the Operator manifest:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ curl -0 https://raw.githubusercontent.com/cockroachdb/cockroach-operator/v{{ latest_operator_version }}/install/operator.yaml
    ~~~

1. Uncomment the following lines in the Operator manifest:

    ~~~ yaml
    - feature-gates
    - AutoPrunePVC=true
    ~~~

1. Reapply the Operator manifest:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl apply -f operator.yaml
    ~~~

1. Validate that the Operator is running:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods
    ~~~

    ~~~
    NAME                                  READY   STATUS    RESTARTS   AGE
    cockroach-operator-6f7b86ffc4-9ppkv   1/1     Running   0          22s
    ...
    ~~~
</section>

<section class="filter-content" markdown="1" data-scope="manual">
{% include {{ page.version.version }}/orchestration/kubernetes-remove-nodes-manual.md %}
</section>

<section class="filter-content" markdown="1" data-scope="helm">
{% include {{ page.version.version }}/orchestration/kubernetes-remove-nodes-helm.md %}
</section>

## Upgrade the cluster

We strongly recommend that you regularly upgrade your CockroachDB version in order to pick up bug fixes, performance improvements, and new features.

The upgrade process on Kubernetes is a [staged update](https://kubernetes.io/docs/tutorials/stateful-application/basic-stateful-set/#staging-an-update) in which the Docker image is applied to the pods one at a time, with each pod being stopped and restarted in turn. This is to ensure that the cluster remains available during the upgrade.

<section class="filter-content" markdown="1" data-scope="operator">
1. Verify that you can upgrade.

    To upgrade to a new major version, you must first be on a production release of the previous version. The release does not need to be the latest production release of the previous version, but it must be a production [release](../releases/index.html) and not a testing release (alpha/beta).

    Therefore, in order to upgrade to v21.1, you must be on a production release of v20.2.

    1. If you are upgrading to v21.1 from a production release earlier than v20.2, or from a testing release (alpha/beta), first [upgrade to a production release of v20.2](../v20.2/orchestrate-cockroachdb-with-kubernetes.html#upgrade-the-cluster). Be sure to complete all the steps.

    1. Then return to this page and perform a second upgrade to v21.1.

    1. If you are upgrading from a production release of v20.2, or from any earlier v21.1 patch release, you do not have to go through intermediate releases; continue to step 2.

1. Verify the overall health of your cluster using the [DB Console](ui-overview.html). On the **Overview**:
    - Under **Node Status**, make sure all nodes that should be live are listed as such. If any nodes are unexpectedly listed as suspect or dead, identify why the nodes are offline and either restart them or [decommission](#remove-nodes) them before beginning your upgrade. If there are dead and non-decommissioned nodes in your cluster, it will not be possible to finalize the upgrade (either automatically or manually).
    - Under **Replication Status**, make sure there are 0 under-replicated and unavailable ranges. Otherwise, performing a rolling upgrade increases the risk that ranges will lose a majority of their replicas and cause cluster unavailability. Therefore, it's important to [identify and resolve the cause of range under-replication and/or unavailability](cluster-setup-troubleshooting.html#replication-issues) before beginning your upgrade.
    - In the **Node List**:
        - Make sure all nodes are on the same version. If not all nodes are on the same version, upgrade them to the cluster's highest current version first, and then start this process over.
        - Make sure capacity and memory usage are reasonable for each node. Nodes must be able to tolerate some increase in case the new version uses more resources for your workload. Also go to **Metrics > Dashboard: Hardware** and make sure CPU percent is reasonable across the cluster. If there's not enough headroom on any of these metrics, consider [adding nodes](#add-nodes) to your cluster before beginning your upgrade.

1. Review the [backward-incompatible changes in v21.1](../releases/v21.1.html#v21-1-0-backward-incompatible-changes) and [deprecated features](../releases/v21.1.html#v21-1-0-deprecations). If any affect your deployment, make the necessary changes before starting the rolling upgrade to v21.1.

1. Change the desired Docker image in the custom resource:

    ~~~
    image:
      name: cockroachdb/cockroach:{{page.release_info.version}}
    ~~~

1. [Apply](#apply-settings) the new value. The Operator will perform the staged update.

    {{site.data.alerts.callout_info}}
    The Operator automatically sets the `cluster.preserve_downgrade_option` [cluster setting](cluster-settings.html) to the version you are upgrading from. This disables auto-finalization of the upgrade so that you can monitor the stability and performance of the upgraded cluster before manually finalizing the upgrade. This will enable certain [features and performance improvements introduced in v21.1](upgrade-cockroach-version.html#features-that-require-upgrade-finalization).

    Note that after finalization, it will no longer be possible to perform a downgrade to v20.2. In the event of a catastrophic failure or corruption, the only option will be to start a new cluster using the old binary and then restore from a [backup](take-full-and-incremental-backups.html) created prior to performing the upgrade.

    Finalization only applies when performing a major version upgrade (for example, from v20.2.x to v21.1). Patch version upgrades (for example, within the v21.1.x series) can always be downgraded.
    {{site.data.alerts.end}}

1. To check the status of the rolling upgrade, run `kubectl get pods`. The pods are restarted one at a time with the new image.

1. Verify that all pods have been upgraded by running:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods \
    -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.containers[0].image}{"\n"}'
    ~~~

    You can also check the CockroachDB version of each node in the [DB Console](ui-cluster-overview-page.html#node-details).

1. Monitor the stability and performance of your cluster until you are comfortable with the upgrade (generally at least a day).

    If you decide to roll back the upgrade, revert the image name in the custom resource and apply the new value.

    {{site.data.alerts.callout_info}}
    This is only possible when performing a major version upgrade (for example, from v20.2.x to v21.1). Patch version upgrades (for example, within the v21.1.x series) are auto-finalized.
    {{site.data.alerts.end}}

    To finalize the upgrade, re-enable auto-finalization:

    1. Start the CockroachDB [built-in SQL client](cockroach-sql.html). For example, if you followed the steps in [Deploy CockroachDB with Kubernetes](deploy-cockroachdb-with-kubernetes.html#step-3-use-the-built-in-sql-client) to launch a secure client pod, get a shell into the `cockroachdb-client-secure` pod:

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ kubectl exec -it cockroachdb-client-secure \-- ./cockroach sql \
        --certs-dir=/cockroach/cockroach-certs \
        --host={cluster-name}-public
        ~~~

    1. Re-enable auto-finalization:

        {% include_cached copy-clipboard.html %}
        ~~~ sql
        > RESET CLUSTER SETTING cluster.preserve_downgrade_option;
        ~~~

    1. Exit the SQL shell and pod:

        {% include_cached copy-clipboard.html %}
        ~~~ sql
        > \q
        ~~~

</section>

<section class="filter-content" markdown="1" data-scope="manual">
{% include {{ page.version.version }}/orchestration/kubernetes-upgrade-cluster-manual.md %}
</section>

<section class="filter-content" markdown="1" data-scope="helm">
{% include {{ page.version.version }}/orchestration/kubernetes-upgrade-cluster-helm.md %}
</section>

## See also

- [Kubernetes Multi-Cluster Deployment](orchestrate-cockroachdb-with-kubernetes-multi-cluster.html)
- [Kubernetes Performance Guide](kubernetes-performance.html)
{% include {{ page.version.version }}/prod-deployment/prod-see-also.md %}
