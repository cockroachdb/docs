---
title: SET (session settings)
summary: The SET statement modifies the current settings for the client session.
toc: false
---

The `SET` [statement](sql-statements.html) can modify one of the
session setting variables.

{{site.data.alerts.callout_danger}}In some cases, client drivers can drop and restart the connection to the server. When this happens, any session configurations made with <code>SET</code> statements are lost. It is therefore more reliable to configure the session in the client's connection string. For examples in different languages, see the <a href="build-an-app-with-cockroachdb.html">Build an App with CockroachDB</a> tutorials.{{site.data.alerts.end}}

<div id="toc"></div>

## Required Privileges

No [privileges](privileges.html) are required to modify the session settings.

## Synopsis

General syntax:

~~~
   SET [SESSION] <variable name> = <values...>
   SET [SESSION] <variable name> TO <values...>
   SET [SESSION] TIME ZONE <value>
~~~

The variable name is case insensitive.

Special syntax cases:

| Syntax | Equivalent to |
|--------|---------------|
| `SET SESSION CHARACTERISTICS AS TRANSACTION ISOLATION LEVEL ...` | `SET default_transaction_isolation = ...`
| `SET TIME ZONE ...` | Special syntax because the variable name contains a space. See [`SET TIME ZONE`](#set-time-zone) below.

Note: the `SET` statement for session settings in unrelated to the
other [`SET TRANSACTION`](set-transaction.html) statement.

## Supported variables

|Variable | Can be viewed with [`SHOW`](show-vars.html)? | Description | Initial value |
|---------|-----------------------------|-------------|---------------|
| `database` | Yes | The default database for the current session. | Database in connection string, or empty if not specified.
| `search_path` | Yes | A list of databases or namespaces that will be searched to resolve unqualified table or function names. For more details, see [Name Resolution](sql-name-resolution.html). | "`{pg_catalog}`" (for ORM compatibility).
| `time zone` | Yes | The default time zone for the current session. See [`SET TIME ZONE` notes](#set-time-zone) below. | "`UTC`"
| `default_transaction_isolation` | Yes | The default transaction isolation level for the current session. See [Transaction parameters](transactions.html#transaction-parameters) and [`SET TRANSACTION`](set-transaction.html) for more details. | Settings in connection string, or "`SERIALIZABLE`" if not specified.
| `syntax` | Yes | The default SQL syntax for the current session. | "`Traditional`"
| `client_encoding` | No | Ignored; recognized for compatibility with PostgreSQL clients. Only possible value is "`UTF8`". | N/A
| `client_min_messages` | No | Ignored; recognized for compatibility with PostgreSQL clients. Only possible value is "`on`". | N/A
| `standard_conforming_strings` | No | Ignored; recognized for compatibility with PostgreSQL clients. | N/A
| `application_name` | No | Ignored; recognized for compatibility with PostgreSQL clients. | N/A
| `extra_float_digits` | No | Ignored; recognized for compatibility with PostgreSQL clients. | N/A

## Examples

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

## `SET TIME ZONE`

The statement `SET TIME ZONE`
can configure the default time zone for the current session.

### Parameters

Parameter | Description
----------|------------
`zone_value` | The time zone for the current session.<br><br>This value can be a string representation of a local system-defined time zone (e.g., `'EST'`, `'America/New_York'`) or a positive or negative numeric offset from UTC (e.g., `-7`, `+7`). Also, `DEFAULT`, `LOCAL`, or `0` sets the session time zone to `UTC`.

### Examples

#### Set the time zone as part of a `TIMESTAMP` value (recommended)

~~~ sql
> CREATE TABLE timestamps (a INT PRIMARY KEY, b TIMESTAMPTZ);
> INSERT INTO timestamps VALUES (1, TIMESTAMPTZ '2016-03-26 10:10:10-05:00');
> SELECT * FROM timestamps;
~~~
~~~
+---+---------------------------+
| a |             b             |
+---+---------------------------+
| 1 | 2016-03-26 15:10:10+00:00 |
+---+---------------------------+
# Note that the timestamp returned is UTC-05:00, which is the equivalent of EST.
~~~

#### Set the default time zone via `SET TIME ZONE`

~~~ sql
> SET TIME ZONE 'EST';
> SHOW TIME ZONE;
~~~
~~~ shell
+-----------+
| TIME ZONE |
+-----------+
| EST       |
+-----------+
(1 row)
~~~
~~~ sql
> SET TIME ZONE DEFAULT;
> SHOW TIME ZONE;
~~~
~~~ shell
+-----------+
| TIME ZONE |
+-----------+
| UTC       |
+-----------+
(1 row)
~~~

## See Also

- [`SET TRANSACTION`](set-transaction.html)
- [`SHOW` (session variables)](show-vars.html)
 
