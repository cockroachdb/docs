---
title: Single-Region Topologies
summary:
toc: true
toc_not_nested: true
---

When your clients are in a single geographic region, choosing a topology pattern is straightforward.

## Prerequisites

- Before choosing a topology pattern:
    - Review how data is replicated and distributed across a cluster, and how this affects performance. It is especially important to understand the concept of the "leaseholder". For a summary, see [Reads and Writes in CockroachDB](architecture/reads-and-writes-overview.html). For a deeper dive, see the [CockroachDB Architecture](architecture/overview.html) documentation.
    - Review the concept of [locality](start-a-node.html#locality), which makes CockroachDB aware of the location of nodes and able to intelligently place and balance data based on how you define [replication controls](configure-replication-zones.html).
- Before deploying a multi-region cluster to production:
    - Review the recommendations and requirements in our [Production Checklist](recommended-production-settings.html).
    - These topologies don't account for hardware specifications, so be sure to follow our [hardware recommendations](recommended-production-settings.html#hardware) and perform a POC to properly size hardware for your intended topologies and workloads.
    - Adopt relevant [SQL Best Practices](performance-best-practices-overview.html) to ensure optimal performance.

## Development Pattern

While developing an application against CockroachDB, it's sufficient to deploy a single-node cluster close to your test application, whether that's on a single VM or on your laptop.

### Configuration: Development

<img src="{{ 'images/v19.1/topology_development1.png' | relative_url }}" alt="Development topology" style="max-width:100%" />

For this pattern, you can either [run CockroachDB locally](start-a-local-cluster.html) or [deploy a single-node cluster on a cloud VM](manual-deployment.html).

### Latency: Development

With the CockroachDB node in the same region as your client, and without the overhead of replication, all reads and writes are very fast:

<img src="{{ 'images/v19.1/topology_development_latency.gif' | relative_url }}" alt="Development topology" style="max-width:100%" />

### Resiliency: Development

In a single-node cluster, CockroachDB does not replicate data and, therefore, is not resilient to failures. If the machine where the node is running fails, or if the region or availability zone containing the machine fails, the cluster becomes unavailable:

<img src="{{ 'images/v19.1/topology_development2.png' | relative_url }}" alt="Development topology" style="max-width:100%" />

## Basic Production Pattern

When you're ready to run CockroachDB in production in a single region, it's important to deploy at least 3 CockroachDB nodes to take advantage of CockroachDB's automatic replication, distribution, rebalancing, and resiliency capabilities.  

### Configuration: Basic Production

<img src="{{ 'images/v19.1/topology_basic_production1.png' | relative_url }}" alt="Basic production topology" style="max-width:100%" />

1. Provision hardware as follows:
    - 1 region with 3 AZs
    - 3+ VMs evenly distributed across AZs; add more VMs to increase throughput
    - App and load balancer in same region as VMs for CockroachDB
        - The load balancer redirects to CockroachDB nodes in the region

2. Start each node on a separate VM, setting the [`--locality`](start-a-node.html#locality) flag to the node's region and AZ combination, e.g.:

    {% include copy-clipboard.html %}
    ~~~ shell
    # Example start command for node in the west1 AZ of the us-west region:
    $ cockroach start \
    --locality=region=us-east,zone=east1 \
    --certs-dir=certs \
    --advertise-addr=<node1 internal address> \
    --join=<node1 internal address>:26257,<node2 internal address>:26257,<node3 internal address>:26257 \        
    --cache=.25 \
    --max-sql-memory=.25 \
    --background
    ~~~

With the default 3-way replication factor and `--locality` set as described above, CockroachDB balances each range across AZs, one replica per AZ.

### Latency: Basic Production

- **Reads:** Since all ranges, including leaseholder replicas, are in a single region, reads are very fast.

    For example, in the animation below, the read request (1) is routed from the load balancer to a gateway node (2) to the relevant leaseholder (3) and then back to the gateway node (4), which returns the results to the client (5).

    <img src="{{ 'images/v19.1/topology_basic_production_reads.gif' | relative_url }}" alt="Basic production topology" style="max-width:100%" />

- **Writes:** Just like for reads, since all ranges are in a single region, writes can achieve consensus very fast.

    For example, in the animation below, the write request (1) is routed from the load balancer to a gateway node (2) and then to the leaseholder replicas for the relevant table and secondary index (3). Once each leaseholder has appended the write to its Raft log, it notifies its follower replicas (4). In each case, as soon as one follower has appended the write to its Raft log (and thus a majority of replicas agree based on identical Raft logs), it notifies the leader and the write is committed on the agreeing replicas (5). The leaseholders then return acknowledgement of the commit to the gateway node (6), which returns the acknowledgement to the client (7).

    <img src="{{ 'images/v19.1/topology_basic_production_writes.gif' | relative_url }}" alt="Leaseholder preferences topology" style="max-width:100%" />

### Resiliency: Basic Production

Because each range is balanced across AZs, one AZ can fail without interrupting access to any data:

<img src="{{ 'images/v19.1/topology_basic_production_resiliency1.png' | relative_url }}" alt="Basic production topology" style="max-width:100%" />

However, if an additional machine in a different AZ fails at the same time, and that machine holds a replica for a table or secondary index, that table becomes unavailable for reads and writes:

<img src="{{ 'images/v19.1/topology_basic_production_resiliency2.png' | relative_url }}" alt="Basic production topology" style="max-width:100%" />

If two AZs fail at the same time, all ranges, including [internal system ranges](architecture/distribution-layer.html#monolithic-sorted-map-structure), lose consensus, and the entire cluster becomes unavailable:

<img src="{{ 'images/v19.1/topology_basic_production_resiliency3.png' | relative_url }}" alt="Basic production topology" style="max-width:100%" />
