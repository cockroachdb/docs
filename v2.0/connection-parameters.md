---
title: Client Connection Parameters
summary: This page describes the parameters used to establish a client connection.
toc: false
---

Client applications, including client [`cockroach`
commands](cockroach-commands.html), work by establishing a network
connection to a CockroachDB cluster. The client connection parameters
determine which CockroachDB cluster they connect to, and how to
establish this network connection.

<div id="toc"></div>


## Supported Connection Parameters

There are two principal ways a client can connect to CockroachDB:

- Most client apps, including most `cockroach` commands, use a SQL connection
  established via a [PostgreSQL connection URL](#connect-using-a-url). When using a URL,
  a client can also specify SSL/TLS settings and additional SQL-level parameters. This mode provides the most configuration flexibility.
- Most `cockroach` commands also provide [discrete connection parameters](#connect-using-discrete-parameters) that
  can specify the connection parameters separately from a URL. This mode is somewhat less flexible than using a URL.
- Some `cockroach` commands support connections using either a URL
  connection string or discrete parameters, whereas some only support
  discrete connection parameters.

The following table summarizes which command supports which connection parameters:

Client | Supports [connection by URL](#connect-using-a-url) | Supports [discrete connection parameters](#connect-using-discrete-parameters)
-------|----------------------------|-----------------------------------
Client apps using a PostgreSQL driver | ✓ | (✗)
[`cockroach init`](initialize-a-cluster.html) | ✗ | ✓
[`cockroach quit`](stop-a-node.html) | ✗ | ✓
[`cockroach sql`](use-the-built-in-sql-client.html) | ✓ | ✓
[`cockroach user`](create-and-manage-users.html) | ✓ | ✓
[`cockroach zone`](configure-replication-zones.html) | ✓ | ✓
[`cockroach node`](view-node-details.html) | ✓ | ✓
[`cockroach dump`](sql-dump.html) | ✓ | ✓
[`cockroach debug zip`](debug-zip.html) | ✗ | ✓

## Connect Using a URL

SQL clients, including some [`cockroach` commands](cockroach-commands.html) can connect using a URL.

A connection URL has the following format:

~~~
postgres://<username>:<password>@<host>:<port>/<database>?<parameters>
~~~

Component | Description
----------|------------
`<username>` | The [SQL user](create-and-manage-users.html) that will own the client session.
`<password>` | The user's password; optional. It is not recommended to pass the password in the URL directly.<br><br>[Find more detail about how CockroachDB handles passwords](create-and-manage-users.html#user-authentication).
`<host>` | The host name or address of a CockroachDB node or load balancer.
`<port>` | The port number of the SQL interface of the CockroachDB node or load balancer.
`<database>` | A database name to use as [current database](sql-name-resolution.html#current-database); optional.
`<parameters>` | [Additional connection parameters](#additional-connection-parameters), including SSL/TLS certificate settings; optional.

{{site.data.alerts.callout_info}}You can specify the URL for
<code>cockroach</code> commands that accept a URL with the
command-line flag <code>--url</code>. If <code>--url</code> is not
specified but the environment variable <code>COCKROACH_URL</code> is
defined, the environment variable is used. Otherwise, the
<code>cockroach</code> command will use <a
href="#connect-using-discrete-parameters">discrete connection parameters</a>
as described below.{{site.data.alerts.end}}

### Additional connection parameters

The following additional parameters can be passed after the `?` character in the URL:

Parameter | Description | Default value
----------|-------------|---------------
`application_name` | An initial value for the [`application_name` session variable](set-vars.html). | Empty string.
`sslmode` | Which type of secure connection to use: `disable`, `allow`, `prefer`, `require`, `verify-ca` or `verify-full`. See below for details. | `disable`
`sslrootcert` | Client-side path to the CA certificate, when `sslmode` is not `disable`. | Empty string.
`sslcert` | Client-side path to the client certificate, when `sslmode` is not `disable`. | Empty string.
`sslkey` | Client-side path to the client private key, when `sslmode` is not `disable`. | Empty string.

### Secure Connections With URLs

The following values are supported for `sslmode`, although only the first and the last are recommended for use.

Parameter | Description | Recommended for use
----------|-------------|--------------------
`sslmode=disable` | Do not use an encrypted, secure connection at all. | Use during development.
`sslmode=allow` | Enable a secure connection only if the server requires it. |
`sslmode=prefer` | Try to establish a secure connection, but accept an insecure connection if the server does not support secure connections. |
`sslmode=require` | Force a secure connection. An error occurs if the secure connection cannot be established. |
`sslmode=verify-ca` | Force a secure connection and verify that the client and server certificates are signed by a known CA. |
`sslmode=verify-full` | Force a secure connection, verify that the client and server certificates are signed by a known CA, and verify that the server address matches that specified in the certificate. | Use for [secure deployments](secure-a-cluster.html).

### Example URL for an Insecure Connection

The following URL is suitable to connect to a CockroachDB node using an insecure connection:

~~~
postgres://root@servername:26257/mydb?sslmode=disable
~~~

This specifies a connection for the `root` user to server `servername`
on port 26257 (the default CockroachDB SQL port), with `mydb` set as
current database. `sslmode=disable` makes the connection insecure.

### Example URL for a Secure Connection

The following URL is suitable to connect to a CockroachDB node using a secure connection:

~~~
postgres://root@servername:26257/mydb?sslmode=verify-full&sslrootcert=path/to/ca.crt&sslcert=path/to/client.crt&sslkey=path/to/client.key
~~~

This uses the following components:

- User `root`
- Host name `servername`, port number 26257 (the default CockroachDB SQL port)
- Current database `mydb`
- SSL/TLS mode `verify-full`:
  - Root CA certificate `path/to/ca.crt`
  - Client certificate `path/to/client.crt`
  - Client key `path/to/client.key`

For details about how to create and manage SSL/TLS certificates, see
[Create Security Certificates](create-security-certificates.html) and
[Rotate Certificates](rotate-certificates.html).

## Connect Using Discrete Parameters

Most [`cockroach` commands](cockroach-commands.html) accept connection
parameters as command-line flags.  For each command-line flag that
directs a connection parameter, CockroachDB also recognizes an
environment variable. The environment variable is used when the
command-line flag is not speciifed.

Flag | Description
-----|------------
`--host` | The server host to connect to. This can be the address of any node in the cluster. <br><br>**Env Variable:** `COCKROACH_HOST`<br>**Default:**`localhost`
`--port`<br>`-p` | The server port to connect to. <br><br>**Env Variable:** `COCKROACH_PORT`<br>**Default:** `26257`
`--user`<br>`-u` | The [SQL user](create-and-manage-users.html) that will own the client session.<br><br>**Env Variable:** `COCKROACH_USER`<br>**Default:** `root`
`--password` | Enable password authentication for the user; you will be prompted to enter the password on the command line.<br/><br/><span class="version-tag">Changed in v2.0:</span> Password creation is supported only in secure clusters for non-`root` users. The `root` user must authenticate with a client certificate and key.<br/><br/>[Find more detail about how CockroachDB handles passwords](create-and-manage-users.html#user-authentication).
`--database`<br>`-d` | A database name to use as [current database](sql-name-resolution.html#current-database).<br><br>**Env Variable:** `COCKROACH_DATABASE`<br>**Default:** empty string.
`--insecure` | Use an insecure connection.<br><br>**Env Variable:** `COCKROACH_INSECURE`<br>**Default:** `false`
`--certs-dir` | The path to the [certificate directory](create-security-certificates.html) containing the CA and client certificates and client key.<br><br>**Env Variable:** `COCKROACH_CERTS_DIR`<br>**Default:** `${HOME}/.cockroach-certs/`

### Example Command-Line Flags for an Insecure Connection

The following command-line flags establish an insecure connection:

~~~
--user root \
 --host servername \
 --port 26257 \
 --database mydb \
 --insecure
~~~

This specifies a connection for the `root` user to server `servername`
on port 26257 (the default CockroachDB SQL port), with `mydb` set as
current database. `--insecure` makes the connection insecure.

### Example Command-Line Flags for a Secure Connection

The following command-line flags establish a secure connection:

~~~
--user root \
 --host servername \
 --port 26257 \
 --database mydb \
 --certs-dir path/to/certs
~~~

This uses the following components:

- User `root`
- Host name `servername`, port number 26257 (the default CockroachDB SQL port)
- Current database `mydb`
- SSL/TLS enabled, with settings:
  - Root CA certificate `path/to/certs/ca.crt`
  - Client certificate `path/to/client.<user>.crt` (`path/to/certs/client.root.crt` with `--user root`)
  - Client key `path/to/client.<user>.key` (`path/to/certs/client.root.key` with `--user root`)

{{site.data.alerts.callout_info}}When using discrete connection
parameters, the file names of the CA and client certificates and
client key are derived automatically from the value of <code>--certs-dir</code>,
and cannot be customized. To use customized file names, use a <a
href="#connect-using-a-url">connection URL</a>
instead.{{site.data.alerts.end}}

## Using Both URL and Client Parameters

<span class="version-tag">Changed in v2.0</span>

Several [`cockroach` commands](cockroach-commands.html) support both a
[connection URL](#connect-using-a-url) with `--url` (or `COCKROACH_URL`) and [discrete connection
parameters](#connect-using-discrete-parameters).

They can be combined as follows: the URL has highest priority, then
the discrete parameters.

This combination is useful so that discrete command-line flags can
override settings not otherwise set in the URL.

In other words:

- If a URL is specified:
  - For any URL component that is specified, that information is used
    and the corresponding discrete parameter is ignored.
  - For any URL component that is missing, if a corresponding discrete
    parameter is specified (either via command-line flag or as
    environment variable), the discrete parameter is used.
  - If a component is missing in the URL and no corresponding discrete
    parameter is specified, the default value is used.
- If no URL is specified, the discrete parameters are used. For every
  component not specified, the default value is used.

### Example Override of the Current Database

For example, the `cockroach start` command prints out the following connection URL:

~~~
postgres://root@servername:26257/?sslmode=disable
~~~

It is possible to connect `cockroach sql` to this server and also
specify `mydb` as the current database, using the following command:

~~~
cockroach sql \
 --url "postgres://root@servername:26257/?sslmode=disable" \
 --database mydb
~~~

This is equivalent to:

~~~
cockroach sql --url "postgres://root@servername:26257/mydb?sslmode=disable"
~~~

## See Also

- [`cockroach` commands](cockroach-commands.html)
- [Create Security Certificates](create-security-certificates.html)
- [Secure a Cluster](secure-a-cluster.html)
- [Create and Manage Users](create-and-manage-users.html)
