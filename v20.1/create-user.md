---
title: CREATE USER
summary: The CREATE USER statement creates SQL users, which let you control privileges on your databases and tables.
toc: true
---

The `CREATE USER` [statement](sql-statements.html) creates SQL users, which let you control [privileges](authorization.html#assign-privileges) on your databases and tables.

{{site.data.alerts.callout_info}}
<span class="version-tag">New in v20.1</span>: Since the keywords `ROLE` and `USER` can now be used interchangeably in SQL statements for enhanced Postgres compatibility, `CREATE USER` is now an alias for [`CREATE ROLE`](create-role.html).
{{site.data.alerts.end}}

## Considerations

- Usernames:
    - Are case-insensitive
    - Must start with a letter, number, or underscore
    - Must contain only letters, numbers, or underscores
    - Must be between 1 and 63 characters.
- After creating users, you must [grant them privileges to databases and tables](grant.html).
- All users belong to the `public` role, to which you can [grant](grant.html) and [revoke](revoke.html) privileges.
- On secure clusters, you must [create client certificates for users](cockroach-cert.html#create-the-certificate-and-key-pair-for-a-client) and users must [authenticate their access to the cluster](#user-authentication).

## Required privileges

<span class="version-tag">New in v20.1:</span> To create other users, the user must have the [`CREATEROLE`](#allow-the-user-to-create-other-users) parameter set.

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
`password` | Let the user [authenticate their access to a secure cluster](#user-authentication) using this password. Passwords must be entered as [string](string.html) values surrounded by single quotes (`'`).<br><br>Password creation is supported only in secure clusters.
`VALID UNTIL` | <span class="version-tag">New in v20.1:</span> The date and time (in the [`timestamp`](timestamp.html) format) after which the password is not valid.
`LOGIN`/`NOLOGIN` | <span class="version-tag">New in v20.1:</span> The `LOGIN` parameter allows a user to login with one of the [user authentication methods](#user-authentication). [Setting the parameter to `NOLOGIN`](#set-login-privileges-for-a-user) prevents the user from logging in using any authentication method. <br><br>By default, the parameter is set to `LOGIN` for the `CREATE USER` statement.
`CREATEROLE`/`NOCREATEROLE` | <span class="version-tag">New in v20.1:</span> Allow or disallow the new user to create, alter, and drop other users. <br><br>By default, the parameter is set to `NOCREATEROLE` for all non-admin and non-root users.

## User authentication

Secure clusters require users to authenticate their access to databases and tables. CockroachDB offers three methods for this:

- [Client certificate and key authentication](#secure-clusters-with-client-certificates), which is available to all users. To ensure the highest level of security, we recommend only using client certificate and key authentication.

- [Password authentication](#secure-clusters-with-passwords), which is available to users and roles who you've created passwords for. To create a user with a password, use the `WITH PASSWORD` clause of `CREATE USER`. To add a password to an existing user, use the [`ALTER USER`](alter-user.html) statement.

    Users can use passwords to authenticate without supplying client certificates and keys; however, we recommend using certificate-based authentication whenever possible.

    Password creation is supported only in secure clusters.

- [**GSSAPI authentication**](gssapi_authentication.html), which is available to [Enterprise users](enterprise-licensing.html).

## Examples

### Create a user

Usernames are case-insensitive; must start with a letter, number, or underscore; must contain only letters, numbers, or underscores; and must be between 1 and 63 characters.

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
> CREATE USER carl WITH PASSWORD 'Q7gc8rEdS';
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

## See also

- [Authorization](authorization.html)
- [`ALTER USER`](alter-user.html)
- [`DROP USER`](drop-user.html)
- [`SHOW USERS`](show-users.html)
- [`GRANT`](grant.html)
- [`SHOW GRANTS`](show-grants.html)
- [Create Security Certificates](cockroach-cert.html)
- [Other SQL Statements](sql-statements.html)
