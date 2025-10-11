---
title: Simple SELECT Clause
summary: The Simple SELECT clause loads or computes data from various sources.
toc: true
key: select.html
---

The simple `SELECT` clause is the main SQL syntax to read and process
existing data.

When used as a stand-alone statement, the simple `SELECT` clause is
also called "the `SELECT` statement". However, it is also a
[selection clause](selection-queries.html#selection-clauses) that can be combined
with other constructs to form more complex [selection queries](selection-queries.html).


## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/simple_select_clause.html %}
</div>


{{site.data.alerts.callout_success}}
The simple `SELECT` clause also has other applications not covered here, such as executing [functions](functions-and-operators.html) like `SELECT current_timestamp();`.
{{site.data.alerts.end}}

## Required privileges

The user must have the `SELECT` [privilege](authorization.html#assign-privileges) on the tables used as operands.

## Parameters

Parameter | Description
----------|-------------
`DISTINCT` or `ALL` | See [Eliminate Duplicate Rows](#eliminate-duplicate-rows).
`DISTINCT ON ( a_expr [, ...] )` | `DISTINCT ON` followed by a list of [scalar expressions](scalar-expressions.html) within parentheses. See [Eliminate Duplicate Rows](#eliminate-duplicate-rows).
`target_elem` | A [scalar expression](scalar-expressions.html) to compute a column in each result row, or `*` to automatically retrieve all columns from the `FROM` clause.<br><br>If `target_elem` contains an [aggregate function](functions-and-operators.html#aggregate-functions), a `GROUP BY` clause can be used to further control the aggregation.
`table_ref` | The [table expression](table-expressions.html) you want to retrieve data from.<br><br>Using two or more table expressions in the `FROM` sub-clause, separated with a comma, is equivalent to a [`CROSS JOIN`](joins.html) expression.
`AS OF SYSTEM TIME timestamp` | Retrieve data as it existed [as of `timestamp`](as-of-system-time.html). <br />**Note**: Because `AS OF SYSTEM TIME` returns historical data, your reads might be stale.
`WHERE a_expr` | Only retrieve rows that return `TRUE` for `a_expr`, which must be a [scalar expression](scalar-expressions.html) that returns Boolean values using columns (e.g., `<column> = <value>`).
`GROUP BY a_expr` | When using [aggregate functions](functions-and-operators.html#aggregate-functions) in `target_elem` or `HAVING`, list the column groupings after `GROUP BY`.
`HAVING a_expr` | Only retrieve aggregate function groups that return `TRUE` for `a_expr`, which must be a [scalar expression](scalar-expressions.html) that returns Boolean values using an aggregate function (e.g., `<aggregate function> = <value>`). <br/><br/>`HAVING` works like the `WHERE` clause, but for aggregate functions.
`WINDOW window_definition_list` | A list of [window functions definitions](window-functions.html).

## Eliminate duplicate rows

The `DISTINCT` subclause specifies to remove duplicate rows.

By default, or when `ALL` is specified, `SELECT` returns all the rows
selected, without removing duplicates. When `DISTINCT` is specified,
duplicate rows are eliminated.

Without `ON`, two rows are considered duplicates if they are equal on
all the results computed by `SELECT`.

With `ON`, two rows are considered duplicates if they are equal only
using the [scalar expressions](scalar-expressions.html) listed with `ON`. When two rows are considered duplicates according to `DISTINCT ON`, the values from the first `FROM` row in the order specified by [`ORDER BY`](query-order.html) are used to compute the remaining target expressions. If `ORDER BY` is not specified, CockroachDB will pick any one of the duplicate rows as first row, non-deterministically.

## Examples

### Choose columns

#### Retrieve specific columns

Retrieve specific columns by naming them in a comma-separated list:

{% include_cached copy-clipboard.html %}
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

#### Retrieve all columns

Retrieve all columns by using `*`:

{% include_cached copy-clipboard.html %}
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

### Filter rows

#### Filter on a single condition

Filter rows with expressions that use columns and return Boolean values in the `WHERE` clause:

{% include_cached copy-clipboard.html %}
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

#### Filter on multiple conditions

To use multiple `WHERE` filters join them with `AND` or `OR`. You can also create negative filters with `NOT`:

{% include_cached copy-clipboard.html %}
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

#### Select distinct rows

Columns without the [Primary Key](primary-key.html) or [Unique](unique.html) constraints can have multiple instances of the same value:

{% include_cached copy-clipboard.html %}
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

Using `DISTINCT`, you can remove all but one instance of duplicate values from your retrieved data:

{% include_cached copy-clipboard.html %}
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

#### Filter values with a list

Using `WHERE <column> IN (<comma separated list of values>)` performs an `OR` search for listed values in the specified column:

{% include_cached copy-clipboard.html %}
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

### Rename columns in output

Instead of outputting a column's name in the retrieved table, you can change its label using `AS`:

{% include_cached copy-clipboard.html %}
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

### Search for string values

Search for partial [string](string.html) matches in columns using `LIKE`, which supports the following wildcard operators:

- `%` matches 0 or more characters.
- `_` matches exactly 1 character.

For example:

{% include_cached copy-clipboard.html %}
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

### Aggregate functions

[Aggregate functions](functions-and-operators.html#aggregate-functions) perform calculations on retrieved rows.

#### Perform aggregate function on entire column

By using an aggregate function as a `target_elem`, you can perform the calculation on the entire column.

{% include_cached copy-clipboard.html %}
~~~ sql
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

You can also use the retrieved value as part of an expression. For example, you can use the result in the `WHERE` clause to select additional rows that were not part of the aggregate function itself:

{% include_cached copy-clipboard.html %}
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

#### Perform aggregate function on retrieved rows

By filtering the statement, you can perform the calculation only on retrieved rows:

{% include_cached copy-clipboard.html %}
~~~ sql
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

#### Filter columns fed into aggregate functions

You can use `FILTER (WHERE <Boolean expression>)` in the `target_elem` to filter which rows are processed by an aggregate function; those that return `FALSE` or `NULL` for the `FILTER` clause's Boolean expression are not fed into the aggregate function:

{% include_cached copy-clipboard.html %}
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

#### Create aggregate groups

Instead of performing aggregate functions on an the entire set of retrieved rows, you can split the rows into groups and then perform the aggregate function on each of them.

When creating aggregate groups, each column used as a `target_elem` must be included in `GROUP BY`.

For example:

{% include_cached copy-clipboard.html %}
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

#### Filter aggregate groups

To filter aggregate groups, use `HAVING`, which is the equivalent of the `WHERE` clause for aggregate groups, which must evaluate to a Boolean value.

For example:

{% include_cached copy-clipboard.html %}
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

#### Use aggregate functions in having clause

Aggregate functions can also be used in the `HAVING` clause without needing to be included as a `target_elem`.

For example:

{% include_cached copy-clipboard.html %}
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


### Select historical data (time-travel)

CockroachDB lets you find data as it was stored at a given point in
time using `AS OF SYSTEM TIME` with various [supported
formats](as-of-system-time.html). This can be also advantageous for
performance. For more details, see [`AS OF SYSTEM
TIME`](as-of-system-time.html).

## Advanced uses of `SELECT` clauses

CockroachDB supports numerous ways to combine results from `SELECT`
clauses together.

See [Selection Queries](selection-queries.html) for
details. A few examples follow.

### Sorting and limiting query results

To order the results of a `SELECT` clause or limit the number of rows
in the result, you can combine it with `ORDER BY` or `LIMIT` /
`OFFSET` to form a [selection query](selection-queries.html) or
[subquery](table-expressions.html#subqueries-as-table-expressions).

See [Ordering Query Results](query-order.html) and [Limiting Query
Results](limit-offset.html) for more details.

{{site.data.alerts.callout_info}}When <code>ORDER BY</code> is not included in a query, rows are not sorted by any consistent criteria. Instead, CockroachDB returns them as the coordinating node receives them.<br><br>Also, CockroachDB sorts <a href="null-handling.html#nulls-and-sorting"><code>NULL</code> values</a> first with <code>ASC</code> and last with <code>DESC</code>. This differs from PostgreSQL, which sorts <code>NULL</code> values last with <code>ASC</code> and first with <code>DESC</code>.{{site.data.alerts.end}}

### Combining results from multiple queries

Results from two or more queries can be combined together as follows:

- Using [join expressions](joins.html) to combine rows
  according to conditions on specific columns.
- Using [set operations](selection-queries.html#set-operations) to combine rows
  using inclusion/exclusion rules.

## See also

- [Scalar Expressions](scalar-expressions.html)
- [Selection Clauses](selection-queries.html#selection-clauses)
- [Set Operations](selection-queries.html#set-operations)
- [Table Expressions](table-expressions.html)
- [Ordering Query Results](query-order.html)
- [Limiting Query Results](limit-offset.html)
- [SQL Performance Best Practices](performance-best-practices-overview.html)
