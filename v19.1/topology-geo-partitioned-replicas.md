---
title: Geo-Partitioned Replicas Topology
summary: Guidance on using the geo-partitioned replicas topology in a multi-region deployment.
toc: true
---

In a multi-region deployment, the geo-partitioned replicas topology is a good choice for tables with the following requirements:

- Read and write latency must be low.
- Rows in the table, and all latency-sensitive queries, can be tied to specific geographies, e.g., city, state, region.
- Regional data must remain available during an AZ failure, but it's OK for regional data to become unavailable during a region-wide failure.

{{site.data.alerts.callout_success}}
**See It In Action** - Read about how an [electronic lock manufacturer](https://www.cockroachlabs.com/case-studies/european-electronic-lock-manufacturer-modernizes-iam-system-with-managed-cockroachdb/) and [multi-national bank](https://www.cockroachlabs.com/case-studies/top-five-multinational-bank-modernizes-its-european-core-banking-services-migrating-from-oracle-to-cockroachdb/) are using the Geo-Partitioned Replicas topology in production for improved performance and regulatory compliance.
{{site.data.alerts.end}}

## Prerequisites

### Fundamentals

{% include {{ page.version.version }}/topology-patterns/fundamentals.md %}

### Cluster setup

{% include {{ page.version.version }}/topology-patterns/multi-region-cluster-setup.md %}

## Configuration

{{site.data.alerts.callout_info}}
Geo-partitioning requires an [Enterprise license](https://www.cockroachlabs.com/get-cockroachdb).
{{site.data.alerts.end}}

### Summary

Using this pattern, you design your table schema to allow for [partitioning](partitioning.html#table-creation), with a column identifying geography as the first column in the table's compound primary key (e.g., city/id). You tell CockroachDB to partition the table and all of its secondary indexes by that geography column, each partition becoming its own range of 3 replicas. You then tell CockroachDB to pin each partition (all of its replicas) to the relevant region (e.g., LA partitions in `us-west`, NY partitions in `us-east`). This means that reads and writes in each region will always have access to the relevant replicas and, therefore, will have low, intra-region latencies.

<img src="{{ 'images/v19.1/topology-patterns/topology_geo-partitioning1.png' | relative_url }}" alt="Geo-partitioning topology" style="max-width:100%" />

### Steps

Assuming you have a [cluster deployed across three regions](#cluster-setup) and a table and secondary index like the following:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE users (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    city STRING NOT NULL,
    first_name STRING NOT NULL,
    last_name STRING NOT NULL,
    address STRING NOT NULL,
    PRIMARY KEY (city ASC, id ASC)
);
~~~

{% include copy-clipboard.html %}
~~~ sql
> CREATE INDEX users_last_name_index ON users (city, last_name);
~~~

{{site.data.alerts.callout_info}}
A geo-partitioned table does not require a secondary index. However, if the table does have one or more secondary indexes, each index must be partitioned as well. This means that the indexes must start with the column identifying geography, like the table itself, which impacts the queries they'll be useful for. If you cannot partition all secondary indexes on a table you want to geo-partition, consider the [Geo-Partitioned Leaseholders](topology-geo-partitioned-leaseholders.html) pattern instead.
{{site.data.alerts.end}}

1. If you do not already have one, [request a trial Enterprise license](https://www.cockroachlabs.com/get-cockroachdb).

2. Partition the table by `city`. For example, assuming there are three possible `city` values, `los angeles`, `chicago`, and `new york`:

    {% include copy-clipboard.html %}
    ~~~ sql
    > ALTER TABLE users PARTITION BY LIST (city) (
        PARTITION la VALUES IN ('los angeles'),
        PARTITION chicago VALUES IN ('chicago'),
        PARTITION ny VALUES IN ('new york')
    );
    ~~~

    This creates distinct ranges for each partition of the table.

3. Partition the secondary index by `city` as well:

    {% include copy-clipboard.html %}
    ~~~ sql
    > ALTER INDEX users_last_name_index PARTITION BY LIST (city) (
        PARTITION la_idx VALUES IN ('los angeles'),
        PARTITION chicago_idx VALUES IN ('chicago'),
        PARTITION ny_idx VALUES IN ('new york')
    );
    ~~~

    This creates distinct ranges for each partition of the secondary index.

4. For each partition of the table, [create a replication zone](configure-zone.html) that constrains the partition's replicas to nodes in the relevant region:

    {% include copy-clipboard.html %}
    ~~~ sql
    > ALTER PARTITION la OF TABLE users
        CONFIGURE ZONE USING constraints = '[+region=us-west]';
      ALTER PARTITION chicago OF TABLE users
        CONFIGURE ZONE USING constraints = '[+region=us-central]';
      ALTER PARTITION ny OF TABLE users
        CONFIGURE ZONE USING constraints = '[+region=us-east]';
      ~~~

5. For each partition of the secondary index, [create a replication zone](configure-zone.html) that constrains the partition's replicas to nodes in the relevant region:

    {% include copy-clipboard.html %}
    ~~~ sql
    > ALTER PARTITION la_idx OF TABLE users
        CONFIGURE ZONE USING constraints = '[+region=us-west]';
      ALTER PARTITION chicago_idx OF TABLE users
        CONFIGURE ZONE USING constraints = '[+region=us-central]';
      ALTER PARTITION ny_idx OF TABLE users
        CONFIGURE ZONE USING constraints = '[+region=us-east]';
    ~~~

{{site.data.alerts.callout_success}}
As you scale and add more cities, you can repeat steps 2 and 3 with the new complete list of cities to re-partition the table and its secondary indexes, and then repeat steps 4 and 5 to create replication zones for the new partitions.
{{site.data.alerts.end}}

## Characteristics

### Latency

#### Reads

Because each partition is constrained to the relevant region (e.g., the `la` and `la_idx` partitions are located in the `us-west` region), reads that specify the local region key access the relevant leaseholder locally. This makes read latency very low, with the exception of reads that do not specify a region key or that refer to a partition in another region; such reads will be transactionally consistent but will not have local latencies.

For example, in the animation below:

1. The read request in `us-central` reaches the regional load balancer.
2. The load balancer routes the request to a gateway node.
3. The gateway node routes the request to the leaseholder for the relevant partition.
4. The leaseholder retrieves the results and returns to the gateway node.
5. The gateway node returns the results to the client.

<img src="{{ 'images/v19.1/topology-patterns/topology_geo-partitioning_reads.png' | relative_url }}" alt="Geo-partitioning topology" style="max-width:100%" />

#### Writes

Just like for reads, because each partition is constrained to the relevant region (e.g., the `la` and `la_idx` partitions are located in the `us-west` region), writes that specify the local region key access the relevant replicas without leaving the region. This makes write latency very low, with the exception of writes that do not specify a region key or that refer to a partition in another region; such writes will be transactionally consistent but will not have local latencies.

For example, in the animation below:

1. The write request in `us-central` reaches the regional load balancer.
2. The load balancer routes the request to a gateway node.
3. The gateway node routes the request to the leaseholder replicas for the relevant table and secondary index partitions.
4. While each leaseholder appends the write to its Raft log, it notifies its follower replicas, which are in the same region.
5. In each case, as soon as one follower has appended the write to its Raft log (and thus a majority of replicas agree based on identical Raft logs), it notifies the leaseholder and the write is committed on the agreeing replicas.
6. The leaseholders then return acknowledgement of the commit to the gateway node.
7. The gateway node returns the acknowledgement to the client.

<img src="{{ 'images/v19.1/topology-patterns/topology_geo-partitioning_writes.gif' | relative_url }}" alt="Geo-partitioning topology" style="max-width:100%" />

### Resiliency

Because each partition is constrained to the relevant region and balanced across the 3 AZs in the region, one AZ can fail per region without interrupting access to the partitions in that region:

<img src="{{ 'images/v19.1/topology-patterns/topology_geo-partitioning_resiliency1.png' | relative_url }}" alt="Geo-partitioning topology" style="max-width:100%" />

However, if an entire region fails, the partitions in that region become unavailable for reads and writes, even if your load balancer can redirect requests to a different region:

<img src="{{ 'images/v19.1/topology-patterns/topology_geo-partitioning_resiliency2.png' | relative_url }}" alt="Geo-partitioning topology" style="max-width:100%" />

## Tutorial

For a step-by-step demonstration of how this pattern gets you low-latency reads and writes in a broadly distributed cluster, see the [Geo-Partitioning tutorial](demo-geo-partitioning.html).  

## See also

{% include {{ page.version.version }}/topology-patterns/see-also.md %}
