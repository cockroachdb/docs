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
`--insecure` | Whether the node runs with or without security. To start the node without security (no authentication or encryption), set this flag. To start the node with security, leave this flag out. Whether or not the node runs with authentication and encryption. If the node is secure, leave this flag out. If the node is insecure, set this flag.
`--join` | The address for connecting the node to an existing cluster. When starting the first node, leave this flag out. When starting subsequent nodes, set this flag to the address of any existing node. Optionally, you can specify the addresses of multiple existing nodes as a comma-separated list. 
`--port` | The port over which the node communicates to the rest of the cluster and clients communicate to the node. <br><br>**Default:** 26257
`--store` | The file path to a storage device and, optionally, store attributes and maximum size. When using multiple storage devices for a node, this flag must be specified separately for each device. <br><br>For more details, see [`store`](#store) below. 

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
`path` | The file path to the storage device. <br> <br> When the `attr` and/or `size` field is set, the `path` field label must be used, e.g. `--store=path=/mnt/ssd01,size=20GB`. When neither of these fields are set, the `path` field label can be left out, e.g., `--store=/mnt/ssd01`. <br><br> **Default:** `cockroach-data`
`attr` | xxx
`size` | xxx


Also, if you use equal signs in the file path to a store, you must use the path field label

~~~ shell
$ ./cochraoch start --store=/mnt/ssd01 --store=/mnt/ssd02 --store=/mnt/hda1
~~~

For each store, the `attr` and `size` fields can be used to specify device attributes and a maximum store size. When one or both of these fields are set, the `path` field label must be used for the path to the storage device, for example:

~~~ shell
$ ./cockroach start --store=path=/mnt/ssd01,attr=ssd,size=20GiB
~~~

In most cases, node-level attributes are preferable to store-level attributes. However, the "attr" field can be used to match capabilities for storage of individual databases or tables. For example, an OLTP database would probably want to allocate space for its tables only on solid state devices, whereas append-only time series might prefer cheaper spinning drives. Typical attributes include whether the store is flash (ssd), spinny disk (hdd), or in-memory (men), as well as speeds and other specs. Attributes can be arbitrary strings separated by colons, for example:

~~~ shell
$ ./cockroach start --store=path=/mnt/hda1,attr=hdd:7200rpm
~~~

The store size in the `size` field is not a guaranteed maximum but is used when calculating free space for rebalancing purposes. The size can be specified either in a bytes-based unit or as a percentage of hard drive space, for example:

~~~ shell
--store=path=/mnt/ssd01,size=10000000000     -> 10000000000 bytes
--store-path=/mnt/ssd01,size=20GB            -> 20000000000 bytes
--store-path=/mnt/ssd01,size=20GiB           -> 21474836480 bytes
--store-path=/mnt/ssd01,size=0.02TiB         -> 21474836480 bytes
--store=path=/mnt/ssd01,size=20%             -> 20% of available space
--store=path=/mnt/ssd01,size=0.2             -> 20% of available space
--store=path=/mnt/ssd01,size=.2              -> 20% of available space
~~~

For an in-memory store, the `type` and `size` fields are required, and the `path` field is forbidden. The `type` field must be set to `mem`, and the `size` field must be set to the true maximum bytes or percentage of available memory that the store may consume, for example:

~~~ shell
--store=type=mem,size=20GiB
--store=type=mem,size=90%
~~~

Commas are forbidden in all field values, since they are used to separate fields. Also, if you use equal signs in the file path to a store, you must use the `path` field label.

## Examples