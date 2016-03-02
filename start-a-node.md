---
title: Start a Node
toc: false
---

<style>
table td:first-child {
    width: 200px;
}
</style>

To start a CockroachDB node, run the `cockroach start` command with appropriate flags. 

<div id="toc"></div>

## Synopsis

~~~ shell
# Run the command:
$ ./cockroach start <flags>

# View help directly in your shell:
$ ./cockroach start --help
~~~

## Standard Flags

The `start` command supports the following standard flags, as well as the [advanced flags](#advanced-flags) below and [global flags](cockroach-commands.html#global-flags) that can be set on any command.

Flag | Description
-----|-----------
`--certs` | The path to the directory containing the node's [security certificates](create-security-certificates.html). When starting the node with security (i.e., without the `--insecure` flag), the `--certs` flag is required. <br><br> **Default:** certs 
`--host` | A comma-separated list of addresses at which the node can be reached. This might include the node's internal hostname, internal ip address, external hostname, external ip address, etc. <br><br>**Default:** localhost
`--insecure` | Whether or not the cluster is secure (authentication and encrypted client/node and inter-node communication). If the cluster is secure, set the `--certs` flag but leave this flag out. If the cluster is insecure, set this flag.
`--join` | The address for connecting the node to an existing cluster. When starting the first node, leave this flag out. When starting subsequent nodes, set this flag to the address of any existing node. Optionally, you can specify the addresses of multiple existing nodes as a comma-separated list. 
`--port` | The port over which the node communicates to the rest of the cluster and clients communicate to the node. <br><br>**Default:** 26257
`--store` | The file path to a storage device and, optionally, store attributes and maximum size. When using multiple storage devices for a node, this flag must be specified separately for each device, for example: <br><br>`$ ./cochroach start --store=/mnt/ssd01 --store=/mnt/ssd02` <br><br>For more details, see [`store`](#store) below. 

## Advanced Flags

Flag | Description
-----|------------
`attrs` |
`cache-size` |
`linearizable` |
`max-offset` |

### `store`

The `store` flag supports the following fields. Note that commas are used to separate fields, and so are forbidden in all field values. 

Field | Description
------|------------
`path` | The file path to the storage device. When not setting `attr` or `size`, the `path` field label can be left out: <br><br>`--store=/mnt/ssd01` <br><br>When either of those fields are set, however, the `path` field label must be used: <br><br>`--store=path=/mnt/ssd01,size=20GB` <br><br> **Default:** `cockroach-data`
`attr` | Store-level attributes. In most cases, node-level attributes are preferable to store-level attributes, but this field can be used to match capabilities for storage of individual databases or tables. For example, an OLTP database would probably want to allocate space for its tables only on solid state devices, whereas append-only time series might prefer cheaper spinning drives. Typical attributes include whether the store is flash (ssd), spinny disk (hdd), or in-memory (men), as well as speeds and other specs. <br><br>Attributes can be arbitrary strings separated by colons, for example: <br><br> `$ ./cockroach start --store=path=/mnt/hda1,attr=hdd:7200rpm`
`size` | The maximum size allocated to the node. When this size is reached, CockroachDB attempts to rebalance data to other nodes with available capacity. In cases where there's no capacity elsewhere, this limit will be exceeded. Also, data may be written to the node faster than the cluster can rebalance it away; in this case, as long as capacity is available elsewhere, CockroachDB will gradually rebalance data down to the store limit.<br><br> The `size` can be specified either in a bytes-based unit or as a percentage of hard drive space, for example: <br><br>`--store=path=/mnt/ssd01,size=10000000000  -> 10000000000 bytes`<br>`--store-path=/mnt/ssd01,size=20GB         -> 20000000000 bytes`<br>`--store-path=/mnt/ssd01,size=20GiB        -> 21474836480 bytes`<br>`--store-path=/mnt/ssd01,size=0.02TiB      -> 21474836480 bytes`<br>`--store=path=/mnt/ssd01,size=20%          -> 20% of available space`<br>`--store=path=/mnt/ssd01,size=0.2          -> 20% of available space`<br>`--store=path=/mnt/ssd01,size=.2           -> 20% of available space`<br><br>**Default:** 100%<br><br>For an in-memory store, the `size` field is required and must be set to the true maximum bytes or percentage of available memory. In addition, an extra `type` field must be set to `mem`, and the `path` field must be left out, for example:<br><br>`--store=type=mem,size=20GB`<br>`--store=type=mem,size=90%` 

## Examples

Coming soon.