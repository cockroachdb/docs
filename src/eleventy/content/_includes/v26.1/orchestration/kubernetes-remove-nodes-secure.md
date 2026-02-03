To safely remove a node from your cluster, you must first decommission the node and only then adjust the `--replicas` value of your StatefulSet configuration to permanently remove it. This sequence is important because the decommissioning process lets a node finish in-flight requests, rejects any new requests, and transfers all range replicas and range leases off the node.

{{site.data.alerts.callout_danger}}
If you remove nodes without first telling CockroachDB to decommission them, you may cause data or even cluster unavailability. For more details about how this works and what to consider before removing nodes, see [Decommission Nodes](remove-nodes.html).
{{site.data.alerts.end}}

1. Get a shell into the `cockroachdb-client-secure` pod you created earlier and use the `cockroach node status` command to get the internal IDs of nodes:

    <section class="filter-content" markdown="1" data-scope="manual">
    ~~~ shell
    $ kubectl exec -it cockroachdb-client-secure -- ./cockroach node status --certs-dir=/cockroach-certs --host=cockroachdb-public
    ~~~

    ~~~
      id |               address                                     | build  |            started_at            |            updated_at            | is_available | is_live
    +----+---------------------------------------------------------------------------------+--------+----------------------------------+----------------------------------+--------------+---------+
       1 | cockroachdb-0.cockroachdb.default.svc.cluster.local:26257 | v2.1.1 | 2018-11-29 16:04:36.486082+00:00 | 2018-11-29 18:24:24.587454+00:00 | true         | true
       2 | cockroachdb-2.cockroachdb.default.svc.cluster.local:26257 | v2.1.1 | 2018-11-29 16:55:03.880406+00:00 | 2018-11-29 18:24:23.469302+00:00 | true         | true
       3 | cockroachdb-1.cockroachdb.default.svc.cluster.local:26257 | v2.1.1 | 2018-11-29 16:04:41.383588+00:00 | 2018-11-29 18:24:25.030175+00:00 | true         | true
       4 | cockroachdb-3.cockroachdb.default.svc.cluster.local:26257 | v2.1.1 | 2018-11-29 17:31:19.990784+00:00 | 2018-11-29 18:24:26.041686+00:00 | true         | true
    (4 rows)
    ~~~
    </section>

    <section class="filter-content" markdown="1" data-scope="helm">
    ~~~ shell
    $ kubectl exec -it cockroachdb-client-secure -- ./cockroach node status --certs-dir=/cockroach-certs --host=my-release-cockroachdb-public
    ~~~    

    ~~~
      id |                                     address                                     | build  |            started_at            |            updated_at            | is_available | is_live
    +----+---------------------------------------------------------------------------------+--------+----------------------------------+----------------------------------+--------------+---------+
       1 | my-release-cockroachdb-0.my-release-cockroachdb.default.svc.cluster.local:26257 | v2.1.1 | 2018-11-29 16:04:36.486082+00:00 | 2018-11-29 18:24:24.587454+00:00 | true         | true
       2 | my-release-cockroachdb-2.my-release-cockroachdb.default.svc.cluster.local:26257 | v2.1.1 | 2018-11-29 16:55:03.880406+00:00 | 2018-11-29 18:24:23.469302+00:00 | true         | true
       3 | my-release-cockroachdb-1.my-release-cockroachdb.default.svc.cluster.local:26257 | v2.1.1 | 2018-11-29 16:04:41.383588+00:00 | 2018-11-29 18:24:25.030175+00:00 | true         | true
       4 | my-release-cockroachdb-3.my-release-cockroachdb.default.svc.cluster.local:26257 | v2.1.1 | 2018-11-29 17:31:19.990784+00:00 | 2018-11-29 18:24:26.041686+00:00 | true         | true
    (4 rows)
    ~~~
    </section>

    The pod uses the `root` client certificate created earlier to initialize the cluster, so there's no CSR approval required.

2. Note the ID of the node with the highest number in its address (in this case, the address including `cockroachdb-3`) and use the [`cockroach node decommission`](view-node-details.html) command to decommission it:

    {{site.data.alerts.callout_info}}
    It's important to decommission the node with the highest number in its address because, when you reduce the `--replica` count, Kubernetes will remove the pod for that node.
    {{site.data.alerts.end}}

    <section class="filter-content" markdown="1" data-scope="manual">
    ~~~ shell
    $ kubectl exec -it cockroachdb-client-secure -- ./cockroach node decommission <node ID> --insecure --host=cockroachdb-public
    ~~~
    </section>

    <section class="filter-content" markdown="1" data-scope="helm">
    ~~~ shell
    $ kubectl exec -it cockroachdb-client-secure -- ./cockroach node decommission <node ID> --insecure --host=my-release-cockroachdb-public
    ~~~    
    </section>

    You'll then see the decommissioning status print to `stderr` as it changes:

    ~~~
     id | is_live | replicas | is_decommissioning | is_draining  
    +---+---------+----------+--------------------+-------------+
      4 |  true   |       73 |        true        |    false     
    (1 row)
    ~~~

    Once the node has been fully decommissioned and stopped, you'll see a confirmation:

    ~~~
     id | is_live | replicas | is_decommissioning | is_draining  
    +---+---------+----------+--------------------+-------------+
      4 |  true   |        0 |        true        |    false     
    (1 row)

    No more data reported on target nodes. Please verify cluster health before removing the nodes.
    ~~~

3. Once the node has been decommissioned, use the `kubectl scale` command to remove a pod from your StatefulSet:

    <section class="filter-content" markdown="1" data-scope="manual">
    ~~~ shell
    $ kubectl scale statefulset cockroachdb --replicas=3
    ~~~

    ~~~
    statefulset "cockroachdb" scaled
    ~~~
    </section>

    <section class="filter-content" markdown="1" data-scope="helm">
    ~~~ shell
    $ kubectl scale statefulset my-release-cockroachdb --replicas=3
    ~~~

    ~~~
    statefulset "my-release-cockroachdb" scaled
    ~~~
    </section>
