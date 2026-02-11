---
title: SHOW STATEMENTS
summary: The SHOW STATEMENTS statement lists all currently active queries across the cluster or on the local node.
toc: true
docs_area: reference.sql
---

The `SHOW STATEMENTS` [statement]({% link {{ page.version.version }}/sql-statements.md %}) lists details about currently active SQL queries, including:

- The internal ID of the query
- The node executing the query
- The SQL query itself
- How long the query has been running
- The client address, application name, and user that issued the query
-  The ID for the current session

These details let you monitor the progress of active queries and, if necessary, identify those that may need to be [cancelled]({% link {{ page.version.version }}/cancel-query.md %}) to prevent unwanted resource consumption.

{{site.data.alerts.callout_info}}
Schema changes and [`BACKUP`]({% link {{ page.version.version }}/backup.md %})/[`RESTORE`]({% link {{ page.version.version }}/restore.md %}) statements are not executed as queries internally and so are not listed by `SHOW STATEMENTS`. To monitor such statements, use [`SHOW JOBS`]({% link {{ page.version.version }}/show-jobs.md %}) instead.
{{site.data.alerts.end}}

## Aliases

In CockroachDB, the following are aliases for `SHOW STATEMENTS`:

- `SHOW QUERIES`

## Required privileges

All users can see their own currently active queries. Users with the [`VIEWACTIVITY` or `VIEWACTIVITYREDACTED` privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) can view see all users' currently active queries. `VIEWACTIVITYREDACTED` causes constants in queries being executed by other users to be redacted.

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/show_statements.html %}
</div>

- To list the active queries across all nodes of the cluster, use `SHOW STATEMENTS` or `SHOW CLUSTER STATEMENTS`.
- To list the active queries just on the local node, use `SHOW LOCAL STATEMENTS`.

## Response

The following fields are returned for each query:

Field | Description
------|------------
`query_id` | The ID of the query.
`node_id` | The ID of the node.
`session_id` | The ID of the session.
`user_name` | The username of the connected user.
`start` | The [`timestamptz`]({% link {{ page.version.version }}/timestamp.md %}) at which the query started.
`query` | The SQL query.
`client_address` | The address and port of the client that issued the SQL query.
`application_name` | The [application name]({% link {{ page.version.version }}/set-vars.md %}#supported-variables) specified by the client, if any. For queries from the [built-in SQL client]({% link {{ page.version.version }}/cockroach-sql.md %}), this will be `$ cockroach sql`.
`distributed` | If `true`, the query is being executed by the Distributed SQL (DistSQL) engine. If `false`, the query is being executed by the standard "local" SQL engine. If `NULL`, the query is being prepared and it's not yet known which execution engine will be used.
`phase` | The phase of the query's execution. If `preparing`, the statement is being parsed and planned. If `executing`, the statement is being executed.

## Examples

### List queries across the cluster

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CLUSTER STATEMENTS;
~~~

~~~
              query_id             | node_id |            session_id            | user_name |              start               |                                 query                                 | client_address  | application_name | distributed |   phase
+----------------------------------+---------+----------------------------------+-----------+----------------------------------+-----------------------------------------------------------------------+-----------------+------------------+-------------+-----------+
  15f92b12b2fb95b00000000000000002 |       2 | 15f92b10b92ed4080000000000000002 | root      | 2020-03-04 17:48:23.309592+00:00 | SELECT city, id FROM vehicles WHERE city = $1                         | 127.0.0.1:65092 |                  |    false    | executing
  15f92b12b2ea5f700000000000000001 |       1 | 15f92adefd48d8a00000000000000001 | root      | 2020-03-04 17:48:23.3085+00:00   | SHOW CLUSTER STATEMENTS                                               | 127.0.0.1:64970 | $ cockroach sql  |    false    | executing
  15f92b12b2ffeb100000000000000003 |       3 | 15f92b0e4ea399680000000000000003 | root      | 2020-03-04 17:48:23.30989+00:00  | UPSERT INTO vehicle_location_histories VALUES ($1, $2, now(), $3, $4) | 127.0.0.1:65088 |                  |    NULL     | preparing
(3 rows)
~~~

Alternatively, you can use `SHOW STATEMENTS` to receive the same response.

### List queries on the local node

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW LOCAL STATEMENTS;
~~~

~~~
              query_id             | node_id |            session_id            | user_name |              start               |                           query                            | client_address  | application_name | distributed |   phase
+----------------------------------+---------+----------------------------------+-----------+----------------------------------+------------------------------------------------------------+-----------------+------------------+-------------+-----------+
  15f92b15bece88900000000000000001 |       1 | 15f92aefb240d2980000000000000001 | root      | 2020-03-04 17:48:36.392919+00:00 | INSERT INTO user_promo_codes VALUES ($1, $2, $3, now(), 1) | 127.0.0.1:65044 |                  |    false    | executing
  15f92b15bed80a280000000000000001 |       1 | 15f92adefd48d8a00000000000000001 | root      | 2020-03-04 17:48:36.393495+00:00 | SHOW LOCAL STATEMENTS                                      | 127.0.0.1:64970 | $ cockroach sql  |    false    | executing
(2 rows)
~~~

### Filter for specific queries

You can use a [`SELECT`]({% link {{ page.version.version }}/select-clause.md %}) statement to filter the list of active queries by one or more of the [response fields](#response).

#### Show all queries on node 2

{% include_cached copy-clipboard.html %}
~~~ sql
> WITH x as (SHOW CLUSTER STATEMENTS) SELECT * FROM x
      WHERE node_id = 2;
~~~

~~~
              query_id             | node_id |            session_id            | user_name |              start               |                                 query                                 | client_address  | application_name | distributed |   phase
+----------------------------------+---------+----------------------------------+-----------+----------------------------------+-----------------------------------------------------------------------+-----------------+------------------+-------------+-----------+
  15f92b1cb931f6900000000000000002 |       2 | 15f92b10b92ed4080000000000000002 | root      | 2020-03-04 17:49:06.363515+00:00 | UPSERT INTO vehicle_location_histories VALUES ($1, $2, now(), $3, $4) | 127.0.0.1:65092 |                  |    NULL     | preparing
(1 row)
~~~

#### Show all queries from a specific address and user

{% include_cached copy-clipboard.html %}
~~~ sql
> WITH x as (SHOW CLUSTER STATEMENTS) SELECT * FROM x
      WHERE client_address = '127.0.0.1:65196' AND user_name = 'maxroach';
~~~

~~~
              query_id             | node_id |            session_id            | user_name |              start               |                     query                     | client_address  | application_name | distributed |   phase
+----------------------------------+---------+----------------------------------+-----------+----------------------------------+-----------------------------------------------+-----------------+------------------+-------------+-----------+
  15f92bf4b27f0b480000000000000002 |       2 | 15f92b7dc85b7ba80000000000000002 | maxroach  | 2020-03-04 18:04:33.964083+00:00 | SELECT city, id FROM vehicles WHERE city = $1 | 127.0.0.1:65196 |                  |    false    | executing
(1 row)
~~~

#### Exclude queries from the built-in SQL client

To exclude queries from the [built-in SQL client]({% link {{ page.version.version }}/cockroach-sql.md %}), filter for queries that do not show `$ cockroach sql` as the `application_name`:

{% include_cached copy-clipboard.html %}
~~~ sql
> WITH x as (SHOW CLUSTER STATEMENTS) SELECT * FROM x
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

### Cancel a query

When you see a query that is taking too long to complete, you can use the [`CANCEL QUERY`]({% link {{ page.version.version }}/cancel-query.md %}) statement to end it.

For example, let's say you use `SHOW CLUSTER STATEMENTS` to find queries that have been running for more than 3 hours:

{% include_cached copy-clipboard.html %}
~~~ sql
> WITH x as (SHOW CLUSTER STATEMENTS) SELECT * FROM x
      WHERE start < (now() - INTERVAL '3 hours');
~~~

~~~
              query_id             | node_id |            session_id            | user_name |              start              |        query        | client_address  | application_name | distributed |   phase
+----------------------------------+---------+----------------------------------+-----------+---------------------------------+---------------------+-----------------+------------------+-------------+-----------+
  15f92c745fe203600000000000000001 |       1 | 15f92c63d4b393b80000000000000001 | root      | 2020-03-04 18:13:42.33385+00:00 | SELECT * FROM rides | 127.0.0.1:65287 | $ cockroach sql  |    true     | executing
(1 row)
~~~

To cancel this long-running query, and stop it from consuming resources, you note the `query_id` and use it with the `CANCEL QUERY` statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> CANCEL QUERY '15f92c745fe203600000000000000001';
~~~

## See also

- [Manage Long-Running Queries]({% link {{ page.version.version }}/manage-long-running-queries.md %})
- [`CANCEL QUERY`]({% link {{ page.version.version }}/cancel-query.md %})
- [`SHOW SESSIONS`]({% link {{ page.version.version }}/show-sessions.md %})
- [`SHOW JOBS`]({% link {{ page.version.version }}/show-jobs.md %})
- [SQL Statements]({% link {{ page.version.version }}/sql-statements.md %})
