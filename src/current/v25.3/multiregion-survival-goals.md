---
title: Multi-Region Survival Goals
summary: Learn how to set survival goals in a CockroachDB multi-region cluster.
toc: true
keywords: gin, gin index, gin indexes, inverted index, inverted indexes, accelerated index, accelerated indexes
docs_area: deploy
key: when-to-use-zone-vs-region-survival-goals.html
---

A _survival goal_ dictates how many simultaneous failure(s) a database can survive. All tables within the same database operate with the **same survival goal**. Each database can have its own survival goal setting.

The following survival goals are available:

- Zone failure
- Region failure

The zone failure survival goal is the default. You can configure a database to survive region failures at the cost of slower write performance (due to network hops) using the following statement:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE <db> SURVIVE REGION FAILURE;
~~~

For more information about the survival goals supported by CockroachDB, see the following sections:

- [Survive zone failures](#survive-zone-failures)
- [Survive region failures](#survive-region-failures)

## Survive zone failures

With the zone level survival goal, the database will remain fully available for reads and writes, even if a zone becomes unavailable. However, the database may not remain fully available if multiple zones in the same region fail. This is the default setting for multi-region databases.

You can configure a database to survive zone failures using the [`ALTER DATABASE ... SURVIVE ZONE FAILURE` statement]({% link {{ page.version.version }}/alter-database.md %}#survive-zone-region-failure).

If your application has performance or availability needs that are different than what the default settings provide, you can explore the other customization options described on this page.

## Survive region failures

The region level survival goal has the property that the database will remain fully available for reads and writes, even if an entire region becomes unavailable. This added survival comes at a cost: write latency will be increased by at least as much as the round-trip time to the nearest region. Read performance will be unaffected. In other words, you are adding network hops and making writes slower in exchange for robustness.

You can upgrade a database to survive region failures using the [`ALTER DATABASE ... SURVIVE REGION FAILURE` statement]({% link {{ page.version.version }}/alter-database.md %}#survive-zone-region-failure).

Setting this goal on a database in a cluster with 3 [cluster regions]({% link {{ page.version.version }}/multiregion-overview.md %}#cluster-regions) will automatically increase the [replication factor]({% link {{ page.version.version }}/configure-replication-zones.md %}#num_replicas) of the [ranges]({% link {{ page.version.version }}/architecture/glossary.md %}#architecture-range) underlying the database from 3 (the default) to 5. This ensures that there will be 5 replicas of each range spread across the 3 regions (2+2+1=5). This is how CockroachDB is able to provide region level resiliency while maintaining good read performance in the leaseholder's region. For writes, CockroachDB will need to coordinate across 2 of the 3 regions, so you will pay additional write latency in exchange for the increased resiliency.

{{site.data.alerts.callout_info}}
To survive region failures, you must add at least 3 [database regions]({% link {{ page.version.version }}/multiregion-overview.md %}#database-regions).
{{site.data.alerts.end}}

## When to use zone vs. region survival goals

Set a [`ZONE` survival goal]({% link {{ page.version.version }}/multiregion-survival-goals.md %}#survive-zone-failures) if:

- You can accept a single node failure up to an entire zone failure. If multiple zones fail in the same region, the database may become unavailable.

Set a [`REGION` survival goal]({% link {{ page.version.version }}/multiregion-survival-goals.md %}#survive-region-failures) if:

- The database must remain available, even if a region goes down.
- You can accept the performance cost: write latency will be increased by at least as much as the round-trip time to the nearest region. Read performance will be unaffected.
- The database can be or already is configured with 3 or more [database regions]({% link {{ page.version.version }}/multiregion-overview.md %}#database-regions). At least three database regions are required to survive region failures.

## See also

+ [Multi-Region Capabilities Overview]({% link {{ page.version.version }}/multiregion-overview.md %})
+ [How to Choose a Multi-Region Configuration]({% link {{ page.version.version }}/choosing-a-multi-region-configuration.md %})
- [Table Localities]({% link {{ page.version.version }}/table-localities.md %})
- [Low Latency Reads and Writes in a Multi-Region Cluster]({% link {{ page.version.version }}/demo-low-latency-multi-region-deployment.md %})
- [Topology Patterns]({% link {{ page.version.version }}/topology-patterns.md %})
- [Disaster Recovery]({% link {{ page.version.version }}/disaster-recovery-planning.md %})
- [Migrate to Multi-Region SQL]({% link {{ page.version.version }}/migrate-to-multiregion-sql.md %})
- [Secondary regions]({% link {{ page.version.version }}/multiregion-overview.md %}#secondary-regions)
- [`SET SECONDARY REGION`]({% link {{ page.version.version }}/alter-database.md %}#set-secondary-region)
- [`DROP SECONDARY REGION`]({% link {{ page.version.version }}/alter-database.md %}#drop-secondary-region)
