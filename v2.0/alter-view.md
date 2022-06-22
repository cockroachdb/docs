---
title: ALTER VIEW
summary: The ALTER VIEW statement changes the name of a view.
toc: true
---

The `ALTER VIEW` [statement](sql-statements.html) changes the name of a [view](views.html). 

{{site.data.alerts.callout_info}}It is not currently possible to change the <code>SELECT</code> statement executed by a view. Instead, you must drop the existing view and create a new view. Also, it is not currently possible to rename a view that other views depend on, but this ability may be added in the future (see <a href="https://github.com/cockroachdb/cockroach/issues/10083">this issue</a>).{{site.data.alerts.end}}


## Required Privileges

The user must have the `DROP` [privilege](privileges.html) on the view and the `CREATE` privilege on the parent database.

## Synopsis

<div>
{% include {{ page.version.version }}/sql/diagrams/alter_view.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`IF EXISTS` | Rename the view only if a view of `view_name` exists; if one does not exist, do not return an error. 
`view_name` | The name of the view to rename. To find view names, use:<br><br>`SELECT * FROM information_schema.tables WHERE table_type = 'VIEW';` 
`name` | The new [`name`](sql-grammar.html#name) for the view, which must be unique to its database and follow these [identifier rules](keywords-and-identifiers.html#identifiers). 

## Example

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM information_schema.tables WHERE table_type = 'VIEW';
~~~

~~~ 
+---------------+-------------------+--------------------+------------+---------+
| TABLE_CATALOG |   TABLE_SCHEMA    |     TABLE_NAME     | TABLE_TYPE | VERSION |
+---------------+-------------------+--------------------+------------+---------+
| def           | bank              | user_accounts      | VIEW       |       2 |
| def           | bank              | user_emails        | VIEW       |       1 |
+---------------+-------------------+--------------------+------------+---------+
(2 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER VIEW bank.user_emails RENAME TO bank.user_email_addresses;
~~~

~~~
RENAME VIEW
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM information_schema.tables WHERE table_type = 'VIEW';
~~~

~~~
+---------------+-------------------+----------------------+------------+---------+
| TABLE_CATALOG |   TABLE_SCHEMA    |      TABLE_NAME      | TABLE_TYPE | VERSION |
+---------------+-------------------+----------------------+------------+---------+
| def           | bank              | user_accounts        | VIEW       |       2 |
| def           | bank              | user_email_addresses | VIEW       |       3 |
+---------------+-------------------+----------------------+------------+---------+
(2 rows)
~~~

## See Also

- [Views](views.html)
- [`CREATE VIEW`](create-view.html)
- [`SHOW CREATE VIEW`](show-create-view.html)
- [`DROP VIEW`](drop-view.html)
