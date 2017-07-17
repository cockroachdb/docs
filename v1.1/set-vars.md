---
title: SET (session settings)
summary: The SET statement modifies the current settings for the client session.
toc: false
---

The `SET` [statement](sql-statements.html) can modify one of the
session setting variables. These can also be queried via [`SHOW`](show-vars.html).

{{site.data.alerts.callout_danger}}In some cases, client drivers can drop and restart the connection to the server. When this happens, any session configurations made with <code>SET</code> statements are lost. It is therefore more reliable to configure the session in the client's connection string. For examples in different languages, see the <a href="build-an-app-with-cockroachdb.html">Build an App with CockroachDB</a> tutorials.{{site.data.alerts.end}}

<div id="toc"></div>

## Required Privileges

No [privileges](privileges.html) are required to modify the session settings.

## Synopsis

General syntax:

{% include sql/{{ page.version.version }}/diagrams/set_var.html %}

{{site.data.alerts.callout_info}}The <code>SET</code> statement for session settings is unrelated to the other <a href="set-transaction.html"><code>SET TRANSACTION</code></a> and <a href="cluster-settings.html#change-a-cluster-setting"><code>SET CLUSTER SETTING</code></a> statements.{{site.data.alerts.end}}

## Parameters

The `SET <session variable>` statement accepts two parameters: the
variable name and the value to use to modify the variable.

The variable name is case insensitive. The value can be a list of one or more items. For example, the variable `search_path` is multi-valued.

### Supported Variables

| Variable name | Description  | Initial value | Can be viewed with [`SHOW`](show-vars.html)? |
|---------------|--------------|---------------|----------------------------------------------|
| `application_name` | The current application name for statistics collection. | Empty string | Yes |
| `client_encoding` | Ignored; recognized for compatibility with PostgreSQL clients. Only possible value is "`UTF8`". | N/A | No |
| `client_min_messages` | Ignored; recognized for compatibility with PostgreSQL clients. Only possible value is "`on`". | N/A | No |
| `database` | The default database for the current session. | Database in connection string, or empty if not specified | Yes |
| `default_transaction_isolation` | The default transaction isolation level for the current session. See [Transaction parameters](transactions.html#transaction-parameters) and [`SET TRANSACTION`](set-transaction.html) for more details. | Settings in connection string, or "`SERIALIZABLE`" if not specified  | Yes |
| `extra_float_digits` | Ignored; recognized for compatibility with PostgreSQL clients. | N/A | No |
| `search_path` | A list of databases or namespaces that will be searched to resolve unqualified table or function names. For more details, see [Name Resolution](sql-name-resolution.html). | "`{pg_catalog}`" (for ORM compatibility) | Yes |
| `standard_conforming_strings` | Ignored; recognized for compatibility with PostgreSQL clients. | N/A | No |
| `time zone` | The default time zone for the current session.<br><br>This value can be a string representation of a local system-defined time zone (e.g., `'EST'`, `'America/New_York'`) or a positive or negative numeric offset from UTC (e.g., `-7`, `+7`). Also, `DEFAULT`, `LOCAL`, or `0` sets the session time zone to `UTC`. | `UTC` | Yes |

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

### Set the default time zone via `SET TIME ZONE`

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

## See Also

- [`SET TRANSACTION`](set-transaction.html)
- [`SET CLUSTER SETTING`](set-cluster-setting.html)
- [`SHOW` (session variable)](show-vars.html)
- [The `TIMESTAMP` and `TIMESTAMPTZ` data types.](timestamp.html)
