---
title: Follower Reads Topology
summary: Guidance on using the follower reads topology in a multi-region deployment.
toc: true
docs_area: deploy
---

In a multi-region deployment, [follower reads]({% link {{ page.version.version }}/follower-reads.md %}) are a good choice for tables with the following requirements:

- Read latency must be low, but write latency can be higher.
- Reads can be historical.
- Rows in the table, and all latency-sensitive queries, **cannot** be tied to specific geographies (e.g., a reference table).
- Table data must remain available during a region failure.

If reads can use stale data, use [stale follower reads]({% link {{ page.version.version }}/follower-reads.md %}#stale-follower-reads). If reads must be exactly up-to-date, use [global tables]({% link {{ page.version.version }}/global-tables.md %}) to achieve [strong follower reads]({% link {{ page.version.version }}/follower-reads.md %}#follower-read-types). Up-to-date reads are required by tables referenced by [foreign keys]({% link {{ page.version.version }}/foreign-key.md %}), for example.

## Before you begin



### Fundamentals

{% include {{ page.version.version }}/topology-patterns/fundamentals.md %}

### Cluster setup

{% include {{ page.version.version }}/topology-patterns/multi-region-cluster-setup.md %}

## Configuration

With each node started with the [`--locality`]({% link {{ page.version.version }}/cockroach-start.md %}#locality) flag specifying its region and zone combination, CockroachDB will balance the replicas for a table across the three regions:

<img src="{{ 'images/v25.4/topology-patterns/topology_follower_reads1.png' | relative_url }}" alt="Follower reads table replication" style="max-width:100%" />

### Summary

You configure your application to use [follower reads]({% link {{ page.version.version }}/follower-reads.md %}) by adding an [`AS OF SYSTEM TIME`]({% link {{ page.version.version }}/as-of-system-time.md %}) clause when reading from the table. With this clause CockroachDB reads slightly historical data from the closest replica so as to avoid being routed to the leaseholder, which may be in an entirely different region. Writes, however, will still leave the region to get consensus for the table.

### Steps

1. Create the `postal_codes` table:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE TABLE postal_codes (
        id INT PRIMARY KEY,
        code STRING
    );
    ~~~

1. Insert data into the `postal_codes` table:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > INSERT INTO postal_codes (ID, code) VALUES (1, '10001'), (2, '10002'), (3, '10003'), (4,'60601'), (5,'60602'), (6,'60603'), (7,'90001'), (8,'90002'), (9,'90003');
    ~~~

1. Decide which type of follower read to perform: exact staleness or  bounded staleness. For more information about when to use each type of read, see [when to use exact staleness reads]({% link {{ page.version.version }}/follower-reads.md %}#when-to-use-exact-staleness-reads) and [when to use bounded staleness reads]({% link {{ page.version.version }}/follower-reads.md %}#when-to-use-bounded-staleness-reads).
    - To use [exact staleness follower reads]({% link {{ page.version.version }}/follower-reads.md %}#exact-staleness-reads), configure your app to use [`AS OF SYSTEM TIME`]({% link {{ page.version.version }}/as-of-system-time.md %}) with the [`follower_read_timestamp()` function]({% link {{ page.version.version }}/functions-and-operators.md %}) whenever reading from the table:

        {% include_cached copy-clipboard.html %}
        ~~~ sql
        > SELECT code FROM postal_codes
            AS OF SYSTEM TIME follower_read_timestamp()
                    WHERE id = 5;
        ~~~

        You can also set the `AS OF SYSTEM TIME` value for all operations in a read-only transaction:

        {% include_cached copy-clipboard.html %}
        ~~~ sql
        > BEGIN;

        SET TRANSACTION AS OF SYSTEM TIME follower_read_timestamp();

          SELECT code FROM postal_codes
            WHERE id = 5;

          SELECT code FROM postal_codes
            WHERE id = 6;

        COMMIT;
        ~~~

        {{site.data.alerts.callout_success}}
        Using the [`SET TRANSACTION`]({% link {{ page.version.version }}/set-transaction.md %}#use-the-as-of-system-time-option) statement as shown in the preceding example will make it easier to use exact staleness follower reads from [drivers and ORMs]({% link {{ page.version.version }}/install-client-drivers.md %}).
        {{site.data.alerts.end}}
    - To use [bounded staleness follower reads]({% link {{ page.version.version }}/follower-reads.md %}#bounded-staleness-reads), configure your app to use [`AS OF SYSTEM TIME`]({% link {{ page.version.version }}/as-of-system-time.md %}) with the [`with_min_timestamp()` or `with_max_staleness()` function]({% link {{ page.version.version }}/functions-and-operators.md %}#date-and-time-functions) whenever reading from the table. Note that only single-row point reads in single-statement (implicit) transactions are supported.

        {% include_cached copy-clipboard.html %}
        ~~~ sql
        SELECT code FROM postal_codes AS OF SYSTEM TIME with_max_staleness('10s') where id = 5;
        ~~~

## Characteristics

### Latency

#### Reads

Reads retrieve historical data from the closest replica and, therefore, never leave the region. This makes read latency very low but slightly stale.

For example, in the following diagram:

1. The read request in `us-central` reaches the regional load balancer.
1. The load balancer routes the request to a gateway node.
1. The gateway node routes the request to the closest replica for the table. In this case, the replica is *not* the leaseholder.
1. The replica retrieves the results as of your preferred staleness interval in the past and returns to the gateway node.
1. The gateway node returns the results to the client.

<img src="{{ 'images/v25.4/topology-patterns/topology_follower_reads_reads.png' | relative_url }}" alt="Follower reads topology reads" style="max-width:100%" />

#### Writes

The replicas for the table are spread across all 3 regions, so writes involve multiple network hops across regions to achieve consensus. This increases write latency significantly.

For example, in the following animation:

1. The write request in `us-central` reaches the regional load balancer.
1. The load balancer routes the request to a gateway node.
1. The gateway node routes the request to the leaseholder replica for the table in `us-east`.
1. Once the leaseholder has appended the write to its Raft log, it notifies its follower replicas.
1. As soon as one follower has appended the write to its Raft log (and thus a majority of replicas agree based on identical Raft logs), it notifies the leaseholder and the write is committed on the agreeing replicas.
1. The leaseholder then returns acknowledgement of the commit to the gateway node.
1. The gateway node returns the acknowledgement to the client.

<img src="{{ 'images/v25.4/topology-patterns/topology_follower_reads_writes.gif' | relative_url }}" alt="Follower reads topology writes" style="max-width:100%" />

### Resiliency

Because this pattern balances the replicas for the table across regions, one entire region can fail without interrupting access to the table:

<img src="{{ 'images/v25.4/topology-patterns/topology_follower_reads_resiliency.png' | relative_url }}" alt="Follower reads topology region failure" style="max-width:100%" />

## See also

{% include {{ page.version.version }}/topology-patterns/see-also.md %}
