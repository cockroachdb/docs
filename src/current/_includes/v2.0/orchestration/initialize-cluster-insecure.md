1. Use our [`cluster-init.yaml`](https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/cluster-init.yaml) file to perform a one-time initialization that joins the nodes into a single cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl create -f https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/cluster-init.yaml
    ~~~

    ~~~
    job "cluster-init" created
    ~~~

2. Confirm that cluster initialization has completed successfully. The job
   should be considered successful and the CockroachDB pods should soon be
   considered `Ready`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get job cluster-init
    ~~~

    ~~~
    NAME           DESIRED   SUCCESSFUL   AGE
    cluster-init   1         1            2m
    ~~~

    {% include_cached copy-clipboard.html %}
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
