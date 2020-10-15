---
title: ALTER ROLE
summary: The ALTER ROLE statement can be used to add or change a role's password.
toc: true
---

 The `ALTER ROLE` [statement](sql-statements.html) can be used to add, change, or remove a [role's](create-role.html) password and to change the privileges for a role.

{{site.data.alerts.callout_info}}
Since the keywords `ROLE` and `USER` can now be used interchangeably in SQL statements for enhanced Postgres compatibility, `ALTER ROLE` is now an alias for [`ALTER USER`](alter-user.html).
{{site.data.alerts.end}}

## Considerations

- Password creation and alteration is supported only in secure clusters.

## Required privileges

 To alter other roles, the role must be a member of the `admin` role or have the [`CREATEROLE`](create-role.html#create-a-role-that-can-create-other-roles-and-manage-authentication-methods-for-the-new-roles) parameter set.

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
`name` | The name of the role whose role options you want to alter.
`CREATELOGIN`/`NOCREATELOGIN` | Allow or disallow the role to manage authentication using the `WITH PASSWORD`, `VALID UNTIL`, and `LOGIN/NOLOGIN` parameters. <br><br>By default, the parameter is set to `NOCREATELOGIN` for all non-admin roles.
`LOGIN`/`NOLOGIN` | The `LOGIN` parameter allows a role to login with one of the [client authentication methods](authentication.html#client-authentication). Setting the parameter to `NOLOGIN` prevents the role from logging in using any authentication method.
`password` | Let the role [authenticate their access to a secure cluster](authentication.html#client-authentication) using this new password. Passwords should be entered as a [string literal](sql-constants.html#string-literals). For compatibility with PostgreSQL, a password can also be entered as an identifier. <br><br>To prevent a role from using [password authentication](authentication.html#client-authentication) and to mandate [certificate-based client authentication](authentication.html#client-authentication), [set the password as `NULL`](#prevent-a-role-from-using-password-authentication).
`VALID UNTIL` | The date and time (in the [`timestamp`](timestamp.html) format) after which the password is not valid.
`CREATEROLE`/`NOCREATEROLE` | Allow or disallow the role to create, alter, and drop other non-admin roles. <br><br>By default, the parameter is set to `NOCREATEROLE` for all non-admin roles.
`CREATEDB`/`NOCREATEDB` | Allow or disallow the role to create or rename a database. The role is assigned as the owner of the database. <br><br>By default, the parameter is set to `NOCREATEDB` for all non-admin roles.
`CONTROLJOB`/`NOCONTROLJOB` | Allow or disallow the role to pause, resume, and cancel jobs. Non-admin roles cannot control jobs created by admins. <br><br>By default, the parameter is set to `NOCONTROLJOB` for all non-admin roles.
`CANCELQUERY`/`NOCANCELQUERY` | Allow or disallow the role to cancel queries and sessions of other roles. Without this privilege, roles can only cancel their own queries and sessions. Even with this privilege, non-admins cannot cancel admin queries or sessions. This option should usually be combined with `VIEWACTIVITY` so that the role can view other roles' query and session information. <br><br>By default, the parameter is set to `NOCANCELQUERY` for all non-admin roles.
`VIEWACTIVITY`/`NOVIEWACTIVITY` | Allow or disallow a role to see other roles' queries and sessions using `SHOW QUERIES`, `SHOW SESSIONS`, and the Statements and Transactions pages in the Admin UI. Without this privilege, the `SHOW` commands only show the role's own data and the Admin UI pages are unavailable. <br><br>By default, the parameter is set to `NOVIEWACTIVITY` for all non-admin roles.
`CONTROLCHANGEFEED`/`NOCONTROLCHANGEFEED` | Allow or disallow the role to run `CREATE CHANGEFEED` on tables they have `SELECT` privileges on. <br><br>By default, the parameter is set to `NOCONTROLCHANGEFEED` for all non-admin roles.
`MODIFYCLUSTERSETTING`/`NOMODIFYCLUSTERSETTING` | Allow or disallow the role to to modify the cluster settings with the `sql.defaults` prefix. <br><br>By default, the parameter is set to `NOMODIFYCLUSTERSETTING` for all non-admin roles.

## Examples

{{site.data.alerts.callout_info}}
The following statements are run by the `root` user that is a member of the `admin` role and has `ALL` privileges.
{{site.data.alerts.end}}

### Allow a role to log in to the database using a password

~~~ sql
root@:26257/defaultdb> ALTER ROLE carl WITH LOGIN PASSWORD 'An0ther$tr0nGpassW0rD' VALID UNTIL '2021-10-10';
~~~

### Prevent a role from using password authentication

The following statement prevents the user from using password authentication and mandates certificate-based client authentication:

{% include copy-clipboard.html %}
~~~ sql
root@:26257/defaultdb> ALTER ROLE carl WITH PASSWORD NULL;
~~~

### Allow a role to create other roles and manage authentication methods for the new roles

~~~ sql
root@:26257/defaultdb> ALTER ROLE carl WITH CREATEROLE;
~~~

### Allow a role to only manage authentication for other roles

~~~ sql
root@:26257/defaultdb> ALTER ROLE carl WITH CREATELOGIN;
~~~

### Allow a role to create and rename databases

~~~ sql
root@:26257/defaultdb> ALTER ROLE carl WITH CREATEDB;
~~~

### Allow a role to pause, resume, and cancel non-admin jobs

~~~ sql
root@:26257/defaultdb> ALTER ROLE carl WITH CONTROLJOB;
~~~

### Allow a role to see and cancel non-admin queries and sessions

~~~ sql
root@:26257/defaultdb> ALTER ROLE carl WITH CANCELQUERY VIEWACTIVITY;
~~~

### Allow a role to control changefeeds

~~~ sql
root@:26257/defaultdb> ALTER ROLE carl WITH CONTROLCHANGEFEED;
~~~

### Allow a role to modify cluster settings

~~~ sql
root@:26257/defaultdb> ALTER ROLE carl WITH MODIFYCLUSTERSETTING;
~~~


<!--

### Change password using a string literal

{% include copy-clipboard.html %}
~~~ sql
> ALTER ROLE carl WITH PASSWORD 'ilov3beefjerky';
~~~

### Change password using an identifier

The following statement changes the password to `ilov3beefjerky`, as above:

{% include copy-clipboard.html %}
~~~ sql
> ALTER ROLE carl WITH PASSWORD ilov3beefjerky;
~~~

This is equivalent to the example in the previous section because the password contains only lowercase characters.

In contrast, the following statement changes the password to `thereisnotomorrow`, even though the password in the syntax contains capitals, because identifiers are normalized automatically:

{% include copy-clipboard.html %}
~~~ sql
> ALTER ROLE carl WITH PASSWORD ThereIsNoTomorrow;
~~~

To preserve case in a password specified using identifier syntax, use double quotes:

{% include copy-clipboard.html %}
~~~ sql
> ALTER ROLE carl WITH PASSWORD "ThereIsNoTomorrow";
~~~

### Set password validity

The following statement sets the date and time after which the password is not valid:

{% include copy-clipboard.html %}
~~~ sql
> ALTER ROLE carl VALID UNTIL '2021-01-01';
~~~

### Prevent a role from using password authentication

The following statement prevents the role from using password authentication and mandates certificate-based client authentication:

{% include copy-clipboard.html %}
~~~ sql
> ALTER ROLE carl WITH PASSWORD NULL;
~~~

### Change login privileges for a role

The following statement prevents the role from logging in with any [client authentication method](authentication.html#client-authentication):

{% include copy-clipboard.html %}
~~~ sql
> ALTER ROLE carl NOLOGIN;
~~~

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
~~~ sql
> ALTER ROLE carl LOGIN;
~~~

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
~~~ sql
> ALTER ROLE carl with CREATEROLE;
~~~

{% include copy-clipboard.html %}
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

-->


## See also

- [`DROP ROLE`](drop-role.html)
- [`SHOW ROLES`](show-roles.html)
- [`GRANT <privileges>`](grant.html)
- [`SHOW GRANTS`](show-grants.html)
- [Create Security Certificates](cockroach-cert.html)
- [Other SQL Statements](sql-statements.html)
