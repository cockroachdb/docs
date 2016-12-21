---
title: SHOW USERS
summary: The SHOW USERS statement lists the users for all databases.
toc: false
---

The `SHOW USERS` [statement](sql-statements.html) lists the users for all databases.

<div id="toc"></div>

## Synopsis

{% include sql/diagrams/show_users.html %}

## Required Privileges

No [privileges](privileges.html) are required to list the tables in a database.

## Example

### Show users

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
