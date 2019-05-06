<span class="version-tag">New in v19.1:</span> Set the `force_savepoint_restart` [session variable](set-vars.html#supported-variables) to `true` to enable using a custom name for the restart savepoint (for example, because you are using an ORM that wants to use its own names for savepoints).

Once this variable is set, the [`SAVEPOINT`](savepoint.html) statement will accept any name for the savepoint, not just `cockroach_restart`. This allows compatibility with existing code that uses a single savepoint per transaction as long as that savepoint occurs before any statements that access data stored in non-virtual tables.

{{site.data.alerts.callout_danger}}
The `force_savepoint_restart` variable changes the semantics of CockroachDB savepoints so that `RELEASE SAVEPOINT <your-custom-name>` functions as a real commit. Note that the existence of this variable and its behavior does not change the fact that CockroachDB savepoints can only be used as a part of the transaction retry protocol.
{{site.data.alerts.end}}
