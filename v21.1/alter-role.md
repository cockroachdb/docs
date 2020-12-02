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
`CREATEROLE`/`NOCREATEROLE` | Allow or disallow the role to [create](create-role.html), alter, and [drop](drop-role.html) other non-admin roles. <br><br>By default, the parameter is set to `NOCREATEROLE` for all non-admin roles.
`CREATEDB`/`NOCREATEDB` | Allow or disallow the role to [create](create-database.html) or [rename](rename-database.html) a database. The role is assigned as the owner of the database. <br><br>By default, the parameter is set to `NOCREATEDB` for all non-admin roles.
`CONTROLJOB`/`NOCONTROLJOB` | Allow or disallow the role to [pause](pause-job.html), [resume](resume-job.html), and [cancel](cancel-job.html) jobs. Non-admin roles cannot control jobs created by admins. <br><br>By default, the parameter is set to `NOCONTROLJOB` for all non-admin roles.
`CANCELQUERY`/`NOCANCELQUERY` | Allow or disallow the role to cancel [queries](cancel-query.html) and [sessions](cancel-session.html) of other roles. Without this privilege, roles can only cancel their own queries and sessions. Even with this privilege, non-admins cannot cancel admin queries or sessions. This option should usually be combined with `VIEWACTIVITY` so that the role can view other roles' query and session information. <br><br>By default, the parameter is set to `NOCANCELQUERY` for all non-admin roles.
`VIEWACTIVITY`/`NOVIEWACTIVITY` | Allow or disallow a role to see other roles' [queries](show-queries.html) and [sessions](show-sessions.html) using `SHOW QUERIES`, `SHOW SESSIONS`, and the [**Statements**](ui-statements-page.html) and **Transactions** pages in the DB Console. Without this privilege, the `SHOW` commands only show the role's own data and the DB Console pages are unavailable. <br><br>By default, the parameter is set to `NOVIEWACTIVITY` for all non-admin roles.
`CONTROLCHANGEFEED`/`NOCONTROLCHANGEFEED` | Allow or disallow the role to run [`CREATE CHANGEFEED`](create-changefeed.html) on tables they have `SELECT` privileges on. <br><br>By default, the parameter is set to `NOCONTROLCHANGEFEED` for all non-admin roles.
`MODIFYCLUSTERSETTING`/`NOMODIFYCLUSTERSETTING` | Allow or disallow the role to to modify the [cluster settings](cluster-settings.html) with the `sql.defaults` prefix. <br><br>By default, the parameter is set to `NOMODIFYCLUSTERSETTING` for all non-admin roles.

## Examples

{{site.data.alerts.callout_info}}
The following statements are run by the `root` user that is a member of the `admin` role and has `ALL` privileges.
{{site.data.alerts.end}}

### Allow a role to log in to the database using a password

The following example allows a role to log in to the database with a [password](authentication.html#client-authentication):

~~~ sql
root@:26257/defaultdb> ALTER ROLE carl WITH LOGIN PASSWORD 'An0ther$tr0nGpassW0rD' VALID UNTIL '2021-10-10';
~~~

### Prevent a role from using password authentication

The following statement prevents the user from using password authentication and mandates certificate-based [client authentication](authentication.html#client-authentication):

{% include copy-clipboard.html %}
~~~ sql
root@:26257/defaultdb> ALTER ROLE carl WITH PASSWORD NULL;
~~~

### Allow a role to create other roles and manage authentication methods for the new roles

The following example allows the role to [create other roles](create-role.html) and [manage authentication methods](authentication.html#client-authentication) for them:

~~~ sql
root@:26257/defaultdb> ALTER ROLE carl WITH CREATEROLE CREATELOGIN;
~~~

### Allow a role to create and rename databases

The following example allows the role to [create](create-database.html) or [rename](rename-database.html) databases:

~~~ sql
root@:26257/defaultdb> ALTER ROLE carl WITH CREATEDB;
~~~

### Allow a role to pause, resume, and cancel non-admin jobs

The following example allows the role to [pause](pause-job.html), [resume](resume-job.html), and [cancel](cancel-job.html) jobs:

~~~ sql
root@:26257/defaultdb> ALTER ROLE carl WITH CONTROLJOB;
~~~

### Allow a role to see and cancel non-admin queries and sessions

The following example allows the role to cancel [queries](cancel-query.html) and [sessions](cancel-session.html) for other non-admin roles:

~~~ sql
root@:26257/defaultdb> ALTER ROLE carl WITH CANCELQUERY VIEWACTIVITY;
~~~

### Allow a role to control changefeeds

The following example allows the role to run [`CREATE CHANGEFEED`](create-changefeed.html):

~~~ sql
root@:26257/defaultdb> ALTER ROLE carl WITH CONTROLCHANGEFEED;
~~~

### Allow a role to modify cluster settings

The following example allows the role to modify [cluster settings](cluster-settings.html):

~~~ sql
root@:26257/defaultdb> ALTER ROLE carl WITH MODIFYCLUSTERSETTING;
~~~

## See also

- [`DROP ROLE`](drop-role.html)
- [`SHOW ROLES`](show-roles.html)
- [`GRANT <privileges>`](grant.html)
- [`SHOW GRANTS`](show-grants.html)
- [Create Security Certificates](cockroach-cert.html)
- [Other SQL Statements](sql-statements.html)
