---
title: SET (session variable)
summary: The SET statement modifies the current configuration variables for the client session.
toc: true
---

The `SET` [statement](sql-statements.html) can modify one of the session configuration variables. These can also be queried via [`SHOW`](show-vars.html).

{{site.data.alerts.callout_danger}}In some cases, client drivers can drop and restart the connection to the server. When this happens, any session configurations made with <code>SET</code> statements are lost. It is therefore more reliable to configure the session in the client's connection string. For examples in different languages, see the <a href="build-an-app-with-cockroachdb.html">Build an App with CockroachDB</a> tutorials.{{site.data.alerts.end}}


## Required Privileges

No [privileges](privileges.html) are required to modify the session settings.

## Synopsis

{% include {{ page.version.version }}/sql/diagrams/set_var.html %}

{{site.data.alerts.callout_info}}The <code>SET</code> statement for session settings is unrelated to the other <a href="set-transaction.html"><code>SET TRANSACTION</code></a> and <a href="cluster-settings.html#change-a-cluster-setting"><code>SET CLUSTER SETTING</code></a> statements.{{site.data.alerts.end}}

## Parameters

The `SET <session variable>` statement accepts two parameters: the
variable name and the value to use to modify the variable.

The variable name is case insensitive. The value can be a list of one or more items. For example, the variable `search_path` is multi-valued.

### Supported Variables

| Variable name | Description  | Initial value | Can be viewed with [`SHOW`](show-vars.html)? |
|---------------|--------------|---------------|----------------------------------------------|
| `application_name` | The current application name for statistics collection. | Empty string | Yes |
| `database` | The default database for the current session. | Database in connection string, or empty if not specified | Yes |
| `default_transaction_isolation` | The default transaction isolation level for the current session. See [Transaction parameters](transactions.html#transaction-parameters) and [`SET TRANSACTION`](set-transaction.html) for more details. | Settings in connection string, or "`SERIALIZABLE`" if not specified  | Yes |
| `sql_safe_updates` | If `false`, allow potentially unsafe SQL statements, including `DROP` of a non-empty database and all dependent objects, `DELETE` without a `WHERE` clause, `UPDATE` without a `WHERE` clause, and `ALTER TABLE .. DROP COLUMN`. See [Allow Potentially Unsafe SQL Statements](use-the-built-in-sql-client.html#allow-potentially-unsafe-sql-statements) for more details. | `true` for interactive sessions from the [built-in SQL client](use-the-built-in-sql-client.html),<br>`false` for sessions from other clients | Yes |
| `search_path` | A list of databases or namespaces that will be searched to resolve unqualified table or function names. For more details, see [Name Resolution](sql-name-resolution.html). | "`{pg_catalog}`" (for ORM compatibility) | Yes |
| `time zone` | The default time zone for the current session.<br><br>This value can be a string representation of a local system-defined time zone (e.g., `'EST'`, `'America/New_York'`) or a positive or negative numeric offset from UTC (e.g., `-7`, `+7`). Also, `DEFAULT`, `LOCAL`, or `0` sets the session time zone to `UTC`.</br><br>See [`SET TIME ZONE`](#set-time-zone) for more details. | `UTC` | Yes |
| `tracing` | The trace recording state.<br><br>See [`SET TRACING`](#set-tracing) for more details. | `off` | Yes |
| `client_encoding` | Ignored; recognized for compatibility with PostgreSQL clients. Only possible value is "`UTF8`". | N/A | No |
| `client_min_messages` | Ignored; recognized for compatibility with PostgreSQL clients. Only possible value is "`on`". | N/A | No |
| `extra_float_digits` | Ignored; recognized for compatibility with PostgreSQL clients. | N/A | No |
| `standard_conforming_strings` | Ignored; recognized for compatibility with PostgreSQL clients. | N/A | No |

Special syntax cases:

| Syntax | Equivalent to | Notes |
|--------|---------------|-------|
| `USE ...` | `SET database = ...` | This is provided as convenience for users with a MySQL/MSSQL background.
| `SET NAMES ...` | `SET client_encoding = ...` | This is provided for compatibility with PostgreSQL clients.
| `SET SESSION CHARACTERISTICS AS TRANSACTION ISOLATION LEVEL ...` | `SET default_transaction_isolation = ...` | This is provided for compatibility with standard SQL.
| `SET TIME ZONE ...` | `SET "time zone" = ...` | This is provided for compatibility with PostgreSQL clients.

## Examples

### Set Simple Variables

The following demonstrates how `SET` can be used to configure the
default database for the current session:

~~~ sql
> SET database = bank;
> SHOW database;
~~~

~~~
+----------+
| database |
+----------+
| bank     |
+----------+
(1 row)
~~~

### Set Variables to Values Containing Spaces

The following demonstrates how to use quoting to use values containing spaces:

~~~ sql
> SET database = "database name with spaces";
> SHOW database;
~~~

~~~
+---------------------------+
|         database          |
+---------------------------+
| database name with spaces |
+---------------------------+
(1 row)
~~~

### Set Variables to a List of Values

The following demonstrates how to assign a list of values:

~~~ sql
> SET search_path = mydb, otherdb;
> SHOW search_path;
~~~

~~~
+---------------------------+
|        search_path        |
+---------------------------+
| pg_catalog, mydb, otherdb |
+---------------------------+
(1 row)
~~~

### Reset a Variable to Its Default Value

{{site.data.alerts.callout_success}}You can use <a href="reset-vars.html"><code>RESET</code></a> to reset a session variable as well.{{site.data.alerts.end}}

~~~ sql
> SET default_transaction_isolation = SNAPSHOT;
~~~

~~~ sql
> SHOW default_transaction_isolation;
~~~

~~~
+-------------------------------+
| default_transaction_isolation |
+-------------------------------+
| SNAPSHOT                      |
+-------------------------------+
(1 row)
~~~

~~~ sql
> SET default_transaction_isolation = DEFAULT;
~~~

~~~ sql
> SHOW default_transaction_isolation;
~~~

~~~
+-------------------------------+
| default_transaction_isolation |
+-------------------------------+
| SERIALIZABLE                  |
+-------------------------------+
(1 row)
~~~

## `SET TIME ZONE`

{{site.data.alerts.callout_danger}}As a best practice, we recommend not using this setting and avoid setting a session time for your database. We instead recommend converting UTC values to the appropriate time zone on the client side.{{site.data.alerts.end}}

You can control your client's default time zone for the current session with <code>SET TIME ZONE</code>. This will apply a session offset to all [`TIMESTAMP WITH TIME ZONE`](timestamp.html) values.

{{site.data.alerts.callout_info}}With setting <code>SET TIME ZONE</code>, CockroachDB uses UTC as the default time zone.{{site.data.alerts.end}}

`SET TIME ZONE` uses a special syntax form used to configure the `"time zone"` session parameter because `SET` cannot assign to parameter names containing spaces.

### Parameters

The time zone value indicates the time zone for the current session.

This value can be a string representation of a local system-defined
time zone (e.g., `'EST'`, `'America/New_York'`) or a positive or
negative numeric offset from UTC (e.g., `-7`, `+7`). Also, `DEFAULT`,
`LOCAL`, or `0` sets the session time zone to `UTC`.

### Example: Set the Default Time Zone via `SET TIME ZONE`

~~~ sql
> SET TIME ZONE 'EST'; -- same as SET "time zone" = 'EST'
> SHOW TIME ZONE;
~~~
~~~ shell
+-----------+
| time zone |
+-----------+
| EST       |
+-----------+
(1 row)
~~~
~~~ sql
> SET TIME ZONE DEFAULT; -- same as SET "time zone" = DEFAULT
> SHOW TIME ZONE;
~~~
~~~ shell
+-----------+
| time zone |
+-----------+
| UTC       |
+-----------+
(1 row)
~~~

## `SET TRACING`

`SET TRACING` changes the trace recording state of the current session. A trace recording can be inspected with the [`SHOW TRACE FOR SESSION`](show-trace.html) statement.

 Value | Description
-------|------------
`off` | Trace recording is disabled.
`cluster` | Trace recording is enabled; distributed traces are collected.
`on`  | Same as `cluster`.
`kv`  | Same as `cluster` except that "kv messages" are collected instead of regular trace messages. See [`SHOW TRACE`](show-trace.html).
`local` | Trace recording is enabled; only trace messages issued by the local node are collected.

## See Also

- [`RESET`](reset-vars.html)
- [`SET TRANSACTION`](set-transaction.html)
- [`SET CLUSTER SETTING`](set-cluster-setting.html)
- [`SHOW` (session variable)](show-vars.html)
- [The `TIMESTAMP` and `TIMESTAMPTZ` data types.](timestamp.html)
- [`SHOW TRACE`](show-trace.html)
