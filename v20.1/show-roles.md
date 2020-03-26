---
title: SHOW ROLES
summary: The SHOW ROLES statement lists the roles for all databases.
toc: true
---

{{site.data.alerts.callout_info}}
<span class="version-tag">New in v20.1</span>: Since the keywords "roles" and "users" can now be used interchangeably in SQL statements for enhanced Postgres compatibility, `SHOW ROLES` is now an alias for [`SHOW USERS`](show-users.html).
{{site.data.alerts.end}}

The `SHOW ROLES` [statement](sql-statements.html) lists the roles for all databases.

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/show_roles.html %}
</div>

## Required privileges

The user must have the [`SELECT`](select-clause.html) [privilege](authorization.html#assign-privileges) on the system table.

## Example

{% include copy-clipboard.html %}
~~~ sql
> SHOW ROLES;
~~~

~~~
+-----------+
| role_name |
+-----------+
| admin     |
| dev_ops   |
+-----------+
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
