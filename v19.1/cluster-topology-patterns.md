---
title: Cluster Topology Patterns
summary: Common cluster topology patterns with setup examples and performance considerations.
toc: true
---

This page covers common cluster topology patterns with setup examples, as well as the benefits and trade-off for each pattern. Before you select a candidate pattern for your cluster, use the following broad patterns as a starting point and consider trade-offs.

## Considerations

When selecting a pattern for your cluster, the following must be taken into consideration:

- The function of a CockroachDB [leaseholder](architecture/replication-layer.html#leases)
- The impacts of the [leaseholder](architecture/life-of-a-distributed-transaction.html#leaseholder-node) on read and write activities
- The leaseholders are local to reader and writers within the datacenter
- The `--locality` flag must be set properly on each node to enable [follow-the-workload](demo-follow-the-workload.html)
- The leaseholder migration among the datacenters is minimized by using [partitioning](partitioning.html), an Enterprise feature
- Whether the application is designed to use the [partitioning feature](partitioning.html) or not

{{site.data.alerts.callout_info}}
This page does not factor in hardware differences.
{{site.data.alerts.end}}

## Single datacenter clusters

### Basic pattern for a single datacenter cluster

This first example is of a single datacenter cluster, i.e., a local deployment. This pattern is common starting point for smaller organizations who may not have the resources (or need) to worry about a datacenter failure, but still want to take advantage of CockroachDB's [high availability](high-availability.html). The cluster is self-hosted with each node on a different machine within the same datacenter. The network latency among the nodes is expected to be the same, around 1ms.

<img src="{{ 'images/v19.1/topology-patterns/basic-local-deployment.png' | relative_url }}" alt="Local deployment" style="border:1px solid #eee;max-width:100%" />

For the diagram above:

**Configuration**

- `App` is an application that accesses CockroachDB
- `Load Balancer` is a software-based load balancer
- The 3 nodes are all running in a single datacenter
- All CockroachDB nodes communicate with each other
- The cluster is using the default replication factor of 3 (represented by `r1`, `r2`, `r3`)

**Availability expectations**

- The cluster can survive 1 node failure because a majority of replicas (2/3) remains available. It will not survive a datacenter failure.

**Performance expectations**

- The network latency among the nodes is expected to be the same, sub-millisecond.

### More resilient local deployment

While the [basic local deployment](#basic-pattern-for-a-local-deployment) takes advantage of CockroachDB's high availability, shares the load, and spreads capacity, dynamically scaling out the nodes from 3 (to 4) to 5 has many benefits:

- There will be more room to increase replication factor, which increases resiliency against the failure of more than one node.
- You can scale out; because there are more nodes, you can increase throughput, add storage, etc.

There are no constraints on node increments.

<img src="{{ 'images/v19.1/topology-patterns/resilient-local-deployment.png' | relative_url }}" alt="Resilient local deployment" style="border:1px solid #eee;max-width:100%" />

## Single-region clusters

### Single-region, multiple datacenters cluster

Once an organization begins to grow, a datacenter outage isn't acceptable and a cluster needs to be available all of the time. This is where a single-region cluster with multiple datacenters is useful. For example, an organization can do a cloud deployment across multiple datacenters within the same geographical region.

<img src="{{ 'images/v19.1/topology-patterns/single-region-multi.png' | relative_url }}" alt="Single region multiple datacenters" style="border:1px solid #eee;max-width:100%" />

For the diagram above:

**Configuration**

- `App` is an application that accesses CockroachDB
- `Load Balancer` is a software-based load balancer
- The 3 nodes are each in a different datacenter, all located in the `us-east` region
- All CockroachDB nodes communicate with each other
- The cluster is using the default replication factor of 3 (represented by `r1`, `r2`, `r3`)

**Availability expectations**

- The cluster can withstand a datacenter failure.

**Performance expectations**

- The network latency among the nodes is expected to be the same, sub-millisecond.

## Multi-region clusters

### Basic pattern for a multi-region cluster

For even more resiliency, use a multi-region cluster. A multi-region cluster is comprised of multiple datacenters in different regions (e.g., `East`, `West`), that each have with multiple nodes. CockroachDB will automatically try to diversify replica placement across localities (i.e., place a replica in each region). Using this setup, many organization will also transition to using different cloud providers (one provider per region).

In this example, the cluster has an asymmetrical setup where `Central` is closer to the `West` than the `East`. This configuration will provide better write latency to the write workloads in the `West` and `Central` because there is a lower latency (versus writing in the `East`). This is assuming you are not using zone configurations.

<img src="{{ 'images/v19.1/topology-patterns/basic-multi-region.png' | relative_url }}" alt="Basic pattern for multi-region" style="border:1px solid #eee;max-width:100%" />

For this example:

**Configuration**

- Nodes are spread across 3 regions within a country (`West`, `East`, `Central`)
- A software-based load balancer directs traffic to any of the regions' nodes at random
- Every region has 3 datacenters
- All CockroachDB nodes communicate with each other
- Similar to the [local](#single-datacenter-clusters) topology, more regions can be added dynamically
- A homogenous configuration among the regions for simplified operations is recommended
- For sophisticated workloads, each region can have different node count and node specification. This heterogeneous configuration could better handle regional specific concurrency and load characteristics.

When locality is enabled, the load balancer should be setup to load balance on the database nodes within the same locality as the app servers first:

- The `West` app servers should connect to the West CockroachDB servers
- The `Central` app servers should connect to the Central CockroachDB servers
- The `East` app servers should connect to the East CockroachDB servers

**Availability expectations**

If all of the nodes for a preferred locality are down, then the app will try databases in other localities. The cluster can withstand a datacenter failure. In general, multi-regions can help protect against natural disaster.

**Performance expectations**

- The latency numbers (e.g., `60ms`) in the first diagram represent network round-trip from one datacenter to another.
- [Follow-the-workload](demo-follow-the-workload.html) will keep the performance quick for where the load is so you do not pay cross-country latency on reads.
- Write latencies will not be faster than the slowest quorum between two regions.

### More performant multi-region cluster

While the [basic pattern for a multi-region cluster](#basic-pattern-for-a-multi-region-cluster) can help protect against regional failures, there will be high latency due to cross-country roundtrips. This is not ideal for organizations who have users spread out across the country. For any multi-region cluster, [partitioning](partitioning.html) should be used to keep data close to the users who access it.

<img src="{{ 'images/v19.1/topology-patterns/multi-region-partition.png' | relative_url }}" alt="Multi-region partition" style="border:1px solid #eee;max-width:100%" />

This setup uses a modern [multi-tier architecture](https://en.wikipedia.org/wiki/Multitier_architecture), which is simplified to global server load balancer (`GSLB`), `App`, and `Load Balancer` layers in the below diagram:

<img src="{{ 'images/v19.1/topology-patterns/multi-tier-architecture.png' | relative_url }}" alt="Multi-tier architecture" style="border:1px solid #eee;max-width:100%" />

**Configuration**

- Nodes are spread across 3 regions within a country (`West`, `East`, `Central`)
- A client connects to geographically close app server via `GSLB`.
- Inside each region, an app server connects to one of the CockroachDB nodes within their geography through a software-based load balancer
- Every region has 3 datacenters
- All CockroachDB nodes communicate with each other
- Tables are [partitioned](partitioning.html) at row-level by locality.
- Rows with the `West` partition have their leaseholder in the `West` datacenter.
- Rows with the `Central` partition have their leaseholder in the `Central` datacenter.
- Rows with the `East` partition have their leaseholder in the `East` datacenter.
- Replicas are evenly distributed among the three datacenters.
- Abbreviated startup flag for each datacenter:

    ~~~
    --loc=Region=East
    --loc=Region=Central
    --loc=Region=West
    ~~~

**Availability expectations**

- Can survive a single datacenter failure, since a majority of the replicas will remain available.

**Performance expectations**

- Reads respond in a few milliseconds.
- Writes respond in 60ms.
- Symmetrical latency between datacenters.

**Application expectations**

- West `App` servers connect to the `West` CockroachDB nodes.
- Central `App` servers connect to the `Central` CockroachDB nodes.
- East `App` servers connect to the `East` CockroachDB nodes.


## Anti-patterns

_Do we want to add a section for bad patterns / things not to do? What should be added here?_

<!-- ### High-Performance

Some applications have high-performance requirements. In the diagram below, `NJ` and `NY` depict two separate datacenters, each with 3+ nodes, that are connected by a high bandwidth, low-latency network:

~~~
   NJ ---1ms--- NY
     \       /  
     20ms  20ms  
        \  /
         \/  
       Central
         /\  
        /  \
     20ms  20ms  
     /       \  
  CA ---1ms--- NV
~~~

**Configuration**

In this pattern:

- `NJ` and `NY` have the performance characteristics of the [local topology](#single-datacenter-clusters), but the benefit of Zero RPO (recovery point objective) and near Zero RTO (recovery time objective) disaster recovery SLA. `CA` and `NV` are set up similarly.
- The `Central` region serves as the quorum. `NJ` and `NY` are close, `CA` and `NV` are close to each other, and `Central` is halfway between both pairs to achieve quorum fast. To do this, the cluster needs to be [partitioned](partitioning.html).
- downsides: you'd have to use zone configs for this (right?) and east - west partition their data. this might require application changes.

**Availability expectations**

- Can survive a single datacenter failure, since a majority of the replicas will remain available.

**Performance expectations**

- Fast performance on each coast, while still being a multi-region cluster for better resiliency.

**Application expectations**

- [Zone configurations](configure-replication-zones.html) are needed for this, as well all as [partitioning](partitioning.html). This might require application changes.

### Dual East datacenters

In this example, the cluster is [following-the-workload](demo-follow-the-workload.html).

here, we're doing follow the workloads
- east will have fast writes
- you would do this if you're write heavy on the east

~~~
App                App
 \                  /
West ---60ms--- East1
     \           |
       \        5ms
        60ms     |
           \____East2
~~~

**Configuration**

- West `App` servers connect to the `West` CockroachDB nodes
- East `App` servers connect to the `East1` CockroachDB nodes
- Rows with the `West` partition will have the leaseholder in the `West` datacenter.
- Rows with the `East` partition will have the leaseholder in the `East1` datacenter.
- The 3 replicas will be evenly distributed among the three datacenters.
- Abbreviated startup flag for each datacenter:

    ~~~
    --loc=Region=East,DC=1
    --loc=Region=East,DC=2
    --loc=Region=West
    ~~~

**Availability expectations**

- Can survive a single datacenter failure, since a majority of the replicas will remain available.

**Performance expectations**

- The reader can expect to have a couple of milliseconds response time.
- The `East` writers can expect to have a 5ms response time.
- The `West` writers can expect to have a 60ms response time.

### Dual East and West datacenters

bring down write speeds on the west to be just as fast

pros: everything is fast and you only need 4 nodes (or regions or whatever) to do it

~~~
App                App
 \                  /
West1 ---60ms--- East1
  |   \        /   |
  5ms  - 60ms -    5ms
  |   /        \   |
West2----60ms----East2
~~~

**Configuration**

- Rows with the `West` partition will have the leaseholder in the `West1` datacenter.
- Rows with the `East` partition will have the leaseholder in the `East1` datacenter.
- West partitions will have 1 replica each in `West1` and `West2`, then 1 replica in `East1` or `East2`.
- East partitions will have 1 replica each in `East1` and `East2`, then 1 replica in `West1` or `West2`.
- Abbreviated startup flag for each datacenter:

    ~~~
    --loc=Region=West,DC=1
    --loc=Region=West,DC=2
    --loc=Region=East,DC=1
    --loc=Region=East,DC=2
    ~~~
- This setup requires zone configurations and [partitioning](partitioning.html).

**Availability expectations**

- Four nodes lets you have survivabilty of two regions (are these two regions or two datacenters?)

**Performance expectations**

In this example, every request is fast and you only need 4 regions to do it:

- The reader can expect to have a couple of milliseconds response time.
- The writers can expect to have a 5ms response time.

## Global clusters

### Basic structure for minimum resilience

As an organization grows and establishes itself as a global presence, it will need its data to be near its customers. In this case, the organization would want to create regions on every continent in order to provide fast, local copies of data for their users in those regions. This is also a great solution for GDPR compliance.

The global pattern connects [multiple regional clusters](#multi-region-clusters) together to form a single database that is globally distributed. Transactions are globally consistent. To do this, the cluster requires load balancers, [partitioning](partitioning.html), and [zone configurations](configure-replication-zones.html). Partitions along zone configurations are an [Enterprise feature](enterprise-licensing.html).

~~~
    West-----East            West-------East
       \      /                \        /
        \Asia/                  \Europe/
         \  /                    \    /
          \/                      \  /
        Central                 Central
                Asia------Europe
                   \     /  
                    \   /  
                     \ /  
                   Americas

               West---------East
                  \          /
                   \Americas/  
                    \      /
                    Central
~~~

**Configuration**

- Each region (i.e., `Asia`, `Europe`, `Americas`) contains three datacenters (i.e., `West`, `East`, `Central`)
- The application needs to be location aware, i.e., reference a specific region. For more information, see [Define Table Partitions](partitioning.html).
- TO DO: stipulate number of nodes in each region, replication factor (number of replicas in zone configs)

**Availability expectations**

- The cluster can withstand regional failures (???)

**Performance expectations**

- With correct load balancer setup and geopartiioning, reads can be executes in less than 10ms.
- Writes are limited by the the fastest latency that will allow them to achieve quorum.
- In general, performance will be better for users because their data is kept local. -->
