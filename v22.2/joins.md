---
title: JOIN expressions
summary: JOIN expressions combine data from two or more table expressions.
toc: true
keywords: gin, gin index, gin indexes, inverted index, inverted indexes, accelerated index, accelerated indexes
docs_area: reference.sql
---

A `JOIN` expression, also called a _join_, combines the results of two or more [table expressions](table-expressions.html) based on conditions on the values of particular columns (such as equality conditions). A join is a particular kind of table expression.

A `JOIN` expression defines a data source in the `FROM` sub-clause of a [`SELECT` clause](select-clause.html) or as parameter to a [`TABLE` clause](selection-queries.html#table-clause).

{{site.data.alerts.callout_success}}
The [cost-based optimizer](cost-based-optimizer.html) supports hint syntax to force the use of a specific join algorithm.  For more information, see [Join hints](cost-based-optimizer.html#join-hints).
{{site.data.alerts.end}}

## Synopsis

<div>{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/joined_table.html %}</div>

## Parameters

Parameter | Description
----------|------------
`joined_table` | A join expression.
`table_ref` | A [table expression](table-expressions.html).
`opt_join_hint` | A [join hint](cost-based-optimizer.html#join-hints).
`a_expr` | A [scalar expression](scalar-expressions.html) to use as an [`ON` join condition](#supported-join-conditions).
`name` | A column name to use as a [`USING` join condition](#supported-join-conditions).

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

    <div>{{site.data.alerts.callout_info}}<code>NATURAL</code> is supported for compatibility with PostgreSQL; Cockroach Labs discourages use in new applications because its results can silently change in unpredictable ways when new columns are added to one of the join operands.{{site.data.alerts.end}}</div>

## Join algorithms

CockroachDB supports the following algorithms for performing a join:

- [Merge joins](#merge-joins)
- [Hash joins](#hash-joins)
- [Lookup joins](#lookup-joins)
- [Inverted joins](#inverted-joins)

### Merge joins

To perform a [merge join](https://en.wikipedia.org/wiki/Sort-merge_join) of two tables, both tables must be indexed on the equality columns, and any indexes must have the same ordering. Merge joins offer better computational performance and more efficient memory usage than [hash joins](#hash-joins). When tables and indexes are ordered for a merge, CockroachDB chooses to use merge joins over hash joins, by default. When merge conditions are not met, CockroachDB resorts to the slower hash joins. Merge joins can be used only with [distributed query processing](https://www.cockroachlabs.com/blog/local-and-distributed-processing-in-cockroachdb/).

Merge joins are performed on the indexed columns of two tables as follows:

1. CockroachDB checks for indexes on the equality columns and that they are ordered the same (i.e., `ASC` or `DESC`).
1. CockroachDB takes one row from each table and compares them.
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
1. CockroachDB creates an in-memory [hash table](https://en.wikipedia.org/wiki/Hash_table) on the smaller table. If the hash table is too large, it will spill over to disk storage (which could affect performance).
1. CockroachDB then scans the large table, looking up each row in the hash table.

### Lookup joins

The [cost-based optimizer](cost-based-optimizer.html) decides when it would be beneficial to use a lookup join. Lookup joins are used when there is a large imbalance in size between the two tables, as it only reads the smaller table and then looks up matches in the larger table. A lookup join requires that the right-hand (i.e., larger) table be indexed on the columns involved in the join condition. A [partial index](partial-indexes.html) can only be used if it contains the subset of rows being looked up.

Lookup joins are performed on two tables as follows:

1. CockroachDB reads each row in the small table.
1. CockroachDB then scans (or "looks up") the larger table for matches to the smaller table and outputs the matching rows.

The optimizer imposes some restrictions on the usage of inequalities in lookup join conditions:

1. If the lookup condition contains no equalities (i.e., is composed only of an inequality), either the input of the join must return only one row or the join must have a `LOOKUP` [hint](cost-based-optimizer.html#join-hints). This prevents poor performance of the current lookup join implementation.
1. If the index column is `DESC` and the inequality is of the form `idxCol < inputCol` or equivalently `inputCol > idxCol`, the column type must be countable in order to support retrieving the immediate previous value. This allows types like [`BOOL`](bool.html), [`FLOAT`](float.html), and [`INT`](int.html), but disallows types like [`STRING`](string.html) or [`BYTES`](bytes.html).

You can override the use of lookup joins using [join hints](cost-based-optimizer.html#join-hints).

{{site.data.alerts.callout_info}}
To make the optimizer prefer lookup joins to merge joins when performing foreign key checks, set the `prefer_lookup_joins_for_fks` [session variable](set-vars.html) to `on`.
{{site.data.alerts.end}}

The output of [`EXPLAIN (VERBOSE)`](explain.html#verbose-option) shows whether `equality cols are key` for lookup joins, which means that the lookup columns form a key in the target table such that each lookup has at most one result.

### Inverted joins

 Inverted joins force the optimizer to use a join using a [GIN index](inverted-indexes.html) on the right side of the join. Inverted joins can only be used with `INNER` and `LEFT` joins.

~~~
<table expr> INNER INVERTED JOIN <table expr> ON <val expr>
<table expr> LEFT INVERTED JOIN <table expr> ON <val expr>
~~~

See the [cost-based optimizer examples](cost-based-optimizer.html#inverted-join-examples) for statements that use inverted joins.

## `LATERAL` joins

CockroachDB supports `LATERAL` subquery joins for `INNER` and `LEFT` cross joins. For more information about `LATERAL` subqueries, see [Lateral subqueries](subqueries.html#lateral-subqueries).

## Apply joins

Apply join is the operator that executes a lateral join if the optimizer is not able to de-correlate it (i.e., rewrite the query to use a regular join). Most of the time, the optimizer can de-correlate most queries. However, there are some cases where the optimizer cannot perform this rewrite, and `apply-join` would show up in the [`EXPLAIN`](explain.html#join-queries) output for the query. The optimizer also replaces correlated subqueries with apply joins, and therefore `apply-join` may appear in the `EXPLAIN` output even if `LATERAL` was not used.

Apply joins are inefficient because they must be executed one row at a time. The left side row must be used to construct the right side row, and only then can the execution engine determine if the two rows should be output by the join. This corresponds to an `O(n*m)` time complexity.

Other types of joins supported by CockroachDB (e.g., [hash join](#hash-joins), [merge join](#merge-joins), and [lookup join](#lookup-joins)) are generally much more efficient. For example, with a hash join, a hash table is constructed using rows from the smaller side of the join, and then the larger side of the join is used to probe into the hash table using the `ON` conditions of the join. This corresponds to an `O(n+m)` time complexity.

If you see an `apply-join`, it means the optimizer was not able to perform de-correlation, and you should probably try to rewrite your query in a different way in order to get better performance.

## Performance best practices

- When no indexes can be used to satisfy a join, CockroachDB may load all the rows in memory that satisfy the condition one of the join operands before starting to return result rows. This may cause joins to fail if the join condition or other `WHERE` clauses are insufficiently selective.
- Outer joins (i.e., [left outer joins](#left-outer-joins), [right outer joins](#right-outer-joins), and [full outer joins](#full-outer-joins)) are generally processed less efficiently than [inner joins](#inner-joins). Use inner joins whenever possible. Full outer joins are the least optimized.
- Use [`EXPLAIN`](explain.html) over queries containing joins to verify that indexes are used.
- Use [indexes](indexes.html) for faster joins.

## See also

- [Join hints](cost-based-optimizer.html#join-hints)
- [Scalar Expressions](scalar-expressions.html)
- [Table Expressions](table-expressions.html)
- [Simple `SELECT` Clause](select-clause.html)
- [Selection Queries](selection-queries.html)
- [`EXPLAIN`](explain.html)
- [SQL Performance Best Practices](performance-best-practices-overview.html)
- [SQL join operation (Wikipedia)](https://en.wikipedia.org/wiki/Join_(SQL))
- [Modesty in Simplicity: CockroachDB's JOIN (CockroachDB Blog)](https://www.cockroachlabs.com/blog/cockroachdbs-first-join/)
- [On the Way to Better SQL Joins in CockroachDB (CockroachDB Blog)](https://www.cockroachlabs.com/blog/better-sql-joins-in-cockroachdb/)
