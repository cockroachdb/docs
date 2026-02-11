---
title: SHOW ZONE CONFIGURATIONS
summary: Use the SHOW ZONE CONFIGURATIONS statement to list details about existing replication zones.
toc: true
docs_area: reference.sql
---

Use the `SHOW ZONE CONFIGURATIONS` [statement]({% link {{ page.version.version }}/sql-statements.md %}) to view details about existing [replication zones]({% link {{ page.version.version }}/configure-replication-zones.md %}).

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/show_zone.html %}
</div>

## Required privileges

No [privileges]({% link {{ page.version.version }}/security-reference/authorization.md %}#managing-privileges) are required to list replication zones.

## Parameters

Parameter | Description
----------|------------
`zone_name` | The name of the system [range]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-range) for which to show [replication zone configurations]({% link {{ page.version.version }}/configure-replication-zones.md %}).
`database_name` | The name of the [database]({% link {{ page.version.version }}/create-database.md %}) for which to show [replication zone configurations]({% link {{ page.version.version }}/configure-replication-zones.md %}).
`table_name` | The name of the [table]({% link {{ page.version.version }}/create-table.md %}) for which to show [replication zone configurations]({% link {{ page.version.version }}/configure-replication-zones.md %}).
`partition_name` | The name of the [partition]({% link {{ page.version.version }}/partitioning.md %}) for which to show [replication zone configurations]({% link {{ page.version.version }}/configure-replication-zones.md %}).
`index_name` | The name of the [index]({% link {{ page.version.version }}/indexes.md %}) for which to show [replication zone configurations]({% link {{ page.version.version }}/configure-replication-zones.md %}).

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

You can also use [`SHOW CREATE TABLE`]({% link {{ page.version.version }}/show-create.md %}) to view zone configurations for a table. If a table is partitioned, but no zones are configured, the `SHOW CREATE TABLE` output includes a warning.

### View the replication zone for an index

To control replication for a specific index,  use the [`ALTER INDEX ... CONFIGURE ZONE`]({% link {{ page.version.version }}/alter-index.md %}#configure-zone) statement to define the relevant values (other values will be inherited from the parent zone):

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER INDEX vehicles@vehicles_auto_index_fk_city_ref_users CONFIGURE ZONE USING num_replicas = 5, gc.ttlseconds = 100000;
~~~

~~~
CONFIGURE ZONE 1
~~~

{% include_cached copy-clipboard.html %}
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

{% include {{page.version.version}}/sql/use-multiregion-instead-of-partitioning.md %}

{% include {{ page.version.version }}/zone-configs/create-a-replication-zone-for-a-table-partition.md %}

## See also

- [Replication Controls]({% link {{ page.version.version }}/configure-replication-zones.md %})
- [`ALTER DATABASE ... CONFIGURE ZONE`]({% link {{ page.version.version }}/alter-database.md %}#configure-zone)
- [`ALTER INDEX ... CONFIGURE ZONE`]({% link {{ page.version.version }}/alter-index.md %}#configure-zone)
- [`ALTER RANGE ... CONFIGURE ZONE`]({% link {{ page.version.version }}/alter-range.md %}#configure-zone)
- [`ALTER TABLE ... CONFIGURE ZONE`]({% link {{ page.version.version }}/alter-table.md %}#configure-zone)
- [SQL Statements]({% link {{ page.version.version }}/sql-statements.md %})
- [Troubleshoot Replication Zones]({% link {{ page.version.version}}/troubleshoot-replication-zones.md %})
