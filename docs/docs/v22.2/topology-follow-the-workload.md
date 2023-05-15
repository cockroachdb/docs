---
title: Follow-the-Workload Topology
summary: Guidance on using the follow-the-workload topology in a multi-region deployment.
toc: true
docs_area: deploy
---

In a multi-region deployment, follow-the-workload is the default behavior for tables that do not have a [table locality](multiregion-overview.html#table-locality). In general, this is a good choice only for tables with the following requirements:

- The table is active mostly in one region at a time, e.g., following the sun.
- In the active region, read latency must be low, but write latency can be higher.
- In non-active regions, both read and write latency can be higher.
- Table data must remain available during a region failure.

{{site.data.alerts.callout_success}}
If read performance is your main focus for a table, but you want low-latency reads everywhere instead of just in the most active region, consider [global tables](global-tables.html) or [follower reads](topology-follower-reads.html).

Note that if you start using the [multi-region SQL abstractions](multiregion-overview.html) for a database, CockroachDB will no longer provide the follow-the-workload behavior described on this page for that database.
{{site.data.alerts.end}}

## Before you begin

### Fundamentals

{% include {{ page.version.version }}/topology-patterns/fundamentals.md %}

### Cluster setup

{% include {{ page.version.version }}/topology-patterns/multi-region-cluster-setup.md %}

## Configuration

Aside from [deploying a cluster across three regions](#cluster-setup) properly, with each node started with the [`--locality`](cockroach-start.html#locality) flag specifying its region and zone combination, this behavior requires no extra configuration. CockroachDB will balance the replicas for a table across the three regions and will assign the range lease to the replica in the region with the greatest demand at any given time (the follow-the-workload feature). This means that read latency in the active region will be low while read latency in other regions will be higher due to having to leave the region to reach the leaseholder. Write latency will be higher as well due to always involving replicas in multiple regions.

<img src="{{ 'images/v22.2/topology-patterns/topology_follower_reads1.png' | relative_url }}" alt="Follow-the-workload table replication" style="max-width:100%" />

{{site.data.alerts.callout_info}}
Follow-the-workload is also used by [system ranges containing important internal data](configure-replication-zones.html#create-a-replication-zone-for-a-system-range).
{{site.data.alerts.end}}

## Characteristics

### Latency

#### Reads

Reads in the region with the most demand will access the local leaseholder and, therefore, never leave the region. This makes read latency very low in the currently most active region. Reads in other regions, however, will be routed to the leaseholder in a different region and, thus, read latency will be higher.

For example, in the animation below, the most active region is `us-east` and, thus, the table's leaseholder is in that region:

1. The read request in `us-east` reaches the regional load balancer.
1. The load balancer routes the request to a gateway node.
1. The gateway node routes the request to the leaseholder replica.
1. The leaseholder retrieves the results and returns to the gateway node.
1. The gateway node returns the results to the client. In this case, reads in the `us-east` remain in the region and are lower latency than reads in other regions.

<img src="{{ 'images/v22.2/topology-patterns/topology_follow_the_workload_reads.png' | relative_url }}" alt="Follow-the-workload topology reads" style="max-width:100%" />

#### Writes

The replicas for the table are spread across all 3 regions, so writes involve multiple network hops across regions to achieve consensus. This increases write latency significantly.

For example, in the animation below, assuming the most active region is still `us-east`:

1. The write request in `us-east` reaches the regional load balancer.
1. The load balancer routes the request to a gateway node.
1. The gateway node routes the request to the leaseholder replica.
1. While the leaseholder appends the write to its Raft log, it notifies its follower replicas.
1. As soon as one follower has appended the write to its Raft log (and thus a majority of replicas agree based on identical Raft logs), it notifies the leaseholder and the write is committed on the agreeing replicas.
1. The leaseholders then return acknowledgement of the commit to the gateway node.
1. The gateway node returns the acknowledgement to the client.

<img src="{{ 'images/v22.2/topology-patterns/topology_follow_the_workload_writes.gif' | relative_url }}" alt="Follow-the-workload topology writes" style="max-width:100%" />

### Resiliency

Because this pattern balances the replicas for the table across regions, one entire region can fail without interrupting access to the table:

<img src="{{ 'images/v22.2/topology-patterns/topology_follower_reads_resiliency.png' | relative_url }}" alt="Follow-the-workload topology region failure" style="max-width:100%" />

<!-- However, if an additional machine holding a replica for the table fails at the same time as the region failure, the range to which the replica belongs becomes unavailable for reads and writes:

<img src="{{ 'images/v22.2/topology-patterns/topology_follower_reads3.png' | relative_url }}" alt="Follow-the-workload topology" style="max-width:100%" /> -->

## See also

{% include {{ page.version.version }}/topology-patterns/see-also.md %}
