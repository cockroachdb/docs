---
title: SHOW ZONE CONFIGURATIONS
summary: Use the SHOW ZONE CONFIGURATIONS statement to list details about existing replication zones.
toc: true
---

<span class="version-tag">New in {{ page.version.version }}:</span> Use the `SHOW ZONE CONFIGURATIONS` [statement](sql-statements.html) to view details about existing [replication zones](configure-replication-zones.html).

## Synopsis

<div class="horizontal-scroll">
{% include {{ page.version.version }}/sql/diagrams/show_zone.html %}
</div>

## Required privileges

No [privileges](authorization.html#assign-privileges) are required to list replication zones.

## Parameters

Parameter | Description
----------|------------
`range_name` | The name of the system [range](architecture/index.html#glossary) for which to show [replication zone configurations](configure-replication-zones.html).
`database_name` | The name of the [database](create-database.html) for which to show [replication zone configurations](configure-replication-zones.html).
`table_name` | The name of the [table](create-table.html) for which to show [replication zone configurations](configure-replication-zones.html).
`partition_name` | The name of the [partition](partitioning.html) for which to show [replication zone configurations](configure-replication-zones.html).
`index_name` | The name of the [index](indexes.html) for which to show [replication zone configurations](configure-replication-zones.html).

## Examples

### View all replication zones

{% include {{ page.version.version }}/zone-configs/view-all-replication-zones.md %}

### View the default replication zone for the cluster

{% include {{ page.version.version }}/zone-configs/view-the-default-replication-zone.md %}

### View the replication zone for a database

{% include {{ page.version.version }}/zone-configs/view-the-replication-zone-for-a-database.md %}

### View the replication zone for a table

{% include {{ page.version.version }}/zone-configs/view-the-replication-zone-for-a-table.md %}

### View the replication zone for an index

{% include {{ page.version.version }}/zone-configs/view-the-replication-zone-for-an-index.md %}

### View the replication zone for a table partition

{% include {{ page.version.version }}/zone-configs/view-the-replication-zone-for-a-partition.md %}

## See also

- [Configure Replication Zones](configure-replication-zones.html)
- [`CONFIGURE ZONE`](configure-zone.html)
- [`ALTER DATABASE`](alter-database.html)
- [`ALTER INDEX`](alter-index.html)
- [`ALTER RANGE`](alter-range.html)
- [`ALTER TABLE`](alter-table.html)
- [SQL Statements](sql-statements.html)
