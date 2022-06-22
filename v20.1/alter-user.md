---
title: ALTER USER
summary: The ALTER USER statement can be used to add or change a user's password.
toc: true
---

The `ALTER USER` [statement](sql-statements.html) can be used to add, change, or remove a [user's](create-user.html) password and to change the login privileges for a user.

{{site.data.alerts.callout_info}}
<span class="version-tag">New in v20.1</span>: Since the keywords `ROLE` and `USER` can now be used interchangeably in SQL statements for enhanced Postgres compatibility, `ALTER USER` is now an alias for [`ALTER ROLE`](alter-role.html).
{{site.data.alerts.end}}

## Considerations

- Password creation and alteration is supported only in secure clusters.

## Required privileges

<span class="version-tag">New in v20.1:</span> To alter other users, the user must have the [`CREATEROLE`](create-user.html#allow-the-user-to-create-other-users) parameter set.

## Synopsis

<div>{% include {{ page.version.version }}/sql/diagrams/alter_user_password.html %}</div>

## Parameters

<style>
table td:first-child {
    min-width: 225px;
}
</style>

Parameter | Description
----------|-------------
`name` | The name of the user whose password you want to create or add.
`password` | Let the user [authenticate their access to a secure cluster](authentication.html#client-authentication) using this new password. Passwords should be entered as a [string literal](sql-constants.html#string-literals). For compatibility with PostgreSQL, a password can also be entered as an [identifier](#change-password-using-an-identifier). <br><br>To prevent a user from using [password authentication](authentication.html#client-authentication) and to mandate [certificate-based client authentication](authentication.html#client-authentication), [set the password as `NULL`](#prevent-a-user-from-using-password-authentication).
`VALID UNTIL` | <span class="version-tag">New in v20.1:</span> The date and time (in the [`timestamp`](timestamp.html) format) after which the password is not valid.
`LOGIN`/`NOLOGIN` | <span class="version-tag">New in v20.1:</span> The `LOGIN` parameter allows a user to login with one of the [client authentication methods](authentication.html#client-authentication). [Setting the parameter to `NOLOGIN`](#change-login-privileges-for-a-user) prevents the user from logging in using any authentication method.
`CREATEROLE`/`NOCREATEROLE` | <span class="version-tag">New in v20.1:</span> Allow or disallow the user to create, alter, and drop other users. <br><br>By default, the parameter is set to `NOCREATEROLE` for all non-admin and non-root users.

## Examples

### Change password using a string literal

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER USER carl WITH PASSWORD 'ilov3beefjerky';
~~~
~~~
ALTER USER 1
~~~

### Change password using an identifier

The following statement changes the password to `ilov3beefjerky`, as above:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER USER carl WITH PASSWORD ilov3beefjerky;
~~~

This is equivalent to the example in the previous section because the password contains only lowercase characters.

In contrast, the following statement changes the password to `thereisnotomorrow`, even though the password in the syntax contains capitals, because identifiers are normalized automatically:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER USER carl WITH PASSWORD ThereIsNoTomorrow;
~~~

To preserve case in a password specified using identifier syntax, use double quotes:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER USER carl WITH PASSWORD "ThereIsNoTomorrow";
~~~

### Set password validity

The following statement sets the date and time after which the password is not valid:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER USER carl VALID UNTIL '2021-01-01';
~~~

### Prevent a user from using password authentication

The following statement prevents the user from using password authentication and mandates certificate-based client authentication:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER USER carl WITH PASSWORD NULL;
~~~

### Change login privileges for a user

The following statement prevents the user from logging in with any [client authentication method](authentication.html#client-authentication):

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER USER carl NOLOGIN;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW USERS;
~~~

~~~
  username |  options   | member_of
-----------+------------+------------
  admin    | CREATEROLE | {}
  carl     | NOLOGIN    | {}
  root     | CREATEROLE | {admin}
(3 rows)
~~~

The following statement allows the user to log in with one of the client authentication methods:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER USER carl LOGIN;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW USERS;
~~~

~~~
  username |  options   | member_of
-----------+------------+------------
  admin    | CREATEROLE | {}
  carl     |            | {}
  root     | CREATEROLE | {admin}
(3 rows)
~~~

## See also

- [`DROP USER`](drop-user.html)
- [`SHOW USERS`](show-users.html)
- [`GRANT <privileges>`](grant.html)
- [`SHOW GRANTS`](show-grants.html)
- [Create Security Certificates](cockroach-cert.html)
- [Other SQL Statements](sql-statements.html)
