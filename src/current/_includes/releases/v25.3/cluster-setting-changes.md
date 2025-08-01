Changes to [cluster settings]({% link v25.2/cluster-settings.md %}) should be reviewed prior to upgrading. New default cluster setting values will be used unless you have manually set a value for a setting. This can be confirmed by running the SQL statement `SELECT * FROM system.settings` to view the non-default settings.

<h5 id="v25-2-0-settings-added">Settings added</h5>

# Key cluster setting changes

- `server.jwt_authentication.userinfo_group_key` (reserved)
  - CockroachDB can now synchronize SQL role membership from the groups claim contained in a JWT when the cluster setting `server.jwt_authentication.authorization.enabled` is set to `true`.  The claim name and the fallback `userinfo` JSON key are configurable by the cluster settings `server.jwt_authentication.group_claim` and `server.jwt_authentication.userinfo_group_key` respectively. This behavior matches the existing LDAP role-sync feature. [#147318][#147318]


- `server.telemetry.hot_ranges_stats.enabled` (reserved)
  - When the `server.telemetry.hot_ranges_stats.enabled` cluster setting is enabled, nodes check for hot ranges every minute instead of every 4 hours. A node logs its hot ranges when any single replica exceeds 250 ms of CPU time per second. In multi-tenant deployments, the check runs every 5 minutes and logs hot ranges for the entire cluster. [#144414][#144414]


- `sql.metrics.application_name.enabled`
  - Fixed an issue where some SQL metrics were not reported when `server.child_metrics.enabled` was enabled, `server.child_metrics.include_aggregate.enabled` was disabled, and `sql.metrics.application_name.enabled` and `sql.metrics.database_name.enabled` were also disabled. Specifically, metrics with no children now report their aggregate metrics regardless of the `server.child_metrics.include_aggregate.enabled` cluster setting.
  - Added new cluster settings: `sql.metrics.application_name.enabled` and `sql.metrics.database_name.enabled`. These settings default to `false` and can be set to `true` to display the application name and database name, respectively, on supported metrics. [#144610][#144610]

- `sql.metrics.database_name.enabled`
  - Fixed an issue where some SQL metrics were not reported when `server.child_metrics.enabled` was enabled, `server.child_metrics.include_aggregate.enabled` was disabled, and `sql.metrics.application_name.enabled` and `sql.metrics.database_name.enabled` were also disabled. Specifically, metrics with no children now report their aggregate metrics regardless of the `server.child_metrics.include_aggregate.enabled` cluster setting.
  - Added new cluster settings: `sql.metrics.application_name.enabled` and `sql.metrics.database_name.enabled`. These settings default to `false` and can be set to `true` to display the application name and database name, respectively, on supported metrics. [#144610][#144610]

- `sql.sqlcommenter.enabled`
      - In the `crdb_internal.cluster_execution_insights` and `crdb_internal.node_execution_insights` virtual tables in a new `query_tags` JSONB column.

    This feature is disabled by default and can be enabled using the `sql.sqlcommenter.enabled` cluster setting. Comments must follow the [SQLCommenter specification](https://google.github.io/sqlcommenter/spec/). [#145435][#145435]
      - In the `crdb_internal.cluster_execution_insights` and `crdb_internal.node_execution_insights` virtual tables in a new `query_tags` JSONB column.

    This feature is disabled by default and can be enabled using the `sql.sqlcommenter.enabled` cluster setting. Comments must follow the [SQLCommenter specification](https://google.github.io/sqlcommenter/spec/). [#145435][#145435]

- `sql.stats.automatic_partial_collection.enabled`
  - In v25.1, automatic partial statistics collection was enabled by default (by setting the `sql.stats.automatic_partial_collection.enabled` cluster setting to `true`). Partial statistics collection may encounter certain expected scenarios that were previously reported as failed stats jobs with PostgreSQL error code `55000`. These errors are benign and are no longer reported. Instead, the stats job will be marked as "succeeded," though no new statistics will be created.

- `sql.trace.txn.enable_threshold`
  - In order to selectively capture traces for transactions running in an active workload without having to capture them via statement diagnostic bundles, customers can now use the `sql.trace.txn.sample_rate` cluster setting to enable tracing for a fraction of their workload. The `sql.trace.txn.enable_threshold` will still need to be set to a positive value to provide a filter for how slow a transaction needs to be after being sampled to merit emitting a trace. Traces are emitted to the `SQL_EXEC` logging channel.

- `sql.trace.txn.sample_rate`
  - In order to selectively capture traces for transactions running in an active workload without having to capture them via statement diagnostic bundles, customers can now use the `sql.trace.txn.sample_rate` cluster setting to enable tracing for a fraction of their workload. The `sql.trace.txn.enable_threshold` will still need to be set to a positive value to provide a filter for how slow a transaction needs to be after being sampled to merit emitting a trace. Traces are emitted to the `SQL_EXEC` logging channel.

- A new feature is now available that automatically captures Go execution traces on a scheduled interval. This feature incurs a performance penalty and is generally intended for use under the guidance of Cockroach Labs Support. This feature can be configured using the following cluster settings:
  - `obs.execution_tracer.interval`: Enables the tracer and sets the interval for capturing traces. Set to a value greater than 0 to activate.
  - `obs.execution_tracer.duration`: Specifies the duration for each captured trace.
  - `obs.execution_tracer.total_dump_size_limit`: Sets the maximum disk space allowed for storing execution traces. Older traces are automatically deleted when this limit is reached.
 [#149705][#149705]
- The value of `sql.stats.error_on_concurrent_create_stats.enabled` now defaults to `false`, suppressing error counters for auto stats jobs that fail due to concurrent stats jobs in progress.
 [#149857][#149857]

- The cluster setting `server.client_cert_expiration_cache.capacity` has been deprecated. The client certificate cache now evicts client certificates based on expiration time. [#144181][#144181]
