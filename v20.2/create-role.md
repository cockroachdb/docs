---
title: CREATE ROLE
summary: The CREATE ROLE statement creates SQL roles, which are groups containing any number of roles and users as members.
toc: true
---

The `CREATE ROLE` [statement](sql-statements.html) creates SQL [roles](authorization.html#create-and-manage-roles), which are groups containing any number of roles and users as members. You can assign privileges to roles, and all members of the role (regardless of whether if they are direct or indirect members) will inherit the role's privileges.

{{site.data.alerts.callout_info}}
 <code>CREATE ROLE</code> is no longer an enterprise feature and is now freely available in the core version of CockroachDB. Also, since the keywords `ROLE` and `USER` can now be used interchangeably in SQL statements for enhanced Postgres compatibility, `CREATE ROLE` is now an alias for [`CREATE USER`](create-user.html).
{{site.data.alerts.end}}

## Considerations

- Role names:
    - Are case-insensitive
    - Must start with either a letter or underscore
    - Must contain only letters, numbers, periods, or underscores
    - Must be between 1 and 63 characters.
- After creating roles, you must [grant them privileges to databases and tables](grant.html).
- Roles and users can be members of roles.
- Roles and users share the same namespace and must be unique.
- All privileges of a role are inherited by all of its members.
- There is no limit to the number of members in a role.
- Roles cannot log in. They do not have a password and cannot use certificates.
- Membership loops are not allowed (direct: `A is a member of B is a member of A` or indirect: `A is a member of B is a member of C ... is a member of A`).

## Required privileges

 To create other roles, the role must be a member of the `admin` role or have the [`CREATEROLE`](#create-a-role-that-can-create-other-roles-and-manage-authentication-methods-for-the-new-roles) parameter set.

## Synopsis

<section>{% include {{ page.version.version }}/sql/diagrams/create_role.html %}</section>

## Parameters

| Parameter | Description |
------------|--------------
`name` | The name of the role you want to create. Role names are case-insensitive; must start with either a letter or underscore; must contain only letters, numbers, periods, or underscores; and must be between 1 and 63 characters.<br><br>Note that roles and [users](create-user.html) share the same namespace and must be unique.
`CREATELOGIN`/`NOCREATELOGIN` | Allow or disallow the role to manage authentication using the `WITH PASSWORD`, `VALID UNTIL`, and `LOGIN/NOLOGIN` parameters. <br><br>By default, the parameter is set to `NOCREATELOGIN` for all non-admin roles.
`LOGIN`/`NOLOGIN` | The `LOGIN` parameter allows a role to login with one of the [client authentication methods](authentication.html#client-authentication). Setting the parameter to `NOLOGIN` prevents the role from logging in using any authentication method.
`password` | Let the role [authenticate their access to a secure cluster](authentication.html#client-authentication) using this password. Passwords should be entered as a [string literal](sql-constants.html#string-literals). For compatibility with PostgreSQL, a password can also be entered as an identifier. <br><br>To prevent a role from using [password authentication](authentication.html#client-authentication) and to mandate [certificate-based client authentication](authentication.html#client-authentication), [set the password as `NULL`](#prevent-a-role-from-using-password-authentication).
`VALID UNTIL` |  The date and time (in the [`timestamp`](timestamp.html) format) after which the password is not valid.
`CREATEROLE`/`NOCREATEROLE` |  Allow or disallow the new role to create, [alter](alter-role.html), and [drop](drop-role.html) other non-admin roles. <br><br>By default, the parameter is set to `NOCREATEROLE` for all non-admin users.
`CREATEDB`/`NOCREATEDB` | Allow or disallow the role to [create](create-database.html) or [rename](rename-database.html) a database. The role is assigned as the owner of the database. <br><br>By default, the parameter is set to `NOCREATEDB` for all non-admin roles.
`CONTROLJOB`/`NOCONTROLJOB` | Allow or disallow the role to [pause](pause-job.html), [resume](resume-job.html), and [cancel](cancel-job.html) jobs. Non-admin roles cannot control jobs created by admins. <br><br>By default, the parameter is set to `NOCONTROLJOB` for all non-admin roles.
`CANCELQUERY`/`NOCANCELQUERY` | Allow or disallow the role to cancel [queries](cancel-query.html) and [sessions](cancel-session.html) of other roles. Without this privilege, roles can only cancel their own queries and sessions. Even with this privilege, non-admins cannot cancel admin queries or sessions. This option should usually be combined with `VIEWACTIVITY` so that the role can view other roles' query and session information. <br><br>By default, the parameter is set to `NOCANCELQUERY` for all non-admin roles.
`VIEWACTIVITY`/`NOVIEWACTIVITY` | Allow or disallow a role to see other roles' [queries](show-queries.html) and [sessions](show-sessions.html) using `SHOW QUERIES`, `SHOW SESSIONS`, and the [**Statements**](ui-statements-page.html) and **Transactions** pages in the DB Console. Without this privilege, the `SHOW` commands only show the role's own data and the DB Console pages are unavailable. <br><br>By default, the parameter is set to `NOVIEWACTIVITY` for all non-admin roles.
`CONTROLCHANGEFEED`/`NOCONTROLCHANGEFEED` | Allow or disallow the role to run [`CREATE CHANGEFEED`](create-changefeed.html) on tables they have `SELECT` privileges on. <br><br>By default, the parameter is set to `NOCONTROLCHANGEFEED` for all non-admin roles.
`MODIFYCLUSTERSETTING`/`NOMODIFYCLUSTERSETTING` | Allow or disallow the role to to modify the [cluster settings](cluster-settings.html) with the `sql.defaults` prefix. <br><br>By default, the parameter is set to `NOMODIFYCLUSTERSETTING` for all non-admin roles.

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
- [`DROP ROLE`](drop-role.html)
- [`GRANT <privileges>`](grant.html)
- [`REVOKE <privileges>`](revoke.html)
- [`GRANT <roles>`](grant-roles.html)
- [`REVOKE <roles>`](revoke-roles.html)
- [`SHOW ROLES`](show-roles.html)
- [`SHOW USERS`](show-users.html)
- [`SHOW GRANTS`](show-grants.html)
- [Other SQL Statements](sql-statements.html)
