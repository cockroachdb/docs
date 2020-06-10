---
title: Manage Long-Running Queries
summary: Learn how to identify and cancel long-running queries.
toc: true
---

This page shows you how to identify and, if necessary, cancel SQL queries that are taking longer than expected to process.

{{site.data.alerts.callout_success}} Schema changes are treated differently than other SQL queries. You can use <a href="show-jobs.html"><code>SHOW JOBS</code></a> to monitor the progress of schema changes and <a href="cancel-job.html"><code>CANCEL JOB</code></a> to cancel schema changes that are taking longer than expected. {{site.data.alerts.end}}


## Identify long-running queries

Use the [`SHOW QUERIES`](show-queries.html) statement to list details about currently active SQL queries, including each query's `start` timestamp:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM [SHOW CLUSTER QUERIES]
      WHERE application_name != '$ cockroach sql';
~~~

~~~
              query_id             | node_id |            session_id            | user_name |              start               |                                 query                                 | client_address  | application_name | distributed |   phase
+----------------------------------+---------+----------------------------------+-----------+----------------------------------+-----------------------------------------------------------------------+-----------------+------------------+-------------+-----------+
  15f92c0dd24bec200000000000000003 |       3 | 15f92b0e4ea399680000000000000003 | root      | 2020-03-04 18:06:21.871708+00:00 | SELECT city, id FROM vehicles WHERE city = $1                         | 127.0.0.1:65088 |                  |    false    | executing
  15f92c0dd26655d80000000000000001 |       1 | 15f92be36964ac800000000000000001 | root      | 2020-03-04 18:06:21.873515+00:00 | UPSERT INTO vehicle_location_histories VALUES ($1, $2, now(), $3, $4) | 127.0.0.1:65240 |                  |    false    | executing
  15f92c0dd25882c80000000000000001 |       1 | 15f92aefb240d2980000000000000001 | root      | 2020-03-04 18:06:21.872608+00:00 | UPSERT INTO vehicle_location_histories VALUES ($1, $2, now(), $3, $4) | 127.0.0.1:65044 |                  |    false    | executing
  15f92c0dd262cb980000000000000002 |       2 | 15f92b7dc85b7ba80000000000000002 | maxroach  | 2020-03-04 18:06:21.873286+00:00 | SELECT city, id FROM vehicles WHERE city = $1                         | 127.0.0.1:65196 |                  |    false    | executing
~~~

You can also filter for queries that have been running for a certain amount of time. For example, to find queries that have been running for more than 3 hours, you would run the following:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM [SHOW CLUSTER QUERIES]
      WHERE start < (now() - INTERVAL '3 hours');
~~~

## Cancel long-running queries

Once you've identified a long-running query via [`SHOW QUERIES`](show-queries.html), note the `query_id` and use it with the [`CANCEL QUERY`](cancel-query.html) statement:

{% include copy-clipboard.html %}
~~~ sql
> CANCEL QUERY '15f92c0dd24bec200000000000000003';
~~~

When a query is successfully cancelled, CockroachDB sends a `query execution canceled` error to the client that issued the query.

- If the canceled query was a single, stand-alone statement, no further action is required by the client.
- If the canceled query was part of a larger, multi-statement [transaction](transactions.html), the client should then issue a [`ROLLBACK`](rollback-transaction.html) statement.

## Improve query performance

After cancelling a long-running query, use the [`EXPLAIN`](explain.html) statement to examine it. It's possible that the query was slow because it performs a full-table scan. In these cases, you can likely improve the query's performance by [adding an index](create-index.html).

*(More guidance around query performance optimization forthcoming.)*

## See also

- [`SHOW QUERIES`](show-queries.html)
- [`CANCEL QUERY`](cancel-query.html)
- [`EXPLAIN`](explain.html)
- [Query Behavior Troubleshooting](query-behavior-troubleshooting.html)
