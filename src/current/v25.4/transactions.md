---
title: Transactions
summary: CockroachDB supports bundling multiple SQL statements into a single all-or-nothing transaction.
toc: true
docs_area: develop
---

CockroachDB supports bundling multiple SQL statements into a single all-or-nothing transaction. Each transaction guarantees [ACID semantics](https://en.wikipedia.org/wiki/ACID) spanning arbitrary tables and rows, even when data is distributed. If a transaction succeeds, all mutations are applied together with virtual simultaneity. If any part of a transaction fails, the entire transaction is aborted, and the database is left unchanged. By default, CockroachDB guarantees that while a transaction is pending, it is isolated from other concurrent transactions with `SERIALIZABLE` [isolation](#isolation-levels).

For a detailed discussion of CockroachDB transaction semantics, see [How CockroachDB Does Distributed Atomic Transactions](https://www.cockroachlabs.com/blog/how-cockroachdb-distributes-atomic-transactions/) and [Serializable, Lockless, Distributed: Isolation in CockroachDB](https://www.cockroachlabs.com/blog/serializable-lockless-distributed-isolation-cockroachdb/). The explanation of the transaction model described in this blog post is slightly out of date. See the [Transaction Retries](#transaction-retries) section for more details.

## SQL statements

The following SQL statements control transactions.

|                                        Statement                                         |                                                                                                 Description                                                                                                  |
|------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [`BEGIN`]({% link {{ page.version.version }}/begin-transaction.md %})                    | Initiate a transaction and optionally set its [priority](#transaction-priorities), access mode, "as of" timestamp, or [isolation level](#isolation-levels).                                                                |
| [`COMMIT`]({% link {{ page.version.version }}/commit-transaction.md %})                  | Commit a regular transaction, or clear the connection after committing a transaction using the [advanced retry protocol]({% link {{ page.version.version }}/advanced-client-side-transaction-retries.md %}). |
| [`RELEASE SAVEPOINT`]({% link {{ page.version.version }}/release-savepoint.md %})        | Commit a [nested transaction](#nested-transactions); also used for [retryable transactions]({% link {{ page.version.version }}/advanced-client-side-transaction-retries.md %}).                              |
| [`ROLLBACK`]({% link {{ page.version.version }}/rollback-transaction.md %})              | Abort a transaction and roll the database back to its state before the transaction began.                                                                                                                    |
| [`ROLLBACK TO SAVEPOINT`]({% link {{ page.version.version }}/rollback-transaction.md %}) | Roll back a [nested transaction](#nested-transactions); also used to handle [retryable transaction errors]({% link {{ page.version.version }}/advanced-client-side-transaction-retries.md %}).               |
| [`SAVEPOINT`]({% link {{ page.version.version }}/savepoint.md %})                        | Used for [nested transactions](#nested-transactions); also used to implement [advanced client-side transaction retries]({% link {{ page.version.version }}/advanced-client-side-transaction-retries.md %}).  |
| [`SET TRANSACTION`]({% link {{ page.version.version }}/set-transaction.md %})            | Set a transaction's [priority](#transaction-priorities), access mode, "as of" timestamp, or [isolation level](#isolation-levels).                                                                                          |
| [`SHOW`]({% link {{ page.version.version }}/show-vars.md %})                             | Display the current transaction settings.                                                                                                                                                                    |

{{site.data.alerts.callout_info}}
If you are using a framework or library that does not have [advanced retry logic]({% link {{ page.version.version }}/advanced-client-side-transaction-retries.md %}) built in, you should implement an application-level retry loop with exponential backoff. See [Client-side retry handling]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}#client-side-retry-handling).
{{site.data.alerts.end}}

## Syntax

In CockroachDB, a transaction is set up by surrounding SQL statements with the [`BEGIN`]({% link {{ page.version.version }}/begin-transaction.md %}) and [`COMMIT`]({% link {{ page.version.version }}/commit-transaction.md %}) statements.

To use [advanced client-side transaction retries]({% link {{ page.version.version }}/advanced-client-side-transaction-retries.md %}), you should also include the [`SAVEPOINT`]({% link {{ page.version.version }}/savepoint.md %}), [`ROLLBACK TO SAVEPOINT`]({% link {{ page.version.version }}/rollback-transaction.md %}) and [`RELEASE SAVEPOINT`]({% link {{ page.version.version }}/release-savepoint.md %}) statements.

{% include_cached copy-clipboard.html %}
~~~ sql
> BEGIN;

> SAVEPOINT cockroach_restart;

<transaction statements>

> RELEASE SAVEPOINT cockroach_restart;

> COMMIT;
~~~

At any time before it's committed, you can abort the transaction by executing the [`ROLLBACK`]({% link {{ page.version.version }}/rollback-transaction.md %}) statement.

Clients using transactions must also include logic to handle [retries](#transaction-retries).

## Error handling

To handle errors in transactions, you should check for the following types of server-side errors:

Type | Description
-----|------------
**Transaction Retry Errors** | Errors with the code `40001` and string `restart transaction`, which indicate that a transaction failed because it could not be placed in a [serializable ordering]({% link {{ page.version.version }}/demo-serializable.md %}) of transactions by CockroachDB. This occurs under [`SERIALIZABLE`]({% link {{ page.version.version }}/demo-serializable.md %}) isolation and only rarely under [`READ COMMITTED`]({% link {{ page.version.version }}/read-committed.md %}) isolation. For details on transaction retry errors and how to resolve them, see the [Transaction Retry Error Reference]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}#actions-to-take).
**Ambiguous Errors** | Errors with the code `40003` which indicate that the state of the transaction is ambiguous, i.e., you cannot assume it either committed or failed. How you handle these errors depends on how you want to resolve the ambiguity. For information about how to handle ambiguous errors, see [here]({% link {{ page.version.version }}/common-errors.md %}#result-is-ambiguous).
**SQL Errors** | All other errors, which indicate that a statement in the transaction failed. For example, violating the `UNIQUE` constraint generates a `23505` error. After encountering these errors, you can either issue a [`COMMIT`]({% link {{ page.version.version }}/commit-transaction.md %}) or [`ROLLBACK`]({% link {{ page.version.version }}/rollback-transaction.md %}) to abort the transaction and revert the database to its state before the transaction began.<br><br>If you want to attempt the same set of statements again, you must begin a completely new transaction.

## Transaction retries

Transactions may require retries due to [contention]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#understanding-and-avoiding-transaction-contention) with another concurrent or recent transaction attempting to write to the same data.

There are two cases in which transaction retries can occur:

- [Automatic retries](#automatic-retries), which CockroachDB silently processes for you.
- [Client-side retries]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}#client-side-retry-handling), which your application must handle after receiving a [*transaction retry error*]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}) under `SERIALIZABLE` isolation. Client-side retry handling is not necessary for [`READ COMMITTED`]({% link {{ page.version.version }}/read-committed.md %}) transactions. 

To reduce the need for transaction retries, see [Reduce transaction contention]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#reduce-transaction-contention).

### Automatic retries

CockroachDB automatically retries individual statements (implicit transactions) and [transactions sent from the client as a single batch](#batched-statements), as long as the size of the results being produced for the client, including protocol overhead, is less than 16KiB by default. Once that buffer overflows, CockroachDB starts streaming results back to the client, at which point automatic retries cannot be performed any more. As long as the results of a single statement or batch of statements are known to stay clear of this limit, the client does not need to worry about transaction retries.

You can increase the occurrence of automatic retries as a way to [minimize transaction retry errors]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}#minimize-transaction-retry-errors):

{% include {{ page.version.version }}/performance/increase-server-side-retries.md %}

{% include {{page.version.version}}/sql/sql-defaults-cluster-settings-deprecation-notice.md %}

#### Individual statements

Individual statements are treated as implicit transactions, and so they fall
under the rules described above. If the results are small enough, they will be
automatically retried. In particular, `INSERT/UPDATE/DELETE` statements without
a `RETURNING` clause are guaranteed to have minuscule result sizes.
For example, the following statement would be automatically retried by CockroachDB:

~~~ sql
> DELETE FROM customers WHERE id = 1;
~~~

#### Batched statements

Transactions can be sent from the client as a single batch. Batching implies that CockroachDB receives multiple statements without being asked to return results in between them; instead, CockroachDB returns results after executing all of the statements, except when the accumulated results overflow the buffer mentioned above, in which case they are returned sooner and automatic retries can no longer be performed.

Batching is generally controlled by your driver or client's behavior. Technically, it can be achieved in two ways, both supporting automatic retries:

1. When the client/driver is using the [PostgreSQL Extended Query protocol](https://www.postgresql.org/docs/10/static/protocol-flow.html#PROTOCOL-FLOW-EXT-QUERY), a batch is made up of all queries sent in between two `Sync` messages. Many drivers support such batches through explicit batching constructs.

1. When the client/driver is using the [PostgreSQL Simple Query protocol](https://www.postgresql.org/docs/10/static/protocol-flow.html#id-1.10.5.7.4), a batch is made up of semicolon-separated strings sent as a unit to CockroachDB. For example, in Go, this code would send a single batch (which would be automatically retried):

    ~~~ go
    db.Exec(
      "BEGIN;

      DELETE FROM customers WHERE id = 1;

      DELETE orders WHERE customer = 1;

      COMMIT;"
    )
    ~~~

Within a batch of statements, CockroachDB infers that the statements are not
conditional on the results of previous statements, so it can retry all of them.
Of course, if the transaction relies on conditional logic (e.g., statement 2 is
executed only for some results of statement 1), then the transaction cannot be
all sent to CockroachDB as a single batch. In these common cases, CockroachDB
cannot retry, say, statement 2 in isolation. Since results for statement 1 have
already been delivered to the client by the time statement 2 is forcing the
transaction to retry, the client needs to be involved in retrying the whole
transaction and so you should write your transactions to use
[client-side retry handling]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}#client-side-retry-handling).

The [`enable_implicit_transaction_for_batch_statements` session variable]({% link {{ page.version.version }}/set-vars.md %}#enable-implicit-transaction-for-batch-statements) defaults to `true`. This means that any batch of statements is treated as an implicit transaction, so the `BEGIN`/`COMMIT` commands are not needed to group all the statements in one transaction.

#### Bounded staleness reads

In the event [bounded staleness reads]({% link {{ page.version.version }}/follower-reads.md %}#bounded-staleness-reads) are used along with either the [`with_min_timestamp` function or the `with_max_staleness` function]({% link {{ page.version.version }}/functions-and-operators.md %}#date-and-time-functions) and the `nearest_only` parameter is set to `true`, the query will throw an error if it can't be served by a nearby replica.

## Nested transactions

CockroachDB supports the nesting of transactions using [savepoints]({% link {{ page.version.version }}/savepoint.md %}).  These nested transactions are also known as sub-transactions.  Nested transactions can be rolled back without discarding the state of the entire surrounding transaction.

This can be useful in applications that abstract database access using an application development framework or [ORM]({% link {{ page.version.version }}/install-client-drivers.md %}).  Different components of the application can operate on different sub-transactions without having to know about each others' internal operations, while trusting that the database will maintain isolation between sub-transactions and preserve data integrity.

Just as [`COMMIT`]({% link {{ page.version.version }}/commit-transaction.md %}) and [`ROLLBACK`]({% link {{ page.version.version }}/rollback-transaction.md %}) are used to commit and discard entire transactions, respectively, [`RELEASE SAVEPOINT`]({% link {{ page.version.version }}/release-savepoint.md %}) and [`ROLLBACK TO SAVEPOINT`]({% link {{ page.version.version }}/rollback-transaction.md %}#rollback-a-nested-transaction) are used to commit and discard nested transactions.  This relationship is shown in the following table:

| Statement                                                                          | Effect                                                |
|------------------------------------------------------------------------------------+-------------------------------------------------------|
| [`COMMIT`]({% link {{ page.version.version }}/commit-transaction.md %})                                                | Commit an entire transaction.                         |
| [`ROLLBACK`]({% link {{ page.version.version }}/rollback-transaction.md %})                                            | Discard an entire transaction.                        |
| [`RELEASE SAVEPOINT`]({% link {{ page.version.version }}/release-savepoint.md %})                                      | Commit (really, forget) the named nested transaction. |
| [`ROLLBACK TO SAVEPOINT`]({% link {{ page.version.version }}/rollback-transaction.md %}#rollback-a-nested-transaction) | Discard the changes in the named nested transaction.  |

For more information, including examples showing how to use savepoints to create nested transactions, see [the savepoints documentation]({% link {{ page.version.version }}/savepoint.md %}#examples).

## Transaction priorities

Every transaction in CockroachDB is assigned an initial **priority**. By default, the transaction priority is `NORMAL`.

### Set transaction priority

{% include {{ page.version.version }}/sql/use-the-default-transaction-priority.md %}

For transactions that you are absolutely sure should be given higher or lower priority, you can set the priority in the [`BEGIN`]({% link {{ page.version.version }}/begin-transaction.md %}) statement:

~~~ sql
> BEGIN PRIORITY <LOW | NORMAL | HIGH>;
~~~

You can also set the priority immediately after a transaction is started:

~~~ sql
> SET TRANSACTION PRIORITY <LOW | NORMAL | HIGH>;
~~~

To set the default transaction priority for all transactions in a session, use the `default_transaction_priority` [session variable]({% link {{ page.version.version }}/set-vars.md %}). For example:

~~~ sql
> SET default_transaction_priority = 'low';
~~~

### View transaction priority

`transaction_priority` is a read-only [session variable]({% link {{ page.version.version }}/show-vars.md %}).

To view the current priority of a transaction, use `SHOW transaction_priority` or [`SHOW TRANSACTION PRIORITY`]({% link {{ page.version.version }}/show-vars.md %}):

~~~ sql
> SHOW transaction_priority;
~~~

~~~
  transaction_priority
------------------------
  low
~~~

~~~ sql
> SHOW TRANSACTION PRIORITY;
~~~

~~~
  transaction_priority
------------------------
  low
~~~

## Isolation levels

{% include {{ page.version.version }}/sql/isolation-levels.md %}

### Isolation level upgrades

By default, CockroachDB executes all transactions at `SERIALIZABLE` isolation. Under certain conditions, transactions issued at weaker isolation levels are automatically upgraded to stronger isolation levels.

- If `sql.txn.read_committed_isolation.enabled` is set to `true` ([enabling `READ COMMITTED` isolation]({% link {{ page.version.version }}/read-committed.md %}#enable-read-committed-isolation)), `READ UNCOMMITTED` transactions are upgraded to `READ COMMITTED` isolation.

- If `sql.txn.read_committed_isolation.enabled` is set to `false` (disabling `READ COMMITTED` isolation), all transactions are upgraded to `SERIALIZABLE` isolation regardless of the isolation level requested.

### Comparison to ANSI SQL isolation levels

CockroachDB uses slightly different isolation levels than [ANSI SQL isolation levels](https://wikipedia.org/wiki/Isolation_(database_systems)#Isolation_levels).

The CockroachDB `SERIALIZABLE` isolation level is stronger than the ANSI SQL `READ UNCOMMITTED`, `READ COMMITTED`, and `REPEATABLE READ` levels, as well as the `SNAPSHOT` level. It is equivalent to the ANSI SQL `SERIALIZABLE` level.

The CockroachDB `READ COMMITTED` isolation level is stronger than the PostgreSQL `READ COMMITTED` isolation level, and is the strongest isolation level that does not experience [serialization errors]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}) that require [client-side handling]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}#client-side-retry-handling).

For more information about the relationship between these levels, read [A Critique of ANSI SQL Isolation Levels](https://arxiv.org/ftp/cs/papers/0701/0701157.pdf).

## Limit the number of rows written or read in a transaction

You can limit the number of rows written or read in a transaction at the cluster or session level. This allows you configure CockroachDB to log or reject statements that could destabilize a cluster or violate application best practices.

{% include {{ page.version.version }}/sql/transactions-limit-rows.md %}

The limits are enforced after each statement of a transaction has been fully executed. The "write" limits apply to `INSERT`, `INSERT INTO SELECT FROM`, `INSERT ON CONFLICT`, `UPSERT`, `UPDATE`, and `DELETE` SQL statements. The "read" limits apply to the `SELECT` statement in addition to the statements subject to the "write" limits. The limits **do not** apply to `CREATE TABLE AS`, `IMPORT`, `TRUNCATE`, `DROP`, `ALTER TABLE`, `BACKUP`, `RESTORE`, or `CREATE STATISTICS` statements.

{{site.data.alerts.callout_info}}
Enabling `transaction_rows_read_err` disables a performance optimization for mutation statements in implicit transactions where CockroachDB can auto-commit without additional network round trips.
{{site.data.alerts.end}}

## Known limitations

{% include {{ page.version.version }}/known-limitations/transaction-row-count-limitations.md %}

## See also

- [`BEGIN`]({% link {{ page.version.version }}/begin-transaction.md %})
- [`COMMIT`]({% link {{ page.version.version }}/commit-transaction.md %})
- [`ROLLBACK`]({% link {{ page.version.version }}/rollback-transaction.md %})
- [`SAVEPOINT`]({% link {{ page.version.version }}/savepoint.md %})
- [`RELEASE SAVEPOINT`]({% link {{ page.version.version }}/release-savepoint.md %})
- [`SHOW`]({% link {{ page.version.version }}/show-vars.md %})
- [Retryable transaction example code in Java using JDBC]({% link {{ page.version.version }}/build-a-java-app-with-cockroachdb.md %})
- [DB Console Transactions Page]({% link {{ page.version.version }}/ui-transactions-page.md %})
- [CockroachDB Architecture: Transaction Layer]({% link {{ page.version.version }}/architecture/transaction-layer.md %})
- [Transaction retry error reference]({% link {{ page.version.version }}/transaction-retry-error-reference.md %})
