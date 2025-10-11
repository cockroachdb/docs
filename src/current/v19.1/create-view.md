---
title: CREATE VIEW
summary: The CREATE VIEW statement creates a .
toc: true
---

The `CREATE VIEW` statement creates a new [view](views.html), which is a stored query represented as a virtual table.

{% include {{{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Required privileges

The user must have the `CREATE` [privilege](authorization.html#assign-privileges) on the parent database and the `SELECT` privilege on any table(s) referenced by the view.

## Synopsis

<section> {% include {{ page.version.version }}/sql/diagrams/create_view.html %} </section>

## Parameters

Parameter | Description
----------|------------
`view_name` | The name of the view to create, which must be unique within its database and follow these [identifier rules](keywords-and-identifiers.html#identifiers). When the parent database is not set as the default, the name must be formatted as `database.name`.
`name_list` | An optional, comma-separated list of column names for the view. If specified, these names will be used in the response instead of the columns specified in `AS select_stmt`.
`AS select_stmt` | The [selection query](selection-queries.html) to execute when the view is requested.<br><br>Note that it is not currently possible to use `*` to select all columns from a referenced table or view; instead, you must specify specific columns.

## Example

{{site.data.alerts.callout_success}}This example highlights one key benefit to using views: simplifying complex queries. For additional benefits and examples, see <a href="views.html">Views</a>.{{site.data.alerts.end}}

Let's say you're using our [sample `startrek` database](generate-cockroachdb-resources.html#generate-example-data), which contains two tables, `episodes` and `quotes`. There's a foreign key constraint between the `episodes.id` column and the `quotes.episode` column. To count the number of famous quotes per season, you could run the following join:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT startrek.episodes.season, count(*)
  FROM startrek.quotes
  JOIN startrek.episodes
  ON startrek.quotes.episode = startrek.episodes.id
  GROUP BY startrek.episodes.season;
~~~

~~~
+--------+----------+
| season | count(*) |
+--------+----------+
|      2 |       76 |
|      3 |       46 |
|      1 |       78 |
+--------+----------+
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

~~~
CREATE VIEW
~~~

The view is then represented as a virtual table alongside other tables in the database:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW TABLES FROM startrek;
~~~

~~~
+-------------------+
| table_name        |
+-------------------+
| episodes          |
| quotes            |
| quotes_per_season |
+-------------------+
(4 rows)
~~~

Executing the query is as easy as `SELECT`ing from the view, as you would from a standard table:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM startrek.quotes_per_season;
~~~

~~~
+--------+--------+
| season | quotes |
+--------+--------+
|      2 |     76 |
|      3 |     46 |
|      1 |     78 |
+--------+--------+
(3 rows)
~~~

## See also

- [Selection Queries](selection-queries.html)
- [Views](views.html)
- [`SHOW CREATE`](show-create.html)
- [`ALTER VIEW`](alter-view.html)
- [`DROP VIEW`](drop-view.html)
- [Online Schema Changes](online-schema-changes.html)
