---
title: Cluster Overview Page
toc: true
---

The **Cluster Overview** page of the Admin UI displays key metrics about your cluster and individual nodes. These include liveness status, replication status, uptime, and hardware usage.

If you have an [enterprise license](enterprise-licensing.html), you can enable the [Node Map](#node-map-enterprise) view for a visual representation of your cluster.

## Cluster Overview panel

Use the **Cluster Overview** panel to quickly assess the capacity and health of your cluster.

<img src="{{ 'images/v20.1/admin-ui-cluster-overview-panel.png' | relative_url }}" alt="CockroachDB Admin UI cluster overview" style="border:1px solid #eee;max-width:100%" />

Metric | Description
--------|----
Capacity Usage | <ul><li>Used capacity: The total disk space in use by CockroachDB data across all nodes. This is also shown as a percentage of the total usable capacity across all nodes, and excludes the disk space used by the Cockroach binary, operating system, and other system files.</li><li>Usable capacity: The total disk space reserved for CockroachDB data. This is defined by [`--store`](cockroach-start.html#store) and is distinct from the total disk size of your machines.</li></ul>
Node Status | <ul><li>The number of `LIVE` nodes in the cluster.</li><li>The number of `SUSPECT` nodes in the cluster. A node is considered suspect if its [liveness status is unavailable](cluster-setup-troubleshooting.html#node-liveness-issues) or the node is in the process of [decommissioning](#decommissioned-nodes).</li><li>The number of `DEAD` nodes in the cluster.</li>
Replication Status | <ul><li>The total number of [ranges](architecture/overview.html#glossary) in the cluster.</li><li>The number of [under-replicated ranges](admin-ui-replication-dashboard.html#review-of-cockroachdb-terminology) in the cluster. A non-zero number indicates an unstable cluster.</li><li>The number of [unavailable ranges](admin-ui-replication-dashboard.html#review-of-cockroachdb-terminology) in the cluster. A non-zero number indicates an unstable cluster.</li>

## Node List

The **Node List** groups nodes by locality. The highest-level locality tier is used to organize the Node List. Hover over a locality to see all localities for the group of nodes.

{{site.data.alerts.callout_success}}
We recommend [defining `--locality` flags when starting nodes](cockroach-start.html#locality). CockroachDB uses locality to distribute replicas and mitigate [network latency](admin-ui-network-latency-page.html). Locality is also a prerequisite for enabling the [Node Map](#node-map-enterprise).
{{site.data.alerts.end}}

### Node status

Each locality and node is displayed with its current operational status.

Locality Status | Description
-------|------------
`LIVE` | All nodes in the locality are live.
`WARNING` | Locality has 1 or more `SUSPECT`, `DECOMMISSIONING`, or `DEAD` nodes (red indicates a dead node).

Node Status | Description
-------|------------
`LIVE` | Node is online and responding.
`SUSPECT` | Node has an [unavailable liveness status](cluster-setup-troubleshooting.html#node-liveness-issues).
`DECOMMISSIONING` | Node is in the [process of decommissioning](remove-nodes.html#how-it-works).
`DECOMMISSIONED` | Node has been decommissioned for permanent removal from the cluster.
`DEAD` | Node has not responded for 5 minutes.

{{site.data.alerts.callout_info}}
Nodes are considered dead once they have not responded for a certain amount of time (5 minutes by default). At this point, the [automated repair process](cockroach-quit.html#how-it-works) starts, wherein CockroachDB rebalances replicas from dead nodes to live nodes, using the unaffected replicas as sources. 
{{site.data.alerts.end}}

### Node details

The following details are also shown.

<img src="{{ 'images/v20.1/admin-ui-node-list.png' | relative_url }}" alt="CockroachDB Admin UI node list" style="border:1px solid #eee;max-width:100%" />

Column | Description
-------|------------
Node Count | Number of nodes in the locality.
Nodes | Nodes are grouped by locality and displayed with their address. Click the address to view node statistics. Hover over a row and click **Logs** to see the node's log ([requires `admin` privileges](admin-ui-overview.html#admin-ui-access) on secure clusters).
Uptime | Amount of time the node has been running.
Replicas | Number of replicas on the node or in the locality.
Capacity Usage | Disk space used by CockroachDB data as a percentage of the usable capacity on the node or in the locality.
Memory Usage | Memory used by CockroachDB as a percentage of the total memory on the node or in the locality.
CPUs | Number of vCPUs on the machine.
Version | Build tag of the CockroachDB version installed on the node.

### Decommissioned Nodes

Nodes that have been decommissioned for permanent removal from the cluster are listed in the table of **Recently Decommissioned Nodes**. You can see the full history of decommissioned nodes by clicking **View all decommissioned nodes**.

<img src="{{ 'images/v20.1/admin-ui-decommissioned-nodes.png' | relative_url }}" alt="CockroachDB Admin UI node list" style="border:1px solid #eee;max-width:100%" />

{{site.data.alerts.callout_info}}
When you [decommission a node](remove-nodes.html), CockroachDB lets the node finish in-flight requests, rejects any new requests, and transfers all range replicas and range leases off the node so that it can be safely shut down.
{{site.data.alerts.end}}

## Node Map (Enterprise)

The **Node Map** is an [enterprise](enterprise-licensing.html) feature that visualizes the geographical configuration of your cluster. It requires that [`--locality` flags have been defined](cockroach-start.html#locality) for your nodes.

For guidance on enabling and configuring the node map, see [Enable the Node Map](enable-node-map.html).

<img src="{{ 'images/v20.1/admin-ui-node-map.png' | relative_url }}" alt="CockroachDB Admin UI Summary Panel" style="border:1px solid #eee;max-width:90%" />

The Node Map is populated with **locality components** and **node components**, using the latitude and longitude of each locality to position the components on the map.

### Locality component

The map shows the components for the highest-level locality tier (e.g., region). You can click on the **Node Count** of a locality component to view any lower-level localities (e.g., datacenter).

<img src="{{ 'images/v20.1/admin-ui-region-component.png' | relative_url }}" alt="CockroachDB Admin UI Summary Panel" style="border:1px solid #eee;max-width:90%" />

{{site.data.alerts.callout_info}}
On multi-core systems, the displayed CPU usage can be greater than 100%. Full utilization of 1 core is considered as 100% CPU usage. If you have _n_ cores, then CPU usage can range from 0% (indicating an idle system) to (_n_ * 100)% (indicating full utilization).
{{site.data.alerts.end}}

### Node component

Node components are accessed by clicking on the **Node Count** of the lowest-level locality component. 

<img src="{{ 'images/v20.1/admin-ui-node-components.png' | relative_url }}" alt="CockroachDB Admin UI Summary Panel" style="border:1px solid #eee;max-width:90%" />

{{site.data.alerts.callout_info}}
On multi-core systems, the displayed CPU usage can be greater than 100%. Full utilization of 1 core is considered as 100% CPU usage. If you have _n_ cores, then CPU usage can range from 0% (indicating an idle system) to (_n_ * 100)% (indicating full utilization).
{{site.data.alerts.end}}

## See also

- [Production Checklist](recommended-production-settings.html)
- [Locality](cockroach-start.html#locality)
- [Troubleshooting Overview](troubleshooting-overview.html)
- [Support Resources](support-resources.html)
- [Raw Status Endpoints](monitoring-and-alerting.html#raw-status-endpoints)