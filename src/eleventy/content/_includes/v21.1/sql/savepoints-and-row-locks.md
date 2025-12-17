CockroachDB supports exclusive row locks.

- In PostgreSQL, row locks are released/cancelled upon [`ROLLBACK TO SAVEPOINT`][rts].
- In CockroachDB, row locks are preserved upon [`ROLLBACK TO SAVEPOINT`][rts].

This is an architectural difference in v20.2 that may or may not be lifted in a later CockroachDB version.

The code of client applications that rely on row locks must be reviewed and possibly modified to account for this difference. In particular, if an application is relying on [`ROLLBACK TO SAVEPOINT`][rts] to release row locks and allow a concurrent transaction touching the same rows to proceed, this behavior will not work with CockroachDB.

<!-- Reference Links -->

[rts]: rollback-transaction.html
