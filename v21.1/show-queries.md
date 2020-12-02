---
title: SHOW QUERIES
summary: The SHOW QUERIES statement lists all currently active queries across the cluster or on the local node.
toc: true
---

The `SHOW QUERIES` [statement](sql-statements.html) lists details about currently active SQL queries, including:

- The internal ID of the query
- The node executing the query
- The SQL query itself
- How long the query has been running
- The client address, application name, and user that issued the query
-  The ID for the current session

These details let you monitor the progress of active queries and, if necessary, identify those that may need to be [cancelled](cancel-query.html) to prevent unwanted resource consumption.

{{site.data.alerts.callout_info}}
Schema changes and [`BACKUP`](backup.html)/[`RESTORE`](restore.html) statements are not executed as queries internally and so are not listed by `SHOW QUERIES`. To monitor such statements, use [`SHOW JOBS`](show-jobs.html) instead.
{{site.data.alerts.end}}

## Required privileges

All users can see their own currently active queries. All users belonging to the `admin` role can view see all users' currently active queries. To view other non-admin users' queries, the non-admin user must have the [`VIEWACTIVITY`](create-user.html#create-a-user-that-can-see-and-cancel-non-admin-queries-and-sessions) parameter set. 

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/show_queries.html %}
</div>

- To list the active queries across all nodes of the cluster, use `SHOW QUERIES` or `SHOW CLUSTER QUERIES`.
- To list the active queries just on the local node, use `SHOW LOCAL QUERIES`.

## Response

The following fields are returned for each query:

Field | Description
------|------------
`query_id` | The ID of the query.
`node_id` | The ID of the node.
`session_id` | The ID of the session.
`user_name` | The username of the connected user.
`start` | The timestamp at which the query started.
`query` | The SQL query.
`client_address` | The address and port of the client that issued the SQL query.
`application_name` | The [application name](set-vars.html#supported-variables) specified by the client, if any. For queries from the [built-in SQL client](cockroach-sql.html), this will be `$ cockroach sql`.
`distributed` | If `true`, the query is being executed by the Distributed SQL (DistSQL) engine. If `false`, the query is being executed by the standard "local" SQL engine. If `NULL`, the query is being prepared and it's not yet known which execution engine will be used.
`phase` | The phase of the query's execution. If `preparing`, the statement is being parsed and planned. If `executing`, the statement is being executed.

## Examples

### List queries across the cluster

{% include copy-clipboard.html %}
~~~ sql
> SHOW CLUSTER QUERIES;
~~~

~~~
              query_id             | node_id |            session_id            | user_name |              start               |                                 query                                 | client_address  | application_name | distributed |   phase
+----------------------------------+---------+----------------------------------+-----------+----------------------------------+-----------------------------------------------------------------------+-----------------+------------------+-------------+-----------+
  15f92b12b2fb95b00000000000000002 |       2 | 15f92b10b92ed4080000000000000002 | root      | 2020-03-04 17:48:23.309592+00:00 | SELECT city, id FROM vehicles WHERE city = $1                         | 127.0.0.1:65092 |                  |    false    | executing
  15f92b12b2ea5f700000000000000001 |       1 | 15f92adefd48d8a00000000000000001 | root      | 2020-03-04 17:48:23.3085+00:00   | SHOW CLUSTER QUERIES                                                  | 127.0.0.1:64970 | $ cockroach sql  |    false    | executing
  15f92b12b2ffeb100000000000000003 |       3 | 15f92b0e4ea399680000000000000003 | root      | 2020-03-04 17:48:23.30989+00:00  | UPSERT INTO vehicle_location_histories VALUES ($1, $2, now(), $3, $4) | 127.0.0.1:65088 |                  |    NULL     | preparing
(3 rows)
~~~

Alternatively, you can use `SHOW QUERIES` to receive the same response.

### List queries on the local node

{% include copy-clipboard.html %}
~~~ sql
> SHOW LOCAL QUERIES;
~~~

~~~
              query_id             | node_id |            session_id            | user_name |              start               |                           query                            | client_address  | application_name | distributed |   phase
+----------------------------------+---------+----------------------------------+-----------+----------------------------------+------------------------------------------------------------+-----------------+------------------+-------------+-----------+
  15f92b15bece88900000000000000001 |       1 | 15f92aefb240d2980000000000000001 | root      | 2020-03-04 17:48:36.392919+00:00 | INSERT INTO user_promo_codes VALUES ($1, $2, $3, now(), 1) | 127.0.0.1:65044 |                  |    false    | executing
  15f92b15bed80a280000000000000001 |       1 | 15f92adefd48d8a00000000000000001 | root      | 2020-03-04 17:48:36.393495+00:00 | SHOW LOCAL QUERIES                                         | 127.0.0.1:64970 | $ cockroach sql  |    false    | executing
(2 rows)
~~~

### Filter for specific queries

You can use a [`SELECT`](select-clause.html) statement to filter the list of active queries by one or more of the [response fields](#response).

#### Show all queries on node 2

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM [SHOW CLUSTER QUERIES]
      WHERE node_id = 2;
~~~

~~~
              query_id             | node_id |            session_id            | user_name |              start               |                                 query                                 | client_address  | application_name | distributed |   phase
+----------------------------------+---------+----------------------------------+-----------+----------------------------------+-----------------------------------------------------------------------+-----------------+------------------+-------------+-----------+
  15f92b1cb931f6900000000000000002 |       2 | 15f92b10b92ed4080000000000000002 | root      | 2020-03-04 17:49:06.363515+00:00 | UPSERT INTO vehicle_location_histories VALUES ($1, $2, now(), $3, $4) | 127.0.0.1:65092 |                  |    NULL     | preparing
(1 row)
~~~

#### Show all queries from a specific address and user

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM [SHOW CLUSTER QUERIES]
      WHERE client_address = '127.0.0.1:65196' AND user_name = 'maxroach';
~~~

~~~
              query_id             | node_id |            session_id            | user_name |              start               |                     query                     | client_address  | application_name | distributed |   phase
+----------------------------------+---------+----------------------------------+-----------+----------------------------------+-----------------------------------------------+-----------------+------------------+-------------+-----------+
  15f92bf4b27f0b480000000000000002 |       2 | 15f92b7dc85b7ba80000000000000002 | maxroach  | 2020-03-04 18:04:33.964083+00:00 | SELECT city, id FROM vehicles WHERE city = $1 | 127.0.0.1:65196 |                  |    false    | executing
(1 row)
~~~

#### Exclude queries from the built-in SQL client

To exclude queries from the [built-in SQL client](cockroach-sql.html), filter for queries that do not show `$ cockroach sql` as the `application_name`:

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

### Cancel a query

When you see a query that is taking too long to complete, you can use the [`CANCEL QUERY`](cancel-query.html) statement to end it.

For example, let's say you use `SHOW CLUSTER QUERIES` to find queries that have been running for more than 3 hours:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM [SHOW CLUSTER QUERIES]
      WHERE start < (now() - INTERVAL '3 hours');
~~~

~~~
              query_id             | node_id |            session_id            | user_name |              start              |        query        | client_address  | application_name | distributed |   phase
+----------------------------------+---------+----------------------------------+-----------+---------------------------------+---------------------+-----------------+------------------+-------------+-----------+
  15f92c745fe203600000000000000001 |       1 | 15f92c63d4b393b80000000000000001 | root      | 2020-03-04 18:13:42.33385+00:00 | SELECT * FROM rides | 127.0.0.1:65287 | $ cockroach sql  |    true     | executing
(1 row)
~~~

To cancel this long-running query, and stop it from consuming resources, you note the `query_id` and use it with the `CANCEL QUERY` statement:

{% include copy-clipboard.html %}
~~~ sql
> CANCEL QUERY '15f92c745fe203600000000000000001';
~~~

## See also

- [Manage Long-Running Queries](manage-long-running-queries.html)
- [`CANCEL QUERY`](cancel-query.html)
- [`SHOW SESSIONS`](show-sessions.html)
- [`SHOW JOBS`](show-jobs.html)
- [Other SQL Statements](sql-statements.html)
