---
title: Topology Patterns
summary: Recommended topology patterns for running CockroachDB in a cloud environment
toc: true
---

This section provides recommended topology patterns for running CockroachDB in a cloud environment, each with required configurations and latency and resiliency characteristics.

## Single-Region

When your clients are in a single geographic region, choosing a topology is straightforward.

Pattern | Latency | Resiliency | Configuration
--------|---------|------------|--------------
[Development](topology-development.html) | <ul><li>Fast reads and writes</li></ul> | <ul><li>None</li></ul> | <ul><li>1 node</li><li>No replication</li></ul>
[Basic Production](topology-basic-production.html) | <ul><li>Fast reads and writes</li></ul> | <ul><li>1 AZ failure</li></ul> | <ul><li>1 region</li><li>3 AZs</li><li>3+ nodes across AZs</li></ul>

## Multi-Region

When your clients are in multiple geographic regions, it is important to deploy your cluster across regions properly and then carefully choose the right topology for each of your tables. Not doing so can result in unexpected latency and resiliency.

{{site.data.alerts.callout_info}}
Multi-region patterns are almost always table-specific. For example, you might use the [Geo-Partitioning](topology-geo-partitioned-replicas.html) pattern for frequently updated tables that are geographically specific and the [Pinned Index Leaseholders](topology-pinned-index-leaseholders.html) pattern for infrequently updated tables (e.g., reference tables) that are not tied to geography.
{{site.data.alerts.end}}

Pattern | Latency | Resiliency | Configuration
--------|---------|------------|--------------
[Geo-Partitioned Replicas](topology-geo-partitioned-replicas.html) | <ul><li>Fast regional reads and writes</li></ul> | <ul><li>1 AZ failure per partition</li></ul> | <ul><li>Geo-partitioned table</li><li>Partition replicas pinned to regions</li></ul>
[Geo-Partitioned Leaseholders](topology-geo-partitioned-leaseholders.html) | <ul><li>Fast regional reads</li><li>Slower cross-region writes</li></ul> | <ul><li>1 region failure</li></ul> | <ul><li>Geo-partitioned table</li><li>Partition replicas spread across regions</li><li>Partition leaseholders pinned to regions</li></ul>
[Pinned Index Leaseholders](topology-pinned-index-leaseholders.html) | <ul><li>Fast regional reads (current)</li><li>Much slower cross-region writes</li></ul> | <ul><li>1 region failure</li></ul> | <ul><li>Multiple identical indexes</li><li>Index replicas spread across regions</li><li>Index leaseholders pinned to regions</li></ul>
[Follower Reads](topology-follower-reads.html) | <ul><li>Fast regional reads (historical)</li><li>Slower cross-region writes</li></ul> | <ul><li>1 region failure</li></ul> | <ul><li>App configured to use follower reads</li></ul>
[Follow-the-Workload](topology-follow-the-workload.html) | <ul><li>Fast regional reads (active region)</li><li>Slower cross-region reads (elsewhere)</li><li>Slower cross-region writes</li> | <ul><li>1 region failure</li></ul> | <ul><li>None</li></ul>

<!-- ## Anti-patterns

Anti-patterns are commonly used patterns that are ineffective or risky. Consider the following when choosing a cluster pattern:

- Do not deploy to 2 datacenters. A cluster across 2 datacenters is not protected against datacenter failure. In order to survive the failure of a datacenter, you need to deploy your cluster across 3 or more datacenters.
- Do not deploy to regions with high network latency (e.g., `us-west`, `asia`, and `europe`) without using [partitioning](partitioning.html).
- The cluster's replication factor does not need to be the same as the number of nodes in the cluster. In fact, as you scale your cluster, you should add nodes (but keep the replication factor at 5, for example) to improve performance. This is shown in the [Single datacenter, more resilient and/or performant](#single-datacenter-more-performant-and-or-resilient) section. -->
