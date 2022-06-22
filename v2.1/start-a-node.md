---
title: Start a Node
summary: To start a new CockroachDB cluster, or add a node to an existing cluster, run the cockroach start command.
toc: true
---

This page explains the `cockroach start` [command](cockroach-commands.html), which you use to start nodes as a new cluster or add nodes to an existing cluster. For a full walk-through of the cluster startup and initialization process, see one of the [Manual Deployment](manual-deployment.html) tutorials.

{{site.data.alerts.callout_info}}
Node-level settings are defined by flags passed to the `cockroach start` command and cannot be changed without stopping and restarting the node. In contrast, some cluster-wide settings are defined via SQL statements and can be updated anytime after a cluster has been started. For more details, see [Cluster Settings](cluster-settings.html).
{{site.data.alerts.end}}

## Synopsis

~~~ shell
# Start a single-node cluster:
$ cockroach start <flags, excluding --join>

# Start a multi-node cluster:
$ cockroach start <flags, including --join> &
$ cockroach init <flags>

# Add a node to a cluster:
$ cockroach start <flags, including --join>

# View help:
$ cockroach start --help
~~~

## Flags

The `start` command supports the following [general-use](#general), [networking](#networking), [security](#security), and [logging](#logging) flags. All flags must be specified each time the
node is started, as they will not be remembered, with the exception of the `--join` flag. Nevertheless, we recommend specifying _all_ flags every time, including the `--join` flag, as that will
allow restarted nodes to join the cluster even if their data directory was destroyed.

{{site.data.alerts.callout_success}}
When adding a node to an existing cluster, include the `--join` flag.
{{site.data.alerts.end}}

### General

Flag | Description
-----|-----------
`--attrs` | Arbitrary strings, separated by colons, specifying node capability, which might include specialized hardware or number of cores, for example:<br><br>`--attrs=ram:64gb`<br><br>These can be used to influence the location of data replicas. See [Configure Replication Zones](configure-replication-zones.html#replication-constraints) for full details.
`--background` | Set this to start the node in the background. This is better than appending `&` to the command because control is returned to the shell only once the node is ready to accept requests. <br /><br /> **Note:** `--background` is suitable for writing automated test suites or maintenance procedures that need a temporary server process running in the background. It is not intended to be used to start a long-running server, because it does not fully detach from the controlling terminal.  Consider using a service manager or a tool like [daemon(8)](https://www.freebsd.org/cgi/man.cgi?query=daemon&sektion=8) instead.
`--cache` | The total size for caches, shared evenly if there are multiple storage devices. This can be a percentage (notated as a decimal or with `%`) or any bytes-based unit, for example: <br><br>`--cache=.25`<br>`--cache=25%`<br>`--cache=1000000000 ----> 1000000000 bytes`<br>`--cache=1GB ----> 1000000000 bytes`<br>`--cache=1GiB ----> 1073741824 bytes` <br><br><strong>Note:</strong> If you use the `%` notation, you might need to escape the `%` sign, for instance, while configuring CockroachDB through `systemd` service files. For this reason, it's recommended to use the decimal notation instead.<br><br>**Default:** `128MiB`<br><br>The default cache size is reasonable for local development clusters. For production deployments, this should be increased to 25% or higher. See [Recommended Production Settings](recommended-production-settings.html#cache-and-sql-memory-size) for more details.
`--external-io-dir` | The path of the external IO directory with which the local file access paths are prefixed while performing backup and restore operations using local node directories or NFS drives. If set to `disabled`, backups and restores using local node directories and NFS drives are disabled.<br><br>**Default:** `extern` subdirectory of the first configured [`store`](#store).<br><br>To set the `--external-io-dir` flag to the locations you want to use without needing to restart nodes, create symlinks to the desired locations from within the `extern` directory.
`--listening-url-file` | The file to which the node's SQL connection URL will be written on successful startup, in addition to being printed to the [standard output](#standard-output).<br><br>This is particularly helpful in identifying the node's port when an unused port is assigned automatically (`--port=0`).
`--locality` | Arbitrary key-value pairs that describe the location of the node. Locality might include country, region, datacenter, rack, etc. For more details, see [Locality](#locality) below.
`--max-disk-temp-storage` | The maximum on-disk storage capacity available to store temporary data for SQL queries that exceed the memory budget (see `--max-sql-memory`). This ensures that JOINs, sorts, and other memory-intensive SQL operations are able to spill intermediate results to disk. This can be a percentage (notated as a decimal or with `%`) or any bytes-based unit (e.g., `.25`, `25%`, `500GB`, `1TB`, `1TiB`).<br><br><strong>Note:</strong> If you use the `%` notation, you might need to escape the `%` sign, for instance, while configuring CockroachDB through `systemd` service files. For this reason, it's recommended to use the decimal notation instead. Also, if expressed as a percentage, this value is interpreted relative to the size of the first store. However, the temporary space usage is never counted towards any store usage; therefore, when setting this value, it's important to ensure that the size of this temporary storage plus the size of the first store doesn't exceed the capacity of the storage device.<br><br>The temporary files are located in the path specified by the `--temp-dir` flag, or in the subdirectory of the first store (see `--store`) by default.<br><br>**Default:** `32GiB`
`--max-offset` | The maximum allowed clock offset for the cluster. If observed clock offsets exceed this limit, servers will crash to minimize the likelihood of reading inconsistent data. Increasing this value will increase the time to recovery of failures as well as the frequency of uncertainty-based read restarts.<br><br>Note that this value must be the same on all nodes in the cluster and cannot be changed with a [rolling upgrade](upgrade-cockroach-version.html). In order to change it, first stop every node in the cluster. Then once the entire cluster is offline, restart each node with the new value.<br><br>**Default:** `500ms`
`--max-sql-memory` | The maximum in-memory storage capacity available to store temporary data for SQL queries, including prepared queries and intermediate data rows during query execution. This can be a percentage (notated as a decimal or with `%`) or any bytes-based unit, for example:<br><br>`--max-sql-memory=.25`<br>`--max-sql-memory=25%`<br>`--max-sql-memory=10000000000 ----> 1000000000 bytes`<br>`--max-sql-memory=1GB ----> 1000000000 bytes`<br>`--max-sql-memory=1GiB ----> 1073741824 bytes`<br><br>The temporary files are located in the path specified by the `--temp-dir` flag, or in the subdirectory of the first store (see `--store`) by default.<br><br><strong>Note:</strong> If you use the `%` notation, you might need to escape the `%` sign, for instance, while configuring CockroachDB through `systemd` service files. For this reason, it's recommended to use the decimal notation instead.<br><br>**Default:** `128MiB`<br><br>The default SQL memory size is reasonable for local development clusters. For production deployments, this should be increased to 25% or higher. See [Recommended Production Settings](recommended-production-settings.html#cache-and-sql-memory-size) for more details.
`--pid-file` | The file to which the node's process ID will be written on successful startup. When this flag is not set, the process ID is not written to file.
`--store`<br>`-s` | The file path to a storage device and, optionally, store attributes and maximum size. When using multiple storage devices for a node, this flag must be specified separately for each device, for example: <br><br>`--store=/mnt/ssd01 --store=/mnt/ssd02` <br><br>For more details, see [Store](#store) below.
`--temp-dir` | The path of the node's temporary store directory. On node start up, the location for the temporary files is printed to the standard output. <br><br>**Default:** Subdirectory of the first [store](#store)

### Networking

Flag | Description
-----|-----------
`--advertise-addr` | The IP address/hostname and port to tell other nodes to use. If using a hostname, it must be resolvable from all nodes. If using an IP address, it must be routable from all nodes; for IPv6, use the notation `[...]`, e.g., `[::1]` or `[fe80::f6f2:::]`.<br><br>This flag's effect depends on how it is used in combination with `--listen-addr`. For example, if the port number is different than the one used in `--listen-addr`, port forwarding is required. For more details, see [Networking](recommended-production-settings.html#networking).<br><br>**Default:** The value of `--listen-addr`; if `--listen-addr` is not specified, advertises the node's canonical hostname and port `26257`
`--listen-addr` | The IP address/hostname and port to listen on for connections from other nodes and clients. For IPv6, use the notation `[...]`, e.g., `[::1]` or `[fe80::f6f2:::]`.<br><br>This flag's effect depends on how it is used in combination with `--advertise-addr`. For example, the node will also advertise itself to other nodes using this value if `--advertise-addr` is not specified. For more details, see [Networking](recommended-production-settings.html#networking).<br><br>**Default:** Listen on all IP addresses on port `26257`; if `--advertise-addr` is not specified, also advertise the node's canonical hostname to other nodes
`--http-addr` | The IP address/hostname and port to listen on for Admin UI HTTP requests. For IPv6, use the notation `[...]`, e.g., `[::1]:8080` or `[fe80::f6f2:::]:8080`.<br><br>**Default:** Listen on the address part of `--listen-addr` on port `8080`
`--locality-advertise-addr` | <span class="version-tag">New in v2.1:</span> The IP address/hostname and port to tell other nodes in specific localities to use. This flag is useful when running a cluster across multiple networks, where nodes in a given network have access to a private or local interface while nodes outside the network do not. In this case, you can use `--locality-advertise-addr` to tell nodes within the same network to prefer the private or local address to improve performance and use `--advertise-addr` to tell nodes outside the network to use another address that is reachable from them.<br><br>This flag relies on nodes being started with the [`--locality`](#locality) flag and uses the `locality@address` notation, for example:<br><br>`--locality-advertise-addr=region=us-west@10.0.0.0:26257`<br><br>See the [example](#start-a-multi-node-cluster-across-private-networks) below for more details.
`--join`<br>`-j` | The addresses for connecting the node to a cluster.<br><br>When starting a multi-node cluster for the first time, set this flag to the addresses of 3-5 of the initial nodes. Then run the [`cockroach init`](initialize-a-cluster.html) command against any of the nodes to complete cluster startup. See the [example](#start-a-multi-node-cluster) below for more details. <br><br>When starting a singe-node cluster, leave this flag out. This will cause the node to initialize a new single-node cluster without needing to run the `cockroach init` command. See the [example](#start-a-single-node-cluster) below for more details.<br><br>When adding a node to an existing cluster, set this flag to 3-5 of the nodes already in the cluster; it's easiest to use the same list of addresses that was used to start the initial nodes.
`--advertise-host` | **Deprecated.** Use `--advertise-addr` instead.
`--host` | **Deprecated.** Use `--listen-addr` instead.
`--port`<br>`-p` | **Deprecated.** Specify port in `--advertise-addr` and/or `--listen-addr` instead.
`--http-host` | **Deprecated.** Use `--http-addr` instead.
`--http-port` | **Deprecated.** Specify port in `--http-addr` instead.

### Security

Flag | Description
-----|-----------
`--certs-dir` | The path to the [certificate directory](create-security-certificates.html). The directory must contain valid certificates if running in secure mode.<br><br>**Default:** `${HOME}/.cockroach-certs/`
`--insecure` | Run in insecure mode. If this flag is not set, the `--certs-dir` flag must point to valid certificates.<br><br><strong>Note the following risks:</strong> An insecure cluster is open to any client that can access any node's IP addresses; any user, even `root`, can log in without providing a password; any user, connecting as `root`, can read or write any data in your cluster; and there is no network encryption or authentication, and thus no confidentiality.<br><br>**Default:** `false`
`--enterprise-encryption` | This optional flag specifies the encryption options for one of the stores on the node. If multiple stores exist, the flag must be specified for each store. <br /><br /> This flag takes a number of options.  For a complete list of options, and usage instructions, see [Encryption at Rest](encryption.html). <br /><br /> Note that this is an [enterprise feature](enterprise-licensing.html).

### Locality

The `--locality` flag accepts arbitrary key-value pairs that describe the location of the node. Locality might include country, region, datacenter, rack, etc. The key-value pairs should be ordered from most to least inclusive, and the keys and order of key-value pairs must be the same on all nodes. It's typically better to include more pairs than fewer.

- CockroachDB spreads the replicas of each piece of data across as diverse a set of localities as possible, with the order determining the priority. However, locality can also be used to influence the location of data replicas in various ways using [replication zones](configure-replication-zones.html#replication-constraints).

- When there is high latency between nodes (e.g., cross-datacenter deployments), CockroachDB uses locality to move range leases closer to the current workload, reducing network round trips and improving read performance, also known as ["follow-the-workload"](demo-follow-the-workload.html). In a deployment across more than 3 datacenters, however, to ensure that all data benefits from "follow-the-workload", you must increase your replication factor to match the total number of datacenters.

- Locality is also a prerequisite for using the [table partitioning](partitioning.html) and [**Node Map**](enable-node-map.html) enterprise features.        

#### Example

~~~ shell
# Locality flag for nodes in US East datacenter:
--locality=region=us,datacenter=us-east

# Locality flag for nodes in US Central datacenter:
--locality=region=us,datacenter=us-central

# Locality flag for nodes in US West datacenter:
--locality=region=us,datacenter=us-west
~~~

### Store

The `--store` flag supports the following fields. Note that commas are used to separate fields, and so are forbidden in all field values.

{{site.data.alerts.callout_info}}
In-memory storage is not suitable for production deployments at this time.
{{site.data.alerts.end}}

{% include {{ page.version.version }}/misc/multi-store-nodes.md %}

Field | Description
------|------------
`type` | For in-memory storage, set this field to `mem`; otherwise, leave this field out. The `path` field must not be set when `type=mem`.
`path` | The file path to the storage device. When not setting `attr` or `size`, the `path` field label can be left out: <br><br>`--store=/mnt/ssd01` <br><br>When either of those fields are set, however, the `path` field label must be used: <br><br>`--store=path=/mnt/ssd01,size=20GB` <br><br> **Default:** `cockroach-data`
`attrs` | Arbitrary strings, separated by colons, specifying disk type or capability. These can be used to influence the location of data replicas. See [Configure Replication Zones](configure-replication-zones.html#replication-constraints) for full details.<br><br>In most cases, node-level `--locality` or `--attrs` are preferable to store-level attributes, but this field can be used to match capabilities for storage of individual databases or tables. For example, an OLTP database would probably want to allocate space for its tables only on solid state devices, whereas append-only time series might prefer cheaper spinning drives. Typical attributes include whether the store is flash (`ssd`) or spinny disk (`hdd`), as well as speeds and other specs, for example:<br><br> `--store=path=/mnt/hda1,attrs=hdd:7200rpm`
`size` | The maximum size allocated to the node. When this size is reached, CockroachDB attempts to rebalance data to other nodes with available capacity. When there's no capacity elsewhere, this limit will be exceeded. Also, data may be written to the node faster than the cluster can rebalance it away; in this case, as long as capacity is available elsewhere, CockroachDB will gradually rebalance data down to the store limit.<br><br> The `size` can be specified either in a bytes-based unit or as a percentage of hard drive space (notated as a decimal or with `%`), for example: <br><br>`--store=path=/mnt/ssd01,size=10000000000 ----> 10000000000 bytes`<br>`--store=path=/mnt/ssd01,size=20GB ----> 20000000000 bytes`<br>`--store=path=/mnt/ssd01,size=20GiB ----> 21474836480 bytes`<br>`--store=path=/mnt/ssd01,size=0.02TiB ----> 21474836480 bytes`<br>`--store=path=/mnt/ssd01,size=20% ----> 20% of available space`<br>`--store=path=/mnt/ssd01,size=0.2 ----> 20% of available space`<br>`--store=path=/mnt/ssd01,size=.2 ----> 20% of available space`<br><br>**Default:** 100%<br><br>For an in-memory store, the `size` field is required and must be set to the true maximum bytes or percentage of available memory, for example:<br><br>`--store=type=mem,size=20GB`<br>`--store=type=mem,size=90%`<br><br><strong>Note:</strong> If you use the `%` notation, you might need to escape the `%` sign, for instance, while configuring CockroachDB through `systemd` service files. For this reason, it's recommended to use the decimal notation instead.

### Logging

By default, `cockroach start` writes all messages to log files, and prints nothing to `stderr`. However, you can control the process's [logging](debug-and-error-logs.html) behavior with the following flags:

{% include {{ page.version.version }}/misc/logging-flags.md %}

#### Defaults

`cockroach start` uses the equivalent values for these logging flags by default:

- `--log-dir=<first store dir>/logs`
- `--logtostderr=NONE`

This means, by default, CockroachDB writes all messages to log files, and never prints to `stderr`.

## Standard output

When you run `cockroach start`, some helpful details are printed to the standard output:

~~~ shell
CockroachDB node starting at {{page.release_info.start_time}}
build:               CCL {{page.release_info.version}} @ {{page.release_info.build_time}}
webui:               http://localhost:8080
sql:                 postgresql://root@localhost:26257?sslmode=disable
client flags:        cockroach <client cmd> --listen-addr=localhost:26257 --insecure
logs:                /cockroach-data/logs
temp dir:            /cockroach-data/cockroach-temp430873933
external I/O path:   /cockroach-data/extern
attrs:               ram:64gb
locality:            datacenter=us-east1
store[0]:            path=cockroach-data,attrs=ssd
status:              initialized new cluster
clusterID:           7b9329d0-580d-4035-8319-53ba8b74b213
nodeID:              1
~~~

{{site.data.alerts.callout_success}}
These details are also written to the `INFO` log in the `/logs` directory in case you need to refer to them at a later time.
{{site.data.alerts.end}}

Field | Description
------|------------
`build` | The version of CockroachDB you are running.
`webui` | The URL for accessing the Admin UI.
`sql` | The connection URL for your client.
`client flags` | The flags to use when connecting to the node via [`cockroach` client commands](cockroach-commands.html).
`logs` | The directory containing debug log data.
`temp dir` | The temporary store directory of the node.
`external I/O path` | The external IO directory with which the local file access paths are prefixed while performing [backup](backup.html) and [restore](restore.html) operations using local node directories or NFS drives.
`attrs` | If node-level attributes were specified in the `--attrs` flag, they are listed in this field. These details are potentially useful for [configuring replication zones](configure-replication-zones.html).
`locality` | If values describing the locality of the node were specified in the `--locality` field, they are listed in this field. These details are potentially useful for [configuring replication zones](configure-replication-zones.html).
`store[n]` | The directory containing store data, where `[n]` is the index of the store, e.g., `store[0]` for the first store, `store[1]` for the second store.<br><br>If store-level attributes were specified in the `attrs` field of the [`--store`](#store) flag, they are listed in this field as well. These details are potentially useful for [configuring replication zones](configure-replication-zones.html).
`status` | Whether the node is the first in the cluster (`initialized new cluster`), joined an existing cluster for the first time (`initialized new node, joined pre-existing cluster`), or rejoined an existing cluster (`restarted pre-existing node`).
`clusterID` | The ID of the cluster.<br><br>When trying to join a node to an existing cluster, if this ID is different than the ID of the existing cluster, the node has started a new cluster. This may be due to conflicting information in the node's data directory. For additional guidance, see the [troubleshooting](common-errors.html#node-belongs-to-cluster-cluster-id-but-is-attempting-to-connect-to-a-gossip-network-for-cluster-another-cluster-id) docs.
`nodeID` | The ID of the node.

## Known limitations

{% include {{ page.version.version }}/known-limitations/adding-stores-to-node.md %}

## Examples

### Start a single-node cluster

<div class="filters clearfix">
  <button style="width: 15%" class="filter-button" data-scope="secure">Secure</button>
  <button style="width: 15%" class="filter-button" data-scope="insecure">Insecure</button>
</div>

To start a single-node cluster, run the `cockroach start` command without the `--join` flag:

<div class="filter-content" markdown="1" data-scope="secure">
{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach start \
--certs-dir=certs \
--advertise-addr=<node1 address> \
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
--cache=.25 \
--max-sql-memory=.25
~~~
</div>

### Start a multi-node cluster

<div class="filters clearfix">
  <button style="width: 15%" class="filter-button" data-scope="secure">Secure</button>
  <button style="width: 15%" class="filter-button" data-scope="insecure">Insecure</button>
</div>

To start a multi-node cluster, run the `cockroach start` command for each node, setting the `--join` flag to the addresses of 3-5 of the initial nodes:

<div class="filter-content" markdown="1" data-scope="secure">
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

Then run the [`cockroach init`](initialize-a-cluster.html) command against any node to perform a one-time cluster initialization:

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

### Start a multi-node cluster across private networks

**Scenario:**

- You have a cluster that spans GCE and AWS.
- The nodes on each cloud can reach each other on private addresses, but the private addresses aren't reachable from the other cloud.

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

2. Start each node on AWS with `--locality` set to describe its location, `--locality-advertise-addr` set to advertise its private address to other nodes on AWS, `--advertise-addr` set to advertise its public address to nodes on GCE, and `--join` set to the public addresses of 3-5 of the initial nodes:

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

3. Run the [`cockroach init`](initialize-a-cluster.html) command against any node to perform a one-time cluster initialization:

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

To add a node to an existing cluster, run the `cockroach start` command, setting the `--join` flag to the addresses of 3-5 of the nodes already in the cluster:

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

## See also

- [Initialize a Cluster](initialize-a-cluster.html)
- [Manual Deployment](manual-deployment.html)
- [Orchestrated Deployment](orchestration.html)
- [Local Deployment](start-a-local-cluster.html)
- [Other Cockroach Commands](cockroach-commands.html)
