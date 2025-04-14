---
title: Client Connection Parameters
summary: This page describes the parameters used to establish a client connection.
toc: true
docs_area: reference.cli
---

Client applications, including [`cockroach` client
commands]({% link {{ page.version.version }}/cockroach-commands.md %}), work by establishing a network
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

{% include_cached copy-clipboard.html %}
~~~
postgres://<username>:<password>@<host>:<port>/<database>?<parameters>
~~~

`cockroach` client commands also support [UNIX domain socket URIs](https://wikipedia.org/wiki/Unix_domain_socket) of the following form:

{% include_cached copy-clipboard.html %}
~~~
postgres://<username>:<password>@?host=<directory-path>&port=<port>&<parameters>
~~~

Component | Description | Required
----------|-------------|---------
`<username>` | The [SQL user]({% link {{ page.version.version }}/create-user.md %}) that will own the client session. | ✗
`<password>` | The user's password. It is not recommended to pass the password in the URL directly.<br><br>Note that passwords with special characters must be passed as [query string parameters](#additional-connection-parameters) (e.g., `postgres://maxroach@localhost:26257/movr?password=<password>`) and not as a component in the connection URL (e.g., `postgres://maxroach:<password>@localhost:26257/movr`).<br><br>[Find more detail about how CockroachDB handles passwords.]({% link {{ page.version.version }}/authentication.md %}#client-authentication) | ✗
`<host>` | The host name or address of a CockroachDB node or load balancer. | Required by most client drivers.
`<port>` | The port number of the SQL interface of the CockroachDB node or load balancer. The default port number for CockroachDB is 26257. Use this value when in doubt. | Required by most client drivers.
`<database>` | A database name to use as [current database]({% link {{ page.version.version }}/sql-name-resolution.md %}#current-database). Defaults to `defaultdb` when using `cockroach` client commands. Drivers and ORMs may have different defaults. | ✗
`<directory-path>` |  The directory path to the client listening for a socket connection. | Required when specifying a Unix domain socket URI.
`<parameters>` | [Additional connection parameters](#additional-connection-parameters), including SSL/TLS certificate settings. | ✗

{{site.data.alerts.callout_info}}
For `cockroach` commands that accept a URL, you can specify the URL with the command-line flag `--url`.
If `--url` is not specified but
the environment variable `COCKROACH_URL` is defined, the environment
variable is used. Otherwise, the `cockroach` command will use
[discrete connection parameters](#connect-using-discrete-parameters)
as described below.
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
The `<database>` part is not used for [`cockroach`
commands]({% link {{ page.version.version }}/cockroach-commands.md %}) other than [`cockroach
sql`]({% link {{ page.version.version }}/cockroach-sql.md %}). A warning
is currently printed if it is mistakenly specified, and
future versions of CockroachDB may return an error in that case.
{{site.data.alerts.end}}

### Additional connection parameters

The following additional parameters can be passed after the `?` character in the URL. After the first parameter is specified, any additional parameters must be separated by an ampersand (`&`).

Parameter | Description | Default value
----------|-------------|---------------
`application_name` | An initial value for the [`application_name` session variable]({% link {{ page.version.version }}/set-vars.md %}).<br><br>Note: For [Java JDBC]({% link {{ page.version.version }}/build-a-java-app-with-cockroachdb.md %}), use `ApplicationName`. | Empty string.
`sslmode` | Which type of secure connection to use: `disable`, `allow`, `prefer`, `require`, `verify-ca` or `verify-full`. See [Secure Connections With URLs](#secure-connections-with-urls) for details. | `disable`
`sslrootcert` | Path to the [CA certificate]({% link {{ page.version.version }}/cockroach-cert.md %}), when `sslmode` is not `disable`. | Empty string.
`sslcert` | Path to the [client certificate]({% link {{ page.version.version }}/cockroach-cert.md %}), when `sslmode` is not `disable`. | Empty string.
`sslkey` | Path to the [client private key]({% link {{ page.version.version }}/cockroach-cert.md %}), when `sslmode` is not `disable`. | Empty string.
`password` | The SQL user's password. It is not recommended to pass the password in the URL directly.<br><br>Note that passwords with special characters must be passed as [query string parameters](#additional-connection-parameters) (e.g., `postgres://maxroach@localhost:26257/movr?password=<password>`) and not as a component in the connection URL (e.g., `postgres://maxroach:<password>@localhost:26257/movr`). | Empty string
`options` | [Additional options](#supported-options-parameters) to be passed to the server. | Empty string
`results_buffer_size` | Default size of the buffer that accumulates results for a statement or a batch of statements before they are sent to the client. Can also be set using the [`sql.defaults.results_buffer.size` cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}#setting-sql-defaults-results-buffer-size). Can be set as a top-level query parameter or as an `options` parameter.

#### Supported `options` parameters

CockroachDB supports the following `options` parameters. After the first `options` parameter is specified, any additional parameters in the same connection string must be separated by a space.

Parameter | Description
----------|-------------
`--cluster=<routing-id>` | Identifies your tenant cluster on a multi-tenant host. For example, `funny-skunk-123`. This option is deprecated. The `host` in the connection string now includes the tenant information.
`-c <session_variable>=<value>` |  Sets a [session variable]({% link {{ page.version.version }}/set-vars.md %}) for the SQL session.
`results_buffer_size` | Default size of the buffer that accumulates results for a statement or a batch of statements before they are sent to the client. Can also be set using the [`sql.defaults.results_buffer.size` cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}#setting-sql-defaults-results-buffer-size). Can be set as a top-level query parameter or as an `options` parameter.

{{site.data.alerts.callout_info}}
Note that some drivers require certain characters to be properly encoded in URL connection strings. For example, spaces in [a JDBC connection string](https://jdbc.postgresql.org/documentation/use/#connection-parameters) must be specified as `%20`.
{{site.data.alerts.end}}

### Secure connections with URLs

The following values are supported for `sslmode`, although only the first and the last are recommended for use.

Parameter | Description | Recommended for use
----------|-------------|--------------------
`sslmode=disable` | Do not use an encrypted, secure connection at all. | Use during development.
`sslmode=allow` | Enable a secure connection only if the server requires it.<br><br>**Not supported in all clients.** |
`sslmode=prefer` | Try to establish a secure connection, but accept an insecure connection if the server does not support secure connections.<br><br>**Not supported in all clients.** |
`sslmode=require` | Force a secure connection. An error occurs if the secure connection cannot be established. |
`sslmode=verify-ca` | Force a secure connection and verify that the server certificate is signed by a known CA. |
`sslmode=verify-full` | Force a secure connection, verify that the server certificate is signed by a known CA, and verify that the server address matches that specified in the certificate. | Use for [secure deployments]({% link {{ page.version.version }}/secure-a-cluster.md %}).

{{site.data.alerts.callout_danger}}
Some client drivers and the `cockroach` commands do not support
`sslmode=allow` and `sslmode=prefer`. Check the documentation of your
SQL driver to determine whether these options are supported.
{{site.data.alerts.end}}

### Convert a URL for different drivers

 The subcommand `cockroach convert-url` converts a connection URL, such as those printed out by [`cockroach start`]({% link {{ page.version.version }}/cockroach-start.md %}) or included in the online documentation, to the syntax recognized by various [client drivers]({% link {{ page.version.version }}/third-party-database-tools.md %}#drivers). For example:

{% include_cached copy-clipboard.html %}
~~~
$ ./cockroach convert-url --url "postgres://foo/bar"
~~~

~~~
# Connection URL for libpq (C/C++), psycopg (Python), lib/pq & pgx (Go),node-postgres (JS)
and most pq-compatible drivers:
  postgresql://root@foo:26257/bar
# Connection DSN (Data Source Name) for Postgres drivers that accept DSNs - most drivers
and also ODBC:
  database=bar user=root host=foo port=26257
# Connection URL for JDBC (Java and JVM-based languages):
  jdbc:postgresql://foo:26257/bar?user=root
~~~

### Example URL for an insecure connection

The following URL is suitable to connect to a CockroachDB node using an insecure connection:

{% include_cached copy-clipboard.html %}
~~~
postgres://root@servername:26257/mydb?sslmode=disable
~~~

This specifies a connection for the `root` user to server `servername`
on port 26257 (the default CockroachDB SQL port), with `mydb` set as
current database. `sslmode=disable` makes the connection insecure.

### Example URL for a secure connection

The following URL is suitable to connect to a CockroachDB node using a secure connection:

{% include_cached copy-clipboard.html %}
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
[Create Security Certificates]({% link {{ page.version.version }}/cockroach-cert.md %}) and
[Rotate Certificates]({% link {{ page.version.version }}/rotate-certificates.md %}).

### Example URI for a Unix domain socket

The following URI is suitable to connect to a CockroachDB cluster listening for Unix domain socket connections at `/path/to/client`:

{% include_cached copy-clipboard.html %}
~~~
postgres://root@?host=/path/to/client&port=26257
~~~

This specifies a connection for the `root` user to an insecure cluster listening for a socket connection (e.g., a cluster started with the [`--socket-dir` flag]({% link {{ page.version.version }}/cockroach-start.md %}#networking)) at `/path/to/client`, and on port 26257.

### Example URI for connecting to a database with a user-defined schema

The following URI connects to a CockroachDB cluster with a user-defined schema named `max_schema` in the `movr` database using the [`options` parameter](#supported-options-parameters).

{% include_cached copy-clipboard.html %}
~~~
postgres://maxroach@db.example.com:26257/movr?sslmode=verify-full&options%3D-c%20search_path%3Dmax_schema
~~~

{{site.data.alerts.callout_info}}
The `options=-c search_path=max_schema` parameter is URL-encoded in the example above.
{{site.data.alerts.end}}

## Connect using discrete parameters

Most [`cockroach` commands]({% link {{ page.version.version }}/cockroach-commands.md %}) accept connection
parameters as separate, discrete command-line flags, in addition (or
in replacement) to `--url` which [specifies all parameters as a
URL](#connect-using-a-url).

For each command-line flag that directs a connection parameter,
CockroachDB also recognizes an environment variable. The environment
variable is used when the command-line flag is not specified.

{% include {{ page.version.version }}/sql/connection-parameters.md %}

### Example command-line flags for an insecure connection

The following command-line flags establish an insecure connection:

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
~~~
postgres://root@servername:26257/?sslmode=disable
~~~

To specify `mydb` as the current database using [`cockroach sql`]({% link {{ page.version.version }}/cockroach-sql.md %}), run the following command:

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

## See also

- [`cockroach` Commands Overview]({% link {{ page.version.version }}/cockroach-commands.md %})
- [Create Security Certificates]({% link {{ page.version.version }}/cockroach-cert.md %})
- [Secure a Cluster]({% link {{ page.version.version }}/secure-a-cluster.md %})
- [Create and Manage Users]({% link {{ page.version.version }}/security-reference/authorization.md %}#create-and-manage-users)
