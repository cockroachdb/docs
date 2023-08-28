Before removing a node from your cluster, you must first decommission the node. This lets a node finish in-flight requests, rejects any new requests, and transfers all range replicas and range leases off the node.

{{site.data.alerts.callout_danger}}
If you remove nodes without first telling CockroachDB to decommission them, you may cause data or even cluster unavailability. For more details about how this works and what to consider before removing nodes, see [Prepare for graceful shutdown](node-shutdown.html?filters=decommission#prepare-for-graceful-shutdown).
{{site.data.alerts.end}}

1. Use the [`cockroach node status`]({% link {{ page.version.version }}/cockroach-node.md %}) command to get the internal IDs of nodes. For example, if you followed the steps in [Deploy CockroachDB with Kubernetes]({% link {{ page.version.version }}/deploy-cockroachdb-with-kubernetes.md %}#step-3-use-the-built-in-sql-client) to launch a secure client pod, get a shell into the `cockroachdb-client-secure` pod:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl exec -it cockroachdb-client-secure \
    -- ./cockroach node status \
    --certs-dir=/cockroach-certs \
    --host=my-release-cockroachdb-public
    ~~~    

    ~~~
      id |                                     address                                     | build  |            started_at            |            updated_at            | is_available | is_live
    +----+---------------------------------------------------------------------------------+--------+----------------------------------+----------------------------------+--------------+---------+
       1 | my-release-cockroachdb-0.my-release-cockroachdb.default.svc.cluster.local:26257 | {{page.release_info.version}} | 2018-11-29 16:04:36.486082+00:00 | 2018-11-29 18:24:24.587454+00:00 | true         | true
       2 | my-release-cockroachdb-2.my-release-cockroachdb.default.svc.cluster.local:26257 | {{page.release_info.version}} | 2018-11-29 16:55:03.880406+00:00 | 2018-11-29 18:24:23.469302+00:00 | true         | true
       3 | my-release-cockroachdb-1.my-release-cockroachdb.default.svc.cluster.local:26257 | {{page.release_info.version}} | 2018-11-29 16:04:41.383588+00:00 | 2018-11-29 18:24:25.030175+00:00 | true         | true
       4 | my-release-cockroachdb-3.my-release-cockroachdb.default.svc.cluster.local:26257 | {{page.release_info.version}} | 2018-11-29 17:31:19.990784+00:00 | 2018-11-29 18:24:26.041686+00:00 | true         | true
    (4 rows)
    ~~~

    The pod uses the `root` client certificate created earlier to initialize the cluster, so there's no CSR approval required.

1. Use the [`cockroach node decommission`]({% link {{ page.version.version }}/cockroach-node.md %}) command to decommission the node with the highest number in its address, specifying its ID (in this example, node ID `4` because its address is `my-release-cockroachdb-3`):

    {{site.data.alerts.callout_info}}
    You must decommission the node with the highest number in its address. Kubernetes will remove the pod for the node with the highest number in its address when you reduce the replica count.
    {{site.data.alerts.end}}

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl exec -it cockroachdb-client-secure \
    -- ./cockroach node decommission 4 \
    --certs-dir=/cockroach-certs \
    --host=my-release-cockroachdb-public
    ~~~    

    You'll then see the decommissioning status print to `stderr` as it changes:

    ~~~
      id | is_live | replicas | is_decommissioning |   membership    | is_draining
    -----+---------+----------+--------------------+-----------------+--------------
       4 |  true   |       73 |        true        | decommissioning |    false    
    ~~~

    Once the node has been fully decommissioned, you'll see a confirmation:

    ~~~
      id | is_live | replicas | is_decommissioning |   membership    | is_draining
    -----+---------+----------+--------------------+-----------------+--------------
       4 |  true   |        0 |        true        | decommissioning |    false    
    (1 row)

    No more data reported on target nodes. Please verify cluster health before removing the nodes.
    ~~~

1. Once the node has been decommissioned, scale down your StatefulSet:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ helm upgrade \
    my-release \
    cockroachdb/cockroachdb \
    --set statefulset.replicas=3 \
    --reuse-values
    ~~~

1. Verify that the pod was successfully removed:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods
    ~~~

    ~~~
    NAME                        READY     STATUS    RESTARTS   AGE
    my-release-cockroachdb-0    1/1       Running   0          51m
    my-release-cockroachdb-1    1/1       Running   0          47m
    my-release-cockroachdb-2    1/1       Running   0          3m
    cockroachdb-client-secure   1/1       Running   0          15m
    ...
    ~~~

1. You should also remove the persistent volume that was mounted to the pod. Get the persistent volume claims for the volumes:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pvc
    ~~~

    ~~~
    NAME                               STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
    datadir-my-release-cockroachdb-0   Bound    pvc-75dadd4c-01a1-11ea-b065-42010a8e00cb   100Gi      RWO            standard       17m
    datadir-my-release-cockroachdb-1   Bound    pvc-75e143ca-01a1-11ea-b065-42010a8e00cb   100Gi      RWO            standard       17m
    datadir-my-release-cockroachdb-2   Bound    pvc-75ef409a-01a1-11ea-b065-42010a8e00cb   100Gi      RWO            standard       17m
    datadir-my-release-cockroachdb-3   Bound    pvc-75e561ba-01a1-11ea-b065-42010a8e00cb   100Gi      RWO            standard       17m
    ~~~

1. Verify that the PVC with the highest number in its name is no longer mounted to a pod:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl describe pvc datadir-my-release-cockroachdb-3
    ~~~

    ~~~
    Name:          datadir-my-release-cockroachdb-3
    ...
    Mounted By:    <none>
    ~~~

1. Remove the persistent volume by deleting the PVC:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl delete pvc datadir-my-release-cockroachdb-3
    ~~~

    ~~~
    persistentvolumeclaim "datadir-my-release-cockroachdb-3" deleted
    ~~~