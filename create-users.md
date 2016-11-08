---
title: Create & Manage Users
summary: A secure CockroachDB cluster uses TLS for encrypted inter-node and client-node communication and requires CA, node, and client certificates and keys. 
toc: false
---

To create and manage your cluster's users (which lets you control SQL-level [privileges](privileges.html)), use the `cockroach user` [command](cockroach-commands.html) with appropriate flags.

When creating users, it's also important to note:

- After creating users, you must [grant them privileges to databases and tables](grant.html).
- On secure clusters, users must [authenticate their access to the cluster](#user-authentication).
<br/><br/>
<div id="toc"></div>

## Subcommands

Subcommand | Usage 
-----------|------
`get` | Retrieve a table containing a user and their hashed password
`ls` | List all users
`rm` | Remove a user
`set` | Create or update a user

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

The `cert` command and subcommands support the following flags, as well as [logging flags](cockroach-commands.html#logging-flags). 

Flag | Description
-----|------------
`--ca-cert` | The path to the [CA certificate](create-security-certificates.html). This flag is required when creating a user for a secure cluster.<br><br>**Env Variable:** `COCKROACH_CA_CERT`
`--cert` | The path to the [client certificate](create-security-certificates.html). This flag is required if the user does not have a password. <br><br>**Env Variable:** `COCKROACH_CERT`
`-d`, `--database` | The name of the database to connect to. <br/><br/>**Env Variable:** `COCKROACH_DATABASE`
`--host` | Database server host to connect to.<br/><br/>**Env Variable:** `COCKROACH_HOST`
`--insecure` | Set this only if the cluster is insecure and running on multiple machines. <br><br>If the cluster is insecure and local, leave this out. If the cluster is secure, leave this out and set the `--ca-cert`, `--cert`, and `--key` flags. <br><br>**Env Variable:** `COCKROACH_INSECURE`
`--key` | Path to the [client key](create-security-certificates.html) protecting the client certificate.  This flag is required if the user does not have a password. <br/><br/>**Env Variable:** `COCKROACH_KEY`
`--password` | The password for the user.<br/><br/>If not passed in on a secure cluster, CockroachDB will prompt you to enter and confirm the user's password.<br/><br/>If you want to [provide the password through standard input](#provide-password-via-standard-input), use '`-`' <br/>(i.e. `--password=-`).<br/><br/>[Find more detail about how CockroachDB handles passwords](#user-authentication).<br/><br/>**Env Variable:** `COCKROACH_PASSWORD`
`-p`, `--port` | Connect to the cluster on the specified port.<br/><br/>**Env Variable:** `COCKROACH_PORT` <br/>**Default**: `26257`
`--pretty` | Format tables using ASCII. When not specified, table rows are printed as tab-separated values (TSV). <br/><br/>**Default**: `true`
`--url` | Connect to the cluster on the provided URL, e.g., `postgresql://myuser@localhost:26257/mydb`. If left blank, the connection flags are used (`host`, `port`, `user`, `database`, `insecure`, `certs`). <br/><br/>**Env Variable:** `COCKROACH_URL`
`-u`, `--user` | The username you want to actively engage with.<br/><br/>**Env Variable:** `COCKROACH_USER` <br/>**Default**: `root`

## User Authentication

On secure clusters, users must authenticate their access to the cluster's databases and tables. CockroachDB offers two types of authentication, which you can choose between on a per-user basis based on the password you enter through `cockroach user set`:

- **Client certificate and key only**: Use a blank/*NULL* password.
- **Password or client certificate and key**: Enter a password string.

{{site.data.alerts.callout_info}}Users on insecure clusters are created with blank/<em>NULL</em> passwords unless you include the <code>--password</code> flag. If at any point in the future you convert an insecure cluster to a secure cluster, you can easily <a href="#update-a-users-password">add passwords to existing users</a>.{{site.data.alerts.end}}

## Examples

### Create a User

#### Insecure Cluster

~~~ shell
$ cockroach user set jpointsman
~~~

After creating users, you must [grant them privileges to databases](grant.html).

#### Secure Cluster

~~~ shell
$ cockroach user set \
jpointsman \
--ca-cert=certs/ca.cert --cert=certs/root.cert --key=certs/root.key
~~~

After issuing this command, you must enter a value for the password, which determines the [authentication methods available to the user](#user-authentication).

{{site.data.alerts.callout_success}}If you want allow password authentication for the user, you can simply include the <code>--password</code> flag to bypass entering it at the command prompt.{{site.data.alerts.end}}

After creating users, you must [grant them privileges to databases](grant.html).

#### Provide Password via Standard Input

~~~ shell
echo "PNtPaS2" | cockroach user set jpointsman --password=-
~~~

### Start a SQL Shell as a Specific User

#### Insecure Clusters

~~~ shell
$ cockroach sql --user=jpointsman
~~~

#### Secure Clusters with Passwords

~~~ shell
$ cockroach sql --user=jpointsman --ca-cert=certs/ca.cert
~~~

After issuing this command, you must enter the password for `jpointsman` twice.

#### Secure Clusters with Client Certificates

~~~ shell
$ cockroach sql --user=jpointsman --ca-cert=certs/ca.cert --cert=jpointsman.cert --key=jpointsman.key
~~~

### Update a User's Password

~~~ shell
$ cockroach user set \
jpointsman \
--password=5akHb95 \
--ca-cert=certs/ca.cert --cert=certs/root.cert --key=certs/root.key
~~~

### List All Users

~~~ shell
$ cockroach user ls
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
$ cockroach user get jpointsman
~~~
~~~
+------------+--------------------------------------------------------------+
|  username  |                        hashedPassword                        |
+------------+--------------------------------------------------------------+
| jpointsman | $2a$108tm5lYjES9RSXSKtQFLhNO.e/ysTXCBIRe7XeTgBrR6ubXfp6dDczS |
+------------+--------------------------------------------------------------+
~~~

### Remove a User

~~~ shell
$ cockroach user rm jpointsman
~~~

## See Also

- [`GRANT`](grant.html)
- [`SHOW GRANTS`](show-grants.html)
- [Create Security Certificates](create-security-certificates.html)
- [Other Cockroach Commands](cockroach-commands.html)
