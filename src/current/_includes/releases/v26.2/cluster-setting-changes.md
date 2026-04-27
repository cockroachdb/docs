Review the following changes **before** upgrading. New default values will be used unless you have manually set a cluster setting value. To view the non-default settings on your cluster, run the SQL statement `SELECT * FROM system.settings`.

<div class="release-cluster-settings-table" markdown="1">

| Setting | Description | Previous default | New default | Backported to versions |
|---|---|---|---|---|
| `bulkio.import.elastic_control.enabled` | The `bulkio.import.elastic_control.enabled` cluster setting is now enabled by default, allowing import operations to integrate with elastic CPU control and automatically throttle based on available resources. [#163867](https://github.com/cockroachdb/cockroach/pull/163867) | `false` | `true` | None |
| `bulkio.index_backfill.elastic_control.enabled` | The `bulkio.index_backfill.elastic_control.enabled` cluster setting is now enabled by default, allowing index backfill operations to integrate with elastic CPU control and automatically throttle based on available resources. [#163866](https://github.com/cockroachdb/cockroach/pull/163866) | `false` | `true` | None |
| `bulkio.ingest.sst_batcher_elastic_control.enabled` | The `bulkio.ingest.sst_batcher_elastic_control.enabled` cluster setting is now enabled by default, allowing SST batcher operations to integrate with elastic CPU control and automatically throttle based on available resources. [#163868](https://github.com/cockroachdb/cockroach/pull/163868) | `false` | `true` | None |
| `changefeed.max_retry_backoff` | Lowered the default value of the `changefeed.max_retry_backoff` cluster setting from `10m` to `30s` to <a href="{% link cockroachcloud/metrics-changefeeds.md %}#retryable-errors">reduce changefeed lag during rolling restarts</a>. [#164874](https://github.com/cockroachdb/cockroach/pull/164874) | `10m` | `30s` | v25.4, v26.1 |
| `kv.range_split.load_sample_reset_duration` | The `kv.range_split.load_sample_reset_duration` cluster setting now defaults to `30m`. This should improve load-based splitting in rare edge cases. [#159499](https://github.com/cockroachdb/cockroach/pull/159499) | `0` | `30m` | v26.1 |
| `sql.catalog.allow_leased_descriptors.enabled` | Changed the default value of the `sql.catalog.allow_leased_descriptors.enabled` cluster setting to `true`. This setting allows introspection tables like `information_schema` and `pg_catalog` to use cached descriptors when building the table results, which improves the performance of introspection queries when there are many tables in the cluster. [#159162](https://github.com/cockroachdb/cockroach/pull/159162) | `false` | `true` | v26.1 |
| `sql.guardrails.max_row_size_err` | Lowered the default value of the `sql.guardrails.max_row_size_log` cluster setting from `64 MiB` to `16 MiB`, and the default value of `sql.guardrails.max_row_size_err` from `512 MiB` to `80 MiB`. These settings control the maximum size of a row (or column family) that SQL can write before logging a warning or returning an error, respectively. The previous defaults were high enough that large rows would hit other limits first (such as the Raft command size limit or the backup SST size limit), producing confusing errors. The new defaults align with existing system limits to provide clearer diagnostics. If your workload legitimately writes rows larger than these new defaults, you can restore the previous behavior by increasing these settings. [#164468](https://github.com/cockroachdb/cockroach/pull/164468) | `512 MiB` | `80 MiB` | None |
| `sql.guardrails.max_row_size_log` | Lowered the default value of the `sql.guardrails.max_row_size_log` cluster setting from `64 MiB` to `16 MiB`, and the default value of `sql.guardrails.max_row_size_err` from `512 MiB` to `80 MiB`. These settings control the maximum size of a row (or column family) that SQL can write before logging a warning or returning an error, respectively. The previous defaults were high enough that large rows would hit other limits first (such as the Raft command size limit or the backup SST size limit), producing confusing errors. The new defaults align with existing system limits to provide clearer diagnostics. If your workload legitimately writes rows larger than these new defaults, you can restore the previous behavior by increasing these settings. [#164468](https://github.com/cockroachdb/cockroach/pull/164468) | `64 MiB` | `16 MiB` | None |
| `sql.stats.automatic_full_concurrency_limit` | Increased the default value of `sql.stats.automatic_full_concurrency_limit` (which controls the maximum number of concurrent full statistics collections) from `1` to number of vCPUs divided by 2 (e.g., 4 vCPU nodes will have the value of `2`). [#161806](https://github.com/cockroachdb/cockroach/pull/161806) | `1` | number of vCPUs / 2 | None |

</div>

<!--
TODO: Verify these settings exist in release notes. Found in codebase but not in testing RNs.

NEW SETTINGS (2):

1. bulkio.merge.file_size
   - Default: 1.0 GiB
   - Description: Target size for individual data files produced during local only merge phases
   - File: pkg/sql/bulkmerge/merge_processor.go

2. server.sql_tcp_keep_alive.idle
   - Default: 0s
   - Description: Time with no network activity before sending a TCP keepalive probe (Linux and Darwin only). If 0, the value of server.sql_tcp_keep_alive.interval is used
   - File: pkg/server/tcpkeepalive/tcp_keepalive.go

CHANGED SETTINGS (3):

3. server.sql_tcp_keep_alive.count
   - Default: Still 3 (unchanged)
   - Change: Description clarified to note "The value 0 is the operating system default"
   - File: pkg/server/tcpkeepalive/tcp_keepalive.go (moved from pkg/server/tcp_keepalive_manager.go)

4. server.sql_tcp_keep_alive.interval
   - Default: Still 10s (unchanged)
   - Change: Description clarified to note "The value 0 is the operating system default"
   - File: pkg/server/tcpkeepalive/tcp_keepalive.go (moved from pkg/server/tcp_keepalive_manager.go)

5. sql.log.user_audit
   - Default: Still "" (unchanged)
   - Change: Enterprise license requirement REMOVED from description (moved from pkg/ccl/auditloggingccl to pkg/sql/auditlogging - now in core!)
   - This may indicate the feature is now available in non-enterprise CockroachDB

NOTE: sql.schema.auto_unlock.enabled was listed in the original file as "v26.2.0" but was not found in any testing release notes.

-->
