Set the `force_savepoint_restart` [session variable](set-vars.html#supported-variables) to `true` to enable using a custom name for the [retry savepoint](advanced-client-side-transaction-retries.html#retry-savepoints).

Once this variable is set, the [`SAVEPOINT`](savepoint.html) statement will accept any name for the retry savepoint, not just `cockroach_restart`. In addition, it causes every savepoint name to be equivalent to `cockroach_restart`, therefore disallowing the use of [nested transactions](transactions.html#nested-transactions).

This feature exists to support applications that want to use the [advanced client-side transaction retry protocol](advanced-client-side-transaction-retries.html), but cannot customize the name of savepoints to be `cockroach_restart`.  For example, this may be necessary because you are using an ORM that requires its own names for savepoints.
