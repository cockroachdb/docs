---
title: DROP ROLE
summary: The DROP ROLE statement removes one or more SQL roles.
toc: true
---

The `DROP ROLE` [statement](sql-statements.html) removes one or more SQL roles.

{{site.data.alerts.callout_info}}
<span class="version-tag">New in v20.1</span> <code>DROP ROLE</code> is no longer an enterprise feature and is now freely available in the core version of CockroachDB. Also, since the keywords `ROLE` and `USER` can now be used interchangeably in SQL statements for enhanced Postgres compatibility, `DROP ROLE` is now an alias for [`DROP USER`](drop-user.html).
{{site.data.alerts.end}}

## Considerations

- The `admin` role cannot be dropped, and `root` must always be a member of `admin`.
- A role cannot be dropped if it has privileges. Use [`REVOKE`](revoke.html) to remove privileges.

## Required privileges

Roles can only be dropped by super users, i.e., members of the `admin` role.

<span class="version-tag">New in v20.1:</span> To drop other non-admin roles, the role must have the [`CREATEROLE`](create-role.html#allow-the-role-to-create-other-roles) parameter set.

## Synopsis

<section>{% include {{ page.version.version }}/sql/diagrams/drop_role.html %}</section>


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
~~~
DROP ROLE 1
~~~

## See also

- [Authorization](authorization.html)
- [`CREATE ROLE`](create-role.html)
- [`SHOW ROLES`](show-roles.html)
- [`GRANT`](grant.html)
- [`SHOW GRANTS`](show-grants.html)
- [Other SQL Statements](sql-statements.html)
