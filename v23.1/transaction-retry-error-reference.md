---
title: Transaction Retry Error Reference
summary: A list of the transaction retry errors emitted by CockroachDB, including likely causes and user actions for mitigation.
toc: true
docs_area: reference.transaction_retry_error_reference
---

When a [transaction](transactions.html) is unable to complete due to [contention](architecture/overview.html#architecture-overview-contention) with another concurrent or recent transaction attempting to write to the same data, CockroachDB will [automatically attempt to retry the failed transaction](transactions.html#automatic-retries) without involving the client (i.e., silently). If the automatic retry is not possible or fails, a _transaction retry error_ is emitted to the client.

Transaction retry errors fall into two categories:

- **Serialization Errors** indicate that a transaction failed because it could not be placed into a [serializable ordering](demo-serializable.html) among all of the currently-executing transactions. These errors are generally addressed with client-side intervention, where the client [initiates a restart of the transaction](#client-side-retry-handling), and [adjusts application logic and tunes queries](#minimize-transaction-retry-errors) for greater performance.
- **Internal State Errors** indicate that the cluster itself is experiencing an issue, such as being [overloaded](ui-overload-dashboard.html), which prevents the transaction from completing. These errors generally require both cluster-side and client-side intervention, where an operator addresses an issue with the cluster before the client then [initiates a restart of the transaction](#client-side-retry-handling).

All transaction retry errors use the `SQLSTATE` error code `40001`, and emit error messages with the string [`restart transaction`](common-errors.html#restart-transaction). Further, each error includes a [specific error code](#transaction-retry-error-reference) to assist with targeted troubleshooting.

When experiencing transaction retry errors, you should follow the guidance under [Actions to take](#actions-to-take), and then consult the reference for your [specific transaction retry error](#transaction-retry-error-reference) for guidance specific to the error message encountered.

## Overview

CockroachDB always attempts to find a [serializable ordering](demo-serializable.html) among all of the currently-executing transactions.

Whenever possible, CockroachDB will [auto-retry a transaction internally](transactions.html#automatic-retries) without notifying the client. CockroachDB will only send a serialization error to the client when it cannot resolve the error automatically without client-side intervention.

The main reason why CockroachDB cannot auto-retry every serialization error without sending an error to the client is that the SQL language is "conversational" by design. The client can send arbitrary statements to the server during a transaction, receive some results, and then decide to issue other arbitrary statements inside the same transaction based on the server's response.

## Actions to take

In most cases, the correct actions to take when encountering transaction retry errors are:

1. Update your application to support [client-side retry handling](#client-side-retry-handling) when transaction retry errors are encountered.

1. Adjust your application logic to [minimize transaction retry errors](#minimize-transaction-retry-errors) in the first place.

### Client-side retry handling

Your application should include client-side retry handling when the statements are sent individually, such as:

~~~
> BEGIN;

> UPDATE products SET inventory = 0 WHERE sku = '8675309';

> INSERT INTO orders (customer, status) VALUES (1, 'new');

> COMMIT;
~~~

To indicate that a transaction must be retried, CockroachDB signals an error with the `SQLSTATE` error code `40001` (serialization error) and an error message that begins with the string `"restart transaction"`.

To handle these types of errors, you have the following options:

- If your database library or framework provides a method for retryable transactions (it will often be documented as a tool for handling deadlocks), use it.
- If you're building an application in the following languages, Cockroach Labs has created adapters that include automatic retry handling:
   - **Go** developers using [GORM](https://github.com/jinzhu/gorm) or [pgx](https://github.com/jackc/pgx) can use the [`github.com/cockroachdb/cockroach-go/crdb`](https://github.com/cockroachdb/cockroach-go/tree/master/crdb) package. For an example, see [Build a Go App with CockroachDB](build-a-go-app-with-cockroachdb.html).
   - **Python** developers using [SQLAlchemy](https://www.sqlalchemy.org) can use the [`sqlalchemy-cockroachdb` adapter](https://github.com/cockroachdb/sqlalchemy-cockroachdb). For an example, see [Build a Python App with CockroachDB and SQLAlchemy](build-a-python-app-with-cockroachdb-sqlalchemy.html).
   - **Ruby (Active Record)** developers can use the [`activerecord-cockroachdb-adapter`](https://rubygems.org/gems/activerecord-cockroachdb-adapter). For an example, see [Build a Ruby App with CockroachDB and Active Record](build-a-ruby-app-with-cockroachdb-activerecord.html).
- If you're building an application with another driver or data access framework that is [supported by CockroachDB](third-party-database-tools.html), we recommend reusing the retry logic in our ["Simple CRUD" Example Apps](example-apps.html). For example, **Java** developers accessing the database with [JDBC](https://jdbc.postgresql.org) can reuse the example code implementing retry logic shown in [Build a Java app with CockroachDB](build-a-java-app-with-cockroachdb.html).
- If you're building an application with a language and framework for which we do not provide example retry logic, you might need to write your own retry logic. For an example, see the [Client-side retry handling example](transaction-retry-error-example.html).
- **Advanced users, such as library authors**: See [Advanced Client-Side Transaction Retries](advanced-client-side-transaction-retries.html).

#### Client-side retry handling example

For a conceptual example of application-defined retry logic, and testing that logic against your application's needs, see the [client-side retry handling example](transaction-retry-error-example.html).

### Minimize transaction retry errors

In addition to the steps described in [Client-side retry handling](#client-side-retry-handling), which detail how to configure your application to restart a failed transaction, there are also a number of changes you can make to your application logic to increase the chance that CockroachDB can [automatically retry](transactions.html#automatic-retries) a failed transaction, and to reduce the number of transaction retry errors that reach the client application in the first place:

1. Limit the number of affected rows by following [performance-tuning best practices](apply-statement-performance-rules.html) (e.g., query performance tuning, index design and maintenance, etc.). Not only will transactions run faster and hold locks for a shorter duration, but the chances of [read invalidation](architecture/transaction-layer.html#read-refreshing) when the transaction’s [timestamp is pushed](architecture/transaction-layer.html#timestamp-cache) due to a conflicting write is decreased due to a smaller read set (i.e., a smaller number of rows read).

1. Break down larger transactions into smaller ones (e.g., [bulk deletes](bulk-delete-data.html)) to have transactions hold locks for a shorter duration. This will also decrease the likelihood of [pushed timestamps](architecture/transaction-layer.html#timestamp-cache) and retry errors. For instance, as the size of writes (number of rows written) decreases, the chances of the (bulk delete) transaction’s timestamp getting bumped by concurrent reads decreases.

1. Design your applications to reduce network round trips by [sending statements in transactions as a single batch](transactions.html#batched-statements) (e.g., using [common table expressions](common-table-expressions.html)). Batching allows CockroachDB to [automatically retry](transactions.html#automatic-retries) a transaction when [previous reads are invalidated](architecture/transaction-layer.html#read-refreshing) at a [pushed timestamp](architecture/transaction-layer.html#timestamp-cache). When a multi-statement transaction is not batched, and takes more than a single round trip, CockroachDB cannot automatically retry the transaction.

1. Limit the size of the result sets of your transactions to under 16KB, so that CockroachDB is more likely to [automatically retry](transactions.html#automatic-retries) when [previous reads are invalidated](architecture/transaction-layer.html#read-refreshing) at a [pushed timestamp](architecture/transaction-layer.html#timestamp-cache). When a transaction returns a result set over 16KB, even if that transaction has been sent as a single batch, CockroachDB cannot automatically retry the transaction.

1. Use [`SELECT FOR UPDATE`](select-for-update.html) to aggressively lock rows that will later be updated in the transaction. Locking (blocking) earlier in the transaction will not allow other concurrent write transactions to conflict which leads to a situation where we would return out-of-date information subsequently returning a retry error ([`RETRY_WRITE_TOO_OLD`](#retry_write_too_old)). See [When and why to use `SELECT FOR UPDATE` in CockroachDB](https://www.cockroachlabs.com/blog/when-and-why-to-use-select-for-update-in-cockroachdb/) for more information.

1. Use historical reads ([`SELECT ... AS OF SYSTEM TIME`](as-of-system-time.html)), preferably [bounded staleness reads](follower-reads.html#when-to-use-bounded-staleness-reads) or [exact staleness with follower reads](follower-reads.html#run-queries-that-use-exact-staleness-follower-reads) when possible to reduce conflicts with other writes. This reduces the likelihood of conflicts as fewer writes will happen at the historical timestamp. More specifically, writes’ timestamps are less likely to be pushed by historical reads as they would [when the read has a higher priority level](architecture/transaction-layer.html#transaction-conflicts).

1. If applicable to your workload, assign [column families](column-families.html#default-behavior) and separate columns that are frequently read and written into separate columns. Transactions will operate on disjoint column families and reduce the likelihood of conflicts. 

1. As a last resort, consider adjusting the [closed timestamp interval](architecture/transaction-layer.html#closed-timestamps) using the `kv.closed_timestamp.target_duration` [cluster setting](cluster-settings.html) to reduce the likelihood of long-running write transactions having their [timestamps pushed](architecture/transaction-layer.html#timestamp-cache). This setting should be carefully adjusted if **no other mitigations are available** because there can be downstream implications (e.g., Historical reads, change data capture feeds, Stats collection, handling zone configurations, etc.). For example, a transaction _A_ is forced to refresh (i.e., change its timestamp) due to hitting the maximum [_closed timestamp_](architecture/transaction-layer.html#closed-timestamps) interval (closed timestamps enable [Follower Reads](follower-reads.html#how-stale-follower-reads-work) and [Change Data Capture (CDC)](change-data-capture-overview.html)). This can happen when transaction _A_ is a long-running transaction, and there is a write by another transaction to data that _A_ has already read. See the reference entry for [`RETRY_SERIALIZABLE`](#retry_serializable) for more information.

## Transaction retry error reference

Note that your application's retry logic does not need to distinguish between the different types of serialization errors. They are listed here for reference during advanced troubleshooting.

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
- [injected by `inject_retry_errors_enabled` session variable](#injected-by-inject_retry_errors_enabled-session-variable)

Each transaction retry error listed includes an example error as it would appear from the context of the client, a description of the circumstances that cause that error, and specific guidance for addressing the error.

### RETRY_WRITE_TOO_OLD

```
TransactionRetryWithProtoRefreshError: ... RETRY_WRITE_TOO_OLD ...
```

**Error type:** Serialization error

**Description:**

The `RETRY_WRITE_TOO_OLD` error occurs when a transaction _A_ tries to write to a row _R_, but another transaction _B_ that was supposed to be serialized after _A_ (i.e., had been assigned a higher timestamp), has already written to that row _R_, and has already committed. This is a common error when you have too much contention in your workload.

**Action:**

1. Retry transaction _A_ as described in [client-side retry handling](#client-side-retry-handling).
1. Adjust your application logic as described in [minimize transaction retry errors](#minimize-transaction-retry-errors). In particular, try to:

   1. Send all of the statements in your transaction in a [single batch](transactions.html#batched-statements).
   1. Use [`SELECT FOR UPDATE`](select-for-update.html) to aggressively lock rows that will later be updated in the transaction.

See [Minimize transaction retry errors](#minimize-transaction-retry-errors) for the full list of recommended remediations.

### RETRY_SERIALIZABLE

```
TransactionRetryWithProtoRefreshError: ... RETRY_SERIALIZABLE ...
```

**Error type:** Serialization error

**Description:**

The `RETRY_SERIALIZABLE` error occurs in the following cases:

1. When a transaction _A_ has its timestamp moved forward (also known as _A_ being "pushed") as CockroachDB attempts to find a serializable transaction ordering. Specifically, transaction _A_ tried to write a key that transaction _B_ had already read, and _B_ was supposed to be serialized after _A_ (i.e., _B_ had a higher timestamp than _A_). CockroachDB will try to serialize _A_ after _B_ by changing _A_'s timestamp, but it cannot do that when another transaction has subsequently written to some of the keys that _A_ has read and returned to the client. When that happens, the `RETRY_SERIALIZATION` error is signalled. For more information about how timestamp pushes work in our transaction model, see the [architecture docs on the transaction layer's timestamp cache](architecture/transaction-layer.html).

1. When a [high-priority transaction](transactions.html#transaction-priorities) _A_ does a read that runs into a write intent from another lower-priority transaction _B_, and some other transaction _C_ writes to a key that _B_ has already read. Transaction _B_ will get this error when it tries to commit, because _A_ has already read some of the data touched by _B_ and returned results to the client, and _C_ has written data previously read by _B_.

1. When a transaction _A_ is forced to refresh (i.e., change its timestamp) due to hitting the maximum [_closed timestamp_](architecture/transaction-layer.html#closed-timestamps) interval (closed timestamps enable [Follower Reads](follower-reads.html#how-stale-follower-reads-work) and [Change Data Capture (CDC)](change-data-capture-overview.html)). This can happen when transaction _A_ is a long-running transaction, and there is a write by another transaction to data that _A_ has already read. If this is the cause of the error, the solution is to increase the `kv.closed_timestamp.target_duration` setting to a higher value. Unfortunately, there is no indication from this error code that a too-low closed timestamp setting is the issue. Therefore, you may need to rule out cases 1 and 2 (or experiment with increasing the closed timestamp interval, if that is possible for your application - see the note below).

**Action:**

1. If you encounter case 1 or 2 above, the solution is to:
   1. Retry transaction _A_ as described in [client-side retry handling](#client-side-retry-handling).
   1. Adjust your application logic as described in [minimize transaction retry errors](#minimize-transaction-retry-errors). In particular, try to:
      1. Send all of the statements in your transaction in a [single batch](transactions.html#batched-statements).
      1. Use historical reads with [`SELECT ... AS OF SYSTEM TIME`](as-of-system-time.html).

1. If you encounter case 3 above, the solution is to:
   1. Increase the `kv.closed_timestamp.target_duration` setting to a higher value. As described above, this will impact the freshness of data available via [Follower Reads](follower-reads.html) and [CDC changefeeds](change-data-capture-overview.html).
   1. Retry transaction _A_ as described in [client-side retry handling](#client-side-retry-handling).
   1. Adjust your application logic as described in [minimize transaction retry errors](#minimize-transaction-retry-errors). In particular, try to:
      1. Send all of the statements in your transaction in a [single batch](transactions.html#batched-statements).
      1. Use historical reads with [`SELECT ... AS OF SYSTEM TIME`](as-of-system-time.html).

{{site.data.alerts.callout_info}}
If you increase the `kv.closed_timestamp.target_duration` setting, it means that you are increasing the amount of time by which the data available in [Follower Reads](follower-reads.html) and [CDC changefeeds](change-data-capture-overview.html) lags behind the current state of the cluster. In other words, there is a trade-off here: if you absolutely must execute long-running transactions that execute concurrently with other transactions that are writing to the same data, you may have to settle for longer delays on Follower Reads and/or CDC to avoid frequent serialization errors. The anomaly that would be exhibited if these transactions were not retried is called [write skew](https://www.cockroachlabs.com/blog/what-write-skew-looks-like/).
{{site.data.alerts.end}}

See [Minimize transaction retry errors](#minimize-transaction-retry-errors) for the full list of recommended remediations.

### RETRY_ASYNC_WRITE_FAILURE

```
TransactionRetryWithProtoRefreshError: ... RETRY_ASYNC_WRITE_FAILURE ...
```

**Error type:** Internal state error

**Description:**

The `RETRY_ASYNC_WRITE_FAILURE` error occurs when some kind of problem with your cluster's operation occurs at the moment of a previous write in the transaction, causing CockroachDB to fail to replicate one of the transaction's writes. For example, this can happen if you have a networking partition that cuts off access to some nodes in your cluster.

**Action:**

1. Retry the transaction as described in [client-side retry handling](#client-side-retry-handling). This is worth doing because the problem with the cluster is likely to be transient.
1. Investigate the problems with your cluster.  For cluster troubleshooting information, see [Troubleshoot Cluster Setup](cluster-setup-troubleshooting.html).

See [Minimize transaction retry errors](#minimize-transaction-retry-errors) for the full list of recommended remediations.

### ReadWithinUncertaintyInterval

```
TransactionRetryWithProtoRefreshError: ReadWithinUncertaintyIntervalError:
        read at time 1591009232.376925064,0 encountered previous write with future timestamp 1591009232.493830170,0 within uncertainty interval `t <= 1591009232.587671686,0`;
        observed timestamps: [{1 1591009232.587671686,0} {5 1591009232.376925064,0}]
```

**Error type:** Serialization error

**Description:**

The `ReadWithinUncertaintyIntervalError` can occur when two transactions which start on different gateway nodes attempt to operate on the same data at close to the same time, and one of the operations is a write. The uncertainty comes from the fact that we cannot tell which one started first - the clocks on the two gateway nodes may not be perfectly in sync.

For example, if the clock on node _A_ is ahead of the clock on node _B_, a transaction started on node _A_ may be able to commit a write with a timestamp that is still in the "future" from the perspective of node _B_. A later transaction that starts on node _B_ should be able to see the earlier write from node _A_, even if _B_'s clock has not caught up to _A_. The "read within uncertainty interval" occurs if we discover this situation in the middle of a transaction, when it is too late for the database to handle it automatically. When node _B_'s transaction retries, it will unambiguously occur after the transaction from node _A_.

{{site.data.alerts.callout_info}}
This behavior is non-deterministic: it depends on which node is the [leaseholder](architecture/life-of-a-distributed-transaction.html#leaseholder-node) of the underlying data range. It’s generally a sign of contention. Uncertainty errors are always possible with near-realtime reads under contention.
{{site.data.alerts.end}}

**Action:**

The solution is to do one of the following:

1. Be prepared to retry on uncertainty (and other) errors, as described in [client-side retry handling](#client-side-retry-handling).
1. Adjust your application logic as described in [minimize transaction retry errors](#minimize-transaction-retry-errors). In particular, try to:
   1. Send all of the statements in your transaction in a [single batch](transactions.html#batched-statements).
   1. Use historical reads with [`SELECT ... AS OF SYSTEM TIME`](as-of-system-time.html).
1. If you [trust your clocks](operational-faqs.html#what-happens-when-node-clocks-are-not-properly-synchronized), you can try lowering the [`--max-offset` option to `cockroach start`](cockroach-start.html#flags), which provides an upper limit on how long a transaction can continue to restart due to uncertainty.

{{site.data.alerts.callout_info}}
Uncertainty errors are a form of transaction conflict. For more information about transaction conflicts, see [Transaction conflicts](architecture/transaction-layer.html#transaction-conflicts).
{{site.data.alerts.end}}

See [Minimize transaction retry errors](#minimize-transaction-retry-errors) for the full list of recommended remediations.

### RETRY_COMMIT_DEADLINE_EXCEEDED

```
TransactionRetryWithProtoRefreshError: TransactionPushError: transaction deadline exceeded ...
```

**Error type:** Serialization error

**Description:**

The `RETRY_COMMIT_DEADLINE_EXCEEDED` error means that the transaction timed out due to being pushed by other concurrent transactions. This error is most likely to happen to long-running transactions. The conditions that trigger this error are very similar to the conditions that lead to a [`RETRY_SERIALIZABLE`](#retry_serializable) error, except that a transaction that hits this error got pushed for several minutes, but did not hit any of the conditions that trigger a `RETRY_SERIALIZABLE` error. In other words, the conditions that trigger this error are a subset of those that trigger `RETRY_SERIALIZABLE`, and that this transaction ran for too long (several minutes).

{{site.data.alerts.callout_info}}
Read-only transactions do not get pushed, so they do not run into this error.
{{site.data.alerts.end}}

This error occurs in the cases described below.

1. When a transaction _A_ has its timestamp moved forward (also known as _A_ being "pushed") as CockroachDB attempts to find a serializable transaction ordering. Specifically, transaction _A_ tried to write a key that transaction _B_ had already read. _B_ was supposed to be serialized after _A_ (i.e., _B_ had a higher timestamp than _A_). CockroachDB will try to serialize _A_ after _B_ by changing _A_'s timestamp.

1. When a [high-priority transaction](transactions.html#transaction-priorities) _A_ does a read that runs into a write intent from another lower-priority transaction _B_. Transaction _B_ may get this error when it tries to commit, because _A_ has already read some of the data touched by _B_ and returned results to the client.

1. When a transaction _A_ is forced to refresh (change its timestamp) due to hitting the maximum [_closed timestamp_](architecture/transaction-layer.html#closed-timestamps) interval (closed timestamps enable [Follower Reads](follower-reads.html#how-stale-follower-reads-work) and [Change Data Capture (CDC)](change-data-capture-overview.html)). This can happen when transaction _A_ is a long-running transaction, and there is a write by another transaction to data that _A_ has already read.

**Action:**

1. The `RETRY_COMMIT_DEADLINE_EXCEEDED` error is one case where the standard advice to add a retry loop to your application may not be advisable. A transaction that runs for long enough to get pushed beyond its deadline is quite likely to fail again on retry for the same reasons. Therefore, the best thing to do in this case is to shrink the running time of your transactions so they complete more quickly and do not hit the deadline.
1. If you encounter case 3 above, you can increase the `kv.closed_timestamp.target_duration` setting to a higher value. Unfortunately, there is no indication from this error code that a too-low closed timestamp setting is the issue. Therefore, you may need to rule out cases 1 and 2 (or experiment with increasing the closed timestamp interval, if that is possible for your application - see the note below).

{{site.data.alerts.callout_info}}
If you increase the `kv.closed_timestamp.target_duration` setting, it means that you are increasing the amount of time by which the data available in [Follower Reads](follower-reads.html) and [CDC changefeeds](change-data-capture-overview.html) lags behind the current state of the cluster. In other words, there is a trade-off here: if you absolutely must execute long-running transactions that execute concurrently with other transactions that are writing to the same data, you may have to settle for longer delays on Follower Reads and/or CDC to avoid frequent serialization errors. The anomaly that would be exhibited if these transactions were not retried is called [write skew](https://www.cockroachlabs.com/blog/what-write-skew-looks-like/).
{{site.data.alerts.end}}

See [Minimize transaction retry errors](#minimize-transaction-retry-errors) for the full list of recommended remediations.

### ABORT_REASON_ABORTED_RECORD_FOUND

```
TransactionRetryWithProtoRefreshError:TransactionAbortedError(ABORT_REASON_ABORTED_RECORD_FOUND) ...
```

**Error type:** Serialization error

**Description:**

The `ABORT_REASON_ABORTED_RECORD_FOUND` error means that the client application is trying to use a transaction that has been aborted. This happens in one of the following cases:

- Write-write conflict: Another [high-priority transaction](transactions.html#transaction-priorities) _B_ encountered a write intent by our transaction _A_, and tried to push _A_'s timestamp.
- Cluster overload: _B_ thinks that _A_'s transaction coordinator node is dead, because the coordinator node hasn't heartbeated the transaction record for a few seconds.
- Deadlock: Some transaction _B_ is trying to acquire conflicting locks in reverse order from transaction _A_.

**Action:**

If you are encountering deadlocks:

- Avoid producing deadlocks in your application by making sure that transactions acquire locks in the same order.

If you are using only default [transaction priorities](transactions.html#transaction-priorities):

- This error means your cluster has problems. You are likely overloading it. Investigate the source of the overload, and do something about it. For more information, see [Node liveness issues](cluster-setup-troubleshooting.html#node-liveness-issues).

If you are using [high- or low-priority transactions](transactions.html#transaction-priorities):

1. Retry the transaction as described in [client-side retry handling](#client-side-retry-handling)
1. Adjust your application logic as described in [minimize transaction retry errors](#minimize-transaction-retry-errors).

See [Minimize transaction retry errors](#minimize-transaction-retry-errors) for the full list of recommended remediations.

### ABORT_REASON_CLIENT_REJECT

```
TransactionRetryWithProtoRefreshError:TransactionAbortedError(ABORT_REASON_CLIENT_REJECT) ...
```

**Error type:** Serialization error

**Description:**

The `ABORT_REASON_CLIENT_REJECT` error is caused by the same conditions as the [`ABORT_REASON_ABORTED_RECORD_FOUND`](#abort_reason_aborted_record_found), and requires the same actions. The errors are fundamentally the same, except that they are discovered at different points in the process.

See [Minimize transaction retry errors](#minimize-transaction-retry-errors) for the full list of recommended remediations.

### ABORT_REASON_PUSHER_ABORTED

```
TransactionRetryWithProtoRefreshError:TransactionAbortedError(ABORT_REASON_PUSHER_ABORTED) ...
```

**Error type:** Serialization error

**Description:**

The `ABORT_REASON_PUSHER_ABORTED` error is caused by the same conditions as the [`ABORT_REASON_ABORTED_RECORD_FOUND`](#abort_reason_aborted_record_found), and requires the same actions. The errors are fundamentally the same, except that they are discovered at different points in the process.

See [Minimize transaction retry errors](#minimize-transaction-retry-errors) for the full list of recommended remediations.

### ABORT_REASON_ABORT_SPAN

```
TransactionRetryWithProtoRefreshError:TransactionAbortedError(ABORT_REASON_ABORT_SPAN) ...
```

**Error type:** Serialization error

**Description:**

The `ABORT_REASON_ABORT_SPAN` error is caused by the same conditions as the [`ABORT_REASON_ABORTED_RECORD_FOUND`](#abort_reason_aborted_record_found), and requires the same actions. The errors are fundamentally the same, except that they are discovered at different points in the process.

See [Minimize transaction retry errors](#minimize-transaction-retry-errors) for the full list of recommended remediations.

### ABORT_REASON_NEW_LEASE_PREVENTS_TXN

```
TransactionRetryWithProtoRefreshError:TransactionAbortedError(ABORT_REASON_NEW_LEASE_PREVENTS_TXN) ...
```

**Error type:** Internal state error

**Description:**

The `ABORT_REASON_NEW_LEASE_PREVENTS_TXN` error occurs because the timestamp cache will not allow transaction _A_ to create a transaction record. A new lease wipes the timestamp cache, so this could mean the [leaseholder](architecture/life-of-a-distributed-transaction.html#leaseholder-node) was moved and the duration of transaction _A_ was unlucky enough to happen across a lease acquisition. In other words, leaseholders got shuffled out from underneath transaction _A_ (due to no fault of the client application or schema design), and now it has to be retried.

**Action:**

Retry transaction _A_ as described in [client-side retry handling](#client-side-retry-handling).

### ABORT_REASON_TIMESTAMP_CACHE_REJECTED

```
TransactionRetryWithProtoRefreshError:TransactionAbortedError(ABORT_REASON_TIMESTAMP_CACHE_REJECTED) ...
```

**Error type:** Internal state error

**Description:**

The `ABORT_REASON_TIMESTAMP_CACHE_REJECTED` error occurs when the timestamp cache will not allow transaction _A_ to create a transaction record. This can happen due to a [range merge](architecture/distribution-layer.html#range-merges) happening in the background, or because the timestamp cache is an in-memory cache, and has outgrown its memory limit (about 64 MB).

**Action:**

Retry transaction _A_ as described in [client-side retry handling](#client-side-retry-handling).

### injected by `inject_retry_errors_enabled` session variable

```
 TransactionRetryWithProtoRefreshError: injected by `inject_retry_errors_enabled` session variable
```

**Error type:** Internal state error

**Description:**

When the `inject_retry_errors_enabled` [session variable](set-vars.html) is set to `true`, any statement (with the exception of [`SET` statements](set-vars.html)) executed in the session inside of an explicit transaction will return this error.

For more details, see [Testing transaction retry logic](transaction-retry-error-example.html#testing-transaction-retry-logic).

**Action:**

To turn off error injection, set the `inject_retry_errors_enabled` session variable to `false`.

## See also

- [Common Errors and Solutions](common-errors.html)
- [Transactions](transactions.html)
- [Transaction Contention](performance-best-practices-overview.html#transaction-contention)
- [Transaction Retry Error Example](transaction-retry-error-example.html)
- [DB Console Transactions Page](ui-transactions-page.html)
- [Architecture - Transaction Layer](architecture/transaction-layer.html)
