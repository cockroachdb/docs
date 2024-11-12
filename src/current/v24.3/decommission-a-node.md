---
title: Decommission a node
summary: Learn how to decommission a node and permanently remove it from your cluster.
toc: true
docs_area: manage
---

This page shows how to decommission a node and permanently remove it from your cluster. To temporarily shut down a node for maintenance instead, refer to [Drain a node]({% link {{ page.version.version }}/drain-a-node.md %}). For details about how decommissioning and draining work, refer to [Node shutdown]({% link {{ page.version.version }}/node-shutdown.md %}).

## Prepare to decommission a node

Review the following sections before decommissioning a node and make adjustments as required.

### Load balancing

{% include common/shutdown/load-balancing.md %}

### Cluster settings

{% include common/shutdown/cluster-settings.md %}

### Size and replication factor

Before decommissioning a node, make sure other nodes are available to take over the range replicas from the node. If fewer nodes are available than the replication factor, CockroachDB will automatically reduce the replication factor (for example, from 5 to 3) to try to allow the decommission to succeed. However, the replication factor will not be reduced lower than 3. If three nodes are not available, the decommissioning process will hang indefinitely until nodes are added or you update the zone configurations to use a replication factor of 1.

Note that when you decommission a node and immediately add another node, CockroachDB does **not** simply move all of the replicas from the decommissioned node to the newly added node. Instead, replicas are placed across all nodes in the cluster. This speeds up the decommissioning process by spreading the load. The new node will eventually "catch up" with the rest of the cluster.

This can lead to disk utilization imbalance across nodes. **This is expected behavior**, since disk utilization per node is not one of the rebalancing criteria. For more information, see [Disk utilization is different across nodes in the cluster]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#disk-utilization-is-different-across-nodes-in-the-cluster).

#### 3-node cluster with 3-way replication

In this scenario, each range is replicated 3 times, with each replica on a different node:

<div style="text-align: center;"><img src="{{ 'images/v24.1/decommission-scenario1.1.png' | relative_url }}" alt="Decommission Scenario 1" style="max-width:50%" /></div>

If you try to decommission a node, the process will hang indefinitely because the cluster cannot move the decommissioning node's replicas to the other 2 nodes, which already have a replica of each range:

<div style="text-align: center;"><img src="{{ 'images/v24.1/decommission-scenario1.2.png' | relative_url }}" alt="Decommission Scenario 1" style="max-width:50%" /></div>

To successfully decommission a node in this cluster, you need to **add a 4th node**. The decommissioning process can then complete:

<div style="text-align: center;"><img src="{{ 'images/v24.1/decommission-scenario1.3.png' | relative_url }}" alt="Decommission Scenario 1" style="max-width:50%" /></div>

#### 5-node cluster with 3-way replication

In this scenario, like in the scenario above, each range is replicated 3 times, with each replica on a different node:

<div style="text-align: center;"><img src="{{ 'images/v24.1/decommission-scenario2.1.png' | relative_url }}" alt="Decommission Scenario 1" style="max-width:50%" /></div>

If you decommission a node, the process will run successfully because the cluster will be able to move the node's replicas to other nodes without doubling up any range replicas:

<div style="text-align: center;"><img src="{{ 'images/v24.1/decommission-scenario2.2.png' | relative_url }}" alt="Decommission Scenario 1" style="max-width:50%" /></div>

## Decommission a node

Follow these steps to decommission a node and remove it from your cluster. **Decommission only one node at a time**.

{{site.data.alerts.callout_success}}
This guidance applies to manual deployments. In a Kubernetes deployment or a CockroachDB {{ site.data.products.advanced }} cluster, terminating the `cockroach` process is handled through Kubernetes. Refer to [Decommissioning on Kubernetes](#decommissioning-on-kubernetes) and [Decommissioning on CockroachDB {{ site.data.products.advanced }}](#decommissioning-on-cockroachdb-advanced).
{{site.data.alerts.end}}

1. Optionally, manually [drain the node]({% link {{ page.version.version }}/drain-a-node.md %}). When you decommission a node, it is drained automatically. However, we recommend first running [`cockroach node drain`]({% link {{ page.version.version }}/cockroach-node.md %}) to manually drain the node of active queries, SQL client connections, and leases to prevent possible disruptions in query performance.
1. Run [`cockroach node decommission`]({% link {{ page.version.version }}/cockroach-node.md %}) to decommission the node and rebalance its range replicas. For specific instructions and additional guidelines, see the [example](#remove-nodes).

    If the rebalancing stalls during decommissioning, replicas that have yet to move are printed to the [SQL shell]({% link {{ page.version.version }}/cockroach-sql.md %}) and written to the [`OPS` logging channel]({% link {{ page.version.version }}/logging-overview.md %}#logging-channels) with the message `possible decommission stall detected`. [By default]({% link {{ page.version.version }}/configure-logs.md %}#default-logging-configuration), the `OPS` channel logs output to a `cockroach.log` file.

    {{site.data.alerts.callout_danger}}
    Do **not** terminate the node process, delete the storage volume, or remove the VM before a `decommissioning` node has [changed its membership status]({% link {{ page.version.version }}/node-shutdown.md %}#draining-phases) to `decommissioned`. Prematurely terminating the process will prevent the node from rebalancing all of its range replicas onto other nodes gracefully, cause transient query errors in client applications, and leave the remaining ranges under-replicated and vulnerable to loss of [quorum]({% link {{ page.version.version }}/architecture/replication-layer.md %}#overview) if another node goes down.
    {{site.data.alerts.end}}

    {% include {{page.version.version}}/prod-deployment/decommission-pre-flight-checks.md %}

1. If the node's status does not change to `decommissioning`, the decommission operation may be stalled. If a node is stuck in a `decommissioning` state, a subsequent attempt to scale the cluster down or [perform a major-version cluster upgrade]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}) will fail. In most cases, issuing the decommission command a second time succeeds.
1. Terminate the node process.

The node is now decommissioned. If necessary, repeat these steps to decommission additional nodes, one at a time.

## Monitor shutdown progress

The status of a decommissioning operation is reflected in the [`cockroach node status --decommission`]({% link {{ page.version.version }}/cockroach-node.md %}) output:

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach node status --decommission --certs-dir=certs --host={address of any live node}
~~~

~~~
  id |     address     |   sql_address   |      build      |         started_at         |         updated_at         | locality | is_available | is_live | gossiped_replicas | is_decommissioning |   membership   | is_draining
-----+-----------------+-----------------+-----------------+----------------------------+----------------------------+----------+--------------+---------+-------------------+--------------------+----------------+--------------
   1 | localhost:26257 | localhost:26257 | v22.2.0-alpha.1 | 2022-09-01 02:11:55.07734  | 2022-09-01 02:17:28.202777 |          | true         | true    |                73 | false              | active         | false
   2 | localhost:26258 | localhost:26258 | v22.2.0-alpha.1 | 2022-09-01 02:11:56.203535 | 2022-09-01 02:17:29.465841 |          | true         | true    |                73 | false              | active         | false
   3 | localhost:26259 | localhost:26259 | v22.2.0-alpha.1 | 2022-09-01 02:11:56.406667 | 2022-09-01 02:17:29.588486 |          | true         | true    |                73 | false              | active         | false
   4 | localhost:26260 | localhost:26260 | v22.2.0-alpha.1 | 2022-09-01 02:11:56.914003 | 2022-09-01 02:16:39.032709 |          | false        | false   |                 0 | true               | decommissioned | true
   5 | localhost:26261 | localhost:26261 | v22.2.0-alpha.1 | 2022-09-01 02:11:57.613508 | 2022-09-01 02:16:39.615783 |          | false        | false   |                 0 | true               | decommissioned | true
(5 rows)
~~~

- `is_draining == true` indicates that the node is either undergoing or has completed the draining process.
- `is_decommissioning == true` indicates that the node is either undergoing or has completed the decommissioning process.
- When a node completes decommissioning, its `membership` [status changes]({% link {{ page.version.version }}/node-shutdown.md %}#draining-phases) from `decommissioning` to `decommissioned`.

### `stderr`

When CockroachDB receives a signal to [terminate the node process]({% link {{ page.version.version }}/node-shutdown.md %}), this message is printed to `stderr`:

~~~
initiating graceful shutdown of server
~~~

After the `cockroach` process has stopped, this message is printed to `stderr`:

~~~
server drained and shutdown completed
~~~

## Examples

These examples assume that you have already [prepared to decommission the node](#prepare-to-decommission-a-node).

### Remove nodes


#### Prerequisites

In addition to the steps in [Prepare to decommission a node](#prepare-to-decommission-a-node), observe the following guidelines:

- Before decommissioning nodes, verify that there are no [under-replicated or unavailable ranges]({% link {{ page.version.version }}/ui-cluster-overview-page.md %}#cluster-overview-panel) on the cluster.
- Do **not** terminate the node process, delete the storage volume, or remove the VM before a `decommissioning` node has [changed its membership status]({% link {{ page.version.version }}/node-shutdown.md %}#draining-phases) to `decommissioned`. Prematurely terminating the process will prevent the node from rebalancing all of its range replicas onto other nodes gracefully, cause transient query errors in client applications, and leave the remaining ranges under-replicated and vulnerable to loss of [quorum]({% link {{ page.version.version }}/architecture/replication-layer.md %}#overview) if another node goes down.
- When removing nodes, decommission all nodes at once. Do not decommission the nodes one-by-one. This will incur unnecessary data movement costs due to replicas being passed between decommissioning nodes. **All** nodes must be fully `decommissioned` before terminating the node process and removing the data storage.
- If you have a decommissioning node that appears to be hung, you can [recommission](#recommission-nodes) the node.

#### Step 1. Get the IDs of the nodes to decommission

Open the **Cluster Overview** page of the DB Console and [note the node IDs]({% link {{ page.version.version }}/ui-cluster-overview-page.md %}#node-details) of the nodes you want to decommission.

This example assumes you will decommission node IDs `4` and `5` of a 5-node cluster.

#### Step 2. Drain the nodes manually

Run the [`cockroach node drain`]({% link {{ page.version.version }}/cockroach-node.md %}) command for each node to be removed, specifying the ID of the node to drain. {% include_cached new-in.html version="v24.2" %}Optionally, pass the `--shutdown` flag of [`cockroach node drain`]({% link {{ page.version.version }}/cockroach-node.md %}#flags) to automatically terminate the `cockroach` process after draining completes.

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach node drain 4 --host={address of any live node} --certs-dir=certs
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach node drain 5 --host={address of any live node} --certs-dir=certs
~~~

You will see the draining status of each node print to `stderr`:

~~~
node is draining... remaining: 50
node is draining... remaining: 0 (complete)
ok
~~~

Manually draining before decommissioning nodes is optional, but prevents possible disruptions in query performance.

#### Step 3. Decommission the nodes

Run the [`cockroach node decommission`]({% link {{ page.version.version }}/cockroach-node.md %}) command with the IDs of the nodes to decommission:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach node decommission 4 5 --certs-dir=certs --host={address of any live node}
~~~

You'll then see the decommissioning status print to `stderr` as it changes:

~~~
  id | is_live | replicas | is_decommissioning |   membership    | is_draining
-----+---------+----------+--------------------+-----------------+--------------
   4 |  true   |       39 |        true        | decommissioning |    true
   5 |  true   |       34 |        true        | decommissioning |    true
(2 rows)
~~~

The `is_draining` field is `true` because the nodes were previously drained.

Once the nodes have been fully decommissioned, you'll see zero `replicas` and a confirmation:

~~~
  id | is_live | replicas | is_decommissioning |   membership    | is_draining
-----+---------+----------+--------------------+-----------------+--------------
   4 |  true   |        0 |        true        | decommissioning |    true
   5 |  true   |        0 |        true        | decommissioning |    true
(2 rows)

No more data reported on target nodes. Please verify cluster health before removing the nodes.
~~~

The `is_decommissioning` field remains `true` after all replicas have been removed from each node.

{{site.data.alerts.callout_danger}}
Do **not** terminate the node process, delete the storage volume, or remove the VM before a `decommissioning` node has [changed its membership status]({% link {{ page.version.version }}/node-shutdown.md %}#draining-phases) to `decommissioned`. Prematurely terminating the process will prevent the node from rebalancing all of its range replicas onto other nodes gracefully, cause transient query errors in client applications, and leave the remaining ranges under-replicated and vulnerable to loss of [quorum]({% link {{ page.version.version }}/architecture/replication-layer.md %}#overview) if another node goes down.
{{site.data.alerts.end}}

{% include {{page.version.version}}/prod-deployment/decommission-pre-flight-checks.md %}

#### Step 4. Confirm the nodes are decommissioned

Check the status of the decommissioned nodes:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach node status --decommission --certs-dir=certs --host={address of any live node}
~~~

~~~
  id |     address     |   sql_address   |      build      |         started_at         |         updated_at         | locality | is_available | is_live | gossiped_replicas | is_decommissioning |   membership   | is_draining
-----+-----------------+-----------------+-----------------+----------------------------+----------------------------+----------+--------------+---------+-------------------+--------------------+----------------+--------------
   1 | localhost:26257 | localhost:26257 | v22.2.0-alpha.1 | 2022-09-01 02:11:55.07734 | 2022-09-01 02:17:28.202777 |          | true         | true    |                73 | false              | active         | false
   2 | localhost:26258 | localhost:26258 | v22.2.0-alpha.1 | 2022-09-01 02:11:56.203535 | 2022-09-01 02:17:29.465841 |          | true         | true    |                73 | false              | active         | false
   3 | localhost:26259 | localhost:26259 | v22.2.0-alpha.1 | 2022-09-01 02:11:56.406667 | 2022-09-01 02:17:29.588486 |          | true         | true    |                73 | false              | active         | false
   4 | localhost:26260 | localhost:26260 | v22.2.0-alpha.1 | 2022-09-01 02:11:56.914003 | 2022-09-01 02:16:39.032709 |          | false        | false   |                 0 | true               | decommissioned | true
   5 | localhost:26261 | localhost:26261 | v22.2.0-alpha.1 | 2022-09-01 02:11:57.613508 | 2022-09-01 02:16:39.615783 |          | false        | false   |                 0 | true               | decommissioned | true
(5 rows)
~~~

- Membership on the decommissioned nodes should have changed from `decommissioning` to `decommissioned`.
- `0` replicas should remain on these nodes.

Once the nodes complete decommissioning, they will appear in the list of [**Recently Decommissioned Nodes**]({% link {{ page.version.version }}/ui-cluster-overview-page.md %}#decommissioned-nodes) in the DB Console.

#### Step 5. Terminate the process on decommissioned nodes

{% include {{ page.version.version }}/prod-deployment/process-termination.md %}

The following messages will be printed:

~~~
initiating graceful shutdown of server
server drained and shutdown completed
~~~

### Remove a dead node

If a node is offline for the duration set by `server.time_until_store_dead` (5 minutes by default), the cluster considers the node "dead" and starts to rebalance its range replicas onto other nodes.

However, if the dead node is restarted, the cluster will rebalance replicas and leases onto the node. To prevent the cluster from rebalancing data to a dead node that comes back online, do the following:

#### Step 1. Confirm the node is dead

Check the status of your nodes:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach node status --decommission --certs-dir=certs --host={address of any live node}
~~~

~~~
  id |     address     |   sql_address   |      build      |         started_at         |         updated_at         | locality | is_available | is_live | gossiped_replicas | is_decommissioning |   membership   | is_draining
-----+-----------------+-----------------+-----------------+----------------------------+----------------------------+----------+--------------+---------+-------------------+--------------------+----------------+--------------
   1 | localhost:26257 | localhost:26257 | v22.2.0-alpha.1 | 2022-09-01 02:45:45.970862 | 2022-09-01 05:32:43.233458 |          | false        | false   |                 0 | false              | active         | true
   2 | localhost:26258 | localhost:26258 | v22.2.0-alpha.1 | 2022-09-01 02:46:40.32999  | 2022-09-01 05:42:28.577662 |          | true         | true    |                73 | false              | active         | false
   3 | localhost:26259 | localhost:26259 | v22.2.0-alpha.1 | 2022-09-01 02:46:47.20388  | 2022-09-01 05:42:27.467766 |          | true         | true    |                73 | false              | active         | false
   4 | localhost:26260 | localhost:26260 | v22.2.0-alpha.1 | 2022-09-01 02:11:56.914003 | 2022-09-01 02:16:39.032709 |          | true         | true    |                73 | false              | active         | false
(4 rows)
~~~

The `is_live` field of the dead node will be `false`.

Alternatively, open the **Cluster Overview** page of the DB Console and check that the [node status]({% link {{ page.version.version }}/ui-cluster-overview-page.md %}#node-status) of the node is `DEAD`.

#### Step 2. Decommission the dead node

Run the [`cockroach node decommission`]({% link {{ page.version.version }}/cockroach-node.md %}) command against the address of any live node, specifying the ID of the dead node:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach node decommission 1 --certs-dir=certs --host={address of any live node}
~~~

~~~
  id | is_live | replicas | is_decommissioning |   membership    | is_draining
-----+---------+----------+--------------------+-----------------+--------------
   1 |  false  |        0 |        true        | decommissioning |    true
(1 row)

No more data reported on target nodes. Please verify cluster health before removing the nodes.
~~~

#### Step 3. Confirm the node is decommissioned

Check the status of the decommissioned node:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach node status --decommission --certs-dir=certs --host={address of any live node}
~~~

~~~
  id |     address     |   sql_address   |      build      |         started_at         |         updated_at         | locality | is_available | is_live | gossiped_replicas | is_decommissioning |   membership   | is_draining
-----+-----------------+-----------------+-----------------+----------------------------+----------------------------+----------+--------------+---------+-------------------+--------------------+----------------+--------------
   1 | localhost:26257 | localhost:26257 | v22.2.0-alpha.1 | 2022-09-01 02:45:45.970862 | 2022-09-01 06:07:40.697734 |          | false        | false   |                 0 | true               | decommissioned | true
   2 | localhost:26258 | localhost:26258 | v22.2.0-alpha.1 | 2022-09-01 02:46:40.32999  | 2022-09-01 05:42:28.577662 |          | true         | true    |                73 | false              | active         | false
   3 | localhost:26259 | localhost:26259 | v22.2.0-alpha.1 | 2022-09-01 02:46:47.20388  | 2022-09-01 05:42:27.467766 |          | true         | true    |                73 | false              | active         | false
   4 | localhost:26260 | localhost:26260 | v22.2.0-alpha.1 | 2022-09-01 02:11:56.914003 | 2022-09-01 02:16:39.032709 |          | true         | true    |                73 | false              | active         | false
(4 rows)
~~~

- Membership on the decommissioned node should have changed from `active` to `decommissioned`.

Once the node completes decommissioning, it will appear in the list of [**Recently Decommissioned Nodes**]({% link {{ page.version.version }}/ui-cluster-overview-page.md %}#decommissioned-nodes) in the DB Console.

### Recommission nodes

If you accidentally started decommissioning a node, or have a node with a hung decommissioning process, you can recommission the node. This cancels replica removal from the decommissioning node.

Recommissioning can only cancel an active decommissioning process. If a node has [completed decommissioning]({% link {{ page.version.version }}/node-shutdown.md %}#draining-phases), you must start a new node. A fully decommissioned node is permanently decommissioned, and cannot be recommissioned.

#### Step 1. Cancel the decommissioning process

Press `ctrl-c` in each terminal with an ongoing decommissioning process that you want to cancel.

#### Step 2. Recommission the decommissioning nodes

Run the [`cockroach node recommission`]({% link {{ page.version.version }}/cockroach-node.md %}) command with the ID of the node to recommission:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach node recommission 1 --certs-dir=certs --host={address of any live node}
~~~

The value of `is_decommissioning` will change back to `false`:

~~~
  id | is_live | replicas | is_decommissioning | membership | is_draining
-----+---------+----------+--------------------+------------+--------------
   1 |  false  |       73 |       false        |   active   |    true
(1 row)
~~~

{{site.data.alerts.callout_info}}
If the decommissioning node has already reached the [draining stage]({% link {{ page.version.version }}/node-shutdown.md %}#draining-phases), you may need to restart the node after it is recommissioned.
{{site.data.alerts.end}}

On the **Cluster Overview** page of the DB Console, the [node status]({% link {{ page.version.version }}/ui-cluster-overview-page.md %}#node-status) of the node should be `LIVE`. After a few minutes, you should see replicas rebalanced to the nodes.

## Decommissioning on Kubernetes

{% include common/shutdown/kubernetes.md %}

## Decommissioning on CockroachDB {{ site.data.products.advanced }}

{% include common/shutdown/cockroachdb-advanced.md %}

## See also

- [Drain a node]({% link {{ page.version.version }}/drain-a-node.md %})
- [Upgrade CockroachDB]({% link {{ page.version.version }}/upgrade-cockroach-version.md %})
- [`cockroach node`]({% link {{ page.version.version }}/cockroach-node.md %})
- [`cockroach start`]({% link {{ page.version.version }}/cockroach-start.md %})
- [Node status]({% link {{ page.version.version }}/ui-cluster-overview-page.md %}#node-status)
- [Replication Layer]({% link {{ page.version.version }}/architecture/replication-layer.md %})
