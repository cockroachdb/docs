### Install the Operator

1. Apply the [custom resource definition (CRD)](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/#customresourcedefinitions) for the Operator:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl apply -f https://raw.githubusercontent.com/cockroachdb/cockroach-operator/{{site.operator_version}}/install/crds.yaml
    ~~~

    ~~~
    customresourcedefinition.apiextensions.k8s.io/crdbclusters.crdb.cockroachlabs.com created
    ~~~

1. By default, the Operator is configured to install in the `cockroach-operator-system` namespace and to manage CockroachDB instances for all namespaces on the cluster.

    If you'd like to change either of these defaults:

    1. Download the Operator manifest:

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ curl -0 https://raw.githubusercontent.com/cockroachdb/cockroach-operator/{{site.operator_version}}/install/operator.yaml
        ~~~

    1. To use a custom namespace, edit all instances of `namespace: cockroach-operator-system` with your desired namespace.

    1. To limit the namespaces that will be monitored, set the `WATCH_NAMESPACE` environment variable in the `Deployment` pod spec. This can be set to a single namespace, or a comma-delimited set of namespaces. When set, only those `CrdbCluster` resources in the supplied namespace(s) will be reconciled.

    1. Instead of using the command below, apply your local version of the Operator manifest to the cluster:

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ kubectl apply -f operator.yaml
        ~~~

    If you want to use the default namespace settings:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl apply -f https://raw.githubusercontent.com/cockroachdb/cockroach-operator/{{site.operator_version}}/install/operator.yaml
    ~~~

    ~~~
    clusterrole.rbac.authorization.k8s.io/cockroach-database-role created
    serviceaccount/cockroach-database-sa created
    clusterrolebinding.rbac.authorization.k8s.io/cockroach-database-rolebinding created
    role.rbac.authorization.k8s.io/cockroach-operator-role created
    clusterrolebinding.rbac.authorization.k8s.io/cockroach-operator-rolebinding created
    clusterrole.rbac.authorization.k8s.io/cockroach-operator-role created
    serviceaccount/cockroach-operator-sa created
    rolebinding.rbac.authorization.k8s.io/cockroach-operator-default created
    deployment.apps/cockroach-operator created
    ~~~

1. Set your current namespace to the one used by the Operator. For example, to use the Operator's default namespace:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl config set-context --current --namespace=cockroach-operator-system
    ~~~

1. Validate that the Operator is running:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods
    ~~~

    ~~~
    NAME                                  READY   STATUS    RESTARTS   AGE
    cockroach-operator-6f7b86ffc4-9ppkv   1/1     Running   0          54s
    ~~~

### Initialize the cluster

1. Download `example.yaml`, a custom resource that tells the Operator how to configure the Kubernetes cluster.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ curl -O https://raw.githubusercontent.com/cockroachdb/cockroach-operator/{{site.operator_version}}/examples/example.yaml
    ~~~

    {{site.data.alerts.callout_info}}
    By default, this custom resource specifies CPU and memory resources that are appropriate for the virtual machines used in this deployment example. On a production cluster, you should substitute values that are appropriate for your machines and workload. For details on configuring your deployment, see [Configure the Cluster](configure-cockroachdb-kubernetes.html).
    {{site.data.alerts.end}}

    {{site.data.alerts.callout_info}}
    By default, the Operator will generate and sign 1 client and 1 node certificate to secure the cluster. This means that if you do not provide a CA, a `cockroach`-generated CA is used. To authenticate using your own CA, see [Secure the Cluster](secure-cockroachdb-kubernetes.html).
    {{site.data.alerts.end}}

1. Apply `example.yaml`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl apply -f example.yaml
    ~~~

    The Operator will create a StatefulSet and initialize the nodes as a cluster.

    ~~~
    crdbcluster.crdb.cockroachlabs.com/cockroachdb created
    ~~~

1. Check that the pods were created:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods
    ~~~

    ~~~
    NAME                                  READY   STATUS    RESTARTS   AGE
    cockroach-operator-6f7b86ffc4-9t9zb   1/1     Running   0          3m22s
    cockroachdb-0                         1/1     Running   0          2m31s
    cockroachdb-1                         1/1     Running   0          102s
    cockroachdb-2                         1/1     Running   0          46s
    ~~~

    Each pod should have `READY` status soon after being created.

    {{site.data.alerts.callout_info}}
    Due to a [known issue](https://github.com/cockroachdb/cockroach-operator/issues/575), in rare cases the Operator can crash while installing CockroachDB. This causes the CockroachDB pods to fail to start, while the version checker [job](https://kubernetes.io/docs/concepts/workloads/controllers/job/) continues to run. If this happens, run `kubectl get jobs` to find the names of any running `cockroachdb-vcheck` jobs, and delete these jobs with `kubectl delete job {cockroachdb-vcheck-job}`. Then reapply the custom resource (e.g., `kubectl apply -f example.yaml`).
    {{site.data.alerts.end}}
