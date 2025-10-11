---
title: REVOKE &lt;roles&gt;
summary: The REVOKE <roles> statement revokes privileges from users and/or roles.
toc: true
---

<span class="version-tag">New in v2.0:</span> The `REVOKE <roles>` [statement](sql-statements.html) lets you revoke a [role](roles.html) or [user's](create-and-manage-users.html) membership to a role.

{{site.data.alerts.callout_info}}<code>REVOKE &lt;roles&gt;</code> is an <a href="enterprise-licensing.html">enterprise-only</a> feature.{{site.data.alerts.end}}


## Synopsis

<section>{% include {{ page.version.version }}/sql/diagrams/revoke_roles.html %}</section>

## Required Privileges

The user revoking role membership must be a role admin (i.e., members with the `ADMIN OPTION`) or a superuser (i.e., a member of the `admin` role).

## Considerations

- The `root` user cannot be revoked from the `admin` role.

## Parameters

Parameter | Description
----------|------------
`ADMIN OPTION` | Revoke the user's role admin status.
`role_name` | The name of the role from which you want to remove members. To revoke members from multiple roles, use a comma-separated list of role names.
`user_name` | The name of the [user](create-and-manage-users.html) or [role](roles.html) from whom you want to revoke membership. To revoke multiple members, use a comma-separated list of user and/or role names.

## Examples

### Revoke Role Membership

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
~~~ sql
> REVOKE design FROM lola;
~~~

{% include_cached copy-clipboard.html %}
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

### Revoke the Admin Option

To revoke a user or role's admin option from a role (without revoking the membership):
{% include_cached copy-clipboard.html %}
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

## See Also

- [Privileges](privileges.html)
- [`GRANT <roles>` (Enterprise)](grant-roles.html)
- [`GRANT <privileges>`](grant.html)
- [`REVOKE <privileges>`](revoke.html)
- [`SHOW GRANTS`](show-grants.html)
- [`SHOW ROLES`](show-roles.html)
- [`CREATE USER`](create-user.html)
- [`DROP USER`](drop-user.html)
- [Roles](roles.html)
- [Other SQL Statements](sql-statements.html)
