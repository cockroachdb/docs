---
title: REFRESH
summary: The REFRESH statement updates the stored query results of a materialized view.
toc: true
---

 Stored query results in [materialized view](views.html#materialized-views) are not automatically updated to reflect the latest state of the table(s) they query. The `REFRESH` [statement](sql-statements.html) updates the stored query results of a materialized view.

{{site.data.alerts.callout_info}}
CockroachDB does not support materialized views that are refreshed on [transaction commit](commit-transaction.html).
{{site.data.alerts.end}}

## Required privileges

The user must be the owner of the materialized view.

## Syntax

~~~
REFRESH MATERIALIZED VIEW [CONCURRENTLY] view_name [WITH [NO] DATA]
~~~

## Parameters

 Parameter | Description
-----------|-------------
`CONCURRENTLY` | (*Default behavior*) This keyword is a no-op, added for PostgreSQL compatibility. All materialized views are refreshed concurrently with other jobs.
`view_name` | The name of the materialized view to refresh.
`WITH NO DATA` | Drop the query results of the materialized view from storage.
`WITH DATA` | (*Default behavior*) Refresh the stored query results.

## Example

The following example uses the [sample `bank` database](cockroach-workload.html#bank-workload), populated with some workload values.

Suppose that you create a materialized view on the `bank` table:

{% include copy-clipboard.html %}
~~~ sql
> CREATE MATERIALIZED VIEW overdrawn_accounts
  AS SELECT id, balance
  FROM bank
  WHERE balance < 0;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM overdrawn_accounts;
~~~

~~~
  id  | balance
------+----------
    1 |  -17643
    3 |   -5928
   13 |   -3700
...
(402 rows)
~~~

Now suppose that you update the `balance` values of the `bank` table:

{% include copy-clipboard.html %}
~~~ sql
> UPDATE bank SET balance = 0 WHERE balance < 0;
~~~

~~~
UPDATE 402
~~~

The changes can be seen in the table with a simple `SELECT` statement against the table:

{% include copy-clipboard.html %}
~~~ sql
> SELECT id, balance
FROM bank
WHERE balance < 0;
~~~

~~~
  id | balance
-----+----------
(0 rows)
~~~


Recall that materialized views do not automatically update their stored results. Selecting from `overdrawn_accounts` returns stored results, which are outdated:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM overdrawn_accounts;
~~~

~~~
  id  | balance
------+----------
    1 |  -17643
    3 |   -5928
   13 |   -3700
...
(402 rows)
~~~

To update the materialized view's results, use a [`REFRESH`](refresh.html) statement:

{% include copy-clipboard.html %}
~~~ sql
> REFRESH MATERIALIZED VIEW overdrawn_accounts;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM overdrawn_accounts;
~~~

~~~
  id | balance
-----+----------
(0 rows)
~~~

## See also

- [Materialized views](views.html#materialized-views)
- [`CREATE VIEW`](create-view.html)
- [`SHOW TABLES`](show-tables.html)
- [`ALTER VIEW`](alter-view.html)
- [`DROP VIEW`](drop-view.html)
