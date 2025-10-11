---
title: Decommission Nodes
summary: Permanently remove one or more nodes from a cluster.
toc: true
---

This page shows you how to decommission and permanently remove one or more nodes from a CockroachDB cluster. You might do this, for example, when downsizing a cluster or reacting to hardware failures.

For information about temporarily stopping a node (e.g., for planned maintenance), see [Stop a Node](stop-a-node.html).

## Overview

### How it works

When you decommission a node, CockroachDB lets the node finish in-flight requests, rejects any new requests, and transfers all **range replicas** and **range leases** off the node so that it can be safely shut down.

Basic terms:

- **Range**: CockroachDB stores all user data and almost all system data in a giant sorted map of key value pairs. This keyspace is divided into "ranges", contiguous chunks of the keyspace, so that every key can always be found in a single range.
- **Range Replica:** CockroachDB replicates each range (3 times by default) and stores each replica on a different node.
- **Range Lease:** For each range, one of the replicas holds the "range lease". This replica, referred to as the "leaseholder", is the one that receives and coordinates all read and write requests for the range.

### Considerations

Before decommissioning a node, make sure other nodes are available to take over the range replicas from the node. If no other nodes are available, the decommission process will hang indefinitely.  See the [Examples](#examples) below for more details.

### Examples

#### 3-node cluster with 3-way replication

In this scenario, each range is replicated 3 times, with each replica on a different node:

<div style="text-align: center;"><img src="{{ 'images/v2.1/decommission-scenario1.1.png' | relative_url }}" alt="Decommission Scenario 1" style="max-width:50%" /></div>

If you try to decommission a node, the process will hang indefinitely because the cluster cannot move the decommissioned node's replicas to the other 2 nodes, which already have a replica of each range:

<div style="text-align: center;"><img src="{{ 'images/v2.1/decommission-scenario1.2.png' | relative_url }}" alt="Decommission Scenario 1" style="max-width:50%" /></div>

To successfully decommission a node, you need to first add a 4th node:

<div style="text-align: center;"><img src="{{ 'images/v2.1/decommission-scenario1.3.png' | relative_url }}" alt="Decommission Scenario 1" style="max-width:50%" /></div>

#### 5-node cluster with 3-way replication

In this scenario, like in the scenario above, each range is replicated 3 times, with each replica on a different node:

<div style="text-align: center;"><img src="{{ 'images/v2.1/decommission-scenario2.1.png' | relative_url }}" alt="Decommission Scenario 1" style="max-width:50%" /></div>

If you decommission a node, the process will run successfully because the cluster will be able to move the node's replicas to other nodes without doubling up any range replicas:

<div style="text-align: center;"><img src="{{ 'images/v2.1/decommission-scenario2.2.png' | relative_url }}" alt="Decommission Scenario 1" style="max-width:50%" /></div>

#### 5-node cluster with 5-way replication for a specific table

In this scenario, a [custom replication zone](configure-replication-zones.html#create-a-replication-zone-for-a-table) has been set to replicate a specific table 5 times (range 6), while all other data is replicated 3 times:

<div style="text-align: center;"><img src="{{ 'images/v2.1/decommission-scenario3.1.png' | relative_url }}" alt="Decommission Scenario 1" style="max-width:50%" /></div>

If you try to decommission a node, the cluster will successfully rebalance all ranges but range 6. Since range 6 requires 5 replicas (based on the table-specific replication zone), and since CockroachDB will not allow more than a single replica of any range on a single node, the decommission process will hang indefinitely:

<div style="text-align: center;"><img src="{{ 'images/v2.1/decommission-scenario3.2.png' | relative_url }}" alt="Decommission Scenario 1" style="max-width:50%" /></div>

To successfully decommission a node, you need to first add a 6th node:

<div style="text-align: center;"><img src="{{ 'images/v2.1/decommission-scenario3.3.png' | relative_url }}" alt="Decommission Scenario 1" style="max-width:50%" /></div>

## Remove a single node (live)

<div class="filters clearfix">
  <button style="width: 15%" class="filter-button" data-scope="secure">Secure</button>
  <button style="width: 15%" class="filter-button" data-scope="insecure">Insecure</button>
</div>

### Before you begin

To ensure your cluster can adequately handle decommissioning nodes:

- Only decommission one node at a time, and before decommissioning each node verify that there are no [underreplicated or unavailable ranges](admin-ui-replication-dashboard.html).
- If you have a decommissioning node that appears to be stuck or hung, [contact our support team](support-resources.html).

    If possible, keep the node running instead of stopping it, because a stuck decommissioning process might be a symptom of a problem that could result in data loss.
- Confirm that there are enough nodes to take over the replicas from the node you want to remove. See some [Example scenarios](#examples) above.

### Step 1. Check the node before decommissioning

Open the Admin UI, click **Metrics** on the left, select the **Replication** dashboard, and hover over the **Replicas per Store** and **Leaseholders per Store** graphs:

<div style="text-align: center;"><img src="{{ 'images/v2.1/before-decommission2.png' | relative_url }}" alt="Decommission a single live node" style="border:1px solid #eee;max-width:100%" /></div>

<div style="text-align: center;"><img src="{{ 'images/v2.1/before-decommission1.png' | relative_url }}" alt="Decommission a single live node" style="border:1px solid #eee;max-width:100%" /></div>

### Step 2. Decommission and remove the node

SSH to the machine where the node is running and execute the [`cockroach quit`](stop-a-node.html) command with the `--decommission` flag and other required flags:

<div class="filter-content" markdown="1" data-scope="secure">
{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach quit --decommission --certs-dir=certs --host=<address of node to remove>
~~~
</div>

<div class="filter-content" markdown="1" data-scope="insecure">
{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach quit --decommission --insecure --host=<address of node to remove>
~~~
</div>

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
ok
~~~

### Step 3. Check the node and cluster after decommissioning

In the Admin UI **Replication** dashboard, again hover over the **Replicas per Store** and **Leaseholders per Store** graphs. For the node that you decommissioned, the counts should be 0:

<div style="text-align: center;"><img src="{{ 'images/v2.1/after-decommission1.png' | relative_url }}" alt="Decommission a single live node" style="border:1px solid #eee;max-width:100%" /></div>

<div style="text-align: center;"><img src="{{ 'images/v2.1/after-decommission2.png' | relative_url }}" alt="Decommission a single live node" style="border:1px solid #eee;max-width:100%" /></div>

Then view **Node List** on the **Overview** page and make sure all nodes but the one you removed are healthy (green):

<div style="text-align: center;"><img src="{{ 'images/v2.1/cluster-status-after-decommission1.png' | relative_url }}" alt="Decommission a single live node" style="border:1px solid #eee;max-width:100%" /></div>

In about 5 minutes, you'll see the removed node listed under **Decommissioned Nodes**:

<div style="text-align: center;"><img src="{{ 'images/v2.1/cluster-status-after-decommission2.png' | relative_url }}" alt="Decommission a single live node" style="border:1px solid #eee;max-width:100%" /></div>

At this point, the node will no longer appear in timeseries graphs unless you are viewing a time range during which the node was live. However, it will never disappear from the **Decommissioned Nodes** list.

Also, if the node is restarted, it will not accept any client connections, and the cluster will not rebalance any data to it; to make the cluster utilize the node again, you'd have to [recommission](#recommission-nodes) it.

## Remove a single node (dead)

<div class="filters clearfix">
  <button style="width: 15%" class="filter-button" data-scope="secure">Secure</button>
  <button style="width: 15%" class="filter-button" data-scope="insecure">Insecure</button>
</div>

Once a node has been dead for 5 minutes, CockroachDB automatically transfers the range replicas and range leases on the node to available live nodes. However, if it is restarted, the cluster will rebalance replicas and leases to it.

To prevent the cluster from rebalancing data to a dead node if it comes back online, do the following:

### Step 1. Identify the ID of the dead node

Open the Admin UI and select the **Node List** view. Note the ID of the node listed under **Dead Nodes**:

<div style="text-align: center;"><img src="{{ 'images/v2.1/remove-dead-node1.png' | relative_url }}" alt="Decommission a single dead node" style="border:1px solid #eee;max-width:100%" /></div>

### Step 2. Mark the dead node as decommissioned

SSH to any live node in the cluster and run the [`cockroach node decommission`](view-node-details.html) command with the ID of the node to officially decommission:


<div class="filter-content" markdown="1" data-scope="secure">
{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach node decommission 4 --certs-dir=certs --host=<address of live node>
~~~
</div>

<div class="filter-content" markdown="1" data-scope="insecure">
{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach node decommission 4 --insecure --host=<address of live node>
~~~
</div>

~~~
 id | is_live | replicas | is_decommissioning | is_draining  
+---+---------+----------+--------------------+-------------+
  4 |  false  |        0 |        true        |    true      
(1 row)

No more data reported on target nodes. Please verify cluster health before removing the nodes.
~~~

If you go back to the **Nodes List** page, in about 5 minutes, you'll see the node move from the **Dead Nodes** to **Decommissioned Nodes** list. At this point, the node will no longer appear in timeseries graphs unless you are viewing a time range during which the node was live. However, it will never disappear from the **Decommissioned Nodes** list.

<div style="text-align: center;"><img src="{{ 'images/v2.1/cluster-status-after-decommission2.png' | relative_url }}" alt="Decommission a single live node" style="border:1px solid #eee;max-width:100%" /></div>

Also, if the node is ever restarted, it will not accept any client connections, and the cluster will not rebalance any data to it; to make the cluster utilize the node again, you'd have to [recommission](#recommission-nodes) it.

## Remove multiple nodes

<div class="filters clearfix">
  <button style="width: 15%" class="filter-button" data-scope="secure">Secure</button>
  <button style="width: 15%" class="filter-button" data-scope="insecure">Insecure</button>
</div>

### Before you begin

Confirm that there are enough nodes to take over the replicas from the nodes you want to remove. See some [Example scenarios](#examples) above.

### Step 1. Identify the IDs of the nodes to decommission

Open the Admin UI and select the **Node List** view, or go to **Metrics** on the left and click **View nodes list** in the **Summary** area. Note the IDs of the nodes that you want to decommission:

<div style="text-align: center;"><img src="{{ 'images/v2.1/decommission-multiple1.png' | relative_url }}" alt="Decommission multiple nodes" style="border:1px solid #eee;max-width:100%" /></div>

### Step 2. Check the nodes before decommissioning

Select the **Replication** dashboard, and hover over the **Replicas per Store** and **Leaseholders per Store** graphs:

<div style="text-align: center;"><img src="{{ 'images/v2.1/decommission-multiple2.png' | relative_url }}" alt="Decommission multiple nodes" style="border:1px solid #eee;max-width:100%" /></div>

<div style="text-align: center;"><img src="{{ 'images/v2.1/decommission-multiple3.png' | relative_url }}" alt="Decommission multiple nodes" style="border:1px solid #eee;max-width:100%" /></div>

### Step 3. Decommission the nodes

SSH to any live node in the cluster and run the [`cockroach node decommission`](view-node-details.html) command with the IDs of the nodes to officially decommission:

<div class="filter-content" markdown="1" data-scope="secure">
{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach node decommission 4 5 --certs-dir=certs --host=<address of live node>
~~~
</div>

<div class="filter-content" markdown="1" data-scope="insecure">
{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach node decommission 4 5 --insecure --host=<address of live node>
~~~
</div>

You'll then see the decommissioning status print to `stderr` as it changes:

~~~
 id | is_live | replicas | is_decommissioning | is_draining  
+---+---------+----------+--------------------+-------------+
  4 |  true   |       18 |        true        |    false     
  5 |  true   |       16 |        true        |    false     
(2 rows)
~~~

Once the nodes have been fully decommissioned, you'll see a confirmation:

~~~
 id | is_live | replicas | is_decommissioning | is_draining  
+---+---------+----------+--------------------+-------------+
  4 |  true   |        0 |        true        |    false     
  5 |  true   |        0 |        true        |    false     
(2 rows)

No more data reported on target nodes. Please verify cluster health before removing the nodes.
~~~

### Step 4. Check the nodes and cluster after decommissioning

In the Admin UI **Replication** dashboard, again hover over the **Replicas per Store** and **Leaseholders per Store** graphs. For the nodes that you decommissioned, the counts should be 0:

<div style="text-align: center;"><img src="{{ 'images/v2.1/decommission-multiple4.png' | relative_url }}" alt="Decommission multiple nodes" style="border:1px solid #eee;max-width:100%" /></div>

<div style="text-align: center;"><img src="{{ 'images/v2.1/decommission-multiple5.png' | relative_url }}" alt="Decommission multiple nodes" style="border:1px solid #eee;max-width:100%" /></div>

Then click **View nodes list** in the **Summary** area and make sure all nodes are healthy (green) and the decommissioned nodes have 0 replicas:

<div style="text-align: center;"><img src="{{ 'images/v2.1/decommission-multiple6.png' | relative_url }}" alt="Decommission multiple nodes" style="border:1px solid #eee;max-width:100%" /></div>

In about 5 minutes, you'll see the node move to the **Decommissioned Nodes** list, and the node will no longer appear in timeseries graphs unless you are viewing a time range during which the node was live. However, it will never disappear from the **Decommissioned Nodes** list.

<div style="text-align: center;"><img src="{{ 'images/v2.1/decommission-multiple7.png' | relative_url }}" alt="Decommission multiple nodes" style="border:1px solid #eee;max-width:100%" /></div>

### Step 5. Remove the decommissioned nodes

At this point, although the decommissioned nodes are live, the cluster will not rebalance any data to them, and the nodes will not accept any client connections. However, to officially remove the nodes from the cluster, you still need to stop them.

For each decommissioned node, SSH to the machine running the node and execute the `cockroach quit` command:

<div class="filter-content" markdown="1" data-scope="secure">
{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach quit --certs-dir=certs --host=<address of decommissioned node>
~~~
</div>

<div class="filter-content" markdown="1" data-scope="insecure">
{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach quit --insecure --host=<address of decommissioned node>
~~~
</div>

## Recommission nodes

<div class="filters clearfix">
  <button style="width: 15%" class="filter-button" data-scope="secure">Secure</button>
  <button style="width: 15%" class="filter-button" data-scope="insecure">Insecure</button>
</div>

If you accidentally decommissioned any nodes, or otherwise want decommissioned nodes to rejoin a cluster as active members, do the following:

### Step 1. Identify the IDs of the decommissioned nodes

Open the Admin UI and select the **Node List** view. Note the IDs of the nodes listed under **Decommissioned Nodes**:

<div style="text-align: center;"><img src="{{ 'images/v2.1/cluster-status-after-decommission2.png' | relative_url }}" alt="Decommission a single dead node" style="border:1px solid #eee;max-width:100%" /></div>

### Step 2. Recommission the nodes

SSH to one of the live nodes and execute the [`cockroach node recommission`](view-node-details.html) command with the IDs of the nodes to recommission:

<div class="filter-content" markdown="1" data-scope="secure">
{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach node recommission 4 --certs-dir=certs --host=<address of live node>
~~~
</div>

<div class="filter-content" markdown="1" data-scope="insecure">
{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach node recommission 4 --insecure --host=<address of live node>
~~~
</div>

~~~
 id | is_live | replicas | is_decommissioning | is_draining  
+---+---------+----------+--------------------+-------------+
  4 |  false  |        0 |       false        |    true      
(1 row)
The affected nodes must be restarted for the change to take effect.
~~~

### Step 3. Restart the recommissioned nodes

SSH to each machine with a recommissioned node and run the same `cockroach start` command that you used to initially start the node, for example:

<div class="filter-content" markdown="1" data-scope="secure">
{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach start --certs-dir=certs --advertise-addr=<address of node to restart> --join=<address of node 1> --background
~~~
</div>

<div class="filter-content" markdown="1" data-scope="insecure">
{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach start --insecure --advertise-addr=<address of node to restart> --join=<address of node 1> --background
~~~
</div>

On the **Nodes List** page, you should very soon see the recommissioned nodes listed under **Live Nodes** and, after a few minutes, you should see replicas rebalanced to it.

## Check the status of decommissioning nodes

To check the progress of decommissioning nodes, you can run the `cockroach node status` command with the `--decommission` flag:

<div class="filters clearfix">
  <button style="width: 15%" class="filter-button" data-scope="secure">Secure</button>
  <button style="width: 15%" class="filter-button" data-scope="insecure">Insecure</button>
</div><br>

<div class="filter-content" markdown="1" data-scope="secure">
{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach node status --decommission --certs-dir=certs --host=<address of any live node>
~~~
</div>

<div class="filter-content" markdown="1" data-scope="insecure">
{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach node status --decommission --insecure --host=<address of any live node>
~~~
</div>

~~~
 id |        address         |  build  |            started_at            |            updated_at            | is_available | is_live | gossiped_replicas | is_decommissioning | is_draining  
+---+------------------------+---------+----------------------------------+----------------------------------+--------------+---------+-------------------+--------------------+-------------+
  1 | 165.227.60.76:26257    | 91a299d | 2018-10-01 16:53:10.946245+00:00 | 2018-10-02 14:04:39.280249+00:00 |         true |  true   |                26 |       false        |    false     
  2 | 192.241.239.201:26257  | 91a299d | 2018-10-01 16:53:24.22346+00:00  | 2018-10-02 14:04:39.415235+00:00 |         true |  true   |                26 |       false        |    false     
  3 | 67.207.91.36:26257     | 91a299d | 2018-10-01 17:34:21.041926+00:00 | 2018-10-02 14:04:39.233882+00:00 |         true |  true   |                25 |       false        |    false     
  4 | 138.197.12.74:26257    | 91a299d | 2018-10-01 17:09:11.734093+00:00 | 2018-10-02 14:04:37.558204+00:00 |         true |  true   |                25 |       false        |    false     
  5 | 174.138.50.192:26257   | 91a299d | 2018-10-01 17:14:01.480725+00:00 | 2018-10-02 14:04:39.293121+00:00 |         true |  true   |                 0 |        true        |    false          
(5 rows)
~~~

## See also

- [Temporarily Stop a Node](stop-a-node.html)
