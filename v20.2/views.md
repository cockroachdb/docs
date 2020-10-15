---
title: Views
summary:
toc: true
---

A view is a stored [selection query](selection-queries.html) and provides a shorthand name for it. CockroachDB's views are **dematerialized**: they do not store the results of the underlying queries. Instead, the underlying query is executed anew every time the view is used.

{{site.data.alerts.callout_info}}
<span class="version-tag">New in v20.2:</span> By default, views created in a database cannot reference objects in a different database. To enable cross-database references for views, set the `sql.cross_db_views.enabled` [cluster setting](cluster-settings.html) to `true`.
{{site.data.alerts.end}}

## Why use views?

There are various reasons to use views, including:

- [Hide query complexity](#hide-query-complexity)
- [Limit access to underlying data](#limit-access-to-underlying-data)

### Hide query complexity

When you have a complex query that, for example, joins several tables, or performs complex calculations, you can store the query as a view and then select from the view as you would from a standard table.

#### Example

Let's say you're using our [sample `startrek` database](cockroach-gen.html#generate-example-data), which contains two tables, `episodes` and `quotes`. There's a foreign key constraint between the `episodes.id` column and the `quotes.episode` column. To count the number of famous quotes per season, you could run the following join:

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
  GROUP BY startrek.episodes.season
  ORDER BY startrek.episodes.season;
~~~

~~~
CREATE VIEW
~~~

Then, executing the query is as easy as `SELECT`ing from the view:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM startrek.quotes_per_season;
~~~

~~~
  season | quotes
---------+---------
       1 |     78
       2 |     76
       3 |     46
(3 rows)
~~~

### Limit access to underlying data

When you do not want to grant a user access to all the data in one or more standard tables, you can create a view that contains only the columns and/or rows that the user should have access to and then grant the user permissions on the view.

#### Example

Let's say you have a `bank` database containing an `accounts` table:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM bank.accounts;
~~~

~~~
  id |   type   | balance |      email
-----+----------+---------+------------------
   1 | checking |    1000 | max@roach.com
   2 | savings  |   10000 | max@roach.com
   3 | checking |   15000 | betsy@roach.com
   4 | checking |    5000 | lilly@roach.com
   5 | savings  |   50000 | ben@roach.com
(5 rows)
~~~

You want a particular user, `bob`, to be able to see the types of accounts each user has without seeing the balance in each account, so you create a view to expose just the `type` and `email` columns:

{% include copy-clipboard.html %}
~~~ sql
> CREATE VIEW bank.user_accounts
  AS SELECT type, email
  FROM bank.accounts;
~~~

~~~
CREATE VIEW
~~~

You then make sure `bob` does not have privileges on the underlying `bank.accounts` table:

{% include copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON bank.accounts;
~~~

~~~
  database_name | schema_name | table_name | grantee | privilege_type
----------------+-------------+------------+---------+-----------------
  bank          | public      | accounts   | admin   | ALL
  bank          | public      | accounts   | root    | ALL
(2 rows)
~~~

Finally, you grant `bob` privileges on the `bank.user_accounts` view:

{% include copy-clipboard.html %}
~~~ sql
> GRANT SELECT ON bank.user_accounts TO bob;
~~~

Now, `bob` will get a permissions error when trying to access the underlying `bank.accounts` table but will be allowed to query the `bank.user_accounts` view:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM bank.accounts;
~~~

~~~
pq: user bob does not have SELECT privilege on table accounts
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM bank.user_accounts;
~~~

~~~
    type   |      email
-----------+------------------
  checking | max@roach.com
  savings  | max@roach.com
  checking | betsy@roach.com
  checking | lilly@roach.com
  savings  | ben@roach.com
(5 rows)
~~~

## How views work

### Creating views

To create a view, use the [`CREATE VIEW`](create-view.html) statement:

{% include copy-clipboard.html %}
~~~ sql
> CREATE VIEW startrek.quotes_per_season (season, quotes)
  AS SELECT startrek.episodes.season, count(*)
  FROM startrek.quotes
  JOIN startrek.episodes
  ON startrek.quotes.episode = startrek.episodes.id
  GROUP BY startrek.episodes.season
  ORDER BY startrek.episodes.season;
~~~

~~~
CREATE VIEW
~~~

{{site.data.alerts.callout_info}}
Any [selection query](selection-queries.html) is valid as operand to `CREATE VIEW`, not just [simple `SELECT` clauses](select-clause.html).
{{site.data.alerts.end}}

### Listing views

Once created, views are listed alongside regular tables in the database:

{% include copy-clipboard.html %}
~~~ sql
> SHOW TABLES FROM startrek;
~~~

~~~
  schema_name |    table_name     | type  | estimated_row_count
--------------+-------------------+-------+----------------------
  public      | episodes          | table |                  79
  public      | quotes            | table |                 200
  public      | quotes_per_season | view  |                   0
(3 rows)
~~~

To list just views, you can query the `views` table in the [Information Schema](information-schema.html):

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM startrek.information_schema.views;
~~~

~~~
  table_catalog | table_schema |    table_name     |                                                                                                      view_definition                                                                                                      | check_option | is_updatable | is_insertable_into | is_trigger_updatable | is_trigger_deletable | is_trigger_insertable_into
----------------+--------------+-------------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+--------------+--------------+--------------------+----------------------+----------------------+-----------------------------
  startrek      | public       | quotes_per_season | SELECT startrek.episodes.season, count(*) FROM startrek.public.quotes JOIN startrek.public.episodes ON startrek.quotes.episode = startrek.episodes.id GROUP BY startrek.episodes.season ORDER BY startrek.episodes.season | NULL         | NO           | NO                 | NO                   | NO                   | NO
(1 row)
~~~

### Querying views

To query a view, target it with a [table expression](table-expressions.html#table-or-view-names), for example using a [`SELECT` clause](select-clause.html), just as you would with a stored table:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM startrek.quotes_per_season;
~~~

~~~
  season | quotes
---------+---------
       1 |     78
       2 |     76
       3 |     46
(3 rows)
~~~

`SELECT`ing a view executes the view's stored `SELECT` statement, which returns the relevant data from the underlying table(s). To inspect the `SELECT` statement executed by the view, use the [`SHOW CREATE`](show-create.html) statement:

{% include copy-clipboard.html %}
~~~ sql
> SHOW CREATE startrek.quotes_per_season;
~~~

~~~
             table_name             |                                                                                                                              create_statement
------------------------------------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  startrek.public.quotes_per_season | CREATE VIEW quotes_per_season (season, quotes) AS SELECT startrek.episodes.season, count(*) FROM startrek.public.quotes JOIN startrek.public.episodes ON startrek.quotes.episode = startrek.episodes.id GROUP BY startrek.episodes.season ORDER BY startrek.episodes.season
(1 row)
~~~

You can also inspect the `SELECT` statement executed by a view by querying the `views` table in the [Information Schema](information-schema.html):

{% include copy-clipboard.html %}
~~~ sql
> SELECT view_definition FROM startrek.information_schema.views WHERE table_name = 'quotes_per_season';
~~~

~~~
                              view_definition
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  SELECT startrek.episodes.season, count(*) FROM startrek.public.quotes JOIN startrek.public.episodes ON startrek.quotes.episode = startrek.episodes.id GROUP BY startrek.episodes.season ORDER BY startrek.episodes.season
(1 row)
~~~

### View dependencies

A view depends on the objects targeted by its underlying query. Attempting to [rename an object](rename-table.html) referenced in a view's stored query therefore results in an error:

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE startrek.quotes RENAME TO startrek.sayings;
~~~

~~~
ERROR: cannot rename relation "startrek.public.quotes" because view "quotes_per_season" depends on it
SQLSTATE: 2BP01
HINT: you can drop quotes_per_season instead.
~~~

Likewise, attempting to [drop an object](drop-table.html) referenced in a view's stored query results in an error:

{% include copy-clipboard.html %}
~~~ sql
> DROP TABLE startrek.quotes;
~~~

~~~
ERROR: cannot drop relation "quotes" because view "quotes_per_season" depends on it
SQLSTATE: 2BP01
HINT: you can drop quotes_per_season instead.
~~~

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE startrek.episodes DROP COLUMN season;
~~~

~~~
ERROR: cannot drop column "season" because view "quotes_per_season" depends on it
SQLSTATE: 2BP01
HINT: you can drop quotes_per_season instead.
~~~

<span class="version-tag">New in v20.2:</span> You can [drop](drop-column.html) or [rename columns](rename-column.html) from a table on which a view is dependent, as long as the view does not depend on that column of the table. For example, because there is no view that depends on the `num` column of the `episodes` table, you can rename it to `number`:

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE startrek.episodes RENAME COLUMN num TO number;
~~~

Similarly, because no view depends on the `title` column of the `episodes` table, you can drop it. Note that to drop a column with data in it, you must first set `sql_safe_updates = false`.

{% include copy-clipboard.html %}
~~~ sql
> SET sql_safe_updates = false;
~~~

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE startrek.episodes DROP COLUMN title;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM startrek.episodes;
~~~

~~~
  column_name | data_type | is_nullable | column_default | generation_expression |  indices  | is_hidden
--------------+-----------+-------------+----------------+-----------------------+-----------+------------
  id          | INT8      |    false    | NULL           |                       | {primary} |   false
  season      | INT8      |    true     | NULL           |                       | {}        |   false
  number      | INT8      |    true     | NULL           |                       | {}        |   false
  stardate    | DECIMAL   |    true     | NULL           |                       | {}        |   false
(4 rows)
~~~

When [dropping a table](drop-table.html) or [dropping a view](drop-view.html), you can use the `CASCADE` keyword to drop all dependent objects as well:

{% include copy-clipboard.html %}
~~~ sql
> DROP TABLE startrek.quotes CASCADE;
~~~

~~~
DROP TABLE
~~~

{{site.data.alerts.callout_danger}}
`CASCADE` drops **all** dependent objects without listing them, which can lead to inadvertent and difficult-to-recover losses. To avoid potential harm, we recommend dropping objects individually in most cases.
{{site.data.alerts.end}}

### Renaming views

To rename a view, use the [`ALTER VIEW`](alter-view.html) statement:

{% include copy-clipboard.html %}
~~~ sql
> ALTER VIEW startrek.quotes_per_season RENAME TO startrek.quotes_count;
~~~

~~~
RENAME VIEW
~~~

It is not possible to change the stored query executed by the view. Instead, you must drop the existing view and create a new view.

### Replacing views

<span class="version-tag">New in v20.2:</span> To replace a view, use [`CREATE OR REPLACE VIEW`](create-view.html):

{% include copy-clipboard.html %}
~~~ sql
> CREATE OR REPLACE VIEW startrek.quotes_count (season, quotes, stardate)
  AS SELECT startrek.episodes.season, count(*), startrek.episodes.stardate
  FROM startrek.quotes
  JOIN startrek.episodes
  ON startrek.quotes.episode = startrek.episodes.id
  GROUP BY startrek.episodes.season, startrek.episodes.stardate;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM startrek.quotes_count LIMIT 10;
~~~

~~~
  season | quotes | stardate
---------+--------+-----------
       2 |      1 |   3715.3
       2 |      2 |   4523.3
       3 |      1 |   4385.3
       3 |      1 |   5423.4
       1 |      1 |   1672.1
       1 |      2 |   2817.6
       1 |      3 |   2124.5
       1 |      1 |   3045.6
       2 |      2 |   3018.2
       2 |      1 |   3619.2
(10 rows)
~~~

### Removing views

To remove a view, use the [`DROP VIEW`](drop-view.html) statement:

{% include copy-clipboard.html %}
~~~ sql
> DROP VIEW startrek.quotes_count;
~~~

~~~
DROP VIEW
~~~

## Temporary views

 CockroachDB supports session-scoped temporary views. Unlike persistent views, temporary views can only be accessed from the session in which they were created, and they are dropped at the end of the session. You can create temporary views on both persistent tables and [temporary tables](temporary-tables.html).

{{site.data.alerts.callout_danger}}
**This is an experimental feature**. The interface and output are subject to change. For details, see the tracking issue [cockroachdb/cockroach#46260](https://github.com/cockroachdb/cockroach/issues/46260).
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
Temporary tables must be enabled in order to use temporary views. By default, temporary tables are disabled in CockroachDB. To enable temporary tables, set the `experimental_enable_temp_tables` [session variable](set-vars.html) to `on`.
{{site.data.alerts.end}}

### Details

- Temporary views are automatically dropped at the end of the session.
- A temporary view can only be accessed from the session in which it was created.
- Temporary views persist across transactions in the same session.
- Temporary views cannot be converted to persistent views.
- Temporary views can be created on both persistent tables and [temporary tables](temporary-tables.html).
- When you create a view on a temporary table, the view automatically becomes temporary.

{{site.data.alerts.callout_info}}
Like [temporary tables](temporary-tables.html), temporary views are not in the `public` schema. Instead, when you create the first temporary table, view, or sequence for a session, CockroachDB generates a single temporary schema (`pg_temp_<id>`) for all of the temporary objects in the current session for a database.
{{site.data.alerts.end}}

### Usage

To create a temporary view, add [`TEMP`/`TEMPORARY`](sql-grammar.html#opt_temp) to a [`CREATE VIEW`](create-view.html) statement.

For example:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TEMP VIEW temp_view (season, quotes)
  AS SELECT startrek.episodes.season, count(*)
  FROM startrek.quotes
  JOIN startrek.episodes
  ON startrek.quotes.episode = startrek.episodes.id
  GROUP BY startrek.episodes.season;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM temp_view;
~~~

~~~
  season | quotes
---------+---------
       1 |     78
       2 |     76
       3 |     46
(3 rows)
~~~

## See also

- [Selection Queries](selection-queries.html)
- [Simple `SELECT` Clauses](select-clause.html)
- [`CREATE VIEW`](create-view.html)
- [`SHOW CREATE`](show-create.html)
- [`GRANT`](grant.html)
- [`ALTER VIEW`](alter-view.html)
- [`DROP VIEW`](drop-view.html)
