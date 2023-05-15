---
title: SHOW USERS
summary: The SHOW USERS statement lists the users for all databases.
toc: true
---

The `SHOW USERS` [statement](sql-statements.html) lists the users for all databases.


## Synopsis

{% include {{ page.version.version }}/sql/diagrams/show_users.html %}

## Required Privileges

No [privileges](privileges.html) are required to list users.

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
- [Create and Manage Users](create-and-manage-users.html)
