---
title: ALTER USER
summary: The ALTER USER statement can be used to add or change a user's password.
toc: true
---

The `ALTER USER` [statement](sql-statements.html) can be used to add, change, or remove a [user's](create-user.html) password and to change the role options for a user.

{{site.data.alerts.callout_info}}
 Since the keywords `ROLE` and `USER` can now be used interchangeably in SQL statements for enhanced Postgres compatibility, `ALTER USER` is now an alias for [`ALTER ROLE`](alter-role.html).
{{site.data.alerts.end}}

## Considerations

- Password creation and alteration is supported only in secure clusters.

## Required privileges

 To alter other users, the user must have the [`CREATEROLE`](create-user.html#allow-the-user-to-create-other-users) parameter set.

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
`name` | The name of the user whose role options you want to alter.
`CREATELOGIN`/`NOCREATELOGIN` | Allow or disallow the user to manage authentication using the `WITH PASSWORD`, `VALID UNTIL`, and `LOGIN/NOLOGIN` parameters. <br><br>By default, the parameter is set to `NOCREATELOGIN` for all non-admin users.
`LOGIN`/`NOLOGIN` | The `LOGIN` parameter allows a user to login with one of the [client authentication methods](authentication.html#client-authentication). [Setting the parameter to `NOLOGIN`](#change-login-privileges-for-a-role) prevents the user from logging in using any authentication method.
`password` | Let the user [authenticate their access to a secure cluster](authentication.html#client-authentication) using this new password. Passwords should be entered as a [string literal](sql-constants.html#string-literals). For compatibility with PostgreSQL, a password can also be entered as an [identifier](#change-password-using-an-identifier). <br><br>To prevent a user from using [password authentication](authentication.html#client-authentication) and to mandate [certificate-based client authentication](authentication.html#client-authentication), [set the password as `NULL`](#prevent-a-user-from-using-password-authentication).
`VALID UNTIL` |  The date and time (in the [`timestamp`](timestamp.html) format) after which the password is not valid.
`CREATEROLE`/`NOCREATEROLE` |  Allow or disallow the user to create, alter, and drop other non-admin users. <br><br>By default, the parameter is set to `NOCREATEROLE` for all non-admin users.
`CREATEDB`/`NOCREATEDB` | Allow or disallow the user to create or rename a database. The user is assigned as the owner of the database. <br><br>By default, the parameter is set to `NOCREATEDB` for all non-admin users.
`CONTROLJOB`/`NOCONTROLJOB` | Allow or disallow the user to pause, resume, and cancel jobs. Non-admin users cannot control jobs created by admins. <br><br>By default, the parameter is set to `NOCONTROLJOB` for all non-admin users.
`CANCELQUERY`/`NOCANCELQUERY` | Allow or disallow the user to cancel queries and sessions of other users. Without this privilege, users can only cancel their own queries and sessions. Even with this privilege, non-admins cannot cancel admin queries or sessions. This option should usually be combined with `VIEWACTIVITY` so that the user can view other users' query and session information. <br><br>By default, the parameter is set to `NOCANCELQUERY` for all non-admin users.
`VIEWACTIVITY`/`NOVIEWACTIVITY` | Allow or disallow a role to see other users' queries and sessions using `SHOW QUERIES`, `SHOW SESSIONS`, and the Statements and Transactions pages in the Admin UI. Without this privilege, the `SHOW` commands only show the user's own data and the Admin UI pages are unavailable. <br><br>By default, the parameter is set to `NOVIEWACTIVITY` for all non-admin users.
`CONTROLCHANGEFEED`/`NOCONTROLCHANGEFEED` | Allow or disallow the user to run `CREATE CHANGEFEED` on tables they have `SELECT` privileges on. <br><br>By default, the parameter is set to `NOCONTROLCHANGEFEED` for all non-admin users.
`MODIFYCLUSTERSETTING`/`NOMODIFYCLUSTERSETTING` | Allow or disallow the user to to modify the cluster settings with the `sql.defaults` prefix. <br><br>By default, the parameter is set to `NOMODIFYCLUSTERSETTING` for all non-admin users.

## Examples

{{site.data.alerts.callout_info}}
The following statements are run by the `root` user that is a member of the `admin` role and has `ALL` privileges.
{{site.data.alerts.end}}

### Change a user's password

~~~ sql
root@:26257/defaultdb> ALTER USER carl WITH PASSWORD 'An0ther$tr0nGpassW0rD' VALID UNTIL '2021-10-10';
~~~

### Prevent a user from using password authentication

The following statement prevents the user from using password authentication and mandates certificate-based client authentication:

{% include copy-clipboard.html %}
~~~ sql
root@:26257/defaultdb> ALTER USER carl WITH PASSWORD NULL;
~~~

### Allow a user to create other users and manage authentication methods for the new users

~~~ sql
root@:26257/defaultdb> ALTER USER carl WITH CREATEROLE;
~~~

### Allow a user to only manage authentication for other users

~~~ sql
root@:26257/defaultdb> ALTER USER carl WITH CREATELOGIN;
~~~

### Allow a user to create and rename databases

~~~ sql
root@:26257/defaultdb> ALTER USER carl WITH CREATEDB;
~~~

### Allow a user to pause, resume, and cancel non-admin jobs

~~~ sql
root@:26257/defaultdb> ALTER USER carl WITH CONTROLJOB;
~~~

### Allow a user to see and cancel non-admin queries and sessions

~~~ sql
root@:26257/defaultdb> ALTER USER carl WITH CANCELQUERY VIEWACTIVITY;
~~~

### Allow a user to control changefeeds

~~~ sql
root@:26257/defaultdb> ALTER USER carl WITH CONTROLCHANGEFEED;
~~~

### Allow a user to modify cluster settings

~~~ sql
root@:26257/defaultdb> ALTER USER carl WITH MODIFYCLUSTERSETTING;
~~~

<!--

### Change password using a string literal

{% include copy-clipboard.html %}
~~~ sql
> ALTER USER carl WITH PASSWORD 'ilov3beefjerky';
~~~

### Change password using an identifier

The following statement changes the password to `ilov3beefjerky`, as above:

{% include copy-clipboard.html %}
~~~ sql
> ALTER USER carl WITH PASSWORD ilov3beefjerky;
~~~

This is equivalent to the example in the previous section because the password contains only lowercase characters.

In contrast, the following statement changes the password to `thereisnotomorrow`, even though the password in the syntax contains capitals, because identifiers are normalized automatically:

{% include copy-clipboard.html %}
~~~ sql
> ALTER USER carl WITH PASSWORD ThereIsNoTomorrow;
~~~

To preserve case in a password specified using identifier syntax, use double quotes:

{% include copy-clipboard.html %}
~~~ sql
> ALTER USER carl WITH PASSWORD "ThereIsNoTomorrow";
~~~

### Set password validity

The following statement sets the date and time after which the password is not valid:

{% include copy-clipboard.html %}
~~~ sql
> ALTER USER carl VALID UNTIL '2021-01-01';
~~~

### Prevent a user from using password authentication

The following statement prevents the user from using password authentication and mandates certificate-based client authentication:

{% include copy-clipboard.html %}
~~~ sql
> ALTER USER carl WITH PASSWORD NULL;
~~~

### Change login privileges for a user

The following statement prevents the user from logging in with any [client authentication method](authentication.html#client-authentication):

{% include copy-clipboard.html %}
~~~ sql
> ALTER USER carl NOLOGIN;
~~~

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
~~~ sql
> ALTER USER carl LOGIN;
~~~

{% include copy-clipboard.html %}
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

-->

## See also

- [`DROP USER`](drop-user.html)
- [`SHOW USERS`](show-users.html)
- [`GRANT <privileges>`](grant.html)
- [`SHOW GRANTS`](show-grants.html)
- [Create Security Certificates](cockroach-cert.html)
- [Other SQL Statements](sql-statements.html)
