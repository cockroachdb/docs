---
title: DROP VIEW
summary: The DROP VIEW statement removes a view from a database.
toc: true
docs_area: reference.sql
---

The `DROP VIEW` [statement]({% link {{ page.version.version }}/sql-statements.md %}) removes a [view]({% link {{ page.version.version }}/views.md %}) from a database.

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Required privileges

The user must have the `DROP` [privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#managing-privileges) on the specified view(s). If `CASCADE` is used to drop dependent views, the user must have the `DROP` privilege on each dependent view as well.

## Synopsis

<div>{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/drop_view.html %}</div>

## Parameters

 Parameter | Description
----------|-------------
`MATERIALIZED` |  Drop a [materialized view]({% link {{ page.version.version }}/views.md %}#materialized-views).
 `IF EXISTS`   | Drop the view if it exists; if it does not exist, do not return an error.
 `view_name_list`  | A comma-separated list of view names. To find view names, use:<br><br>`SELECT * FROM information_schema.tables WHERE table_type = 'VIEW';`
 `CASCADE` | Drop other views that depend on the view being dropped.<br><br>`CASCADE` does not list views it drops, so should be used cautiously.
 `RESTRICT`    | _(Default)_ Do not drop the view if other views depend on it.

## Examples

### Remove a view (no dependencies)

In this example, other views do not depend on the view being dropped.

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
~~~ sql
> DROP VIEW bank.user_emails;
~~~

~~~
DROP VIEW
~~~

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
~~~ sql
> DROP VIEW bank.user_accounts;
~~~

~~~
ERROR: cannot drop relation "user_accounts" because view "user_emails" depends on it
SQLSTATE: 2BP01
~~~

{% include_cached copy-clipboard.html %}
~~~sql
> DROP VIEW bank.user_accounts CASCADE;
~~~

~~~
DROP VIEW
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM information_schema.tables WHERE table_type = 'VIEW';
~~~

~~~
  table_catalog | table_schema | table_name | table_type | is_insertable_into | version
----------------+--------------+------------+------------+--------------------+----------
(0 rows)
~~~

## See also

- [Views]({% link {{ page.version.version }}/views.md %})
- [`CREATE VIEW`]({% link {{ page.version.version }}/create-view.md %})
- [`SHOW CREATE`]({% link {{ page.version.version }}/show-create.md %})
- [`ALTER VIEW`]({% link {{ page.version.version }}/alter-view.md %})
- [Online Schema Changes]({% link {{ page.version.version }}/online-schema-changes.md %})
