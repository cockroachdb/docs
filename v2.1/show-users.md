---
title: SHOW USERS
summary: The SHOW USERS statement lists the users for all databases.
toc: false
---

The `SHOW USERS` [statement](sql-statements.html) lists the users for all databases.

<div id="toc"></div>

## Synopsis

<div>
{% include {{ page.version.version }}/sql/diagrams/show_users.html %}
</div>

## Required privileges

The user must have the [`SELECT`](select-clause.html) [privilege](privileges.html) on the system table.

## Example

{% include copy-clipboard.html %}
~~~ sql
> SHOW USERS;
~~~

~~~
+------------+
|  username  |
+------------+
| jpointsman |
| maxroach   |
| root       |
+------------+
~~~

## See also

- [`CREATE USER`](create-user.html)
- [Manage Users](create-and-manage-users.html)
