---
title: CREATE VIEW
summary: The CREATE VIEW statement creates a view of a table
toc: true
---

The `CREATE VIEW` statement creates a new [view](views.html), which is a stored query represented as a virtual table.

{{site.data.alerts.callout_info}}
 By default, views created in a database cannot reference objects in a different database. To enable cross-database references for views, set the `sql.cross_db_views.enabled` [cluster setting](cluster-settings.html) to `true`.
{{site.data.alerts.end}}

{% include {{{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Required privileges

The user must have the `CREATE` [privilege](authorization.html#assign-privileges) on the parent database and the `SELECT` privilege on any table(s) referenced by the view.

## Synopsis

<section> {% include {{ page.version.version }}/sql/diagrams/create_view.html %} </section>

## Parameters

Parameter | Description
----------|------------
`MATERIALIZED` |  Create a [materialized view](views.html#materialized-views).
`IF NOT EXISTS` |  Create a new view only if a view of the same name does not already exist. If one does exist, do not return an error.<br><br>Note that `IF NOT EXISTS` checks the view name only. It does not check if an existing view has the same columns as the new view.
`OR REPLACE`  |   Create a new view if a view of the same name does not already exist. If a view of the same name already exists, replace that view.<br><br>In order to replace an existing view, the new view must have the same columns as the existing view, or more. If the new view has additional columns, the old columns must be a prefix of the new columns. For example, if the existing view has columns `a, b`, the new view can have an additional column `c`, but must have columns `a, b` as a prefix. In this case, `CREATE OR REPLACE VIEW myview (a, b, c)` would be allowed, but `CREATE OR REPLACE VIEW myview (b, a, c)` would not.
`view_name` | The name of the view to create, which must be unique within its database and follow these [identifier rules](keywords-and-identifiers.html#identifiers). When the parent database is not set as the default, the name must be formatted as `database.name`.
`name_list` | An optional, comma-separated list of column names for the view. If specified, these names will be used in the response instead of the columns specified in `AS select_stmt`.
`AS select_stmt` | The [selection query](selection-queries.html) to execute when the view is requested.<br><br>Note that it is not currently possible to use `*` to select all columns from a referenced table or view; instead, you must specify specific columns.
`opt_temp` |  Defines the view as a session-scoped temporary view. For more information, see [Temporary Views](views.html#temporary-views).<br><br>**Support for temporary views is [experimental](experimental-features.html#temporary-objects)**.

## Example

{{site.data.alerts.callout_success}}
This example highlights one key benefit to using views: simplifying complex queries. For additional benefits and examples, see [Views](views.html).
{{site.data.alerts.end}}

### Setup

The following examples use the [`startrek` demo database schema](cockroach-demo.html#datasets).

To follow along, run [`cockroach demo startrek`](cockroach-demo.html) to start a temporary, in-memory cluster with the `startrek` schema and dataset preloaded:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach demo startrek
~~~

### Create a view

The sample `startrek` database contains two tables, `episodes` and `quotes`. The table also contains a foreign key constraint, between the `episodes.id` column and the `quotes.episode` column. To count the number of famous quotes per season, you could run the following join:

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
~~~ sql
> CREATE VIEW startrek.quotes_per_season (season, quotes)
  AS SELECT startrek.episodes.season, count(*)
  FROM startrek.quotes
  JOIN startrek.episodes
  ON startrek.quotes.episode = startrek.episodes.id
  GROUP BY startrek.episodes.season;
~~~

The view is then represented as a virtual table alongside other tables in the database:

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
~~~ sql
> CREATE OR REPLACE VIEW startrek.quotes_per_season (season, quotes)
  AS SELECT startrek.episodes.season, count(*)
  FROM startrek.quotes
  JOIN startrek.episodes
  ON startrek.quotes.episode = startrek.episodes.id
  GROUP BY startrek.episodes.season
  ORDER BY startrek.episodes.season;
~~~

{% include copy-clipboard.html %}
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

## See also

- [Selection Queries](selection-queries.html)
- [Views](views.html)
- [`SHOW CREATE`](show-create.html)
- [`ALTER VIEW`](alter-view.html)
- [`DROP VIEW`](drop-view.html)
- [Online Schema Changes](online-schema-changes.html)
