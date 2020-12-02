---
title: Follower Reads Topology
summary: Guidance on using the follower reads topology in a multi-region deployment.
toc: true
---

In a multi-region deployment, the follower reads pattern is a good choice for tables with the following requirements:

- Read latency must be low, but write latency can be higher.
- Reads can be historical (4.8 seconds or more in the past).
- Rows in the table, and all latency-sensitive queries, **cannot** be tied to specific geographies (e.g., a reference table).
- Table data must remain available during a region failure.

{{site.data.alerts.callout_success}}
This pattern is compatible with all of the other multi-region patterns except [Geo-Partitioned Replicas](topology-geo-partitioned-replicas.html). However, if reads from a table must be exactly up-to-date, use the [Duplicate Indexes](topology-duplicate-indexes.html) or [Geo-Partitioned Leaseholders](topology-geo-partitioned-leaseholders.html) pattern instead. Up-to-date reads are required by tables referenced by [foreign keys](foreign-key.html), for example.
{{site.data.alerts.end}}

## Prerequisites

### Fundamentals

{% include {{ page.version.version }}/topology-patterns/fundamentals.md %}

### Cluster setup

{% include {{ page.version.version }}/topology-patterns/multi-region-cluster-setup.md %}

## Configuration

{{site.data.alerts.callout_info}}
Follower reads requires an [Enterprise license](https://www.cockroachlabs.com/get-cockroachdb).
{{site.data.alerts.end}}

### Summary

Using this pattern, you configure your application to use the [follower reads](follower-reads.html) feature by adding an `AS OF SYSTEM TIME` clause when reading from the table. This tells CockroachDB to read slightly historical data from the closest replica so as to avoid being routed to the leaseholder, which may be in an entirely different region. Writes, however, will still leave the region to get consensus for the table.  

### Steps

<img src="{{ 'images/v21.1/topology-patterns/topology_follower_reads1.png' | relative_url }}" alt="Follower reads topology" style="max-width:100%" />

Assuming you have a [cluster deployed across three regions](#cluster-setup) and a table like the following:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE postal_codes (
    id INT PRIMARY KEY,
    code STRING
);
~~~

Insert some data:

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO postal_codes (ID, code) VALUES (1, '10001'), (2, '10002'), (3, '10003'), (4,'60601'), (5,'60602'), (6,'60603'), (7,'90001'), (8,'90002'), (9,'90003');
~~~

1. If you do not already have one, [request a trial Enterprise license](https://www.cockroachlabs.com/get-cockroachdb).

2. Configure your app to use `AS OF SYSTEM TIME follower_read_timestamp()` whenever reading from the table:

    {{site.data.alerts.callout_info}}
    The `follower_read_timestamp()` [function](functions-and-operators.html) will set the [`AS OF SYSTEM TIME`](as-of-system-time.html) value to the minimum required for follower reads.
    {{site.data.alerts.end}}

    {% include copy-clipboard.html %}
    ~~~ sql
    > SELECT code FROM postal_codes
        AS OF SYSTEM TIME follower_read_timestamp()
                WHERE id = 5;
    ~~~

    Alternately, instead of modifying individual read queries on the table, you can set the `AS OF SYSTEM TIME` value for all operations in a read-only transaction:

    {% include copy-clipboard.html %}
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
Using the [`SET TRANSACTION`](set-transaction.html#use-the-as-of-system-time-option) statement as shown in the example above will make it easier to use the follower reads feature from [drivers and ORMs](install-client-drivers.html).
{{site.data.alerts.end}}

## Characteristics

### Latency

#### Reads

Reads retrieve historical data from the closest replica and, therefore, never leave the region. This makes read latency very low but slightly stale.

For example, in the animation below:

1. The read request in `us-central` reaches the regional load balancer.
2. The load balancer routes the request to a gateway node.
3. The gateway node routes the request to the closest replica for the table. In this case, the replica is *not* the leaseholder.
4. The replica retrieves the results as of 4.8 seconds in the past and returns to the gateway node.
5. The gateway node returns the results to the client.

<img src="{{ 'images/v21.1/topology-patterns/topology_follower_reads_reads.png' | relative_url }}" alt="Follower reads topology" style="max-width:100%" />

#### Writes

The replicas for the table are spread across all 3 regions, so writes involve multiple network hops across regions to achieve consensus. This increases write latency significantly.

For example, in the animation below:

1. The write request in `us-central` reaches the regional load balancer.
2. The load balancer routes the request to a gateway node.
3. The gateway node routes the request to the leaseholder replica for the table in `us-east`.
4. Once the leaseholder has appended the write to its Raft log, it notifies its follower replicas.
5. As soon as one follower has appended the write to its Raft log (and thus a majority of replicas agree based on identical Raft logs), it notifies the leaseholder and the write is committed on the agreeing replicas.
6. The leaseholder then returns acknowledgement of the commit to the gateway node.
7. The gateway node returns the acknowledgement to the client.

<img src="{{ 'images/v21.1/topology-patterns/topology_follower_reads_writes.gif' | relative_url }}" alt="Follower reads topology" style="max-width:100%" />

### Resiliency

Because this pattern balances the replicas for the table across regions, one entire region can fail without interrupting access to the table:

<img src="{{ 'images/v21.1/topology-patterns/topology_follower_reads_resiliency.png' | relative_url }}" alt="Follower reads topology" style="max-width:100%" />

<!-- However, if an additional machine holding a replica for the table fails at the same time as the region failure, the range to which the replica belongs becomes unavailable for reads and writes:

<img src="{{ 'images/v21.1/topology-patterns/topology_follower_reads3.png' | relative_url }}" alt="Follower reads topology" style="max-width:100%" /> -->

## See also

{% include {{ page.version.version }}/topology-patterns/see-also.md %}
