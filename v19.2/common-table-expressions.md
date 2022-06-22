---
title: Common Table Expressions
summary: Common Table Expressions (CTEs) simplify the definition and use of subqueries
toc: true
toc_not_nested: true
---

Common Table Expressions, or CTEs, provide a shorthand name to a
possibly complex [subquery](subqueries.html) before it is used in a
larger query context. This improves readability of the SQL code.

CTEs can be used in combination with [`SELECT`
clauses](select-clause.html) and [`INSERT`](insert.html),
[`DELETE`](delete.html), [`UPDATE`](update.html) and
[`UPSERT`](upsert.html) statements.


## Synopsis

<div>{% include {{ page.version.version }}/sql/diagrams/with_clause.html %}</div>

<div markdown="1"></div>

## Parameters

Parameter | Description
----------|------------
`table_alias_name` | The name to use to refer to the common table expression from the accompanying query or statement.
`name` | A name for one of the columns in the newly defined common table expression.
`preparable_stmt` | The statement or subquery to use as common table expression.

## Overview

{{site.data.alerts.callout_info}}
The examples on this page use MovR, a fictional vehicle-sharing application, to demonstrate CockroachDB SQL statements. To follow along, run [`cockroach demo`](cockroach-demo.html) from the command line to start a temporary, in-memory cluster with the `movr` dataset preloaded.

For more information about the MovR example application and dataset, see [MovR: A Global Vehicle-sharing App](movr.html).
{{site.data.alerts.end}}

A query or statement of the form `WITH x AS y IN z` creates the
temporary table name `x` for the results of the subquery `y`, to be
reused in the context of the query `z`.

For example:

{% include_cached copy-clipboard.html %}
~~~ sql
> WITH r AS (SELECT * FROM rides WHERE revenue > 98)
  SELECT * FROM users AS u, r WHERE r.rider_id = u.id;
~~~

~~~
                   id                  |     city      |       name       |            address             | credit_card |                  id                  |     city      | vehicle_city  |               rider_id               |              vehicle_id              |           start_address           |        end_address        |        start_time         |         end_time          | revenue
+--------------------------------------+---------------+------------------+--------------------------------+-------------+--------------------------------------+---------------+---------------+--------------------------------------+--------------------------------------+-----------------------------------+---------------------------+---------------------------+---------------------------+---------+
  ae147ae1-47ae-4800-8000-000000000022 | amsterdam     | Tyler Dalton     | 88194 Angela Gardens Suite 94  | 4443538758  | bbe76c8b-4395-4000-8000-00000000016f | amsterdam     | amsterdam     | ae147ae1-47ae-4800-8000-000000000022 | aaaaaaaa-aaaa-4800-8000-00000000000a | 45295 Brewer View Suite 52        | 62188 Jade Causeway       | 2018-12-17 03:04:05+00:00 | 2018-12-17 13:04:05+00:00 |   99.00
  c7ae147a-e147-4000-8000-000000000027 | paris         | Tina Miller      | 97521 Mark Extensions          | 8880478663  | d5810624-dd2f-4800-8000-0000000001a1 | paris         | paris         | c7ae147a-e147-4000-8000-000000000027 | cccccccc-cccc-4000-8000-00000000000c | 47713 Reynolds Mountains Suite 39 | 1417 Stephanie Villages   | 2018-12-17 03:04:05+00:00 | 2018-12-18 22:04:05+00:00 |   99.00
  75c28f5c-28f5-4400-8000-000000000017 | san francisco | William Wood     | 36021 Steven Cove Apt. 89      | 5669281259  | 8ac08312-6e97-4000-8000-00000000010f | san francisco | san francisco | 75c28f5c-28f5-4400-8000-000000000017 | 77777777-7777-4800-8000-000000000007 | 84407 Tony Crest                  | 55336 Jon Manors          | 2018-12-10 03:04:05+00:00 | 2018-12-11 13:04:05+00:00 |   99.00
  8a3d70a3-d70a-4000-8000-00000000001b | san francisco | Jessica Martinez | 96676 Jennifer Knolls Suite 91 | 1601930189  | 7d70a3d7-0a3d-4000-8000-0000000000f5 | san francisco | san francisco | 8a3d70a3-d70a-4000-8000-00000000001b | 77777777-7777-4800-8000-000000000007 | 78978 Stevens Ramp Suite 8        | 7340 Alison Field Apt. 44 | 2018-12-19 03:04:05+00:00 | 2018-12-21 10:04:05+00:00 |   99.00
  47ae147a-e147-4000-8000-00000000000e | washington dc | Patricia Herrera | 80588 Perez Camp               | 6812041796  | 4083126e-978d-4000-8000-00000000007e | washington dc | washington dc | 47ae147a-e147-4000-8000-00000000000e | 44444444-4444-4400-8000-000000000004 | 33055 Julie Dale Suite 93         | 17280 Jill Drives         | 2019-01-01 03:04:05+00:00 | 2019-01-01 14:04:05+00:00 |   99.00
(5 rows)
~~~

In this example, the `WITH` clause defines the temporary name `r` for
the subquery over `rides`, and that name becomes a valid table name
for use in any [table expression](table-expressions.html) of the
subsequent `SELECT` clause.

This query is equivalent to, but arguably simpler to read than:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM users AS u, (SELECT * FROM rides WHERE revenue > 98) AS r
  WHERE r.rider_id = u.id;
~~~

It is also possible to define multiple common table expressions
simultaneously with a single `WITH` clause, separated by commas. Later
subqueries can refer to earlier subqueries by name. For example, the
following query is equivalent to the two examples above:

{% include_cached copy-clipboard.html %}
~~~ sql
> WITH r AS (SELECT * FROM rides WHERE revenue > 98),
	results AS (SELECT * FROM users AS u, r WHERE r.rider_id = u.id)
  SELECT * FROM results;
~~~

In this example, the second CTE `results` refers to the first CTE `r`
by name. The final query refers to the CTE `results`.

## Nested `WITH` clauses

It is possible to use a `WITH` clause in a subquery, or even a `WITH` clause within another `WITH` clause. For example:

{% include_cached copy-clipboard.html %}
~~~ sql
> WITH u AS
	(SELECT * FROM
		(WITH u_tab AS (SELECT * FROM users) SELECT * FROM u_tab))
  SELECT * FROM u;
~~~

When analyzing [table expressions](table-expressions.html) that
mention a CTE name, CockroachDB will choose the CTE definition that is
closest to the table expression. For example:

{% include_cached copy-clipboard.html %}
~~~ sql
> WITH
  u AS (SELECT * FROM users),
  v AS (WITH u AS (SELECT * from vehicles) SELECT * FROM u)
	SELECT * FROM v;
~~~

In this example, the inner subquery `SELECT * FROM v` will select from
table `vehicles` (closest `WITH` clause), not from table `users`.

## Data modifying statements

It is possible to use a [data-modifying statement](sql-statements.html#data-manipulation-statements) (`INSERT`, `DELETE`,
etc.) as a common table expression.

For example:

{% include_cached copy-clipboard.html %}
~~~ sql
> WITH final_code AS
  (INSERT INTO promo_codes(code, description, rules)
  VALUES ('half_off', 'Half-price ride!', '{"type": "percent_discount", "value": "50%"}'), ('free_ride', 'Free ride!', '{"type": "percent_discount", "value": "100%"}')
  returning rules)
  SELECT rules FROM final_code;
~~~

~~~
                      rules
+-----------------------------------------------+
  {"type": "percent_discount", "value": "50%"}
  {"type": "percent_discount", "value": "100%"}
(2 rows)
~~~

{{site.data.alerts.callout_info}}
If a common table expression contains
a data-modifying statement (<code>INSERT</code>, <code>DELETE</code>,
etc.), the modifications are performed fully even if only part
of the results are used, e.g., with <a
href="limit-offset.html"><code>LIMIT</code></a>. See <a
href="subqueries.html#data-writes-in-subqueries">Data
Writes in Subqueries</a> for details.
{{site.data.alerts.end}}

## Reusing common table expressions

<span class="version-tag">New in v19.2:</span> You can reference a CTE multiple times in a single query, using a `WITH` operator.

For example:

{% include_cached copy-clipboard.html %}
~~~ sql
> WITH
    users_ny AS (SELECT name, id FROM users WHERE city='new york'),
    vehicles_ny AS (SELECT type, id, owner_id FROM vehicles WHERE city='new york')
    SELECT * FROM users_ny JOIN vehicles_ny ON users_ny.id = vehicles_ny.owner_id;
~~~

~~~
        name       |                  id                  |    type    |                  id                  |               owner_id
+------------------+--------------------------------------+------------+--------------------------------------+--------------------------------------+
  James Hamilton   | 051eb851-eb85-4ec0-8000-000000000001 | skateboard | 00000000-0000-4000-8000-000000000000 | 051eb851-eb85-4ec0-8000-000000000001
  Catherine Nelson | 147ae147-ae14-4b00-8000-000000000004 | scooter    | 11111111-1111-4100-8000-000000000001 | 147ae147-ae14-4b00-8000-000000000004
(2 rows)
~~~

In this single query, you define two CTE's and then reuse them in a table join.

## See also

- [Subqueries](subqueries.html)
- [Selection Queries](selection-queries.html)
- [Table Expressions](table-expressions.html)
- [`EXPLAIN`](explain.html)
