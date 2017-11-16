1. Use our [`cluster-init.yaml`](https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/cluster-init.yaml) file to perform a one-time initialization that joins the nodes into a single cluster:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl create -f https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/cluster-init.yaml
    ~~~

    ~~~
    job "cluster-init" created
    ~~~

2. Confirm that cluster initialization has completed successfully:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get job cluster-init
    ~~~

    ~~~
    NAME           DESIRED   SUCCESSFUL   AGE
    cluster-init   1         1            19m
    ~~~

{{site.data.alerts.callout_success}}The StatefulSet configuration sets all CockroachDB nodes to write to <code>stderr</code>, so if you ever need access to a pod/node's logs to troubleshoot, use <code>kubectl logs &lt;podname&gt;</code> rather than checking the log on the persistent volume.{{site.data.alerts.end}}
