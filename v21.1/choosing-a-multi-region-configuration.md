---
title: Choosing a multi-region configuration
summary: Learn how to use CockroachDB's improved multi-region user experience.
toc: true
---

This page has high-level information about how to configure a [multi-region cluster's](multiregion-overview.html) [survival goals](multiregion-overview.html#survival-goals) and [table locality](multiregion-overview.html#table-locality).

The options for changing your multi-region cluster's configuration include:

- _Change nothing_: Using the [default settings](multiregion-overview.html#default-settings), you get zone survival, low-latency single-region writes, and multi-region stale reads.

- _Change only [survival goals](multiregion-overview.html#survival-goals)_: In this configuration, you upgrade from availability zone (AZ) to get region survival, single-region writes, and multi-region stale reads. This configuration is useful for single-region apps that need higher levels of survival.

- _Change only [table locality](multiregion-overview.html#table-locality)_: In this configuration, you accept the default zone survival, and optimize for low-latency multi-region reads and writes. This is useful for multi-region apps that want low-latency writes and are not concerned with surviving a region failure.

- _Change both [survival goals](multiregion-overview.html#survival-goals) and [table locality](multiregion-overview.html#table-locality)_: In this configuration, you upgrade from zone to region survival, and optimize for low-latency multi-region reads. Single-region writes can be made low-latency with the right settings, but multi-region writes are higher-latency because they have to move across the network. This is useful for multi-region apps that want a high level of survival.

The table below offers another view of how the configuration options described above map to:

- The performance characteristics of specific survival goal/table locality combinations.
- The types of applications that can benefit from each combination.

| locality &#8595; survival &#8594; | `ZONE`                                                                                 | `REGION`                                                                                            |
|-----------------------------------+----------------------------------------------------------------------------------------+-----------------------------------------------------------------------------------------------------|
| `REGIONAL BY TABLE`               | Low-latency single-region writes, multi-region stale reads.                            | Single-region writes, multi-region stale reads.                                                     |
|                                   | For single-region apps that can accept risk of region failure.                         | For single-region apps that must survive region failure.                                            |
| `REGIONAL BY ROW`                 | Low-latency multi-region reads & writes.                                               | Low-latency multi-region reads. Low-latency single-region writes with the right settings.           |
|                                   | For multi-region apps that need low-latency writes, can accept risk of region failure. | For multi-region apps that want a high level of survival.                                           |
| `GLOBAL`                          | Low-latency multi-region reads. High-latency writes.                                   | Low-latency multi-region reads.  High-latency writes due to cross-region replication.               |
|                                   | For multi-region apps that need low-latency reads of a "read-mostly" table.            | For multi-region apps that need low-latency reads of a "read-mostly" table, high level of survival. |

{{site.data.alerts.callout_info}}
Different databases within the same cluster can each use different combinations of the settings above.
{{site.data.alerts.end}}

## See also

- [Multi-region overview](multiregion-overview.html)
- [When to use `REGIONAL` vs. `GLOBAL` tables](when-to-use-regional-vs-global-tables.html)
- [When to use `ZONE` vs. `REGION` survival goals](when-to-use-zone-vs-region-survival-goals.html)
- [Topology Patterns](topology-patterns.html)
- [Disaster Recovery](disaster-recovery.html)
