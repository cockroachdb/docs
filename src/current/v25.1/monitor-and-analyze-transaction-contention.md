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

The Statements page ([CockroachDB Cloud Console]({% link cockroachcloud/statements-page.md %}) or [DB Console]({% link {{ page.version.version }}/ui-statements-page.md %})) shows statements that were involved in contention events. To view these statements, change the search criteria to view the top 100 [statement fingerprints]({% link {{ page.version.version }}/ui-statements-page.md %}sql-statement-fingerprints) by Contention Time, then sort descending by Contention Time column.

The Contention Time column shows the average and standard deviation for the time spent in contention. As noted earlier, only lock contention events are included in the contention time.

The following image shows the Statements page with the top 3 statement fingerprints by Contention Time in a cluster containing the test data from the [Analyze using `crdb_internal` tables](#analyze-using-crdb_internal-tables) section.

<img src="{{ 'images/v25.1/contention-2.png' | relative_url }}" alt="Statements page by Contention Time" style="border:1px solid #eee;max-width:100%" />

#### Transactions page

The Transactions page ([CockroachDB Cloud Console]({% link cockroachcloud/transactions-page.md %}) or [DB Console]({% link {{ page.version.version }}/ui-transactions-page.md %})) shows transaction that were involved in contention events. To view these transactions, change the search criteria to view the top 100 transaction fingerprints by Contention Time, then sort descending by Contention Time column.

The Contention Time column shows the average and standard deviation for the time spent in contention. As noted earlier, only lock contention events are included in the contention time.

The following image shows the Transactions page with the top 3 transactions fingerprints by Contention Time in a cluster containing the test data in the [Analyze using `crdb_internal` tables](#analyze-using-crdb_internal-tables) section.

<img src="{{ 'images/v25.1/contention-3.png' | relative_url }}" alt="Transactions page by Contention Time" style="border:1px solid #eee;max-width:100%" />

### Insights page

The Insights page ([CockroachDB Cloud Console]({% link cockroachcloud/insights-page.md %}) or [DB Console]({% link {{ page.version.version }}/ui-insights-page.md %})) displays a variety of [workload insights]({% link {{ page.version.version }}/ui-insights-page.md %}workload-insights-tab) on statement and transaction executions related to transaction contention:

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

## Monitor using crdb_internal tables

## Continuous monitoring

## Analyze using crdb_internal tables

## Analysis of production scenario

## Analyze using Insights page

## See Also