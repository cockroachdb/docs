---
title: Topology Patterns
summary: Recommended topology patterns for running CockroachDB in a cloud environment
toc: true
---

This section provides recommended topology patterns for running CockroachDB in a cloud environment, each with latency and resiliency characteristics and required configurations.

## Single-Region Topologies

When your clients are in a single geographic region, choosing a topology pattern is straightforward.

Pattern | Latency | Resiliency | Configuration
--------|---------|------------|--------------
[Development](single-region-topologies.html#development-pattern) | Fast reads and writes | N/A | 1 node<br>No replication
[Basic Production](single-region-topologies.html#basic-production-pattern) | Fast reads and writes | 1 AZ failure | 1 region<br>3 AZs<br>3+ nodes across AZs<br>3-way replication

## Multi-Region Topologies

When your clients are in multiple geographic regions, it is important to deploy your cluster across regions properly and then carefully choose the right topology pattern for each of your tables. Not doing so can result in unexpected latency and resiliency issues.

{{site.data.alerts.callout_info}}
Multi-region patterns are almost always table-specific. For example, you might use the [Geo-Partitioning](multi-region-topologies.html#geo-partitioning-pattern) pattern for frequently updated tables that are geographically specific and the [Leaseholder Preferences](multi-region-topologies.html#leaseholder-preferences-pattern) pattern for infrequently updated tables (e.g., reference tables) that are not tied to geography.
{{site.data.alerts.end}}

Pattern | Latency | Resiliency | Configuration
--------|---------|------------|--------------
[Geo-Partitioning](multi-region-topologies.html#geo-partitioning-pattern) | Fast reads and writes | 1 AZ failure per partition | Multi-region cluster setup<br>Geo-partitioned table
[Leaseholder Preferences](multi-region-topologies.html#leaseholder-preferences-pattern) | Fast reads (current)<br>Slower writes | 1 region failure | Multi-region cluster setup<br>Index leaseholder per region
[Follower Reads](multi-region-topologies.html#follower-reads-pattern) | Fast reads (historical)<br>Slower writes | 1 region failure | Multi-region cluster setup<br>App uses follower reads
[Follow-the-Workload](multi-region-topologies.html#follow-the-workload-pattern) | Fast reads (active region)<br>Slower reads (elsewhere)<br>Slower writes | 1 region failure | Multi-region cluster setup

<!-- ## Anti-patterns

Anti-patterns are commonly used patterns that are ineffective or risky. Consider the following when choosing a cluster pattern:

- Do not deploy to 2 datacenters. A cluster across 2 datacenters is not protected against datacenter failure. In order to survive the failure of a datacenter, you need to deploy your cluster across 3 or more datacenters.
- Do not deploy to regions with high network latency (e.g., `us-west`, `asia`, and `europe`) without using [partitioning](partitioning.html).
- The cluster's replication factor does not need to be the same as the number of nodes in the cluster. In fact, as you scale your cluster, you should add nodes (but keep the replication factor at 5, for example) to improve performance. This is shown in the [Single datacenter, more resilient and/or performant](#single-datacenter-more-performant-and-or-resilient) section. -->
