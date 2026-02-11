---
title: How to Choose a Multi-Region Configuration
summary: Learn how to configure CockroachDB multi-region features.
toc: true
docs_area: deploy
---

This page has high-level information about how to configure a [multi-region cluster's]({% link {{ page.version.version }}/multiregion-overview.md %}) [survival goals]({% link {{ page.version.version }}/multiregion-overview.md %}#survival-goals) and [table localities]({% link {{ page.version.version }}/multiregion-overview.md %}#table-localities).



## Multi-region configuration options

The options for configuring your multi-region cluster include:

- _Change nothing_: Using the [default settings]({% link {{ page.version.version }}/multiregion-overview.md %}#default-settings), you get:
  - Zone survival (the default).
  - Low-latency reads and writes from a single region.
  - A choice of low-latency stale reads or high-latency fresh reads from other regions (and high-latency fresh reads is the default).

- _Change only [survival goals]({% link {{ page.version.version }}/multiregion-overview.md %}#survival-goals)_: This configuration is useful for single-region apps that need higher levels of survival. In this configuration, you move from availability zone (AZ) survival to get:
  - Region survival.
  - Low-latency reads from a single region.
  - A choice of low-latency stale reads or high-latency fresh reads from other regions (and high-latency fresh reads is the default).
  - Higher-latency writes from all regions (due to region survival).

- _Change only [table localities]({% link {{ page.version.version }}/multiregion-overview.md %}#table-localities)_: This is useful for multi-region apps that require different read and write latency guarantees for different tables in the database, and are not concerned with surviving a region failure. In this configuration, you get:
  - Zone survival (the default).
  - For [global tables]({% link {{ page.version.version }}/table-localities.md %}#global-tables), low-latency reads from all regions.
  - For [regional by row tables]({% link {{ page.version.version }}/table-localities.md %}#regional-by-row-tables), low-latency reads and writes from each row's [home region]({% link {{ page.version.version }}/alter-table.md %}#crdb_region), and low-latency [follower reads]({% link {{ page.version.version }}/follower-reads.md %}) from all other regions.

- _Change both [survival goals]({% link {{ page.version.version }}/multiregion-overview.md %}#survival-goals) and [table localities]({% link {{ page.version.version }}/multiregion-overview.md %}#table-localities)_: This is useful for multi-region apps that want a high level of survival. In this configuration, you move from zone survival and get:
  - Region survival.
  - Low-latency reads from all regions.
  - Higher-latency writes from all regions (due to region survival).

## Configuration options vs. performance characteristics and application styles

The following table offers another view of how the various configuration options map to:

- The performance characteristics of specific survival goal and table locality combinations.
- The types of applications that can benefit from each combination.

| <div style="width: 200px;"></div> locality &#8595; survival &#8594; | `ZONE`                                                                                                                    | `REGION`                                                                                                                                                                                                             |
|---------------------------------------------------------------------+---------------------------------------------------------------------------------------------------------------------------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `REGIONAL BY TABLE`                                                 | Low-latency for single-region writes and multi-region stale reads.                                                        | Single-region writes are higher latency than for `ZONE`, as at least one additional region must be consulted for each write. Stale multi-region reads are of comparable latency to `ZONE` survival.                  |
|                                                                     | Single-region apps that can accept region failure.                                                                        | Single-region apps that must survive region failure.                                                                                                                                                                 |
| `REGIONAL BY ROW`                                                   | Low-latency consistent multi-region reads and writes for rows that are homed in specific regions.                         | Low-latency consistent reads from a row's home region. Low-latency consistent [stale reads]({% link {{ page.version.version }}/follower-reads.md %}) from outside the row's home region. Higher-latency writes if writing to a row from outside its home region. |
|                                                                     | Multi-region apps that read and write individual rows of the table from a specific region and can accept region failure.  | Multi-region apps that read and write individual rows of the table from a specific region and must survive a region failure.                                                                                         |
| `GLOBAL`                                                            | Low-latency multi-region reads. Writes are higher latency than reads.                                                     | Low-latency multi-region reads.  Writes are higher latency than reads. There should be minimal difference in write latencies between `ZONE` and `REGION` survival.                                                   |
|                                                                     | Multi-region apps that need low-latency reads of a "read-mostly" table.                                                   | Multi-region apps that need low-latency reads of a "read-mostly" table and must survive a region failure.                                                                                                            |


Different databases and tables within the same cluster can each use different combinations of these settings.

{{site.data.alerts.callout_success}}
{% include {{page.version.version}}/misc/multiregion-max-offset.md %}
{{site.data.alerts.end}}

## See also

- [Multi-Region Capabilities Overview]({% link {{ page.version.version }}/multiregion-overview.md %})
- [When to Use `REGIONAL` vs. `GLOBAL` Tables]({% link {{ page.version.version }}/table-localities.md %}#when-to-use-regional-vs-global-tables)
- [When to Use `ZONE` vs. `REGION` Survival Goals]({% link {{ page.version.version }}/multiregion-survival-goals.md %}#when-to-use-zone-vs-region-survival-goals)
- [Survive Region Outages with CockroachDB](https://www.cockroachlabs.com/blog/under-the-hood-multi-region/)
- [Topology Patterns]({% link {{ page.version.version }}/topology-patterns.md %})
- [Disaster Recovery]({% link {{ page.version.version }}/disaster-recovery-planning.md %})
- [Low Latency Reads and Writes in a Multi-Region Cluster]({% link {{ page.version.version }}/demo-low-latency-multi-region-deployment.md %})
- [Secondary regions]({% link {{ page.version.version }}/multiregion-overview.md %}#secondary-regions)
- [`SET SECONDARY REGION`]({% link {{ page.version.version }}/alter-database.md %}#set-secondary-region)
- [`DROP SECONDARY REGION`]({% link {{ page.version.version }}/alter-database.md %}#drop-secondary-region)
