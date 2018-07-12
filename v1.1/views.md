---
title: Views
summary:
toc: true
---

A view is a stored `SELECT` query represented as a virtual table. Unlike a standard table, a view is not part of the physical schema; instead, it is a virtual table that forms dynamically when requested.


## Why Use Views?

There are various reasons to use views, including:

- [Hide query complexity](#hide-query-complexity)
- [Limit access to underlying data](#limit-access-to-underlying-data)

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

### Listing Views

Once created, views are represented as virtual tables alongside other virtual and standard tables in the database:

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

To list just views, you can query the `views` table in the built-in `information_schema` database:

~~~ sql
> SELECT * FROM information_schema.views;
~~~

~~~
+---------------+-------------------+----------------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------+--------------+--------------+--------------------+----------------------+----------------------+----------------------------+
| TABLE_CATALOG |   TABLE_SCHEMA    |      TABLE_NAME      |                                                                              VIEW_DEFINITION                                                                              | CHECK_OPTION | IS_UPDATABLE | IS_INSERTABLE_INTO | IS_TRIGGER_UPDATABLE | IS_TRIGGER_DELETABLE | IS_TRIGGER_INSERTABLE_INTO |
+---------------+-------------------+----------------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------+--------------+--------------+--------------------+----------------------+----------------------+----------------------------+
| def           | bank              | user_accounts        | SELECT type, email FROM bank.accounts                                                                                                                                     | NULL         | NULL         | NULL               | NULL                 | NULL                 | NULL                       |
| def           | startrek          | quotes_per_season    | SELECT startrek.episodes.season, count(*) FROM startrek.quotes JOIN startrek.episodes ON startrek.quotes.episode = startrek.episodes.id GROUP BY startrek.episodes.season | NULL         | NULL         | NULL               | NULL                 | NULL                 | NULL                       |
+---------------+-------------------+----------------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------+--------------+--------------+--------------------+----------------------+----------------------+----------------------------+
(2 rows)
~~~

Alternatively, you can query the `pg_views` table in the built-in `pg_catalog` database:

~~~ sql
> SELECT * FROM pg_catalog.pg_views;
~~~

~~~
+-------------------+----------------------+-----------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
|    schemaname     |       viewname       | viewowner |                                                                                definition                                                                                 |
+-------------------+----------------------+-----------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| bank              | user_accounts        | NULL      | SELECT type, email FROM bank.accounts                                                                                                                                     |
| startrek          | quotes_per_season    | NULL      | SELECT startrek.episodes.season, count(*) FROM startrek.quotes JOIN startrek.episodes ON startrek.quotes.episode = startrek.episodes.id GROUP BY startrek.episodes.season |
+-------------------+----------------------+-----------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
(2 rows)
~~~

### Querying Views

To query a view, target it with a [`SELECT`](select.html) statement just as you would a standard table:

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

You can also inspect the `SELECT` statement executed by a view by querying the `views` table in the built-in `information_schema` database:

~~~ sql
> SELECT * FROM information_schema.views;
~~~

~~~
+---------------+-------------------+----------------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------+--------------+--------------+--------------------+----------------------+----------------------+----------------------------+
| TABLE_CATALOG |   TABLE_SCHEMA    |      TABLE_NAME      |                                                                              VIEW_DEFINITION                                                                              | CHECK_OPTION | IS_UPDATABLE | IS_INSERTABLE_INTO | IS_TRIGGER_UPDATABLE | IS_TRIGGER_DELETABLE | IS_TRIGGER_INSERTABLE_INTO |
+---------------+-------------------+----------------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------+--------------+--------------+--------------------+----------------------+----------------------+----------------------------+
| def           | bank              | user_accounts        | SELECT type, email FROM bank.accounts                                                                                                                                     | NULL         | NULL         | NULL               | NULL                 | NULL                 | NULL                       |
| def           | startrek          | quotes_per_season    | SELECT startrek.episodes.season, count(*) FROM startrek.quotes JOIN startrek.episodes ON startrek.quotes.episode = startrek.episodes.id GROUP BY startrek.episodes.season | NULL         | NULL         | NULL               | NULL                 | NULL                 | NULL                       |
+---------------+-------------------+----------------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------+--------------+--------------+--------------------+----------------------+----------------------+----------------------------+
(2 rows)
~~~

### View Dependencies

A view depends on the objects targeted by its `SELECT` statement. Attempting to rename an object referenced in a view's `SELECT` statement therefore results in an error:

~~~ sql
> ALTER TABLE bank.accounts RENAME TO bank.accts;
~~~

~~~
pq: cannot rename table "bank.accounts" because view "user_accounts" depends on it
~~~

Likewise, attempting to drop an object referenced in a view's `SELECT` statement results in an error:

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

It is not possible to change the `SELECT` statement executed by the view. Instead, you must drop the existing view and create a new view.

### Removing Views

To remove a view, use the [`DROP VIEW`](drop-view.html) statement:

~~~ sql
> DROP VIEW bank.user_accounts
~~~

~~~
DROP VIEW
~~~

## See Also

- [`CREATE VIEW`](create-view.html)
- [`SHOW CREATE VIEW`](show-create-view.html)
- [`GRANT`](grant.html)
- [`SELECT`](select.html)
- [`ALTER VIEW`](alter-view.html)
- [`DROP VIEW`](drop-view.html)
