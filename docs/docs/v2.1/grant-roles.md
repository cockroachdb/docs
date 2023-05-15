---
title: GRANT &lt;roles&gt;
summary: The GRANT <roles> statement grants user privileges for interacting with specific databases and tables.
toc: true
---

The `GRANT <roles>` [statement](sql-statements.html) lets you add a [role](authorization.html#create-and-manage-roles) or [user](create-and-manage-users.html) as a member to a role.

{{site.data.alerts.callout_info}}<code>GRANT &lt;roles&gt;</code> is an <a href="enterprise-licensing.html">enterprise-only</a> feature.{{site.data.alerts.end}}


## Synopsis

<section>{% include {{ page.version.version }}/sql/diagrams/grant_roles.html %}</section>

## Required privileges

The user granting role membership must be a role admin (i.e., members with the `ADMIN OPTION`) or a superuser (i.e., a member of the `admin` role).

## Considerations

- Users and roles can be members of roles.
- The `root` user is automatically created as an `admin` role and assigned the `ALL` privilege for new databases.
- All privileges of a role are inherited by all its members.
- Membership loops are not allowed (direct: `A is a member of B is a member of A` or indirect: `A is a member of B is a member of C ... is a member of A`).

## Parameters

Parameter | Description
----------|------------
`role_name` | The name of the role to which you want to add members. To add members to multiple roles, use a comma-separated list of role names.
`user_name` | The name of the [user](create-and-manage-users.html) or [role](authorization.html#create-and-manage-roles) to whom you want to grant membership. To add multiple members, use a comma-separated list of user and/or role names.
`WITH ADMIN OPTION` | Designate the user as an role admin. Role admins can grant or revoke membership for the specified role.

## Examples

### Grant role membership

{% include copy-clipboard.html %}
~~~ sql
> GRANT design TO ernie;
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
| design | ernie   | false   |
| design | lola    | false   |
| design | lucky   | false   |
+--------+---------+---------+
~~~

### Grant the admin option

{% include copy-clipboard.html %}
~~~ sql
> GRANT design TO ERNIE WITH ADMIN OPTION;
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
| design | lola    | false   |
| design | lucky   | false   |
+--------+---------+---------+
~~~

## See also

- [Authorization](authorization.html)
- [`REVOKE <roles>` (Enterprise)](revoke-roles.html)
- [`GRANT <privileges>`](grant.html)
- [`REVOKE <privileges>`](revoke.html)
- [`SHOW GRANTS`](show-grants.html)
- [`SHOW ROLES`](show-roles.html)
- [Manage Users](create-and-manage-users.html)
- [Manage Roles](authorization.html#create-and-manage-roles)
