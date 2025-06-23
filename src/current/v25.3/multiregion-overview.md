---
title: Multi-Region Capabilities Overview
summary: Learn how to use CockroachDB multi-region capabilities.
toc: true
keywords: gin, gin index, gin indexes, inverted index, inverted indexes, accelerated index, accelerated indexes
docs_area: deploy
---

This page provides an overview of CockroachDB multi-region capabilities.

## Overview

CockroachDB multi-region capabilities make it easier to run global applications. To use these capabilities effectively, you should understand the following concepts:

- [_Cluster region_](#cluster-regions) is a geographic region that you specify at node start time.
- [_Database region_](#database-regions) is a geographic region in which a database operates. You must choose a database region from the list of available cluster regions.
- [_Survival goal_](#survival-goals) dictates how many simultaneous failure(s) a database can survive.
- [_Table locality_](#table-locality) determines how CockroachDB optimizes access to a table's data.

<a name="default-settings"></a>

At a high level, the simplest process for running a multi-region cluster is:

1. Set region information for each node in the cluster at startup using [node startup locality options]({% link {{ page.version.version }}/cockroach-start.md %}#locality).
1. Add one or more regions to a database, making it a "multi-region" database. One of these regions must be the _primary region_.
1. (*Optional*) Change table localities (global, regional by table, regional by row). This step is optional because by default the tables in a database will be homed in the database's primary region (as set during Step 1).
1. (*Optional*) Change the database's survival goals (zone or region). This step is optional because by default multi-region databases will be configured to survive zone failures.

These steps describe the simplest case, where you accept all of the default settings. The latter two steps are optional, but table locality and survival goals have a significant impact on performance. Therefore Cockroach Labs recommends that you give these aspects some consideration [when you choose a multi-region configuration]({% link {{ page.version.version }}/choosing-a-multi-region-configuration.md %}).

{{site.data.alerts.callout_success}}
{% include {{page.version.version}}/misc/multiregion-max-offset.md %}
{{site.data.alerts.end}}

## Cluster regions

You define a cluster region at the node level using the `region` key and the zone using the `zone` key in the [node startup locality options]({% link {{ page.version.version }}/cockroach-start.md %}#locality).

For example, the following command adds `us-east-1` to the list of cluster regions and `us-east-1b` to the list of zones:

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach start --locality=region=us-east-1,zone=us-east-1b # ... other required flags go here
~~~

To show all of a cluster's regions, execute the following SQL statement:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW REGIONS FROM CLUSTER;
~~~

## Database regions

A _database region_ is a high-level abstraction for a geographic region. Each region is broken into multiple zones. These terms are meant to correspond directly to the region and zone terminology used by cloud providers.

The regions added during node startup become _database regions_ when you add them to a database. To add the first region, use the [`ALTER DATABASE ... PRIMARY REGION` statement]({% link {{ page.version.version }}/alter-database.md %}#set-primary-region).

While the database has only one region assigned to it, it is considered a "multi-region database."  This means that all data in that database is stored within its assigned regions, and CockroachDB optimizes access to the database's data from the primary region. If the default _survival goals_ and _table localities_ meet your needs, there is nothing else you need to do once you have set a database's primary region.

To add another database region, use the [`ALTER DATABASE ... ADD REGION` statement]({% link {{ page.version.version }}/alter-database.md %}#add-region).

To show all of a database's regions, execute the [`SHOW REGIONS FROM DATABASE` statement]({% link {{ page.version.version }}/show-regions.md %}).

{{site.data.alerts.callout_info}}
If the default survival goals and table localities meet your needs, there is nothing else you need to do once you have set a database's primary region.
{{site.data.alerts.end}}

## Super regions

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

Super regions allow you to define a set of [database regions](#database-regions) such that the following [schema objects]({% link {{ page.version.version }}/schema-design-overview.md %}#database-schema-objects) will have all of their replicas stored _only_ in regions that are members of the super region:

- [Regional tables]({% link {{ page.version.version }}/table-localities.md %}#regional-tables) whose home region is a member of the super region.
- Any row of a [regional by row table]({% link {{ page.version.version }}/table-localities.md %}#regional-by-row-tables) whose [home region]({% link {{ page.version.version }}/alter-table.md %}#crdb_region) is a member of the super region.

The primary use case for super regions is data domiciling. As mentioned above, data from [regional]({% link {{ page.version.version }}/table-localities.md %}#regional-tables) and [regional by row]({% link {{ page.version.version }}/table-localities.md %}#regional-by-row-tables) tables will be stored only in regions that are members of the super region. Further, if the super region contains 3 or more regions and if you use [`REGION` survival goals]({% link {{ page.version.version }}/multiregion-survival-goals.md %}#survive-region-failures), the data domiciled in the super region will remain available if you lose a region.

{% include {{page.version.version}}/sql/super-region-considerations.md %}

<a name="enable-super-regions"></a>

For more information about how to enable and use super regions, see:

- [`ADD SUPER REGION`]({% link {{ page.version.version }}/alter-database.md %}#add-super-region)
- [`DROP SUPER REGION`]({% link {{ page.version.version }}/alter-database.md %}#drop-super-region)
- [`ALTER SUPER REGION`]({% link {{ page.version.version }}/alter-database.md %}#alter-super-region)
- [`SHOW SUPER REGIONS`]({% link {{ page.version.version }}/show-super-regions.md %})

Note that super regions take a different approach to data domiciling than [`ALTER DATABASE ... PLACEMENT RESTRICTED`]({% link {{ page.version.version }}/alter-database.md %}#placement). Specifically, super regions make it so that all [replicas]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-replica) (both voting and [non-voting]({% link {{ page.version.version }}/architecture/replication-layer.md %}#non-voting-replicas)) are placed within the super region, whereas `PLACEMENT RESTRICTED` makes it so that there are no non-voting replicas.

For a demo on Super Regions, watch the following video:

{% include_cached youtube.html video_id="IXFTojYfA5A" %}

For more information about data domiciling using `PLACEMENT RESTRICTED`, see [Data Domiciling with CockroachDB]({% link {{ page.version.version }}/data-domiciling.md %}).

{{site.data.alerts.callout_info}}
{% include {{page.version.version}}/sql/super-regions-for-domiciling-with-region-survivability.md %}
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
Super regions rely on the underlying [replication zone system]({% link {{ page.version.version }}/configure-replication-zones.md %}), which was historically built for performance, not for domiciling. The replication system's top priority is to prevent the loss of data and it may override the zone configurations if necessary to ensure data durability. For more information, see [Replication Controls]({% link {{ page.version.version }}/configure-replication-zones.md %}#types-of-constraints).
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
If you are using super regions in your cluster, there are additional constraints when using [secondary regions](#secondary-regions):
<ul>
  <li>If the [primary region]({% link {{ page.version.version }}/alter-database.md %}#set-primary-region) is in a super region, the secondary region **must** be a region within the primary's super region.</li>
  <li>If the primary region is not in a super region, the secondary region **must not** be within a super region.</li>
</ul>
{{site.data.alerts.end}}

## Secondary regions

Secondary regions allow you to define a [database region](#database-regions) that will be used for failover in the event your [primary region]({% link {{ page.version.version }}/alter-database.md %}#set-primary-region) goes down.  In other words, the secondary region will act as the primary region if the original primary region fails.

Secondary regions work as follows: when a secondary region is added to a database, a [lease preference]({% link {{ page.version.version }}/configure-replication-zones.md %}#lease_preferences) is added to the tables and indexes in that database to ensure that two [voting replicas]({% link {{ page.version.version }}/configure-replication-zones.md %}#num_voters) are moved into the secondary region.

This behavior is an improvement over versions of CockroachDB prior to v22.2.  In those versions, when the primary region failed, the [leaseholders]({% link {{ page.version.version }}/architecture/replication-layer.md %}#leases) would be transferred to another [database region](#database-regions) at random, which could have negative effects on performance.

For more information about how to use secondary regions, see:

- [`SET SECONDARY REGION`]({% link {{ page.version.version }}/alter-database.md %}#set-secondary-region)
- [`DROP SECONDARY REGION`]({% link {{ page.version.version }}/alter-database.md %}#drop-secondary-region)

{{site.data.alerts.callout_info}}
If you are using [super regions](#super-regions) in your cluster, there are additional constraints when using secondary regions:
<ul>
  <li>If the [primary region]({% link {{ page.version.version }}/alter-database.md %}#set-primary-region) is in a super region, the secondary region **must** be a region within the primary's super region.</li>
  <li>If the primary region is not in a super region, the secondary region **must not** be within a super region.</li>
</ul>
{{site.data.alerts.end}}

{{site.data.alerts.callout_danger}}
{% include {{page.version.version}}/known-limitations/secondary-regions-with-regional-by-row-tables.md %}
{{site.data.alerts.end}}

## Survival goals

A _survival goal_ dictates how many simultaneous failure(s) a database can survive. All tables within the same database operate with the **same survival goal**. Each database can have its own survival goal setting.

For more information, refer to [Multi-Region Survival Goals]({% link {{ page.version.version }}/multiregion-survival-goals.md %}).

<a id="table-locality"></a>

## Table localities

_Table locality_ determines how CockroachDB optimizes access to the table's data. Every table in a multi-region database has a "table locality setting" that configures one or more *home regions* at the table or row level.

For more information, refer to [Table Localities]({% link {{ page.version.version }}/table-localities.md %}).

## Additional features

The features listed in this section make working with multi-region clusters easier.

### Zone config extensions

Zone Config Extensions are a customization tool for advanced users to persistently modify the configuration generated by the standard [multi-region SQL abstractions]({% link {{ page.version.version }}/multiregion-overview.md %}) on a per-region basis.

For more information, see [Zone Config Extensions]({% link {{ page.version.version }}/zone-config-extensions.md %}).

## Schema changes in multi-region clusters

{% include {{ page.version.version }}/performance/lease-preference-system-database.md %}

## Next steps

- [How to Choose a Multi-Region Configuration]({% link {{ page.version.version }}/choosing-a-multi-region-configuration.md %})

## See also

- [When to Use `ZONE` vs. `REGION` Survival Goals]({% link {{ page.version.version }}/multiregion-survival-goals.md %}#when-to-use-zone-vs-region-survival-goals)
- [When to Use `REGIONAL` vs. `GLOBAL` Tables]({% link {{ page.version.version }}/table-localities.md %}#when-to-use-regional-vs-global-tables)
- [Global Tables]({% link {{ page.version.version }}/global-tables.md %})
- [Topology Patterns]({% link {{ page.version.version }}/topology-patterns.md %})
- [Disaster Recovery]({% link {{ page.version.version }}/disaster-recovery-planning.md %})
- [Develop and Deploy a Global Application]({% link {{ page.version.version }}/movr.md %}#develop-and-deploy-a-global-application)
- [Low Latency Reads and Writes in a Multi-Region Cluster]({% link {{ page.version.version }}/demo-low-latency-multi-region-deployment.md %})
- [Migrate to Multi-Region SQL]({% link {{ page.version.version }}/migrate-to-multiregion-sql.md %})
- [`SET SECONDARY REGION`]({% link {{ page.version.version }}/alter-database.md %}#set-secondary-region)
- [`ALTER DATABASE ... DROP SECONDARY REGION`]({% link {{ page.version.version }}/alter-database.md %}#drop-secondary-region)
- [Zone Config Extensions]({% link {{ page.version.version }}/zone-config-extensions.md %})
- [Troubleshoot Replication Zones]({% link {{ page.version.version}}/troubleshoot-replication-zones.md %})
