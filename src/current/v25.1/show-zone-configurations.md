---
title: SHOW ZONE CONFIGURATIONS
summary: Use the SHOW ZONE CONFIGURATIONS statement to list details about existing replication zones.
toc: true
docs_area: reference.sql
---

Use the `SHOW ZONE CONFIGURATIONS` [statement]({{ page.version.version }}/sql-statements.md) to view details about existing [replication zones]({{ page.version.version }}/configure-replication-zones.md).

## Synopsis

<div>
</div>

## Required privileges

No [privileges]({{ page.version.version }}/security-reference/authorization.md#managing-privileges) are required to list replication zones.

## Parameters

Parameter | Description
----------|------------
`zone_name` | The name of the system [range]({{ page.version.version }}/architecture/overview.md#architecture-range) for which to show [replication zone configurations]({{ page.version.version }}/configure-replication-zones.md).
`database_name` | The name of the [database]({{ page.version.version }}/create-database.md) for which to show [replication zone configurations]({{ page.version.version }}/configure-replication-zones.md).
`table_name` | The name of the [table]({{ page.version.version }}/create-table.md) for which to show [replication zone configurations]({{ page.version.version }}/configure-replication-zones.md).
`partition_name` | The name of the [partition]({{ page.version.version }}/partitioning.md) for which to show [replication zone configurations]({{ page.version.version }}/configure-replication-zones.md).
`index_name` | The name of the [index]({{ page.version.version }}/indexes.md) for which to show [replication zone configurations]({{ page.version.version }}/configure-replication-zones.md).

## Examples


### View all replication zones


### View the default replication zone for the cluster


### View the replication zone for a database


### View the replication zone for a table


You can also use [`SHOW CREATE TABLE`]({{ page.version.version }}/show-create.md) to view zone configurations for a table. If a table is partitioned, but no zones are configured, the `SHOW CREATE TABLE` output includes a warning.

### View the replication zone for an index

To control replication for a specific index,  use the `ALTER INDEX ... CONFIGURE ZONE` statement to define the relevant values (other values will be inherited from the parent zone):

~~~ sql
> ALTER INDEX vehicles@vehicles_auto_index_fk_city_ref_users CONFIGURE ZONE USING num_replicas = 5, gc.ttlseconds = 100000;
~~~

~~~
CONFIGURE ZONE 1
~~~

~~~ sql
> SHOW ZONE CONFIGURATION FROM INDEX vehicles@vehicles_auto_index_fk_city_ref_users;
~~~

~~~
                         target                        |                                 raw_config_sql
-------------------------------------------------------+----------------------------------------------------------------------------------
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



## See also

- [Replication Controls]({{ page.version.version }}/configure-replication-zones.md)
- [`ALTER DATABASE ... CONFIGURE ZONE`]({{ page.version.version }}/alter-database.md#configure-zone)
- [`ALTER INDEX ... CONFIGURE ZONE`]({{ page.version.version }}/alter-index.md#configure-zone)
- [`ALTER RANGE ... CONFIGURE ZONE`]({{ page.version.version }}/alter-range.md#configure-zone)
- [`ALTER TABLE ... CONFIGURE ZONE`]({{ page.version.version }}/alter-table.md#configure-zone)
- [SQL Statements]({{ page.version.version }}/sql-statements.md)