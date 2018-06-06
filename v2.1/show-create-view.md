---
title: SHOW CREATE VIEW
summary: The SHOW CREATE VIEW statement shows the CREATE VIEW statement that would create a copy of the specified view.
toc: false
---

The `SHOW CREATE VIEW` [statement](sql-statements.html) shows the `CREATE VIEW` statement that would create a copy of the specified [view](views.html).

<div id="toc"></div>

## Required privileges

The user must have any [privilege](privileges.html) on the target view.

## Synopsis

<div>
{% include sql/{{ page.version.version }}/diagrams/show_create_view.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`view_name` | The name of the view for which to show the `CREATE VIEW` statement.

## Response

Field | Description
------|------------
`View` | The name of the view.
`CreateView` | The [`CREATE VIEW`](create-view.html) statement for creating a copy of the specified view.

## Examples

### Show the `CREATE VIEW` statement for a view

{% include copy-clipboard.html %}
~~~ sql
> SHOW CREATE VIEW bank.user_accounts;
~~~

~~~
+--------------------+---------------------------------------------------------------------------+
|        View        |                                CreateView                                 |
+--------------------+---------------------------------------------------------------------------+
| bank.user_accounts | CREATE VIEW "bank.user_accounts" AS SELECT type, email FROM bank.accounts |
+--------------------+---------------------------------------------------------------------------+
(1 row)
~~~

### Show just a view's `SELECT` statement

To get just a view's `SELECT` statement, you can query the `views` table in the built-in `information_schema` database and filter on the view name:

{% include copy-clipboard.html %}
~~~ sql
> SELECT view_definition
  FROM information_schema.views
  WHERE table_name = 'user_accounts';
~~~

~~~
+---------------------------------------+
|            view_definition            |
+---------------------------------------+
| SELECT type, email FROM bank.accounts |
+---------------------------------------+
(1 row)
~~~

## See also

- [Views](views.html)
- [`CREATE VIEW`](create-view.html)
- [`ALTER VIEW`](alter-view.html)
- [`DROP VIEW`](drop-view.html)
- [Information Schema](information-schema.html)
- [Other SQL Statements](sql-statements.html)
