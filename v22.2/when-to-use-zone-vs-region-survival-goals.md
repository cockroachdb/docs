---
title: When to Use ZONE vs. REGION Survival Goals
summary: Learn when to use ZONE vs. REGION survival goals in multi-region clusters.
toc: false
docs_area: deploy
---

A [_survival goal_](multiregion-overview.html#survival-goals) dictates how many simultaneous failure(s) a [multi-region database](multiregion-overview.html) can survive. All tables within the same database operate with the same survival goal. Each database is allowed to have its own survival goal setting.

{% include enterprise-feature.md %}

Allowed survival goals include:

- `ZONE` (default)
- `REGION`

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
- [`SET SECONDARY REGION`](set-secondary-region.html)
- [`DROP SECONDARY REGION`](drop-secondary-region.html)
