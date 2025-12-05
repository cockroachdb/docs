---
title: cockroach start-single-node
summary: The cockroach start-single-node command starts a single-node cluster with replication disabled.
toc: true
docs_area: reference.cli
---

This page explains the `cockroach start-single-node` [command]({% link {{ page.version.version }}/cockroach-commands.md %}), which you use to start a single-node cluster with replication disabled. A single-node cluster is appropriate for quick SQL testing or app development.

{{site.data.alerts.callout_danger}}
A single-node cluster is not appropriate for use in production or for performance testing. To run a multi-node cluster with replicated data for availability, consistency and resiliency, including load balancing across multiple nodes, use [`cockroach start`]({% link {{ page.version.version }}/cockroach-start.md %}) and [`cockroach init`]({% link {{ page.version.version }}/cockroach-init.md %}) to start a multi-node cluster with a minimum of three nodes instead.
{{site.data.alerts.end}}

## Synopsis

Start a single-node cluster:

~~~ shell
$ cockroach start-single-node <flags>
~~~

View help:

~~~ shell
$ cockroach start-single-node --help
~~~

## Flags

The `cockroach start-single-node` command supports the following [general-use](#general), [networking](#networking), [security](#security), and [logging](#logging) flags.

Many flags have useful defaults that can be overridden by specifying the flags explicitly. If you specify flags explicitly, however, be sure to do so each time the node is restarted, as they will not be remembered.

{{site.data.alerts.callout_info}}
The `cockroach start-single-node` flags are identical to [`cockroach start`]({% link {{ page.version.version }}/cockroach-start.md %}#flags) flags. However, many of them are not relevant for single-node clusters but are provided for users who want to test concepts that appear in multi-node clusters. These flags are called out as such. In most cases, accepting most defaults is sufficient (see the [examples](#examples) below).
{{site.data.alerts.end}}

### General

Flag | Description
-----|-----------
`--attrs` | **Not relevant for single-node clusters.** Arbitrary strings, separated by colons, specifying node capability, which might include specialized hardware or number of cores, for example:<br><br>`--attrs=ram:64gb`<br><br>These can be used to influence the location of data replicas. See [Replication Controls]({% link {{ page.version.version }}/configure-replication-zones.md %}#replication-constraints) for full details.
`--background` | Runs the node in the background. Control is returned to the shell only once the node is ready to accept requests, so this is recommended over appending `&` to the command. This flag is **not** available in Windows environments.<br><br>**Note:** `--background` is suitable for writing automated test suites or maintenance procedures that need a temporary server process running in the background. It is not intended to be used to start a long-running server, because it does not fully detach from the controlling terminal. Consider using a service manager or a tool like [daemon(8)](https://www.freebsd.org/cgi/man.cgi?query=daemon&sektion=8) instead. If you use `--background`, using `--pid-file` is also recommended. To gracefully stop the `cockroach` process, ssend the `SIGTERM` signal to the process ID in the PID file. To gracefully restart the process, send the `SIGHUP` signal.
`--cache` | The total size for the [Pebble storage engine]({% link {{ page.version.version }}/architecture/storage-layer.md %}#pebble) block cache, shared evenly if there are multiple storage devices. This can be a percentage (notated as a decimal or with `%`) or any bytes-based unit, for example: <br><br>`--cache=.25`<br>`--cache=25%`<br>`--cache=1000000000 ----> 1000000000 bytes`<br>`--cache=1GB ----> 1000000000 bytes`<br>`--cache=1GiB ----> 1073741824 bytes` <br><br><strong>Note:</strong> If you use the `%` notation, you might need to escape the `%` sign when configuring CockroachDB through `systemd` service files. For this reason, it's recommended to use the decimal notation instead.<br><br>**Note:** The sum of `--cache`, `--max-sql-memory`, and `--max-tsdb-memory` should not exceed 75% of the memory available to the `cockroach` process.<br><br>**Default:** `256 MiB`<br><br>The default cache size is reasonable for local development clusters. For production deployments, set this to 25% or higher. Increasing the cache size generally improves the node's read performance.<br><br>The block cache holds uncompressed blocks of persisted [key-value data]({% link {{ page.version.version }}/architecture/distribution-layer.md %}#overview) in memory. If a read misses within the block cache, the storage engine reads the file via the operating system's page cache, which may hold the relevant block in-memory in its compressed form. Otherwise, the read is served from the storage device. The block cache fills to the configured size and is then recycled using a least-recently-used (LRU) policy.<br><br>Refer to [Recommended Production Settings]({% link {{ page.version.version }}/recommended-production-settings.md %}#cache-and-sql-memory-size) for more details. Production systems should always configure this setting.
`--external-io-dir` | The path of the external IO directory with which the local file access paths are prefixed while performing backup and restore operations using local node directories or NFS drives. If set to `disabled`, backups and restores using local node directories and NFS drives are disabled.<br><br>**Default:** `extern` subdirectory of the first configured [`store`](#store).<br><br>To set the `--external-io-dir` flag to the locations you want to use without needing to restart nodes, create symlinks to the desired locations from within the `extern` directory.
`--listening-url-file` | The file to which the node's SQL connection URL will be written on successful startup, in addition to being printed to the [standard output](#standard-output).<br><br>This is particularly helpful in identifying the node's port when an unused port is assigned automatically (`--port=0`).
`--locality` | **Not relevant for single-node clusters.** Arbitrary key-value pairs that describe the location of the node. Locality might include country, region, datacenter, rack, etc. For more details, see [Locality]({% link {{ page.version.version }}/cockroach-start.md %}#locality) below.
`--locality-file` | A file that contains arbitrary key-value pairs that describe the location of the node, as an alternative to the `--locality` flag.
`--max-disk-temp-storage` | The maximum on-disk storage capacity available to store temporary data for SQL queries that exceed the memory budget (see `--max-sql-memory`). This ensures that JOINs, sorts, and other memory-intensive SQL operations are able to spill intermediate results to disk. This can be a percentage (notated as a decimal or with `%`) or any bytes-based unit (e.g., `.25`, `25%`, `500GB`, `1TB`, `1TiB`).<br><br><strong>Note:</strong> If you use the `%` notation, you might need to escape the `%` sign, for instance, while configuring CockroachDB through `systemd` service files. For this reason, it's recommended to use the decimal notation instead. Also, if expressed as a percentage, this value is interpreted relative to the size of the first store. However, the temporary space usage is never counted towards any store usage; therefore, when setting this value, it's important to ensure that the size of this temporary storage plus the size of the first store doesn't exceed the capacity of the storage device.<br><br>The temporary files are located in the path specified by the `--temp-dir` flag, or in the subdirectory of the first store (see `--store`) by default.<br><br>**Default:** `32GiB`
`--max-go-memory` | The maximum soft memory limit for the Go runtime, which influences the behavior of Go's garbage collection. Defaults to `--max-sql-memory x 2.25`, but cannot exceed 90% of the node's available RAM. To disable the soft memory limit, set `--max-go-memory` to `0` (not recommended).
`--max-sql-memory` | The maximum in-memory storage capacity available to store temporary data for SQL queries, including prepared queries and intermediate data rows during query execution. This can be a percentage (notated as a decimal or with `%`) or any bytes-based unit; for example:<br><br>`--max-sql-memory=.25`<br>`--max-sql-memory=25%`<br>`--max-sql-memory=10000000000 ----> 1000000000 bytes`<br>`--max-sql-memory=1GB ----> 1000000000 bytes`<br>`--max-sql-memory=1GiB ----> 1073741824 bytes`<br><br>The temporary files are located in the path specified by the `--temp-dir` flag, or in the subdirectory of the first store (see `--store`) by default.<br><br>**Note:** If you use the `%` notation, you might need to escape the `%` sign (for instance, while configuring CockroachDB through `systemd` service files). For this reason, it's recommended to use the decimal notation instead.<br><br>**Note:** The sum of `--cache`, `--max-sql-memory`, and `--max-tsdb-memory` should not exceed 75% of the memory available to the `cockroach` process.<br><br>**Default:** `25%` <br><br>The default SQL memory size is suitable for production deployments but can be raised to increase the number of simultaneous client connections the node allows as well as the node's capacity for in-memory processing of rows when using `ORDER BY`, `GROUP BY`, `DISTINCT`, joins, and window functions. For local development clusters with memory-intensive workloads, reduce this value to, for example, `128MiB` to prevent [out-of-memory errors]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#out-of-memory-oom-crash).
`--max-tsdb-memory` | Maximum memory capacity available to store temporary data for use by the time-series database to display metrics in the [DB Console]({% link {{ page.version.version }}/ui-overview.md %}). Consider raising this value if your cluster is comprised of a large number of nodes where individual nodes have very limited memory available (e.g., under `8 GiB`). Insufficient memory capacity for the time-series database can constrain the ability of the DB Console to process the time-series queries used to render metrics for the entire cluster. This capacity constraint does not affect SQL query execution. This flag accepts numbers interpreted as bytes, size suffixes (e.g., `1GB` and `1GiB`) or a percentage of physical memory (e.g., `0.01`).<br><br>**Note:** The sum of `--cache`, `--max-sql-memory`, and `--max-tsdb-memory` should not exceed 75% of the memory available to the `cockroach` process.<br><br>**Default:** `0.01` (i.e., 1%) of physical memory or `64 MiB`, whichever is greater.
`--pid-file` | The file to which the node's process ID will be written on successful startup. When this flag is not set, the process ID is not written to file.
`--store`<br>`-s` | The file path to a storage device and, optionally, store attributes and maximum size. When using multiple storage devices for a node, this flag must be specified separately for each device, for example: <br><br>`--store=/mnt/ssd01 --store=/mnt/ssd02` <br><br>For more details, see [Store](#store) below.
`--temp-dir` | The path of the node's temporary store directory. On node start up, the location for the temporary files is printed to the standard output. <br><br>**Default:** Subdirectory of the first [store](#store)

### Networking

Flag | Description
-----|-----------
`--listen-addr` | The IP address/hostname and port to listen on for connections from clients. For IPv6, use the notation `[...]`, e.g., `[::1]` or `[fe80::f6f2:::]`.<br><br>**Default:** Listen on all IP addresses on port `26257`
`--http-addr` | The IP address/hostname and port to listen on for DB Console HTTP requests. For IPv6, use the notation `[...]`, e.g., `[::1]:8080` or `[fe80::f6f2:::]:8080`.<br><br>**Default:** Listen on the address part of `--listen-addr` on port `8080`
`--socket-dir` |  The directory path on which to listen for [Unix domain socket](https://wikipedia.org/wiki/Unix_domain_socket) connections from clients installed on the same Unix-based machine. For an example, see [Connect to a cluster listening for Unix domain socket connections]({% link {{ page.version.version }}/cockroach-sql.md %}#connect-to-a-cluster-listening-for-unix-domain-socket-connections).

### Security

Flag | Description
-----|-----------
`--certs-dir` | The path to the [certificate directory]({% link {{ page.version.version }}/cockroach-cert.md %}). The directory must contain valid certificates if running in secure mode.<br><br>**Default:** `${HOME}/.cockroach-certs/`
`--insecure` | **Note:** The `--insecure` flag is intended for **non-production testing only**.<br><br>Run in insecure mode, skipping all TLS encryption and authentication. If this flag is not set, the `--certs-dir` flag must point to valid certificates.<br><br>**Note the following risks:** An insecure cluster is open to any client that can access any node's IP addresses; client connections must also be made insecurely; any user, even `root`, can log in without providing a password; any user, connecting as `root`, can read or write any data in your cluster; there is no network encryption or authentication, and thus no confidentiality.<br><br>**Default:** `false`
`--accept-sql-without-tls` | This flag (in [preview]({% link {{ page.version.version }}/cockroachdb-feature-availability.md %})) allows you to connect to the cluster using a SQL user's password without [validating the client's certificate]({% link {{ page.version.version }}/authentication.md %}#client-authentication). When connecting using the built-in SQL client, [use the `--insecure` flag with the `cockroach sql` command]({% link {{ page.version.version }}/cockroach-sql.md %}#client-connection).
`--cert-principal-map` |  A comma-separated list of `cert-principal:db-principal` mappings used to map the certificate principals to IP addresses, DNS names, and SQL users. This allows the use of certificates generated by Certificate Authorities that place restrictions on the contents of the `commonName` field. For usage information, see [Create Security Certificates using Openssl]({% link {{ page.version.version }}/create-security-certificates-openssl.md %}#examples).
`--enterprise-encryption` | This optional flag specifies the encryption options for one of the stores on the node. If multiple stores exist, the flag must be specified for each store. <br /><br /> This flag takes a number of options.  For a complete list of options, and usage instructions, see [Encryption at Rest]({% link {{ page.version.version }}/encryption.md %}).

### Store

The `--store` flag supports the following fields. Note that commas are used to separate fields, and so are forbidden in all field values.

{{site.data.alerts.callout_info}}
In-memory storage is not suitable for production deployments at this time.
{{site.data.alerts.end}}

Field | Description
------|------------
`type` | For in-memory storage, set this field to `mem`; otherwise, leave this field out. The `path` field must not be set when `type=mem`.
`path` | The file path to the storage device. When not setting `attr`, `size`, or `ballast-size`, the `path` field label can be left out: <br><br>`--store=/mnt/ssd01` <br><br>When either of those fields are set, however, the `path` field label must be used: <br><br>`--store=path=/mnt/ssd01,size=20GB` <br><br> **Default:** `cockroach-data`
`attrs` | Arbitrary strings, separated by colons, specifying disk type or capability. These can be used to influence the location of data replicas. See [Replication Controls]({% link {{ page.version.version }}/configure-replication-zones.md %}#replication-constraints) for full details.<br><br>In most cases, node-level `--locality` or `--attrs` are preferable to store-level attributes, but this field can be used to match capabilities for storage of individual databases or tables. For example, an OLTP database would probably want to allocate space for its tables only on solid state devices, whereas append-only time series might prefer cheaper spinning drives. Typical attributes include whether the store is flash (`ssd`) or spinny disk (`hdd`), as well as speeds and other specs, for example:<br><br> `--store=path=/mnt/hda1,attrs=hdd:7200rpm`
<a name="store-size"></a> `size` | The maximum size allocated to the node. When this size is reached, CockroachDB attempts to rebalance data to other nodes with available capacity. When no other nodes have available capacity, this limit will be exceeded. Data may also be written to the node faster than the cluster can rebalance it away; as long as capacity is available elsewhere, CockroachDB will gradually rebalance data down to the store limit.<br><br> The `size` can be specified either in a bytes-based unit or as a percentage of hard drive space (notated as a decimal or with `%`), for example: <br><br>`--store=path=/mnt/ssd01,size=10000000000 ----> 10000000000 bytes`<br>`--store=path=/mnt/ssd01,size=20GB ----> 20000000000 bytes`<br>`--store=path=/mnt/ssd01,size=20GiB ----> 21474836480 bytes`<br>`--store=path=/mnt/ssd01,size=0.02TiB ----> 21474836480 bytes`<br>`--store=path=/mnt/ssd01,size=20% ----> 20% of available space`<br>`--store=path=/mnt/ssd01,size=0.2 ----> 20% of available space`<br>`--store=path=/mnt/ssd01,size=.2 ----> 20% of available space`<br><br>**Default:** 100%<br><br>For an in-memory store, the `size` field is required and must be set to the true maximum bytes or percentage of available memory, for example:<br><br>`--store=type=mem,size=20GB`<br>`--store=type=mem,size=90%`<br><br><strong>Note:</strong> If you use the `%` notation, you might need to escape the `%` sign, for instance, while configuring CockroachDB through `systemd` service files. For this reason, it's recommended to use the decimal notation instead.
<a name="fields-ballast-size"></a> `ballast-size` | Configure the size of the automatically created emergency ballast file. Accepts the same value formats as the [`size` field](#store-size). For more details, see [Automatic ballast files]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#automatic-ballast-files).<br><br>To disable automatic ballast file creation, set the value to `0`:<br><br>`--store=path=/mnt/ssd01,ballast-size=0`

### Logging

By default, `cockroach start-single-node` writes all messages to log files, and prints nothing to `stderr`. This includes events with `INFO` [severity]({% link {{ page.version.version }}/logging.md %}#logging-levels-severities) and higher. However, you can [customize the logging behavior]({% link {{ page.version.version }}/configure-logs.md %}) of this command by using the `--log` flag:

{% include {{ page.version.version }}/misc/logging-flags.md %}

#### Defaults

See the [default logging configuration]({% link {{ page.version.version }}/configure-logs.md %}#default-logging-configuration).

## Docker-specific features of single-node clusters

When you use the `cockroach start-single-node` command to start a single-node cluster with Docker, some additional features are available to help with testing and development. Refer to [Start a local cluster in Docker (Linux)]({% link {{ page.version.version }}/start-a-local-cluster-in-docker-linux.md %}) and [Start a local cluster in Docker (macOS)]({% link {{ page.version.version }}/start-a-local-cluster-in-docker-mac.md %}).

## Standard output

When you run `cockroach start-single-node`, some helpful details are printed to the standard output:

~~~ shell
CockroachDB node starting at {{ now | date: "%Y-%m-%d %H:%M:%S.%6 +0000 UTC" }}
build:               CCL {{page.release_info.version}} @ {{ site.data.releases | where_exp: "release", "release.major_version == page.version.version" | where_exp: "release", "release.withdrawn != true" | sort: "release_date" | last | map: "release_date" | date: "%Y/%m/%d 12:34:56" }} {{ site.data.releases | where_exp: "release", "release.major_version == page.version.version" | where_exp: "release", "release.withdrawn != true" | sort: "release_date" | last | map: "go_version" }}
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

### Start a single-node cluster

<section class="filters clearfix">
  <button style="width: 15%" class="filter-button" data-scope="secure">Secure</button>
  <button style="width: 15%" class="filter-button" data-scope="insecure">Insecure</button>
</section>

<section class="filter-content" markdown="1" data-scope="secure">
1. Create two directories for certificates:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ mkdir certs my-safe-directory
    ~~~

    Directory | Description
    ----------|------------
    `certs` | You'll generate your CA certificate and all node and client certificates and keys in this directory.
    `my-safe-directory` | You'll generate your CA key in this directory and then reference the key when generating node and client certificates.

1. Create the CA (Certificate Authority) certificate and key pair:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-ca \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

1. Create the certificate and key pair for the node:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-node \
    localhost \
    $(hostname) \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

1. Create a client certificate and key pair for the `root` user:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-client \
    root \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

1. Start the single-node cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start-single-node \
    --certs-dir=certs \
    --listen-addr=localhost:26257 \
    --http-addr=localhost:8080
    ~~~
</section>

<section class="filter-content" markdown="1" data-scope="insecure">
<p></p>
{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach start-single-node \
--insecure \
--listen-addr=localhost:26257 \
--http-addr=localhost:8080
~~~
</section>

### Scale to multiple nodes

Scaling a cluster started with `cockroach start-single-node` involves restarting the first node with the `cockroach start` command instead, and then adding new nodes with that command as well, all using a `--join` flag that forms them into a single multi-node cluster. Since replication is disabled in clusters started with `start-single-node`, you also need to enable replication to get CockroachDB's availability and consistency guarantees.

<section class="filters clearfix">
  <button style="width: 15%" class="filter-button" data-scope="secure">Secure</button>
  <button style="width: 15%" class="filter-button" data-scope="insecure">Insecure</button>
</section>

<section class="filter-content" markdown="1" data-scope="secure">
1. Stop the single-node cluster:

    Get the process ID of the node:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ps -ef | grep cockroach | grep -v grep
    ~~~

    ~~~
      501 19584     1   0  6:13PM ttys001    0:01.27 cockroach start-single-node --certs-dir=certs --listen-addr=localhost:26257 --http-addr=localhost:8080
    ~~~

    Gracefully shut down the node, specifying its process ID:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kill -TERM 19584
    ~~~

    ~~~
    initiating graceful shutdown of server
	server drained and shutdown completed
	~~~

1. Restart the node with the [`cockroach start`]({% link {{ page.version.version }}/cockroach-start.md %}) command:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --certs-dir=certs \
    --listen-addr=localhost:26257 \
    --http-addr=localhost:8080 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

    The new flag to note is `--join`, which specifies the addresses and ports of the nodes that will initially comprise your cluster. You'll use this exact `--join` flag when starting other nodes as well.

    {% include {{ page.version.version }}/prod-deployment/join-flag-single-region.md %}

1. In new terminal windows, add two more nodes:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --certs-dir=certs \
    --store=node2 \
    --listen-addr=localhost:26258 \
    --http-addr=localhost:8081 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --certs-dir=certs \
    --store=node3 \
    --listen-addr=localhost:26259 \
    --http-addr=localhost:8082 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

    These commands are the same as before but with unique `--store`, `--listen-addr`, and `--http-addr` flags, since this all nodes are running on the same machine. Also, since all nodes use the same hostname (`localhost`), you can use the first node's certificate. Note that this is different than running a production cluster, where you would need to generate a certificate and key for each node, issued to all common names and IP addresses you might use to refer to the node as well as to any load balancer instances.

1. Open the [built-in SQL shell]({% link {{ page.version.version }}/cockroach-sql.md %}):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --certs-dir=certs --host=localhost:26257
    ~~~

1. Update preconfigured [replication zones]({% link {{ page.version.version }}/configure-replication-zones.md %}) to replicate user data 3 times and import internal data 5 times:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER RANGE default CONFIGURE ZONE USING num_replicas = 3;
    ALTER DATABASE system CONFIGURE ZONE USING num_replicas = 5;
    ALTER RANGE meta CONFIGURE ZONE USING num_replicas = 5;
    ALTER RANGE system CONFIGURE ZONE USING num_replicas = 5;
    ALTER RANGE liveness CONFIGURE ZONE USING num_replicas = 5;
    ALTER TABLE system.public.replication_constraint_stats CONFIGURE ZONE DISCARD;
    ALTER TABLE system.public.replication_constraint_stats CONFIGURE ZONE USING gc.ttlseconds = 600, constraints = '[]', lease_preferences = '[]';
    ALTER TABLE system.public.replication_stats CONFIGURE ZONE DISCARD;
    ALTER TABLE system.public.replication_stats CONFIGURE ZONE USING gc.ttlseconds = 600, constraints = '[]', lease_preferences = '[]';
    ~~~

</section>

<section class="filter-content" markdown="1" data-scope="insecure">
1. Stop the single-node cluster:

    Get the process ID of the node:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ps -ef | grep cockroach | grep -v grep
    ~~~

    ~~~
      501 19584     1   0  6:13PM ttys001    0:01.27 cockroach start-single-node --insecure --listen-addr=localhost:26257 --http-addr=localhost:8080
    ~~~

    Gracefully shut down the node, specifying its process ID:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kill -TERM 19584
    ~~~

    ~~~
    initiating graceful shutdown of server
	server drained and shutdown completed
	~~~

1. Restart the node with the [`cockroach start`]({% link {{ page.version.version }}/cockroach-start.md %}) command:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --listen-addr=localhost:26257 \
    --http-addr=localhost:8080 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

    The new flag to note is `--join`, which specifies the addresses and ports of the nodes that will comprise your cluster. You'll use this exact `--join` flag when starting other nodes as well.

1. In new terminal windows, add two more nodes:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --store=node2 \
    --listen-addr=localhost:26258 \
    --http-addr=localhost:8081 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --store=node3 \
    --listen-addr=localhost:26259 \
    --http-addr=localhost:8082 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

    These commands are the same as before but with unique `--store`, `--listen-addr`, and `--http-addr` flags, since this all nodes are running on the same machine.

1. Open the [built-in SQL shell]({% link {{ page.version.version }}/cockroach-sql.md %}):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --insecure --host=localhost:26257
    ~~~

1. Update preconfigured [replication zones]({% link {{ page.version.version }}/configure-replication-zones.md %}) to replicate user data 3 times and import internal data 5 times:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER RANGE default CONFIGURE ZONE USING num_replicas = 3;
    ALTER DATABASE system CONFIGURE ZONE USING num_replicas = 5;
    ALTER RANGE meta CONFIGURE ZONE USING num_replicas = 5;
    ALTER RANGE system CONFIGURE ZONE USING num_replicas = 5;
    ALTER RANGE liveness CONFIGURE ZONE USING num_replicas = 5;
    ALTER TABLE system.public.replication_constraint_stats CONFIGURE ZONE DISCARD;
    ALTER TABLE system.public.replication_constraint_stats CONFIGURE ZONE USING gc.ttlseconds = 600, constraints = '[]', lease_preferences = '[]';
    ALTER TABLE system.public.replication_stats CONFIGURE ZONE DISCARD;
    ALTER TABLE system.public.replication_stats CONFIGURE ZONE USING gc.ttlseconds = 600, constraints = '[]', lease_preferences = '[]';
    ALTER TABLE system.public.tenant_usage CONFIGURE ZONE DISCARD;
ALTER TABLE system.public.tenant_usage CONFIGURE ZONE USING gc.ttlseconds = 7200, constraints = '[]', lease_preferences = '[]';
    ~~~

</section>

## See also

- Running a local multi-node cluster:
    - [From Binary]({% link {{ page.version.version }}/start-a-local-cluster.md %})
    - [In Kubernetes]({% link {{ page.version.version }}/orchestrate-a-local-cluster-with-kubernetes.md %})
    - [In Docker]({% link {{ page.version.version }}/start-a-local-cluster-in-docker-mac.md %})
- Running a distributed multi-node cluster:
    - [From Binary]({% link {{ page.version.version }}/manual-deployment.md %})
    - [In Kubernetes]({% link {{ page.version.version }}/deploy-cockroachdb-with-kubernetes.md %})
- [`cockroach` Commands Overview]({% link {{ page.version.version }}/cockroach-commands.md %})
