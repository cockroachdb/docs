---
title: Transactions
toc: false
---

CockroachDB supports bundling multiple SQL statements into a single all-or-nothing transaction. Each transaction guarantees [ACID semantics](https://en.wikipedia.org/wiki/ACID) spanning arbitrary tables and rows, even when data is distributed. If a transaction succeeds, all mutations are applied together with virtual simultaneity. If any part of a transaction fails, the entire transaction is aborted, and the database is left unchanged.

{{site.data.alerts.callout_info}}For a detailed discussion of CockroachDB transaction semantics, see <a href="https://www.cockroachlabs.com/blog/how-cockroachdb-distributes-atomic-transactions/">How CockroachDB Does Distributed Atomic Transactions</a> and <a href="https://www.cockroachlabs.com/blog/serializable-lockless-distributed-isolation-cockroachdb/">Serializable, Lockless, Distributed: Isolation in CockroachDB</a>.{{site.data.alerts.end}}

<div id="toc"></div>

## Syntax

In CockroachDB, a transaction is set up by surrounding SQL statements with the [`BEGIN`](begin-transaction.html) and [`COMMIT`](commit-transaction.html) statements:

~~~ sql
BEGIN
<other statements>
COMMIT
~~~

If at any point in the transaction you decide to abort all updates, you can issue the [`ROLLBACK`](rollback-transaction.html) statement instead of the `COMMIT` statement.

## Transaction Retries

Transactions in CockroachDB do not explicitly lock their data resources. Instead, using [optimistic concurrency control (OCC)](https://en.wikipedia.org/wiki/Optimistic_concurrency_control), CockroachDB proceeds with transactions under the assumption that there’s no contention until commit time. In cases without contention, this results in higher performance than explicit locking would allow. With contention, however, one of the conflicting transactions must be retried or aborted.

Individual statements, which are treated as implicit transactions, and statements batched between `BEGIN` and `COMMIT`, are retried automatically by the CockroachDB server. Transactions involving business logic, however, must be retried from the client. For example, when a transaction depends on values read from the database, reads after a retry can return different results than before the retry, and so the follow-up logic may be different. 

To assist with client-side retries, CockroachDB provides a generic **retry function** that runs inside a transaction and retries it as needed. For Go, this function is available as a library. For other languages, it can be copy and pasted directly into your application code. See [Build a Test App](build-a-test-app.html#step-4-execute-transactions-from-a-client) for the code. 

**How the retry function works:**

1. The transaction starts.

2. The `SAVEPOINT cockroach_restart` statement defines the intention to retry the transaction in the case of CockroachDB-retryable errors. Note that CockroachDB's savepoint implementation does not support all savepoint functionality, such as nested transactions. 

3. The statements in the transaction are executed. 

4. If a statement returns a retryable error (identified via the `40001` error code or `retry transaction` string in the error message), the [`ROLLBACK TO SAVEPOINT cockroach_restart`](rollback-transaction.html) statement restarts the transaction. Alternately, the original `SAVEPOINT cockroach_restart` statement can be reissued to restart the transaction.

   In cases where you do not want the application to retry the transaction, you can adapt the wrapper function to simply `ROLLBACK` at this point. Any other statements will be rejected by the server, as is generally the case after an error has been encountered and the transaction has not been closed.

5. When there are no retryable errors, the [`RELEASE SAVEPOINT cockroach_restart`](release-savepoint.html) statement commits the changes. If this succeeds, all changes made by the transaction become visible to subsequent transactions and are guaranteed to be durable if a crash occurs.

   In some cases, the `RELEASE SAVEPOINT` statement itself can fail with a retryable error, mainly because transactions in CockroachDB only realize that they need to be restarted when they attempt to commit. If this happens, the retryable error is handled as described in step 4.

{{site.data.alerts.callout_info}}In CockroachDB, individual statements and statements batched between <code>BEGIN</code> and <code>COMMIT</code> are considered implicit transactions and are retried automatically by the server; no special error handling is needed.{{site.data.alerts.end}}

## Transaction Priorities

Every transaction in CockroachDB is assigned an initial **priority**. By default, that priority is `NORMAL`, but for transactions that should be given preference in high-contention scenarios, the client can set the priority within the [`BEGIN`](begin-transaction.html) statement:

~~~ sql
BEGIN PRIORITY <LOW, NORMAL, HIGH>
~~~

Alternately, the client can set the priority immediately after the transaction is started as follows:

~~~ sql
SET TRANSACTION PRIORITY <LOW, NORMAL, HIGH>
~~~

{{site.data.alerts.callout_info}}When two transactions contend for the same resource, the one with the lower priority loses and is retried. On retry, the transaction inherits the priority of the winner. This means that each retry makes a transaction stronger and more likely to succeed.{{site.data.alerts.end}}

## Isolation Levels

CockroachDB supports two transaction isolation levels: `SNAPSHOT ISOLATION` and `SERIALIZABLE`. By default, transactions use the `SERIALIZABLE` isolation level, but the client can explicitly set a transaction's isolation when starting the transaction:

~~~ sql
BEGIN ISOLATION LEVEL <ANSI SQL ISOLATION LEVEL>
~~~

Alternately, the client can set the isolation level immediately after the transaction is started:

~~~ sql
SET TRANSACTION ISOLATION LEVEL <ANSI SQL ISOLATION LEVEL>
~~~

{{site.data.alerts.callout_info}}For a detailed discussion of isolation in CockroachDB transactions, see <a href="https://www.cockroachlabs.com/blog/serializable-lockless-distributed-isolation-cockroachdb/">Serializable, Lockless, Distributed: Isolation in CockroachDB</a>.{{site.data.alerts.end}}

### SERIALIZABLE ISOLATION

With `SERIALIZABLE` isolation, a transaction behaves as though it has the entire database all to itself for the duration of its execution. This means that no concurrent writers can affect the transaction unless they commit before it starts, and no concurrent readers can be affected by the transaction until it has successfully committed. This is the strongest level of isolation provided by CockroachDB and it's the default. 

Unlike `SNAPSHOT ISOLATION`, `SERIALIZABLE` isolation permits no anomalies. However, due to CockroachDB's transaction model, `SERIALIZABLE` isolation may require more transaction restarts, especially in the presence of high contention between concurrent transactions. Consider using `SNAPSHOT ISOLATION` for high contention workloads.

### SNAPSHOT ISOLATION

With `SNAPSHOT ISOLATION`, a transaction behaves as if it
were reading the state of the database consistently at a fixed point in time. Unlike the `SERIALIZABLE` level, `SNAPSHOT ISOLATION` permits the [write skew](https://en.wikipedia.org/wiki/Snapshot_isolation) anomaly, but in cases where write skew conditions are unlikely, this isolation level can be highly performant.  

### Comparison to [ANSI SQL Isolation Levels](https://en.wikipedia.org/wiki/Isolation_(database_systems)#Isolation_levels)

The CockroachDB `SERIALIZABLE` level is stronger than the ANSI SQL `REPEATABLE READ` level and equivalent to the ANSI SQL `SERIALIZABLE` level.

The CockroachDB `SNAPSHOT ISOLATION` level is stronger than the ANSI SQL `READ UNCOMMITTED` and `READ COMMITTED` levels.

For more information about the relationship between these levels, see [this paper](http://arxiv.org/ftp/cs/papers/0701/0701157.pdf).

## See Also

- [`BEGIN`](begin-transaction.html)
- [`COMMIT`](commit-transaction.html)
- [`ROLLBACK`](rollback-transaction.html)
- [`RELEASE SAVEPOINT`](release-savepoint.html)
- [Retryable function code samples](build-a-test-app.html#step-4-execute-transactions-from-a-client)
