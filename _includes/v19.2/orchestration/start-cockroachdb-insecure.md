1. From your local workstation, use our [`cockroachdb-statefulset.yaml`](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/cockroachdb-statefulset.yaml) file to create the StatefulSet that automatically creates 3 pods, each with a CockroachDB node running inside it.

    Download [`cockroachdb-statefulset.yaml`](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/cockroachdb-statefulset.yaml):

    {% include copy-clipboard.html %}
    ~~~ shell
    $ curl -O https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/cockroachdb-statefulset.yaml
    ~~~

    Specify the amount of memory to allocate to each CockroachDB node. Add a `resources.requests.memory` parameter inside the `containers` object in the config file:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ resources:
          requests:
            memory: "<your memory allocation>"
    ~~~    

    {{site.data.alerts.callout_danger}}
    To avoid running out of memory when CockroachDB is not the only pod on a Kubernetes node, you must set memory limits explicitly. This is because CockroachDB does not detect the amount of memory allocated to its pod when run in Kubernetes.

    We recommend setting `CacheSize` and `MaxSQLMemory` each to 1/4 of the memory specified in your `resources.requests.memory` parameter. For example, if you are allocating 8GiB of memory to each CockroachDB node, substitute the following values in [this line](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/cockroachdb-statefulset.yaml#L131) of `cockroachdb-statefulset.yaml`:
    {{site.data.alerts.end}}

    {% include copy-clipboard.html %}
    ~~~ shell
    --cache 2GiB --max-sql-memory 2GiB
    ~~~

    ~~~
    service "cockroachdb-public" created
    service "cockroachdb" created
    poddisruptionbudget "cockroachdb-budget" created
    statefulset "cockroachdb" created
    ~~~

    Alternatively, if you'd rather start with a configuration file that has been customized for performance:

    1. Download our [performance version of `cockroachdb-statefulset-insecure.yaml`](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/performance/cockroachdb-statefulset-insecure.yaml):

        {% include copy-clipboard.html %}
        ~~~ shell
        $ curl -O https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/performance/cockroachdb-statefulset-insecure.yaml
        ~~~

    2. Modify the file wherever there is a `TODO` comment.

    3. Use the file to create the StatefulSet and start the cluster:

        {% include copy-clipboard.html %}
        ~~~ shell
        $ kubectl create -f cockroachdb-statefulset-insecure.yaml
        ~~~

2. Confirm that three pods are `Running` successfully. Note that they will not
   be considered `Ready` until after the cluster has been initialized:

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

3. Confirm that the persistent volumes and corresponding claims were created successfully for all three pods:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get persistentvolumes
    ~~~

    ~~~
    NAME                                       CAPACITY   ACCESSMODES   RECLAIMPOLICY   STATUS    CLAIM                           REASON    AGE
    pvc-52f51ecf-8bd5-11e6-a4f4-42010a800002   1Gi        RWO           Delete          Bound     default/datadir-cockroachdb-0             26s
    pvc-52fd3a39-8bd5-11e6-a4f4-42010a800002   1Gi        RWO           Delete          Bound     default/datadir-cockroachdb-1             27s
    pvc-5315efda-8bd5-11e6-a4f4-42010a800002   1Gi        RWO           Delete          Bound     default/datadir-cockroachdb-2             27s
    ~~~

4. Use our [`cluster-init.yaml`](https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/cluster-init.yaml) file to perform a one-time initialization that joins the nodes into a single cluster:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl create \
    -f https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/cluster-init.yaml
    ~~~

    ~~~
    job "cluster-init" created
    ~~~

5. Confirm that cluster initialization has completed successfully. The job
   should be considered successful and the CockroachDB pods should soon be
   considered `Ready`:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get job cluster-init
    ~~~

    ~~~
    NAME           DESIRED   SUCCESSFUL   AGE
    cluster-init   1         1            2m
    ~~~

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

{{site.data.alerts.callout_success}}
The StatefulSet configuration sets all CockroachDB nodes to log to `stderr`, so if you ever need access to a pod/node's logs to troubleshoot, use `kubectl logs <podname>` rather than checking the log on the persistent volume.
{{site.data.alerts.end}}
