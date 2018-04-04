---
title: Views
summary:
toc: false
---

A view is a stored [selection query](selection-queries.html) and provides a shorthand name for it. CockroachDB's views are **dematerialized**: they do not store the results of the underlying queries. Instead, the underlying query is executed anew every time the view is used.

<div id="toc"></div>

## Why Use Views?

There are various reasons to use views, including:

- [Hide query complexity](#hide-query-complexity)
- [Limit access to underlying data](#limit-access-to-underlying-data)
- [Simplify supporting legacy code](#simplify-supporting-legacy-code)

### Hide query complexity

When you have a complex query that, for example, joins several tables, or performs complex calculations, you can store the query as a view and then select from the view as you would from a standard table.

#### Example

Let's say you're using our [sample `startrek` database](generate-cockroachdb-resources.html#generate-example-data), which contains two tables, `episodes` and `quotes`. There's a foreign key constraint between the `episodes.id` column and the `quotes.episode` column. To count the number of famous quotes per season, you could run the following `JOIN`:

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

Then, executing the query is as easy as `SELECT`ing from the view:

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

### Limit access to underlying data

When you do not want to grant a user access to all the data in one or more standard tables, you can create a view that contains only the columns and/or rows that the user should have access to and then grant the user permissions on the view.

#### Example

Let's say you have a `bank` database containing an `accounts` table:

~~~ sql
> SELECT * FROM bank.accounts;
~~~

~~~
+----+----------+---------+-----------------+
| id |   type   | balance |      email      |
+----+----------+---------+-----------------+
|  1 | checking |    1000 | max@roach.com   |
|  2 | savings  |   10000 | max@roach.com   |
|  3 | checking |   15000 | betsy@roach.com |
|  4 | checking |    5000 | lilly@roach.com |
|  5 | savings  |   50000 | ben@roach.com   |
+----+----------+---------+-----------------+
(5 rows)
~~~

You want a particular user, `bob`, to be able to see the types of accounts each user has without seeing the balance in each account, so you create a view to expose just the `type` and `email` columns:

~~~ sql
> CREATE VIEW bank.user_accounts
  AS SELECT type, email
  FROM bank.accounts;
~~~

~~~
CREATE VIEW
~~~

You then make sure `bob` does not have privileges on the underlying `bank.accounts` table:

~~~ sql
> SHOW GRANTS ON bank.accounts;
~~~

~~~
+----------+------+------------+
|  Table   | User | Privileges |
+----------+------+------------+
| accounts | root | ALL        |
| accounts | toti | SELECT     |
+----------+------+------------+
(2 rows)
~~~

Finally, you grant `bob` privileges on the `bank.user_accounts` view:

~~~ sql
> GRANT SELECT ON bank.user_accounts TO bob;
~~~

Now, `bob` will get a permissions error when trying to access the underlying `bank.accounts` table but will be allowed to query the `bank.user_accounts` view:

~~~ sql
> SELECT * FROM bank.accounts;
~~~

~~~
pq: user bob does not have SELECT privilege on table accounts
~~~

~~~ sql
> SELECT * FROM bank.user_accounts;
~~~

~~~
+----------+-----------------+
|   type   |      email      |
+----------+-----------------+
| checking | max@roach.com   |
| savings  | max@roach.com   |
| checking | betsy@roach.com |
| checking | lilly@roach.com |
| savings  | ben@roach.com   |
+----------+-----------------+
(5 rows)
~~~

### Simplify supporting legacy code

When you need to alter a table in a way that will break your application, and you can't update your code right away, you can create a view with a name and schema identical to the original table. Once the new view is created, your application can continue uninterrupted, and you can update the legacy code at your leisure.

#### Example

Let's say you have a table called `user_accounts` that you want to rename to `client_accounts`, but your application has many queries to `user_accounts`.

You can accomplish the change with a 2-step process:

1. [Rename the underlying table](rename-table.html) to `client_accounts`
2. [Create a view](create-view.html) with the old table name, `user_accounts`

For example:

~~~ sql
ALTER TABLE bank.user_accounts RENAME TO bank.client_accounts;
CREATE VIEW bank.user_accounts
  AS SELECT type, email
  FROM bank.client_accounts;
~~~

Note that there will be a brief window of time after the table rename and before the view creation when there will be no relation (table or view) called `user_accounts`. During this window, if your application tries to access `user_accounts`, it will need to handle any error that occurs. In most ORMs, this will cause an exception to be thrown, followed by a retry. Once the view is created, the retry should succeed, and further accesses of `user_accounts` will work as expected.

{{site.data.alerts.callout_info}}
Unfortunately the 2-step operation described above can't be wrapped in a [transaction](transactions.html) due to a [known limitation](known-limitations.html#schema-changes-within-transactions) that a table cannot be renamed inside a transaction.
{{site.data.alerts.end}}

## How Views Work

### Creating Views

To create a view, use the [`CREATE VIEW`](create-view.html) statement:

~~~ sql
> CREATE VIEW bank.user_accounts
  AS SELECT type, email
  FROM bank.accounts;
~~~

~~~
CREATE VIEW
~~~

{{site.data.alerts.callout_info}}Any <a href="selection-queries.html">selection query</a> is valid as operand to <code>CREATE VIEW</code>, not just <a href="select-clause.html">simple <code>SELECT</code> clauses</a>.{{site.data.alerts.end}}

### Listing Views

Once created, views are listed alongside regular tables in the database:

~~~ sql
> SHOW TABLES FROM bank;
~~~

~~~
+---------------+
|     Table     |
+---------------+
| accounts      |
| user_accounts |
+---------------+
(2 rows)
~~~

To list just views, you can query the `views` table in the [Information Schema](information-schema.html):

~~~ sql
> SELECT * FROM bank.information_schema.views;
> SELECT * FROM startrek.information_schema.views;
~~~

~~~
+---------------+-------------------+----------------------+---------------------------------------------+--------------+--------------+--------------------+----------------------+----------------------+----------------------------+
| table_catalog |   table_schema    |      table_name      |            view_definition                  | check_option | is_updatable | is_insertable_into | is_trigger_updatable | is_trigger_deletable | is_trigger_insertable_into |
+---------------+-------------------+----------------------+---------------------------------------------+--------------+--------------+--------------------+----------------------+----------------------+----------------------------+
| bank          | public            | user_accounts        | SELECT type, email FROM bank.accounts       | NULL         | NULL         | NULL               | NULL                 | NULL                 | NULL                       |
+---------------+-------------------+----------------------+---------------------------------------------+--------------+--------------+--------------------+----------------------+----------------------+----------------------------+
(1 row)
+---------------+-------------------+----------------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------+--------------+--------------+--------------------+----------------------+----------------------+----------------------------+
| table_catalog |   table_schema    |      table_name      |                                                                              view_definition                                                                              | check_option | is_updatable | is_insertable_into | is_trigger_updatable | is_trigger_deletable | is_trigger_insertable_into |
+---------------+-------------------+----------------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------+--------------+--------------+--------------------+----------------------+----------------------+----------------------------+
| startrek      | public            | quotes_per_season    | SELECT startrek.episodes.season, count(*) FROM startrek.quotes JOIN startrek.episodes ON startrek.quotes.episode = startrek.episodes.id GROUP BY startrek.episodes.season | NULL         | NULL         | NULL               | NULL                 | NULL                 | NULL                       |
+---------------+-------------------+----------------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------+--------------+--------------+--------------------+----------------------+----------------------+----------------------------+
(1 row)
~~~

### Querying Views

To query a view, target it with a [table
expression](table-expressions.html#table-or-view-names), for example
using a [`SELECT` clause](select-clause.html), just as you would with
a stored table:

~~~ sql
> SELECT * FROM bank.user_accounts;
~~~

~~~
+----------+-----------------+
|   type   |      email      |
+----------+-----------------+
| checking | max@roach.com   |
| savings  | max@roach.com   |
| checking | betsy@roach.com |
| checking | lilly@roach.com |
| savings  | ben@roach.com   |
+----------+-----------------+
(5 rows)
~~~

`SELECT`ing a view executes the view's stored `SELECT` statement, which returns the relevant data from the underlying table(s). To inspect the `SELECT` statement executed by the view, use the [`SHOW CREATE VIEW`](show-create-view.html) statement:

~~~ sql
> SHOW CREATE VIEW bank.user_accounts;
~~~

~~~
+--------------------+---------------------------------------------------------------------------+
|        View        |                                CreateView                                 |
+--------------------+---------------------------------------------------------------------------+
| bank.user_accounts | CREATE VIEW "bank.user_accounts" AS SELECT type, email FROM bank.accounts |
+--------------------+---------------------------------------------------------------------------+
(1 row)
~~~

You can also inspect the `SELECT` statement executed by a view by querying the `views` table in the [Information Schema](information-schema.html):

~~~ sql
> SELECT view_definition FROM bank.information_schema.views WHERE table_name = 'user_accounts';
~~~

~~~
+----------------------------------------+
|             view_definition            |
+----------------------------------------+
| SELECT type, email FROM bank.accounts  |
+----------------------------------------+
(1 row)
~~~

### View Dependencies

A view depends on the objects targeted by its underlying query. Attempting to rename an object referenced in a view's stored query therefore results in an error:

~~~ sql
> ALTER TABLE bank.accounts RENAME TO bank.accts;
~~~

~~~
pq: cannot rename table "bank.accounts" because view "user_accounts" depends on it
~~~

Likewise, attempting to drop an object referenced in a view's stored query results in an error:

~~~ sql
> DROP TABLE bank.accounts;
~~~

~~~
pq: cannot drop table "accounts" because view "user_accounts" depends on it
~~~

~~~ sql
> ALTER TABLE bank.accounts DROP COLUMN email;
~~~

~~~
pq: cannot drop column email because view "bank.user_accounts" depends on it
~~~

There is an exception to the rule above, however: When [dropping a table](drop-table.html) or [dropping a view](drop-view.html), you can use the `CASCADE` keyword to drop all dependent objects as well:

~~~ sql
> DROP TABLE bank.accounts CASCADE;
~~~

~~~
DROP TABLE
~~~

{{site.data.alerts.callout_danger}}<code>CASCADE</code> drops <em>all</em> dependent objects without listing them, which can lead to inadvertent and difficult-to-recover losses. To avoid potential harm, we recommend dropping objects individually in most cases.{{site.data.alerts.end}}

### Renaming Views

To rename a view, use the [`ALTER VIEW`](alter-view.html) statement:

~~~ sql
> ALTER VIEW bank.user_accounts RENAME TO bank.user_accts;
~~~

~~~
RENAME VIEW
~~~

It is not possible to change the stored query executed by the view. Instead, you must drop the existing view and create a new view.

### Removing Views

To remove a view, use the [`DROP VIEW`](drop-view.html) statement:

~~~ sql
> DROP VIEW bank.user_accounts
~~~

~~~
DROP VIEW
~~~

## See Also

- [Selection Queries](selection-queries.html)
- [Simple `SELECT` Clauses](select-clause.html)
- [`CREATE VIEW`](create-view.html)
- [`SHOW CREATE VIEW`](show-create-view.html)
- [`GRANT`](grant.html)
- [`ALTER VIEW`](alter-view.html)
- [`DROP VIEW`](drop-view.html)
