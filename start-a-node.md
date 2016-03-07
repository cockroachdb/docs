---
title: Start a Node
toc: false
---

To start a CockroachDB node, run the `cockroach start` command with appropriate flags. 

<div id="toc"></div>

## Synopsis

~~~ shell
# Run the command:
$ ./cockroach start <flags>

# View help directly in your shell:
$ ./cockroach help start
~~~

## Flags

The `start` command supports the following flags, as well as [logging flags](cockroach-commands.html#logging-flags).

Flag | Description
-----|-----------
`--attrs` | Node-level attributes specifying topography or machine capabilities. Topography might include datacenter designation (e.g., `us-west-1a`, `us-west-1b`, `us-east-1c`). Machine capabilities might include specialized hardware or number of cores (e.g., `gpu`, `x16c`). <br><br>Attributes can be arbitrary strings separated by colons. The relative geographic proximity of two nodes is inferred from the common prefix of the attributes list, so topographic attributes should be specified first and in the same order for all nodes, for example: <br><br> `--attrs=us-west-1b:gpu`
`--certs` | The path to the directory containing the node's [security certificates](create-security-certificates.html). When starting the node with security (i.e., without the `--insecure` flag), the `--certs` flag is required. <br><br> **Default:** certs 
`--host` | The address to listen on for internal and client communication. The node also advertises itself to other nodes using this address. This may be the node's internal hostname, internal ip address, external hostname, external ip address, etc. <br><br>**Default:** Advertise node's hostname and listen on all interfaces
`--insecure` | Whether or not the cluster is secure (authentication and encrypted client/node and inter-node communication). If the cluster is secure, set the `--certs` flag but leave this flag out. If the cluster is insecure, set this flag.
`--join` | The address for connecting the node to an existing cluster. When starting the first node, leave this flag out. When starting subsequent nodes, set this flag to the address of any existing node. Optionally, you can specify the addresses of multiple existing nodes as a comma-separated list. 
`--port` | The port that the node listens on for internal and client communication. <br><br>**Default:** 26257
`--store` | The file path to a storage device and, optionally, store attributes and maximum size. When using multiple storage devices for a node, this flag must be specified separately for each device, for example: <br><br>`--store=/mnt/ssd01 --store=/mnt/ssd02` <br><br>For more details, see [`store`](#store) below. 

### `store`

The `store` flag supports the following fields. Note that commas are used to separate fields, and so are forbidden in all field values. 

Field | Description
------|------------
`path` | The file path to the storage device. When not setting `attr` or `size`, the `path` field label can be left out: <br><br>`--store=/mnt/ssd01` <br><br>When either of those fields are set, however, the `path` field label must be used: <br><br>`--store=path=/mnt/ssd01,size=20GB` <br><br> **Default:** `cockroach-data`
`attr` | Store-level attributes. In most cases, node-level attributes are preferable to store-level attributes (see `attrs` below), but this field can be used to match capabilities for storage of individual databases or tables. For example, an OLTP database would probably want to allocate space for its tables only on solid state devices, whereas append-only time series might prefer cheaper spinning drives. Typical attributes include whether the store is flash (`ssd`), spinny disk (`hdd`), or in-memory (`mem`), as well as speeds and other specs. <br><br>Attributes can be arbitrary strings separated by colons, for example: <br><br> `--store=path=/mnt/hda1,attr=hdd:7200rpm`
`size` | The maximum size allocated to the node. When this size is reached, CockroachDB attempts to rebalance data to other nodes with available capacity. When there's no capacity elsewhere, this limit will be exceeded. Also, data may be written to the node faster than the cluster can rebalance it away; in this case, as long as capacity is available elsewhere, CockroachDB will gradually rebalance data down to the store limit.<br><br> The `size` can be specified either in a bytes-based unit or as a percentage of hard drive space, for example: <br><br>`--store=path=/mnt/ssd01,size=10000000000  -> 10000000000 bytes`<br>`--store-path=/mnt/ssd01,size=20GB         -> 20000000000 bytes`<br>`--store-path=/mnt/ssd01,size=20GiB        -> 21474836480 bytes`<br>`--store-path=/mnt/ssd01,size=0.02TiB      -> 21474836480 bytes`<br>`--store=path=/mnt/ssd01,size=20%          -> 20% of available space`<br>`--store=path=/mnt/ssd01,size=0.2          -> 20% of available space`<br>`--store=path=/mnt/ssd01,size=.2           -> 20% of available space`<br><br>**Default:** 100%<br><br>For an in-memory store, the `size` field is required and must be set to the true maximum bytes or percentage of available memory. In addition, an extra `type` field must be set to `mem`, and the `path` field must be left out, for example:<br><br>`--store=type=mem,size=20GB`<br>`--store=type=mem,size=90%` 

## Examples

For a detailed walkthrough of starting a multi-node cluster, see [Manual Deployment](manual-deployment.html) and [Cloud Deployment](cloud-deployment.html).

####Start the first node of a secure cluster:

~~~ shell
$ ./cockroach start --certs=/node1certs --store=/mnt/ssd01 --host=node1hostname.com --port=26260  
~~~

####Add a node to a secure cluster:

~~~ shell
$ ./cockroach start --certs=/node2certs --store=/mnt/hda1 --host=node2hostname.com --port=26270 --join=node1hostname:26260 
~~~

####Start the first node of an insecure cluster:

~~~ shell
$ ./cockroach start --insecure --store=/mnt/ssd01 --host=node1hostname.com --port=26260
~~~

####Add a node to an insecure cluster:

~~~ shell
$ ./cockroach start --insecure --store=/mnt/hda1 --host=node2hostname.com --port=26270 --join=node1hostname:26260 
~~~
