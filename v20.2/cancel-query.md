---
title: CANCEL QUERY
summary: The CANCEL QUERY statement cancels a running SQL query.
toc: true
---

The `CANCEL QUERY` [statement](sql-statements.html) cancels a running SQL query.


## Considerations

- Schema changes are treated differently than other SQL queries. You can use <a href="show-jobs.html"><code>SHOW JOBS</code></a> to monitor the progress of schema changes and <a href="cancel-job.html"><code>CANCEL JOB</code></a> to cancel schema changes that are taking longer than expected.
- In rare cases where a query is close to completion when a cancellation request is issued, the query may run to completion.

## Required privileges

Members of the `admin` role (include `root`, which belongs to `admin` by default) can cancel any currently active queries. User that are not members of the `admin` role can cancel only their own currently active queries. To view and cancel another non-admin user's query, the user must be a member of the `admin` role or must have the [`VIEWACTIVITY`](create-user.html#create-a-user-that-can-see-and-cancel-non-admin-queries-and-sessions) and [`CANCELQUERY`](create-user.html#create-a-user-that-can-see-and-cancel-non-admin-queries-and-sessions) parameters set.

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/cancel_query.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`query_id` | A [scalar expression](scalar-expressions.html) that produces the ID of the query to cancel.<br><br>`CANCEL QUERY` accepts a single query ID. If a subquery is used and returns multiple IDs, the `CANCEL QUERY` statement will fail. To cancel multiple queries, use `CANCEL QUERIES`.
`select_stmt` | A [selection query](selection-queries.html) whose result you want to cancel.

## Response

When a query is successfully cancelled, CockroachDB sends a `query execution canceled` error to the client that issued the query.

- If the canceled query was a single, stand-alone statement, no further action is required by the client.
- If the canceled query was part of a larger, multi-statement [transaction](transactions.html), the client should then issue a [`ROLLBACK`](rollback-transaction.html) statement.

## Examples

### Cancel a query via the query ID

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

### Cancel a query via a subquery

In this example, we nest a [`SELECT` clause](select-clause.html) that retrieves the ID of a query inside the `CANCEL QUERY` statement:

~~~ sql
> CANCEL QUERY (SELECT query_id FROM [SHOW CLUSTER QUERIES]
      WHERE client_address = '192.168.0.72:56194'
          AND username = 'mroach'
          AND query = 'SELECT * FROM test.kv ORDER BY k');
~~~

{{site.data.alerts.callout_info}}<code>CANCEL QUERY</code> accepts a single query ID. If a subquery is used and returns multiple IDs, the <code>CANCEL QUERY</code> statement will fail. To cancel multiple queries, use <code>CANCEL QUERIES</code>.{{site.data.alerts.end}}

## See also

- [Manage Long-Running Queries](manage-long-running-queries.html)
- [`SHOW QUERIES`](show-queries.html)
- [`CANCEL SESSION`](cancel-session.html)
- [SQL Statements](sql-statements.html)
