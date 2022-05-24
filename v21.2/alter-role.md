---
title: ALTER ROLE
summary: The ALTER ROLE statement can be used to add or change a role's password.
toc: true
docs_area: reference.sql
---

Use the `ALTER ROLE` [statement](sql-statements.html) to add, change, or remove a [role's](create-role.html) password, change the role options for a role, and set default [session variable](set-vars.html) values for a role.

{{site.data.alerts.callout_info}}
Since the keywords `ROLE` and `USER` can now be used interchangeably in SQL statements for enhanced PostgreSQL compatibility, `ALTER ROLE` is now an alias for [`ALTER USER`](alter-user.html).
{{site.data.alerts.end}}

## Considerations

- Password creation and alteration is supported only in secure clusters.

## Required privileges

- To alter an [`admin` role](security-reference/authorization.html#admin-role), the user must be a member of the `admin` role.
- To alter other roles, the user must be a member of the `admin` role or have the [`CREATEROLE`](create-role.html#create-a-role-that-can-create-other-roles-and-manage-authentication-methods-for-the-new-roles) role option set.

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-21.2/grammar_svg/alter_role.html %}
</div>

## Parameters

<style>
table td:first-child {
    min-width: 225px;
}
</style>

Parameter | Description
----------|-------------
`role_name` | The name of the role to alter.
`WITH role_option` | Apply a [role option](#role-options) to the role.
`SET var_name ... var_value` | <span class="version-tag">New in v21.2</span>: Set default [session variable](set-vars.html) values for a role.
`RESET session_var`<br>`RESET ALL` <a name="parameters-reset"></a> | <span class="version-tag">New in v21.2</span>: Reset one session variable or all session variables to the default value.
`IN DATABASE database_name` | <span class="version-tag">New in v21.2</span>: Specify a database for which to apply session variable defaults.<br>When `IN DATABASE` is not specified, the default session variable values apply for a role in all databases.<br>Note that, in order for a session to initialize session variable values to database defaults, the database must be specified as a [connection parameter](connection-parameters.html). Database default values will not appear if the database is set after connection with `USE <dbname>`/`SET database=<dbname>`.
`ROLE ALL ...`/`USER ALL ...` | <span class="version-tag">New in v21.2</span>: Apply session variable settings to all roles.<br>Exception: The `root` user is exempt from session variable settings.

### Role options

Role option | Description
------------|-------------
`CANCELQUERY`/`NOCANCELQUERY` | Allow or disallow the role to cancel [queries](cancel-query.html) and [sessions](cancel-session.html) of other roles. Without this role option, roles can only cancel their own queries and sessions. Even with this role option, non-admins cannot cancel admin queries or sessions. This option should usually be combined with `VIEWACTIVITY` so that the role can view other roles' query and session information. <br><br>By default, the role option is set to `NOCANCELQUERY` for all non-admin roles.
`CONTROLCHANGEFEED`/`NOCONTROLCHANGEFEED` | Allow or disallow the role to run [`CREATE CHANGEFEED`](create-changefeed.html) on tables they have `SELECT` privileges on. <br><br>By default, the role option is set to `NOCONTROLCHANGEFEED` for all non-admin roles.
`CONTROLJOB`/`NOCONTROLJOB` | Allow or disallow the role to [pause](pause-job.html), [resume](resume-job.html), and [cancel](cancel-job.html) jobs. Non-admin roles cannot control jobs created by admins. <br><br>By default, the role option is set to `NOCONTROLJOB` for all non-admin roles.
`CREATEDB`/`NOCREATEDB` | Allow or disallow the role to [create](create-database.html) or [rename](rename-database.html) a database. The role is assigned as the owner of the database. <br><br>By default, the role option is set to `NOCREATEDB` for all non-admin roles.
`CREATELOGIN`/`NOCREATELOGIN` | Allow or disallow the role to manage authentication using the `WITH PASSWORD`, `VALID UNTIL`, and `LOGIN/NOLOGIN` role options. <br><br>By default, the role option is set to `NOCREATELOGIN` for all non-admin roles.
`CREATEROLE`/`NOCREATEROLE` |  Allow or disallow the new role to create, [alter](alter-role.html), and [drop](drop-role.html) other non-admin roles. <br><br>By default, the role option is set to `NOCREATEROLE` for all non-admin users.
`LOGIN`/`NOLOGIN` | Allow or disallow a role to log in with one of the [client authentication methods](authentication.html#client-authentication). Setting the role option to `NOLOGIN` prevents the role from logging in using any authentication method.
`MODIFYCLUSTERSETTING`/`NOMODIFYCLUSTERSETTING` | Allow or disallow the role to modify the [cluster settings](cluster-settings.html) with the `sql.defaults` prefix. <br><br>By default, the role option is set to `NOMODIFYCLUSTERSETTING` for all non-admin roles.
`PASSWORD password`/`PASSWORD NULL` | The credential the role uses to [authenticate their access to a secure cluster](authentication.html#client-authentication). A password should be entered as a [string literal](sql-constants.html#string-literals). For compatibility with PostgreSQL, a password can also be entered as an identifier. <br><br>To prevent a role from using [password authentication](authentication.html#client-authentication) and to mandate [certificate-based client authentication](authentication.html#client-authentication), [set the password as `NULL`](create-role.html#prevent-a-role-from-using-password-authentication).
`SQLLOGIN`/`NOSQLLOGIN` | Allow or disallow a role to log in using the SQL CLI with one of the [client authentication methods](authentication.html#client-authentication). The role option to `NOSQLLOGIN` prevents the role from logging in using the SQL CLI with any authentication method while retaining the ability to log in to DB Console. It is possible to have both `NOSQLLOGIN` and `LOGIN` set for a role and `NOSQLLOGIN` takes precedence on restrictions. <br><br>Without any role options all login behavior is permitted.
`VALID UNTIL` |  The date and time (in the [`timestamp`](timestamp.html) format) after which the [password](#parameters) is not valid.
`VIEWACTIVITY`/`NOVIEWACTIVITY` | Allow or disallow a role to see other roles' [queries](show-statements.html) and [sessions](show-sessions.html) using `SHOW STATEMENTS`, `SHOW SESSIONS`, and the [**Statements**](ui-statements-page.html) and [**Transactions**](ui-transactions-page.html) pages in the DB Console. `VIEWACTIVITY` also permits visibility of node hostnames and IP addresses in the DB Console. With `NOVIEWACTIVITY`, the `SHOW` commands show only the role's own data, and DB Console pages redact node hostnames and IP addresses.<br><br>By default, the role option is set to `NOVIEWACTIVITY` for all non-`admin` roles.
`VIEWACTIVITYREDACTED`/`NOVIEWACTIVITYREDACTED` | Allow or disallow a role to see other roles' queries and sessions using `SHOW STATEMENTS`, `SHOW SESSIONS`, and the Statements and Transactions pages in the DB Console. With `VIEWACTIVITYREDACTED`, a user won't have access to the usage of statements diagnostics bundle, which can contain PII information, in the DB Console. It is possible to have both `VIEWACTIVITY` and `VIEWACTIVITYREDACTED`, and `VIEWACTIVITYREDACTED` takes precedence on restrictions. If the user has `VIEWACTIVITY` but doesn't have `VIEWACTIVITYREDACTED`, they will be able to see DB Console pages and have access to the statements diagnostics bundle. <br><br>By default, the role option is set to `NOVIEWACTIVITYREDACTED` for all non-admin roles.

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

### Set default session variable values for a role

In the following example, the `root` user creates a role named `max`, and sets the default value of the `timezone` [session variable](set-vars.html#supported-variables) for the `max` role.

~~~ sql
root@:26257/defaultdb> CREATE ROLE max WITH LOGIN;
~~~

~~~ sql
root@:26257/defaultdb> ALTER ROLE max SET timezone = 'America/New_York';
~~~

This statement does not affect the default `timezone` value for any role other than `max`:

~~~ sql
root@:26257/defaultdb> SHOW timezone;
~~~

~~~
  timezone
------------
  UTC
(1 row)
~~~

To see the default `timezone` value for the `max` role, run the `SHOW` statement as a member of the `max` role:

~~~ sql
max@:26257/defaultdb> SHOW timezone;
~~~

~~~
      timezone
--------------------
  America/New_York
(1 row)
~~~

### Set default session variable values for a role in a specific database

In the following example, the `root` user creates a role named `max` and a database named `movr`, and sets the default value of the `statement_timeout` [session variable](set-vars.html#supported-variables) for the `max` role in the `movr` database.

~~~ sql
root@:26257/defaultdb> CREATE DATABASE movr;
~~~

~~~ sql
root@:26257/defaultdb> CREATE ROLE max WITH LOGIN;
~~~

~~~ sql
root@:26257/defaultdb> ALTER ROLE max IN DATABASE movr SET statement_timeout = '10s';
~~~

This statement does not affect the default `statement_timeout` value for any role other than `max`, or in any database other than `movr`.

~~~ sql
root@:26257/defaultdb> SHOW statement_timeout;
~~~

~~~
  statement_timeout
---------------------
  0
(1 row)
~~~

To see the new default `statement_timeout` value for the `max` role, run the `SHOW` statement as a member of the `max` role that has connected to the cluster, with the database `movr` specified in the connection string.

~~~ shell
cockroach sql --url 'postgresql://max@localhost:26257/movr?sslmode=disable'
~~~

~~~ sql
max@:26257/movr> SHOW statement_timeout;
~~~

~~~
  statement_timeout
---------------------
  10000
(1 row)
~~~

### Set default session variable values for a specific database

In the following example, the `root` user creates a database named `movr`, and sets the default value of the `timezone` [session variable](set-vars.html#supported-variables) for all roles in that database.

~~~ sql
root@:26257/defaultdb> CREATE DATABASE movr;
~~~

~~~ sql
root@:26257/defaultdb> ALTER ROLE ALL IN DATABASE movr SET timezone = 'America/New_York';
~~~

{{site.data.alerts.callout_info}}
This statement is identical to [`ALTER DATABASE movr SET timezone = 'America/New_York';`](alter-database.html).
{{site.data.alerts.end}}

This statement does not affect the default `timezone` value for any database other than `movr`:

~~~ sql
root@:26257/defaultdb> SHOW timezone;
~~~

~~~
  timezone
------------
  UTC
(1 row)
~~~

To see the default `timezone` value for the `max` role, run the `SHOW` statement as a member of the `max` role:

~~~ sql
root@:26257/movr> SHOW timezone;
~~~

~~~
      timezone
--------------------
  America/New_York
(1 row)
~~~

## See also

- [`DROP ROLE`](drop-role.html)
- [`SHOW ROLES`](show-roles.html)
- [`GRANT`](grant.html)
- [`SHOW GRANTS`](show-grants.html)
- [`cockroach cert`](cockroach-cert.html)
- [SQL Statements](sql-statements.html)
- [Authorization Best Practices](security-reference/authorization.html#authorization-best-practices)

