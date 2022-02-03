---
title: Multi-Region Capabilities Overview
summary: Learn how to use CockroachDB multi-region capabilities.
toc: true
keywords: gin, gin index, gin indexes, inverted index, inverted indexes, accelerated index, accelerated indexes
docs_area: 
---

This page provides an overview of CockroachDB multi-region features.

## Overview

CockroachDB multi-region capabilities make it easier to run global applications. To take advantage of these capabilities, you should understand the following concepts:

- [_Cluster region_](#cluster-regions) is a geographic region that you specify at node start time.
- [_Database region_](#database-regions) is a geographic region that a given database operates within. You must choose a database region from the list of available cluster regions.
- [_Survival goal_](#survival-goals) dictates how many simultaneous failure(s) a database can survive.
- [_Table locality_](#table-locality) determines how CockroachDB optimizes access to a table's data.

<a name="default-settings"></a>

At a high level, the simplest process for running a multi-region cluster is:

1. Set region information for each node in the cluster at startup using [node startup locality options](cockroach-start.html#locality).
1. Add one or more regions to a database, making it a "multi-region" database. One of these regions must be the _primary region_.
1. (*Optional*) Change table localities (global, regional by table, regional by row). This step is optional because by default the tables in a database will be homed in the database's primary region (as set during Step 1).
1. (*Optional*) Change the database's survival goals (zone or region). This step is optional because by default multi-region databases will be configured to survive zone failures.

These steps describe the simplest case, where you accept all of the default settings. If your application has performance or availability needs that are different than what the default settings provide you can explore customization options.

{{site.data.alerts.callout_success}}
{% include {{page.version.version}}/misc/multiregion-max-offset.md %}
{{site.data.alerts.end}}

## Cluster regions

You define a cluster region at the node level using the `region` key and the zone using the `zone` key in the [node startup locality options](cockroach-start.html#locality).

For example, the following command adds `us-east-1` to the list of cluster regions and `us-east-1b` to the list of zones:

{% include copy-clipboard.html %}
~~~ shell
cockroach start --locality=region=us-east-1,zone=us-east-1b # ... other required flags go here
~~~

To show all of a cluster's regions, execute the following SQL statement:

{% include copy-clipboard.html %}
~~~ sql
SHOW REGIONS FROM CLUSTER;
~~~

## Database regions

A _database region_ is a high-level abstraction for a geographic region. Each region is broken into multiple zones. These terms are meant to correspond directly to the region and zone terminology used by cloud providers.

The regions added during node startup become _database regions_ when you add them to a database. To add the first region, use the [`ALTER DATABASE ... PRIMARY REGION` statement](set-primary-region.html).

While the database has only one region assigned to it, it is considered a "multi-region database."  This means that all data in that database is stored within its assigned regions, and CockroachDB optimizes access to the database's data from the primary region. If the default _survival goals_ and _table localities_ meet your needs, there is nothing else you need to do once you have set a database's primary region.

To add another database region, use the [`ALTER DATABASE ... ADD REGION` statement](add-region.html).

To show all of a database's regions, execute the [`SHOW REGIONS FROM DATABASE` statement](show-regions.html).

{{site.data.alerts.callout_info}}
If the default survival goals and table localities meet your needs, there is nothing else you need to do once you have set a database's primary region.
{{site.data.alerts.end}}

## Survival goals

A _survival goal_ dictates how many simultaneous failure(s) a database can survive. All tables within the same database operate with the same survival goal. Each database is allowed to have its own survival goal setting.

The following survival goals are available:

- Zone failure
- Region failure

Surviving zone failures is the default. You can upgrade a database to survive region failures at the cost of slower write performance (due to network hops) using the following statement:

{% include copy-clipboard.html %}
~~~ sql
ALTER DATABASE <db> SURVIVE REGION FAILURE;
~~~

For more information about the survival goals supported by CockroachDB, see the following sections:

- [Surviving zone failures](#surviving-zone-failures)
- [Surviving region failures](#surviving-region-failures)

### Surviving zone failures

With the zone level survival goal, the database will remain fully available for reads and writes, even if a zone goes down. However, the database may not remain fully available if multiple zones fail in the same region.

You can configure a database to survive zone failures using the [`ALTER DATABASE ... SURVIVE ZONE FAILURE` statement](survive-failure.html).

Surviving zone failures is the default setting for multi-region databases.

If your application has performance or availability needs that are different than what the default settings provide, you can explore the other customization options described on this page.

### Surviving region failures

The region level survival goal has the property that the database will remain fully available for reads and writes, even if an entire region goes down. This added survival comes at a cost: write latency will be increased by at least as much as the round-trip time to the nearest region. Read performance will be unaffected. In other words, you are adding network hops and making writes slower in exchange for robustness.

You can configure a database to survive region failures using the [`ALTER DATABASE ... SURVIVE REGION FAILURE` statement](survive-failure.html). This increases the [replication factor](configure-replication-zones.html#num_replicas) of all data in the database from 3 (the default) to 5; this is how CockroachDB is able to provide the resiliency characteristics described above while maintaining a local quorum in the leaseholder's region for good performance.

{{site.data.alerts.callout_info}}
To survive region failures, you must add at least 3 [database regions](#database-regions).
{{site.data.alerts.end}}

<a id="table-locality"></a>
## Table localities

_Table locality_ determines how CockroachDB optimizes access to the table's data from that locality. Every table in a multi-region database has a "table locality setting". By default, all tables in a multi-region database are _regional_ tables -- that is, CockroachDB optimizes access to the table's data from a single region (by default, the database's primary region).

For information about the table localities CockroachDB supports, see the sections:

- [Regional tables](#regional-tables) provide low-latency reads and writes for an entire table from _a single region_.
- [Regional by row tables](#regional-by-row-tables) provide low-latency reads and writes for one or more rows of a table from _a single region_. Different rows in the table can be optimized for access from _different regions_.
- [Global tables](#global-tables) are optimized for low-latency reads from _all regions_.

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

The features listed in this section make working with multi-region clusters easier.

### Indexes on `REGIONAL BY ROW` tables

{% include {{page.version.version}}/sql/indexes-regional-by-row.md %}

This behavior also applies to [GIN indexes](inverted-indexes.html).

For an example that uses unique indexes but applies to all indexes on `REGIONAL BY ROW` tables, see [Add a unique index to a `REGIONAL BY ROW` table](add-constraint.html#add-a-unique-index-to-a-regional-by-row-table).

## Next steps

+ [How to Choose a Multi-Region Configuration](choosing-a-multi-region-configuration.html)

## See also

- [When to Use `ZONE` vs. `REGION` Survival Goals](when-to-use-zone-vs-region-survival-goals.html)
- [When to Use `REGIONAL` vs. `GLOBAL` Tables](when-to-use-regional-vs-global-tables.html)
- [Topology Patterns](topology-patterns.html)
- [Disaster Recovery](disaster-recovery.html)
- [Develop and Deploy a Global Application](movr-flask-overview.html)
- [Low Latency Reads and Writes in a Multi-Region Cluster](demo-low-latency-multi-region-deployment.html)
- [Migrate to Multi-Region SQL](migrate-to-multiregion-sql.html)
