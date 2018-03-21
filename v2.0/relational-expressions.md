---
title: Relational Expressions
summary: Relational expressions combine or modify tabular data from one or more data sources.
toc: false
---

Relational expressions combine or modify tabular data. They enable more complex data queries than [simple `SELECT` clauses](select-clause.html).

<div id="toc"></div>

## Overview

CockroachDB supports three flavors of relational expressions.

- [Statement-like Queries](#statement-like-queries), which can occur:
  - At the top-level of a query, where they appear like stand-alone [SQL statements](sql-statements.html). 
  - Between parentheses, as a [subquery in a table expression](table-expressions.html#subqueries-as-table-expressions) or in a [scalar expression](scalar-expressions.html).
  - As [operand to other statements](#using-statement-like-queries-with-other-statements) that take tabular data as input.

- [Selection clauses](selection-clauses.html), including the [simple `SELECT` clause](select-clause.html), which can occur:
  - As operand to a [statement-like query](#statement-like-queries).
  - Combined with other selection clauses using [set operations](set-operations.html).

- [Table expressions](table-expressions.html), including [joins](joins.html), which can occur:
  - As operand to the `FROM` sub-clause of a [simple `SELECT` clause](select-clause.html).
  - As operand to the [`TABLE` selection clause](selection-clauses.html#table-clause).
  - As operand to other [table expressions](table-expressions.html) to perform SQL [joins](joins.html) and other relational operations.

## Statement-Like Queries

Statement-like queries can appear:

- At the top level of a query like other [SQL statements](sql-statements.html).
- Between parentheses as a [subquery](table-expressions.html#subqueries-as-table-expressions).
- As [operand to other statements](#using-statement-like-queries-with-other-statements) that take tabular data as input, for example [`INSERT`](insert.html), [`UPSERT`](upsert.html),  [`CREATE TABLE AS`](create-table-as.html) or [`ALTER ... SPLIT AT`](split-at.html).

Any [selection clause](selection-clauses.html) is a valid statement-like query, including the [simple `SELECT` Clause](select-clause.html) but also [`TABLE`](selection-clauses.html#table-clause), [`VALUES`](selection-clauses.html#values-clause) and [set operations](set-operations.html). See [Composability](#composability) below for details.

### Synopsis

{% include sql/{{ page.version.version }}/diagrams/select.html %}

### Parameters

Parameter | Description
----------|------------
`common_table_expr` | See [Common Table Expressions](common-table-expressions.html).
`select_clause` | A valid [selection clause](selection-clauses.html).
`sort_clause` | An optional `ORDER BY` clause. See [Ordering Query Results](query-order.html) for details.
`limit_clause` | An optional `LIMIT` clause. See [Limiting Query Results](limit-offset.html) for details.
`offset_clause` | An optional `OFFSET` clause. See [Limiting Query Results](limit-offset.html) for details.

The optional `LIMIT` and `OFFSET` clauses can appear in any order, but must appear after `ORDER BY`, if also present.

### Ordering Results

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

### Limiting Row Count and Pagination

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

## Composability

Despite the separation in three groups, relational expressions in each group can be used in any of the other groups using simple rules.

### Using Any Selection Clause as a Statement-Like Query

Any [selection clause](selection-clauses.html) can be used as a statement-like query with no change.

For example, the construct [`SELECT * FROM accounts`](select-clause.html) is a selection clause. It is also a valid statement-like query, and thus can be used as a stand-alone statement by appending a semicolon:

~~~sql
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

Likewise, the construct [`VALUES (1), (2), (3)`](selection-clauses.html#values-clause) is also a selection
clause and thus can also be used as a statement-like query:

~~~sql
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

### Using Any Table Expression as Selection Clause

Any [table expression](table-expressions.html) can be used as a selection clause (and thus also a statement-like query) by prefixing it with `TABLE` or by using it as an operand to `SELECT * FROM`.

For example, the [simple table name](table-expressions.html#table-or-view-names) `customers` is a table expression, which designates all rows in that table. The expressions [`TABLE accounts`](selection-clauses.html#table-clause) and [`SELECT * FROM accounts`](select-clause.html) are valid selection clauses.

Likewise, the [SQL join expression](joins.html) `customers c JOIN orders o ON c.id = o.customer_id` is a table expression. You can turn it into a valid selection clause, and thus a valid statement-like query as follows:

~~~sql
> TABLE (customers c JOIN orders o ON c.id = o.customer_id);
> SELECT * FROM customers c JOIN orders o ON c.id = o.customer_id;
~~~

### Using Any Statement-like Query as Table Expression

Any statement-like query or [selection clause](selection-clauses.html) can be used as a [table
expression](table-expressions.html) by enclosing it between parentheses, which forms a
[subquery](table-expressions.html#subqueries-as-table-expressions).

For example, the following construct is a statement-like query, but is not a valid table expression:

~~~sql
> SELECT * FROM customers ORDER BY name LIMIT 5
~~~

To make it valid as operand to `FROM` or another table expression, you can enclose it between parentheses as follows:

~~~sql
> SELECT id FROM (SELECT * FROM customers ORDER BY name LIMIT 5);
> SELECT o.id
    FROM orders o
    JOIN (SELECT * FROM customers ORDER BY name LIMIT 5) AS c
	  ON o.customer_id = c.id;
~~~

### Using Statement-like Queries With Other Statements

Statement-like queries are also valid as operand in contexts that require tabular data.

For example:

| Statement | Example using `SELECT` | Example using `VALUES` | Example using `TABLE` |
|----------------|-----------------------------------|------------------------------------|-------------------------------|
| [`INSERT`](insert.html) | `INSERT INTO foo SELECT * FROM bar` | `INSERT INTO foo VALUES (1), (2), (3)` | `INSERT INTO foo TABLE bar`
| [`UPSERT`](upsert.html) | `UPSERT INTO foo SELECT * FROM bar` | `UPSERT INTO foo VALUES (1), (2), (3)` | `UPSERT INTO foo TABLE bar`
| [`CREATE TABLE AS`](create-table-as.html) | `CREATE TABLE foo AS SELECT * FROM bar` | `CREATE TABLE foo AS VALUES (1),(2),(3)` | `CREATE TABLE foo AS TABLE bar`
| [`ALTER ... SPLIT AT`](split-at.html) | `ALTER TABLE foo SPLIT AT SELECT * FROM bar` | `ALTER TABLE foo SPLIT AT VALUES (1),(2),(3)` | `ALTER TABLE foo SPLIT AT TABLE bar`
| Subquery in a [table expression](table-expressions.html) | `SELECT * FROM (SELECT * FROM bar)` | `SELECT * FROM (VALUES (1),(2),(3))` | `SELECT * FROM (TABLE bar)`
| Subquery in a [scalar expression](scalar-expressions.html) | `SELECT * FROM foo WHERE x IN (SELECT * FROM bar)` | `SELECT * FROM foo WHERE x IN (VALUES (1),(2),(3))` | `SELECT * FROM foo WHERE x IN (TABLE bar)`

## See Also

- [Simple `SELECT` Clause](select-clause.html)
- [Selection Clauses](selection-clauses.html)
- [Table Expressions](table-expressions.html)
- [Ordering Query Results](query-order.html)
- [Limiting Query Results](limit-offset.html)
