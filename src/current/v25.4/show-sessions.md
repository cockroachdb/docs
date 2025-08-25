---
title: SHOW SESSIONS
summary: The SHOW SESSIONS statement lists all currently active sessions across the cluster or on the local node.
toc: true
docs_area: reference.sql
---

The `SHOW SESSIONS` [statement]({% link {{ page.version.version }}/sql-statements.md %}) lists details about currently active sessions, including:

- The address of the client that opened the session
- The node connected to
- How long the connection has been open
- Which queries are active in the session
- Which query has been running longest in the session

These details let you monitor the overall state of client connections and identify those that may need further investigation or adjustment.


## Required privileges

All users can see their own currently active sessions. Users with the [`VIEWACTIVITY` or `VIEWACTIVITYREDACTED` privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) can view see all users' currently active sessions. `VIEWACTIVITYREDACTED` causes constants in queries being executed by other users to be redacted.

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/show_sessions.html %}
</div>

- To list the active sessions across all nodes of the cluster, use `SHOW SESSIONS` or `SHOW CLUSTER SESSIONS`.
- To list the active sessions just on the local node, use `SHOW LOCAL SESSIONS`.

## Response

The following fields are returned for each session:

Field | Description
------|------------
`node_id` | The ID of the node connected to.
`session_id` | The ID of the connected session.
`status` | The session's status.
`user_name` | The username of the connected user.
`client_address` | The address and port of the connected client.
`application_name` | The [application name]({% link {{ page.version.version }}/set-vars.md %}#supported-variables) specified by the client, if any. For sessions from the [built-in SQL client]({% link {{ page.version.version }}/cockroach-sql.md %}), this will be `cockroach`.
`active_queries` | The SQL queries currently active in the session.
`last_active_query` | The most recently completed SQL query in the session.
`session_start` | The [`timestamptz`]({% link {{ page.version.version }}/timestamp.md %}) when the session was started.
`active_query_start` | The [`timestamptz`]({% link {{ page.version.version }}/timestamp.md %}) when the current active query in the session was started.
`num_txns_executed` | The number of [transactions]({% link {{ page.version.version }}/transactions.md %}) that have been opened in this session. This count includes transactions that are open.
`trace_id` | The ID of the session's active trace. It will be `0` if [tracing]({% link {{ page.version.version }}/set-vars.md %}#set-tracing) is `off`.
`goroutine_id` | The ID of the session's goroutine.

## Examples

### List active sessions across the cluster

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CLUSTER SESSIONS;
~~~

~~~
+---------+----------------------------------+-----------+--------------------+------------------+---------------------------------------------+--------------------------------------------|----------------------------------+----------------------------------+--------------------------------------+
| node_id |            session_id            | user_name |   client_address   | application_name |               active_queries                |            last_active_query               |          session_start           |        oldest_query_start        |                kv_txn
+---------+----------------------------------+-----------+--------------------+------------------+---------------------------------------------+--------------------------------------------+----------------------------------+----------------------------------+--------------------------------------|
|       2 | 1530fd8813ad694b0000000000000001 | mroach    | 192.168.0.72:56194 | test_app         | UPSERT INTO test.kv(k, v) VALUES ($1, $2);  | SELECT k, v FROM test.kv WHERE k = $1;     | 2017-08-10 14:08:22.878113+00:00 | 2017-08-10 14:08:44.648985+00:00 | 81fbdd4d-394c-4784-b540-97cd73910dba
|       2 | 1530ce8813ad694b0000000000000001 | mroach    | 192.168.0.72:56201 | test_app         | UPSERT INTO test.kv(k, v) VALUES ($1, $2);  | SELECT k, v FROM test.kv WHERE k = $1;     | 2017-08-10 14:08:22.878306+00:00 | 2017-08-10 14:08:44.653135+00:00 | 5aa6f141-5cae-468f-b16a-dfe8d4fb4bea
|       2 | 1520ab8813ad694b0000000000000001 | mroach    | 192.168.0.72:56198 | test_app         | UPSERT INTO test.kv(k, v) VALUES ($1, $2);  | SELECT k, v FROM test.kv WHERE k = $1;     | 2017-08-10 14:08:22.878464+00:00 | 2017-08-10 14:08:44.643749+00:00 | d8fedb88-fc21-4720-aabe-cd43ec204d88
|       3 | 1559f68813ad694b0000000000000001 | broach    | 192.168.0.73:56199 | test_app         | SELECT k, v FROM test.kv WHERE k = $1;      | UPSERT INTO test.kv(k, v) VALUES ($1, $2); | 2017-08-10 14:08:22.878048+00:00 | 2017-08-10 14:08:44.655709+00:00 | NULL
|       3 | 1340rd8813ad694b0000000000000001 | broach    | 192.168.0.73:56196 | test_app         | UPSERT INTO test.kv(k, v) VALUES ($1, $2);  | SELECT k, v FROM test.kv WHERE k = $1;     | 2017-08-10 14:08:22.878166+00:00 | 2017-08-10 14:08:44.647464+00:00 | aded7717-94e1-4ac4-9d37-8765e3418e32
|       1 | 1230ab8813ad694b0000000000000001 | lroach    | 192.168.0.71:56180 | test_app         | UPSERT INTO test.kv(k, v) VALUES ($1, $2);  | SELECT k, v FROM test.kv WHERE k = $1;     | 2017-08-10 14:08:22.87337+00:00  | 2017-08-10 14:08:44.64788+00:00  | f691c5dd-b29e-48ed-a1dd-6d7f71faa82e
|       1 | 15234d8813ad694b0000000000000001 | lroach    | 192.168.0.71:56197 | test_app         | UPSERT INTO test.kv(k, v) VALUES ($1, $2);  | SELECT k, v FROM test.kv WHERE k = $1;     | 2017-08-10 14:08:22.877932+00:00 | 2017-08-10 14:08:44.644786+00:00 | 86ae25ea-9abf-4f5e-ad96-0522178f4ce6
|       1 | 14605d8813ad694b0000000000000001 | lroach    | 192.168.0.71:56200 | test_app         | UPSERT INTO test.kv(k, v) VALUES ($1, $2);  | SELECT k, v FROM test.kv WHERE k = $1;     | 2017-08-10 14:08:22.878534+00:00 | 2017-08-10 14:08:44.653524+00:00 | 8ad972b6-4347-4128-9e52-8553f3491963
|       1 | 1965lh8813ad694b0000000000000001 | root      | 127.0.0.1:56211    | cockroach        | SHOW CLUSTER SESSIONS;                      |                                            | 2017-08-10 14:08:27.666826+00:00 | 2017-08-10 14:08:44.653355+00:00 | NULL
+---------+----------------------------------+-----------+--------------------+------------------+---------------------------------------------+--------------------------------------------+----------------------------------+----------------------------------|--------------------------------------+
(9 rows)
~~~

Alternatively, you can use `SHOW SESSIONS` to receive the same response.

### List active sessions on the local node

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW LOCAL SESSIONS;
~~~

~~~
+---------+----------------------------------+-----------+--------------------+------------------+---------------------------------------------+--------------------------------------------|----------------------------------+----------------------------------+--------------------------------------+
| node_id |            session_id            | user_name |   client_address   | application_name |               active_queries                |            last_active_query               |          session_start           |        oldest_query_start        |                kv_txn                |
+---------+----------------------------------+-----------+--------------------+------------------+---------------------------------------------+--------------------------------------------+----------------------------------+----------------------------------+--------------------------------------|
|       1 | 1230ab8813ad694b0000000000000001 | lroach    | 192.168.0.71:56180 | test_app         | UPSERT INTO test.kv(k, v) VALUES ($1, $2);  | SELECT k, v FROM test.kv WHERE k = $1;     | 2017-08-10 14:08:22.87337+00:00  | 2017-08-10 14:08:44.64788+00:00  | f691c5dd-b29e-48ed-a1dd-6d7f71faa82e |
|       1 | 15234d8813ad694b0000000000000001 | lroach    | 192.168.0.71:56197 | test_app         | UPSERT INTO test.kv(k, v) VALUES ($1, $2);  | SELECT k, v FROM test.kv WHERE k = $1;     | 2017-08-10 14:08:22.877932+00:00 | 2017-08-10 14:08:44.644786+00:00 | 86ae25ea-9abf-4f5e-ad96-0522178f4ce6 |
|       1 | 14605d8813ad694b0000000000000001 | lroach    | 192.168.0.71:56200 | test_app         | UPSERT INTO test.kv(k, v) VALUES ($1, $2);  | SELECT k, v FROM test.kv WHERE k = $1;     | 2017-08-10 14:08:22.878534+00:00 | 2017-08-10 14:08:44.653524+00:00 | 8ad972b6-4347-4128-9e52-8553f3491963 |
|       1 | 1965lh8813ad694b0000000000000001 | root      | 127.0.0.1:56211    | cockroach        | SHOW CLUSTER SESSIONS;                      |                                            | 2017-08-10 14:08:27.666826+00:00 | 2017-08-10 14:08:44.653355+00:00 | NULL                                 |
+---------+----------------------------------+-----------+--------------------+------------------+---------------------------------------------+--------------------------------------------+----------------------------------+----------------------------------|--------------------------------------+
(4 rows)
~~~

### Filter for specific sessions

You can use a [`SELECT`]({% link {{ page.version.version }}/select-clause.md %}) statement to filter the list of currently active sessions by one or more of the [response fields](#response).

#### Show sessions associated with a specific user

{% include_cached copy-clipboard.html %}
~~~ sql
> WITH x AS (SHOW CLUSTER SESSIONS) SELECT * FROM x WHERE user_name = 'mroach';
~~~

~~~
+---------+-----------+--------------------+------------------+---------------------------------------------+--------------------------------------------|----------------------------------+----------------------------------+--------------------------------------+
| node_id | user_name |   client_address   | application_name |               active_queries                |            last_active_query               |          session_start           |        oldest_query_start        |                kv_txn                |
+---------+-----------+--------------------+------------------+---------------------------------------------+--------------------------------------------+----------------------------------+----------------------------------+--------------------------------------|
|       2 | mroach    | 192.168.0.72:56194 | test_app         | UPSERT INTO test.kv(k, v) VALUES ($1, $2);  | SELECT k, v FROM test.kv WHERE k = $1;     | 2017-08-10 14:08:22.878113+00:00 | 2017-08-10 14:08:44.648985+00:00 | 81fbdd4d-394c-4784-b540-97cd73910dba |
|       2 | mroach    | 192.168.0.72:56201 | test_app         | UPSERT INTO test.kv(k, v) VALUES ($1, $2);  | SELECT k, v FROM test.kv WHERE k = $1;     | 2017-08-10 14:08:22.878306+00:00 | 2017-08-10 14:08:44.653135+00:00 | 5aa6f141-5cae-468f-b16a-dfe8d4fb4bea |
|       2 | mroach    | 192.168.0.72:56198 | test_app         | UPSERT INTO test.kv(k, v) VALUES ($1, $2);  | SELECT k, v FROM test.kv WHERE k = $1;     | 2017-08-10 14:08:22.878464+00:00 | 2017-08-10 14:08:44.643749+00:00 | d8fedb88-fc21-4720-aabe-cd43ec204d88 |
+---------+-----------+--------------------+------------------+---------------------------------------------+--------------------------------------------+----------------------------------+----------------------------------|--------------------------------------+
(3 rows)
~~~

#### Exclude sessions from the built-in SQL client

To exclude sessions from the [built-in SQL client]({% link {{ page.version.version }}/cockroach-sql.md %}), filter for sessions that do not show `cockroach` as the `application_name`:

{% include_cached copy-clipboard.html %}
~~~ sql
> WITH x AS (SHOW CLUSTER SESSIONS) SELECT * FROM x
      WHERE application_name != 'cockroach';
~~~

~~~
+---------+-----------+--------------------+------------------+---------------------------------------------+--------------------------------------------|----------------------------------+----------------------------------+--------------------------------------+
| node_id | user_name |   client_address   | application_name |               active_queries                |            last_active_query               |          session_start           |        oldest_query_start        |                kv_txn
+---------+-----------+--------------------+------------------+---------------------------------------------+--------------------------------------------+----------------------------------+----------------------------------+--------------------------------------|
|       2 | mroach    | 192.168.0.72:56194 | test_app         | UPSERT INTO test.kv(k, v) VALUES ($1, $2);  | SELECT k, v FROM test.kv WHERE k = $1;     | 2017-08-10 14:08:22.878113+00:00 | 2017-08-10 14:08:44.648985+00:00 | 81fbdd4d-394c-4784-b540-97cd73910dba
|       2 | mroach    | 192.168.0.72:56201 | test_app         | UPSERT INTO test.kv(k, v) VALUES ($1, $2);  | SELECT k, v FROM test.kv WHERE k = $1;     | 2017-08-10 14:08:22.878306+00:00 | 2017-08-10 14:08:44.653135+00:00 | 5aa6f141-5cae-468f-b16a-dfe8d4fb4bea
|       2 | mroach    | 192.168.0.72:56198 | test_app         | UPSERT INTO test.kv(k, v) VALUES ($1, $2);  | SELECT k, v FROM test.kv WHERE k = $1;     | 2017-08-10 14:08:22.878464+00:00 | 2017-08-10 14:08:44.643749+00:00 | d8fedb88-fc21-4720-aabe-cd43ec204d88
|       3 | broach    | 192.168.0.73:56199 | test_app         | SELECT k, v FROM test.kv WHERE k = $1;      | UPSERT INTO test.kv(k, v) VALUES ($1, $2); | 2017-08-10 14:08:22.878048+00:00 | 2017-08-10 14:08:44.655709+00:00 | NULL
|       3 | broach    | 192.168.0.73:56196 | test_app         | UPSERT INTO test.kv(k, v) VALUES ($1, $2);  | SELECT k, v FROM test.kv WHERE k = $1;     | 2017-08-10 14:08:22.878166+00:00 | 2017-08-10 14:08:44.647464+00:00 | aded7717-94e1-4ac4-9d37-8765e3418e32
|       1 | lroach    | 192.168.0.71:56180 | test_app         | UPSERT INTO test.kv(k, v) VALUES ($1, $2);  | SELECT k, v FROM test.kv WHERE k = $1;     | 2017-08-10 14:08:22.87337+00:00  | 2017-08-10 14:08:44.64788+00:00  | f691c5dd-b29e-48ed-a1dd-6d7f71faa82e
|       1 | lroach    | 192.168.0.71:56197 | test_app         | UPSERT INTO test.kv(k, v) VALUES ($1, $2);  | SELECT k, v FROM test.kv WHERE k = $1;     | 2017-08-10 14:08:22.877932+00:00 | 2017-08-10 14:08:44.644786+00:00 | 86ae25ea-9abf-4f5e-ad96-0522178f4ce6
|       1 | lroach    | 192.168.0.71:56200 | test_app         | UPSERT INTO test.kv(k, v) VALUES ($1, $2);  | SELECT k, v FROM test.kv WHERE k = $1;     | 2017-08-10 14:08:22.878534+00:00 | 2017-08-10 14:08:44.653524+00:00 | 8ad972b6-4347-4128-9e52-8553f3491963
+---------+-----------+--------------------+------------------+---------------------------------------------+--------------------------------------------+----------------------------------+----------------------------------|--------------------------------------+
(8 rows)
~~~

### Identify and cancel a problematic query

If a session has been open for a long time and you are concerned that the oldest active SQL query may be problematic, you can use the [`SHOW STATEMENTS`]({% link {{ page.version.version }}/show-statements.md %}) statement to further investigate the query and then, if necessary, use the [`CANCEL QUERY`]({% link {{ page.version.version }}/cancel-query.md %}) statement to cancel it.

For example, let's say you run `SHOW SESSIONS` and notice that the following session has been open for more than 2 hours:

~~~
+---------+----------+--------------------+------------------+------------------------------------+--------------------|----------------------------------+----------------------------------+--------+
| node_id | user_name |   client_address   | application_name |           active_queries           | last_active_query  |          session_start           |        oldest_query_start        | kv_txn
+---------+-----------+--------------------+------------------+------------------------------------+--------------------+----------------------------------+----------------------------------|--------+
|       2 | mroach    | 192.168.0.72:56194 | test_app         | SELECT * FROM test.kv ORDER BY k;  |                    | 2017-08-10 14:08:22.878113+00:00 | 2017-08-10 14:08:22.878113+00:00 | NULL
+---------+-----------+--------------------+------------------+------------------------------------+--------------------|----------------------------------+----------------------------------+--------+
~~~

Since the `oldest_query_start` timestamp is the same as the `session_start` timestamp, you are concerned that the `SELECT` query shown in `active_queries` has been running for too long and may be consuming too many resources. So you use the [`SHOW STATEMENTS`]({% link {{ page.version.version }}/show-statements.md %}) statement to get more information about the query, filtering based on details you already have:

{% include_cached copy-clipboard.html %}
~~~ sql
> WITH x AS (SHOW CLUSTER STATEMENTS) SELECT * FROM x
      WHERE client_address = '192.168.0.72:56194'
          AND user_name = 'mroach'
          AND query = 'SELECT * FROM test.kv ORDER BY k';
~~~

~~~
+----------------------------------+---------+-----------+----------------------------------+----------------------------------+--------------------+------------------+-------------+-----------+
|             query_id             | node_id | user_name |              start               |              query               |   client_address   | application_name | distributed |   phase   |
+----------------------------------+---------+-----------+----------------------------------+----------------------------------+--------------------+------------------+-------------+-----------+
| 14dacc1f9a781e3d0000000000000001 |       2 | mroach    | 2017-08-10 14:08:22.878113+00:00 | SELECT * FROM test.kv ORDER BY k | 192.168.0.72:56194 | test_app         | false       | executing |
+----------------------------------+---------+-----------+----------------------------------+----------------------------------+--------------------+------------------+-------------+-----------+
~~~

Using the `start` field, you confirm that the query has been running since the start of the session and decide that is too long. So to cancel the query, and stop it from consuming resources, you note the `query_id` and use it with the [`CANCEL QUERY`]({% link {{ page.version.version }}/cancel-query.md %}) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> CANCEL QUERY '14dacc1f9a781e3d0000000000000001';
~~~

Alternatively, if you know that you want to cancel the query based on the details in `SHOW SESSIONS`, you could execute a single [`CANCEL QUERY`]({% link {{ page.version.version }}/cancel-query.md %}) statement with a nested `SELECT` statement that returns the `query_id`:

{% include_cached copy-clipboard.html %}
~~~ sql
> CANCEL QUERY (WITH x as (SHOW CLUSTER STATEMENTS) SELECT query_id FROM x
      WHERE client_address = '192.168.0.72:56194'
          AND user_name = 'mroach'
          AND query = 'SELECT * FROM test.kv ORDER BY k');
~~~

## See also

- [`SHOW STATEMENTS`]({% link {{ page.version.version }}/show-statements.md %})
- [`CANCEL QUERY`]({% link {{ page.version.version }}/cancel-query.md %})
- [SQL Statements]({% link {{ page.version.version }}/sql-statements.md %})
