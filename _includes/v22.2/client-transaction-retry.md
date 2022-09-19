{{site.data.alerts.callout_info}}
With the default `SERIALIZABLE` [isolation level](transactions.html#isolation-levels), CockroachDB may require the client to [retry a transaction](transactions.html#transaction-retries) in case of read/write contention. CockroachDB provides a [generic retry function](transactions.html#client-side-intervention) that runs inside a transaction and retries it as needed. The code sample below shows how it is used.
{{site.data.alerts.end}}
