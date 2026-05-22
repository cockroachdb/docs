---
title: Overview Dashboard
summary: The Overview dashboard lets you monitor important SQL performance, replication, and storage metrics.
toc: true
docs_area: reference.db_console
---

The **Overview** dashboard lets you monitor important SQL performance, replication, and storage metrics.

To view this dashboard, [access the DB Console]({% link {{ page.version.version }}/ui-overview.md %}#db-console-access) and click **Metrics** on the left-hand navigation bar. The **Overview** dashboard is displayed by default.

The time-series data displayed in DB Console graphs is stored within the CockroachDB cluster and steadily increases for the first several days of a cluster's life, before an automatic job begins to prune it. By default, time-series data is stored for at 10-second resolution for 10 days, and at 30-minute resolution for 90 days. For details about managing this process, see this [How Can I Reduce or Disable the Storage of Time-series Data?]({% link {{ page.version.version }}/operational-faqs.md %}#can-i-reduce-or-disable-the-storage-of-time-series-data). In a new cluster, you will observe a steady increase in disk usage and the number of ranges even if you aren't writing data to the cluster.

## Dashboard navigation

{% include {{ page.version.version }}/ui/ui-metrics-navigation.md %}

The **Overview** dashboard displays the following time series graphs.

## SQL Statements

- In the node view, the graph shows the 10-second average of the number of `SELECT`/`INSERT`/`UPDATE`/`DELETE` queries per second issued by SQL clients on the node.

- In the cluster view, the graph shows the sum of the per-node averages, that is, an aggregate estimation of the current query load over the cluster, assuming the last 10 seconds of activity per node are representative of this load.

See the [Statements page]({% link {{ page.version.version }}/ui-statements-page.md %}) for more details on the cluster's SQL statements.

Metrics: `sql.select.count`, `sql.update.count`, `sql.insert.count`, `sql.delete.count`

The following SQL statements update the `INSERT` metric (`sql.insert.count`):

- [`INSERT ... ON CONFLICT DO UPDATE ...`]({% link {{ page.version.version }}/insert.md %}#on-conflict-clause): Even when the `DO UPDATE` clause is actually executed, the root of the [abstract syntax tree (AST)]({% link {{ page.version.version }}/architecture/sql-layer.md %}#parsing) is used to increment the metric, rather than the actual execution details.

- [`UPSERT`]({% link {{ page.version.version }}/upsert.md %})

{{site.data.alerts.callout_info}}
[Data manipulation statements]({% link {{ page.version.version }}/sql-statements.md %}#data-manipulation-statements) other than  `SELECT`/`INSERT`/`UPDATE`/`DELETE`/`UPSERT` update the `sql.misc.count` metric, which is *not* displayed on this graph.
{{site.data.alerts.end}}

## Service Latency: SQL, 99th percentile

{% include {{ page.version.version }}/ui/ui-sql-latency-99th-percentile.md %}

## SQL Statement Contention

The statement contention metric is a counter that represents the number of statements that have experienced [contention]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#transaction-contention). If a statement experiences at least one contention "event" (i.e., the statement is forced to wait for another transaction), the counter is incremented at most once.

- In the node view, the graph shows the total number of SQL statements that experienced [contention]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#transaction-contention) on that node.

- In the cluster view, the graph shows the total number of SQL statements that experienced [contention]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#transaction-contention) across all nodes in the cluster.

See the [Statements page]({% link {{ page.version.version }}/ui-statements-page.md %}) for more details on the cluster's SQL statements.

## Replicas per Node

<img src="/docs/images/{{ page.version.version }}/ui_replicas_per_node.png" alt="DB Console Replicas per node graph" style="border:1px solid #eee;max-width:100%" />

Ranges are subsets of your data, which are replicated to ensure survivability. Ranges are replicated to a configurable number of CockroachDB nodes.

- In the node view, the graph shows the number of range replicas on the selected node.

- In the cluster view, the graph shows the number of range replicas on each node in the cluster.

For details about how to control the number and location of replicas, see [Replication Controls]({% link {{ page.version.version }}/configure-replication-zones.md %}).

## Capacity

<img src="/docs/images/{{ page.version.version }}/ui_capacity.png" alt="DB Console Capacity graph" style="border:1px solid #eee;max-width:100%" />

You can monitor the **Capacity** graph to determine when additional storage is needed (e.g., by [scaling your cluster]({% link {{ page.version.version }}/cockroach-start.md %})).

Metric | Description
--------|--------
**Capacity** | The maximum store size. This value may be set per node using [`--store`]({% link {{ page.version.version }}/cockroach-start.md %}#store). If a store size has not been set, this metric displays the actual disk capacity. See [Capacity metrics](#capacity-metrics).
**Available** | The free disk space available to CockroachDB data.
**Used** | The disk space in use by CockroachDB data. This excludes the Cockroach binary, operating system, and other system files.

{% include {{ page.version.version }}/prod-deployment/healthy-storage-capacity.md %}

### Capacity metrics

The **Capacity** graph displays disk usage by CockroachDB data in relation to the maximum [store]({% link {{ page.version.version }}/architecture/storage-layer.md %}) size, which is determined as follows:

- If a store size was specified using the [`--store`]({% link {{ page.version.version }}/cockroach-start.md %}#store) flag when starting nodes, this value is used as the limit for CockroachDB data.
- If no store size has been explicitly set, the actual disk capacity is used as the limit for CockroachDB data.

The **available** capacity thus equals the amount of empty disk space, up to the value of the maximum store size. The **used** capacity refers only to disk space occupied by CockroachDB data, which resides in the store directory on each node.

The disk usage of the Cockroach binary, operating system, and other system files is not shown on the **Capacity** graph.

{{site.data.alerts.callout_info}}
{% include {{ page.version.version }}/misc/available-capacity-metric.md %}
{{site.data.alerts.end}}

{% include {{ page.version.version }}/ui/ui-summary-events.md %}

## See also

- [Troubleshooting Overview]({% link {{ page.version.version }}/troubleshooting-overview.md %})
- [Support Resources]({% link {{ page.version.version }}/support-resources.md %})
- [Raw Status Endpoints]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#raw-status-endpoints)
