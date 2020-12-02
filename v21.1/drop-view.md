---
title: DROP VIEW
summary: The DROP VIEW statement removes a view from a database.
toc: true
---

The `DROP VIEW` [statement](sql-statements.html) removes a [view](views.html) from a database.

{% include {{{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Required privileges

The user must have the `DROP` [privilege](authorization.html#assign-privileges) on the specified view(s). If `CASCADE` is used to drop dependent views, the user must have the `DROP` privilege on each dependent view as well.

## Synopsis

<section>{% include {{ page.version.version }}/sql/diagrams/drop_view.html %}</section>

## Parameters

 Parameter | Description
----------|-------------
`MATERIALIZED` |  Drop a [materialized view](views.html#materialized-views).
 `IF EXISTS`   | Drop the view if it exists; if it does not exist, do not return an error.
 `table_name`  | A comma-separated list of view names. To find view names, use:<br><br>`SELECT * FROM information_schema.tables WHERE table_type = 'VIEW';`
 `CASCADE` | Drop other views that depend on the view being dropped.<br><br>`CASCADE` does not list views it drops, so should be used cautiously.
 `RESTRICT`    | _(Default)_ Do not drop the view if other views depend on it.

## Examples

### Remove a view (no dependencies)

In this example, other views do not depend on the view being dropped.

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM information_schema.tables WHERE table_type = 'VIEW';
~~~

~~~
+---------------+-------------------+--------------------+------------+---------+
| TABLE_CATALOG |   TABLE_SCHEMA    |     TABLE_NAME     | TABLE_TYPE | VERSION |
+---------------+-------------------+--------------------+------------+---------+
| def           | bank              | user_accounts      | VIEW       |       1 |
| def           | bank              | user_emails        | VIEW       |       1 |
+---------------+-------------------+--------------------+------------+---------+
(2 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> DROP VIEW bank.user_emails;
~~~

~~~
DROP VIEW
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM information_schema.tables WHERE table_type = 'VIEW';
~~~

~~~
+---------------+-------------------+--------------------+------------+---------+
| TABLE_CATALOG |   TABLE_SCHEMA    |     TABLE_NAME     | TABLE_TYPE | VERSION |
+---------------+-------------------+--------------------+------------+---------+
| def           | bank              | user_accounts      | VIEW       |       1 |
+---------------+-------------------+--------------------+------------+---------+
(1 row)
~~~

### Remove a view (with dependencies)

In this example, another view depends on the view being dropped. Therefore, it's only possible to drop the view while simultaneously dropping the dependent view using `CASCADE`.

{{site.data.alerts.callout_danger}}<code>CASCADE</code> drops <em>all</em> dependent views without listing them, which can lead to inadvertent and difficult-to-recover losses. To avoid potential harm, we recommend dropping objects individually in most cases.{{site.data.alerts.end}}

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM information_schema.tables WHERE table_type = 'VIEW';
~~~

~~~
+---------------+-------------------+--------------------+------------+---------+
| TABLE_CATALOG |   TABLE_SCHEMA    |     TABLE_NAME     | TABLE_TYPE | VERSION |
+---------------+-------------------+--------------------+------------+---------+
| def           | bank              | user_accounts      | VIEW       |       1 |
| def           | bank              | user_emails        | VIEW       |       1 |
+---------------+-------------------+--------------------+------------+---------+
(2 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> DROP VIEW bank.user_accounts;
~~~

~~~
pq: cannot drop view "user_accounts" because view "user_emails" depends on it
~~~

{% include copy-clipboard.html %}
~~~sql
> DROP VIEW bank.user_accounts CASCADE;
~~~

~~~
DROP VIEW
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM information_schema.tables WHERE table_type = 'VIEW';
~~~

~~~
+---------------+-------------------+--------------------+------------+---------+
| TABLE_CATALOG |   TABLE_SCHEMA    |     TABLE_NAME     | TABLE_TYPE | VERSION |
+---------------+-------------------+--------------------+------------+---------+
| def           | bank              | create_test        | VIEW       |       1 |
+---------------+-------------------+--------------------+------------+---------+
(1 row)
~~~

## See also

- [Views](views.html)
- [`CREATE VIEW`](create-view.html)
- [`SHOW CREATE`](show-create.html)
- [`ALTER VIEW`](alter-view.html)
- [Online Schema Changes](online-schema-changes.html)
