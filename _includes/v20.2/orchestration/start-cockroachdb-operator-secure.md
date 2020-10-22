{{site.data.alerts.callout_success}}
The Operator is currently supported for **GKE** only.
{{site.data.alerts.end}}

#### Install the Operator

1. Locate the latest [release tag](https://github.com/cockroachdb/cockroach-operator/tags) for the Operator.

1. Clone the latest Operator release:

    {% include copy-clipboard.html %}
    ~~~
    git clone --depth 1 --branch <tag_name> https://github.com/cockroachdb/cockroach-operator
    ~~~

1. Apply the [CustomResourceDefinition (CRD)](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/#customresourcedefinitions) for the Operator:

    {% include copy-clipboard.html %}
    ~~~
    kubectl apply -f cockroach-operator/config/crd/bases/crdb.cockroachlabs.com_crdbclusters.yaml
    ~~~

    ~~~
    customresourcedefinition.apiextensions.k8s.io/crdbclusters.crdb.cockroachlabs.com created
    ~~~

1. Apply the Operator manifest:

    {% include copy-clipboard.html %}
    ~~~
    kubectl apply -f cockroach-operator/manifests/operator.yaml
    ~~~

    ~~~
    clusterrole.rbac.authorization.k8s.io/cockroach-operator-role created
    serviceaccount/cockroach-operator-default created
    clusterrolebinding.rbac.authorization.k8s.io/cockroach-operator-default created
    deployment.apps/cockroach-operator created
    ~~~

1. Validate that the Operator is running:

    {% include copy-clipboard.html %}
	~~~
	kubectl get pods
    ~~~

    ~~~
	NAME                                  READY   STATUS    RESTARTS   AGE
	cockroach-operator-6f7b86ffc4-9ppkv   1/1     Running   0          54s
	~~~

#### Configure the cluster

1. Open and edit `example.yaml`, which tells the Operator how to configure the Kubernetes cluster.

    {% include copy-clipboard.html %}
    ~~~ shell
	vi cockroach-operator/examples/example.yaml
	~~~

1. Allocate CPU and memory resources to CockroachDB on each pod. Enable the commented-out lines in `example.yaml` and substitute values that are appropriate for your workload. For more context on provisioning CPU and memory, see the [Production Checklist](recommended-production-settings.html#hardware).

    {{site.data.alerts.callout_success}}
    Resource `requests` and `limits` should have identical values. 
    {{site.data.alerts.end}}

	~~~
    resources:
      requests:
        cpu: "4"
        memory: "16Gi"
        ...
      limits:
        cpu: "4"
        memory: "16Gi"
	~~~

    {{site.data.alerts.callout_info}}
    If no resource requests are specified, the Kubernetes scheduler provides the maximum allowed CPUs and memory to each pod. However, to avoid overallocating resources when another memory-intensive workload is on the same instance, always set resource requests and limits explicitly.
    {{site.data.alerts.end}}

1. Modify `resources.requests.storage` to allocate the appropriate amount of disk storage for your workload. This configuration defaults to 60Gi of disk space per pod. For more context on provisioning storage, see the [Production Checklist](recommended-production-settings.html#storage).

    ~~~
    resources:
      requests:
        ...
        storage: "60Gi"
    ~~~

    {{site.data.alerts.callout_info}}
    You can also [expand disk size](orchestrate-cockroachdb-with-kubernetes.html#expand-disk-size) after the cluster is live.
    {{site.data.alerts.end}}

1. By default, the Operator uses the built-in Kubernetes CA to generate and approve 1 client and 1 node certificate for the cluster. You can optionally use a [non-Kubernetes CA](#using-a-non-kubernetes-ca-optional) instead.

	{{site.data.alerts.callout_info}}
	This differs from how CockroachDB handles [node authentication](authentication.html#using-digital-certificates-with-cockroachdb), in which a separate node certificate is used for each CockroachDB node. The Operator currently uses a single node certificate to authenticate the cluster.
	{{site.data.alerts.end}}

##### Using a non-Kubernetes CA (optional)

To authenticate using a CA other than the one that Kubernetes provides:

1. Enable the following lines in `example.yaml`:

	~~~
	nodeTLSSecret: <node-secret>
	clientTLSSecret: <client-secret>
	~~~

	The corresponding secret names will depend on your method of generating certificates. Below, we use [`cockroach cert`](cockroach-cert.html).

1. Create two directories:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ mkdir certs my-safe-directory
    ~~~

    Directory | Description
    ----------|------------
    `certs` | You'll generate your CA certificate and all node and client certificates and keys in this directory.
    `my-safe-directory` | You'll generate your CA key in this directory and then reference the key when generating node and client certificates.

1. Create the CA certificate and key pair:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-ca \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

1. Create a client certificate and key pair for the root user:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-client \
    root \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

1. Upload the client certificate and key to the Kubernetes cluster as a secret:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl create secret \
    generic cockroachdb.client.root \
    --from-file=certs
    ~~~

    ~~~
    secret/cockroachdb.client.root created
    ~~~

1. Create the certificate and key pair for your CockroachDB nodes:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-node \
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

1. Upload the node certificate and key to the Kubernetes cluster as a secret:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl create secret \
    generic cockroachdb.node \
    --from-file=certs
    ~~~

    ~~~
    secret/cockroachdb.node created
    ~~~

1. Check that the secrets were created on the cluster:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get secrets
    ~~~

    ~~~
    NAME                      TYPE                                  DATA   AGE
    cockroachdb.client.root   Opaque                                3      41m
    cockroachdb.node          Opaque                                5      14s
    default-token-6qjdb       kubernetes.io/service-account-token   3      4m
    ~~~

1. In `example.yaml`, fill in the names of the node and client secrets you created:

	~~~
	nodeTLSSecret: cockroachdb.node
	clientTLSSecret: cockroachdb.client.root
	~~~

#### Initialize the cluster

1. Apply `example.yaml`:

    {% include copy-clipboard.html %}
	~~~
	kubectl create -f cockroach-operator/examples/example.yaml
	~~~

    The Operator will create, authenticate, and initialize the nodes as a cluster.

    ~~~
    crdbcluster.crdb.cockroachlabs.com/cockroachdb created
    ~~~

1. Check that the pods were created:

    {% include copy-clipboard.html %}
	~~~
	kubectl get pods
	~~~

	~~~
	NAME                                  READY   STATUS    RESTARTS   AGE
	cockroach-operator-6f7b86ffc4-9t9zb   1/1     Running   0          3m22s
	cockroachdb-0                         1/1     Running   0          2m31s
	cockroachdb-1                         1/1     Running   1          102s
	cockroachdb-2                         1/1     Running   0          46s
	~~~

Each pod should have `READY` status soon after being created.