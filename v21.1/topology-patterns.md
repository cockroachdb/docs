---
title: Topology Patterns
summary: Recommended topology patterns for running CockroachDB in a cloud environment.
toc: true
redirect_from: cluster-topology-patterns.html
key: cluster-topology-patterns.html
---

This section provides recommended topology patterns for running CockroachDB in a cloud environment, each with required configurations and latency and resiliency characteristics.

{{site.data.alerts.callout_info}}
You can observe latency patterns for your cluster on the [Network Latency page](ui-network-latency-page.html) of the DB Console.
{{site.data.alerts.end}}

## Single-region patterns

When your clients are in a single geographic region, choosing a topology is straightforward.

Pattern | Latency | Resiliency | Configuration
--------|---------|------------|--------------
[Development](topology-development.html) | <ul><li>Fast reads and writes</li></ul> | <ul><li>None</li></ul> | <ul><li>1 node</li><li>No replication</li></ul>
[Basic Production](topology-basic-production.html) | <ul><li>Fast reads and writes</li></ul> | <ul><li>1 AZ failure</li></ul> | <ul><li>1 region</li><li>3 AZs</li><li>3+ nodes across AZs</li></ul>

## Multi-region patterns

When your clients are in multiple geographic regions, it is important to deploy your cluster across regions properly and then carefully choose the right topology for each of your tables. Not doing so can result in unexpected latency and resiliency.

{{site.data.alerts.callout_info}}
Multi-region patterns are almost always table-specific. For example, you might use the [Geo-Partitioning Replicas](topology-geo-partitioned-replicas.html) pattern for frequently updated tables that are geographically specific and the [Duplicate Indexes](topology-duplicate-indexes.html) pattern for reference tables that are not tied to geography and that are read frequently but updated infrequently.
{{site.data.alerts.end}}

Pattern | Latency | Resiliency | Configuration
--------|---------|------------|--------------
[Geo-Partitioned Replicas](topology-geo-partitioned-replicas.html) | <ul><li>Fast regional reads and writes</li></ul> | <ul><li>1 AZ failure per partition</li></ul> | <ul><li>Geo-partitioned table</li><li>Partition replicas pinned to regions</li></ul>
[Geo-Partitioned Leaseholders](topology-geo-partitioned-leaseholders.html) | <ul><li>Fast regional reads</li><li>Slower cross-region writes</li></ul> | <ul><li>1 region failure</li></ul> | <ul><li>Geo-partitioned table</li><li>Partition replicas spread across regions</li><li>Partition leaseholders pinned to regions</li></ul>
[Duplicate Indexes](topology-duplicate-indexes.html) | <ul><li>Fast regional reads (current)</li><li>Much slower cross-region writes</li></ul> | <ul><li>1 region failure</li></ul> | <ul><li>Multiple identical indexes</li><li>Index replicas spread across regions</li><li>Index leaseholders pinned to regions</li></ul>
[Follower Reads](topology-follower-reads.html) | <ul><li>Fast regional reads (historical)</li><li>Slower cross-region writes</li></ul> | <ul><li>1 region failure</li></ul> | <ul><li>App configured to use follower reads</li></ul>
[Follow-the-Workload](topology-follow-the-workload.html) | <ul><li>Fast regional reads (active region)</li><li>Slower cross-region reads (elsewhere)</li><li>Slower cross-region writes</li> | <ul><li>1 region failure</li></ul> | <ul><li>None</li></ul>

## Anti-patterns

The following anti-patterns are ineffective or risky:

- Single-region deployments using 2 AZs, or multi-region deployments using 2 regions. In these cases, the cluster would be unable to survive the loss of a single AZ or a single region, respectively.
- Broadly distributed multi-region deployments (e.g., `us-west`, `asia`, and `europe`) using only the default [Follow-the-Workload](topology-follow-the-workload.html) pattern. In this case, latency will likely be unacceptably high.
- [Geo-partitioned tables](topology-geo-partitioned-replicas.html) with non-partitioned secondary indexes. In this case, writes will incur cross-region latency to achieve consensus on the non-partitioned indexes.
