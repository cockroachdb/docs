---
title: Follow-the-Workload Topology
summary: Common cluster topology patterns with setup examples and performance considerations.
toc: true
---

In a multi-region deployment, the follow-the-workload pattern is a good choice for tables with the following characteristics:

- The table is active mostly in one region at a time, e.g., following the sun.
- In the active region, reads must be fast, but writes can be slower.
- In non-active regions, both reads and writes can be slower.
- The table must remain available during a region failure.

{{site.data.alerts.callout_info}}
Multi-region topology patterns are almost always table-specific. If you haven't already, [review the full range of patterns](topology-patterns.html#multi-region) to ensure you choose the right one for each of your tables.
{{site.data.alerts.end}}

{{site.data.alerts.callout_success}}
If read performance is your main focus for a table, but you want fast reads everywhere instead of just in the most active region, consider the [Pinned Index Leaseholders](topology-pinned-index-leaseholders.html) or [Follower Reads](topology-follower-reads.html) pattern.
{{site.data.alerts.end}}

## Prerequisites

### Fundamentals

{% include {{ page.version.version }}/topology-patterns/fundamentals.md %}

### Cluster setup

{% include {{ page.version.version }}/topology-patterns/multi-region-cluster-setup.md %}

## Configuration

Aside from [deploying a cluster across multiple regions](#cluster-setup) properly, with each node started with the [`--locality`](start-a-node.html#locality) flag specifying its region and AZ combination, this pattern requires no extra configuration. CockroachDB will balance the replicas for a table across the three regions and will assign the range lease to the replica in the region with the greatest demand at any given time (the [follow-the-workload](demo-follow-the-workload.html) feature). This means that reads in the active region will be fast while reads in other regions will be slower due to having to leave the region to reach the leaseholder. Writes will be slower as well due to always involving replicas in multiple regions.

<img src="{{ 'images/v19.1/topology-patterns/topology_follower_reads1.png' | relative_url }}" alt="Follower reads topology" style="max-width:100%" />

## Characteristics

### Latency

#### Reads

Reads in the region with the most demand will access the local leaseholder and, therefore, never leave the region. This makes reads very fast in the currently most active region. Reads in other regions, however, will be routed to the leaseholder in a different region and, thus, will be slower.

For example, in the animation below, the most active region is `us-east` and, thus, the table's leaseholder is in that region. The read request in each region (1) is routed from the load balancer to a gateway node (2) to the leaseholder replica in `us-east` (3) and then back to the gateway node (4), which returns the results to the client (5). In this case, reads in the `us-east` remain in the region and are faster than reads in other regions.

<img src="{{ 'images/v19.1/topology-patterns/topology_follow_the_workload_reads.gif' | relative_url }}" alt="Follow-the-workload topology" style="max-width:100%" />

#### Writes

The replicas for the table are spread across all 3 regions, so writes involve multiple network hops across regions to achieve consensus. This slows down writes significantly.

For example, in the animation below, assuming the most active region is still `us-east`, the write request (1) is routed from the load balancer to a gateway node (2) and then to the leaseholder replica (3). Once the leaseholder has appended the write to its Raft log, it notifies its follower replicas (4). As soon as one follower has appended the write to its Raft log (and thus a majority of replicas agree based on identical Raft logs), it notifies the leaseholder and the write is committed on the agreeing replicas (5). The leaseholder then returns acknowledgement of the commit to the gateway node (6), which returns the acknowledgement to the client (7).

<img src="{{ 'images/v19.1/topology-patterns/topology_follow_the_workload_writes.gif' | relative_url }}" alt="Follow-the-workload topology" style="max-width:100%" />

### Resiliency

#### Data

Because this pattern balances the replicas for the table across regions, one entire region can fail without interrupting access to the table:

<img src="{{ 'images/v19.1/topology-patterns/topology_follower_reads2.png' | relative_url }}" alt="Follow-the-workload topology" style="max-width:100%" />

However, if an additional machine holding a replica for the table fails at the same time as the region failure, the range to which the replica belongs becomes unavailable for reads and writes:

<img src="{{ 'images/v19.1/topology-patterns/topology_follower_reads3.png' | relative_url }}" alt="Follow-the-workload topology" style="max-width:100%" />

#### Cluster

{% include {{ page.version.version }}/topology-patterns/multi-region-cluster-resiliency.md %}

## See also

{% include {{ page.version.version }}/topology-patterns/see-also.md %}
