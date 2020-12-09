---
title: Transaction Retry Error Reference
summary: A list of the transaction retry (serialization) errors emitted by CockroachDB, including likely causes and user actions for mitigation.
toc: true
---

This page has a list of the transaction retry error codes emitted by CockroachDB.

Transaction retry errors use the `SQLSTATE` error code `40001`, and emit error messages with the string `restart transaction`. The most common transaction retry errors are also known as serialization errors. Serialization errors indicate that a transaction failed because it could not be placed into a [serializable ordering](demo-serializable.html) among all of the currently-executing transactions.

The failure to place a transaction into a serializable ordering usually happens due to a [transaction conflict](architecture/transaction-layer.html#transaction-conflicts) with another concurrent or recent transaction that is trying to write to the same data. When multiple transactions are trying to write to the same data, this state is also known as contention. When serialization errors occur due to contention, the transaction needs to be retried by the client as described in [client-side retry handling](transactions.html#client-side-intervention).

In less common cases, transaction retry errors are not caused by contention, but by the internal state of the CockroachDB cluster. For example, the cluster could be overloaded. In such cases, other actions may need to be taken above and beyond client-side retries.

See below for a complete list of retry error codes. For each error code, we describe:

- Why the error is happening.
- What to do about it.

This page is meant to provide information about specific transaction retry error codes to make troubleshooting easier. In most cases, the correct actions to take when these errors occur are:

1. Update your app to retry on serialization errors (where `SQLSTATE` is `40001`), as described in [client-side retry handling](transactions.html#client-side-intervention).

2. Design your schema and queries to reduce contention. For more information about how contention occurs and how to avoid it, see [Understanding and avoiding transaction contention](performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention). In particular, if you are able to [send all of the statements in your transaction in a single batch](transactions.html#batched-statements), CockroachDB can usually automatically retry the entire transaction for you.

3. Use historical reads with [`SELECT ... AS OF SYSTEM TIME`](as-of-system-time.html).

4. In some cases, [`SELECT FOR UPDATE`](select-for-update.html) can also be used to reduce the occurrence of serialization errors.

5. [High priority transactions](transactions.html#transaction-priorities) are less likely to experience serialization errors than low priority transactions. Adjusting transaction priorities usually does not change how many serialization errors occur, but it can help control which transactions experience them.

{{site.data.alerts.callout_info}}
Note that your application's retry logic does not need to distinguish between the different types of serialization errors. They are listed here for reference during advanced troubleshooting.
{{site.data.alerts.end}}

## Overview

CockroachDB always attempts to find a [serializable ordering](demo-serializable.html) among all of the currently-executing transactions.

Whenever possible, CockroachDB will [auto-retry a transaction internally](transactions.html#automatic-retries) without notifying the client. CockroachDB will only send a serialization error to the client when it cannot resolve the error automatically without client-side intervention.

In other words, by the time a serialization error bubbles up to the client, CockroachDB has already tried to handle the error internally, and could not.

The main reason why CockroachDB cannot auto-retry every serialization error without sending an error to the client is that the SQL language is "conversational" by design. The client can send arbitrary statements to the server during a transaction, receive some results, and then decide to issue other arbitrary statements inside the same transaction based on the server's response.

Suppose that the client is [a Java application using JDBC](build-a-java-app-with-cockroachdb.html), or an analyst typing [`BEGIN`](begin-transaction.html) directly to [a SQL shell](cockroach-sql.html). In either case, the client is free to issue a `BEGIN`, wait an arbitrary amount of time, and issue additional statements. Meanwhile, other transactions are being processed by the system, potentially writing to the same data.

This "conversational" design means that there is no way for the server to always retry the arbitrary statements sent so far inside an open transaction. If there are different results for any given statement than there were at an earlier point in the currently open transaction's lifetime (likely due to the operations of other, concurrently-executing transactions), CockroachDB must defer to the client to decide how to handle that situation. This is why we recommend [keeping transactions as small as possible](performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention).

## Error reference

- [RETRY_WRITE_TOO_OLD](#retry_write_too_old)
- [RETRY_SERIALIZABLE](#retry_serializable)
- [RETRY_ASYNC_WRITE_FAILURE](#retry_async_write_failure)
- [ReadWithinUncertaintyInterval](#readwithinuncertaintyinterval)
- [RETRY_COMMIT_DEADLINE_EXCEEDED](#retry_commit_deadline_exceeded)
- [ABORT_REASON_ABORTED_RECORD_FOUND](#abort_reason_aborted_record_found)
- [ABORT_REASON_CLIENT_REJECT](#abort_reason_client_reject)
- [ABORT_REASON_PUSHER_ABORTED](#abort_reason_pusher_aborted)
- [ABORT_REASON_ABORT_SPAN](#abort_reason_abort_span)
- [ABORT_REASON_NEW_LEASE_PREVENTS_TXN](#abort_reason_new_lease_prevents_txn)
- [ABORT_REASON_TIMESTAMP_CACHE_REJECTED](#abort_reason_timestamp_cache_rejected)

### RETRY_WRITE_TOO_OLD

```
TransactionRetryWithProtoRefreshError: ... RETRY_WRITE_TOO_OLD ...
```

_Description_:

The `RETRY_WRITE_TOO_OLD` error occurs when a transaction _A_ tries to write to a row _R_, but another transaction _B_ that was supposed to be serialized after _A_ (i.e., had been assigned a higher timestamp), has already written to that row _R_, and has already committed. This is a common error when you have too much contention in your workload.

_Action_:

1. Retry transaction _A_ as described in [client-side retry handling](transactions.html#client-side-intervention).
2. Design your schema and queries to reduce contention. For more information about how contention occurs and how to avoid it, see [Understanding and avoiding transaction contention](performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention). In particular, if you are able to [send all of the statements in your transaction in a single batch](transactions.html#batched-statements), CockroachDB can usually automatically retry the entire transaction for you.

### RETRY_SERIALIZABLE

```
TransactionRetryWithProtoRefreshError: ... RETRY_SERIALIZABLE ...
```

_Description_:

The `RETRY_SERIALIZABLE` error occurs in the following cases:

1. When a transaction _A_ has its timestamp moved forward (also known as _A_ being "pushed") as CockroachDB attempts to find a serializable transaction ordering. Specifically, transaction _A_ tried to write a key that transaction _B_ had already read, and _B_ was supposed to be serialized after _A_ (i.e., _B_ had a higher timestamp than _A_). CockroachDB will try to serialize _A_ after _B_ by changing _A_'s timestamp, but it cannot do that when another transaction has subsequently written to some of the keys that _A_ has read and returned to the client. When that happens, the `RETRY_SERIALIZATION` error is signalled. For more information about how timestamp pushes work in our transaction model, see the [architecture docs on the transaction layer's timestamp cache](architecture/transaction-layer.html).

2. When a [high-priority transaction](transactions.html#transaction-priorities) _A_ does a read that runs into a write intent from another lower-priority transaction _B_, and some other transaction _C_ writes to a key that _B_ has already read. Transaction _B_ will get this error when it tries to commit, because _A_ has already read some of the data touched by _B_ and returned results to the client, and _C_ has written data previously read by _B_.

3. When a transaction _A_ is forced to refresh (i.e., change its timestamp) due to hitting the maximum _closed timestamp_ interval (closed timestamps enable [Follower Reads](follower-reads.html#how-follower-reads-work) and [Change Data Capture (CDC)](stream-data-out-of-cockroachdb-using-changefeeds.html)). This can happen when transaction _A_ is a long-running transaction, and there is a write by another transaction to data that _A_ has already read. If this is the cause of the error, the solution is to increase the `kv.closed_timestamp.target_duration` setting to a higher value. Unfortunately, there is no indication from this error code that a too-low closed timestamp setting is the issue. Therefore, you may need to rule out cases 1 and 2 (or experiment with increasing the closed timestamp interval, if that is possible for your application - see the note below).

_Action_:

1. If you encounter case 1 or 2 above, the solution is to:
   1. Retry transaction _A_ as described in [client-side retry handling](transactions.html#client-side-intervention).
   2. Design your schema and queries to reduce contention. For more information about how contention occurs and how to avoid it, see [Understanding and avoiding transaction contention](performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention). In particular, if you are able to [send all of the statements in your transaction in a single batch](transactions.html#batched-statements), CockroachDB can usually automatically retry the entire transaction for you.
   3. Use historical reads with [`SELECT ... AS OF SYSTEM TIME`](as-of-system-time.html).

2. If you encounter case 3 above, the solution is to:
   1. Increase the `kv.closed_timestamp.target_duration` setting to a higher value. As described above, this will impact the freshness of data available via [Follower Reads](follower-reads.html) and [CDC changefeeds](stream-data-out-of-cockroachdb-using-changefeeds.html).
   2. Retry transaction _A_ as described in [client-side retry handling](transactions.html#client-side-intervention).
   3. Design your schema and queries to reduce contention. For more information about how contention occurs and how to avoid it, see [Understanding and avoiding transaction contention](performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention). In particular, if you are able to [send all of the statements in your transaction in a single batch](transactions.html#batched-statements), CockroachDB can usually automatically retry the entire transaction for you.
   3. Use historical reads with [`SELECT ... AS OF SYSTEM TIME`](as-of-system-time.html).

{{site.data.alerts.callout_info}}
If you increase the `kv.closed_timestamp.target_duration` setting, it means that you are increasing the amount of time by which the data available in [Follower Reads](follower-reads.html) and [CDC changefeeds](stream-data-out-of-cockroachdb-using-changefeeds.html) lags behind the current state of the cluster. In other words, there is a trade-off here: if you absolutely must execute long-running transactions that execute concurrently with other transactions that are writing to the same data, you may have to settle for longer delays on Follower Reads and/or CDC to avoid frequent serialization errors. The anomaly that would be exhibited if these transactions were not retried is called [write skew](https://www.cockroachlabs.com/blog/what-write-skew-looks-like/).
{{site.data.alerts.end}}

### RETRY_ASYNC_WRITE_FAILURE

```
TransactionRetryWithProtoRefreshError: ... RETRY_ASYNC_WRITE_FAILURE ...
```

_Description_:

The `RETRY_ASYNC_WRITE_FAILURE` error occurs when some kind of problem with your cluster's operation occurs at the moment of a previous write in the transaction, causing CockroachDB to fail to replicate one of the transaction's writes. For example, this can happen if you have a networking partition that cuts off access to some nodes in your cluster.

_Action_:

1. Retry the transaction as described in [client-side retry handling](transactions.html#client-side-intervention). This is worth doing because the problem with the cluster is likely to be transient.
2. Investigate the problems with your cluster.  For cluster troubleshooting information, see [Troubleshoot Cluster Setup](cluster-setup-troubleshooting.html).

### ReadWithinUncertaintyInterval

```
TransactionRetryWithProtoRefreshError: ReadWithinUncertaintyIntervalError:
        read at time 1591009232.376925064,0 encountered previous write with future timestamp 1591009232.493830170,0 within uncertainty interval `t <= 1591009232.587671686,0`;
        observed timestamps: [{1 1591009232.587671686,0} {5 1591009232.376925064,0}]
```

_Description_:

The `ReadWithinUncertaintyIntervalError` can occur when two transactions which start on different gateway nodes attempt to operate on the same data at close to the same time, and one of the operations is a write. The uncertainty comes from the fact that we cannot tell which one started first - the clocks on the two gateway nodes may not be perfectly in sync.

For example, if the clock on node _A_ is ahead of the clock on node _B_, a transaction started on node _A_ may be able to commit a write with a timestamp that is still in the "future" from the perspective of node _B_. A later transaction that starts on node _B_ should be able to see the earlier write from node _A_, even if _B_'s clock has not caught up to _A_. The "read within uncertainty interval" occurs if we discover this situation in the middle of a transaction, when it is too late for the database to handle it automatically. When node _B_'s transaction retries, it will unambiguously occur after the transaction from node _A_.

{{site.data.alerts.callout_info}}
This behavior is non-deterministic: it depends on which node is the [leaseholder](architecture/life-of-a-distributed-transaction.html#leaseholder-node) of the underlying data range. It’s generally a sign of contention. Uncertainty errors are always possible with near-realtime reads under contention.
{{site.data.alerts.end}}

_Action_:

The solution is to do one of the following:

1. Be prepared to retry on uncertainty (and other) errors, as described in [client-side retry handling](transactions.html#client-side-intervention).
2. Use historical reads with [`SELECT ... AS OF SYSTEM TIME`](as-of-system-time.html).
3. Design your schema and queries to reduce contention. For more information about how contention occurs and how to avoid it, see [Understanding and avoiding transaction contention](performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention). In particular, if you are able to [send all of the statements in your transaction in a single batch](transactions.html#batched-statements), CockroachDB can usually automatically retry the entire transaction for you.
4. If you [trust your clocks](operational-faqs.html#what-happens-when-node-clocks-are-not-properly-synchronized), you can try lowering the [`--max-offset` option to `cockroach start`](cockroach-start.html#flags), which provides an upper limit on how long a transaction can continue to restart due to uncertainty.

{{site.data.alerts.callout_info}}
Uncertainty errors are a form of transaction conflict. For more information about transaction conflicts, see [Transaction conflicts](architecture/transaction-layer.html#transaction-conflicts).
{{site.data.alerts.end}}

### RETRY_COMMIT_DEADLINE_EXCEEDED

```
TransactionRetryWithProtoRefreshError: TransactionPushError: transaction deadline exceeded ...
```

_Description_:

The `RETRY_COMMIT_DEADLINE_EXCEEDED` error means that the transaction timed out due to being pushed by other concurrent transactions. This error is most likely to happen to long-running transactions. The conditions that trigger this error are very similar to the conditions that lead to a [`RETRY_SERIALIZABLE`](#retry_serializable) error, except that a transaction that hits this error got pushed for several minutes, but did not hit any of the conditions that trigger a `RETRY_SERIALIZABLE` error. In other words, the conditions that trigger this error are a subset of those that trigger `RETRY_SERIALIZABLE`, and that this transaction ran for too long (several minutes).

{{site.data.alerts.callout_info}}
Read-only transactions don't get pushed, so they don't run into this error.
{{site.data.alerts.end}}

This error occurs in the cases described below.

1. When a transaction _A_ has its timestamp moved forward (also known as _A_ being "pushed") as CockroachDB attempts to find a serializable transaction ordering. Specifically, transaction _A_ tried to write a key that transaction _B_ had already read. _B_ was supposed to be serialized after _A_ (i.e., _B_ had a higher timestamp than _A_). CockroachDB will try to serialize _A_ after _B_ by changing _A_'s timestamp.

2. When a [high-priority transaction](transactions.html#transaction-priorities) _A_ does a read that runs into a write intent from another lower-priority transaction _B_. Transaction _B_ may get this error when it tries to commit, because _A_ has already read some of the data touched by _B_ and returned results to the client.

3. When a transaction _A_ is forced to refresh (change its timestamp) due to hitting the maximum _closed timestamp_ interval (closed timestamps enable [Follower Reads](follower-reads.html#how-follower-reads-work) and [Change Data Capture (CDC)](stream-data-out-of-cockroachdb-using-changefeeds.html)). This can happen when transaction _A_ is a long-running transaction, and there is a write by another transaction to data that _A_ has already read.

_Action_:

1. The `RETRY_COMMIT_DEADLINE_EXCEEDED` error is one case where the standard advice to add a retry loop to your application may not be advisable. A transaction that runs for long enough to get pushed beyond its deadline is quite likely to fail again on retry for the same reasons. Therefore, the best thing to do in this case is to shrink the running time of your transactions so they complete more quickly and do not hit the deadline.
2. If you encounter case 3 above, you can increase the `kv.closed_timestamp.target_duration` setting to a higher value. Unfortunately, there is no indication from this error code that a too-low closed timestamp setting is the issue. Therefore, you may need to rule out cases 1 and 2 (or experiment with increasing the closed timestamp interval, if that is possible for your application - see the note below).

{{site.data.alerts.callout_info}}
If you increase the `kv.closed_timestamp.target_duration` setting, it means that you are increasing the amount of time by which the data available in [Follower Reads](follower-reads.html) and [CDC changefeeds](stream-data-out-of-cockroachdb-using-changefeeds.html) lags behind the current state of the cluster. In other words, there is a trade-off here: if you absolutely must execute long-running transactions that execute concurrently with other transactions that are writing to the same data, you may have to settle for longer delays on Follower Reads and/or CDC to avoid frequent serialization errors. The anomaly that would be exhibited if these transactions were not retried is called [write skew](https://www.cockroachlabs.com/blog/what-write-skew-looks-like/).
{{site.data.alerts.end}}

### ABORT_REASON_ABORTED_RECORD_FOUND

```
TransactionRetryWithProtoRefreshError:TransactionAbortedError(ABORT_REASON_ABORTED_RECORD_FOUND) ...
```

_Description_:

The `ABORT_REASON_ABORTED_RECORD_FOUND` error means that the client application is trying to use a transaction that has been aborted. This happens in one of the following cases:

- Write-write conflict: Another [high-priority transaction](transactions.html#transaction-priorities) _B_ encountered a write intent by our transaction _A_, and tried to push _A_'s timestamp.
- Cluster overload: _B_ thinks that _A_'s transaction coordinator node is dead, because the coordinator node hasn't heartbeated the transaction record for a few seconds.
- Deadlock: Some transaction _B_ is trying to acquire conflicting locks in reverse order from transaction _A_.

_Action_:

If you are encountering deadlocks:

- Avoid producing deadlocks in your application by making sure that transactions acquire locks in the same order.

If you are using only default [transaction priorities](transactions.html#transaction-priorities):

- This error means your cluster has problems. You are likely overloading it. Investigate the source of the overload, and do something about it. For more information, see [Node liveness issues](cluster-setup-troubleshooting.html#node-liveness-issues).

If you are using [high- or low-priority transactions](transactions.html#transaction-priorities):

- Update your app to retry on serialization errors (where `SQLSTATE` is `40001`), as described in [client-side retry handling](transactions.html#client-side-intervention).
- Design your schema and queries to reduce contention. For more information about how contention occurs and how to avoid it, see [Understanding and avoiding transaction contention](performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention). In particular, if you are able to [send all of the statements in your transaction in a single batch](transactions.html#batched-statements), CockroachDB can usually automatically retry the entire transaction for you.

### ABORT_REASON_CLIENT_REJECT

```
TransactionRetryWithProtoRefreshError:TransactionAbortedError(ABORT_REASON_CLIENT_REJECT) ...
```

_Description_:

The `ABORT_REASON_CLIENT_REJECT` error is caused by the same conditions as the [`ABORT_REASON_ABORTED_RECORD_FOUND`](#abort_reason_aborted_record_found), and requires the same actions. The errors are fundamentally the same, except that they are discovered at different points in the process.

### ABORT_REASON_PUSHER_ABORTED

```
TransactionRetryWithProtoRefreshError:TransactionAbortedError(ABORT_REASON_PUSHER_ABORTED) ...
```

_Description_:

The `ABORT_REASON_PUSHER_ABORTED` error is caused by the same conditions as the [`ABORT_REASON_ABORTED_RECORD_FOUND`](#abort_reason_aborted_record_found), and requires the same actions. The errors are fundamentally the same, except that they are discovered at different points in the process.

### ABORT_REASON_ABORT_SPAN

```
TransactionRetryWithProtoRefreshError:TransactionAbortedError(ABORT_REASON_ABORT_SPAN) ...
```

_Description_:

The `ABORT_REASON_ABORT_SPAN` error is caused by the same conditions as the [`ABORT_REASON_ABORTED_RECORD_FOUND`](#abort_reason_aborted_record_found), and requires the same actions. The errors are fundamentally the same, except that they are discovered at different points in the process.

### ABORT_REASON_NEW_LEASE_PREVENTS_TXN

```
TransactionRetryWithProtoRefreshError:TransactionAbortedError(ABORT_REASON_NEW_LEASE_PREVENTS_TXN) ...
```

_Description_:

The `ABORT_REASON_NEW_LEASE_PREVENTS_TXN` error occurs because the timestamp cache will not allow transaction _A_ to create a transaction record. A new lease wipes the timestamp cache, so this could mean the [leaseholder](architecture/life-of-a-distributed-transaction.html#leaseholder-node) was moved and the duration of transaction _A_ was unlucky enough to happen across a lease acquisition. In other words, leaseholders got shuffled out from underneath transaction _A_ (due to no fault of the client application or schema design), and now it has to be retried.

_Action_:

Retry transaction _A_ as described in [client-side retry handling](transactions.html#client-side-intervention).

### ABORT_REASON_TIMESTAMP_CACHE_REJECTED

```
TransactionRetryWithProtoRefreshError:TransactionAbortedError(ABORT_REASON_TIMESTAMP_CACHE_REJECTED) ...
```

_Description_:

The `ABORT_REASON_TIMESTAMP_CACHE_REJECTED` error occurs when the timestamp cache will not allow transaction _A_ to create a transaction record. This can happen due to a [range merge](range-merges.html) happening in the background, or because the timestamp cache is an in-memory cache, and has outgrown its memory limit (about 64 MB).

_Action_:

Retry transaction _A_ as described in [client-side retry handling](transactions.html#client-side-intervention).

## See also

- [Common Errors](common-errors.html)
- [Transactions](transactions.html)
- [Client-side retry handling](transactions.html#client-side-intervention)
- [Understanding and avoiding transaction contention](performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention)
- [DB Console Transactions Page](ui-transactions-page.html)
- [Architecture - Transaction Layer](architecture/transaction-layer.html)