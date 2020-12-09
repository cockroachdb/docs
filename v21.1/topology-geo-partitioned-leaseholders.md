---
title: Geo-Partitioned Leaseholders Topology
summary: Common cluster topology patterns with setup examples and performance considerations.
toc: true
---

In a multi-region deployment, the geo-partitioned [leaseholders](architecture/replication-layer.html#leases) topology is a good choice for tables with the following requirements:

- Read latency must be low, but write latency can be higher.
- Reads must be up-to-date for business reasons or because the table is referenced by [foreign keys](foreign-key.html).
- Rows in the table, and all latency-sensitive queries, can be tied to specific geographies, e.g., city, state, region.
- Table data must remain available during a region failure.

{{site.data.alerts.callout_success}}
**See It In Action** - Read about how a [large telecom provider](https://www.cockroachlabs.com/case-studies/telecom-provider-replaces-amazon-aurora-with-cockroachdb-to-attain-analways-on-customer-experience/) with millions of customers accross the United States is using the Geo-Partitioned Leaseholders topology in production for strong resiliency and performance.
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

Using this pattern, you design your table schema to allow for [partitioning](partitioning.html#table-creation), with a column identifying geography as the first column in the table's compound primary key (e.g., city/id). You tell CockroachDB to partition the table and all of its secondary indexes by that geography column, each partition becoming its own range of 3 replicas. You then tell CockroachDB to put the leaseholder for each partition in the relevant region (e.g., LA partitions in `us-west`, NY partitions in `us-east`). The other replicas of a partition remain balanced across the other regions. This means that reads in each region will access local leaseholders and, therefore, will have low, intra-region latencies. Writes, however, will leave the region to get consensus and, therefore, will have higher, cross-region latencies.

<img src="{{ 'images/v21.1/topology-patterns/topology_geo-partitioned_leaseholders1.png' | relative_url }}" alt="Geo-partitioned leaseholders topology" style="max-width:100%" />

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
        PARTITION la VALUES IN ('los angeles'),
        PARTITION chicago VALUES IN ('chicago'),
        PARTITION ny VALUES IN ('new york')
    );
    ~~~

    This creates distinct ranges for each partition of the secondary index.

4. For each partition of the table and its secondary index, [create a replication zone](configure-zone.html) that tells CockroachDB to put the partition's leaseholder in the relevant region:

    {% include copy-clipboard.html %}
    ~~~ sql
    > ALTER PARTITION la OF INDEX users@*
        CONFIGURE ZONE USING
          num_replicas = 3,
          constraints = '{"+region=us-west":1}',
          lease_preferences = '[[+region=us-west]]';
      ALTER PARTITION chicago OF INDEX users@*
        CONFIGURE ZONE USING
          num_replicas = 3,
          constraints = '{"+region=us-central":1}',
          lease_preferences = '[[+region=us-central]]';
      ALTER PARTITION ny OF INDEX users@*
        CONFIGURE ZONE USING
          num_replicas = 3,
          constraints = '{"+region=us-east":1}',
          lease_preferences = '[[+region=us-east]]';
      ~~~

5. To confirm that partitions are in effect, you can use the [`SHOW CREATE TABLE`](show-create.html) or [`SHOW PARTITIONS`](show-partitions.html) statement:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SHOW CREATE TABLE users;
    ~~~

    ~~~
      table_name |                                          create_statement
    +------------+----------------------------------------------------------------------------------------------------+
      users      | CREATE TABLE users (
                 |     id UUID NOT NULL DEFAULT gen_random_uuid(),
                 |     city STRING NOT NULL,
                 |     first_name STRING NOT NULL,
                 |     last_name STRING NOT NULL,
                 |     address STRING NOT NULL,
                 |     CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC),
                 |     INDEX users_last_name_index (city ASC, last_name ASC) PARTITION BY LIST (city) (
                 |         PARTITION la VALUES IN (('los angeles')),
                 |         PARTITION chicago VALUES IN (('chicago')),
                 |         PARTITION ny VALUES IN (('new york'))
                 |     ),
                 |     FAMILY "primary" (id, city, first_name, last_name, address)
                 | ) PARTITION BY LIST (city) (
                 |     PARTITION la VALUES IN (('los angeles')),
                 |     PARTITION chicago VALUES IN (('chicago')),
                 |     PARTITION ny VALUES IN (('new york'))
                 | );
                 | ALTER PARTITION chicago OF INDEX defaultdb.public.users@primary CONFIGURE ZONE USING
                 |     num_replicas = 3,
                 |     constraints = '{+region=us-central: 1}',
                 |     lease_preferences = '[[+region=us-central]]';
                 | ALTER PARTITION la OF INDEX defaultdb.public.users@primary CONFIGURE ZONE USING
                 |     num_replicas = 3,
                 |     constraints = '{+region=us-west: 1}',
                 |     lease_preferences = '[[+region=us-west]]';
                 | ALTER PARTITION ny OF INDEX defaultdb.public.users@primary CONFIGURE ZONE USING
                 |     num_replicas = 3,
                 |     constraints = '{+region=us-east: 1}',
                 |     lease_preferences = '[[+region=us-east]]';
                 | ALTER PARTITION chicago OF INDEX defaultdb.public.users@users_last_name_index CONFIGURE ZONE USING
                 |     num_replicas = 3,
                 |     constraints = '{+region=us-central1: 1}',
                 |     lease_preferences = '[[+region=us-central1]]';
                 | ALTER PARTITION la OF INDEX defaultdb.public.users@users_last_name_index CONFIGURE ZONE USING
                 |     num_replicas = 3,
                 |     constraints = '{+region=us-west: 1}',
                 |     lease_preferences = '[[+region=us-west]]';
                 | ALTER PARTITION ny OF INDEX defaultdb.public.users@users_last_name_index CONFIGURE ZONE USING
                 |     num_replicas = 3,
                 |     constraints = '{+region=us-east: 1}',
                 |     lease_preferences = '[[+region=us-east]]'
    (1 row)
    ~~~    

    {% include copy-clipboard.html %}
    ~~~ sql
    > SHOW PARTITIONS FROM TABLE users;
    ~~~

    ~~~
      database_name | table_name | partition_name | parent_partition | column_names |         index_name          | partition_value |                  zone_config
    +---------------+------------+----------------+------------------+--------------+-----------------------------+-----------------+-----------------------------------------------+
      defaultdb     | users      | la             | NULL             | city         | users@primary               | ('los angeles') | num_replicas = 3,
                    |            |                |                  |              |                             |                 | constraints = '{+region=us-west1: 1}',
                    |            |                |                  |              |                             |                 | lease_preferences = '[[+region=us-west1]]'
      defaultdb     | users      | chicago        | NULL             | city         | users@primary               | ('chicago')     | num_replicas = 3,
                    |            |                |                  |              |                             |                 | constraints = '{+region=us-central1: 1}',
                    |            |                |                  |              |                             |                 | lease_preferences = '[[+region=us-central1]]'
      defaultdb     | users      | ny             | NULL             | city         | users@primary               | ('new york')    | num_replicas = 3,
                    |            |                |                  |              |                             |                 | constraints = '{+region=us-east1: 1}',
                    |            |                |                  |              |                             |                 | lease_preferences = '[[+region=us-east1]]'
      defaultdb     | users      | la             | NULL             | city         | users@users_last_name_index | ('los angeles') | num_replicas = 3,
                    |            |                |                  |              |                             |                 | constraints = '{+region=us-west1: 1}',
                    |            |                |                  |              |                             |                 | lease_preferences = '[[+region=us-west1]]'
      defaultdb     | users      | chicago        | NULL             | city         | users@users_last_name_index | ('chicago')     | num_replicas = 3,
                    |            |                |                  |              |                             |                 | constraints = '{+region=us-central1: 1}',
                    |            |                |                  |              |                             |                 | lease_preferences = '[[+region=us-central1]]'
      defaultdb     | users      | ny             | NULL             | city         | users@users_last_name_index | ('new york')    | num_replicas = 3,
                    |            |                |                  |              |                             |                 | constraints = '{+region=us-east1: 1}',
                    |            |                |                  |              |                             |                 | lease_preferences = '[[+region=us-east1]]'
    (6 rows)
    ~~~

{{site.data.alerts.callout_success}}
As you scale and add more cities, you can repeat steps 2 and 3 with the new complete list of cities to re-partition the table and its secondary indexes, and then repeat step 4 to create replication zones for the new partitions.
{{site.data.alerts.end}}

{% include {{page.version.version}}/sql/crdb-internal-partitions.md %}

## Characteristics

### Latency

#### Reads

Because each partition's leaseholder is constrained to the relevant region (e.g., the `la` partitions' leaseholders are located in the `us-west` region), reads that specify the local region key access the relevant leaseholder locally. This makes read latency very low, with the exception of reads that do not specify a region key or that refer to a partition in another region.

For example, in the animation below:

1. The read request in `us-west` reaches the regional load balancer.
2. The load balancer routes the request to a gateway node.
3. The gateway node routes the request to the leaseholder for the relevant partition.
4. The leaseholder retrieves the results and returns to the gateway node.
5. The gateway node returns the results to the client.

<img src="{{ 'images/v21.1/topology-patterns/topology_geo-partitioned_leaseholders_reads.png' | relative_url }}" alt="Geo-partitoned leaseholders topology" style="max-width:100%" />

#### Writes

Just like for reads, because each partition's leaseholder is constrained to the relevant region (e.g., the `la` partitions' leaseholders are located in the `us-west` region), writes that specify the local region key access the relevant leaseholder replicas locally. However, a partition's other replicas are spread across the other regions, so writes involve multiple network hops across regions to achieve consensus. This increases write latency significantly.

For example, in the animation below:

1. The write request in `us-west` reaches the regional load balancer.
2. The load balancer routes the request to a gateway node.
3. The gateway node routes the request to the leaseholder replicas for the relevant table and secondary index partitions.
4. While each leaseholder appends the write to its Raft log, it notifies its follower replicas, which are in the other regions.
5. In each case, as soon as one follower has appended the write to its Raft log (and thus a majority of replicas agree based on identical Raft logs), it notifies the leaseholder and the write is committed on the agreeing replicas.
6. The leaseholders then return acknowledgement of the commit to the gateway node.
7. The gateway node returns the acknowledgement to the client.

<img src="{{ 'images/v21.1/topology-patterns/topology_geo-partitioned_leaseholders_writes.gif' | relative_url }}" alt="Geo-partitoned leaseholders topology" style="max-width:100%" />

### Resiliency

Because this pattern balances the replicas for each partition across regions, one entire region can fail without interrupting access to any partitions. In this case, if any range loses its leaseholder in the region-wide outage, CockroachDB makes one of the range's other replicas the leaseholder:  

<img src="{{ 'images/v21.1/topology-patterns/topology_geo-partitioned_leaseholders_resiliency1.png' | relative_url }}" alt="Geo-partitioning topology" style="max-width:100%" />

<!-- However, if an additional machine fails at the same time as the region failure, the partitions that lose consensus become unavailable for reads and writes:

<img src="{{ 'images/v21.1/topology-patterns/topology_geo-partitioned_leaseholders_resiliency2.png' | relative_url }}" alt="Geo-partitioning topology" style="max-width:100%" /> -->

## Alternatives

- If reads from a table can be historical (4.8 seconds or more in the past), consider the [Follower Reads](topology-follower-reads.html) pattern.
- If rows in the table, and all latency-sensitive queries, **cannot** be tied to specific geographies, consider the [Duplicate Indexes](topology-duplicate-indexes.html) pattern.

## See also

{% include {{ page.version.version }}/topology-patterns/see-also.md %}
