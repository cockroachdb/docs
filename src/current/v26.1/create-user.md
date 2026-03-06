---
title: CREATE USER
summary: The CREATE USER statement creates SQL users, which let you control privileges on your databases and tables.
toc: true
docs_area: reference.sql
---

The `CREATE USER` [statement]({% link {{ page.version.version }}/sql-statements.md %}) creates SQL users, which let you control [privileges]({% link {{ page.version.version }}/security-reference/authorization.md %}#managing-privileges) on your databases and tables.

You can use the keywords `ROLE` and `USER` interchangeably. `CREATE USER` is equivalent to [`CREATE ROLE`]({% link {{ page.version.version }}/create-role.md %}), with one exception: `CREATE ROLE` sets the `NOLOGIN` [role option](#role-options), which prevents the new role from being used to log in to the database. You can use `CREATE ROLE` and specify the `LOGIN` [role option](#role-options) to achieve the same result as `CREATE USER`.

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Considerations

- After creating users, you must [grant them privileges to databases and tables]({% link {{ page.version.version }}/grant.md %}).
- All users belong to the `public` role, to which you can [grant]({% link {{ page.version.version }}/grant.md %}) and [revoke]({% link {{ page.version.version }}/revoke.md %}) privileges.
- On secure clusters, you must [create client certificates for users]({% link {{ page.version.version }}/cockroach-cert.md %}#create-the-certificate-and-key-pair-for-a-client) and users must [authenticate their access to the cluster](#user-authentication).
- The `CREATE USER` statement waits for full-cluster visibility of the new user metadata. It is not blocked by long-running transactions that may have accessed older metadata, and it does not create a [background job]({% link {{ page.version.version }}/show-jobs.md %}).

## Required privileges

 To create other users, the user must be a member of the `admin` role or have the [`CREATEROLE`](#create-a-user-that-can-create-other-users-and-manage-authentication-methods-for-the-new-users) parameter set.

## Synopsis

See [`CREATE ROLE`: Synopsis]({% link {{ page.version.version }}/create-role.md %}#synopsis).

## Parameters

 Parameter | Description
-----------|-------------
`name` | The name of the user to create.
`WITH role_option` | Apply a [role option](#role-options) to the role.

### User names

- Are case-insensitive.
- Must start with a letter or underscore. 
- Must contain only letters, numbers, periods, or underscores.
- Must be between 1 and 63 characters.
- Cannot be `none`.
- Cannot start with `pg_` or `crdb_internal`. Object names with these prefixes are reserved for [system catalogs]({% link {{ page.version.version }}/system-catalogs.md %}).
- User and role names share the same namespace and must be unique.

### Role options

{% include {{page.version.version}}/sql/role-options.md %}

## User authentication

Secure clusters require users to authenticate their access to databases and tables. CockroachDB offers three methods for this:

- [Client certificate and key authentication]({% link {{ page.version.version }}/authentication.md %}#client-authentication), which is available to all users. To ensure the highest level of security, we recommend only using client certificate and key authentication.

- [Password authentication](#create-a-user-with-a-password), which is available to users and roles who you've created passwords for. To create a user with a password, use the `WITH PASSWORD` clause of `CREATE USER`. To add a password to an existing user, use the [`ALTER USER`]({% link {{ page.version.version }}/alter-user.md %}) statement.

    Users can use passwords to authenticate without supplying client certificates and keys; however, we recommend using certificate-based authentication whenever possible.

    Password creation is supported only in secure clusters.

- [GSSAPI authentication]({% link {{ page.version.version }}/gssapi_authentication.md %}).

## Examples

To run the following examples, [start a secure single-node cluster]({% link {{ page.version.version }}/cockroach-start-single-node.md %}) and use the built-in SQL shell:

~~~ shell
$ cockroach sql --certs-dir=certs
~~~

~~~ sql
> SHOW USERS;
~~~

~~~
username | options | member_of | estimated_last_login_time
---------+---------+-----------+------------------------------
admin    | {}      | {}        | NULL
root     | {}      | {admin}   | NULL
(2 rows)
~~~

{{site.data.alerts.callout_info}}
The following statements are run by the `root` user that is a member of the `admin` role and has `ALL` privileges.
{{site.data.alerts.end}}

### Create a user

Usernames are case-insensitive; must start with a letter or underscore; must contain only letters, numbers, periods, or underscores; and must be between 1 and 63 characters.

~~~ sql
root@:26257/defaultdb> CREATE USER no_options;
~~~

~~~ sql
root@:26257/defaultdb> SHOW USERS;
~~~

~~~
 username  | options | member_of | estimated_last_login_time
-----------+---------+-----------+------------------------------
admin      | {}      | {}        | NULL
no_options | {}      | {}        | NULL
root       | {}      | {admin}   | NULL
(3 rows)
~~~

After creating users, you must:

- [Grant them privileges to databases]({% link {{ page.version.version }}/grant.md %}).
- For secure clusters, you must also [create their client certificates]({% link {{ page.version.version }}/cockroach-cert.md %}#create-the-certificate-and-key-pair-for-a-client).

### Create a user with a password

~~~ sql
root@:26257/defaultdb> CREATE USER with_password WITH LOGIN PASSWORD '$tr0nGpassW0rD' VALID UNTIL '2021-10-10';
~~~

~~~ sql
root@:26257/defaultdb> SHOW USERS;
~~~

~~~
  username    |                  options                  | member_of | estimated_last_login_time
--------------+-------------------------------------------+-----------+------------------------------
admin         | {}                                        | {}        | NULL
no_options    | {}                                        | {}        | NULL
root          | {}                                        | {admin}   | NULL
with_password | {VALID UNTIL=2025-10-10 00:00:00+00:00}   | {}        | NULL
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
  username    |                  options                  | member_of | estimated_last_login_time
--------------+-------------------------------------------+-----------+------------------------------
admin         | {}                                        | {}        | NULL
no_options    | {}                                        | {}        | NULL
no_password   | {}                                        | {}        | NULL
root          | {}                                        | {admin}   | NULL
with_password | {VALID UNTIL=2025-10-10 00:00:00+00:00}   | {}        | NULL
(5 rows)
~~~

### Create a user that can create other users and manage authentication methods for the new users

The following example allows the user to [create other users]({% link {{ page.version.version }}/create-user.md %}) and [manage authentication methods]({% link {{ page.version.version }}/authentication.md %}#client-authentication) for them:

~~~ sql
root@:26257/defaultdb> CREATE USER can_create_users WITH CREATEROLE CREATELOGIN;
~~~

~~~ sql
root@:26257/defaultdb> SHOW USERS;
~~~

~~~
    username     |                  options                  | member_of | estimated_last_login_time
-----------------+-------------------------------------------+-----------+------------------------------
admin            | {}                                        | {}        | NULL
can_create_users | {CREATELOGIN,CREATEROLE}                  | {}        | NULL
no_options       | {}                                        | {}        | NULL
no_password      | {}                                        | {}        | NULL
root             | {}                                        | {admin}   | NULL
with_password    | {VALID UNTIL=2025-10-10 00:00:00+00:00}   | {}        | NULL
(6 rows)
~~~

### Create a user that can create and rename databases

The following example allows the user to [create]({% link {{ page.version.version }}/create-database.md %}) or [rename]({% link {{ page.version.version }}/alter-database.md %}#rename-to) databases:

~~~ sql
root@:26257/defaultdb> CREATE USER can_create_db WITH CREATEDB;
~~~

~~~ sql
root@:26257/defaultdb> SHOW USERS;
~~~

~~~
      username        |                  options                  | member_of | estimated_last_login_time
----------------------+-------------------------------------------+-----------+------------------------------
admin                 | {}                                        | {}        | NULL
can_create_db         | {CREATEDB}                                | {}        | NULL
can_create_users      | {CREATELOGIN,CREATEROLE}                  | {}        | NULL
no_options            | {}                                        | {}        | NULL
no_password           | {}                                        | {}        | NULL
root                  | {}                                        | {admin}   | NULL
with_password         | {VALID UNTIL=2025-10-10 00:00:00+00:00}   | {}        | NULL
(7 rows)
~~~

### Create a user that can pause, resume, and cancel non-admin jobs

The following example allows the user to [pause]({% link {{ page.version.version }}/pause-job.md %}), [resume]({% link {{ page.version.version }}/resume-job.md %}), and [cancel]({% link {{ page.version.version }}/cancel-job.md %}) jobs:

~~~ sql
root@:26257/defaultdb> CREATE USER can_control_job WITH CONTROLJOB;
~~~

~~~ sql
root@:26257/defaultdb> SHOW USERS;
~~~

~~~
      username        |                  options                  | member_of | estimated_last_login_time
----------------------+-------------------------------------------+-----------+------------------------------
admin                 | {}                                        | {}        | NULL
can_control_job       | {CONTROLJOB}                              | {}        | NULL
can_create_db         | {CREATEDB}                                | {}        | NULL
can_create_users      | {CREATELOGIN,CREATEROLE}                  | {}        | NULL
no_options            | {}                                        | {}        | NULL
no_password           | {}                                        | {}        | NULL
root                  | {}                                        | {admin}   | NULL
with_password         | {VALID UNTIL=2025-10-10 00:00:00+00:00}   | {}        | NULL
(8 rows)
~~~

### Create a user that can see and cancel non-admin queries and sessions

The following example allows the user to cancel [queries]({% link {{ page.version.version }}/cancel-query.md %}) and [sessions]({% link {{ page.version.version }}/cancel-session.md %}) for other non-`admin` roles:

~~~ sql
root@:26257/defaultdb> CREATE USER can_manage_queries WITH CANCELQUERY VIEWACTIVITY;
~~~

~~~ sql
root@:26257/defaultdb> SHOW USERS;
~~~

~~~
      username        |                  options                  | member_of | estimated_last_login_time
----------------------+-------------------------------------------+-----------+------------------------------
admin                 | {}                                        | {}        | NULL
can_control_job       | {CONTROLJOB}                              | {}        | NULL
can_create_db         | {CREATEDB}                                | {}        | NULL
can_create_users      | {CREATELOGIN,CREATEROLE}                  | {}        | NULL
can_manage_queries    | {CANCELQUERY,VIEWACTIVITY}                | {}        | NULL
no_options            | {}                                        | {}        | NULL
no_password           | {}                                        | {}        | NULL
root                  | {}                                        | {admin}   | NULL
with_password         | {VALID UNTIL=2025-10-10 00:00:00+00:00}   | {}        | NULL
(9 rows)
~~~

### Create a user that can control changefeeds

The following example allows the user to run [`CREATE CHANGEFEED`]({% link {{ page.version.version }}/create-changefeed.md %}):

~~~ sql
root@:26257/defaultdb> CREATE USER can_control_changefeed WITH CONTROLCHANGEFEED;
~~~

~~~ sql
root@:26257/defaultdb> SHOW USERS;
~~~

~~~
       username        |                  options                  | member_of | estimated_last_login_time
-----------------------+-------------------------------------------+-----------+------------------------------
admin                  | {}                                        | {}        | NULL
can_control_changefeed | {CONTROLCHANGEFEED}                       | {}        | NULL
can_control_job        | {CONTROLJOB}                              | {}        | NULL
can_create_db          | {CREATEDB}                                | {}        | NULL
can_create_users       | {CREATELOGIN,CREATEROLE}                  | {}        | NULL
can_manage_queries     | {CANCELQUERY,VIEWACTIVITY}                | {}        | NULL
no_options             | {}                                        | {}        | NULL
no_password            | {}                                        | {}        | NULL
root                   | {}                                        | {admin}   | NULL
with_password          | {VALID UNTIL=2025-10-10 00:00:00+00:00}   | {}        | NULL
(10 rows)
~~~

### Create a user that can modify cluster settings

The following example allows the user to modify [cluster settings]({% link {{ page.version.version }}/cluster-settings.md %}):

~~~ sql
root@:26257/defaultdb> CREATE USER can_modify_cluster_setting WITH MODIFYCLUSTERSETTING;
~~~

~~~ sql
root@:26257/defaultdb> SHOW USERS;
~~~

~~~
         username          |                  options                  | member_of | estimated_last_login_time
---------------------------+-------------------------------------------+-----------+------------------------------
admin                      | {}                                        | {}        | NULL
can_control_changefeed     | {CONTROLCHANGEFEED}                       | {}        | NULL
can_control_job            | {CONTROLJOB}                              | {}        | NULL
can_create_db              | {CREATEDB}                                | {}        | NULL
can_create_users           | {CREATELOGIN,CREATEROLE}                  | {}        | NULL
can_manage_queries         | {CANCELQUERY,VIEWACTIVITY}                | {}        | NULL
can_modify_cluster_setting | {MODIFYCLUSTERSETTING}                    | {}        | NULL
no_options                 | {}                                        | {}        | NULL
no_password                | {}                                        | {}        | NULL
root                       | {}                                        | {admin}   | NULL
with_password              | {VALID UNTIL=2025-10-10 00:00:00+00:00}   | {}        | NULL
(11 rows)
~~~

### Create debug_user for diagnostics (Preview)

<span class="version-tag">New in v26.1:</span> The `debug_user` is a special privileged user for collecting [`cockroach debug zip`]({% link {{ page.version.version }}/cockroach-debug-zip.md %}) and [`cockroach debug tsdump`]({% link {{ page.version.version }}/cockroach-debug-tsdump.md %}) data. For complete setup including certificate generation and server configuration, see [Disable root login and use debug_user]({% link {{ page.version.version }}/security-reference/authentication.md %}#disable-root-login-and-use-debug_user).

Basic user creation:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE USER debug_user;
~~~

For SQL privilege requirements (needed for debug zip only, not tsdump), see Step 1 in the [debug_user setup procedure]({% link {{ page.version.version }}/security-reference/authentication.md %}#step-1-create-debug_user).

## See also

- [Authorization]({% link {{ page.version.version }}/authorization.md %})
- [`ALTER USER`]({% link {{ page.version.version }}/alter-user.md %})
- [`DROP USER`]({% link {{ page.version.version }}/drop-user.md %})
- [`SHOW USERS`]({% link {{ page.version.version }}/show-users.md %})
- [`GRANT`]({% link {{ page.version.version }}/grant.md %})
- [`SHOW GRANTS`]({% link {{ page.version.version }}/show-grants.md %})
- [Create Security Certificates]({% link {{ page.version.version }}/cockroach-cert.md %})
- [SQL Statements]({% link {{ page.version.version }}/sql-statements.md %})
- [Online Schema Changes]({% link {{ page.version.version }}/online-schema-changes.md %})
