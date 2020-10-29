---
title: Configure Replication Zones
summary: In CockroachDB, you use replication zones to control the number and location of replicas for specific sets of data.
keywords: ttl, time to live, availability zone
toc: true
---

Replication zones give you the power to control what data goes where in your CockroachDB cluster.  Specifically, they are used to control the number and location of replicas for data belonging to the following objects:

- Databases
- Tables
- Rows ([enterprise-only](enterprise-licensing.html))
- Indexes ([enterprise-only](enterprise-licensing.html))
- All data in the cluster, including internal system data ([via the default replication zone](#view-the-default-replication-zone))

For each of the above objects you can control:

- How many copies of each range to spread through the cluster.
- Which constraints are applied to which data, e.g., "table X's data can only be stored in the German availability zones".
- The maximum size of ranges (how big ranges get before they are split).
- How long old data is kept before being garbage collected.
- Where you would like the leaseholders for certain ranges to be located, e.g., "for ranges that are already constrained to have at least one replica in `region=us-west`, also try to put their leaseholders in `region=us-west`".

This page explains how replication zones work and how to use the [`CONFIGURE ZONE`](configure-zone.html) statement to manage them.

{{site.data.alerts.callout_info}}
Currently, only members of the `admin` role can configure replication zones. By default, the `root` user belongs to the `admin` role.
{{site.data.alerts.end}}

## Overview

Every [range](architecture/overview.html#glossary) in the cluster is part of a replication zone.  Each range's zone configuration is taken into account as ranges are rebalanced across the cluster to ensure that any constraints are honored.

When a cluster starts, there are two categories of replication zone:

1. Pre-configured replication zones that apply to internal system data.
2. A single default replication zone that applies to the rest of the cluster.

You can adjust these pre-configured zones as well as add zones for individual databases, tables, rows, and secondary indexes as needed.  Note that adding zones for rows and secondary indexes is [enterprise-only](enterprise-licensing.html).

For example, you might rely on the [default zone](#view-the-default-replication-zone) to spread most of a cluster's data across all of your availability zones, but [create a custom replication zone for a specific database](#create-a-replication-zone-for-a-database) to make sure its data is only stored in certain availability zones and/or geographies.

## Replication zone levels

There are five replication zone levels for [**table data**](architecture/distribution-layer.html#table-data) in a cluster, listed from least to most granular:

Level | Description
------|------------
Cluster | CockroachDB comes with a pre-configured `default` replication zone that applies to all table data in the cluster not constrained by a database, table, or row-specific replication zone. This zone can be adjusted but not removed. See [View the Default Replication Zone](#view-the-default-replication-zone) and [Edit the Default Replication Zone](#edit-the-default-replication-zone) for more details.
Database | You can add replication zones for specific databases. See [Create a Replication Zone for a Database](#create-a-replication-zone-for-a-database) for more details.
Table | You can add replication zones for specific tables. See [Create a Replication Zone for a Table](#create-a-replication-zone-for-a-table).
Index ([Enterprise-only](enterprise-licensing.html)) | The [secondary indexes](indexes.html) on a table will automatically use the replication zone for the table. However, with an enterprise license, you can add distinct replication zones for secondary indexes. See [Create a Replication Zone for a Secondary Index](#create-a-replication-zone-for-a-secondary-index) for more details.
Row ([Enterprise-only](enterprise-licensing.html)) | You can add replication zones for specific rows in a table or secondary index by [defining table partitions](partitioning.html). See [Create a Replication Zone for a Table Partition](#create-a-replication-zone-for-a-partition) for more details.

### For system data

In addition, CockroachDB stores internal [**system data**](architecture/distribution-layer.html#monolithic-sorted-map-structure) in what are called system ranges. There are two replication zone levels for this internal system data, listed from least to most granular:

Level | Description
------|------------
Cluster | The `default` replication zone mentioned above also applies to all system ranges not constrained by a more specific replication zone.
System Range | CockroachDB comes with pre-configured replication zones for important system ranges, such as the "meta" and "liveness" ranges. If necessary, you can add replication zones for the "timeseries" range and other system ranges as well. Editing replication zones for system ranges may override settings from `default`. See [Create a Replication Zone for a System Range](#create-a-replication-zone-for-a-system-range) for more details.<br><br>CockroachDB also comes with pre-configured replication zones for the internal `system` database and the `system.jobs` table, which stores metadata about long-running jobs such as schema changes and backups.

### Level priorities

When replicating data, whether table or system, CockroachDB always uses the most granular replication zone available. For example, for a piece of user data:

1. If there's a replication zone for the row, CockroachDB uses it.
2. If there's no applicable row replication zone and the row is from a secondary index, CockroachDB uses the secondary index replication zone.
3. If the row isn't from a secondary index or there is no applicable secondary index replication zone, CockroachDB uses the table replication zone.
4. If there's no applicable table replication zone, CockroachDB uses the database replication zone.
5. If there's no applicable database replication zone, CockroachDB uses the `default` cluster-wide replication zone.

## Manage replication zones

Use the [`CONFIGURE ZONE`](configure-zone.html) statement to [add](#create-a-replication-zone-for-a-system-range), [modify](#edit-the-default-replication-zone), [reset](#reset-a-replication-zone), and [remove](#remove-a-replication-zone) replication zones.

### Replication zone variables

Use the [`ALTER ... CONFIGURE ZONE`](configure-zone.html) [statement](sql-statements.html) to set a replication zone:

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE t CONFIGURE ZONE USING range_min_bytes = 0, range_max_bytes = 90000, gc.ttlseconds = 89999, num_replicas = 5, constraints = '[-region=west]';
~~~

{% include {{page.version.version}}/zone-configs/variables.md %}

### Replication constraints

The location of replicas, both when they are first added and when they are rebalanced to maintain cluster equilibrium, is based on the interplay between descriptive attributes assigned to nodes and constraints set in zone configurations.

{{site.data.alerts.callout_success}}For demonstrations of how to set node attributes and replication constraints in different scenarios, see <a href="#scenario-based-examples">Scenario-based Examples</a> below.{{site.data.alerts.end}}

#### Descriptive attributes assigned to nodes

When starting a node with the [`cockroach start`](cockroach-start.html) command, you can assign the following types of descriptive attributes:

Attribute Type | Description
---------------|------------
**Node Locality** | <a name="zone-config-node-locality"></a> Using the [`--locality`](cockroach-start.html#locality) flag, you can assign arbitrary key-value pairs that describe the location of the node. Locality might include region, country, availability zone, etc. The key-value pairs should be ordered into _locality tiers_ that range from most inclusive to least inclusive (e.g., region before availability zone as in `region=eu,az=paris`), and the keys and the order of key-value pairs must be the same on all nodes. It's typically better to include more pairs than fewer. For example:<br><br>`--locality=region=east,az=us-east-1`<br>`--locality=region=east,az=us-east-2`<br>`--locality=region=west,az=us-west-1`<br><br>CockroachDB attempts to spread replicas evenly across the cluster based on locality, with the order of locality tiers determining the priority. Locality can also be used to influence the location of data replicas in various ways using replication zones.<br><br>When there is high latency between nodes, CockroachDB uses locality to move range leases closer to the current workload, reducing network round trips and improving read performance. See [Follow-the-workload](topology-follow-the-workload.html) for more details.
**Node Capability** | Using the `--attrs` flag, you can specify node capability, which might include specialized hardware or number of cores, for example:<br><br>`--attrs=ram:64gb`
**Store Type/Capability** | Using the `attrs` field of the `--store` flag, you can specify disk type or capability, for example:<br><br>`--store=path=/mnt/ssd01,attrs=ssd`<br>`--store=path=/mnt/hda1,attrs=hdd:7200rpm`

#### Types of constraints

The node-level and store-level descriptive attributes mentioned above can be used as the following types of constraints in replication zones to influence the location of replicas. However, note the following general guidance:

- When locality is the only consideration for replication, it's recommended to set locality on nodes without specifying any constraints in zone configurations. In the absence of constraints, CockroachDB attempts to spread replicas evenly across the cluster based on locality.
- Required and prohibited constraints are useful in special situations where, for example, data must or must not be stored in a specific country or on a specific type of machine.
- Avoid conflicting constraints. CockroachDB returns an error if you:
    - Redefine a required constraint key within the same `constraints` definition on all replicas. For example, `constraints = '[+region=west, +region=east]'` will result in an error.
    - Define a required and prohibited definition for the same key-value pair. For example, `constraints = '[-region=west, +region=west]'` will result in an error.

Constraint Type | Description | Syntax
----------------|-------------|-------
**Required** | When placing replicas, the cluster will consider only nodes/stores with matching attributes or localities. When there are no matching nodes/stores, new replicas will not be added. | `+ssd`
**Prohibited** | When placing replicas, the cluster will ignore nodes/stores with matching attributes or localities. When there are no alternate nodes/stores, new replicas will not be added. | `-ssd`

#### Scope of constraints

Constraints can be specified such that they apply to all replicas in a zone or such that different constraints apply to different replicas, meaning you can effectively pick the exact location of each replica.

Constraint Scope | Description | Syntax
-----------------|-------------|-------
**All Replicas** | Constraints specified using JSON array syntax apply to all replicas in every range that's part of the replication zone. | `constraints = '[+ssd, -region=west]'`
**Per-Replica** | Multiple lists of constraints can be provided in a JSON object, mapping each list of constraints to an integer number of replicas in each range that the constraints should apply to.<br><br>The total number of replicas constrained cannot be greater than the total number of replicas for the zone (`num_replicas`). However, if the total number of replicas constrained is less than the total number of replicas for the zone, the non-constrained replicas will be allowed on any nodes/stores.<br><br>Note that per-replica constraints must be "required" (e.g., `'{"+region=west": 1}'`); they cannot be "prohibited" (e.g., `'{"-region=west": 1}'`). Also, when defining per-replica constraints on a database or table, `num_replicas` must be specified as well, but not when defining per-replica constraints on an index or partition.<br><br>See the [Per-replica constraints](#per-replica-constraints-to-specific-availability-zones) example for more details. | `constraints = '{"+ssd,+region=west": 2, "+region=east": 1}', num_replicas = 3`

### Node/replica recommendations

See [Cluster Topography](recommended-production-settings.html#topology) recommendations for production deployments.

### Troubleshooting zone constraint violations

To see if any of the data placement constraints defined in your replication zone configurations are being violated, use the `system.replication_constraint_stats` report as described in [Replication Reports](query-replication-reports.html).

## View replication zones

Use the [`SHOW ZONE CONFIGURATIONS`](#view-all-replication-zones) statement to view details about existing replication zones.

You can also use the [`SHOW PARTITIONS`](show-partitions.html) statement to view the zone constraints on existing table partitions, or [`SHOW CREATE TABLE`](show-create.html) to view zone configurations for a table.

{% include {{page.version.version}}/sql/crdb-internal-partitions.md %}

## Basic examples

{% include {{ page.version.version }}/sql/movr-statements-geo-partitioned-replicas.md %}

These examples focus on the basic approach and syntax for working with zone configuration. For examples demonstrating how to use constraints, see [Scenario-based examples](#scenario-based-examples).

For more examples, see [`CONFIGURE ZONE`](configure-zone.html) and [`SHOW ZONE CONFIGURATIONS`](show-zone-configurations.html).

### View all replication zones

{% include {{ page.version.version }}/zone-configs/view-all-replication-zones.md %}

For more information, see [`SHOW ZONE CONFIGURATIONS`](show-zone-configurations.html).

### View the default replication zone

{% include {{ page.version.version }}/zone-configs/view-the-default-replication-zone.md %}

For more information, see [`SHOW ZONE CONFIGURATIONS`](show-zone-configurations.html).

### Edit the default replication zone

{% include {{ page.version.version }}/zone-configs/edit-the-default-replication-zone.md %}

For more information, see [`CONFIGURE ZONE`](configure-zone.html).

### Create a replication zone for a system range

{% include {{ page.version.version }}/zone-configs/create-a-replication-zone-for-a-system-range.md %}

For more information, see [`CONFIGURE ZONE`](configure-zone.html).

### Create a replication zone for a database

{% include {{ page.version.version }}/zone-configs/create-a-replication-zone-for-a-database.md %}

For more information, see [`CONFIGURE ZONE`](configure-zone.html).

### Create a replication zone for a table

{% include {{ page.version.version }}/zone-configs/create-a-replication-zone-for-a-table.md %}

For more information, see [`CONFIGURE ZONE`](configure-zone.html).

### Create a replication zone for a secondary index

{% include {{ page.version.version }}/zone-configs/create-a-replication-zone-for-a-secondary-index.md %}

For more information, see [`CONFIGURE ZONE`](configure-zone.html).

### Create a replication zone for a partition

{% include {{ page.version.version }}/zone-configs/create-a-replication-zone-for-a-table-partition.md %}

For more information, see [`CONFIGURE ZONE`](configure-zone.html).

### Reset a replication zone

{% include {{ page.version.version }}/zone-configs/reset-a-replication-zone.md %}

For more information, see [`CONFIGURE ZONE`](configure-zone.html).

### Remove a replication zone

{% include {{ page.version.version }}/zone-configs/remove-a-replication-zone.md %}

For more information, see [`CONFIGURE ZONE`](configure-zone.html).

### Constrain leaseholders to specific availability zones

{% include {{ page.version.version }}/zone-configs/constrain-leaseholders-to-specific-datacenters.md %}

For more information, see [`CONFIGURE ZONE`](configure-zone.html).

## Scenario-based examples

### Even replication across availability zones

**Scenario:**

- You have 6 nodes across 3 availability zones, 2 nodes in each availability zone.
- You want data replicated 3 times, with replicas balanced evenly across all three availability zones.

**Approach:**

1. Start each node with its availability zone location specified in the [`--locality`](cockroach-start.html#locality) flag:

    Availability zone 1:

    ~~~ shell
    $ cockroach start --insecure --advertise-addr=<node1 hostname> --locality=az=us-1 \
    --join=<node1 hostname>,<node3 hostname>,<node5 hostname>
    $ cockroach start --insecure --advertise-addr=<node2 hostname> --locality=az=us-1 \
    --join=<node1 hostname>,<node3 hostname>,<node5 hostname>
    ~~~

    Availability zone 2:

    ~~~ shell
    $ cockroach start --insecure --advertise-addr=<node3 hostname> --locality=az=us-2 \
    --join=<node1 hostname>,<node3 hostname>,<node5 hostname>
    $ cockroach start --insecure --advertise-addr=<node4 hostname> --locality=az=us-2 \
    --join=<node1 hostname>,<node3 hostname>,<node5 hostname>
    ~~~

    Availability zone 3:

    ~~~ shell
    $ cockroach start --insecure --advertise-addr=<node5 hostname> --locality=az=us-3 \
    --join=<node1 hostname>,<node3 hostname>,<node5 hostname>
    $ cockroach start --insecure --advertise-addr=<node6 hostname> --locality=az=us-3 \
    --join=<node1 hostname>,<node3 hostname>,<node5 hostname>
    ~~~

2. Initialize the cluster:

    ~~~ shell
    $ cockroach init --insecure --host=<any node hostname>
    ~~~

There's no need to make zone configuration changes; by default, the cluster is configured to replicate data three times, and even without explicit constraints, the cluster will aim to diversify replicas across node localities.

### Per-replica constraints to specific availability zones

**Scenario:**

- You have 5 nodes across 5 availability zones in 3 regions, 1 node in each availability zone.
- You want data replicated 3 times, with a quorum of replicas for a database holding West Coast data centered on the West Coast and a database for nation-wide data replicated across the entire country.

**Approach:**

1. Start each node with its region and availability zone location specified in the [`--locality`](cockroach-start.html#locality) flag:

    Start the five nodes:

    ~~~ shell
    $ cockroach start --insecure --advertise-addr=<node1 hostname> --locality=region=us-west1,az=us-west1-a \
    --join=<node1 hostname>,<node2 hostname>,<node3 hostname>,<node4 hostname>,<node5 hostname>
    $ cockroach start --insecure --advertise-addr=<node2 hostname> --locality=region=us-west1,az=us-west1-b \
    --join=<node1 hostname>,<node2 hostname>,<node3 hostname>,<node4 hostname>,<node5 hostname>
    $ cockroach start --insecure --advertise-addr=<node3 hostname> --locality=region=us-central1,az=us-central1-a \
    --join=<node1 hostname>,<node2 hostname>,<node3 hostname>,<node4 hostname>,<node5 hostname>
    $ cockroach start --insecure --advertise-addr=<node4 hostname> --locality=region=us-east1,az=us-east1-a \
    --join=<node1 hostname>,<node2 hostname>,<node3 hostname>,<node4 hostname>,<node5 hostname>
    $ cockroach start --insecure --advertise-addr=<node5 hostname> --locality=region=us-east1,az=us-east1-b \
    --join=<node1 hostname>,<node2 hostname>,<node3 hostname>,<node4 hostname>,<node5 hostname>
    ~~~

    Initialize the cluster:

    ~~~ shell
    $ cockroach init --insecure --host=<any node hostname>
    ~~~

2. On any node, open the [built-in SQL client](cockroach-sql.html):

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --insecure
    ~~~

3. Create the database for the West Coast application:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE DATABASE west_app_db;
    ~~~

4. Configure a replication zone for the database:

    {% include copy-clipboard.html %}
    ~~~ sql
    > ALTER DATABASE west_app_db
    CONFIGURE ZONE USING constraints = '{"+region=us-west1": 2, "+region=us-central1": 1}', num_replicas = 3;
    ~~~

    ~~~
    CONFIGURE ZONE 1
    ~~~

5. View the replication zone:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SHOW ZONE CONFIGURATION FOR DATABASE west_app_db;
    ~~~

    ~~~
             target        |                           raw_config_sql
    +----------------------+--------------------------------------------------------------------+
      DATABASE west_app_db | ALTER DATABASE west_app_db CONFIGURE ZONE USING
                           |     range_min_bytes = 134217728,
                           |     range_max_bytes = 536870912,
                           |     gc.ttlseconds = 90000,
                           |     num_replicas = 3,
                           |     constraints = '{+region=us-central1: 1, +region=us-west1: 2}',
                           |     lease_preferences = '[]'
    (1 row)
    ~~~

    Two of the database's three replicas will be put in `region=us-west1` and its remaining replica will be put in `region=us-central1`. This gives the application the resilience to survive the total failure of any one availability zone while providing low-latency reads and writes on the West Coast because a quorum of replicas are located there.

6. No configuration is needed for the nation-wide database. The cluster is configured to replicate data 3 times and spread them as widely as possible by default. Because the first key-value pair specified in each node's locality is considered the most significant part of each node's locality, spreading data as widely as possible means putting one replica in each of the three different regions.

### Multiple applications writing to different databases

**Scenario:**

- You have 2 independent applications connected to the same CockroachDB cluster, each application using a distinct database.
- You have 6 nodes across 2 availability zones, 3 nodes in each availability zone.
- You want the data for application 1 to be replicated 5 times, with replicas evenly balanced across both availability zones.
- You want the data for application 2 to be replicated 3 times, with all replicas in a single availability zone.

**Approach:**

1. Start each node with its availability zone location specified in the [`--locality`](cockroach-start.html#locality) flag:

    Availability zone 1:

    ~~~ shell
    $ cockroach start --insecure --advertise-addr=<node1 hostname> --locality=az=us-1 \
    --join=<node1 hostname>,<node2 hostname>,<node3 hostname>,<node4 hostname>,<node5 hostname>,<node6 hostname>
    $ cockroach start --insecure --advertise-addr=<node2 hostname> --locality=az=us-1 \
    --join=<node1 hostname>,<node2 hostname>,<node3 hostname>,<node4 hostname>,<node5 hostname>,<node6 hostname>
    $ cockroach start --insecure --advertise-addr=<node3 hostname> --locality=az=us-1 \
    --join=<node1 hostname>,<node2 hostname>,<node3 hostname>,<node4 hostname>,<node5 hostname>,<node6 hostname>
    ~~~

    Availability zone 2:

    ~~~ shell
    $ cockroach start --insecure --advertise-addr=<node4 hostname> --locality=az=us-2 \
    --join=<node1 hostname>,<node2 hostname>,<node3 hostname>,<node4 hostname>,<node5 hostname>,<node6 hostname>
    $ cockroach start --insecure --advertise-addr=<node5 hostname> --locality=az=us-2 \
    --join=<node1 hostname>,<node2 hostname>,<node3 hostname>,<node4 hostname>,<node5 hostname>,<node6 hostname>
    $ cockroach start --insecure --advertise-addr=<node6 hostname> --locality=az=us-2 \
    --join=<node1 hostname>,<node2 hostname>,<node3 hostname>,<node4 hostname>,<node5 hostname>,<node6 hostname>
    ~~~

    Initialize the cluster:

    ~~~ shell
    $ cockroach init --insecure --host=<any node hostname>
    ~~~

2. On any node, open the [built-in SQL client](cockroach-sql.html):

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --insecure
    ~~~

3. Create the database for application 1:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE DATABASE app1_db;
    ~~~

4. Configure a replication zone for the database used by application 1:

    {% include copy-clipboard.html %}
    ~~~ sql
    > ALTER DATABASE app1_db CONFIGURE ZONE USING num_replicas = 5;
    ~~~

    ~~~
    CONFIGURE ZONE 1
    ~~~

5. View the replication zone:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SHOW ZONE CONFIGURATION FOR DATABASE app1_db;
    ~~~

    ~~~
           target      |               raw_config_sql
    +------------------+---------------------------------------------+
      DATABASE app1_db | ALTER DATABASE app1_db CONFIGURE ZONE USING
                       |     range_min_bytes = 134217728,
                       |     range_max_bytes = 536870912,
                       |     gc.ttlseconds = 90000,
                       |     num_replicas = 5,
                       |     constraints = '[]',
                       |     lease_preferences = '[]'
    (1 row)
    ~~~

    Nothing else is necessary for application 1's data. Since all nodes specify their availability zone locality, the cluster will aim to balance the data in the database used by application 1 between availability zones 1 and 2.

6. Still in the SQL client, create a database for application 2:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE DATABASE app2_db;
    ~~~

7. Configure a replication zone for the database used by application 2:

    {% include copy-clipboard.html %}
    ~~~ sql
    > ALTER DATABASE app2_db CONFIGURE ZONE USING constraints = '[+az=us-2]';
    ~~~

8. View the replication zone:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SHOW ZONE CONFIGURATION FOR DATABASE app2_db;
    ~~~

    ~~~
           target      |               raw_config_sql
    +------------------+---------------------------------------------+
      DATABASE app2_db | ALTER DATABASE app2_db CONFIGURE ZONE USING
                       |     range_min_bytes = 134217728,
                       |     range_max_bytes = 536870912,
                       |     gc.ttlseconds = 90000,
                       |     num_replicas = 3,
                       |     constraints = '[+az=us-2]',
                       |     lease_preferences = '[]'
    (1 row)
    ~~~

    The required constraint will force application 2's data to be replicated only within the `us-2` availability zone.

### Stricter replication for a table and its secondary indexes

**Scenario:**

- You have 7 nodes, 5 with SSD drives and 2 with HDD drives.
- You want data replicated 3 times by default.
- Speed and availability are important for a specific table and its indexes, which are queried very frequently, however, so you want the data in the table and secondary indexes to be replicated 5 times, preferably on nodes with SSD drives.

**Approach:**

1. Start each node with `ssd` or `hdd` specified as store attributes:

    5 nodes with SSD storage:

    ~~~ shell
    $ cockroach start --insecure --advertise-addr=<node1 hostname> --store=path=node1,attrs=ssd \
    --join=<node1 hostname>,<node2 hostname>,<node3 hostname>
    $ cockroach start --insecure --advertise-addr=<node2 hostname> --store=path=node2,attrs=ssd \
    --join=<node1 hostname>,<node2 hostname>,<node3 hostname>
    $ cockroach start --insecure --advertise-addr=<node3 hostname> --store=path=node3,attrs=ssd \
    --join=<node1 hostname>,<node2 hostname>,<node3 hostname>
    $ cockroach start --insecure --advertise-addr=<node4 hostname> --store=path=node4,attrs=ssd \
    --join=<node1 hostname>,<node2 hostname>,<node3 hostname>
    $ cockroach start --insecure --advertise-addr=<node5 hostname> --store=path=node5,attrs=ssd \
    --join=<node1 hostname>,<node2 hostname>,<node3 hostname>
    ~~~

    2 nodes with HDD storage:

    ~~~ shell
    $ cockroach start --insecure --advertise-addr=<node6 hostname> --store=path=node6,attrs=hdd \
    --join=<node1 hostname>,<node2 hostname>,<node3 hostname>
    $ cockroach start --insecure --advertise-addr=<node7 hostname> --store=path=node7,attrs=hdd \
    --join=<node1 hostname>,<node2 hostname>,<node3 hostname>
    ~~~

    Initialize the cluster:

    ~~~ shell
    $ cockroach init --insecure --host=<any node hostname>
    ~~~

2. On any node, open the [built-in SQL client](cockroach-sql.html):

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --insecure
    ~~~

3. Create a database and table:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE DATABASE db;
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE TABLE db.important_table;
    ~~~

4. Configure a replication zone for the table that must be replicated more strictly:

    {% include copy-clipboard.html %}
    ~~~ sql
    > ALTER TABLE db.important_table CONFIGURE ZONE USING num_replicas = 5, constraints = '[+ssd]'
    ~~~

5. View the replication zone:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SHOW ZONE CONFIGURATION FOR TABLE db.important_table;
    ~~~

    ~~~
                 target             |                config_sql
    +-------------------------------+---------------------------------------------+
         TABLE db.important_table   | ALTER DATABASE app2_db CONFIGURE ZONE USING
                                    |     range_min_bytes = 1048576,
                                    |     range_max_bytes = 536870912,
                                    |     gc.ttlseconds = 90000,
                                    |     num_replicas = 5,
                                    |     constraints = '[+ssd]',
                                    |     lease_preferences = '[]'
    (1 row)
    ~~~

    The secondary indexes on the table will use the table's replication zone, so all data for the table will be replicated 5 times, and the required constraint will place the data on nodes with `ssd` drives.

### Tweaking the replication of system ranges

**Scenario:**

- You have nodes spread across 7 availability zones.
- You want data replicated 5 times by default.
- For better performance, you want a copy of the meta ranges in all of the availability zones.
- To save disk space, you only want the internal timeseries data replicated 3 times by default.

**Approach:**

1. Start each node with a different [locality](cockroach-start.html#locality) attribute:

    ~~~ shell
    $ cockroach start --insecure --advertise-addr=<node1 hostname> --locality=az=us-1 \
    --join=<node1 hostname>,<node2 hostname>,<node3 hostname>   
    $ cockroach start --insecure --advertise-addr=<node2 hostname> --locality=az=us-2 \
    --join=<node1 hostname>,<node2 hostname>,<node3 hostname>
    $ cockroach start --insecure --advertise-addr=<node3 hostname> --locality=az=us-3 \
    --join=<node1 hostname>,<node2 hostname>,<node3 hostname>
    $ cockroach start --insecure --advertise-addr=<node4 hostname> --locality=az=us-4 \
    --join=<node1 hostname>,<node2 hostname>,<node3 hostname>
    $ cockroach start --insecure --advertise-addr=<node5 hostname> --locality=az=us-5 \
    --join=<node1 hostname>,<node2 hostname>,<node3 hostname>
    $ cockroach start --insecure --advertise-addr=<node6 hostname> --locality=az=us-6 \
    --join=<node1 hostname>,<node2 hostname>,<node3 hostname>
    $ cockroach start --insecure --advertise-addr=<node7 hostname> --locality=az=us-7 \
    --join=<node1 hostname>,<node2 hostname>,<node3 hostname>
    ~~~

    Initialize the cluster:

    ~~~ shell
    $ cockroach init --insecure --host=<any node hostname>
    ~~~

2. On any node, open the [built-in SQL client](cockroach-sql.html):

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --insecure
    ~~~

3. Configure the default replication zone:

    {% include copy-clipboard.html %}
    ~~~ sql
    > ALTER RANGE default CONFIGURE ZONE USING num_replicas = 5;
    ~~~

4. View the replication zone:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SHOW ZONE CONFIGURATION FOR RANGE default;
    ~~~
    ~~~
         target     |              raw_config_sql
    +---------------+------------------------------------------+
      RANGE default | ALTER RANGE default CONFIGURE ZONE USING
                    |     range_min_bytes = 134217728,
                    |     range_max_bytes = 536870912,
                    |     gc.ttlseconds = 90000,
                    |     num_replicas = 5,
                    |     constraints = '[]',
                    |     lease_preferences = '[]'
    (1 row)
    ~~~

    All data in the cluster will be replicated 5 times, including both SQL data and the internal system data.

5. Configure the `meta` replication zone:

    {% include copy-clipboard.html %}
    ~~~ sql
    > ALTER RANGE meta CONFIGURE ZONE USING num_replicas = 7;
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > SHOW ZONE CONFIGURATION FOR RANGE meta;
    ~~~
    ~~~
        target   |            raw_config_sql
    +------------+---------------------------------------+
      RANGE meta | ALTER RANGE meta CONFIGURE ZONE USING
                 |     range_min_bytes = 134217728,
                 |     range_max_bytes = 536870912,
                 |     gc.ttlseconds = 3600,
                 |     num_replicas = 7,
                 |     constraints = '[]',
                 |     lease_preferences = '[]'
    (1 row)
    ~~~

    The `meta` addressing ranges will be replicated such that one copy is in all 7 availability zones, while all other data will be replicated 5 times.

6. Configure the `timeseries` replication zone:

    {% include copy-clipboard.html %}
    ~~~ sql
    > ALTER RANGE timeseries CONFIGURE ZONE USING num_replicas = 3;
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > SHOW ZONE CONFIGURATION FOR RANGE timeseries;
    ~~~
    ~~~
           target      |               raw_config_sql
    +------------------+---------------------------------------------+
      RANGE timeseries | ALTER RANGE timeseries CONFIGURE ZONE USING
                       |     range_min_bytes = 134217728,
                       |     range_max_bytes = 536870912,
                       |     gc.ttlseconds = 90000,
                       |     num_replicas = 3,
                       |     constraints = '[]',
                       |     lease_preferences = '[]'
    (1 row)
    ~~~

    The timeseries data will only be replicated 3 times without affecting the configuration of all other data.

## See also

- [`SHOW ZONE CONFIGURATIONS`](show-zone-configurations.html)
- [`CONFIGURE ZONE`](configure-zone.html)
- [`SHOW PARTITIONS`](show-partitions.html)
- [SQL Statements](sql-statements.html)
- [Table Partitioning](partitioning.html)
- [Replication Reports](query-replication-reports.html)
