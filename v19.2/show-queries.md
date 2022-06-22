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

These details let you monitor the progress of active queries and, if necessary, identify those that may need to be [cancelled](cancel-query.html) to prevent unwanted resource consumption.

{{site.data.alerts.callout_info}}
Schema changes and [`BACKUP`](backup.html)/[`RESTORE`](restore.html) statements are not executed as queries internally and so are not listed by `SHOW QUERIES`. To monitor such statements, use [`SHOW JOBS`](show-jobs.html) instead.
{{site.data.alerts.end}}

## Required privileges

No [privileges](authorization.html#assign-privileges) are required to execute this statement. However, note that non-`admin` users see only their own currently active queries, whereas the `admin` users see all users' currently active queries.

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
`node_id` | The ID of the node connected to.
`user_name` | The username of the connected user.
`start` | The timestamp at which the query started.
`query` | The SQL query.
`client_address` | The address and port of the client that issued the SQL query.
`application_name` | The [application name](set-vars.html#supported-variables) specified by the client, if any. For queries from the [built-in SQL client](cockroach-sql.html), this will be `cockroach`.
`distributed` | If `true`, the query is being executed by the Distributed SQL (DistSQL) engine. If `false`, the query is being executed by the standard "local" SQL engine. If `NULL`, the query is being prepared and it's not yet known which execution engine will be used.
`phase` | The phase of the query's execution. If `preparing`, the statement is being parsed and planned. If `executing`, the statement is being executed.

## Examples

### List queries across the cluster

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CLUSTER QUERIES;
~~~

~~~
+----------------------------------+---------+-----------+----------------------------------+-------------------------------------------+---------------------+------------------+-------------+-----------+
|             query_id             | node_id | user_name |              start               |                   query                   |   client_address    | application_name | distributed |   phase   |
+----------------------------------+---------+-----------+----------------------------------+-------------------------------------------+---------------------+------------------+-------------+-----------+
| 14db657443230c3e0000000000000001 |       1 | root      | 2017-08-16 18:00:50.675151+00:00 | UPSERT INTO test.kv(k, v) VALUES ($1, $2) | 192.168.12.56:54119 | test_app         | false       | executing |
| 14db657443b68c7d0000000000000001 |       1 | root      | 2017-08-16 18:00:50.684818+00:00 | UPSERT INTO test.kv(k, v) VALUES ($1, $2) | 192.168.12.56:54123 | test_app         | false       | executing |
| 14db65744382c2340000000000000001 |       1 | root      | 2017-08-16 18:00:50.681431+00:00 | UPSERT INTO test.kv(k, v) VALUES ($1, $2) | 192.168.12.56:54103 | test_app         | false       | executing |
| 14db657443c9dc660000000000000001 |       1 | root      | 2017-08-16 18:00:50.686083+00:00 | SHOW CLUSTER QUERIES                      | 192.168.12.56:54108 | cockroach        | NULL        | preparing |
| 14db657443e30a850000000000000003 |       3 | root      | 2017-08-16 18:00:50.68774+00:00  | UPSERT INTO test.kv(k, v) VALUES ($1, $2) | 192.168.12.58:54118 | test_app         | false       | executing |
| 14db6574439f477d0000000000000003 |       3 | root      | 2017-08-16 18:00:50.6833+00:00   | UPSERT INTO test.kv(k, v) VALUES ($1, $2) | 192.168.12.58:54122 | test_app         | false       | executing |
| 14db6574435817d20000000000000002 |       2 | root      | 2017-08-16 18:00:50.678629+00:00 | UPSERT INTO test.kv(k, v) VALUES ($1, $2) | 192.168.12.57:54121 | test_app         | false       | executing |
| 14db6574433c621f0000000000000002 |       2 | root      | 2017-08-16 18:00:50.676813+00:00 | UPSERT INTO test.kv(k, v) VALUES ($1, $2) | 192.168.12.57:54124 | test_app         | false       | executing |
| 14db6574436f71d50000000000000002 |       2 | root      | 2017-08-16 18:00:50.680165+00:00 | UPSERT INTO test.kv(k, v) VALUES ($1, $2) | 192.168.12.57:54117 | test_app         | false       | executing |
+----------------------------------+---------+-----------+----------------------------------+-------------------------------------------+---------------------+------------------+-------------+-----------+
(9 rows)
~~~

Alternatively, you can use `SHOW QUERIES` to receive the same response.

### List queries on the local node

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW LOCAL QUERIES;
~~~

~~~
+----------------------------------+---------+-----------+----------------------------------+-------------------------------------------+---------------------+------------------+-------------+-----------+
|             query_id             | node_id | user_name |              start               |                   query                   |   client_address    | application_name | distributed |   phase   |
+----------------------------------+---------+-----------+----------------------------------+-------------------------------------------+---------------------+------------------+-------------+-----------+
| 14db657cd9005cb90000000000000001 |       1 | root      | 2017-08-16 18:01:27.5492+00:00   | UPSERT INTO test.kv(k, v) VALUES ($1, $2) | 192.168.12.56:54103 | test_app         | false       | executing |
| 14db657cd8d7d9a50000000000000001 |       1 | root      | 2017-08-16 18:01:27.546538+00:00 | UPSERT INTO test.kv(k, v) VALUES ($1, $2) | 192.168.12.56:54119 | test_app         | false       | executing |
| 14db657cd8e966c40000000000000001 |       1 | root      | 2017-08-16 18:01:27.547696+00:00 | UPSERT INTO test.kv(k, v) VALUES ($1, $2) | 192.168.12.56:54123 | test_app         | false       | executing |
| 14db657cd92ad8f80000000000000001 |       1 | root      | 2017-08-16 18:01:27.551986+00:00 | SHOW LOCAL QUERIES                        | 192.168.12.56:54122 | cockroach        | NULL        | preparing |
+----------------------------------+---------+-----------+----------------------------------+-------------------------------------------+---------------------+------------------+-------------+-----------+
(4 rows)
~~~

### Filter for specific queries

You can use a [`SELECT`](select-clause.html) statement to filter the list of active queries by one or more of the [response fields](#response).

#### Show all queries on node 2

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM [SHOW CLUSTER QUERIES]
      WHERE node_id = 2;
~~~

~~~
+----------------------------------+---------+-----------+----------------------------------+-------------------------------------------+---------------------+------------------+-------------+-----------+
|             query_id             | node_id | user_name |              start               |                   query                   |   client_address    | application_name | distributed |   phase   |
+----------------------------------+---------+-----------+----------------------------------+-------------------------------------------+---------------------+------------------+-------------+-----------+
| 14db6574435817d20000000000000002 |       2 | root      | 2017-08-16 18:00:50.678629+00:00 | UPSERT INTO test.kv(k, v) VALUES ($1, $2) | 192.168.12.57:54121 | test_app         | false       | executing |
| 14db6574433c621f0000000000000002 |       2 | root      | 2017-08-16 18:00:50.676813+00:00 | UPSERT INTO test.kv(k, v) VALUES ($1, $2) | 192.168.12.57:54124 | test_app         | false       | executing |
| 14db6574436f71d50000000000000002 |       2 | root      | 2017-08-16 18:00:50.680165+00:00 | UPSERT INTO test.kv(k, v) VALUES ($1, $2) | 192.168.12.57:54117 | test_app         | false       | executing |
+----------------------------------+---------+-----------+----------------------------------+-------------------------------------------+---------------------+------------------+-------------+-----------+
(3 rows)
~~~

#### Show all queries that have been running for more than 3 hours

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM [SHOW CLUSTER QUERIES]
      WHERE start < (now() - INTERVAL '3 hours');
~~~

~~~
+----------------------------------+---------+-----------+----------------------------------+----------------------------------+--------------------+------------------+-------------+-----------+
|             query_id             | node_id | user_name |              start               |              query               |   client_address   | application_name | distributed |   phase   |
+----------------------------------+---------+-----------+----------------------------------+----------------------------------+--------------------+------------------+-------------+-----------+
| 14dacc1f9a781e3d0000000000000001 |       2 | mroach    | 2017-08-10 11:34:32.778412+00:00 | SELECT * FROM test.kv ORDER BY k | 192.168.0.72:56194 | test_app         | false       | executing |
+----------------------------------+---------+-----------+----------------------------------+----------------------------------+--------------------+------------------+-------------+-----------+
~~~

#### Show all queries from a specific address and user

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM [SHOW CLUSTER QUERIES]
      WHERE client_address = '192.168.0.72:56194'
          AND username = 'mroach';
~~~

~~~
+----------------------------------+---------+-----------+----------------------------------+----------------------------------+--------------------+------------------+-------------+-----------+
|             query_id             | node_id | user_name |              start               |              query               |   client_address   | application_name | distributed |   phase   |
+----------------------------------+---------+-----------+----------------------------------+----------------------------------+--------------------+------------------+-------------+-----------+
| 14dacc1f9a781e3d0000000000000001 |       2 | mroach    | 2017-08-10 14:08:22.878113+00:00 | SELECT * FROM test.kv ORDER BY k | 192.168.0.72:56194 | test_app         | false       | executing |
+----------------------------------+---------+-----------+----------------------------------+----------------------------------+--------------------+------------------+-------------+-----------+
~~~

#### Exclude queries from the built-in SQL client

To exclude queries from the [built-in SQL client](cockroach-sql.html), filter for queries that do not show `cockroach` as the `application_name`:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM [SHOW CLUSTER QUERIES]
      WHERE application_name != 'cockroach';
~~~

~~~
+----------------------------------+---------+-----------+----------------------------------+-------------------------------------------+---------------------+------------------+-------------+-----------+
|             query_id             | node_id | user_name |              start               |                   query                   |   client_address    | application_name | distributed |   phase   |
+----------------------------------+---------+-----------+----------------------------------+-------------------------------------------+---------------------+------------------+-------------+-----------+
| 14db657443230c3e0000000000000001 |       1 | root      | 2017-08-16 18:00:50.675151+00:00 | UPSERT INTO test.kv(k, v) VALUES ($1, $2) | 192.168.12.56:54119 | test_app         | false       | executing |
| 14db657443b68c7d0000000000000001 |       1 | root      | 2017-08-16 18:00:50.684818+00:00 | UPSERT INTO test.kv(k, v) VALUES ($1, $2) | 192.168.12.56:54123 | test_app         | false       | executing |
| 14db65744382c2340000000000000001 |       1 | root      | 2017-08-16 18:00:50.681431+00:00 | UPSERT INTO test.kv(k, v) VALUES ($1, $2) | 192.168.12.56:54103 | test_app         | false       | executing |
| 14db657443e30a850000000000000003 |       3 | root      | 2017-08-16 18:00:50.68774+00:00  | UPSERT INTO test.kv(k, v) VALUES ($1, $2) | 192.168.12.58:54118 | test_app         | false       | executing |
| 14db6574439f477d0000000000000003 |       3 | root      | 2017-08-16 18:00:50.6833+00:00   | UPSERT INTO test.kv(k, v) VALUES ($1, $2) | 192.168.12.58:54122 | test_app         | false       | executing |
| 14db6574435817d20000000000000002 |       2 | root      | 2017-08-16 18:00:50.678629+00:00 | UPSERT INTO test.kv(k, v) VALUES ($1, $2) | 192.168.12.57:54121 | test_app         | false       | executing |
| 14db6574433c621f0000000000000002 |       2 | root      | 2017-08-16 18:00:50.676813+00:00 | UPSERT INTO test.kv(k, v) VALUES ($1, $2) | 192.168.12.57:54124 | test_app         | false       | executing |
| 14db6574436f71d50000000000000002 |       2 | root      | 2017-08-16 18:00:50.680165+00:00 | UPSERT INTO test.kv(k, v) VALUES ($1, $2) | 192.168.12.57:54117 | test_app         | false       | executing |
+----------------------------------+---------+-----------+----------------------------------+-------------------------------------------+---------------------+------------------+-------------+-----------+
(8 rows)
~~~

### Cancel a query

When you see a query that is taking too long to complete, you can use the [`CANCEL QUERY`](cancel-query.html) statement to stop it.

For example, let's say you use `SHOW CLUSTER QUERIES` to find queries that have been running for more than 3 hours:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM [SHOW CLUSTER QUERIES]
      WHERE start < (now() - INTERVAL '3 hours');
~~~

~~~
+----------------------------------+---------+-----------+----------------------------------+----------------------------------+--------------------+------------------+-------------+-----------+
|             query_id             | node_id | user_name |              start               |              query               |   client_address   | application_name | distributed |   phase   |
+----------------------------------+---------+-----------+----------------------------------+----------------------------------+--------------------+------------------+-------------+-----------+
| 14dacc1f9a781e3d0000000000000001 |       2 | mroach    | 2017-08-10 11:34:32.778412+00:00 | SELECT * FROM test.kv ORDER BY k | 192.168.0.72:56194 | test_app         | false       | executing |
+----------------------------------+---------+-----------+----------------------------------+----------------------------------+--------------------+------------------+-------------+-----------+
~~~

To cancel this long-running query, and stop it from consuming resources, you note the `query_id` and use it with the `CANCEL QUERY` statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> CANCEL QUERY '14dacc1f9a781e3d0000000000000001';
~~~

## See also

- [Manage Long-Running Queries](manage-long-running-queries.html)
- [`CANCEL QUERY`](cancel-query.html)
- [`SHOW SESSIONS`](show-sessions.html)
- [`SHOW JOBS`](show-jobs.html)
- [Other SQL Statements](sql-statements.html)
