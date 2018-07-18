---
title: Transactions
summary: CockroachDB supports bundling multiple SQL statements into a single all-or-nothing transaction.
toc: true
---

CockroachDB supports bundling multiple SQL statements into a single all-or-nothing transaction. Each transaction guarantees [ACID semantics](https://en.wikipedia.org/wiki/ACID) spanning arbitrary tables and rows, even when data is distributed. If a transaction succeeds, all mutations are applied together with virtual simultaneity. If any part of a transaction fails, the entire transaction is aborted, and the database is left unchanged. CockroachDB guarantees that while a transaction is pending, it is isolated from other concurrent transactions with serializable [isolation](#isolation-levels).

{{site.data.alerts.callout_info}}
For a detailed discussion of CockroachDB transaction semantics, see [How CockroachDB Does Distributed Atomic Transactions](https://www.cockroachlabs.com/blog/how-cockroachdb-distributes-atomic-transactions/) and [Serializable, Lockless, Distributed: Isolation in CockroachDB](https://www.cockroachlabs.com/blog/serializable-lockless-distributed-isolation-cockroachdb/). Note that the explanation of the transaction model described in this blog post is slightly out of date. See the [Transaction Retries](#transaction-retries) section for more details.
{{site.data.alerts.end}}


## SQL statements

Each of the following SQL statements control transactions in some way.

 Statement | Function 
-----------|----------
 [`BEGIN`](begin-transaction.html) | Initiate a transaction, as well as control its [priority](#transaction-priorities) and [isolation level](#isolation-levels). 
 [`SET TRANSACTION`](set-transaction.html) | Control a transaction's [priority](#transaction-priorities) and [isolation level](#isolation-levels). 
 [`SAVEPOINT cockroach_restart`](savepoint.html) | Declare the transaction as [retryable](#client-side-transaction-retries). This lets you retry the transaction if it doesn't succeed because a higher priority transaction concurrently or recently accessed the same values. 
 [`RELEASE SAVEPOINT cockroach_restart`](release-savepoint.html) | Commit a [retryable transaction](#client-side-transaction-retries). 
 [`COMMIT`](commit-transaction.html) | Commit a non-retryable transaction or clear the connection after committing a retryable transaction. 
 [`ROLLBACK TO SAVEPOINT cockroach_restart`](rollback-transaction.html) | Handle [retryable errors](#error-handling) by rolling back a transaction's changes and increasing its priority. 
 [`ROLLBACK`](rollback-transaction.html) | Abort a transaction and roll the database back to its state before the transaction began. 
 [`SHOW`](show-vars.html) | Display the current transaction settings. 

## Syntax

In CockroachDB, a transaction is set up by surrounding SQL statements with the [`BEGIN`](begin-transaction.html) and [`COMMIT`](commit-transaction.html) statements.

To use [client-side transaction retries](#client-side-transaction-retries), you should also include the `SAVEPOINT cockroach_restart`, `ROLLBACK TO SAVEPOINT cockroach_restart` and `RELEASE SAVEPOINT` statements.

~~~ sql?nofmt
> BEGIN;

> SAVEPOINT cockroach_restart;

<transaction statements>

> RELEASE SAVEPOINT cockroach_restart;

> COMMIT;
~~~

At any time before it's committed, you can abort the transaction by executing the [`ROLLBACK`](rollback-transaction.html) statement.

Clients using transactions must also include logic to handle [retries](#transaction-retries).

## Error handling

To handle errors in transactions, you should check for the following types of server-side errors:

Type | Description
-----|------------
**Retryable Errors** | Errors with the code `40001` or string `retry transaction`, which indicate that a transaction failed because it conflicted with another concurrent or recent transaction accessing the same data. The transaction needs to be retried by the client. See [client-side transaction retries](#client-side-transaction-retries) for more details.
**Ambiguous Errors** | Errors with the code `40003` that are returned in response to `RELEASE SAVEPOINT` (or `COMMIT` when not using `SAVEPOINT`), which indicate that the state of the transaction is ambiguous, i.e., you cannot assume it either committed or failed. How you handle these errors depends on how you want to resolve the ambiguity. See [here](common-errors.html#result-is-ambiguous) for more about this kind of error.
**SQL Errors** | All other errors, which indicate that a statement in the transaction failed. For example, violating the Unique constraint generates an `23505` error. After encountering these errors, you can either issue a `COMMIT` or `ROLLBACK` to abort the transaction and revert the database to its state before the transaction began.<br><br>If you want to attempt the same set of statements again, you must begin a completely new transaction.

## Transaction contention

Transactions in CockroachDB lock data resources that are written during their execution. When a pending write from one transaction conflicts with a write of a concurrent transaction, the concurrent transaction must wait for the earlier transaction to complete before proceeding. When a dependency cycle is detected between transactions, the transaction with the higher priority aborts the dependent transaction to avoid deadlock, which much be retried.

For more details about transaction contention and best practices for avoiding contention, see [Understanding and Avoiding Transaction Contention](performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention).

## Transaction retries

Transactions may require retries if they experience deadlock or [read/write contention](performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention) with other concurrent transactions which cannot be resolved without allowing potential [serializable anomalies](https://en.wikipedia.org/wiki/Serializability). (However, it's possible to mitigate read-write conflicts by performing reads using [`AS OF SYSTEM TIME`](performance-best-practices-overview.html#use-as-of-system-time-to-decrease-conflicts-with-long-running-queries).)

There are two cases for handling transaction retries:

- [Automatic retries](#automatic-retries), which CockroachDB processes for you.
- [Client-side intervention](#client-side-intervention), which your application must handle.

### Automatic retries

CockroachDB automatically retries individual statements and transactions sent from the client as a single batch.

#### Individual statements

Individual statements are treated as implicit transactions, for example:

~~~ sql
> DELETE FROM customers WHERE id = 1;
~~~

#### Batched statements

Transactions can be sent from the client as a single batch. Batching implies that CockroachDB receives multiple statements without being asked to return results in between them; instead, CockroachDB returns results after executing all of the statements (except if the accumulated results overflow an internal buffer, in which case they are returned sooner and automatic retries can no longer be performed).

Batching is generally controlled by your driver or client's behavior. Technically, it can be achieved in two ways, both supporting automatic retries:

1. When the client/driver is using the [PostgreSQL Extended Query protocol](https://www.postgresql.org/docs/10/static/protocol-flow.html#PROTOCOL-FLOW-EXT-QUERY), a batch is made up of all queries sent in between two `Sync` messages. Many drivers support such batches through explicit batching constructs. Auto-retrying of such batches is **supported as of CockroachDB v2.0**.

2. The the client/driver is using the [PostgreSQL Simple Query protocol](https://www.postgresql.org/docs/10/static/protocol-flow.html#id-1.10.5.7.4), a batch is made up semicolon-separated strings sent as a unit to CockroachDB. For example, in Go, this code would send a single batch (which would be automatically retried):

    ~~~ go
    db.Exec(
      "BEGIN;

      DELETE FROM customers WHERE id = 1;

      DELETE orders WHERE customer = 1;

      COMMIT;"
    )
    ~~~

{{site.data.alerts.callout_info}}
Within a batch of statements, CockroachDB infers that the statements are not conditional on the results of previous statements, so it can retry all of them. However, if the transaction relies on conditional logic (e.g., statement 2 is executed only for some results of statement 1), and results for some statements in the transaction have already been delivered to the client (e.g., results of statement 1 have been delivered), CockroachDB cannot automatically retry statement 2 alone. Instead, you should write your transactions to use [client-side intervention](#client-side-intervention), so that the client gets to retry statement 1.
{{site.data.alerts.end}}

### Client-side intervention

Your application should include client-side retry handling when the statements are sent individually, such as:

~~~ sql?nofmt
> BEGIN;

> UPDATE products SET inventory = 0 WHERE sku = '8675309';

> INSERT INTO orders (customer, status) VALUES (1, 'new');

> COMMIT;
~~~

To indicate a transaction must be retried, CockroachDB surfaces an error with the code `40001` and an error message that begins with the string `retry transaction`.

To handle these types of errors you have two options:

- *Recommended*: Use the `SAVEPOINT cockroach_restart` functions to create retryable transactions. Retryable transactions can improve performance because their priority's increased each time they are retried, making them more likely to succeed the longer they're in your system.

    For more information, see [Client-Side Transaction Retries](#client-side-transaction-retries).

- Abort the transaction using `ROLLBACK`, and then reissue all of the statements in the transaction. This does *not* automatically increase the transaction's priority, so it's possible in high-contention workloads for transactions to take an incredibly long time to succeed.

#### Client-side transaction retries

To improve the performance of transactions that fail due to contention, CockroachDB includes a set of statements that let you retry those transactions. Retrying transactions has the benefit of increasing their priority each time they're retried, increasing their likelihood to succeed.

Retried transactions are also issued at a later timestamp, so the transaction now operates on a later snapshot of the database, so the reads might return updated data.

Implementing client-side retries requires three statements:

- [`SAVEPOINT cockroach_restart`](savepoint.html) declares the client's intent to retry the transaction if there are contention errors. It must be executed after `BEGIN` but before the first statement that manipulates a database.

- [`ROLLBACK TO SAVEPOINT cockroach_restart`](rollback-transaction.html#retry-a-transaction) is used when your application detects `40001` / `retry transaction` errors. It provides you a chance to "retry" the transaction by rolling the database's state back to the beginning of the transaction and increasing the transaction's priority.

    After issuing `ROLLBACK TO SAVEPOINT cockroach_restart`, you must issue any statements you want the transaction to contain. Typically, this means recalculating values and reissuing a similar set of statements to the previous attempt.

- [`RELEASE SAVEPOINT cockroach_restart`](release-savepoint.html) commits the transaction. At this point, CockroachDB checks to see if the transaction contends with others for access to the same values; the highest priority transaction succeeds, and the others return `40001` / `retry transaction` errors.

    You must also execute `COMMIT` afterward to clear the connection for the next transaction.

You can find examples of this in the [Syntax](#syntax) section of this page or in our [Build an App with CockroachDB](build-an-app-with-cockroachdb.html) tutorials.

{{site.data.alerts.callout_success}}
If you're building an application in the following languages, we have packages to make client-side retries simpler:

- **Go** developers can use the `crdb` package of the CockroachDB Go client. For more information, see [Build a Go App with CockroachDB](build-a-go-app-with-cockroachdb.html#transaction-with-retry-logic).
- **Python** developers can use the `sqlalchemy` package. For more information, see our blog post [Building an Application With CockroachDB and SQLAlchemy](https://www.cockroachlabs.com/blog/building-application-cockroachdb-sqlalchemy-2/).
{{site.data.alerts.end}}

It's also important to note that retried transactions are restarted at a later timestamp. This means that the transaction operates on a later snapshot of the database and related reads might retrieve updated data.

For greater detail, here's the process a retryable transaction goes through.

1. The transaction starts with the `BEGIN` statement.

2. The `SAVEPOINT cockroach_restart` statement declares the intention to retry the transaction in the case of contention errors. Note that CockroachDB's savepoint implementation does not support all savepoint functionality, such as nested transactions.

3. The statements in the transaction are executed.

4. If a statement returns a retryable error (identified via the `40001` error code or `retry transaction` string at the start of the error message), you can issue the [`ROLLBACK TO SAVEPOINT cockroach_restart`](rollback-transaction.html) statement to restart the transaction. Alternately, the original `SAVEPOINT cockroach_restart` statement can be reissued to restart the transaction.

  You must now issue the statements in the transaction again.

  In cases where you do not want the application to retry the transaction, you can simply issue `ROLLBACK` at this point. Any other statements will be rejected by the server, as is generally the case after an error has been encountered and the transaction has not been closed.

5. Once the transaction executes all statements without encountering contention errors, execute [`RELEASE SAVEPOINT cockroach_restart`](release-savepoint.html) to commit the changes. If this succeeds, all changes made by the transaction become visible to subsequent transactions and are guaranteed to be durable if a crash occurs.

  In some cases, the `RELEASE SAVEPOINT` statement itself can fail with a retryable error, mainly because transactions in CockroachDB only realize that they need to be restarted when they attempt to commit. If this happens, the retryable error is handled as described in step 4.

## Transaction parameters

Each transaction is controlled by two parameters: its priority and its
isolation level. The following two sections detail these further.

### Transaction priorities

Every transaction in CockroachDB is assigned an initial **priority**. By default, that priority is `NORMAL`, but for transactions that should be given preference in [high-contention scenarios](performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention), the client can set the priority within the [`BEGIN`](begin-transaction.html) statement:

~~~ sql?nofmt
> BEGIN PRIORITY <LOW | NORMAL | HIGH>;
~~~

Alternately, the client can set the priority immediately after the transaction is started as follows:

~~~ sql?nofmt
> SET TRANSACTION PRIORITY <LOW | NORMAL | HIGH>;
~~~

The client can also display the current priority of the transaction with [`SHOW TRANSACTION PRIORITY`](show-vars.html).

{{site.data.alerts.callout_info}}
When two transactions contend for the same resources indirectly, they may create a dependency cycle leading to a deadlock situation, where both transactions are waiting on the other to finish. In these cases, CockroachDB allows the transaction with higher priority to abort the other, which must then retry. On retry, the transaction inherits the higher priority. This means that each retry makes a transaction more likely to succeed in the event it again experiences deadlock.
{{site.data.alerts.end}}

### Isolation levels

CockroachDB efficiently supports the strongest ANSI transaction isolation level: `SERIALIZABLE`. All other ANSI transaction isolaton levels (e.g., `READ UNCOMMITTED`, `READ COMMITTED`, and `REPEATABLE READ`) are automatically upgraded to `SERIALIZABLE`. Weaker isolation levels have historically been used to maximize transaction throughput. However, [recent research](http://www.bailis.org/papers/acidrain-sigmod2017.pdf) has demonstrated that the use of weak isolation levels results in substantial vulnerability to concurrency-based attacks. CockroachDB continues to support an additional non-ANSI isolation level, `SNAPSHOT`, although it is deprecated. Clients can explicitly set a transaction's isolation when starting the transaction:

~~~ sql?nofmt
> BEGIN ISOLATION LEVEL <SERIALIZABLE | SNAPSHOT>;
~~~

Alternately, the client can set the isolation level immediately after the transaction is started:

~~~ sql?nofmt
> SET TRANSACTION ISOLATION LEVEL <SERIALIZABLE | SNAPSHOT>;
~~~

The client can also display the current isolation level of the transaction with [`SHOW TRANSACTION ISOLATION LEVEL`](show-vars.html).

{{site.data.alerts.callout_info}}
For a detailed discussion of isolation in CockroachDB transactions, see [Serializable, Lockless, Distributed: Isolation in CockroachDB](https://www.cockroachlabs.com/blog/serializable-lockless-distributed-isolation-cockroachdb/).
{{site.data.alerts.end}}

#### Serializable isolation

With `SERIALIZABLE` isolation, a transaction behaves as though it has the entire database all to itself for the duration of its execution. This means that no concurrent writers can affect the transaction unless they commit before it starts, and no concurrent readers can be affected by the transaction until it has successfully committed. This is the strongest level of isolation provided by CockroachDB and it's the default.

Unlike `SNAPSHOT`, `SERIALIZABLE` isolation permits no anomalies. In order to prevent [write skew](https://en.wikipedia.org/wiki/Snapshot_isolation) anomalies, `SERIALIZABLE` isolation may require transaction restarts.

#### Snapshot isolation

With `SNAPSHOT` isolation (**deprecated**), a transaction behaves as if it were reading the state of the database consistently at a fixed point in time. Unlike the `SERIALIZABLE` level, `SNAPSHOT` isolation permits the write skew anomaly. This isolation level is still supported for backwards compatibility, but you should avoid using it. It provides little benefit in terms of performance and can result in inconsistent state under certain complex workloads. Concurrency-based attacks can coerce inconsistencies into meaningfully adverse effects to system state. For this same reason, CockroachDB upgrades all requests for the much weaker ANSI `READ UNCOMMITTED`, `READ COMMITTED`, and `REPEATABLE READ` isolation levels into `SERIALIZABLE`.

### Comparison to ANSI SQL isolation levels

CockroachDB uses slightly different isolation levels than [ANSI SQL isolation levels](https://en.wikipedia.org/wiki/Isolation_(database_systems)#Isolation_levels).

#### Aliases

- `READ UNCOMMITTED`, `READ COMMITTED`, and `REPEATABLE READ` are aliases for `SERIALIZABLE`.

#### Comparison

- The CockroachDB `SERIALIZABLE` level is stronger than the ANSI SQL `READ UNCOMMITTED`, `READ COMMITTED`, and `REPEATABLE READ` levels and equivalent to the ANSI SQL `SERIALIZABLE` level.
- The CockroachDB `SNAPSHOT` level (**deprecated**) is stronger than the ANSI SQL `READ UNCOMMITTED` and `READ COMMITTED` levels.

For more information about the relationship between these levels, see [this paper](http://arxiv.org/ftp/cs/papers/0701/0701157.pdf).

## See also

- [`BEGIN`](begin-transaction.html)
- [`COMMIT`](commit-transaction.html)
- [`ROLLBACK`](rollback-transaction.html)
- [`SAVEPOINT`](savepoint.html)
- [`RELEASE SAVEPOINT`](release-savepoint.html)
- [`SHOW`](show-vars.html)
- [Retryable function code samples](build-an-app-with-cockroachdb.html)
