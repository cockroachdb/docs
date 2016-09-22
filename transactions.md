---
title: Transactions
summary: CockroachDB supports bundling multiple SQL statements into a single all-or-nothing transaction.
toc: false
---

CockroachDB supports bundling multiple SQL statements into a single all-or-nothing transaction. Each transaction guarantees [ACID semantics](https://en.wikipedia.org/wiki/ACID) spanning arbitrary tables and rows, even when data is distributed. If a transaction succeeds, all mutations are applied together with virtual simultaneity. If any part of a transaction fails, the entire transaction is aborted, and the database is left unchanged.

{{site.data.alerts.callout_info}}For a detailed discussion of CockroachDB transaction semantics, see <a href="https://www.cockroachlabs.com/blog/how-cockroachdb-distributes-atomic-transactions/">How CockroachDB Does Distributed Atomic Transactions</a> and <a href="https://www.cockroachlabs.com/blog/serializable-lockless-distributed-isolation-cockroachdb/">Serializable, Lockless, Distributed: Isolation in CockroachDB</a>.{{site.data.alerts.end}}

<div id="toc"></div>

## Syntax

In CockroachDB, a transaction is set up by surrounding SQL statements with the [`BEGIN`](begin-transaction.html) and [`COMMIT`](commit-transaction.html) statements.

To use [client-side transaction retries](#client-side-transaction-retries), you should also include the `cockroach_restart` statements, `SAVEPOINT` and `RELEASE SAVEPOINT`.

~~~ sql
> BEGIN;

> SAVEPOINT cockroach_restart;

<transaction statements>

> RELEASE SAVEPOINT cockroach_restart;

> COMMIT;
~~~

At any time before it's committed, you can abort the transaction by executing the [`ROLLBACK`](rollback-transaction.html) statement.

Clients using transactions must also include logic to handle [retries](#transaction-retries).

## Error Handling

To handle errors in transactions, you should listen for two types of errors:

- Errors with the code `40001` or string `retry transaction`, which indicates the transaction failed because another concurrent or recent transaction accessed the same values. To handle these errors, you should [retry the transaction](#client-side-transaction-retries).
- All other errors, which indicate that there was a problem with a statement in the transaction. To handle these errors, you can either issue a `COMMIT` or `ROLLBACK` statement to return the database to its previous state. If you want to attempt the same set of statements again, you must begin a completely new transaction.

## Transaction Retries

Transactions in CockroachDB do not explicitly lock their data resources. Instead, using [optimistic concurrency control (OCC)](https://en.wikipedia.org/wiki/Optimistic_concurrency_control), CockroachDB proceeds with transactions under the assumption that there’s no contention until commit time. In cases without contention, this results in higher performance than explicit locking would allow. With contention, however, the transaction with the highest priority succeeds and any other transactions must be retried or aborted.

For transactions that do not succeed because of contention, CockroachDB has two cases:

- [Automatic retries](#automatic-retries), which CockroachDB processes for you.
- [Client-side intervention](#client-side-intervention), which your application must handle.

### Automatic Retries

In cases of contention, CockroachDB automatically retries any of the following types of transactions:

- Individual statements (which are treated as implicit transactions), such as:

  ~~~ sql
  > DELETE FROM customers WHERE id = 1;
  ~~~

- Transactions containing all of their statements on a single line, such as:
  
  ~~~ sql
  > BEGIN; DELETE FROM customers WHERE id = 1; DELETE orders WHERE customer = 1; COMMIT;
  ~~~

  In these cases, CockroachDB retries the transaction using the existing values. If any of the transaction's values are conditional, we recommend instead writing your transaction to use [client-side intervention](#client-side-intervention).

### Client-Side Intervention

In cases of contention, your application must include error handling when the transaction contains statements on separate lines, such as:

~~~ sql
> BEGIN;

> UPDATE products SET inventory = 0 WHERE sku = '8675309';

> INSERT INTO orders (customer, status) VALUES (1, 'new');

> COMMIT;
~~~

To alert you of failures due to contention, CockroachDB surfaces an error with the code `40001` that begins with the string `retry transaction`.

To handle these types of errors you have two options:

- *Recommended*: Use the `cockroach_restart` functions to create retryable transactions. Retryable transaction can improve performance because their priority's increased each time they are retried, making them more likely to succeed the longer they're in your system. 

  For more information, see [Client-Side Transaction Retries](#client-side-transaction-retries).

- Abort the transaction using `ROLLBACK`, and then reissue all of the statements in the transaction. This does *not* automatically increase the transaction's priority, so it's possible in high-contention workloads for transactions to take an incredibly long time to succeed.

#### Client-Side Transaction Retries

To improve the performance of transactions, CockroachDB include a set of statements that let you retry transaction that fail due to contention errors. Retrying transactions has the benefit of increasing their priority each time they're retried, increasing their likelihood to succeed.

Implementing client-side retries requires three statements:

- [`SAVEPOINT cockroach_restart`](savepoint.html) defines your intent to retry the transaction if there are contention errors. It must be executed after `BEGIN` but before the first statement that manipulates a database.
- [`ROLLBACK TO cockroach_restart`](rollback-transaction.html#retry-a-transaction) is used when your application detects `40001` / `retry transaction` errors. It provides you a chance to "retry" the transaction by rolling the database's state back to the beginning of the transaction and incrementing the transaction's priority. 
  
  After issuing `ROLLBACK TO cockroach_restart`, each of the transaction's statements must then be executed again.

- [`RELEASE SAVEPOINT cockroach_restart`](release-savepoint.html) commits the transaction.
  
  You must also execute `COMMIT` afterward to clear the connection for the next transaction.

You can find examples of this in the [Syntax](#syntax) section of this page or at our page [Build a Test App: Execute transaction from a client](build-a-test-app.html#step-4-execute-transactions-from-a-client).

{{site.data.alerts.callout_success}}If you're building an application in the following languages, we have packages to make client-side retries simpler:
<ul>
  <li><strong>Go</strong> developers can use the <code>crdb</code> package of the CockroachDB Go client. For more information, see the <strong>Go</strong> tab of <a href="build-a-test-app.html#step-4-execute-transactions-from-a-client">Build a Test App: Execute transaction from a client</a>.</li>
  <li><strong>Python</strong> developers can use the <code>sqlalchemy</code> package. For more information, see our blog post <a href="https://www.cockroachlabs.com/blog/building-application-cockroachdb-sqlalchemy-2/">Building an Application With CockroachDB and SQLAlchemy</a>.</li>
</ul>{{site.data.alerts.end}}

For greater detail, here's the process a retryable transaction goes through.

1. The transaction starts with the `BEGIN` statement.

2. The `SAVEPOINT cockroach_restart` statement defines the intention to retry the transaction in the case of contention errors. Note that CockroachDB's savepoint implementation does not support all savepoint functionality, such as nested transactions. 

3. The statements in the transaction are executed. 

4. If a statement returns a retryable error (identified via the `40001` error code or `retry transaction` string at the start of the error message), you can issue the [`ROLLBACK TO SAVEPOINT cockroach_restart`](rollback-transaction.html) statement to restart the transaction. Alternately, the original `SAVEPOINT cockroach_restart` statement can be reissued to restart the transaction.
	
	You must now issue the statements in the transaction again.

	In cases where you do not want the application to retry the transaction, you can simply issue `ROLLBACK` at this point. Any other statements will be rejected by the server, as is generally the case after an error has been encountered and the transaction has not been closed.

5. Once the transaction executes all statements without encountering contention errors, execute [`RELEASE SAVEPOINT cockroach_restart`](release-savepoint.html) to commit the changes. If this succeeds, all changes made by the transaction become visible to subsequent transactions and are guaranteed to be durable if a crash occurs.

	In some cases, the `RELEASE SAVEPOINT` statement itself can fail with a retryable error, mainly because transactions in CockroachDB only realize that they need to be restarted when they attempt to commit. If this happens, the retryable error is handled as described in step 4.

## Transaction Priorities

Every transaction in CockroachDB is assigned an initial **priority**. By default, that priority is `NORMAL`, but for transactions that should be given preference in high-contention scenarios, the client can set the priority within the [`BEGIN`](begin-transaction.html) statement:

~~~ sql
> BEGIN PRIORITY <LOW | NORMAL | HIGH>;
~~~

Alternately, the client can set the priority immediately after the transaction is started as follows:

~~~ sql
> SET TRANSACTION PRIORITY <LOW | NORMAL | HIGH>;
~~~

{{site.data.alerts.callout_info}}When two transactions contend for the same resource, the one with the lower priority loses and is retried. On retry, the transaction inherits the priority of the winner. This means that each retry makes a transaction stronger and more likely to succeed.{{site.data.alerts.end}}

## Isolation Levels

CockroachDB supports two transaction isolation levels: `SERIALIZABLE` and `SNAPSHOT`. By default, transactions use the `SERIALIZABLE` isolation level, but the client can explicitly set a transaction's isolation when starting the transaction:

~~~ sql
> BEGIN ISOLATION LEVEL <SERIALIZABLE | SNAPSHOT>;
~~~

Alternately, the client can set the isolation level immediately after the transaction is started:

~~~ sql
> SET TRANSACTION ISOLATION LEVEL <SERIALIZABLE | SNAPSHOT>;
~~~

{{site.data.alerts.callout_info}}For a detailed discussion of isolation in CockroachDB transactions, see <a href="https://www.cockroachlabs.com/blog/serializable-lockless-distributed-isolation-cockroachdb/">Serializable, Lockless, Distributed: Isolation in CockroachDB</a>.{{site.data.alerts.end}}

### Serializable Isolation

With `SERIALIZABLE` isolation, a transaction behaves as though it has the entire database all to itself for the duration of its execution. This means that no concurrent writers can affect the transaction unless they commit before it starts, and no concurrent readers can be affected by the transaction until it has successfully committed. This is the strongest level of isolation provided by CockroachDB and it's the default. 

Unlike `SNAPSHOT`, `SERIALIZABLE` isolation permits no anomalies. However, due to CockroachDB's transaction model, `SERIALIZABLE` isolation may require more transaction restarts, especially in the presence of high contention between concurrent transactions. Consider using `SNAPSHOT` isolation for high contention workloads.

### Snapshot Isolation

With `SNAPSHOT` isolation, a transaction behaves as if it were reading the state of the database consistently at a fixed point in time. Unlike the `SERIALIZABLE` level, `SNAPSHOT` isolation permits the [write skew](https://en.wikipedia.org/wiki/Snapshot_isolation) anomaly, but in cases where write skew conditions are unlikely, this isolation level can be highly performant.  

### Comparison to ANSI SQL Isolation Levels

CockroachDB uses slightly different isolation levels than [ANSI SQL isolation levels](https://en.wikipedia.org/wiki/Isolation_(database_systems)#Isolation_levels).

- The CockroachDB `SERIALIZABLE` level is stronger than the ANSI SQL `REPEATABLE READ` level and equivalent to the ANSI SQL `SERIALIZABLE` level.
- The CockroachDB `SNAPSHOT` level is stronger than the ANSI SQL `READ UNCOMMITTED` and `READ COMMITTED` levels.

For more information about the relationship between these levels, see [this paper](http://arxiv.org/ftp/cs/papers/0701/0701157.pdf).

## See Also

- [`BEGIN`](begin-transaction.html)
- [`COMMIT`](commit-transaction.html)
- [`ROLLBACK`](rollback-transaction.html)
- [`SAVEPOINT`](savepoint.html)
- [`RELEASE SAVEPOINT`](release-savepoint.html)
- [Retryable function code samples](build-a-test-app.html#step-4-execute-transactions-from-a-client)
