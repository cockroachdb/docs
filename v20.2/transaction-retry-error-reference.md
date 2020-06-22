---
title: Transaction Retry Error Reference
summary: A list of the transaction retry (serialization) errors emitted by CockroachDB, including likely causes and user actions for mitigation.
toc: true
---

This page has a list of the transaction retry error codes emitted by CockroachDB.

Transaction retry errors, also known as serialization errors, use the `SQLSTATE` error code `40001`, and emit error messages with the string `restart transaction`. These indicate that a transaction failed because it could not be placed into a [serializable ordering](demo-serializable.html) among all of the currently-executing transactions. This usually happens due to a [transaction conflict](architecture/transaction-layer.html#transaction-conflicts) with another concurrent or recent transaction that is trying to write to the same data. This is also known as contention. When these errors occur due to contention, the transaction needs to be retried by the client as described in [client-side retry handling](transactions.html#client-side-intervention).

In less common cases, transaction retry errors are not caused by contention, but by the internal state of the CockroachDB cluster. For example, the cluster could be overloaded. In such cases, other actions may need to be taken above and beyond client-side retries.

See below for a complete list of retry error codes. For each error code, we describe:

- Why the error is happening.
- What to do about it.

{{site.data.alerts.callout_info}}
This page is meant to provide information about specific transaction retry error codes to make troubleshooting easier. In most cases, the correct actions to take when these errors occur are:  
1. Update your app to retry on serialization errors (where `SQLSTATE` is `40001`), as described in [client-side retry handling](transactions.html#client-side-intervention).  
2. Design your schema and queries to reduce contention. For more information about how contention occurs and how to avoid it, see [Understanding and avoiding transaction contention](performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention). In particular, if you are able to [send all of the statements in your transaction in a single batch](transactions.html#batched-statements), CockroachDB can usually automatically retry the entire transaction for you.  
Note that your application's retry logic does not need to distinguish between the different types of serialization errors. They are listed here for reference during advanced troubleshooting.
{{site.data.alerts.end}}

## Overview

CockroachDB always attempts to find a [serializable ordering](demo-serializable.html) among all of the currently-executing transactions.

Whenever possible, CockroachDB will [auto-retry a transaction internally](transactions.html#automatic-retries) without ever notifying the client. CockroachDB will only send a serialization error to the client when it cannot resolve the error automatically without client-side intervention.

In other words, by the time a serialization error bubbles up to the client, CockroachDB has already tried to handle the error internally, and could not.

The main reason why CockroachDB cannot auto-retry every serialization error without ever sending an error to the client is that the SQL language is "conversational" by design. The client can send arbitrary statements to the server during a transaction, receive some results, and then decide to issue other arbitrary statements inside the same transaction based on the server's response. By "client" we could mean [a Java application using JDBC](build-a-java-app-with-cockroachdb.html), or an analyst typing [`BEGIN`](begin-transaction.html) directly to [a SQL shell](cockroach-sql.html). In either case, the client is free to issue a `BEGIN`, wait an arbitrary amount of time, and issue additional statements. Meanwhile, other transactions are being processed by the system, potentially writing to the same data.

This means that there is no way for the server to always retry the arbitrary statements sent so far inside an open transaction. If there are different results for any given statement than there were at an earlier point in the currently open transaction's lifetime (likely due to the operations of other, concurrently-executing transactions), CockroachDB must defer to the client to decide how to handle that situation.

This is why we recommend [keeping transactions as small as possible](performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention).

## Error reference

- [Retry write too old](#retry-write-too-old)
- [Retry serializable](#retry-serializable)
- [Retry async write failure](#retry-async-write-failure)
- [Read within uncertainty interval](#read-within-uncertainty-interval)
- [Retry commit deadline exceeded](#retry-commit-deadline-exceeded)
- [Abort reason aborted record found](#abort-reason-aborted-record-found)
- [Abort reason client reject](#abort-reason-client-reject)
- [Abort reason pusher aborted](#abort-reason-pusher-aborted)
- [Abort reason abort span](#abort-reason-abort-span)
- [Abort reason new lease prevents txn](#abort-reason-new-lease-prevents-txn)
- [Abort reason timestamp cache rejected](#abort-reason-timestamp-cache-rejected)

### Retry write too old

```
TransactionRetryWithProtoRefreshError: ... RETRY_WRITE_TOO_OLD ...
```

_Description_:

The `RETRY_WRITE_TOO_OLD` error occurs when a transaction _A_ tries to write to a row, but another transaction _B_ that was supposed to be serialized after _A_ (i.e., had been assigned a lower timestamp), has already written to that row, and has already committed. This is a common error when you have too much contention in your workload.

_Action_:

1. Retry transaction _A_ as described in [client-side retry handling](transactions.html#client-side-intervention).
2. Design your schema and queries to reduce contention. For more information about how contention occurs and how to avoid it, see [Understanding and avoiding transaction contention](performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention). In particular, if you are able to [send all of the statements in your transaction in a single batch](transactions.html#batched-statements), CockroachDB can usually automatically retry the entire transaction for you.

### Retry serializable

```
TransactionRetryWithProtoRefreshError: ... RETRY_SERIALIZABLE ...
```

_Description_:

The `RETRY_SERIALIZABLE` error occurs in the following scenarios:

1. When a transaction _A_ has its timestamp moved forward (also known as _A_ being "pushed") as CockroachDB attempts to find a serializable transaction ordering. Specifically, transaction _A_ tried to write a key that transaction _B_ had already read. _B_ was supposed to be serialized after _A_ (i.e., _B_ had a higher timestamp than _A_). CockroachDB will try to serialize _A_ after _B_ by changing _A_'s timestamp, but it cannot do that when another transaction has subsequently written to some of the keys that _A_ has read and returned to the client. When that happens, the `RETRY_SERIALIZATION` error is signalled. The solution for this case is to [add a retry loop to your application](transactions.html#client-side-intervention).

2. When a high-priority transaction _A_ does a read that runs into a write intent from another lower-priority transaction _B_. Transaction _B_ will get this error when it tries to commit, because _A_ has already read some of the data touched by _B_ and returned results to the client. The solution for this is to [add a retry loop to your application](transactions.html#client-side-intervention).

3. When a transaction _A_ is forced to refresh (change its timestamp) due to hitting the maximum _closed timestamp_ interval (closed timestamps enable [Follower Reads](follower-reads.html#how-follower-reads-work) and [Change Data Capture (CDC)](change-data-capture.html)). This can happen when transaction _A_ is a long-running transaction, and there is a write by another transaction to data that _A_ has already read. If this is the cause of the error, the solution is to increase the [`kv.closed_timestamp.target_duration` setting](cluster-settings.html) to a higher value. Unfortunately, there is no indication from this error code that a too-low closed timestamp setting is the issue. Therefore, you may need to rule out cases 1 and 2 (or experiment with increasing the closed timestamp interval, if that is possible for your application - see the note below).

{{site.data.alerts.callout_info}}
If you increase the `kv.closed_timestamp.target_duration` setting, it means that you are increasing the amount of time by which the data available in [Follower Reads](follower-reads.html) and [CDC changefeeds](change-data-capture.html) lags behind the current state of the cluster. In other words, there is a trade-off here: if you absolutely must execute long-running transactions that execute concurrently with other transactions that are writing to the same data, you may have to settle for longer delays on Follower Reads and/or CDC to avoid frequent serialization errors. The anomaly that would be exhibited if these transactions were not retried is called [write skew](https://www.cockroachlabs.com/blog/what-write-skew-looks-like/).
{{site.data.alerts.end}}

_Action_:

1. If you encounter case 1 above, the solution is to [add a retry loop to your application](transactions.html#client-side-intervention).

2. If you encounter case 2 above, the solution is to [add a retry loop to your application](transactions.html#client-side-intervention).

3. If you encounter case 3 above, the solution is to increase the [`kv.closed_timestamp.target_duration` setting](cluster-settings.html) to a higher value. As described above, this will impact the freshness of data available via [Follower Reads](follower-reads.html) and [CDC changefeeds](change-data-capture.html).

### Retry async write failure

```
TransactionRetryWithProtoRefreshError: ... RETRY_ASYNC_WRITE_FAILURE ...
```

_Description_:

The `RETRY_ASYNC_WRITE_FAILURE` error occurs when some kind of problem with your cluster's operation occurs at the moment of a previous write in the transaction, causing us to fail to replicate one of the transaction's writes. For example, this can happen if you have a networking partition that cuts off access to some nodes in your cluster.

_Action_:

Because this is due to a problem with your cluster, there is no solution from the application's point of view. You must investigate the problems with your cluster.

### Read within uncertainty interval

```
TransactionRetryWithProtoRefreshError: ReadWithinUncertaintyIntervalError:
        read at time 1591009232.376925064,0 encountered previous write with future timestamp 1591009232.493830170,0 within uncertainty interval `t <= 1591009232.587671686,0`;
        observed timestamps: [{1 1591009232.587671686,0} {5 1591009232.376925064,0}]
```

_Description_:

The `ReadWithinUncertaintyIntervalError` can occur when two transactions which start on different gateway nodes attempt to operate on the same data at close to the same time, and one of the operations is a write. The uncertainty comes from the fact that we cannot tell which one started first - the clocks on the two gateway nodes may not be perfectly in sync.

For example, if the clock on node _A_ is ahead of the clock on node _B_, a transaction started on node _A_ may be able to commit a write with a timestamp that is still in the "future" from the perspective of node _B_. A later transaction that starts on node _B_ should be able to see the earlier write from node _A_, even if _B_'s clock has not caught up to _A_. The "read within uncertainty interval" occurs if we discover this situation in the middle of a transaction, when it is too late for the database to handle it automatically. When node _B_'s transaction retries, it will unambiguously occur after the transaction from node _A_.

This behavior is non-deterministic: it depends on which node is the leaseholder of the underlying data range; it’s generally a sign of contention. Uncertainty errors are always possible with near-realtime reads under contention.

_Action_:

The solution is to do one of the following:

1. Be prepared to retry on uncertainty (and other) errors, as described in [client-side retry handling](transactions.html#client-side-intervention). As long as the client-side retry protocol is followed, a transaction that has restarted once is much less likely to hit another uncertainty error.
2. Use historical reads with [`SELECT ... AS OF SYSTEM TIME`](as-of-system-time.html)
3. Design your schema and queries to reduce contention. For more information about how contention occurs and how to avoid it, see [Understanding and avoiding transaction contention](performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention). In particular, if you are able to [send all of the statements in your transaction in a single batch](transactions.html#batched-statements), CockroachDB can usually automatically retry the entire transaction for you.
4. If you trust your clocks, you can try lowering the [`--max-offset` option to `cockroach start`](cockroach-start.html#flags), which provides an upper limit on how long a transaction can continue to restart due to uncertainty.

{{site.data.alerts.callout_info}}
Uncertainty errors are a form of transaction conflict. For more information about transaction conflicts, see [Transaction conflicts](architecture/transaction-layer.html#transaction-conflicts).
{{site.data.alerts.end}}

### Retry commit deadline exceeded

```
TransactionRetryWithProtoRefreshError: TransactionPushError: transaction deadline exceeded ...
```

_Description_:

The `RETRY_COMMIT_DEADLINE_EXCEEDED` error means that the transaction timed out due to being pushed by other concurrent transactions. This error is most likely to happen to long-running transactions.

{{site.data.alerts.callout_info}}
Read-only transactions don't get pushed, so they don't run into this error.
{{site.data.alerts.end}}

This error occurs in the following scenarios:

1. When a transaction _A_ has its timestamp moved forward (also known as _A_ being "pushed") as CockroachDB attempts to find a serializable transaction ordering. Specifically, transaction _A_ tried to write a key that transaction _B_ had already read. _B_ was supposed to be serialized after _A_ (i.e., _B_ had a higher timestamp than _A_). CockroachDB will try to serialize _A_ after _B_ by changing _A_'s timestamp, but it cannot do that when another transaction has subsequently written to some of the keys that _A_ has read and returned to the client. When that happens, the `RETRY_SERIALIZATION` error is signalled. The solution for this case is to [add a retry loop to your application](transactions.html#client-side-intervention).

2. When a high-priority transaction _A_ does a read that runs into a write intent from another lower-priority transaction _B_. Transaction _B_ will get this error when it tries to commit, because _A_ has already read some of the data touched by _B_ and returned results to the client. The solution for this is to [add a retry loop to your application](transactions.html#client-side-intervention).

3. When a transaction _A_ is forced to refresh (change its timestamp) due to hitting the maximum _closed timestamp_ interval (closed timestamps enable [Follower Reads](follower-reads.html#how-follower-reads-work) and [Change Data Capture (CDC)](change-data-capture.html)). This can happen when transaction _A_ is a long-running transaction, and there is a write by another transaction to data that _A_ has already read. If this is the cause of the error, the solution is to increase the [`kv.closed_timestamp.target_duration` setting](cluster-settings.html) to a higher value. Unfortunately, there is no indication from this error code that a too-low closed timestamp setting is the issue. Therefore, you may need to rule out cases 1 and 2 (or experiment with increasing the closed timestamp interval, if that is possible for your application - see the note below).

{{site.data.alerts.callout_info}}
If you increase the `kv.closed_timestamp.target_duration` setting, it means that you are increasing the amount of time by which the data available in [Follower Reads](follower-reads.html) and [CDC changefeeds](change-data-capture.html) lags behind the current state of the cluster. In other words, there is a trade-off here: if you absolutely must execute long-running transactions that execute concurrently with other transactions that are writing to the same data, you may have to settle for longer delays on Follower Reads and/or CDC to avoid frequent serialization errors. The anomaly that would be exhibited if these transactions were not retried is called [write skew](https://www.cockroachlabs.com/blog/what-write-skew-looks-like/).
{{site.data.alerts.end}}

_Action_:

1. If you encounter case 1 above, the solution is to [add a retry loop to your application](transactions.html#client-side-intervention).

2. If you encounter case 2 above, the solution is to [add a retry loop to your application](transactions.html#client-side-intervention).

3. If you encounter case 3 above, the solution is to increase the [`kv.closed_timestamp.target_duration` setting](cluster-settings.html) to a higher value. As described above, this will impact the freshness of data available via [Follower Reads](follower-reads.html) and [CDC changefeeds](change-data-capture.html). If you want to run transactions that take longer than 5 minutes to complete, you need to bump up the `kv.closed_timestamp.target_duration` setting to a value higher than the duration between the start of the transaction and the last write that the transaction performs -- that's the last time when the closed timestamp would push the transaction.

### Abort reason aborted record found

```
TransactionRetryWithProtoRefreshError:TransactionAbortedError(ABORT_REASON_ABORTED_RECORD_FOUND) ...
```

_Description_:

The `ABORT_REASON_ABORTED_RECORD_FOUND` error is caused by a write-write conflict. It means that another transaction _B_ encountered one of our transaction _A_'s write intents, and _B_ aborted _A_. This happens in one of the following cases:

1. _B_ is a higher-priority transaction than _A_
2. _B_ thinks that _A_'s transaction coordinator node is dead, because the coordinator node hasn't heartbeated the transaction record for a few seconds. This case indicates some trouble with the cluster - usually overload.

_Action_:

If you are not using high-priority transactions:

- This error means your cluster has problems. You are likely overloading it.
- Investigate the source of the overload, and do something about it. For more information, see [Node liveness issues](cluster-setup-troubleshooting.html#node-liveness-issues).

If you are using high-priority transactions:

1. Update your app to retry on serialization errors (where `SQLSTATE` is `40001`), as described in [client-side retry handling](transactions.html#client-side-intervention).
2. Design your schema and queries to reduce contention. For more information about how contention occurs and how to avoid it, see [Understanding and avoiding transaction contention](performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention). In particular, if you are able to [send all of the statements in your transaction in a single batch](transactions.html#batched-statements), CockroachDB can usually automatically retry the entire transaction for you.

### Abort reason client reject

```
TransactionRetryWithProtoRefreshError:TransactionAbortedError(ABORT_REASON_CLIENT_REJECT) ...
```

_Description_:

The `ABORT_REASON_CLIENT_REJECT` error means that the client application is trying to use a transaction that has been aborted. This is usually not due to any action on the part of the client application. It is usually caused by the same underlying reasons as the [abort reason aborted record found](#abort-reason-aborted-record-found) error, namely one of:

- Write-write conflict: Another high-priority transaction _B_ encountered a write intent by our transaction _A_, and tried to push _A_'s timestamp.
- Cluster overload: _B_ thinks that _A_'s transaction coordinator node is dead, because the coordinator node hasn't heartbeated the transaction record for a few seconds.

_Action_:

If you are not using high-priority transactions:

- This error means your cluster has problems. You are likely overloading it.
- Investigate the source of the overload, and do something about it. For more information, see [Node liveness issues](cluster-setup-troubleshooting.html#node-liveness-issues).

If you are using high-priority transactions:

1. Update your app to retry on serialization errors (where `SQLSTATE` is `40001`), as described in [client-side retry handling](transactions.html#client-side-intervention).
2. Design your schema and queries to reduce contention. For more information about how contention occurs and how to avoid it, see [Understanding and avoiding transaction contention](performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention). In particular, if you are able to [send all of the statements in your transaction in a single batch](transactions.html#batched-statements), CockroachDB can usually automatically retry the entire transaction for you.

### Abort reason pusher aborted

```
TransactionRetryWithProtoRefreshError:TransactionAbortedError(ABORT_REASON_PUSHER_ABORTED) ...
```

_Description_:

The `ABORT_REASON_PUSHER_ABORTED` error can happen when a transaction _A_ is aborted by some other concurrent transaction _B_, probably due to a deadlock. _A_ tried to push another transaction's timestamp, but while waiting for the push to succeed, it was aborted.

_Action_:

If you are seeing this error:

1. Avoid producing deadlocks in your application by making sure that transactions acquire locks in the same order. Deadlocks happen when different transactions try to acquire conflicting locks in reverse order from one another.
2. Update your app to retry on serialization errors (where `SQLSTATE` is `40001`), as described in [client-side retry handling](transactions.html#client-side-intervention).
3. Design your schema and queries to reduce contention. For more information about how contention occurs and how to avoid it, see [Understanding and avoiding transaction contention](performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention). In particular, if you are able to [send all of the statements in your transaction in a single batch](transactions.html#batched-statements), CockroachDB can usually automatically retry the entire transaction for you.

### Abort reason abort span

```
TransactionRetryWithProtoRefreshError:TransactionAbortedError(ABORT_REASON_ABORT_SPAN) ...
```

_Description_:

The `ABORT_REASON_ABORT_SPAN` error occurs when a transaction A tries to read from a range where it had previously laid down intents. Meanwhile, the intents have already been cleaned up, because A was aborted.

_Action_:

- Retry transaction _A_ as described in [client-side retry handling](transactions.html#client-side-intervention).

### Abort reason new lease prevents txn

```
TransactionRetryWithProtoRefreshError:TransactionAbortedError(ABORT_REASON_NEW_LEASE_PREVENTS_TXN) ...
```

_Description_:

The `ABORT_REASON_NEW_LEASE_PREVENTS_TXN` error occurs because the timestamp cache will not allow transaction _A_ to create a transaction record. A new lease wipes the timestamp cache, so this could mean the leaseholder was moved and the duration of transaction _A_ was unlucky enough to happen across a lease acquisition. In other words, leaseholders got shuffled out from underneath transaction _A_ (due to no fault of the client application or schema design), and now it has to be retried.

_Action_:

- Retry transaction _A_ as described in [client-side retry handling](transactions.html#client-side-intervention).

### Abort reason timestamp cache rejected

```
TransactionRetryWithProtoRefreshError:TransactionAbortedError(ABORT_REASON_TIMESTAMP_CACHE_REJECTED) ...
```

_Description_:

The `ABORT_REASON_TIMESTAMP_CACHE_REJECTED` error occurs when the timestamp cache will not allow transaction _A_ to create a transaction record. This can happen due to a [range merge](range-merges.html) happening in the background, or because the timestamp cache is an in-memory cache, and has outgrown its memory limit (about 64 MB).

_Action_:

- Retry transaction _A_ as described in [client-side retry handling](transactions.html#client-side-intervention).

## See also

- [Common Errors](common-errors.html)
- [Transactions](transactions.html)
- [Client-side retry handling](transactions.html#client-side-intervention)
- [Understanding and avoiding transaction contention](performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention)
- [Architecture - Transaction Layer](architecture/transaction-layer.html)
