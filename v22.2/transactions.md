---
title: Transactions
summary: CockroachDB supports bundling multiple SQL statements into a single all-or-nothing transaction.
toc: true
docs_area: develop
---

CockroachDB supports bundling multiple SQL statements into a single all-or-nothing transaction. Each transaction guarantees [ACID semantics](https://en.wikipedia.org/wiki/ACID) spanning arbitrary tables and rows, even when data is distributed. If a transaction succeeds, all mutations are applied together with virtual simultaneity. If any part of a transaction fails, the entire transaction is aborted, and the database is left unchanged. CockroachDB guarantees that while a transaction is pending, it is isolated from other concurrent transactions with serializable [isolation](#isolation-levels).

For a detailed discussion of CockroachDB transaction semantics, see [How CockroachDB Does Distributed Atomic Transactions](https://www.cockroachlabs.com/blog/how-cockroachdb-distributes-atomic-transactions/) and [Serializable, Lockless, Distributed: Isolation in CockroachDB](https://www.cockroachlabs.com/blog/serializable-lockless-distributed-isolation-cockroachdb/). The explanation of the transaction model described in this blog post is slightly out of date. See the [Transaction Retries](#transaction-retries) section for more details.

## SQL statements

The following SQL statements control transactions.

| Statement                                            | Description                                                                                                                                                              |
|------------------------------------------------------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [`BEGIN`](begin-transaction.html)                    | Initiate a transaction, as well as control its [priority](#transaction-priorities).                                                                                      |
| [`SET TRANSACTION`](set-transaction.html)            | Control a transaction's [priority](#transaction-priorities).                                                                                                             |
| [`COMMIT`](commit-transaction.html)                  | Commit a regular transaction, or clear the connection after committing a transaction using the [advanced retry protocol](advanced-client-side-transaction-retries.html). |
| [`ROLLBACK`](rollback-transaction.html)              | Abort a transaction and roll the database back to its state before the transaction began.                                                                                |
| [`SHOW`](show-vars.html)                             | Display the current transaction settings.                                                                                                                                |
| [`SAVEPOINT`](savepoint.html)                        | Used for [nested transactions](#nested-transactions); also used to implement [advanced client-side transaction retries](advanced-client-side-transaction-retries.html).  |
| [`RELEASE SAVEPOINT`](release-savepoint.html)        | Commit a [nested transaction](#nested-transactions); also used for [retryable transactions](advanced-client-side-transaction-retries.html).                              |
| [`ROLLBACK TO SAVEPOINT`](rollback-transaction.html) | Roll back a [nested transaction](#nested-transactions); also used to handle [retryable transaction errors](advanced-client-side-transaction-retries.html).               |

{{site.data.alerts.callout_info}}
If you are using a framework or library that does not have [advanced retry logic](advanced-client-side-transaction-retries.html) built in, you should implement an application-level retry loop with exponential backoff. See [Client-side intervention](#client-side-intervention).
{{site.data.alerts.end}}

## Syntax

In CockroachDB, a transaction is set up by surrounding SQL statements with the [`BEGIN`](begin-transaction.html) and [`COMMIT`](commit-transaction.html) statements.

To use [advanced client-side transaction retries](advanced-client-side-transaction-retries.html), you should also include the [`SAVEPOINT`](savepoint.html), [`ROLLBACK TO SAVEPOINT`](rollback-transaction.html) and [`RELEASE SAVEPOINT`](release-savepoint.html) statements.

{% include_cached copy-clipboard.html %}
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

Transactions may require retries if they experience deadlock or [read/write contention](performance-best-practices-overview.html#transaction-contention) with other concurrent transactions which cannot be resolved without allowing potential [serializable anomalies](https://en.wikipedia.org/wiki/Serializability).

To mitigate read-write contention and reduce the need for transaction retries, use the following techniques:

- Perform reads using [`AS OF SYSTEM TIME`](performance-best-practices-overview.html#use-as-of-system-time-to-decrease-conflicts-with-long-running-queries).
- Use [`SELECT FOR UPDATE`](select-for-update.html) to order transactions by controlling concurrent access to one or more rows of a table.  This reduces retries in scenarios where a transaction performs a read and then updates the same row it just read.

There are two cases in which transaction retries can occur:

- [Automatic retries](#automatic-retries), which CockroachDB processes for you.
- [Client-side intervention](#client-side-intervention), which your application must handle.

### Automatic retries

CockroachDB automatically retries individual statements (implicit transactions) and transactions sent from the client as a single batch, as long as the size of the results being produced for the client, including protocol overhead, is less than 16KiB by default. Once that buffer overflows, CockroachDB starts streaming results back to the client, at which point automatic retries cannot be performed any more. As long as the results of a single statement or batch of statements are known to stay clear of this limit, the client does not need to worry about transaction retries.

You can change the results buffer size for all new sessions using the `sql.defaults.results_buffer.size` [cluster setting](cluster-settings.html), or for a specific session using the `results_buffer_size` [session variable](set-vars.html). Decreasing the buffer size can increase the number of transaction retry errors a client receives, whereas increasing the buffer size can increase the delay until the client receives the first result row.

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

2. When the client/driver is using the [PostgreSQL Simple Query protocol](https://www.postgresql.org/docs/10/static/protocol-flow.html#id-1.10.5.7.4), a batch is made up of semicolon-separated strings sent as a unit to CockroachDB. For example, in Go, this code would send a single batch (which would be automatically retried):

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
[client-side intervention](#client-side-intervention).

**New in v22.2:** The [`enable_implicit_transaction_for_batch_statements` session variable](#set-vars) defaults to `true`. This means that any batch of statements is treated as an implicit transaction, so the `BEGIN`/`COMMIT` commands are not needed to group all the statements in one transaction.

#### Bounded staleness reads

In the event [bounded staleness reads](follower-reads.html#bounded-staleness-reads) are used along with either the [`with_min_timestamp` function or the `with_max_staleness` function](functions-and-operators.html#date-and-time-functions) and the `nearest_only` parameter is set to `true`, the query will throw an error if it can't be served by a nearby replica.

### Client-side intervention

Your application should include client-side retry handling when the statements are sent individually, such as:

{% include_cached copy-clipboard.html %}
~~~ sql
> BEGIN;

> UPDATE products SET inventory = 0 WHERE sku = '8675309';

> INSERT INTO orders (customer, status) VALUES (1, 'new');

> COMMIT;
~~~

To indicate that a transaction must be retried, CockroachDB signals an error with the `SQLSTATE` error code `40001` (serialization error) and an error message that begins with the string `"restart transaction"`.  For a complete list of transaction retry error codes, see [Transaction retry error reference](transaction-retry-error-reference.html).

To handle these types of errors, you have the following options:

- If your database library or framework provides a method for retryable transactions (it will often be documented as a tool for handling deadlocks), use it.
- If you're building an application in the following languages, Cockroach Labs has created adapters that include automatic retry handling:
   - **Go** developers using [GORM](https://github.com/jinzhu/gorm) or [pgx](https://github.com/jackc/pgx) can use the [`github.com/cockroachdb/cockroach-go/crdb`](https://github.com/cockroachdb/cockroach-go/tree/master/crdb) package. For an example, see [Build a Go App with CockroachDB](build-a-go-app-with-cockroachdb.html).
   - **Python** developers using [SQLAlchemy](https://www.sqlalchemy.org) can use the [`sqlalchemy-cockroachdb` adapter](https://github.com/cockroachdb/sqlalchemy-cockroachdb). For an example, see [Build a Python App with CockroachDB and SQLAlchemy](build-a-python-app-with-cockroachdb-sqlalchemy.html).
   - **Ruby (Active Record)** developers can use the [`activerecord-cockroachdb-adapter`](https://rubygems.org/gems/activerecord-cockroachdb-adapter). For an example, see [Build a Ruby App with CockroachDB and Active Record](build-a-ruby-app-with-cockroachdb-activerecord.html).
- If you're building an application with another driver or data access framework that is [supported by CockroachDB](third-party-database-tools.html), we recommend reusing the retry logic in our ["Simple CRUD" Example Apps](example-apps.html). For example, **Java** developers accessing the database with [JDBC](https://jdbc.postgresql.org) can reuse the example code implementing retry logic shown in [Build a Java app with CockroachDB](build-a-java-app-with-cockroachdb.html).
- If you're building an application with a language and framework for which we do not provide example retry logic, you might need to write your own retry logic. For an example, see the [Client-side intervention example](#client-side-intervention-example).
- **Advanced users, such as library authors**: See [Advanced Client-Side Transaction Retries](advanced-client-side-transaction-retries.html).

#### Client-side intervention example

{% include {{page.version.version}}/misc/client-side-intervention-example.md %}

#### Testing transaction retry logic

To test your transaction retry logic, use the [`inject_retry_errors_enabled` session variable](set-vars.html#supported-variables). When `inject_retry_errors_enabled` is set to `true`, any statement (with the exception of [`SET` statements](set-vars.html)) executed in the session inside of an explicit transaction will return a [transaction retry error](transaction-retry-error-reference.html) with the message ```restart transaction: TransactionRetryWithProtoRefreshError: injected by `inject_retry_errors_enabled` session variable```.

If the client retries the transaction using the special [`cockroach_restart` `SAVEPOINT` name](savepoint.html#savepoints-for-client-side-transaction-retries), after the 3rd retry, the transaction will proceed as normal. Otherwise, the errors will continue until the client issues a `SET inject_retry_errors_enabled=false` statement.

For example, suppose you've written a wrapper function with some retry logic that you want to use to execute statements across a [`psycopg2`](https://www.psycopg.org/) connection:

~~~ python
def run_transaction(conn, op, max_retries=3):    
    """
    Execute the operation *op(conn)* retrying serialization failures.

    If the database returns an error asking to retry the transaction, retry it
    *max_retries* times before giving up (and propagate it).
    """
    # leaving this block the transaction will commit or rollback
    # (if leaving with an exception)
    with conn:
        for retry in range(1, max_retries + 1):
            try:
                op(conn)
                # If we reach this point, we were able to commit, so we break
                # from the retry loop.
                return

            except SerializationFailure as e:
                # This is a retry error, so we roll back the current
                # transaction and sleep for a bit before retrying. The
                # sleep time increases for each failed transaction.
                logging.debug("got error: %s", e)
                conn.rollback()
                sleep_ms = (2 ** retry) * 0.1 * (random.random() + 0.5)
                logging.debug("Sleeping %s seconds", sleep_ms)
                time.sleep(sleep_ms)

            except psycopg2.Error as e:
                logging.debug("got error: %s", e)
                raise e

        raise ValueError(f"Transaction did not succeed after {max_retries} retries")
~~~

`run_transaction` takes a SQL-executing function `op(conn)` and attempts to run the function, retrying on serialization failures (exposed in pscyopg2 as the [`SerializationFailure` exception class](https://www.psycopg.org/docs/errors.html#sqlstate-exception-classes)) with exponential backoff, until reaching a maximum number of tries.

You can add a quick test to this function using the `inject_retry_errors_enabled` session variable.

~~~ python
def run_transaction(conn, op=None, max_retries=3):
    """
    Execute the operation *op(conn)* retrying serialization failure.
    If no op is specified, the function runs a test, using the
    inject_retry_errors_enabled session variable to inject errors.

    If the database returns an error asking to retry the transaction, retry it
    *max_retries* times before giving up (and propagate it).
    """
    # leaving this block the transaction will commit or rollback
    # (if leaving with an exception)
    with conn:
        for retry in range(1, max_retries + 1):
            try:
                if not op:
                    with conn.cursor() as cur:
                        if retry == 1:
                            cur.execute("SET inject_retry_errors_enabled = 'true'")
                        if retry == max_retries:
                            cur.execute("SET inject_retry_errors_enabled = 'false'")
                        cur.execute("SELECT now()")
                        logging.debug("status message: %s", cur.statusmessage)
                else:
                    op(conn)
                # If we reach this point, we were able to commit, so we break
                # from the retry loop.
                return

            except SerializationFailure as e:
                # This is a retry error, so we roll back the current
                # transaction and sleep for a bit before retrying. The
                # sleep time increases for each failed transaction.
                logging.debug("got error: %s", e)
                conn.rollback()
                sleep_ms = (2 ** retry) * 0.1 * (random.random() + 0.5)
                logging.debug("Sleeping %s seconds", sleep_ms)
                time.sleep(sleep_ms)

            except psycopg2.Error as e:
                logging.debug("got error: %s", e)
                raise e

        raise ValueError(f"Transaction did not succeed after {max_retries} retries")
~~~

Calling `run_transaction` without an `op` input sets `inject_retry_errors_enabled` as `true` until the final retry attempt, before which the `inject_retry_errors_enabled` is set back to `false`. For all attempts except the last one, CockroachDB will inject a retryable serialization error for the client to handle. If the client cannot handle the error properly, the retry logic isn't working properly.

## Transaction contention

Transactions in CockroachDB lock data resources that are written during their execution. When a pending write from one transaction conflicts with a write of a concurrent transaction, the concurrent transaction must wait for the earlier transaction to complete before proceeding. When a dependency cycle is detected between transactions, the transaction with the higher priority aborts the dependent transaction to avoid deadlock, which must be [retried](#client-side-intervention).

For more details about transaction contention and best practices for avoiding contention, see [Transaction Contention](performance-best-practices-overview.html#transaction-contention).

## Nested transactions

CockroachDB supports the nesting of transactions using [savepoints](savepoint.html).  These nested transactions are also known as sub-transactions.  Nested transactions can be rolled back without discarding the state of the entire surrounding transaction.

This can be useful in applications that abstract database access using an application development framework or [ORM](install-client-drivers.html).  Different components of the application can operate on different sub-transactions without having to know about each others' internal operations, while trusting that the database will maintain isolation between sub-transactions and preserve data integrity.

Just as [`COMMIT`](commit-transaction.html) and [`ROLLBACK`](rollback-transaction.html) are used to commit and discard entire transactions, respectively, [`RELEASE SAVEPOINT`](release-savepoint.html) and [`ROLLBACK TO SAVEPOINT`](rollback-transaction.html#rollback-a-nested-transaction) are used to commit and discard nested transactions.  This relationship is shown in the following table:

| Statement                                                                          | Effect                                                |
|------------------------------------------------------------------------------------+-------------------------------------------------------|
| [`COMMIT`](commit-transaction.html)                                                | Commit an entire transaction.                         |
| [`ROLLBACK`](rollback-transaction.html)                                            | Discard an entire transaction.                        |
| [`RELEASE SAVEPOINT`](release-savepoint.html)                                      | Commit (really, forget) the named nested transaction. |
| [`ROLLBACK TO SAVEPOINT`](rollback-transaction.html#rollback-a-nested-transaction) | Discard the changes in the named nested transaction.  |

For more information, including examples showing how to use savepoints to create nested transactions, see [the savepoints documentation](savepoint.html#examples).

## Transaction priorities

Every transaction in CockroachDB is assigned an initial **priority**. By default, the transaction priority is `NORMAL`.

### Set transaction priority

For transactions that should be given higher or lower preference in [high-contention scenarios](performance-best-practices-overview.html#transaction-contention), you can set the priority in the [`BEGIN`](begin-transaction.html) statement:

~~~ sql
> BEGIN PRIORITY <LOW | NORMAL | HIGH>;
~~~

You can also set the priority immediately after a transaction is started:

~~~ sql
> SET TRANSACTION PRIORITY <LOW | NORMAL | HIGH>;
~~~

To set the default transaction priority for all transactions in a session, use the `default_transaction_priority` [session variable](set-vars.html). For example:

~~~ sql
> SET default_transaction_priority = 'high';
~~~

{{site.data.alerts.callout_info}}
When two transactions contend for the same resources indirectly, they may create a dependency cycle leading to a deadlock situation, where both transactions are waiting on the other to finish. In these cases, CockroachDB allows the transaction with higher priority to abort the other, which must then retry. On retry, the transaction inherits the higher priority. This means that each retry makes a transaction more likely to succeed in the event it again experiences deadlock.
{{site.data.alerts.end}}

### View transaction priority

`transaction_priority` is a read-only [session variable](show-vars.html).

To view the current priority of a transaction, use `SHOW transaction_priority` or [`SHOW TRANSACTION PRIORITY`](show-vars.html):

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

## Isolation levels

CockroachDB executes all transactions at the strongest ANSI transaction isolation level:
`SERIALIZABLE`. All other ANSI transaction isolation levels (e.g., `SNAPSHOT`, `READ UNCOMMITTED`,
`READ COMMITTED`, and `REPEATABLE READ`) are automatically upgraded to `SERIALIZABLE`. Weaker
isolation levels have historically been used to maximize transaction throughput. However,
[ACIDRain: Concurrency-Related Attacks on Database-Backed Web Applications](http://www.bailis.org/papers/acidrain-sigmod2017.pdf) has demonstrated that the use
of weak isolation levels results in substantial vulnerability to concurrency-based attacks.

For a detailed discussion of isolation in CockroachDB transactions, see [Serializable, Lockless, Distributed: Isolation in CockroachDB](https://www.cockroachlabs.com/blog/serializable-lockless-distributed-isolation-cockroachdb/).

#### Serializable isolation

With `SERIALIZABLE` isolation, a transaction behaves as though it has the entire database all to itself for the duration of its execution. This means that no concurrent writers can affect the transaction unless they commit before it starts, and no concurrent readers can be affected by the transaction until it has successfully committed. This is the strongest level of isolation provided by CockroachDB and it's the default.

`SERIALIZABLE` isolation permits no anomalies. To prevent [write skew](https://en.wikipedia.org/wiki/Snapshot_isolation) anomalies, `SERIALIZABLE` isolation may require transaction restarts. For a demonstration of `SERIALIZABLE` preventing write skew, see [Serializable Transactions](demo-serializable.html).

### Comparison to ANSI SQL isolation levels

CockroachDB uses slightly different isolation levels than [ANSI SQL isolation levels](https://en.wikipedia.org/wiki/Isolation_(database_systems)#Isolation_levels).

#### Aliases

`SNAPSHOT`, `READ UNCOMMITTED`, `READ COMMITTED`, and `REPEATABLE READ` are aliases for `SERIALIZABLE`.

#### Comparison

The CockroachDB `SERIALIZABLE` level is stronger than the ANSI SQL `READ UNCOMMITTED`, `READ COMMITTED`, and `REPEATABLE READ` levels and equivalent to the ANSI SQL `SERIALIZABLE` level.

For more information about the relationship between these levels, see [A Critique of ANSI SQL Isolation Levels](https://arxiv.org/ftp/cs/papers/0701/0701157.pdf).

## Limit the number of rows written or read in a transaction

You can limit the number of rows written or read in a transaction at the cluster or session level. This allows you configure CockroachDB to log or reject statements that could destabilize a cluster or violate application best practices.

Use the [cluster settings](cluster-settings.html) `sql.defaults.transaction_rows_written_log`,
`sql.defaults.transaction_rows_written_err`, `sql.defaults.transaction_rows_read_log`, and
`sql.defaults.transaction_rows_read_err` and [session settings](set-vars.html) `transaction_rows_written_log`,
`transaction_rows_written_err`, `transaction_rows_read_log`, and
`transaction_rows_read_err` to limit the number of rows written or read in a
transaction. When the `log` limit is reached, the transaction is logged to the `SQL_PERF` channel.
When the `err` limit is reached, the transaction is rejected. The limits are enforced after each
statement of a transaction has been fully executed.

The "write" limits apply to `INSERT`, `INSERT INTO SELECT FROM`, `INSERT ON CONFLICT`, `UPSERT`, `UPDATE`,
and `DELETE` SQL statements. The "read" limits apply to the `SELECT`
statement in addition to the statements subject to the "write" limits. The limits **do not**
apply to `CREATE TABLE AS`, `SELECT`, `IMPORT`, `TRUNCATE`, `DROP`, `ALTER TABLE`, `BACKUP`,
`RESTORE`, or `CREATE STATISTICS` statements.

{{site.data.alerts.callout_info}}
Enabling `transaction_rows_read_err` disables a performance optimization for mutation statements in implicit transactions where CockroachDB can auto-commit without additional network round trips.
{{site.data.alerts.end}}

{% include {{page.version.version}}/sql/sql-defaults-cluster-settings-deprecation-notice.md %}

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
