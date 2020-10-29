---
title: Client Connection Parameters
summary: This page describes the parameters used to establish a client connection.
toc: true
---

Client applications, including [`cockroach` client
commands](cockroach-commands.html), work by establishing a network
connection to a CockroachDB cluster. The client connection parameters
determine which CockroachDB cluster they connect to, and how to
establish this network connection.

## Supported connection parameters

Most client apps, including `cockroach`  client commands, determine
which CockroachDB server to connect to using a [PostgreSQL connection
URL](#connect-using-a-url). When using a URL, a client can also
specify additional SQL-level parameters. This mode provides the most
configuration flexibility.

In addition, all `cockroach` client commands also accept [discrete
connection parameters](#connect-using-discrete-parameters) that can
specify the connection parameters separately from a URL.

## When to use a URL and when to use discrete parameters

Specifying client parameters using a URL may be more convenient during
experimentation, as it facilitates copy-pasting the connection
parameters (the URL) between different tools: the output of `cockroach
start`, other `cockroach` commands, GUI database visualizer,
programming tools, etc.


Discrete parameters may be more convenient in automation, where the
components of the configuration are filled in separately from
different variables in a script or a service manager.

## Connect using a URL

A connection URL has the following format:

~~~
postgres://<username>:<password>@<host>:<port>/<database>?<parameters>
~~~

`cockroach` client commands also support [UNIX domain socket URIs](https://en.wikipedia.org/wiki/Unix_domain_socket) of the following form:

~~~
postgres://<username>:<password>@?host=<directory-path>&port=<port>&<parameters>
~~~

 Component      | Description                                                                                                                                                                                               | Required
----------------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+---------------------------------
 `<username>`   | The [SQL user](create-user.html) that will own the client session.                                                                                                                            | ✗
 `<password>`   | The user's password. It is not recommended to pass the password in the URL directly.<br><br>Note that CockroachDB currently does not allow passwords with special characters to be passed in a URL. For details, see [tracking issue](https://github.com/cockroachdb/cockroach/issues/35998).<br><br>[Find more detail about how CockroachDB handles passwords](authentication.html#client-authentication). | ✗
 `<host>`       | The host name or address of a CockroachDB node or load balancer.                                                                                                                                          | Required by most client drivers.
 `<port>`       | The port number of the SQL interface of the CockroachDB node or load balancer. The default port number for CockroachDB is 26257. Use this value when in doubt.                                           | Required by most client drivers.
 `<database>`   | A database name to use as [current database](sql-name-resolution.html#current-database). Defaults to `defaultdb`.                                                                                         | ✗
 `<directory-path>` |  The directory path to the client listening for a socket connection.                                                                                             | Required when specifying a Unix domain socket URI.
 `<parameters>` | [Additional connection parameters](#additional-connection-parameters), including SSL/TLS certificate settings.                                                                                            | ✗


{{site.data.alerts.callout_info}}
For cockroach commands that accept a URL, you can specify the URL with the command-line flag `--url`.
If `--url` is not specified but
the environment variable `COCKROACH_URL` is defined, the environment
variable is used. Otherwise, the `cockroach` command will use
[discrete connection parameters](#connect-using-discrete-parameters)
as described below.
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
The `<database>` part is not used for [`cockroach`
commands](cockroach-commands.html) other than [`cockroach
sql`](cockroach-sql.html). A warning
is currently printed if it is mistakenly specified, and
future versions of CockroachDB may return an error in that case.
{{site.data.alerts.end}}

### Additional connection parameters

The following additional parameters can be passed after the `?` character in the URL:

Parameter | Description | Default value
----------|-------------|---------------
`application_name` | An initial value for the [`application_name` session variable](set-vars.html).<br><br>Note: For [Java JBDC](build-a-java-app-with-cockroachdb.html), use `ApplicationName`. | Empty string.
`sslmode` | Which type of secure connection to use: `disable`, `allow`, `prefer`, `require`, `verify-ca` or `verify-full`. See [Secure Connections With URLs](#secure-connections-with-urls) for details. | `disable`
`sslrootcert` | Path to the [CA certificate](cockroach-cert.html), when `sslmode` is not `disable`. | Empty string.
`sslcert` | Path to the [client certificate](cockroach-cert.html), when `sslmode` is not `disable`. | Empty string.
`sslkey` | Path to the [client private key](cockroach-cert.html), when `sslmode` is not `disable`. | Empty string.

### Secure connections with URLs

The following values are supported for `sslmode`, although only the first and the last are recommended for use.

Parameter | Description | Recommended for use
----------|-------------|--------------------
`sslmode=disable` | Do not use an encrypted, secure connection at all. | Use during development.
`sslmode=allow` | Enable a secure connection only if the server requires it.<br><br>**Not supported in all clients.** |
`sslmode=prefer` | Try to establish a secure connection, but accept an insecure connection if the server does not support secure connections.<br><br>**Not supported in all clients.** |
`sslmode=require` | Force a secure connection. An error occurs if the secure connection cannot be established. |
`sslmode=verify-ca` | Force a secure connection and verify that the server certificate is signed by a known CA. |
`sslmode=verify-full` | Force a secure connection, verify that the server certificate is signed by a known CA, and verify that the server address matches that specified in the certificate. | Use for [secure deployments](secure-a-cluster.html).

{{site.data.alerts.callout_danger}}
Some client drivers and the `cockroach` commands do not support
`sslmode=allow` and `sslmode=prefer`. Check the documentation of your
SQL driver to determine whether these options are supported.
{{site.data.alerts.end}}

### Example URL for an insecure connection

The following URL is suitable to connect to a CockroachDB node using an insecure connection:

~~~
postgres://root@servername:26257/mydb?sslmode=disable
~~~

This specifies a connection for the `root` user to server `servername`
on port 26257 (the default CockroachDB SQL port), with `mydb` set as
current database. `sslmode=disable` makes the connection insecure.

### Example URL for a secure connection

The following URL is suitable to connect to a CockroachDB node using a secure connection:

~~~
postgres://root@servername:26257/mydb?sslmode=verify-full&sslrootcert=path/to/ca.crt&sslcert=path/to/client.username.crt&sslkey=path/to/client.username.key
~~~

This uses the following components:

- User `root`
- Host name `servername`, port number 26257 (the default CockroachDB SQL port)
- Current database `mydb`
- SSL/TLS mode `verify-full`:
  - Root CA certificate `path/to/ca.crt`
  - Client certificate `path/to/client.username.crt`
  - Client key `path/to/client.username.key`

For details about how to create and manage SSL/TLS certificates, see
[Create Security Certificates](cockroach-cert.html) and
[Rotate Certificates](rotate-certificates.html).

### Example URI for a Unix domain socket

The following URI is suitable to connect to a CockroachDB cluster listening for Unix domain socket connections at `/path/to/client`:

~~~
postgres://root@?host=/path/to/client&port=26257
~~~

This specifies a connection for the `root` user to an insecure cluster listening for a socket connection (e.g., a cluster started with the [`--socket-dir` flag](cockroach-start.html#networking)) at `/path/to/client`, and on port 26257.

## Connect using discrete parameters

Most [`cockroach` commands](cockroach-commands.html) accept connection
parameters as separate, discrete command-line flags, in addition (or
in replacement) to `--url` which [specifies all parameters as a
URL](#connect-using-a-url).

For each command-line flag that directs a connection parameter,
CockroachDB also recognizes an environment variable. The environment
variable is used when the command-line flag is not specified.

{% include {{ page.version.version }}/sql/connection-parameters.md %}

### Example command-line flags for an insecure connection

The following command-line flags establish an insecure connection:

~~~
--user=root \
--host=<servername>
--insecure
~~~

This specifies a connection for the `root` user to server `servername`
on port 26257 (the default CockroachDB SQL port). `--insecure` makes
the connection insecure.

### Example command-line flags for a secure connection

The following command-line flags establish a secure connection:

~~~
--user=root \
--host=<servername>
--certs-dir=path/to/certs
~~~

This uses the following components:

- User `root`
- Host name `servername`, port number 26257 (the default CockroachDB SQL port)
- SSL/TLS enabled, with settings:
  - Root CA certificate `path/to/certs/ca.crt`
  - Client certificate `path/to/client.<user>.crt` (`path/to/certs/client.root.crt` with `--user root`)
  - Client key `path/to/client.<user>.key` (`path/to/certs/client.root.key` with `--user root`)

{{site.data.alerts.callout_info}}
When using discrete connection parameters, the file names of the CA
and client certificates and client key are derived automatically from
the value of `--certs-dir`.
{{site.data.alerts.end}}

## Using both URL and client parameters

Most `cockroach` commands accept both a URL and client parameters.
The information contained therein is combined in the order it appears
in the command line.

This combination is useful so that discrete command-line flags can
override settings not otherwise set in the URL.

### Example override of the current database

The `cockroach start` command prints out the following connection URL, which connects to the `defaultdb` database:

~~~
postgres://root@servername:26257/?sslmode=disable
~~~

To specify `mydb` as the current database using [`cockroach sql`](cockroach-sql.html), run the following command:

~~~
cockroach sql \
--url "postgres://root@servername:26257/?sslmode=disable" \
--database mydb
~~~

This is equivalent to:

~~~
cockroach sql --url "postgres://root@servername:26257/mydb?sslmode=disable"
~~~

## See also

- [`cockroach` commands](cockroach-commands.html)
- [Create Security Certificates](cockroach-cert.html)
- [Secure a Cluster](secure-a-cluster.html)
- [Create and Manage Users](authorization.html#create-and-manage-users)
