---
title: Follower Reads
summary: To reduce latency for read queries, you can choose to have the closest node serve the request using the follower reads feature.
toc: true
---

<span class="version-tag">New in v19.1:</span> To reduce latency for read queries, you can use the follower reads feature, which lets the closest replica serve the read request at the expense of only not guaranteeing that data is up to date.

{{site.data.alerts.callout_danger}}
The follower reads feature is only available to [enterprise](https://www.cockroachlabs.com/product/cockroachdb/) users.
{{site.data.alerts.end}}

## What are Follower reads?

Follower reads are a mechanism to let any replica of a range serve a read request, but are only available for read queries that are sufficiently in the past, i.e., using `AS OF SYSTEM TIME`. Currently, follower reads are available for any read operation at least 48 seconds in the past, though there is active work to reduce that window.

In widely distributed deployments, using follower reads can reduce the latency of read operations (which can also increase throughput) by letting the replica closest to the gateway serve the request, instead of forcing the gateway to communicate with the leaseholder, which could be geographically distant.

To make it easier to know when it's safe for your application to make follower reads, we've also included a convenience function (`experimental_follower_read_timestamp()`) that runs your queries at a time as close as possible to the present time.

## Settings

### Enable/disable follower reads

Use [`SET CLUSTER SETTING`](set-cluster-setting.html) to set `kv.closed_timestamp.follower_reads_enabled` to:

- `true` to enable follower reads _(default)_
- `false` to disable follower reads

{% include_cached copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING kv.closed_timestamp.follower_reads_enabled = false;
~~~

#### When to use follower reads

Follower reads return consistent historical reads; currently a minimum of 48 seconds in the past, though we are actively working on reducing that number.

As long as your `SELECT` operations can tolerate slightly outdated data, Follower reads can reduce read latencies and increase throughput.

#### When not to use follower reads

You should not use follower reads when you need up-to-date data.

### Make follower read-compatible queries

Any `SELECT` statement with an `AS OF SYSTEM TIME` value at least 48 seconds in the past can be served by any replica (i.e., can be a Follower Read).

To simplify this calculation, we've added a convenience function that will always set the `AS OF SYSTEM TIME` value to the minimum required for follower reads, `experimental_follower_read_timestamp()`:

``` sql
SELECT ... FROM ... AS OF SYSTEM TIME experimental_follower_read_timestamp();
```

### Make follower read-compatible transactions

You can set the `AS OF SYSTEM TIME` value for all operations in a read-only transaction:

```sql
BEGIN AS OF SYSTEM TIME experimental_follower_read_timestamp();

SAVEPOINT cockroach_restart;

SELECT ...
SELECT ...

COMMIT;
```

## How follower reads works

In CockroachDB's general architecture, all reads are served by a range's [leaseholder](architecture/replication-layer.html#leases), which is a replica elected to coordinate all write operations. Because this node contains information about all of a range's writes, it can also serve reads for the range while still guaranteeing `SERIALIZABLE` isolation. With this architecture, the client might need to communicate with a machine that is far away, creating greater network latencies.

However, if you were to lower the isolation requirements of an operation, it's possible to serve the read from _any_ replica, not only the leaseholder, given that the data can be sufficiently old.

To accomplish this in CockroachDB, we've created a mechanism to let you express that any node can serve the request (`kv.closed_timestamp.follower_reads_enabled`) and that a historical read is sufficient (`AS OF SYSTEM TIME`), given that the argument to `AS OF SYSTEM TIME` is sufficiently in the past (`experimental_follower_read_timestamp()`.

For a more detailed explanation, you can also read the [follower reads RFC](https://github.com/cockroachdb/cockroach/blob/master/docs/RFCS/20180603_follower_reads.md).

### Reading from followers

Each CockroachDB node tracks a property called its "closed timestamp", which means that no new writes can ever be introduced below that timestamp. The closed timestamp advances forward by some target interval behind the current time. If the replica receives a write at a timestamp less than its closed timestamp, it rejects the write.

With follower reads enabled, any replica on a node can serve a read for a key as long as the time at which the operation is performed (i.e., the `AS OF SYSTEM TIME` value) is less or equal to the node's closed timestamp.

### Determining which node to read from

Every node keeps a record of its latency with all other nodes in the system. When a gateway node in cluster with follower reads enabled receives a request to read a key with a sufficiently old `AS OF SYSTEM TIME` value, it forwards the request to the closest node that contains a replica of the data––whether it be a follower or the leaseholder.

### Interactions with long-running writes

Long-running write transactions will create write intents with a timestamp near when the transaction began. When a follower read encounters a write intent, it will often end up in a `Wait Queue`, waiting for the operation to complete; however, this runs counter to the benefit follower reads provides.

To counteract this, you can issue all follower reads in explicit transactions set with `HIGH` priority:

```sql
BEGIN PRIORITY HIGH AS OF SYSTEM TIME experimental_follower_read_timestamp();

SAVEPOINT cockroach_restart;

SELECT ...
SELECT ...

COMMIT;
```

## See Also

- [Cluster Settings Overview](cluster-settings.html)
- [Load-Based Splitting](load-based-splitting.html)
