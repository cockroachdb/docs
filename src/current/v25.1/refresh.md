---
title: REFRESH
summary: The REFRESH statement updates the stored query results of a materialized view.
toc: true
docs_area: reference.sql
---

Stored query results in [materialized view]({{ page.version.version }}/views.md#materialized-views) are not automatically updated to reflect the latest state of the table(s) they query. The `REFRESH` [statement]({{ page.version.version }}/sql-statements.md) updates the stored query results of a materialized view.

{{site.data.alerts.callout_info}}
CockroachDB does not support materialized views that are refreshed on [transaction commit]({{ page.version.version }}/commit-transaction.md).
{{site.data.alerts.end}}

## Required privileges

The user must be the [owner]({{ page.version.version }}/alter-view.md) of the materialized view or have [admin]({{ page.version.version }}/security-reference/authorization.md#admin-role) privileges.

## Synopsis

<div>
</div>

## Parameters

 Parameter | Description
-----------|-------------
`opt_concurrently` | `CONCURRENTLY` (Default behavior) This keyword has no effect. It is present for PostgreSQL compatibility. All materialized views are refreshed concurrently with other jobs.
`view_name` | The name of the materialized view to refresh.
`opt_clear_data` | `WITH DATA` (Default behavior) Refresh the stored query results. <br>`WITH NO DATA` Drop the query results of the materialized view from storage.

## Example

The following example uses the [sample `bank` database]({{ page.version.version }}/cockroach-workload.md#bank-workload), populated with some workload values.

Suppose that you create a materialized view on the `bank` table:

~~~ sql
> CREATE MATERIALIZED VIEW overdrawn_accounts
  AS SELECT id, balance
  FROM bank
  WHERE balance < 0;
~~~

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

~~~ sql
> UPDATE bank SET balance = 0 WHERE balance < 0;
~~~

~~~
UPDATE 402
~~~

The changes can be seen in the table with a simple `SELECT` statement against the table:

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

To update the materialized view's results, use a [`REFRESH`]({{ page.version.version }}/refresh.md) statement:

~~~ sql
> REFRESH MATERIALIZED VIEW overdrawn_accounts;
~~~

~~~ sql
> SELECT * FROM overdrawn_accounts;
~~~

~~~
  id | balance
-----+----------
(0 rows)
~~~

## See also

- [Materialized views]({{ page.version.version }}/views.md#materialized-views)
- [`CREATE VIEW`]({{ page.version.version }}/create-view.md)
- [`SHOW TABLES`]({{ page.version.version }}/show-tables.md)
- [`ALTER VIEW`]({{ page.version.version }}/alter-view.md)
- [`DROP VIEW`]({{ page.version.version }}/drop-view.md)