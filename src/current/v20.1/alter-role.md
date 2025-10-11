---
title: ALTER ROLE
summary: The ALTER ROLE statement can be used to add or change a role's password.
toc: true
---

<span class="version-tag">New in v20.1</span>: The `ALTER ROLE` [statement](sql-statements.html) can be used to add, change, or remove a [role's](create-role.html) password and to change the login privileges for a role.

{{site.data.alerts.callout_info}}
Since the keywords `ROLE` and `USER` can now be used interchangeably in SQL statements for enhanced Postgres compatibility, `ALTER ROLE` is now an alias for [`ALTER USER`](alter-user.html).
{{site.data.alerts.end}}

## Considerations

- Password creation and alteration is supported only in secure clusters.

## Required privileges

<span class="version-tag">New in v20.1:</span> To alter other roles, the role must have the [`CREATEROLE`](create-role.html#allow-the-role-to-create-other-roles) parameter set.

## Synopsis

<div>{% include {{ page.version.version }}/sql/diagrams/alter_role.html %}</div>

## Parameters

<style>
table td:first-child {
    min-width: 225px;
}
</style>

Parameter | Description
----------|-------------
`name` | The name of the role whose password you want to create or add.
`password` | Let the role [authenticate their access to a secure cluster](authentication.html#client-authentication) using this new password. Passwords should be entered as a [string literal](sql-constants.html#string-literals). For compatibility with PostgreSQL, a password can also be entered as an [identifier](#change-password-using-an-identifier). <br><br>To prevent a role from using [password authentication](authentication.html#client-authentication) and to mandate [certificate-based client authentication](authentication.html#client-authentication), [set the password as `NULL`](#prevent-a-role-from-using-password-authentication).
`VALID UNTIL` | The date and time (in the [`timestamp`](timestamp.html) format) after which the password is not valid.
`LOGIN`/`NOLOGIN` | The `LOGIN` parameter allows a role to login with one of the [client authentication methods](authentication.html#client-authentication). [Setting the parameter to `NOLOGIN`](#change-login-privileges-for-a-role) prevents the role from logging in using any authentication method.
`CREATEROLE`/`NOCREATEROLE` | Allow or disallow the role to create, alter, and drop other roles. <br><br>By default, the parameter is set to `NOCREATEROLE` for all non-admin and non-root roles.

## Examples

### Change password using a string literal

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER ROLE carl WITH PASSWORD 'ilov3beefjerky';
~~~
~~~
ALTER ROLE 1
~~~

### Change password using an identifier

The following statement changes the password to `ilov3beefjerky`, as above:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER ROLE carl WITH PASSWORD ilov3beefjerky;
~~~

This is equivalent to the example in the previous section because the password contains only lowercase characters.

In contrast, the following statement changes the password to `thereisnotomorrow`, even though the password in the syntax contains capitals, because identifiers are normalized automatically:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER ROLE carl WITH PASSWORD ThereIsNoTomorrow;
~~~

To preserve case in a password specified using identifier syntax, use double quotes:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER ROLE carl WITH PASSWORD "ThereIsNoTomorrow";
~~~

### Set password validity

The following statement sets the date and time after which the password is not valid:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER ROLE carl VALID UNTIL '2021-01-01';
~~~

### Prevent a role from using password authentication

The following statement prevents the role from using password authentication and mandates certificate-based client authentication:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER ROLE carl WITH PASSWORD NULL;
~~~

### Change login privileges for a role

The following statement prevents the role from logging in with any [client authentication method](authentication.html#client-authentication):

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER ROLE carl NOLOGIN;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW ROLES;
~~~

~~~
  username |  options   | member_of
-----------+------------+------------
  admin    | CREATEROLE | {}
  carl     | NOLOGIN    | {}
  root     | CREATEROLE | {admin}
(3 rows)
~~~

The following statement allows the role to log in with one of the client authentication methods:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER ROLE carl LOGIN;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW ROLES;
~~~

~~~
  username |  options   | member_of
-----------+------------+------------
  admin    | CREATEROLE | {}
  carl     |            | {}
  root     | CREATEROLE | {admin}
(3 rows)
~~~

### Allow the role to create other roles

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW ROLES;
~~~

~~~
  username |  options   | member_of
-----------+------------+------------
  admin    | CREATEROLE | {}
  carl     |            | {}
  root     | CREATEROLE | {admin}
(3 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER ROLE carl with CREATEROLE;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW ROLES;
~~~

~~~
  username |  options   | member_of
-----------+------------+------------
  admin    | CREATEROLE | {}
  carl     | CREATEROLE | {}
  root     | CREATEROLE | {admin}
(3 rows)
~~~


## See also

- [`DROP ROLE`](drop-role.html)
- [`SHOW ROLES`](show-roles.html)
- [`GRANT <privileges>`](grant.html)
- [`SHOW GRANTS`](show-grants.html)
- [Create Security Certificates](cockroach-cert.html)
- [Other SQL Statements](sql-statements.html)
