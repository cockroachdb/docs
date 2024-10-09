---
title: cockroach encode-uri
summary: Construct a connection URI that a client or application can use to connect to a cluster, based on the command-line arguments you provide.
toc: true
docs_area: reference.cli
---

The `cockroach encode-uri` command constructs a connection URI that a client or application can use to connect to a cluster, based on the command-line arguments you provide. The returned connection URI is in `postgresql:/` format.

## Synopsis

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach encode-uri [postgres:/][{USERNAME}[:{PASSWORD}]@]{HOST[:{PORT}]} [{FLAGS}]
~~~

Only `{HOST}` is required; all other options and [flags](#flags) are optional, as indicated by square brackets.

## Options

- `postgres:/`: Optional protocol specifier if providing a connection URI as input, rather than a `HOST:PORT` combination.
- `{USERNAME}`: Optionally provide the SQL username to use in the connection URI returned by the command.
- `{PASSWORD}`: Optionally provide the SQL password to use in the connection URI returned by the command.
- `{HOST}[:{PORT}]`: The hostname or IP address to connect to. The port is optional.

## Flags

The `encode-uri` command supports the following flags. All flags are optional.

Flag          | Description
--------------|-----------
`--inline`    | Whether to inline certificates for [Physical Cluster Replication]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %}). Connection strings generated with this flag may be incompatible with many SQL clients. Defaults to `false`.
`--user`      | {% include_cached new-in.html version="v24.3" %}Include the specified username in the connection string. If omitted, no username is set.
`--database`  | Include the specified database in the connection string. Defaults to `defaultdb`.
`--cluster`   | The virtual cluster to connect to. Defaults to `system`.
`--certs-dir` | {% include_cached new-in.html version="v24.3" %}The local directory that contains the cluster's CA certificate and node certificates.
`--ca-cert`   | The local directory that contains the cluster's CA certificate. Overrides `certs-dir` if both are passed.
`--cert`      | The local directory that contains the client certificate. Overrides `certs-dir` if both are passed.
`--key`       | The local directory that contains the signing key that corresponds to the client certificate. Overrides `certs-dir` if both are passed.

## Examples

By default, the connection URI is returned for a cluster's default database, `defaultdb`. Replace `{URI}` with the URI or `host:port` combination for a cluster node.

~~~ shell
cockroach encode-uri {URI}
~~~

To specify a different database to use in the connection URI, replace `{DATABASE}` with the name of a database.

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach encode-uri --database {DATABASE} {URI}
~~~

To specify the username to use in the connection URI, replace `{USERNAME}` with a SQL username.

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach encode-uri --user {USERNAME} {URI}
~~~

## See also

- [`cockroach cert`]({% link {{ page.version.version }}/cockroach-cert.md %})
- [Set up Physical Cluster Replication]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %})
