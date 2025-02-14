---
title: Monitor and Analyze Transaction Contention
summary: How to monitor transaction contention using console, metrics, and crdb_internal tables. How to analyze transaction contention using crdb_internal tables.
toc: true
---

It is important to understand where [transaction contention]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#transaction-contention) is occurring and how much of an impact it has on your workload. Contention is a normal part of database operations. In many cases, it has limited impact on a workload. For example, a large number of contention events that have a very short duration, may not cause a workload impact. Similarly, a small number of contention events with larger duration may be acceptable if they occur off the “user path”. However, when contention substantially contributes to query latency, then it should be addressed.

This page shows how to monitor and analyze two types of contention: [lock contention]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#transaction-contention) and [serializable conflicts]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#transaction-contention). These types of contention are exposed via different observability mechanisms:

- [Console](#monitor-using-console)
- [Metrics](#monitor-using-metrics)
- [`crdb_internal` tables](#monitor-using-crdb_internal-tables)

The [Continuous monitoring](#continuous-monitoring) section provides further considerations on identifying when contention occurs in your workload.

The remaining sections address analyzing contention once identified:

- [Analyze using crdb_internal tables](#analyze-using-crdb_internal-tables): A process to determine which workload and queries are involved in the contention.
- [Analysis of production scenario](#analysis-of-production-scenario): A real-life application of the previously described analysis process.
- [Analyze using Insights page](#analyze-using-insights-page): Basic examples of lock contention are addressed.

## Monitor using console

The [CockroachDB Cloud Console]({% link cockroachcloud/cluster-overview-page.md %}) and [DB Console]({% link {{ page.version.version }}/ui-overview.md %}) provide monitoring of contention using the:

- [SQL Statement Contention graph](#sql-statement-contention-graph)
- [SQL Activity](#sql-activity)
- [Insights page](#insights-page)

{{site.data.alerts.callout_info}}
Contention metrics typically are exposed with count and duration information. Both lock contention and serializable conflicts will be recorded in count-related metrics, but only lock contention will be included in duration-related metrics.
{{site.data.alerts.end}}

### SQL Statement Contention graph

On the Metrics page, SQL dashboard, the SQL Statement Contention graph ([CockroachDB Cloud Console]({% link cockroachcloud/metrics-sql.md %}#sql-statement-contention) or [DB Console]({% link {{ page.version.version }}/ui-sql-dashboard.md %}#sql-statement-contention)) shows the rate of contention events per second across the cluster. This graph is based on the `sql.distsql.contended_queries.count` metric.

In the DB Console, in the cluster view, this rate is averaged across all nodes, which sometimes makes it difficult to interpret. When viewing an individual node, it shows the rate for that single node.

The following image from the DB Console was taken from a cluster running more than 50,000 queries per second with around 2 contention events per second. This contention is unlikely to have an impact on the workload.

<img src="{{ 'images/v25.1/contention-1.png' | relative_url }}" alt="DB Console SQL Statement Contention graph" style="border:1px solid #eee;max-width:100%" />

### SQL Activity

SQL Activity has per statement and per transaction contention information.

#### Statements page

The Statements page ([CockroachDB Cloud Console]({% link cockroachcloud/statements-page.md %}) or [DB Console]({% link {{ page.version.version }}/ui-statements-page.md %})) shows statements that were involved in contention events. To view these statements, change the search criteria to view the top 100 [statement fingerprints]({% link {{ page.version.version }}/ui-statements-page.md %}#sql-statement-fingerprints) by Contention Time, then sort descending by Contention Time column.

The Contention Time column shows the average and standard deviation for the time spent in contention. As noted earlier, only lock contention events are included in the contention time.

The following image shows the Statements page with the top 3 statement fingerprints by Contention Time in a cluster containing the test data from the [Analyze using `crdb_internal` tables](#analyze-using-crdb_internal-tables) section.

<img src="{{ 'images/v25.1/contention-2.png' | relative_url }}" alt="Statements page by Contention Time" style="border:1px solid #eee;max-width:100%" />

#### Transactions page

The Transactions page ([CockroachDB Cloud Console]({% link cockroachcloud/transactions-page.md %}) or [DB Console]({% link {{ page.version.version }}/ui-transactions-page.md %})) shows transaction that were involved in contention events. To view these transactions, change the search criteria to view the top 100 transaction fingerprints by Contention Time, then sort descending by Contention Time column.

The Contention Time column shows the average and standard deviation for the time spent in contention. As noted earlier, only lock contention events are included in the contention time.

The following image shows the Transactions page with the top 3 transactions fingerprints by Contention Time in a cluster containing the test data in the [Analyze using `crdb_internal` tables](#analyze-using-crdb_internal-tables) section.

<img src="{{ 'images/v25.1/contention-3.png' | relative_url }}" alt="Transactions page by Contention Time" style="border:1px solid #eee;max-width:100%" />

### Insights page

The Insights page ([CockroachDB Cloud Console]({% link cockroachcloud/insights-page.md %}) or [DB Console]({% link {{ page.version.version }}/ui-insights-page.md %})) displays a variety of [workload insights]({% link {{ page.version.version }}/ui-insights-page.md %}#workload-insights-tab) on statement and transaction executions related to transaction contention:

- [Slow Execution]({% link {{ page.version.version }}/ui-insights-page.md %}#slow-execution)

    To be identified as a Slow Execution, the statement or transaction must meet one of the two following criteria:
    
    - The execution took longer than the configured [`sql.insights.latency_threshold`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-sql-insights-latency-threshold).
    - Anomaly detection is enabled ([`sql.insights.anomaly_detection.enabled`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-sql-insights-anomaly-detection-enabled)) and the execution was greater than twice the median execution latency and higher than [`sql.insights.anomaly_detection.latency_threshold`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-sql-insights-anomaly-detection-latency-threshold).

- [High Contention]({% link {{ page.version.version }}/ui-insights-page.md %}#high-contention)

    After the Slow Execution criteria is met, the execution will be identified as High Contention if a significant part of the slow execution time was due to contention.

- [Failed Execution]({% link {{ page.version.version }}/ui-insights-page.md %}#slow-execution)

    A statement or transaction that failed due to a serialization error is identified as a Failed Execution. If the serialization error was due to contention, there is a conflicting or blocking transaction recorded. The execution details will show the conflicting transaction.

Several [workload insights settings]({% link {{ page.version.version }}/ui-insights-page.md %}#workload-insights-settings) determine how long workload insights are persisted. If clusters are generating a large number of insights, insights may only be persisted for a short period of time. The [`sql.insights.execution_insights_capacity`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-sql-insights-execution-insights-capacity) setting determines the maximum number of insights stored per node, and the [`sql.contention.event_store.capacity`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-sql-contention-event-store-capacity) setting determines the maximum storage used per node for contention events.

## Monitor using metrics

As part of normal operation, CockroachDB continuously records metrics that are often useful in troubleshooting performance. How metrics are exposed depends on deployment, refer to: 

- [Export Metrics From a CockroachDB Standard Cluster]({% link cockroachcloud/export-metrics.md %})
- [Export Metrics From a CockroachDB Advanced Cluster]({% link cockroachcloud/export-metrics-advanced.md %})
- [Prometheus endpoint for a self-hosted cluster]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#prometheus-endpoint)

The following metrics related to contention are available:

CockroachDB Metric Name | Description | Type | Unit
------------------------|-------------|------|------
`sql.distsql.contended_queries.count` | Number of SQL queries that experienced contention<br><br>Note: Only lock contention counts are included in this metric. | COUNTER | COUNT
`sql.distsql.cumulative_contention_nanos` | Cumulative contention across all queries (in nanoseconds)<br><br>Note: Only lock contention durations are included in this metric. | COUNTER | NANOSECOND 
`txn.restarts` | Number of restarted KV transactions | HISTOGRAM | COUNT
`txn.restarts.asyncwritefailure` | Number of restarts due to async consensus writes that failed to leave intents | COUNTER | COUNT
`txn.restarts.commitdeadlineexceeded` | Number of restarts due to a transaction exceeding its deadline | COUNTER | COUNT
`txn.restarts.readwithinuncertainty` | Number of restarts due to reading a new value within the uncertainty interval | COUNTER | COUNT
`txn.restarts.serializable` | Number of restarts due to a forwarded commit timestamp and isolation=SERIALIZABLE | COUNTER | COUNT
`txn.restarts.txnaborted` | Number of restarts due to an abort by a concurrent transaction (usually due to deadlock) | COUNTER | COUNT
`txn.restarts.txnpush` | Number of restarts due to a transaction push failure | COUNTER | COUNT
`txn.restarts.unknown` | Number of restarts due to a unknown reasons | COUNTER | COUNT
`txn.restarts.writetooold` | Number of restarts due to a concurrent writer committing first | COUNTER | COUNT

{{site.data.alerts.callout_info}}
Because these metrics are not broken down by database, they can be difficult to interpret.
{{site.data.alerts.end}}

## Monitor using `crdb_internal` tables

The [`crdb_internal`]({% link {{ page.version.version }}/crdb-internal.md %}) system catalog is a schema that contains information about internal objects, processes, and metrics related to a specific database. `crdb_internal` tables are read-only.

### `transaction_contention_events`

The [`crdb_internal.transaction_contention_events`]({% link {{ page.version.version }}/crdb-internal.md %}#transaction_contention_events) virtual table contains information about historical transaction contention events. By default, lock contention events and serializable conflicts that have a blocking transaction are persisted in memory on each node and exposed via SQL by this virtual table. 

{{site.data.alerts.callout_danger}}
When the `crdb_internal.transaction_contention_events` virtual table is queried, RPCs are sent to every node in the cluster to get the in-memory events, which may be a somewhat expensive operation. Therefore, it is recommended that the table is not polled on frequent intervals that could cause excessive resource usage.
{{site.data.alerts.end}}

Several cluster settings determine how events are logged to this table. For most uses, the default cluster settings are appropriate.

Setting | Type | Default | Description
--------|------|---------|-------------
`sql.contention.event_store.capacity` | byte size | `64 MiB` | the in-memory storage capacity per-node of contention event store
`sql.contention.event_store.duration_threshold` | duration | `0s` | minimum contention duration to cause the contention events to be collected into crdb_internal.transaction_contention_events. If `0`, always store.
`sql.contention.event_store.resolution_interval  ` | duration | `30s ` | the interval at which transaction fingerprint ID resolution is performed (set to 0 to disable)
`sql.contention.record_serialization_conflicts.enabled` | boolean | `true` | enables recording 40001 errors with conflicting txn meta as SERIALIZATION_CONFLICT contention events into crdb_internal.transaction_contention_events

The table is defined as follows:

``` sql
CREATE TABLE crdb_internal.transaction_contention_events (
    collection_ts TIMESTAMPTZ NOT NULL,
    blocking_txn_id UUID NOT NULL,
    blocking_txn_fingerprint_id BYTES NOT NULL,
    waiting_txn_id UUID NOT NULL,
    waiting_txn_fingerprint_id BYTES NOT NULL,
    contention_duration INTERVAL NOT NULL,
    contending_key BYTES NOT NULL,
    contending_pretty_key STRING NOT NULL,
    waiting_stmt_id STRING NOT NULL,
    waiting_stmt_fingerprint_id BYTES NOT NULL,
    database_name STRING NOT NULL,
    schema_name STRING NOT NULL,
    table_name STRING NOT NULL,
    index_name STRING NULL,
    contention_type STRING NOT NULL
)
```

The transaction and statement fingerprint IDs (`*_txn_fingerprint_id` and `*_stmt_fingerprint_id`) columns are hexadecimal values that can be used to look up the SQL and other information from the [`crdb_internal.transaction_statistics`]({% link {{ page.version.version }}/crdb-internal.md %}#transaction_statistics) and [`crdb_internal.statement_statistics`]({% link {{ page.version.version }}/crdb-internal.md %}#statement_statistics) tables. These should not be confused with the transaction and statement IDs (`*_txn_id` and `*_stmt_id`), which are unique for each transaction and statement execution.

The `crdb_internal.transaction_contention_events` table can be used to summarize the frequency and duration of contention events by database, schema, table and index. This can be useful for determining which workloads have the highest frequency and duration of contention events and which indexes they are occurring on. The table also contains information about specific transactions and statements involved in the contention event, allowing a deeper analysis of the contention event.

### Other tables

There are several other tables that can give insights into contention.

- [`crdb_internal.cluster_contended_indexes`]({% link {{ page.version.version }}/crdb-internal.md %}#cluster_contended_indexes)
- [`crdb_internal.cluster_contended_tables`]({% link {{ page.version.version }}/crdb-internal.md %}#cluster_contended_tables)
- [`crdb_internal.cluster_contended_keys`]({% link {{ page.version.version }}/crdb-internal.md %}#cluster_contended_keys)

    These are views based on `crdb_internal.transaction_contention_events` that group all events by index, table, and key, respectively. A start and end time cannot be provided, so they count every event that is currently stored. Because of this, they act more like counter metric, this may be misleading since high numbers do not necessarily represent a high contention rate.

- [`crdb_internal.cluster_locks`]({% link {{ page.version.version }}/crdb-internal.md %}#cluster_locks)
    
    This is a virtual table that contains information about locks held by transactions on specific keys. It only shows this information for locks held at the time the table is queried.
    
    {{site.data.alerts.callout_danger}}
    Similar to `crdb_internal.transaction_contention_events`, `crdb_internal.cluster_locks` triggers an RPC fan out to all nodes in the cluster to capture this information, so it can be a relatively expensive operation to query it.
    {{site.data.alerts.end}}

## Continuous monitoring

CockroachDB offers tools to monitor contention, but it is important to turn this data into actionable insights. The main question is: “Does contention significantly affect this workload?”. Ideally, continuous monitoring should answer this without manual effort.

At the cluster level, track how often contention happens compared to overall throughput. For example, divide the rate of contention events ([`sql.distsql.contended_queries.count`]({% link {{ page.version.version }}/metrics.md %}#sql.distsql.contended_queries.count) metric) by the total number of queries ([`sql.query.count`]({% link {{ page.version.version }}/metrics.md %}#sql.query.count) metric) to get the percentage of queries affected by contention. This can serve as a high-level indicator of view how frequently contention is encountered, but does not identify specific workloads.

If more than 1% of queries are affected by contention, use the analysis process described in [Analyze using `crdb_internal` tables](#analyze-using-crdb_internal-tables) to determine which workloads and queries are causing the issue.

{{site.data.alerts.callout_danger}}
Because querying the `crdb_internal.transaction_contention_events` table requires an expensive RPC fan-out, it is not recommended for use as a part of a continuous monitoring system.
{{site.data.alerts.end}}

## Analyze using `crdb_internal` tables



## Analysis of production scenario



## Analyze using Insights page



## See Also

- [Transaction contention best practices]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#transaction-contention)
- [Transaction contention performance tuning recipe]({% link {{ page.version.version }}/performance-recipes.md %}#transaction-contention)
- [Troubleshoot Lock Contention]({% link {{ page.version.version }}/troubleshoot-lock-contention.md %})
- [SQL Dashboard]({% link {{ page.version.version }}/ui-sql-dashboard.md %}) (DB Console) or [SQL metrics]({% link cockroachcloud/metrics-sql.md %}) (Cloud Console)
- Statements page ([CockroachDB Cloud Console]({% link cockroachcloud/statements-page.md %}) or [DB Console]({% link {{ page.version.version }}/ui-statements-page.md %}))
- Transactions page ([CockroachDB Cloud Console]({% link cockroachcloud/transactions-page.md %}) or [DB Console]({% link {{ page.version.version }}/ui-transactions-page.md %}))
- Insights page ([CockroachDB Cloud Console]({% link cockroachcloud/insights-page.md %}) or [DB Console]({% link {{ page.version.version }}/ui-insights-page.md %}))
- [`crdb_internal`]({% link {{ page.version.version }}/crdb-internal.md %})