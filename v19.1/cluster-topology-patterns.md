---
title: Cluster Topology Patterns
summary: Common cluster topology patterns with setup examples and performance considerations.
toc: true
---

This page covers common cluster topology patterns with setup examples, as well as the benefits and trade-off for each pattern. Before you select a candidate pattern for your cluster, use the following broad patterns as a starting point and consider trade-offs.

## Considerations

Before selecting a pattern:

- Review the recommendations and requirements in our [Production Checklist](recommended-production-settings.html).
- Review the [CockroachDB architecture](architecture/overview.html). It's especially important to understand how data is stored in ranges, how ranges are replicated, and how one replica in each range serves as the "leaseholder" that coordinates all read and write requests for that range. For more details and some example scenarios, see [Reads and Writes in CockroachDB](architecture/reads-and-writes-overview.html).
- Learn about the concept of [locality](start-a-node.html#locality), which makes CockroachDB aware of the location of nodes and able to intelligently balance replicas across localities. Locality is also a prerequisite for the [follow-the-workload](demo-follow-the-workload.html) feature and for enterprise [partitioning](partitioning.html).
- Learn about [follower reads](follower-reads.html), an enterprise feature, which reduces latency for read queries by letting the closest replica serve the read request at the expense of only not guaranteeing that data is up to date.

{{site.data.alerts.callout_info}}
This page does not factor in hardware differences.
{{site.data.alerts.end}}

## Single-region clusters

### Single datacenter, basic pattern

This first example is of a single-datacenter cluster, with each node on a different machine as per our [basic topology recommendations](recommended-production-settings.html#basic-topology-recommendations). This pattern is common starting point for smaller organizations who may not have the resources (or need) to worry about a datacenter failure but still want to take advantage of CockroachDB's [high availability](high-availability.html).

<img src="{{ 'images/v19.1/topology-patterns/basic-local-deployment.png' | relative_url }}" alt="Local deployment" style="max-width:100%" />

For the diagram above:

**Configuration**

- `App` is an application that accesses CockroachDB.
- `Load Balancer` is a software-based load balancer.
- Leaseholders are denoted by a dashed line.
- The 3 nodes are all running in a single datacenter.
- The cluster is using the default replication factor of 3 (represented by 3 blocks of the same color). Each range (e.g., `r1`) has 3 replicas, with each replica on a different node.

**Availability expectations**

- With the default replication factor of 3, the cluster can tolerate 1 node failure. In such a case, all ranges still have 2 replicas on live nodes and, thus, a majority.

**Performance expectations**

- The network latency among the nodes is expected to be sub-millisecond.

### Single datacenter, more performant and/or resilient

While the [basic single-datacenter deployment](#single-datacenter-basic-pattern) takes advantage of CockroachDB's high availability, shares the load, and spreads capacity, scaling out the nodes has many benefits:

- Performance: Adding nodes for more processing power and/or storage typically increases throughput. For example, with five nodes and a replication factor of 3, each range has 3 replicas, with each replica on a different node. In this case, there will only be 1-2 replicas on each nod, leaving additional storage and bandwidth available.
- Resiliency: There will be more room to increase the replication factor, which increases resiliency against the failure of more than one node. For example, with 5 nodes and a replication factor of 5, each range has 5 replicas, with each replica on a different node. In this case, even with 2 nodes down, each range retains a majority of its replicas (3/5).

There are no constraints on node increments.

<img src="{{ 'images/v19.1/topology-patterns/local-scaling.png' | relative_url }}" alt="Resilient local deployment" style="max-width:100%" />

## Multi-region clusters

### Multiple regions, basic pattern

Once an organization begins to grow, a datacenter outage isn't acceptable and a cluster needs to be available all of the time. This is where a multi-region cluster is useful. A multi-region cluster is comprised of multiple datacenters in different regions (e.g., `us-east`, `us-west`), each with multiple nodes. CockroachDB will automatically try to diversify replica placement across localities (i.e., place a replica in each region). This setup can be used when your application is not SLA-sensitive, or you do not care about write performance. With this cluster pattern, many organizations will consider transitioning to using a variety of cloud providers (one provider per region).

In this example, the cluster has an asymmetrical setup where `us-central` is closer to the `us-west` than the `us-east`. This configuration will provide better write latency to the write workloads in `us-west` and `us-central` because there is a lower latency (versus writing in the `us-east`).

<img src="{{ 'images/v19.1/topology-patterns/basic-multi-region.png' | relative_url }}" alt="Basic pattern for multi-region" style="max-width:100%" />

Each region has 3 nodes across 3 datacenters and does not use partitioning:

<img src="{{ 'images/v19.1/topology-patterns/basic-multi-region-layout.png' | relative_url }}" alt="Basic pattern for multi-region" style="max-width:100%" />

For this example:

#### Configuration

- `App` is an application that accesses CockroachDB.
- `Load Balancer`s are software-based load balancers that direct traffic to each of the regions' nodes at random.
- Leaseholders are denoted by a dashed line.
- 9 nodes are spread across 3 regions (`us-west`, `us-central`, `us-east`) within a country (`us`).
- Every region has 3 nodes, with each node in a different datacenter (e.g., `us-west-a`, `us-west-b`, `us-west-c`). Each node is started with the `--locality` flag to identify which region and datacenter it is in:

    ~~~
    --locality=region=us-west,datacenter=us-west-a
    --locality=region=us-west,datacenter=us-west-b
    --locality=region=us-west,datacenter=us-west-c
    --locality=region=us-central,datacenter=us-central-a
    --locality=region=us-central,datacenter=us-central-b
    --locality=region=us-central,datacenter=us-central-c
    --locality=region=us-east,datacenter=us-east-a
    --locality=region=us-east,datacenter=us-east-b
    --locality=region=us-east,datacenter=us-east-c
    ~~~

    <!-- Note that most cloud providers have 3 availability zones (i.e., datacenters) per region. -->

- The cluster is using a replication factor of 3 (represented by 3 blocks of the same color). Each range (e.g., `r1`) has 3 replicas, with each replica on a different node.

**Availability expectations**

- If all of the nodes for a preferred locality are down, then the app will try datacenters in other localities.
- The cluster can withstand a datacenter failure without losing a region because there are 2 nodes in each region.
- The cluster can withstand a regional failure because, with `--locality` specified on each node as shown above, the cluster balances each range across all 3 regions; with one region down, each range still has a majority of its replicas (2/3).

**Performance expectations**

- The latency numbers (e.g., `60ms`) in the first diagram represent network round-trip from one region to another.
- For reads, if the gateway node (the node the app connects to) is in the region containing the leaseholder replica of the relevant range, latency should be around 2ms. If the gateway node is in a region that does not contain the leaseholder, the cluster will route the request to the node with the leaseholder in another region, that node will retrieve the data, and then the cluster will return the data to the gateway node. In this case, the network round-trips from one region to another will add latency. In some cases, [follow-the-workload](demo-follow-the-workload.html) will increase the speed for reads by moving the leaseholder closer to the application.
- For writes, because a majority of replicas are always required to agree before a write is committed, latencies will be as fast as the slowest quorum between 2 regions.

### Multiple regions, more performant (with partitioning)

While the [basic pattern for a multi-region cluster](#multiple-regions-basic-pattern) can help protect against datacenter and regional failures, there will be high latency due to cross-country roundtrips. This is not ideal for organizations who have users spread out across the country (or world). For any multi-region cluster, [partitioning](partitioning.html) should be used to keep data close to the users who access it.

In this example, a table is partitioned by a column indicating the region where a customer is located (e.g., a table has a `city` column and the values `LA`, `SF`, and `SD` are partitioned to the `us-west` region). Then, [zone configurations](configure-replication-zones.html) are used to keep the replicas and leaseholders for each partition in the closest datacenter to those customer.

This setup uses a modern [multi-tier architecture](https://en.wikipedia.org/wiki/Multitier_architecture), which is simplified to global server load balancer (`GSLB`), `App`, and `Load Balancer` layers in the below diagram:

<img src="{{ 'images/v19.1/topology-patterns/multi-region-partition.png' | relative_url }}" alt="Partitioned multi-region" style="max-width:100%" />

**Configuration**

A multi-region cluster with partitioning has a similar setup as the [basic multi-region pattern](#multiple-regions-basic-pattern):

- 9 nodes are spread across 3 regions (`us-west`, `us-central`, `us-east`) within a country (`us`).
- A client connects to geographically close `app` server via `GSLB`.
- Inside each region, an `app` server connects to one of the CockroachDB nodes within the region through a software-based `load balancer`.
- Every region has 3 nodes across 3 datacenters (e.g., `us-west-a`, `us-west-b`, `us-west-c`). Each node is started with the `--locality` flag to identify which region it is in:

    ~~~
    --locality=region=us-west,datacenter=us-west-a
    --locality=region=us-west,datacenter=us-west-b
    --locality=region=us-west,datacenter=us-west-c
    --locality=region=us-central,datacenter=us-central-a
    --locality=region=us-central,datacenter=us-central-b
    --locality=region=us-central,datacenter=us-central-c
    --locality=region=us-east,datacenter=us-east-a
    --locality=region=us-east,datacenter=us-east-b
    --locality=region=us-east,datacenter=us-east-c
    ~~~

    <!-- Note that most cloud providers have 3 availability zones (i.e., datacenters) per region. -->


- The cluster is using a replication factor of 3 (represented by the 3 blocks of the same color). Each range (e.g., `r1`) has a prefix (`w-` for West, `c-` for Central, `e-` for East), which denotes the partition that is replicated.
- Leaseholders are denoted by a dashed line.
- Tables are [partitioned](partitioning.html) at the row level by locality, for example:

    ~~~
    > CREATE TABLE customers (
        id INT DEFAULT unique_rowid(),
        name STRING,
        email STRING,
        state STRING,
        expected_graduation_date DATE,   
        PRIMARY KEY (state, id))
        PARTITION BY LIST (state) (
          PARTITION west VALUES IN ('CA','OR','WA'[...]),
          PARTITION central VALUES IN ('OH','IL','MI'[...]),
          PARTITION east VALUES IN ('NY','MA','VA'[...]),
          PARTITION DEFAULT VALUES IN (default)
        );
    ~~~

- Using [replication zones](partitioning.html#define-table-partitions-by-list), partitions are pinned to the nodes in their locality, for example:

    ~~~
    > ALTER PARTITION west OF TABLE customers \
        CONFIGURE ZONE USING constraints='[+region=us-west]';
    ~~~

**Availability expectations**

- The cluster as a whole can withstand a regional failure because system-level ranges have their replicas balanced across regions. However, because user data is partitioned and pinned to specific regions, region-specific data will be unavailable during a regional failure.
- Within a region, partitions pinned to the region will remain available as long as 2/3 datacenters are up.

**Performance expectations**

- Reads respond in 2-4 milliseconds.
- Writes respond in 2-4 milliseconds.
- Symmetrical latency between datacenters.

## Anti-patterns

Anti-patterns are commonly used patterns that are ineffective or risky. Consider the following when choosing a cluster pattern:

- Do not deploy to 2 datacenters. A cluster across 2 datacenters is not protected against datacenter failure. In order to survive the failure of a datacenter, you need to deploy your cluster across 3 or more datacenters.
- Do not deploy to regions with high network latency (e.g., `us-west`, `asia`, and `europe`) without using [partitioning](partitioning.html).
- The cluster's replication factor does not need to be the same as the number of nodes in the cluster. In fact, as you scale your cluster, you should add nodes (but keep the replication factor at 5, for example) to improve performance. This is shown in the [Single datacenter, more resilient and/or performant](#single-datacenter-more-performant-and-or-resilient) section.
