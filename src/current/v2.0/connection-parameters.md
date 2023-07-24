---
title: Client Connection Parameters
summary: This page describes the parameters used to establish a client connection.
toc: true
---

Client applications, including client [`cockroach`
commands](cockroach-commands.html), work by establishing a network
connection to a CockroachDB cluster. The client connection parameters
determine which CockroachDB cluster they connect to, and how to
establish this network connection.



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

The following table summarizes which client supports which connection parameters:

Client | Supports [connection by URL](#connect-using-a-url) | Supports [discrete connection parameters](#connect-using-discrete-parameters)
-------|----------------------------|-----------------------------------
Client apps using a PostgreSQL driver | ✓ | Application-dependent
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

{% include_cached copy-clipboard.html %}
~~~
postgres://<username>:<password>@<host>:<port>/<database>?<parameters>
~~~

Component | Description | Required
----------|-------------|----------
`<username>` | The [SQL user](create-and-manage-users.html) that will own the client session. | ✗
`<password>` | The user's password. It is not recommended to pass the password in the URL directly.<br><br>[Find more detail about how CockroachDB handles passwords](create-and-manage-users.html#user-authentication). | ✗
`<host>` | The host name or address of a CockroachDB node or load balancer. | Required by most client drivers.
`<port>` | The port number of the SQL interface of the CockroachDB node or load balancer. | Required by most client drivers.
`<database>` | A database name to use as [current database](sql-name-resolution.html#current-database).  | ✗
`<parameters>` | [Additional connection parameters](#additional-connection-parameters), including SSL/TLS certificate settings. | ✗

{{site.data.alerts.callout_info}}You can specify the URL for
<code>cockroach</code> commands that accept a URL with the
command-line flag <code>--url</code>. If <code>--url</code> is not
specified but the environment variable <code>COCKROACH_URL</code> is
defined, the environment variable is used. Otherwise, the
<code>cockroach</code> command will use <a
href="#connect-using-discrete-parameters">discrete connection parameters</a>
as described below.{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}The <code>&lt;database&gt;</code>
part should not be specified for any <a
href="cockroach-commands.html"><code>cockroach</code> command</a>
other than <a href="use-the-built-in-sql-client.html"><code>cockroach
sql</code></a>.{{site.data.alerts.end}}

### Additional Connection Parameters

The following additional parameters can be passed after the `?` character in the URL:

Parameter | Description | Default value
----------|-------------|---------------
`application_name` | An initial value for the [`application_name` session variable](set-vars.html). | Empty string.
`sslmode` | Which type of secure connection to use: `disable`, `allow`, `prefer`, `require`, `verify-ca` or `verify-full`. See [Secure Connections With URLs](#secure-connections-with-urls) for details. | `disable`
`sslrootcert` | Path to the [CA certificate](create-security-certificates.html), when `sslmode` is not `disable`. | Empty string.
`sslcert` | Path to the [client certificate](create-security-certificates.html), when `sslmode` is not `disable`. | Empty string.
`sslkey` | Path to the [client private key](create-security-certificates.html), when `sslmode` is not `disable`. | Empty string.

### Secure Connections With URLs

The following values are supported for `sslmode`, although only the first and the last are recommended for use.

Parameter | Description | Recommended for use
----------|-------------|--------------------
`sslmode=disable` | Do not use an encrypted, secure connection at all. | Use during development.
`sslmode=allow` | Enable a secure connection only if the server requires it.<br><br>**Not supported in all clients.** |
`sslmode=prefer` | Try to establish a secure connection, but accept an insecure connection if the server does not support secure connections.<br><br>**Not supported in all clients.** |
`sslmode=require` | Force a secure connection. An error occurs if the secure connection cannot be established. |
`sslmode=verify-ca` | Force a secure connection and verify that the server certificate is signed by a known CA. |
`sslmode=verify-full` | Force a secure connection, verify that the server certificate is signed by a known CA, and verify that the server address matches that specified in the certificate. | Use for [secure deployments](secure-a-cluster.html).

{{site.data.alerts.callout_danger}}Some client drivers and the
<code>cockroach</code> commands do not support
<code>sslmode=allow</code> and <code>sslmode=prefer</code>. Check the
documentation of your SQL driver to determine whether these options
are supported.{{site.data.alerts.end}}

### Example URL for an Insecure Connection

The following URL is suitable to connect to a CockroachDB node using an insecure connection:

{% include_cached copy-clipboard.html %}
~~~
postgres://root@servername:26257/mydb?sslmode=disable
~~~

This specifies a connection for the `root` user to server `servername`
on port 26257 (the default CockroachDB SQL port), with `mydb` set as
current database. `sslmode=disable` makes the connection insecure.

### Example URL for a Secure Connection

The following URL is suitable to connect to a CockroachDB node using a secure connection:

{% include_cached copy-clipboard.html %}
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
parameters as separate, discrete command-line flags, in addition (or
in replacement) to `--url` which [specifies all parameters as a
URL](#connect-using-a-url).

For each command-line flag that directs a connection parameter,
CockroachDB also recognizes an environment variable. The environment
variable is used when the command-line flag is not specified.

{% include {{ page.version.version }}/sql/connection-parameters-with-url.md %}

{{site.data.alerts.callout_info}}The command-line flag
<code>--url</code> is only supported for <code>cockroach</code>
commands that use a SQL connection. See <a
href="#supported-connection-parameters">Supported Connection
Parameters</a> for details.{{site.data.alerts.end}}

### Example Command-Line Flags for an Insecure Connection

The following command-line flags establish an insecure connection:

{% include_cached copy-clipboard.html %}
~~~
--user root \
 --host servername \
 --port 26257 \
 --insecure
~~~

This specifies a connection for the `root` user to server `servername`
on port 26257 (the default CockroachDB SQL port). `--insecure` makes
the connection insecure.

### Example Command-Line Flags for a Secure Connection

The following command-line flags establish a secure connection:

{% include_cached copy-clipboard.html %}
~~~
--user root \
 --host servername \
 --port 26257 \
 --certs-dir path/to/certs
~~~

This uses the following components:

- User `root`
- Host name `servername`, port number 26257 (the default CockroachDB SQL port)
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

{% include_cached copy-clipboard.html %}
~~~
postgres://root@servername:26257/?sslmode=disable
~~~

It is possible to connect `cockroach sql` to this server and also
specify `mydb` as the current database, using the following command:

{% include_cached copy-clipboard.html %}
~~~
cockroach sql \
 --url "postgres://root@servername:26257/?sslmode=disable" \
 --database mydb
~~~

This is equivalent to:

{% include_cached copy-clipboard.html %}
~~~
cockroach sql --url "postgres://root@servername:26257/mydb?sslmode=disable"
~~~

## See Also

- [`cockroach` commands](cockroach-commands.html)
- [Create Security Certificates](create-security-certificates.html)
- [Secure a Cluster](secure-a-cluster.html)
- [Create and Manage Users](create-and-manage-users.html)
