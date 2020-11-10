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

 To alter other users, the user must be a member of the `admin` role or have the [`CREATEROLE`](create-user.html#create-a-user-that-can-create-other-users-and-manage-authentication-methods-for-the-new-users) parameter set.

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
`LOGIN`/`NOLOGIN` | The `LOGIN` parameter allows a user to login with one of the [client authentication methods](authentication.html#client-authentication). Setting the parameter to `NOLOGIN` prevents the user from logging in using any authentication method.
`password` | Let the user [authenticate their access to a secure cluster](authentication.html#client-authentication) using this new password. Passwords should be entered as a [string literal](sql-constants.html#string-literals). For compatibility with PostgreSQL, a password can also be entered as an identifier. <br><br>To prevent a user from using [password authentication](authentication.html#client-authentication) and to mandate [certificate-based client authentication](authentication.html#client-authentication), [set the password as `NULL`](#prevent-a-user-from-using-password-authentication).
`VALID UNTIL` |  The date and time (in the [`timestamp`](timestamp.html) format) after which the password is not valid.
`CREATEROLE`/`NOCREATEROLE` |  Allow or disallow the user to [create](create-user.html), alter, and [drop](drop-user.html) other non-admin users. <br><br>By default, the parameter is set to `NOCREATEROLE` for all non-admin users.
`CREATEDB`/`NOCREATEDB` | Allow or disallow the user to [create](create-database.html) or [rename](rename-database.html) a database. The user is assigned as the owner of the database. <br><br>By default, the parameter is set to `NOCREATEDB` for all non-admin users.
`CONTROLJOB`/`NOCONTROLJOB` | Allow or disallow the user to [pause](pause-job.html), [resume](resume-job.html), and [cancel](cancel-job.html) jobs. Non-admin users cannot control jobs created by admins. <br><br>By default, the parameter is set to `NOCONTROLJOB` for all non-admin users.
`CANCELQUERY`/`NOCANCELQUERY` | Allow or disallow the user to cancel [queries](cancel-query.html) and [sessions](cancel-session.html) of other users. Without this privilege, users can only cancel their own queries and sessions. Even with this privilege, non-admins cannot cancel admin queries or sessions. This option should usually be combined with `VIEWACTIVITY` so that the user can view other users' query and session information. <br><br>By default, the parameter is set to `NOCANCELQUERY` for all non-admin users.
`VIEWACTIVITY`/`NOVIEWACTIVITY` | Allow or disallow a role to see other users' [queries](show-queries.html) and [sessions](show-sessions.html) using `SHOW QUERIES`, `SHOW SESSIONS`, and the [**Statements**](ui-statements-page.html) and **Transactions** pages in the DB Console. Without this privilege, the `SHOW` commands only show the user's own data and the DB Console pages are unavailable. <br><br>By default, the parameter is set to `NOVIEWACTIVITY` for all non-admin users.
`CONTROLCHANGEFEED`/`NOCONTROLCHANGEFEED` | Allow or disallow the user to run [`CREATE CHANGEFEED`](create-changefeed.html) on tables they have `SELECT` privileges on. <br><br>By default, the parameter is set to `NOCONTROLCHANGEFEED` for all non-admin users.
`MODIFYCLUSTERSETTING`/`NOMODIFYCLUSTERSETTING` | Allow or disallow the user to to modify the [cluster settings](cluster-settings.html) with the `sql.defaults` prefix. <br><br>By default, the parameter is set to `NOMODIFYCLUSTERSETTING` for all non-admin users.

## Examples

{{site.data.alerts.callout_info}}
The following statements are run by the `root` user that is a member of the `admin` role and has `ALL` privileges.
{{site.data.alerts.end}}

### Change a user's password

~~~ sql
root@:26257/defaultdb> ALTER USER carl WITH PASSWORD 'An0ther$tr0nGpassW0rD' VALID UNTIL '2021-10-10';
~~~

### Prevent a user from using password authentication

The following statement prevents the user from using password authentication and mandates certificate-based [client authentication](authentication.html#client-authentication):

{% include copy-clipboard.html %}
~~~ sql
root@:26257/defaultdb> ALTER USER carl WITH PASSWORD NULL;
~~~

### Allow a user to create other users and manage authentication methods for the new users

The following example allows the user to [create other users](create-user.html) and [manage authentication methods](authentication.html#client-authentication) for them:

~~~ sql
root@:26257/defaultdb> ALTER USER carl WITH CREATEROLE CREATELOGIN;
~~~

### Allow a user to create and rename databases

The following example allows the user to [create](create-database.html) or [rename](rename-database.html) databases:

~~~ sql
root@:26257/defaultdb> ALTER USER carl WITH CREATEDB;
~~~

### Allow a user to pause, resume, and cancel non-admin jobs

The following example allows the user to [pause](pause-job.html), [resume](resume-job.html), and [cancel](cancel-job.html) jobs:

~~~ sql
root@:26257/defaultdb> ALTER USER carl WITH CONTROLJOB;
~~~

### Allow a user to see and cancel non-admin queries and sessions

The following example allows the user to cancel [queries](cancel-query.html) and [sessions](cancel-session.html) for other non-admin roles:

~~~ sql
root@:26257/defaultdb> ALTER USER carl WITH CANCELQUERY VIEWACTIVITY;
~~~

### Allow a user to control changefeeds

The following example allows the user to run [`CREATE CHANGEFEED`](create-changefeed.html):

~~~ sql
root@:26257/defaultdb> ALTER USER carl WITH CONTROLCHANGEFEED;
~~~

### Allow a user to modify cluster settings

The following example allows the user to modify [cluster settings](cluster-settings.html):

~~~ sql
root@:26257/defaultdb> ALTER USER carl WITH MODIFYCLUSTERSETTING;
~~~

## See also

- [`DROP USER`](drop-user.html)
- [`SHOW USERS`](show-users.html)
- [`GRANT <privileges>`](grant.html)
- [`SHOW GRANTS`](show-grants.html)
- [Create Security Certificates](cockroach-cert.html)
- [Other SQL Statements](sql-statements.html)
