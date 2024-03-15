---
title: DROP ROLE
summary: The DROP ROLE statement removes one or more SQL roles.
toc: true
docs_area: reference.sql
---

The `DROP ROLE` [statement]({% link {{ page.version.version }}/sql-statements.md %}) removes one or more SQL roles. You can use the keywords `ROLE` and `USER` interchangeably. [`DROP USER`]({% link {{ page.version.version }}/drop-user.md %}) is an alias for `DROP ROLE`.

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Considerations

{% include {{ page.version.version }}/sql/drop-role-considerations.md %}

## Required privileges

Non-admin roles cannot drop admin roles. To drop non-admin roles, the role must be a member of the `admin` role or have the [`CREATEROLE`]({% link {{ page.version.version }}/create-role.md %}#create-a-role-that-can-create-other-roles-and-manage-authentication-methods-for-the-new-roles) parameter set.

## Synopsis

<div>{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/drop_role.html %}</div>

## Parameters

 Parameter | Description
------------|--------------
`name` | The name of the role to remove. To remove multiple roles, use a comma-separate list of roles.<br><br>You can use [`SHOW ROLES`]({% link {{ page.version.version }}/show-roles.md %}) to find the names of roles.

## Example

In this example, first check a role's privileges. Then, revoke the role's privileges and remove the role.

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON documents FOR dev_ops;
~~~
~~~
+------------+--------+-----------+---------+------------+
|  Database  | Schema |   Table   |  User   | Privileges |
+------------+--------+-----------+---------+------------+
| jsonb_test | public | documents | dev_ops | INSERT     |
+------------+--------+-----------+---------+------------+
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> REVOKE INSERT ON documents FROM dev_ops;
~~~

{{site.data.alerts.callout_info}}All of a role's privileges must be revoked before the role can be dropped.{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ sql
> DROP ROLE dev_ops;
~~~

## See also

- [Authorization]({% link {{ page.version.version }}/authorization.md %})
- [Authorization Best Practices]({% link {{ page.version.version }}/security-reference/authorization.md %}#authorization-best-practices)
- [`CREATE ROLE`]({% link {{ page.version.version }}/create-role.md %})
- [`SHOW ROLES`]({% link {{ page.version.version }}/show-roles.md %})
- [`GRANT`]({% link {{ page.version.version }}/grant.md %})
- [`SHOW GRANTS`]({% link {{ page.version.version }}/show-grants.md %})
- [SQL Statements]({% link {{ page.version.version }}/sql-statements.md %})
- [Online Schema Changes]({% link {{ page.version.version }}/online-schema-changes.md %})
