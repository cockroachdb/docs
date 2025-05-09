Changes to [cluster settings]({% link v25.2/cluster-settings.md %}) should be reviewed prior to upgrading. New default cluster setting values will be used unless you have manually set a value for a setting. This can be confirmed by running the SQL statement `SELECT * FROM system.settings` to view the non-default settings.

- [Settings added](#v25-2-0-settings-added)
- [Settings with changed defaults](#v25-2-0-settings-with-changed-defaults)
- [Settings with changed visibility](#v25-2-0-settings-with-changed-visibility)
- [Additional setting changes](#v25-2-0-additional-cluster-setting-changes)

<h5 id="v25-2-0-settings-added">Settings added</h5>

- `backup.compaction.threshold` (reserved)

- `backup.compaction.window_size` (reserved)

- `backup.restore.online_layer_limit` (reserved)

- `bulkio.index_backfill.merge_max_kv_auto_retries` (reserved)

- `feature.vector_index.enabled`

- `kv.closed_timestamp.lead_for_global_reads_auto_tune.enabled`

- `kv.closed_timestamp.policy_latency_refresh_interval` (reserved)

- `kv.closed_timestamp.policy_refresh_interval` (reserved)

- `kv.lock_table.unreplicated_lock_reliability.lease_transfer.enabled` (reserved)

- `kv.lock_table.unreplicated_lock_reliability.max_flush_size` (reserved)

- `kv.lock_table.unreplicated_lock_reliability.merge.enabled` (reserved)

- `kv.lock_table.unreplicated_lock_reliability.split.enabled` (reserved)

- `kv.raft.store_liveness.quiescence.enabled` (reserved)

- `kv.replica_raft.leaderless_unavailable_threshold`

- `kv.transaction.write_buffering.enabled`

- `kv.transaction.write_buffering.max_buffer_size`

- `logical_replication.consumer.immediate_mode_writer` (reserved)

- `restore.compacted_backups.enabled` (reserved)

- `server.child_metrics.include_aggregate.enabled`
  - Introduced the cluster setting `server.child_metrics.include_aggregate.enabled`, which modifies the behavior of Prometheus metric reporting (`/_status/vars`). By default, it is set to `true`, which maintains the existing behavior. It can be sert to `false` to stop the reporting of the aggregate time series that prevents issues with double counting when querying metrics. [#141601][#141601]

- `server.grpc.request_metrics.enabled` (reserved)

- `server.jemalloc_purge_overhead_percent` (reserved)

- `server.jemalloc_purge_period` (reserved)

- `server.oidc_authentication.provider.custom_ca`
  - Added the `server.oidc_authentication.provider.custom_ca` cluster setting to support custom root CA for verifying certificates while authenticating with the OIDC provider. [#140583][#140583]

- `sql.statement_bundle.include_all_references.enabled` (reserved)

- `sql.stats.automatic_full_collection.enabled`

- `sql.stats.flush.batch_size` (reserved)

- `sql.ttl.max_kv_auto_retries` (reserved)

- `sql.vecindex.stalled_op.timeout`

- `sql.zone_configs.default_range_modifiable_by_non_root.enabled` (reserved)

- `sql.zone_configs.max_replicas_per_region` (reserved)

- `ui.default_timezone`

<h5 id="v25-2-0-settings-with-changed-defaults">Settings with changed defaults</h5>

- `kv.raft.leader_fortification.fraction_enabled` has had its default changed to `1`

- `rpc.batch_stream_pool.enabled` (reserved) has had its default changed to `true`

- `sql.defaults.plan_cache_mode` (reserved) has had its default changed to `auto`

- `version` has had its default changed to `25.1-upgrading-to-25.2-step-008`
  - Additional [documentation]({{% cockroachcloud/provision-a-cluster-with-terraform.md %}}) is available for this setting.

<h5 id="v25-2-0-settings-with-changed-visibility">Settings with changed visibility</h5>

The following settings are now marked `public` after previously being `reserved`. Reserved settings are not documented and their tuning by customers is not supported.

- `sql.stats.detailed_latency_metrics.enabled`
  - Percentile latencies are no longer available for **SQL Activity**. The implementation of these percentiles was error-prone and difficult to understand because it was computed differently from the other SQL statistics collected. Customers interested in viewing percentile latencies per statement fingerprint are encouraged to use the experimental per-fingerprint histograms that can be enabled with the `sql.stats.detailed_latency_metrics.enabled` cluster setting. This will enable externalized histogram metrics via the Prometheus scrape endpoint. [#139500][#139500]

<h5 id="v25-2-0-additional-cluster-setting-changes">Additional setting changes</h5>

- `ui.display_timezone` description has been updated

- The `server.client_cert_expiration_cache.capacity` cluster setting has been removed. The `security.certificate.expiration.client` and `security.certificate.ttl.client` metrics now report the lowest value observed for a user in the last 24 hours.

- The `kv.mvcc_gc.queue_kv_admission_control.enabled` cluster setting was retired.

- MVCC garbage collection is now fully subject to IO admission control. Previously, it was possible for MVCC GC to cause store overload (such as LSM inversion) when a large amount of data would become eligible for garbage collection. Should any issues arise from subjecting MVCC GC to admission control, the `kv.mvcc_gc.queue_kv_admission_control.enabled` cluster setting can be set to `false` to restore the previous behavior.

- Previously, statement bundle collection could encounter `not enough privileges` errors when retrieving necessary information (e.g., cluster settings, table statistics, etc.) when the user that requested the bundle was different from the user that actually ran the query. This is now fixed. The bug was present since v20.2 and would result in partially incomplete bundles.

- MVCC garbage collection is now fully subject to IO admission control. Previously, it was possible for MVCC GC to cause store overload (such as LSM inversion) when a large amounts of data would become eligible for garbage collection. Should any issues arise from subjecting MVCC GC to admission control, the `kv.mvcc_gc.queue_kv_admission_control.enabled` cluster setting can be set to `false` to restore the previous behavior. [#143122][#143122]

- Since v23.2 table statistics histograms have been collected for non-indexed JSON columns. Histograms are no longer collected for these columns. This reduces memory usage during table statistics collection, for both automatic and manual collection via `ANALYZE` and `CREATE STATISTICS`. This can be reverted by setting the cluster setting `sql.stats.non_indexed_json_histograms.enabled` to `true`. [#139766][#139766]

- Removed the `kv.snapshot_receiver.excise.enable` cluster setting. Excise is now enabled unconditionally. [#142651][#142651]

- When configuring the `sql.ttl.default_delete_rate_limit` cluster setting, a notice is displayed informing that the TTL rate limit is per leaseholder per node with a link to the docs. [#142061][#142061]

- The cluster setting `changefeed.new_webhook_sink_enabled`/`changefeed.new_webhook_sink.enabled` is no longer supported. The new webhook sink has been enabled by default since v23.2, and the first version webhook sink has been removed. [#141940][#141940]

- The cluster setting `changefeed.new_pubsub_sink_enabled`/`changefeed.new_pubsub_sink.enabled` is no longer supported. The new Google Cloud Pub/Sub sink has been enabled by default since v23.2, and the first version Pub/Sub sink has been removed. [#141948][#141948]

- The `/_admin/v1/settings` API (and therefore cluster settings console page) now returns cluster settings using the same redaction logic as querying `SHOW CLUSTER SETTINGS` and `crdb_internal.cluster_settings`. This means that only settings flagged as "sensitive" will be redacted, all other settings will be visible. The same authorization is required for this endpoint, meaning the user must be an `admin`, have `MODIFYCLUSTERSETTINGS`, or `VIEWCLUSTERSETTINGS` roles to use this API. The exception is that if the user has `VIEWACTIVITY` or `VIEWACTIVITYREDACTED`, they will see console-only settings. [#138688][#138688]
