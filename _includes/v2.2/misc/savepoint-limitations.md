{{site.data.alerts.callout_danger}}
CockroachDB's [`SAVEPOINT`](savepoint.html) implementation does not support nested transactions (a.k.a. subtransactions).  It is only used to handle [transaction retries](transactions.html#transaction-retries).
{{site.data.alerts.end}}
