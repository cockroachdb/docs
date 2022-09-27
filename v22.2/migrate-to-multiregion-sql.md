---
title: Migrate to Multi-Region SQL
summary: Learn how to migrate to CockroachDB multi-region SQL user features.
toc: true
docs_area: deploy
---

This page describes how to migrate a multi-region cluster from using replication zones to using multi-region SQL abstractions.

## Overview

{{site.data.alerts.callout_info}}
If you are already using [multi-region SQL statements](multiregion-overview.html) to control your multi-region cluster, you can ignore this page.
{{site.data.alerts.end}}

CockroachDB v21.1 added support for [improved multi-region capabilities that make it easier to run global applications](multiregion-overview.html). Using high-level SQL statements, you can control where your data is stored and how it is accessed to provide good performance and tunable latency for your application's users.

Prior to v21.1, the only way to accomplish these goals in a multi-region cluster involved using lower-level mechanisms called [replication zones](configure-replication-zones.html) in specific patterns called _Duplicate indexes_, _Geo-partitioned replicas_, and _Geo-partitioned leaseholders_.

These patterns and the use of replication zones are still fully supported. However, for most users, they are harder to use and in some cases can result in worse performance than the multi-region SQL abstractions.

This page discusses:

- Mappings from each of the legacy replication-zone-based patterns to the multi-region SQL abstractions that are designed to replace them.

- Instructions for migrating from replication-zone-based workflows to multi-region SQL abstractions.

- A review of the underlying zone configuration changes that result from running the multi-region SQL statements.

## Replication zone patterns and multi-region SQL abstractions

{% include {{page.version.version}}/sql/replication-zone-patterns-to-multiregion-sql-mapping.md %}

{{site.data.alerts.callout_info}}
CockroachDB will no longer provide the [Follow-the-Workload](topology-follow-the-workload.html) pattern's behavior for a database if you use the [multi-region SQL statements](multiregion-overview.html) with that database. In other words, the multi-region SQL statements do not provide a behavior that is analogous to Follow-the-Workload.
{{site.data.alerts.end}}

For more information about how to use `ZONE` vs. `REGION` survival goals, see [When to Use `ZONE` vs. `REGION` Survival Goals](when-to-use-zone-vs-region-survival-goals.html).

For more information about when to use `GLOBAL` vs. `REGIONAL` tables, see [When to `Use` `REGIONAL` vs. `GLOBAL` Tables](when-to-use-regional-vs-global-tables.html).

## How to migrate a database to the multi-region SQL abstractions

The following instructions assume that you will re-use your existing [cluster regions](multiregion-overview.html#cluster-regions) (that is, regions added during cluster setup using [`cockroach start --locality`](cockroach-start.html#locality)).

### Performance considerations

Expect performance to be temporarily affected by this process. When you run the commands described below, the cluster may need to do a significant amount of work to meet the new replica placement constraints it has just been given. Therefore, we recommend running this procedure at a time when you would normally perform scheduled maintenance.

Depending on how long you are willing to wait between steps for the replica rebalancing process to settle down, data movement may still be occurring when the next set of constraints is added using the multi-region SQL abstractions; this may lead to further data movement.

In other words, the process described here may result in a significant increase in CPU usage, IOPS, and network traffic while the cluster rebalances replicas to meet the final set of constraints you have provided it with. Until this process completes, the cluster may not be able to handle its normal workload.

Note that the process of dropping the old zone configs that occurs when the old configurations are removed **must be complete** before you can [add regions to the database](add-region.html) and set [table localities](set-locality.html). You can ensure this process is complete by waiting for the [`ALTER DATABASE ... CONFIGURE ZONE DISCARD`](configure-zone.html#remove-a-replication-zone) statement shown below to finish successfully.

For a tutorial that shows how to transition a database to using multi-region SQL statements, see [Low Latency Reads and Writes in a Multi-Region Cluster](demo-low-latency-multi-region-deployment.html).

{{site.data.alerts.callout_info}}
As part of this migration, data may move temporarily out of the geography where you have constrained it to be placed. For more information about CockroachDB's support for data domiciling, see [Data Domiciling with CockroachDB](data-domiciling.html).
{{site.data.alerts.end}}

### Step 1. Remove the old replication zone configurations

Depending on which [legacy multi-region topology pattern](../v20.2/topology-patterns.html#multi-region-patterns) you are migrating from, the procedure will vary. For instructions showing how to remove the existing zone configuration for each pattern, see below.

- [Duplicate indexes](#duplicate-indexes)
- [Geo-partitioned leaseholders](#geo-partitioned-leaseholders)
- [Geo-partitioned replicas](#geo-partitioned-replicas)

{{site.data.alerts.callout_success}}
You can check the state of any schema object's replication zone configuration at any time using [`SHOW ZONE CONFIGURATIONS`](show-zone-configurations.html).
{{site.data.alerts.end}}

#### Duplicate indexes

If you used the [duplicate indexes pattern][dupe_index], the steps for backing out the old configuration are:

1. Remove the replication zone configurations you added using the [`ALTER DATABASE ... CONFIGURE ZONE DISCARD`](configure-zone.html#remove-a-replication-zone) statement. Note that this will remove all zone configurations from the table. If you had any additional customizations beyond what are required for the [duplicate indexes][dupe_index] pattern, you will have to reapply them.

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER TABLE postal_codes CONFIGURE ZONE DISCARD;
    ~~~

1. Drop the extra indexes you added. This will have the side effect of also deleting the zone configurations you added to those indexes.

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    DROP INDEX postal_codes@idx_central;
    DROP INDEX postal_codes@idx_east;
    ~~~

The latency and resiliency benefits of the duplicate indexes pattern can be replaced by making `postal_codes` a [`GLOBAL` table](global-tables.html) with a [survival goal](multiregion-overview.html#survival-goals) that meets your needs.

#### Geo-partitioned replicas

If you applied the [geo-partitioned replicas][geo_replicas] pattern, the steps for backing out the old configuration are:

1. Remove the manually created table partition. This will also automatically remove the replication zone configurations that were applied to the partition as part of the instructions.

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER TABLE users PARTITION BY NOTHING;
    ~~~

1. Remove the manually created partition on the secondary indexes. This will also automatically remove the replication zone configurations that were applied to the partition as part of the instructions.

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER INDEX users_last_name_index PARTITION BY NOTHING;
    ~~~

The latency and resiliency benefits of the geo-partitioned replicas pattern can be replaced by making `users` a [`REGIONAL BY ROW` table](regional-tables.html#regional-by-row-tables) with a [`ZONE` survival goal](multiregion-overview.html#surviving-zone-failures).

{{site.data.alerts.callout_info}}
The multi-region SQL abstractions use a hidden [`crdb_region`](set-locality.html#crdb_region) column to represent the row's home region. You may need to modify your existing schema to take this into account. For example, if you already have a column you are using to denote each row's home region, you can use that name instead of `crdb_region` by following the instructions on the [`ALTER TABLE ... SET LOCALITY`](set-locality.html#rename-crdb_region) page.
{{site.data.alerts.end}}

#### Geo-partitioned leaseholders

If you applied the [geo-partitioned leaseholders][geo_leaseholders] pattern, the steps for backing out the old configuration are:

1. Remove the manually created table partition. This will also automatically remove the replication zone configurations that were applied to the partition as part of the instructions.

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER TABLE users PARTITION BY NOTHING;
    ~~~

1. Remove the manually created partition on the secondary indexes. This will also automatically remove the replication zone configurations that were applied to the partition as part of the instructions.

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER INDEX users_last_name_index PARTITION BY NOTHING;
    ~~~

The latency and resiliency benefits of the geo-partitioned leaseholders pattern can be replaced by making `users` a [`REGIONAL BY ROW` table](regional-tables.html#regional-by-row-tables) with a [`ZONE` survival goal](multiregion-overview.html#surviving-zone-failures).

### Step 2. Add a primary region to your database

The steps from this point forward assume that you have cleared your prior replication zone configurations and will be using the [multi-region SQL abstractions](multiregion-overview.html) to work with a cluster that has existing [cluster regions](multiregion-overview.html#cluster-regions).

Every multi-region database needs to have a primary region. To set the primary region, issue the [SET PRIMARY REGION](set-primary-region.html) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE foo SET PRIMARY REGION = "us-west1"
~~~

### Step 3. Add more regions to the database

To add another region to the database, issue the [`ADD REGION`](add-region.html) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE foo ADD REGION "us-central1";
~~~

### Step 4. (Optional) Configure your database survival goal

Depending on your desired database [survival goal](multiregion-overview.html#survival-goals), you can choose from the following settings:

- [`ZONE` survival](multiregion-overview.html#surviving-zone-failures) (Default): the database will remain fully available for reads and writes if one zone in a region goes down. More than one zone going down concurrently may affect availability.
- [`REGION` survival](multiregion-overview.html#surviving-region-failures): the database will remain fully available for reads and writes if one region goes down. More than one region going down concurrently may affect availability.

For example, to set a region survival goal, issue the following SQL statement:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE foo SURVIVE REGION FAILURE;
~~~

For more information about when to use `ZONE` vs. `REGION` survival goals, see [When to Use `ZONE` vs. `REGION` Survival Goals](when-to-use-zone-vs-region-survival-goals.html).

### Step 5. Configure table localities

For each table in your database, apply the [table locality](multiregion-overview.html#table-locality) that provides the latency and resiliency requirements you need for that table.

As described in [Replication zone patterns and multi-region SQL abstractions](#replication-zone-patterns-and-multi-region-sql-abstractions), the mapping from legacy replication zone patterns to multi-region SQL abstractions is:

{% include {{page.version.version}}/sql/replication-zone-patterns-to-multiregion-sql-mapping.md %}

For example, to configure the `postal_codes` table from the [duplicate indexes example](#duplicate-indexes) to use [multi-region SQL](multiregion-overview.html), you would enter the following statements to make the `postal_codes` table a [`GLOBAL` table](global-tables.html):

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE postal_codes SET LOCALITY GLOBAL;
~~~

For more information about when to use `GLOBAL` vs. `REGIONAL` tables, see [When to Use `REGIONAL` vs. `GLOBAL` Tables](when-to-use-regional-vs-global-tables.html).

### Step 6. (Optional) View the updated zone configurations

The multi-region SQL statements operate on the same replication zone configurations that you have access to via the [`ALTER TABLE ... CONFIGURE ZONE`](configure-zone.html) statement. If you are interested in seeing how they work with the lower-level zone config mechanisms, you can use the [`SHOW ZONE CONFIGURATIONS`](show-zone-configurations.html) statement to view the zone configurations.

For example, given a multi-region demo cluster set up using the instructions in [Low Latency Reads and Writes in a Multi-Region Cluster](demo-low-latency-multi-region-deployment.html), here is what the zone configs for several tables in the [MovR schema](movr.html) look like.

#### Regional by row tables

A [`REGIONAL BY ROW`](multiregion-overview.html#regional-by-row-tables) table differs from the default by setting the following zone configuration settings:

- [`num_replicas`](configure-replication-zones.html#num_replicas)
- [`num_voters`](configure-replication-zones.html#num_voters)
- [`constraints`](configure-replication-zones.html#constraints)
- [`voter_constraints`](configure-replication-zones.html#voter_constraints)
- [`lease_preferences`](configure-replication-zones.html#lease_preferences)

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW ZONE CONFIGURATION FROM TABLE users;
~~~

~~~
     target     |                                      raw_config_sql
----------------+-------------------------------------------------------------------------------------------
  DATABASE movr | ALTER DATABASE movr CONFIGURE ZONE USING
                |     range_min_bytes = 134217728,
                |     range_max_bytes = 536870912,
                |     gc.ttlseconds = 90000,
                |     num_replicas = 5,
                |     num_voters = 3,
                |     constraints = '{+region=europe-west1: 1, +region=us-east1: 1, +region=us-west1: 1}',
                |     voter_constraints = '[+region=us-east1]',
                |     lease_preferences = '[[+region=us-east1]]'
(1 row)
~~~

The same table, loaded in a demo cluster with no zone configuration changes, looks like this:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW ZONE CONFIGURATION FROM TABLE users;
~~~

~~~
     target     |              raw_config_sql
----------------+-------------------------------------------
  RANGE default | ALTER RANGE default CONFIGURE ZONE USING
                |     range_min_bytes = 134217728,
                |     range_max_bytes = 536870912,
                |     gc.ttlseconds = 90000,
                |     num_replicas = 3,
                |     constraints = '[]',
                |     lease_preferences = '[]'
(1 row)

~~~

#### Global tables

A [`GLOBAL`](global-tables.html) table differs from the default by setting the following zone configuration settings:

- [`global_reads`](configure-replication-zones.html#global_reads)
- [`num_replicas`](configure-replication-zones.html#num_replicas)
- [`num_voters`](configure-replication-zones.html#num_voters)
- [`constraints`](configure-replication-zones.html#constraints)
- [`voter_constraints`](configure-replication-zones.html#voter_constraints)
- [`lease_preferences`](configure-replication-zones.html#lease_preferences)

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW ZONE CONFIGURATION FROM TABLE promo_codes;
~~~

~~~
       target       |                                      raw_config_sql
--------------------+-------------------------------------------------------------------------------------------
  TABLE promo_codes | ALTER TABLE promo_codes CONFIGURE ZONE USING
                    |     range_min_bytes = 134217728,
                    |     range_max_bytes = 536870912,
                    |     gc.ttlseconds = 90000,
                    |     global_reads = true,
                    |     num_replicas = 5,
                    |     num_voters = 3,
                    |     constraints = '{+region=europe-west1: 1, +region=us-east1: 1, +region=us-west1: 1}',
                    |     voter_constraints = '[+region=us-east1]',
                    |     lease_preferences = '[[+region=us-east1]]'
(1 row)
~~~

The same table, loaded in a demo cluster with no zone configuration changes, looks like this:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW ZONE CONFIGURATION FROM TABLE promo_codes;
~~~

~~~
     target     |              raw_config_sql
----------------+-------------------------------------------
  RANGE default | ALTER RANGE default CONFIGURE ZONE USING
                |     range_min_bytes = 134217728,
                |     range_max_bytes = 536870912,
                |     gc.ttlseconds = 90000,
                |     num_replicas = 3,
                |     constraints = '[]',
                |     lease_preferences = '[]'
(1 row)
~~~

## See also

- [Multi-Region Capabilities Overview](multiregion-overview.html)
- [When to Use `REGIONAL` vs. `GLOBAL` Tables](when-to-use-regional-vs-global-tables.html)
- [When to Use `ZONE` vs. `REGION` Survival Goals](when-to-use-zone-vs-region-survival-goals.html)
- [Topology Patterns](topology-patterns.html)
- [Disaster Recovery](disaster-recovery.html)
- [Low Latency Reads and Writes in a Multi-Region Cluster](demo-low-latency-multi-region-deployment.html)
- [Configure Replication Zones](configure-replication-zones.html)
- [Non-voting replicas](architecture/replication-layer.html#non-voting-replicas)
- [Secondary regions](multiregion-overview.html#secondary-regions)
- [`SET SECONDARY REGION`](set-secondary-region.html)
- [`DROP SECONDARY REGION`](drop-secondary-region.html)
- [Zone Config Extensions](zone-config-extensions.html)

<!-- Reference Links -->

[dupe_index]:       https://www.cockroachlabs.com/docs/v20.2/topology-duplicate-indexes.html
[geo_replicas]:     https://www.cockroachlabs.com/docs/v20.2/topology-geo-partitioned-replicas.html
[geo_leaseholders]: https://www.cockroachlabs.com/docs/v20.2/topology-geo-partitioned-leaseholders.html
