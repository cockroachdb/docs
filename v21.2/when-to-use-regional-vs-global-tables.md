---
title: When to Use REGIONAL vs. GLOBAL Tables
summary: Learn when to use REGIONAL vs. GLOBAL tables in multi-region clusters.
toc: false
docs_area: deploy
---

A [_table locality_](multiregion-overview.html#table-locality) indicates how CockroachDB optimizes access to a table's data in a multi-region cluster. CockroachDB uses the table locality setting to determine how to optimize access to the table's data from that locality.

{% include_cached enterprise-feature.md %}

The following table localities are available:

- `REGIONAL`
- `GLOBAL`

Use a [`REGIONAL` table locality](multiregion-overview.html#regional-by-row-tables) if:

- Your application requires low-latency reads and writes from a single region (either at the [row level](multiregion-overview.html#regional-by-row-tables) or the [table level](multiregion-overview.html#regional-tables)).
- Access to the table's data can be slower (higher latency) from other regions.

Use a [`GLOBAL` table locality](multiregion-overview.html#global-tables) if:

- Your application has a "read-mostly" table of reference data that is rarely updated, and that needs to be available to all regions.
- You can accept that writes to the table will incur higher latencies from any given region, since writes use a novel [non-blocking transaction protocol](architecture/transaction-layer.html#non-blocking-transactions) that uses a timestamp "in the future". Note that the observed write latency is dependent on the [`--max-offset`](cockroach-start.html#flags-max-offset) setting.

{{site.data.alerts.callout_success}}
{% include {{page.version.version}}/misc/multiregion-max-offset.md %}
{{site.data.alerts.end}}

## See also

- [Multi-Region Capabilities Overview](multiregion-overview.html)
- [How to Choose a Multi-Region Configuration](choosing-a-multi-region-configuration.html)
- [When to Use `ZONE` vs. `REGION` Survival Goals](when-to-use-zone-vs-region-survival-goals.html)
- [Low Latency Reads and Writes in a Multi-Region Cluster](demo-low-latency-multi-region-deployment.html)
- [Topology Patterns](topology-patterns.html)
- [Disaster Recovery](disaster-recovery.html)
- [Migrate to Multi-Region SQL](migrate-to-multiregion-sql.html)
