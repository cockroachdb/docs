Changes to [cluster settings]({% link v25.4/cluster-settings.md %}) should be reviewed prior to upgrading. New default cluster setting values will be used unless you have manually set a value for a setting. This can be confirmed by running the SQL statement `SELECT * FROM system.settings` to view the non-default settings.

<h5 id="v25-4-0-settings-added">New settings</h5>

- `changefeed.progress.frontier_persistence.interval` (default: `30s`)

    Changefeeds will now periodically persist their entire span frontiers so that fewer duplicates will need to be emitted during restarts. The default persistence interval is 30s, but this can be configured with the `changefeed.progress.frontier_persistence.interval` cluster setting. [#153491][#153491]

- `log.channel_compatibility_mode.enabled` (default: `true`)

  - In a future major release, changefeed events will be logged to the `CHANGEFEED` logging channel instead of `TELEMETRY`. To test the impact of this change before upgrading, set the cluster setting `log.channel_compatibility_mode.enabled` to `false`. This redirects changefeed logs to the `CHANGEFEED` channel and should be tested only in non-production environments. [#151807][#151807]
  - In a future major release, SQL performance events will be logged to the `SQL_EXEC` channel instead of the `SQL_PERF` and `SQL_INTERNAL_PERF` channels. To test the impact of this change, you can set the new cluster setting `log.channel_compatibility_mode.enabled` to `false`. This redirects SQL performance logs to the `SQL_EXEC` channel. This setting should not be used in production environments, as it may affect downstream logging pipelines. [#151827][#151827]
  - In a future major release, `sampled_query` and `sampled_transaction` events will move from the `TELEMETRY` channel to the `SQL_EXEC` logging channel. To test for potential logging pipeline impacts of these changes, set `log.channel_compatibility_mode.enabled` to `false`. Avoid testing in production, as this setting changes live log behavior. [#151949][#151949]

- `sql.catalog.allow_leased_descriptors.enabled` (default: `false`)

    Added the `sql.catalog.allow_leased_descriptors.enabled` cluster setting, which is false by default. When set to true, queries that access the `pg_catalog` or `information_schema` can use cached leased descriptors to populate the data in those tables, with the tradeoff that some of the data could be stale. [#154491][#154491]

- `sql.log.scan_row_count_misestimate.enabled` (default: `false`)

    Added a cluster setting (`sql.log.scan_row_count_misestimate.enabled`) that enables logging a warning on the gateway node when optimizer estimates for scans are inaccurate. The log message includes the table and index being scanned, the estimated and actual row counts, the time since the last table stats collection, and the table's estimated staleness. [#155123][#155123]

- `sql.stats.error_on_concurrent_create_stats.enabled` (default: `true`)

    Introduced the cluster setting `sql.stats.error_on_concurrent_create_stats.enabled`, which modifies how CockroachDB reacts to concurrent auto stats jobs. The default, `true`, maintains the previous behavior. Setting `sql.stats.error_on_concurrent_create_stats.enabled` to `false` will cause the concurrent auto stats job to be skipped with just a log entry and no increased error counters. [#149538][#149538]

- `sql.trace.txn.include_internal.enabled` (default: `true`)

    You can now exclude internal transactions from probabilistic transaction tracing and latency-based logging by setting the `sql.trace.txn.include_internal.enabled` cluster setting to false. This setting is enabled by default to preserve the current behavior, but disabling it is recommended when debugging customer workloads to reduce noise in trace output. [#151433][#151433]

- `sql.trace.txn.jaeger_json_output.enabled` (default: `false`)

    You can now output transaction traces to the logs in Jaeger-compatible JSON format. This is controlled by the `sql.trace.txn.jaeger_json_output.enabled` cluster setting, which is disabled by default. When enabled, traces triggered by probabilistic sampling or statement latency thresholds will be formatted for easier ingestion by tools that support the Jaeger tracing format. [#151414][#151414]

- `storage.unhealthy_write_duration` (default: `20s`)

    Added the cluster setting `storage.unhealthy_write_duration` (defaults to 20s), which is used to indicate to the allocator that a store's disk is unhealthy. The cluster setting `kv.allocator.disk_unhealthy_io_overload_score` controls the overload score assigned to a store with an unhealthy disk, where a higher score results in preventing lease or replica transfers to the store, or shedding of leases by the store. The default value of that setting is 0, so the allocator behavior is unaffected. [#154459][#154459]

<h5 id="v25-4-0-settings-changed-default">Settings with changed defaults</h5>

- `feature.vector_index.enabled` now defaults to `true`. Vector indexing is now enabled by default. [#155561][#155561]

- `storage.value_separation.enabled` now defaults to `true`. This enables [value separation]({% link v25.4/architecture/storage-layer.md %}#value-separation) for SSTables, where values exceeding a certain size threshold are stored in separate blob files rather than inline in the SSTable. This helps improve write performance (write amplification) by avoiding rewriting such values during compactions. [#148857][#148857]

<h5 id="v25-4-0-settings-removed">Removed settings</h5>

- `bulkio.backup.deprecated_full_backup_with_subdir.enabled`

    Removed the `bulkio.backup.deprecated_full_backup_with_subdir.enabled` cluster setting. This optional ability to specify a target subdirectory with the `BACKUP` command when creating a full backup was deprecated in v22.1. [#153628][#153628]

- `storage.columnar_blocks.enabled` {% comment %}TODO: Verify with jbowens - Is this backward-incompatible since it can't be disabled anymore?{% endcomment %}

    Removed the `storage.columnar_blocks.enabled` cluster setting; columnar blocks are always enabled. [#149371][#149371]

<h5 id="v25-4-0-settings-other-changes">Other setting changes</h5>

- `sql.ttl.replan_flow_threshold` {% comment %}Verify with spilchen{% endcomment %}

    Updated TTL job replanning to be less sensitive by focusing specifically on detecting when nodes become unavailable rather than reacting to all plan differences. The cluster setting `sql.ttl.replan_flow_threshold` may have been set to `0` to work around the TTL replanner being too sensitive; this fix will alleviate that and any instance that had set `replan_flow_threshold` to `0` can be reset back to the default. [#150771][#150771]

- Updated the redaction policy for cluster settings in `debug zip` output. All "sensitive" settings are now redacted in all debug zips, whether or not redaction is explicitly requested. In redacted debug zips, both "sensitive" and "non-reportable" settings are redacted. This replaces the previous behavior, which redacted all string-type settings only in redacted debug zips. [#150364][#150364]

[#149371]: https://github.com/cockroachdb/cockroach/pull/149371
[#149538]: https://github.com/cockroachdb/cockroach/pull/149538
[#150364]: https://github.com/cockroachdb/cockroach/pull/150364
[#150771]: https://github.com/cockroachdb/cockroach/pull/150771
[#151066]: https://github.com/cockroachdb/cockroach/pull/151066
[#151414]: https://github.com/cockroachdb/cockroach/pull/151414
[#151433]: https://github.com/cockroachdb/cockroach/pull/151433
[#151807]: https://github.com/cockroachdb/cockroach/pull/151807
[#151827]: https://github.com/cockroachdb/cockroach/pull/151827
[#151949]: https://github.com/cockroachdb/cockroach/pull/151949
[#153491]: https://github.com/cockroachdb/cockroach/pull/153491
[#153628]: https://github.com/cockroachdb/cockroach/pull/153628
[#154459]: https://github.com/cockroachdb/cockroach/pull/154459
[#154491]: https://github.com/cockroachdb/cockroach/pull/154491
[#155123]: https://github.com/cockroachdb/cockroach/pull/155123
[#155561]: https://github.com/cockroachdb/cockroach/pull/155561
