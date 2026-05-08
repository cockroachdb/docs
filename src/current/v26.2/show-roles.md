---
title: SHOW ROLES
summary: The SHOW ROLES statement lists the roles for all databases.
toc: true
docs_area: reference.sql
---

The `SHOW ROLES` [statement]({% link {{ page.version.version }}/sql-statements.md %}) lists the roles for all databases.

{{site.data.alerts.callout_info}}
 Since the keywords `ROLES` and `USERS` can now be used interchangeably in SQL statements for enhanced PostgreSQL compatibility, `SHOW ROLES` is now an alias for [`SHOW USERS`]({% link {{ page.version.version }}/show-users.md %}).
{{site.data.alerts.end}}

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/show_roles.html %}
</div>

## Required privileges

The role must have the [`SELECT`]({% link {{ page.version.version }}/select-clause.md %}) [privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#managing-privileges) on the `system.users` and `system.role_members` tables.

## Example

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW ROLES;
~~~

~~~
  username |    options     | member_of | estimated_last_login_time
-----------+----------------+-----------+------------------------------
  admin    | {CREATEROLE}   | {}        | NULL
  carl     | {NOLOGIN}      | {}        | NULL
  petee    | {}             | {}        | 2025-08-04 19:18:00.201402+00
  root     | {CREATEROLE}   | {admin}   | NULL
(4 rows)
~~~

## See also

- [Authorization]({% link {{ page.version.version }}/authorization.md %})
- [`CREATE ROLE`]({% link {{ page.version.version }}/create-role.md %})
- [`DROP ROLE`]({% link {{ page.version.version }}/drop-role.md %})
- [`GRANT`]({% link {{ page.version.version }}/grant.md %})
- [`REVOKE`]({% link {{ page.version.version }}/revoke.md %})
- [Manage Users]({% link {{ page.version.version }}/security-reference/authorization.md %}#create-and-manage-users)
