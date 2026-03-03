---
title: SHOW USERS
summary: The SHOW USERS statement lists the users for all databases.
toc: true
docs_area: reference.sql
---

The `SHOW USERS` [statement]({% link {{ page.version.version }}/sql-statements.md %}) lists the users for all databases.

{{site.data.alerts.callout_info}}
 Since the keywords `ROLES` and `USERS` can now be used interchangeably in SQL statements for enhanced PostgreSQL compatibility, `SHOW USERS` is now an alias for [`SHOW ROLES`]({% link {{ page.version.version }}/show-roles.md %}).
{{site.data.alerts.end}}

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/show_users.html %}
</div>

## Required privileges

The user must have the [`SELECT`]({% link {{ page.version.version }}/select-clause.md %}) [privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#managing-privileges) on the `system.users` and `system.role_members` tables.

## Example

{% include_cached copy-clipboard.html %}
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

Alternatively, within the built-in SQL shell, you can use the `\du` [shell command]({% link {{ page.version.version }}/cockroach-sql.md %}#commands):

{% include_cached copy-clipboard.html %}
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

- [`CREATE USER`]({% link {{ page.version.version }}/create-user.md %})
- [Manage Users]({% link {{ page.version.version }}/security-reference/authorization.md %}#create-and-manage-users)
