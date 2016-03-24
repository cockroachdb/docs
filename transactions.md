---
title: Transactions
toc: false
---

CockroachDB fully supports SQL transactions. One of the headline features of the
database is our support for [ACID semantics](https://en.wikipedia.org/wiki/ACID)
for transactions spanning arbitrary SQL rows and tables, even when data is
distributed across machines. In particular, CockroachDB support serializable
transactions.

## Syntax

The syntax is the standard `BEGIN TRANSACTION`, `COMMIT`, `ROLLBACK`.

```
BEGIN TRANSACTION
... do work ...
COMMIT/ROLLBACK TRANSACTION
```

## Retries

A particuliarity of running transaction in CockroachDB is that they sometimes
have to be retried. This stems from our internal use of an 
[optimistic concurrency control
model](https://en.wikipedia.org/wiki/Optimistic_concurrency_control), which
means that transactions don't take locks to protect from concurrent accesses by
others. Instead, we detect when such accesses would result in a violation of the
transaction contract and force one of the transactions involved to retry. Note
that various conditions force transactions in traditional databases to be
retried too (e.g. transactions can generally deadlock under certain access
patters, forcing one of them to fail), but we expect this to be far more common
in Cockroach. This is why we have particular facilities for dealing with
restarts.

In the future, we might provide language-specific libraries that will handle
retries automatically and hide them from client code. For now, the application
needs to perform a couple of steps (probably in a generic wrapper function, see
code samples in [Build a Test App](build-a-test-app.html)).  Cockroach uses the
standard SQL `SAVEPOINT` syntax to assist with retries.  However, we don't
support the full functionality of savepoints, such as nested transactions;
savepoints have to be used in a particular way:

1. Start a transaction.
  ```
  BEGIN TRANSACTION
  ```
2. Define a savepoint called `cockroach_restart` **at the beginning of a
   transaction**.
  ```
  SAVEPOINT cockroach_restart
  ```
3. Run the statements inside the transaction, as you normally would.
4. Every statement might return an error. Some errors are *retryable*. They can
   be recognized either by their error code (`CR000`), or, if the code is not
   available, through the `"retry transaction"` string being present in the
   error message.  
   If a retryable error is found, the transaction can be restarted using the
   rollback to savepoint statement:
   ```
   if retryable_error:
      ROLLBACK TO SAVEPOINT cockroach_restart
   ```
   If the application does not want to retry the transaction, for whatever
   reason, it can simply `ROLLBACK` at this point. Any other statement will be
   rejected by the server, as is generally the case after an error has been
   encountered and the transaction has not been closed.
5. When the transaction is ready to commit, use the standard `RELEASE SAVEPOINT` 
   statement for committing the changes. If this succeeds, all changes made by the 
   transaction become visible to others and are guaranteed to be durable if a crash occurs
   (note that this is a departure from standard SQL semantics, where `RELEASE`
   only destroyes a savepoint, but the changes can still be rolled back with the
   transaction).
   The `RELEASE SAVEPOINT` statement can itself fail with a retryable error. In
   fact, in CockroachDB, `RELEASE` is the most likely statement to fail in this way, as,
   under various circumstances, transactions only realize that they need to be restarted 
   when they attempt to commit. If this happens, the error can be handled as
   described in step 4.
   If the `RELEASE` succeeds, the transaction can be finalized by issuing a `COMMIT`. This statement
   doesn't have an effect over the data; it only serves to finalize a
   transaction's state machine. `COMMIT` will not return a retryable error.
   ```
   RELEASE SAVEPOINT cockroach_restart
   if retryable_error:
      ROLLBACK TO SAVEPOINT cockroach_restart
      ... execute the transaction again ...
   COMMIT
   ```

Note that *implicit transactions* (SQL statements outside of a transaction) are internally 
retried as needed; no special handling of errors is needed.

## Transaction Priorities

Each transaction in CockroachDB has a *priority*, assigned at start and possibly
increased with each retry. This mechanism is designed to prevent starvation of
certain classes of transaction under different access patterns. When two
transactions interact with each other and one of them needs to be retried, the
one with the lowest priority loses. But when it retries, it inherits the
priority of the winner, meaning that each retry makes it stronger and more
likely to succeed.  
The client has some control over the initial priority of a transaction either
when the transaction is started, using the `BEGIN TRANSACTION PRIORITY {LOW,
NORMAL, HIGH}` statement, or immediately after using the `SET TRANSACTION PRIORITY {LOW,
NORMAL, HIGH}` statement. These priorities can be assigned to transactions to
help the ones with stricter deadlines succeed faster in high-contention
scenarios.


## Transaction Conflicts

TODO

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
