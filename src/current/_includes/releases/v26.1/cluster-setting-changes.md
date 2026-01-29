Changes to [cluster settings]({% link v26.1/cluster-settings.md %}) should be reviewed prior to upgrading. New default cluster setting values will be used unless you have manually set a value for a setting. This can be confirmed by running the SQL statement `SELECT * FROM system.settings` to view the non-default settings.

<h5 id="v26-1-0-settings-added">New settings</h5>

- `jobs.registry.max_adoptions_per_loop` (reserved)
  - Added the `jobs.registry.max_adoptions_per_loop` cluster setting to configure the maximum number of jobs a node can adopt per adoption loop. [#155385][#155385]

- `kv.closed_timestamp.side_transport_pacing_refresh_interval`

- `kv.closed_timestamp.side_transport_pacing_smear_interval`

- `security.provisioning.oidc.enabled` (reserved)
  - Added a new cluster setting, `security.provisioning.oidc.enabled`, to allow automatic provisioning of users when they log in for the first time via OIDC. When enabled, a new user will be created in CockroachDB upon their first successful OIDC authentication. This feature is disabled by default. [#160016][#160016]

- `sql.stats.automatic_extremes_concurrency_limit`

- `sql.stats.automatic_full_concurrency_limit`

- `sql.stats.canary_fraction` (reserved)
    - Cluster setting `sql.stats.canary_fraction` (float, range [0, 1], default: 0): Controls what fraction of queries use "canary statistics" (newly collected stats within their canary window) versus "stable statistics" (previously proven stats). For example, a value of `0.2` means 20% of queries will use canary stats while 80% use stable stats. The selection is atomic per query: if a query is chosen for canary evaluation, it uses canary statistics for **all** tables it references (where available). A query never uses a mix of canary and stable statistics.

- `storage.snapshot.recreate_iter_duration` (reserved)
  - Added the cluster setting `storage.snapshot.recreate_iter_duration` (default 20s), which controls how frequently a long-lived storage engine iterator, backed by an engine snapshot, will be closed and recreated. Currently, it is only used for iterators used in rangefeed catchup scans. [#154412][#154412]
  - The cluster setting `storage.snapshot.recreate_iter_duration` (default `20s`) controls how frequently a long-lived engine iterator, backed by an engine snapshot, will be closed and recreated. Currently, it is only used for iterators used in rangefeed catchup scans. [#156303][#156303]

- `timeseries.storage.resolution_1m.ttl`

<h5 id="v26-1-0-settings-changed-default">Settings with changed defaults</h5>

- `bulkio.ingest.compute_stats_diff_in_stream_batcher.enabled` (reserved) has had its default changed to `true`

- `cloudstorage.s3.client_retry_token_bucket.enabled` (reserved) has had its default changed to `false`

- `kv.allocator.disk_unhealthy_io_overload_score` (reserved) has had its default changed to `0.4`
  - Added the cluster setting `storage.unhealthy_write_duration` (defaults to 20s), which is used to indicate to the allocator that a store's disk is unhealthy. The cluster setting `kv.allocator.disk_unhealthy_io_overload_score` controls the overload score assigned to a store with an unhealthy disk, where a higher score results in preventing lease or replica transfers to the store, or shedding of leases by the store. The default value of that setting is 0, so the allocator behavior is unaffected. [#153364][#153364]

- `kv.range_split.load_sample_reset_duration` (reserved) has had its default changed to `30m0s`
  - The `kv.range_split.load_sample_reset_duration` cluster setting now defaults to `30m`. This should improve load-based splitting in rare edge cases. [#159677][#159677]

- `kv.rangefeed.buffered_sender.enabled` (reserved) has had its default changed to `true`

- `kv.transaction.keep_refresh_spans_on_savepoint_rollback.enabled` (reserved) has had its default changed to `true`

- `log.channel_compatibility_mode.enabled` has had its default changed to `false`

- `logical_replication.consumer.immediate_mode_writer` (reserved) has had its default changed to `crud`

- `sql.catalog.allow_leased_descriptors.enabled` has had its default changed to `true`
  - Added the `sql.catalog.allow_leased_descriptors.enabled` cluster setting, which is false by default. When set to true, queries that access the `pg_catalog` or `information_schema` can use cached leased descriptors to populate the data in those tables, with the tradeoff that some of the data could be stale. [#154051][#154051]
  - Changed the default value of the `sql.catalog.allow_leased_descriptors.enabled` cluster setting to `true`. This setting allows introspection tables like `information_schema` and `pg_catalog` to use cached descriptors when building the table results, which improves the performance of introspection queries when there are many tables in the cluster. [#159566][#159566]

- `sql.catalog.descriptor_lease.use_locked_timestamps.enabled` (reserved) has had its default changed to `true`

- `sql.defaults.create_table_with_schema_locked` (reserved) has had its default changed to `true`

- `version` has had its default changed to `26.1`
  - Additional [documentation]({{% cockroachcloud/provision-a-cluster-with-terraform.md %}}) is available for this setting.

<h5 id="v26-1-0-settings-changed-description">Settings with changed descriptions</h5>

- `changefeed.default_range_distribution_strategy` description has been updated
  - Improved the description of the `changefeed.default_range_distribution_strategy` cluster setting to better explain the available options and their behavior. [#158602][#158602]
  - Added changefeed setting `range_distribution_strategy` with values `'default'` or `'balanced_simple'`. This new per-changefeed setting overrides the cluster setting `changefeed.default_range_distribution_strategy` where both exist.

    Example:

    ~~~ sql

    CREATE CHANGEFEED FOR x into 'null://' WITH

    range_distribution_strategy='balanced_simple';

    ~~~

- `kv.allocator.lease_io_overload_threshold` (reserved) description has been updated

- `kv.allocator.lease_shed_io_overload_threshold` (reserved) description has been updated

- `kv.allocator.replica_io_overload_threshold` (reserved) description has been updated

- `storage.sstable.compression_algorithm` description has been updated


<h5 id="v26-1-0-additional-cluster-setting-changes">Additional cluster setting changes</h5>

The following release notes mention cluster settings but do not cite a specific changed setting by name:

- Added a default-off cluster setting (`sql.log.scan_row_count_misestimate.enabled`) that enables logging a warning on the gateway node when optimizer estimates for scans are inaccurate. The log message includes the table and index being scanned, the estimated and actual row counts, the time since the last table stats collection, and the table's estimated staleness. [#154370][#154370]

- Added the `bulkio.index_backfill.vector_merge_batch_size` cluster setting to control how many vectors to merge into a vector index per transaction during create operations. The setting defaults to `3`. [#155284][#155284]

- Updated the scan misestimate logging, which is controlled by the `sql.log.scan_row_count_misestimate.enabled` cluster setting, to use structured logging. The logs now include the scanned table and index, the estimated and actual row counts, the time since the last table statistics collection, and the table's estimated staleness. [#155454][#155454]

- Added cluster setting `sql.schema.approx_max_object_count` (default: 20,000) to prevent creation of new schema objects when the limit is exceeded. The check uses cached table statistics for performance and is approximate - it may not be immediately accurate until table statistics are updated by the background statistics refreshing job. Clusters that have been running stably with a larger object count should raise the limit or disable the limit by setting the value to 0. In future releases, the default value for this setting will be raised as more CockroachDB features support larger object counts. [#154495][#154495]

- The username remapping functionality specified by the `server.identity_map.configuration` cluster setting now matches identities and usernames with a case-insensitive comparison. [#155531][#155531]

- Added cluster settings to control the number of concurrent automatic statistics collection jobs:


<!-- Link references -->
[#153364]: https://github.com/cockroachdb/cockroach/pull/153364
[#154051]: https://github.com/cockroachdb/cockroach/pull/154051
[#154370]: https://github.com/cockroachdb/cockroach/pull/154370
[#154412]: https://github.com/cockroachdb/cockroach/pull/154412
[#154495]: https://github.com/cockroachdb/cockroach/pull/154495
[#155284]: https://github.com/cockroachdb/cockroach/pull/155284
[#155385]: https://github.com/cockroachdb/cockroach/pull/155385
[#155454]: https://github.com/cockroachdb/cockroach/pull/155454
[#155531]: https://github.com/cockroachdb/cockroach/pull/155531
[#156303]: https://github.com/cockroachdb/cockroach/pull/156303
[#158602]: https://github.com/cockroachdb/cockroach/pull/158602
[#159566]: https://github.com/cockroachdb/cockroach/pull/159566
[#159677]: https://github.com/cockroachdb/cockroach/pull/159677
[#160016]: https://github.com/cockroachdb/cockroach/pull/160016
