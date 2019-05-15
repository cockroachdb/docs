---
title: Basic Production Topology
summary: Common cluster topology patterns with setup examples and performance considerations.
toc: true
---

When you're ready to run CockroachDB in production in a single region, it's important to deploy at least 3 CockroachDB nodes to take advantage of CockroachDB's automatic replication, distribution, rebalancing, and resiliency capabilities.  

{{site.data.alerts.callout_success}}
If you haven't already, [review the full range of topology patterns](topology-patterns.html) to ensure you choose the right one for your use case.
{{site.data.alerts.end}}

## Prerequisites

{% include {{ page.version.version }}/topology-patterns/fundamentals.md %}

## Configuration

<img src="{{ 'images/v19.1/topology-patterns/topology_basic_production1.png' | relative_url }}" alt="Basic production topology" style="max-width:100%" />

1. Provision hardware as follows:
    - 1 region with 3 AZs
    - 3+ VMs evenly distributed across AZs; add more VMs to increase throughput
    - App and load balancer in same region as VMs for CockroachDB
        - The load balancer redirects to CockroachDB nodes in the region

2. Start each node on a separate VM, setting the [`--locality`](start-a-node.html#locality) flag to the node's region and AZ combination, e.g.:

    {% include copy-clipboard.html %}
    ~~~ shell
    # Example start command for node in the east1 AZ of the us-east region:
    $ cockroach start \
    --locality=region=us-east,zone=east1 \
    --certs-dir=certs \
    --advertise-addr=<node1 internal address> \
    --join=<node1 internal address>:26257,<node2 internal address>:26257,<node3 internal address>:26257 \        
    --cache=.25 \
    --max-sql-memory=.25 \
    --background
    ~~~

With the default 3-way replication factor and `--locality` set as described above, CockroachDB balances each range of table data across AZs, one replica per AZ. System data is replicated 5 times by default and also balanced across AZs, thus increasing the [resiliency of the cluster](#cluster) as a whole.

## Characteristics

### Latency

#### Reads

Since all ranges, including leaseholder replicas, are in a single region, read latency is very low.

For example, in the animation below:

1. The read request reaches the load balancer.
2. The load balancer routes the request to a gateway node.
3. The gateway node routes the request to the relevant leaseholder.
4. The leaseholder retrieves the results and returns to the gateway node.
5. The gateway node returns the results to the client.

<img src="{{ 'images/v19.1/topology-patterns/topology_basic_production_reads.gif' | relative_url }}" alt="Basic production topology" style="max-width:100%" />

#### Writes

Since all ranges are in a single region, writes achieve consensus without leaving the region and, thus, write latency is very low as well.

For example, in the animation below:

1. The write request reaches the load balancer.
2. The load balancer routes the request to a gateway node.
3. The gateway node routes the request to the leaseholder replicas for the relevant table and secondary index.
4. While each leaseholder appends the write to its Raft log, it notifies its follower replicas.
5. In each case, as soon as one follower has appended the write to its Raft log (and thus a majority of replicas agree based on identical Raft logs), it notifies the leaseholder and the write is committed on the agreeing replicas.
6. The leaseholders then return acknowledgement of the commit to the gateway node.
7. The gateway node returns the acknowledgement to the client.

<img src="{{ 'images/v19.1/topology-patterns/topology_basic_production_writes.gif' | relative_url }}" alt="Leaseholder preferences topology" style="max-width:100%" />

### Resiliency

#### Data resiliency

Because each range is balanced across AZs, one AZ can fail without interrupting access to any data:

<img src="{{ 'images/v19.1/topology-patterns/topology_basic_production_resiliency1.png' | relative_url }}" alt="Basic production topology" style="max-width:100%" />

However, if an additional machine in a different AZ fails at the same time, and that machine holds a replica for a table or secondary index, that range becomes unavailable for reads and writes:

<img src="{{ 'images/v19.1/topology-patterns/topology_basic_production_resiliency2.png' | relative_url }}" alt="Basic production topology" style="max-width:100%" />

#### Cluster resiliency

CockroachDB stores important internal data in what are called system ranges. For example:

- The "meta" ranges contain authoritative information about the location of all data in the cluster.
- The "liveness" range contains authoritative information about which nodes are live at any given time.
- Other system ranges contain information needed to allocate new table IDs and track the status of a cluster's nodes.

For the cluster as a whole to remain available, these system ranges must retain a majority of their replicas, so CockroachDB comes with [pre-configured replication zones](configure-replication-zones.html#create-a-replication-zone-for-a-system-range) for them with the replication factor increased to `5` by default when there are 5 or more nodes in the cluster. Based on the [cluster setup](#configuration) described above, with each node started with the `--locality` flag specifying its AZ, each system range's replicas are spread across 3 AZs. This means that one entire AZ can fail without causing any system range to lose consensus:

<img src="{{ 'images/v19.1/topology-patterns/topology_single-region_cluster_resiliency1.png' | relative_url }}" alt="Single-region cluster resiliency" style="max-width:100%" />

However, if a broader combination of failures causes one or more important system ranges to lose consensus, the entire cluster becomes unavailable:

<img src="{{ 'images/v19.1/topology-patterns/topology_single-region_cluster_resiliency2.png' | relative_url }}" alt="Multi-region cluster resiliency" style="max-width:100%" />

## See also

{% include {{ page.version.version }}/topology-patterns/see-also.md %}
