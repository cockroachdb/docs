---
title: CREATE USER
summary: The CREATE USER statement creates SQL users, which let you control privileges on your databases and tables.
toc: true
---

The `CREATE USER` [statement](sql-statements.html) creates SQL users, which let you control [privileges](authorization.html#assign-privileges) on your databases and tables.

{{site.data.alerts.callout_info}}
 Since the keywords `ROLE` and `USER` can now be used interchangeably in SQL statements for enhanced Postgres compatibility, `CREATE USER` is now an alias for [`CREATE ROLE`](create-role.html).
{{site.data.alerts.end}}

## Considerations

- Usernames:
    - Are case-insensitive
    - Must start with a letter, number, or underscore
    - Must contain only letters, numbers, periods, or underscores
    - Must be between 1 and 63 characters.
- After creating users, you must [grant them privileges to databases and tables](grant.html).
- All users belong to the `public` role, to which you can [grant](grant.html) and [revoke](revoke.html) privileges.
- On secure clusters, you must [create client certificates for users](cockroach-cert.html#create-the-certificate-and-key-pair-for-a-client) and users must [authenticate their access to the cluster](#user-authentication).

## Required privileges

 To create other users, the user must be a member of the `admin` role or have the [`CREATEROLE`](#allow-the-user-to-create-other-users) parameter set.

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
`user_name` | The name of the user you want to create.<br><br>Usernames are case-insensitive; must start with a letter, number, or underscore; must contain only letters, numbers, or underscores; and must be between 1 and 63 characters.
`CREATELOGIN`/`NOCREATELOGIN` | Allow or disallow the user to manage authentication using the `WITH PASSWORD`, `VALID UNTIL`, and `LOGIN/NOLOGIN` parameters. <br><br>By default, the parameter is set to `NOCREATELOGIN` for all non-admin users.
`LOGIN`/`NOLOGIN` | The `LOGIN` parameter allows a user to login with one of the [client authentication methods](authentication.html#client-authentication). [Setting the parameter to `NOLOGIN`](#change-login-privileges-for-a-role) prevents the user from logging in using any authentication method.
`password` | Let the user [authenticate their access to a secure cluster](authentication.html#client-authentication) using this password. Passwords should be entered as a [string literal](sql-constants.html#string-literals). For compatibility with PostgreSQL, a password can also be entered as an [identifier](#create-a-user-with-a-password-using-an-identifier). <br><br>To prevent a user from using [password authentication](authentication.html#client-authentication) and to mandate [certificate-based client authentication](authentication.html#client-authentication), [set the password as `NULL`](#prevent-a-user-from-using-password-authentication).
`VALID UNTIL` |  The date and time (in the [`timestamp`](timestamp.html) format) after which the password is not valid.
`CREATEROLE`/`NOCREATEROLE` |  Allow or disallow the new user to create, alter, and drop other non-admin users. <br><br>By default, the parameter is set to `NOCREATEROLE` for all non-admin users.
`CREATEDB`/`NOCREATEDB` | Allow or disallow the user to create or rename a database. The user is assigned as the owner of the database. <br><br>By default, the parameter is set to `NOCREATEDB` for all non-admin users.
`CONTROLJOB`/`NOCONTROLJOB` | Allow or disallow the user to pause, resume, and cancel jobs. Non-admin users cannot control jobs created by admins. <br><br>By default, the parameter is set to `NOCONTROLJOB` for all non-admin users.
`CANCELQUERY`/`NOCANCELQUERY` | Allow or disallow the user to cancel queries and sessions of other users. Without this privilege, users can only cancel their own queries and sessions. Even with this privilege, non-admins cannot cancel admin queries or sessions. This option should usually be combined with `VIEWACTIVITY` so that the user can view other users' query and session information. <br><br>By default, the parameter is set to `NOCANCELQUERY` for all non-admin users.
`VIEWACTIVITY`/`NOVIEWACTIVITY` | Allow or disallow a role to see other users' queries and sessions using `SHOW QUERIES`, `SHOW SESSIONS`, and the Statements and Transactions pages in the Admin UI. Without this privilege, the `SHOW` commands only show the user's own data and the Admin UI pages are unavailable. <br><br>By default, the parameter is set to `NOVIEWACTIVITY` for all non-admin users.
`CONTROLCHANGEFEED`/`NOCONTROLCHANGEFEED` | Allow or disallow the user to run `CREATE CHANGEFEED` on tables they have `SELECT` privileges on. <br><br>By default, the parameter is set to `NOCONTROLCHANGEFEED` for all non-admin users.
`MODIFYCLUSTERSETTING`/`NOMODIFYCLUSTERSETTING` | Allow or disallow the user to to modify the cluster settings with the `sql.defaults` prefix. <br><br>By default, the parameter is set to `NOMODIFYCLUSTERSETTING` for all non-admin users.

## User authentication

Secure clusters require users to authenticate their access to databases and tables. CockroachDB offers three methods for this:

- [Client certificate and key authentication](#secure-clusters-with-client-certificates), which is available to all users. To ensure the highest level of security, we recommend only using client certificate and key authentication.

- [Password authentication](#secure-clusters-with-passwords), which is available to users and roles who you've created passwords for. To create a user with a password, use the `WITH PASSWORD` clause of `CREATE USER`. To add a password to an existing user, use the [`ALTER USER`](alter-user.html) statement.

    Users can use passwords to authenticate without supplying client certificates and keys; however, we recommend using certificate-based authentication whenever possible.

    Password creation is supported only in secure clusters.

- [GSSAPI authentication](gssapi_authentication.html), which is available to [Enterprise users](enterprise-licensing.html).

## Examples

To run the following examples, [start a secure single-node cluster](/cockroach-start-single-node.html) and use the built-in SQL shell:

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

{% include copy-clipboard.html %}
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

~~~ sql
root@:26257/defaultdb> CREATE USER can_create_users WITH CREATEROLE;
~~~

~~~ sql
root@:26257/defaultdb> SHOW USERS;
~~~

~~~
    username     |                options                | member_of
-----------------+---------------------------------------+------------
admin            |                                       | {}
can_create_users | CREATEROLE                            | {}
no_options       |                                       | {}
no_password      |                                       | {}
root             |                                       | {admin}
with_password    | VALID UNTIL=2021-10-10 00:00:00+00:00 | {}
(6 rows)
~~~

### Create a user that can only manage authentication for other users

~~~ sql
root@:26257/defaultdb> CREATE USER manage_auth_for_users WITH CREATELOGIN;
~~~

~~~ sql
root@:26257/defaultdb> SHOW USERS;
~~~

~~~
      username        |                options                | member_of
----------------------+---------------------------------------+------------
admin                 |                                       | {}
can_create_users      | CREATEROLE                            | {}
manage_auth_for_users | CREATELOGIN                           | {}
no_options            |                                       | {}
no_password           |                                       | {}
root                  |                                       | {admin}
with_password         | VALID UNTIL=2021-10-10 00:00:00+00:00 | {}
(7 rows)
~~~

### Create a user that can create and rename databases

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
can_create_users      | CREATEROLE                            | {}
manage_auth_for_users | CREATELOGIN                           | {}
no_options            |                                       | {}
no_password           |                                       | {}
root                  |                                       | {admin}
with_password         | VALID UNTIL=2021-10-10 00:00:00+00:00 | {}
(8 rows)
~~~

### Create a user that can pause, resume, and cancel non-admin jobs

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
can_create_users      | CREATEROLE                            | {}
manage_auth_for_users | CREATELOGIN                           | {}
no_options            |                                       | {}
no_password           |                                       | {}
root                  |                                       | {admin}
with_password         | VALID UNTIL=2021-10-10 00:00:00+00:00 | {}
(9 rows)
~~~

### Create a user that can see and cancel non-admin queries and sessions

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
can_create_users      | CREATEROLE                            | {}
can_manage_queries    | CANCELQUERY, VIEWACTIVITY             | {}
manage_auth_for_users | CREATELOGIN                           | {}
no_options            |                                       | {}
no_password           |                                       | {}
root                  |                                       | {admin}
with_password         | VALID UNTIL=2021-10-10 00:00:00+00:00 | {}
(10 rows)
~~~

### Create a user that can control changefeeds

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
can_create_users       | CREATEROLE                            | {}
can_manage_queries     | CANCELQUERY, VIEWACTIVITY             | {}
manage_auth_for_users  | CREATELOGIN                           | {}
no_options             |                                       | {}
no_password            |                                       | {}
root                   |                                       | {admin}
with_password          | VALID UNTIL=2021-10-10 00:00:00+00:00 | {}
(11 rows)
~~~

### Create a user that can modify cluster settings

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
can_create_users           | CREATEROLE                            | {}
can_manage_queries         | CANCELQUERY, VIEWACTIVITY             | {}
can_modify_cluster_setting | MODIFYCLUSTERSETTING                  | {}
manage_auth_for_users      | CREATELOGIN                           | {}
no_options                 |                                       | {}
no_password                |                                       | {}
root                       |                                       | {admin}
with_password              | VALID UNTIL=2021-10-10 00:00:00+00:00 | {}
(12 rows)
~~~


<!--

### Create a user

Usernames are case-insensitive; must start with a letter, number, or underscore; must contain only letters, numbers, periods, or underscores; and must be between 1 and 63 characters.

{% include copy-clipboard.html %}
~~~ sql
> CREATE USER carl;
~~~

After creating users, you must:

- [Grant them privileges to databases](grant.html).
- For secure clusters, you must also [create their client certificates](cockroach-cert.html#create-the-certificate-and-key-pair-for-a-client).

### Allow the user to create other users

{% include copy-clipboard.html %}
~~~ sql
> CREATE USER carl with CREATEROLE;
~~~

### Create a user with a password

{% include copy-clipboard.html %}
~~~ sql
> CREATE USER carl WITH PASSWORD 'ilov3beefjerky';
~~~

### Create a user with a password using an identifier

The following statement changes the password to `ilov3beefjerky`, as above:

{% include copy-clipboard.html %}
~~~ sql
> CREATE USER carl WITH PASSWORD ilov3beefjerky;
~~~

This is equivalent to the example in the previous section because the password contains only lowercase characters.

In contrast, the following statement changes the password to `thereisnotomorrow`, even though the password in the syntax contains capitals, because identifiers are normalized automatically:

{% include copy-clipboard.html %}
~~~ sql
> CREATE USER carl WITH PASSWORD ThereIsNoTomorrow;
~~~

To preserve case in a password specified using identifier syntax, use double quotes:

{% include copy-clipboard.html %}
~~~ sql
> CREATE USER carl WITH PASSWORD "ThereIsNoTomorrow";
~~~

### Prevent a user from using password authentication

The following statement prevents the user from using password authentication and mandates certificate-based client authentication:

{% include copy-clipboard.html %}
~~~ sql
> CREATE USER carl WITH PASSWORD NULL;
~~~

### Set password validity

The following statement sets the date and time after which the password is not valid:

{% include copy-clipboard.html %}
~~~ sql
> CREATE USER carl VALID UNTIL '2021-01-01';
~~~

### Manage users

After creating a user, you can use the [`ALTER USER`](alter-user.html) statement to add or change the user's password, update role options, and the [`DROP USER`](drop-user.html) statement to the remove users.

### Authenticate as a specific user

<div class="filters clearfix">
  <button style="width: 15%" class="filter-button" data-scope="secure">Secure</button>
  <button style="width: 15%" class="filter-button" data-scope="insecure">Insecure</button>
</div>
<p></p>

<div class="filter-content" markdown="1" data-scope="secure">

#### Secure clusters with client certificates

All users can authenticate their access to a secure cluster using [a client certificate](cockroach-cert.html#create-the-certificate-and-key-pair-for-a-client) issued to their username.

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --user=carl
~~~

#### Secure clusters with passwords

[Users with passwords](#create-a-user) can authenticate their access by entering their password at the command prompt instead of using their client certificate and key.

If we cannot find client certificate and key files matching the user, we fall back on password authentication.

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --user=carl
~~~

</div>

<div class="filter-content" markdown="1" data-scope="insecure">

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure --user=carl
~~~

</div>

### Set login privileges for a user

The following statement prevents the user from logging in using any [user authentication method](#user-authentication):

{% include copy-clipboard.html %}
~~~ sql
> CREATE USER carl NOLOGIN;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW USERS;
~~~

~~~
  username |  options   | member_of
-----------+------------+------------
  admin    | CREATEROLE | {}
  carl     | NOLOGIN    | {}
  root     | CREATEROLE | {admin}
(3 rows)
~~~

To allow the user to log in using one of the user authentication methods, use the `ALTER USER` statement:

{% include copy-clipboard.html %}
~~~ sql
> ALTER USER carl LOGIN;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW USERS;
~~~

~~~
  username |  options   | member_of
-----------+------------+------------
  admin    | CREATEROLE | {}
  carl     |            | {}
  root     | CREATEROLE | {admin}
(3 rows)
~~~

-->

## See also

- [Authorization](authorization.html)
- [`ALTER USER`](alter-user.html)
- [`DROP USER`](drop-user.html)
- [`SHOW USERS`](show-users.html)
- [`GRANT`](grant.html)
- [`SHOW GRANTS`](show-grants.html)
- [Create Security Certificates](cockroach-cert.html)
- [Other SQL Statements](sql-statements.html)
