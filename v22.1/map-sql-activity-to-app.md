---
title: Map SQL Activity using an Application Name
summary: How to set an application name and filter SQL activity associated with the application.
toc: true
docs_area: develop
---

CockroachDB enables you to programmatically create and tag your SQL connections with a custom name or label. This practice lets you to quickly identify which part of your application is potentially degraded due to database health and design. By identifying problematic transactions and statements, you can quickly trace back to parts of your applications that generated those transactions and statements for a holistic understanding of the application performance impact as well as potential mitigation and [optimization opportunities](make-queries-fast.html).

This page shows how to set and filter database workloads by application name.

## Set the application name

It is best practice to set the application name with CockroachDB. You can do this in the [connection string](connection-parameters.html#additional-connection-parameters) `postgres://root@<servername>:26257/mydb?application_name=movr_app` or at the [session level](set-vars.html):

{% include copy-clipboard.html %}
~~~sql
SET application_name = movr_app;
~~~

## Filter database workloads by application name

Once you set the application name, the [DB Console](ui-overview.html) lets you [filter database workloads by application name](ui-statements-page.html#filter).

<img src="{{ 'images/v22.1/movr-app.png' | relative_url }}" alt="Movr app filter" style="border:1px solid #eee;max-width:80%" />

If parts of your applications or known microservices are experiencing performance degradation, you can filter for the database workload tracing statements and transactions back to that part of your application directly in the DB Console. You can quickly identify whether there were database performance problems and if so, troubleshoot the issue using [SQL observability touch points](#trace-sql-activity-using-metrics) in the DB Console.

You can also programmatically filter `crdb_internal` tables [`crdb_internal.statement_statistics`](crdb-internal.html#statement_statistics) and [`crdb_internal.transaction_statistics`](crdb-internal.html#transaction_statistics) by application name. This example shows the first 60 characters of query text and statement statistics for queries associated with the `movr_app` application:

{% include copy-clipboard.html %}
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

Often signals to problems start at high-level metrics. The [SQL dashboard](ui-sql-dashboard.html) has metrics for [SQL sessions](ui-sql-dashboard.html#open-sql-sessions), [SQL statements](ui-sql-dashboard.html#active-sql-statements), [SQL statement errors](ui-sql-dashboard.html#sql-statement-errors), etc., that can quickly signify potential issues with your application.

The statement and transaction statistics described in the preceding section enable you to correlate high-level metrics with lower level SQL activity information where you can identify the specific statements and transactions that were running during that time.

## See also

- [SQL Activity](ui-overview.html#sql-activity)
- [SQL Performance Best Practices](performance-best-practices-overview.html)
- [Troubleshoot Statement Behavior](query-behavior-troubleshooting.html)
