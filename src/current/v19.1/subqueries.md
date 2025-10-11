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

<span class="version-tag">New in v19.1</span>: CockroachDB's [cost-based optimizer](cost-based-optimizer.html) supports most correlated subqueries.

A subquery is said to be "correlated" when it uses table or column names defined in the surrounding query.

For example, to find every customer with at least one order, run:

{% include_cached copy-clipboard.html %}
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

### Limitations

The [cost-based optimizer](cost-based-optimizer.html) supports most correlated subqueries, with the following exceptions:

- Correlated subqueries that generate side effects inside a `CASE` statement.

- Correlated subqueries that result in implicit `LATERAL` joins. Given a cross-join expression `a,b`, if `b` is an application of a [set-returning function](functions-and-operators.html#set-returning-functions) that references a variable defined in the surrounding query, the `LATERAL` keyword is assumed as shown below.

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SELECT
          e.last_name, s.salary, noise
      FROM
          employees AS e,
          salaries AS s,
          -- Join with a set-returning function implies LATERAL below
          generate_series(0, s.salary, 10000) AS noise
      WHERE
          e.emp_no = s.emp_no
      ORDER BY
          s.salary DESC
      LIMIT
          10;
    ~~~

    ~~~
    ERROR:  no data source matches prefix: s
    ~~~

    For more information, see [the Github issue tracking `LATERAL` join implementation](https://github.com/cockroachdb/cockroach/issues/24560).

    Note that the example above uses the [employees data set](https://github.com/datacharmer/test_db) that is also used in our [Migrate from MySQL](migrate-from-mysql.html) instructions (and the [MySQL docs](https://dev.mysql.com/doc/employee/en/)).

{{site.data.alerts.callout_info}}
If you come across an unsupported correlated subquery other than those described above, please [file a Github issue](file-an-issue.html).
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
