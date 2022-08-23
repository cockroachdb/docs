---
title: Join Expressions
summary: Join expressions combine data from two or more table expressions.
toc: true
---

Join expressions, also called "joins", combine the results of two or
more table expressions based on conditions on the values of particular columns.

Join expressions define a data source in the `FROM` sub-clause of [simple `SELECT` clauses](select-clause.html), or as parameter to [`TABLE`](selection-queries.html#table-clause). Joins are a particular kind of [table expression](table-expressions.html).


## Synopsis

<div class="horizontal-scroll">
  {% include {{ page.version.version }}/sql/diagrams/joined_table.html %}
</div>

<div markdown="1"></div>

## Parameters

Parameter | Description
----------|------------
`joined_table` | Another join expression.
`table_ref` | A [table expression](table-expressions.html).
`a_expr` | A [scalar expression](scalar-expressions.html) to use as [`ON` join condition](#supported-join-conditions).
`name` | A column name to use as [`USING` join condition](#supported-join-conditions)

## Supported Join Types

CockroachDB supports the following uses of `JOIN`.

### Inner Joins

Only the rows from the left and right operand that match the condition are returned.

~~~
<table expr> [ INNER ] JOIN <table expr> ON <val expr>
<table expr> [ INNER ] JOIN <table expr> USING(<colname>, <colname>, ...)
<table expr> NATURAL [ INNER ] JOIN <table expr>
<table expr> CROSS JOIN <table expr>
~~~

### Left Outer Joins

For every left row where there is no match on the right, `NULL` values are returned for the columns on the right.

~~~
<table expr> LEFT [ OUTER ] JOIN <table expr> ON <val expr>
<table expr> LEFT [ OUTER ] JOIN <table expr> USING(<colname>, <colname>, ...)
<table expr> NATURAL LEFT [ OUTER ] JOIN <table expr>
~~~

### Right Outer Joins

For every right row where there is no match on the left, `NULL` values are returned for the columns on the left.

~~~
<table expr> RIGHT [ OUTER ] JOIN <table expr> ON <val expr>
<table expr> RIGHT [ OUTER ] JOIN <table expr> USING(<colname>, <colname>, ...)
<table expr> NATURAL RIGHT [ OUTER ] JOIN <table expr>
~~~

### Full Outer Joins

For every row on one side of the join where there is no match on the other side, `NULL` values are returned for the columns on the non-matching side.

~~~
<table expr> FULL [ OUTER ] JOIN <table expr> ON <val expr>
<table expr> FULL [ OUTER ] JOIN <table expr> USING(<colname>, <colname>, ...)
<table expr> NATURAL FULL [ OUTER ] JOIN <table expr>
~~~

## Supported Join Conditions

CockroachDB supports the following conditions to match rows in a join:

- No condition with `CROSS JOIN`: each row on the left is considered
  to match every row on the right.
- `ON` predicates: a Boolean [scalar expression](scalar-expressions.html)
  is evaluated to determine whether the operand rows match.
- `USING`: the named columns are compared pairwise from the left and
  right rows; left and right rows are considered to match if the
  columns are equal pairwise.
- `NATURAL`: generates an implicit `USING` condition using all the
  column names that are present in both the left and right table
  expressions.

{{site.data.alerts.callout_danger}}<code>NATURAL</code> is supported for
compatibility with PostgreSQL; its use in new applications is
discouraged, because its results can silently change in unpredictable
ways when new columns are added to one of the join
operands.{{site.data.alerts.end}}


## Performance Best Practices

{{site.data.alerts.callout_info}}CockroachDBs is currently undergoing major changes to evolve and improve the performance of queries using joins. The restrictions and workarounds listed in this section will be lifted or made unnecessary over time.{{site.data.alerts.end}}

- Joins over [interleaved tables](interleave-in-parent.html) are usually (but not always) processed more effectively than over non-interleaved tables.

- When no indexes can be used to satisfy a join, CockroachDB may load all the rows in memory that satisfy the condition one of the join operands before starting to return result rows. This may cause joins to fail if the join condition or other `WHERE` clauses are insufficiently selective.

- Outer joins are generally processed less efficiently than inner joins. Prefer using inner joins whenever possible. Full outer joins are the least optimized.

- Use [`EXPLAIN`](explain.html) over queries containing joins to verify that indexes are used.

- See [Index Best Practices](performance-best-practices-overview.html#indexes-best-practices).

## See Also

- [Scalar Expressions](scalar-expressions.html)
- [Table Expressions](table-expressions.html)
- [Simple `SELECT` Clause](select-clause.html)
- [Selection Queries](selection-queries.html)
- [`EXPLAIN`](explain.html)
- [Performance Best Practices - Overview](performance-best-practices-overview.html)
- [SQL join operation (Wikipedia)](https://en.wikipedia.org/wiki/Join_(SQL))
- [CockroachDB's first implementation of SQL joins (CockroachDB Blog)](https://www.cockroachlabs.com/blog/cockroachdbs-first-join/)
- [On the Way to Better SQL Joins in CockroachDB (CockroachDB Blog)](https://www.cockroachlabs.com/blog/better-sql-joins-in-cockroachdb/)
