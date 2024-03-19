---
title: Topology Patterns Overview
summary: Recommended topology patterns for running CockroachDB in a cloud environment.
toc: true
key: cluster-topology-patterns.html
docs_area: deploy
---

This page describes recommended topology patterns for running CockroachDB in a cloud environment and the expected impacts of these patterns on latency and resiliency.

{{site.data.alerts.callout_info}}
You can observe latency for your cluster on the [Network Latency page]({% link {{ page.version.version }}/ui-network-latency-page.md %}) of the DB Console.
{{site.data.alerts.end}}

## Single-region

When your clients are in a single geographic region, choosing a topology pattern is straightforward.

Deployment Type | Latency | Resiliency | Configuration
--------|---------|------------|--------------
[Development]({% link {{ page.version.version }}/topology-development.md %}) | <ul><li>Fast reads and writes</li></ul> | <ul><li>None</li></ul> | <ul><li>1 node</li><li>No replication</li></ul>
[Basic Production]({% link {{ page.version.version }}/topology-basic-production.md %}) | <ul><li>Fast reads and writes</li></ul> | <ul><li>1 zone failure</li></ul> | <ul><li>1 region</li><li>3 zones</li><li>3+ nodes across zones</li></ul>

## Multi-region

When your clients are in multiple geographic regions, it is important to deploy your cluster across regions properly and then carefully choose the right:

- [Survival goal]({% link {{ page.version.version }}/multiregion-overview.md %}#survival-goals) for each database.
- [Table locality]({% link {{ page.version.version }}/multiregion-overview.md %}#table-locality) for each table.

Failure to consider either of these aspects can result in unexpected impacts on latency and resiliency. For more information, see the [Multi-Region Capabilities Overview]({% link {{ page.version.version }}/multiregion-overview.md %}).

The multi-region patterns described in the following table are almost always table-specific. For example, you might use [Regional Tables]({% link {{ page.version.version }}/regional-tables.md %}) for frequently updated tables that are tied to a specific region, and [Global Tables]({% link {{ page.version.version }}/global-tables.md %}) for reference tables that are not tied to a specific region, and that are read frequently but updated infrequently.

| Pattern                                                  | Latency                                                                                                    |
|----------------------------------------------------------+------------------------------------------------------------------------------------------------------------|
| [Regional Tables]({% link {{ page.version.version }}/regional-tables.md %})                  | Low latency for single-region writes and multi-region stale reads.                                         |
| [Global Tables]({% link {{ page.version.version }}/global-tables.md %})                      | Low-latency multi-region reads from all regions, at the expense of higher latency cross-region writes.     |
| [Follower Reads]({% link {{ page.version.version }}/topology-follower-reads.md %})           | Fast regional (historical) reads, slower cross-region writes.                                              |
| [Follow-the-Workload]({% link {{ page.version.version }}/topology-follow-the-workload.md %}) | Fast regional reads in the active region; slower cross-region reads elsewhere. Slower cross-region writes. |

{{site.data.alerts.callout_info}}
In [multi-region databases]({% link {{ page.version.version }}/multiregion-overview.md %}), the resiliency of each database depends on its [survival goal settings]({% link {{ page.version.version }}/multiregion-overview.md %}#survival-goals).
{{site.data.alerts.end}}

If you want low-latency read-only access to your data in multiple regions, Cockroach Labs recommends that you default to using stale follower reads on `REGIONAL` tables (the default locality). However, there are two reasons you might want to upgrade a table to `GLOBAL`:

- You want low-latency consistent (non-stale) read access to the table in multiple regions from read-write transactions. One case where this is important is if the table is referenced by a [foreign key]({% link {{ page.version.version }}/foreign-key.md %}) from a [`REGIONAL BY ROW`]({% link {{ page.version.version }}/regional-tables.md %}#regional-by-row-tables) table. In these cases, the foreign key check that accompanies a write cannot use a stale read because it must be transactionally consistent with the write. To keep this foreign key check fast, you can make the reference table `GLOBAL`, at the expense of slower writes to that table.
- When an [ORM]({% link {{ page.version.version }}/install-client-drivers.md %}) or application-level tool makes follower reads too hard to use. In these cases, `GLOBAL` tables can allow you to achieve low-latency reads through a schema-level setting.

In summary, Cockroach Labs recommends that you use follower reads whenever you can, and use `GLOBAL` tables when you can't.

In the following demo, we show the importance of choosing the correct topology patterns for your tables:

{% include_cached youtube.html video_id="sO1Mr0Gmde0" %}

## Anti-patterns

The following anti-patterns are ineffective or risky:

- Single-region deployments using 2 zones, or multi-region deployments using 2 regions. In these cases, the cluster would be unable to survive the loss of a single zone or a single region, respectively.
- Broadly distributed multi-region deployments (e.g., `us-west`, `asia`, and `europe`) using only the default [Follow-the-Workload]({% link {{ page.version.version }}/topology-follow-the-workload.md %}) behavior. In this case, latency will likely be unacceptably high.

## See also

{% include {{ page.version.version }}/topology-patterns/see-also.md %}
