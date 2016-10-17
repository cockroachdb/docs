---
title: Start a Node
summary: To start a new CockroachDB cluster, or add a node to an existing cluster, run the cockroach start command.
toc: false
---

To start a new CockroachDB cluster, or add a node to an existing cluster, run the `cockroach start` [command](cockroach-commands.html) with appropriate flags. 

<div id="toc"></div>

## Synopsis

~~~ shell
# Start the first node of a cluster:
$ cockroach start <flags, excluding --join>

# Add a node to a cluster:
$ cockroach start <flags, including --join>

# View help:
$ cockroach start --help
~~~

## Flags

The `start` command supports the following flags, as well as [logging flags](cockroach-commands.html#logging-flags). When adding a node to an existing cluster, include the `--join` flag.

Flag | Description
-----|-----------
`--advertise-host` | The hostname or IP address to advertise to other CockroachDB nodes. If it is a hostname, it must be resolvable from all nodes; if it is an IP address, it must be routable from all nodes.<br><br>When this flag is not set, the node advertises the address in the `--host` flag.
`--attrs` | Arbitrary strings, separated by colons, relating to node-level attributes such as topography or machine capability. These can be used to influence the location of data replicas. See [Configure Replication Zones](configure-replication-zones.html) for full details.<br><br>Topography might include datacenter designation (e.g., `us-west-1a`, `us-west-1b`, `us-east-1c`). Machine capabilities might include specialized hardware or number of cores (e.g., `gpu`, `x16c`). The relative geographic proximity of two nodes is inferred from the common prefix of the attributes list, so topographic attributes should be specified first and in the same order for all nodes, for example: <br><br> `--attrs=us-west-1b:gpu`
`--background` | Set this to start the node in the background. This is better than appending `&` to the command because control is returned to the shell only once the node is ready to accept requests.
`--cache` | The total size for caches, shared evenly if there are multiple storage devices. This can be in any bytes-based unit, for example: <br><br>`--cache=1000000000  -> 1000000000 bytes`<br>`--cache=1GB         -> 1000000000 bytes`<br>`--cache=1GiB        -> 1073741824 bytes` <br><br>**Default:** Cache size is limited to 25% of available memory, calculated when the node starts.
`--ca-cert` | The path to the [CA certificate](create-security-certificates.html). This flag is required to start a secure node.<br><br>**Env Variable:** `COCKROACH_CA_CERT` 
`--cert` | The path to the [node certificate](create-security-certificates.html). This flag is required to start a secure node.<br><br>**Env Variable:** `COCKROACH_CERT`
`--host` | The hostname or IP address to listen on for intra-cluster and client communication. The node will also advertise itself to other nodes using this address only if `--advertise-host` is not specified; in this case, if it is a hostname, it must be resolvable from all nodes, and if it is an IP address, it must be routable from all nodes.<br><br>**Defaults:** When starting a node without `--insecure` and without cert flags (i.e., a local cluster), the node listens on `localhost` only and cannot be changed. When starting a node with `--insecure` or with cert flags (i.e., a distributed cluster), the node listens on all interfaces by default but this flag can be set to listen on an external address. 
`--http-host` | The hostname or IP address to listen on for Admin UI HTTP requests. <br><br>**Default:** same as `--host`
`--http-port` | The port to bind to for Admin UI HTTP requests. <br><br>**Default:** `8080`
`--insecure` | Set this only if the cluster is insecure and running on multiple machines.<br><br>If the cluster is insecure and local, leave this out. If the cluster is secure, leave this out and set the `--ca-cert`, `--cert`, and `-key` flags.<br><br>**Env Variable:** `COCKROACH_INSECURE`
`--join`<br>`-j` | The address for connecting the node to an existing cluster. When starting the first node, leave this flag out. When starting subsequent nodes, set this flag to the address of any existing node.<br><br>Optionally, you can specify the addresses of multiple existing nodes as a comma-separated list, using multiple `--join` flags, or using a combination of these approaches, for example: <br><br>`--join=localhost:1234,localhost:2345`<br>`--join=localhost:1234 --join=localhost:2345`<br>`--join=localhost:1234,localhost:2345 --join=localhost:3456`
`--key` | The path to the [node key](create-security-certificates.html) protecting the node certificate. This flag is required to start a secure node. 
`--locality` | Not yet implemented.
`--port`<br>`-p` | The port to bind to for internal and client communication. <br><br>**Env Variable:** `COCKROACH_PORT`<br>**Default:** `26257`
`--raft-tick-interval` | CockroachDB uses the [Raft consensus algorithm](https://raft.github.io/) to replicate data consistently according to your [replication zone configuration](configure-replication-zones.html). For each replica group, an elected leader heartbeats its followers and keeps their logs replicated. When followers fail to receive heartbeats, a new leader is elected. <br><br>This flag sets the interval at which the replica leader heartbeats followers. For high-latency deployments, set this flag to a value greater than the average latency between your nodes. Also, this flag should be set identically on all nodes in the cluster.<br><br>**Default:** 200ms 
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
build:      {{site.data.strings.version}} @ {{site.data.strings.build_time}}
admin:      http://ROACHs-MBP:8080
sql:        postgresql://root@ROACHs-MBP:26257?sslmode=disable
logs:       cockroach-data/logs
store[0]:   path=cockroach-data
status:     initialized new cluster
clusterID:  {4ef69723-92cc-44fa-a847-5a855b3532a7}
nodeID:     1
~~~

Field | Description
------|------------
`build` | The version of CockroachDB you are running.
`admin` | The URL for accessing the Admin UI.
`sql` | The connection URL for your client.
`logs` | The directory containing debug log data.
`store[n]` | The directory containing store data, where `[n]` is the index of the store, e.g., `store[0]` for the first store, `store[1]` for the second store.
`status` | Whether the node is the first in the cluster (`initialized new cluster`), joined an existing cluster for the first time (`initialized new node, joined pre-existing cluster`), or rejoined an existing cluster (`restarted pre-existing node`).
`clusterID` | The ID of the cluster.<br><br>When trying to join a node to an existing cluster, if this ID is different than the ID of the existing cluster, the node has started a new cluster. This may be due to conflicting information in the node's data directory. For additional guidance, see [Troubleshooting](troubleshoot.html#node-wont-join-cluster). 
`nodeID` | The ID of the node.

## Examples

### Start a local cluster

This example demonstrates starting up three nodes locally. See [Start a Cluster](start-a-local-cluster.html) and [Secure a Cluster](secure-a-cluster.html) for a detailed walkthrough.

~~~ shell
# Insecure:
$ cockroach start
$ cockroach start --store=node2 --port=26258 --http-port=8081 --join=localhost:26257
$ cockroach start --store=node3 --port=26259 --http-port=8082 --join=localhost:26257

# Secure:
$ cockroach start --ca-cert=certs/ca.cert --cert=certs/node.cert --key=certs/node.key --http-host=localhost --background
$ cockroach start --store=node2 --port=26258 --http-host=localhost --http-port=8081 --join=localhost:26257 --ca-cert=certs/ca.cert --cert=certs/node.cert --key=certs/node.key --background
$ cockroach start --store=node3 --port=26259 --http-host=localhost --http-port=8082 --join=localhost:26257 --ca-cert=certs/ca.cert --cert=certs/node.cert --key=certs/node.key --background
~~~

### Start a distributed cluster

This example demonstrates starting up three nodes on different machines. Because each is on a different machine, default ports can be used without causing conflict. See [Manual Deployment](manual-deployment.html) for a detailed walkthrough.

<style>
.pg::before {
    content: "test";
}
.pg::after {
    content: "test2";
}
</style>
~~~ shell
# Insecure:
$ cockroach start --insecure --host=<node1-hostname>
$ cockroach start --insecure --host=<node2-hostname> --join=<node1-hostname>:26257
$ cockroach start --insecure --host=<node3-hostname> --join=<node1-hostname>:26257

# Secure:
$ cockroach start --ca-cert=ca.cert --cert=node1.cert --key=node1.key --host=<node1-hostname> --http-host=<private-address>
$ cockroach start --ca-cert=ca.cert --cert=node2.cert --key=node2.key --host=<node2-hostname> --http-host=<private-address> --join=<node1-hostname>:26257
$ cockroach start --ca-cert=ca.cert --cert=node3.cert --key=node3.key --host=<node3-hostname> --http-host=<private-address> --join=<node1-hostname>:26257 --ca-cert=ca.cert --cert=node3.cert --key=node3.key
~~~

## See Also

[Other Cockroach Commands](cockroach-commands.html)

<script>
$(document).ready(function(){

  var $filter_button = $('.filter-button');

    $filter_button.on('click', function(){
      var scope = $(this).data('scope'),
      $current_tab = $('.filter-button.current'), $current_content = $('.filter-content.current');

      //remove current class from tab and content
      $current_tab.removeClass('current');
      $current_content.removeClass('current');

      //add current class to clicked button and corresponding content block
      $('.filter-button[data-scope="'+scope+'"').addClass('current');
      $('.filter-content[data-scope="'+scope+'"').addClass('current');
    });
});
</script>
