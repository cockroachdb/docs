---
title: SELECT
summary: The SELECT statement retrieves data from a table.
toc: true
---

The `SELECT` [statement](sql-statements.html) retrieves data from a table.


## Synopsis

{% include {{ page.version.version }}/sql/diagrams/select.html %}

{{site.data.alerts.callout_success}}<code>SELECT</code> also has other applications not covered here, such as executing <a href="functions-and-operators.html">functions</a> like <code>SELECT current_timestamp();</code>.{{site.data.alerts.end}}

## Required Privileges

The user must have the `SELECT` [privilege](privileges.html) on the table.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `DISTINCT` | Retrieve no more than one copy of a value. |
| `target_elem` | The name of the column you want select (`*` to retrieve all columns), the [aggregate function](functions-and-operators.html#aggregate-functions) you want to perform, or the [value expression](sql-expressions.html) you want to use. |
| `AS col_label` | In the retrieved table, change the column label to `col_label`. |
| `table_ref` | The [table expression](table-expressions.html) you want to retrieve data from.|
| `index_name` | The name of the index you want to use, also known as "[index hints](#force-index-selection-index-hints)." Find index names using [`SHOW INDEX`](show-index.html). <br/><br/>Forced index selection overrides [CockroachDB's index selection](https://www.cockroachlabs.com/blog/index-selection-cockroachdb-2/). |
| `AS OF SYSTEM TIME timestamp` | Retrieve data as it existed as of [`timestamp`](as-of-system-time.html). For more information, see [this example](#select-historical-data-time-travel). |
| `WHERE a_expr` | Only retrieve rows that return `TRUE` for `a_expr`, which must be an expression that returns Boolean values using columns (e.g., `<column> = <value>`).  |
| `GROUP BY expr_list` | When using [aggregate functions](functions-and-operators.html#aggregate-functions) in `target_elem` or `HAVING`, list the column groupings in `expr_list`. |
| `HAVING a_expr` | Only retrieve aggregate function groups that return `TRUE` for `a_expr`, which must be an expression that returns Boolean values using an aggregate function (e.g., `<aggregate function> = <value>`). <br/><br/>`HAVING` works like the `WHERE` clause, but for aggregate functions. |
| `UNION` | Combine the retrieved rows from the preceding and following `SELECT` statements. Returns distinct values.|
| `INTERSECT` | Only retrieve rows that exist in both the preceding and following `SELECT` statements. Returns distinct values. |
| `EXCEPT` | Only retrieve rows that are in the preceding `SELECT` statement but not in the following `SELECT` statement.  Returns distinct values.|
| `ALL` | Include duplicate rows in the returned values of `UNION`, `INTERSECT`, or `EXCEPT`. |
| `ORDER BY sortby_list` | Sort retrieved rows in the order of comma-separated column names you include in `sortby_list`. You can optionally specify `ASC` or `DESC` order for each column.<br><br>When <code>ORDER BY</code> is not included in a query, rows are not sorted by any consistent criteria. Instead, CockroachDB returns them as the coordinating node receives them.|
| `LIMIT limit_val` | Only retrieve `limit_val` number of rows. |
| `OFFSET offset_val` | Do not include the first `offset_value` number of rows.<br/><br/>`OFFSET` is often used in conjunction with `LIMIT` to "paginate" through retrieved rows. |

## Examples

### Choose Columns

#### Retrieve Specific Columns

Retrieve specific columns by naming them in a comma-separated list.

~~~ sql
> SELECT id, name, balance
FROM accounts;
~~~
~~~
+----+-----------------------+---------+
| id |         name          | balance |
+----+-----------------------+---------+
|  1 | Bjorn Fairclough      |    1200 |
|  2 | Bjorn Fairclough      |    2500 |
|  3 | Arturo Nevin          |     250 |
[ truncated ]
+----+-----------------------+---------+
~~~

#### Retrieve All Columns

Retrieve all columns by using `*`.

~~~ sql
> SELECT *
FROM accounts;
~~~
~~~
+----+-----------------------+---------+----------+--------------+
| id |         name          | balance |   type   | state_opened |
+----+-----------------------+---------+----------+--------------+
|  1 | Bjorn Fairclough      |    1200 | checking | AL           |
|  2 | Bjorn Fairclough      |    2500 | savings  | AL           |
|  3 | Arturo Nevin          |     250 | checking | AK           |
[ truncated ]
+----+-----------------------+---------+----------+--------------+
~~~

### Filter Rows

#### Filter on a Single Condition

Filter rows with expressions that use columns and return Boolean values in the `WHERE` clause.

~~~ sql
> SELECT name, balance
FROM accounts
WHERE balance < 300;
~~~
~~~
+------------------+---------+
|       name       | balance |
+------------------+---------+
| Arturo Nevin     |     250 |
| Akbar Jinks      |     250 |
| Andrea Maas      |     250 |
+------------------+---------+
~~~

#### Filter on Multiple Conditions

To use multiple `WHERE` filters join them with `AND` or `OR`. You can also create negative filters with `NOT`.

~~~ sql
> SELECT *
FROM accounts
WHERE balance > 2500 AND NOT type = 'checking';
~~~
~~~
+----+-------------------+---------+---------+--------------+
| id |       name        | balance |  type   | state_opened |
+----+-------------------+---------+---------+--------------+
|  4 | Tullia Romijnders |    3000 | savings | AK           |
| 62 | Ruarc Mathews     |    3000 | savings | OK           |
+----+-------------------+---------+---------+--------------+
~~~

#### Select Distinct Rows

Columns without the [Primary Key](primary-key.html) or [Unique](unique.html) constraints can have multiple instances of the same value.

~~~ sql
> SELECT name
FROM accounts
WHERE state_opened = 'VT';
~~~
~~~
+----------------+
|      name      |
+----------------+
| Sibylla Malone |
| Sibylla Malone |
+----------------+
~~~

Using `DISTINCT`, you can remove all but one instance of duplicate values from your retrieved data.

~~~ sql
> SELECT DISTINCT name
FROM accounts
WHERE state_opened = 'VT';
~~~
~~~
+----------------+
|      name      |
+----------------+
| Sibylla Malone |
+----------------+
~~~

#### Filter Values with a List

Using `WHERE <column> IN (<comma separated list of values>)` performs an `OR` search for listed values in the specified column.

~~~ sql
> SELECT name, balance, state_opened
FROM accounts
WHERE state_opened IN ('AZ', 'NY', 'WA');
~~~
~~~
+-----------------+---------+--------------+
|      name       | balance | state_opened |
+-----------------+---------+--------------+
| Naseem Joossens |     300 | AZ           |
| Aygün Sanna     |     900 | NY           |
| Carola Dahl     |     800 | NY           |
| Edna Barath     |     750 | WA           |
| Edna Barath     |    2200 | WA           |
+-----------------+---------+--------------+
~~~

### Rename Columns in Output

Instead of outputting a column's name in the retrieved table, you can change its label using `AS`.

~~~ sql
> SELECT name AS NY_accounts, balance
FROM accounts
WHERE state_opened = 'NY';
~~~
~~~
+-------------+---------+
| NY_accounts | balance |
+-------------+---------+
| Aygün Sanna |     900 |
| Carola Dahl |     800 |
+-------------+---------+
~~~

This *does not* change the name of the column in the table. To do that, use [`RENAME COLUMN`](rename-column.html).

### Search for String Values

Search for partial [string](string.html) matches in columns using `LIKE`, which supports the following wildcard operators:

- `%` matches 0 or more characters
- `_` matches exactly 1 character

~~~ sql
> SELECT id, name, type
FROM accounts
WHERE name LIKE 'Anni%';
~~~
~~~
+----+----------------+----------+
| id |      name      |   type   |
+----+----------------+----------+
| 58 | Annibale Karga | checking |
| 59 | Annibale Karga | savings  |
+----+----------------+----------+
~~~

### Aggregate Functions

[Aggregate functions](functions-and-operators.html#aggregate-functions) perform calculations on retrieved rows.

#### Perform Aggregate Function on Entire Column

By using an aggregate function as a `target_elem`, you can perform the calculation on the entire column.

~~~sql
> SELECT MIN(balance)
FROM accounts;
~~~
~~~
+--------------+
| MIN(balance) |
+--------------+
|          250 |
+--------------+
~~~

You can also use the retrieved value as part of an expression. For example, you can use the result in the `WHERE` clause to select additional rows that were not part of the aggregate function itself.

~~~ sql
> SELECT id, name, balance
FROM accounts
WHERE balance = (
      SELECT
      MIN(balance)
      FROM accounts
);
~~~
~~~
+----+------------------+---------+
| id |       name       | balance |
+----+------------------+---------+
|  3 | Arturo Nevin     |     250 |
| 10 | Henrik Brankovic |     250 |
| 26 | Odalys Ziemniak  |     250 |
| 35 | Vayu Soun        |     250 |
+----+------------------+---------+
~~~

#### Perform Aggregate Function on Retrieved Rows

By filtering the statement, you can perform the calculation only on retrieved rows.

~~~sql
> SELECT SUM(balance)
FROM accounts
WHERE state_opened IN ('AZ', 'NY', 'WA');
~~~
~~~
+--------------+
| SUM(balance) |
+--------------+
|         4950 |
+--------------+
~~~

#### Filter Columns Fed into Aggregate Functions

You can use `FILTER (WHERE <Boolean expression>)` in the `target_elem` to filter which rows are processed by an aggregate function; those that return `FALSE` or `NULL` for the `FILTER` clause's Boolean expression are not fed into the aggregate function.

~~~ sql
> SELECT count(*) AS unfiltered, count(*) FILTER (WHERE balance > 1500) AS filtered FROM accounts;
~~~
~~~
+------------+----------+
| unfiltered | filtered |
+------------+----------+
|         84 |       14 |
+------------+----------+
~~~

#### Create Aggregate Groups

Instead of performing aggregate functions on an the entire set of retrieved rows, you can split the rows into groups and then perform the aggregate function on each of them.

When creating aggregate groups, each column used as a `target_elem` must be included in `GROUP BY`.

~~~ sql
> SELECT state_opened AS state, SUM(balance) AS state_balance
FROM accounts
WHERE state_opened IN ('AZ', 'NY', 'WA')
GROUP BY state_opened;
~~~
~~~
+-------+---------------+
| state | state_balance |
+-------+---------------+
| AZ    |           300 |
| NY    |          1700 |
| WA    |          2950 |
+-------+---------------+
~~~

#### Filter Aggregate Groups

To filter aggregate groups, use `HAVING`, which is the equivalent of the `WHERE` clause for aggregate groups, which must evlauate to a Boolean value.

~~~ sql
> SELECT state_opened, AVG(balance) as avg
FROM accounts
GROUP BY state_opened
HAVING AVG(balance) BETWEEN 1700 AND 50000;
~~~
~~~
+--------------+---------+
| state_opened |   avg   |
+--------------+---------+
| AR           | 3700.00 |
| UT           | 1750.00 |
| OH           | 2500.00 |
| AL           | 1850.00 |
+--------------+---------+
~~~

#### Use Aggregate Functions in Having Clause

Aggregate functions can also be used in the `HAVING` clause without needing to be included as a `target_elem`.

~~~ sql
> SELECT name, state_opened
FROM accounts
WHERE state_opened in ('LA', 'MO')
GROUP BY name, state_opened
HAVING COUNT(name) > 1;
~~~
~~~
+----------------+--------------+
|      name      | state_opened |
+----------------+--------------+
| Yehoshua Kleid | MO           |
+----------------+--------------+
~~~

### Combine Multiple Selects (Union, Intersect, Except)

SQL lets you compare the results of multiple `SELECT` statements. You can think of each of these clauses as representing a Boolean operator:

- `UNION` = OR
- `INTERSECT` = AND
- `EXCEPT` = NOT

By default, each of these comparisons displays only one copy of each value (similar to `SELECT DISTINCT`). However, each function also lets you add an `ALL` to the clause to display duplicate values.

#### Union: Combine Two Queries

`UNION` combines the results of two `SELECT` queries into one result.

~~~ sql
> SELECT name
FROM accounts
WHERE state_opened IN ('AZ', 'NY')
UNION
SELECT name
FROM mortgages
WHERE state_opened IN ('AZ', 'NY');
~~~
~~~
+-----------------+
|      name       |
+-----------------+
| Naseem Joossens |
| Ricarda Caron   |
| Carola Dahl     |
| Aygün Sanna     |
+-----------------+
~~~

To show duplicate rows, you can use `ALL`.

~~~ sql
> SELECT name
FROM accounts
WHERE state_opened IN ('AZ', 'NY')
UNION ALL
SELECT name
FROM mortgages
WHERE state_opened IN ('AZ', 'NY');
~~~
~~~
+-----------------+
|      name       |
+-----------------+
| Naseem Joossens |
| Ricarda Caron   |
| Carola Dahl     |
| Naseem Joossens |
| Aygün Sanna     |
| Carola Dahl     |
+-----------------+
~~~

#### Intersect: Retrieve Intersection of Two Queries

`INTERSECT` finds only values that are present in both `SELECT` queries.

~~~ sql
> SELECT name
FROM accounts
WHERE state_opened IN ('NJ', 'VA')
INTERSECT
SELECT name
FROM mortgages;
~~~
~~~
+-----------------+
|      name       |
+-----------------+
| Danijel Whinery |
| Agar Archer     |
+-----------------+
~~~

#### Except: Exclude One Query's Results from Another

`EXCEPT` finds values that are present in the first `SELECT` statement but not the second.

~~~ sql
> SELECT name
FROM mortgages
EXCEPT
SELECT name
FROM accounts;
~~~
~~~
+------------------+
|       name       |
+------------------+
| Günay García     |
| Karla Goddard    |
| Cybele Seaver    |
+------------------+
~~~

### Sorting Retrieved Values

You can use an `ORDER BY` clause to sort retrieved rows by one or more columns.

{{site.data.alerts.callout_info}}When <code>ORDER BY</code> is not included in a query, rows are not sorted by any consistent criteria. Instead, CockroachDB returns them as the coordinating node receives them.{{site.data.alerts.end}}

#### Order Retrieved Rows by One Column

~~~ sql
> SELECT *
FROM accounts
WHERE balance BETWEEN 350 AND 500
ORDER BY balance DESC;
~~~
~~~
+----+--------------------+---------+----------+--------------+
| id |        name        | balance |   type   | state_opened |
+----+--------------------+---------+----------+--------------+
| 12 | Raniya Žitnik      |     500 | savings  | CT           |
| 59 | Annibale Karga     |     500 | savings  | ND           |
| 27 | Adelbert Ventura   |     500 | checking | IA           |
| 86 | Theresa Slaski     |     500 | checking | WY           |
| 73 | Ruadh Draganov     |     500 | checking | TN           |
| 16 | Virginia Ruan      |     400 | checking | HI           |
| 43 | Tahirih Malinowski |     400 | checking | MS           |
| 50 | Dusan Mallory      |     350 | savings  | NV           |
+----+--------------------+---------+----------+--------------+
~~~

#### Order Retrieved Rows by Multiple Columns

Columns are sorted in the order you list them in `sortby_list`. For example, `ORDER BY a, b` sorts the rows by column `a` and then sorts rows with the same `a` value by their column `b` values.

~~~ sql
> SELECT *
FROM accounts
WHERE balance BETWEEN 350 AND 500
ORDER BY balance DESC, name ASC;
~~~
~~~
+----+--------------------+---------+----------+--------------+
| id |        name        | balance |   type   | state_opened |
+----+--------------------+---------+----------+--------------+
| 27 | Adelbert Ventura   |     500 | checking | IA           |
| 59 | Annibale Karga     |     500 | savings  | ND           |
| 12 | Raniya Žitnik      |     500 | savings  | CT           |
| 73 | Ruadh Draganov     |     500 | checking | TN           |
| 86 | Theresa Slaski     |     500 | checking | WY           |
| 43 | Tahirih Malinowski |     400 | checking | MS           |
| 16 | Virginia Ruan      |     400 | checking | HI           |
| 50 | Dusan Mallory      |     350 | savings  | NV           |
+----+--------------------+---------+----------+--------------+
~~~

### Control Quantity of Returned Rows

#### Limit Number of Retrieved Results

You can reduce the number of results with `LIMIT`.

~~~ sql
> SELECT id, name
FROM accounts
LIMIT 5;
~~~
~~~
+----+------------------+
| id |       name       |
+----+------------------+
|  1 | Bjorn Fairclough |
|  2 | Bjorn Fairclough |
|  3 | Arturo Nevin     |
|  4 | Arturo Nevin     |
|  5 | Naseem Joossens  |
+----+------------------+
~~~

#### Paginate Through Limited Results

If you want to limit the number of results, but go beyond the initial set, use `OFFSET` to proceed to the next set of results. This is often used to paginate through large tables where not all of the values need to be immediately retrieved.

~~~ sql
> SELECT id, name
FROM accounts
LIMIT 5
OFFSET 5;
~~~
~~~
+----+------------------+
| id |       name       |
+----+------------------+
|  6 | Juno Studwick    |
|  7 | Juno Studwick    |
|  8 | Eutychia Roberts |
|  9 | Ricarda Moriarty |
| 10 | Henrik Brankovic |
+----+------------------+
~~~

### Force Index Selection (Index Hints)

By using "index hints", you can override [CockroachDB's index selection](https://www.cockroachlabs.com/blog/index-selection-cockroachdb-2/) and use a specific [index](indexes.html) for your `SELECT` statement.

{{site.data.alerts.callout_info}}Index selection can impact performance, but does not change the result of a <code>SELECT</code> statement.{{site.data.alerts.end}}

~~~ sql
> SHOW INDEXES FROM accounts;
~~~
~~~
+----------+-------------------+--------+-----+--------+-----------+---------+----------+
|  Table   |       Name        | Unique | Seq | Column | Direction | Storing | Implicit |
+----------+-------------------+--------+-----+--------+-----------+---------+----------+
| accounts | primary           | true   |   1 | id     | ASC       | false   | false    |
| accounts | accounts_name_idx | false  |   1 | name   | ASC       | false   | false    |
| accounts | accounts_name_idx | false  |   2 | id     | ASC       | false   | true     |
+----------+-------------------+--------+-----+--------+-----------+---------+----------+
(3 rows)
~~~
~~~ sql
> SELECT name, balance
FROM accounts@accounts_name_idx
WHERE name = 'Edna Barath';
~~~
~~~
+-------------+---------+
|    name     | balance |
+-------------+---------+
| Edna Barath |     750 |
| Edna Barath |    2200 |
+-------------+---------+
~~~

### Select Historical Data (Time Travel)

CockroachDB lets you find data as it was stored at a given point in time using `AS OF SYSTEM TIME` with various [supported formats](as-of-system-time.html).

{{site.data.alerts.callout_info}}Historical data is available only within the garbage collection window, which is determined by the <code>ttlseconds</code> field in the <a href="configure-replication-zones.html">replication zone configuration</a>.{{site.data.alerts.end}}

Imagine this example represents the database's current data.

~~~ sql
> SELECT name, balance
FROM accounts
WHERE name = 'Edna Barath';
~~~
~~~
+-------------+---------+
|    name     | balance |
+-------------+---------+
| Edna Barath |     750 |
| Edna Barath |    2200 |
+-------------+---------+
~~~

We could instead retrieve the values as they were on October 3, 2016 at 12:45 UTC.

~~~ sql
> SELECT name, balance
FROM accounts
AS OF SYSTEM TIME '2016-10-03 12:45:00'
WHERE name = 'Edna Barath';
~~~
~~~
+-------------+---------+
|    name     | balance |
+-------------+---------+
| Edna Barath |     450 |
| Edna Barath |    2000 |
+-------------+---------+
~~~


## See Also
- [`INSERT`](insert.html)
- [`UPDATE`](update.html)
- [`CREATE TABLE`](create-table.html)
- [SQL Statements](sql-statements.html)
