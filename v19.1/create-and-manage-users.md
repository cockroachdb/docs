---
title: Manage Users
summary: To create and manage your cluster's users (which lets you control SQL-level privileges), use the cockroach user command with appropriate flags.
toc: true
---

To create, manage, and remove your cluster's users (which lets you control SQL-level [privileges](authorization.html#assign-privileges), use the `cockroach user` [command](cockroach-commands.html) with appropriate flags.

{{site.data.alerts.callout_success}}You can also use the <a href="create-user.html"><code>CREATE USER</code></a> and <a href="drop-user.html"><code>DROP USER</code></a> statements to create and remove users.{{site.data.alerts.end}}

## Considerations

- Usernames are case-insensitive; must start with either a letter or underscore; must contain only letters, numbers, or underscores; and must be between 1 and 63 characters.
- After creating users, you must [grant them privileges to databases and tables](grant.html).
- All users belong to the `public` role, to which you can [grant](grant.html) and [revoke](revoke.html) privileges.
- On secure clusters, you must [create client certificates for users](create-security-certificates.html#create-the-certificate-and-key-pair-for-a-client) and users must [authenticate their access to the cluster](authentication.html#client-authentication).
- {% include {{ page.version.version }}/misc/remove-user-callout.html %}

## Subcommands

Subcommand | Usage
-----------|------
`get` | Retrieve a table containing a user and their hashed password.
`ls` | List all users.
`rm` | Remove a user.
`set` | Create or update a user.

## Synopsis

Create a user:

~~~ shell
$ cockroach user set <username> <flags>
~~~

List all users:

~~~ shell
$ cockroach user ls <flags>
~~~

Display a specific user:

~~~ shell
$ cockroach user get <username> <flags>
~~~

View help:

~~~ shell
$ cockroach user --help
~~~
~~~ shell
$ cockroach user <subcommand> --help
~~~

## Flags

The `user` command and subcommands support the following [general-use](#general) and [logging](#logging) flags.

### General

Flag | Description
-----|------------
`--password` | Enable password authentication for the user; you will be prompted to enter the password on the command line.<br/><br/>Password creation is supported only in secure clusters for non-`root` users. The `root` user must authenticate with a client certificate and key.
`--echo-sql` | Reveal the SQL statements sent implicitly by the command-line utility. For a demonstration, see the [example](#reveal-the-sql-statements-sent-implicitly-by-the-command-line-utility) below.
`--format` | How to display table rows printed to the standard output. Possible values: `tsv`, `csv`, `table`, `raw`, `records`, `sql`, `html`.<br><br>**Default:** `table` for sessions that [output on a terminal](use-the-built-in-sql-client.html#session-and-output-types); `tsv` otherwise.

### Client connection

{% include {{ page.version.version }}/sql/connection-parameters.md %}

See [Client Connection Parameters](connection-parameters.html) for more details.

Currently, only members of the `admin` role can create users. By default, the `root` user belongs to the `admin` role.

{{site.data.alerts.callout_info}}
Password creation is supported only in secure clusters for non-<code>root</code> users. The <code>root</code> user must authenticate with a client certificate and key.
{{site.data.alerts.end}}

### Logging

By default, the `user` command logs errors to `stderr`.

If you need to troubleshoot this command's behavior, you can change its [logging behavior](debug-and-error-logs.html).

## Examples

### Create a user

<div class="filters clearfix">
  <button style="width: 15%" class="filter-button" data-scope="secure">Secure</button>
  <button style="width: 15%" class="filter-button" data-scope="insecure">Insecure</button>
</div>
<p></p>

Usernames are case-insensitive; must start with either a letter or underscore; must contain only letters, numbers, or underscores; and must be between 1 and 63 characters.

<div class="filter-content" markdown="1" data-scope="secure">

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach user set jpointsman --certs-dir=certs
~~~

{{site.data.alerts.callout_success}}If you want to allow password authentication for the user, include the <code>--password</code> flag and then enter and confirm the password at the command prompt.{{site.data.alerts.end}}

After creating users, you must:

- [Create their client certificates](create-security-certificates.html#create-the-certificate-and-key-pair-for-a-client).
- [Grant them privileges to databases](grant.html).

</div>

<div class="filter-content" markdown="1" data-scope="insecure">

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach user set jpointsman --insecure
~~~

After creating users, you must [grant them privileges to databases](grant.html).

</div>

### Log in as a specific user

<div class="filters clearfix">
  <button style="width: 15%" class="filter-button" data-scope="secure">Secure</button>
  <button style="width: 15%" class="filter-button" data-scope="insecure">Insecure</button>
</div>
<p></p>

<div class="filter-content" markdown="1" data-scope="secure">

#### Secure clusters with client certificates

All users can authenticate their access to a secure cluster using [a client certificate](create-security-certificates.html#create-the-certificate-and-key-pair-for-a-client) issued to their username.

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --certs-dir=certs --user=jpointsman
~~~

#### Secure clusters with passwords

Users with passwords can authenticate their access by entering their password at the command prompt instead of using their client certificate and key.

If we cannot find client certificate and key files matching the user, we fall back on password authentication.

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --certs-dir=certs --user=jpointsman
~~~

</div>

<div class="filter-content" markdown="1" data-scope="insecure">

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure --user=jpointsman
~~~

</div>

### Update a user's password

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach user set jpointsman --certs-dir=certs --password
~~~

After issuing this command, enter and confirm the user's new password at the command prompt.

Password creation is supported only in secure clusters for non-`root` users. The `root` user must authenticate with a client certificate and key.

### List all users

{% include_cached copy-clipboard.html %}
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

### Find a specific user

{% include_cached copy-clipboard.html %}
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

### Remove a user

{{site.data.alerts.callout_danger}}{% include {{ page.version.version }}/misc/remove-user-callout.html %}{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach user rm jpointsman --insecure
~~~

{{site.data.alerts.callout_success}}You can also use the <a href="drop-user.html"><code>DROP USER</code></a> SQL statement to remove users.{{site.data.alerts.end}}

### Reveal the SQL statements sent implicitly by the command-line utility

In this example, we use the `--echo-sql` flag to reveal the SQL statement sent implicitly by the command-line utility:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach user rm jpointsman --insecure --echo-sql
~~~

~~~
> DELETE FROM system.users WHERE username=$1
DELETE 1
~~~

## See also

- [Authorization](authorization.html)
- [`CREATE USER`](create-user.html)
- [`DROP USER`](drop-user.html)
- [`SHOW USERS`](show-users.html)
- [`GRANT`](grant.html)
- [`SHOW GRANTS`](show-grants.html)
- [Create Security Certificates](create-security-certificates.html)
- [Other Cockroach Commands](cockroach-commands.html)
