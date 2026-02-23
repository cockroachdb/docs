---
title: Transaction Retry Error Reference
summary: A list of the transaction retry errors emitted by CockroachDB, including likely causes and user actions for mitigation.
toc: true
docs_area: reference.transaction_retry_error_reference
---

When a [transaction]({% link {{ page.version.version }}/transactions.md %}) is unable to complete due to [contention]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#understanding-and-avoiding-transaction-contention) with another concurrent or recent transaction attempting to write to the same data, CockroachDB will [automatically attempt to retry the failed transaction]({% link {{ page.version.version }}/transactions.md %}#automatic-retries) without involving the client (i.e., silently). If the automatic retry is not possible or fails, a _transaction retry error_ is emitted to the client.

Transaction retry errors fall into two categories:

- *Serialization errors* indicate that a transaction failed because it could not be placed into a serializable ordering among all of the currently-executing transactions. 

   - [`SERIALIZABLE`]({% link {{ page.version.version }}/demo-serializable.md %}) transactions must address these errors with client-side intervention, where the client [initiates a restart of the transaction](#client-side-retry-handling), and [adjusts application logic and tunes queries](#minimize-transaction-retry-errors) for greater performance.
   - [`READ COMMITTED`]({% link {{ page.version.version }}/read-committed.md %}) transactions do **not** return [serialization errors]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}) that require client-side handling.

- *Internal state errors* indicate that the cluster itself is experiencing an issue, such as being [overloaded]({% link {{ page.version.version }}/ui-overload-dashboard.md %}), which prevents the transaction from completing. These errors generally require both cluster-side and client-side intervention, where an operator addresses an issue with the cluster before the client then [initiates a restart of the transaction](#client-side-retry-handling).

All transaction retry errors use the `SQLSTATE` error code `40001`, and emit error messages with the string [`restart transaction`]({% link {{ page.version.version }}/common-errors.md %}#restart-transaction). Further, each error includes a [specific error code](#transaction-retry-error-reference) to assist with targeted troubleshooting.

When experiencing transaction retry errors, you should follow the guidance under [Actions to take](#actions-to-take), and then consult the reference for your [specific transaction retry error](#transaction-retry-error-reference) for guidance specific to the error message encountered.

## Overview

At the default `SERIALIZABLE` isolation level, CockroachDB always attempts to find a [serializable ordering]({% link {{ page.version.version }}/demo-serializable.md %}) among all of the currently-executing transactions.

Whenever possible, CockroachDB will [auto-retry a transaction internally]({% link {{ page.version.version }}/transactions.md %}#automatic-retries) without notifying the client. CockroachDB will only send a serialization error to the client when it cannot resolve the error automatically without client-side intervention.

[`READ COMMITTED`]({% link {{ page.version.version }}/read-committed.md %}) transactions can transparently resolve serialization errors by [retrying individual statements]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#read-snapshots) rather than entire transactions.

## Actions to take

{% include {{ page.version.version }}/performance/transaction-retry-error-actions.md %}

### Client-side retry handling

When running under [`SERIALIZABLE`]({% link {{ page.version.version }}/demo-serializable.md %}) isolation, your application should include client-side retry handling when the statements are sent individually, such as:

~~~
> BEGIN;

> UPDATE products SET inventory = 0 WHERE sku = '8675309';

> INSERT INTO orders (customer, status) VALUES (1, 'new');

> COMMIT;
~~~

To indicate that a transaction must be retried, CockroachDB signals a serialization error with the `SQLSTATE` error code `40001` and an error message that begins with the string `"restart transaction"`.

To handle these types of errors, you have the following options:

- If your database library or framework provides a method for retryable transactions (it will often be documented as a tool for handling deadlocks), use it.
- If you're building an application in the following languages, Cockroach Labs has created adapters that include automatic retry handling:
   - **Go** developers using [GORM](https://github.com/jinzhu/gorm) or [pgx](https://github.com/jackc/pgx) can use the [`github.com/cockroachdb/cockroach-go/crdb`](https://github.com/cockroachdb/cockroach-go/tree/master/crdb) package. For an example, see [Build a Go App with CockroachDB]({% link {{ page.version.version }}/build-a-go-app-with-cockroachdb.md %}).
   - **Python** developers using [SQLAlchemy](https://www.sqlalchemy.org) can use the [`sqlalchemy-cockroachdb` adapter](https://github.com/cockroachdb/sqlalchemy-cockroachdb). For an example, see [Build a Python App with CockroachDB and SQLAlchemy]({% link {{ page.version.version }}/build-a-python-app-with-cockroachdb-sqlalchemy.md %}).
   - **Ruby (Active Record)** developers can use the [`activerecord-cockroachdb-adapter`](https://rubygems.org/gems/activerecord-cockroachdb-adapter). For an example, see [Build a Ruby App with CockroachDB and Active Record]({% link {{ page.version.version }}/build-a-ruby-app-with-cockroachdb-activerecord.md %}).
- If you're building an application with another driver or data access framework that is [supported by CockroachDB]({% link {{ page.version.version }}/third-party-database-tools.md %}), we recommend reusing the retry logic in our ["Simple CRUD" Example Apps]({% link {{ page.version.version }}/example-apps.md %}). For example, **Java** developers accessing the database with [JDBC](https://jdbc.postgresql.org) can reuse the example code implementing retry logic shown in [Build a Java app with CockroachDB]({% link {{ page.version.version }}/build-a-java-app-with-cockroachdb.md %}).
- If you're building an application with a language and framework for which we do not provide example retry logic, you might need to write your own retry logic. For an example, see the [Client-side retry handling example]({% link {{ page.version.version }}/transaction-retry-error-example.md %}).
- **Advanced users, such as library authors**: See [Advanced Client-Side Transaction Retries]({% link {{ page.version.version }}/advanced-client-side-transaction-retries.md %}).

#### Client-side retry handling example

For a conceptual example of application-defined retry logic, and testing that logic against your application's needs, see the [client-side retry handling example]({% link {{ page.version.version }}/transaction-retry-error-example.md %}).

### Minimize transaction retry errors

In addition to the steps described in [Client-side retry handling](#client-side-retry-handling), which detail how to configure your application to restart a failed transaction, there are also a number of changes you can make to your application logic to reduce the number of transaction retry errors that reach the client application under `SERIALIZABLE` isolation.

Reduce failed transactions caused by [timestamp pushes]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#timestamp-cache) or [read invalidation]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#read-refreshing):

{% include {{ page.version.version }}/performance/reduce-contention.md %}

Increase the chance that CockroachDB can [automatically retry]({% link {{ page.version.version }}/transactions.md %}#automatic-retries) a failed transaction:

{% include {{ page.version.version }}/performance/increase-server-side-retries.md %}

## Transaction retry error reference

Note that your application's retry logic does not need to distinguish between the different types of serialization errors. They are listed here for reference during [advanced troubleshooting]({% link {{ page.version.version }}/performance-recipes.md %}#transaction-contention).

- [`RETRY_WRITE_TOO_OLD`](#retry_write_too_old)
- [`RETRY_SERIALIZABLE`](#retry_serializable)
- [`RETRY_ASYNC_WRITE_FAILURE`](#retry_async_write_failure)
- [`ReadWithinUncertaintyIntervalError`](#readwithinuncertaintyintervalerror)
- [`RETRY_COMMIT_DEADLINE_EXCEEDED`](#retry_commit_deadline_exceeded)
- [`ABORT_REASON_ABORTED_RECORD_FOUND`](#abort_reason_aborted_record_found)
- [`ABORT_REASON_CLIENT_REJECT`](#abort_reason_client_reject)
- [`ABORT_REASON_PUSHER_ABORTED`](#abort_reason_pusher_aborted)
- [`ABORT_REASON_ABORT_SPAN`](#abort_reason_abort_span)
- [`ABORT_REASON_NEW_LEASE_PREVENTS_TXN`](#abort_reason_new_lease_prevents_txn)
- [`ABORT_REASON_TIMESTAMP_CACHE_REJECTED`](#abort_reason_timestamp_cache_rejected)
- [injected by `inject_retry_errors_enabled` session variable](#injected-by-inject_retry_errors_enabled-session-variable)

Each transaction retry error listed includes an example error as it would appear from the context of the client, a description of the circumstances that cause that error, and specific guidance for addressing the error.

### RETRY_WRITE_TOO_OLD

```
TransactionRetryWithProtoRefreshError: ... RETRY_WRITE_TOO_OLD ...
```

**Error type:** Serialization error

**Description:**

The `RETRY_WRITE_TOO_OLD` error occurs when a transaction _A_ tries to write to a row _R_, but another transaction _B_ that was supposed to be serialized after _A_ (i.e., had been assigned a higher timestamp), has already written to that row _R_, and has already committed. Under `SERIALIZABLE` isolation, this is a common error when you have too much contention in your workload.

**Action:**

Under [`SERIALIZABLE`]({% link {{ page.version.version }}/demo-serializable.md %}) isolation:

1. Retry transaction _A_ as described in [client-side retry handling](#client-side-retry-handling).
1. Adjust your application logic as described in [minimize transaction retry errors](#minimize-transaction-retry-errors). In particular, try to:

   1. Send all of the statements in your transaction in a [single batch]({% link {{ page.version.version }}/transactions.md %}#batched-statements).
   1. Use [`SELECT FOR UPDATE`]({% link {{ page.version.version }}/select-for-update.md %}) to aggressively lock rows that will later be updated in the transaction.

Under [`READ COMMITTED`]({% link {{ page.version.version }}/read-committed.md %}) isolation:
      
1. `RETRY_WRITE_TOO_OLD` errors are only returned in rare cases that can be avoided by adjusting the [result buffer size](#result-buffer-size).

### RETRY_SERIALIZABLE

```
TransactionRetryWithProtoRefreshError: ... RETRY_SERIALIZABLE ...
```

The error message for `RETRY_SERIALIZABLE` contains additional information about the transaction conflict which led to the error, as shown below. This error message can also be viewed in the [DB Console]({% link {{ page.version.version }}/ui-overview.md %}) by navigating to [**Insights Page** &#8594; **Workload Insights** &#8594; **Transaction Executions** and clicking on the transaction ID to see the **Failed Execution** insight]({% link {{ page.version.version }}/ui-insights-page.md %}#failed-execution).

```
restart transaction: TransactionRetryWithProtoRefreshError: TransactionRetryError: retry txn (RETRY_SERIALIZABLE  - failed preemptive refresh due to conflicting locks on /Table/106/1/918951292305080321/0 [reason=wait_policy] - conflicting txn: meta={id=1b2bf263 key=/Table/106/1/918951292305080321/0 iso=Serializable pri=0.00065863 epo=0 ts=1700512205.521833000,2 min=1700512148.761403000,0 seq=1}): "sql txn" meta={id=07d42834 key=/Table/106/1/918951292305211393/0 iso=Serializable pri=0.01253025 epo=0 ts=1700512229.378453000,2 min=1700512130.342117000,0 seq=2} lock=true stat=PENDING rts=1700512130.342117000,0 wto=false gul=1700512130.842117000,0
SQLSTATE: 40001
HINT: See: https://www.cockroachlabs.com/docs/{{ page.version.version }}/transaction-retry-error-reference.html#retry_serializable
```

**Error type:** Serialization error

**Description:**

{{site.data.alerts.callout_success}}
[`READ COMMITTED`]({% link {{ page.version.version }}/read-committed.md %}) transactions do **not** produce `RETRY_SERIALIZABLE` errors.
{{site.data.alerts.end}}

At a high level, the `RETRY_SERIALIZABLE` error occurs when a transaction's timestamp is moved forward, but the transaction performed reads at the old timestamp that are no longer valid at its new timestamp. More specifically, the `RETRY_SERIALIZABLE` error occurs in the following three cases under [`SERIALIZABLE`]({% link {{ page.version.version }}/demo-serializable.md %}) isolation:

1. When a transaction _A_ has its timestamp moved forward (also known as _A_ being "pushed") as CockroachDB attempts to find a serializable transaction ordering. Specifically, transaction _A_ tried to write a key that transaction _B_ had already read, and _B_ was supposed to be serialized after _A_ (i.e., _B_ had a higher timestamp than _A_). CockroachDB will try to serialize _A_ after _B_ by changing _A_'s timestamp, but it cannot do that when another transaction has subsequently written to some of the keys that _A_ has read and returned to the client. When that happens, the `RETRY_SERIALIZATION` error is signalled. For more information about how timestamp pushes work in our transaction model, see the [architecture docs on the transaction layer's timestamp cache]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#timestamp-cache).

1. When a [high-priority transaction]({% link {{ page.version.version }}/transactions.md %}#transaction-priorities) _A_ does a read that runs into a write intent from another lower-priority transaction _B_, and some other transaction _C_ writes to a key that _B_ has already read. Transaction _B_ will get this error when it tries to commit, because _A_ has already read some of the data touched by _B_ and returned results to the client, and _C_ has written data previously read by _B_.

1. When a transaction _A_ is forced to refresh (i.e., change its timestamp) due to hitting the maximum [_closed timestamp_]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#closed-timestamps) interval (closed timestamps enable [Follower Reads]({% link {{ page.version.version }}/follower-reads.md %}#how-stale-follower-reads-work) and [Change Data Capture (CDC)]({% link {{ page.version.version }}/change-data-capture-overview.md %})). This can happen when transaction _A_ is a long-running transaction, and there is a write by another transaction to data that _A_ has already read. Unfortunately, there is no indication from this error code that a too-low closed timestamp setting is the issue. Therefore, you may need to rule out cases 1 and 2.

*Failed preemptive refresh*
<a name="failed_preemptive_refresh"></a>

In the three preceding cases, CockroachDB will try to validate whether the read-set of the transaction that had its timestamp (`timestamp1`) pushed is still valid at the new timestamp (`timestamp3`) at commit time. This mechanism is called "performing a [read refresh]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#read-refreshing)". If the read-set is still valid, the transaction can commit. If it is not valid, the transaction will get a `RETRY_SERIALIZABLE - failed preemptive refresh` error. The refresh can fail for two reasons:

1. There is a committed value on a key that was read by the transaction at `timestamp2` (where `timestamp2` occurs between `timestamp1` and `timestamp3`). The error message will contain `due to encountered recently written committed value`. CockroachDB does not have any information about which conflicting transaction wrote to this key.
1. There is an intent on a key that was read by the transaction at `timestamp2` (where `timestamp2` occurs between `timestamp1` and `timestamp3`). The error message will contain `due to conflicting locks`. CockroachDB does have information about the conflicting transaction to which the intent belongs. The information about the [conflicting transaction]({% link {{ page.version.version }}/ui-insights-page.md %}#serialization-conflict-due-to-transaction-contention) can be seen on the [DB Console Insights page]({% link {{ page.version.version }}/ui-insights-page.md %}).

**Action:**

Under [`SERIALIZABLE`]({% link {{ page.version.version }}/demo-serializable.md %}) isolation:

1. Retry transaction _A_ as described in [client-side retry handling](#client-side-retry-handling).
1. Adjust your application logic as described in [minimize transaction retry errors](#minimize-transaction-retry-errors). In particular, try to:
   1. Send all of the statements in your transaction in a [single batch]({% link {{ page.version.version }}/transactions.md %}#batched-statements).
   1. Use historical reads with [`SELECT ... AS OF SYSTEM TIME`]({% link {{ page.version.version }}/as-of-system-time.md %}).
   1. Use [`SELECT FOR UPDATE`]({% link {{ page.version.version }}/select-for-update.md %}) to aggressively lock rows for the keys that were read and could not be refreshed.

### RETRY_ASYNC_WRITE_FAILURE

```
TransactionRetryWithProtoRefreshError: ... RETRY_ASYNC_WRITE_FAILURE ...
```

**Error type:** Internal state error

**Description:**

The `RETRY_ASYNC_WRITE_FAILURE` error occurs when some kind of problem with your cluster's operation occurs at the moment of a previous write in the transaction, causing CockroachDB to fail to replicate one of the transaction's writes. This can happen if a [lease transfer]({% link {{ page.version.version }}/architecture/replication-layer.md %}#leases) occurs while the transaction is executing, or less commonly if you have a [network partition]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#network-partition) that cuts off access to some nodes in your cluster.

**Action:**

1. Retry the transaction as described in [client-side retry handling](#client-side-retry-handling). This is worth doing because the problem with the cluster is likely to be transient.
1. Investigate the problems with your cluster.  For cluster troubleshooting information, see [Troubleshoot Cluster Setup]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}).

See [Minimize transaction retry errors](#minimize-transaction-retry-errors) for the full list of recommendations.

### ReadWithinUncertaintyIntervalError

```
TransactionRetryWithProtoRefreshError: ReadWithinUncertaintyIntervalError:
        read at time 1591009232.376925064,0 encountered previous write with future timestamp 1591009232.493830170,0 within uncertainty interval `t <= 1591009232.587671686,0`;
        observed timestamps: [{1 1591009232.587671686,0} {5 1591009232.376925064,0}] meta={key=/Table/9373/10/5293921467191001339/0 ...}
```

**Error type:** Serialization error

**Description:**

The `ReadWithinUncertaintyIntervalError` can occur when two transactions which start on different gateway nodes attempt to operate on the same data at close to the same time, and one of the operations is a write. The uncertainty comes from the fact that we cannot tell which one started first - the clocks on the two gateway nodes may not be perfectly in sync.

For example, if the clock on node _A_ is ahead of the clock on node _B_, a transaction started on node _A_ may be able to commit a write with a timestamp that is still in the "future" from the perspective of node _B_. A later transaction that starts on node _B_ should be able to see the earlier write from node _A_, even if _B_'s clock has not caught up to _A_. The "read within uncertainty interval" occurs if we discover this situation in the middle of a transaction, when it is too late for the database to handle it automatically. When node _B_'s transaction retries, it will unambiguously occur after the transaction from node _A_.

{{site.data.alerts.callout_info}}
This behavior is non-deterministic: it depends on which node is the [leaseholder]({% link {{ page.version.version }}/architecture/life-of-a-distributed-transaction.md %}#leaseholder-node) of the underlying data range. It’s generally a sign of contention. Uncertainty errors are always possible with near-realtime reads under contention.
{{site.data.alerts.end}}

**Action:**

Under [`SERIALIZABLE`]({% link {{ page.version.version }}/demo-serializable.md %}) isolation:

1. Be prepared to retry on uncertainty (and other) errors, as described in [client-side retry handling](#client-side-retry-handling).
1. Adjust your application logic as described in [minimize transaction retry errors](#minimize-transaction-retry-errors). In particular, try to:
   1. Send all of the statements in your transaction in a [single batch]({% link {{ page.version.version }}/transactions.md %}#batched-statements).
   1. Use historical reads with [`SELECT ... AS OF SYSTEM TIME`]({% link {{ page.version.version }}/as-of-system-time.md %}).
1. If you [trust your clocks]({% link {{ page.version.version }}/operational-faqs.md %}#what-happens-when-node-clocks-are-not-properly-synchronized), you can try lowering the [`--max-offset` option to `cockroach start`]({% link {{ page.version.version }}/cockroach-start.md %}#flags), which provides an upper limit on how long a transaction can continue to restart due to uncertainty.

Under [`READ COMMITTED`]({% link {{ page.version.version }}/read-committed.md %}) isolation:

1. `ReadWithinUncertaintyIntervalError` errors are only returned in rare cases that can be avoided by adjusting the [result buffer size](#result-buffer-size).

**Interpreting log messages:** 

In CockroachDB {{ page.version.version }}, the `meta={... key=/Table/...}` field that appears in log output for `ReadWithinUncertaintyIntervalError` and related serialization conflicts identifies the transaction's [transaction record (anchor) key]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#transaction-records), not necessarily the key where the conflict occurred. This anchor key is the first key written by the transaction and is where its record is stored. Contention events that are recorded when [`sql.contention.record_serialization_conflicts.enabled`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-sql-contention-record-serialization-conflicts-enabled) is `true` use this anchor key when populating the recorded conflict.

{{site.data.alerts.callout_info}}
Uncertainty errors are a sign of transaction conflict. For more information about transaction conflicts, see [Transaction conflicts]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#transaction-conflicts).
{{site.data.alerts.end}}

### RETRY_COMMIT_DEADLINE_EXCEEDED

```
TransactionRetryWithProtoRefreshError: TransactionRetryError: transaction deadline exceeded ...
```

**Error type:** Internal state error

**Description:**

The `RETRY_COMMIT_DEADLINE_EXCEEDED` error means that the transaction timed out due to being pushed by other concurrent transactions. This error is most likely to happen to long-running transactions. The conditions that trigger this error are very similar to the conditions that lead to a [`RETRY_SERIALIZABLE`](#retry_serializable) error, except that a transaction that hits this error got pushed for several minutes, but did not hit any of the conditions that trigger a `RETRY_SERIALIZABLE` error. In other words, the conditions that trigger this error are a subset of those that trigger `RETRY_SERIALIZABLE`, and that this transaction ran for too long (several minutes).

{{site.data.alerts.callout_info}}
Read-only transactions do not get pushed, so they do not run into this error.
{{site.data.alerts.end}}

This error occurs in the cases described below.

1. When a transaction _A_ has its timestamp moved forward (also known as _A_ being "pushed") as CockroachDB attempts to find a serializable transaction ordering. Specifically, transaction _A_ tried to write a key that transaction _B_ had already read. _B_ was supposed to be serialized after _A_ (i.e., _B_ had a higher timestamp than _A_). CockroachDB will try to serialize _A_ after _B_ by changing _A_'s timestamp.

1. When a [high-priority transaction]({% link {{ page.version.version }}/transactions.md %}#transaction-priorities) _A_ does a read that runs into a write intent from another lower-priority transaction _B_. Transaction _B_ may get this error when it tries to commit, because _A_ has already read some of the data touched by _B_ and returned results to the client.

1. When a transaction _A_ is forced to refresh (change its timestamp) due to hitting the maximum [_closed timestamp_]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#closed-timestamps) interval (closed timestamps enable [Follower Reads]({% link {{ page.version.version }}/follower-reads.md %}#how-stale-follower-reads-work) and [Change Data Capture (CDC)]({% link {{ page.version.version }}/change-data-capture-overview.md %})). This can happen when transaction _A_ is a long-running transaction, and there is a write by another transaction to data that _A_ has already read.

**Action:**

1. The `RETRY_COMMIT_DEADLINE_EXCEEDED` error is one case where the standard advice to add a retry loop to your application may not be advisable. A transaction that runs for long enough to get pushed beyond its deadline is quite likely to fail again on retry for the same reasons. Therefore, the best thing to do in this case is to shrink the running time of your transactions so they complete more quickly and do not hit the deadline.
1. If you encounter case 3 above, you can increase the `kv.closed_timestamp.target_duration` setting to a higher value. Unfortunately, there is no indication from this error code that a too-low closed timestamp setting is the issue. Therefore, you may need to rule out cases 1 and 2 (or experiment with increasing the closed timestamp interval, if that is possible for your application - see the note below).

{{site.data.alerts.callout_info}}
If you increase the `kv.closed_timestamp.target_duration` setting, it means that you are increasing the amount of time by which the data available in [Follower Reads]({% link {{ page.version.version }}/follower-reads.md %}) and [CDC changefeeds]({% link {{ page.version.version }}/change-data-capture-overview.md %}) lags behind the current state of the cluster. In other words, there is a trade-off here: if you absolutely must execute long-running transactions that execute concurrently with other transactions that are writing to the same data, you may have to settle for longer delays on Follower Reads and/or CDC to avoid frequent serialization errors. The anomaly that would be exhibited if these transactions were not retried is called [write skew](https://www.cockroachlabs.com/blog/what-write-skew-looks-like/).
{{site.data.alerts.end}}

See [Minimize transaction retry errors](#minimize-transaction-retry-errors) for the full list of recommendations.

### ABORT_REASON_ABORTED_RECORD_FOUND

```
TransactionRetryWithProtoRefreshError:TransactionAbortedError(ABORT_REASON_ABORTED_RECORD_FOUND) ...
```

**Error type:** Internal state error

**Description:**

The `ABORT_REASON_ABORTED_RECORD_FOUND` error means that the client application is trying to use a transaction that has been aborted. This happens in one of the following cases:

- Write-write conflict: Another [high-priority transaction]({% link {{ page.version.version }}/transactions.md %}#transaction-priorities) _B_ encountered a write intent by our transaction _A_, and tried to push _A_'s timestamp.
- Cluster overload: _B_ thinks that _A_'s transaction coordinator node is dead, because the coordinator node hasn't heartbeated the transaction record for a few seconds.
- Deadlock: Some transaction _B_ is trying to acquire conflicting locks in reverse order from transaction _A_.

**Action:**

If you are encountering deadlocks:

- Avoid producing deadlocks in your application by making sure that transactions acquire locks in the same order.

If you are using only default [transaction priorities]({% link {{ page.version.version }}/transactions.md %}#transaction-priorities):

- This error means your cluster has problems. You are likely overloading it. Investigate the source of the overload, and do something about it. The best place to start investigating is the [**Overload Dashboard**]({% link {{ page.version.version }}/ui-overload-dashboard.md %}).

If you are using [high- or low-priority transactions]({% link {{ page.version.version }}/transactions.md %}#transaction-priorities):

1. Retry the transaction as described in [client-side retry handling](#client-side-retry-handling)
1. Adjust your application logic as described in [minimize transaction retry errors](#minimize-transaction-retry-errors).

See [Minimize transaction retry errors](#minimize-transaction-retry-errors) for the full list of recommendations.

### ABORT_REASON_CLIENT_REJECT

```
TransactionRetryWithProtoRefreshError:TransactionAbortedError(ABORT_REASON_CLIENT_REJECT) ...
```

**Error type:** Internal state error

**Description:**

The `ABORT_REASON_CLIENT_REJECT` error is caused by the same conditions as the [`ABORT_REASON_ABORTED_RECORD_FOUND`](#abort_reason_aborted_record_found), and requires the same actions. The errors are fundamentally the same, except that they are discovered at different points in the process.

See [Minimize transaction retry errors](#minimize-transaction-retry-errors) for the full list of recommendations.

### ABORT_REASON_PUSHER_ABORTED

```
TransactionRetryWithProtoRefreshError:TransactionAbortedError(ABORT_REASON_PUSHER_ABORTED) ...
```

**Error type:** Internal state error

**Description:**

The `ABORT_REASON_PUSHER_ABORTED` error is caused by the same conditions as the [`ABORT_REASON_ABORTED_RECORD_FOUND`](#abort_reason_aborted_record_found), and requires the same actions. The errors are fundamentally the same, except that they are discovered at different points in the process.

See [Minimize transaction retry errors](#minimize-transaction-retry-errors) for the full list of recommendations.

### ABORT_REASON_ABORT_SPAN

```
TransactionRetryWithProtoRefreshError:TransactionAbortedError(ABORT_REASON_ABORT_SPAN) ...
```

**Error type:** Internal state error

**Description:**

The `ABORT_REASON_ABORT_SPAN` error is caused by the same conditions as the [`ABORT_REASON_ABORTED_RECORD_FOUND`](#abort_reason_aborted_record_found), and requires the same actions. The errors are fundamentally the same, except that they are discovered at different points in the process.

See [Minimize transaction retry errors](#minimize-transaction-retry-errors) for the full list of recommendations.

### ABORT_REASON_NEW_LEASE_PREVENTS_TXN

```
TransactionRetryWithProtoRefreshError:TransactionAbortedError(ABORT_REASON_NEW_LEASE_PREVENTS_TXN) ...
```

**Error type:** Internal state error

**Description:**

The `ABORT_REASON_NEW_LEASE_PREVENTS_TXN` error occurs because the [timestamp cache]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#timestamp-cache) will not allow transaction _A_ to create a [transaction record]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#transaction-records). A new lease wipes the timestamp cache, so this could mean the [leaseholder]({% link {{ page.version.version }}/architecture/life-of-a-distributed-transaction.md %}#leaseholder-node) was moved and the duration of transaction _A_ was unlucky enough to happen across a lease acquisition. In other words, leaseholders got shuffled out from underneath transaction _A_ (due to no fault of the client application or schema design), and now it has to be retried.

**Action:**

Retry transaction _A_ as described in [client-side retry handling](#client-side-retry-handling).

### ABORT_REASON_TIMESTAMP_CACHE_REJECTED

```
TransactionRetryWithProtoRefreshError:TransactionAbortedError(ABORT_REASON_TIMESTAMP_CACHE_REJECTED) ...
```

**Error type:** Internal state error

**Description:**

The `ABORT_REASON_TIMESTAMP_CACHE_REJECTED` error occurs when the [timestamp cache]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#timestamp-cache) will not allow transaction _A_ to create a [transaction record]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#transaction-records). This can happen due to a [range merge]({% link {{ page.version.version }}/architecture/distribution-layer.md %}#range-merges) happening in the background, or because the [timestamp cache]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#timestamp-cache) is an in-memory cache, and has outgrown its memory limit (about 64 MB).

**Action:**

Retry transaction _A_ as described in [client-side retry handling](#client-side-retry-handling).

### injected by `inject_retry_errors_enabled` session variable

```
 TransactionRetryWithProtoRefreshError: injected by `inject_retry_errors_enabled` session variable
```

**Error type:** Internal state error

**Description:**

When the `inject_retry_errors_enabled` [session variable]({% link {{ page.version.version }}/set-vars.md %}) is set to `true`, any statement (with the exception of [`SET` statements]({% link {{ page.version.version }}/set-vars.md %})) executed in the session inside of an explicit transaction will return this error.

For more details, see [Test transaction retry logic]({% link {{ page.version.version }}/transaction-retry-error-example.md %}#test-transaction-retry-logic).

**Action:**

To turn off error injection, set the `inject_retry_errors_enabled` session variable to `false`.

## See also

- [Common Errors and Solutions]({% link {{ page.version.version }}/common-errors.md %})
- [Transactions]({% link {{ page.version.version }}/transactions.md %})
- [Transaction Contention]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#transaction-contention)
- [Transaction Retry Error Example]({% link {{ page.version.version }}/transaction-retry-error-example.md %})
- [DB Console Transactions Page]({% link {{ page.version.version }}/ui-transactions-page.md %})
- [Architecture - Transaction Layer]({% link {{ page.version.version }}/architecture/transaction-layer.md %})
