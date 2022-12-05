---
title: Cluster Overview Page
toc: true
---

The **Cluster Overview** page of the Admin UI provides details of the cluster nodes and their liveness status, replication status, uptime, and key hardware metrics. [Enterprise users](enterprise-licensing.html) can enable and switch to the [Node Map](admin-ui-cluster-overview-page.html#node-map-enterprise) view.

## Cluster Overview Panel

<img src="{{ 'images/v19.1/admin-ui-cluster-overview-panel.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

The **Cluster Overview** panel provides the following metrics:

Metric | Description
--------|----
Capacity Usage | <ul><li>Used capacity: The storage capacity used by CockroachDB (represented as a percentage of total storage capacity allocated across all nodes).</li><li>Usable capacity: The space available for CockroachDB data storage (i.e., the storage capacity of the machine excluding the capacity used by the Cockroach binary, operating system, and other system files). </li></ul>
Node Status | <ul><li>The number of [live nodes](#live-nodes) in the cluster.</li><li>The number of suspect nodes in the cluster. A node is considered suspect if its liveness status is unavailable or the node is in the process of decommissioning.</li><li>The number of [dead nodes](#dead-nodes) in the cluster.</li>
Replication Status | <ul><li>The total number of [ranges](architecture/index.html#glossary) in the cluster.</li><li>The number of [under-replicated ranges](admin-ui-replication-dashboard.html#review-of-cockroachdb-terminology) in the cluster. A non-zero number indicates an unstable cluster.</li><li>The number of [unavailable ranges](admin-ui-replication-dashboard.html#review-of-cockroachdb-terminology) in the cluster. A non-zero number indicates an unstable cluster.</li>

## Node List

The **Node List** is the default view on the **Overview** page.
<img src="{{ 'images/v19.1/admin-ui-node-list.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

### Live Nodes
Live nodes are nodes that are online and responding. They are marked with a green dot. If a node is removed or dies, the dot turns yellow to indicate that it is not responding. If the node remains unresponsive for a certain amount of time (5 minutes by default), the node turns red and is moved to the [**Dead Nodes**](#dead-nodes) section, indicating that it is no longer expected to come back.

The following details are shown for each live node:

Column | Description
-------|------------
ID | The ID of the node.
Address | The address of the node. You can click on the address to view further details about the node.
Uptime | How long the node has been running.
Replicas | The number of replicas on the node.
CPUs | The number of CPU cores on the machine.
Capacity Usage | The storage capacity used by CockroachDB as a percentage of the total usable capacity on the node. The value is represented numerically and as a bar graph.
Mem Usage | The memory used by CockroachDB as a percentage of the total memory on the node. The value is represented numerically and as a bar graph.
Version | The build tag of the CockroachDB version installed on the node.
Logs | Click **Logs** to see detailed logs for the node. [Requires `admin` privileges](admin-ui-overview.html#admin-ui-access) on secure clusters.

### Dead Nodes

Nodes are considered dead once they have not responded for a certain amount of time (5 minutes by default). At this point, the automated repair process starts, wherein CockroachDB automatically rebalances replicas from the dead node, using the unaffected replicas as sources. See [Stop a Node](stop-a-node.html#how-it-works) for more information.

The following details are shown for each dead node:

Column | Description
-------|------------
ID | The ID of the node.
Address | The address of the node. You can click on the address to view further details about the node.
Down Since | How long the node has been down.

### Decommissioned Nodes

Nodes that have been decommissioned for removal from the cluster are listed in the **Decommissioned Nodes** table.

When you initiate the [decommissioning process](remove-nodes.html#how-it-works) on a node, CockroachDB transfers all range replicas and range leases off the node so that it can be safely shut down.

## Node Map (Enterprise)

The **Node Map** is an [enterprise-only](enterprise-licensing.html) feature that gives you a visual representation of the geographical configuration of your cluster.

<img src="{{ 'images/v19.1/admin-ui-node-map.png' | relative_url }}" alt="CockroachDB Admin UI Summary Panel" style="border:1px solid #eee;max-width:90%" />

The Node Map consists of the following components:

### Region component

<img src="{{ 'images/v19.1/admin-ui-region-component.png' | relative_url }}" alt="CockroachDB Admin UI Summary Panel" style="border:1px solid #eee;max-width:90%" />

{{site.data.alerts.callout_info}}
For multi-core systems, the user CPU percent can be greater than 100%. Full utilization of one core is considered as 100% CPU usage. If you have n cores, then the user CPU percent can range from 0% (indicating an idle system) to (n*100)% (indicating full utilization).
{{site.data.alerts.end}}

### Node component

<img src="{{ 'images/v19.1/admin-ui-node-components.png' | relative_url }}" alt="CockroachDB Admin UI Summary Panel" style="border:1px solid #eee;max-width:90%" />

{{site.data.alerts.callout_info}}
For multi-core systems, the user CPU percent can be greater than 100%. Full utilization of one core is considered as 100% CPU usage. If you have n cores, then the user CPU percent can range from 0% (indicating an idle system) to (n*100)% (indicating full utilization).
{{site.data.alerts.end}}

For guidance on enabling and using the node map, see [Enable Node Map](enable-node-map.html).

## See also

- [Troubleshooting Overview](troubleshooting-overview.html)
- [Support Resources](support-resources.html)
- [Raw Status Endpoints](monitoring-and-alerting.html#raw-status-endpoints)
