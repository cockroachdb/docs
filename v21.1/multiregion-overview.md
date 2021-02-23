---
title: Multi-region Overview
summary: Learn how to use CockroachDB's improved multi-region user experience.
toc: true
---

## Overview

<span class="version-tag">New in v21.1:</span> CockroachDB has improved multi-region capabilities that make it easier to run global applications. It is intended that these capabilities will supersede the current set of [Multi-region Topology Patterns](topology-patterns.html#multi-region-patterns). The capabilities described here are still in development; they are available in [testing releases of v21.1](../releases/#testing-releases).

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

{{site.data.alerts.callout_info}}
The documentation for the new multi-region features described below is still in development. More documentation on these features will be published in the run-up to the v21.1 release.
{{site.data.alerts.end}}

## Cluster Regions

Regions and zones are defined at the node level using the following [node startup locality options](cockroach-start.html#locality):

- Regions are specified using the `region` key.
- Zones through the use of the `zone` key.

For example, the command below adds `us-east-1` to the list of cluster regions, and `us-east-1b` to the list of zones:

{% include copy-clipboard.html %}
~~~ shell
cockroach start --locality=region=us-east-1,zone=us-east-1b # ... other required flags go here
~~~

To show all of a cluster's regions, execute the following SQL statement:

{% include copy-clipboard.html %}
~~~ sql
SHOW REGIONS FROM CLUSTER;
~~~

## Database Regions

 _Database regions_ are a high-level abstraction for a geographic region. Each region is broken into multiple zones. These terms are meant to correspond directly to the region and zone terminology used by cloud providers.

The regions added during node startup become _Database Regions_ when they are added to a database using the following statement:

{% include copy-clipboard.html %}
~~~ sql
ALTER DATABASE <db> PRIMARY REGION 'us-east-1';
~~~

While the database has only one region assigned to it, it is considered a "multi-region database."  This means that all data in that database is stored within its assigned regions, and CockroachDB optimizes access to the database's data from the primary region.

To add another database region, use a statement like the following:

{% include copy-clipboard.html %}
~~~ sql
ALTER DATABASE <db> ADD REGION 'us-west-1';
~~~

To show all of a database's regions, execute the following SQL statement:

{% include copy-clipboard.html %}
~~~ sql
SHOW REGIONS FROM DATABASE <db>;
~~~

{{site.data.alerts.callout_info}}
If the default _Survival Goals_ and _Table Localities_ meet your needs, there is nothing else you need to do once you have set a database's primary region.
{{site.data.alerts.end}}

## Survival goals

All tables within the same database operate with the same survival goal. Each database is allowed to have its own survival goal setting.

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

{{site.data.alerts.callout_info}}
Surviving zone failures is the default setting for multi-region databases.

If your application has performance or availability needs that are different than what the default settings provide, you can explore the other customization options described on this page.
{{site.data.alerts.end}}

### Surviving region failures

The region level survival goal has the property that the database will remain fully available for reads and writes, even if an entire region goes down. This added survival comes at a cost: write latency will be increased by at least as much as the round-trip time to the nearest region. Read performance will be unaffected. In other words, you are adding network hops and making writes slower in exchange for robustness.

You can upgrade a database to survive region failures using the following statement:

{% include copy-clipboard.html %}
~~~ sql
ALTER DATABASE <db> SURVIVE REGION FAILURE;
~~~

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

Regional tables work well when your application requires low-latency reads and writes for an entire table from a single region.

For _regional_ tables, access to the table will be fast in the table's "home region" and slower in other regions. In other words, CockroachDB optimizes access to data in regional tables from a single region. By default, a regional table's home region is the [database's primary region](#database-regions), but that can be changed to use any region added to the database.

To optimize read and write access to the data in a table from the primary region, use the following statement:

{% include copy-clipboard.html %}
~~~ sql
ALTER TABLE <table> SET LOCALITY REGIONAL BY TABLE IN PRIMARY REGION;
~~~

To optimize read and write access to the data in a table from the `us-east-1` region, use the following statement:

{% include copy-clipboard.html %}
~~~ sql
ALTER TABLE <table> SET LOCALITY REGIONAL BY TABLE IN 'us-east-1';
~~~

{{site.data.alerts.callout_info}}
By default, all tables in a multi-region database are _regional_ tables that use the database's primary region. Unless you know your application needs different performance characteristics than regional tables provide, there is no need to change this setting.
{{site.data.alerts.end}}

### Regional by row tables

In _regional by row_ tables, individual rows are optimized for access from different regions. This setting divides a table and all of its indexes into [partitions](partitioning.html), with each partition optimized for access from a different region. Like [regional tables](#regional-tables), _regional by row_ tables are optimized for access from a single region. However, that region is specified at the row level instead of applying to the whole table.

Use regional by row tables when your application requires low-latency reads and writes at a row level where individual rows are primarily accessed from a single region. For example, a users table in a global application may need to keep some users' data in specific regions due to regulations (such as GDPR), for better performance, or both.

For an example of a table that can benefit from the _regional by row_ setting in a multi-region deployment, see the `users` table from the [MovR application](movr.html).

To make an existing table a _regional by row_ table, use the following statement:

{% include copy-clipboard.html %}
~~~ sql
ALTER TABLE <table> SET LOCALITY REGIONAL BY ROW;
~~~

Every row in a regional by row table has a hidden `crdb_region` column that represents the row's home region. To see a row's region, issue a statement like the following:

{% include copy-clipboard.html %}
~~~ sql
SELECT crdb_region, id FROM <table>;
~~~

To update an existing row's home region, use an [`UPDATE`](update.html) statement like the following:

{% include copy-clipboard.html %}
~~~ sql
UPDATE <table> SET crdb_region = 'eu-west' WHERE id IN (...)
~~~

To add a new row to a regional by row table, you must choose one of the following options.

- Let CockroachDB set the row's home region automatically. It will use the region of the gateway node from which the row is inserted.

- Set the home region explicitly using an [`INSERT`](insert.html) statement like the following:

    {% include copy-clipboard.html %}
    ~~~ sql
    INSERT INTO <table> (crdb_region, ...) VALUES ('us-east-1', ...);
    ~~~

This is necessary because every row in a regional by row table must have a home region.

### Global tables

 _Global_ tables are optimized for low-latency reads from every region in the database. The tradeoff is that writes will incur higher latencies from any given region, since writes have to be replicated across every region to make the global low-latency reads possible.

Use global tables when your application has a "read-mostly" table of reference data that is rarely updated, and needs to be available to all regions.

For an example of a table that can benefit from the _global_ table locality setting in a multi-region deployment, see the `promo_codes` table from the [MovR application](movr.html).

To optimize read access to the data in a table from any region (that is, globally), use the following statement:

{% include copy-clipboard.html %}
~~~ sql
ALTER TABLE <table> SET LOCALITY GLOBAL;
~~~

## Choosing a multi-region configuration

In this section we will try to explain how to change [the default settings](#default-settings) of your multi-region cluster to meet your application's needs.

The options for changing your multi-region cluster's configuration include:

- _Change nothing_: Using the [default settings](#default-settings), you get zone survival, low-latency single-region writes, and multi-region stale reads.

- _Change only [survival](#survival-goals)_: In this configuration, you upgrade from availability zone (AZ) to get region survival, single-region writes, and multi-region stale reads. This configuration is useful for single-region apps that need higher levels of survival.

- _Change only [table locality](#table-locality)_: In this configuration, you accept the default zone survival, and optimize for low-latency multi-region reads and writes. This is useful for multi-region apps that want low-latency writes and are not concerned with surviving a region failure.

- _Change both [survival](#survival-goals) and [table locality](#table-locality)_: In this configuration, you upgrade from zone to region survival, and optimize for low-latency multi-region reads. Single-region writes can be made low-latency with the right settings, but multi-region writes are higher-latency because they have to move across the network. This is useful for multi-region apps that want a high level of survival.

Finally, note that different databases within the same cluster can each use different combinations of the settings above.

## See also

- [Topology Patterns](topology-patterns.html)
- [Disaster Recovery](disaster-recovery.html)
