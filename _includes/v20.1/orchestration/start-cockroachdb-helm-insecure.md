1. [Install the Helm client](https://helm.sh/docs/intro/install) (version 3.0 or higher) and add the `cockroachdb` chart repository:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ helm repo add cockroachdb https://charts.cockroachdb.com/
    ~~~

    ~~~
    "cockroachdb" has been added to your repositories
    ~~~

2. Update your Helm chart repositories to ensure that you're using the [latest CockroachDB chart](https://github.com/cockroachdb/helm-charts/blob/master/cockroachdb/Chart.yaml):

    {% include copy-clipboard.html %}
    ~~~ shell
    $ helm repo update
    ~~~

3. Modify our Helm chart's [`values.yaml`](https://github.com/cockroachdb/helm-charts/blob/master/cockroachdb/values.yaml) parameters for your deployment scenario.

    Create a `my-values.yaml` file to override the defaults in `values.yaml`, substituting your own values in this example based on the guidelines below.

    {% include copy-clipboard.html %}
    ~~~
    statefulset:
      resources:
        limits:
          memory: "8Gi"
        requests:
          memory: "8Gi"
    conf:
      cache: "2Gi"
      max-sql-memory: "2Gi"
    ~~~

    1. To avoid running out of memory when CockroachDB is not the only pod on a Kubernetes node, you *must* set memory limits explicitly. This is because CockroachDB does not detect the amount of memory allocated to its pod when run in Kubernetes. We recommend setting `conf.cache` and `conf.max-sql-memory` each to 1/4 of the `memory` allocation specified in `statefulset.resources.requests` and `statefulset.resources.limits`.

        {{site.data.alerts.callout_success}}
        For example, if you are allocating 8Gi of `memory` to each CockroachDB node, allocate 2Gi to `cache` and 2Gi to `max-sql-memory`.
        {{site.data.alerts.end}}

    2. You may want to modify `storage.persistentVolume.size` and `storage.persistentVolume.storageClass` for your use case. This chart defaults to 100Gi of disk space per pod. For more details on customizing disks for performance, see [these instructions](kubernetes-performance.html#disk-type).

        {{site.data.alerts.callout_info}}
        If necessary, you can [expand disk size](orchestrate-cockroachdb-with-kubernetes.html#expand-disk-size) after the cluster is live.
        {{site.data.alerts.end}}

4. Install the CockroachDB Helm chart. 

    Provide a "release" name to identify and track this particular deployment of the chart, and override the default values with those in `my-values.yaml`.

    {{site.data.alerts.callout_info}}
    This tutorial uses `my-release` as the release name. If you use a different value, be sure to adjust the release name in subsequent commands. Also be sure to start and end the name with an alphanumeric character and otherwise use lowercase alphanumeric characters, `-`, or `.` so as to comply with [CSR naming requirements](orchestrate-cockroachdb-with-kubernetes.html#csr-names).
    {{site.data.alerts.end}}

    {% include copy-clipboard.html %}
    ~~~ shell
    $ helm install my-release --values my-values.yaml cockroachdb/cockroachdb
    ~~~

    Behind the scenes, this command uses our `cockroachdb-statefulset.yaml` file to create the StatefulSet that automatically creates 3 pods, each with a CockroachDB node running inside it, where each pod has distinguishable network identity and always binds back to the same persistent storage on restart.

5. Confirm that CockroachDB cluster initialization has completed successfully, with the pods for CockroachDB showing `1/1` under `READY` and the pod for initialization showing `COMPLETED` under `STATUS`:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods
    ~~~

    ~~~
    NAME                                READY     STATUS      RESTARTS   AGE
    my-release-cockroachdb-0            1/1       Running     0          8m
    my-release-cockroachdb-1            1/1       Running     0          8m
    my-release-cockroachdb-2            1/1       Running     0          8m
    my-release-cockroachdb-init-hxzsc   0/1       Completed   0          1h
    ~~~

6. Confirm that the persistent volumes and corresponding claims were created successfully for all three pods:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pv
    ~~~

    ~~~
    NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS    CLAIM                                      STORAGECLASS   REASON    AGE
    pvc-71019b3a-fc67-11e8-a606-080027ba45e5   100Gi      RWO            Delete           Bound     default/datadir-my-release-cockroachdb-0   standard                 11m
    pvc-7108e172-fc67-11e8-a606-080027ba45e5   100Gi      RWO            Delete           Bound     default/datadir-my-release-cockroachdb-1   standard                 11m
    pvc-710dcb66-fc67-11e8-a606-080027ba45e5   100Gi      RWO            Delete           Bound     default/datadir-my-release-cockroachdb-2   standard                 11m    
    ~~~

{{site.data.alerts.callout_success}}
The StatefulSet configuration sets all CockroachDB nodes to log to `stderr`, so if you ever need access to a pod/node's logs to troubleshoot, use `kubectl logs <podname>` rather than checking the log on the persistent volume.
{{site.data.alerts.end}}
