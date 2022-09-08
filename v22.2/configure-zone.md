---
title: CONFIGURE ZONE
summary: Use the CONFIGURE ZONE statement to add, modify, reset, and remove replication zones.
toc: true
docs_area: reference.sql
---

`CONFIGURE ZONE` is a subcommand of the `ALTER DATABASE`, `ALTER TABLE`, `ALTER INDEX`, `ALTER PARTITION`, and [`ALTER RANGE`](alter-range.html) statements and is used to add, modify, reset, or remove [replication zones](configure-replication-zones.html) for those objects. To view details about existing replication zones, see [`SHOW ZONE CONFIGURATIONS`](show-zone-configurations.html).

In CockroachDB, you can use **replication zones** to control the number and location of replicas for specific sets of data, both when replicas are first added and when they are rebalanced to maintain cluster equilibrium.

{{site.data.alerts.callout_info}}
Adding replication zones for secondary indexes and partitions is an [Enterprise-only](enterprise-licensing.html) feature.
{{site.data.alerts.end}}

## Synopsis

**alter_zone_database_stmt ::=**

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/alter_zone_database.html %}
</div>

**alter_zone_table_stmt ::=**

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/alter_zone_table.html %}
</div>

**alter_zone_index_stmt ::=**

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/alter_zone_index.html %}
</div>

**alter_zone_partition_stmt ::=**

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/alter_zone_partition.html %}
</div>

**alter_zone_range_stmt ::=**

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/alter_zone_range.html %}
</div>

## Required privileges

If the target is a [`system` range](#create-a-replication-zone-for-a-system-range), the [`system` database](show-databases.html#preloaded-databases), or a table in the `system` database, the user must be a member of the [`admin` role](security-reference/authorization.html#admin-role). For all other databases and tables, the user must have been granted either the [`CREATE`](grant.html#supported-privileges) or the [`ZONECONFIG`](grant.html#supported-privileges) privilege on the target database or table.

## Parameters

 Parameter | Description
-----------+-------------
`range_name` | The name of the system [range](architecture/glossary.html#architecture-range) whose [replication zone configurations](configure-replication-zones.html) you want to change.
`database_name` | The name of the [database](create-database.html) whose [replication zone configurations](configure-replication-zones.html) you want to change.<br> If you directly change a database's zone configuration with `ALTER DATABASE ... CONFIGURE ZONE`, CockroachDB will block all [`ALTER DATABASE ... SET PRIMARY REGION`](set-primary-region.html) statements on the database.
`table_name` | The name of the [table](create-table.html) whose [replication zone configurations](configure-replication-zones.html) you want to change.
`partition_name` | The name of the [partition](partitioning.html) whose [replication zone configurations](configure-replication-zones.html) you want to change.
`index_name` | The name of the [index](indexes.html) whose [replication zone configurations](configure-replication-zones.html) you want to change.
`variable` | The name of the [variable](#variables) to change.
`value` | The value of the variable to change.
`DISCARD` | Remove a replication zone.

### Variables

{% include {{ page.version.version }}/zone-configs/variables.md %}

## Viewing schema changes

{% include {{ page.version.version }}/misc/schema-change-view-job.md %}

## Examples

{% include {{ page.version.version }}/sql/movr-statements-geo-partitioned-replicas.md %}

### Edit a replication zone

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE users CONFIGURE ZONE USING range_min_bytes = 0, range_max_bytes = 90000, gc.ttlseconds = 89999, num_replicas = 4;
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

### Create a replication zone for a partition

{% include {{ page.version.version }}/zone-configs/create-a-replication-zone-for-a-table-partition.md %}

### Create a replication zone for a system range

{% include {{ page.version.version }}/zone-configs/create-a-replication-zone-for-a-system-range.md %}

### Reset a replication zone

{% include {{ page.version.version }}/zone-configs/reset-a-replication-zone.md %}

### Remove a replication zone

{% include {{ page.version.version }}/zone-configs/remove-a-replication-zone.md %}

## See also

- [Configure Replication Zones](configure-replication-zones.html)
- [`PARTITION BY`](partition-by.html)
- [`SHOW ZONE CONFIGURATIONS`](show-zone-configurations.html)
- [`ALTER DATABASE`](alter-database.html)
- [`ALTER TABLE`](alter-table.html)
- [`ALTER INDEX`](alter-index.html)
- [`ALTER PARTITION`](alter-partition.html)
- [`ALTER RANGE`](alter-range.html)
- [`SHOW JOBS`](show-jobs.html)
- [Table Partitioning](partitioning.html)
- [SQL Statements](sql-statements.html)
