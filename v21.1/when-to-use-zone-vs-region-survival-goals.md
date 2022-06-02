---
title: When to use ZONE vs. REGION survival goals
summary: Learn how to use CockroachDB's improved multi-region user experience.
toc: false
---

{% include_cached new-in.html version="v21.1" %} [_Survival Goals_](multiregion-overview.html#survival-goals) dictate how many simultaneous failure(s) a [multi-region database](multiregion-overview.html) can survive.  All tables within the same database operate with the same survival goal. Each database is allowed to have its own survival goal setting.

Allowed survival goals include:

- `ZONE` (default)
- `REGION`

Set a [`ZONE` survival goal](multiregion-overview.html#surviving-zone-failures) if:

- You can accept a single node failure up to an entire zone failure. If multiple zones fail in the same region, the database may become unavailable.

Set a [`REGION` survival goal](multiregion-overview.html#surviving-region-failures) if:

- The database must remain available, even if a region goes down.
- You can accept the performance cost: write latency will be increased by at least as much as the round-trip time to the nearest region. Read performance will be unaffected.
- The database can be or already is configured with 3 or more [database regions](multiregion-overview.html#database-regions). At least three database regions are required to survive region failures.

{{site.data.alerts.callout_success}}
For more information about how to choose a multi-region configuration, see [Choosing a multi-region configuration](choosing-a-multi-region-configuration.html).
{{site.data.alerts.end}}

{% include enterprise-feature.md %}

## See also

+ [Multi-region overview](multiregion-overview.html)
+ [Choosing a multi-region configuration](choosing-a-multi-region-configuration.html)
+ [When to use `REGIONAL` vs `GLOBAL` tables](when-to-use-regional-vs-global-tables.html)
- [Multi-region SQL performance](demo-low-latency-multi-region-deployment.html)
- [Topology Patterns](topology-patterns.html)
- [Disaster Recovery](disaster-recovery.html)
- [Migrate to Multi-region SQL](migrate-to-multiregion-sql.html)
