---
title: Manage Long-Running Queries
summary: Learn how to identify and cancel long-running queries.
toc: true
---

<span class="version-tag">New in v1.1:</span> This page shows you how to identify and, if necessary, cancel SQL queries that are taking longer than expected to process.

{{site.data.alerts.callout_info}}Schema changes (statements beginning with <code>ALTER</code>) cannot currently be cancelled. However, to monitor the progress of schema changes, you can use <a href="show-jobs.html"><code>SHOW JOBS</code></a>.{{site.data.alerts.end}}


## Identify Long-Running Queries

Use the [`SHOW QUERIES`](show-queries.html) statement to list details about currently active SQL queries, including each query's `start` timestamp:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW QUERIES;
~~~

~~~
+----------------------------------+---------+----------+----------------------------------+-------------------------------------------+---------------------+------------------+-------------+-----------+
|             query_id             | node_id | username |              start               |                   query                   |   client_address    | application_name | distributed |   phase   |
+----------------------------------+---------+----------+----------------------------------+-------------------------------------------+---------------------+------------------+-------------+-----------+
| 14db657443230c3e0000000000000001 |       1 | root     | 2017-08-16 18:00:50.675151+00:00 | UPSERT INTO test.kv(k, v) VALUES ($1, $2) | 192.168.12.56:54119 | test_app         | false       | executing |
| 14db657443b68c7d0000000000000001 |       1 | root     | 2017-08-16 18:00:50.684818+00:00 | UPSERT INTO test.kv(k, v) VALUES ($1, $2) | 192.168.12.56:54123 | test_app         | false       | executing |
| 14db65744382c2340000000000000001 |       1 | root     | 2017-08-16 18:00:50.681431+00:00 | UPSERT INTO test.kv(k, v) VALUES ($1, $2) | 192.168.12.56:54103 | test_app         | false       | executing |
| 14db657443c9dc660000000000000001 |       1 | root     | 2017-08-16 18:00:50.686083+00:00 | SHOW CLUSTER QUERIES                      | 192.168.12.56:54108 | cockroach        | NULL        | preparing |
| 14db657443e30a850000000000000003 |       3 | root     | 2017-08-16 18:00:50.68774+00:00  | UPSERT INTO test.kv(k, v) VALUES ($1, $2) | 192.168.12.58:54118 | test_app         | false       | executing |
| 14db6574439f477d0000000000000003 |       3 | root     | 2017-08-16 18:00:50.6833+00:00   | UPSERT INTO test.kv(k, v) VALUES ($1, $2) | 192.168.12.58:54122 | test_app         | false       | executing |
| 14db6574435817d20000000000000002 |       2 | root     | 2017-08-16 18:00:50.678629+00:00 | UPSERT INTO test.kv(k, v) VALUES ($1, $2) | 192.168.12.57:54121 | test_app         | false       | executing |
| 14db6574433c621f0000000000000002 |       2 | root     | 2017-08-16 18:00:50.676813+00:00 | UPSERT INTO test.kv(k, v) VALUES ($1, $2) | 192.168.12.57:54124 | test_app         | false       | executing |
| 14db6574436f71d50000000000000002 |       2 | root     | 2017-08-16 18:00:50.680165+00:00 | UPSERT INTO test.kv(k, v) VALUES ($1, $2) | 192.168.12.57:54117 | test_app         | false       | executing |
+----------------------------------+---------+----------+----------------------------------+-------------------------------------------+---------------------+------------------+-------------+-----------+
(9 rows)
~~~

You can also filter for queries that have been running for a certain amount of time. For example, to find queries that have been running for more than 3 hours, you would run the following:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM [SHOW CLUSTER QUERIES]
      WHERE start < (now() - INTERVAL '3 hours');
~~~

## Cancel Long-Running Queries

Once you've identified a long-running query via [`SHOW QUERIES`](show-queries.html), note the `query_id` and use it with the [`CANCEL QUERY`](cancel-query.html) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> CANCEL QUERY '14dacc1f9a781e3d0000000000000001';
~~~

When a query is successfully cancelled, CockroachDB sends a `query execution canceled` error to the client that issued the query.

- If the canceled query was a single, standalone statement, no further action is required by the client.
- If the canceled query was part of a larger, multi-statement [transaction](transactions.html), the client should then issue a [`ROLLBACK`](rollback-transaction.html) statement.

## Improve Query Performance

After cancelling a long-running query, use the [`EXPLAIN`](explain.html) statement to examine it. It's possible that the query was slow because it performs a full-table scan. In these cases, you can likely improve the query's performance by [adding an index](create-index.html).

*(More guidance around query performance optimization forthcoming.)*

## See Also

- [`SHOW QUERIES`](show-queries.html)
- [`CANCEL QUERY`](cancel-query.html)
- [`EXPLAIN`](explain.html)
- [Query Behavior Troubleshooting](query-behavior-troubleshooting.html)
