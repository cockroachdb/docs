---
title: REFRESH
summary: The REFRESH statement updates the stored query results of a materialized view.
toc: true
docs_area: reference.sql
---

 Stored query results in [materialized view](views.html#materialized-views) are not automatically updated to reflect the latest state of the table(s) they query. The `REFRESH` [statement](sql-statements.html) updates the stored query results of a materialized view.

{{site.data.alerts.callout_info}}
CockroachDB does not support materialized views that are refreshed on [transaction commit](commit-transaction.html).
{{site.data.alerts.end}}

## Required privileges

The user must be the [owner](owner-to.html) of the materialized view or have [admin](security-reference/authorization.html#admin-role) privileges.

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-{{ page.version.version | replace: "v", "" }}/grammar_svg/refresh_materialized_views.html %}
</div>

## Parameters

 Parameter | Description
-----------|-------------
`opt_concurrently` | `CONCURRENTLY` (Default behavior) This keyword has no effect. It is present for PostgreSQL compatibility. All materialized views are refreshed concurrently with other jobs.
`view_name` | The name of the materialized view to refresh.
`opt_clear_data` | `WITH DATA` (*Default behavior*) Refresh the stored query results. <br>`WITH NO DATA` Drop the query results of the materialized view from storage.

## Example

The following example uses the [sample `bank` database](cockroach-workload.html#bank-workload), populated with some workload values.

Suppose that you create a materialized view on the `bank` table:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE MATERIALIZED VIEW overdrawn_accounts
  AS SELECT id, balance
  FROM bank
  WHERE balance < 0;
~~~

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
~~~ sql
> UPDATE bank SET balance = 0 WHERE balance < 0;
~~~

~~~
UPDATE 402
~~~

The changes can be seen in the table with a simple `SELECT` statement against the table:

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
~~~ sql
> REFRESH MATERIALIZED VIEW overdrawn_accounts;
~~~

{% include_cached copy-clipboard.html %}
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
