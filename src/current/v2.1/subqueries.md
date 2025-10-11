---
title: Subqueries
summary: Subqueries enable the use of the results from a query within another query.
toc: true
---

SQL subqueries enable reuse of the results from a [selection query](selection-queries.html) within another query.


## Overview

CockroachDB supports two kinds of subqueries:

- **Relational** subqueries which appear as operand in [selection queries](selection-queries.html) or [table expressions](table-expressions.html).
- **Scalar** subqueries which appear as operand in a [scalar expression](scalar-expressions.html).

## Data writes in subqueries

When a subquery contains a data-modifying statement (`INSERT`,
`DELETE`, etc.), the data modification is always executed to
completion even if the surrounding query only uses a subset of the
result rows.

This is true both for subqueries defined using the `(...)` or `[...]`
notations, and those defined using
[`WITH`](common-table-expressions.html).

For example:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT *
   FROM [INSERT INTO t(x) VALUES (1), (2), (3) RETURNING x]
  LIMIT 1;
~~~

This query always inserts 3 rows into `t`, even though the surrounding
query only observes 1 row using [`LIMIT`](limit-offset.html).

## Correlated subqueries

<span class="version-tag">New in v2.1:</span> CockroachDB's
[cost-based optimizer](cost-based-optimizer.html) supports several
common types of correlated subqueries.

A subquery is said to be "correlated" when it uses table or column
names defined in the surrounding query.

For example:

{% include_cached copy-clipboard.html %}
~~~ sql
# Find every customer with at least one order.
> SELECT c.name
    FROM customers c
   WHERE EXISTS(SELECT * FROM orders o WHERE o.customer_id = c.id);
~~~

The subquery is correlated because it uses `c` defined in the
surrounding query.


### Limited support for correlated subqueries

When the [cost-based optimizer](cost-based-optimizer.html) (CBO) is
explicitly disabled (e.g., `SET optimizer = off`), or when a query is
not recognized by the CBO, support for correlated subqueries is
disabled.

For example, the following correlated subqueries are not yet supported
for this reason:

- `INSERT INTO tb SELECT x FROM a WHERE EXISTS(SELECT x FROM b where b.y = a.y)`

    Because the CBO does not support [`INSERT`](insert.html) yet.

- `CREATE TABLE tb AS SELECT x FROM a WHERE EXISTS(SELECT x FROM b where b.y = a.y)`

    Because the CBO does not support [`CREATE TABLE ... AS`](create-table-as.html) yet.

In addition, the CBO handles correlated subqueries by automatically
transforming them into uncorrelated queries before query
execution. When this transformation is impossible, query planning will
fail.

For example, the following correlated subquery is not supported for this reason:

- `SELECT x[(SELECT x FROM tb2 WHERE tb2.x=tb1.x[2])] FROM tb1`

    Because the CBO cannot automatically decorrelate a subquery inside
    an array indexing operation (`x[...]`).

{{site.data.alerts.callout_info}}
If you come across an unsupported correlated subquery, please [file a Github issue](file-an-issue.html).
{{site.data.alerts.end}}

## Performance best practices

{{site.data.alerts.callout_info}}
CockroachDB is currently undergoing major changes to evolve and improve the performance of subqueries. The restrictions and workarounds listed in this section will be lifted or made unnecessary over time.
{{site.data.alerts.end}}

- Scalar subqueries currently disable the distribution of the execution of a query. To ensure maximum performance on queries that process a large number of rows, make the client application compute the subquery results ahead of time and pass these results directly in the surrounding query.

- The results of scalar subqueries are currently loaded entirely into memory when the execution of the surrounding query starts. To prevent execution errors due to memory exhaustion, ensure that subqueries return as few results as possible.

## See also

- [Selection Queries](selection-queries.html)
- [Scalar Expressions](scalar-expressions.html)
- [Table Expressions](table-expressions.html)
- [Performance Best Practices - Overview](performance-best-practices-overview.html)
