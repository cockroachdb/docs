---
title: ALTER PARTITION
summary: Use the ALTER PARTITION statement to configure the replication zone for a partition.
toc: true
docs_area: reference.sql
---

`ALTER PARTITION` is used to add, modify, reset, or remove replication zones for [partitioning]({% link {{ page.version.version }}/partitioning.md %}). It is combined with the `CONFIGURE ZONE` subcommand.

To view details about existing replication zones, use [`SHOW ZONE CONFIGURATIONS`]({% link {{ page.version.version }}/show-zone-configurations.md %}). For more information about replication zones, see [Replication Controls]({% link {{ page.version.version }}/configure-replication-zones.md %}).

{% include {{ page.version.version }}/see-zone-config-troubleshooting-guide.md %}

You can use *replication zones* to control the number and location of replicas for specific sets of data, both when replicas are first added and when they are rebalanced to maintain cluster equilibrium.



## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/alter_zone_partition.html %}
</div>

## Required privileges

The user must have the [`CREATE`]({% link {{ page.version.version }}/grant.md %}#supported-privileges) privilege on the table.

## Parameters

 Parameter | Description
-----------+-------------
`table_name` | The name of the [table]({% link {{ page.version.version }}/create-table.md %}) with the [replication zone configurations]({% link {{ page.version.version }}/configure-replication-zones.md %}) to modify.
`partition_name` | The name of the [partition]({% link {{ page.version.version }}/partitioning.md %}) with the [replication zone configurations]({% link {{ page.version.version }}/configure-replication-zones.md %}) to modify.
`index_name` | The name of the [index]({% link {{ page.version.version }}/indexes.md %}) with the [replication zone configurations]({% link {{ page.version.version }}/configure-replication-zones.md %}) to modify.
`variable` | The name of the [variable](#variables) to change.
`value` | The value of the [variable](#variables) to change.

### Variables

{% include {{ page.version.version }}/zone-configs/variables.md %}

## Examples

{% include {{ page.version.version }}/sql/movr-statements-geo-partitioned-replicas.md %}

### Create a replication zone for a partition

{% include {{ page.version.version }}/zone-configs/create-a-replication-zone-for-a-table-partition.md hide-enterprise-warning="true" %}

{% include {{ page.version.version }}/see-zone-config-troubleshooting-guide.md %}

## See also

- [Table partitioning]({% link {{page.version.version}}/partitioning.md %})
- [`SHOW PARTITIONS`]({% link {{page.version.version}}/show-partitions.md %})
- [Troubleshoot Replication Zones]({% link {{ page.version.version}}/troubleshoot-replication-zones.md %})
