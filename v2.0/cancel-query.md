---
title: CANCEL QUERY
summary: The CANCEL QUERY statement cancels a running SQL query.
toc: false
---

<span class="version-tag">New in v1.1:</span> The `CANCEL QUERY` [statement](sql-statements.html) cancels a running SQL query.

<div id="toc"></div>

## Considerations

- Schema changes (statements beginning with <code>ALTER</code>) cannot currently be cancelled. However, to monitor the progress of schema changes, you can use <a href="show-jobs.html"><code>SHOW JOBS</code></a>.
- In rare cases where a query is close to completion when a cancellation request is issued, the query may run to completion.

## Required Privileges

The `root` user can cancel any currently active queries, whereas non-`root` users cancel only their own currently active queries.

## Synopsis

{% include sql/{{ page.version.version }}/diagrams/cancel_query.html %}

## Parameters

Parameter | Description
----------|------------
`query_id` | The ID of the query to cancel, or a [`SELECT`](select.html) statement that returns the ID of the query to cancel.

## Response

When a query is successfully cancelled, CockroachDB sends a `query execution canceled` error to the client that issued the query.

- If the canceled query was a single, standalone statement, no further action is required by the client.
- If the canceled query was part of a larger, multi-statement [transaction](transactions.html), the client should then issue a [`ROLLBACK`](rollback-transaction.html) statement.

## Examples

### Cancel a Query via the Query ID

In this example, we use the [`SHOW QUERIES`](show-queries.html) statement to get the ID of a query and then pass the ID into the `CANCEL QUERY` statement:

~~~ sql
> SHOW QUERIES;
~~~

~~~
+----------------------------------+---------+----------+----------------------------------+----------------------------------+--------------------+------------------+-------------+-----------+
|             query_id             | node_id | username |              start               |              query               |   client_address   | application_name | distributed |   phase   |
+----------------------------------+---------+----------+----------------------------------+----------------------------------+--------------------+------------------+-------------+-----------+
| 14dacc1f9a781e3d0000000000000001 |       2 | mroach   | 2017-08-10 14:08:22.878113+00:00 | SELECT * FROM test.kv ORDER BY k | 192.168.0.72:56194 | test_app         | false       | executing |
+----------------------------------+---------+----------+----------------------------------+----------------------------------+--------------------+------------------+-------------+-----------+
| 14dacc206c47a9690000000000000002 |       2 | root     | 2017-08-14 19:11:05.309119+00:00 | SHOW CLUSTER QUERIES             | 127.0.0.1:50921    |                  | NULL        | preparing |
+----------------------------------+---------+----------+----------------------------------+----------------------------------+--------------------+------------------+-------------+-----------+
~~~

~~~ sql
> CANCEL QUERY '14dacc1f9a781e3d0000000000000001';
~~~

### Cancel a Query via a Nested `SELECT` Statement

In this example, we nest a [`SELECT`](select.html) statement that retrieves the ID of a query inside the `CANCEL QUERY` statement:

~~~ sql
> CANCEL QUERY (SELECT query_id FROM [SHOW CLUSTER QUERIES]
      WHERE client_address = '192.168.0.72:56194'
          AND username = 'mroach'
          AND query = 'SELECT * FROM test.kv ORDER BY k');
~~~

## See Also

- [Manage Long-Running Queries](manage-long-running-queries.html)
- [`SHOW QUERIES`](show-queries.html)
- [SQL Statements](sql-statements.html)
