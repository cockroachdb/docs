---
title: SHOW ROLES
summary: The SHOW ROLES statement lists the roles for all databases.
toc: true
---

<span class="version-tag">New in v2.0:</span> The `SHOW ROLES` [statement](sql-statements.html) lists the roles for all databases.


## Synopsis

<section>{% include {{ page.version.version }}/sql/diagrams/show_roles.html %}</section>

## Required Privileges

The user must have the [`SELECT`](select-clause.html) [privilege](privileges.html) on the system table.

## Example

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW ROLES;
~~~
~~~
+----------+
| rolename |
+----------+
| admin    |
| dev_ops  |
+----------+
~~~

## See Also

- [`CREATE ROLE` (Enterprise)](create-role.html)
- [`DROP ROLE` (Enterprise)](drop-role.html)
- [`GRANT <privileges>`](grant.html)
- [`REVOKE <privileges`](revoke.html)
- [`GRANT <roles>` (Enterprise)](grant-roles.html)
- [`REVOKE <roles` (Enterprise)](revoke-roles.html)
- [Manage Roles](roles.html)
- [Manage Users](create-and-manage-users.html)
