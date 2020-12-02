---
title: GRANT &lt;roles&gt;
summary: The GRANT <roles> statement grants user privileges for interacting with specific databases and tables.
toc: true
---

The `GRANT <roles>` [statement](sql-statements.html) lets you add a [role](authorization.html#create-and-manage-roles) or [user](authorization.html#create-and-manage-users) as a member to a role.

{{site.data.alerts.callout_info}}
 <code>GRANT &lt;roles&gt;</code> is no longer an enterprise feature and is now freely available in the core version of CockroachDB.
{{site.data.alerts.end}}

## Synopsis

<section>{% include {{ page.version.version }}/sql/diagrams/grant_roles.html %}</section>

## Required privileges

The user granting role membership must be a role admin (i.e., members with the `WITH ADMIN OPTION`) or a member of the `admin` role.

To grant membership to the `admin` role, the user must have `WITH ADMIN OPTION` on the `admin` role.

## Considerations

- Users and roles can be members of roles.
- The `root` user is automatically created as an `admin` role and assigned the `ALL` privilege for new databases.
- All privileges of a role are inherited by all its members.
- Membership loops are not allowed (direct: `A is a member of B is a member of A` or indirect: `A is a member of B is a member of C ... is a member of A`).

## Parameters

Parameter | Description
----------|------------
`role_name` | The name of the role to which you want to add members. To add members to multiple roles, use a comma-separated list of role names.
`user_name` | The name of the [user](authorization.html#create-and-manage-users) or [role](authorization.html#create-and-manage-roles) to whom you want to grant membership. To add multiple members, use a comma-separated list of user and/or role names.
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
- [`REVOKE <roles>`](revoke-roles.html)
- [`GRANT <privileges>`](grant.html)
- [`REVOKE <privileges>`](revoke.html)
- [`SHOW GRANTS`](show-grants.html)
- [`SHOW ROLES`](show-roles.html)
- [Manage Users](authorization.html#create-and-manage-users)
