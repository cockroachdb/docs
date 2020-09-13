---
title: SHOW ROLES
summary: The SHOW ROLES statement lists the roles for all databases.
toc: true
---

The `SHOW ROLES` [statement](sql-statements.html) lists the roles for all databases.

{{site.data.alerts.callout_info}}
 Since the keywords `ROLES` and `USERS` can now be used interchangeably in SQL statements for enhanced Postgres compatibility, `SHOW ROLES` is now an alias for [`SHOW USERS`](show-users.html).
{{site.data.alerts.end}}

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/show_roles.html %}
</div>

## Required privileges

The role must have the [`SELECT`](select-clause.html) [privilege](authorization.html#assign-privileges) on the `system.users` and `system.role_members` tables.

## Example

{% include copy-clipboard.html %}
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

- [Authorization](authorization.html)
- [`CREATE ROLE`](create-role.html)
- [`DROP ROLE`](drop-role.html)
- [`GRANT <privileges>`](grant.html)
- [`REVOKE <privileges`](revoke.html)
- [`GRANT <roles>`](grant-roles.html)
- [`REVOKE <roles`](revoke-roles.html)
- [Manage Users](authorization.html#create-and-manage-users)
