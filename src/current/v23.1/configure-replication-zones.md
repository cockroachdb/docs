---
title: Replication Controls
summary: In CockroachDB, you use replication zones to control the number and location of replicas for specific sets of data.
keywords: ttl, time to live, availability zone
toc: true
docs_area: manage
---

Replication zones give you the power to control what data goes where in your CockroachDB cluster.  Specifically, they are used to control the number and location of replicas for data belonging to the following objects:

- Databases
- Tables
- Rows
- Indexes
- All data in the cluster, including internal system data ([via the default replication zone](#view-the-default-replication-zone))

For each of these objects you can control:

- How many copies of each range to spread through the cluster.
- Which constraints are applied to which data, e.g., "table X's data can only be stored in the German availability zones".
- The maximum size of ranges (how big ranges get before they are split).
- How long old data is kept before being garbage collected.
- Where you would like the leaseholders for certain ranges to be located, e.g., "for ranges that are already constrained to have at least one replica in `region=us-west`, also try to put their leaseholders in `region=us-west`".

This page explains how replication zones work and how to use the `ALTER ... CONFIGURE ZONE` statement to manage them. `CONFIGURE ZONE` is a subcommand of the [`ALTER DATABASE`]({% link {{ page.version.version }}/alter-database.md %}#configure-zone), [`ALTER TABLE`]({% link {{ page.version.version }}/alter-table.md %}#configure-zone), [`ALTER INDEX`]({% link {{ page.version.version }}/alter-index.md %}#configure-zone), [`ALTER PARTITION`]({% link {{ page.version.version }}/alter-partition.md %}#create-a-replication-zone-for-a-partition), and [`ALTER RANGE`]({% link {{ page.version.version }}/alter-range.md %}#configure-zone) statements.

{% include {{ page.version.version }}/see-zone-config-troubleshooting-guide.md %}

{{site.data.alerts.callout_info}}
To configure replication zones, a user must be a member of the [`admin` role]({% link {{ page.version.version }}/security-reference/authorization.md %}#admin-role) or have been granted [`CREATE`]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) or [`ZONECONFIG`]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) privileges. To configure [`system` objects](#for-system-data), the user must be a member of the `admin` role.
{{site.data.alerts.end}}

{{site.data.alerts.callout_danger}}
{% include {{ page.version.version }}/zone-configs/avoid-manual-zone-configs.md %}
{{site.data.alerts.end}}

## Overview

Every [range]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-range) in the cluster is part of a replication zone.  Each range's zone configuration is taken into account as ranges are rebalanced across the cluster to ensure that any constraints are honored.

When a cluster starts, there are two categories of replication zone:

1. Pre-configured replication zones that apply to internal system data.
1. A single default replication zone that applies to the rest of the cluster.

You can adjust these pre-configured zones as well as add zones for individual databases, tables, rows, and indexes as needed.

For example, you might rely on the [default zone](#view-the-default-replication-zone) to spread most of a cluster's data across all of your availability zones, but [create a custom replication zone for a specific database](#create-a-replication-zone-for-a-database) to make sure its data is only stored in certain availability zones and/or geographies.

## Replication zone levels

There are five replication zone levels for [**table data**]({% link {{ page.version.version }}/architecture/distribution-layer.md %}#table-data) in a cluster, listed from least to most granular:

Level | Description
------|------------
Cluster | CockroachDB comes with a pre-configured `default` replication zone that applies to all table data in the cluster not constrained by a database, table, or row-specific replication zone. This zone can be adjusted but not removed. See [View the Default Replication Zone](#view-the-default-replication-zone) and [Edit the Default Replication Zone](#edit-the-default-replication-zone) for more details.
Database | You can add replication zones for specific databases. See [Create a Replication Zone for a Database](#create-a-replication-zone-for-a-database) for more details.
Table | You can add replication zones for specific tables. See [Create a Replication Zone for a Table](#create-a-replication-zone-for-a-table).
Index | The [indexes]({% link {{ page.version.version }}/indexes.md %}) on a table will automatically use the replication zone for the table. However, with an Enterprise license, you can add distinct replication zones for indexes. See [Create a Replication Zone for a Secondary Index](#create-a-replication-zone-for-a-secondary-index) for more details.
Row | You can add replication zones for specific rows in a table or index by [defining table partitions]({% link {{ page.version.version }}/partitioning.md %}). See [Create a Replication Zone for a Table Partition](#create-a-replication-zone-for-a-partition) for more details.

### For system data

In addition, CockroachDB stores internal [**system data**]({% link {{ page.version.version }}/architecture/distribution-layer.md %}#monolithic-sorted-map-structure) in what are called system ranges. There are two replication zone levels for this internal system data, listed from least to most granular:

Level | Description
------|------------
Cluster | The `default` replication zone mentioned above also applies to all system ranges not constrained by a more specific replication zone.
System Range | CockroachDB comes with pre-configured replication zones for important system ranges, such as the "meta" and "liveness" ranges. If necessary, you can add replication zones for the "timeseries" range and other system ranges as well. Editing replication zones for system ranges may override settings from `default`. See [Create a Replication Zone for a System Range](#create-a-replication-zone-for-a-system-range) for more details.<br><br>CockroachDB also comes with pre-configured replication zones for the internal `system` database and the `system.jobs` table, which stores metadata about long-running jobs such as schema changes and backups.

### Level priorities

When replicating data, whether table or system, CockroachDB always uses the most granular replication zone available. For example, for a piece of user data:

1. If there's a replication zone [for the row](#create-a-replication-zone-for-a-partition) (a.k.a. [partition]({% link {{ page.version.version }}/partitioning.md %})), CockroachDB uses it.
1. If there's no applicable row replication zone and the row is from an index, CockroachDB uses the [index replication zone](#create-a-replication-zone-for-a-secondary-index).
1. If the row isn't from a index or there is no applicable index replication zone, CockroachDB uses the [table replication zone](#create-a-replication-zone-for-a-table).
1. If there's no applicable table replication zone, CockroachDB uses the [database replication zone](#create-a-replication-zone-for-a-database).
1. If there's no applicable database replication zone, CockroachDB uses [the `default` cluster-wide replication zone](#view-the-default-replication-zone).

As this example shows, CockroachDB chooses which replication zone applies to a specific schema object using a hierarchy of inheritance. For most users [who never modify their zone configurations](#why-manual-zone-config-management-is-not-recommended), this level of understanding is sufficient.

However, there are nuances in how inheritance works that are not explained by this example. For more details about how zone config inheritance works, see the section [How zone config inheritance works](#how-zone-config-inheritance-works).

### How zone config inheritance works

As [discussed previously](#level-priorities), CockroachDB always uses the most granular replication zone available for each schema object (database, table, etc.). More-specific settings applied to schema objects at lower levels of the inheritance tree will always override the settings of objects above them in the tree. All configurations will therefore be modified versions of the [`default` range]({% link {{ page.version.version }}/configure-replication-zones.md %}#view-the-default-replication-zone), which acts as the root of the tree. This means that in practice, **any changes to a specific schema object's zone configurations are by definition user-initiated**, either via [Multi-region SQL abstractions]({% link {{ page.version.version }}/multiregion-overview.md %}) or [manual changes](#why-manual-zone-config-management-is-not-recommended).

Because each zone config inherits all of its initial values from its parent object, **it only stores the values that differ from its parent**. Any fields that are unset will be looked up in the parent object’s zone configuration. This continues recursively up the inheritance hierarchy all the way to the `default` zone config. In practice, most values are cached for performance.

For more information, see the following subsections:

- [The zone config inheritance hierarchy](#the-zone-config-inheritance-hierarchy)
- [Zone config inheritance - example SQL session](#zone-config-inheritance-example-sql-session)
- [Why manual zone config management is not recommended](#why-manual-zone-config-management-is-not-recommended)

#### The zone config inheritance hierarchy

The hierarchy of inheritance for zone configs can be visualized using the following outline-style diagram, in which each level of indentation denotes an inheritance relationship.

The only exception to this simple inheritance relationship is that due to a known limitation, sub-partitions do not inherit their values from their parent partitions. Instead, sub-partitions inherit their values from the parent table. For more information, see [cockroachdb/cockroach#75862](https://github.com/cockroachdb/cockroach/issues/75862).

```
- default
  - database A
    - table A.B
      - index A.B.1
        - partition (row) 1
          - sub-partition 1.1 (NB. Sub-partitions inherit from tables, *not* partitions - see cockroachdb/cockroach#75862)
            - sub-partition 1.1.1
          - sub-partition 1.2
    - table A.C
      - index A.C.1
      - index A.C.2
  - ...
```

The way the zone config inheritance hierarchy works can be thought of from a "bottom-up" or "top-down" perspective; both are useful, but which one is easier to understand may depend on what you are trying to do.

The "bottom-up" view of how zone config inheritance works is useful when you [are troubleshooting unexpected replication behavior]({% link {{ page.version.version }}/troubleshoot-replication-zones.md %}).

In this view, you start with the most granular schema object whose replication behavior currently interests you. In a troubleshooting session, this is the one you think is the source of the unexpected behavior. You start at the target schema object, looking at the specific state of its configuration to see what is different about it from its parent object (if anything), and work upwards from there.

The "top-down" perspective of how zone config inheritance works can be useful when thinking about how the system works as a whole.

From the whole-system perspective, the hierarchy of schema object zone configs can be thought of as a tree. From this point of view, the system does a depth-first traversal down the tree of schema objects. For each object, **it uses the value of the most specific modified field from the current object's zone config, unless or until it finds a modified value of that field on an object deeper in the tree**. For each field on the current schema object's zone config where it doesn't find any modified value, it uses the inherited value from the node's parent, which inherits from its parent, and so on all the way back up to the root of the tree ([the `default` range](#view-the-default-replication-zone)).

The following diagram presents the same set of schema objects as the previous outline-style diagram, but using boxes and lines joined with arrows that represent the "top-down" view. 

Each box represents a schema object in the zone configuration inheritance hierarchy. Each solid line ends in an arrow that points from a parent object to its child object, which will inherit the parent's values unless those values are changed at the child level. The dotted lines between partitions and sub-partitions represent the known limitation mentioned previously that sub-partitions do not inherit their values from their parent partitions. Instead, sub-partitions inherit their values from the parent table. For more information about this limitation, see [cockroachdb/cockroach#75862](https://github.com/cockroachdb/cockroach/issues/75862).

<img src="/docs/images/{{ page.version.version }}/zone-config-inheritance-diagram.png" alt="zone config inheritance diagram" style="border:1px solid #eee;max-width:100%" />

#### Zone config inheritance - example SQL session

You can verify [the inheritance behavior described previously](#how-zone-config-inheritance-works) in a SQL session.

Start a [demo cluster]({% link {{ page.version.version }}/cockroach-demo.md %}). Create a sample database and table:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE DATABASE IF NOT EXISTS test;
USE test;
CREATE TABLE IF NOT EXISTS kv (k INT, v INT);
~~~

Next, manually set a zone configuration field at the database level. In this example, use `num_replicas`:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE test CONFIGURE ZONE USING num_replicas = 1;
~~~

Check that the child table `test.kv` inherits the value of `num_replicas` from its parent database. You should see output like the following:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW ZONE CONFIGURATION FROM TABLE test.kv;
~~~

~~~
     target     |              raw_config_sql
----------------+-------------------------------------------
  DATABASE test | ALTER DATABASE test CONFIGURE ZONE USING
                |     range_min_bytes = 134217728,
                |     range_max_bytes = 536870912,
                |     gc.ttlseconds = 14400,
                |     num_replicas = 1,
                |     constraints = '[]',
                |     lease_preferences = '[]'
(1 row)
~~~

Then, set the `num_replicas` field on the table to a different value than its parent database:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE kv CONFIGURE ZONE USING num_replicas = 5;
~~~

This overrides the value of `num_replicas` set by the parent `test` database. From this point forward, until you discard the changed settings at the table level, the table will no longer inherit those changed values from its parent database.

In other words, **the value of this field on the table's zone config has diverged from its parent database, and all state on this field must be managed manually going forward**. This divergence in state between parent and child objects, and the necessity to manage it manually once it diverges, is the reason [why manual zone config management is not recommended](#why-manual-zone-config-management-is-not-recommended).

Next, check the zone config for the table `test.kv`, and verify that its value of `num_replicas` has diverged:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW ZONE CONFIGURATION FROM TABLE kv;
~~~

~~~
   target  |           raw_config_sql
-----------+--------------------------------------
  TABLE kv | ALTER TABLE kv CONFIGURE ZONE USING
           |     range_min_bytes = 134217728,
           |     range_max_bytes = 536870912,
           |     gc.ttlseconds = 14400,
           |     num_replicas = 5,
           |     constraints = '[]',
           |     lease_preferences = '[]'
(1 row)
~~~

Next, change the value of `num_replicas` for the `test` database again. Once again, choose a different value than its child table `test.kv` (which has `num_replicas = 5`).

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE test CONFIGURE ZONE USING num_replicas = 7;
~~~

 The reason for doing this is to confirm the previous claim that "the value of this field on the table's zone config has diverged from its parent database, and all state on this field must be managed manually going forward".

The following [`SHOW ZONE CONFIGURATION`]({% link {{ page.version.version }}/show-zone-configurations.md %}) statement confirms that the value of the `num_replicas` field on the `kv` table is no longer inherited from its parent database `test`.

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW ZONE CONFIGURATION FROM TABLE kv;
~~~

~~~
   target  |           raw_config_sql
-----------+--------------------------------------
  TABLE kv | ALTER TABLE kv CONFIGURE ZONE USING
           |     range_min_bytes = 134217728,
           |     range_max_bytes = 536870912,
           |     gc.ttlseconds = 14400,
           |     num_replicas = 5,
           |     constraints = '[]',
           |     lease_preferences = '[]'
(1 row)
~~~

Note that even if you manually change the value of `num_replicas` in `kv` to match the value of its parent `test`, further changes to `test` **will still not be propagated downward to `test.kv`**. Confirm this by running the following statements:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE test.kv CONFIGURE ZONE USING num_replicas = 7;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE test CONFIGURE ZONE USING num_replicas = 9;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW ZONE CONFIGURATION FROM TABLE kv;
~~~

~~~
   target  |           raw_config_sql
-----------+--------------------------------------
  TABLE kv | ALTER TABLE kv CONFIGURE ZONE USING
           |     range_min_bytes = 134217728,
           |     range_max_bytes = 536870912,
           |     gc.ttlseconds = 14400,
           |     num_replicas = 7,
           |     constraints = '[]',
           |     lease_preferences = '[]'
(1 row)
~~~

One way to think about this from a programming perspective is that a ["dirty bit"](https://en.wikipedia.org/wiki/Dirty_bit) has been set on the `num_replicas` field in the `kv` table's zone config.

However, you can confirm that other fields on `test.kv` which have not been modified from their default values still inherit from the parent database `test` as expected by changing the value of `gc.ttlseconds` on the `test` database.

Change the value of `gc.ttlseconds` on the `test` database:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE test CONFIGURE ZONE USING gc.ttlseconds = 600;
~~~

Next, confirm that the value of `gc.ttlseconds` from the `test` database is inherited by the `test.kv` table as expected:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW ZONE CONFIGURATION FROM TABLE test.kv;
~~~

~~~
         target        |                 raw_config_sql
-----------------------+--------------------------------------------------
  TABLE test.public.kv | ALTER TABLE test.public.kv CONFIGURE ZONE USING
                       |     range_min_bytes = 134217728,
                       |     range_max_bytes = 536870912,
                       |     gc.ttlseconds = 600,
                       |     num_replicas = 7,
                       |     constraints = '[]',
                       |     lease_preferences = '[]'
(1 row)
~~~

To return the `test.kv` table to a state where it goes back to inheriting all of its values from its parent database `test`, use the [`ALTER TABLE ... CONFIGURE ZONE DISCARD`]({% link {{ page.version.version }}/alter-table.md %}#remove-a-replication-zone) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE test.kv CONFIGURE ZONE DISCARD;
~~~

As you can see from this example, these kinds of manual "tweaks" to zone configurations can leave the cluster in a state where its operators are managing its replication in a very manual and error-prone fashion. This example shows why, for most users, [manual zone config management is not recommended](#why-manual-zone-config-management-is-not-recommended). Instead, most users should use [Multi-region SQL]({% link {{ page.version.version }}/multiregion-overview.md %}).

#### Why manual zone config management is not recommended

Reasons to avoid modifying zone configurations manually using [`CONFIGURE ZONE`]({% link {{ page.version.version }}/alter-database.md %}#configure-zone) include:

- It is difficult to do proper auditing and change management of manually altered zone configurations.
- It is easy to introduce logic errors (a.k.a., bugs) and end up in a state where your replication is not behaving as it is "supposed to".
- Manual zone config modifications must be entirely maintained by the user with no help from the system. Such manual changes must be fully overwritten on each configuration change in order to take effect; this introduces another avenue for error.

Given the [previous description of how zone config inheritance works](#how-zone-config-inheritance-works), if you [manually modify zone configs using `CONFIGURE ZONE`]({% link {{ page.version.version }}/alter-database.md %}#configure-zone), you will see the following behavior:

- If you set some field _F_ at the database level, the updated value of that field will propagate down the inheritance tree to all of the database's child tables.
- However, if you then edit that same field _F_ on a child table, the table will no longer inherit its value of _F_ from its parent database. Instead, **the field _F_ across these two schema objects is now in a diverged state**. This means that any changes to the value of _F_ at the database level **no longer propagate downward to the child table**, which has its own value of _F_.
- In other words, once you touch any schema object _O_ to manually edit some field _F_, a "dirty bit" is set on _O.F_, and CockroachDB will no longer modify _O.F_ without user intervention. **Instead, you are now responsible for managing the state of _O.F_ via direct calls to [`ALTER DATABASE ... CONFIGURE ZONE`]({% link {{ page.version.version }}/alter-database.md %}#configure-zone) anytime something needs to change in your configuration**.

Avoiding this error-prone manual state management was the motivation behind the development of the abstractions provided by [Multi-region SQL statements]({% link {{ page.version.version }}/multiregion-overview.md %}) and [Multi-region Zone Config Extensions]({% link {{ page.version.version }}/zone-config-extensions.md %}).

## Manage replication zones

Use the `ALTER ... CONFIGURE ZONE` statement to [add](#create-a-replication-zone-for-a-system-range), [modify](#edit-the-default-replication-zone), [reset](#reset-a-replication-zone), and [remove](#remove-a-replication-zone) replication zones.

### Replication zone variables

Use the `ALTER ... CONFIGURE ZONE` [statement]({% link {{ page.version.version }}/sql-statements.md %}) to set a replication zone:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE t CONFIGURE ZONE USING range_min_bytes = 0, range_max_bytes = 90000, gc.ttlseconds = 89999, num_replicas = 5, constraints = '[-region=west]';
~~~

{% include {{page.version.version}}/zone-configs/variables.md %}

### Replication constraints

The location of replicas, both when they are first added and when they are rebalanced to maintain cluster equilibrium, is based on the interplay between descriptive attributes assigned to nodes and constraints set in zone configurations.

{{site.data.alerts.callout_success}}For demonstrations of how to set node attributes and replication constraints in different scenarios, see <a href="#scenario-based-examples">Scenario-based Examples</a> below.{{site.data.alerts.end}}

#### Descriptive attributes assigned to nodes

When starting a node with the [`cockroach start`]({% link {{ page.version.version }}/cockroach-start.md %}) command, you can assign the following types of descriptive attributes:

{% capture locality_case_sensitive_example %}<code>--locality datacenter=us-east-1 --locality datacenter=datacenter=US-EAST-1</code>{% endcapture %}

Attribute Type | Description
---------------|------------
**Node Locality** | <a name="zone-config-node-locality"></a> Using the [`--locality`]({% link {{ page.version.version }}/cockroach-start.md %}#locality) flag, you can assign arbitrary key-value pairs that describe the location of the node. Locality might include region, country, availability zone, etc. The key-value pairs should be ordered into _locality tiers_ that range from most inclusive to least inclusive (e.g., region before availability zone as in `region=eu,az=paris`), and the keys and the order of key-value pairs must be the same on all nodes. It is typically better to include more pairs than fewer. For example:<br><br>`--locality=region=east,az=us-east-1`<br>`--locality=region=east,az=us-east-2`<br>`--locality=region=west,az=us-west-1`<br><br>CockroachDB attempts to spread replicas evenly across the cluster based on locality, with the order of locality tiers determining the priority. Locality can also be used to influence the location of data replicas in various ways using replication zones.<br><br>When there is high latency between nodes, CockroachDB uses locality to move range leases closer to the current workload, reducing network round trips and improving read performance. See [Follow-the-workload]({% link {{ page.version.version }}/topology-follow-the-workload.md %}) for more details.<br /><br />**Note**: Repeating an exact locality value has no effect, but locality values are case-sensitive. For example, from the point of view of CockroachDB, the following values result in two separate localities:<br /><br />{{locality_case_sensitive_example}}<br /><br />This type of configuration error can lead to issues that are difficult to diagnose.
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

See [Cluster Topology]({% link {{ page.version.version }}/recommended-production-settings.md %}#topology) recommendations for production deployments.

### Troubleshooting zone constraint violations

{% include {{ page.version.version }}/see-zone-config-troubleshooting-guide.md %}

## View replication zones

Use the [`SHOW ZONE CONFIGURATIONS`](#view-all-replication-zones) statement to view details about existing replication zones.

You can also use the [`SHOW PARTITIONS`]({% link {{ page.version.version }}/show-partitions.md %}) statement to view the zone constraints on existing table partitions, or [`SHOW CREATE TABLE`]({% link {{ page.version.version }}/show-create.md %}) to view zone configurations for a table.

{% include {{page.version.version}}/sql/crdb-internal-partitions.md %}

## Basic examples

{% include {{ page.version.version }}/sql/movr-statements-geo-partitioned-replicas.md %}

These examples focus on the basic approach and syntax for working with zone configuration. For examples demonstrating how to use constraints, see [Scenario-based examples](#scenario-based-examples).

For more examples, see [`SHOW ZONE CONFIGURATIONS`]({% link {{ page.version.version }}/show-zone-configurations.md %}).

### View all replication zones

{% include {{ page.version.version }}/zone-configs/view-all-replication-zones.md %}

For more information, see [`SHOW ZONE CONFIGURATIONS`]({% link {{ page.version.version }}/show-zone-configurations.md %}).

### View the default replication zone

{% include {{ page.version.version }}/zone-configs/view-the-default-replication-zone.md %}

For more information, see [`SHOW ZONE CONFIGURATIONS`]({% link {{ page.version.version }}/show-zone-configurations.md %}).

### Edit the default replication zone

{% include {{ page.version.version }}/zone-configs/edit-the-default-replication-zone.md %}

### Create a replication zone for a system range

{% include {{ page.version.version }}/zone-configs/create-a-replication-zone-for-a-system-range.md %}

For more information, see [`ALTER RANGE ... CONFIGURE ZONE`]({% link {{ page.version.version }}/alter-range.md %}#configure-zone).

### Create a replication zone for a database

{% include {{ page.version.version }}/zone-configs/create-a-replication-zone-for-a-database.md %}

For more information, see [`ALTER DATABASE ... CONFIGURE ZONE`]({% link {{ page.version.version }}/alter-database.md %}#configure-zone).

### Create a replication zone for a table

{% include {{ page.version.version }}/zone-configs/create-a-replication-zone-for-a-table.md %}

For more information, see [`ALTER TABLE ... CONFIGURE ZONE`]({% link {{ page.version.version }}/alter-table.md %}#configure-zone).

### Create a replication zone for a secondary index

{% include {{ page.version.version }}/zone-configs/create-a-replication-zone-for-a-secondary-index.md %}

For more information, see [`ALTER INDEX ... CONFIGURE ZONE`]({% link {{ page.version.version }}/alter-index.md %}#configure-zone).

### Create a replication zone for a partition

{% include {{ page.version.version }}/zone-configs/create-a-replication-zone-for-a-table-partition.md %}

For more information, see [`ALTER PARTITION ... CONFIGURE ZONE`]({% link {{ page.version.version }}/alter-partition.md %}#create-a-replication-zone-for-a-partition).

### Reset a replication zone

{% include {{ page.version.version }}/zone-configs/reset-a-replication-zone.md %}

### Remove a replication zone

{% include {{ page.version.version }}/zone-configs/remove-a-replication-zone.md %}

### Constrain leaseholders to specific availability zones

{% include {{ page.version.version }}/zone-configs/constrain-leaseholders-to-specific-datacenters.md %}

## Scenario-based examples

### Even replication across availability zones

**Scenario:**

- You have 6 nodes across 3 availability zones, 2 nodes in each availability zone.
- You want data replicated 3 times, with replicas balanced evenly across all three availability zones.

**Approach:**

1. Start each node with its availability zone location specified in the [`--locality`]({% link {{ page.version.version }}/cockroach-start.md %}#locality) flag:

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

1. Initialize the cluster:

    ~~~ shell
    $ cockroach init --insecure --host=<any node hostname>
    ~~~

There's no need to make zone configuration changes; by default, the cluster is configured to replicate data three times, and even without explicit constraints, the cluster will aim to diversify replicas across node localities.

### Per-replica constraints to specific availability zones

**Scenario:**

- You have 5 nodes across 5 availability zones in 3 regions, 1 node in each availability zone.
- You want data replicated 3 times, with a quorum of replicas for a database holding West Coast data centered on the West Coast and a database for nation-wide data replicated across the entire country.

**Approach:**

1. Start each node with its region and availability zone location specified in the [`--locality`]({% link {{ page.version.version }}/cockroach-start.md %}#locality) flag:

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

1. On any node, open the [built-in SQL client]({% link {{ page.version.version }}/cockroach-sql.md %}):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --insecure
    ~~~

1. Create the database for the West Coast application:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE DATABASE west_app_db;
    ~~~

1. Configure a replication zone for the database:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > ALTER DATABASE west_app_db
    CONFIGURE ZONE USING constraints = '{"+region=us-west1": 2, "+region=us-central1": 1}', num_replicas = 3;
    ~~~

    ~~~
    CONFIGURE ZONE 1
    ~~~

1. View the replication zone:

    {% include_cached copy-clipboard.html %}
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

1. No configuration is needed for the nation-wide database. The cluster is configured to replicate data 3 times and spread them as widely as possible by default. Because the first key-value pair specified in each node's locality is considered the most significant part of each node's locality, spreading data as widely as possible means putting one replica in each of the three different regions.

### Multiple applications writing to different databases

**Scenario:**

- You have 2 independent applications connected to the same CockroachDB cluster, each application using a distinct database.
- You have 6 nodes across 2 availability zones, 3 nodes in each availability zone.
- You want the data for application 1 to be replicated 5 times, with replicas evenly balanced across both availability zones.
- You want the data for application 2 to be replicated 3 times, with all replicas in a single availability zone.

**Approach:**

1. Start each node with its availability zone location specified in the [`--locality`]({% link {{ page.version.version }}/cockroach-start.md %}#locality) flag:

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

1. On any node, open the [built-in SQL client]({% link {{ page.version.version }}/cockroach-sql.md %}):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --insecure
    ~~~

1. Create the database for application 1:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE DATABASE app1_db;
    ~~~

1. Configure a replication zone for the database used by application 1:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > ALTER DATABASE app1_db CONFIGURE ZONE USING num_replicas = 5;
    ~~~

    ~~~
    CONFIGURE ZONE 1
    ~~~

1. View the replication zone:

    {% include_cached copy-clipboard.html %}
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

1. Still in the SQL client, create a database for application 2:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE DATABASE app2_db;
    ~~~

1. Configure a replication zone for the database used by application 2:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > ALTER DATABASE app2_db CONFIGURE ZONE USING constraints = '[+az=us-2]';
    ~~~

1. View the replication zone:

    {% include_cached copy-clipboard.html %}
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

1. On any node, open the [built-in SQL client]({% link {{ page.version.version }}/cockroach-sql.md %}):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --insecure
    ~~~

1. Create a database and table:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE DATABASE db;
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE TABLE db.important_table;
    ~~~

1. Configure a replication zone for the table that must be replicated more strictly:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > ALTER TABLE db.important_table CONFIGURE ZONE USING num_replicas = 5, constraints = '[+ssd]'
    ~~~

1. View the replication zone:

    {% include_cached copy-clipboard.html %}
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

1. Start each node with a different [locality]({% link {{ page.version.version }}/cockroach-start.md %}#locality) attribute:

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

1. On any node, open the [built-in SQL client]({% link {{ page.version.version }}/cockroach-sql.md %}):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --insecure
    ~~~

1. Configure the default replication zone:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > ALTER RANGE default CONFIGURE ZONE USING num_replicas = 5;
    ~~~

1. View the replication zone:

    {% include_cached copy-clipboard.html %}
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

1. Configure the `meta` replication zone:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > ALTER RANGE meta CONFIGURE ZONE USING num_replicas = 7;
    ~~~

    {% include_cached copy-clipboard.html %}
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

1. Configure the `timeseries` replication zone:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > ALTER RANGE timeseries CONFIGURE ZONE USING num_replicas = 3;
    ~~~

    {% include_cached copy-clipboard.html %}
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

- [`SHOW ZONE CONFIGURATIONS`]({% link {{ page.version.version }}/show-zone-configurations.md %})
- [`ALTER DATABASE ... CONFIGURE ZONE`]({% link {{ page.version.version }}/alter-database.md %}#configure-zone)
- [`ALTER INDEX ... CONFIGURE ZONE`]({% link {{ page.version.version }}/alter-index.md %}#configure-zone)
- [`ALTER RANGE ... CONFIGURE ZONE`]({% link {{ page.version.version }}/alter-range.md %}#configure-zone)
- [`ALTER TABLE ... CONFIGURE ZONE`]({% link {{ page.version.version }}/alter-table.md %}#configure-zone)
- [`ALTER PARTITION ... CONFIGURE ZONE`]({% link {{ page.version.version }}/alter-partition.md %}#create-a-replication-zone-for-a-partition)
- [`SHOW PARTITIONS`]({% link {{ page.version.version }}/show-partitions.md %})
- [SQL Statements]({% link {{ page.version.version }}/sql-statements.md %})
- [Table Partitioning]({% link {{ page.version.version }}/partitioning.md %})
- [Critical nodes endpoint]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#critical-nodes-endpoint)
- [Troubleshoot Replication Zones]({% link {{ page.version.version }}/troubleshoot-replication-zones.md %})
