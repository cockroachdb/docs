---
title: Follower Reads
summary: To reduce latency for `SELECT` operations, you can choose to have the closest node serve the request using the "Follower Reads" feature.
toc: true
---

<span class="version-tag">New in v2.2:</span> To reduce latency for `SELECT` operations, you can choose to have the closest node serve the request using the "Follower Reads" feature. The trade-off here is that the response might not have the most recent version of the data, though the data will be consistent at the point in time the read is served from.

{{site.data.alerts.callout_danger}}
The Follower Read feature is only available to [enterprise](https://www.cockroachlabs.com/product/cockroachdb/) users.
{{site.data.alerts.end}}

## Settings

### Enable/disable Follower Reads

Use [`SET CLUSTER SETTING`](set-cluster-setting.html) to set `kv.range_split.by_load_enabled` to:

- `false` to disable follower reads _(default)_
- `true` to enable follower reads 

{% include copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING kv.closed_timestamp.follower_reads_enabled = true;
~~~

#### When to use Follower Reads

Follower Reads return consistent historical reads; currently a minimum of 48 seconds in the past, though we are actively working on reducing that number.

As long as your `SELECT` operations can tolerate slightly outdated data, Follower Reads can reduce read latencies.

#### When not to use Follower Reads

Long-running write operations can have negative interactions with Follower Reads because the Follower Read can either get blocked by the long-running write or cause it to be retried. However, this can be mitigated by placing Follower Reads in `HIGH` priority transactions and using [transaction retries](transactions.html#client-side-transaction-retries) for the write operation.

### Make Follower Read-compatible queries

Any `SELECT` statement with an `AS OF SYSTEM TIME` value at least 48 seconds in the past can be served by any replica (i.e., can be a Follower Read).

To simplify this calculation, we've added a convenience function that will always set the `AS OF SYSTEM TIME` value to the minimum required for follower reads, `experimental_follower_read_timestamp()`:

``` sql
SELECT ... FROM ... AS OF SYSTEM TIME(experimental_follower_read_timestamp())
```

### Make Follower Read-compatible transactions

You can set the `AS OF SYSTEM TIME` value for all operations in a read-only transaction:

```sql
BEGIN AS OF SYSTEM TIME(experimental_follower_read_timestamp());

SAVEPOINT cockroach_restart;

SELECT ...
SELECT ...

COMMIT;
```

## How Follower Reads works

In CockroachDB's general architecture, all reads are served by a range's [leaseholder](architecture/replication-layer.html#leases), which is a replica elected to coordinate all write operations. Because this node contains information about all of a range's writes, it can also serve reads for the range while still guaranteeing `SERIALIZABLE` isolation. With this architecture, the client might need to communicate with a machine that is far away, creating greater network latencies.

However, if you were lower the isolation requirements of an operation, it's possible to serve the read from _any_ replica, not only the leaseholder. To accomplish this is CockroachDB, we've create a mechanism to let you express that a historical read is sufficient (`AS OF SYSTEM TIME`) and that any node can server the request (`kv.closed_timestamp.follower_reads_enabled`).

### Reading from followers

Each CockroachDB node tracks a property called its "closed timestamp", which means that no new writes can ever be introduced below that timestamp. The closed timestamp advances forward every 30 seconds. If the replica receives a write at a timestamp less than its closed timestamp, it rejects the write.

With follower reads enabled, any replica on a node can serve a read for a key as long as the time at which the operation is performed (i.e. the `AS OF SYSTEM TIME` value) is less or equal to the node's closed timestamp.

### Determining which node to read from

Every node keeps a record of its latency with all other nodes in the system. When a gateway node in cluster with follower reads enabled receives a request to read a key with a sufficiently old `AS OF SYSTEM TIME` value, it forwards the request to the closest node that contains a replica of the data––whether it be a follower or the leaseholder.

### Interactions with long-running writes

Long-running write transactions will create write intents with a timestamp near when the transaction began. When a Follower Read encounters a write intent, it will often end up in a `Wait Queue`, waiting for the operation to complete; however, this runs counter to the benefit Follower Reads provides.

To counteract this, you can issue all Follower Reads in explicit transactions set with `HIGH` priority:

```sql
BEGIN PRIORITY HIGH AS OF SYSTEM TIME(experimental_follower_read_timestamp());

SAVEPOINT cockroach_restart;

SELECT ...
SELECT ...

COMMIT;
```

## See Also

- [Cluster Settings Overview](cluster-settings.html)
- [Load-Based Splitting](load-based-splitting.html)
