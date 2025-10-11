---
title: CREATE USER
summary: The CREATE USER statement creates SQL roles that are preconfigured with the necessary login permission to act as database users.
toc: true
---

The `CREATE USER` [statement](sql-statements.html) creates a SQL role that can be used to log in to a database.

 There is no distinct "user" entity in CockroachDB. A role with the [`LOGIN`](#parameters) option enabled can log in to the SQL shell and is often called a user.

 You can [assign privileges](authorization.html#assign-privileges) to the user and [set it as a member](grant-roles.html) of other roles, inheriting their privileges.

{{site.data.alerts.callout_info}}
 `CREATE USER` is equivalent to the statement `CREATE ROLE`, with one exception: `CREATE ROLE` sets the [`NOLOGIN`](#parameters) option by default, preventing the new role from being used to log in to the database. You can use `CREATE ROLE` and specify the [`LOGIN`](#parameters) option to achieve the same result as `CREATE USER`.
{{site.data.alerts.end}}

See [Authorization](authorization.html) for more information on privilege management and role membership.

## Considerations

{% include {{ page.version.version }}/sql/role-considerations.md %}

## Required privileges

Unless a role is a member of the admin role, additional [privileges](#parameters) are required to manage other roles.

- To create other roles, a role must have the [`CREATEROLE`](#create-a-user-that-can-create-other-users-and-manage-authentication-methods-for-the-new-users) parameter set.
- To add the `LOGIN` capability for other roles so that they may log in as users, a role must also have the [`CREATELOGIN`](#create-a-user-that-can-create-other-users-and-manage-authentication-methods-for-the-new-users) parameter set.
- To be able to grant or revoke membership to a role for additional roles, a member of the role must be set as a [role admin](authorization.html#role-admin) for that role.

## Synopsis

<section>{% include {{ page.version.version }}/sql/diagrams/create_user.html %}</section>

## Parameters

<style>
table td:first-child {
    min-width: 225px;
}
</style>

 Parameter | Description
-----------|-------------
`user_name` | The name of the user you want to create. See the [Considerations](#considerations) section for important naming guidelines.
`CREATELOGIN`/`NOCREATELOGIN` | Allow or disallow the user to manage authentication using the `WITH PASSWORD`, `VALID UNTIL`, and `LOGIN/NOLOGIN` parameters. <br><br>By default, the parameter is set to `NOCREATELOGIN` for all non-admin users.
`LOGIN`/`NOLOGIN` | The `LOGIN` parameter allows a user to login with one of the [client authentication methods](authentication.html#client-authentication). Setting the parameter to `NOLOGIN` prevents the user from logging in using any authentication method.
`password` | Let the user [authenticate their access to a secure cluster](authentication.html#client-authentication) using this password. Passwords should be entered as a [string literal](sql-constants.html#string-literals). For compatibility with PostgreSQL, a password can also be entered as an identifier. <br><br>To prevent a user from using [password authentication](authentication.html#client-authentication) and to mandate [certificate-based client authentication](authentication.html#client-authentication), [set the password as `NULL`](#prevent-a-user-from-using-password-authentication).
`VALID UNTIL` |  The date and time (in the [`timestamp`](timestamp.html) format) after which the password is not valid.
`CREATEROLE`/`NOCREATEROLE` |  Allow or disallow the new user to create, [alter](alter-user.html), and [drop](drop-user.html) other non-admin users. <br><br>By default, the parameter is set to `NOCREATEROLE` for all non-admin users.
`CREATEDB`/`NOCREATEDB` | Allow or disallow the user to [create](create-database.html) or [rename](rename-database.html) a database. The user is assigned as the owner of the database. <br><br>By default, the parameter is set to `NOCREATEDB` for all non-admin users.
`CONTROLJOB`/`NOCONTROLJOB` | Allow or disallow the user to [pause](pause-job.html), [resume](resume-job.html), and [cancel](cancel-job.html) jobs. Non-admin users cannot control jobs created by admins. <br><br>By default, the parameter is set to `NOCONTROLJOB` for all non-admin users.
`CANCELQUERY`/`NOCANCELQUERY` | Allow or disallow the user to cancel [queries](cancel-query.html) and [sessions](cancel-session.html) of other users. Without this privilege, users can only cancel their own queries and sessions. Even with this privilege, non-admins cannot cancel admin queries or sessions. This option should usually be combined with `VIEWACTIVITY` so that the user can view other users' query and session information. <br><br>By default, the parameter is set to `NOCANCELQUERY` for all non-admin users.
`VIEWACTIVITY`/`NOVIEWACTIVITY` | Allow or disallow a role to see other users' [queries](show-queries.html) and [sessions](show-sessions.html) using `SHOW QUERIES`, `SHOW SESSIONS`, and the [**Statements**](ui-statements-page.html) and **Transactions** pages in the DB Console. Without this privilege, the `SHOW` commands only show the user's own data and the DB Console pages are unavailable. <br><br>By default, the parameter is set to `NOVIEWACTIVITY` for all non-admin users.
`CONTROLCHANGEFEED`/`NOCONTROLCHANGEFEED` | Allow or disallow the user to run [`CREATE CHANGEFEED`](create-changefeed.html) on tables they have `SELECT` privileges on. <br><br>By default, the parameter is set to `NOCONTROLCHANGEFEED` for all non-admin users.
`MODIFYCLUSTERSETTING`/`NOMODIFYCLUSTERSETTING` | Allow or disallow the user to modify the [cluster settings](cluster-settings.html) with the `sql.defaults` prefix. <br><br>By default, the parameter is set to `NOMODIFYCLUSTERSETTING` for all non-admin users.

## Examples

To run the following examples, [start a secure single-node cluster](cockroach-start-single-node.html) and use the built-in SQL shell:

~~~ shell
$ cockroach sql --certs-dir=certs
~~~

~~~ sql
> SHOW USERS;
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

### Create a user

Note the [considerations](#considerations) for role names.

~~~ sql
root@:26257/defaultdb> CREATE USER no_options;
~~~

~~~ sql
root@:26257/defaultdb> SHOW USERS;
~~~

~~~
 username  | options | member_of
-------------+---------+------------
admin      |         | {}
no_options |         | {}
root       |         | {admin}
(3 rows)
~~~

After creating users, you must:

- [Grant them privileges to databases](grant.html).
- For secure clusters, you must also [create their client certificates](cockroach-cert.html#create-the-certificate-and-key-pair-for-a-client).

### Create a user with a password

~~~ sql
root@:26257/defaultdb> CREATE USER with_password WITH LOGIN PASSWORD '$tr0nGpassW0rD' VALID UNTIL '2021-10-10';
~~~

~~~ sql
root@:26257/defaultdb> SHOW USERS;
~~~

~~~
  username    |                options                | member_of
--------------+---------------------------------------+------------
admin         |                                       | {}
no_options    |                                       | {}
root          |                                       | {admin}
with_password | VALID UNTIL=2021-10-10 00:00:00+00:00 | {}
(4 rows)
~~~

### Prevent a user from using password authentication

The following statement prevents the user from using password authentication and mandates certificate-based client authentication:

{% include_cached copy-clipboard.html %}
~~~ sql
root@:26257/defaultdb> CREATE USER no_password WITH PASSWORD NULL;
~~~

~~~ sql
root@:26257/defaultdb> SHOW USERS;
~~~

~~~
  username    |                options                | member_of
--------------+---------------------------------------+------------
admin         |                                       | {}
no_options    |                                       | {}
no_password   |                                       | {}
root          |                                       | {admin}
with_password | VALID UNTIL=2021-10-10 00:00:00+00:00 | {}
(5 rows)
~~~

### Create a user that can create other users and manage authentication methods for the new users

The following example allows the user to [create other users](create-user.html) and [manage authentication methods](authentication.html#client-authentication) for them:

~~~ sql
root@:26257/defaultdb> CREATE USER can_create_users WITH CREATEROLE CREATELOGIN;
~~~

~~~ sql
root@:26257/defaultdb> SHOW USERS;
~~~

~~~
    username     |                options                | member_of
-----------------+---------------------------------------+------------
admin            |                                       | {}
can_create_users | CREATELOGIN, CREATEROLE               | {}
no_options       |                                       | {}
no_password      |                                       | {}
root             |                                       | {admin}
with_password    | VALID UNTIL=2021-10-10 00:00:00+00:00 | {}
(6 rows)
~~~

### Create a user that can create and rename databases

The following example allows the user to [create](create-database.html) or [rename](rename-database.html) databases:

~~~ sql
root@:26257/defaultdb> CREATE USER can_create_db WITH CREATEDB;
~~~

~~~ sql
root@:26257/defaultdb> SHOW USERS;
~~~

~~~
      username        |                options                | member_of
----------------------+---------------------------------------+------------
admin                 |                                       | {}
can_create_db         | CREATEDB                              | {}
can_create_users      | CREATELOGIN, CREATEROLE               | {}
no_options            |                                       | {}
no_password           |                                       | {}
root                  |                                       | {admin}
with_password         | VALID UNTIL=2021-10-10 00:00:00+00:00 | {}
(7 rows)
~~~

### Create a user that can pause, resume, and cancel non-admin jobs

The following example allows the user to cancel [queries](cancel-query.html) and [sessions](cancel-session.html) for other non-admin roles:

The following example allows the user to [pause](pause-job.html), [resume](resume-job.html), and [cancel](cancel-job.html) jobs:

~~~ sql
root@:26257/defaultdb> CREATE USER can_control_job WITH CONTROLJOB;
~~~

~~~ sql
root@:26257/defaultdb> SHOW USERS;
~~~

~~~
      username        |                options                | member_of
----------------------+---------------------------------------+------------
admin                 |                                       | {}
can_control_job       | CONTROLJOB                            | {}
can_create_db         | CREATEDB                              | {}
can_create_users      | CREATELOGIN, CREATEROLE               | {}
no_options            |                                       | {}
no_password           |                                       | {}
root                  |                                       | {admin}
with_password         | VALID UNTIL=2021-10-10 00:00:00+00:00 | {}
(8 rows)
~~~

### Create a user that can see and cancel non-admin queries and sessions

The following example allows the user to cancel [queries](cancel-query.html) and [sessions](cancel-session.html) for other non-admin roles:

~~~ sql
root@:26257/defaultdb> CREATE USER can_manage_queries WITH CANCELQUERY VIEWACTIVITY;
~~~

~~~ sql
root@:26257/defaultdb> SHOW USERS;
~~~

~~~
      username        |                options                | member_of
----------------------+---------------------------------------+------------
admin                 |                                       | {}
can_control_job       | CONTROLJOB                            | {}
can_create_db         | CREATEDB                              | {}
can_create_users      | CREATELOGIN, CREATEROLE               | {}
can_manage_queries    | CANCELQUERY, VIEWACTIVITY             | {}
no_options            |                                       | {}
no_password           |                                       | {}
root                  |                                       | {admin}
with_password         | VALID UNTIL=2021-10-10 00:00:00+00:00 | {}
(9 rows)
~~~

### Create a user that can control changefeeds

The following example allows the user to run [`CREATE CHANGEFEED`](create-changefeed.html):

~~~ sql
root@:26257/defaultdb> CREATE USER can_control_changefeed WITH CONTROLCHANGEFEED;
~~~

~~~ sql
root@:26257/defaultdb> SHOW USERS;
~~~

~~~
       username        |                options                | member_of
-----------------------+---------------------------------------+------------
admin                  |                                       | {}
can_control_changefeed | CONTROLCHANGEFEED                     | {}
can_control_job        | CONTROLJOB                            | {}
can_create_db          | CREATEDB                              | {}
can_create_users       | CREATELOGIN, CREATEROLE               | {}
can_manage_queries     | CANCELQUERY, VIEWACTIVITY             | {}
no_options             |                                       | {}
no_password            |                                       | {}
root                   |                                       | {admin}
with_password          | VALID UNTIL=2021-10-10 00:00:00+00:00 | {}
(10 rows)
~~~

### Create a user that can modify cluster settings

The following example allows the user to modify [cluster settings](cluster-settings.html):

~~~ sql
root@:26257/defaultdb> CREATE USER can_modify_cluster_setting WITH MODIFYCLUSTERSETTING;
~~~

~~~ sql
root@:26257/defaultdb> SHOW USERS;
~~~

~~~
         username          |                options                | member_of
---------------------------+---------------------------------------+------------
admin                      |                                       | {}
can_control_changefeed     | CONTROLCHANGEFEED                     | {}
can_control_job            | CONTROLJOB                            | {}
can_create_db              | CREATEDB                              | {}
can_create_users           | CREATELOGIN, CREATEROLE               | {}
can_manage_queries         | CANCELQUERY, VIEWACTIVITY             | {}
can_modify_cluster_setting | MODIFYCLUSTERSETTING                  | {}
no_options                 |                                       | {}
no_password                |                                       | {}
root                       |                                       | {admin}
with_password              | VALID UNTIL=2021-10-10 00:00:00+00:00 | {}
(11 rows)
~~~

## See also

- [Authorization](authorization.html)
- [`ALTER USER`](alter-user.html)
- [`DROP USER`](drop-user.html)
- [`SHOW USERS`](show-users.html)
- [`GRANT`](grant.html)
- [`SHOW GRANTS`](show-grants.html)
- [Create Security Certificates](cockroach-cert.html)
- [Other SQL Statements](sql-statements.html)
