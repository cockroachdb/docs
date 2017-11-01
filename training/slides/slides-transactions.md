# Goals

Transactions - https://www.cockroachlabs.com/docs/stable/transactions.html

# Presentation

/----------------------------------------/

## Transactions

SQL is synonymous with ACID transactions, and CockroachDB supports them.

/----------------------------------------/

## Agenda

- SQL Syntax
- Retry Logic

/----------------------------------------/

## SQL

Because CockroachDB is distributed, transactions might fail because of contention, and need to be restarted.

Wherever it can, CockroachDB attempts to restart these transactions internally, but some failures require client intervention

~~~ sql
> BEGIN;
 
> SAVEPOINT cockroach_restart;
 
> <transaction statements>
 
> RELEASE SAVEPOINT cockroach_restart;
 
> COMMIT;
~~~

/----------------------------------------/

## SQL

If client receives retryable error (code `40001`), you can issue a `ROLLBACK` to re-issue the same transaction again:

~~~ sql
> ROLLBACK TO SAVEPOINT cockroach_restart
~~~

/----------------------------------------/

## Retry Logic

In your app, listen for `40001` errors, and then issue the `ROLLBACK` statement:

~~~ js
//adapted from node.js

retryTransaction(err){
	if (err.code === '40001') {
    // Automatically retry
    return client.query('ROLLBACK TO SAVEPOINT cockroach_restart', done);
  }
  // A non-retryable error; break out of the doWhilst with an error.
  return done(err);
}
~~~

Alternatively, you can decide to _not_ retry the transaction by either ignoring `40001` errors or issuing an `ABORT` command.

/----------------------------------------/

# Lab