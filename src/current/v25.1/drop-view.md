---
title: DROP VIEW
summary: The DROP VIEW statement removes a view from a database.
toc: true
docs_area: reference.sql
---

The `DROP VIEW` [statement]({{ page.version.version }}/sql-statements.md) removes a [view]({{ page.version.version }}/views.md) from a database.


## Required privileges

The user must have the `DROP` [privilege]({{ page.version.version }}/security-reference/authorization.md#managing-privileges) on the specified view(s). If `CASCADE` is used to drop dependent views, the user must have the `DROP` privilege on each dependent view as well.

## Synopsis


## Parameters

 Parameter | Description
----------|-------------
`MATERIALIZED` |  Drop a [materialized view]({{ page.version.version }}/views.md#materialized-views).
 `IF EXISTS`   | Drop the view if it exists; if it does not exist, do not return an error.
 `view_name_list`  | A comma-separated list of view names. To find view names, use:<br><br>`SELECT * FROM information_schema.tables WHERE table_type = 'VIEW';`
 `CASCADE` | Drop other views that depend on the view being dropped.<br><br>`CASCADE` does not list views it drops, so should be used cautiously.
 `RESTRICT`    | _(Default)_ Do not drop the view if other views depend on it.

## Examples

### Remove a view (no dependencies)

In this example, other views do not depend on the view being dropped.

~~~ sql
> SELECT * FROM information_schema.tables WHERE table_type = 'VIEW';
~~~

~~~
  table_catalog | table_schema |  table_name   | table_type | is_insertable_into | version
----------------+--------------+---------------+------------+--------------------+----------
  bank          | public       | user_accounts | VIEW       | NO                 |       2
  bank          | public       | user_emails   | VIEW       | NO                 |       1
(2 rows)
~~~

~~~ sql
> DROP VIEW bank.user_emails;
~~~

~~~
DROP VIEW
~~~

~~~ sql
> SELECT * FROM information_schema.tables WHERE table_type = 'VIEW';
~~~

~~~
  table_catalog | table_schema |  table_name   | table_type | is_insertable_into | version
----------------+--------------+---------------+------------+--------------------+----------
  bank          | public       | user_accounts | VIEW       | NO                 |       4
(1 row)
~~~

### Remove a view (with dependencies)

In this example, another view depends on the view being dropped. Therefore, it's only possible to drop the view while simultaneously dropping the dependent view using `CASCADE`.

{{site.data.alerts.callout_danger}}<code>CASCADE</code> drops <em>all</em> dependent views without listing them, which can lead to inadvertent and difficult-to-recover losses. To avoid potential harm, we recommend dropping objects individually in most cases.{{site.data.alerts.end}}

~~~ sql
> SELECT * FROM information_schema.tables WHERE table_type = 'VIEW';
~~~

~~~
  table_catalog | table_schema |  table_name   | table_type | is_insertable_into | version
----------------+--------------+---------------+------------+--------------------+----------
  bank          | public       | user_accounts | VIEW       | NO                 |       2
  bank          | public       | user_emails   | VIEW       | NO                 |       1
(2 rows)
~~~

~~~ sql
> DROP VIEW bank.user_accounts;
~~~

~~~
ERROR: cannot drop relation "user_accounts" because view "user_emails" depends on it
SQLSTATE: 2BP01
~~~

~~~sql
> DROP VIEW bank.user_accounts CASCADE;
~~~

~~~
DROP VIEW
~~~

~~~ sql
> SELECT * FROM information_schema.tables WHERE table_type = 'VIEW';
~~~

~~~
  table_catalog | table_schema | table_name | table_type | is_insertable_into | version
----------------+--------------+------------+------------+--------------------+----------
(0 rows)
~~~

## See also

- [Views]({{ page.version.version }}/views.md)
- [`CREATE VIEW`]({{ page.version.version }}/create-view.md)
- [`SHOW CREATE`]({{ page.version.version }}/show-create.md)
- [`ALTER VIEW`]({{ page.version.version }}/alter-view.md)
- [Online Schema Changes]({{ page.version.version }}/online-schema-changes.md)