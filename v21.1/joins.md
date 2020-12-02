---
title: Join Expressions
summary: Join expressions combine data from two or more table expressions.
toc: true
---

Join expressions, also called "joins", combine the results of two or more table expressions based on conditions on the values of particular columns (i.e., equality columns).

Join expressions define a data source in the `FROM` sub-clause of [simple `SELECT` clauses](select-clause.html), or as parameter to [`TABLE`](selection-queries.html#table-clause). Joins are a particular kind of [table expression](table-expressions.html).

{{site.data.alerts.callout_success}}
The [cost-based optimizer](cost-based-optimizer.html) supports hint syntax to force the use of a specific join algorithm.  For more information, see [Join hints](cost-based-optimizer.html#join-hints).
{{site.data.alerts.end}}

## Synopsis

<div>{% include {{ page.version.version }}/sql/diagrams/joined_table.html %}</div>

<div markdown="1"></div>

## Parameters

Parameter | Description
----------|------------
`joined_table` | Another join expression.
`table_ref` | A [table expression](table-expressions.html).
`a_expr` | A [scalar expression](scalar-expressions.html) to use as [`ON` join condition](#supported-join-conditions).
`name` | A column name to use as [`USING` join condition](#supported-join-conditions)

## Supported join types

CockroachDB supports the following join types:

- [Inner joins](#inner-joins)
- [Left outer joins](#left-outer-joins)
- [Right outer joins](#right-outer-joins)
- [Full outer joins](#full-outer-joins)

### Inner joins

Only the rows from the left and right operand that match the condition are returned.

~~~
<table expr> [ INNER ] JOIN <table expr> ON <val expr>
<table expr> [ INNER ] JOIN <table expr> USING(<colname>, <colname>, ...)
<table expr> NATURAL [ INNER ] JOIN <table expr>
<table expr> CROSS JOIN <table expr>
~~~

### Left outer joins

For every left row where there is no match on the right, `NULL` values are returned for the columns on the right.

~~~
<table expr> LEFT [ OUTER ] JOIN <table expr> ON <val expr>
<table expr> LEFT [ OUTER ] JOIN <table expr> USING(<colname>, <colname>, ...)
<table expr> NATURAL LEFT [ OUTER ] JOIN <table expr>
~~~

### Right outer joins

For every right row where there is no match on the left, `NULL` values are returned for the columns on the left.

~~~
<table expr> RIGHT [ OUTER ] JOIN <table expr> ON <val expr>
<table expr> RIGHT [ OUTER ] JOIN <table expr> USING(<colname>, <colname>, ...)
<table expr> NATURAL RIGHT [ OUTER ] JOIN <table expr>
~~~

### Full outer joins

For every row on one side of the join where there is no match on the other side, `NULL` values are returned for the columns on the non-matching side.

~~~
<table expr> FULL [ OUTER ] JOIN <table expr> ON <val expr>
<table expr> FULL [ OUTER ] JOIN <table expr> USING(<colname>, <colname>, ...)
<table expr> NATURAL FULL [ OUTER ] JOIN <table expr>
~~~

## Supported join conditions

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

<section>{{site.data.alerts.callout_danger}}<code>NATURAL</code> is supported for compatibility with PostgreSQL; its use in new applications is discouraged because its results can silently change in unpredictable ways when new columns are added to one of the join operands.{{site.data.alerts.end}}</section>

## Join algorithms

CockroachDB supports the following algorithms for performing a join:

- [Merge joins](#merge-joins)
- [Hash joins](#hash-joins)
- [Lookup joins](#lookup-joins)

### Merge joins

To perform a [merge join](https://en.wikipedia.org/wiki/Sort-merge_join) of two tables, both tables must be indexed on the equality columns, and any indexes must have the same ordering. Merge joins offer better computational performance and more efficient memory usage than [hash joins](#hash-joins). When tables and indexes are ordered for a merge, CockroachDB chooses to use merge joins over hash joins, by default. When merge conditions are not met, CockroachDB resorts to the slower hash joins. Merge joins can be used only with [distributed query processing](https://www.cockroachlabs.com/blog/local-and-distributed-processing-in-cockroachdb/).

Merge joins are performed on the indexed columns of two tables as follows:

1. CockroachDB checks for indexes on the equality columns and that they are ordered the same (i.e., `ASC` or `DESC`).
2. CockroachDB takes one row from each table and compares them.  
    - For inner joins:  
        - If the rows are equal, CockroachDB returns the rows.
        - If there are multiple matches, the cartesian product of the matches is returned.
        - If the rows are not equal, CockroachDB discards the lower-value row and repeats the process with the next row until all rows are processed.
    - For outer joins:
        - If the rows are equal, CockroachDB returns the rows.
        - If there are multiple matches, the cartesian product of the matches is returned.
        - If the rows are not equal, CockroachDB returns `NULL` for the non-matching column and repeats the process with the next row until all rows are processed.

### Hash joins

If a merge join cannot be used, CockroachDB uses a [hash join](https://en.wikipedia.org/wiki/Hash_join). Hash joins are computationally expensive and require additional memory.

Hash joins are performed on two tables as follows:

1. CockroachDB reads both tables and attempts to pick the smaller table.
2. CockroachDB creates an in-memory [hash table](https://en.wikipedia.org/wiki/Hash_table) on the smaller table. If the hash table is too large, it will spill over to disk storage (which could affect performance).
3. CockroachDB then scans the large table, looking up each row in the hash table.

### Lookup joins

The [cost-based optimizer](cost-based-optimizer.html) decides when it would be beneficial to use a lookup join. Lookup joins are used when there is a large imbalance in size between the two tables, as it only reads the smaller table and then looks up matches in the larger table. A lookup join requires that the right-hand (i.e., larger) table be indexed on the equality column. A [partial index](partial-indexes.html) can only be used if it contains the subset of rows being looked up.

Lookup joins are performed on two tables as follows:

1. CockroachDB reads each row in the small table.
2. CockroachDB then scans (or "looks up") the larger table for matches to the smaller table and outputs the matching rows.

You can override the use of lookup joins using [join hints](cost-based-optimizer.html#join-hints).

{{site.data.alerts.callout_info}}
With queries on [interleaved tables](interleave-in-parent.html), the [optimizer](cost-based-optimizer.html) might choose to use a merge join to perform a [foreign key](foreign-key.html) check when a lookup join would be more optimal.

 To make the optimizer prefer lookup joins to merge joins when performing foreign key checks, set the `prefer_lookup_joins_for_fks` [session variable](set-vars.html) to `on`.
{{site.data.alerts.end}}

The output of [`EXPLAIN (VERBOSE)`](explain.html#verbose-option) shows whether `equality cols are key` for lookup joins, which means that the lookup columns form a key in the target table such that each lookup has at most one result.

## `LATERAL` joins

CockroachDB supports `LATERAL` subquery joins for `INNER` and `LEFT` cross joins. For more information about `LATERAL` subqueries, see [Lateral subqueries](subqueries.html#lateral-subqueries).

## Performance best practices

{{site.data.alerts.callout_info}}CockroachDBs is currently undergoing major changes to evolve and improve the performance of queries using joins. The restrictions and workarounds listed in this section will be lifted or made unnecessary over time.{{site.data.alerts.end}}

- Joins over [interleaved tables](interleave-in-parent.html) are usually (but not always) processed more effectively than over non-interleaved tables.
- When no indexes can be used to satisfy a join, CockroachDB may load all the rows in memory that satisfy the condition one of the join operands before starting to return result rows. This may cause joins to fail if the join condition or other `WHERE` clauses are insufficiently selective.
- Outer joins (i.e., [left outer joins](#left-outer-joins), [right outer joins](#right-outer-joins), and [full outer joins](#full-outer-joins)) are generally processed less efficiently than [inner joins](#inner-joins). Use inner joins whenever possible. Full outer joins are the least optimized.
- Use [`EXPLAIN`](explain.html) over queries containing joins to verify that indexes are used.
- Use [indexes](indexes.html) for faster joins.

## See also

- [Cost-based Optimizer: Join Hints](cost-based-optimizer.html#join-hints)
- [Scalar Expressions](scalar-expressions.html)
- [Table Expressions](table-expressions.html)
- [Simple `SELECT` Clause](select-clause.html)
- [Selection Queries](selection-queries.html)
- [`EXPLAIN`](explain.html)
- [Performance Best Practices - Overview](performance-best-practices-overview.html)
- [SQL join operation (Wikipedia)](https://en.wikipedia.org/wiki/Join_(SQL))
- [CockroachDB's first implementation of SQL joins (CockroachDB Blog)](https://www.cockroachlabs.com/blog/cockroachdbs-first-join/)
- [On the Way to Better SQL Joins in CockrochDB (CockroachDB Blog)](https://www.cockroachlabs.com/blog/better-sql-joins-in-cockroachdb/)
