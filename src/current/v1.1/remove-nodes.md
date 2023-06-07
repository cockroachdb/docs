---
title: Decommission Nodes
summary: Permanently remove one or more nodes from a cluster.
toc: true
toc_not_nested: true
---

<span class="version-tag">New in v1.1:</span> This page shows you how to decommission and permanently remove one or more nodes from a CockroachDB cluster. You might do this, for example, when downsizing a cluster or reacting to hardware failures.

For information about temporarily stopping a node, see [Stop a Node](stop-a-node.html).


## Overview

### How It Works

When you decommission a node, CockroachDB lets the node finish in-flight requests, rejects any new requests, and transfers all **range replicas** and **range leases** off the node so that it can be safely shut down.

Basic terms:

- **Range**: CockroachDB stores all user data and almost all system data in a giant sorted map of key value pairs. This keyspace is divided into "ranges", contiguous chunks of the keyspace, so that every key can always be found in a single range.
- **Range Replica:** CockroachDB replicates each range (3 times by default) and stores each replica on a different node.
- **Range Lease:** For each range, one of the replicas holds the "range lease". This replica, referred to as the "leaseholder", is the one that receives and coordinates all read and write requests for the range.

### Considerations

- Before decommissioning a node, make sure other nodes are available to take over the range replicas from the node. If no other nodes are available, the decommission process will hang indefinitely.  See the [Examples](#examples) below for more details.
- If a node has died, for example, due to a hardware failure, do not use the `--wait=all` flag to decommission the node. Doing so will cause the decommission process to hang indefinitely. Instead, use `--wait=live`. See [Remove a Single Node (Dead)](#remove-a-single-node-dead) and [Remove Multiple Nodes](#remove-multiple-nodes) for more details.

### Examples

#### 3-node cluster with 3-way replication

In this scenario, each range is replicated 3 times, with each replica on a different node:

<div style="text-align: center;"><img src="{{ 'images/v1.1/decommission-scenario1.1.png' | relative_url }}" alt="Decommission Scenario 1" style="max-width:50%" /></div>

If you try to decommission a node, the process will hang indefinitely because the cluster cannot move the decommissioned node's replicas to the other 2 nodes, which already have a replica of each range:

<div style="text-align: center;"><img src="{{ 'images/v1.1/decommission-scenario1.2.png' | relative_url }}" alt="Decommission Scenario 1" style="max-width:50%" /></div>

To successfully decommission a node, you need to first add a 4th node:

<div style="text-align: center;"><img src="{{ 'images/v1.1/decommission-scenario1.3.png' | relative_url }}" alt="Decommission Scenario 1" style="max-width:50%" /></div>

#### 5-node cluster with 3-way replication

In this scenario, like in the scenario above, each range is replicated 3 times, with each replica on a different node:

<div style="text-align: center;"><img src="{{ 'images/v1.1/decommission-scenario2.1.png' | relative_url }}" alt="Decommission Scenario 1" style="max-width:50%" /></div>

If you decommission a node, the process will run successfully because the cluster will be able to move the node's replicas to other nodes without doubling up any range replicas:

<div style="text-align: center;"><img src="{{ 'images/v1.1/decommission-scenario2.2.png' | relative_url }}" alt="Decommission Scenario 1" style="max-width:50%" /></div>

#### 5-node cluster with 5-way replication for a specific table

In this scenario, a [custom replication zone](configure-replication-zones.html#create-a-replication-zone-for-a-table) has been set to replicate a specific table 5 times (range 6), while all other data is replicated 3 times:

<div style="text-align: center;"><img src="{{ 'images/v1.1/decommission-scenario3.1.png' | relative_url }}" alt="Decommission Scenario 1" style="max-width:50%" /></div>

If you try to decommission a node, the cluster will successfully rebalance all ranges but range 6. Since range 6 requires 5 replicas (based on the table-specific replication zone), and since CockroachDB will not allow more than a single replica of any range on a single node, the decommission process will hang indefinitely:

<div style="text-align: center;"><img src="{{ 'images/v1.1/decommission-scenario3.2.png' | relative_url }}" alt="Decommission Scenario 1" style="max-width:50%" /></div>

To successfully decommission a node, you need to first add a 6th node:

<div style="text-align: center;"><img src="{{ 'images/v1.1/decommission-scenario3.3.png' | relative_url }}" alt="Decommission Scenario 1" style="max-width:50%" /></div>

## Remove a Single Node (Live)

<div class="filters clearfix">
  <button style="width: 15%" class="filter-button" data-scope="secure">Secure</button>
  <button style="width: 15%" class="filter-button" data-scope="insecure">Insecure</button>
</div>

### Before You Begin

Confirm that there are enough nodes to take over the replicas from the node you want to remove. See some [Example scenarios](#examples) above.

### Step 1. Check the node before decommissioning

Open the Admin UI, go to the **Replication** dashboard and hover over the **Replicas per Store** and **Leaseholders per Store** graphs:

<div style="text-align: center;"><img src="{{ 'images/v1.1/before-decommission2.png' | relative_url }}" alt="Decommission a single live node" style="border:1px solid #eee;max-width:100%" /></div>

<div style="text-align: center;"><img src="{{ 'images/v1.1/before-decommission1.png' | relative_url }}" alt="Decommission a single live node" style="border:1px solid #eee;max-width:100%" /></div>

### Step 2. Decommission and remove the node

SSH to the machine where the node is running and execute the [`cockroach quit`](stop-a-node.html) command with the `--decommission` flag and other required flags:

<div class="filter-content" markdown="1" data-scope="secure">
~~~ shell
$ cockroach quit --decommission --certs-dir=certs --host=<address of node to remove>
~~~
</div>

<div class="filter-content" markdown="1" data-scope="insecure">
~~~ shell
$ cockroach quit --decommission --insecure --host=<address of node to remove>
~~~
</div>

Every second or so, you'll then see the decommissioning status:

~~~
+----+---------+-------------------+--------------------+-------------+
| id | is_live | gossiped_replicas | is_decommissioning | is_draining |
+----+---------+-------------------+--------------------+-------------+
|  4 | true    |                73 | false              | false       |
+----+---------+-------------------+--------------------+-------------+
(1 row)
+----+---------+-------------------+--------------------+-------------+
| id | is_live | gossiped_replicas | is_decommissioning | is_draining |
+----+---------+-------------------+--------------------+-------------+
|  4 | true    |                73 | true               | false       |
+----+---------+-------------------+--------------------+-------------+
(1 row)
~~~

Once the node has been fully decommissioned and stopped, you'll see a confirmation:

~~~
+----+---------+-------------------+--------------------+-------------+
| id | is_live | gossiped_replicas | is_decommissioning | is_draining |
+----+---------+-------------------+--------------------+-------------+
|  4 | true    |                13 | true               | true        |
+----+---------+-------------------+--------------------+-------------+
(1 row)
+----+---------+-------------------+--------------------+-------------+
| id | is_live | gossiped_replicas | is_decommissioning | is_draining |
+----+---------+-------------------+--------------------+-------------+
|  4 | true    |                 0 | true               | true        |
+----+---------+-------------------+--------------------+-------------+
(1 row)
All target nodes report that they hold no more data. Please verify cluster health before removing the nodes.
ok
~~~

### Step 3. Check the node and cluster after decommissioning

In the Admin UI, again hover over the **Replicas per Store** and **Leaseholders per Store** graphs. For the node that you decommissioned, the counts should be 0:

<div style="text-align: center;"><img src="{{ 'images/v1.1/after-decommission1.png' | relative_url }}" alt="Decommission a single live node" style="border:1px solid #eee;max-width:100%" /></div>

<div style="text-align: center;"><img src="{{ 'images/v1.1/after-decommission2.png' | relative_url }}" alt="Decommission a single live node" style="border:1px solid #eee;max-width:100%" /></div>

Then click **View nodes list** in the **Summary** area and make sure all nodes but the one you removed are healthy (green):

<div style="text-align: center;"><img src="{{ 'images/v1.1/cluster-status-after-decommission1.png' | relative_url }}" alt="Decommission a single live node" style="border:1px solid #eee;max-width:100%" /></div>

In about 5 minutes, you'll see the removed node listed under **Decommissioned Nodes**:

<div style="text-align: center;"><img src="{{ 'images/v1.1/cluster-status-after-decommission2.png' | relative_url }}" alt="Decommission a single live node" style="border:1px solid #eee;max-width:100%" /></div>

## Remove a Single Node (Dead)

<div class="filters clearfix">
  <button style="width: 15%" class="filter-button" data-scope="secure">Secure</button>
  <button style="width: 15%" class="filter-button" data-scope="insecure">Insecure</button>
</div>

Once a node has been dead for 5 minutes, CockroachDB automatically transfers the range replicas and range leases on the node to available live nodes. However, if it is restarted, the cluster will rebalance replicas and leases to it.

To prevent the cluster from rebalancing data to a dead node if it comes back online, do the following:

### Step 1. Identify the ID of the dead node

Open the Admin UI, click **View nodes list** in the **Summary** area, and note the ID of the node listed under **Dead Nodes**:

<div style="text-align: center;"><img src="{{ 'images/v1.1/remove-dead-node1.png' | relative_url }}" alt="Decommission a single dead node" style="border:1px solid #eee;max-width:100%" /></div>

### Step 2. Mark the dead node as decommissioned

SSH to any live node in the cluster and run the [`cockroach node decommission`](view-node-details.html) command with the ID of the node to officially decommission:

{{site.data.alerts.callout_success}}Be sure to include <code>--wait=live</code>. If not specified, this flag defaults to <code>--wait=all</code>, which will cause the <code>node decommission</code> command to hang indefinitely.{{site.data.alerts.end}}

<div class="filter-content" markdown="1" data-scope="secure">
~~~ shell
$ cockroach node decommission 4 --wait=live --certs-dir=certs --host=<address of live node>
~~~
</div>

<div class="filter-content" markdown="1" data-scope="insecure">
~~~ shell
$ cockroach node decommission 4 --wait=live --insecure --host=<address of live node>
~~~
</div>

~~~
+----+---------+-------------------+--------------------+-------------+
| id | is_live | gossiped_replicas | is_decommissioning | is_draining |
+----+---------+-------------------+--------------------+-------------+
|  4 | false   |                12 | true               | true        |
+----+---------+-------------------+--------------------+-------------+
(1 row)
Decommissioning finished. Please verify cluster health before removing the nodes.
~~~

If the node is ever restarted, it will be listed as **Live** in the Admin UI, but the cluster will recognize it as decommissioned and will not rebalance any data to the node. If the node is then stopped again, a short time later, it will be listed as **Decommissioned** in the Admin UI:

<div style="text-align: center;"><img src="{{ 'images/v1.1/cluster-status-after-decommission2.png' | relative_url }}" alt="Decommission a single dead node" style="border:1px solid #eee;max-width:100%" /></div>

## Remove Multiple Nodes

<div class="filters clearfix">
  <button style="width: 15%" class="filter-button" data-scope="secure">Secure</button>
  <button style="width: 15%" class="filter-button" data-scope="insecure">Insecure</button>
</div>

### Before You Begin

Confirm that there are enough nodes to take over the replicas from the nodes you want to remove. See some [Example scenarios](#examples) above.

### Step 1. Identify the IDs of the nodes to decommission

Open the Admin UI, click **View nodes list** in the **Summary** area, and note the IDs of the nodes that you want to decommission:

<div style="text-align: center;"><img src="{{ 'images/v1.1/decommission-multiple1.png' | relative_url }}" alt="Decommission multiple nodes" style="border:1px solid #eee;max-width:100%" /></div>

### Step 2. Check the nodes before decommissioning

In the Admin UI, go to the **Replication** dashboard and hover over the **Replicas per Store** and **Leaseholders per Store** graphs:

<div style="text-align: center;"><img src="{{ 'images/v1.1/decommission-multiple2.png' | relative_url }}" alt="Decommission multiple nodes" style="border:1px solid #eee;max-width:100%" /></div>

<div style="text-align: center;"><img src="{{ 'images/v1.1/decommission-multiple3.png' | relative_url }}" alt="Decommission multiple nodes" style="border:1px solid #eee;max-width:100%" /></div>

### Step 3. Decommission the nodes

SSH to any live node in the cluster and run the [`cockroach node decommission`](view-node-details.html) command with the IDs of the nodes to officially decommission:

{{site.data.alerts.callout_success}}If there's a chance that one or more of the nodes will be offline during this process, be sure to include <code>--wait=live</code>. This will ensure that the command will not wait indefinitely for dead nodes to finish decommissioning.{{site.data.alerts.end}}

<div class="filter-content" markdown="1" data-scope="secure">
~~~ shell
$ cockroach node decommission 4 5 --wait=live --certs-dir=certs --host=<address of live node>
~~~
</div>

<div class="filter-content" markdown="1" data-scope="insecure">
~~~ shell
$ cockroach node decommission 4 5 --wait=live --insecure --host=<address of live node>
~~~
</div>

Every second or so, you'll then see the decommissioning status:

~~~
+----+---------+-------------------+--------------------+-------------+
| id | is_live | gossiped_replicas | is_decommissioning | is_draining |
+----+---------+-------------------+--------------------+-------------+
|  4 | true    |                 8 | true               | false       |
|  5 | true    |                 9 | true               | false       |
+----+---------+-------------------+--------------------+-------------+
(2 rows)
+----+---------+-------------------+--------------------+-------------+
| id | is_live | gossiped_replicas | is_decommissioning | is_draining |
+----+---------+-------------------+--------------------+-------------+
|  4 | true    |                 8 | true               | false       |
|  5 | true    |                 9 | true               | false       |
+----+---------+-------------------+--------------------+-------------+
(2 rows)
~~~

Once the nodes have been fully decommissioned, you'll see a confirmation:

~~~
+----+---------+-------------------+--------------------+-------------+
| id | is_live | gossiped_replicas | is_decommissioning | is_draining |
+----+---------+-------------------+--------------------+-------------+
|  4 | true    |                 0 | true               | true        |
|  5 | true    |                 0 | true               | true        |
+----+---------+-------------------+--------------------+-------------+
(2 rows)
Decommissioning finished. Please verify cluster health before removing the nodes.
~~~

### Step 4. Check the nodes and cluster after decommissioning

In the Admin UI, again hover over the **Replicas per Store** and **Leaseholders per Store** graphs. For the nodes that you decommissioned, the counts should be 0:

<div style="text-align: center;"><img src="{{ 'images/v1.1/decommission-multiple4.png' | relative_url }}" alt="Decommission multiple nodes" style="border:1px solid #eee;max-width:100%" /></div>

<div style="text-align: center;"><img src="{{ 'images/v1.1/decommission-multiple5.png' | relative_url }}" alt="Decommission multiple nodes" style="border:1px solid #eee;max-width:100%" /></div>

Then click **View nodes list** in the **Summary** area and make sure all nodes are healthy (green) and the decommissioned nodes have 0 replicas:

<div style="text-align: center;"><img src="{{ 'images/v1.1/decommission-multiple6.png' | relative_url }}" alt="Decommission multiple nodes" style="border:1px solid #eee;max-width:100%" /></div>

### Step 5. Remove the decommissioned nodes

At this point, although the decommissioned nodes are live, the cluster will not rebalance any data to them, and the nodes will not accept any client connections. However, to officially remove the nodes from the cluster, you still need to stop them.

For each decommissioned node, SSH to the machine running the node and execute the `cockroach quit` command:

<div class="filter-content" markdown="1" data-scope="secure">
~~~ shell
$ cockroach quit --certs-dir=certs --host=<address of decommissioned node>
~~~
</div>

<div class="filter-content" markdown="1" data-scope="insecure">
~~~ shell
$ cockroach quit --insecure --host=<address of decommissioned node>
~~~
</div>

In about 5 minutes, you'll see the nodes listed under **Decommissioned Nodes**:

<div style="text-align: center;"><img src="{{ 'images/v1.1/decommission-multiple7.png' | relative_url }}" alt="Decommission multiple nodes" style="border:1px solid #eee;max-width:100%" /></div>

## Recommission Nodes

<div class="filters clearfix">
  <button style="width: 15%" class="filter-button" data-scope="secure">Secure</button>
  <button style="width: 15%" class="filter-button" data-scope="insecure">Insecure</button>
</div>

If you accidentally decommissioned any nodes, or otherwise want decommissioned nodes to rejoin a cluster as active members, do the following:

### Step 1. Identify the IDs of the decommissioned nodes

Open the Admin UI, click **View nodes list** in the **Summary** area, and note the IDs of the nodes listed under **Decommissioned Nodes**:

<div style="text-align: center;"><img src="{{ 'images/v1.1/cluster-status-after-decommission2.png' | relative_url }}" alt="Decommission a single dead node" style="border:1px solid #eee;max-width:100%" /></div>

{{site.data.alerts.callout_info}}If a decommissioned node is still live, it will be listed under <strong>Live Nodes</strong> but its replica count should be 0. In this case, you must <a href="stop-a-node.html">stop the node</a> before you can recommission it.{{site.data.alerts.end}}

### Step 2. Recommission the nodes

SSH to one of the live nodes and execute the [`cockroach node recommission`](view-node-details.html) command with the IDs of the nodes to recommission:

<div class="filter-content" markdown="1" data-scope="secure">
~~~ shell
$ cockroach node recommission 4 --certs-dir=certs --host=<address of live node>
~~~
</div>

<div class="filter-content" markdown="1" data-scope="insecure">
~~~ shell
$ cockroach node recommision 4 --insecure --host=<address of live node>
~~~
</div>

~~~
+----+---------+-------------------+--------------------+-------------+
| id | is_live | gossiped_replicas | is_decommissioning | is_draining |
+----+---------+-------------------+--------------------+-------------+
|  4 | false   |                12 | false              | true        |
+----+---------+-------------------+--------------------+-------------+
(1 row)
The affected nodes must be restarted for the change to take effect.
~~~

### Step 3. Restart the recommissioned nodes

SSH to each machine with a recommissioned node and run the same `cockroach start` command that you used to initially start the node, for example:

<div class="filter-content" markdown="1" data-scope="secure">
~~~ shell
$ cockroach start --certs-dir=certs --host=<address of node to restart> --join=<address of node 1>:26257 --background
~~~
</div>

<div class="filter-content" markdown="1" data-scope="insecure">
~~~ shell
$ cockroach start --insecure --host=<address of node to restart> --join=<address of node 1>:26257 --background
~~~
</div>

In the Admin UI, click **View nodes list** in the **Summary** area. You should very soon see the recommissioned nodes listed under **Live Nodes** and, after a few minutes, you should see replicas rebalanced to it.

## Check the Status of Decommissioning Nodes

To check the progress of decommissioning nodes, you can run the `cockroach node status` command with the `--decommission` flag:

<div class="filters clearfix">
  <button style="width: 15%" class="filter-button" data-scope="secure">Secure</button>
  <button style="width: 15%" class="filter-button" data-scope="insecure">Insecure</button>
</div><br>

<div class="filter-content" markdown="1" data-scope="secure">
~~~ shell
$ cockroach node status --decommission --certs-dir=certs --host=<address of any live node>
~~~
</div>

<div class="filter-content" markdown="1" data-scope="insecure">
~~~ shell
$ cockroach node status --decommission --insecure --host=<address of any live node>
~~~
</div>

~~~
+----+-----------------------+---------+---------------------+---------------------+---------+-------------------+--------------------+-------------+
| id |        address        |  build  |     updated_at      |     started_at      | is_live | gossiped_replicas | is_decommissioning | is_draining |
+----+-----------------------+---------+---------------------+---------------------+---------+-------------------+--------------------+-------------+
|  1 | 165.227.60.76:26257   | 91a299d | 2017-09-07 18:16:03 | 2017-09-07 16:30:13 | true    |               134 | false              | false       |
|  2 | 192.241.239.201:26257 | 91a299d | 2017-09-07 18:16:05 | 2017-09-07 16:30:45 | true    |               134 | false              | false       |
|  3 | 67.207.91.36:26257    | 91a299d | 2017-09-07 18:16:06 | 2017-09-07 16:31:06 | true    |               136 | false              | false       |
|  4 | 138.197.12.74:26257   | 91a299d | 2017-09-07 18:16:03 | 2017-09-07 16:44:23 | true    |                 1 | true               | true        |
|  5 | 174.138.50.192:26257  | 91a299d | 2017-09-07 18:16:07 | 2017-09-07 17:12:57 | true    |                 3 | true               | true        |
+----+-----------------------+---------+---------------------+---------------------+---------+-------------------+--------------------+-------------+
(5 rows)
~~~

## See Also

- [Temporarily Stop a Node](stop-a-node.html)
