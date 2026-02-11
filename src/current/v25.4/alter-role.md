---
title: ALTER ROLE
summary: The ALTER ROLE statement can be used to add or change a role's password.
toc: true
docs_area: reference.sql
---

Use the `ALTER ROLE` [statement]({% link {{ page.version.version }}/sql-statements.md %}) to add, change, or remove a [role's]({% link {{ page.version.version }}/create-role.md %}) password, change the role options for a role, and set default [session variable]({% link {{ page.version.version }}/set-vars.md %}) values for a role.

You can use the keywords `ROLE` and `USER` interchangeably. [`ALTER USER`]({% link {{ page.version.version }}/alter-user.md %}) is an alias for `ALTER ROLE`.

## Considerations

### Password management

Password creation and alteration is supported only in secure clusters.

### Session variable precedence

{% include {{ page.version.version }}/sql/session-variable-precedence-order.md %}

## Required privileges

- To alter an [`admin` role]({% link {{ page.version.version }}/security-reference/authorization.md %}#admin-role), the user must be a member of the `admin` role.
- To alter other roles, the user must be a member of the `admin` role or have the [`CREATEROLE`]({% link {{ page.version.version }}/create-role.md %}#create-a-role-that-can-create-other-roles-and-manage-authentication-methods-for-the-new-roles) [role option](#role-options).
- {% include_cached new-in.html version="v25.4" %} For [per-database defaults](#set-default-session-variable-values-for-a-specific-database), the [owner]({% link {{ page.version.version }}/security-reference/authorization.md %}#object-ownership) of a database can execute `ALTER ROLE ALL IN DATABASE ... {SET|RESET}` for that database (in addition to users who meet the general requirements above).

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/alter_role.html %}
</div>

## Parameters

Parameter | Description
----------|-------------
`role_name` | The name of the role to alter.
`WITH role_option` | Apply a [role option](#role-options) to the role.
`SET {session variable}` | Set default [session variable]({% link {{ page.version.version }}/set-vars.md %}) values for a role.
`RESET {session variable}`<br>`RESET ALL` <a name="parameters-reset"></a> |  Reset one session variable or all session variables to the default value.
`IN DATABASE database_name` | Specify a database for which to apply session variable defaults.<br>When `IN DATABASE` is not specified, the default session variable values apply for a role in all databases.<br>In order for a session to initialize session variable values to database defaults, the database must be specified as a [connection parameter]({% link {{ page.version.version }}/connection-parameters.md %}). Database default values will not appear if the database is set after connection with `USE <dbname>`/`SET database=<dbname>`.
`ROLE ALL ...`/`USER ALL ...` |  Apply session variable settings to all roles.<br>Exception: The `root` user is exempt from session variable settings. This is a failsafe; if you make a mistake with a session variable setting, you can still log in as `root` and be unaffected.

### Role options

{% include {{page.version.version}}/sql/role-options.md %}

## Examples

{{site.data.alerts.callout_info}}
The following statements are run by the `root` user that is a member of the `admin` role and has `ALL` privileges.
{{site.data.alerts.end}}

### Allow a role to log in to the database using a password

The following example allows a role to log in to the database with a [password]({% link {{ page.version.version }}/authentication.md %}#client-authentication):

~~~ sql
CREATE ROLE carl;
~~~

~~~ sql
ALTER ROLE carl WITH LOGIN PASSWORD 'An0ther$tr0nGpassW0rD' VALID UNTIL '2021-10-10';
~~~

### Prevent a role from using password authentication

The following statement prevents the user from using password authentication and mandates certificate-based [client authentication]({% link {{ page.version.version }}/authentication.md %}#client-authentication):

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER ROLE carl WITH PASSWORD NULL;
~~~

### Allow a role to create other roles and manage authentication methods for the new roles

The following example allows the role to [create other roles]({% link {{ page.version.version }}/create-role.md %}) and [manage authentication methods]({% link {{ page.version.version }}/authentication.md %}#client-authentication) for them:

~~~ sql
ALTER ROLE carl WITH CREATEROLE CREATELOGIN;
~~~

### Allow a role to create and rename databases

The following example allows the role to [create]({% link {{ page.version.version }}/create-database.md %}) or [rename]({% link {{ page.version.version }}/alter-database.md %}#rename-to) databases:

~~~ sql
ALTER ROLE carl WITH CREATEDB;
~~~

### Allow a role to pause, resume, and cancel non-admin jobs

The following example allows the role to [pause]({% link {{ page.version.version }}/pause-job.md %}), [resume]({% link {{ page.version.version }}/resume-job.md %}), and [cancel]({% link {{ page.version.version }}/cancel-job.md %}) jobs:

~~~ sql
ALTER ROLE carl WITH CONTROLJOB;
~~~

### Allow a role to see and cancel non-admin queries and sessions

The following example allows the role to cancel [queries]({% link {{ page.version.version }}/cancel-query.md %}) and [sessions]({% link {{ page.version.version }}/cancel-session.md %}) for other non-`admin` roles:

~~~ sql
ALTER ROLE carl WITH CANCELQUERY VIEWACTIVITY;
~~~

### Allow a role to control changefeeds

The following example allows the role to run [`CREATE CHANGEFEED`]({% link {{ page.version.version }}/create-changefeed.md %}):

~~~ sql
ALTER ROLE carl WITH CONTROLCHANGEFEED;
~~~

### Allow a role to modify cluster settings

The following example allows the role to modify [cluster settings]({% link {{ page.version.version }}/cluster-settings.md %}):

~~~ sql
ALTER ROLE carl WITH MODIFYCLUSTERSETTING;
~~~

### Allow a role to bypass row-level security (RLS)

To allow a [role]({% link {{ page.version.version }}/security-reference/authorization.md %}#users-and-roles) to bypass [row-level security]({% link {{ page.version.version }}/row-level-security.md %}), execute the following statement to grant the [`BYPASSRLS`]({% link {{ page.version.version }}/security-reference/authorization.md %}#bypassrls) privilege:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER ROLE carl WITH BYPASSRLS;
~~~

To disable the role's ability to bypass RLS, execute the following statement:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER ROLE carl WITH NOBYPASSRLS;
~~~

### Set default session variable values for a role

In the following example, the `root` user creates a role named `max`, and sets the default value of the `timezone` [session variable]({% link {{ page.version.version }}/set-vars.md %}#supported-variables) for the `max` role.

~~~ sql
CREATE ROLE max WITH LOGIN;
~~~

~~~ sql
ALTER ROLE max SET timezone = 'America/New_York';
~~~

This statement does not affect the default `timezone` value for any role other than `max`:

~~~ sql
SHOW timezone;
~~~

~~~
  timezone
------------
  UTC
(1 row)
~~~

To see the default `timezone` value for the `max` role, run the `SHOW` statement as a member of the `max` role:

~~~ sql
SHOW timezone;
~~~

~~~
      timezone
--------------------
  America/New_York
(1 row)
~~~

{% include {{page.version.version}}/sql/show-default-session-variables-for-role.md %}

### Set default session variable values for a role in a specific database

In the following example, the `root` user creates a role named `max` and a database named `movr`, and sets the default value of the `statement_timeout` [session variable]({% link {{ page.version.version }}/set-vars.md %}#supported-variables) for the `max` role in the `movr` database.

~~~ sql
CREATE DATABASE IF NOT EXISTS movr;
~~~

~~~ sql
CREATE ROLE IF NOT EXISTS max WITH LOGIN;
~~~

~~~ sql
ALTER ROLE max IN DATABASE movr SET statement_timeout = '10s';
~~~

This statement does not affect the default `statement_timeout` value for any role other than `max`, or in any database other than `movr`.

~~~ sql
SHOW statement_timeout;
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
SHOW statement_timeout;
~~~

~~~
  statement_timeout
---------------------
  10000
(1 row)
~~~

{% include {{page.version.version}}/sql/show-default-session-variables-for-role.md %}

### Set default session variable values for a specific database

In the following example, the `root` user creates a database named `movr`, and sets the default value of the `timezone` [session variable]({% link {{ page.version.version }}/set-vars.md %}#supported-variables) for all roles in that database.

{% include_cached new-in.html version="v25.4" %} The [owner]({% link {{ page.version.version }}/security-reference/authorization.md %}#object-ownership) of a database can also execute `ALTER ROLE ALL IN DATABASE ... {SET|RESET}` for that database.

~~~ sql
CREATE DATABASE IF NOT EXISTS movr;
~~~

~~~ sql
ALTER ROLE ALL IN DATABASE movr SET timezone = 'America/New_York';
~~~

{{site.data.alerts.callout_info}}
This statement is identical to [`ALTER DATABASE movr SET timezone = 'America/New_York';`]({% link {{ page.version.version }}/alter-database.md %}).
{{site.data.alerts.end}}

This statement does not affect the default `timezone` value for any database other than `movr`:

~~~ sql
SHOW timezone;
~~~

~~~
  timezone
------------
  UTC
(1 row)
~~~

To see the default `timezone` value for the `max` role, run the `SHOW` statement as a member of the `max` role:

~~~ sql
SHOW timezone;
~~~

~~~
      timezone
--------------------
  America/New_York
(1 row)
~~~

{% include {{page.version.version}}/sql/show-default-session-variables-for-role.md %}

### Set default session variable values for all users

To set a default value for all users for any [session variable]({% link {{ page.version.version }}/set-vars.md %}) that applies during login, issue a statement like the following:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER ROLE ALL SET sql.spatial.experimental_box2d_comparison_operators.enabled = "on";
~~~

~~~
ALTER ROLE
~~~

The `root` user is exempt from session variable settings changes. This is a failsafe; if you make a mistake with a session variable setting, you can still log in as `root` and be unaffected.

{% include {{page.version.version}}/sql/sql-defaults-cluster-settings-deprecation-notice.md %}

{% include {{page.version.version}}/sql/show-default-session-variables-for-role.md %}

### Set the `SUBJECT` role option for certificate based authentication

{% include {{page.version.version}}/sql/role-subject-option.md %}

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER ROLE max WITH SUBJECT 'CN=myName2,OU=myOrgUnit2,O=myOrg2,L=myLocality2,ST=myState2,C=myCountry2' LOGIN;
~~~

{% include {{page.version.version}}/misc/cert-auth-using-x509-subject.md %}

## See also

- [`DROP ROLE`]({% link {{ page.version.version }}/drop-role.md %})
- [`SHOW ROLES`]({% link {{ page.version.version }}/show-roles.md %})
- [`GRANT`]({% link {{ page.version.version }}/grant.md %})
- [`SHOW GRANTS`]({% link {{ page.version.version }}/show-grants.md %})
- [`cockroach cert`]({% link {{ page.version.version }}/cockroach-cert.md %})
- [SQL Statements]({% link {{ page.version.version }}/sql-statements.md %})
- [Authorization Best Practices]({% link {{ page.version.version }}/security-reference/authorization.md %}#authorization-best-practices)
- [`SHOW DEFAULT SESSION VARIABLES FOR ROLE`]({% link {{ page.version.version }}/show-default-session-variables-for-role.md %})
