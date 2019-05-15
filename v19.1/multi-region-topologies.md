---
title: Multi-Region Topologies
summary: Common cluster topology patterns with setup examples and performance considerations.
toc: true
toc_not_nested: true
---

When your clients are in multiple geographic regions, it is important to deploy your cluster across regions properly and then carefully choose the right topology pattern for each of your tables. Not doing so can result in unexpected latency and resiliency issues.

{{site.data.alerts.callout_info}}
Multi-region patterns are almost always table-specific. For example, you might use the [Geo-Partitioning](multi-region-topologies.html#geo-partitioning-pattern) pattern for frequently updated tables that are geographically specific and the [Leaseholder Preferences](multi-region-topologies.html#leaseholder-preferences-pattern) pattern for infrequently updated tables (e.g., reference tables) that are not tied to geography.
{{site.data.alerts.end}}

## Prerequisites

- Before choosing a topology pattern:
    - Review how data is replicated and distributed across a cluster, and how this affects performance. It is especially important to understand the concept of the "leaseholder". For a summary, see [Reads and Writes in CockroachDB](architecture/reads-and-writes-overview.html). For a deeper dive, see the [CockroachDB Architecture](architecture/overview.html) documentation.
    - Review the concept of [locality](start-a-node.html#locality), which makes CockroachDB aware of the location of nodes and able to intelligently place and balance data based on how you define [replication controls](configure-replication-zones.html).
- Before deploying a multi-region cluster to production:
    - Review the recommendations and requirements in our [Production Checklist](recommended-production-settings.html).
    - These topologies don't account for hardware specifications, so be sure to follow our [hardware recommendations](recommended-production-settings.html#hardware) and perform a POC to properly size hardware for your use case.
    - Adopt relevant [SQL Best Practices](performance-best-practices-overview.html) to ensure optimal performance.

## Cluster Setup

Each multi-region topology pattern assumes the following setup:

<img src="{{ 'images/v19.1/topology_multi-region_hardware.png' | relative_url }}" alt="Pinned Secondary Indexes topology" style="max-width:100%" />

- **Hardware**
    - 3 regions with 3 AZs per region
    - 9+ VMs evenly distributed across AZs
    - Region-specific app instances and load balancers
        - Each load balancer redirects to CockroachDB nodes in its region
        - When CockroachDB nodes are unavailable in a region, the load balancer redirects to nodes in other regions

- **Cluster**
    - Each node is started with the [`--locality`](start-a-node.html#locality) flag specifying its region and AZ combination, e.g.:

        {% include copy-clipboard.html %}
        ~~~ shell
        # Example start command for node in the west1 AZ of the us-west region:
        $ cockroach start \
        --locality=region=us-west,zone=west1 \
        --certs-dir=certs \
        --advertise-addr=<node1 internal address> \
        --join=<node1 internal address>:26257,<node2 internal address>:26257,<node3 internal address>:26257 \        
        --cache=.25 \
        --max-sql-memory=.25 \
        --background
        ~~~

## Geo-Partitioning Pattern

This pattern is good choice for tables with the following characteristics:

- The table is read from and written to frequently.
- The table must serve fast reads and writes everywhere.
- Rows in the table can be tied to specific geographies, e.g., city, state, region.

Using this pattern, you design your table schema to allow for [partitioning](partitioning.html#table-creation), often with one column identifying geography as the first column in the table's compound primary key (e.g., region/id). You tell CockroachDB to partition the table and all of its secondary indexes by that geography column, each partition becoming its own range of 3 replicas. You then tell CockroachDB to pin each partition (all of its replicas) to the relevant region. This means that reads and writes in each region will always have access to the relevant replicas and, therefore, will have low, intra-region latencies.

### Configuration: Geo-Partitioning

<img src="{{ 'images/v19.1/topology_geo-partitioning1.png' | relative_url }}" alt="Geo-partitioning topology" style="max-width:100%" />

Assuming you have a [cluster deployed across multiple regions](#cluster-setup) and a table and secondary index like the following:

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
> CREATE INDEX users_last_name_index ON users (last_name);
~~~

1. Partition the table by `city`. For example, assuming there are three possible `city` values, `los angeles`, `chicago`, and `new york`:

    {% include copy-clipboard.html %}
    ~~~ sql
    > ALTER TABLE users PARTITION BY LIST (region) (
        PARTITION la VALUES IN ('los angeles'),
        PARTITION chicago VALUES IN ('chicago'),
        PARTITION ny VALUES IN ('new york')
    );
    ~~~

    This creates a distinct range for each partition of the table.

2. Partition the secondary index by `city` as well:

    {% include copy-clipboard.html %}
    ~~~ sql
    > ALTER INDEX users_last_name_index PARTITION BY LIST (region) (
        PARTITION la_idx VALUES IN ('los angeles'),
        PARTITION chicago_idx VALUES IN ('chicago'),
        PARTITION ny_idx VALUES IN ('new york')
    );
    ~~~

    This creates a distinct range for each partition of the secondary index.

3. For each partition of the table, [create a replication zone](configure-zone.html) that constrains the partition's replicas to nodes in the relevant region:

    {% include copy-clipboard.html %}
    ~~~ sql
    > ALTER PARTITION la OF TABLE users
        CONFIGURE ZONE USING constraints='[+region=us-west]';
      ALTER PARTITION chicago OF TABLE users
        CONFIGURE ZONE USING constraints='[+region=us-central]';
      ALTER PARTITION ny OF TABLE users
        CONFIGURE ZONE USING constraints='[+region=us-east]';
      ~~~

4. For each partition of the secondary index, [create a replication zone](configure-zone.html) that constrains the partition's replicas to nodes in the relevant region:

    {% include copy-clipboard.html %}
    ~~~ sql
    > ALTER PARTITION la_idx OF TABLE users
        CONFIGURE ZONE USING constraints='[+region=us-west]';
      ALTER PARTITION chicago_idx OF TABLE users
        CONFIGURE ZONE USING constraints='[+region=us-central]';
      ALTER PARTITION ny_idx OF TABLE users
        CONFIGURE ZONE USING constraints='[+region=us-east]';
    ~~~

### Latency: Geo-Partitioning

- **Reads:** Because each partition is constrained to the relevant region (e.g., the `la` and `la_idx` partitions are located in the `us-west` region), reads never have to leave their region to access the relevant leaseholder. This makes reads very fast.

    For example, in the animation below, the read request in each region (1) is routed from the load balancer to a gateway node (2) to the leaseholder for the relevant partition (3) and then back to the gateway node (4), which returns the results to the client (5).

    <img src="{{ 'images/v19.1/topology_geo-partitioning_reads.gif' | relative_url }}" alt="Geo-partitoning topology" style="max-width:100%" />

- **Writes:** Just like for reads, because each partition is constrained to the relevant region (e.g., the `la` and `la_idx` partitions are located in the `us-west` region), writes never have to leave their region to achieve consensus. This makes writes very fast.

    For example, in the animation below, the write request in each region (1) is routed from the load balancer to a gateway node (2) and then to the leaseholder replicas for the relevant table and secondary index partitions (3). Once each leaseholder has appended the write to its Raft log, it notifies its follower replicas (4). In each case, as soon as one follower has appended the write to its Raft log (and thus a majority of replicas agree based on identical Raft logs), it notifies the leader and the write is committed on the agreeing replicas (5). The leaseholders then return acknowledgement of the commit to the gateway node (6), which returns the acknowledgement to the client (7).

    <img src="{{ 'images/v19.1/topology_geo-partitioning_writes.gif' | relative_url }}" alt="Leaseholder preferences topology" style="max-width:100%" />

### Resiliency: Geo-Partitioning

Because each partition is constrained to the relevant region and balanced across the 3 AZs in the region, one AZ can fail per region without interrupting access to the partitions in that region:

<img src="{{ 'images/v19.1/topology_geo-partitioning_resiliency1.png' | relative_url }}" alt="Geo-partitioning topology" style="max-width:100%" />

However, if an additional machine in a region fails at the same time as the AZ failure, and that machine holds a replica for either the table partition or the secondary index partition in the region, the partitions in that region becomes unavailable for reads and writes:

<img src="{{ 'images/v19.1/topology_geo-partitioning_resiliency2.png' | relative_url }}" alt="Geo-partitioning topology" style="max-width:100%" />

## Leaseholder Preferences Pattern

This pattern is good choice for tables with the following characteristics:

- The table is read frequently but updated infrequently (e.g., a reference table).
- The table must serve fast reads everywhere but can serve slower writes.
- Reads must be up-to-date.

Using this pattern, you tell CockroachDB to put the leaseholder for the table itself (also called the primary index) in one region, create 2 secondary indexes on the table, and tell CockroachDB to put the leaseholder for each secondary index in one of the other regions. This means that reads will access the local leaseholder (either for the table itself or for one of the secondary indexes). Writes, however, will still leave the region to get consensus for the table and its secondary indexes.  

{{site.data.alerts.callout_success}}
If reads from a table can be historical (48 seconds or more in the past), consider the [Follower Reads](#follower-reads-pattern) pattern instead; it involves less data replication and, therefore, higher write throughput.
{{site.data.alerts.end}}

### Configuration: Leaseholder Preferences

<img src="{{ 'images/v19.1/topology_leaseholder_preferences1.png' | relative_url }}" alt="Leaseholder preferences topology" style="max-width:100%" />

Assuming you have a [cluster deployed across multiple regions](#cluster-setup) and a table like the following:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE postal_codes (
    id INT PRIMARY KEY,
    code STRING,
);
~~~

1. [Create a replication zone](configure-zone.html) for the table and set a leaseholder preference telling CockroachDB to put the leaseholder for the table in one of the regions, for example `us-west`:

    {% include copy-clipboard.html %}
    ~~~ sql
    > ALTER TABLE postal_codes
        CONFIGURE ZONE USING lease_preferences = '[[+region=us-west]]';
    ~~~

2. [Create two secondary indexes](create-index.html) on the table, including all of the columns you wish to read either in the key or in the key and a [`STORING`](create-index.html#store-columns) clause:

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

3. [Create a replication zone](configure-zone.html) for each secondary index, in each case setting a leaseholder preference telling CockroachDB to put the leaseholder for the index in a distinct region:

    {% include copy-clipboard.html %}
    ~~~ sql
    > ALTER INDEX postal_codes@idx_central
        CONFIGURE ZONE USING lease_preferences = '[[+region=us-central]]';
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > ALTER INDEX postal_codes@idx_east
        CONFIGURE ZONE USING lease_preferences = '[[+region=us-east]]';
    ~~~

### Latency: Leaseholder Preferences

- **Reads:** Reads access the local leaseholder and, therefore, never leave the region. This makes reads very fast.

    For example, in the animation below, the read request in each region (1) is routed from the load balancer to a gateway node (2) to the relevant leaseholder (3) and then back to the gateway node (4), which returns the results to the client (5). In `us-west`, the leaseholder is for the table itself. In the other regions, the leaseholder is for the relevant index, which the [cost-based optimizer](cost-based-optimizer.html) uses due to the leaseholder preferences.

    <img src="{{ 'images/v19.1/topology_leaseholder_preferences_reads.gif' | relative_url }}" alt="Leaseholder preferences topology" style="max-width:100%" />

- **Writes:** The replicas for the table and its secondary indexes are spread across all 3 regions, so writes involve multiple network hops across regions to achieve consensus. This slows down writes significantly.

    For example, in the animation below, the write request in `us-central` (1) is routed from the load balancer to a gateway node (2) and then to the leaseholder replicas for the table and each secondary index (3). Once each leaseholder has appended the write to its Raft log, it notifies its follower replicas (4). In each case, as soon as one follower has appended the write to its Raft log (and thus a majority of replicas agree based on identical Raft logs), it notifies the leader and the write is committed on the agreeing replicas (5). The leaseholders then return acknowledgement of the commit to the gateway node (6), which returns the acknowledgement to the client (7).

    <img src="{{ 'images/v19.1/topology_leaseholder_preferences_writes.gif' | relative_url }}" alt="Leaseholder preferences topology" style="max-width:100%" />

### Resiliency: Leaseholder Preferences

Because this pattern balances the replicas for the table and its secondary indexes across regions, one entire region can fail without interrupting access to the table:

<img src="{{ 'images/v19.1/topology_leaseholder_preferences2.png' | relative_url }}" alt="Leaseholder preferences topology" style="max-width:100%" />

However, if an additional machine holding a replica for the table or any of its secondary indexes fails at the same time as the region failure, the table becomes unavailable for reads and writes:

<img src="{{ 'images/v19.1/topology_leaseholder_preferences3.png' | relative_url }}" alt="Leaseholder preferences topology" style="max-width:100%" />

## Follower Reads Pattern

This pattern is good choice for tables with the following characteristics:

- The table is read frequently but updated infrequently, e.g., a reference table.
- The table must serve fast reads everywhere but can serve slower writes.
- Reads do not have to be up-to-date.

Using this pattern, you enable the [follower reads](follower-reads.html) feature, which tells CockroachDB to allow any replica of a range to serve a read request that is sufficiently in the past (at least 48 seconds). You then configure your application to use the `AS OF SYSTEM TIME` clause when reading from the table. This means that reads will access the closest replica so as to avoid being routed to the leaseholder, which may be in an entirely different region. Writes, however, will still leave the region to get consensus for the table.  

{{site.data.alerts.callout_success}}
If reads from a table must be exactly up-to-date, use the [Leaseholder Preferences](#leaseholder-preferences-pattern) pattern instead
{{site.data.alerts.end}}

### Configuration: Follower Reads

<img src="{{ 'images/v19.1/topology_follower_reads1.png' | relative_url }}" alt="Follower reads topology" style="max-width:100%" />

Assuming you have a [cluster deployed across multiple regions](#cluster-setup) and a table like the following:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE postal_codes (
    id INT PRIMARY KEY,
    code STRING,
);
~~~

1. [Enable follower reads](follower-reads.html#enable-disable-follower-reads):

    {% include copy-clipboard.html %}
    ~~~ sql
    > SET CLUSTER SETTING kv.closed_timestamp.follower_reads_enabled = true;
    ~~~

2. Configure your app to use `AS OF SYSTEM TIME experimental_follower_read_timestamp()` whenever reading from the table:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SELECT code FROM postal_codes
        WHERE id = 5
        AS OF SYSTEM TIME experimental_follower_read_timestamp();
    ~~~

    The `experimental_follower_read_timestamp()` [function](functions-and-operators.html) will always set the [`AS OF SYSTEM TIME`](as-of-system-time.html) value to the minimum required for follower reads.

    You can also set the `AS OF SYSTEM TIME` value for all operations in a read-only transaction:

    {% include copy-clipboard.html %}
    ~~~ sql
    > BEGIN AS OF SYSTEM TIME experimental_follower_read_timestamp();

      SELECT code FROM postal_codes
        WHERE id = 5;

      SELECT code FROM postal_codes
        WHERE id = 6;

      COMMIT;
    ~~~

### Latency: Follower Reads

- **Reads:** Reads retrieve historical data from the closest replica and, therefore, never leave the region. This makes reads very fast but slightly stale.

    For example, in the animation below, the read request in each region (1) is routed from the load balancer to a gateway node (2) to the closest replica for the table (3) and then back to the gateway node (4), which returns the results to the client (5).

    <img src="{{ 'images/v19.1/topology_follower_reads_reads.gif' | relative_url }}" alt="Leaseholder preferences topology" style="max-width:100%" />

- **Writes:** The replicas for the table are spread across all 3 regions, so writes involve multiple network hops across regions to achieve consensus. This slows down writes significantly.

    For example, in the animation below, the write request in `us-central` (1) is routed from the load balancer to a gateway node (2) and then to the leaseholder replica for the table  in `us-east` (3). Once the leaseholder has appended the write to its Raft log, it notifies its follower replicas (4). As soon as one follower has appended the write to its Raft log (and thus a majority of replicas agree based on identical Raft logs), it notifies the leader and the write is committed on the agreeing replicas (5). The leaseholder then returns acknowledgement of the commit to the gateway node (6), which returns the acknowledgement to the client (7).

    <img src="{{ 'images/v19.1/topology_follower_reads_writes.gif' | relative_url }}" alt="Leaseholder preferences topology" style="max-width:100%" />

### Resiliency: Follower Reads

Because this pattern balances the replicas for the table across regions, one entire region can fail without interrupting access to the table:

<img src="{{ 'images/v19.1/topology_follower_reads2.png' | relative_url }}" alt="Leaseholder preferences topology" style="max-width:100%" />

However, if an additional machine holding a replica for the table fails at the same time as the region failure, the table becomes unavailable for reads and writes:

<img src="{{ 'images/v19.1/topology_follower_reads3.png' | relative_url }}" alt="Leaseholder preferences topology" style="max-width:100%" />

## Follow-the-Workload Pattern

This pattern is a good choice for tables with the following characteristics:

- The table is active mostly in one region at a time, e.g., following the sun.
- In the active region, the table must serve fast reads but can serve slower writes.
- In non-active regions, the table can serve slower reads and writes.

Aside from [deploying a cluster across multiple regions](#cluster-setup) properly, this pattern requires no extra configuration. CockroachDB will balance the replicas for a table across the three regions and will assign the range lease to the replica in the region with the greatest demand at any given time (the [follow-the-workload](demo-follow-the-workload.html) feature). This means that reads in the active region will be fast while reads in other regions will be slower due to having to leave the region to reach the leaseholder. Writes will be slower as well due to always involving replicas in multiple regions.

{{site.data.alerts.callout_success}}
If read performance is your main focus for a table, but you want fast reads everywhere instead of just in the most active region, consider the [Leaseholder Preferences](#leaseholder-preferences-pattern) or [Follower Reads](#follower-reads-pattern) pattern instead.
{{site.data.alerts.end}}

### Configuration: Follow-the-Workload

<img src="{{ 'images/v19.1/topology_follower_reads1.png' | relative_url }}" alt="Follower reads topology" style="max-width:100%" />

This pattern requires only that you have [deployed your cluster properly across multiple regions](#cluster-setup), with each node started with the [`--locality`](start-a-node.html#locality) flag specifying its region and AZ combination. In this case, CockroachDB will place one replica in each region and will assign the range lease to the replica in the region with the greatest demand at any give time.

### Latency: Follow-the-Workload

- **Reads:** Reads in the region with the most demand will access the local leaseholder and, therefore, never leave the region. This makes reads very fast in the currently most active region. Reads in other regions, however, will be routed to the leaseholder in a different region and, thus, will be slower.

    For example, in the animation below, the most active region is `us-east` and, thus, the table's leaseholder is in that region. The read request in each region (1) is routed from the load balancer to a gateway node (2) to the leaseholder replica in `us-east` (3) and then back to the gateway node (4), which returns the results to the client (5). In this case, reads in the `us-east` remain in the region and are faster than reads in other regions.

    <img src="{{ 'images/v19.1/topology_follow_the_workload_reads.gif' | relative_url }}" alt="Follow-the-workload topology" style="max-width:100%" />

- **Writes:** The replicas for the table are spread across all 3 regions, so writes involve multiple network hops across regions to achieve consensus. This slows down writes significantly.

    For example, in the animation below, assuming the most active region is still `us-east`, the write request (1) is routed from the load balancer to a gateway node (2) and then to the leaseholder replica (3). Once the leaseholder has appended the write to its Raft log, it notifies its follower replicas (4). As soon as one follower has appended the write to its Raft log (and thus a majority of replicas agree based on identical Raft logs), it notifies the leader and the write is committed on the agreeing replicas (5). The leaseholder then returns acknowledgement of the commit to the gateway node (6), which returns the acknowledgement to the client (7).

    <img src="{{ 'images/v19.1/topology_follow_the_workload_writes.gif' | relative_url }}" alt="Follow-the-workload topology" style="max-width:100%" />

### Resiliency: Follow-the-Workload

Because this pattern balances the replicas for the table across regions, one entire region can fail without interrupting access to the table:

<img src="{{ 'images/v19.1/topology_follower_reads2.png' | relative_url }}" alt="Leaseholder preferences topology" style="max-width:100%" />

However, if an additional machine holding a replica for the table fails at the same time as the region failure, the table becomes unavailable for reads and writes:

<img src="{{ 'images/v19.1/topology_follower_reads3.png' | relative_url }}" alt="Leaseholder preferences topology" style="max-width:100%" />
