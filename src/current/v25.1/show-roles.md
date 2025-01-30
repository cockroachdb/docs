---
title: SHOW ROLES
summary: The SHOW ROLES statement lists the roles for all databases.
toc: true
docs_area: reference.sql
---

The `SHOW ROLES` [statement]({{ page.version.version }}/sql-statements.md) lists the roles for all databases.

{{site.data.alerts.callout_info}}
 Since the keywords `ROLES` and `USERS` can now be used interchangeably in SQL statements for enhanced PostgreSQL compatibility, `SHOW ROLES` is now an alias for [`SHOW USERS`]({{ page.version.version }}/show-users.md).
{{site.data.alerts.end}}

## Synopsis

<div>
</div>

## Required privileges

The role must have the [`SELECT`]({{ page.version.version }}/select-clause.md) [privilege]({{ page.version.version }}/security-reference/authorization.md#managing-privileges) on the `system.users` and `system.role_members` tables.

## Example

~~~ sql
> SHOW ROLES;
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

- [Authorization]({{ page.version.version }}/authorization.md)
- [`CREATE ROLE`]({{ page.version.version }}/create-role.md)
- [`DROP ROLE`]({{ page.version.version }}/drop-role.md)
- [`GRANT`]({{ page.version.version }}/grant.md)
- [`REVOKE`]({{ page.version.version }}/revoke.md)
- [Manage Users]({{ page.version.version }}/security-reference/authorization.md#create-and-manage-users)