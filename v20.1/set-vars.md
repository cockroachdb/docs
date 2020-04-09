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

No [privileges](authorization.html#assign-privileges) are required to modify the session settings.

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

{% include {{ page.version.version }}/misc/session-vars.html %}

Special syntax cases:

 Syntax | Equivalent to | Notes
--------|---------------|-------
 `USE ...` | `SET database = ...` | This is provided as convenience for users with a MySQL/MSSQL background.
 `SET NAMES ...` | `SET client_encoding = ...` | This is provided for compatibility with PostgreSQL clients.
 `SET SCHEMA <name>` | `SET search_path = <name>` | This is provided for better compatibility with PostgreSQL.
 `SET SESSION CHARACTERISTICS AS TRANSACTION ISOLATION LEVEL ...` | `SET default_transaction_isolation = ...` | This is provided for compatibility with standard SQL.
 `SET TIME ZONE ...` | `SET timezone = ...` | This is provided for compatibility with PostgreSQL clients.

## Examples

### Set simple variables

The following demonstrates how `SET` can be used to configure the
default database for the current session:

{% include copy-clipboard.html %}
~~~ sql
> SET database = movr;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW database;
~~~

~~~
  database
+----------+
  movr
(1 row)
~~~

### Set variables to values containing spaces

The following demonstrates how to use quoting to use values containing spaces:

{% include copy-clipboard.html %}
~~~ sql
> SET database = "database name with spaces";
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW database;
~~~

~~~
  database
+----------+
  database name with spaces
(1 row)
~~~

### Set variables to a list of values

The following demonstrates how to assign a list of values:

{% include copy-clipboard.html %}
~~~ sql
> SET search_path = pg_catalog,public;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW search_path;
~~~

~~~
     search_path
+--------------------+
  pg_catalog, public
(1 row)
~~~

### Reset a variable to its default value

{{site.data.alerts.callout_success}}You can use <a href="reset-vars.html"><code>RESET</code></a> to reset a session variable as well.{{site.data.alerts.end}}

{% include copy-clipboard.html %}
~~~ sql
> SHOW search_path;
~~~

~~~
  search_path
+-------------+
  public
(1 row)
~~~

{% include copy-clipboard.html %}
~~~ sql
> SET search_path = 'app';
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW search_path;
~~~

~~~
  search_path
+-------------+
  app
(1 row)
~~~

{% include copy-clipboard.html %}
~~~ sql
> SET search_path = DEFAULT;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW search_path;
~~~

~~~
  search_path
+-------------+
  public
(1 row)
~~~

## `SET TIME ZONE`

{{site.data.alerts.callout_danger}}
As a best practice, we recommend not using this setting and avoid setting a session time for your database. We instead recommend converting UTC values to the appropriate time zone on the client side.
{{site.data.alerts.end}}

You can control the default time zone for a session with `SET TIME ZONE`. This will apply an offset to all [`TIMESTAMPTZ`/`TIMESTAMP WITH TIME ZONE`](timestamp.html) and [`TIMETZ`/`TIME WITH TIME ZONE`](time.html) values in the session. By default, CockroachDB uses UTC as the time zone for `SET TIME ZONE` offsets.

### Parameters

The input passed to `SET TIME ZONE` indicates the time zone for the current session. This value can be a string representation of a local system-defined time zone (e.g., `'EST'`, `'America/New_York'`) or a positive or negative numeric offset from UTC (e.g., `-7`, `+7`, or `UTC-7`, `UTC+7`) or GMT (e.g., `GMT-7`, `GMT+7`). The numeric offset input can also be colon-delimited (e.g., `-7:00`, `GMT+7:00`).

{{site.data.alerts.callout_info}}
Only offsets specified by integers use the [ISO 8601 time offset](https://en.wikipedia.org/wiki/ISO_8601#Time_offsets_from_UTC) (i.e., the offset input is parsed as hours *east* of the specified time zone). If you explicitly specify `UTC` or `GMT` for the time zone offset (e.g., `UTC-7`,`GMT+7`), or if the numeric input is colon-delimited (e.g.,  `-7:00`, `GMT+7:00`), CockroachDB uses the [POSIX time offset](https://www.postgresql.org/docs/current/datatype-datetime.html#DATATYPE-TIMEZONES) (i.e., hours *west* of the specified time zone). 
{{site.data.alerts.end}}

All timezone abbreviations are case-sensitive and must be uppercase, with the exception of `UTC`, for which `utc` is an alias.

`DEFAULT`, `LOCAL`, or `0` sets the session time zone to `UTC`.

### Example: Set the default time zone via `SET TIME ZONE`

{% include copy-clipboard.html %}
~~~ sql
> SET TIME ZONE 'EST'; -- same as SET "timezone" = 'EST'
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW TIME ZONE;
~~~

~~~
  timezone
+----------+
  EST
(1 row)
~~~

{% include copy-clipboard.html %}
~~~ sql
> SET TIME ZONE DEFAULT; -- same as SET "timezone" = DEFAULT
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW TIME ZONE;
~~~

~~~
  timezone
+----------+
  UTC
(1 row)
~~~

## `SET TRACING`

`SET TRACING` changes the trace recording state of the current session. A trace recording can be inspected with the [`SHOW TRACE FOR SESSION`](show-trace.html) statement.

 Value | Description
-------|------------
`off` | Trace recording is disabled.
`cluster` | Trace recording is enabled; distributed traces are collected.
`on`  | Same as `cluster`.
`kv`  | Same as `cluster` except that "kv messages" are collected instead of regular trace messages. See [`SHOW TRACE FOR SESSION`](show-trace.html).
`local` | Trace recording is enabled; only trace messages issued by the local node are collected.
`results` | Result rows and row counts are copied to the session trace. This must be specified to in order for the output of a query to be printed in the session trace.<br><br>Example: `SET tracing = kv, results;`

## See also

- [`RESET`](reset-vars.html)
- [`SET TRANSACTION`](set-transaction.html)
- [`SET CLUSTER SETTING`](set-cluster-setting.html)
- [`SHOW` (session variable)](show-vars.html)
- [The `TIMESTAMP` and `TIMESTAMPTZ` data types.](timestamp.html)
- [`SHOW TRACE FOR SESSION`](show-trace.html)
