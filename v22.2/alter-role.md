---
title: ALTER ROLE
summary: The ALTER ROLE statement can be used to add or change a role's password.
toc: true
docs_area: reference.sql
---

Use the `ALTER ROLE` [statement](sql-statements.html) to add, change, or remove a [role's](create-role.html) password, change the role options for a role, and set default [session variable](set-vars.html) values for a role.

You can use the keywords `ROLE` and `USER` interchangeably. [`ALTER USER`](alter-user.html) is an alias for `ALTER ROLE`.

## Considerations

- Password creation and alteration is supported only in secure clusters.

## Required privileges

- To alter an [`admin` role](security-reference/authorization.html#admin-role), the user must be a member of the `admin` role.
- To alter other roles, the user must be a member of the `admin` role or have the [`CREATEROLE`](create-role.html#create-a-role-that-can-create-other-roles-and-manage-authentication-methods-for-the-new-roles) [role option](#role-options).

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/alter_role.html %}
</div>

## Parameters

Parameter | Description
----------|-------------
`role_name` | The name of the role to alter.
`WITH role_option` | Apply a [role option](#role-options) to the role.
`SET {session variable}` | Set default [session variable](set-vars.html) values for a role.
`RESET {session variable}`<br>`RESET ALL` <a name="parameters-reset"></a> |  Reset one session variable or all session variables to the default value.
`IN DATABASE database_name` | Specify a database for which to apply session variable defaults.<br>When `IN DATABASE` is not specified, the default session variable values apply for a role in all databases.<br>In order for a session to initialize session variable values to database defaults, the database must be specified as a [connection parameter](connection-parameters.html). Database default values will not appear if the database is set after connection with `USE <dbname>`/`SET database=<dbname>`.
`ROLE ALL ...`/`USER ALL ...` |  Apply session variable settings to all roles.<br>Exception: The `root` user is exempt from session variable settings.

### Role options

{% include {{page.version.version}}/sql/role-options.md %}

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

{% include_cached copy-clipboard.html %}
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

The following example allows the role to cancel [queries](cancel-query.html) and [sessions](cancel-session.html) for other non-`admin` roles:

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

### Set default session variable values for all users

To set a default value for all users for any [session variable](set-vars.html) that applies during login, issue a statment like the following:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER ROLE ALL SET sql.spatial.experimental_box2d_comparison_operators.enabled = "on";
~~~

~~~
ALTER ROLE
~~~

{% include {{page.version.version}}/sql/sql-defaults-cluster-settings-deprecation-notice.md %}

## See also

- [`DROP ROLE`](drop-role.html)
- [`SHOW ROLES`](show-roles.html)
- [`GRANT`](grant.html)
- [`SHOW GRANTS`](show-grants.html)
- [`cockroach cert`](cockroach-cert.html)
- [SQL Statements](sql-statements.html)
- [Authorization Best Practices](security-reference/authorization.html#authorization-best-practices)
