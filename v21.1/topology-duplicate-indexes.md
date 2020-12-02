---
title: Duplicate Indexes Topology
summary: Guidance on using the duplicate indexes topology in a multi-region deployment.
toc: true
---

In a multi-region deployment, the duplicate indexes pattern is a good choice for tables with the following requirements:

- Read latency must be low, but write latency can be much higher.
- Reads must be up-to-date for business reasons or because the table is referenced by [foreign keys](foreign-key.html).
- Rows in the table, and all latency-sensitive queries, **cannot** be tied to specific geographies.
- Table data must remain available during a region failure.

In general, this pattern is suited well for immutable/reference tables that are rarely or never updated.

<iframe width="560" height="315" src="https://www.youtube.com/embed/xde_Oz-dJxM" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

{{site.data.alerts.callout_success}}
**See It In Action** - Read about how a [financial software company](https://www.cockroachlabs.com/case-studies/top-u-s-financial-software-company-turns-to-cockroachdb-to-improve-its-application-login-experience/) is using the Duplicate Indexes topology for low latency reads in their identity access management layer.
{{site.data.alerts.end}}

## Prerequisites

### Fundamentals

{% include {{ page.version.version }}/topology-patterns/fundamentals.md %}

### Cluster setup

{% include {{ page.version.version }}/topology-patterns/multi-region-cluster-setup.md %}

## Configuration

{{site.data.alerts.callout_info}}
Pinning secondary indexes requires an [Enterprise license](https://www.cockroachlabs.com/get-cockroachdb).
{{site.data.alerts.end}}

### Summary

Using this pattern, you tell CockroachDB to put the leaseholder for the table itself (also called the primary index) in one region, create 2 secondary indexes on the table, and tell CockroachDB to put the leaseholder for each secondary index in one of the other regions. This means that reads will access the local leaseholder (either for the table itself or for one of the secondary indexes). Writes, however, will still leave the region to get consensus for the table and its secondary indexes.  

<img src="{{ 'images/v21.1/topology-patterns/topology_duplicate_indexes1.png' | relative_url }}" alt="Duplicate Indexes topology" style="max-width:100%" />

### Steps

Assuming you have a [cluster deployed across three regions](#cluster-setup) and a table like the following:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE postal_codes (
    id INT PRIMARY KEY,
    code STRING
);
~~~

1. If you do not already have one, [request a trial Enterprise license](https://www.cockroachlabs.com/get-cockroachdb).

2. [Create a replication zone](configure-zone.html) for the table and set a leaseholder preference telling CockroachDB to put the leaseholder for the table in one of the regions, for example `us-west`:

    {% include copy-clipboard.html %}
    ~~~ sql
    > ALTER TABLE postal_codes
        CONFIGURE ZONE USING
          num_replicas = 3,
          constraints = '{"+region=us-west":1}',
          lease_preferences = '[[+region=us-west]]';
    ~~~

3. [Create secondary indexes](create-index.html) on the table for each of your other regions, including all of the columns you wish to read either in the key or in the key and a [`STORING`](create-index.html#store-columns) clause:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE INDEX idx_central ON postal_codes (id)
        STORING (code);
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE INDEX idx_east ON postal_codes (id)
        STORING (code);
    ~~~

4. [Create a replication zone](configure-zone.html) for each secondary index, in each case setting a leaseholder preference telling CockroachDB to put the leaseholder for the index in a distinct region:

    {% include copy-clipboard.html %}
    ~~~ sql
    > ALTER INDEX postal_codes@idx_central
        CONFIGURE ZONE USING
          num_replicas = 3,
          constraints = '{"+region=us-central":1}',
          lease_preferences = '[[+region=us-central]]';
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > ALTER INDEX postal_codes@idx_east
        CONFIGURE ZONE USING
          num_replicas = 3,
          constraints = '{"+region=us-east":1}',
          lease_preferences = '[[+region=us-east]]';
    ~~~

5. To confirm that replication zones are in effect, you can use the [`SHOW CREATE TABLE`](show-create.html):

    {% include copy-clipboard.html %}
    ~~~ sql
    > SHOW CREATE TABLE postal_codes;
    ~~~

    ~~~
       table_name  |                              create_statement
    +--------------+----------------------------------------------------------------------------+
      postal_codes | CREATE TABLE postal_codes (
                   |     id INT8 NOT NULL,
                   |     code STRING NULL,
                   |     CONSTRAINT "primary" PRIMARY KEY (id ASC),
                   |     INDEX idx_central (id ASC) STORING (code),
                   |     INDEX idx_east (id ASC) STORING (code),
                   |     FAMILY "primary" (id, code)
                   | );
                   | ALTER TABLE defaultdb.public.postal_codes CONFIGURE ZONE USING
                   |     num_replicas = 3,
                   |     constraints = '{+region=us-west: 1}',
                   |     lease_preferences = '[[+region=us-west]]';
                   | ALTER INDEX defaultdb.public.postal_codes@idx_central CONFIGURE ZONE USING
                   |     num_replicas = 3,
                   |     constraints = '{+region=us-central: 1}',
                   |     lease_preferences = '[[+region=us-central]]';
                   | ALTER INDEX defaultdb.public.postal_codes@idx_east CONFIGURE ZONE USING
                   |     num_replicas = 3,
                   |     constraints = '{+region=us-east: 1}',
                   |     lease_preferences = '[[+region=us-east]]'
    (1 row)
    ~~~

## Characteristics

### Latency

#### Reads

Reads access the local leaseholder and, therefore, never leave the region. This makes read latency very low.

For example, in the animation below:

1. The read request in `us-central` reaches the regional load balancer.
2. The load balancer routes the request to a gateway node.
3. The gateway node routes the request to the relevant leaseholder. In `us-west`, the leaseholder is for the table itself. In the other regions, the leaseholder is for the relevant index, which the [cost-based optimizer](cost-based-optimizer.html) uses due to the leaseholder preferences.
4. The leaseholder retrieves the results and returns to the gateway node.
5. The gateway node returns the results to the client.

<img src="{{ 'images/v21.1/topology-patterns/topology_duplicate_indexes_reads.png' | relative_url }}" alt="Pinned secondary indexes topology" style="max-width:100%" />

#### Writes

The replicas for the table and its secondary indexes are spread across all 3 regions, so writes involve multiple network hops across regions to achieve consensus. This increases write latency significantly. It's also important to understand that the replication of extra indexes can reduce throughput and increase storage cost.

For example, in the animation below:

1. The write request in `us-central` reaches the regional load balancer.
2. The load balancer routes the request to a gateway node.
3. The gateway node routes the request to the leaseholder replicas for the table and its secondary indexes.
4. While each leaseholder appends the write to its Raft log, it notifies its follower replicas.
5. In each case, as soon as one follower has appended the write to its Raft log (and thus a majority of replicas agree based on identical Raft logs), it notifies the leaseholder and the write is committed on the agreeing replicas.
6. The leaseholders then return acknowledgement of the commit to the gateway node.
7. The gateway node returns the acknowledgement to the client.

<img src="{{ 'images/v21.1/topology-patterns/topology_duplicate_indexes_writes.gif' | relative_url }}" alt="Duplicate Indexes topology" style="max-width:100%" />

### Resiliency

Because this pattern balances the replicas for the table and its secondary indexes across regions, one entire region can fail without interrupting access to the table:

<img src="{{ 'images/v21.1/topology-patterns/topology_duplicate_indexes_resiliency.png' | relative_url }}" alt="Pinned Secondary Indexes topology" style="max-width:100%" />

<!-- However, if an additional machine holding a replica for the table or any of its secondary indexes fails at the same time as the region failure, the range to which the replica belongs becomes unavailable for reads and writes:

<img src="{{ 'images/v21.1/topology-patterns/topology_pinned_index_leaseholders3.png' | relative_url }}" alt="Pinned Secondary Indexes topology" style="max-width:100%" /> -->

## Alternatives

- If reads from a table can be historical (4.8 seconds or more in the past), consider the [Follower Reads](topology-follower-reads.html) pattern.
- If rows in the table, and all latency-sensitive queries, can be tied to specific geographies, consider the [Geo-Partitioned Leaseholders](topology-geo-partitioned-leaseholders.html) pattern. Both patterns avoid extra secondary indexes, which increase data replication and, therefore, higher throughput and less storage.

## Tutorial

For a step-by-step demonstration of how this pattern gets you low-latency reads in a broadly distributed cluster, see the [Low Latency Multi-Region Deployment](demo-low-latency-multi-region-deployment.html) tutorial.  

## See also

{% include {{ page.version.version }}/topology-patterns/see-also.md %}
