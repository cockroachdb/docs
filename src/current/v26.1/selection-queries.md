---
title: Selection Queries
summary: Selection queries can read and process data in CockroachDB.
toc: true
key: selection-clauses.html
docs_area: reference.sql
---

Selection queries read and process data in CockroachDB.  They are more general than [simple `SELECT` clauses]({% link {{ page.version.version }}/select-clause.md %}): they can group one or more [selection clauses](#selection-clauses) with [set operations](#set-operations) and can request a [specific ordering]({% link {{ page.version.version }}/order-by.md %}) or [row limit]({% link {{ page.version.version }}/limit-offset.md %}).

Selection queries can occur:

- At the top level of a query, like other [SQL statements]({% link {{ page.version.version }}/sql-statements.md %}).
- Between parentheses as a [subquery]({% link {{ page.version.version }}/table-expressions.md %}#use-a-subquery).
- As [operand to other statements](#use-selection-queries-with-other-statements) that take tabular data as input, for example [`INSERT`]({% link {{ page.version.version }}/insert.md %}), [`UPSERT`]({% link {{ page.version.version }}/upsert.md %}),  [`CREATE TABLE AS`]({% link {{ page.version.version }}/create-table-as.md %}), or [`ALTER ... SPLIT AT`]({% link {{ page.version.version }}/alter-table.md %}#split-at).


## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/select.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`common_table_expr` | See [Common Table Expressions]({% link {{ page.version.version }}/common-table-expressions.md %}).
`select_clause` | A valid [selection clause](#selection-clauses), either simple or using [set operations](#set-operations).
`sort_clause` | An optional `ORDER BY` clause. See [Ordering Query Results]({% link {{ page.version.version }}/order-by.md %}) for details.
`limit_clause` | An optional `LIMIT` clause. See [Limit Query Results]({% link {{ page.version.version }}/limit-offset.md %}) for details.
`offset_clause` | An optional `OFFSET` clause. See [Limit Query Results]({% link {{ page.version.version }}/limit-offset.md %}) for details.
`for_locking_clause` |  The `FOR UPDATE` and `FOR SHARE` clauses are used to lock `SELECT` statements. For more information, see [`FOR UPDATE` and `FOR SHARE`]({% link {{ page.version.version }}/select-for-update.md %}).

The optional `LIMIT` and `OFFSET` clauses can appear in any order, but if also present, must appear **after** `ORDER BY`.

{{site.data.alerts.callout_info}}Because the <code>WITH</code>, <code>ORDER BY</code>, <code>LIMIT</code>, and <code>OFFSET</code> sub-clauses are all optional, any simple <a href="#selection-clauses">selection clause</a> is also a valid selection query.{{site.data.alerts.end}}

## Selection clauses

A _selection clause_ is the main component of a selection query. A selection clause
defines tabular data. There are four specific syntax forms:

Form | Usage
-----|--------
[`SELECT`](#select-clause) | Load or compute tabular data from various sources. This is the most common selection clause.
[`VALUES`](#values-clause) | List tabular data by the client.
[`TABLE`](#table-clause) | Load tabular data from the database.
[Set operations](#set-operations) | Combine tabular data from two or more selection clauses.

{{site.data.alerts.callout_info}}To perform joins or other relational operations over selection clauses, use a <a href="{% link {{ page.version.version }}/table-expressions.md %}">table expression</a> and <a href="#composability">convert it back</a> into a selection clause with <a href="#table-clause"><code>TABLE</code></a> or <a href="#select-clause"><code>SELECT</code></a>.{{site.data.alerts.end}}

### Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/select_clause.html %}
</div>

### `VALUES` clause

#### Syntax

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/values_clause.html %}
</div>

A `VALUES` clause defines tabular data defined by the expressions
listed within parentheses. Each parenthesis group defines a single row
in the resulting table.

The columns of the resulting table data have automatically generated names. When the `VALUES` clause is used as a [subquery]({% link {{ page.version.version }}/subqueries.md %}),
you can modify these names with [`AS`]({% link {{ page.version.version }}/table-expressions.md %}#aliased-table-expressions).

#### Example

{% include_cached copy-clipboard.html %}
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
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/table_clause.html %}
</div>

A `TABLE` clause reads tabular data from a specified table. The
columns of the resulting table data are named after the schema of the
table.

`TABLE x` is equivalent to `SELECT * FROM x`.

{{site.data.alerts.callout_info}}Any <a href="{% link {{ page.version.version }}/table-expressions.md %}">table expression</a> between parentheses is a valid operand for <code>TABLE</code>, not just <a href="{% link {{ page.version.version }}/table-expressions.md %}#table-and-view-names">simple table or view names</a>.{{site.data.alerts.end}}

#### Example

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE employee_copy AS TABLE employee;
~~~

This statement copies the content from table `employee` into a new
table. However, the `TABLE` clause does not preserve the indexing,
foreign key, or constraint and default information from the schema of the
table it reads from, so in this example, the new table `employee_copy`
will likely have a simpler schema than `employee`.

Other examples:

{% include_cached copy-clipboard.html %}
~~~ sql
> TABLE employee;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO employee_copy TABLE employee;
~~~

### `SELECT` clause

See [Simple `SELECT` Clause]({% link {{ page.version.version }}/select-clause.md %}) for more
details.

## Set operations

Set operations combine data from two [selection
clauses](#selection-clauses). They are valid as operand to other
set operations or as main component in a selection query.

### Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/set_operation.html %}
</div>

### Set operators

SQL lets you compare the results of multiple [selection clauses](#selection-clauses). You can think of each of the set operators as representing a Boolean operator:

- `UNION` = `OR`
- `INTERSECT` = `AND`
- `EXCEPT` = `NOT`

By default, each of these comparisons displays only one copy of each value (similar to `SELECT DISTINCT`). However, to display duplicate values, you can add an `ALL` to the clause.

### `UNION`: Combine two queries

`UNION` combines the results of two queries into one result.

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
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

The following sections provide examples. For more details, see [`ORDER BY`]({% link {{ page.version.version }}/order-by.md %}).

### Order retrieved rows by one column

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
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

For an example, see  [`FOR UPDATE` and `FOR SHARE`]({% link {{ page.version.version }}/select-for-update.md %}).

## Composability

[Selection clauses](#selection-clauses) are defined in the context of selection queries. [Table expressions]({% link {{ page.version.version }}/table-expressions.md %}) are defined in the context of the `FROM` sub-clause of [`SELECT`]({% link {{ page.version.version }}/select-clause.md %}). Nevertheless, you can integrate them with one another to form more complex queries or statements.

### Use a selection clause as a selection query

You can use a [selection clause](#selection-clauses) as a
selection query with no change.

For example, the construct [`SELECT * FROM accounts`]({% link {{ page.version.version }}/select-clause.md %}) is a selection clause. It is also a valid selection query, and thus can be used as a stand-alone statement by appending a semicolon:

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
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

### Use a table expression as selection clause

You can use a [table expression]({% link {{ page.version.version }}/table-expressions.md %}) as a selection clause (and thus also a selection query) by prefixing it with `TABLE` or by using it as an operand to `SELECT * FROM`.

For example, the [simple table name]({% link {{ page.version.version }}/table-expressions.md %}#table-and-view-names) `customers` is a table expression, which designates all rows in that table. The expressions [`TABLE accounts`]({% link {{ page.version.version }}/selection-queries.md %}#table-clause) and [`SELECT * FROM accounts`]({% link {{ page.version.version }}/select-clause.md %}) are valid selection clauses.

Likewise, the [SQL join expression]({% link {{ page.version.version }}/joins.md %}) `customers c JOIN orders o ON c.id = o.customer_id` is a table expression. You can turn it into a valid selection clause, and thus a valid selection query as follows:

{% include_cached copy-clipboard.html %}
~~~ sql
> TABLE (customers c JOIN orders o ON c.id = o.customer_id);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM customers c JOIN orders o ON c.id = o.customer_id;
~~~

### Use a selection query as table expression

You can use a selection query (or [selection clause](#selection-clauses)) as a [table
expression]({% link {{ page.version.version }}/table-expressions.md %}) by enclosing it between parentheses, which forms a
[subquery]({% link {{ page.version.version }}/table-expressions.md %}#use-a-subquery).

For example, the following construct is a selection query, but is not a valid table expression:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM customers ORDER BY name LIMIT 5
~~~

To make it valid as operand to `FROM` or another table expression, you can enclose it between parentheses as follows:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT id FROM (SELECT * FROM customers ORDER BY name LIMIT 5);
~~~

{% include_cached copy-clipboard.html %}
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
 [`INSERT`]({% link {{ page.version.version }}/insert.md %}) | `INSERT INTO foo SELECT * FROM bar` | `INSERT INTO foo VALUES (1), (2), (3)` | `INSERT INTO foo TABLE bar`
 [`UPSERT`]({% link {{ page.version.version }}/upsert.md %}) | `UPSERT INTO foo SELECT * FROM bar` | `UPSERT INTO foo VALUES (1), (2), (3)` | `UPSERT INTO foo TABLE bar`
 [`CREATE TABLE AS`]({% link {{ page.version.version }}/create-table-as.md %}) | `CREATE TABLE foo AS SELECT * FROM bar`  `CREATE TABLE foo AS VALUES (1),(2),(3)` | `CREATE TABLE foo AS TABLE bar`
 [`ALTER ... SPLIT AT`]({% link {{ page.version.version }}/alter-table.md %}#split-at) | `ALTER TABLE foo SPLIT AT SELECT * FROM bar`  `ALTER TABLE foo SPLIT AT VALUES (1),(2),(3)` | `ALTER TABLE foo SPLIT AT TABLE bar`
 Subquery in a [table expression]({% link {{ page.version.version }}/table-expressions.md %}) | `SELECT * FROM (SELECT * FROM bar)` | `SELECT * FROM (VALUES (1),(2),(3))` | `SELECT * FROM (TABLE bar)`
 Subquery in a [scalar expression]({% link {{ page.version.version }}/scalar-expressions.md %}) | `SELECT * FROM foo WHERE x IN (SELECT * FROM bar)` | `SELECT * FROM foo WHERE x IN (VALUES (1),(2),(3))` | `SELECT * FROM foo WHERE x IN (TABLE bar)`

## See also

- [Simple `SELECT` Clause]({% link {{ page.version.version }}/select-clause.md %})
- [`SELECT FOR UPDATE`]({% link {{ page.version.version }}/select-for-update.md %})
- [Table Expressions]({% link {{ page.version.version }}/table-expressions.md %})
- [Ordering Query Results]({% link {{ page.version.version }}/order-by.md %})
- [Limit Query Results]({% link {{ page.version.version }}/limit-offset.md %})
