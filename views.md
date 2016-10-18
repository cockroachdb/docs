---
title: Views
summary: 
toc: false
---

A view is a stored `SELECT` query represented as a virtual table. Unlike a standard table, a view is not part of the physical schema; instead, it is a virtual table that forms dynamically when requested. 

<div id="toc"></div>

## Why Use Views?

There are various reasons to use views, including:

- [Hide query complexity](#hide-query-complexity)
- [Limit access to underlying data](#limit-access-to-underlying-data)
- [Simplify supporting legacy code](#simplify-supporting-legacy-code)

### Hide query complexity  

When you have a complex query that, for example, joins several tables, or performs complex calculations, you can store the query as a view and then select from the view as you would from a standard table.

#### Example

Let's say you're using our [sample `startrek` database](generate-cli-utilities-and-example-data.html#generate-example-data), which contains two tables, `episodes` and `quotes`. There's a foreign key constraint between the `episodes.id` column and the `quotes.episode` column. To count the number of famous quotes per episode, you could run the following `JOIN`:

~~~ sql
> SELECT startrek.episodes.season, count(*) AS quotes 
  FROM startrek.quotes 
  JOIN startrek.episodes 
  ON startrek.quotes.episode = startrek.episodes.id 
  GROUP BY startrek.episodes.season;
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

Alternately, to make it much easier to run this complex query, you could create a view:

~~~ sql
> CREATE VIEW startrek.quotes_per_episode 
  AS SELECT startrek.episodes.season, count(*) AS quotes 
  FROM startrek.quotes 
  JOIN startrek.episodes 
  ON startrek.quotes.episode = startrek.episodes.id 
  GROUP BY startrek.episodes.season;
~~~

~~~
CREATE VIEW
~~~

Then, executing the query is as easy as selecting from the view:

~~~ sql
> SELECT * FROM startrek.quotes_per_episode;
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
> SHOW GRANTS on bank.accounts;
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
> GRANT SELECT on bank.user_accounts TO bob;
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

When you need to alter a table in a way that will break your application, and you can't update your code right away, you can create a view with a name and schema identical to the original table. During and after changes to the original table, your application will continue uninterrupted, and you can update the legacy code at your leisure. 

#### Example

Let's say you have a table called `user_accounts` that you want to rename to `client_accounts`, but your application has many queries to `user_accounts`. To ensure that your application continues uninterrupted, you could execute a transaction that renames the underlying table to `client_accounts` and creates a view with the old table name, `user_accounts`:

~~~ sql
BEGIN TRANSACTION;
ALTER TABLE bank.user_accounts RENAME TO bank.client_accounts;
CREATE VIEW bank.user_accounts 
  AS SELECT type, email
  FROM bank.client_accounts;
COMMIT;
~~~

Your application would then continue referencing `user_accounts` without issue, and at a later time, you could update your application code to reference the new `client_accounts` table.

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

The view is then represented as a table alongside other virtual and standard tables in the database:

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

### View Dependencies

A view depends on the tables or views targeted by its `SELECT` statement. These underlying tables or views cannot be `DROP`ed. Attempting to do so returns an error:

~~~ sql
> DROP TABLE bank.accounts;
~~~

~~~
pq: cannot drop table "accounts" because it is depended on by view "bank.user_accounts"
~~~

However, it is possible to drop columns that a view depends on and to rename tables, views, or columns that a view depends on, but doing so will cause the view to stop working. 

For example, if a `bank.user_accounts` view selects data from an underlying `bank.accounts` table and the `bank.accounts` table is renamed to `bank.accts`, querying the `bank.user_accounts` view would return an error:

~~~ sql
> SELECT * FROM bank.user_accounts;
~~~

~~~
pq: table "bank.accounts" does not exist
~~~ 

### Altering Views

To rename a view, use the [`ALTER VIEW`](alter-view.html) statement:

~~~ sql
> ALTER VIEW bank.user_accounts RENAME TO bank.user_accts;
~~~

~~~
RENAME VIEW
~~~

It is not possible to change the `SELECT` statement executed by the view. Therefore, when underlying tables are renamed or columns in underlying tables are dropped or renamed, it's necessary to drop the existing view and create a new view with the correctly named targets.

### Removing Views

To remove a view, use the [`DROP VIEW`](drop-view.html) statement:

~~~ sql
> DROP VIEW bank.user_accounts
~~~

~~~
DROP VIEW
~~~

However, note that a view targeted by another view cannot be dropped. For example, if you have a `bank.num_of_accounts` view that counts the rows resulting from a `bank.user_accounts view`, attempting to `DROP` `bank.user_accounts` will result in an error:

~~~ sql
> DROP VIEW bank.user_accounts
~~~

~~~
pq: cannot drop view "user_accounts" because it is depended on by view "bank.num_accounts"
~~~

## See Also

- `CREATE VIEW`
- `SHOW CREATE VIEW`
- `GRANT`
- `SELECT`
- `ALTER VIEW`
- `DROP VIEW`
