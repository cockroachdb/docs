{{site.data.alerts.callout_danger}}
CockroachDB's [`SAVEPOINT`](savepoint.html) implementation does not support nested transactions (i.e., subtransactions).  It is only used to handle [transaction retries](transactions.html#transaction-retries).
{{site.data.alerts.end}}
