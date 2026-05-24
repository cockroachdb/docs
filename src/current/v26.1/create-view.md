---
title: CREATE VIEW
summary: The CREATE VIEW statement creates a view of a table
toc: true
docs_area: reference.sql
---

The `CREATE VIEW` statement creates a new [view]({% link {{ page.version.version }}/views.md %}), which is a stored query represented as a virtual table.

{{site.data.alerts.callout_info}}
 By default, views created in a database cannot reference objects in a different database. To enable cross-database references for views, set the `sql.cross_db_views.enabled` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) to `true`.
{{site.data.alerts.end}}

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Required privileges

The user must have the `CREATE` [privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#managing-privileges) on the parent database and the `SELECT` privilege on any table(s) referenced by the view.

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/create_view.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`MATERIALIZED` |  Create a [materialized view]({% link {{ page.version.version }}/views.md %}#materialized-views).
`IF NOT EXISTS` |  Create a new view only if a view of the same name does not already exist. If one does exist, do not return an error.<br><br>Note that `IF NOT EXISTS` checks the view name only. It does not check if an existing view has the same columns as the new view.
`OR REPLACE`  |   Create a new view if a view of the same name does not already exist. If a view of the same name already exists, replace that view.<br><br>In order to replace an existing view, the new view must have the same columns as the existing view, or more. If the new view has additional columns, the old columns must be a prefix of the new columns. For example, if the existing view has columns `a, b`, the new view can have an additional column `c`, but must have columns `a, b` as a prefix. In this case, `CREATE OR REPLACE VIEW myview (a, b, c)` would be allowed, but `CREATE OR REPLACE VIEW myview (b, a, c)` would not.
`view_name` | The name of the view to create, which must be unique within its database and follow these [identifier rules]({% link {{ page.version.version }}/keywords-and-identifiers.md %}#identifiers). When the parent database is not set as the default, the name must be formatted as `database.name`.
`name_list` | An optional, comma-separated list of column names for the view. If specified, these names will be used in the response instead of the columns specified in `AS select_stmt`.
`AS select_stmt` | The [selection query]({% link {{ page.version.version }}/selection-queries.md %}) to execute when the view is requested.<br><br>Note that it is not currently possible to use `*` to select all columns from a referenced table or view; instead, you must specify specific columns.
`AS OF SYSTEM TIME` | When used with `CREATE MATERIALIZED VIEW`, populates the materialized view using historical data. This can reduce [contention]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#transaction-contention) by leveraging [follower reads]({% link {{ page.version.version }}/follower-reads.md %}). The timestamp must be within the [garbage collection window]({% link {{ page.version.version }}/configure-replication-zones.md %}#gc-ttlseconds). For more information, see [`AS OF SYSTEM TIME`]({% link {{ page.version.version }}/as-of-system-time.md %}).
`opt_temp` |  Defines the view as a session-scoped temporary view. For more information, see [Temporary Views]({% link {{ page.version.version }}/views.md %}#temporary-views).<br><br>**Support for temporary views is [in preview]({% link {{ page.version.version }}/cockroachdb-feature-availability.md %}#temporary-objects)**.

## Example

{{site.data.alerts.callout_success}}
This example highlights one key benefit to using views: simplifying complex queries. For additional benefits and examples, see [Views]({% link {{ page.version.version }}/views.md %}).
{{site.data.alerts.end}}

### Setup

The following examples use the [`startrek` demo database schema]({% link {{ page.version.version }}/cockroach-demo.md %}#datasets).

To follow along, run [`cockroach demo startrek`]({% link {{ page.version.version }}/cockroach-demo.md %}) to start a temporary, in-memory cluster with the `startrek` schema and dataset preloaded:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach demo startrek
~~~

### Create a view

The sample `startrek` database contains two tables, `episodes` and `quotes`. The table also contains a foreign key constraint, between the `episodes.id` column and the `quotes.episode` column. To count the number of famous quotes per season, you could run the following join:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT startrek.episodes.season, count(*)
  FROM startrek.quotes
  JOIN startrek.episodes
  ON startrek.quotes.episode = startrek.episodes.id
  GROUP BY startrek.episodes.season;
~~~

~~~
  season | count
---------+--------
       1 |    78
       2 |    76
       3 |    46
(3 rows)
~~~

Alternatively, to make it much easier to run this complex query, you could create a view:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE VIEW startrek.quotes_per_season (season, quotes)
  AS SELECT startrek.episodes.season, count(*)
  FROM startrek.quotes
  JOIN startrek.episodes
  ON startrek.quotes.episode = startrek.episodes.id
  GROUP BY startrek.episodes.season;
~~~

The view is then represented as a virtual table alongside other tables in the database:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW TABLES FROM startrek;
~~~

~~~
  schema_name |    table_name     | type  | estimated_row_count
--------------+-------------------+-------+----------------------
  public      | episodes          | table |                  79
  public      | quotes            | table |                 200
  public      | quotes_per_season | view  |                   3
(3 rows)
~~~

Executing the query is as easy as `SELECT`ing from the view, as you would from a standard table:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM startrek.quotes_per_season;
~~~

~~~
  season | quotes
---------+---------
       3 |     46
       1 |     78
       2 |     76
(3 rows)
~~~

### Replace an existing view

 You can create a new view, or replace an existing view, with `CREATE OR REPLACE VIEW`:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE OR REPLACE VIEW startrek.quotes_per_season (season, quotes)
  AS SELECT startrek.episodes.season, count(*)
  FROM startrek.quotes
  JOIN startrek.episodes
  ON startrek.quotes.episode = startrek.episodes.id
  GROUP BY startrek.episodes.season
  ORDER BY startrek.episodes.season;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM startrek.quotes_per_season;
~~~

~~~
  season | quotes
---------+---------
       3 |     46
       1 |     78
       2 |     76
(3 rows)
~~~

### Create a view that references routines

Views can call both scalar and set-returning [user-defined functions (UDFs)]({% link {{ page.version.version }}/user-defined-functions.md %}) in their `SELECT` statements.

The following example builds a view over a table and two UDFs.

Create and populate a table:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE xy (x INT, y INT);
INSERT INTO xy VALUES (1, 2), (3, 4), (5, 6);
~~~

Define a scalar and a set-returning UDF:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE FUNCTION f_scalar() RETURNS INT LANGUAGE SQL AS $$
    SELECT count(*) FROM xy;
  $$;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE FUNCTION f_setof() RETURNS SETOF xy LANGUAGE SQL AS $$
    SELECT * FROM xy;
  $$;
~~~

Create a view that references both functions:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE VIEW v_xy AS
SELECT x, y, f_scalar() AS total_rows
FROM f_setof();
~~~

Query the view:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM v_xy ORDER BY x;
~~~

~~~
  x | y | total_rows
----+---+-------------
  1 | 2 |          3
  3 | 4 |          3
  5 | 6 |          3
(3 rows)
~~~

Because the view depends on `f_scalar` and `f_setof`, attempting to rename either function returns an error:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER FUNCTION f_scalar RENAME TO f_scalar_renamed;
~~~

~~~
ERROR: cannot rename function "f_scalar" because other functions or views ([movr.public.v_xy]) still depend on it
SQLSTATE: 0A000
~~~

### Create a materialized view with historical data using `AS OF SYSTEM TIME`

You can create a materialized view using historical data with the [`AS OF SYSTEM TIME`]({% link {{ page.version.version }}/as-of-system-time.md %}) clause. This is useful for reducing [contention]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#transaction-contention) by performing a [follower read]({% link {{ page.version.version }}/follower-reads.md %}) when populating the view.

{{site.data.alerts.callout_info}}
Historical data is available only within the [garbage collection window]({% link {{ page.version.version }}/configure-replication-zones.md %}#gc-ttlseconds).
{{site.data.alerts.end}}

The following example creates a materialized view using the most recent data that is available for [follower reads]({% link {{ page.version.version }}/follower-reads.md %}):

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE MATERIALIZED VIEW overdrawn_accounts
  AS SELECT id, balance
  FROM bank
  WHERE balance < 0
  AS OF SYSTEM TIME follower_read_timestamp();
~~~

You can also specify an explicit timestamp:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE MATERIALIZED VIEW overdrawn_accounts
  AS SELECT id, balance
  FROM bank
  WHERE balance < 0
  AS OF SYSTEM TIME '-10s';
~~~

## See also

- [Selection Queries]({% link {{ page.version.version }}/selection-queries.md %})
- [Views]({% link {{ page.version.version }}/views.md %})
- [`SHOW CREATE`]({% link {{ page.version.version }}/show-create.md %})
- [`ALTER VIEW`]({% link {{ page.version.version }}/alter-view.md %})
- [`DROP VIEW`]({% link {{ page.version.version }}/drop-view.md %})
- [Online Schema Changes]({% link {{ page.version.version }}/online-schema-changes.md %})
- [`AS OF SYSTEM TIME`]({% link {{ page.version.version }}/as-of-system-time.md %})
- [Follower Reads]({% link {{ page.version.version }}/follower-reads.md %})

<!-- REF DOC DRAFT: The following content was auto-generated. Please integrate into the sections above and remove this comment block. -->

## CREATE VIEW (Updated)

The `CREATE VIEW` statement has been enhanced to support the `security_invoker` option.

### Updated Synopsis

```sql
CREATE [TEMPORARY | TEMP] VIEW [IF NOT EXISTS] view_name [( column_list )] [WITH ( option [= value] [, ....] )] AS select_stmt
```

### New Parameters

| Parameter | Description | Required |
| --- | --- | --- |
| `security_invoker` | controls whether the view runs with the permissions of the view owner (false) or the current user (true). Accepts `true`, `false`, `1`, or `0`. Defaults to `true` when specified without a value | No |

{{site.data.alerts.callout_info}}
The `security_invoker` option requires the `enable_view_security_invoker` feature flag to be enabled via the `allow_view_with_security_invoker_clause` session setting.
{{site.data.alerts.end}}

### Examples

{% include_cached copy-clipboard.html %}
~~~ sql
-- Enable the feature flag
SET allow_view_with_security_invoker_clause = on;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
-- Create a view with security invoker enabled (default value)
CREATE VIEW security_view WITH ( security_invoker ) AS SELECT * FROM sensitive_table;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
-- Create a view with security invoker explicitly set to true
CREATE VIEW user_permissions_view WITH ( security_invoker = true ) AS SELECT * FROM users;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
-- Create a view with security invoker disabled (runs with view owner permissions)
CREATE VIEW admin_view WITH ( security_invoker = false ) AS SELECT * FROM admin_data;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
-- Using integer values (1 = true, 0 = false)
CREATE VIEW numeric_view WITH ( security_invoker = 1 ) AS SELECT count(*) FROM transactions;
~~~

---

## ALTER VIEW SET OPTIONS [NEEDS REVIEW]

{{site.data.alerts.callout_danger}}
**Note**: This feature is currently unimplemented. The grammar support has been added but attempting to use this syntax will result in an "unimplemented" error.
{{site.data.alerts.end}}

### Synopsis

```sql
ALTER VIEW [IF EXISTS] view_name SET ( security_invoker = { true | false | 1 | 0 } )
```

### Description

The `ALTER VIEW SET OPTIONS` statement would modify view options after creation, specifically the `security_invoker` setting that controls view permission behavior.

### Parameters

| Parameter | Description | Required |
| --- | --- | --- |
| `view_name` | the name of the view to modify | Yes |
| `security_invoker` | controls whether the view runs with the permissions of the view owner (false) or the current user (true). Accepts `true`, `false`, `1`, or `0` | Yes |

### Current Status

{% include_cached copy-clipboard.html %}
~~~ sql
-- This will return an unimplemented error
ALTER VIEW my_view SET ( security_invoker = false );
~~~

```
ERROR: at or near ")": syntax error: unimplemented: this syntax
HINT: You have attempted to use a feature that is not yet implemented.
```

### See Also

- [`CREATE VIEW`]({% link {{ page.version.version }}/create-view.md %})
- [`DROP VIEW`]({% link {{ page.version.version }}/drop-view.md %})
- [`SHOW CREATE`]({% link {{ page.version.version }}/show-create.md %})

---

## Related Feature Flag

The security invoker functionality is controlled by the `allow_view_with_security_invoker_clause` session setting:

{% include_cached copy-clipboard.html %}
~~~ sql
-- Enable security invoker support
SET allow_view_with_security_invoker_clause = on;

-- Verify the setting
SHOW allow_view_with_security_invoker_clause;
~~~

When this setting is disabled (default), attempting to create views with the `security_invoker` option will result in:

```
ERROR: security invoker views are not supported
```

[HUMAN REVIEW: The security invoker feature appears to be related to PostgreSQL-style security definer/invoker views, but the specific behavior and security implications should be verified against the intended implementation.]

<!-- END REF DOC DRAFT -->
