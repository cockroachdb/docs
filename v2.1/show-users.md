---
title: SHOW USERS
summary: The SHOW USERS statement lists the users for all databases.
toc: true
---

The `SHOW USERS` [statement](sql-statements.html) lists the users for all databases.

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/show_users.html %}
</div>

## Required privileges

The user must have the [`SELECT`](select-clause.html) [privilege](authorization.html#assign-privileges) on the system table.

## Example

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW USERS;
~~~

~~~
+-------------+
|  user_name  |
+-------------+
| jpointsman  |
| maxroach    |
| root        |
+-------------+
~~~

## See also

- [`CREATE USER`](create-user.html)
- [Manage Users](create-and-manage-users.html)
