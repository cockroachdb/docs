---
title: CREATE USER
summary: The CREATE USER statement creates SQL users, which let you control privileges on your databases and tables.
toc: true
docs_area: reference.sql
---

The `CREATE USER` [statement](sql-statements.html) creates SQL users, which let you control [privileges](security-reference/authorization.html#managing-privileges) on your databases and tables.

You can use the keywords `ROLE` and `USER` interchangeably. `CREATE USER` is equivalent to [`CREATE ROLE`](create-role.html), with one exception: `CREATE ROLE` sets the `NOLOGIN` [role option](#role-options), which prevents the new role from being used to log in to the database. You can use `CREATE ROLE` and specify the `LOGIN` [role option](#role-options) to achieve the same result as `CREATE USER`.

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Considerations

- After creating users, you must [grant them privileges to databases and tables](grant.html).
- All users belong to the `public` role, to which you can [grant](grant.html) and [revoke](revoke.html) privileges.
- On secure clusters, you must [create client certificates for users](cockroach-cert.html#create-the-certificate-and-key-pair-for-a-client) and users must [authenticate their access to the cluster](#user-authentication).

## Required privileges

 To create other users, the user must be a member of the `admin` role or have the [`CREATEROLE`](#create-a-user-that-can-create-other-users-and-manage-authentication-methods-for-the-new-users) parameter set.

## Synopsis

See [`CREATE ROLE`: Synopsis](create-role.html#synopsis).

## Parameters

 Parameter | Description
-----------|-------------
`name` | The name of the user to create.
`WITH role_option` | Apply a [role option](#role-options) to the role.

### User names

- Are case-insensitive.
- Must start with either a letter or underscore.
- Must contain only letters, numbers, periods, or underscores.
- Must be between 1 and 63 characters.
- Cannot be `none`.
- Cannot start with `pg_` or `crdb_internal`. Object names with these prefixes are reserved for [system catalogs](system-catalogs.html).
- User and role names share the same namespace and must be unique.

### Role options

{% include {{page.version.version}}/sql/role-options.md %}

## User authentication

Secure clusters require users to authenticate their access to databases and tables. CockroachDB offers three methods for this:

- [Client certificate and key authentication](authentication.html#client-authentication), which is available to all users. To ensure the highest level of security, we recommend only using client certificate and key authentication.

- [Password authentication](#create-a-user-with-a-password), which is available to users and roles who you've created passwords for. To create a user with a password, use the `WITH PASSWORD` clause of `CREATE USER`. To add a password to an existing user, use the [`ALTER USER`](alter-user.html) statement.

    Users can use passwords to authenticate without supplying client certificates and keys; however, we recommend using certificate-based authentication whenever possible.

    Password creation is supported only in secure clusters.

- [GSSAPI authentication](gssapi_authentication.html), which is available to [Enterprise users](enterprise-licensing.html).

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

Usernames are case-insensitive; must start with a letter, number, or underscore; must contain only letters, numbers, periods, or underscores; and must be between 1 and 63 characters.

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

The following example allows the user to cancel [queries](cancel-query.html) and [sessions](cancel-session.html) for other non-`admin` roles:

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

The following example allows the user to cancel [queries](cancel-query.html) and [sessions](cancel-session.html) for other non-`admin` roles:

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
- [SQL Statements](sql-statements.html)
- [Online Schema Changes](online-schema-changes.html)
