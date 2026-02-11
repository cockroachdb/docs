---
title: Follower Reads
summary: To reduce latency for read queries, you can choose to have the closest replica serve the request.
toc: true
docs_area: develop
---

A _follower read_ is performed on the [nearest replica]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-replica) relative to the SQL gateway that is executing the SQL statement regardless of the replica's [leaseholder]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-leaseholder) status. Using the nearest replica can reduce read latencies and increase throughput. Applications in [multi-region deployments]({% link {{ page.version.version }}/topology-follower-reads.md %}) especially can use follower reads to get improved performance.

## Follower read types

A _strong follower read_ is a read taken from a [Global]({% link {{ page.version.version }}/global-tables.md %}) table. Such tables are optimized for low-latency reads from every region in the database. The tradeoff is that writes will incur higher latencies from any given region, since writes have to be replicated across every region to make the global low-latency reads possible. For more information about global tables, including troubleshooting information, see [Global Tables]({% link {{ page.version.version }}/global-tables.md %}).

A [_stale follower read_](#stale-follower-reads) is a historical read taken from the nearest replica. You should use stale follower reads only when your application can tolerate reading stale data, since the results of stale follower reads may not reflect the latest writes against the tables you are querying.

The following table summarizes the read types and how to accomplish them.

 | Strong Reads | Stale Reads
-----|-----------|----------------------------------------------------------------
Only From Leaseholder  | `SELECT` | N/A
From Nearest Replica | `SELECT` on a `GLOBAL` table **or** a long-running `SELECT` whose read timestamp has fallen behind the [closed timestamp]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#closed-timestamps) | `SELECT` with `AS OF SYSTEM TIME <historical-timestamp-function>`

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

- Need multi-statement reads inside [transactions]({% link {{ page.version.version }}/transactions.md %}).
- Can tolerate reading older data (at least 4.2 seconds in the past), to reduce the chance that the historical query timestamp is not quite old enough to prevent blocking on a conflicting write and thus being able to be served by a local replica.
- Do not need the increase in availability provided by [bounded staleness reads](#bounded-staleness-reads) in the face of [network partitions]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#network-partition) or other failures.
- Need a read that is slightly cheaper to perform than a [bounded staleness read](#bounded-staleness-reads), because exact staleness reads don't need to dynamically compute the query timestamp.

#### Run queries that use exact staleness follower reads

Any [`SELECT` statement]({% link {{ page.version.version }}/select-clause.md %}) with an appropriate [`AS OF SYSTEM TIME`]({% link {{ page.version.version }}/as-of-system-time.md %}) value is an exact staleness follower read. You can use the convenience [function]({% link {{ page.version.version }}/functions-and-operators.md %}#date-and-time-functions) `follower_read_timestamp()`, which returns a [`TIMESTAMP`]({% link {{ page.version.version }}/timestamp.md %}) that provides a high probability of being served locally while not [blocking on conflicting writes](#exact-staleness-reads-and-long-running-writes).

Use this function in an `AS OF SYSTEM TIME` statement as follows:

``` sql
SELECT ... FROM ... AS OF SYSTEM TIME follower_read_timestamp();
```

To see the current value of the follower read timestamp, execute the following query:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT now() - follower_read_timestamp();
~~~

#### Exact staleness follower reads in read-only transactions

You can set the [`AS OF SYSTEM TIME`]({% link {{ page.version.version }}/as-of-system-time.md %}) clause's value for all operations in a read-only [transaction]({% link {{ page.version.version }}/transactions.md %}):

```sql
BEGIN;

SET TRANSACTION AS OF SYSTEM TIME follower_read_timestamp();
SELECT ...
SELECT ...

COMMIT;
```

Follower reads are "read-only" operations; you **cannot** use them in read-write transactions.

{{site.data.alerts.callout_success}}
Using the [`SET TRANSACTION`]({% link {{ page.version.version }}/set-transaction.md %}#use-the-as-of-system-time-option) statement as shown in the preceding example will make it easier to use exact staleness follower reads from [drivers and ORMs]({% link {{ page.version.version }}/install-client-drivers.md %}).

To set `AS OF SYSTEM TIME follower_read_timestamp()` on all implicit and explicit read-only transactions by default, use one of the following options:

- Set the `default_transaction_use_follower_reads` [session variable]({% link {{ page.version.version }}/set-vars.md %}) to `on`. When `default_transaction_use_follower_reads=on`, all read-only transactions use exact staleness follower reads.
- Execute the `SET SESSION CHARACTERISTICS AS TRANSACTION AS OF SYSTEM TIME follower_read_timestamp()` [SQL statement]({% link {{ page.version.version }}/set-vars.md %}#special-syntax-cases). This has the same effect as setting the session variable as shown above.

You can set `default_transaction_use_follower_reads` on a per-role basis; for instructions, see [Set default session variable values for a role]({% link {{ page.version.version }}/alter-role.md %}#set-default-session-variable-values-for-a-role).
{{site.data.alerts.end}}

### Bounded staleness reads

A _bounded staleness read_ is a historical read that uses a dynamic, system-determined timestamp to minimize staleness while being more tolerant to replication lag than an exact staleness read. Bounded staleness reads also help increase system availability, since they provide the ability to serve reads from local replicas even in the presence of network partitions or other failures that prevent the SQL gateway from communicating with the leaseholder.

#### When to use bounded staleness reads

Use bounded staleness follower reads when you:

- Need minimally stale reads from the nearest replica without blocking on [conflicting transactions]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#transaction-contention). This is possible because the historical timestamp is chosen dynamically and the least stale timestamp that can be served locally without blocking is used.
- Can confine the read to a single statement that meets the [bounded staleness limitations](#bounded-staleness-read-limitations).
- Need higher availability than is provided by [exact staleness reads](#exact-staleness-reads). Specifically, what we mean by availability in this context is:
  - The ability to serve a read with low latency from a local replica rather than a leaseholder.
  - The ability to serve reads from local replicas even in the presence of a network partition or other failure event that prevents the SQL gateway from communicating with the leaseholder. Once a replica begins serving follower reads at a timestamp, it will always continue to serve follower reads at that timestamp. Even if the replica becomes completely partitioned away from the rest of its range, it will continue to stay available for (increasingly) stale reads.

#### Run queries that use bounded staleness follower reads

To get a bounded staleness read, use one of the following built-in functions:

Name | Description
---- | -----------
`with_min_timestamp(TIMESTAMPTZ, [nearest_only])` |  Defines a minimum [timestamp]({% link {{ page.version.version }}/timestamp.md %}) at which to perform the [bounded staleness read]({% link {{ page.version.version }}/follower-reads.md %}#bounded-staleness-reads). The actual timestamp of the read may be equal to or later than the provided timestamp, but cannot be before the provided timestamp. This is useful to request a read from nearby followers, if possible, while enforcing causality between an operation at some point in time and any dependent reads. This function accepts an optional `nearest_only` argument that will error if the reads cannot be serviced from a nearby replica.
`with_max_staleness(INTERVAL, [nearest_only])` |  Defines a maximum staleness interval with which to perform the [bounded staleness read]({% link {{ page.version.version }}/follower-reads.md %}#bounded-staleness-reads). The timestamp of the read can be at most this stale with respect to the current time. This is useful to request a read from nearby followers, if possible, while placing some limit on how stale results can be. Note that `with_max_staleness(INTERVAL)` is equivalent to `with_min_timestamp(now() - INTERVAL)`. This function accepts an optional `nearest_only` argument that will error if the reads cannot be serviced from a nearby replica.

This example performs a bounded staleness follower read against a [demo cluster]({% link {{ page.version.version }}/cockroach-demo.md %}) with the [MovR dataset]({% link {{ page.version.version }}/movr.md %}).

1. Start the demo cluster with 3 nodes:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach demo --nodes=3
    ~~~

1. Issue a single-statement point query to [select]({% link {{ page.version.version }}/selection-queries.md %}) a single row from a table at a historical [timestamp]({% link {{ page.version.version }}/timestamp.md %}) by passing the output of the `with_max_staleness()` [function]({% link {{ page.version.version }}/functions-and-operators.md %}) to the [`AS OF SYSTEM TIME`]({% link {{ page.version.version }}/as-of-system-time.md %}) clause:

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
    See: https://go.crdb.dev/issue-v/67562/v23.2
    ~~~

    You can verify using [`EXPLAIN`]({% link {{ page.version.version }}/explain.md %}) that the reason this query was able to perform a bounded staleness read is that it performed a point lookup from a single row:

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

### Verify that CockroachDB is performing follower reads

To verify that a cluster is performing follower reads, go to the [**Custom Chart** debug page in the DB Console]({% link {{ page.version.version }}/ui-custom-chart-debug-page.md %}) and add the metric `follower_reads.success_count` to the time-series graph. The number of follower reads performed by your cluster will be shown.

To verify that a specific query uses a follower read, use [`EXPLAIN ANALYZE`]({% link {{ page.version.version }}/explain-analyze.md %}) to see the statement plan. For example, to test the [preceding example](#run-queries-that-use-bounded-staleness-follower-reads):

1. Use the `\demo ls` [shell command]({% link {{ page.version.version }}/cockroach-demo.md %}#commands) to list the connection parameters for all nodes:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    \demo ls
    ~~~

    The output will list the connection parameters for each node:

    ~~~
    node 3:
    ...
       (sql)      postgresql://demo:demo37199@127.0.0.1:26259/movr?options=-ccluster%3Ddemoapp&sslmode=equire&sslrootcert=%2FUsers%2Fuser%2F.cockroach-demo%2Fca.crt
    ~~~

1. Open a new terminal and open the SQL shell on a non-leaseholder node. For example: 

    Identify the leaseholder node:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SELECT lease_holder FROM [SHOW RANGES FROM TABLE promo_codes WITH DETAILS];
    ~~~

    ~~~
      lease_holder
    ----------------
                 1
    ~~~

    Connect to a node other than node 1 (such as node 3, using the preceding output):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --url='postgresql://demo:demo37199@127.0.0.1:26259/movr?options=-ccluster%3Ddemoapp&sslmode=equire&sslrootcert=%2FUsers%2Fuser%2F.cockroach-demo%2Fca.crt'
    ~~~

1. Issue the [`EXPLAIN ANALYZE`]({% link {{ page.version.version }}/explain-analyze.md %}) statement on the non-leaseholder node:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    EXPLAIN ANALYZE SELECT code FROM promo_codes AS OF SYSTEM TIME with_max_staleness('10s') where code = '0_explain_theory_something';
    ~~~

    ~~~
                                          info
    --------------------------------------------------------------------------------
      planning time: 5ms
      execution time: 1ms
      distribution: local
      ...
      historical: AS OF SYSTEM TIME 2024-11-19 21:04:00.829742 (bounded staleness)

      • scan
        sql nodes: n3
        kv nodes: n3
        regions: us-east1
        used follower read
        ...
        table: promo_codes@promo_codes_pkey
        spans: [/'0_explain_theory_something' - /'0_explain_theory_something']
    ~~~

    In the preceding output, `used follower read` indicates that the read was served by the follower replica. `historical: AS OF SYSTEM TIME ... (bounded staleness)` shows that it was a historical, bounded staleness read.

### How stale follower reads work

Each CockroachDB range tracks a property called its [_closed timestamp_]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#closed-timestamps), which means that no new writes can ever be introduced at or below that timestamp. The closed timestamp is advanced continuously on the leaseholder, and lags the current time by some target interval. As the closed timestamp is advanced, notifications are sent to each follower. If a range receives a write at a timestamp less than or equal to its closed timestamp, the write is forced to change its timestamp, which might result in a [transaction retry error]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}).

With follower reads, any replica in a range can serve a read for a key as long as the time at which the operation is performed (i.e., the [`AS OF SYSTEM TIME`]({% link {{ page.version.version }}/as-of-system-time.md %}) value) is less than or equal to the range's closed timestamp.

When a gateway node in a cluster receives a request to read a key with a sufficiently old [`AS OF SYSTEM TIME`]({% link {{ page.version.version }}/as-of-system-time.md %}) value, it forwards the request to the closest node that contains a replica of the data&mdash;whether it be a follower or the leaseholder.

For further details, see [An Epic Read on Follower Reads](https://www.cockroachlabs.com/blog/follower-reads-stale-data/).

### Known limitations

{% include {{ page.version.version }}/known-limitations/follower-reads-limitations.md %}

### Video demo

For a demo of how to use follower reads to improve performance, watch the following video:

{% include_cached youtube.html video_id="NzhhvgzHJj4" %}

## See also

- [Follower Reads Topology]({% link {{ page.version.version }}/topology-follower-reads.md %})
- [Cluster Settings Overview]({% link {{ page.version.version }}/cluster-settings.md %})
- [Load-Based Splitting]({% link {{ page.version.version }}/load-based-splitting.md %})
- [Network Latency Page]({% link {{ page.version.version }}/ui-network-latency-page.md %})
