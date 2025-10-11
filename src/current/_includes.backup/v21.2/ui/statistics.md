Statistics aggregation is controlled by the [aggregation interval]({{ page_prefix }}statements-page.html#statements-table) property, set to 1 hour. Statistics between two hourly intervals belong to the nearest hour rounded down. For example, a statement execution ending at 1:50 would have its statistics aggregated in the 1:00-2:00 interval.

Aggregated statistics are flushed from memory to statistics tables in the [`crdb_internal`]({{ link_prefix }}crdb-internal.html) system catalog every 10 minutes. The default retention period of the statistics tables is based on the number of rows up to 1 million records. When this threshold is reached, the oldest records are deleted.

To reset SQL statistics in the DB Console UI and `crdb_internal` system catalog, click **clear SQL stats**.

{{site.data.alerts.callout_info}}
The `diagnostics.sql_stat_reset.interval` [cluster setting]({{ link_prefix }}cluster-settings.html) no longer controls the DB Console UI or the persisted statistics tables. `diagnostics.sql_stat_reset.interval` still resets the `node_statement_statistics` and `node_transaction_statistics` in-memory statistics.
{{site.data.alerts.end}}
