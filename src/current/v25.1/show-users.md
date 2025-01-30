---
title: SHOW USERS
summary: The SHOW USERS statement lists the users for all databases.
toc: true
docs_area: reference.sql
---

The `SHOW USERS` [statement]({{ page.version.version }}/sql-statements.md) lists the users for all databases.

{{site.data.alerts.callout_info}}
 Since the keywords `ROLES` and `USERS` can now be used interchangeably in SQL statements for enhanced PostgreSQL compatibility, `SHOW USERS` is now an alias for [`SHOW ROLES`]({{ page.version.version }}/show-roles.md).
{{site.data.alerts.end}}

## Synopsis

<div>
</div>

## Required privileges

The user must have the [`SELECT`]({{ page.version.version }}/select-clause.md) [privilege]({{ page.version.version }}/security-reference/authorization.md#managing-privileges) on the `system.users` and `system.role_members` tables.

## Example

~~~ sql
> SHOW USERS;
~~~

~~~
  username |  options   | member_of
-----------+------------+------------
  admin    | CREATEROLE | {}
  carl     | NOLOGIN    | {}
  petee    |            | {}
  root     | CREATEROLE | {admin}
(4 rows)
~~~

Alternatively, within the built-in SQL shell, you can use the `\du` [shell command]({{ page.version.version }}/cockroach-sql.md#commands):

~~~ sql
> \du
~~~

~~~
  username |  options   | member_of
-----------+------------+------------
  admin    | CREATEROLE | {}
  carl     | NOLOGIN    | {}
  petee    |            | {}
  root     | CREATEROLE | {admin}
(4 rows)
~~~

## See also

- [`CREATE USER`]({{ page.version.version }}/create-user.md)
- [Manage Users]({{ page.version.version }}/security-reference/authorization.md#create-and-manage-users)