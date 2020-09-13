---
title: SHOW ZONE CONFIGURATIONS
summary: Use the SHOW ZONE CONFIGURATIONS statement to list details about existing replication zones.
toc: true
---

Use the `SHOW ZONE CONFIGURATIONS` [statement](sql-statements.html) to view details about existing [replication zones](configure-replication-zones.html).

## Synopsis

<div>
{% include {{ page.version.version }}/sql/diagrams/show_zone.html %}
</div>

## Required privileges

No [privileges](authorization.html#assign-privileges) are required to list replication zones.

## Parameters

Parameter | Description
----------|------------
`range_name` | The name of the system [range](architecture/overview.html#glossary) for which to show [replication zone configurations](configure-replication-zones.html).
`database_name` | The name of the [database](create-database.html) for which to show [replication zone configurations](configure-replication-zones.html).
`table_name` | The name of the [table](create-table.html) for which to show [replication zone configurations](configure-replication-zones.html).
`partition_name` | The name of the [partition](partitioning.html) for which to show [replication zone configurations](configure-replication-zones.html).
`index_name` | The name of the [index](indexes.html) for which to show [replication zone configurations](configure-replication-zones.html).

## Examples

{% include {{ page.version.version }}/sql/movr-statements-geo-partitioned-replicas.md %}

### View all replication zones

{% include {{ page.version.version }}/zone-configs/view-all-replication-zones.md %}

### View the default replication zone for the cluster

{% include {{ page.version.version }}/zone-configs/view-the-default-replication-zone.md %}

### View the replication zone for a database

{% include {{ page.version.version }}/zone-configs/create-a-replication-zone-for-a-database.md %}

### View the replication zone for a table

{% include {{ page.version.version }}/zone-configs/create-a-replication-zone-for-a-table.md %}

You can also use [`SHOW CREATE TABLE`](show-create.html) to view zone configurations for a table. If a table is partitioned, but no zones are configured, the `SHOW CREATE TABLE` output includes a warning.

### View the replication zone for an index

To control replication for a specific table,  use the `ALTER INDEX ... CONFIGURE ZONE` statement to define the relevant values (other values will be inherited from the parent zone):

{% include copy-clipboard.html %}
~~~ sql
> ALTER INDEX vehicles@vehicles_auto_index_fk_city_ref_users CONFIGURE ZONE USING num_replicas = 5, gc.ttlseconds = 100000;
~~~

~~~
CONFIGURE ZONE 1
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW ZONE CONFIGURATION FOR INDEX vehicles@vehicles_auto_index_fk_city_ref_users;
~~~

~~~
                         target                        |                                 raw_config_sql
+------------------------------------------------------+---------------------------------------------------------------------------------+
  INDEX vehicles@vehicles_auto_index_fk_city_ref_users | ALTER INDEX vehicles@vehicles_auto_index_fk_city_ref_users CONFIGURE ZONE USING
                                                       |     range_min_bytes = 134217728,
                                                       |     range_max_bytes = 536870912,
                                                       |     gc.ttlseconds = 100000,
                                                       |     num_replicas = 5,
                                                       |     constraints = '[]',
                                                       |     lease_preferences = '[]'
(1 row)
~~~

### View the replication zone for a partition

{% include {{ page.version.version }}/zone-configs/create-a-replication-zone-for-a-table-partition.md %}

## See also

- [Configure Replication Zones](configure-replication-zones.html)
- [`CONFIGURE ZONE`](configure-zone.html)
- [`ALTER DATABASE`](alter-database.html)
- [`ALTER INDEX`](alter-index.html)
- [`ALTER RANGE`](alter-range.html)
- [`ALTER TABLE`](alter-table.html)
- [SQL Statements](sql-statements.html)
