---
title: CREATE USER
summary: The CREATE USER statement creates SQL users, which let you control privileges on your databases and tables.
toc: true
---

The `CREATE USER` [statement](sql-statements.html) creates SQL users, which let you control [privileges](privileges.html) on your databases and tables.

When creating users, it's important to note:

- Usernames are case-insensitive; must start with either a letter or underscore; must contain only letters, numbers, or underscores; and must be between 1 and 63 characters.
- After creating users, you must [grant them privileges to databases and tables](grant.html).
- On secure clusters, users must [authenticate their access to the cluster](#user-authentication).

{{site.data.alerts.callout_info}}You can also create and manage users through the <a href="create-and-manage-users.html"><code>cockroach user</code></a> command. Notably, this is the most efficient way to <a href="create-and-manage-users.html#remove-a-user">remove users</a>.{{site.data.alerts.end}}


## Required Privileges

The user must have the `INSERT` and `UPDATE` [privileges](privileges.html) on the `system.users` table.

## Synopsis

{% include {{ page.version.version }}/sql/diagrams/create_user.html %}

## Parameters

<style>
table td:first-child {
    min-width: 225px;
}
</style>

| Parameter | Description |
|-----------|-------------|
|`name` | The name of the user you want to create.<br><br>Usernames are case-insensitive; must start with either a letter or underscore; must contain only letters, numbers, or underscores; and must be between 1 and 63 characters.|
|`password` | Let the user [authenticate their access to a secure cluster](#user-authentication) using this password. Passwords must be entered as [string](string.html) values surrounded by single quotes (`'`).|

## User Authentication

Secure clusters require users to authenticate their access to databases and tables. CockroachDB offers two methods for this:

- [Client certificate and key authentication](#secure-clusters-with-client-certificates), which is available to all users. To ensure the highest level of security, we recommend only using client certificate and key authentication.
- [Password authentication](#secure-clusters-with-passwords), which is available only to users who you've created passwords for. To create a user with a password, use the `WITH PASSWORD` clause of `CREATE USER`. <br/><br/>You can use this password to authenticate users without supplying their client certificate and key; however, we recommend instead using client certificate and key authentication whenever possible. <br/><br/>To add a password to an existing user, use the [`cockroach user` command](create-and-manage-users.html#update-a-users-password).

{{site.data.alerts.callout_info}}Insecure clusters do not support user authentication, but you can still create passwords for users (besides <code>root</code>) through the <code>WITH PASSWORD</code> clause.{{site.data.alerts.end}}

## Examples

### Create a User

~~~ sql
> CREATE USER jpointsman;
~~~

Usernames are case-insensitive; must start with either a letter or underscore; must contain only letters, numbers, or underscores; and must be between 1 and 63 characters.

After creating users, you must [grant them privileges to databases and tables](grant.html).

For users on secure clusters, you also need to generate [client certificates and keys](create-security-certificates.html#create-the-certificate-and-key-pair-for-a-client) to authenticate the user's access to the cluster.

### Create a User with Password Authentication

~~~ sql
> CREATE USER jpointsman WITH PASSWORD 'Q7gc8rEdS';
~~~

{{site.data.alerts.callout_info}}We strongly recommend also creating <a href="create-security-certificates.html#create-the-certificate-and-key-pair-for-a-client">client certificates and keys</a> and using them to <a href="#secure-clusters-with-client-certificates">authenticate the user's access to the cluster</a>.{{site.data.alerts.end}}

### Manage Users

After creating users, you can manage them using the [`cockroach user`](create-and-manage-users.html) command.

### Authenticate as a Specific User

#### Insecure Clusters

~~~ shell
$ cockroach sql --insecure --user=jpointsman
~~~

#### Secure Clusters with Client Certificates

All users can authenticate their access to a secure cluster using [a client certificate](create-security-certificates.html#create-the-certificate-and-key-pair-for-a-client) issued to their username.

~~~ shell
$ cockroach sql --user=jpointsman
~~~

#### Secure Clusters with Passwords

[Users with passwords](#create-a-user-with-password-authentication) can authenticate their access by entering their password at the command prompt instead of using their client certificate and key.

~~~ shell
$ cockroach sql --user=jpointsman
~~~

## See Also

- [`cockroach user` command](create-and-manage-users.html)
- [`SHOW USERS`](show-users.html)
- [`GRANT`](grant.html)
- [`SHOW GRANTS`](show-grants.html)
- [Create Security Certificates](create-security-certificates.html)
- [Other SQL Statements](sql-statements.html)
