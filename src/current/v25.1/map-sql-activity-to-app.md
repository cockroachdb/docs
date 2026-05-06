---
title: Map SQL Activity using an Application Name
summary: How to set an application name and filter SQL activity associated with the application.
toc: true
docs_area: develop
---

CockroachDB enables you to programmatically create and tag your SQL connections with a custom name or label. This practice lets you to quickly identify which part of your application is potentially degraded due to database health and design. By identifying problematic transactions and statements, you can quickly trace back to parts of your applications that generated those transactions and statements for a holistic understanding of the application performance impact as well as potential mitigation and [optimization opportunities]({% link {{ page.version.version }}/make-queries-fast.md %}).

This page shows how to set and filter database workloads by application name.

## Set the application name

It is best practice to set the application name with CockroachDB. You can do this in the [connection string]({% link {{ page.version.version }}/connection-parameters.md %}#additional-connection-parameters) `postgres://root@<servername>:26257/mydb?application_name=movr_app` or at the [session level]({% link {{ page.version.version }}/set-vars.md %}):

{% include_cached copy-clipboard.html %}
~~~sql
SET application_name = movr_app;
~~~

## Filter database workloads by application name

Once you set the application name, the [DB Console]({% link {{ page.version.version }}/ui-overview.md %}) lets you [filter database workloads by application name]({% link {{ page.version.version }}/ui-statements-page.md %}#filter).

<img src="/docs/images/{{ page.version.version }}/movr-app.png" alt="Movr app filter" style="border:1px solid #eee;max-width:80%" />

If parts of your applications or known microservices are experiencing performance degradation, you can filter for the database workload tracing statements and transactions back to that part of your application directly in the DB Console. You can quickly identify whether there were database performance problems and if so, troubleshoot the issue using [SQL observability touch points](#trace-sql-activity-using-metrics) in the DB Console.

You can also programmatically filter `crdb_internal` tables [`crdb_internal.statement_statistics`]({% link {{ page.version.version }}/crdb-internal.md %}#statement_statistics) and [`crdb_internal.transaction_statistics`]({% link {{ page.version.version }}/crdb-internal.md %}#transaction_statistics) by application name. This example shows the first 60 characters of query text and statement statistics for queries associated with the `movr_app` application:

{% include_cached copy-clipboard.html %}
~~~sql
SELECT app_name, substring(metadata ->> 'query',1,60) AS statement_text,
   metadata -> 'distsql' AS is_distsql,
   metadata -> 'fullScan' AS has_full_scan,
   metadata -> 'vec' AS used_vec,
   statistics -> 'execution_statistics' -> 'contentionTime' -> 'mean' AS contention_time_mean,
   statistics -> 'statistics' -> 'cnt' AS execution_count,
   statistics -> 'statistics' -> 'firstAttemptCnt' AS num_first_attempts,
   statistics -> 'statistics' -> 'numRows' -> 'mean' AS num_rows_returned_mean,
   statistics -> 'statistics' -> 'rowsRead' -> 'mean' AS num_rows_read_mean,
   statistics -> 'statistics' -> 'runLat' -> 'mean' AS runtime_latency_mean
FROM movr.crdb_internal.statement_statistics
WHERE app_name = 'movr_app';
~~~

~~~
  app_name |                        statement_text                        | is_distsql | has_full_scan | used_vec | contention_time_mean | execution_count | num_first_attempts | num_rows_returned_mean | num_rows_read_mean | runtime_latency_mean
-----------+--------------------------------------------------------------+------------+---------------+----------+----------------------+-----------------+--------------------+------------------------+--------------------+------------------------
  movr_app | SELECT * FROM users                                          | true       | true          | true     |                    0 |               1 |                  1 | 5E+1                   | 5E+1               |              0.002202
  movr_app | SELECT name, count(rides.id) AS sum FROM users JOIN rides ON | true       | true          | true     |                    0 |               1 |                  1 | 1E+1                   | 5.5E+2             |              0.005338
...
~~~

## Trace SQL activity using metrics

Often signals to problems start at high-level metrics. The [SQL dashboard]({% link {{ page.version.version }}/ui-sql-dashboard.md %}) has metrics for [SQL sessions]({% link {{ page.version.version }}/ui-sql-dashboard.md %}#open-sql-sessions), [SQL statements]({% link {{ page.version.version }}/ui-sql-dashboard.md %}#active-sql-statements), [SQL statement errors]({% link {{ page.version.version }}/ui-sql-dashboard.md %}#sql-statement-errors), etc., that can quickly signify potential issues with your application.

The statement and transaction statistics described in the preceding section enable you to correlate high-level metrics with lower level SQL activity information where you can identify the specific statements and transactions that were running during that time.

## See also

- [SQL Activity]({% link {{ page.version.version }}/ui-overview.md %}#sql-activity)
- [SQL Performance Best Practices]({% link {{ page.version.version }}/performance-best-practices-overview.md %})
- [Troubleshoot Statement Behavior]({% link {{ page.version.version }}/query-behavior-troubleshooting.md %})
