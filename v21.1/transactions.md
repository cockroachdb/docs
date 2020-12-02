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

| Statement                                            | Function                                                                                                                                                                 |
|------------------------------------------------------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [`BEGIN`](begin-transaction.html)                    | Initiate a transaction, as well as control its [priority](#transaction-priorities).                                                                                      |
| [`SET TRANSACTION`](set-transaction.html)            | Control a transaction's [priority](#transaction-priorities).                                                                                                             |
| [`COMMIT`](commit-transaction.html)                  | Commit a regular transaction, or clear the connection after committing a transaction using the [advanced retry protocol](advanced-client-side-transaction-retries.html). |
| [`ROLLBACK`](rollback-transaction.html)              | Abort a transaction and roll the database back to its state before the transaction began.                                                                                |
| [`SHOW`](show-vars.html)                             | Display the current transaction settings.                                                                                                                                |
| [`SAVEPOINT`](savepoint.html)                        | Used for [nested transactions](#nested-transactions); also used to implement [advanced client-side transaction retries](advanced-client-side-transaction-retries.html).  |
| [`RELEASE SAVEPOINT`](release-savepoint.html)        | Commit a [nested transaction](#nested-transactions); also used for [retryable transactions](advanced-client-side-transaction-retries.html).                             |
| [`ROLLBACK TO SAVEPOINT`](rollback-transaction.html) | Roll back a [nested transaction](#nested-transactions); also used to handle [retryable transaction errors](advanced-client-side-transaction-retries.html).              |

{{site.data.alerts.callout_info}}
Application developers who are using a framework or library that does not have [advanced retry logic](advanced-client-side-transaction-retries.html) built in should implement an application-level retry loop with exponential backoff as shown in [Client-side intervention](#client-side-intervention).
{{site.data.alerts.end}}

## Syntax

In CockroachDB, a transaction is set up by surrounding SQL statements with the [`BEGIN`](begin-transaction.html) and [`COMMIT`](commit-transaction.html) statements.

To use [advanced client-side transaction retries](advanced-client-side-transaction-retries.html), you should also include the [`SAVEPOINT`](savepoint.html), [`ROLLBACK TO SAVEPOINT`](rollback-transaction.html) and [`RELEASE SAVEPOINT`](release-savepoint.html) statements.

{% include copy-clipboard.html %}
~~~ sql
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
**Retry Errors** | Errors with the code `40001` or string `retry transaction`, which indicate that a transaction failed because it could not be placed in a serializable ordering of transactions by CockroachDB. This is often due to contention: conflicts with another concurrent or recent transaction accessing the same data. In such cases, the transaction needs to be retried by the client as described in [client-side intervention](#client-side-intervention).  For a reference listing all of the retry error codes emitted by CockroachDB, see the [Transaction Retry Error Reference](transaction-retry-error-reference.html).
**Ambiguous Errors** | Errors with the code `40003` which indicate that the state of the transaction is ambiguous, i.e., you cannot assume it either committed or failed. How you handle these errors depends on how you want to resolve the ambiguity. For information about how to handle ambiguous errors, see [here](common-errors.html#result-is-ambiguous).
**SQL Errors** | All other errors, which indicate that a statement in the transaction failed. For example, violating the `UNIQUE` constraint generates a `23505` error. After encountering these errors, you can either issue a [`COMMIT`](commit-transaction.html) or [`ROLLBACK`](rollback-transaction.html) to abort the transaction and revert the database to its state before the transaction began.<br><br>If you want to attempt the same set of statements again, you must begin a completely new transaction.

## Transaction retries

Transactions may require retries if they experience deadlock or [read/write contention](performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention) with other concurrent transactions which cannot be resolved without allowing potential [serializable anomalies](https://en.wikipedia.org/wiki/Serializability).

{% include {{page.version.version}}/misc/mitigate-contention-note.md %}

There are two cases in which transaction retries occur:

1. [Automatic retries](#automatic-retries), which CockroachDB processes for you.
2. [Client-side intervention](#client-side-intervention), which your application must handle.

### Automatic retries

CockroachDB automatically retries individual statements (implicit transactions) and transactions sent from the client as a single batch, as long as the size of the results being produced for the client, including protocol overhead, is less than 16KiB by default. Once that buffer overflows, CockroachDB starts streaming results back to the client, at which point automatic retries cannot be performed any more. As long as the results of a single statement or batch of statements are known to stay clear of this limit, the client does not need to worry about transaction retries.

{{site.data.alerts.callout_success}}
You can change the results buffer size for all new sessions using the `sql.defaults.results_buffer.size` [cluster setting](cluster-settings.html), or for a specific session using the `results_buffer_size` [session variable](set-vars.html). Note, however, that decreasing the buffer size can increase the number of transaction retry errors a client receives, whereas increasing the buffer size can increase the delay until the client receives the first result row.
{{site.data.alerts.end}}

In future versions of CockroachDB, we plan on providing stronger guarantees for read-only queries that return at most one row, regardless of the size of that row.

#### Individual statements

Individual statements are treated as implicit transactions, and so they fall
under the rules described above. If the results are small enough, they will be
automatically retried. In particular, `INSERT/UPDATE/DELETE` statements without
a `RETURNING` clause are guaranteed to have miniscule result sizes.
For example, the following statement would be automatically retried by CockroachDB:

~~~ sql
> DELETE FROM customers WHERE id = 1;
~~~

#### Batched statements

Transactions can be sent from the client as a single batch. Batching implies that CockroachDB receives multiple statements without being asked to return results in between them; instead, CockroachDB returns results after executing all of the statements, except when the accumulated results overflow the buffer mentioned above, in which case they are returned sooner and automatic retries can no longer be performed.

Batching is generally controlled by your driver or client's behavior. Technically, it can be achieved in two ways, both supporting automatic retries:

1. When the client/driver is using the [PostgreSQL Extended Query protocol](https://www.postgresql.org/docs/10/static/protocol-flow.html#PROTOCOL-FLOW-EXT-QUERY), a batch is made up of all queries sent in between two `Sync` messages. Many drivers support such batches through explicit batching constructs. Auto-retrying of such batches is **supported as of CockroachDB v2.0**.

2. When the client/driver is using the [PostgreSQL Simple Query protocol](https://www.postgresql.org/docs/10/static/protocol-flow.html#id-1.10.5.7.4), a batch is made up of semicolon-separated strings sent as a unit to CockroachDB. For example, in Go, this code would send a single batch (which would be automatically retried):

    ~~~ go
    db.Exec(
      "BEGIN;

      DELETE FROM customers WHERE id = 1;

      DELETE orders WHERE customer = 1;

      COMMIT;"
    )
    ~~~

{{site.data.alerts.callout_info}}
Within a batch of statements, CockroachDB infers that the statements are not
conditional on the results of previous statements, so it can retry all of them.
Of course, if the transaction relies on conditional logic (e.g., statement 2 is
executed only for some results of statement 1), then the transaction cannot be
all sent to CockroachDB as a single batch. In these common cases, CockroachDB
cannot retry, say, statement 2 in isolation. Since results for statement 1 have
already been delivered to the client by the time statement 2 is forcing the
transaction to retry, the client needs to be involved in retrying the whole
transaction and so you should write your transactions to use
[client-side intervention](#client-side-intervention).
{{site.data.alerts.end}}

### Client-side intervention

Your application should include client-side retry handling when the statements are sent individually, such as:

{% include copy-clipboard.html %}
~~~ sql
> BEGIN;

> UPDATE products SET inventory = 0 WHERE sku = '8675309';

> INSERT INTO orders (customer, status) VALUES (1, 'new');

> COMMIT;
~~~

To indicate that a transaction must be retried, CockroachDB signals an error with the code `40001` and an error message that begins with the string `"retry transaction"`.  For a complete list of transaction retry error codes, see [Transaction retry error reference](transaction-retry-error-reference.html).

To handle these types of errors you have the following options:

1. If your database library or framework provides a method for retryable transactions (it will often be documented as a tool for handling deadlocks), use it. If you're building an application in the following languages, we have code to make client-side retries simpler:
   - **Go** developers can use the [`github.com/cockroachdb/cockroach-go/crdb`](https://github.com/cockroachdb/cockroach-go/tree/master/crdb) package, which handles retries automatically. For an example, see [Build a Go App with CockroachDB](build-a-go-app-with-cockroachdb.html).
   - **Python** developers can use [SQLAlchemy](https://www.sqlalchemy.org) with the [`sqlalchemy-cockroachdb` adapter](https://github.com/cockroachdb/sqlalchemy-cockroachdb). For an example, see [Build a Python App with CockroachDB](build-a-python-app-with-cockroachdb-sqlalchemy.html).
   - **Java** developers accessing the database with [JDBC](https://jdbc.postgresql.org) can re-use the example code implementing retry logic shown in [Build a Java app with CockroachDB](build-a-java-app-with-cockroachdb.html).
2. **Most users, such as application authors**: Abort the transaction using the [`ROLLBACK`](rollback-transaction.html) statement, and then reissue all of the statements in the transaction. For an example, see the [Client-side intervention example](#client-side-intervention-example).
3. **Advanced users, such as library authors**: See [Advanced Client-Side Transaction Retries](advanced-client-side-transaction-retries.html).

{% include {{page.version.version}}/misc/mitigate-contention-note.md %}

#### Client-side intervention example

{% include {{page.version.version}}/misc/client-side-intervention-example.md %}

## Transaction contention

Transactions in CockroachDB lock data resources that are written during their execution. When a pending write from one transaction conflicts with a write of a concurrent transaction, the concurrent transaction must wait for the earlier transaction to complete before proceeding. When a dependency cycle is detected between transactions, the transaction with the higher priority aborts the dependent transaction to avoid deadlock, which must be [retried](#client-side-intervention).

For more details about transaction contention and best practices for avoiding contention, see [Understanding and Avoiding Transaction Contention](performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention).

## Nested transactions

 CockroachDB supports the nesting of transactions using [savepoints](savepoint.html).  These nested transactions are also known as sub-transactions.  Nested transactions can be rolled back without discarding the state of the entire surrounding transaction.

This can be useful in applications that abstract database access using an application development framework or [ORM](install-client-drivers.html).  Different components of the application can operate on different sub-transactions without having to know about each others' internal operations, while trusting that the database will maintain isolation between sub-transactions and preserve data integrity.

Just as [`COMMIT`](commit-transaction.html) and [`ROLLBACK`](rollback-transaction.html) are used to commit and discard entire transactions, respectively, [`RELEASE SAVEPOINT`](release-savepoint.html) and [`ROLLBACK TO SAVEPOINT`](rollback-transaction.html#rollback-a-nested-transaction) are used to commit and discard nested transactions.  This relationship is shown in the table below:

| Statement                                                                          | Effect                                                |
|------------------------------------------------------------------------------------+-------------------------------------------------------|
| [`COMMIT`](commit-transaction.html)                                                | Commit an entire transaction.                         |
| [`ROLLBACK`](rollback-transaction.html)                                            | Discard an entire transaction.                        |
| [`RELEASE SAVEPOINT`](release-savepoint.html)                                      | Commit (really, forget) the named nested transaction. |
| [`ROLLBACK TO SAVEPOINT`](rollback-transaction.html#rollback-a-nested-transaction) | Discard the changes in the named nested transaction.  |

For more information, including examples showing how to use savepoints to create nested transactions, see [the savepoints documentation](savepoint.html#examples).

## Transaction priorities

Every transaction in CockroachDB is assigned an initial **priority**. By default, the transaction priority is `NORMAL`, but for transactions that should be given higher (or lower) preference in [high-contention scenarios](performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention), you can set the priority in the [`BEGIN`](begin-transaction.html) statement:

~~~ sql
> BEGIN PRIORITY <LOW | NORMAL | HIGH>;
~~~

You can also set the priority immediately after a transaction is started:

~~~ sql
> SET TRANSACTION PRIORITY <LOW | NORMAL | HIGH>;
~~~

 To set the default transaction priority for all transactions in a session, use the `default_transaction_priority` [session variable](set-vars.html). For example:

~~~ sql
> SET default_transaction_priority 'high';
~~~

To see the current priority of a transaction, use [`SHOW TRANSACTION PRIORITY`](show-vars.html) or `SHOW transaction_priority`:

~~~ sql
> SHOW transaction_priority;
~~~

~~~
  transaction_priority
------------------------
  high
~~~

~~~ sql
> SHOW TRANSACTION PRIORITY;
~~~

~~~
  transaction_priority
------------------------
  high
~~~

Note that `transaction_priority` is a read-only [session variable](show-vars.html) that cannot be set directly.

{{site.data.alerts.callout_info}}
When two transactions contend for the same resources indirectly, they may create a dependency cycle leading to a deadlock situation, where both transactions are waiting on the other to finish. In these cases, CockroachDB allows the transaction with higher priority to abort the other, which must then retry. On retry, the transaction inherits the higher priority. This means that each retry makes a transaction more likely to succeed in the event it again experiences deadlock.
{{site.data.alerts.end}}

## Isolation levels

CockroachDB executes all transactions at the strongest ANSI transaction isolation level: `SERIALIZABLE`. All other ANSI transaction isolation levels (e.g., `SNAPSHOT`, `READ UNCOMMITTED`, `READ COMMITTED`, and `REPEATABLE READ`) are automatically upgraded to `SERIALIZABLE`. Weaker isolation levels have historically been used to maximize transaction throughput. However, [recent research](http://www.bailis.org/papers/acidrain-sigmod2017.pdf) has demonstrated that the use of weak isolation levels results in substantial vulnerability to concurrency-based attacks.

{{site.data.alerts.callout_info}}
For a detailed discussion of isolation in CockroachDB transactions, see [Serializable, Lockless, Distributed: Isolation in CockroachDB](https://www.cockroachlabs.com/blog/serializable-lockless-distributed-isolation-cockroachdb/).
{{site.data.alerts.end}}

#### Serializable isolation

With `SERIALIZABLE` isolation, a transaction behaves as though it has the entire database all to itself for the duration of its execution. This means that no concurrent writers can affect the transaction unless they commit before it starts, and no concurrent readers can be affected by the transaction until it has successfully committed. This is the strongest level of isolation provided by CockroachDB and it's the default.

`SERIALIZABLE` isolation permits no anomalies. To prevent [write skew](https://en.wikipedia.org/wiki/Snapshot_isolation) anomalies, `SERIALIZABLE` isolation may require transaction restarts. For a demonstration of `SERIALIZABLE` preventing write skew, see [Serializable Transactions](demo-serializable.html).

### Comparison to ANSI SQL isolation levels

CockroachDB uses slightly different isolation levels than [ANSI SQL isolation levels](https://en.wikipedia.org/wiki/Isolation_(database_systems)#Isolation_levels).

#### Aliases

`SNAPSHOT`, `READ UNCOMMITTED`, `READ COMMITTED`, and `REPEATABLE READ` are aliases for `SERIALIZABLE`.

#### Comparison

The CockroachDB `SERIALIZABLE` level is stronger than the ANSI SQL `READ UNCOMMITTED`, `READ COMMITTED`, and `REPEATABLE READ` levels and equivalent to the ANSI SQL `SERIALIZABLE` level.

For more information about the relationship between these levels, see [this paper](http://arxiv.org/ftp/cs/papers/0701/0701157.pdf).

## See also

- [`BEGIN`](begin-transaction.html)
- [`COMMIT`](commit-transaction.html)
- [`ROLLBACK`](rollback-transaction.html)
- [`SAVEPOINT`](savepoint.html)
- [`RELEASE SAVEPOINT`](release-savepoint.html)
- [`SHOW`](show-vars.html)
- [Retryable transaction example code in Java using JDBC](build-a-java-app-with-cockroachdb.html)
- [DB Console Transactions Page](ui-transactions-page.html)
- [CockroachDB Architecture: Transaction Layer](architecture/transaction-layer.html)
- [Transaction retry error reference](transaction-retry-error-reference.html)