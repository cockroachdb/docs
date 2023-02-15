---
title: When to Use ZONE vs. REGION Survival Goals
summary: Learn when to use ZONE vs. REGION survival goals in multi-region clusters.
toc: false
docs_area: deploy
---

A [_survival goal_](multiregion-overview.html#survival-goals) dictates how many simultaneous failure(s) a [multi-region database](multiregion-overview.html) can survive. All tables within the same database operate with the same survival goal. Each database is allowed to have its own survival goal setting.

{% include enterprise-feature.md %}

Allowed survival goals include:

- `ZONE` (default): Databases configured to survive zone failures have 3 [voting replicas](architecture/overview.html#architecture-replica) for every range, all in the [home region](multiregion-overview.html#table-localities). To support low-latency reads from other regions, one [non-voting replica](architecture/replication-layer.html#non-voting-replicas) is placed in each non-home region.
- `REGION`: Databases configured to survive region failures have 2 voting replicas in the home region, and 3 voting replicas in non-home regions. This enables fast reads from within the home region and ensures minimal disruption in case one node fails, since the home region has two possible leaseholder candidates.

Set a [`ZONE` survival goal](multiregion-overview.html#surviving-zone-failures) if:

- You can accept a single node failure up to an entire zone failure. If multiple zones fail in the same region, the database may become unavailable.

Set a [`REGION` survival goal](multiregion-overview.html#surviving-region-failures) if:

- The database must remain available, even if a region goes down.
- You can accept the performance cost: write latency will be increased by at least as much as the round-trip time to the nearest region. Read performance will be unaffected.
- The database can be or already is configured with 3 or more [database regions](multiregion-overview.html#database-regions). At least three database regions are required to survive region failures.

## See also

+ [Multi-Region Capabilities Overview](multiregion-overview.html)
+ [How to Choose a Multi-Region Configuration](choosing-a-multi-region-configuration.html)
+ [When to Use `REGIONAL` vs. `GLOBAL` Tables](when-to-use-regional-vs-global-tables.html)
- [Low Latency Reads and Writes in a Multi-Region Cluster](demo-low-latency-multi-region-deployment.html)
- [Topology Patterns](topology-patterns.html)
- [Disaster Recovery](disaster-recovery.html)
- [Migrate to Multi-Region SQL](migrate-to-multiregion-sql.html)
- [Secondary regions](multiregion-overview.html#secondary-regions)
- [`SET SECONDARY REGION`](alter-database.html#set-secondary-region)
- [`DROP SECONDARY REGION`](alter-database.html#drop-secondary-region)
