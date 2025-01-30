---
title: ALTER PARTITION
summary: Use the ALTER PARTITION statement to configure the replication zone for a partition.
toc: true
docs_area: reference.sql
---

`ALTER PARTITION` is used to add, modify, reset, or remove replication zones for [partitioning]({{ page.version.version }}/partitioning.md). It is combined with the `CONFIGURE ZONE` subcommand.

To view details about existing replication zones, use [`SHOW ZONE CONFIGURATIONS`]({{ page.version.version }}/show-zone-configurations.md). For more information about replication zones, see [Replication Controls]({{ page.version.version }}/configure-replication-zones.md).

You can use *replication zones* to control the number and location of replicas for specific sets of data, both when replicas are first added and when they are rebalanced to maintain cluster equilibrium.



## Synopsis

<div>
</div>

## Required privileges

The user must have the [`CREATE`]({{ page.version.version }}/grant.md#supported-privileges) privilege on the table.

## Parameters

 Parameter | Description
-----------+-------------
`table_name` | The name of the [table]({{ page.version.version }}/create-table.md) with the [replication zone configurations]({{ page.version.version }}/configure-replication-zones.md) to modify.
`partition_name` | The name of the [partition]({{ page.version.version }}/partitioning.md) with the [replication zone configurations]({{ page.version.version }}/configure-replication-zones.md) to modify.
`index_name` | The name of the [index]({{ page.version.version }}/indexes.md) with the [replication zone configurations]({{ page.version.version }}/configure-replication-zones.md) to modify.
`variable` | The name of the [variable](#variables) to change.
`value` | The value of the [variable](#variables) to change.

### Variables


## Examples


### Create a replication zone for a partition
