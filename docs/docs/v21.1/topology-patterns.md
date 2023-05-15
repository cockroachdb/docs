---
title: Topology Patterns Overview
summary: Recommended patterns for running CockroachDB in a cloud environment.
toc: true
key: cluster-topology-patterns.html
---

This section provides recommended patterns for running CockroachDB in a cloud environment.

{{site.data.alerts.callout_info}}
You can observe latency for your cluster on the [Network Latency page](ui-network-latency-page.html) of the DB Console.
{{site.data.alerts.end}}

## Single-region

When your clients are in a single geographic region, choosing a pattern is straightforward.

Deployment Type | Latency | Resiliency | Configuration
--------|---------|------------|--------------
[Development](topology-development.html) | <ul><li>Fast reads and writes</li></ul> | <ul><li>None</li></ul> | <ul><li>1 node</li><li>No replication</li></ul>
[Basic Production](topology-basic-production.html) | <ul><li>Fast reads and writes</li></ul> | <ul><li>1 zone failure</li></ul> | <ul><li>1 region</li><li>3 zones</li><li>3+ nodes across zones</li></ul>

## Multi-region

When your clients are in multiple geographic regions, it is important to deploy your cluster across regions properly and then carefully choose:

1. The right [survival goal](multiregion-overview.html#survival-goals) for each database.
1. The right [table locality](multiregion-overview.html#table-locality) for each of your tables.

Not doing so can result in unexpected latency and resiliency.  For more information, see the [Multi-Region Capabilities Overview](multiregion-overview.html).

{{site.data.alerts.callout_info}}
The multi-region patterns described below are almost always table-specific. For example, you might use [Regional Tables](regional-tables.html) for frequently updated tables that are tied to a specific region, and [Global Tables](global-tables.html) for reference tables that are not tied to a specific region, and that are read frequently but updated infrequently.
{{site.data.alerts.end}}

| Pattern                                                  | Latency                                                                                                    |
|----------------------------------------------------------+------------------------------------------------------------------------------------------------------------|
| [Regional Tables](regional-tables.html)                  | Low latency for single-region writes and multi-region stale reads.                                         |
| [Global Tables](global-tables.html)                      | Low-latency multi-region reads from all regions, at the expense of higher latency cross-region writes.     |
| [Follower Reads](topology-follower-reads.html)           | Fast regional (historical) reads, slower cross-region writes.                                              |
| [Follow-the-Workload](topology-follow-the-workload.html) | Fast regional reads in the active region; slower cross-region reads elsewhere. Slower cross-region writes. |

{{site.data.alerts.callout_info}}
In [multi-region databases](multiregion-overview.html), the resiliency of each database depends on its [survival goal settings](multiregion-overview.html#survival-goals).
{{site.data.alerts.end}}

## Anti-patterns

The following anti-patterns are ineffective or risky:

- Single-region deployments using 2 zones, or multi-region deployments using 2 regions. In these cases, the cluster would be unable to survive the loss of a single zone or a single region, respectively.
- Broadly distributed multi-region deployments (e.g., `us-west`, `asia`, and `europe`) using only the default [Follow-the-Workload](topology-follow-the-workload.html) behavior. In this case, latency will likely be unacceptably high.

## See also

{% include {{ page.version.version }}/topology-patterns/see-also.md %}
