{{site.data.alerts.callout_info}}
The Operator is currently supported for GKE only.
{{site.data.alerts.end}}

### Install the Operator

1. Apply the [CustomResourceDefinition (CRD)](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/#customresourcedefinitions) for the Operator:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl apply -f https://raw.githubusercontent.com/cockroachdb/cockroach-operator/master/config/crd/bases/crdb.cockroachlabs.com_crdbclusters.yaml
    ~~~

    ~~~
    customresourcedefinition.apiextensions.k8s.io/crdbclusters.crdb.cockroachlabs.com created
    ~~~

1. Apply the Operator manifest:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl apply -f https://raw.githubusercontent.com/cockroachdb/cockroach-operator/master/manifests/operator.yaml
    ~~~

    ~~~
    clusterrole.rbac.authorization.k8s.io/cockroach-operator-role created
    serviceaccount/cockroach-operator-default created
    clusterrolebinding.rbac.authorization.k8s.io/cockroach-operator-default created
    deployment.apps/cockroach-operator created
    ~~~

1. Validate that the Operator is running:

    {% include copy-clipboard.html %}
	~~~ shell
	$ kubectl get pods
    ~~~

    ~~~
	NAME                                  READY   STATUS    RESTARTS   AGE
	cockroach-operator-6f7b86ffc4-9ppkv   1/1     Running   0          54s
	~~~

### Configure the cluster

On a production cluster, you will need to modify the StatefulSet configuration with values that are appropriate for your workload.

1. Download and edit `example.yaml`, which tells the Operator how to configure the Kubernetes cluster.

    {% include copy-clipboard.html %}
    ~~~ shell
    $ curl -O https://raw.githubusercontent.com/cockroachdb/cockroach-operator/master/examples/example.yaml
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
	$ vi example.yaml
	~~~

1. Allocate CPU and memory resources to CockroachDB on each pod. Enable the commented-out lines in `example.yaml` and substitute values that are appropriate for your workload. For more context on provisioning CPU and memory, see the [Production Checklist](recommended-production-settings.html#hardware).

    {{site.data.alerts.callout_success}}
    Resource `requests` and `limits` should have identical values. 
    {{site.data.alerts.end}}

    ~~~
      resources:
        requests:
          cpu: "2"
          memory: "8Gi"
        limits:
          cpu: "2"
          memory: "8Gi"
    ~~~

    {{site.data.alerts.callout_info}}
    If no resource limits are specified, the pods will be able to consume the maximum available CPUs and memory. However, to avoid overallocating resources when another memory-intensive workload is on the same instance, always set resource requests and limits explicitly.
    {{site.data.alerts.end}}

1. Modify `resources.requests.storage` to allocate the appropriate amount of disk storage for your workload. This configuration defaults to 60Gi of disk space per pod. For more context on provisioning storage, see the [Production Checklist](recommended-production-settings.html#storage).

    ~~~
    resources:
      requests:
        storage: "60Gi"
    ~~~

### Initialize the cluster

{{site.data.alerts.callout_info}}
By default, the Operator uses the built-in Kubernetes CA to generate and approve 1 root and 1 node certificate for the cluster. This differs from how CockroachDB handles [node authentication](authentication.html#using-digital-certificates-with-cockroachdb), in which a separate node certificate is used for each CockroachDB node.
{{site.data.alerts.end}}

1. Apply `example.yaml`:

    {% include copy-clipboard.html %}
	~~~ shell
	$ kubectl apply -f example.yaml
	~~~

    The Operator will create a StatefulSet and initialize the nodes as a cluster.

    ~~~
    crdbcluster.crdb.cockroachlabs.com/cockroachdb created
    ~~~

1. Check that the pods were created:

    {% include copy-clipboard.html %}
	~~~ shell
	$ kubectl get pods
	~~~

	~~~
	NAME                                  READY   STATUS    RESTARTS   AGE
	cockroach-operator-6f7b86ffc4-9t9zb   1/1     Running   0          3m22s
	cockroachdb-0                         1/1     Running   0          2m31s
	cockroachdb-1                         1/1     Running   1          102s
	cockroachdb-2                         1/1     Running   0          46s
	~~~

Each pod should have `READY` status soon after being created.