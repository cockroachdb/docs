Statistics aggregation is controlled by the `sql.stats.aggregation.interval` [cluster setting]({{ link_prefix }}cluster-settings.html), set to 1 hour by default.

Aggregated statistics are flushed from memory to statistics tables in the [`crdb_internal`]({{ link_prefix }}crdb-internal.html) system catalog every 10 minutes. The flushing interval is controlled by the `sql.stats.flush.interval` cluster setting.

The default retention period of the statistics tables is based on the number of rows up to 1 million records. When this threshold is reached, the oldest records are deleted. The `diagnostics.forced_sql_stat_reset.interval` [cluster setting]({{ link_prefix }}cluster-settings.html) controls when persisted statistics are deleted only if the internal cleanup service experiences a failure.

If desired, [admin users]({{ link_prefix }}security-reference/authorization.html#admin-role) may reset SQL statistics in the DB Console UI and `crdb_internal` system catalog by clicking **reset SQL stats**. This link does not appear for non-admin users.
