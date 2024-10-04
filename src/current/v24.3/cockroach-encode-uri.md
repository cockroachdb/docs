---
title: cockroach encode-uri
summary: Get the connection string for a cluster from its URI.
toc: true
docs_area: reference.cli
---

The `cockroach encode-uri` command returns the `postgresql:/` connection string for a cluster and database from the URI of a cluster node.

## Synopsis

To get the connection string for a cluster's `defaultdb` database, replace `{URI}` with the URI of a cluster node.

~~~ shell
cockroach encode-uri {URI}
~~~

To specify the username to use in the connection string, replace `{USERNAME}` with a SQL username.

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach encode-uri --user {USERNAME} {URI}
~~~

To specify the database to use in the connection string, replace `{DATABASE}` with the name of a database.

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach encode-uri --database {DATABASE} {URI}
~~~

## Flags

The `encode-uri` command supports the following flags. All flags are optional.

Flag          | Description
--------------|-----------
`--inline`    | Whether to inline certificates for [Physical Cluster Replication]({% link {{ page.version.version }}/physical-cluster-replication.md %}). Defaults to `false`.
`--user`      | {% include_cached new-in.html version="v24.3" %}Include the specified username in the connection string. If omitted, no username is set.
`--database`  | Include the specified database in the connection string. Defaults to `defaultdb`.
`--cluster`   | The virtual cluster to connect to. Defaults to `system`.
`--certs-dir` | {% include_cached new-in.html version="v24.3" %}The local directory that contains the cluster's CA certificate and node certificates.
`--ca-cert`   | The local directory that contains the cluster's CA certificate. Overrides `certs-dir` if both are passed.
`--cert`      | The local directory that contains the client certificate. Overrides `certs-dir` if both are passed.
`--key`       | The local directory that contains the signing key that corresponds to the client certificate. Overrides `certs-dir` if both are passed.

## See also

- [`cockroach cert`]({% link {{ page.version.version }}/cockroach-cert.md %})
- [Set up Physical Cluster Replication]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %})
