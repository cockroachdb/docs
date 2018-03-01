---
title: Overview Page
toc: false
---

On [accessing the Admin UI](admin-ui-access-and-navigate.html), the **Overview** page is displayed by default. The **Overview** page has three components: the [Cluster Overview panel](#cluster-overview-panel), the [Node List](#node-list), and the [Node Map](#node-map).

<div id="toc"></div>

## Cluster Overview Panel
<img src="{{ 'images/admin_ui_summary_panel.png' | relative_url }}" alt="CockroachDB Admin UI Summary Panel" style="border:1px solid #eee;max-width:40%" />

The **Cluster Overview** panel provides the following metrics:

Metric | Description
--------|----
Capacity Usage | <ul><li>The storage capacity used as a percentage of total storage capacity allocated across all nodes.<br><br>**Note:** If you are running multiple nodes on a single machine (not recommended), this value may be incorrect. This is because when multiple nodes are running on a single machine, the machine's hard disk is treated as separate stores for each node, while in reality, only one hard disk is used for all nodes. The Capacity Used is then displayed as the hard disk capacity used multiplied by the number of nodes on the machine.</li><li>The current capacity usage.</li></ul>
Node Status | <ul><li>The number of [live nodes](admin-ui-access-and-navigate.html#live-nodes) in the cluster.</li><li>The number of suspect nodes in the cluster. A node is considered a suspect node if it's liveness status is unavailable or the node is in the process of decommissioning.</li><li>The number of [dead nodes](admin-ui-access-and-navigate.html#dead-nodes) in the cluster.</li>
Replication Status | <ul><li>The total number of ranges in the cluster.</li><li>The number of [under-replicated ranges](admin-ui-replication-dashboard.html#review-of-cockroachdb-terminology) in the cluster. A non-zero number indicates an unstable cluster.</li><li>The number of [unavailable ranges](admin-ui-replication-dashboard.html#review-of-cockroachdb-terminology) in the cluster. A non-zero number indicates an unstable cluster.</li>

## Node List

To see basic details about the nodes in your cluster, select **Node List** from the **View** drop-down box below the Cluster Overview panel. 
<img src="{{ 'images/admin_ui_nodes_page.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

#### Live Nodes
Live nodes are nodes that are online and responding. They are marked with a green dot. If a node is removed or dies, the dot turns yellow to indicate that it is not responding. If the node remains unresponsive for a certain amount of time (5 minutes by default), the node turns red and is moved to the [**Dead Nodes**](#dead-nodes) section, indicating that it is no longer expected to come back.

The following details are shown for each live node:

Column | Description
-------|------------
ID | The ID of the node.
Address | The address of the node. You can click on the address to view further details about the node.
Uptime | How long the node has been running.
Bytes | The used capacity for the node.
Replicas | The number of replicas on the node.
Mem Usage | The memory usage for the node.
Version | The build tag of the CockroachDB version installed on the node.
Logs | Click **Logs** to see the logs for the node.

#### Dead Nodes

Nodes are considered dead once they have not responded for a certain amount of time (5 minutes by default). At this point, the automated repair process starts, wherein CockroachDB automatically rebalances replicas from the dead node, using the unaffected replicas as sources. See [Stop a Node](stop-a-node.html#how-it-works) for more information.

The following details are shown for each dead node:

Column | Description
-------|------------
ID | The ID of the node.
Address | The address of the node. You can click on the address to view further details about the node.
Down Since | How long the node has been down.

#### Decommissioned Nodes

<span class="version-tag">New in v1.1:</span> Nodes that have been decommissioned for permanent removal from the cluster are listed in the **Decommissioned Nodes** table.

<img src="{{ 'images/cluster-status-after-decommission2.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

When you decommission a node, CockroachDB lets the node finish in-flight requests, rejects any new requests, and transfers all range replicas and range leases off the node so that it can be safely shut down. See [Remove Nodes](remove-nodes.html) for more information.

## Node Map

The **Node Map** is an [enterprise-only](enterprise-licensing.html) feature that gives you a visual representation of the geographical configuration of your cluster. To configure and understand the Node Map, see [Node Map](admin-ui-node-map.html).