---
title: CONFIGURE ZONE
summary: Use the CONFIGURE ZONE statement to add, modify, reset, and remove replication zones.
toc: true
---

Use `CONFIGURE ZONE` to add, modify, reset, and remove [replication zones](configure-replication-zones.html). To view details about existing replication zones, see [`SHOW ZONE CONFIGURATIONS`](show-zone-configurations.html).

In CockroachDB, you can use **replication zones** to control the number and location of replicas for specific sets of data, both when replicas are first added and when they are rebalanced to maintain cluster equilibrium.

{{site.data.alerts.callout_info}}
Adding replication zones for rows and secondary indexes is an [enterprise-only](enterprise-licensing.html) feature.
{{site.data.alerts.end}}

## Synopsis

**alter_zone_range_stmt ::=**

<div class="horizontal-scroll">
  {% include {{ page.version.version }}/sql/diagrams/alter_zone_range.html %}
</div>

**alter_zone_database_stmt ::=**

<div class="horizontal-scroll">
  {% include {{ page.version.version }}/sql/diagrams/alter_zone_database.html %}
</div>

**alter_zone_table_stmt ::=**

<div class="horizontal-scroll">
  {% include {{ page.version.version }}/sql/diagrams/alter_zone_table.html %}
</div>

**alter_zone_index_stmt ::=**

<div class="horizontal-scroll">
  {% include {{ page.version.version }}/sql/diagrams/alter_zone_index.html %}
</div>

## Required privileges

Currently, only the `root` user can configure replication zones.

## Parameters

 Parameter | Description
-----------+-------------
`range_name` | The name of the system [range](architecture/overview.html#glossary) for which to show [replication zone configurations](configure-replication-zones.html).
`database_name` | The name of the [database](create-database.html) for which to show [replication zone configurations](configure-replication-zones.html).
`table_name` | The name of the [table](create-table.html) for which to show [replication zone configurations](configure-replication-zones.html).
`partition_name` | The name of the [partition](partitioning.html) for which to show [replication zone configurations](configure-replication-zones.html).
`index_name` | The name of the [index](indexes.html) for which to show [replication zone configurations](configure-replication-zones.html).
`variable` | The name of the [variable](#variables) to change.
`value` | The value of the variable to change.
`DISCARD` | Remove a replication zone.

### Variables

{% include {{ page.version.version }}/zone-configs/variables.md %}

## Viewing schema changes

{% include {{ page.version.version }}/misc/schema-change-view-job.md %}

## Examples

### Edit a replication zone

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE t CONFIGURE ZONE USING range_min_bytes = 0, range_max_bytes = 90000, gc.ttlseconds = 89999, num_replicas = 4, constraints = '[-region=west]';
~~~

~~~
CONFIGURE ZONE 1
~~~

### Edit the default replication zone

{% include {{ page.version.version }}/zone-configs/edit-the-default-replication-zone.md %}

### Create a replication zone for a database

{% include {{ page.version.version }}/zone-configs/create-a-replication-zone-for-a-database.md %}

### Create a replication zone for a table

{% include {{ page.version.version }}/zone-configs/create-a-replication-zone-for-a-table.md %}

### Create a replication zone for a secondary index

{% include {{ page.version.version }}/zone-configs/create-a-replication-zone-for-a-secondary-index.md %}

### Create a replication zone for a table or secondary index partition

{% include {{ page.version.version }}/zone-configs/create-a-replication-zone-for-a-table-partition.md %}

### Create a replication zone for a system range

{% include {{ page.version.version }}/zone-configs/create-a-replication-zone-for-a-system-range.md %}

### Reset a replication zone

{% include {{ page.version.version }}/zone-configs/reset-a-replication-zone.md %}

### Remove a replication zone

{% include {{ page.version.version }}/zone-configs/remove-a-replication-zone.md %}

## See also

- [Configure Replication Zones](configure-replication-zones.html)
- [`SHOW ZONE CONFIGURATIONS`](show-zone-configurations.html)
- [`ALTER DATABASE`](alter-database.html)
- [`ALTER TABLE`](alter-table.html)
- [`ALTER INDEX`](alter-index.html)
- [`ALTER RANGE`](alter-range.html)
- [`SHOW JOBS`](show-jobs.html)
- [Table Partitioning](partitioning.html)
- [Other SQL Statements](sql-statements.html)
