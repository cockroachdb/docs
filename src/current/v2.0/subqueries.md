---
title: Subqueries
summary: Subqueries enable the use of the results from a query within another query.
toc: false
---

SQL subqueries enable reuse of the results from a [selection query](selection-queries.html) within another query.

CockroachDB supports two kinds of subqueries:

- **Relational** subqueries which appear as operand in [selection queries](selection-queries.html) or [table expressions](table-expressions.html).
- **Scalar** subqueries which appear as operand in a [scalar expression](scalar-expressions.html).

## Data Writes in Subqueries

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

## Correlated Subqueries

A subquery is said to be "correlated" when it uses table or column
names defined in the surrounding query.

At this time, CockroachDB only supports non-correlated subqueries: all the table and column names listed in the subquery must be defined in the subquery itself.

If you find yourself wanting to use a correlated subquery, consider that a correlated subquery can often be transformed into a non-correlated subquery using a [join expression](joins.html).

For example:

{% include_cached copy-clipboard.html %}
~~~ sql
# Find every customer with at least one order.
> SELECT c.name
    FROM customers c
   WHERE EXISTS(SELECT * FROM orders o WHERE o.customer_id = c.id);
~~~

The subquery is correlated because it uses `c` defined in the
surrounding query. It is thus not yet supported by CockroachDB;
however, it can be transformed to the equivalent query:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT DISTINCT ON(c.id) c.name
    FROM customers c CROSS JOIN orders o
   WHERE c.id = o.customer_id;
~~~

See also [this question on Stack Overflow: Procedurally transform subquery into join](https://stackoverflow.com/questions/1772609/procedurally-transform-subquery-into-join).

{{site.data.alerts.callout_info}}CockroachDBs is currently undergoing major changes to introduce support for correlated subqueries. This limitation is expected to be lifted in a future release.{{site.data.alerts.end}}

## Performance Best Practices

{{site.data.alerts.callout_info}}CockroachDBs is currently undergoing major changes to evolve and improve the performance of subqueries. The restrictions and workarounds listed in this section will be lifted or made unnecessary over time.{{site.data.alerts.end}}

- Scalar subqueries currently disable the distribution of the execution of a query. To ensure maximum performance on queries that process a large number of rows, make the client application compute the subquery results ahead of time and pass these results directly in the surrounding query.

- The results of scalar subqueries are currently loaded entirely into memory when the execution of the surrounding query starts. To prevent execution errors due to memory exhaustion, ensure that subqueries return as few results as possible.

## See Also

- [Selection Queries](selection-queries.html)
- [Scalar Expressions](scalar-expressions.html)
- [Table Expressions](table-expressions.html)
- [Performance Best Practices - Overview](performance-best-practices-overview.html)
