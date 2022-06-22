---
title: Multi-region Capabilities Overview
summary: Learn how to use CockroachDB's improved multi-region capabilities.
toc: true
keywords: gin, gin index, gin indexes, inverted index, inverted indexes, accelerated index, accelerated indexes
---

## Overview

{% include_cached new-in.html version="v21.1" %} CockroachDB has improved multi-region capabilities that make it easier to run global applications.

To take advantage of these improved capabilities, you will need to understand the following concepts:

- [_Cluster Regions_](#cluster-regions) are geographic regions that a user specifies at node start time.
- [_Database Regions_](#database-regions) are geographic regions that a given database operates within. A database region must be chosen from the list of available cluster regions.
- [_Survival Goals_](#survival-goals), which dictate how many simultaneous failure(s) that a database can survive.
- [_Table Localities_](#table-locality), which tell CockroachDB how to optimize access to a table's data.

<a name="default-settings"></a>

At a high level, the simplest process for running a multi-region cluster is:

1. Set region information for each node in the cluster at startup using [node startup locality options](cockroach-start.html#locality).
2. Add one or more regions to a database, making it a "multi-region" database. One of these regions must be the _primary region_.
3. (*Optional*) Change table localities (global, regional by table, regional by row). This step is optional because by default the tables in a database will be homed in the database's primary region (as set during Step 1).
4. (*Optional*) Change the database's survival goals (zone or region). This step is optional because by default multi-region databases will be configured to survive zone failures.

The steps above describe the simplest case, where you accept all of the default settings. If your application has performance or availability needs that are different than what the default settings provide, there are customization options to explore.

For more information about CockroachDB's multi-region capabilities and the customization options that are available, see below.

{{site.data.alerts.callout_success}}
{% include {{page.version.version}}/misc/multiregion-max-offset.md %}
{{site.data.alerts.end}}

{% include_cached enterprise-feature.md %}

## Cluster Regions

Regions and zones are defined at the node level using the following [node startup locality options](cockroach-start.html#locality):

- Regions are specified using the `region` key.
- Zones through the use of the `zone` key.

For example, the command below adds `us-east-1` to the list of cluster regions, and `us-east-1b` to the list of zones:

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach start --locality=region=us-east-1,zone=us-east-1b # ... other required flags go here
~~~

To show all of a cluster's regions, execute the following SQL statement:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW REGIONS FROM CLUSTER;
~~~

## Database Regions

 _Database regions_ are a high-level abstraction for a geographic region. Each region is broken into multiple zones. These terms are meant to correspond directly to the region and zone terminology used by cloud providers.

The regions added during node startup become _Database Regions_ when they are added to a database. To add the first region, use the [`ALTER DATABASE ... PRIMARY REGION` statement](set-primary-region.html).

While the database has only one region assigned to it, it is considered a "multi-region database."  This means that all data in that database is stored within its assigned regions, and CockroachDB optimizes access to the database's data from the primary region.

To add another database region, use the [`ALTER DATABASE ... ADD REGION` statement](add-region.html).

To show all of a database's regions, execute the [`SHOW REGIONS FROM DATABASE` statement](show-regions.html).

{{site.data.alerts.callout_info}}
If the default _Survival Goals_ and _Table Localities_ meet your needs, there is nothing else you need to do once you have set a database's primary region.
{{site.data.alerts.end}}

## Survival goals

All tables within the same database operate with the same survival goal. Each database is allowed to have its own survival goal setting.

The following survival goals are available:

- Zone failure
- Region failure

Surviving zone failures is the default. You can upgrade a database to survive region failures at the cost of slower write performance (due to network hops) using the following statement:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE <db> SURVIVE REGION FAILURE;
~~~

For more information about the survival goals supported by CockroachDB, see the following sections:

- [Surviving zone failures](#surviving-zone-failures)
- [Surviving region failures](#surviving-region-failures)

### Surviving zone failures

With the zone level survival goal, the database will remain fully available for reads and writes, even if a zone goes down. However, the database may not remain fully available if multiple zones fail in the same region.

You can configure a database to survive zone failures using the [`ALTER DATABASE ... SURVIVE ZONE FAILURE` statement](survive-failure.html).

{{site.data.alerts.callout_info}}
Surviving zone failures is the default setting for multi-region databases.

If your application has performance or availability needs that are different than what the default settings provide, you can explore the other customization options described on this page.
{{site.data.alerts.end}}

### Surviving region failures

The region level survival goal has the property that the database will remain fully available for reads and writes, even if an entire region goes down. This added survival comes at a cost: write latency will be increased by at least as much as the round-trip time to the nearest region. Read performance will be unaffected. In other words, you are adding network hops and making writes slower in exchange for robustness.

You can upgrade a database to survive region failures using the [`ALTER DATABASE ... SURVIVE REGION FAILURE` statement](survive-failure.html).

Setting this goal on a database in a cluster with 3 [cluster regions](#cluster-regions) will automatically increase the [replication factor](configure-replication-zones.html#num_replicas) of the [ranges](architecture/overview.html#architecture-range) underlying the database from 3 (the default) to 5. This ensures that there will be 5 replicas of each range spread across the 3 regions (2+2+1=5). This is how CockroachDB is able to provide region level resiliency while maintaining good read performance in the leaseholder's region. For writes, CockroachDB will need to coordinate across 2 of the 3 regions, so you will pay additional write latency in exchange for the increased resiliency.

{{site.data.alerts.callout_info}}
In order to survive region failures, you must have added at least 3 [database regions](#database-regions)
{{site.data.alerts.end}}

## Table locality

Every table in a multi-region database has a "table locality setting" applied to it. CockroachDB uses the table locality setting to determine how to optimize access to the table's data from that locality.

By default, all tables in a multi-region database are _regional_ tables -- that is, CockroachDB optimizes access to the table's data from a single region (by default, the database's primary region).

For more information about the table localities CockroachDB supports, see the following sections:

- [Regional tables](#regional-tables) provide low-latency reads and writes for an entire table from a single region.
- [Regional by row tables](#regional-by-row-tables) provide low-latency reads and writes for one or more rows of a table from a single region. Different rows in the table can be optimized for access from different regions.
- [Global tables](#global-tables) are optimized for low-latency reads from all regions.

{{site.data.alerts.callout_success}}
Regardless of table locality, you can access all data in a multi-region database with low latency from any [database region](#database-regions) by using stale [follower reads](follower-reads.html).
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
Table locality settings are used for optimizing latency under different read/write patterns. If you are optimizing for read/write access to all of your tables from a single region (the primary region), there is nothing else you need to do once you set your [database's primary region](#database-regions).
{{site.data.alerts.end}}

### Regional tables

{% include {{page.version.version}}/sql/regional-table-description.md %}

### Regional by row tables

{% include {{page.version.version}}/sql/regional-by-row-table-description.md %}

### Global tables

{% include {{page.version.version}}/sql/global-table-description.md %}

## Additional Features

The features listed in this section are designed to make working with multi-region clusters easier.

### Indexes on `REGIONAL BY ROW` tables

{% include {{page.version.version}}/sql/indexes-regional-by-row.md %}

Note that the behavior described above also applies to [GIN indexes](inverted-indexes.html).

For an example that uses unique indexes but applies to all indexes on `REGIONAL BY ROW` tables, see [Add a unique index to a `REGIONAL BY ROW` table](add-constraint.html#add-a-unique-index-to-a-regional-by-row-table).

## Schema changes in multi-region clusters

{% include {{ page.version.version }}/performance/lease-preference-system-database.md %}

## Next steps

+ [Choosing a multi-region configuration](choosing-a-multi-region-configuration.html)

## See also

- [When to use `ZONE` vs. `REGION` survival goals](when-to-use-zone-vs-region-survival-goals.html)
- [When to use `REGIONAL` vs. `GLOBAL` tables](when-to-use-regional-vs-global-tables.html)
- [Topology Patterns](topology-patterns.html)
- [Disaster Recovery](disaster-recovery.html)
- [Develop and Deploy a Global Application](movr-flask-overview.html)
- [Multi-region SQL performance](demo-low-latency-multi-region-deployment.html)
- [Migrate to Multi-region SQL](migrate-to-multiregion-sql.html)
