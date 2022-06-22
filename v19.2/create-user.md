---
title: CREATE USER
summary: The CREATE USER statement creates SQL users, which let you control privileges on your databases and tables.
toc: true
---

The `CREATE USER` [statement](sql-statements.html) creates SQL users, which let you control [privileges](authorization.html#assign-privileges) on your databases and tables.

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

The user must have the `INSERT` and `UPDATE` [privileges](authorization.html#assign-privileges) on the `system.users` table.

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
`password` | Let the user [authenticate their access to a secure cluster](#user-authentication) using this password. Passwords must be entered as [string](string.html) values surrounded by single quotes (`'`).<br><br>Password creation is supported only in secure clusters for non-`root` users. The `root` user must authenticate with a client certificate and key.

## User authentication

Secure clusters require users to authenticate their access to databases and tables. CockroachDB offers two methods for this:

- [Client certificate and key authentication](#secure-clusters-with-client-certificates), which is available to all users. To ensure the highest level of security, we recommend only using client certificate and key authentication.

- [Password authentication](#secure-clusters-with-passwords), which is available to non-`root` users who you've created passwords for. To create a user with a password, use the `WITH PASSWORD` clause of `CREATE USER`. To add a password to an existing user, use the [`ALTER USER`](alter-user.html) statement.

    Users can use passwords to authenticate without supplying client certificates and keys; however, we recommend using certificate-based authentication whenever possible.

    Password creation is supported only in secure clusters.

## Examples

### Create a user

Usernames are case-insensitive; must start with a letter, number, or underscore; must contain only letters, numbers, or underscores; and must be between 1 and 63 characters.

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE USER jpointsman;
~~~

After creating users, you must:

- [Grant them privileges to databases](grant.html).
- For secure clusters, you must also [create their client certificates](cockroach-cert.html#create-the-certificate-and-key-pair-for-a-client).

### Create a user with a password

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE USER jpointsman WITH PASSWORD 'Q7gc8rEdS';
~~~

Password creation is supported only in secure clusters for non-`root` users. The `root` user must authenticate with a client certificate and key.

### Manage users

After creating a user, you can use the [`ALTER USER`](alter-user.html) statement to add or change the user's password and the [`DROP USER`](drop-user.html) statement to the remove users.

### Authenticate as a specific user

<div class="filters clearfix">
  <button style="width: 15%" class="filter-button" data-scope="secure">Secure</button>
  <button style="width: 15%" class="filter-button" data-scope="insecure">Insecure</button>
</div>
<p></p>

<div class="filter-content" markdown="1" data-scope="secure">

#### Secure clusters with client certificates

All users can authenticate their access to a secure cluster using [a client certificate](cockroach-cert.html#create-the-certificate-and-key-pair-for-a-client) issued to their username.

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --user=jpointsman
~~~

#### Secure clusters with passwords

[Users with passwords](#create-a-user) can authenticate their access by entering their password at the command prompt instead of using their client certificate and key.

If we cannot find client certificate and key files matching the user, we fall back on password authentication.

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --user=jpointsman
~~~

</div>

<div class="filter-content" markdown="1" data-scope="insecure">

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure --user=jpointsman
~~~

</div>

## See also

- [Authorization](authorization.html)
- [`ALTER USER`](alter-user.html)
- [`DROP USER`](drop-user.html)
- [`SHOW USERS`](show-users.html)
- [`GRANT`](grant.html)
- [`SHOW GRANTS`](show-grants.html)
- [Create Security Certificates](cockroach-cert.html)
- [Other SQL Statements](sql-statements.html)
