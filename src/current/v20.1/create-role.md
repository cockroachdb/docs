---
title: CREATE ROLE
summary: The CREATE ROLE statement creates SQL roles, which are groups containing any number of roles and users as members.
toc: true
---

The `CREATE ROLE` [statement](sql-statements.html) creates SQL [roles](authorization.html#create-and-manage-roles), which are groups containing any number of roles and users as members. You can assign privileges to roles, and all members of the role (regardless of whether if they are direct or indirect members) will inherit the role's privileges.

{{site.data.alerts.callout_info}}
<span class="version-tag">New in v20.1</span>: <code>CREATE ROLE</code> is no longer an enterprise feature and is now freely available in the core version of CockroachDB. Also, since the keywords `ROLE` and `USER` can now be used interchangeably in SQL statements for enhanced Postgres compatibility, `CREATE ROLE` is now an alias for [`CREATE USER`](create-user.html).
{{site.data.alerts.end}}

## Considerations

- Role names:
    - Are case-insensitive
    - Must start with either a letter or underscore
    - Must contain only letters, numbers, periods, or underscores
    - Must be between 1 and 63 characters.
- After creating roles, you must [grant them privileges to databases and tables](grant.html).
- Roles and users can be members of roles.
- Roles and users share the same namespace and must be unique.
- All privileges of a role are inherited by all of its members.
- There is no limit to the number of members in a role.
- Roles cannot log in. They do not have a password and cannot use certificates.
- Membership loops are not allowed (direct: `A is a member of B is a member of A` or indirect: `A is a member of B is a member of C ... is a member of A`).

## Required privileges

<span class="version-tag">New in v20.1:</span> To create other roles, the role must have the [`CREATEROLE`](#allow-the-role-to-create-other-roles) parameter set.

## Synopsis

<section>{% include {{ page.version.version }}/sql/diagrams/create_role.html %}</section>

## Parameters

| Parameter | Description |
------------|--------------
`name` | The name of the role you want to create. Role names are case-insensitive; must start with either a letter or underscore; must contain only letters, numbers, periods, or underscores; and must be between 1 and 63 characters.<br><br>Note that roles and [users](create-user.html) share the same namespace and must be unique.
`password` | Let the role [authenticate their access to a secure cluster](authentication.html#client-authentication) using this password. Passwords should be entered as a [string literal](sql-constants.html#string-literals). For compatibility with PostgreSQL, a password can also be entered as an [identifier](#create-a-role-with-a-password-using-an-identifier). <br><br>To prevent a role from using [password authentication](authentication.html#client-authentication) and to mandate [certificate-based client authentication](authentication.html#client-authentication), [set the password as `NULL`](#prevent-a-role-from-using-password-authentication).
`VALID UNTIL` | <span class="version-tag">New in v20.1:</span>  The date and time (in the [`timestamp`](timestamp.html) format) after which the password is not valid.
`LOGIN`/`NOLOGIN` | <span class="version-tag">New in v20.1:</span> Allow or disallow a role to login with one of the [client authentication methods](authentication.html#client-authentication). <br><br>By default, the parameter is set to `NOLOGIN` for the `CREATE ROLE` statement.
`CREATEROLE`/`NOCREATEROLE` | <span class="version-tag">New in v20.1:</span> Allow or disallow the new role to create, alter, and drop other roles. <br><br>By default, the parameter is set to `NOCREATEROLE` for all non-admin and non-root users.

## Examples

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE ROLE dev_ops;
~~~
~~~
CREATE ROLE 1
~~~

After creating roles, you can [add users to the role](grant-roles.html) and [grant the role privileges](grant.html).

### Allow the role to create other roles

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE ROLE dev with CREATEROLE;
~~~

### Create a role with a password using a string literal

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE ROLE carl WITH PASSWORD 'ilov3beefjerky';
~~~

~~~
CREATE ROLE 1
~~~

### Create a role with a password using an identifier

The following statement sets the password to `ilov3beefjerky`, as above:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE ROLE carl WITH PASSWORD ilov3beefjerky;
~~~

This is equivalent to the example in the previous section because the password contains only lowercase characters.

In contrast, the following statement sets the password to `thereisnotomorrow`, even though the password in the syntax contains capitals, because identifiers are normalized automatically:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE ROLE carl WITH PASSWORD ThereIsNoTomorrow;
~~~

To preserve case in a password specified using identifier syntax, use double quotes:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE ROLE carl WITH PASSWORD "ThereIsNoTomorrow";
~~~

### Prevent a role from using password authentication

The following statement prevents the role from using password authentication and mandates certificate-based client authentication:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE ROLE carl WITH PASSWORD NULL;
~~~

## See also

- [Authorization](authorization.html)
- [`DROP ROLE`](drop-role.html)
- [`GRANT <privileges>`](grant.html)
- [`REVOKE <privileges>`](revoke.html)
- [`GRANT <roles>`](grant-roles.html)
- [`REVOKE <roles>`](revoke-roles.html)
- [`SHOW ROLES`](show-roles.html)
- [`SHOW USERS`](show-users.html)
- [`SHOW GRANTS`](show-grants.html)
- [Other SQL Statements](sql-statements.html)
