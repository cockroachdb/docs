{{site.data.alerts.callout_danger}}
Querying the `crdb_internal.cluster_locks` table triggers an RPC fan-out to all nodes in the cluster, which can make it a relatively expensive operation.
{{site.data.alerts.end}}