---
title: Choosing a multi-region configuration
summary: Learn how to use CockroachDB's improved multi-region user experience.
toc: true
---

This page has high-level information about how to configure a [multi-region cluster's](multiregion-overview.html) [survival goals](multiregion-overview.html#survival-goals) and [table locality](multiregion-overview.html#table-locality).

The options for configuring your multi-region cluster include:

- _Change nothing_: Using the [default settings](multiregion-overview.html#default-settings), you get:
  - Zone survival (the default).
  - Low-latency reads and writes from a single region.
  - Low-latency stale reads from all other regions.

- _Change only [survival goals](multiregion-overview.html#survival-goals)_: This configuration is useful for single-region apps that need higher levels of survival. In this configuration, you move from availability zone (AZ) survival to get:
  - Region survival.
  - Low-latency reads from a single region.
  - Low-latency stale reads from all other regions.
  - Higher-latency writes from all regions (due to region survival).

- _Change only [table locality](multiregion-overview.html#table-locality)_: This is useful for multi-region apps that require different read/write latency guarantees for different tables in the database, and are not concerned with surviving a region failure. In this configuration, you get:
  - Zone survival (the default).
  - Low-latency reads and writes from all regions.

- _Change both [survival goals](multiregion-overview.html#survival-goals) and [table locality](multiregion-overview.html#table-locality)_: This is useful for multi-region apps that want a high level of survival. In this configuration, you move from zone survival and get:
  - Region survival.
  - Low-latency reads from all regions.
  - Higher-latency writes from all regions (due to region survival).

The table below offers another view of how the configuration options described above map to:

- The performance characteristics of specific survival goal/table locality combinations.
- The types of applications that can benefit from each combination.

| <div style="width: 200px;"></div> locality &#8595; survival &#8594; | `ZONE`                                                                                                                                 | `REGION`                                                                                                                                                                                                             |
|---------------------------------------------------------------------+----------------------------------------------------------------------------------------------------------------------------------------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `REGIONAL BY TABLE`                                                 | Low-latency for single-region writes and multi-region stale reads.                                                                     | Single-region writes are higher latency than for ZONE, as at least one additional region must be consulted for each write.  Stale multi-region reads are of comparable latency to ZONE survival.                     |
|                                                                     | For single-region apps that can accept risk of region failure.                                                                         | For single-region apps that must survive region failure.                                                                                                                                                             |
| `REGIONAL BY ROW`                                                   | Low-latency consistent multi-region reads & writes for rows which are homed in specific regions.                                       | Low-latency consistent multi-region reads.  Low-latency single-region writes if you are writing to a row from its home region.                                                                                       |
|                                                                     | For multi-region apps which read/write individual rows of the table from a specific region, and can accept the risk of region failure. | Same as for ZONE survival, but for apps that must survive a region failure.                                                                                                                                          |
| `GLOBAL`                                                            | Low-latency multi-region reads. Writes are higher latency than reads.                                                                  | Low-latency multi-region reads.  Writes are higher latency than reads. There should be minimal difference in write latencies between ZONE and REGION survival due to a new custom non-blocking transaction protocol. |
|                                                                     | For multi-region apps that need low-latency reads of a "read-mostly" table.                                                            | For multi-region apps that need low-latency reads of a "read-mostly" table, and the ability to survive region failures.                                                                                              |

{{site.data.alerts.callout_info}}
Different databases and tables within the same cluster can each use different combinations of the settings above.
{{site.data.alerts.end}}

## See also

- [Multi-region overview](multiregion-overview.html)
- [When to use `REGIONAL` vs. `GLOBAL` tables](when-to-use-regional-vs-global-tables.html)
- [When to use `ZONE` vs. `REGION` survival goals](when-to-use-zone-vs-region-survival-goals.html)
- [Topology Patterns](topology-patterns.html)
- [Disaster Recovery](disaster-recovery.html)
