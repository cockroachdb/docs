---
title: Multiregion Overview
summary: Learn how to use CockroachDB's improved multiregion user experience.
toc: true
---

## Overview

<span class="version-tag">New in v21.1:</span> CockroachDB has improved multi-region capabilities that make it easier to run global applications. It is intended that these capabilities will supersede the current set of [Multiregion Topology Patterns](topology-patterns.html#multi-region-patterns).

To take advantage of these improved capabilities, you will need to understand the following concepts:

- [_Database Regions_](#database-regions), which provide an abstraction for cloud provider regions and zones.
- [_Table Localities_](#table-locality), which tell CockroachDB how to optimize access to a table's underlying data.
- [_Survivability Goals_](#survivability-goals), which dictate the blast radius of failure(s) that a database can survive.

<a name="default-settings"></a>

At a high level, the simplest process for running a multi-region cluster is:

1. Set region information for the cluster at startup using [node startup locality options](cockroach-start.html#locality).
2. Add a primary region to a database, making it a "multi-region" database.
3. (*Optional*) Change table localities (global, regional by table, regional by row). This step is optional because by default the tables in a database will be homed in the database's primary region (as set during Step 1).
4. (*Optional*) Change the database's survivability goals (zone or region). This step is optional because by default multi-region databases will be configured to survive zone failures.

The steps above describe the simplest case, where you accept all of the default settings. These settings will provide the best experience for many users. If your application has performance or availability needs that are different than what the default settings provide, there are many customization options to explore.

For more information about CockroachDB's multi-region capabilities and the customization options that are available, see below.

{{site.data.alerts.callout_info}}
The documentation for the new Multiregion features described below is still in development.  More documentation on these features will be published in the run-up to the v21.1 release.
{{site.data.alerts.end}}

## Database regions

 _Database regions_ are a high-level abstraction for a geographic region. Each region is broken into multiple zones. These terms are meant to correspond directly to the region and zone terminology used by cloud providers.

Regions and zones are defined at the cluster level using the following [node startup locality options](cockroach-start.html#locality):

- Regions are specified using the `region` key.
- Zones through the use of the `zone` key.

For example:

{% include copy-clipboard.html %}
~~~ shell
cockroach start --locality=region=us-east-2 # ... other required flags go here
~~~

The regions added during node startup become _Database Regions_ when they are added to a database using the following statement:

{% include copy-clipboard.html %}
~~~ sql
ALTER DATABASE <db> SET PRIMARY REGION 'us-east-2';
~~~

Now that the database has a primary region assigned to it, it is a "multi-region database."  All data in that database is stored within its assigned regions, and CockroachDB optimizes access to the database's underlying data from the primary region.

{{site.data.alerts.callout_info}}
If you are happy to accept the default _Survivability Goals_ and _Table Localities_ (both described below), there is nothing else you need to do once you have set a primary database region.
{{site.data.alerts.end}}

## Table locality

Every table in a multi-region database has a "table locality setting" applied to it. CockroachDB uses the table locality setting to determine how to optimize access to the table's underlying data from that locality.

By default, all tables in a multi-region database are _regional_ tables -- that is, CockroachDB optimizes access to the table's data from a single region (by default, the database's primary region).

For more information about the table localities CockroachDB supports, see the following sections:

- [Regional tables](#regional-tables)
- [Global tables](#global-tables)
- [Regional by row tables](#regional-by-row-tables)

{{site.data.alerts.callout_info}}
Table locality settings are used for optimizing latency under different read/write patterns. If you are happy with the performance tradeoffs of the default setting (regional tables in the primary region), there is nothing else you need to do once you set your [database's primary region](#database-regions).
{{site.data.alerts.end}}

### Regional tables

For _regional_ tables, access to the table will be fast in the table's "home region" and slower in other regions. In other words, CockroachDB optimizes access to data in regional tables from a single region. By default, a regional table's home region is the [database's primary region](#database-regions), but that can be changed to use any region available to the cluster.

Regional tables work well when your application requires low-latency reads and writes for an entire table in a single region.

To optimize read and write access to the data in a table from a single region in a multi-region cluster, use the following statement:

{% include copy-clipboard.html %}
~~~ sql
ALTER TABLE <table> SET LOCALITY REGIONAL BY TABLE IN 'us-east-2';
~~~

{{site.data.alerts.callout_info}}
By default, all tables in a multi-region database are _regional_ tables that use the database's primary region. Unless you know your application needs different performance characteristics than regional tables provide, there is no need to change this setting.
{{site.data.alerts.end}}

### Global tables

 _Global_ tables are optimized for low-latency reads from every region in the database. The tradeoff is that writes will incur higher latencies from any given region, since writes have to be replicated across every region to make the global low-latency reads possible.

Use global tables when your application has a "read-mostly" table of reference data (such as promo codes) that is rarely updated, and needs to be available to all regions.

For an example of a table that can benefit from the _global_ table locality setting in a multi-region deployment, see the `promo_codes` table from the [MovR application](https://www.cockroachlabs.com/docs/v21.1/movr).

To optimize read access to the data in a table from any region in a multi-region cluster (that is, globally), use the following statement:

{% include copy-clipboard.html %}
~~~ sql
ALTER TABLE <table> SET LOCALITY GLOBAL;
~~~

### Regional by row tables

In _regional by row_ tables, individual rows are optimized for access from different regions. This setting divides a table and all of its indexes into [partitions](https://www.cockroachlabs.com/docs/v21.1/partitioning.html), with each partition optimized for access from a different region.

Use regional by row tables when your application requires low-latency reads and writes at a row level where individual rows are primarily accessed from a single region. For example, a users table in a global application may need to keep some users' data in specific regions due to regulations (such as GDPR), for better performance, or both.

For an example of a table that can benefit from the _regional by row_ setting in a multi-region deployment, see the `users` table from the [MovR application](https://www.cockroachlabs.com/docs/v21.1/movr).

When accessing regional by row tables from your application, the optimal region for a given row can be specified in one of the following ways:

- Explicitly by the application as part of an [`INSERT`](insert.html) statement
- Automatically, depending on the region of the gateway node from which the row has been inserted.

Once set, a row's home region will not be changed unless you modify it explicitly with an [`UPDATE`](update.html) statement. When you update a row's region, CockroachDB optimizes access to that row's data from the specified region.

To optimize read and write access to the rows in a table for different regions in a multi-region cluster depending on the row, use the following statement:

{% include copy-clipboard.html %}
~~~ sql
ALTER TABLE <table> SET LOCALITY REGIONAL BY ROW;
~~~

After issuing the above statement, you will then have to modify each row's home region explicitly with an [`UPDATE`](update.html) statement that operates on a computed column called `crdb_region`. The `crdb_region` column is computed for every row in a multi-region database. It is used to determine the home region of each row.

{% include copy-clipboard.html %}
~~~ sql
UPDATE <table> SET crdb_region = 'eu-west' WHERE id IN (...)
~~~

## Survivability goals

All tables within the same database operate with the same survivability goal. Each database is allowed to have its own survivability goal setting.

The following survivability goals are available:

- Zone failure
- Region failure

Surviving zone failures is the default. You can upgrade a database to survive region failures at the cost of slower write performance (due to network hops) using the following statement:

{% include copy-clipboard.html %}
~~~ sql
ALTER DATABASE <db> SURVIVE REGION FAILURE;
~~~

For more information about the survivability goals supported by CockroachDB, see the following sections:

- [Surviving zone failures](#surviving-zone-failures)
- [Surviving region failures](#surviving-region-failures)

### Surviving zone failures

The zone level survivability goal has the following properties:

1. The database will remain fully available for reads and writes, even if a zone goes down.
2. The database may not remain fully available if multiple zones fail in the same region.

{{site.data.alerts.callout_info}}
Surviving zone failures is the default setting for multi-region databases. You do not need to change any settings to survive zone failures.

The default settings are expected to provide the best experience for many users. If your application has performance or availability needs that are different than what the default settings provide, there are many customization options to explore.
{{site.data.alerts.end}}

### Surviving region failures

The region level survivability goal has the property that the database will remain fully available for reads and writes, even if an entire region (including multiple availability zones) goes down. This added survivability comes at a cost: write latency will be increased by at least as much as the round-trip time to the nearest region. Read performance will be unaffected. (In other words, you are adding network hops and making writes slower in exchange for robustness.)

You can upgrade a database to survive region failures using the following statement, as long as you [specified multiple cluster regions at node startup time](#database-regions):

{% include copy-clipboard.html %}
~~~ sql
ALTER DATABASE <db> SURVIVE REGION FAILURE;
~~~

## Choosing a multiregion configuration

In this section we will try to explain how to change [the default settings](#default-settings) of your multi-region cluster to meet your application's needs.

The options for changing your multiregion cluster's configuration include:

1. _Change nothing_: Using the [default settings](#default-settings), you get zone survivability, single-region writes, and multi-region stale reads. This is comparable to what you get from an [Amazon Aurora Global Database](https://aws.amazon.com/rds/aurora/global-database/).

2. _Change only [survivability](#survivability-goals)_: In this configuration, you upgrade from availability zone (AZ) to get region survivability, low-latency single-region writes, and (optionally) multi-region stale reads. This configuration is useful for single-region apps that need higher levels of survivability.

3. Change only [table locality](#table-locality)_: In this configuration, you accept the default zone survivability, and optimize for low-latency multi-region reads and writes. This is useful for multi-region apps that want low-latency writes and are not concerned with surviving a region failure.

4. _Change both [survivability](#survivability-goals) and [table locality](#table-locality)_: In this configuration, you upgrade from zone to region survivability, and optimize for low-latency multi-region reads. Single-region writes can be made low-latency with the right settings, but multi-region writes are higher-latency because they have to move across the network. This is useful for multi-region apps that want a high level of survivability.

## See also

- [Topology Patterns](topology-patterns.html)

<!-- EOF -->
