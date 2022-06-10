---
title: Follower Reads
summary: To reduce latency for read queries, you can choose to have the closest replica serve the request.
toc: true
docs_area: develop
---

A _follower read_ is performed on the [nearest replica](architecture/overview.html#architecture-replica) relative to the SQL gateway that is executing the SQL statement regardless of the replica's [leaseholder](architecture/overview.html#architecture-leaseholder) status. Using the nearest replica can reduce read latencies and increase throughput. Applications in [multi-region deployments](topology-follower-reads.html) especially can use follower reads to get improved performance.

{% include enterprise-feature.md %}

## Follower read types

A _strong follower read_ is a read taken from a [Global](global-tables.html) table. Such tables are optimized for low-latency reads from every region in the database. The tradeoff is that writes will incur higher latencies from any given region, since writes have to be replicated across every region to make the global low-latency reads possible.

A [_stale follower read_](#stale-follower-reads) is a historical read taken from the nearest replica. You should use stale follower reads only when your application can tolerate reading stale data, since the results of stale follower reads may not reflect the latest writes against the tables you are querying.

The following table summarizes the read types and how to accomplish them.

 | Strong Reads | Stale Reads
-----|-----------|----------------------------------------------------------------
Only From Leaseholder  | `SELECT` | N/A
From Nearest Replica | `SELECT` on `GLOBAL` table	| `SELECT` with `AS OF SYSTEM TIME <historical-timestamp-function>`

## Stale follower reads

CockroachDB provides the following types of stale follower reads:

- _Exact staleness read_: A historical read as of a static, user-provided timestamp. See [Exact staleness reads](#exact-staleness-reads).
- _Bounded staleness read_: A historical read that uses a dynamic, system-determined timestamp to minimize staleness while being more tolerant to replication lag than an exact staleness read. See [Bounded staleness reads](#bounded-staleness-reads).

{{site.data.alerts.callout_info}}
Stale follower reads are  always served from a consistent view; CockroachDB does not allow a historical read to view uncommitted data.
{{site.data.alerts.end}}

### Exact staleness reads

An _exact staleness read_ is a historical read as of a static, user-provided timestamp.

For requirements and limitations, see [Exact staleness reads and long-running writes](#exact-staleness-reads-and-long-running-writes) and [Exact staleness read timestamps must be far enough in the past](#exact-staleness-read-timestamps-must-be-far-enough-in-the-past).

#### When to use exact staleness reads

Use exact staleness follower reads when you:

- Need multi-statement reads inside [transactions](transactions.html).
- Can tolerate reading older data (at least 4.8 seconds in the past), to reduce the chance that the historical query timestamp is not quite old enough to prevent blocking on a conflicting write and thus being able to be served by a local replica.
- Do not need the increase in availability provided by [bounded staleness reads](#bounded-staleness-reads) in the face of [network partitions](cluster-setup-troubleshooting.html#network-partition) or other failures.
- Need a read that is slightly cheaper to perform than a [bounded staleness read](#bounded-staleness-reads), because exact staleness reads don't need to dynamically compute the query timestamp.

#### Run queries that use exact staleness follower reads

Any [`SELECT` statement](select-clause.html) with an appropriate [`AS OF SYSTEM TIME`](as-of-system-time.html) value is an exact staleness follower read. You can use the convenience [function](functions-and-operators.html#date-and-time-functions) `follower_read_timestamp()`, which returns a [`TIMESTAMP`](timestamp.html) that provides a high probability of being served locally while not [blocking on conflicting writes](#exact-staleness-reads-and-long-running-writes).

Use this function in an `AS OF SYSTEM TIME` statement as follows:

``` sql
SELECT ... FROM ... AS OF SYSTEM TIME follower_read_timestamp();
```
#### Exact staleness follower reads demo

The following video describes and demonstrates [exact staleness](#exact-staleness-reads) follower reads.

<iframe width="560" height="315" src="https://www.youtube.com/embed/V--skgN_JMo" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

#### Exact staleness follower reads in read-only transactions

You can set the [`AS OF SYSTEM TIME`](as-of-system-time.html) clause's value for all operations in a read-only [transaction](transactions.html):

```sql
BEGIN;

SET TRANSACTION AS OF SYSTEM TIME follower_read_timestamp();
SELECT ...
SELECT ...

COMMIT;
```

Follower reads are "read-only" operations; you **cannot** use them in read-write transactions.

{{site.data.alerts.callout_success}}
Using the [`SET TRANSACTION`](set-transaction.html#use-the-as-of-system-time-option) statement as shown in the preceding example will make it easier to use exact staleness follower reads from [drivers and ORMs](install-client-drivers.html).

To set `AS OF SYSTEM TIME follower_read_timestamp()` on all implicit and explicit read-only transactions by default, use one of the following options:

- Set the `default_transaction_use_follower_reads` [session variable](set-vars.html) to `on`. When `default_transaction_use_follower_reads=on`, all read-only transactions use exact staleness follower reads.
- Execute the `SET SESSION CHARACTERISTICS AS TRANSACTION AS OF SYSTEM TIME follower_read_timestamp()` [SQL statement](set-vars.html#special-syntax-cases). This has the same effect as setting the session variable as shown above.

You can set `default_transaction_use_follower_reads` on a per-role basis; for instructions, see [Set default session variable values for a role](alter-role.html#set-default-session-variable-values-for-a-role).
{{site.data.alerts.end}}

### Bounded staleness reads

A _bounded staleness read_ is a historical read that uses a dynamic, system-determined timestamp to minimize staleness while being more tolerant to replication lag than an exact staleness read. Bounded staleness reads also help increase system availability, since they provide the ability to serve reads from local replicas even in the presence of network partitions or other failures that prevent the SQL gateway from communicating with the leaseholder.

#### When to use bounded staleness reads

Use bounded staleness follower reads when you:

- Need minimally stale reads from the nearest replica without blocking on [conflicting transactions](transactions.html#transaction-contention). This is possible because the historical timestamp is chosen dynamically and the least stale timestamp that can be served locally without blocking is used.
- Can confine the read to a single statement that meets the [bounded staleness limitations](#bounded-staleness-read-limitations).
- Need higher availability than is provided by [exact staleness reads](#exact-staleness-reads). Specifically, what we mean by availability in this context is:
  - The ability to serve a read with low latency from a local replica rather than a leaseholder.
  - The ability to serve reads from local replicas even in the presence of a network partition or other failure event that prevents the SQL gateway from communicating with the leaseholder. Once a replica begins serving follower reads at a timestamp, it will always continue to serve follower reads at that timestamp. Even if the replica becomes completely partitioned away from the rest of its range, it will continue to stay available for (increasingly) stale reads.

#### Run queries that use bounded staleness follower reads

To get a bounded staleness read, use one of the following built-in functions:

Name | Description
---- | -----------
`with_min_timestamp(TIMESTAMPTZ, [nearest_only])` |  Defines a minimum [timestamp](timestamp.html) at which to perform the [bounded staleness read](follower-reads.html#bounded-staleness-reads). The actual timestamp of the read may be equal to or later than the provided timestamp, but cannot be before the provided timestamp. This is useful to request a read from nearby followers, if possible, while enforcing causality between an operation at some point in time and any dependent reads. This function accepts an optional `nearest_only` argument that will error if the reads cannot be serviced from a nearby replica.
`with_max_staleness(INTERVAL, [nearest_only])` |  Defines a maximum staleness interval with which to perform the [bounded staleness read](follower-reads.html#bounded-staleness-reads). The timestamp of the read can be at most this stale with respect to the current time. This is useful to request a read from nearby followers, if possible, while placing some limit on how stale results can be. Note that `with_max_staleness(INTERVAL)` is equivalent to `with_min_timestamp(now() - INTERVAL)`. This function accepts an optional `nearest_only` argument that will error if the reads cannot be serviced from a nearby replica.

This example performs a bounded staleness follower read against a [demo cluster](cockroach-demo.html) with the [MovR dataset](movr.html).

1. Start the demo cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach demo
    ~~~

1. Issue a single-statement point query to [select](selection-queries.html) a single row from a table at a historical [timestamp](timestamp.html) by passing the output of the `with_max_staleness()` [function](functions-and-operators.html) to the [`AS OF SYSTEM TIME`](as-of-system-time.html) clause:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SELECT code FROM promo_codes AS OF SYSTEM TIME with_max_staleness('10s') where code = '0_explain_theory_something';
    ~~~

    ~~~
                 code
    ------------------------------
      0_explain_theory_something
    (1 row)
    ~~~

    The query returns successfully.

    If it had failed with the following error message, you would need to [troubleshoot your query to ensure it meets the conditions required for bounded staleness reads](#bounded-staleness-read-limitations).

    ~~~
    ERROR: unimplemented: cannot use bounded staleness for queries that may touch more than one row or require an index join
    SQLSTATE: 0A000
    HINT: You have attempted to use a feature that is not yet implemented.
    See: https://go.crdb.dev/issue-v/67562/v21.2
    ~~~

    You can verify using [`EXPLAIN`](explain.html) that the reason this query was able to perform a bounded staleness read is that it performed a point lookup from a single row:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    EXPLAIN SELECT code FROM promo_codes AS OF SYSTEM TIME with_max_staleness('10s') where code = '0_explain_theory_something';
    ~~~

    ~~~
                                          info
    --------------------------------------------------------------------------------
      distribution: local
      vectorized: true

      • scan
        estimated row count: 1 (0.10% of the table; stats collected 4 minutes ago)
        table: promo_codes@primary
        spans: [/'0_explain_theory_something' - /'0_explain_theory_something']
    (7 rows)
    ~~~

### Verify that a cluster is performing follower reads

To verify that a cluster is performing follower reads, go to the [Custom Chart Debug Page in the DB Console](ui-custom-chart-debug-page.html) and add the metric `follower_read.success_count` to the time-series graph. The number of follower reads performed by your cluster will be shown.

### How stale follower reads work

Each CockroachDB range tracks a property called its [_closed timestamp_](architecture/transaction-layer.html#closed-timestamps), which means that no new writes can ever be introduced at or below that timestamp. The closed timestamp is advanced continuously on the leaseholder, and lags the current time by some target interval. As the closed timestamp is advanced, notifications are sent to each follower. If a range receives a write at a timestamp less than or equal to its closed timestamp, the write is forced to change its timestamp, which might result in a [transaction retry error](transaction-retry-error-reference.html).

With follower reads, any replica in a range can serve a read for a key as long as the time at which the operation is performed (i.e., the [`AS OF SYSTEM TIME`](as-of-system-time.html) value) is less than or equal to the range's closed timestamp.

When a gateway node in a cluster receives a request to read a key with a sufficiently old [`AS OF SYSTEM TIME`](as-of-system-time.html) value, it forwards the request to the closest node that contains a replica of the data&mdash;whether it be a follower or the leaseholder.

For further details, see [An Epic Read on Follower Reads](https://www.cockroachlabs.com/blog/follower-reads-stale-data/).

### Limitations

- [Exact staleness reads and long-running writes](#exact-staleness-reads-and-long-running-writes)
- [Exact staleness read timestamps must be far enough in the past](#exact-staleness-read-timestamps-must-be-far-enough-in-the-past)
- [Bounded staleness read limitations](#bounded-staleness-read-limitations)

#### Exact staleness reads and long-running writes

Long-running write transactions will create [write intents](architecture/transaction-layer.html#write-intents) with a timestamp near when the transaction began. When an exact staleness follower read encounters a write intent, it will often end up in a ["transaction wait queue"](architecture/transaction-layer.html#txnwaitqueue), waiting for the operation to complete; however, this runs counter to the benefit exact staleness reads provide.

To counteract this, you can issue all follower reads in explicit [transactions set with `HIGH` priority](transactions.html#transaction-priorities):

```sql
BEGIN PRIORITY HIGH AS OF SYSTEM TIME follower_read_timestamp();
SELECT ...
SELECT ...
COMMIT;
```

#### Exact staleness read timestamps must be far enough in the past

If an exact staleness read is not using an [`AS OF SYSTEM TIME`](as-of-system-time.html) value far enough in the past, CockroachDB cannot perform a follower read. Instead, the read must access the [leaseholder replica](architecture/overview.html#architecture-leaseholder). This adds network latency if the leaseholder is not the closest replica to the gateway node. Most users will [use the `follower_read_timestamp()` function](#run-queries-that-use-exact-staleness-follower-reads) to get a timestamp far enough in the past that there is a high probability of getting a follower read.

#### Bounded staleness read limitations

Bounded staleness reads have the following limitations:

- They must be used in a [single-statement (aka implicit) transaction](transactions.html#individual-statements).
- They must read from a single row.
- They must not require an [index](indexes.html) [join](joins.html). In other words, the index used by the read query must be either a [primary](primary-key.html) [index](indexes.html), or some other index that covers the entire query by [`STORING`](create-index.html#store-columns) all columns.

For example, let's look at a read query that cannot be served as a bounded staleness read. We will use a [demo cluster](cockroach-demo.html), which automatically loads the [MovR dataset](movr.html).

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach demo
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT code FROM promo_codes AS OF SYSTEM TIME with_max_staleness('10s') LIMIT 1;
ERROR: unimplemented: cannot use bounded staleness for queries that may touch more than one row or require an index join
SQLSTATE: 0A000
HINT: You have attempted to use a feature that is not yet implemented.
See: https://go.crdb.dev/issue-v/67562/v21.2
~~~

As noted by the error message, this query cannot be served as a bounded staleness read because in this case it would touch more than one row. Even though we used a [`LIMIT 1` clause](limit-offset.html), the query would still have to touch more than one row in order to filter out the additional results.

We can verify that more than one row would be touched by issuing [`EXPLAIN`](explain.html) on the same query, but without the [`AS OF SYSTEM TIME`](as-of-system-time.html) clause:

{% include_cached copy-clipboard.html %}
~~~ sql
EXPLAIN SELECT code FROM promo_codes LIMIT 5;
~~~

~~~
                                     info
-------------------------------------------------------------------------------
  distribution: full
  vectorized: true

  • scan
    estimated row count: 1 (0.10% of the table; stats collected 1 minute ago)
    table: promo_codes@primary
    spans: LIMITED SCAN
    limit: 1
(8 rows)
~~~

The output verifies that this query performs a scan of the primary [index](indexes.html) on the `promo_codes` table, which is why it cannot be used for a bounded staleness read.

For an example showing how to successfully perform a bounded staleness read, see [Run queries that use bounded staleness follower reads](#run-queries-that-use-bounded-staleness-follower-reads).

## See also

- [Follower Reads Topology](topology-follower-reads.html)
- [Cluster Settings Overview](cluster-settings.html)
- [Load-Based Splitting](load-based-splitting.html)
- [Network Latency Page](ui-network-latency-page.html)
- [Enterprise Features](enterprise-licensing.html)
