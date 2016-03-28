---
title: Transactions
toc: false
---

CockroachDB supports bundling multiple SQL statements into a single all-or-nothing transaction. Each transaction guarantees [ACID semantics](https://en.wikipedia.org/wiki/ACID) spanning arbitrary tables and rows, even when data is distributed across machines. If a transaction succeeds, all mutations are applied together with virtual simultaneity. If any part of a transaction fails, the entire transaction is aborted, and the database is left unchanged.

<div id="toc"></div>

## Syntax

In CockroachDB, a transaction is set up by surrounding SQL statements with the `BEGIN TRANSACTION` and `COMMIT` statements:

~~~ sql
BEGIN TRANSACTION
<other statements>
COMMIT
~~~

If at any point in the transaction you decide to abort all updates, you can issue the `ROLLBACK` statement instead of the `COMMIT` statement.

## Transaction Retries

Transactions in CockroachDB do not explicitly lock their data resources. Instead, using [optimistic concurrency control (OCC)](https://en.wikipedia.org/wiki/Optimistic_concurrency_control), CockroachDB proceeds with transactions under the assumption that there’s no contention until commit time. In cases without contention, this results in higher performance than explicit locking would allow. With contention, however, one of the conflicting transactions must be retried or aborted.

To assist with retries, CockroachDB provides a **generic retry function** that runs inside a transaction and retries it as needed. For Go, this function is available as a library. For other languages, it can be copy and pasted directly into your application code. See [Build a Test App](build-a-test-app.html#step-4-execute-transactions-from-a-client) for the code. 

### How the Retry Function Works

1. The transaction starts.

2. The `SAVEPOINT cockroach_restart` statement defines the intention to retry the transaction in the case of CockroachDB-retryable errors.

3. The statements in the transaction are executed. 

4. If a statement returns a retryable error (identified via the `CR000` error code or `retry transaction` string in the error message), the `ROLLBACK TO SAVEPOINT cockroach_restart` statement restarts the transaction. 

   In cases where you do not want the application to retry the transaction, you can adapt the wrapper funciton to simply `ROLLBACK` at this point. Any other statement will be rejected by the server, as is generally the case after an error has been encountered and the transaction has not been closed.

5. When there are no retryable errors, the `RELEASE SAVEPOINT cockroach_restart` statement commits the changes. If this succeeds, all changes made by the transaction become visible to others and are guaranteed to be durable if a crash occurs.

   In some cases, the `RELEASE SAVEPOINT` statement itself can fail with a retryable error, mainly because transactions in CockroachDB only realize that they need to be restarted when they attempt to commit. If this happens, the retryable error is handled as described in step 4.

{{site.data.alerts.callout_info}}In CockroachDB, individual statements outside of transactions are considered implicit transactions and are retried automatically; no special error handling is needed.{{site.data.alerts.end}}

## Transaction Priorities

Every transaction in CockroachDB is assigned an initial **priority**. By default, that priority is `NORMAL`, but for transactions that should be given preference in high-contention scenarios, the client can set the priority within the `BEGIN TRANSACTION` statement:

~~~ sql
BEGIN TRANSACTION PRIORITY <LOW, NORMAL, HIGH>
~~~

Alternately, the client can set the priority immediately after the transaction is started as follows:

~~~ sql
SET TRANSACTION PRIORITY <LOW, NORMAL, HIGH>
~~~

### Priority and Retries

When two transactions contend for the same resource, the one with the lower priority loses and is retried. On retry, the transaction inherits the priority of the winner. This means that each retry makes a transaction stronger and more likely to succeed.


## Isolation Levels

CockroachDB internally supports two transaction isolation levels: `SNAPSHOT
ISOLATION` and `SERIALIZABLE` (the default). These are mapped to the ANSI SQL
isolation levels as follows: READ UNCOMMITTED, READ COMMITTED, SNAPSHOT ->
SNAPSHOT ISOLATION.  REPEATABLE READ, SERIALIZABLE -> SERIALIZABLE. The
philosophy here is that we map ANSI levels to the next strongest Cockroach
level.  
A transaction's isolation can be set either when the transaction is started,
with `BEGIN TRANSACTION ISOLATION LEVEL <ANSI SQL isolation level`, or using the
`SET` statement: `SET TRANSACTION ISOLATION LEVEL <ANSI SQL isolation level>`.

### SERIALIZABLE ISOLATION

TODO
See the Serializability section in [this blog post](https://www.cockroachlabs.com/blog/living-without-atomic-clocks/).

### SNAPSHOT ISOLATION

Intuitively, `SNAPSHOT ISOLATION` means that the transaction behaves as if it
were reading the state of the database consistenly at a fixed point in time.
Interestingly this is not the same as `REPEATABLE READ` in a traditional
database, and neither is it weaker nor stronger. `REPEATABLE READ` permits the
*phantom reads* anomaly whereas `SNAPSHOT ISOLATION` doesn't, `SNAPSHOT
ISOLATION` permits the *write skew* anomaly whereas `REPEATABLE READ` doesn't.
