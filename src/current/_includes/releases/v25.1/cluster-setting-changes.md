Changes to [cluster settings]({% link v25.1/cluster-settings.md %}) should be reviewed prior to upgrading. New default cluster setting values will be used unless you have manually set a value for a setting. This can be confirmed by running the SQL statement `SELECT * FROM system.settings` to view the non-default settings.

- [Settings added](#v25-1-0-settings-added)
- [Settings with changed defaults](#v25-1-0-settings-with-changed-defaults)
- [Settings with changed visibility](#v25-1-0-settings-with-changed-visibility)
- [Renamed settings](#v25-1-0-renamed-settings)
- [Additional setting changes](#v25-1-0-additional-cluster-setting-changes)

<h5 id="v25-1-0-settings-added">Settings added</h5>

- `kv.transaction.max_intents_and_locks`: accepts an integer value for the maximum number of inserts or durable locks allowed for a single transactions. When set to the default of `0`, this limiting is disabled. [#135945][#135945]

- Schema object identifiers (e.g. database names, schema names, table names, and function names) are no longer redacted when logging statements in the `EXEC` or `SQL_SCHEMA` channels. If redaction of these names is required, then the new cluster setting `sql.log.redact_names.enabled` can be set to `true`. The default value of the setting is `false`. [#136897][#136897]

- Since v23.2, table statistics histograms have been collected for non-indexed JSON columns. Histograms are no longer collected for these columns. This reduces memory usage during table statistics collection, for both automatic and manual collection via `ANALYZE` and `CREATE STATISTICS`. The previous behavior can be re-enabled by setting the cluster setting `sql.stats.non_indexed_json_histograms.enabled` to `true`. [#139898][#139898]

- `ui.database_locality_metadata.enabled` allows operators to disable the loading of extended region information in the DB Console Database and Table pages. In versions prior to v24.3, this information can cause significant CPU load on large clusters with many ranges. When disabled, if customers require this data, they can use the query `SHOW RANGES FROM {DATABASE| TABLE}` to compute it on demand. [#133075][#133075]

<h5 id="v25-1-0-settings-with-changed-defaults">Settings with changed defaults</h5>

- The `kvadmission.flow_control.mode` default value has been changed from `apply_to_elastic` to `apply_to_all`. Regular writes are now subject to admission control by default, meaning that non-quorum required replicas may not be informed of new writes from the leader if they are unable to keep up. This brings a large performance improvement in scenarios with a large backlog of replication work toward one or more nodes, such as node restarts. The behavior can be reverted to the v24.3 and earlier default by changing the setting value to `apply_to_elastic`. [#133860][#133860]

- `kvadmission.store.snapshot_ingest_bandwidth_control.enabled` is now `true` by default. This will enable disk-bandwidth-based admission control for range snapshot ingests. It requires the provisioned bandwidth to be set using `kvadmission.store.provisioned_bandwidth`. [#137618][#137618]

- `sql.stats.automatic_partial_collection.enabled` is now `true` by default. This enables automatic collection of partial table stats. Partial table stats (i.e. those created with `CREATE STATISTICS ... USING EXTREMES`) scan the lower and upper ends of indexes to collect statistics outside the range covered by the previous full statistics collection. [#133988][#133988]

- The default value for `trace.span_registry.enabled` has been changed from `true` to `false`. [#135682][#135682]

<h5 id="v25-1-0-settings-with-changed-visibility">Settings with changed visibility</h5>

The following settings are now marked `public` after previously being `reserved`. Reserved settings are not documented and their tuning by customers is not supported.

- `kv.bulk_io_write.min_capacity_remaining_fraction` is now public. It specifies the remaining store capacity fraction below which bulk ingestion requests are rejected. It defaults to `0.05`, and can be set between `0.04` and `0.3`. [#135779][#135779]

<h5 id="v25-1-0-renamed-settings">Renamed settings</h5>

- Renamed `changefeed.min_highwater_advance` to `changefeed.resolved_timestamp.min_update_interval` to more accurately reflect its function. The previous name remains usable for backward compatibility. Its value is the minimum amount of time that must have elapsed since the last update of a changefeed's resolved timestamp before it is eligible to be updated again. With the default of `0s`, no minimum interval is enforced, though updates are still limited by the average time needed to checkpoint progress. [#138673][#138673]

- Renamed `changefeed.frontier_highwater_lag_checkpoint_threshold` to `changefeed.span_checkpoint.lag_threshold`. The previous name is still available for backward compatibility. [#139064][#139064]

<h5 id="v25-1-0-additional-cluster-setting-changes">Additional setting changes</h5>

- Internal scans are now exempt from the `sql.defaults.disallow_full_table_scans.enabled` cluster setting. This allows index creation even when the setting is enabled. [#137681][#137681]

- When `server.redact_sensitive_settings.enabled` is `true`, the same redaction logic for [Sensitive cluster settings]({% link v25.1/cluster-settings.md %}#sensitive-settings) that is used for `SHOW CLUSTER SETTINGS` now applies to the DB Console Cluster Settings page. [#139277][#139277]

- Removed cluster setting `kv.rangefeed.scheduler.enabled`. The rangefeed scheduler is now unconditionally enabled. [#132825][#132825]

- Removed cluster setting `sql.auth.resolve_membership_single_scan.enabled`. This was added in case it was necessary to revert back to the previous behavior for looking up role memberships, but this cluster setting has not been needed in practice since this was added in v23.1. [#135852][#135852]

<h5 id="v25-1-0-settings-requiring-operational-changes">Settings requiring operational changes</h5>

- To prevent unnecessary queuing in admission control CPU queues, set the `goschedstats.always_use_short_sample_period.enabled` cluster setting to `true` for any production cluster.
