---
title: DROP ROLE
summary: The DROP ROLE statement removes one or more SQL roles.
toc: true
docs_area: reference.sql
---

The `DROP ROLE` [statement]({{ page.version.version }}/sql-statements.md) removes one or more SQL roles. You can use the keywords `ROLE` and `USER` interchangeably. [`DROP USER`]({{ page.version.version }}/drop-user.md) is an alias for `DROP ROLE`.


## Considerations


## Required privileges

Non-admin roles cannot drop admin roles. To drop non-admin roles, the role must be a member of the `admin` role or have the [`CREATEROLE`]({{ page.version.version }}/create-role.md#create-a-role-that-can-create-other-roles-and-manage-authentication-methods-for-the-new-roles) parameter set.

## Synopsis


## Parameters

 Parameter | Description
------------|--------------
`name` | The name of the role to remove. To remove multiple roles, use a comma-separate list of roles.<br><br>You can use [`SHOW ROLES`]({{ page.version.version }}/show-roles.md) to find the names of roles.

## Example

In this example, first check a role's privileges. Then, revoke the role's privileges and remove the role.

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

~~~ sql
> REVOKE INSERT ON documents FROM dev_ops;
~~~

{{site.data.alerts.callout_info}}All of a role's privileges must be revoked before the role can be dropped.{{site.data.alerts.end}}

~~~ sql
> DROP ROLE dev_ops;
~~~

## See also

- [Authorization]({{ page.version.version }}/authorization.md)
- [Authorization Best Practices]({{ page.version.version }}/security-reference/authorization.md#authorization-best-practices)
- [`CREATE ROLE`]({{ page.version.version }}/create-role.md)
- [`SHOW ROLES`]({{ page.version.version }}/show-roles.md)
- [`GRANT`]({{ page.version.version }}/grant.md)
- [`SHOW GRANTS`]({{ page.version.version }}/show-grants.md)
- [SQL Statements]({{ page.version.version }}/sql-statements.md)
- [Online Schema Changes]({{ page.version.version }}/online-schema-changes.md)