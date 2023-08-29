---
title: CANCEL QUERY
summary: The CANCEL QUERY statement cancels a running SQL query.
toc: true
docs_area: reference.sql
---

The `CANCEL QUERY` [statement]({% link {{ page.version.version }}/sql-statements.md %}) cancels a running SQL query.

## Considerations

- Schema changes are treated differently than other SQL queries. You can use <a href="show-jobs.html"><code>SHOW JOBS</code></a> to monitor the progress of schema changes and <a href="cancel-job.html"><code>CANCEL JOB</code></a> to cancel schema changes that are taking longer than expected.
- In rare cases where a query is close to completion when a cancellation request is issued, the query may run to completion.
- In addition to the `CANCEL QUERY` statement, CockroachDB also supports query cancellation by [client drivers and ORMs]({% link {{ page.version.version }}/install-client-drivers.md %}) using the PostgreSQL wire protocol (pgwire). This allows CockroachDB to stop executing queries that your application is no longer waiting for, thereby reducing load on the cluster. pgwire query cancellation differs from the `CANCEL QUERY` statement in the following ways:
  - It is how most client drivers and ORMS implement query cancellation. For example, it is [used by PGJDBC](https://github.com/pgjdbc/pgjdbc/blob/3a54d28e0b416a84353d85e73a23180a6719435e/pgjdbc/src/main/java/org/postgresql/core/QueryExecutorBase.java#L171) to implement the [`setQueryTimeout` method](https://jdbc.postgresql.org/documentation/publicapi/org/postgresql/jdbc/PgStatement.html#setQueryTimeout-int-).
  - The cancellation request is sent over a different network connection than is used by SQL connections.
  - If there are too many unsuccessful cancellation attempts, CockroachDB will start rejecting pgwire cancellations.

## Required privileges

Members of the `admin` role (including `root`, which belongs to `admin` by default) can cancel any currently active queries. User that are not members of the `admin` role can cancel only their own currently active queries. To view and cancel another non-admin user's query, the user must be a member of the `admin` role or must have the `VIEWACTIVITY` [system privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) (or the legacy [`VIEWACTIVITY`]({% link {{ page.version.version }}/create-user.md %}#create-a-user-that-can-see-and-cancel-non-admin-queries-and-sessions) [role option]({% link {{ page.version.version }}/security-reference/authorization.md %}#role-options)) and the `CANCELQUERY` [system privilege]({{ link_prefix }}security-reference/authorization.html#supported-privileges) (or the legacy [`CANCELQUERY`]({% link {{ page.version.version }}/create-user.md %}#create-a-user-that-can-see-and-cancel-non-admin-queries-and-sessions) [role option]({% link {{ page.version.version }}/security-reference/authorization.md %}#role-options)) defined.

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/cancel_query.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`query_id` | A [scalar expression]({% link {{ page.version.version }}/scalar-expressions.md %}) that produces the ID of the query to cancel.<br><br>`CANCEL QUERY` accepts a single query ID. If a subquery is used and returns multiple IDs, the `CANCEL QUERY` statement will fail. To cancel multiple queries, use `CANCEL QUERIES`.
`select_stmt` | A [selection query]({% link {{ page.version.version }}/selection-queries.md %}) whose result you want to cancel.

## Response

When a query is successfully cancelled, CockroachDB sends a `query execution canceled` error to the client that issued the query.

- If the canceled query was a single, stand-alone statement, no further action is required by the client.
- If the canceled query was part of a larger, multi-statement [transaction]({% link {{ page.version.version }}/transactions.md %}), the client should then issue a [`ROLLBACK`]({% link {{ page.version.version }}/rollback-transaction.md %}) statement.

## Examples

### Cancel a query via the query ID

In this example, we use the [`SHOW STATEMENTS`]({% link {{ page.version.version }}/show-statements.md %}) statement to get the ID of a query and then pass the ID into the `CANCEL QUERY` statement:

~~~ sql
> SHOW STATEMENTS;
~~~

~~~
              query_id             | node_id |            session_id            | user_name |                start                |                query                 | client_address  | application_name | distributed |   phase
-----------------------------------+---------+----------------------------------+-----------+-------------------------------------+--------------------------------------+-----------------+------------------+-------------+------------
  1673f58fca5301900000000000000001 |       1 | 1673f583067d51280000000000000001 | demo      | 2021-04-08 18:31:29.079614+00:00:00 | SELECT * FROM rides ORDER BY revenue | 127.0.0.1:55212 | $ cockroach demo |    true     | executing
  1673f590433eaa000000000000000001 |       1 | 1673f58a4ba3c8e80000000000000001 | demo      | 2021-04-08 18:31:31.108372+00:00:00 | SHOW CLUSTER STATEMENTS              | 127.0.0.1:55215 | $ cockroach sql  |    false    | executing
(2 rows)
~~~

~~~ sql
> CANCEL QUERY '1673f590433eaa000000000000000001';
~~~

### Cancel a query via a subquery

In this example, we nest a [`SELECT` clause]({% link {{ page.version.version }}/select-clause.md %}) that retrieves the ID of a query inside the `CANCEL QUERY` statement:

~~~ sql
> CANCEL QUERY (WITH x AS (SHOW CLUSTER STATEMENTS) SELECT query_id FROM x
      WHERE client_address = '127.0.0.1:55212'
          AND user_name = 'demo'
          AND query = 'SELECT * FROM rides ORDER BY revenue');
~~~

~~~
CANCEL QUERIES 1
~~~

{{site.data.alerts.callout_info}}<code>CANCEL QUERY</code> accepts a single query ID. If a subquery is used and returns multiple IDs, the <code>CANCEL QUERY</code> statement will fail. To cancel multiple queries, use <code>CANCEL QUERIES</code>.{{site.data.alerts.end}}

## See also

- [Manage Long-Running Queries]({% link {{ page.version.version }}/manage-long-running-queries.md %})
- [`SHOW STATEMENTS`]({% link {{ page.version.version }}/show-statements.md %})
- [`CANCEL SESSION`]({% link {{ page.version.version }}/cancel-session.md %})
- [SQL Statements]({% link {{ page.version.version }}/sql-statements.md %})
