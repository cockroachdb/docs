---
title: SELECT clauses
summary: SELECT clauses define tabular data.
toc: false
---

SELECT clauses define tabular data.  They can either be used as
standalone statements, of which [`SELECT`](select.html) is the most
common, or as [sub-query in a table
expression](table-expressions.html#subqueries-as-table-expressions).

## Introduction

SQL is really about manipulating tabular data, and there are
fundamentally just 3 ways to obtain tabular data anywhere where it is
manipulated by other statements:

- list it by the client: [`VALUES`](#values),
- load it from the database [`TABLE`](#table),
- compute it from other things: [`SELECT`](#select).

The three specific syntax forms `VALUES`, `TABLE` and `SELECT` are
collectively named "SELECT clauses".

SELECT clauses appear in every statement that takes tabular data as input:

- as operand to [`INSERT`](insert.html), [`UPSERT`](upsert.html) and
  [`CREATE TABLE AS`](create-table-as.html) statements.
- as [a sub-query in table expressions](#subqueries-as-table-expressions).

## Overview of Possible Combinations

| Statement | Example using SELECT | Example using VALUES | Example using TABLE |
|----------------|-----------------------------------|------------------------------------|-------------------------------|
| INSERT | `INSERT INTO foo SELECT * FROM bar` | `INSERT INTO foo VALUES (1), (2), (3)` | `INSERT INTO foo TABLE bar`
| UPSERT | `UPSERT INTO foo SELECT * FROM bar` | `UPSERT INTO foo VALUES (1), (2), (3)` | `UPSERT INTO foo TABLE bar`
| CREATE TABLE AS | `CREATE TABLE foo AS SELECT * FROM bar` | `CREATE TABLE foo AS VALUES (1),(2),(3)` | `CREATE TABLE foo AS TABLE bar`
| SELECT | `SELECT * FROM (SELECT * FROM bar)` | `SELECT * FROM (VALUES (1),(2),(3))` | `SELECT * FROM (TABLE bar)`
| Expression subquery | `SELECT * FROM foo WHERE x IN (SELECT * FROM bar)` | `SELECT * FROM foo WHERE x IN (VALUES (1),(2),(3))` | `SELECT * FROM foo WHERE x IN (TABLE bar)`

## `VALUES`

Syntax:

~~~sql
VALUES (<expr>, <expr>, ...), (<expr>, <expr>, ...), ...
~~~

A `VALUES` clause defines tabular data defined by the expressions
listed within parentheses. Each parenthesis group defines a single row
in the resulting table.

The columns of the resulting table data have automatically generated
names. [These names can be modified with
`AS`](table-expressions.html#aliased-table-expressions) when the
`VALUES` clause is used as a sub-query.

For example:

~~~sql
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

## `TABLE`

Syntax:

~~~sql
TABLE <tablename>
~~~

A `TABLE` clause reads tabular data from the given named table.  The
columns of the resulting table data are named after the schema of the
table.

In general, `TABLE x` is equivalent to `SELECT * FROM x` but it is
shorter to type.

For example:

~~~sql
> CREATE TABLE employee_copy AS TABLE employee;
~~~

This statement copies the content from table `employee` into a new
table. Note that the `TABLE` clause does not preserve the indexing,
foreign key, constraint and default information from the schema of the
table it reads from, so in this example the new table `employee_copy`
will likely have a simpler schema than `employee`.

Other examples:

~~~sql
> TABLE employee;
> INSERT INTO employee_copy TABLE employee;
~~~

## `SELECT`

The `SELECT` form of SELECT clauses is documented separately as the
[`SELECT` statement](select.html). We document it as standalone
statement because this is its most common use in SQL; however, its
true nature is a SELECT clause and can be used alongside the other two
SELECT clauses everywhere such a clause is admissible.

## See Also

- [Table Expressions](table-expressions.html)
- [`SELECT`](select.html)
