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

 To create other roles, the role must have the [`CREATEROLE`](#allow-the-role-to-create-other-roles) parameter set. To allow the role to manage authentication for other roles, the role must have the [`CREATELOGIN`](#allow-the-role-to manage-authentication-for-other-roles) parameter set.

## Synopsis

<section>{% include {{ page.version.version }}/sql/diagrams/create_role.html %}</section>

## Parameters

| Parameter | Description |
------------|--------------
`name` | The name of the role you want to create. Role names are case-insensitive; must start with either a letter or underscore; must contain only letters, numbers, periods, or underscores; and must be between 1 and 63 characters.<br><br>Note that roles and [users](create-user.html) share the same namespace and must be unique.
`CREATELOGIN`/`NOCREATELOGIN` | Allow or disallow the role to manage authentication using the `WITH PASSWORD`, `VALID UNTIL`, and `LOGIN/NOLOGIN` parameters. <br><br>By default, the parameter is set to `NOCREATELOGIN` for all non-admin roles.
`LOGIN`/`NOLOGIN` | The `LOGIN` parameter allows a role to login with one of the [client authentication methods](authentication.html#client-authentication). [Setting the parameter to `NOLOGIN`](#change-login-privileges-for-a-role) prevents the role from logging in using any authentication method.
`password` | Let the role [authenticate their access to a secure cluster](authentication.html#client-authentication) using this password. Passwords should be entered as a [string literal](sql-constants.html#string-literals). For compatibility with PostgreSQL, a password can also be entered as an [identifier](#create-a-role-with-a-password-using-an-identifier). <br><br>To prevent a role from using [password authentication](authentication.html#client-authentication) and to mandate [certificate-based client authentication](authentication.html#client-authentication), [set the password as `NULL`](#prevent-a-role-from-using-password-authentication).
`VALID UNTIL` |   The date and time (in the [`timestamp`](timestamp.html) format) after which the password is not valid.
`CREATEROLE`/`NOCREATEROLE` |  Allow or disallow the new role to create, alter, and drop other non-admin roles. <br><br>By default, the parameter is set to `NOCREATEROLE` for all non-admin users.
`CREATEDB`/`NOCREATEDB` | Allow or disallow the role to create or rename a database. The role is assigned as the owner of the database. <br><br>By default, the parameter is set to `NOCREATEDB` for all non-admin roles.
`CONTROLJOB`/`NOCONTROLJOB` | Allow or disallow the role to pause, resume, and cancel jobs. Non-admin roles cannot control jobs created by admins. <br><br>By default, the parameter is set to `NOCONTROLJOB` for all non-admin roles.
`CANCELQUERY`/`NOCANCELQUERY` | Allow or disallow the role to cancel queries and sessions of other roles. Without this privilege, roles can only cancel their own queries and sessions. Even with this privilege, non-admins cannot cancel admin queries or sessions. This option should usually be combined with `VIEWACTIVITY` so that the role can view other roles' query and session information. <br><br>By default, the parameter is set to `NOCANCELQUERY` for all non-admin roles.
`VIEWACTIVITY`/`NOVIEWACTIVITY` | Allow or disallow a role to see other roles' queries and sessions using `SHOW QUERIES`, `SHOW SESSIONS`, and the Statements and Transactions pages in the Admin UI. Without this privilege, the `SHOW` commands only show the role's own data and the Admin UI pages are unavailable. <br><br>By default, the parameter is set to `NOVIEWACTIVITY` for all non-admin roles.
`CONTROLCHANGEFEED`/`NOCONTROLCHANGEFEED` | Allow or disallow the role to run `CREATE CHANGEFEED` on tables they have `SELECT` privileges on. <br><br>By default, the parameter is set to `NOCONTROLCHANGEFEED` for all non-admin roles.
`MODIFYCLUSTERSETTING`/`NOMODIFYCLUSTERSETTING` | Allow or disallow the role to to modify the cluster settings with the `sql.defaults` prefix. <br><br>By default, the parameter is set to `NOMODIFYCLUSTERSETTING` for all non-admin roles.

## Examples

To run the following examples, [start a secure single-node cluster](/cockroach-start-single-node.html) and use the built-in SQL shell:

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

~~~ sql
root@:26257/defaultdb> CREATE ROLE can_create_role WITH CREATEROLE;
~~~

~~~ sql
root@:26257/defaultdb> SHOW ROLES;
~~~

~~~
   username     |                options                | member_of
----------------+---------------------------------------+------------
admin           |                                       | {}
can_create_role | CREATEROLE, NOLOGIN                   | {}
can_login       | VALID UNTIL=2021-10-10 00:00:00+00:00 | {}
no_options      | NOLOGIN                               | {}
no_password     | NOLOGIN                               | {}
root            |                                       | {admin}
(6 rows)
~~~

### Create a role that can only manage authentication for other roles

~~~ sql
root@:26257/defaultdb> CREATE ROLE manage_auth_for_roles WITH CREATELOGIN;
~~~

~~~ sql
root@:26257/defaultdb> SHOW ROLES;
~~~

~~~
      username        |                options                | member_of
----------------------+---------------------------------------+------------
admin                 |                                       | {}
can_create_role       | CREATEROLE, NOLOGIN                   | {}
can_login             | VALID UNTIL=2021-10-10 00:00:00+00:00 | {}
manage_auth_for_roles | CREATELOGIN, NOLOGIN                  | {}
no_options            | NOLOGIN                               | {}
no_password           | NOLOGIN                               | {}
root                  |                                       | {admin}
(7 rows)
~~~

### Create a role that can create and rename databases

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
can_create_role       | CREATEROLE, NOLOGIN                   | {}
can_login             | VALID UNTIL=2021-10-10 00:00:00+00:00 | {}
manage_auth_for_roles | CREATELOGIN, NOLOGIN                  | {}
no_options            | NOLOGIN                               | {}
no_password           | NOLOGIN                               | {}
root                  |                                       | {admin}
(8 rows)
~~~

### Create a role that can pause, resume, and cancel non-admin jobs

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
can_create_role       | CREATEROLE, NOLOGIN                   | {}
can_login             | VALID UNTIL=2021-10-10 00:00:00+00:00 | {}
manage_auth_for_roles | CREATELOGIN, NOLOGIN                  | {}
no_options            | NOLOGIN                               | {}
no_password           | NOLOGIN                               | {}  
root                  |                                       | {admin}
(9 rows)
~~~

### Create a role that can see and cancel non-admin queries and sessions

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
can_create_role       | CREATEROLE, NOLOGIN                   | {}
can_login             | VALID UNTIL=2021-10-10 00:00:00+00:00 | {}
can_manage_queries    | CANCELQUERY, NOLOGIN, VIEWACTIVITY    | {}
manage_auth_for_roles | CREATELOGIN, NOLOGIN                  | {}
no_options            | NOLOGIN                               | {}
no_password           | NOLOGIN                               | {}
root                  |                                       | {admin}
(10 rows)
~~~

### Create a role that can control changefeeds

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
can_create_role        | CREATEROLE, NOLOGIN                   | {}
can_login              | VALID UNTIL=2021-10-10 00:00:00+00:00 | {}
can_manage_queries     | CANCELQUERY, NOLOGIN, VIEWACTIVITY    | {}
manage_auth_for_roles  | CREATELOGIN, NOLOGIN                  | {}
no_options             | NOLOGIN                               | {}
no_password            | NOLOGIN                               | {}
root                   |                                       | {admin}
(11 rows)
~~~

### Create a role that can modify cluster settings

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
can_create_role            | CREATEROLE, NOLOGIN                   | {}
can_login                  | VALID UNTIL=2021-10-10 00:00:00+00:00 | {}
can_manage_queries         | CANCELQUERY, NOLOGIN, VIEWACTIVITY    | {}
can_modify_cluster_setting | MODIFYCLUSTERSETTING, NOLOGIN         | {}
manage_auth_for_roles      | CREATELOGIN, NOLOGIN                  | {}
no_options                 | NOLOGIN                               | {}
no_password                | NOLOGIN                               | {}
root                       |                                       | {admin}
(12 rows)
~~~

<!--

{% include copy-clipboard.html %}
~~~ sql
> CREATE ROLE dev_ops;
~~~

After creating roles, you can [add users to the role](grant-roles.html) and [grant the role privileges](grant.html).

### Allow the role to create other roles

{% include copy-clipboard.html %}
~~~ sql
> CREATE ROLE carl with CREATEROLE;
~~~

### Allow the role to manage authentication for other roles

{% include copy-clipboard.html %}
~~~ sql
> CREATE ROLE carl with CREATELOGIN;
~~~

### Create a role with a password using a string literal

Note: Make sure that the role running the following statement has the `CREATELOGIN` or `CREATEROLE` role option:

{% include copy-clipboard.html %}
~~~ sql
> CREATE ROLE carl WITH PASSWORD 'ilov3beefjerky';
~~~

### Create a role with a password using an identifier

Note: Make sure that the role running the following statement has the `CREATELOGIN` or `CREATEROLE` role option.

The following statement sets the password to `ilov3beefjerky`, as above:

{% include copy-clipboard.html %}
~~~ sql
> CREATE ROLE carl WITH PASSWORD ilov3beefjerky;
~~~

This is equivalent to the example in the previous section because the password contains only lowercase characters.

In contrast, the following statement sets the password to `thereisnotomorrow`, even though the password in the syntax contains capitals, because identifiers are normalized automatically:

{% include copy-clipboard.html %}
~~~ sql
> CREATE ROLE carl WITH PASSWORD ThereIsNoTomorrow;
~~~

To preserve case in a password specified using identifier syntax, use double quotes:

{% include copy-clipboard.html %}
~~~ sql
> CREATE ROLE carl WITH PASSWORD "ThereIsNoTomorrow";
~~~

### Prevent a role from using password authentication

The following statement prevents the role from using password authentication and mandates certificate-based client authentication:

{% include copy-clipboard.html %}
~~~ sql
> CREATE ROLE carl WITH PASSWORD NULL;
~~~

-->

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
