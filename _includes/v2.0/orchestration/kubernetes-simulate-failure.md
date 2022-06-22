Based on the `replicas: 3` line in the StatefulSet configuration, Kubernetes ensures that three pods/nodes are running at all times. When a pod/node fails, Kubernetes automatically creates another pod/node with the same network identity and persistent storage.

To see this in action:

1. Terminate one of the CockroachDB nodes:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl delete pod cockroachdb-2
    ~~~

    ~~~
    pod "cockroachdb-2" deleted
    ~~~

2. In the Admin UI, the **Summary** panel will soon show one node as **Suspect**. As Kubernetes auto-restarts the node, watch how the node once again becomes healthy.

3. Back in the terminal, verify that the pod was automatically restarted:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pod cockroachdb-2
    ~~~

    ~~~
    NAME            READY     STATUS    RESTARTS   AGE
    cockroachdb-2   1/1       Running   0          12s
    ~~~
