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
- All data in the cluster, including internal system data ([via the default replication zone](#view-the-default-replication-zone))

For each of the above objects you can control:

- How many copies of each range to spread through the cluster.
- Which constraints are applied to which data, e.g., "table X's data can only be stored in the German datacenters".
- The maximum size of ranges (how big ranges get before they are split).
- How long old data is kept before being garbage collected.
- <span class="version-tag">New in v2.1:</span> Where you would like the leaseholders for certain ranges to be located, e.g., "for ranges that are already constrained to have at least one replica in `region=us-west`, also try to put their leaseholders in `region=us-west`".

This page explains how replication zones work and how to use the `cockroach zone` [command](cockroach-commands.html) to configure them.

{{site.data.alerts.callout_info}}
Currently, only the `root` user can configure replication zones.
{{site.data.alerts.end}}

## Overview

Every range in the cluster is part of a replication zone.  Each range's zone configuration is tracked as ranges are rebalanced across the cluster to ensure that any constraints are honored.

When a cluster starts, there are two categories of replication zone:

1. Pre-configured replication zones that apply to internal system data.
2. A single default replication zone that applies to the rest of the cluster.

You can adjust these pre-configured zones as well as add zones for individual databases, tables, rows, and secondary indexes as needed.  Note that adding zones for rows and secondary indexes is ([enterprise-only](enterprise-licensing.html)).

For example, you might rely on the [default zone](#view-the-default-replication-zone) to spread most of a cluster's data across all of your datacenters, but [create a custom replication zone for a specific database](#create-a-replication-zone-for-a-database) to make sure its data is only stored in certain datacenters and/or geographies.

## Replication zone levels

There are five replication zone levels for [**table data**](architecture/distribution-layer.html#table-data) in a cluster, listed from least to most granular:

Level | Description
------|------------
Cluster | CockroachDB comes with a pre-configured `.default` replication zone that applies to all table data in the cluster not constrained by a database, table, or row-specific replication zone. This zone can be adjusted but not removed. See [View the Default Replication Zone](#view-the-default-replication-zone) and [Edit the Default Replication Zone](#edit-the-default-replication-zone) for more details.
Database | You can add replication zones for specific databases. See [Create a Replication Zone for a Database](#create-a-replication-zone-for-a-database) for more details.
Table | You can add replication zones for specific tables. See [Create a Replication Zone for a Table](#create-a-replication-zone-for-a-table).
Index ([Enterprise-only](enterprise-licensing.html)) | The [secondary indexes](indexes.html) on a table will automatically use the replication zone for the table. However, with an enterprise license, you can add distinct replication zones for secondary indexes. See [Create a Replication Zone for a Secondary Index](#create-a-replication-zone-for-a-secondary-index) for more details.
Row ([Enterprise-only](enterprise-licensing.html)) | You can add replication zones for specific rows in a table or secondary index by [defining table partitions](partitioning.html). See [Create a Replication Zone for a Table Partition](#create-a-replication-zone-for-a-table-or-secondary-index-partition) for more details.

### For system data

In addition, CockroachDB stores internal [**system data**](architecture/distribution-layer.html#monolithic-sorted-map-structure) in what are called system ranges. There are two replication zone levels for this internal system data, listed from least to most granular:

Level | Description
------|------------
Cluster | The `.default` replication zone mentioned above also applies to all system ranges not constrained by a more specific replication zone.
System Range | CockroachDB comes with pre-configured replication zones for the "meta" and "liveness" system ranges. If necessary, you can add replication zones for the "timeseries" range and other "system" ranges as well. See [Create a Replication Zone for a System Range](#create-a-replication-zone-for-a-system-range) for more details.<br><br>CockroachDB also comes with a pre-configured replication zone for one internal table, `system.jobs`, which stores metadata about long-running jobs such as schema changes and backups. Historical queries are never run against this table and the rows in it are updated frequently, so the pre-configured zone gives this table a lower-than-default `ttlseconds`.

### Level priorities

When replicating data, whether table or system, CockroachDB always uses the most granular replication zone available. For example, for a piece of user data:

1. If there's a replication zone for the row, CockroachDB uses it.
2. If there's no applicable row replication zone and the row is from a secondary index, CockroachDB uses the secondary index replication zone.
3. If the row isn't from a secondary index or there is no applicable secondary index replication zone, CockroachDB uses the table replication zone.
4. If there's no applicable table replication zone, CockroachDB uses the database replication zone.
5. If there's no applicable database replication zone, CockroachDB uses the `.default` cluster-wide replication zone.

{{site.data.alerts.callout_danger}}
{% include {{page.version.version}}/known-limitations/system-range-replication.md %}
{{site.data.alerts.end}}

## Replication zone format

A replication zone is specified in [YAML](https://en.wikipedia.org/wiki/YAML) format and looks like this:

~~~ yaml
range_min_bytes: <size-in-bytes>
range_max_bytes: <size-in-bytes>
gc:
  ttlseconds: <time-in-seconds>
num_replicas: <number-of-replicas>
constraints: <json-formatted-constraints>
~~~

Field | Description
------|------------
`range_min_bytes` | Not yet implemented.
`range_max_bytes` | The maximum size, in bytes, for a range of data in the zone. When a range reaches this size, CockroachDB will spit it into two ranges.<br><br>**Default:** `67108864` (64MiB)
`ttlseconds` | The number of seconds overwritten values will be retained before garbage collection. Smaller values can save disk space if values are frequently overwritten; larger values increase the range allowed for `AS OF SYSTEM TIME` queries, also known as [Time Travel Queries](select-clause.html#select-historical-data-time-travel).<br><br>It is not recommended to set this below `600` (10 minutes); doing so will cause problems for long-running queries. Also, since all versions of a row are stored in a single range that never splits, it is not recommended to set this so high that all the changes to a row in that time period could add up to more than 64MiB; such oversized ranges could contribute to the server running out of memory or other problems.<br><br>**Default:** `90000` (25 hours)
`num_replicas` | The number of replicas in the zone.<br><br>**Default:** `3`
`constraints` | A JSON object or array of required and/or prohibited constraints influencing the location of replicas. See [Types of Constraints](#types-of-constraints) and [Scope of Constraints](#scope-of-constraints) for more details.<br/><br/>To prevent hard-to-detect typos, constraints placed on [store attributes and node localities](#descriptive-attributes-assigned-to-nodes) must match the values passed to at least one node in the cluster. If not, an error is signalled.<br/><br/>**Default:** No constraints, with CockroachDB locating each replica on a unique node and attempting to spread replicas evenly across localities.
`lease_preferences` | An ordered list of required and/or prohibited constraints influencing the location of leaseholders, e.g. `[[+zone=us-east-1a]]`.  Whether each constraint is required or prohibited is expressed with a leading `+` or `-`, respectively.  Note that lease preference constraints do not have to be shared with the `constraints` field.  For example, it's valid for your configuration to define a `lease_preferences` field that does not reference any values from the `constraints` field.  It's also valid to define a `lease_preferences` field with no `constraints` field at all. <br /><br />  If the first preference cannot be satisfied, CockroachDB will attempt to satisfy the second preference, and so on.  If none of the preferences can be met, the lease will be placed using the default lease placement algorithm, which is to base lease placement decisions on how many leases each node already has, trying to make all the nodes have around the same amount. <br /><br /> For an example, see [Constrain leaseholders to specific datacenters](#constrain-leaseholders-to-specific-datacenters). <br /><br />**Default**: No lease location preferences are applied if this field is not specified.

## Replication constraints

The location of replicas, both when they are first added and when they are rebalanced to maintain cluster equilibrium, is based on the interplay between descriptive attributes assigned to nodes and constraints set in zone configurations.

{{site.data.alerts.callout_success}}For demonstrations of how to set node attributes and replication constraints in different scenarios, see <a href="#scenario-based-examples">Scenario-based Examples</a> below.{{site.data.alerts.end}}

### Descriptive attributes assigned to nodes

When starting a node with the [`cockroach start`](start-a-node.html) command, you can assign the following types of descriptive attributes:

Attribute Type | Description
---------------|------------
**Node Locality** | Using the `--locality` flag, you can assign arbitrary key-value pairs that describe the locality of the node. Locality might include country, region, datacenter, rack, etc. The key-value pairs should be ordered from most inclusive to least inclusive (e.g., country before datacenter before rack), and the keys and the order of key-value pairs must be the same on all nodes. It's typically better to include more pairs than fewer. For example:<br><br>`--locality=region=east,datacenter=us-east-1`<br>`--locality=region=east,datacenter=us-east-2`<br>`--locality=region=west,datacenter=us-west-1`<br><br>CockroachDB attempts to spread replicas evenly across the cluster based on locality, with the order determining the priority. However, locality can be used to influence the location of data replicas in various ways using replication zones.<br><br>When there is high latency between nodes, CockroachDB also uses locality to move range leases closer to the current workload, reducing network round trips and improving read performance. See [Follow-the-workload](demo-follow-the-workload.html) for more details.
**Node Capability** | Using the `--attrs` flag, you can specify node capability, which might include specialized hardware or number of cores, for example:<br><br>`--attrs=ram:64gb`
**Store Type/Capability** | Using the `attrs` field of the `--store` flag, you can specify disk type or capability, for example:<br><br>`--store=path=/mnt/ssd01,attrs=ssd`<br>`--store=path=/mnt/hda1,attrs=hdd:7200rpm`

### Types of constraints

The node-level and store-level descriptive attributes mentioned above can be used as the following types of constraints in replication zones to influence the location of replicas. However, note the following general guidance:

- When locality is the only consideration for replication, it's recommended to set locality on nodes without specifying any constraints in zone configurations. In the absence of constraints, CockroachDB attempts to spread replicas evenly across the cluster based on locality.
- Required and prohibited constraints are useful in special situations where, for example, data must or must not be stored in a specific country or on a specific type of machine.

Constraint Type | Description | Syntax
----------------|-------------|-------
**Required** | When placing replicas, the cluster will consider only nodes/stores with matching attributes or localities. When there are no matching nodes/stores, new replicas will not be added. | `+ssd`
**Prohibited** | When placing replicas, the cluster will ignore nodes/stores with matching attributes or localities. When there are no alternate nodes/stores, new replicas will not be added. | `-ssd`

### Scope of constraints

Constraints can be specified such that they apply to all replicas in a zone or such that different constraints apply to different replicas, meaning you can effectively pick the exact location of each replica.

Constraint Scope | Description | Syntax
-----------------|-------------|-------
**All Replicas** | Constraints specified using JSON array syntax apply to all replicas in every range that's part of the replication zone. | `constraints: [+ssd, -region=west]`
**Per-Replica** | Multiple lists of constraints can be provided in a JSON object, mapping each list of constraints to an integer number of replicas in each range that the constraints should apply to.<br><br>The total number of replicas constrained cannot be greater than the total number of replicas for the zone (`num_replicas`). However, if the total number of replicas constrained is less than the total number of replicas for the zone, the non-constrained replicas will be allowed on any nodes/stores. | `constraints: {"+ssd,-region=west": 2, "+region=east": 1}`

## Node/replica recommendations

See [Cluster Topography](recommended-production-settings.html#cluster-topology) recommendations for production deployments.

## Subcommands

Subcommand | Usage
-----------|------
`ls` | List all replication zones.
`get` | View the YAML contents of a replication zone.
`set` | Create or edit a replication zone.
`rm` | Remove a replication zone.

## Synopsis

~~~ shell
# List all replication zones:
$ cockroach zone ls <flags>

# View the default replication zone for the cluster:
$ cockroach zone get .default <flags>

# View the replication zone for a database:
$ cockroach zone get <database> <flags>

# View the replication zone for a table:
$ cockroach zone get <database.table> <flags>

# View the replication zone for an index:
$ cockroach zone get <database.table@index> <flags>

# View the replication zone for a table or index partition:
$ cockroach zone get <database.table.partition> <flags>

# Edit the default replication zone for the cluster:
$ cockroach zone set .default --file=<zone-content.yaml> <flags>

# Create/edit the replication zone for a database:
$ cockroach zone set <database> --file=<zone-content.yaml> <flags>

# Create/edit the replication zone for a table:
$ cockroach zone set <database.table> --file=<zone-content.yaml> <flags>

# Create/edit the replication zone for an index:
$ cockroach zone set <database.table@index> --file=<zone-content.yaml> <flags>

# Create/edit the replication zone for a table or index partition:
$ cockroach zone set <database.table.partition> --file=<zone-content.yaml> <flags>

# Remove the replication zone for a database:
$ cockroach zone rm <database> <flags>

# Remove the replication zone for a table:
$ cockroach zone rm <database.table> <flags>

# Remove the replication zone for an index:
$ cockroach zone rm <database.table@index> <flags>

# Remove the replication zone for a table or index partition:
$ cockroach zone set <database.table.partition> --file=<zone-content.yaml> <flags>

# View help:
$ cockroach zone --help
$ cockroach zone ls --help
$ cockroach zone get --help
$ cockroach zone set --help
$ cockroach zone rm --help
~~~

## Flags

The `zone` command and subcommands support the following [general-use](#general) and [logging](#logging) flags.

### General

Flag | Description
-----|------------
`--disable-replication` | Disable replication in the zone by setting the zone's replica count to 1. This is equivalent to setting `num_replicas: 1`.
`--echo-sql` | Reveal the SQL statements sent implicitly by the command-line utility. For a demonstration, see the [example](#reveal-the-sql-statements-sent-implicitly-by-the-command-line-utility) below.
`--file`<br>`-f` | The path to the [YAML file](#replication-zone-format) defining the zone configuration. To pass the zone configuration via the standard input, set this flag to `-`.<br><br>This flag is relevant only for the `set` subcommand.

### Client connection

{% include {{ page.version.version }}/sql/connection-parameters.md %}

See [Client Connection Parameters](connection-parameters.html) for more details.

Currently, only members of the `admin` role can configure replication zones. By default, the `root` user belongs to the `admin` role.

### Logging

By default, the `zone` command logs errors to `stderr`.

If you need to troubleshoot this command's behavior, you can change its [logging behavior](debug-and-error-logs.html).

## Basic examples

These examples focus on the basic approach and syntax for working with zone configuration. For examples demonstrating how to use constraints, see [Scenario-based Examples](#scenario-based-examples).

###  List the pre-configured replication zones

Newly created CockroachDB clusters start with some special pre-configured replication zones:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach zone ls --insecure --host=<node address>
~~~

~~~
.default
.liveness
.meta
system.jobs
~~~

###  View the default replication zone

The cluster-wide replication zone (`.default`) is initially set to replicate data to any three nodes in your cluster, with ranges in each replica splitting once they get larger than 67108864 bytes.

To view the default replication zone, use the `cockroach zone get .default` command with appropriate flags:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach zone get .default --insecure --host=<node address>
~~~

~~~
.default
range_min_bytes: 1048576
range_max_bytes: 67108864
gc:
  ttlseconds: 86400
num_replicas: 3
constraints: []
~~~

### Edit the default replication zone

{{site.data.alerts.callout_danger}}
{% include {{page.version.version}}/known-limitations/system-range-replication.md %}
{{site.data.alerts.end}}

To edit the default replication zone, create a YAML file defining only the values you want to change (other values will be copied from the `.default` zone), and use the `cockroach zone set .default -f <file.yaml>` command with appropriate flags:

{% include copy-clipboard.html %}
~~~ shell
$ cat default_update.yaml
~~~

~~~
num_replicas: 5
~~~

{% include copy-clipboard.html %}
~~~ shell
$ cockroach zone set .default \
--insecure \
--host=<node address> \
-f default_update.yaml
~~~

~~~
range_min_bytes: 1048576
range_max_bytes: 67108864
gc:
  ttlseconds: 86400
num_replicas: 5
constraints: []
~~~

Alternately, you can pass the YAML content via the standard input:

{% include copy-clipboard.html %}
~~~ shell
$ echo 'num_replicas: 5' | cockroach zone set .default \
--insecure \
--host=<node address> -f -
~~~

### Create a replication zone for a database

To control replication for a specific database, create a YAML file defining only the values you want to change (other values will not be affected), and use the `cockroach zone set <database> -f <file.yaml>` command with appropriate flags:

{% include copy-clipboard.html %}
~~~ shell
$ cat database_zone.yaml
~~~

~~~
num_replicas: 7
~~~

{% include copy-clipboard.html %}
~~~ shell
$ cockroach zone set db1 \
--insecure \
--host=<node address> \
-f database_zone.yaml
~~~

~~~
range_min_bytes: 1048576
range_max_bytes: 67108864
gc:
  ttlseconds: 86400
num_replicas: 5
constraints: []
~~~

Alternately, you can pass the YAML content via the standard input:

{% include copy-clipboard.html %}
~~~ shell
$ echo 'num_replicas: 5' | cockroach zone set db1 \
--insecure \
--host=<node address> \
-f -
~~~

### Create a replication zone for a table

To control replication for a specific table, create a YAML file defining only the values you want to change (other values will not be affected), and use the `cockroach zone set <database.table> -f <file.yaml>` command with appropriate flags:

{% include copy-clipboard.html %}
~~~ shell
$ cat table_zone.yaml
~~~

~~~
num_replicas: 7
~~~

{% include copy-clipboard.html %}
~~~ shell
$ cockroach zone set db1.t1 \
--insecure \
--host=<node address> \
-f table_zone.yaml
~~~

~~~
range_min_bytes: 1048576
range_max_bytes: 67108864
gc:
  ttlseconds: 86400
num_replicas: 7
constraints: []
~~~

Alternately, you can pass the YAML content via the standard input:

{% include copy-clipboard.html %}
~~~ shell
$ echo 'num_replicas: 7' | cockroach zone set db1.t1 \
--insecure \
--host=<node address> \
-f -
~~~

### Create a replication zone for a secondary index

{{site.data.alerts.callout_info}}
This is an [enterprise-only](enterprise-licensing.html) feature.
{{site.data.alerts.end}}

The [secondary indexes](indexes.html) on a table will automatically use the replication zone for the table. However, with an enterprise license, you can add distinct replication zones for secondary indexes.

To control replication for a specific secondary index, create a YAML file defining only the values you want to change (other values will not be affected), and use the `cockroach zone set <database.table@index> -f <file.yaml>` command with appropriate flags:

{{site.data.alerts.callout_success}}
To get the name of a secondary index, which you need for the `cockroach zone set` command, use the [`SHOW INDEX`](show-index.html) or [`SHOW CREATE TABLE`](show-create.html) statements.
{{site.data.alerts.end}}

{% include copy-clipboard.html %}
~~~ shell
$ cat index_zone.yaml
~~~

~~~
num_replicas: 7
~~~

{% include copy-clipboard.html %}
~~~ shell
$ cockroach zone set db1.table@idx1 \
--insecure \
--host=<node address> \
-f index_zone.yaml
~~~

~~~
range_min_bytes: 1048576
range_max_bytes: 67108864
gc:
  ttlseconds: 86400
num_replicas: 7
constraints: []
~~~

Alternately, you can pass the YAML content via the standard input:

{% include copy-clipboard.html %}
~~~ shell
$ echo 'num_replicas: 7' | cockroach zone set db1.table@idx1 \
--insecure \
--host=<node address> \
-f -
~~~

### Create a replication zone for a table or secondary index partition

{{site.data.alerts.callout_info}}
This is an [enterprise-only](enterprise-licensing.html) feature.
{{site.data.alerts.end}}

To [control replication for table partitions](partitioning.html#replication-zones), create a YAML file defining only the values you want to change (other values will not be affected), and use the `cockroach zone set <database.table.partition> -f <file.yaml>` command with appropriate flags:

{% include copy-clipboard.html %}
~~~ shell
$ cat > australia_zone.yml
~~~

~~~ shell
constraints: [+datacenter=au1]
~~~

Apply zone configurations to corresponding partitions:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach zone set roachlearn.students_by_list.australia \
--insecure \
--host=<node address> \
-f australia_zone.yml
~~~

{{site.data.alerts.callout_success}}
Since the syntax is the same for defining a replication zone for a table or index partition (`database.table.partition`), give partitions names that communicate what they are partitioning, e.g., `australia_table` vs `australia_idx1`.
{{site.data.alerts.end}}

### Create a replication zone for a system range

In addition to the databases and tables that are visible via the SQL interface, CockroachDB stores internal data in what are called system ranges. CockroachDB comes with pre-configured replication zones for some of these ranges:

Zone Name | Description
----------|-----------------|------------
`.meta` | The "meta" ranges contain the authoritative information about the location of all data in the cluster.<br><br>Because historical queries are never run on meta ranges and it is advantageous to keep these ranges smaller for reliable performance, CockroachDB comes with a **pre-configured** `.meta` replication zone giving these ranges a lower-than-default `ttlseconds`.<br><br>If your cluster is running in multiple datacenters, it's a best practice to configure the meta ranges to have a copy in each datacenter.
`.liveness` | The "liveness" range contains the authoritative information about which nodes are live at any given time.<br><br>Just as for "meta" ranges, historical queries are never run on the liveness range, so CockroachDB comes with a **pre-configured** `.liveness` replication zone giving this range a lower-than-default `ttlseconds`.<br><br>If this range is unavailable, the entire cluster will be unavailable, so giving it a high replication factor is strongly recommended.
`.timeseries` | The "timeseries" ranges contain monitoring data about the cluster that powers the graphs in CockroachDB's Admin UI. If necessary, you can add a `.timeseries` replication zone to control the replication of this data.
`.system` | There are system ranges for a variety of other important internal data, including information needed to allocate new table IDs and track the status of a cluster's nodes. If necessary, you can add a `.system` replication zone to control the replication of this data.

To control replication for one of the above sets of system ranges, create a YAML file defining only the values you want to change (other values will not be affected), and use the `cockroach zone set <zone-name> -f <file.yaml>` command with appropriate flags:

{% include copy-clipboard.html %}
~~~ shell
$ cat meta_zone.yaml
~~~

~~~
num_replicas: 7
~~~

{% include copy-clipboard.html %}
~~~ shell
$ cockroach zone set .meta \
--insecure \
--host=<node address> \
-f meta_zone.yaml
~~~

~~~
range_min_bytes: 1048576
range_max_bytes: 67108864
gc:
  ttlseconds: 86400
num_replicas: 7
constraints: []
~~~

Alternately, you can pass the YAML content via the standard input:

{% include copy-clipboard.html %}
~~~ shell
$ echo 'num_replicas: 7' | cockroach zone set .meta \
--insecure \
--host=<node address> \
-f -
~~~

### Reveal the SQL statements sent implicitly by the command-line utility

In this example, we use the `--echo-sql` flag to reveal the SQL statement sent implicitly by the command-line utility:

{% include copy-clipboard.html %}
~~~ shell
$ echo 'num_replicas: 5' | cockroach zone set .default \
--insecure \
--host=<node address> \
--echo-sql \
-f -
~~~

~~~
> BEGIN
> SAVEPOINT cockroach_restart
> SELECT config FROM system.zones WHERE id = $1
> UPSERT INTO system.zones (id, config) VALUES ($1, $2)
range_min_bytes: 1048576
range_max_bytes: 67108864
gc:
  ttlseconds: 90000
num_replicas: 5
constraints: []
> RELEASE SAVEPOINT cockroach_restart
> COMMIT
~~~

### Constrain leaseholders to specific datacenters

In addition to [constraining replicas to specific datacenters](#per-replica-constraints-to-specific-datacenters), you may also specify preferences for where the range's leaseholders should be placed, as shown below.  This can result in increased performance in some scenarios.

First, specify the `lease_preferences` field in the zone config YAML file as shown below.  This configuration requires that the cluster try to place the range's leaseholders in `us-east-1b`; if that is not possible, it will try to place them in `us-east-1a`.

For more information about how the `lease_preferences` field works, see its description in the [Replication zone format](#replication-zone-format) section.

{% include copy-clipboard.html %}
~~~ shell
$ cat lease_prefs.yaml
~~~

{% include copy-clipboard.html %}
~~~ yaml
num_replicas: 3
constraints: {"+us-east-1a,+ssd": 1, "+us-east-1b": 1}
lease_preferences: [[+us-east-1b], [+us-east-1a]]
~~~

Next, pass the configuration file to the running cluster as shown below:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach zone set db.t@primary --file=lease_prefs.yaml
~~~

## Scenario-based examples

### Even replication across datacenters

**Scenario:**

- You have 6 nodes across 3 datacenters, 2 nodes in each datacenter.
- You want data replicated 3 times, with replicas balanced evenly across all three datacenters.

**Approach:**

Start each node with its datacenter location specified in the `--locality` flag:

~~~ shell
# Start the two nodes in datacenter 1:
$ cockroach start --insecure --advertise-addr=<node1 hostname> --locality=datacenter=us-1 \
--join=<node1 hostname>,<node3 hostname>,<node5 hostname>
$ cockroach start --insecure --advertise-addr=<node2 hostname> --locality=datacenter=us-1 \
--join=<node1 hostname>,<node3 hostname>,<node5 hostname>

# Start the two nodes in datacenter 2:
$ cockroach start --insecure --advertise-addr=<node3 hostname> --locality=datacenter=us-2 \
--join=<node1 hostname>,<node3 hostname>,<node5 hostname>
$ cockroach start --insecure --advertise-addr=<node4 hostname> --locality=datacenter=us-2 \
--join=<node1 hostname>,<node3 hostname>,<node5 hostname>

# Start the two nodes in datacenter 3:
$ cockroach start --insecure --advertise-addr=<node5 hostname> --locality=datacenter=us-3 \
--join=<node1 hostname>,<node3 hostname>,<node5 hostname>
$ cockroach start --insecure --advertise-addr=<node6 hostname> --locality=datacenter=us-3 \
--join=<node1 hostname>,<node3 hostname>,<node5 hostname>

# Initialize the cluster:
$ cockroach init --insecure --host=<any node hostname>
~~~

There's no need to make zone configuration changes; by default, the cluster is configured to replicate data three times, and even without explicit constraints, the cluster will aim to diversify replicas across node localities.

### Per-replica constraints to specific datacenters

**Scenario:**

- You have 5 nodes across 5 datacenters in 3 regions, 1 node in each datacenter.
- You want data replicated 3 times, with a quorum of replicas for a database holding West Coast data centered on the West Coast and a database for nation-wide data replicated across the entire country.

**Approach:**

1. Start each node with its region and datacenter location specified in the `--locality` flag:

    ~~~ shell
    # Start the four nodes:
    $ cockroach start --insecure --advertise-addr=<node1 hostname> --locality=region=us-west1,datacenter=us-west1-a \
    --join=<node1 hostname>,<node2 hostname>,<node3 hostname>,<node4 hostname>,<node5 hostname>
    $ cockroach start --insecure --advertise-addr=<node2 hostname> --locality=region=us-west1,datacenter=us-west1-b \
    --join=<node1 hostname>,<node2 hostname>,<node3 hostname>,<node4 hostname>,<node5 hostname>
    $ cockroach start --insecure --advertise-addr=<node3 hostname> --locality=region=us-central1,datacenter=us-central1-a \
    --join=<node1 hostname>,<node2 hostname>,<node3 hostname>,<node4 hostname>,<node5 hostname>
    $ cockroach start --insecure --advertise-addr=<node4 hostname> --locality=region=us-east1,datacenter=us-east1-a \
    --join=<node1 hostname>,<node2 hostname>,<node3 hostname>,<node4 hostname>,<node5 hostname>
    $ cockroach start --insecure --advertise-addr=<node5 hostname> --locality=region=us-east1,datacenter=us-east1-b \
    --join=<node1 hostname>,<node2 hostname>,<node3 hostname>,<node4 hostname>,<node5 hostname>

    # Initialize the cluster:
    $ cockroach init --insecure --host=<any node hostname>
    ~~~

2. On any node, configure a replication zone for the database used by the West Coast application:

    {% include copy-clipboard.html %}
    ~~~ shell
    # Create a YAML file with the replica count set to 5:
    $ cat west_app_zone.yaml
    ~~~

    ~~~
    constraints: {"+region=us-west1": 2, "+region=us-central1": 1}
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    # Apply the replication zone to the database used by the West Coast application:
    $ cockroach zone set west_app_db \
    --insecure \
    --host=<node address> \
    -f west_app_zone.yaml
    ~~~

    ~~~
    range_min_bytes: 1048576
    range_max_bytes: 67108864
    gc:
      ttlseconds: 86400
    num_replicas: 3
    constraints: {+region=us-central1: 1, +region=us-west1: 2}
    ~~~

    Two of the database's three replicas will be put in `region=us-west1` and its remaining replica will be put in `region=us-central1`. This gives the application the resilience to survive the total failure of any one datacenter while providing low-latency reads and writes on the West Coast because a quorum of replicas are located there.

3. No configuration is needed for the nation-wide database. The cluster is configured to replicate data 3 times and spread them as widely as possible by default. Because the first key-value pair specified in each node's locality is considered the most significant part of each node's locality, spreading data as widely as possible means putting one replica in each of the three different regions.

### Multiple applications writing to different databases

**Scenario:**

- You have 2 independent applications connected to the same CockroachDB cluster, each application using a distinct database.
- You have 6 nodes across 2 datacenters, 3 nodes in each datacenter.
- You want the data for application 1 to be replicated 5 times, with replicas evenly balanced across both datacenters.
- You want the data for application 2 to be replicated 3 times, with all replicas in a single datacenter.

**Approach:**

1. Start each node with its datacenter location specified in the `--locality` flag:

    ~~~ shell
    # Start the three nodes in datacenter 1:
    $ cockroach start --insecure --advertise-addr=<node1 hostname> --locality=datacenter=us-1 \
    --join=<node1 hostname>,<node2 hostname>,<node3 hostname>,<node4 hostname>,<node5 hostname>,<node6 hostname>
    $ cockroach start --insecure --advertise-addr=<node2 hostname> --locality=datacenter=us-1 \
    --join=<node1 hostname>,<node2 hostname>,<node3 hostname>,<node4 hostname>,<node5 hostname>,<node6 hostname>
    $ cockroach start --insecure --advertise-addr=<node3 hostname> --locality=datacenter=us-1 \
    --join=<node1 hostname>,<node2 hostname>,<node3 hostname>,<node4 hostname>,<node5 hostname>,<node6 hostname>

    # Start the three nodes in datacenter 2:
    $ cockroach start --insecure --advertise-addr=<node4 hostname> --locality=datacenter=us-2 \
    --join=<node1 hostname>,<node2 hostname>,<node3 hostname>,<node4 hostname>,<node5 hostname>,<node6 hostname>
    $ cockroach start --insecure --advertise-addr=<node5 hostname> --locality=datacenter=us-2 \
    --join=<node1 hostname>,<node2 hostname>,<node3 hostname>,<node4 hostname>,<node5 hostname>,<node6 hostname>
    $ cockroach start --insecure --advertise-addr=<node6 hostname> --locality=datacenter=us-2 \
    --join=<node1 hostname>,<node2 hostname>,<node3 hostname>,<node4 hostname>,<node5 hostname>,<node6 hostname>

    # Initialize the cluster:
    $ cockroach init --insecure --host=<any node hostname>
    ~~~

2. On any node, configure a replication zone for the database used by application 1:

    {% include copy-clipboard.html %}
    ~~~ shell
    # Create a YAML file with the replica count set to 5:
    $ cat app1_zone.yaml
    ~~~

    ~~~
    num_replicas: 5
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    # Apply the replication zone to the database used by application 1:
    $ cockroach zone set app1_db \
    --insecure \
    --host=<node address> \
    -f app1_zone.yaml
    ~~~

    ~~~
    range_min_bytes: 1048576
    range_max_bytes: 67108864
    gc:
      ttlseconds: 86400
    num_replicas: 5
    constraints: []
    ~~~

    Nothing else is necessary for application 1's data. Since all nodes specify their datacenter locality, the cluster will aim to balance the data in the database used by application 1 between datacenters 1 and 2.

3. On any node, configure a replication zone for the database used by application 2:

    {% include copy-clipboard.html %}
    ~~~ shell
    # Create a YAML file with 1 datacenter as a required constraint:
    $ cat app2_zone.yaml
    ~~~

    ~~~
    constraints: [+datacenter=us-2]
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    # Apply the replication zone to the database used by application 2:
    $ cockroach zone set app2_db \
    --insecure \
    --host=<node address> \
    -f app2_zone.yaml
    ~~~

    ~~~
    range_min_bytes: 1048576
    range_max_bytes: 67108864
    gc:
     ttlseconds: 86400
    num_replicas: 3
    constraints: [+datacenter=us-2]
    ~~~

    The required constraint will force application 2's data to be replicated only within the `us-2` datacenter.

### Stricter replication for a table and its secondary indexes

**Scenario:**

- You have 7 nodes, 5 with SSD drives and 2 with HDD drives.
- You want data replicated 3 times by default.
- Speed and availability are important for a specific table and its indexes, which are queried very frequently, however, so you want the data in the table and secondary indexes to be replicated 5 times, preferably on nodes with SSD drives.

**Approach:**

1. Start each node with `ssd` or `hdd` specified as store attributes:

    ~~~ shell
    # Start the 5 nodes with SSD storage:
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

    # Start the 2 nodes with HDD storage:
    $ cockroach start --insecure --advertise-addr=<node6 hostname> --store=path=node6,attrs=hdd \
    --join=<node1 hostname>,<node2 hostname>,<node3 hostname>
    $ cockroach start --insecure --advertise-addr=<node7 hostname> --store=path=node7,attrs=hdd \
    --join=<node1 hostname>,<node2 hostname>,<node3 hostname>

    # Initialize the cluster:
    $ cockroach init --insecure --host=<any node hostname>
    ~~~

2. On any node, configure a replication zone for the table that must be replicated more strictly:

    {% include copy-clipboard.html %}
    ~~~ shell
    # Create a YAML file with the replica count set to 5
    # and the ssd attribute as a required constraint:
    $ cat table_zone.yaml
    ~~~

    ~~~
    num_replicas: 5
    constraints: [+ssd]
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    # Apply the replication zone to the table:
    $ cockroach zone set db.important_table \
    --insecure \
    --host=<any node hostname> \
    -f table_zone.yaml
    ~~~

    ~~~
    range_min_bytes: 1048576
    range_max_bytes: 67108864
    gc:
     ttlseconds: 86400
    num_replicas: 5
    constraints: [+ssd]
    ~~~

    The secondary indexes on the table will use the table's replication zone, so all data for the table will be replicated 5 times, and the required constraint will place the data on nodes with `ssd` drives.

### Tweaking the replication of system ranges

**Scenario:**

- You have nodes spread across 7 datacenters.
- You want data replicated 5 times by default.
- For better performance, you want a copy of the meta ranges in all of the datacenters.
- To save disk space, you only want the internal timeseries data replicated 3 times by default.

**Approach:**

1. Start each node with a different locality attribute:

    ~~~ shell
    # Start the nodes:
    $ cockroach start --insecure --advertise-addr=<node1 hostname> --locality=datacenter=us-1 \
    --join=<node1 hostname>,<node2 hostname>,<node3 hostname>   
    $ cockroach start --insecure --advertise-addr=<node2 hostname> --locality=datacenter=us-2 \
    --join=<node1 hostname>,<node2 hostname>,<node3 hostname>
    $ cockroach start --insecure --advertise-addr=<node3 hostname> --locality=datacenter=us-3 \
    --join=<node1 hostname>,<node2 hostname>,<node3 hostname>
    $ cockroach start --insecure --advertise-addr=<node4 hostname> --locality=datacenter=us-4 \
    --join=<node1 hostname>,<node2 hostname>,<node3 hostname>
    $ cockroach start --insecure --advertise-addr=<node5 hostname> --locality=datacenter=us-5 \
    --join=<node1 hostname>,<node2 hostname>,<node3 hostname>
    $ cockroach start --insecure --advertise-addr=<node6 hostname> --locality=datacenter=us-6 \
    --join=<node1 hostname>,<node2 hostname>,<node3 hostname>
    $ cockroach start --insecure --advertise-addr=<node7 hostname> --locality=datacenter=us-7 \
    --join=<node1 hostname>,<node2 hostname>,<node3 hostname>

    # Initialize the cluster:
    $ cockroach init --insecure --host=<any node hostname>
    ~~~

2. On any node, configure the default replication zone:

    {% include copy-clipboard.html %}
    ~~~ shell
    echo 'num_replicas: 5' | cockroach zone set .default \
    --insecure \
    --host=<any node hostname> \
    -f -
    ~~~

    ~~~
    range_min_bytes: 1048576
    range_max_bytes: 67108864
    gc:
     ttlseconds: 86400
    num_replicas: 5
    constraints: []
    ~~~

    All data in the cluster will be replicated 5 times, including both SQL data and the internal system data.

3. On any node, configure the `.meta` replication zone:

    {% include copy-clipboard.html %}
   ~~~ shell
   echo 'num_replicas: 7' | cockroach zone set .meta \
   --insecure \
   --host=<any node hostname> \
   -f -
   ~~~

   ~~~
   range_min_bytes: 1048576
   range_max_bytes: 67108864
   gc:
     ttlseconds: 86400
   num_replicas: 7
   constraints: []
   ~~~

   The `.meta` addressing ranges will be replicated such that one copy is in all 7 datacenters, while all other data will be replicated 5 times.

4. On any node, configure the `.timeseries` replication zone:

    {% include copy-clipboard.html %}
   ~~~ shell
   echo 'num_replicas: 3' | cockroach zone set .timeseries \
   --insecure \
   --host=<any node hostname> \
   -f -
   ~~~

   ~~~
   range_min_bytes: 1048576
   range_max_bytes: 67108864
   gc:
     ttlseconds: 86400
   num_replicas: 3
   constraints: []
   ~~~

   The timeseries data will only be replicated 3 times without affecting the configuration of all other data.

## See also

- [Other Cockroach Commands](cockroach-commands.html)
- [Table Partitioning](partitioning.html)
