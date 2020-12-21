---
title: Overview Dashboard
summary: The Overview dashboard lets you monitor important SQL performance, replication, and storage metrics.
toc: true
redirect_from: admin-ui-overview-dashboard.html
---

The **Overview** dashboard lets you monitor important SQL performance, replication, and storage metrics. To view this dashboard, [access the DB Console](ui-overview.html#db-console-access) and click **Metrics** on the left-hand navigation bar. The **Overview** dashboard is displayed by default.

{% include {{ page.version.version }}/ui/ui-metrics-navigation.md %}

{{site.data.alerts.callout_info}}
All timestamps in the DB Console are shown in Coordinated Universal Time (UTC).
{{site.data.alerts.end}}

The **Overview** dashboard displays the following time series graphs:

## SQL Queries

<img src="{{ 'images/v21.1/ui_sql_queries.png' | relative_url }}" alt="DB Console SQL Queries graph" style="border:1px solid #eee;max-width:100%" />

- In the node view, the graph shows the 10-second average of the number of `SELECT`/`INSERT`/`UPDATE`/`DELETE` queries per second issued by SQL clients on the node.

- In the cluster view, the graph shows the sum of the per-node averages, that is, an aggregate estimation of the current query load over the cluster, assuming the last 10 seconds of activity per node are representative of this load.

## Service Latency: SQL, 99th percentile

<img src="{{ 'images/v21.1/ui_service_latency_99_percentile.png' | relative_url }}" alt="DB Console Service Latency graph" style="border:1px solid #eee;max-width:100%" />

Service latency is calculated as the time between when the cluster receives a query and finishes executing the query. This time does not include returning results to the client.

- In the node view, the graph shows the 99th [percentile](https://en.wikipedia.org/wiki/Percentile#The_normal_distribution_and_percentiles) of service latency for the node.

- In the cluster view, the graph shows the 99th [percentile](https://en.wikipedia.org/wiki/Percentile#The_normal_distribution_and_percentiles) of service latency across all nodes in the cluster.

## Replicas per Node

<img src="{{ 'images/v21.1/ui_replicas_per_node.png' | relative_url }}" alt="DB Console Replicas per node graph" style="border:1px solid #eee;max-width:100%" />

Ranges are subsets of your data, which are replicated to ensure survivability. Ranges are replicated to a configurable number of CockroachDB nodes.

- In the node view, the graph shows the number of range replicas on the selected node.

- In the cluster view, the graph shows the number of range replicas on each node in the cluster.

For details about how to control the number and location of replicas, see [Configure Replication Zones](configure-replication-zones.html).

{{site.data.alerts.callout_info}}
The timeseries data used to power the graphs in the DB Console is stored within the cluster and accumulates for 30 days before it starts getting truncated. As a result, for the first 30 days or so of a cluster's life, you will see a steady increase in disk usage and the number of ranges even if you aren't writing data to the cluster yourself. For more details, see this [FAQ](operational-faqs.html#why-is-disk-usage-increasing-despite-lack-of-writes).
{{site.data.alerts.end}}

## Capacity

<img src="{{ 'images/v21.1/ui_capacity.png' | relative_url }}" alt="DB Console Capacity graph" style="border:1px solid #eee;max-width:100%" />

You can monitor the **Capacity** graph to determine when additional storage is needed (e.g., by [scaling your cluster](cockroach-start.html)). 

Metric | Description
--------|--------
**Capacity** | The maximum store size. This value may be set per node using [`--store`](cockroach-start.html#store). If a store size has not been set, this metric displays the actual disk capacity. See [Capacity metrics](#capacity-metrics).
**Available** | The free disk space available to CockroachDB data.
**Used** | The disk space in use by CockroachDB data. This excludes the Cockroach binary, operating system, and other system files.

### Capacity metrics

The **Capacity** graph displays disk usage by CockroachDB data in relation to the maximum [store](architecture/storage-layer.html) size, which is determined as follows:

- If a store size was specified using the [`--store`](cockroach-start.html#store) flag when starting nodes, this value is used as the limit for CockroachDB data.
- If no store size has been explicitly set, the actual disk capacity is used as the limit for CockroachDB data.

The **available** capacity thus equals the amount of empty disk space, up to the value of the maximum store size. The **used** capacity refers only to disk space occupied by CockroachDB data, which resides in the store directory on each node.

The disk usage of the Cockroach binary, operating system, and other system files is not shown on the **Capacity** graph.

{{site.data.alerts.callout_info}}
{% include {{ page.version.version }}/misc/available-capacity-metric.md %}
{{site.data.alerts.end}}

{% include {{ page.version.version }}/ui/ui-summary-events.md %}

## See also

- [Troubleshooting Overview](troubleshooting-overview.html)
- [Support Resources](support-resources.html)
- [Raw Status Endpoints](monitoring-and-alerting.html#raw-status-endpoints)
