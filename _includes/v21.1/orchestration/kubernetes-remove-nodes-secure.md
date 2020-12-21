Before removing a node from your cluster, you must first decommission the node. This lets a node finish in-flight requests, rejects any new requests, and transfers all range replicas and range leases off the node.

{{site.data.alerts.callout_danger}}
If you remove nodes without first telling CockroachDB to decommission them, you may cause data or even cluster unavailability. For more details about how this works and what to consider before removing nodes, see [Decommission Nodes](remove-nodes.html).
{{site.data.alerts.end}}

{{site.data.alerts.callout_danger}}
Do **not** scale down to fewer than 3 nodes. This is considered an anti-pattern on CockroachDB and will cause errors.
{{site.data.alerts.end}}

<section class="filter-content" markdown="1" data-scope="operator">
1. Get a shell into one of the pods and use the [`cockroach node status`](cockroach-node.html) command to get the internal IDs of nodes:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl exec -it cockroachdb-2 \
    -- ./cockroach node status \
    --certs-dir cockroach-certs
    ~~~

    ~~~
      id |                 address                 |               sql_address               |  build  |            started_at            |            updated_at            | locality | is_available | is_live
    -----+-----------------------------------------+-----------------------------------------+---------+----------------------------------+----------------------------------+----------+--------------+----------
       1 | cockroachdb-0.cockroachdb.default:26257 | cockroachdb-0.cockroachdb.default:26257 | v20.1.4 | 2020-10-22 23:02:10.084425+00:00 | 2020-10-27 20:18:22.117115+00:00 |          | true         | true
       2 | cockroachdb-1.cockroachdb.default:26257 | cockroachdb-1.cockroachdb.default:26257 | v20.1.4 | 2020-10-22 23:02:46.533911+00:00 | 2020-10-27 20:18:22.558333+00:00 |          | true         | true
       3 | cockroachdb-2.cockroachdb.default:26257 | cockroachdb-2.cockroachdb.default:26257 | v20.1.4 | 2020-10-26 21:46:38.90803+00:00  | 2020-10-27 20:18:22.601021+00:00 |          | true         | true
       4 | cockroachdb-3.cockroachdb.default:26257 | cockroachdb-3.cockroachdb.default:26257 | v20.1.4 | 2020-10-27 19:54:04.714241+00:00 | 2020-10-27 20:18:22.74559+00:00  |          | true         | true
    (4 rows)
~~~

1. Use the [`cockroach node decommission`](cockroach-node.html) command to decommission the node with the highest number in its address (in this case, the address including `cockroachdb-3`):

    {{site.data.alerts.callout_info}}
    It's important to decommission the node with the highest number in its address because, when you reduce the replica count, Kubernetes will remove the pod for that node.
    {{site.data.alerts.end}}

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl exec -it cockroachdb-3 \
    -- ./cockroach node decommission \
    --self \
    --certs-dir cockroach-certs \
    --host=<address of node to decommission>
    ~~~

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

1. Once the node has been decommissioned, open and edit `example.yaml`.

    {% include copy-clipboard.html %}
    ~~~ shell
    $ vi example.yaml
    ~~~

1. In `example.yaml`, update the number of `nodes`:

    ~~~
    nodes: 3
    ~~~

1. Apply `example.yaml` with the new configuration:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl apply -f example.yaml
    ~~~

    The Operator will remove the node with the highest number in its address (in this case, the address including `cockroachdb-3`) from the cluster.

1. Verify that the pod was successfully removed:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods
    ~~~

    ~~~
    NAME                        READY     STATUS    RESTARTS   AGE
    cockroachdb-0               1/1       Running   0          51m
    cockroachdb-1               1/1       Running   0          47m
    cockroachdb-2               1/1       Running   0          3m
    ...
    ~~~
</section>

<section class="filter-content" markdown="1" data-scope="manual">
1. Get a shell into the `cockroachdb-client-secure` pod you created earlier and use the [`cockroach node status`](cockroach-node.html) command to get the internal IDs of nodes:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl exec -it cockroachdb-client-secure \
    -- ./cockroach node status \
    --certs-dir=/cockroach-certs \
    --host=cockroachdb-public
    ~~~

    ~~~
      id |               address                                     | build  |            started_at            |            updated_at            | is_available | is_live
    +----+---------------------------------------------------------------------------------+--------+----------------------------------+----------------------------------+--------------+---------+
       1 | cockroachdb-0.cockroachdb.default.svc.cluster.local:26257 | {{page.release_info.version}} | 2018-11-29 16:04:36.486082+00:00 | 2018-11-29 18:24:24.587454+00:00 | true         | true
       2 | cockroachdb-2.cockroachdb.default.svc.cluster.local:26257 | {{page.release_info.version}} | 2018-11-29 16:55:03.880406+00:00 | 2018-11-29 18:24:23.469302+00:00 | true         | true
       3 | cockroachdb-1.cockroachdb.default.svc.cluster.local:26257 | {{page.release_info.version}} | 2018-11-29 16:04:41.383588+00:00 | 2018-11-29 18:24:25.030175+00:00 | true         | true
       4 | cockroachdb-3.cockroachdb.default.svc.cluster.local:26257 | {{page.release_info.version}} | 2018-11-29 17:31:19.990784+00:00 | 2018-11-29 18:24:26.041686+00:00 | true         | true
    (4 rows)
    ~~~

    The pod uses the `root` client certificate created earlier to initialize the cluster, so there's no CSR approval required.

1. Note the ID of the node with the highest number in its address (in this case, the address including `cockroachdb-3`) and use the [`cockroach node decommission`](cockroach-node.html) command to decommission it:

    {{site.data.alerts.callout_info}}
    It's important to decommission the node with the highest number in its address because, when you reduce the replica count, Kubernetes will remove the pod for that node.
    {{site.data.alerts.end}}

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl exec -it cockroachdb-client-secure \
    -- ./cockroach node decommission <node ID> \
    --certs-dir=/cockroach-certs \
    --host=cockroachdb-public
    ~~~

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

1. Once the node has been decommissioned, scale down your StatefulSet:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl scale statefulset cockroachdb --replicas=3
    ~~~

    ~~~
    statefulset.apps/cockroachdb scaled
    ~~~

1. Verify that the pod was successfully removed:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pods
    ~~~

    ~~~
    NAME                        READY     STATUS    RESTARTS   AGE
    cockroachdb-0               1/1       Running   0          51m
    cockroachdb-1               1/1       Running   0          47m
    cockroachdb-2               1/1       Running   0          3m
    cockroachdb-client-secure   1/1       Running   0          15m
    ...
    ~~~
</section>

<section class="filter-content" markdown="1" data-scope="helm">
1. Get a shell into the `cockroachdb-client-secure` pod you created earlier and use the [`cockroach node status`](cockroach-node.html) command to get the internal IDs of nodes:

    {% include copy-clipboard.html %}
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

1. Note the ID of the node with the highest number in its address (in this case, the address including `cockroachdb-3`) and use the [`cockroach node decommission`](cockroach-node.html) command to decommission it:

    {{site.data.alerts.callout_info}}
    It's important to decommission the node with the highest number in its address because, when you reduce the replica count, Kubernetes will remove the pod for that node.
    {{site.data.alerts.end}}

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl exec -it cockroachdb-client-secure \
    -- ./cockroach node decommission <node ID> \
    --certs-dir=/cockroach-certs \
    --host=my-release-cockroachdb-public
    ~~~    

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

1. Once the node has been decommissioned, scale down your StatefulSet:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ helm upgrade \
    my-release \
    cockroachdb/cockroachdb \
    --set statefulset.replicas=3 \
    --reuse-values
    ~~~

1. Verify that the pod was successfully removed:

    {% include copy-clipboard.html %}
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
</section>