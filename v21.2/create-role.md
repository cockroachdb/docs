---
title: CREATE ROLE
summary: The CREATE ROLE statement creates SQL roles, which are groups containing any number of roles and users as members.
toc: true
---

The `CREATE ROLE` [statement](sql-statements.html) creates SQL [roles](authorization.html#create-and-manage-roles), which are groups containing any number of roles and users as members. You can assign [privileges](authorization.html#privileges) to roles, and all members of the role (regardless of whether if they are direct or indirect members) will inherit the role's privileges.

{{site.data.alerts.callout_info}}
The keywords `ROLE` and `USER` can be used interchangeably in SQL statements for enhanced Postgres compatibility.

`CREATE USER` is equivalent to the statement `CREATE ROLE`, with one exception: `CREATE ROLE` sets the [`NOLOGIN`](#parameters) option by default, preventing the new role from being used to log in to the database. You can use `CREATE ROLE` and specify the [`LOGIN`](#parameters) option to achieve the same result as `CREATE USER`.
{{site.data.alerts.end}}

## Considerations

- Role names:
    - Are case-insensitive
    - Must start with either a letter or underscore
    - Must contain only letters, numbers, periods, or underscores
    - Must be between 1 and 63 characters.
    - <span class="version-tag">New in v21.2</span>: Cannot be `none`.
    - <span class="version-tag">New in v21.2</span>: Cannot start with `pg_` or `crdb_internal`. Object names with these prefixes are reserved for [system catalogs](system-catalogs.html).
- After creating roles, you must [grant them privileges to databases and tables](grant.html).
- Roles and users can be members of roles.
- Roles and users share the same namespace and must be unique.
- All [privileges](authorization.html#privileges) of a role are inherited by all of its members.
- Role options of a role are not inherited by any of its members.
- There is no limit to the number of members in a role.
- Membership loops are not allowed (direct: `A is a member of B is a member of A` or indirect: `A is a member of B is a member of C ... is a member of A`).

## Required privileges

Unless a role is a member of the admin role, additional [privileges](#parameters) are required to manage other roles.

- To create other roles, a role must have the [`CREATEROLE`](#create-a-role-that-can-create-other-roles-and-manage-authentication-methods-for-the-new-roles) role option.
- To add the `LOGIN` capability for other roles so that they may log in as users, a role must also have the [`CREATELOGIN`](#create-a-role-that-can-create-other-roles-and-manage-authentication-methods-for-the-new-roles) role option.
- To be able to grant or revoke membership to a role for additional roles, a member of the role must be set as a [role admin](authorization.html#role-admin) for that role.

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-21.2/grammar_svg/create_role.html %}
</div>

## Parameters

<style>
table td:first-child {
    min-width: 225px;
}
</style>

Parameter | Description
----------|-------------
`name` | The name of the role to create. Role names are case-insensitive; must start with either a letter or underscore; must contain only letters, numbers, periods, or underscores; and must be between 1 and 63 characters.<br><br>Note that roles and [users](create-user.html) share the same namespace and must be unique.
`WITH PASSWORD password`/`WITH PASSWORD NULL` | The credential the role uses to [authenticate their access to a secure cluster](authentication.html#client-authentication). A password should be entered as a [string literal](sql-constants.html#string-literals). For compatibility with PostgreSQL, a password can also be entered as an identifier. <br><br>To prevent a role from using [password authentication](authentication.html#client-authentication) and to mandate [certificate-based client authentication](authentication.html#client-authentication), [set the password as `NULL`](#prevent-a-role-from-using-password-authentication).
`WITH role_option` | Apply a [role option](#role-options) to the role.

### Role options

Role option | Description
------------|--------------
`CANCELQUERY`/`NOCANCELQUERY` | Allow or disallow the role to cancel [queries](cancel-query.html) and [sessions](cancel-session.html) of other roles. Without this role option, roles can only cancel their own queries and sessions. Even with this role option, non-admins cannot cancel admin queries or sessions. This option should usually be combined with `VIEWACTIVITY` so that the role can view other roles' query and session information. <br><br>By default, the role option is set to `NOCANCELQUERY` for all non-admin roles.
`CONTROLCHANGEFEED`/`NOCONTROLCHANGEFEED` | Allow or disallow the role to run [`CREATE CHANGEFEED`](create-changefeed.html) on tables they have `SELECT` privileges on. <br><br>By default, the role option is set to `NOCONTROLCHANGEFEED` for all non-admin roles.
`CONTROLJOB`/`NOCONTROLJOB` | Allow or disallow the role to [pause](pause-job.html), [resume](resume-job.html), and [cancel](cancel-job.html) jobs. Non-admin roles cannot control jobs created by admins. <br><br>By default, the role option is set to `NOCONTROLJOB` for all non-admin roles.
`CREATEDB`/`NOCREATEDB` | Allow or disallow the role to [create](create-database.html) or [rename](rename-database.html) a database. The role is assigned as the owner of the database. <br><br>By default, the role option is set to `NOCREATEDB` for all non-admin roles.
`CREATELOGIN`/`NOCREATELOGIN` | Allow or disallow the role to manage authentication using the `WITH PASSWORD`, `VALID UNTIL`, and `LOGIN/NOLOGIN` role options. <br><br>By default, the role option is set to `NOCREATELOGIN` for all non-admin roles.
`CREATEROLE`/`NOCREATEROLE` |  Allow or disallow the new role to create, [alter](alter-role.html), and [drop](drop-role.html) other non-admin roles. <br><br>By default, the role option is set to `NOCREATEROLE` for all non-admin users.
`LOGIN`/`NOLOGIN` | Allow or disallow a role to log in with one of the [client authentication methods](authentication.html#client-authentication). Setting the role option to `NOLOGIN` prevents the role from logging in using any authentication method.
`MODIFYCLUSTERSETTING`/`NOMODIFYCLUSTERSETTING` | Allow or disallow the role to modify the [cluster settings](cluster-settings.html) with the `sql.defaults` prefix. <br><br>By default, the role option is set to `NOMODIFYCLUSTERSETTING` for all non-admin roles.
`SQLLOGIN`/`NOSQLLOGIN` | Allow or disallow a role to log in using the SQL CLI with one of the [client authentication methods](authentication.html#client-authentication). Setting the role option to `NOSQLLOGIN` prevents the role from logging in using the SQL CLI with any authentication method while retaining the ability to log in to DB Console. It is possible to have both `NOSQLLOGIN` and `LOGIN` set for a role and `NOSQLLOGIN` takes precedence on restrictions.
`VALID UNTIL` |  The date and time (in the [`timestamp`](timestamp.html) format) after which the [password](#parameters) is not valid.
`VIEWACTIVITY`/`NOVIEWACTIVITY` | Allow or disallow a role to see other roles' [queries](show-statements.html) and [sessions](show-sessions.html) using `SHOW STATEMENTS`, `SHOW SESSIONS`, and the [Statements](ui-statements-page.html) and [Transactions](ui-transactions-page.html) pages in the DB Console. With `NOVIEWACTIVITY`, the `SHOW` commands show only the role's own data and the DB Console pages are unavailable. If a user has the `VIEWACTIVITYREDACTED` role, they will be able to see DB Console pages. <br><br>By default, the role option is set to `NOVIEWACTIVITY` for all non-admin roles.
`VIEWACTIVITYREDACTED`/`NOVIEWACTIVITYREDACTED` | Allow or disallow a role to see other roles' queries and sessions using `SHOW STATEMENTS`, `SHOW SESSIONS`, and the Statements and Transactions pages and the [statements diagnostics bundle](ui-statements-page.html#diagnostics), which can contain PII information, in the DB Console. With `NOVIEWACTIVITYREDACTED`, the user won't have access to the usage of statements diagnostics bundle in the DB Console. It is possible to have both `NOVIEWACTIVITY` and `NOVIEWACTIVITYREDACTED`, and `NOVIEWACTIVITYREDACTED` takes precedence on restrictions. If the user has `VIEWACTIVITY` but doesn't have `VIEWACTIVITYREDACTED`, they will be able to see DB Console pages. <br><br>By default, the role option is set to `NOVIEWACTIVITYREDACTED` for all non-admin roles.


## Examples

To run the following examples, [start a secure single-node cluster](cockroach-start-single-node.html) and use the built-in SQL shell:

~~~ shell
$ cockroach sql --certs-dir=certs
~~~

~~~ sql
> SHOW ROLES;
~~~

~~~
username | options | member_of
---------+---------+------------
admin    |         | {}
root     |         | {admin}
(2 rows)
~~~

{{site.data.alerts.callout_info}}
The following statements are run by the `root` user that is a member of the `admin` role and has `ALL` privileges.
{{site.data.alerts.end}}

### Create a role

Role names are case-insensitive; must start with a letter, number, or underscore; must contain only letters, numbers, periods, or underscores; and must be between 1 and 63 characters.

~~~ sql
root@:26257/defaultdb> CREATE ROLE no_options;
~~~

~~~ sql
root@:26257/defaultdb> SHOW ROLES;
~~~

~~~
 username  | options | member_of
 ----------+---------+------------
admin      |         | {}
no_options | NOLOGIN | {}
root       |         | {admin}
(3 rows)
~~~

After creating roles, you must [grant them privileges to databases](grant.html).

### Create a role that can log in to the database

~~~ sql
root@:26257/defaultdb> CREATE ROLE can_login WITH LOGIN PASSWORD '$tr0nGpassW0rD' VALID UNTIL '2021-10-10';
~~~

~~~ sql
root@:26257/defaultdb> SHOW ROLES;
~~~

~~~
 username  |                options                | member_of
-----------+---------------------------------------+------------
admin      |                                       | {}
can_login  | VALID UNTIL=2021-10-10 00:00:00+00:00 | {}
no_options | NOLOGIN                               | {}
root       |                                       | {admin}
(4 rows)
~~~

### Prevent a role from using password authentication

The following statement prevents the role from using password authentication and mandates certificate-based client authentication:

{% include copy-clipboard.html %}
~~~ sql
> CREATE ROLE no_password WITH PASSWORD NULL;
~~~

~~~ sql
root@:26257/defaultdb> SHOW ROLES;
~~~

~~~
 username  |                options                | member_of
-----------+---------------------------------------+------------
admin      |                                       | {}
can_login  | VALID UNTIL=2021-10-10 00:00:00+00:00 | {}
no_options | NOLOGIN                               | {}
no_password| NOLOGIN                               | {}
root       |                                       | {admin}
(5 rows)
~~~

### Create a role that can create other roles and manage authentication methods for the new roles

The following example allows the role to [create other users](create-user.html) and [manage authentication methods](authentication.html#client-authentication) for them:

~~~ sql
root@:26257/defaultdb> CREATE ROLE can_create_role WITH CREATEROLE CREATELOGIN;
~~~

~~~ sql
root@:26257/defaultdb> SHOW ROLES;
~~~

~~~
   username     |                options                | member_of
----------------+---------------------------------------+------------
admin           |                                       | {}
can_create_role | CREATELOGIN, CREATEROLE, NOLOGIN      | {}
can_login       | VALID UNTIL=2021-10-10 00:00:00+00:00 | {}
no_options      | NOLOGIN                               | {}
no_password     | NOLOGIN                               | {}
root            |                                       | {admin}
(6 rows)
~~~

### Create a role that can create and rename databases

The following example allows the role to [create](create-database.html) or [rename](rename-database.html) databases:

~~~ sql
root@:26257/defaultdb> CREATE ROLE can_create_db WITH CREATEDB;
~~~

~~~ sql
root@:26257/defaultdb> SHOW ROLES;
~~~

~~~
      username        |                options                | member_of
----------------------+---------------------------------------+------------
admin                 |                                       | {}
can_create_db         | CREATEDB, NOLOGIN                     | {}
can_create_role       | CREATELOGIN, CREATEROLE, NOLOGIN      | {}
can_login             | VALID UNTIL=2021-10-10 00:00:00+00:00 | {}
no_options            | NOLOGIN                               | {}
no_password           | NOLOGIN                               | {}
root                  |                                       | {admin}
(7 rows)
~~~

### Create a role that can pause, resume, and cancel non-admin jobs

The following example allows the role to [pause](pause-job.html), [resume](resume-job.html), and [cancel](cancel-job.html) jobs:

~~~ sql
root@:26257/defaultdb> CREATE ROLE can_control_job WITH CONTROLJOB;
~~~

~~~ sql
root@:26257/defaultdb> SHOW ROLES;
~~~

~~~
      username        |                options                | member_of
----------------------+---------------------------------------+------------
admin                 |                                       | {}
can_control_job       | CONTROLJOB, NOLOGIN                   | {}
can_create_db         | CREATEDB, NOLOGIN                     | {}
can_create_role       | CREATELOGIN, CREATEROLE, NOLOGIN      | {}
can_login             | VALID UNTIL=2021-10-10 00:00:00+00:00 | {}
manage_auth_for_roles | CREATELOGIN, NOLOGIN                  | {}
no_options            | NOLOGIN                               | {}
no_password           | NOLOGIN                               | {}
root                  |                                       | {admin}
(8 rows)
~~~

### Create a role that can see and cancel non-admin queries and sessions

The following example allows the role to cancel [queries](cancel-query.html) and [sessions](cancel-session.html) for other non-admin roles:

~~~ sql
root@:26257/defaultdb> CREATE ROLE can_manage_queries WITH CANCELQUERY VIEWACTIVITY;
~~~

~~~ sql
root@:26257/defaultdb> SHOW ROLES;
~~~

~~~
      username        |                options                | member_of
----------------------+---------------------------------------+------------
admin                 |                                       | {}
can_control_job       | CONTROLJOB, NOLOGIN                   | {}
can_create_db         | CREATEDB, NOLOGIN                     | {}
can_create_role       | CREATELOGIN, CREATEROLE, NOLOGIN      | {}
can_login             | VALID UNTIL=2021-10-10 00:00:00+00:00 | {}
can_manage_queries    | CANCELQUERY, NOLOGIN, VIEWACTIVITY    | {}
no_options            | NOLOGIN                               | {}
no_password           | NOLOGIN                               | {}
root                  |                                       | {admin}
(9 rows)
~~~

### Create a role that can control changefeeds

The following example allows the role to run [`CREATE CHANGEFEED`](create-changefeed.html):

~~~ sql
root@:26257/defaultdb> CREATE ROLE can_control_changefeed WITH CONTROLCHANGEFEED;
~~~

~~~ sql
root@:26257/defaultdb> SHOW ROLES;
~~~

~~~
       username        |                options                | member_of
-----------------------+---------------------------------------+------------
admin                  |                                       | {}
can_control_changefeed | CONTROLCHANGEFEED, NOLOGIN            | {}
can_control_job        | CONTROLJOB, NOLOGIN                   | {}
can_create_db          | CREATEDB, NOLOGIN                     | {}
can_create_role        | CREATELOGIN, CREATEROLE, NOLOGIN      | {}
can_login              | VALID UNTIL=2021-10-10 00:00:00+00:00 | {}
can_manage_queries     | CANCELQUERY, NOLOGIN, VIEWACTIVITY    | {}
no_options             | NOLOGIN                               | {}
no_password            | NOLOGIN                               | {}
root                   |                                       | {admin}
(10 rows)
~~~

### Create a role that can modify cluster settings

The following example allows the role to modify [cluster settings](cluster-settings.html):

~~~ sql
root@:26257/defaultdb> CREATE ROLE can_modify_cluster_setting WITH MODIFYCLUSTERSETTING;
~~~

~~~ sql
root@:26257/defaultdb> SHOW ROLES;
~~~

~~~
         username          |                options                | member_of
---------------------------+---------------------------------------+------------
admin                      |                                       | {}
can_control_changefeed     | CONTROLCHANGEFEED, NOLOGIN            | {}
can_control_job            | CONTROLJOB, NOLOGIN                   | {}
can_create_db              | CREATEDB, NOLOGIN                     | {}
can_create_role            | CREATELOGIN, CREATEROLE, NOLOGIN      | {}
can_login                  | VALID UNTIL=2021-10-10 00:00:00+00:00 | {}
can_manage_queries         | CANCELQUERY, NOLOGIN, VIEWACTIVITY    | {}
can_modify_cluster_setting | MODIFYCLUSTERSETTING, NOLOGIN         | {}
no_options                 | NOLOGIN                               | {}
no_password                | NOLOGIN                               | {}
root                       |                                       | {admin}
(11 rows)
~~~

## See also

- [Authorization](authorization.html)
- [Authorization Best Practices](authorization.html#authorization-best-practices)
- [`DROP ROLE`](drop-role.html)
- [`GRANT`](grant.html)
- [`REVOKE`](revoke.html)
- [`SHOW ROLES`](show-roles.html)
- [`SHOW USERS`](show-users.html)
- [`SHOW GRANTS`](show-grants.html)
- [Other SQL Statements](sql-statements.html)
