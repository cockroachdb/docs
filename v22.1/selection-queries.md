---
title: Selection Queries
summary: Selection queries can read and process data in CockroachDB.
toc: true
key: selection-clauses.html
docs_area: reference.sql
---

Selection queries read and process data in CockroachDB.  They are more
general than [simple `SELECT` clauses](select-clause.html): they can
group one or more [selection clauses](#selection-clauses) with [set
operations](#set-operations) and can request a [specific
ordering](order-by.html) or [row limit](limit-offset.html).

Selection queries can occur:

- At the top level of a query like other [SQL statements](sql-statements.html).
- Between parentheses as a [subquery](table-expressions.html#subqueries-as-table-expressions).
- As [operand to other statements](#use-selection-queries-with-other-statements) that take tabular data as input, for example [`INSERT`](insert.html), [`UPSERT`](upsert.html),  [`CREATE TABLE AS`](create-table-as.html), or [`ALTER ... SPLIT AT`](split-at.html).


## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-22.1/grammar_svg/select.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`common_table_expr` | See [Common Table Expressions](common-table-expressions.html).
`select_clause` | A valid [selection clause](#selection-clauses), either simple or using [set operations](#set-operations).
`sort_clause` | An optional `ORDER BY` clause. See [Ordering Query Results](order-by.html) for details.
`limit_clause` | An optional `LIMIT` clause. See [Limit Query Results](limit-offset.html) for details.
`offset_clause` | An optional `OFFSET` clause. See [Limit Query Results](limit-offset.html) for details.
`for_locking_clause` |  The `FOR UPDATE` locking clause is used to order transactions by controlling concurrent access to one or more rows of a table.  For more information, see [`SELECT FOR UPDATE`](select-for-update.html).

The optional `LIMIT` and `OFFSET` clauses can appear in any order, but if also present, must appear **after** `ORDER BY`.

{{site.data.alerts.callout_info}}Because the <code>WITH</code>, <code>ORDER BY</code>, <code>LIMIT</code> and <code>OFFSET</code> sub-clauses are all optional, any simple <a href="#selection-clauses">selection clause</a> is also a valid selection query.{{site.data.alerts.end}}

## Selection clauses

A _selection clause_ is the main component of a selection query. A selection clause
defines tabular data. There are four specific syntax forms collectively referred to as selection clauses:

Form | Usage
-----|--------
[`SELECT`](#select-clause) | Load or compute tabular data from various sources. This is the most common selection clause.
[`VALUES`](#values-clause) | List tabular data by the client.
[`TABLE`](#table-clause) | Load tabular data from the database.
[Set operations](#set-operations) | Combine tabular data from two or more selection clauses.

{{site.data.alerts.callout_info}}To perform joins or other relational operations over selection clauses, use a <a href="table-expressions.html">table expression</a> and <a href="#composability">convert it back</a> into a selection clause with <a href="#table-clause"><code>TABLE</code></a> or <a href="#select-clause"><code>SELECT</code></a>.{{site.data.alerts.end}}

### Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-22.1/grammar_svg/select_clause.html %}
</div>

### `VALUES` clause

#### Syntax

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-22.1/grammar_svg/values_clause.html %}
</div>

A `VALUES` clause defines tabular data defined by the expressions
listed within parentheses. Each parenthesis group defines a single row
in the resulting table.

The columns of the resulting table data have automatically generated
names. [These names can be modified with
`AS`](table-expressions.html#aliased-table-expressions) when the
`VALUES` clause is used as a sub-query.

#### Example

{% include copy-clipboard.html %}
~~~ sql
> VALUES (1, 2, 3), (4, 5, 6);
~~~

~~~
+---------+---------+---------+
| column1 | column2 | column3 |
+---------+---------+---------+
|       1 |       2 |       3 |
|       4 |       5 |       6 |
+---------+---------+---------+
~~~

### `TABLE` clause

#### Syntax

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-22.1/grammar_svg/table_clause.html %}
</div>

A `TABLE` clause reads tabular data from a specified table. The
columns of the resulting table data are named after the schema of the
table.

In general, `TABLE x` is equivalent to `SELECT * FROM x`, but it is
shorter to type.

{{site.data.alerts.callout_info}}Any <a href="table-expressions.html">table expression</a> between parentheses is a valid operand for <code>TABLE</code>, not just <a href="table-expressions.html#table-or-view-names">simple table or view names</a>.{{site.data.alerts.end}}

#### Example

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE employee_copy AS TABLE employee;
~~~

This statement copies the content from table `employee` into a new
table. However, note that the `TABLE` clause does not preserve the indexing,
foreign key, or constraint and default information from the schema of the
table it reads from, so in this example, the new table `employee_copy`
will likely have a simpler schema than `employee`.

Other examples:

{% include copy-clipboard.html %}
~~~ sql
> TABLE employee;
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO employee_copy TABLE employee;
~~~

### `SELECT` clause

See [Simple `SELECT` Clause](select-clause.html) for more
details.

## Set operations

Set operations combine data from two [selection
clauses](#selection-clauses). They are valid as operand to other
set operations or as main component in a selection query.

### Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-22.1/grammar_svg/set_operation.html %}
</div>

### Set operators

SQL lets you compare the results of multiple [selection clauses](#selection-clauses). You can think of each of the set operators as representing a Boolean operator:

- `UNION` = `OR`
- `INTERSECT` = `AND`
- `EXCEPT` = `NOT`

By default, each of these comparisons displays only one copy of each value (similar to `SELECT DISTINCT`). However, to display duplicate values, you can add an `ALL` to the clause.

### `UNION`: Combine two queries

`UNION` combines the results of two queries into one result.

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
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

### `INTERSECT`: Retrieve intersection of two queries

`INTERSECT` selects only values that are present in both query operands.

{% include copy-clipboard.html %}
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

### `EXCEPT`: Exclude one query's results from another

`EXCEPT` selects values that are present in the first query operand but not the second.

{% include copy-clipboard.html %}
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

## Order results

The following sections provide examples. For more details, see [Ordering Query Results](order-by.html).

### Order retrieved rows by one column

{% include copy-clipboard.html %}
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

### Order retrieved rows by multiple columns

Columns are sorted in the order you list them in `sortby_list`. For example, `ORDER BY a, b` sorts the rows by column `a` and then sorts rows with the same `a` value by their column `b` values.

{% include copy-clipboard.html %}
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

## Limit row count

You can reduce the number of results with `LIMIT`.

{% include copy-clipboard.html %}
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

## Row-level locking for concurrency control with `SELECT FOR UPDATE`

{% include {{page.version.version}}/sql/select-for-update-overview.md %}

For an example showing how to use it, see  [`SELECT FOR UPDATE`](select-for-update.html).

## Composability

[Selection clauses](#selection-clauses) are defined in the context of selection queries. [Table expressions](table-expressions.html) are defined in the context of the `FROM` sub-clause of [`SELECT`](select-clause.html). Nevertheless, you can integrate them with one another to form more complex queries or statements.

### Use any selection clause as a selection query

You can use any [selection clause](#selection-clauses) as a
selection query with no change.

For example, the construct [`SELECT * FROM accounts`](select-clause.html) is a selection clause. It is also a valid selection query, and thus can be used as a stand-alone statement by appending a semicolon:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM accounts;
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

Likewise, the construct [`VALUES (1), (2), (3)`](#values-clause) is also a selection
clause and thus can also be used as a selection query on its own:

{% include copy-clipboard.html %}
~~~ sql
> VALUES (1), (2), (3);
~~~
~~~
+---------+
| column1 |
+---------+
|       1 |
|       2 |
|       3 |
+---------+
(3 rows)
~~~

### Use any table expression as selection clause

You can use any [table expression](table-expressions.html) as a selection clause (and thus also a selection query) by prefixing it with `TABLE` or by using it as an operand to `SELECT * FROM`.

For example, the [simple table name](table-expressions.html#table-or-view-names) `customers` is a table expression, which designates all rows in that table. The expressions [`TABLE accounts`](selection-queries.html#table-clause) and [`SELECT * FROM accounts`](select-clause.html) are valid selection clauses.

Likewise, the [SQL join expression](joins.html) `customers c JOIN orders o ON c.id = o.customer_id` is a table expression. You can turn it into a valid selection clause, and thus a valid selection query as follows:

{% include copy-clipboard.html %}
~~~ sql
> TABLE (customers c JOIN orders o ON c.id = o.customer_id);
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM customers c JOIN orders o ON c.id = o.customer_id;
~~~

### Use any selection query as table expression

You can use any selection query (or [selection clause](#selection-clauses)) as a [table
expression](table-expressions.html) by enclosing it between parentheses, which forms a
[subquery](table-expressions.html#subqueries-as-table-expressions).

For example, the following construct is a selection query, but is not a valid table expression:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM customers ORDER BY name LIMIT 5
~~~

To make it valid as operand to `FROM` or another table expression, you can enclose it between parentheses as follows:

{% include copy-clipboard.html %}
~~~ sql
> SELECT id FROM (SELECT * FROM customers ORDER BY name LIMIT 5);
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT o.id
    FROM orders o
    JOIN (SELECT * FROM customers ORDER BY name LIMIT 5) AS c
	  ON o.customer_id = c.id;
~~~

### Use selection queries with other statements

Selection queries are also valid as operand in contexts that require tabular data.

For example:

 Statement | Example using `SELECT` | Example using `VALUES` | Example using `TABLE` |
|----------------|-----------------------------------|------------------------------------|-------------------------------
 [`INSERT`](insert.html) | `INSERT INTO foo SELECT * FROM bar` | `INSERT INTO foo VALUES (1), (2), (3)` | `INSERT INTO foo TABLE bar`
 [`UPSERT`](upsert.html) | `UPSERT INTO foo SELECT * FROM bar` | `UPSERT INTO foo VALUES (1), (2), (3)` | `UPSERT INTO foo TABLE bar`
 [`CREATE TABLE AS`](create-table-as.html) | `CREATE TABLE foo AS SELECT * FROM bar`  `CREATE TABLE foo AS VALUES (1),(2),(3)` | `CREATE TABLE foo AS TABLE bar`
 [`ALTER ... SPLIT AT`](split-at.html) | `ALTER TABLE foo SPLIT AT SELECT * FROM bar`  `ALTER TABLE foo SPLIT AT VALUES (1),(2),(3)` | `ALTER TABLE foo SPLIT AT TABLE bar`
 Subquery in a [table expression](table-expressions.html) | `SELECT * FROM (SELECT * FROM bar)` | `SELECT * FROM (VALUES (1),(2),(3))` | `SELECT * FROM (TABLE bar)`
 Subquery in a [scalar expression](scalar-expressions.html) | `SELECT * FROM foo WHERE x IN (SELECT * FROM bar)` | `SELECT * FROM foo WHERE x IN (VALUES (1),(2),(3))` | `SELECT * FROM foo WHERE x IN (TABLE bar)`

## See also

- [Simple `SELECT` Clause](select-clause.html)
- [`SELECT FOR UPDATE`](select-for-update.html)
- [Table Expressions](table-expressions.html)
- [Ordering Query Results](order-by.html)
- [Limit Query Results](limit-offset.html)
