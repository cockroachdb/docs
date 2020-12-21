---
title: Follower Reads
summary: To reduce latency for read queries, you can choose to have the closest node serve the request using the follower reads feature.
toc: true
---

Follower reads are a mechanism that CockroachDB uses to provide faster reads in situations where you can afford to read data that may be slightly less than current (using [`AS OF SYSTEM TIME`](as-of-system-time.html)). Normally, reads have to be serviced by a replica's [leaseholder](architecture/overview.html#architecture-leaseholder). This can be slow, since the leaseholder may be geographically distant from the gateway node that is issuing the query.

A follower read is a read taken from the closest [replica](architecture/overview.html#architecture-replica), regardless of the replica's leaseholder status. This can result in much better latency in [geo-distributed, multi-region deployments](topology-patterns.html#multi-region-patterns).

 The shortest interval at which [`AS OF SYSTEM TIME`](as-of-system-time.html) can serve follower reads is 4.8 seconds. In prior versions of CockroachDB, the interval was 48 seconds.

For instructions showing how to use follower reads to get low latency, historical reads in multi-region deployments, see the [Follower Reads Topology Pattern](topology-follower-reads.html).

{{site.data.alerts.callout_info}}
This is an [enterprise feature](enterprise-licensing.html).
{{site.data.alerts.end}}

## Watch the demo

<iframe width="560" height="315" src="https://www.youtube.com/embed/V--skgN_JMo" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## How follower reads work

Each CockroachDB node tracks a property called its "closed timestamp", which means that no new writes can ever be introduced below that timestamp. The closed timestamp advances forward by some target interval behind the current time. If the replica receives a write at a timestamp less than its closed timestamp, it rejects the write.

With [follower reads enabled](#enable-disable-follower-reads), any replica on a node can serve a read for a key as long as the time at which the operation is performed (i.e., the [`AS OF SYSTEM TIME`](as-of-system-time.html) value) is less or equal to the node's closed timestamp.

When a gateway node in a cluster with follower reads enabled receives a request to read a key with a sufficiently old [`AS OF SYSTEM TIME`](as-of-system-time.html) value, it forwards the request to the closest node that contains a replica of the data–– whether it be a follower or the leaseholder.

## When to use follower reads

As long as your [`SELECT` operations](select-clause.html) can tolerate reading data that was current as of the [follower read timestamp](#run-queries-that-use-follower-reads), follower reads can reduce read latencies and increase throughput.

You should not use follower reads when your application cannot tolerate reading data that was current as of the [follower read timestamp](#run-queries-that-use-follower-reads), since the results of follower reads may not reflect the latest writes against the tables you are querying.

In addition, follower reads are "read-only" operations; they cannot be used in any way in read-write transactions.

## Using follower reads

### Enable/disable follower reads

Use [`SET CLUSTER SETTING`](set-cluster-setting.html) to set `kv.closed_timestamp.follower_reads_enabled` to:

- `true` to enable follower reads _(default)_
- `false` to disable follower reads

{% include copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING kv.closed_timestamp.follower_reads_enabled = false;
~~~

If you have follower reads enabled, you may want to [verify that follower reads are happening](#verify-that-follower-reads-are-happening).

{{site.data.alerts.callout_info}}
If follower reads are enabled, but the time-travel query is not using [`AS OF SYSTEM TIME`](as-of-system-time.html) far enough in the past (as defined by the [follower read timestamp](#run-queries-that-use-follower-reads)), CockroachDB does not perform a follower read. Instead, the read accesses the [leaseholder replica](architecture/overview.html#architecture-leaseholder). This adds network latency if the leaseholder is not the closest replica to the gateway node.
{{site.data.alerts.end}}

### Verify that follower reads are happening

To verify that your cluster is performing follower reads:

1. Make sure that [follower reads are enabled](#enable-disable-follower-reads).
2. Go to the [Custom Chart Debug Page in the DB Console](ui-custom-chart-debug-page.html) and add the metric `follower_read.success_count` to the time series graph you see there. The number of follower reads performed by your cluster will be shown.

### Run queries that use follower reads

Any [`SELECT` statement](select-clause.html) with an [`AS OF SYSTEM TIME`](as-of-system-time.html) value at least 4.8 seconds in the past can be a follower read (i.e., served by any replica).

To simplify this calculation, we've added a convenience function that will always set the [`AS OF SYSTEM TIME`](as-of-system-time.html) value to the minimum required for follower reads, `follower_read_timestamp()`:

``` sql
SELECT ... FROM ... AS OF SYSTEM TIME follower_read_timestamp();
```

### Run read-only transactions that use follower reads

You can set the [`AS OF SYSTEM TIME`](as-of-system-time.html) value for all operations in a read-only transaction:

```sql
BEGIN;

SET TRANSACTION AS OF SYSTEM TIME follower_read_timestamp();
SELECT ...
SELECT ...

COMMIT;
```

Note that follower reads are "read-only" operations; they cannot be used in any way in read-write transactions.

{{site.data.alerts.callout_success}}
Using the [`SET TRANSACTION`](set-transaction.html#use-the-as-of-system-time-option) statement as shown in the example above will make it easier to use the follower reads feature from [drivers and ORMs](install-client-drivers.html).
{{site.data.alerts.end}}

## Follower reads and long-running writes

Long-running write transactions will create write intents with a timestamp near when the transaction began. When a follower read encounters a write intent, it will often end up in a "transaction wait queue", waiting for the operation to complete; however, this runs counter to the benefit follower reads provides.

To counteract this, you can issue all follower reads in explicit transactions set with `HIGH` priority:

```sql
BEGIN PRIORITY HIGH AS OF SYSTEM TIME follower_read_timestamp();
SELECT ...
SELECT ...
COMMIT;
```

## See Also

- [Cluster Settings Overview](cluster-settings.html)
- [Load-Based Splitting](load-based-splitting.html)
- [Network Latency Page](ui-network-latency-page.html)
- [Enterprise Features](enterprise-licensing.html)
- [Follower Reads Topology Pattern](topology-follower-reads.html)
