---
title: Cluster Overview Page
toc: true
redirect_from: admin-ui-cluster-overview-page.html
---

The **Cluster Overview** page of the DB Console displays key metrics about your cluster and individual nodes. These include: 

- Liveness status
- Replication status
- Uptime
- Hardware usage

If you have an [enterprise license](enterprise-licensing.html), you can enable the [Node Map](#node-map-enterprise) view for a visual representation of your cluster's geographic layout.

{{site.data.alerts.callout_success}}
Enter your email in the banner at the top to receive updates on CockroachDB [releases](../releases/).
{{site.data.alerts.end}}

## Cluster Overview panel

Use the **Cluster Overview** panel to quickly assess the capacity and health of your cluster.

<img src="{{ 'images/v21.1/ui-cluster-overview-panel.png' | relative_url }}" alt="DB Console cluster overview" style="border:1px solid #eee;max-width:100%" />

Metric | Description
--------|----
Capacity Usage | <ul><li>Used: The total disk space in use by CockroachDB data across all nodes. This excludes the disk space used by the Cockroach binary, operating system, and other system files.</li><li>Usable: The total disk space usable by CockroachDB data across all nodes. This cannot exceed the store size, if one has been set using [`--store`](cockroach-start.html#store).</li></ul>See [Capacity metrics](#capacity-metrics) for details on how these values are calculated.
Node Status | <ul><li>The number of `LIVE` nodes in the cluster.</li><li>The number of `SUSPECT` nodes in the cluster. A node is considered suspect if its [liveness status is unavailable](cluster-setup-troubleshooting.html#node-liveness-issues) or the node is in the process of [decommissioning](#decommissioned-nodes).</li><li>The number of `DEAD` nodes in the cluster.</li>
Replication Status | <ul><li>The total number of [ranges](architecture/overview.html#glossary) in the cluster.</li><li>The number of [under-replicated ranges](ui-replication-dashboard.html#review-of-cockroachdb-terminology) in the cluster. A non-zero number indicates an unstable cluster.</li><li>The number of [unavailable ranges](ui-replication-dashboard.html#review-of-cockroachdb-terminology) in the cluster. A non-zero number indicates an unstable cluster.</li>

### Capacity metrics

The [Cluster Overview](#cluster-overview-panel), [Node List](#node-list), and [Node Map](#node-map-enterprise) display **Capacity Usage** by the CockroachDB [store](architecture/storage-layer.html) (the directory on each node where CockroachDB reads and writes its data) as a percentage of the disk space that is **usable** on the cluster, locality, or node.

Usable disk space is constrained by the following:

- The maximum store size, which may be specified using the [`--store`](cockroach-start.html#store) flag when starting nodes. If no store size has been explicitly set, the actual disk capacity is used as the limit. This value is displayed on the Capacity graph in the [Storage dashboard](ui-storage-dashboard.html#capacity).
- Any disk space occupied by non-CockroachDB data. This may include the operating system and other system files, as well as the Cockroach binary itself.

The DB Console thus calculates **usable** disk space as the sum of empty disk space, up to the value of the maximum store size, and disk space that is already being **used** by CockroachDB data.

{{site.data.alerts.callout_info}}
{% include {{ page.version.version }}/misc/available-capacity-metric.md %}
{{site.data.alerts.end}}

## Node List

The **Node List** groups nodes by locality. The lowest-level locality tier is used to organize the Node List. Hover over a locality to see all localities for the group of nodes.

{{site.data.alerts.callout_success}}
We recommend [defining `--locality` flags when starting nodes](cockroach-start.html#locality). CockroachDB uses locality to distribute replicas and mitigate [network latency](ui-network-latency-page.html). Locality is also a prerequisite for enabling the [Node Map](#node-map-enterprise).
{{site.data.alerts.end}}

### Node status

Each locality and node is displayed with its current operational status.

Locality Status | Description
-------|------------
`LIVE` | All nodes in the locality are live.
`WARNING` | Locality has 1 or more `SUSPECT`, `DECOMMISSIONING`, or `DEAD` nodes (red indicates a dead node).

Node Status | Description
-------|------------
`LIVE` | Node is online and updating its liveness record.
`SUSPECT` | Node has an [unavailable liveness status](cluster-setup-troubleshooting.html#node-liveness-issues).
`DECOMMISSIONING` | Node is in the [process of decommissioning](remove-nodes.html#how-it-works).
`DECOMMISSIONED` | Node has completed decommissioning, has been stopped, and has not [updated its liveness record](cluster-setup-troubleshooting.html#node-liveness-issues) for 5 minutes.
`DEAD` | Node has not [updated its liveness record](cluster-setup-troubleshooting.html#node-liveness-issues) for 5 minutes.

{{site.data.alerts.callout_info}}
Nodes are considered dead once they have not [updated their liveness record](cluster-setup-troubleshooting.html#node-liveness-issues) for a certain amount of time (5 minutes by default). At this point, the [automated repair process](cockroach-quit.html#how-it-works) starts, wherein CockroachDB rebalances replicas from dead nodes to live nodes, using the unaffected replicas as sources. 
{{site.data.alerts.end}}

### Node details

The following details are also shown.

<img src="{{ 'images/v21.1/ui-node-list.png' | relative_url }}" alt="DB Console node list" style="border:1px solid #eee;max-width:100%" />

Column | Description
-------|------------
Node Count | Number of nodes in the locality.
Nodes | Nodes are grouped by locality and displayed with their address and node ID (the ID is the number that is prepended by `n`). Click the address to view node statistics. Hover over a row and click **Logs** to see the node's log.
Uptime | Amount of time the node has been running.
Replicas | Number of replicas on the node or in the locality.
Capacity Usage | Percentage of usable disk space occupied by CockroachDB data on the node or in the locality. See [Capacity metrics](#capacity-metrics).
Memory Usage | Memory used by CockroachDB as a percentage of the total memory on the node or in the locality.
CPUs | Number of vCPUs on the machine.
Version | Build tag of the CockroachDB version installed on the node.

### Decommissioned Nodes

Nodes that have been [decommissioned](remove-nodes.html#how-it-works) will be listed in the table of **Recently Decommissioned Nodes**, indicating that they are removed from the cluster. You can see the full history of decommissioned nodes by clicking "View all decommissioned nodes".

<img src="{{ 'images/v21.1/ui-decommissioned-nodes.png' | relative_url }}" alt="DB Console node list" style="border:1px solid #eee;max-width:100%" />

{{site.data.alerts.callout_info}}
When you initiate the [decommissioning process](remove-nodes.html#how-it-works) on a node, CockroachDB transfers all range replicas and range leases off the node so that it can be safely shut down.
{{site.data.alerts.end}}

## Node Map (Enterprise)

The **Node Map** is an [enterprise](enterprise-licensing.html) feature that visualizes the geographical configuration of your cluster. It requires that [`--locality` flags have been defined](cockroach-start.html#locality) for your nodes.

For guidance on enabling and configuring the node map, see [Enable the Node Map](enable-node-map.html).

<img src="{{ 'images/v21.1/ui-node-map.png' | relative_url }}" alt="DB Console Summary Panel" style="border:1px solid #eee;max-width:90%" />

The Node Map uses the longitude and latitude of each locality to position the components on the map. The map is populated with [**locality components**](#locality-component) and [**node components**](#node-component).

### Locality component

A locality component represents capacity, CPU, and QPS metrics for a given locality.

The map shows the components for the highest-level locality tier (e.g., region). You can click on the **Node Count** of a locality component to view any lower-level localities (e.g., availability zone). 

For details on how **Capacity Usage** is calculated, see [Capacity metrics](#capacity-metrics).

<img src="{{ 'images/v21.1/ui-region-component.png' | relative_url }}" alt="DB Console Summary Panel" style="border:1px solid #eee;max-width:90%" />

{{site.data.alerts.callout_info}}
On multi-core systems, the displayed CPU usage can be greater than 100%. Full utilization of 1 core is considered as 100% CPU usage. If you have _n_ cores, then CPU usage can range from 0% (indicating an idle system) to (_n_ * 100)% (indicating full utilization).
{{site.data.alerts.end}}

### Node component

A node component represents capacity, CPU, and QPS metrics for a given node.

Node components are accessed by clicking on the **Node Count** of the lowest-level [locality component](#locality-component). 

For details on how **Capacity Usage** is calculated, see [Capacity metrics](#capacity-metrics).

<img src="{{ 'images/v21.1/ui-node-components.png' | relative_url }}" alt="DB Console Summary Panel" style="border:1px solid #eee;max-width:90%" />

{{site.data.alerts.callout_info}}
On multi-core systems, the displayed CPU usage can be greater than 100%. Full utilization of 1 core is considered as 100% CPU usage. If you have _n_ cores, then CPU usage can range from 0% (indicating an idle system) to (_n_ * 100)% (indicating full utilization).
{{site.data.alerts.end}}

## See also

- [Production Checklist](recommended-production-settings.html)
- [Locality](cockroach-start.html#locality)
- [Troubleshooting Overview](troubleshooting-overview.html)
- [Support Resources](support-resources.html)
- [Raw Status Endpoints](monitoring-and-alerting.html#raw-status-endpoints)
