---
title: SET &#123;session variable&#125;
summary: The SET statement modifies the current configuration variables for the client session.
toc: true
docs_area: reference.sql
---

The `SET` [statement](sql-statements.html) can modify one of the session configuration variables. These can also be queried via [`SHOW`](show-vars.html). By default, session variable values are set for the duration of the current session.

 CockroachDB supports setting session variables for the duration of a single transaction, using [the `LOCAL` keyword](#set-local).

{{site.data.alerts.callout_info}}
The `SET` statement for session variables is unrelated to the other [`SET TRANSACTION`](set-transaction.html) and [`SET CLUSTER SETTING`](cluster-settings.html#change-a-cluster-setting) statements.
{{site.data.alerts.end}}

{{site.data.alerts.callout_danger}}
In some cases, client drivers can drop and restart the connection to the server. When this happens, any session configurations made with `SET` statements are lost. It is therefore more reliable to configure the session in the client's connection string. For examples in different languages, see the [Build an App with CockroachDB](example-apps.html) tutorials.
{{site.data.alerts.end}}

## Required privileges

To set the `role` session variable, the current user must be a member of the `admin` role, or a member of the target role.

All other session variables do not require [privileges](security-reference/authorization.html#managing-privileges) to modify.

## Synopsis

The `SET` statement can set a session variable for the duration of the current session ([`SET {variable}`/`SET SESSION {variable}`](#set-session)), or for the duration of a single transaction ([`SET LOCAL {variable}`](#set-local)).

### SET SESSION

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-22.1/grammar_svg/set_session.html %}
</div>

{{site.data.alerts.callout_info}}
By default, session variables are set for the duration of the current session. As a result, [`SET {variable}` and `SET SESSION {variable}`](#set-session) are equivalent.
{{site.data.alerts.end}}

### SET LOCAL

<div>
  {% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-22.1/grammar_svg/set_local.html %}
</div>

{{site.data.alerts.callout_info}}
`SET LOCAL` is compatible with [savepoints](savepoint.html). Executing a [`ROLLBACK`](rollback-transaction.html), `ROLLBACK TO SAVEPOINT`, or `RELEASE TO SAVEPOINT` statement rolls back any variables set by `SET LOCAL`.
{{site.data.alerts.end}}

## Parameters

Parameter   | Description
------------|------------
`var_name`  | The name of [the session variable](#supported-variables) to set. The variable name is case-insensitive.
`var_value` | The value, or list of values, to assign to the session variable.

### Supported variables

{% include {{ page.version.version }}/misc/session-vars.md %}

### Special syntax cases

CockroachDB supports the following syntax cases, for compatibility with common SQL syntax patterns:

 Syntax | Equivalent to | Notes
--------|---------------|-------
 `USE ...` | `SET database = ...` | This is provided as convenience for users with a MySQL/MSSQL background.
 `SET NAMES ...` | `SET client_encoding = ...` | This is provided for compatibility with PostgreSQL clients.
 `SET ROLE <role>` | `SET role = <role>` |  This is provided for compatibility with PostgreSQL clients.
 `RESET ROLE` | `SET role = 'none'`/`SET role = current_user()` |  This is provided for compatibility with PostgreSQL clients.
 `SET SCHEMA <name>` | `SET search_path = <name>` | This is provided for better compatibility with PostgreSQL.
 `SET SESSION CHARACTERISTICS AS TRANSACTION ISOLATION LEVEL ...` | `SET default_transaction_isolation = ...` | This is provided for compatibility with standard SQL.
 `SET TIME ZONE ...` | `SET timezone = ...` | This is provided for compatibility with PostgreSQL clients.

## Examples

### Set simple variables

The following examples demonstrate how to use `SET` to configure the default database for the current session:

{% include_cached copy-clipboard.html %}
~~~ sql
SET application_name = movr_app;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW application_name;
~~~

~~~
  application_name
--------------------
  movr_app
(1 row)
~~~

### Set variables to values containing spaces

The following demonstrates how to use quoting to use values containing spaces:

{% include_cached copy-clipboard.html %}
~~~ sql
SET application_name = "movr app";
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW application_name;
~~~

~~~
  application_name
--------------------
  movr app
(1 row)
~~~

### Set variables to a list of values

The following demonstrates how to assign a list of values:

{% include_cached copy-clipboard.html %}
~~~ sql
SET search_path = pg_catalog,public;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW search_path;
~~~

~~~
     search_path
----------------------
  pg_catalog, public
(1 row)
~~~

### Reset a variable to its default value

{{site.data.alerts.callout_success}}
You can use [`RESET`](reset-vars.html) to reset a session variable as well.
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW search_path;
~~~

~~~
     search_path
----------------------
  pg_catalog, public
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SET search_path = DEFAULT;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW search_path;
~~~

~~~
    search_path
-------------------
  "$user", public
(1 row)
~~~

### Set a variable for the duration of a single transaction

 To set a variable for the duration of a single transaction, use the `SET LOCAL` statement.

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW application_name;
~~~

~~~
  application_name
--------------------
  movr app
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
BEGIN;
SET LOCAL application_name = demo;
SHOW application_name;
~~~

~~~
  application_name
--------------------
  demo
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
COMMIT;
SHOW application_name;
~~~

~~~
  application_name
--------------------
  movr app
(1 row)
~~~

### Roll back session variables set for a transaction

 You can roll back session variable settings to [savepoints](savepoint.html).

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW timezone;
~~~

~~~
  timezone
------------
  UTC
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
BEGIN;
SET timezone = '+3';
SAVEPOINT s1;
SHOW timezone;
~~~

~~~
  timezone
------------
  +3
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SET LOCAL timezone = '+1';
SHOW timezone;
~~~

~~~
  timezone
------------
  +1
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
ROLLBACK TO SAVEPOINT s1;
SHOW timezone;
~~~

~~~
  timezone
------------
  +3
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
COMMIT;
SHOW timezone;
~~~

~~~
  timezone
------------
  +3
(1 row)
~~~

### Assume another role

 To assume another [role](security-reference/authorization.html#roles) for the duration of a session, use `SET ROLE <role>`. `SET ROLE <role>` is equivalent to `SET role = <role>`.

{{site.data.alerts.callout_info}}
To assume a new role, the current user must be a member of the `admin` role, or a member of the target role.
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW role;
~~~

~~~
  role
--------
  root
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE ROLE new_role;
SHOW ROLES;
~~~

~~~
  username | options | member_of
-----------+---------+------------
  admin    |         | {}
  new_role | NOLOGIN | {}
  root     |         | {admin}
(3 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SET ROLE new_role;
SHOW role;
~~~

~~~
    role
------------
  new_role
(1 row)
~~~

To reset the role of the current user, use a [`RESET`](reset-vars.html) statement. `RESET ROLE` is equivalent to `SET role = 'none'` and `SET role = current_user()`.

{% include_cached copy-clipboard.html %}
~~~ sql
RESET ROLE;
SHOW role;
~~~

~~~
  role
--------
  root
(1 row)
~~~

To assume a role for the duration of a single transaction, use `SET LOCAL ROLE`.

{% include_cached copy-clipboard.html %}
~~~ sql
BEGIN;
SET LOCAL ROLE new_role;
SHOW role;
~~~

~~~
    role
------------
  new_role
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
COMMIT;
SHOW role;
~~~

~~~
  role
--------
  root
(1 row)
~~~

## `SET TIME ZONE`

{{site.data.alerts.callout_danger}}
As a best practice, we recommend not using this setting and avoid setting a session time for your database. We instead recommend converting UTC values to the appropriate time zone on the client side.
{{site.data.alerts.end}}

You can control the default time zone for a session with `SET TIME ZONE`. This will apply an offset to all [`TIMESTAMPTZ`/`TIMESTAMP WITH TIME ZONE`](timestamp.html) and [`TIMETZ`/`TIME WITH TIME ZONE`](time.html) values in the session. By default, CockroachDB uses UTC as the time zone for `SET TIME ZONE` offsets.

### Parameters

The input passed to `SET TIME ZONE` indicates the time zone for the current session. This value can be a string representation of a local system-defined time zone (e.g., `'EST'`, `'America/New_York'`) or a positive or negative numeric offset from UTC (e.g., `-7`, `+7`, or `UTC-7`, `UTC+7`) or GMT (e.g., `GMT-7`, `GMT+7`). The numeric offset input can also be colon-delimited (e.g., `-7:00`, `GMT+7:00`).

When setting a time zone, note the following:

- Timezone abbreviations are case-insensitive.

- Timezone abbreviations must be part of the [tz database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones), as recognized by the [`tzdata` Golang package](https://golang.org/pkg/time/tzdata/).

- `DEFAULT`, `LOCAL`, or `0` sets the session time zone to `UTC`.

- Only offsets specified by integers (e.g., `-7`, `7`) use the [ISO 8601 time offset](https://en.wikipedia.org/wiki/ISO_8601#Time_offsets_from_UTC) (i.e., the offset input is parsed as hours *east* of UTC). If you explicitly specify `UTC` or `GMT` for the time zone offset (e.g., `UTC-7`,`GMT+7`), or if the numeric input is colon-delimited (e.g.,  `-7:00`, `GMT+7:00`), CockroachDB uses the [POSIX time offset](https://www.postgresql.org/docs/current/datetime-posix-timezone-specs.html) instead (i.e., hours *west* of the specified time zone). This means that specifying an offset of `-7` (i.e., -7 *east* of UTC) is equivalent to specifying `GMT+7` (i.e., 7 *west* of UTC).

### Example: Set the default time zone via `SET TIME ZONE`

{% include_cached copy-clipboard.html %}
~~~ sql
> SET TIME ZONE 'EST'; -- same as SET "timezone" = 'EST'
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW TIME ZONE;
~~~

~~~
  timezone
+----------+
  EST
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SET TIME ZONE DEFAULT; -- same as SET "timezone" = DEFAULT
~~~

{% include_cached copy-clipboard.html %}
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
`results` | Result rows and row counts are copied to the session trace. This must be specified in order for the output of a query to be printed in the session trace.<br><br>Example: `SET tracing = kv, results;`

## Known Limitations

{% include {{page.version.version}}/known-limitations/set-transaction-no-rollback.md %}

## See also

- [`RESET`](reset-vars.html)
- [`SET TRANSACTION`](set-transaction.html)
- [`SET CLUSTER SETTING`](set-cluster-setting.html)
- [`SHOW {session variable}`](show-vars.html)
- [The `TIMESTAMP` and `TIMESTAMPTZ` data types.](timestamp.html)
- [`SHOW TRACE FOR SESSION`](show-trace.html)
