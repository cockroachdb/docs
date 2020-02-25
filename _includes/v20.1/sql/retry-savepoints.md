A savepoint defined with the name `cockroach_restart` is a "retry savepoint" and is used to implement [client-side transaction retries](savepoint.html#savepoints-for-client-side-transaction-retries).  A retry savepoint differs from a [standard savepoint](savepoint.html#nested-savepoints) as follows:

- It must be the outermost savepoint in the transaction.
- After a successful [`RELEASE`](release-savepoint.html), a retry savepoint does not allow further use of the transaction.  The next statement must be a [`COMMIT`](commit-transaction.html).
- It cannot be nested.  Issuing `SAVEPOINT cockroach_restart` two times in a row only creates a single savepoint marker (this can be verified with [`SHOW SAVEPOINT STATUS`](show-savepoint-status.html)).  Issuing `SAVEPOINT cockroach_restart` after `ROLLBACK TO SAVEPOINT cockroach_restart` reuses the marker instead of creating a new one.
