---
title: When to use REGIONAL vs. GLOBAL tables
summary: Learn how to use CockroachDB's improved multi-region user experience.
toc: false
---

{% include_cached new-in.html version=v21.1 %} [_Table Localities_](multiregion-overview.html#table-locality) tell CockroachDB how to optimize access to a table's data in a multi-region cluster.  CockroachDB uses the table locality setting to determine how to optimize access to the table's data from that locality.

The following table localities are available:

- `REGIONAL`
- `GLOBAL`

Use [`REGIONAL` tables](multiregion-overview.html#regional-by-row-tables) if:

- Your application requires low-latency reads and writes from a single region (either at the [row level](multiregion-overview.html#regional-by-row-tables) or the [table level](multiregion-overview.html#regional-tables)).
- Access to the table's data can be slower (higher latency) from other regions.

Use [`GLOBAL` tables](multiregion-overview.html#global-tables) if:

- Your application has a "read-mostly" table of reference data that is rarely updated, and that needs to be available to all regions.
- You can accept that writes to the table will incur higher latencies from any given region, since writes use a novel [non-blocking transaction protocol](architecture/transaction-layer.html#non-blocking-transactions) that uses a timestamp "in the future". Note that the observed write latency is dependent on the [`--max-offset`](cockroach-start.html#flags-max-offset) setting.

For more information about how to choose an overall multi-region configuration, see [Choosing a multi-region configuration](choosing-a-multi-region-configuration.html).

{{site.data.alerts.callout_success}}
{% include {{page.version.version}}/misc/multiregion-max-offset.md %}
{{site.data.alerts.end}}

{% include enterprise-feature.md %}

## See also

- [Multi-region Overview](multiregion-overview.html)
- [Choosing a multi-region configuration](choosing-a-multi-region-configuration.html)
- [When to use `ZONE` vs. `REGION` survival goals](when-to-use-zone-vs-region-survival-goals.html)
- [Multi-region SQL performance](demo-low-latency-multi-region-deployment.html)
- [Topology Patterns](topology-patterns.html)
- [Disaster Recovery](disaster-recovery.html)
- [Migrate to Multi-region SQL](migrate-to-multiregion-sql.html)
