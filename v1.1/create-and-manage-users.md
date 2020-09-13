---
title: Create & Manage Users
summary: To create and manage your cluster's users (which lets you control SQL-level privileges), use the cockroach user command with appropriate flags.
toc: true
---

To create, manage, and remove your cluster's users (which lets you control SQL-level [privileges](privileges.html)), use the `cockroach user` [command](cockroach-commands.html) with appropriate flags.

{{site.data.alerts.callout_success}}You can also use the <a href="create-user.html"><code>CREATE USER</code></a> and <a href="drop-user.html"><code>DROP USER</code></a> statements to create and remove users.{{site.data.alerts.end}}


## Considerations

- Usernames are case-insensitive; must start with either a letter or underscore; must contain only letters, numbers, or underscores; and must be between 1 and 63 characters.
- After creating users, you must [grant them privileges to databases and tables](grant.html).
- On secure clusters, you must [create client certificates for users](create-security-certificates.html#create-the-certificate-and-key-pair-for-a-client) and users must [authenticate their access to the cluster](#user-authentication).
- {% include {{ page.version.version }}/misc/remove-user-callout.html %}

## Subcommands

Subcommand | Usage
-----------|------
`get` | Retrieve a table containing a user and their hashed password.
`ls` | List all users.
`rm` | Remove a user.
`set` | Create or update a user.

## Synopsis

~~~ shell
# Create a user:
$ cockroach user set <username> <flags>

# List all users:
$ cockroach user ls <flags>

# Display a specific user:
$ cockroach user get <username> <flags>

# View help:
$ cockroach user --help
$ cockroach user get --help
$ cockroach user ls --help
$ cockroach user rm --help
$ cockroach user set --help
~~~

## Flags

The `user` command and subcommands support the following [general-use](#general) and [logging](#logging) flags.

### General

Flag | Description
-----|------------
`--password` | Enable password authentication for the user; you will be prompted to enter the password on the command line.
`--echo-sql` | <span class="version-tag">New in v1.1:</span> Reveal the SQL statements sent implicitly by the command-line utility. For a demonstration, see the [example](#reveal-the-sql-statements-sent-implicitly-by-the-command-line-utility) below.
`--pretty` | Format table rows printed to the standard output using ASCII art and disable escaping of special characters.<br><br>When disabled with `--pretty=false`, or when the standard output is not a terminal, table rows are printed as tab-separated values, and special characters are escaped. This makes the output easy to parse by other programs.<br><br>**Default:** `true` when output is a terminal, `false` otherwise

### Client Connection

{% include {{ page.version.version }}/sql/connection-parameters-with-url.md %}

See [Client Connection Parameters](connection-parameters.html) for more details.

Currently, only the `root` user can create users.

### Logging

By default, the `user` command logs errors to `stderr`.

If you need to troubleshoot this command's behavior, you can change its [logging behavior](debug-and-error-logs.html).

## User Authentication

Secure clusters require users to authenticate their access to databases and tables. CockroachDB offers two methods for this:

- [Client certificate and key authentication](#secure-clusters-with-client-certificates), which is available to all users. To ensure the highest level of security, we recommend only using client certificate and key authentication.

- [Password authentication](#secure-clusters-with-passwords), which is available to non-`root` users who you've created passwords for. To set a password for a non-`root` user, include the `--password` flag in the `cockroach user set` command.

    Users can use passwords to authenticate without supplying client certificates and keys; however, we recommend using certificate-based authentication whenever possible.

{{site.data.alerts.callout_info}}Insecure clusters do not support user authentication, but you can still create passwords for users (besides <code>root</code>) through the <code>--password</code> flag.{{site.data.alerts.end}}

## Examples

### Create a User

#### Insecure Cluster

~~~ shell
$ cockroach user set jpointsman --insecure
~~~

Usernames are case-insensitive; must start with either a letter or underscore; must contain only letters, numbers, or underscores; and must be between 1 and 63 characters.

After creating users, you must [grant them privileges to databases](grant.html).

#### Secure Cluster

~~~ shell
$ cockroach user set jpointsman --certs-dir=certs
~~~

{{site.data.alerts.callout_success}}If you want to allow password authentication for the user, include the <code>--password</code> flag and then enter and confirm the password at the command prompt.{{site.data.alerts.end}}

Usernames are case-insensitive; must start with either a letter or underscore; must contain only letters, numbers, or underscores; and must be between 1 and 63 characters.

After creating users, you must:

- [Create their client certificates](create-security-certificates.html#create-the-certificate-and-key-pair-for-a-client).
- [Grant them privileges to databases](grant.html).

### Authenticate as a Specific User

#### Insecure Clusters

~~~ shell
$ cockroach sql --insecure --user=jpointsman
~~~

#### Secure Clusters with Client Certificates

All users can authenticate their access to a secure cluster using [a client certificate](create-security-certificates.html#create-the-certificate-and-key-pair-for-a-client) issued to their username.

~~~ shell
$ cockroach sql --certs-dir=certs --user=jpointsman
~~~

#### Secure Clusters with Passwords

[Users with passwords](create-and-manage-users.html#secure-cluster) can authenticate their access by entering their password at the command prompt instead of using their client certificate and key.

If we cannot find client certificate and key files matching the user, we fall back on password authentication.

~~~ shell
$ cockroach sql --certs-dir=certs --user=jpointsman
~~~

### Update a User's Password

~~~ shell
$ cockroach user set jpointsman --certs-dir=certs --password
~~~

After issuing this command, enter and confirm the user's new password at the command prompt.

{{site.data.alerts.callout_danger}}You cannot add password authentication to the <code>root</code> user.{{site.data.alerts.end}}

### List All Users

~~~ shell
$ cockroach user ls --insecure
~~~
~~~
+------------+
|  username  |
+------------+
| jpointsman |
+------------+
~~~

### Find a Specific User

~~~ shell
$ cockroach user get jpointsman --insecure
~~~
~~~
+------------+--------------------------------------------------------------+
|  username  |                        hashedPassword                        |
+------------+--------------------------------------------------------------+
| jpointsman | $2a$108tm5lYjES9RSXSKtQFLhNO.e/ysTXCBIRe7XeTgBrR6ubXfp6dDczS |
+------------+--------------------------------------------------------------+
~~~

### Remove a User

{{site.data.alerts.callout_danger}}{% include {{ page.version.version }}/misc/remove-user-callout.html %}{{site.data.alerts.end}}

~~~ shell
$ cockroach user rm jpointsman --insecure
~~~

{{site.data.alerts.callout_success}}You can also use the <a href="drop-user.html"><code>DROP USER</code></a> SQL statement to remove users.{{site.data.alerts.end}}

### Reveal the SQL statements sent implicitly by the command-line utility

In this example, we use the `--echo-sql` flag to reveal the SQL statement sent implicitly by the command-line utility:

~~~ shell
$ cockroach user rm jpointsman --insecure --echo-sql
~~~

~~~
> DELETE FROM system.users WHERE username=$1
DELETE 1
~~~

## See Also

- [`CREATE USER`](create-user.html)
- [`DROP USER`](drop-user.html)
- [`SHOW USERS`](show-users.html)
- [`GRANT`](grant.html)
- [`SHOW GRANTS`](show-grants.html)
- [Create Security Certificates](create-security-certificates.html)
- [Other Cockroach Commands](cockroach-commands.html)
