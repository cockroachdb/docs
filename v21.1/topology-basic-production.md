---
title: Basic Production Topology
summary: Guidance for a single-region production deployment.
toc: true
---

When you're ready to run CockroachDB in production in a single region, it's important to deploy at least 3 CockroachDB nodes to take advantage of CockroachDB's automatic replication, distribution, rebalancing, and resiliency capabilities.  

{{site.data.alerts.callout_success}}
If you haven't already, [review the full range of topology patterns](topology-patterns.html) to ensure you choose the right one for your use case.
{{site.data.alerts.end}}

## Prerequisites

{% include {{ page.version.version }}/topology-patterns/fundamentals.md %}

## Configuration

<img src="{{ 'images/v21.1/topology-patterns/topology_basic_production1.png' | relative_url }}" alt="Basic production topology" style="max-width:100%" />

1. Provision hardware as follows:
    - 1 region with 3 AZs
    - 3+ VMs evenly distributed across AZs; add more VMs to increase throughput
    - App and load balancer in same region as VMs for CockroachDB
        - The load balancer redirects to CockroachDB nodes in the region

2. Start each node on a separate VM, setting the [`--locality`](cockroach-start.html#locality) flag to the node's region and AZ combination. For example, the following command starts a node in the east1 availability zone of the us-east region:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --locality=region=us-east,zone=east1 \
    --certs-dir=certs \
    --advertise-addr=<node1 internal address> \
    --join=<node1 internal address>:26257,<node2 internal address>:26257,<node3 internal address>:26257 \        
    --cache=.25 \
    --max-sql-memory=.25 \
    --background
    ~~~

With the default 3-way replication factor and `--locality` set as described above, CockroachDB balances each range of table data across AZs, one replica per AZ. System data is replicated 5 times by default and also balanced across AZs, thus increasing the [resiliency of the cluster](configure-replication-zones.html#create-a-replication-zone-for-a-system-range) as a whole.

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

<img src="{{ 'images/v21.1/topology-patterns/topology_basic_production_reads.png' | relative_url }}" alt="Basic production topology" style="max-width:100%" />

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

<img src="{{ 'images/v21.1/topology-patterns/topology_basic_production_writes.gif' | relative_url }}" alt="Leaseholder preferences topology" style="max-width:100%" />

### Resiliency

Because each range is balanced across AZs, one AZ can fail without interrupting access to any data:

<img src="{{ 'images/v21.1/topology-patterns/topology_basic_production_resiliency1.png' | relative_url }}" alt="Basic production topology" style="max-width:100%" />

However, if an additional AZ fails at the same time, the ranges that lose consensus become unavailable for reads and writes:

<img src="{{ 'images/v21.1/topology-patterns/topology_basic_production_resiliency2.png' | relative_url }}" alt="Basic production topology" style="max-width:100%" />

## See also

{% include {{ page.version.version }}/topology-patterns/see-also.md %}
