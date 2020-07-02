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

3. Install the CockroachDB Helm chart. 

    Provide a "release" name to identify and track this particular deployment of the chart.

    {{site.data.alerts.callout_info}}
    This tutorial uses `my-release` as the release name. If you use a different value, be sure to adjust the release name in subsequent commands. Also be sure to start and end the name with an alphanumeric character and otherwise use lowercase alphanumeric characters, `-`, or `.` so as to comply with [CSR naming requirements](orchestrate-cockroachdb-with-kubernetes.html#csr-names).
    {{site.data.alerts.end}}

    {% include copy-clipboard.html %}
    ~~~ shell
    $ helm install my-release cockroachdb/cockroachdb
    ~~~

    Behind the scenes, this command uses our `cockroachdb-statefulset.yaml` file to create the StatefulSet that automatically creates 3 pods, each with a CockroachDB node running inside it, where each pod has distinguishable network identity and always binds back to the same persistent storage on restart.

4. Confirm that CockroachDB cluster initialization has completed successfully, with the pods for CockroachDB showing `1/1` under `READY` and the pod for initialization showing `COMPLETED` under `STATUS`:

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

5. Confirm that the persistent volumes and corresponding claims were created successfully for all three pods:

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
