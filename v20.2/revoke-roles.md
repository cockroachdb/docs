---
title: REVOKE &lt;roles&gt;
summary: The REVOKE <roles> statement revokes privileges from users and/or roles.
toc: true
---

The `REVOKE <roles>` [statement](sql-statements.html) lets you revoke a [role](authorization.html#create-and-manage-roles) or [user's](authorization.html#create-and-manage-users) membership to a role.

{{site.data.alerts.callout_info}}
 <code>REVOKE &lt;roles&gt;</code> is no longer an enterprise feature and is now freely available in the core version of CockroachDB.
{{site.data.alerts.end}}

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/revoke_roles.html %}
</div>

## Required privileges

The user revoking role membership must be a role admin (i.e., members with the `WITH ADMIN OPTION`) or a member of the `admin` role.

To remove membership to the `admin` role, the user must have `WITH ADMIN OPTION` on the `admin` role.

## Considerations

- The `root` user cannot be revoked from the `admin` role.

## Parameters

Parameter | Description
----------|------------
`ADMIN OPTION` | Revoke the user's role admin status.
`role_name` | The name of the role from which you want to remove members. To revoke members from multiple roles, use a comma-separated list of role names.
`user_name` | The name of the [user](authorization.html#create-and-manage-users) or [role](authorization.html#create-and-manage-roles) from whom you want to revoke membership. To revoke multiple members, use a comma-separated list of user and/or role names.

## Examples

### Revoke role membership

{% include copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON ROLE design;
~~~

~~~
+--------+---------+---------+
|  role  | member  | isAdmin |
+--------+---------+---------+
| design | barkley | false   |
| design | ernie   | true    |
| design | lola    | false   |
| design | lucky   | false   |
+--------+---------+---------+
~~~

{% include copy-clipboard.html %}
~~~ sql
> REVOKE design FROM lola;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON ROLE design;
~~~

~~~
+--------+---------+---------+
|  role  | member  | isAdmin |
+--------+---------+---------+
| design | barkley | false   |
| design | ernie   | true    |
| design | lucky   | false   |
+--------+---------+---------+
~~~

### Revoke the admin option

To revoke a user or role's admin option from a role (without revoking the membership):

{% include copy-clipboard.html %}
~~~ sql
> REVOKE ADMIN OPTION FOR design FROM ernie;
~~~

~~~
+--------+---------+---------+
|  role  | member  | isAdmin |
+--------+---------+---------+
| design | barkley | false   |
| design | ernie   | false   |
| design | lucky   | false   |
+--------+---------+---------+
~~~

## See also

- [Authorization](authorization.html)
- [`GRANT <roles>`](grant-roles.html)
- [`GRANT <privileges>`](grant.html)
- [`REVOKE <privileges>`](revoke.html)
- [`SHOW GRANTS`](show-grants.html)
- [`SHOW ROLES`](show-roles.html)
- [`CREATE USER`](create-user.html)
- [`DROP USER`](drop-user.html)
- [Other SQL Statements](sql-statements.html)
