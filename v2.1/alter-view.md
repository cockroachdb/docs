---
title: ALTER VIEW
summary: The ALTER VIEW statement changes the name of a view.
toc: true
---

The `ALTER VIEW` [statement](sql-statements.html) changes the name of a [view](views.html).

{% include {{{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Required privileges

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

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
~~~ sql
> ALTER VIEW bank.user_emails RENAME TO bank.user_email_addresses;
~~~

{% include copy-clipboard.html %}
~~~
> RENAME VIEW
~~~

{% include copy-clipboard.html %}
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

## See also

- [Views](views.html)
- [`CREATE VIEW`](create-view.html)
- [`SHOW CREATE`](show-create.html)
- [`DROP VIEW`](drop-view.html)
- [Online Schema Changes](online-schema-changes.html)
