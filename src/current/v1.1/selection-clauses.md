---
title: SELECT Clauses
summary: SELECT clauses define tabular data.
toc: true
toc_not_nested: true
---

`SELECT` clauses define tabular data. They can be used either as standalone statements, of which [`SELECT`](select.html) is the most common, or as [subqueries in table expressions](table-expressions.html#subqueries-as-table-expressions).


## Overview

SQL is fundamentally about manipulating tabular data, and `SELECT` clauses are the primary way to obtain tabular data for manipulation.

There are three specific syntax forms collectively named `SELECT` clauses:

Form | Usage
-----|--------
[`VALUES`](#values-clause) | List tabular data by the client.
[`TABLE`](#table-clause) | Load tabular data from the database.
[`SELECT`](#select-clause) | Load or compute tabular data from various sources.

`SELECT` clauses appear in every statement that takes tabular data as input, for example:

- As operand to [`INSERT`](insert.html), [`UPSERT`](upsert.html) and
  [`CREATE TABLE AS`](create-table-as.html) statements.
- As [sub-queries in table expressions](table-expressions.html#subqueries-as-table-expressions).

## Possible Combinations

| Statement | Example using `SELECT` | Example using `VALUES` | Example using `TABLE` |
|----------------|-----------------------------------|------------------------------------|-------------------------------|
| `INSERT` | `INSERT INTO foo SELECT * FROM bar` | `INSERT INTO foo VALUES (1), (2), (3)` | `INSERT INTO foo TABLE bar`
| `UPSERT` | `UPSERT INTO foo SELECT * FROM bar` | `UPSERT INTO foo VALUES (1), (2), (3)` | `UPSERT INTO foo TABLE bar`
| `CREATE TABLE AS` | `CREATE TABLE foo AS SELECT * FROM bar` | `CREATE TABLE foo AS VALUES (1),(2),(3)` | `CREATE TABLE foo AS TABLE bar`
| `SELECT` | `SELECT * FROM (SELECT * FROM bar)` | `SELECT * FROM (VALUES (1),(2),(3))` | `SELECT * FROM (TABLE bar)`
| Expression subquery | `SELECT * FROM foo WHERE x IN (SELECT * FROM bar)` | `SELECT * FROM foo WHERE x IN (VALUES (1),(2),(3))` | `SELECT * FROM foo WHERE x IN (TABLE bar)`

## `VALUES` Clause

### Syntax

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

### Example

{% include_cached copy-clipboard.html %}
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

## `TABLE` Clause

### Syntax

~~~sql
TABLE <tablename>
~~~

A `TABLE` clause reads tabular data from a specified table. The
columns of the resulting table data are named after the schema of the
table.

In general, `TABLE x` is equivalent to `SELECT * FROM x`, but it is
shorter to type.

### Example

{% include_cached copy-clipboard.html %}
~~~sql
> CREATE TABLE employee_copy AS TABLE employee;
~~~

This statement copies the content from table `employee` into a new
table. However, note that the `TABLE` clause does not preserve the indexing,
foreign key, or constraint and default information from the schema of the
table it reads from, so in this example, the new table `employee_copy`
will likely have a simpler schema than `employee`.

Other examples:

{% include_cached copy-clipboard.html %}
~~~sql
> TABLE employee;
~~~

{% include_cached copy-clipboard.html %}
~~~sql
> INSERT INTO employee_copy TABLE employee;
~~~

## `SELECT` Clause

The `SELECT` clause is documented separately as the stand-alone [`SELECT` statement](select.html), which is its most common use in SQL. However, it's important to note the broader application of `SELECT` clauses, which can be used alongside the other two selection clause forms everywhere such a clause is admissible.

## See Also

- [Table Expressions](table-expressions.html)
- [`SELECT`](select.html)
