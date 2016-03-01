---
title: Start a Node
toc: false
---

To start a CockroachDB node, run the `cockroach start` command. 

- When starting the first node of a cluster, This page explains the accepted flags and provides examples. 

<div id="toc"></div>

## Synopsis

~~~
$ ./cockroach start [flags]
~~~

## Standard Flags

The `start` command supports the following flags. Click a flag for supported fields and other details. 

Flag | Description
-----|-----------
[`certs`](#certs) |
[`insecure`](#insecure) | 
[`join`](#join) |
[`port`](#port) |
[`store`](#store) |

## Advanced Flags

Flag | Description
-----|------------
[`attrs`](#attrs) |
[`cache-size`](#cache-size) |
[`host`](#host) |
[`linearizable`](#linearizable) |
[`max-offset`](#max-offset) |
[`memtable-budget`](#memtable-budget) |
[`metrics-frequency`](#metrics-frequency) |
[`scan-interval`](#scan-interval) |
[`scan-max-idle-time`](#scan-max-idle-time) |
[`time-until-store-dead`](#time-until-store-dead) |

### `store`

The `store` flag specifies the file path to a storage device. This flag must be specified separately for each storage device. 

The `store` flag supports the following fields:

Field | Description
------|------------
`path` | The file path to the storage device. If not xxx
`attr` | xxx
`size` | xxx


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