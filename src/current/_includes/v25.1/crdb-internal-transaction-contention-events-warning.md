{{site.data.alerts.callout_danger}}
Querying the `crdb_internal.transaction_contention_events` table triggers an expensive RPC fan-out to all nodes, making it a resource-intensive operation. Avoid frequent polling and do not use this table for continuous monitoring.
{{site.data.alerts.end}}