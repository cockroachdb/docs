Statistics are aggregated once an hour and organized by [Interval Start Time](#statement-fingerprint-properties). Statistics between two hourly intervals belong to the nearest hour rounded down. For example, a statement execution ending at 1:50 would have its statistics aggregated in the 1:00 interval start time.

Statistics are persisted in the `crdb_internal` table. The default retention period of this table is based on the number of rows up to 10 million records. When this threshold is reached, the oldest records are deleted.

To reset SQL statistics in the DB Console UI and [`crdb_internal`](crdb-internal.html) tables, click **clear SQL stats**.

{{site.data.alerts.callout_info}}
The `diagnostics.sql_stat_reset.interval` [cluster setting](cluster-settings.html) no longer controls the DB Console or the `crdb_internal.statement_statistics` and `crdb_internal.transaction_statistics` tables. `diagnostics.sql_stat_reset.interval` still resets the in-memory statistics (`node_statement_statistics` and `node_transaction_statistics`).
{{site.data.alerts.end}}
