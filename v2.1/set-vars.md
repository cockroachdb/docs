---
title: SET (session variable)
summary: The SET statement modifies the current configuration variables for the client session.
toc: true
redirect_from:
- set-application-name.html
- set-database.html
- set-time-zone.html
---

The `SET` [statement](sql-statements.html) can modify one of the session configuration variables. These can also be queried via [`SHOW`](show-vars.html).

{{site.data.alerts.callout_danger}}In some cases, client drivers can drop and restart the connection to the server. When this happens, any session configurations made with <code>SET</code> statements are lost. It is therefore more reliable to configure the session in the client's connection string. For examples in different languages, see the <a href="build-an-app-with-cockroachdb.html">Build an App with CockroachDB</a> tutorials.{{site.data.alerts.end}}


## Required privileges

No [privileges](privileges.html) are required to modify the session settings.

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/set_var.html %}
</div>

{{site.data.alerts.callout_info}}The <code>SET</code> statement for session settings is unrelated to the other <a href="set-transaction.html"><code>SET TRANSACTION</code></a> and <a href="cluster-settings.html#change-a-cluster-setting"><code>SET CLUSTER SETTING</code></a> statements.{{site.data.alerts.end}}

## Parameters

The `SET <session variable>` statement accepts two parameters: the
variable name and the value to use to modify the variable.

The variable name is case insensitive. The value can be a list of one or more items. For example, the variable `search_path` is multi-valued.

### Supported variables

 Variable name | Description  | Initial value | Can be viewed with [`SHOW`](show-vars.html)? |
---------------|--------------|---------------|-----------------------------------------
 `application_name` | The current application name for statistics collection. | Empty string | Yes
 `database` | The [current database](sql-name-resolution.html#current-database).  Database in connection string, or empty if not specified | Yes
 `default_transaction_isolation` | The default transaction isolation level for the current session. See [Transaction parameters](transactions.html#transaction-parameters) and [`SET TRANSACTION`](set-transaction.html) for more details. | Settings in connection string, or "`SERIALIZABLE`" if not specified  | Yes
 `default_transaction_read_only` | The default transaction access mode for the current session. If set to `on`, only read operations are allowed in transactions in the current session; if set to `off`, both read and write operations are allowed. See [`SET TRANSACTION`](set-transaction.html) for more details. | `off` | Yes
 `sql_safe_updates` | If `true`, disallow potentially unsafe SQL statements, including `DELETE` without a `WHERE` clause, `UPDATE` without a `WHERE` clause, and `ALTER TABLE ... DROP COLUMN`. See [Allow Potentially Unsafe SQL Statements](use-the-built-in-sql-client.html#allow-potentially-unsafe-sql-statements) for more details. | `true` for interactive sessions from the [built-in SQL client](use-the-built-in-sql-client.html) unless `--safe-updates=false` is specified,<br>`false` for sessions from other clients | Yes
 `search_path` | A list of schemas that will be searched to resolve unqualified table or function names. For more details, see [Name Resolution](sql-name-resolution.html). | "`{public}`" | Yes
 `server_version_num` | The version of PostgreSQL that CockroachDB emulates. | Version-dependent | Yes
 `statement_timeout` | <span class="version-tag">New in v2.1:</span> The amount of time a statement can run before being stopped.<br><br>This value can be an `int` (e.g., `10`) and will be interpreted as milliseconds. It can also be an interval or string argument, where the string can be parsed as a valid interval (e.g., `'4s'`). A value of `0` turns it off. | `0s` | Yes
 `timezone` | The default time zone for the current session.<br><br>This value can be a string representation of a local system-defined time zone (e.g., `'EST'`, `'America/New_York'`) or a positive or negative numeric offset from UTC (e.g., `-7`, `+7`). Also, `DEFAULT`, `LOCAL`, or `0` sets the session time zone to `UTC`.</br><br>See [Setting the Time Zone](#set-time-zone) for more details. <br><br>This session variable was named `"time zone"` (with a space) in CockroachDB 1.x. It has been renamed for compatibility with PostgreSQL. | `UTC` | Yes
 `tracing` | The trace recording state.<br><br>See [`SET TRACING`](#set-tracing) for more details. | `off` | Yes
 `transaction_isolation` | The isolation level of the current transaction. See [Transaction parameters](transactions.html#transaction-parameters) for more details.<br><br>This session variable was called `transaction isolation level` (with spaces) in CockroachDB 1.x. It has been renamed for compatibility with PostgreSQL. | `SERIALIZABLE` | Yes
 `transaction_priority` | The priority of the current transaction. See [Transaction parameters](transactions.html#transaction-parameters) for more details.<br><br>This session variable was called `transaction priority` (with a space) in CockroachDB 1.x. It has been renamed for compatibility with PostgreSQL. | `NORMAL` | Yes
 `transaction_read_only` | The access mode of the current transaction. See [Set Transaction](set-transaction.html) for more details. | `off` | Yes
 `transaction_status` | The state of the current transaction. See [Transactions](transactions.html) for more details.<br><br>This session variable was called `transaction status` (with a space) in CockroachDB 1.x. It has been renamed for compatibility with PostgreSQL. | `NoTxn` | Yes
 `client_encoding` | Ignored; recognized for compatibility with PostgreSQL clients. Only possible value is "`UTF8`". | N/A | No
 `client_min_messages` | Ignored; recognized for compatibility with PostgreSQL clients. Only posible value is "`on`". | N/A | No
 `extra_float_digits` | Ignored; recognized for compatibility with PostgreSQL clients. | N/A | No
 `standard_conforming_strings` | Ignored; recognized for compatibility with PostgreSQL clients. | N/A | No

Special syntax cases:

 Syntax | Equivalent to | Notes
--------|---------------|-------
 `USE ...` | `SET database = ...` | This is provided as convenience for users with a MySQL/MSSQL background.
 `SET NAMES ...` | `SET client_encoding = ...` | This is provided for compatibility with PostgreSQL clients.
 `SET SESSION CHARACTERISTICS AS TRANSACTION ISOLATION LEVEL ...` | `SET default_transaction_isolation = ...` | This is provided for compatibility with standard SQL.
 `SET TIME ZONE ...` | `SET timezone = ...` | This is provided for compatibility with PostgreSQL clients.

## Examples

### Set simple variables

The following demonstrates how `SET` can be used to configure the
default database for the current session:

{% include copy-clipboard.html %}
~~~ sql?nofmt
> SET database = bank;
~~~

{% include copy-clipboard.html %}
~~~ sql
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

### Set variables to values containing spaces

The following demonstrates how to use quoting to use values containing spaces:

{% include copy-clipboard.html %}
~~~ sql?nofmt
> SET database = "database name with spaces";
~~~

{% include copy-clipboard.html %}
~~~ sql
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

### Set variables to a list of values

The following demonstrates how to assign a list of values:

{% include copy-clipboard.html %}
~~~ sql
> SET search_path = pg_catalog, public;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW search_path;
~~~

~~~
+---------------------------+
|        search_path        |
+---------------------------+
| pg_catalog, public        |
+---------------------------+
(1 row)
~~~

### Reset a variable to its default value

{{site.data.alerts.callout_success}}You can use <a href="reset-vars.html"><code>RESET</code></a> to reset a session variable as well.{{site.data.alerts.end}}

{% include copy-clipboard.html %}
~~~ sql?nofmt
> SET default_transaction_isolation = SNAPSHOT;
~~~

{% include copy-clipboard.html %}
~~~ sql?nofmt
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

{% include copy-clipboard.html %}
~~~ sql?nofmt
> SET default_transaction_isolation = DEFAULT;
~~~

{% include copy-clipboard.html %}
~~~ sql?nofmt
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

### Parameters

The time zone value indicates the time zone for the current session.

This value can be a string representation of a local system-defined
time zone (e.g., `'EST'`, `'America/New_York'`) or a positive or
negative numeric offset from UTC (e.g., `-7`, `+7`). Also, `DEFAULT`,
`LOCAL`, or `0` sets the session time zone to `UTC`.

### Example: Set the default time zone via `SET TIME ZONE`

{% include copy-clipboard.html %}
~~~ sql
> SET TIME ZONE 'EST'; -- same as SET "timezone" = 'EST'
~~~

{% include copy-clipboard.html %}
~~~ sql?nofmt
> SHOW TIME ZONE;
~~~

~~~
+-----------+
| time zone |
+-----------+
| EST       |
+-----------+
(1 row)
~~~

{% include copy-clipboard.html %}
~~~ sql
> SET TIME ZONE DEFAULT; -- same as SET "timezone" = DEFAULT
~~~

{% include copy-clipboard.html %}
~~~ sql?nofmt
> SHOW TIME ZONE;
~~~

~~~
+-----------+
| time zone |
+-----------+
| UTC       |
+-----------+
(1 row)
~~~

## `SET TRACING`

`SET TRACING` changes the trace recording state of the current session. A trace recording can be inspected with the [`SHOW TRACE FOR SESSION`](show-trace-for-session.html) statement.

 Value | Description
-------|------------
`off` | Trace recording is disabled.
`cluster` | Trace recording is enabled; distributed traces are collected.
`on`  | Same as `cluster`.
`kv`  | Same as `cluster` except that "kv messages" are collected instead of regular trace messages. See [`SHOW TRACE FOR SESSION`](show-trace-for-session.html).
`local` | Trace recording is enabled; only trace messages issued by the local node are collected.
`results` | Result rows and row counts are copied to the session trace. This must be specified to in order for the output of a query to be printed in the session trace.<br><br>Example: `SET tracing = kv, results;`

## See also

- [`RESET`](reset-vars.html)
- [`SET TRANSACTION`](set-transaction.html)
- [`SET CLUSTER SETTING`](set-cluster-setting.html)
- [`SHOW` (session variable)](show-vars.html)
- [The `TIMESTAMP` and `TIMESTAMPTZ` data types.](timestamp.html)
- [`SHOW TRACE FOR SESSION`](show-trace-for-session.html)
