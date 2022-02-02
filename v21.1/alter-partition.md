---
title: ALTER PARTITION
summary: Use the ALTER PARTITION statement to configure the replication zone for a partition.
toc: true
---

The `ALTER PARTITION` [statement](sql-statements.html) is used to configure replication zones for [partitioning](partitioning.html). See the [`CONFIGURE ZONE`](configure-zone.html) subcommand for more details.

{% include enterprise-feature.md %}

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-21.2/grammar_svg/alter_zone_partition.html %}
</div>

## Required privileges

The user must have the [`CREATE`](grant.html#supported-privileges) privilege on the table.

## Parameters

 Parameter | Description
-----------+-------------
`table_name` | The name of the [table](create-table.html) whose [replication zone configurations](configure-replication-zones.html) you want to change.
`partition_name` | The name of the [partition](partitioning.html) whose [replication zone configurations](configure-replication-zones.html) you want to change.
`index_name` | The name of the [index](indexes.html) whose [replication zone configurations](configure-replication-zones.html) you want to change.
`variable` | The name of the [variable](#variables) to change.
`value` | The value of the variable to change.

### Variables

{% include {{ page.version.version }}/zone-configs/variables.md %}

## Examples

{% include {{ page.version.version }}/sql/movr-statements-geo-partitioned-replicas.md %}

### Create a replication zone for a partition

{% include {{ page.version.version }}/zone-configs/create-a-replication-zone-for-a-table-partition.md hide-enterprise-warning="true" %}
