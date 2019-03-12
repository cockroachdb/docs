---
title: Cluster Topology Patterns
summary: Common cluster topology patterns with setup examples and performance considerations.
toc: true
---

This page covers common cluster topology patterns with setup examples, as well as the benefits and trade-off for each pattern. Before you select a candidate pattern for your cluster, use the following broad patterns as a starting point and consider trade-offs.

## Considerations

Before selecting a pattern:

- Review the recommendations and requirements in our [Production Checklist](recommended-production-settings.html).
- Review the [CockroachDB architecture](architecture/overview.html). It's especially important to understand how data is stored in ranges, how ranges are replicated, and how one replica in each range serves as the "leaseholder" that coordinates all read and write requests for that range. See our [Performance Tuning](performance-tuning.html#important-concepts) tutorial for more details about these important concepts and for simple read and write examples.
- Learn about the concept of [locality](start-a-node.html#locality), which makes CockroachDB aware of the location of nodes and able to intelligently balance replicas across localities. Locality is also a prerequisite for the [follow-the-workload](demo-follow-the-workload.html) feature and for enterprise [partitioning](partitioning.html).
- Learn about [follower reads](follower-reads.html), an enterprise feature, which reduces latency for read queries by letting the closest replica serve the read request at the expense of only not guaranteeing that data is up to date.

{{site.data.alerts.callout_info}}
This page does not factor in hardware differences.
{{site.data.alerts.end}}

## Single-region clusters

### Single datacenter, basic pattern

This first example is of a single-datacenter cluster, with each node on a different machine as per our [basic topology recommendations](recommended-production-settings.html#basic-topology-recommendations). This pattern is common starting point for smaller organizations who may not have the resources (or need) to worry about a datacenter failure but still want to take advantage of CockroachDB's [high availability](high-availability.html).

<img src="{{ 'images/v19.1/topology-patterns/basic-local-deployment.png' | relative_url }}" alt="Local deployment" style="border:1px solid #eee;max-width:100%" />

For the diagram above:

**Configuration**

- `App` is an application that accesses CockroachDB.
- `Load Balancer` is a software-based load balancer.
- Leaseholders are denoted by a dashed line.
- The 3 nodes are all running in a single datacenter.
- The cluster is using the default replication factor of 3 (represented by `r1`, `r2`, `r3`). Each range has 3 replicas, with each replica on a different node.
- All CockroachDB nodes communicate with each other

**Availability expectations**

- With the default replication factor of 3, the cluster can tolerate 1 node failure. In such a case, all ranges still have 2 replicas on live nodes and, thus, a majority.

**Performance expectations**

- The network latency among the nodes is expected to be sub-millisecond.

### Single datacenter, more performant and/or resilient

While the [basic single-datacenter deployment](#single-datacenter-basic-pattern) takes advantage of CockroachDB's high availability, shares the load, and spreads capacity, scaling out the nodes has many benefits:

- Performance: Adding nodes for more processing power and/or storage typically increases throughput. For example, with five nodes and a replication factor of 3, each range has 3 replicas, with each replica on a different node. In this case, there will only be 1-2 replicas on each nod, leaving additional storage and bandwidth available.
- Resiliency: There will be more room to increase the replication factor, which increases resiliency against the failure of more than one node. For example, with 5 nodes and a replication factor of 5, each range has 5 replicas, with each replica on a different node. In this case, even with 2 nodes down, each range retains a majority of its replicas (3/5).

There are no constraints on node increments.

<img src="{{ 'images/v19.1/topology-patterns/local-scaling.png' | relative_url }}" alt="Resilient local deployment" style="border:1px solid #eee;max-width:100%" />

## Multi-region clusters

### Multiple regions, basic pattern

Once an organization begins to grow, a datacenter outage isn't acceptable and a cluster needs to be available all of the time. This is where a multi-region cluster is useful. A multi-region cluster is comprised of multiple datacenters in different regions (e.g., `us-east`, `us-west`), each with multiple nodes. CockroachDB will automatically try to diversify replica placement across localities (i.e., place a replica in each region). This setup can be used when your application is not SLA-sensitive, or you do not care about write performance. With this cluster pattern, many organizations will consider transitioning to using a variety of cloud providers (one provider per region).

In this example, the cluster has an asymmetrical setup where `Central` is closer to the `West` than the `East`. This configuration will provide better write latency to the write workloads in the `West` and `Central` because there is a lower latency (versus writing in the `East`).

<img src="{{ 'images/v19.1/topology-patterns/basic-multi-region.png' | relative_url }}" alt="Basic pattern for multi-region" style="border:1px solid #eee;max-width:100%" />

Each region has 2 nodes across 2 datacenters and does not use partitioning:

<img src="{{ 'images/v19.1/topology-patterns/basic-multi-region-layout.png' | relative_url }}" alt="Basic pattern for multi-region" style="border:1px solid #eee;max-width:100%" />

For this example:

#### Configuration

- `App` is an application that accesses CockroachDB.
- `Load Balancer`s are software-based load balancers that direct traffic to each of the regions' nodes at random.
- Leaseholders are denoted by a dashed line.
- 6 Nodes are spread across 3 regions (`us-west`, `us-central`, `us-east`) within a country (`us`).
- Every region has 2 nodes across 2 datacenters (e.g., `us-west-a`, `us-west-b`). Note that most cloud providers only have 2 datacenters per region. Each node is started with the `--locality` flag to identify which region it is in:

    ~~~
    --locality=region=us-west,datacenter=us-west-a
    --locality=region=us-west,datacenter=us-west-b
    --locality=region=us-central,datacenter=us-central-a
    --locality=region=us-central,datacenter=us-central-b
    --locality=region=us-east,datacenter=us-east-a
    --locality=region=us-east,datacenter=us-east-b
    ~~~

- The cluster is using a replication factor of 5 (represented by `r1`, `r2`, `r3`, `r4`, `r5`).
- All CockroachDB nodes communicate with each other
- Similar to the [single-datacenter](#single-region-clusters) topology, more regions can be added dynamically.

**Availability expectations**

- If all of the nodes for a preferred locality are down, then the app will try datacenters in other localities.
- The cluster can withstand a datacenter failure without losing a region because there are 2 nodes in each region.
- The cluster can withstand a regional failure because even with 2 nodes down, each range retains a majority of its replicas (3/5). In general, multi-regions can help protect against natural disaster.

**Performance expectations**

- The latency numbers (e.g., `60ms`) in the first diagram represent network round-trip from one datacenter to another.
- [Follow-the-workload](demo-follow-the-workload.html) will increase the speed for reads.
- Write latencies will be as fast as the slowest quorum between 2 regions.

### Multiple regions, more performant (with partitioning)

While the [basic pattern for a multi-region cluster](#multiple-regions-basic-pattern) can help protect against datacenter and regional failures, there will be high latency due to cross-country roundtrips. This is not ideal for organizations who have users spread out across the country (or world). For any multi-region cluster, [partitioning](partitioning.html) should be used to keep data close to the users who access it.

In this example, a table is partitioned by a column indicating the region where a customer is located (e.g., a table has a `city` column and the values `LA`, `SF`, and `SD` are partitioned to the `us-west` region). Then, [zone configurations](configure-replication-zones.html) are used to keep the replicas and leaseholders for each partition in the closest datacenter to those customer.

This setup uses a modern [multi-tier architecture](https://en.wikipedia.org/wiki/Multitier_architecture), which is simplified to global server load balancer (`GSLB`), `App`, and `Load Balancer` layers in the below diagram:

<img src="{{ 'images/v19.1/topology-patterns/multi-region-partition.png' | relative_url }}" alt="Partitioned multi-region" style="border:1px solid #eee;max-width:100%" />

**Configuration**

A multi-region cluster with partitioning has a similar setup as the [basic multi-region pattern](#multiple-regions-basic-pattern):

- 9 Nodes are spread across 3 regions (`us-west`, `us-central`, `us-east`) within a country (`us`).
- A client connects to geographically close `app` server via `GSLB`.
- Inside each region, an `app` server connects to one of the CockroachDB nodes within the region through a software-based `load balancer`.
- Every region has 3 nodes across 2 datacenters (e.g., `us-west-a`, `us-west-b`). Note that most cloud providers only have 2 datacenters per region. Each node is started with the `--locality` flag to identify which region it is in:

    ~~~
    --locality=region=us-west,datacenter=us-west-a
    --locality=region=us-west,datacenter=us-west-b
    --locality=region=us-central,datacenter=us-central-a
    --locality=region=us-central,datacenter=us-central-b
    --locality=region=us-east,datacenter=us-east-a
    --locality=region=us-east,datacenter=us-east-b
    ~~~

- The cluster is using a replication factor of 3 (represented by `r1`, `r2`, `r3`). Each replica has a prefix (`w-` for West, `c-` for Central, `e-` for East), which denotes the partition that is replicated.
- Leaseholders are denoted by a dashed line. Using [zone configurations](configure-replication-zones.html), leaseholders can be pinned (represented by the `x`) to a datacenter close to the users.
- All CockroachDB nodes communicate with each other.

However, to make the cluster more performant, you need to add [partitions](partitioning.html) (an enterprise-only feature). In this example:

- Tables are [partitioned](partitioning.html) at the row level by locality.
- Partition replicas are distributed among the 3 nodes within each region.
- Rows with the `region=us-west` partition have their leaseholder constrained to a `us-west-b` datacenter.
- Rows with the `region=us-central` partition have their leaseholder constrained to a `us-central-a` datacenter.
- Rows with the `region=us-east` partition have their leaseholder constrained to a `us-east-b` datacenter.

**Availability expectations**

- If a datacenter with 1 replica is lost, the cluster will not lose a region because there is a majority of replicas (2/3) in the region's other datacenter.
- If a datacenter with 2 replicas is lost, the cluster will lose a region (i.e., data is unavailable) because there is only 1 replica in the region's other datacenter. For more information, see the [Locality-resilience tradeoff](partitioning#locality-resilience-tradeoff) section of the [Define Table Partitions](partitioning.html) doc.

**Performance expectations**

- Reads respond in 2-4 milliseconds.
- Writes respond in 2-4 milliseconds.
- Symmetrical latency between datacenters.

## Anti-patterns

Anti-patterns are commonly used patterns that are ineffective or risky. Consider the following when choosing a cluster pattern:

- Do not deploy to 2 datacenters. A cluster across 2 datacenters is not protected against datacenter failure and can lead to a [split-brain scenario](https://en.wikipedia.org/wiki/Split-brain_(computing)). For CockroachDB to work from a resiliency standpoint, it is best practice to deploy your cluster across 3 or more datacenters.
- Do not deploy to regions with high network latency (e.g., `us-west`, `asia`, and `europe`) without using partitioning.
- The cluster's replication factor does not need to be the same as the number of nodes in the cluster. In fact, as you scale your cluster, you should add nodes (but keep the replication factor at 5, for example) to improve performance. This is shown in the [Single datacenter, more resilient and/or performant](#single-datacenter-more-performant-and-or-resilient) section.

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
