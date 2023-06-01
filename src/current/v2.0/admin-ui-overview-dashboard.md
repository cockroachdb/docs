---
title: Overview Dashboard
summary: The Overview dashboard lets you monitor important SQL performance, replication, and storage metrics.
toc: true
---

The **Overview** dashboard lets you monitor important SQL performance, replication, and storage metrics. To view this dashboard, [access the Admin UI](admin-ui-access-and-navigate.html#access-the-admin-ui) and click **Metrics** on the left-hand navigation bar. The **Overview** dashboard is displayed by default. 


The **Overview** dashboard displays the following time series graphs:

## SQL Queries

<img src="{{ 'images/v2.0/admin_ui_sql_queries.png' | relative_url }}" alt="CockroachDB Admin UI SQL Queries graph" style="border:1px solid #eee;max-width:100%" />

- In the node view, the SQL Queries graph shows the current moving average, over the last 10 seconds, of the number of `SELECT`/`INSERT`/`UPDATE`/`DELETE` queries per second issued by SQL clients on the node.

- In the cluster view, the graph shows the sum of the per-node averages, that is, an aggregate estimation of the current query load over the cluster, assuming the last 10 seconds of activity per node are representative of this load.

## Service Latency: SQL, 99th percentile

<img src="{{ 'images/v2.0/admin_ui_service_latency_99_percentile.png' | relative_url }}" alt="CockroachDB Admin UI Service Latency graph" style="border:1px solid #eee;max-width:100%" />

Service latency is calculated as the time between when the cluster receives a query and finishes executing the query. This time does not include returning results to the client.

- In the node view, the graph shows the 99th [percentile](https://en.wikipedia.org/wiki/Percentile#The_normal_distribution_and_percentiles) of service latency for the node.

- In the cluster view, the graph shows the 99th [percentile](https://en.wikipedia.org/wiki/Percentile#The_normal_distribution_and_percentiles) of service latency across all nodes in the cluster.

## Replicas per Node

<img src="{{ 'images/v2.0/admin_ui_replicas_per_node.png' | relative_url }}" alt="CockroachDB Admin UI Replicas per node graph" style="border:1px solid #eee;max-width:100%" />

Ranges are subsets of your data, which are replicated to ensure survivability. Ranges are replicated to a configurable number of CockroachDB nodes.

- In the node view, the graph shows the number of range replicas on the selected node.

- In the cluster view, the graph shows the number of range replicas on each node in the cluster.

For details about how to control the number and location of replicas, see [Configure Replication Zones](configure-replication-zones.html).

{{site.data.alerts.callout_info}}The timeseries data used to power the graphs in the admin UI is stored within the cluster and accumulates for 30 days before it starts getting truncated. As a result, for the first 30 days or so of a cluster's life, you will see a steady increase in disk usage and the number of ranges even if you aren't writing data to the cluster yourself. For more details, see this <a href="operational-faqs.html#why-is-disk-usage-increasing-despite-lack-of-writes">FAQ</a>.{{site.data.alerts.end}}

## Capacity

<img src="{{ 'images/v2.0/admin_ui_capacity.png' | relative_url }}" alt="CockroachDB Admin UI Capacity graph" style="border:1px solid #eee;max-width:100%" />

You can monitor the **Capacity** graph to determine when additional storage is needed.

- In the node view, the graph shows the maximum allocated capacity, available storage capacity, and capacity used by CockroachDB for the selected node.

- In the cluster view, the graph shows the maximum allocated capacity, available storage capacity, and capacity used by CockroachDB across all nodes in the cluster.

On hovering over the graph, the values for the following metrics are displayed:

Metric | Description
--------|----
Capacity | The maximum storage capacity allocated to CockroachDB. You can configure the maximum allocated storage capacity for CockroachDB using the <code>--store</code> flag. For more information, see [Start a Node](start-a-node.html#store).
Available | The free storage capacity available to CockroachDB.
Used | Disk space used by the data in the CockroachDB store. Note that this value is less than (Capacity - Available) because Capacity and Available metrics consider the entire disk and all applications on the disk including CockroachDB, whereas Used metric tracks only the store's disk usage.

{{site.data.alerts.callout_info}}
{% include v2.0/misc/available-capacity-metric.md %}
{{site.data.alerts.end}}
