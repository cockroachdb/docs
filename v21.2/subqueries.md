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

{% include copy-clipboard.html %}
~~~ sql
> SELECT *
   FROM [INSERT INTO t(x) VALUES (1), (2), (3) RETURNING x]
  LIMIT 1;
~~~

This query always inserts 3 rows into `t`, even though the surrounding
query only observes 1 row using [`LIMIT`](limit-offset.html).

## Correlated subqueries

CockroachDB's [cost-based optimizer](cost-based-optimizer.html) supports most [correlated subqueries](https://en.wikipedia.org/wiki/Correlated_subquery).

A subquery is said to be "correlated" when it uses table or column names defined in the surrounding query.

For example, to find every customer with at least one order, run:

{% include copy-clipboard.html %}
~~~ sql
> SELECT
      c.name
  FROM
      customers AS c
  WHERE
      EXISTS(
          SELECT * FROM orders AS o WHERE o.customer_id = c.id
      );
~~~

The subquery is correlated because it uses `c` defined in the surrounding query.

### `LATERAL` subqueries

 CockroachDB supports `LATERAL` subqueries. A `LATERAL` subquery is a correlated subquery that references another query or subquery in its `SELECT` statement, usually in the context of a [`LEFT` join](joins.html#left-outer-joins) or an [`INNER` join](joins.html#inner-joins). Unlike other correlated subqueries, `LATERAL` subqueries iterate through each row in the referenced query for each row in the inner subquery, like a [for loop](https://en.wikipedia.org/wiki/For_loop).

To create a `LATERAL` subquery, use the `LATERAL` keyword directly before the inner subquery's `SELECT` statement.

For example, the following statement performs an `INNER` join of the `users` table and a subquery of the `rides` table that filters on values in the `users` table:

{% include copy-clipboard.html %}
~~~ sql
> SELECT name, address FROM users, LATERAL (SELECT * FROM rides WHERE rides.start_address = users.address AND city = 'new york');
~~~

~~~
        name       |           address
+------------------+-----------------------------+
  Robert Murphy    | 99176 Anderson Mills
  James Hamilton   | 73488 Sydney Ports Suite 57
  Judy White       | 18580 Rosario Ville Apt. 61
  Devin Jordan     | 81127 Angela Ferry Apt. 8
  Catherine Nelson | 1149 Lee Alley
  Nicole Mcmahon   | 11540 Patton Extensions
(6 rows)
~~~

`LATERAL` subquery joins are especially useful when the join table includes a [computed column](computed-columns.html).

For example, the following query joins a subquery of the `rides` table with a computed column (`adjusted_revenue`), and a subquery of the `users` table that references columns in the `rides` subquery:

{% include copy-clipboard.html %}
~~~ sql
> SELECT
   ride_id,
   vehicle_id,
   type,
   adjusted_revenue
FROM
   (
      SELECT
         id AS ride_id,
         vehicle_id,
         revenue - 0.25*revenue AS adjusted_revenue
      FROM
         rides
   )
   r
   JOIN
      LATERAL (
      SELECT
         type
      FROM
         vehicles
      WHERE
         city = 'new york'
         AND vehicles.id = r.vehicle_id
         AND r.adjusted_revenue > 65 ) v
         ON true;
~~~

~~~
                ride_id                |              vehicle_id              |    type    | adjusted_revenue
+--------------------------------------+--------------------------------------+------------+------------------+
  049ba5e3-53f7-4ec0-8000-000000000009 | 11111111-1111-4100-8000-000000000001 | scooter    |          71.2500
  0624dd2f-1a9f-4e80-8000-00000000000c | 00000000-0000-4000-8000-000000000000 | skateboard |          70.5000
  08b43958-1062-4e00-8000-000000000011 | 11111111-1111-4100-8000-000000000001 | scooter    |          70.5000
  0bc6a7ef-9db2-4d00-8000-000000000017 | 00000000-0000-4000-8000-000000000000 | skateboard |          68.2500
  0d4fdf3b-645a-4c80-8000-00000000001a | 00000000-0000-4000-8000-000000000000 | skateboard |          67.5000
  1ba5e353-f7ce-4900-8000-000000000036 | 11111111-1111-4100-8000-000000000001 | scooter    |          70.5000
(6 rows)
~~~

{{site.data.alerts.callout_info}}
In a `LATERAL` subquery join, the rows returned by the inner subquery are added to the result of the join with the outer query. Without the `LATERAL` keyword, each subquery is evaluated independently and cannot refer to objects defined in separate queries.
{{site.data.alerts.end}}

### Limitations

The [cost-based optimizer](cost-based-optimizer.html) supports most correlated subqueries, with the exception of correlated subqueries that generate side effects inside a `CASE` statement.

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
