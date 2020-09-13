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

## Required Privileges

The user must have the [`SELECT`](select-clause.html) [privilege](privileges.html) on the system table.

## Example

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

## See Also

- [`CREATE USER`](create-user.html)
- [Manage Users](create-and-manage-users.html)
