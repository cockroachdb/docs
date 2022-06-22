---
title: SHOW ROLES
summary: The SHOW ROLES statement lists the roles for all databases.
toc: true
---

The `SHOW ROLES` [statement](sql-statements.html) lists the roles for all databases.

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/show_roles.html %}
</div>

## Required privileges

The user must have the [`SELECT`](select-clause.html) [privilege](authorization.html#assign-privileges) on the system table.

## Example

{% include_cached copy-clipboard.html %}
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
- [`CREATE ROLE` (Enterprise)](create-role.html)
- [`DROP ROLE` (Enterprise)](drop-role.html)
- [`GRANT <privileges>`](grant.html)
- [`REVOKE <privileges`](revoke.html)
- [`GRANT <roles>`](grant-roles.html)
- [`REVOKE <roles>`](revoke-roles.html)
- [Manage Users](authorization.html#create-and-manage-users)
