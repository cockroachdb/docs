Changes to [cluster settings]({% link v25.3/cluster-settings.md %}) should be reviewed prior to upgrading. New default cluster setting values will be used unless you have manually set a value for a setting. This can be confirmed by running the SQL statement `SELECT * FROM system.settings` to view the non-default settings.

<h5 id="v25-3-0-settings-added">New settings</h5>

- `sql.metrics.application_name.enabled` - Default to `false` and can be set to `true` to display the application name on supported metrics. [#144610][#144610]
- `sql.metrics.database_name.enabled` - Default to `false` and can be set to `true` to display the database name on supported metrics. [#144610][#144610]
- `sql.sqlcommenter.enabled` - This feature is disabled by default and can be enabled using the `sql.sqlcommenter.enabled` cluster setting. Comments must follow the [SQLCommenter specification](https://google.github.io/sqlcommenter/spec/). [#145435][#145435]
- `sql.trace.txn.sample_rate` and `sql.trace.txn.enable_threshold` - In order to selectively capture traces for transactions running in an active workload without having to capture them via statement diagnostic bundles, customers can now use the `sql.trace.txn.sample_rate` cluster setting to enable tracing for a fraction of their workload. The `sql.trace.txn.enable_threshold` will still need to be set to a positive value to provide a filter for how slow a transaction needs to be after being sampled to merit emitting a trace. Traces are emitted to the `SQL_EXEC` logging channel.

<h5 id="v25-3-0-settings-changed">Setting changes</h5>

- The value of `sql.stats.error_on_concurrent_create_stats.enabled` now defaults to `false`, suppressing error counters for auto stats jobs that fail due to concurrent stats jobs in progress. [#149857][#149857]
- The cluster setting `server.client_cert_expiration_cache.capacity` has been deprecated. The client certificate cache now evicts client certificates based on expiration time. [#144181][#144181]
- To prevent unnecessary queuing in admission control CPU queues, the `goschedstats.always_use_short_sample_period.enabled` setting default was changed to `true` [#146014][#146014]

[#144181]: https://github.com/cockroachdb/cockroach/pull/144181
[#144610]: https://github.com/cockroachdb/cockroach/pull/144610
[#145435]: https://github.com/cockroachdb/cockroach/pull/145435
[#146014]: https://github.com/cockroachdb/cockroach/pull/146014
[#149857]: https://github.com/cockroachdb/cockroach/pull/149857
