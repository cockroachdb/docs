---
title: Start a Node
toc: false
---

To start a new CockroachDB cluster, or add a node to an existing cluster, run the `cockroach start` [command](cockroach-commands.html) with appropriate flags. 

<div id="toc"></div>

## Synopsis

~~~ shell
# Start the first node of a cluster:
$ ./cockroach start <flags, excluding --join>

# Add a node to a cluster:
$ ./cockroach start <flags, including --join>

# View help:
$ ./cockroach help start
~~~

## Flags

The `start` command supports the following flags, as well as [logging flags](cockroach-commands.html#logging-flags). When adding a node to an existing cluster, include the `--join` flag.

Flag | Description
-----|-----------
`--attrs` | Arbitrary strings, separated by colons, relating to node-level attributes such as topography or machine capability. These can be used to influence the location of data replicas. See [Configure Replication Zones](configure-replication-zones.html) for full details.<br><br>Topography might include datacenter designation (e.g., `us-west-1a`, `us-west-1b`, `us-east-1c`). Machine capabilities might include specialized hardware or number of cores (e.g., `gpu`, `x16c`). The relative geographic proximity of two nodes is inferred from the common prefix of the attributes list, so topographic attributes should be specified first and in the same order for all nodes, for example: <br><br> `--attrs=us-west-1b:gpu`
`--background` | Set this to start the node in the background. This is better than appending `&` to the command because control is returned to the shell only once the node is ready to accept requests.
`--cache` | The total size for caches, shared evenly if there are multiple storage devices. This can be in any bytes-based unit, for example: <br><br>`--cache=1000000000  -> 1000000000 bytes`<br>`--cache=1GB         -> 1000000000 bytes`<br>`--cache=1GiB        -> 1073741824 bytes`
`--ca-cert` | The path to the [CA certificate](create-security-certificates.html). This flag is required to start a secure node. 
`--cert` | The path to the [node certificate](create-security-certificates.html). This flag is required to start a secure node.
`--host` | The address to listen on for internal and client communication. The node also advertises itself to other nodes using this address.<br><br>When running an insecure local cluster (without `--insecure` and without cert flags), this defaults to `localhost` and cannot be changed. When running an insecure distributed cluster (with `--insecure` but without cert flags) or a secure local or distributed cluster (without `--insecure` but with cert flags), this can be an external address.
`--http-port` | The port to listen on for HTTP requests from the Admin UI. <br><br>**Default:** 8080
`--insecure` | Set this only if the cluster is insecure and running on multiple machines.<br><br>If the cluster is insecure and local, leave this out. If the cluster is secure, leave this out and set the `--ca-cert`, `--cert`, and `-key` flags.
`--join` | The address for connecting the node to an existing cluster. When starting the first node, leave this flag out. When starting subsequent nodes, set this flag to the address of any existing node. Optionally, you can specify the addresses of multiple existing nodes as a comma-separated list.
`--key` | The path to the [node key](create-security-certificates.html) protecting the node certificate. This flag is required to start a secure node. 
`--port`<br>`-p` | The port to listen on for internal and client communication. <br><br>**Default:** 26257
`--store`<br>`-s` | The file path to a storage device and, optionally, store attributes and maximum size. When using multiple storage devices for a node, this flag must be specified separately for each device, for example: <br><br>`--store=/mnt/ssd01 --store=/mnt/ssd02` <br><br>For more details, see [`store`](#store) below. 

#### `store`

The `store` flag supports the following fields. Note that commas are used to separate fields, and so are forbidden in all field values. 

Field | Description
------|------------
`path` | The file path to the storage device. When not setting `attr` or `size`, the `path` field label can be left out: <br><br>`--store=/mnt/ssd01` <br><br>When either of those fields are set, however, the `path` field label must be used: <br><br>`--store=path=/mnt/ssd01,size=20GB` <br><br> **Default:** `cockroach-data`
`attrs` | Arbitrary strings, separated by colons, relating to store-level attributes such as disk type or capabilities. These can be used to influence the location of data replicas. See [Configure Replication Zones](configure-replication-zones.html) for full details.<br><br>In most cases, node-level attributes are preferable to store-level attributes, but this field can be used to match capabilities for storage of individual databases or tables. For example, an OLTP database would probably want to allocate space for its tables only on solid state devices, whereas append-only time series might prefer cheaper spinning drives. Typical attributes include whether the store is flash (`ssd`), spinny disk (`hdd`), or in-memory (`mem`), as well as speeds and other specs, for example:<br><br> `--store=path=/mnt/hda1,attrs=hdd:7200rpm`
`size` | The maximum size allocated to the node. When this size is reached, CockroachDB attempts to rebalance data to other nodes with available capacity. When there's no capacity elsewhere, this limit will be exceeded. Also, data may be written to the node faster than the cluster can rebalance it away; in this case, as long as capacity is available elsewhere, CockroachDB will gradually rebalance data down to the store limit.<br><br> The `size` can be specified either in a bytes-based unit or as a percentage of hard drive space, for example: <br><br>`--store=path=/mnt/ssd01,size=10000000000  -> 10000000000 bytes`<br>`--store-path=/mnt/ssd01,size=20GB         -> 20000000000 bytes`<br>`--store-path=/mnt/ssd01,size=20GiB        -> 21474836480 bytes`<br>`--store-path=/mnt/ssd01,size=0.02TiB      -> 21474836480 bytes`<br>`--store=path=/mnt/ssd01,size=20%          -> 20% of available space`<br>`--store=path=/mnt/ssd01,size=0.2          -> 20% of available space`<br>`--store=path=/mnt/ssd01,size=.2           -> 20% of available space`<br><br>**Default:** 100%<br><br>For an in-memory store, the `size` field is required and must be set to the true maximum bytes or percentage of available memory. In addition, an extra `type` field must be set to `mem`, and the `path` field must be left out, for example:<br><br>`--store=type=mem,size=20GB`<br>`--store=type=mem,size=90%` 

## Standard Output

When you run `cockroach start`, some helpful details are printed to the standard output:

~~~ shell
build:     {{site.data.strings.version}} @ {{site.data.strings.build_time}}
admin:     http://ROACHs-MBP:8080
sql:       postgresql://root@ROACHs-MBP:26257?sslmode=disable
logs:      cockroach-data/logs
store[0]:  path=cockroach-data
~~~

Field | Description
------|------------
`build` | The version of CockroachDB you are running.
`admin` | The URL for accessing the Admin UI.
`sql` | The connection URL for your client.
`logs` | The directory containing debug log data.
`store[n]` | The directory containing store data, where `[n]` is the index of the store, e.g., `store[0]` for the first store, `store[1]` for the second store.

## Examples

### Start a local cluster

This example demonstrates starting up three nodes locally. See [Start a Cluster](start-a-local-cluster.html) and [Secure a Cluster](secure-a-cluster.html) for a detailed walkthrough.

~~~ shell
# Insecure:
$ ./cockroach start
$ ./cockroach start --store=cockroach-data2 --port=26258 --http-port=8081 --join=localhost:26257
$ ./cockroach start --store=cockroach-data3 --port=26259 --http-port=8082 --join=localhost:26257

# Secure:
$ ./cockroach start --ca-cert=certs/ca.cert --cert=certs/node.cert --key=certs/node.key  
$ ./cockroach start --store=cockroach-data2 --port=26258 --http-port=8081 --join=localhost:26257 --ca-cert=certs/ca.cert --cert=certs/node.cert --key=certs/node.key
$ ./cockroach start --store=cockroach-data3 --port=26259 --http-port=8082 --join=localhost:26257 --ca-cert=certs/ca.cert --cert=certs/node.cert --key=certs/node.key
~~~

### Start a distributed cluster

This example demonstrates starting up three nodes on different machines. Because each is on a different machine, default ports can be used without causing conflict. See [Manual Deployment](manual-deployment.html) for a detailed walkthrough.

~~~ shell
# Insecure:
$ ./cockroach start --host=node1-hostname
$ ./cockroach start --host=node2-hostname --join=node1-hostname:26257
$ ./cockroach start --host=node3-hostname --join=node1-hostname:26257

# Secure:
$ ./cockroach start --host=node1-hostname --ca-cert=certs/ca.cert --cert=certs/node1.cert --key=certs/node1.key  
$ ./cockroach start --host=node2-hostname --join=node1-hostname:26257 --ca-cert=certs/ca.cert --cert=certs/node2.cert --key=certs/node2.key
$ ./cockroach start --host=node3-hostname --join=node1-hostname:26257 --ca-cert=certs/ca.cert --cert=certs/node3.cert --key=certs/node3.key
~~~

## See Also

[Other Cockroach Commands](cockroach-commands.html)