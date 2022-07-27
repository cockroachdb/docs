---
title: SHOW ROLES
summary: The SHOW ROLES statement lists the roles for all databases.
toc: true
docs_area: reference.sql
---

The `SHOW ROLES` [statement](sql-statements.html) lists the roles for all databases.

{{site.data.alerts.callout_info}}
 Since the keywords `ROLES` and `USERS` can now be used interchangeably in SQL statements for enhanced PostgreSQL compatibility, `SHOW ROLES` is now an alias for [`SHOW USERS`](show-users.html).
{{site.data.alerts.end}}

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-{{ page.version.version | replace: "v", "" }}/grammar_svg/show_roles.html %}
</div>

## Required privileges

The role must have the [`SELECT`](select-clause.html) [privilege](security-reference/authorization.html#managing-privileges) on the `system.users` and `system.role_members` tables.

## Example

{% include_cached copy-clipboard.html %}
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
- [`GRANT`](grant.html)
- [`REVOKE`](revoke.html)
- [Manage Users](security-reference/authorization.html#create-and-manage-users)
