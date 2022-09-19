---
title: DROP ROLE
summary: The DROP ROLE statement removes one or more SQL roles.
toc: true
docs_area: reference.sql
---

The `DROP ROLE` [statement](sql-statements.html) removes one or more SQL roles. You can use the keywords `ROLE` and `USER` interchangeably. [`DROP USER`](drop-user.html) is an alias for `DROP ROLE`.

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Considerations

- The `admin` role cannot be dropped, and `root` must always be a member of `admin`.
- A role cannot be dropped if it has privileges. Use [`REVOKE`](revoke.html) to remove privileges.
- Roles that [own objects](security-reference/authorization.html#object-ownership) (such as databases, tables, schemas, and types) cannot be dropped until the [ownership is transferred to another role](owner-to.html#change-a-databases-owner).

## Required privileges

Non-admin roles cannot drop admin roles. To drop non-admin roles, the role must be a member of the `admin` role or have the [`CREATEROLE`](create-role.html#create-a-role-that-can-create-other-roles-and-manage-authentication-methods-for-the-new-roles) parameter set.

## Synopsis

<div>{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/drop_role.html %}</div>

## Parameters

 Parameter | Description
------------|--------------
`name` | The name of the role to remove. To remove multiple roles, use a comma-separate list of roles.<br><br>You can use [`SHOW ROLES`](show-roles.html) to find the names of roles.

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

- [Authorization](authorization.html)
- [Authorization Best Practices](security-reference/authorization.html#authorization-best-practices)
- [`CREATE ROLE`](create-role.html)
- [`SHOW ROLES`](show-roles.html)
- [`GRANT`](grant.html)
- [`SHOW GRANTS`](show-grants.html)
- [SQL Statements](sql-statements.html)
- [Online Schema Changes](online-schema-changes.html)
