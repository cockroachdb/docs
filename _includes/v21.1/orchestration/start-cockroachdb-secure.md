{% comment %}
<!-- ### Create a CockroachDB namespace

1. Create a `cockroachdb` namespace. You will create the CockroachDB cluster in this namespace:

  {% include copy-clipboard.html %}
  ~~~ shell
  kubectl create namespace cockroachdb
  ~~~

  ~~~
  namespace/cockroachdb created
  ~~~

1. Set `cockroachdb` as the default namespace:

  {% include copy-clipboard.html %}
  ~~~ shell
  kubectl config set-context --current --namespace=cockroachdb
  ~~~

  ~~~
  Context "admin" modified.
  ~~~

  Validate that this was successful:

  {% include copy-clipboard.html %}
  ~~~ shell
  kubectl config view --minify | grep namespace:
  ~~~

  ~~~
  namespace: cockroachdb
  ~~~

  This lets you issue `kubectl` commands without having to specify the namespace each time. -->
{% endcomment %}

### Configure the cluster

1. Download and modify our StatefulSet configuration:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ curl -O https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/bring-your-own-certs/cockroachdb-statefulset.yaml
    ~~~

1. Add a [`--locality`](cockroach-start.html#locality) flag to the `cockroach start` command to specify a `region` for your CockroachDB nodes. This is an arbitrary string, but should correspond to the region you configured in [Step 1](#step-1-start-kubernetes). For example:

  {% include copy-clipboard.html %}
  ~~~ yaml
  command:
    - exec:
      /cockroach/cockroach
      start
      --locality=region=us-east1
  ~~~

  {{site.data.alerts.callout_info}}
  The `region` value is required when specifying `--locality`. For more information, see the [Locality](cockroach-start.html#locality) flag documentation.
  {{site.data.alerts.end}}

1. Update `secretName` with the name of the corresponding client secret.

  The secret names depend on your method for generating secrets. For example, if you follow the below [steps using `cockroach cert`](#create-certificates), use this secret name:

  ~~~ yaml
  secret:
    secretName: cockroachdb.node
  ~~~

{{site.data.alerts.callout_info}}
By default, this manifest specifies CPU and memory resources that are appropriate for the virtual machines used in this deployment example. On a production cluster, you should substitute values that are appropriate for your machines and workload. For details on configuring your deployment, see [Operate CockroachDB on Kubernetes](kubernetes-operation.html?filters=manual).
{{site.data.alerts.end}}

{{site.data.alerts.callout_success}}
If you change the StatefulSet name from the default `cockroachdb`, be sure to start and end with an alphanumeric character and otherwise use lowercase alphanumeric characters, `-`, or `.` so as to comply with [CSR naming requirements](orchestrate-cockroachdb-with-kubernetes.html#csr-names).
{{site.data.alerts.end}}

### Create certificates

{{site.data.alerts.callout_success}}
The StatefulSet configuration sets all CockroachDB nodes to log to `stderr`, so if you ever need access to a pod/node's logs to troubleshoot, use `kubectl logs <podname>` rather than checking the log on the persistent volume.
{{site.data.alerts.end}}

{% include {{ page.version.version }}/orchestration/kubernetes-cockroach-cert.md %}

### Initialize the cluster

1. Use the config file you downloaded to create the StatefulSet that automatically creates 3 pods, each running a CockroachDB node:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl create -f cockroachdb-statefulset.yaml
    ~~~

    ~~~
    serviceaccount/cockroachdb created
    role.rbac.authorization.k8s.io/cockroachdb created
    rolebinding.rbac.authorization.k8s.io/cockroachdb created
    service/cockroachdb-public created
    service/cockroachdb created
    poddisruptionbudget.policy/cockroachdb-budget created
    statefulset.apps/cockroachdb created
    ~~~

1. Initialize the CockroachDB cluster:

    1. Confirm that three pods are `Running` successfully. Note that they will not be considered `Ready` until after the cluster has been initialized:

        {% include copy-clipboard.html %}
        ~~~ shell
        $ kubectl get pods
        ~~~

        ~~~
        NAME            READY     STATUS    RESTARTS   AGE
        cockroachdb-0   0/1       Running   0          2m
        cockroachdb-1   0/1       Running   0          2m
        cockroachdb-2   0/1       Running   0          2m
        ~~~

    1. Confirm that the persistent volumes and corresponding claims were created successfully for all three pods:

        {% include copy-clipboard.html %}
        ~~~ shell
        $ kubectl get pv
        ~~~

        ~~~
        NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                           STORAGECLASS   REASON   AGE
        pvc-9e435563-fb2e-11e9-a65c-42010a8e0fca   100Gi      RWO            Delete           Bound    default/datadir-cockroachdb-0   standard                51m
        pvc-9e47d820-fb2e-11e9-a65c-42010a8e0fca   100Gi      RWO            Delete           Bound    default/datadir-cockroachdb-1   standard                51m
        pvc-9e4f57f0-fb2e-11e9-a65c-42010a8e0fca   100Gi      RWO            Delete           Bound    default/datadir-cockroachdb-2   standard                51m
        ~~~

    1. Run `cockroach init` on one of the pods to complete the node startup process and have them join together as a cluster:

        {% include copy-clipboard.html %}
        ~~~ shell
        $ kubectl exec -it cockroachdb-0 \
        -- /cockroach/cockroach init \
        --certs-dir=/cockroach/cockroach-certs
        ~~~

        ~~~
        Cluster successfully initialized
        ~~~

    1. Confirm that cluster initialization has completed successfully. The job should be considered successful and the Kubernetes pods should soon be considered `Ready`:

        {% include copy-clipboard.html %}
        ~~~ shell
        $ kubectl get pods
        ~~~

        ~~~
        NAME            READY     STATUS    RESTARTS   AGE
        cockroachdb-0   1/1       Running   0          3m
        cockroachdb-1   1/1       Running   0          3m
        cockroachdb-2   1/1       Running   0          3m
        ~~~