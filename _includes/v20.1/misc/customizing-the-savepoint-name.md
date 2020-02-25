Set the `force_savepoint_restart` [session variable](set-vars.html#supported-variables) to `true` to enable using a custom name for the retry savepoint (for example, because you are using an ORM that wants to use its own names for savepoints).

Once this variable is set, the [`SAVEPOINT`](savepoint.html) statement will accept any name for the retry savepoint, not just `cockroach_restart`. In addition, it causes every savepoint name to be equivalent to `cockroach_restart`, therefore disallowing the use of [generalized, nested savepoints](savepoint.html#nested-savepoints).

This behavior allows compatibility with existing code that uses a single savepoint per transaction as long as that savepoint occurs before any statements that access data stored in non-virtual tables.
