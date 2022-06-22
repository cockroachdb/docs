---
title: CREATE ROLE (Enterprise)
summary: The CREATE ROLE statement creates SQL roles, which are groups containing any number of roles and users as members.
toc: true
---

The `CREATE ROLE` [statement](sql-statements.html) creates SQL [roles](authorization.html#create-and-manage-roles), which are groups containing any number of roles and users as members. You can assign privileges to roles, and all members of the role (regardless of whether if they are direct or indirect members) will inherit the role's privileges.

{{site.data.alerts.callout_info}}<code>CREATE ROLE</code> is an <a href="enterprise-licensing.html">enterprise-only</a> feature.{{site.data.alerts.end}}


## Considerations

- Role names:
    - Are case-insensitive
    - Must start with either a letter or underscore
    - Must contain only letters, numbers, or underscores
    - Must be between 1 and 63 characters.
- After creating roles, you must [grant them privileges to databases and tables](grant.html).
- Roles and users can be members of roles.
- Roles and users share the same namespace and must be unique.
- All privileges of a role are inherited by all of its members.
- There is no limit to the number of members in a role.
- Roles cannot log in. They do not have a password and cannot use certificates.
- Membership loops are not allowed (direct: `A is a member of B is a member of A` or indirect: `A is a member of B is a member of C ... is a member of A`).

## Required privileges

Roles can only be created by superusers, i.e., members of the `admin` role. The `admin` role exists by default with `root` as the member.

## Synopsis

<section>{% include {{ page.version.version }}/sql/diagrams/create_role.html %}</section>

## Parameters

| Parameter | Description |
------------|--------------
`name` | The name of the role you want to create. Role names are case-insensitive; must start with either a letter or underscore; must contain only letters, numbers, or underscores; and must be between 1 and 63 characters.<br><br>Note that roles and [users](create-user.html) share the same namespace and must be unique.

## Examples

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE ROLE dev_ops;
~~~
~~~
CREATE ROLE 1
~~~

After creating roles, you can [add users to the role](grant-roles.html) and [grant the role privileges](grant.html).

## See also

- [Authorization](authorization.html)
- [`DROP ROLE` (Enterprise)](drop-role.html)
- [`GRANT <privileges>`](grant.html)
- [`REVOKE <privileges>`](revoke.html)
- [`GRANT <roles>`](grant-roles.html)
- [`REVOKE <roles>`](revoke-roles.html)
- [`SHOW ROLES`](show-roles.html)
- [`SHOW USERS`](show-users.html)
- [`SHOW GRANTS`](show-grants.html)
- [Other SQL Statements](sql-statements.html)
