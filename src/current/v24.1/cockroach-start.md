---
title: cockroach start
summary: Start a new multi-node cluster or add nodes to an existing multi-node cluster.
toc: true
key: start-a-node.html
docs_area: reference.cli
---

This page explains the `cockroach start` [command]({% link {{ page.version.version }}/cockroach-commands.md %}), which you use to start a new multi-node cluster or add nodes to an existing cluster.

{{site.data.alerts.callout_success}}
If you need a simple single-node backend for app development, use [`cockroach start-single-node`]({% link {{ page.version.version }}/cockroach-start-single-node.md %}) instead, and follow the best practices for local testing described in [Test Your Application]({% link {{ page.version.version }}/local-testing.md %}).

For quick SQL testing, consider using [`cockroach demo`]({% link {{ page.version.version }}/cockroach-demo.md %}) to start a temporary, in-memory cluster with immediate access to an interactive SQL shell.
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
Node-level settings are defined by [flags](#flags) passed to the `cockroach start` command and cannot be changed without stopping and restarting the node. In contrast, some cluster-wide settings are defined via SQL statements and can be updated anytime after a cluster has been started. For more details, see [Cluster Settings]({% link {{ page.version.version }}/cluster-settings.md %}).
{{site.data.alerts.end}}

## Synopsis

Start a node to be part of a new multi-node cluster:

~~~ shell
$ cockroach start <flags, including --join>
~~~

Initialize a new multi-node cluster:

~~~ shell
$ cockroach init <flags>
~~~

Add a node to an existing cluster:

~~~ shell
$ cockroach start <flags, including --join>
~~~

View help:

~~~ shell
$ cockroach start --help
~~~

## Flags

The `cockroach start` command supports the following [general-use](#general), [networking](#networking), [security](#security), and [logging](#logging) flags.

Many flags have useful defaults that can be overridden by specifying the flags explicitly. If you specify flags explicitly, however, be sure to do so each time the node is restarted, as they will not be remembered. The one exception is the `--join` flag, which is stored in a node's data directory. We still recommend specifying the `--join` flag every time, as this will allow nodes to rejoin the cluster even if their data directory was destroyed.

### General

Flag | Description
-----|-----------
`--attrs` | Arbitrary strings, separated by colons, specifying node capability, which might include specialized hardware or number of cores, for example:<br><br>`--attrs=ram:64gb`<br><br>These can be used to influence the location of data replicas. See [Replication Controls]({% link {{ page.version.version }}/configure-replication-zones.md %}#replication-constraints) for full details.
`--background` | Runs the node in the background. Control is returned to the shell only once the node is ready to accept requests, so this is recommended over appending `&` to the command. This flag is **not** available in Windows environments.<br><br>**Note:** `--background` is suitable for writing automated test suites or maintenance procedures that need a temporary server process running in the background. It is not intended to be used to start a long-running server, because it does not fully detach from the controlling terminal. Consider using a service manager or a tool like [daemon(8)](https://www.freebsd.org/cgi/man.cgi?query=daemon&sektion=8) instead. If you use `--background`, using `--pid-file` is also recommended. To gracefully stop the `cockroach` process, send the `SIGTERM` signal to the process ID in the PID file. To gracefully restart the process, send the `SIGHUP` signal.
`--cache` | The total size for caches, shared evenly if there are multiple storage devices. This can be a percentage (notated as a decimal or with `%`) or any bytes-based unit; for example: <br><br>`--cache=.25`<br>`--cache=25%`<br>`--cache=1000000000 ----> 1000000000 bytes`<br>`--cache=1GB ----> 1000000000 bytes`<br>`--cache=1GiB ----> 1073741824 bytes` <br><br>**Note:** If you use the `%` notation, you might need to escape the `%` sign (for instance, while configuring CockroachDB through `systemd` service files). For this reason, it's recommended to use the decimal notation instead.<br><br>**Note:** The sum of `--cache`, `--max-sql-memory`, and `--max-tsdb-memory` should not exceed 75% of the memory available to the `cockroach` process.<br><br>**Default:** `128MiB`<br><br>The default cache size is reasonable for local development clusters. For production deployments, this should be increased to 25% or higher. Increasing the cache size will generally improve the node's read performance. For more details, see [Recommended Production Settings]({% link {{ page.version.version }}/recommended-production-settings.md %}#cache-and-sql-memory-size).
`--clock-device` | Enable CockroachDB to use a [PTP hardware clock](https://www.kernel.org/doc/html/latest/driver-api/ptp.html) when querying the current time. The value is a string that specifies the clock device to use. For example: `--clock-device=/dev/ptp0`<br><br>**Note:** This is supported on Linux only and may be needed in cases where the host clock is unreliable or prone to large jumps (e.g., when using vMotion).
`--cluster-name` | <a name="flags-cluster-name"></a> A string that specifies a cluster name. This is used together with `--join` to ensure that all newly created nodes join the intended cluster when you are running multiple clusters.<br><br>**Note:** If this is set, [`cockroach init`]({% link {{ page.version.version }}/cockroach-init.md %}), [`cockroach node decommission`]({% link {{ page.version.version }}/cockroach-node.md %}), [`cockroach node recommission`]({% link {{ page.version.version }}/cockroach-node.md %}), and the `cockroach debug` commands must specify either `--cluster-name` or `--disable-cluster-name-verification` in order to work.
`--disable-cluster-name-verification` | On clusters for which a cluster name has been set, this flag paired with `--cluster-name` disables the cluster name check for the command. This is necessary on existing clusters, when setting a cluster name or changing the cluster name: Perform a rolling restart of all nodes and include both the new `--cluster-name` value and `--disable-cluster-name-verification`, then a second rolling restart with `--cluster-name` and without `--disable-cluster-name-verification`.
<a name="flags-external-io-dir"></a>`--external-io-dir` | The path of the external IO directory with which the local file access paths are prefixed while performing backup and restore operations using local node directories or NFS drives. If set to `disabled`, backups and restores using local node directories and NFS drives, as well as [`cockroach nodelocal upload`]({% link {{ page.version.version }}/cockroach-nodelocal-upload.md %}), are disabled.<br><br>**Default:** `extern` subdirectory of the first configured [`store`](#store).<br><br>To set the `--external-io-dir` flag to the locations you want to use without needing to restart nodes, create symlinks to the desired locations from within the `extern` directory.
`--listening-url-file` | The file to which the node's SQL connection URL will be written as soon as the node is ready to accept connections, in addition to being printed to the [standard output](#standard-output). When `--background` is used, this happens before the process detaches from the terminal.<br><br>This is particularly helpful in identifying the node's port when an unused port is assigned automatically (`--port=0`).
`--locality` | Arbitrary key-value pairs that describe the location of the node. Locality might include country, region, availability zone, etc. A `region` tier must be included in order to enable [multi-region capabilities]({% link {{ page.version.version }}/multiregion-overview.md %}). For more details, see [Locality](#locality) below.
`--max-disk-temp-storage` | The maximum on-disk storage capacity available to store temporary data for SQL queries that exceed the memory budget (see `--max-sql-memory`). This ensures that JOINs, sorts, and other memory-intensive SQL operations are able to spill intermediate results to disk. This can be a percentage (notated as a decimal or with `%`) or any bytes-based unit (e.g., `.25`, `25%`, `500GB`, `1TB`, `1TiB`).<br><br><strong>Note:</strong> If you use the `%` notation, you might need to escape the `%` sign, for instance, while configuring CockroachDB through `systemd` service files. For this reason, it's recommended to use the decimal notation instead. Also, if expressed as a percentage, this value is interpreted relative to the size of the first store. However, the temporary space usage is never counted towards any store usage; therefore, when setting this value, it's important to ensure that the size of this temporary storage plus the size of the first store doesn't exceed the capacity of the storage device.<br><br>The temporary files are located in the path specified by the `--temp-dir` flag, or in the subdirectory of the first store (see `--store`) by default.<br><br>**Default:** `32GiB`
`--max-go-memory` | The maximum soft memory limit for the Go runtime, which influences the behavior of Go's garbage collection. Defaults to `--max-sql-memory x 2.25`, but cannot exceed 90% of the node's available RAM. To disable the soft memory limit, set `--max-go-memory` to `0` (not recommended).
<a name="flags-max-offset"></a>`--max-offset` | The maximum allowed clock offset for the cluster. If observed clock offsets exceed this limit, servers will crash to minimize the likelihood of reading inconsistent data. Increasing this value will increase the time to recovery of failures as well as the frequency of uncertainty-based read restarts.<br><br>Nodes can run with different values for `--max-offset`, but only for the purpose of updating the setting across the cluster using a rolling upgrade.<br><br>**Default:** `500ms`
`--max-sql-memory` | The maximum in-memory storage capacity available to store temporary data for SQL queries, including prepared queries and intermediate data rows during query execution. This can be a percentage (notated as a decimal or with `%`) or any bytes-based unit; for example:<br><br>`--max-sql-memory=.25`<br>`--max-sql-memory=25%`<br>`--max-sql-memory=10000000000 ----> 1000000000 bytes`<br>`--max-sql-memory=1GB ----> 1000000000 bytes`<br>`--max-sql-memory=1GiB ----> 1073741824 bytes`<br><br>The temporary files are located in the path specified by the `--temp-dir` flag, or in the subdirectory of the first store (see `--store`) by default.<br><br>**Note:** If you use the `%` notation, you might need to escape the `%` sign (for instance, while configuring CockroachDB through `systemd` service files). For this reason, it's recommended to use the decimal notation instead.<br><br>**Note:** The sum of `--cache`, `--max-sql-memory`, and `--max-tsdb-memory` should not exceed 75% of the memory available to the `cockroach` process.<br><br>**Default:** `25%` <br><br>The default SQL memory size is suitable for production deployments but can be raised to increase the number of simultaneous client connections the node allows as well as the node's capacity for in-memory processing of rows when using `ORDER BY`, `GROUP BY`, `DISTINCT`, joins, and window functions. For local development clusters with memory-intensive workloads, reduce this value to, for example, `128MiB` to prevent [out-of-memory errors]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#out-of-memory-oom-crash).
<a name="flags-max-tsdb-memory"></a>`--max-tsdb-memory` | Maximum memory capacity available to store temporary data for use by the time-series database to display metrics in the [DB Console]({% link {{ page.version.version }}/ui-overview.md %}). Consider raising this value if your cluster is comprised of a large number of nodes where individual nodes have very limited memory available (e.g., under `8 GiB`). Insufficient memory capacity for the time-series database can constrain the ability of the DB Console to process the time-series queries used to render metrics for the entire cluster. This capacity constraint does not affect SQL query execution. This flag accepts numbers interpreted as bytes, size suffixes (e.g., `1GB` and `1GiB`) or a percentage of physical memory (e.g., `0.01`).<br><br>**Note:** The sum of `--cache`, `--max-sql-memory`, and `--max-tsdb-memory` should not exceed 75% of the memory available to the `cockroach` process.<br><br>**Default:** `0.01` (i.e., 1%) of physical memory or `64 MiB`, whichever is greater.
`--pid-file` | The file to which the node's process ID will be written as soon as the node is ready to accept connections. When `--background` is used, this happens before the process detaches from the terminal. When this flag is not set, the process ID is not written to file.
<a name="flags-store"></a> `--store`<br>`-s` | The file path to a storage device and, optionally, store attributes and maximum size. When using multiple storage devices for a node, this flag must be specified separately for each device, for example: <br><br>`--store=/mnt/ssd01 --store=/mnt/ssd02` <br><br>For more details, see [Store](#store) below.
`--wal-failover` <a name="flag-wal-failover"></a> | Used to configure [WAL failover](#write-ahead-log-wal-failover) on [nodes]({% link {{ page.version.version }}/architecture/overview.md %}#node) with [multiple stores](#store). To enable WAL failover, pass `--wal-failover=among-stores`.  To disable, pass `--wal-failover=disabled` on [node restart]({% link {{ page.version.version }}/node-shutdown.md %}#stop-and-restart-a-node). This feature is in [preview]({% link {{page.version.version}}/cockroachdb-feature-availability.md %}#features-in-preview).
<a name="flags-spatial-libs"></a>`--spatial-libs` |  The location on disk where CockroachDB looks for [spatial]({% link {{ page.version.version }}/spatial-data-overview.md %}) libraries.<br/><br/>**Defaults:** <br/><ul><li>`/usr/local/lib/cockroach`</li><li>A `lib` subdirectory of the CockroachDB binary's current directory.</li></ul>
`--temp-dir` <a name="temp-dir"></a> | The path of the node's temporary store directory. On node start up, the location for the temporary files is printed to the standard output. <br><br>**Default:** Subdirectory of the first [store](#store)

### Networking

Flag | Description
-----|-----------
`--experimental-dns-srv` | When this flag is included, the node will first attempt to fetch SRV records from DNS for every name specified with `--join`. If a valid SRV record is found, that information is used instead of regular DNS A/AAAA lookups. This feature is experimental and may be removed or modified in a later version.
`--listen-addr` | The IP address/hostname and port to listen on for connections from other nodes and clients. For IPv6, use the notation `[...]`, e.g., `[::1]` or `[fe80::f6f2:::]`.<br><br>This flag's effect depends on how it is used in combination with `--advertise-addr`. For example, the node will also advertise itself to other nodes using this value if `--advertise-addr` is not specified. For more details, see [Networking]({% link {{ page.version.version }}/recommended-production-settings.md %}#networking).<br><br>**Default:** Listen on all IP addresses on port `26257`; if `--advertise-addr` is not specified, also advertise the node's canonical hostname to other nodes
`--advertise-addr` | <a name="flags-advert-addr"></a> The IP address/hostname and port to tell other nodes to use. If using a hostname, it must be resolvable from all nodes. If using an IP address, it must be routable from all nodes; for IPv6, use the notation `[...]`, e.g., `[::1]` or `[fe80::f6f2:::]`.<br><br>This flag's effect depends on how it is used in combination with `--listen-addr`. For example, if the port number is different than the one used in `--listen-addr`, port forwarding is required. For more details, see [Networking]({% link {{ page.version.version }}/recommended-production-settings.md %}#networking).<br><br>**Default:** The value of `--listen-addr`; if `--listen-addr` is not specified, advertises the node's canonical hostname and port `26257`
`--advertise-http-addr` | The IP address/hostname and port to advertise for DB Console HTTP requests when [proxying connections to the DB Console]({% link {{ page.version.version }}/ui-overview.md %}#proxy-db-console). If omitted, the hostname is inherited from the operating system hostname or the hostname from `--advertise-addr`. If the port is omitted, it defaults to `8080` and is never inherited from `--advertise-addr`.
`--http-addr` | <a name="flags-http-addr"></a> The IP address/hostname and port on which to listen for DB Console HTTP requests. For IPv6, use the notation `[...]`, e.g., `[::1]:8080` or `[fe80::f6f2:::]:8080`.<br><br>**Default:** Listen on the address specified in `--listen-addr` and on port `8080`
`--locality-advertise-addr` | The IP address/hostname and port to tell other nodes in specific localities to use to connect to this node. This flag is useful when running a cluster across multiple networks, where nodes in a given network have access to a private or local interface while nodes outside the network do not. In this case, you can use `--locality-advertise-addr` to tell nodes within the same network to prefer the private or local address to improve performance and use `--advertise-addr` to tell nodes outside the network to use another address that is reachable from them. However, **do not** include addresses or hostnames that do not resolve to this node, because this will cause connection failures when other nodes attempt to connect to this node. <br><br>This flag relies on nodes being started with the [`--locality`](#locality) flag and uses the `locality@address` notation, for example:<br><br>`--locality-advertise-addr=region=us-west@10.0.0.0:26257`<br><br>For more details, refer to the [Start a multi-node cluster across private networks](#start-a-multi-node-cluster-across-private-networks) example.
`--sql-addr` | <a name="flags-sql-addr"></a> The IP address/hostname and port on which to listen for SQL connections from clients. For IPv6, use the notation `[...]`, e.g., `[::1]` or `[fe80::f6f2:::]`.<br><br>This flag's effect depends on how it is used in combination with `--advertise-sql-addr`. For example, the node will also advertise itself to clients using this value if `--advertise-sql-addr` is not specified. <br><br>**Default:** The value of `--listen-addr`; if `--listen-addr` is not specified, advertises the node's canonical hostname and port `26257` <br><br>For an example, see [Start a cluster with separate RPC and SQL networks](#start-a-cluster-with-separate-rpc-and-sql-networks)
`--advertise-sql-addr` | The IP address/hostname and port to tell clients to use. If using a hostname, it must be resolvable from all nodes. If using an IP address, it must be routable from all nodes; for IPv6, use the notation `[...]`, e.g., `[::1]` or `[fe80::f6f2:::]`.<br><br>This flag's effect depends on how it is used in combination with `--sql-addr`. For example, if the port number is different than the one used in `--sql-addr`, port forwarding is required. <br><br>**Default:** The value of `--sql-addr`; if `--sql-addr` is not specified, advertises the value of `--listen-addr`
`--join`<br>`-j` | The host addresses that connect nodes to the cluster and distribute the rest of the node addresses. These can be IP addresses or DNS aliases of nodes.<br><br>When starting a cluster in a single region, specify the addresses of 3-5 initial nodes. When starting a cluster in multiple regions, specify more than 1 address per region, and select nodes that are spread across failure domains. Then run the [`cockroach init`]({% link {{ page.version.version }}/cockroach-init.md %}) command against any of these nodes to complete cluster startup. See the [example](#start-a-multi-node-cluster) below for more details.<br><br>Use the same `--join` list for all nodes to ensure that the cluster can stabilize. Do not list every node in the cluster, because this increases the time for a new cluster to stabilize. Note that these are best practices; it is not required to restart an existing node to update its `--join` flag.<br><br>`cockroach start` must be run with the `--join` flag. To start a single-node cluster, use `cockroach start-single-node` instead.
`--socket-dir` |  The directory path on which to listen for [Unix domain socket](https://wikipedia.org/wiki/Unix_domain_socket) connections from clients installed on the same Unix-based machine. For an example, see [Connect to a cluster listening for Unix domain socket connections]({% link {{ page.version.version }}/cockroach-sql.md %}#connect-to-a-cluster-listening-for-unix-domain-socket-connections).
`--advertise-host` | **Deprecated.** Use `--advertise-addr` instead.
`--host` | **Deprecated.** Use `--listen-addr` instead.
`--port`<br>`-p` | **Deprecated.** Specify port in `--advertise-addr` and/or `--listen-addr` instead.
`--http-host` | **Deprecated.** Use `--http-addr` instead.
`--http-port` | **Deprecated.** Specify port in `--http-addr` instead.

### Security

Flag | Description
-----|-----------
`--certs-dir` | The path to the [certificate directory]({% link {{ page.version.version }}/cockroach-cert.md %}). The directory must contain valid certificates if running in secure mode.<br><br>**Default:** `${HOME}/.cockroach-certs/`
`--insecure` | **Note:** The `--insecure` flag is intended for **non-production testing only**.<br><br>Run in insecure mode, skipping all TLS encryption and authentication. If this flag is not set, the `--certs-dir` flag must point to valid certificates.<br><br>**Note the following risks:** An insecure cluster is open to any client that can access any node's IP addresses; client connections must also be made insecurely; any user, even `root`, can log in without providing a password; any user, connecting as `root`, can read or write any data in your cluster; there is no network encryption or authentication, and thus no confidentiality.<br><br>**Default:** `false`
`--accept-sql-without-tls` | This flag (in [preview]({% link {{ page.version.version }}/cockroachdb-feature-availability.md %})) allows you to connect to the cluster using a SQL user's password without [validating the client's certificate]({% link {{ page.version.version }}/authentication.md %}#client-authentication). When connecting using the built-in SQL client, [use the `--insecure` flag with the `cockroach sql` command]({% link {{ page.version.version }}/cockroach-sql.md %}#client-connection).
`--cert-principal-map` <a name="flags-cert-principal-map"></a> |  A comma-separated list of `cert-principal:db-principal` mappings used to map the certificate principals to IP addresses, DNS names, and SQL users. This allows the use of certificates generated by Certificate Authorities that place restrictions on the contents of the `commonName` field. For usage information, see [Create Security Certificates using Openssl]({% link {{ page.version.version }}/create-security-certificates-openssl.md %}#examples).
`--enterprise-encryption` | This optional flag specifies the encryption options for one of the stores on the node. If multiple stores exist, the flag must be specified for each store. <br /><br /> This flag takes a number of options.  For a complete list of options, and usage instructions, see [Encryption at Rest]({% link {{ page.version.version }}/encryption.md %}).
<a name="flags-external-io-disable-http"></a>`--external-io-disable-http` |  This optional flag disables external HTTP(S) access (as well as custom HTTP(S) endpoints) when performing bulk operations (e.g, [`BACKUP`]({% link {{ page.version.version }}/backup.md %})). This can be used in environments where you cannot run a full proxy server. <br><br>If you want to run a proxy server, you can start CockroachDB while specifying the `HTTP(S)_PROXY` environment variable.
`--external-io-disable-implicit-credentials` |  This optional flag disables the use of implicit credentials when accessing external cloud storage services for bulk operations (e.g, [`BACKUP`]({% link {{ page.version.version }}/backup.md %})).
`--node-cert-distinguished-name` <a name="flags-node-cert-distinguished-name"></a> | A string with a comma separated list of distinguished name (DN) mappings in `{attribute-type}={attribute-value}` format in accordance with [RFC4514](https://www.rfc-editor.org/rfc/rfc4514) for the [`node` user]({% link {{ page.version.version }}/security-reference/authorization.md %}#node-user). If this flag is set, this needs to be an exact match with the DN subject in the client certificate provided for the `node` user. By exact match, we mean that the order of attributes in the argument to this flag must match the order of attributes in the DN subject in the certificate. For more information, see [Certificate-based authentication using multiple values from the X.509 Subject field]({% link {{ page.version.version }}/certificate-based-authentication-using-the-x509-subject-field.md %}).
`--root-cert-distinguished-name` <a name="flags-root-cert-distinguished-name"></a> | A string with a comma separated list of distinguished name (DN) mappings in `{attribute-type}={attribute-value}` format in accordance with [RFC4514](https://www.rfc-editor.org/rfc/rfc4514) for the [`root` user]({% link {{ page.version.version }}/security-reference/authorization.md %}#root-user). If this flag is set, this needs to be an exact match with the DN subject in the client certificate provided for the `root` user. By exact match, we mean that the order of attributes in the argument to this flag must match the order of attributes in the DN subject in the certificate. For more information, see [Certificate-based authentication using multiple values from the X.509 Subject field]({% link {{ page.version.version }}/certificate-based-authentication-using-the-x509-subject-field.md %}).

### Locality

The `--locality` flag accepts arbitrary key-value pairs that describe the location of the node. Locality should include a `region` key-value if you are using CockroachDB's [Multi-region SQL capabilities]({% link {{ page.version.version }}/multiregion-overview.md %}).

Depending on your deployment you can also specify country, availability zone, etc. The key-value pairs should be ordered into _locality tiers_ from most inclusive to least inclusive (e.g., region before availability zone as in `region=eu-west-1,zone=eu-west-1a`), and the keys and order of key-value pairs must be the same on all nodes. It's typically better to include more pairs than fewer.

- Specifying a region with a `region` tier is required in order to enable CockroachDB's [multi-region capabilities]({% link {{ page.version.version }}/multiregion-overview.md %}).

- CockroachDB spreads the replicas of each piece of data across as diverse a set of localities as possible, with the order determining the priority. Locality can also be used to influence the location of data replicas in various ways using high-level [multi-region SQL capabilities]({% link {{ page.version.version }}/multiregion-overview.md %}) or low-level [replication zones]({% link {{ page.version.version }}/configure-replication-zones.md %}#replication-constraints).

- When there is high latency between nodes (e.g., cross-availability zone deployments), CockroachDB uses locality to move range leases closer to the current workload, reducing network round trips and improving read performance, also known as ["follow-the-workload"]({% link {{ page.version.version }}/topology-follow-the-workload.md %}). In a deployment across more than 3 availability zones, however, to ensure that all data benefits from "follow-the-workload", you must increase your replication factor to match the total number of availability zones.

- Locality is also a prerequisite for using the [Multi-region SQL abstractions]({% link {{ page.version.version }}/multiregion-overview.md %}), [table partitioning]({% link {{ page.version.version }}/partitioning.md %}), and [**Node Map**]({% link {{ page.version.version }}/enable-node-map.md %}) {{site.data.products.enterprise}} features.

<a name="locality-example"></a>

#### Example

The following shell commands use the `--locality` flag to start 9 nodes to run across 3 regions: `us-east-1`, `us-west-1`, and `europe-west-1`. Each region's nodes are further spread across different availability zones within that region.

{{site.data.alerts.callout_info}}
This example follows the conventions required to use CockroachDB's [multi-region capabilities]({% link {{ page.version.version }}/multiregion-overview.md %}).
{{site.data.alerts.end}}

Nodes in `us-east-1`:

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach start --locality=region=us-east-1,zone=us-east-1a # ... other required flags go here
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach start --locality=region=us-east-1,zone=us-east-1b # ... other required flags go here
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach start --locality=region=us-east-1,zone=us-east-1c # ... other required flags go here
~~~

Nodes in `us-west-1`:

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach start --locality=region=us-west-1,zone=us-west-1a # ... other required flags go here
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach start --locality=region=us-west-1,zone=us-west-1b # ... other required flags go here
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach start --locality=region=us-west-1,zone=us-west-1c # ... other required flags go here
~~~

Nodes in `europe-west-1`:

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach start --locality=region=europe-west-1,zone=europe-west-1a # ... other required flags go here
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach start --locality=region=europe-west-1,zone=europe-west-1b # ... other required flags go here
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach start --locality=region=europe-west-1,zone=europe-west-1c # ... other required flags go here
~~~

For another multi-region example, see [Start a multi-region cluster](#start-a-multi-region-cluster).

For more information about how to use CockroachDB's multi-region capabilities, see the [Multi-Region Capabilities Overview]({% link {{ page.version.version }}/multiregion-overview.md %}).

### Storage

- [Storage engine](#storage-engine)
- [Store](#store)
- [Write Ahead Log (WAL) Failover](#write-ahead-log-wal-failover)

#### Storage engine

The `--storage-engine` flag is used to choose the storage engine used by the node. Note that this setting applies to all [stores](#store) on the node, including the [temp store](#temp-dir).

 As of v21.1 and later, CockroachDB always uses the [Pebble storage engine]({% link {{ page.version.version }}/architecture/storage-layer.md %}#pebble). As such, `pebble` is the default and only option for the `--storage-engine` flag.

#### Store

The `--store` flag allows you to specify details about a node's storage.

To start a node with multiple disks or SSDs, you can use either of these approaches:

- Configure the disks or SSDs as a single RAID volume, then pass the RAID volume to the `--store` flag when starting the `cockroach` process on the node.
- Provide a separate `--store` flag for each disk when starting the `cockroach` process on the node. For more details about stores, see [Start a Node]({% link {{ page.version.version }}/cockroach-start.md %}#store).

  {{site.data.alerts.callout_danger}}
  If you start a node with multiple `--store` flags, it is not possible to scale back down to only using a single store on the node. Instead, you must decommission the node and start a new node with the updated `--store`.
  {{site.data.alerts.end}}

The `--store` flag supports the following fields. Note that commas are used to separate fields, and so are forbidden in all field values.

{{site.data.alerts.callout_info}}
In-memory storage is not suitable for production deployments at this time.
{{site.data.alerts.end}}

{{site.data.alerts.callout_success}}
{% include {{ page.version.version }}/prod-deployment/prod-guidance-store-volume.md %}
{{site.data.alerts.end}}

Field | Description
------|------------
`type` | For in-memory storage, set this field to `mem`; otherwise, leave this field out. The `path` field must not be set when `type=mem`.
`path` | The file path to the storage device. When not setting `attr`, `size`, or `ballast-size`, the `path` field label can be left out: <br><br>`--store=/mnt/ssd01` <br><br>When either of those fields are set, however, the `path` field label must be used: <br><br>`--store=path=/mnt/ssd01,size=20GB` <br><br> **Default:** `cockroach-data`
`attrs` | Arbitrary strings, separated by colons, specifying disk type or capability. These can be used to influence the location of data replicas. See [Replication Controls]({% link {{ page.version.version }}/configure-replication-zones.md %}#replication-constraints) for full details.<br><br>In most cases, node-level `--locality` or `--attrs` are preferable to store-level attributes, but this field can be used to match capabilities for storage of individual databases or tables. For example, an OLTP database would probably want to allocate space for its tables only on solid state devices, whereas append-only time series might prefer cheaper spinning drives. Typical attributes include whether the store is flash (`ssd`) or spinny disk (`hdd`), as well as speeds and other specs, for example:<br><br> `--store=path=/mnt/hda1,attrs=hdd:7200rpm`
<a name="store-size"></a> `size` | The maximum size allocated to the node. When this size is reached, CockroachDB attempts to rebalance data to other nodes with available capacity. When no other nodes have available capacity, this limit will be exceeded. Data may also be written to the node faster than the cluster can rebalance it away; as long as capacity is available elsewhere, CockroachDB will gradually rebalance data down to the store limit.<br><br> The `size` can be specified either in a bytes-based unit or as a percentage of hard drive space (notated as a decimal or with `%`), for example: <br><br>`--store=path=/mnt/ssd01,size=10000000000 ----> 10000000000 bytes`<br>`--store=path=/mnt/ssd01,size=20GB ----> 20000000000 bytes`<br>`--store=path=/mnt/ssd01,size=20GiB ----> 21474836480 bytes`<br>`--store=path=/mnt/ssd01,size=0.02TiB ----> 21474836480 bytes`<br>`--store=path=/mnt/ssd01,size=20% ----> 20% of available space`<br>`--store=path=/mnt/ssd01,size=0.2 ----> 20% of available space`<br>`--store=path=/mnt/ssd01,size=.2 ----> 20% of available space`<br><br>**Default:** 100%<br><br>For an in-memory store, the `size` field is required and must be set to the true maximum bytes or percentage of available memory, for example:<br><br>`--store=type=mem,size=20GB`<br>`--store=type=mem,size=90%`<br><br><strong>Note:</strong> If you use the `%` notation, you might need to escape the `%` sign, for instance, while configuring CockroachDB through `systemd` service files. For this reason, it's recommended to use the decimal notation instead.
<a name="fields-ballast-size"></a> `ballast-size` | Configure the size of the automatically created emergency ballast file. Accepts the same value formats as the [`size` field](#store-size). For more details, see [Automatic ballast files]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#automatic-ballast-files).<br><br>To disable automatic ballast file creation, set the value to `0`:<br><br>`--store=path=/mnt/ssd01,ballast-size=0`
<a name="store-provisioned-rate"></a> `provisioned-rate` | A mapping of a store name to a bandwidth limit, expressed in bytes per second. This constrains the bandwidth used for [admission control]({% link {{ page.version.version }}/admission-control.md %}) for operations on the store. The disk name is separated from the bandwidth value by a colon (`:`). A value of `0` (the default) represents unlimited bandwidth. For example: <br /><br />`--store=provisioned-rate=disk-name=/mnt/ssd01:200`<br /><br />**Default:** 0<br /><br />If the bandwidth value is omitted, bandwidth is limited to the value of the  [`kv.store.admission.provisioned_bandwidth` cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}#settings). <strong>Modify this setting only in consultation with your <a href="https://support.cockroachlabs.com/hc/">support team</a>.</strong>

#### Write Ahead Log (WAL) Failover

{% include_cached new-in.html version="v24.1" %} {% include {{ page.version.version }}/wal-failover-intro.md %}

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

This page has basic instructions on how to enable WAL failover, disable WAL failover, and monitor WAL failover.

For more detailed instructions showing how to use, test, and monitor WAL failover, as well as descriptions of how WAL failover works in multi-store configurations, see [WAL Failover]({% link {{ page.version.version }}/wal-failover.md %}).

##### Enable WAL failover

To enable WAL failover, you must take one of the following actions:

- Pass [`--wal-failover=among-stores`](#flag-wal-failover) to `cockroach start`, or
- Set the environment variable `COCKROACH_WAL_FAILOVER=among-stores` before starting the node.

[Writing log files to local disk]({% link {{ page.version.version }}/configure-logs.md %}#output-to-files) using the default configuration can lead to cluster instability in the event of a [disk stall]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#disk-stalls). It's not enough to failover your WAL writes to another disk: you must also write your log files in such a way that the forward progress of your cluster is not stalled due to disk unavailability.

Therefore, if you enable WAL failover and log to local disks, you must also update your [logging]({% link {{page.version.version}}/logging-overview.md %}) configuration as follows:

1. Disable [audit logging]({% link {{ page.version.version }}/sql-audit-logging.md %}). File-based audit logging cannot coexist with the WAL failover feature. File-based audit logging provides guarantees that every log message makes it to disk, or CockroachDB must be shut down. For this reason, resuming operations in the face of disk unavailability is not compatible with audit logging.
1. Enable asynchronous buffering of [`file-groups` log sinks]({% link {{ page.version.version }}/configure-logs.md %}#output-to-files) using the `buffering` configuration option. The `buffering` configuration can be applied to [`file-defaults`]({% link {{ page.version.version }}/configure-logs.md %}#configure-logging-defaults) or individual `file-groups` as needed. Note that enabling asynchronous buffering of `file-groups` log sinks is in [preview]({% link {{page.version.version}}/cockroachdb-feature-availability.md %}#features-in-preview).
1. Set `max-staleness: 1s` and `flush-trigger-size: 256KiB`.
1. When `buffering` is enabled, `buffered-writes` must be explicitly disabled as shown in the following example. This is necessary because `buffered-writes` does not provide true asynchronous disk access, but rather a small buffer. If the small buffer fills up, it can cause internal routines performing logging operations to hang. This will in turn cause internal routines doing other important work to hang, potentially affecting cluster stability.
1. The recommended logging configuration for using file-based logging with WAL failover is as follows:

    {% include {{ page.version.version }}/wal-failover-log-config.md %}

As an alternative to logging to local disks, you can configure [remote log sinks]({% link {{page.version.version}}/logging-use-cases.md %}#network-logging) that are not correlated with the availability of your cluster's local disks. However, this will make troubleshooting using [`cockroach debug zip`]({% link {{ page.version.version}}/cockroach-debug-zip.md %}) more difficult, since the output of that command will not include the (remotely stored) log files.

##### Disable WAL failover

To disable WAL failover, you must [restart the node]({% link {{ page.version.version }}/node-shutdown.md %}#stop-and-restart-a-node) and either:

- Pass the [`--wal-failover=disabled`](#flag-wal-failover) flag to `cockroach start`, or
- Set the environment variable `COCKROACH_WAL_FAILOVER=disabled` before restarting the node.

##### Monitor WAL failover

{% include {{ page.version.version }}/wal-failover-metrics.md %}

### Logging

By [default]({% link {{ page.version.version }}/configure-logs.md %}#default-logging-configuration), `cockroach start` writes all messages to log files, and prints nothing to `stderr`. This includes events with `INFO` [severity]({% link {{ page.version.version }}/logging.md %}#logging-levels-severities) and higher. However, you can [customize the logging behavior]({% link {{ page.version.version }}/configure-logs.md %}) of this command by using the `--log` flag:

{% include {{ page.version.version }}/misc/logging-flags.md %}

#### Defaults

See the [default logging configuration]({% link {{ page.version.version }}/configure-logs.md %}#default-logging-configuration).

## Standard output

When you run `cockroach start`, some helpful details are printed to the standard output:

~~~ shell
CockroachDB node starting at {{ now | date: "%Y-%m-%d %H:%M:%S.%6 +0000 UTC" }}
build:               CCL {{page.release_info.version}} @ {{page.release_info.build_time}} (go1.12.6)
webui:               http://localhost:8080
sql:                 postgresql://root@localhost:26257?sslmode=disable
sql (JDBC):          jdbc:postgresql://localhost:26257/defaultdb?sslmode=disable&user=root
RPC client flags:    cockroach <client cmd> --host=localhost:26257 --insecure
logs:                /Users/<username>/node1/logs
temp dir:            /Users/<username>/node1/cockroach-temp242232154
external I/O path:   /Users/<username>/node1/extern
store[0]:            path=/Users/<username>/node1
status:              initialized new cluster
clusterID:           8a681a16-9623-4fc1-a537-77e9255daafd
nodeID:              1
~~~

{{site.data.alerts.callout_success}}
These details are also written to the `INFO` log in the `/logs` directory. You can retrieve them with a command like `grep 'node starting' node1/logs/cockroach.log -A 11`.
{{site.data.alerts.end}}

Field | Description
------|------------
`build` | The version of CockroachDB you are running.
`webui` | The URL for accessing the DB Console.
`sql` | The connection URL for your client.
`RPC client flags` | The flags to use when connecting to the node via [`cockroach` client commands]({% link {{ page.version.version }}/cockroach-commands.md %}).
`logs` | The directory containing debug log data.
`temp dir` | The temporary store directory of the node.
`external I/O path` | The external IO directory with which the local file access paths are prefixed while performing [backup]({% link {{ page.version.version }}/backup.md %}) and [restore]({% link {{ page.version.version }}/restore.md %}) operations using local node directories or NFS drives.
`attrs` | If node-level attributes were specified in the `--attrs` flag, they are listed in this field. These details are potentially useful for [configuring replication zones]({% link {{ page.version.version }}/configure-replication-zones.md %}).
`locality` | If values describing the locality of the node were specified in the `--locality` field, they are listed in this field. These details are potentially useful for [configuring replication zones]({% link {{ page.version.version }}/configure-replication-zones.md %}).
`store[n]` | The directory containing store data, where `[n]` is the index of the store, e.g., `store[0]` for the first store, `store[1]` for the second store.<br><br>If store-level attributes were specified in the `attrs` field of the [`--store`](#store) flag, they are listed in this field as well. These details are potentially useful for [configuring replication zones]({% link {{ page.version.version }}/configure-replication-zones.md %}).
`status` | Whether the node is the first in the cluster (`initialized new cluster`), joined an existing cluster for the first time (`initialized new node, joined pre-existing cluster`), or rejoined an existing cluster (`restarted pre-existing node`).
`clusterID` | The ID of the cluster.<br><br>When trying to join a node to an existing cluster, if this ID is different than the ID of the existing cluster, the node has started a new cluster. This may be due to conflicting information in the node's data directory. For additional guidance, see the [troubleshooting]({% link {{ page.version.version }}/common-errors.md %}#node-belongs-to-cluster-cluster-id-but-is-attempting-to-connect-to-a-gossip-network-for-cluster-another-cluster-id) docs.
`nodeID` | The ID of the node.

## Examples

### Start a multi-node cluster

<div class="filters clearfix">
  <button style="width: 15%" class="filter-button" data-scope="secure">Secure</button>
  <button style="width: 15%" class="filter-button" data-scope="insecure">Insecure</button>
</div>

To start a multi-node cluster, run the `cockroach start` command for each node, setting the `--join` flag to the addresses of the initial nodes.

{% include {{ page.version.version }}/prod-deployment/join-flag-single-region.md %}

{{site.data.alerts.callout_info}}
{% include {{ page.version.version }}/prod-deployment/join-flag-multi-region.md %}
{{site.data.alerts.end}}

<div class="filter-content" markdown="1" data-scope="secure">

{{site.data.alerts.callout_success}}
Before starting the cluster, use [`cockroach cert`]({% link {{ page.version.version }}/cockroach-cert.md %}) to generate node and client certificates for a secure cluster connection.
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach start \
--certs-dir=certs \
--advertise-addr=<node1 address> \
--join=<node1 address>,<node2 address>,<node3 address> \
--cache=.25 \
--max-sql-memory=.25
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach start \
--certs-dir=certs \
--advertise-addr=<node2 address> \
--join=<node1 address>,<node2 address>,<node3 address> \
--cache=.25 \
--max-sql-memory=.25
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach start \
--certs-dir=certs \
--advertise-addr=<node3 address> \
--join=<node1 address>,<node2 address>,<node3 address> \
--cache=.25 \
--max-sql-memory=.25
~~~

</div>

<div class="filter-content" markdown="1" data-scope="insecure">

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach start \
--insecure \
--advertise-addr=<node1 address> \
--join=<node1 address>,<node2 address>,<node3 address> \
--cache=.25 \
--max-sql-memory=.25
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach start \
--insecure \
--advertise-addr=<node2 address> \
--join=<node1 address>,<node2 address>,<node3 address> \
--cache=.25 \
--max-sql-memory=.25
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach start \
--insecure \
--advertise-addr=<node3 address> \
--join=<node1 address>,<node2 address>,<node3 address> \
--cache=.25 \
--max-sql-memory=.25
~~~

</div>

Then run the [`cockroach init`]({% link {{ page.version.version }}/cockroach-init.md %}) command against any node to perform a one-time cluster initialization:

<div class="filter-content" markdown="1" data-scope="secure">

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach init \
--certs-dir=certs \
--host=<address of any node>
~~~

</div>

<div class="filter-content" markdown="1" data-scope="insecure">

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach init \
--insecure \
--host=<address of any node>
~~~

</div>

### Start a multi-region cluster

In this example we will start a multi-node [local cluster]({% link {{ page.version.version }}/start-a-local-cluster.md %}) with a multi-region setup that uses the same regions (passed to the [`--locality`](#locality) flag) as the [multi-region MovR demo application]({% link {{ page.version.version }}/demo-low-latency-multi-region-deployment.md %}).

1. Start a node in the `us-east1` region:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach start --locality=region=us-east1,zone=us-east-1a \
                      --insecure --store=/tmp/node0 \
                      --listen-addr=localhost:26257 \
                      --http-port=8888 \
                      --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

1. Start a node in the `us-west1` region:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach start --locality=region=us-west1,zone=us-west-1a \
                      --insecure \
                      --store=/tmp/node2 \
                      --listen-addr=localhost:26259 \
                      --http-port=8890 \
                      --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

1. Start a node in the `europe-west1` region:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach start --locality=region=europe-west1,zone=europe-west-1a \
                      --insecure \
                      --store=/tmp/node1 \
                      --listen-addr=localhost:26258 \
                      --http-port=8889 \
                      --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

1. Initialize the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach init --insecure --host=localhost --port=26257
    ~~~

1. Connect to the cluster using [`cockroach sql`]({% link {{ page.version.version }}/cockroach-sql.md %}):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --host=localhost --port=26257 --insecure
    ~~~

1. Issue the [`SHOW REGIONS`]({% link {{ page.version.version }}/show-regions.md %}) statement to verify that the list of regions is expected:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SHOW REGIONS;
    ~~~

    ~~~
        region    | zones | database_names | primary_region_of
    ---------------+-------+----------------+--------------------
      europe-west1 | {}    | {}             | {}
      us-east1     | {}    | {}             | {}
      us-west1     | {}    | {}             | {}
    (3 rows)
    ~~~

For more information about running CockroachDB multi-region, see the [Multi-region Capabilities Overview]({% link {{ page.version.version }}/multiregion-overview.md %}).

For a more advanced example showing how to run a simulated workload on a multi-region CockroachDB cluster on your local machine, see [Low Latency Reads and Writes in a Multi-Region Cluster]({% link {{ page.version.version }}/demo-low-latency-multi-region-deployment.md %}).

{{site.data.alerts.callout_info}}
For more information about the `--locality` flag, see [Locality](#locality).
{{site.data.alerts.end}}

### Start a multi-node cluster across private networks

**Scenario:**

- You have a cluster that spans GCE and AWS.
- The nodes on each cloud can reach each other on public addresses, but the private addresses aren't reachable from the other cloud.

**Approach:**

1. Start each node on GCE with `--locality` set to describe its location, `--locality-advertise-addr` set to advertise its private address to other nodes in on GCE, `--advertise-addr` set to advertise its public address to nodes on AWS, and `--join` set to the public addresses of 3-5 of the initial nodes:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --certs-dir=certs \
    --locality=cloud=gce \
    --locality-advertise-addr=cloud=gce@<private address of node> \
    --advertise-addr=<public address of node> \
    --join=<public address of node1>,<public address of node2>,<public address of node3> \
    --cache=.25 \
    --max-sql-memory=.25
    ~~~

1. Start each node on AWS with `--locality` set to describe its location, `--locality-advertise-addr` set to advertise its private address to other nodes on AWS, `--advertise-addr` set to advertise its public address to nodes on GCE, and `--join` set to the public addresses of 3-5 of the initial nodes:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --certs-dir=certs \
    --locality=cloud=aws \
    --locality-advertise-addr=cloud=aws@<private address of node> \
    --advertise-addr=<public address of node> \
    --join=<public address of node1>,<public address of node2>,<public address of node3> \
    --cache=.25 \
    --max-sql-memory=.25
    ~~~

1. Run the [`cockroach init`]({% link {{ page.version.version }}/cockroach-init.md %}) command against any node to perform a one-time cluster initialization:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach init \
    --certs-dir=certs \
    --host=<address of any node>
    ~~~

### Add a node to a cluster

<div class="filters clearfix">
  <button style="width: 15%" class="filter-button" data-scope="secure">Secure</button>
  <button style="width: 15%" class="filter-button" data-scope="insecure">Insecure</button>
</div>

To add a node to an existing cluster, run the `cockroach start` command, setting the `--join` flag to the same addresses you used when [starting the cluster](#start-a-multi-node-cluster):

<div class="filter-content" markdown="1" data-scope="secure">

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach start \
--certs-dir=certs \
--advertise-addr=<node4 address> \
--join=<node1 address>,<node2 address>,<node3 address> \
--cache=.25 \
--max-sql-memory=.25
~~~

</div>

<div class="filter-content" markdown="1" data-scope="insecure">

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach start \
--insecure \
--advertise-addr=<node4 address> \
--join=<node1 address>,<node2 address>,<node3 address> \
--cache=.25 \
--max-sql-memory=.25
~~~

</div>

### Create a table with node locality information

Start a three-node cluster with locality information specified in the `cockroach start` commands:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach start --insecure --port=26257 --http-port=26258 --store=cockroach-data/1 --cache=256MiB --locality=region=eu-west-1,cloud=aws,zone=eu-west-1a
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach start --insecure --port=26259 --http-port=26260 --store=cockroach-data/2 --cache=256MiB --join=localhost:26257 --locality=region=eu-west-1,cloud=aws,zone=eu-west-1b
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach start --insecure --port=26261 --http-port=26262 --store=cockroach-data/3 --cache=256MiB --join=localhost:26257 --locality=region=eu-west-1,cloud=aws,zone=eu-west-1c
~~~

You can use the [`crdb_internal.locality_value`]({% link {{ page.version.version }}/functions-and-operators.md %}#system-info-functions) built-in function to return the current node's locality information from inside a SQL shell. The example below uses the output of `crdb_internal.locality_value('zone')` as the `DEFAULT` value to use for the `zone` column of new rows. Other available locality keys for the running three-node cluster include `region` and `cloud`.

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE charges (
  zone STRING NOT NULL DEFAULT crdb_internal.locality_value('zone'),
  id INT PRIMARY KEY NOT NULL
);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO charges (id) VALUES (1);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM charges WHERE id = 1;
~~~

~~~
     zone    | id
+------------+----+
  eu-west-1a |  1
(1 row)
~~~

The `zone ` column has the zone of the node on which the row was created.

In a separate terminal window, open a SQL shell to a different node on the cluster:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure --port 26259
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO charges (id) VALUES (2);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM charges WHERE id = 2;
~~~

~~~
     zone    | id
+------------+----+
  eu-west-1b |  2
(1 row)
~~~

In a separate terminal window, open a SQL shell to the third node:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure --port 26261
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO charges (id) VALUES (3);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM charges WHERE id = 3;
~~~

~~~
     zone    | id
+------------+----+
  eu-west-1c |  3
(1 row)
~~~

### Start a cluster with separate RPC and SQL networks

Separating the network addresses used for intra-cluster RPC traffic and application SQL connections can provide an additional level of protection against security issues as a form of [defense in depth](https://wikipedia.org/wiki/Defense_in_depth_(computing)). This separation is accomplished with a combination of the [`--sql-addr` flag](#networking) and firewall rules or other network-level access control (which must be maintained outside of CockroachDB).

For example, suppose you want to use port `26257` for SQL connections and `26258` for intra-cluster traffic. Set up firewall rules so that the CockroachDB nodes can reach each other on port `26258`, but other machines cannot. Start the CockroachDB processes as follows:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach start --sql-addr=:26257 --listen-addr=:26258 --join=node1:26258,node2:26258,node3:26258 --certs-dir=~/cockroach-certs
~~~

Note the use of port `26258` (the value for `listen-addr`, not `sql-addr`) in the `--join` flag. Also, if your environment requires the use of the `--advertise-addr` flag, you should probably also use the `--advertise-sql-addr` flag when using a separate SQL address.

Clusters using this configuration with client certificate authentication may also wish to use [split client CA certificates]({% link {{ page.version.version }}/create-security-certificates-custom-ca.md %}#split-ca-certificates).

## See also

- [Initialize a Cluster]({% link {{ page.version.version }}/cockroach-init.md %})
- [Manual Deployment]({% link {{ page.version.version }}/manual-deployment.md %})
- [Kubernetes Overview]({% link {{ page.version.version }}/kubernetes-overview.md %})
- [Local Deployment]({% link {{ page.version.version }}/start-a-local-cluster.md %})
- [`cockroach` Commands Overview]({% link {{ page.version.version }}/cockroach-commands.md %})
