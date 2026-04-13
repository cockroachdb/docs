- **Statistics concurrency limit:** Increased the default value of `sql.stats.automatic_full_concurrency_limit` (which controls the maximum number of concurrent full statistics collections) from `1` to number of vCPUs divided by 2 (e.g., 4 vCPU nodes will have the value of `2`). [#161806](https://github.com/cockroachdb/cockroach/pull/161806)

- **`TG_ARGV` indexing:** The `TG_ARGV` trigger function parameter now uses 0-based indexing to match PostgreSQL behavior. Previously, `TG_ARGV[1]` returned the first argument; now `TG_ARGV[0]` returns the first argument and `TG_ARGV[1]` returns the second argument. Additionally, usage of `TG_ARGV` no longer requires setting the `allow_create_trigger_function_with_argv_references` session variable. [#161925](https://github.com/cockroachdb/cockroach/pull/161925)

- **Row size guardrails:** Lowered the default value of the `sql.guardrails.max_row_size_log` cluster setting from `64 MiB` to `16 MiB`, and the default value of `sql.guardrails.max_row_size_err` from `512 MiB` to `80 MiB`. These settings control the maximum size of a row (or column family) that SQL can write before logging a warning or returning an error, respectively. The previous defaults were high enough that large rows would hit other limits first (such as the Raft command size limit or the backup SST size limit), producing confusing errors. The new defaults align with existing system limits to provide clearer diagnostics. If your workload legitimately writes rows larger than these new defaults, you can restore the previous behavior by increasing these settings. [#164468](https://github.com/cockroachdb/cockroach/pull/164468)

- **Catalog descriptor caching:** Changed the default value of the `sql.catalog.allow_leased_descriptors.enabled` cluster setting to `true`. This setting allows introspection tables like `information_schema` and `pg_catalog` to use cached descriptors when building the table results, which improves the performance of introspection queries when there are many tables in the cluster. [#159162](https://github.com/cockroachdb/cockroach/pull/159162)

- **Import elastic control:** The `bulkio.import.elastic_control.enabled` cluster setting is now enabled by default, allowing import operations to integrate with elastic CPU control and automatically throttle based on available resources. [#163867](https://github.com/cockroachdb/cockroach/pull/163867)

- **SST batcher elastic control:** The `bulkio.ingest.sst_batcher_elastic_control.enabled` cluster setting is now enabled by default, allowing SST batcher operations to integrate with elastic CPU control and automatically throttle based on available resources. [#163868](https://github.com/cockroachdb/cockroach/pull/163868)

- **DistSQL scan planning:** The session variable `distsql_prevent_partitioning_soft_limited_scans` is now enabled by default. This prevents scans with soft limits from being planned as multiple TableReaders, which decreases the initial setup costs of some fully-distributed query plans. [#160051](https://github.com/cockroachdb/cockroach/pull/160051)

- **Empty `topic_name` validation:** Creating or altering a changefeed or Kafka/Pub/Sub external connection now returns an error when the `topic_name` query parameter is explicitly set to an empty string in the sink URI, rather than silently falling back to using the table name as the topic name. Existing changefeeds with an empty `topic_name` are not affected. [#164225](https://github.com/cockroachdb/cockroach/pull/164225)

- **TTL job ownership:** TTL jobs are now owned by the schedule owner instead of the `node` user. This allows users with `CONTROLJOB` privilege to cancel TTL jobs, provided the schedule owner is not an admin (`CONTROLJOB` does not grant control over admin-owned jobs). [#161226](https://github.com/cockroachdb/cockroach/pull/161226)

- **Inline hints privilege:** Calling `information_schema.crdb_rewrite_inline_hints` now requires the `REPAIRCLUSTER` privilege. [#160716](https://github.com/cockroachdb/cockroach/pull/160716)

- **Statement Details page URL:** The **Statement Details** page URL format has changed from `/statement/{implicitTxn}/{statementId}` to `/statement/{statementId}`. As a result, bookmarks using the old URL structure will no longer work. [#159558](https://github.com/cockroachdb/cockroach/pull/159558)

- **Admission control metrics units:** Changed the unit of measurement for admission control duration metrics from microseconds to nanoseconds. The following metrics are affected: `admission.granter.slots_exhausted_duration.kv`, `admission.granter.cpu_load_short_period_duration.kv`, `admission.granter.cpu_load_long_period_duration.kv`, `admission.granter.io_tokens_exhausted_duration.kv`, `admission.granter.elastic_io_tokens_exhausted_duration.kv`, and `admission.elastic_cpu.nanos_exhausted_duration`. Note that dashboards displaying these metrics will show a discontinuity at upgrade time, with pre-upgrade values appearing much lower due to the unit change. [#160956](https://github.com/cockroachdb/cockroach/pull/160956)

- **Builtin function rename:** Renamed the builtin function `crdb_internal.inject_hint` (introduced in v26.1.0-alpha.2) to `information_schema.crdb_rewrite_inline_hints`. [#160716](https://github.com/cockroachdb/cockroach/pull/160716)

- **`incremental_location` option:** Removed the `incremental_location` option from `BACKUP` and `CREATE SCHEDULE FOR BACKUP`. [#159189](https://github.com/cockroachdb/cockroach/pull/159189)

- **`incremental_location` option:** Removed the `incremental_location` option from `SHOW BACKUP` and `RESTORE`. [#160416](https://github.com/cockroachdb/cockroach/pull/160416)

- **View privilege checking:** When selecting from a view, the view owner's privileges on the underlying tables are now checked. Previously, no privilege checks were performed on the underlying tables, so a view would continue to work even after the owner lost access to the underlying tables. This also affects row-level security (RLS): the view owner's RLS policies are now enforced instead of the invoker's. If this causes issues, you can restore the previous behavior by setting the cluster setting `sql.auth.skip_underlying_view_privilege_checks.enabled` to `true`. [#164664](https://github.com/cockroachdb/cockroach/pull/164664)

- **Index backfill elastic control:** The `bulkio.index_backfill.elastic_control.enabled` cluster setting is now enabled by default, allowing index backfill operations to integrate with elastic CPU control and automatically throttle based on available resources. [#163866](https://github.com/cockroachdb/cockroach/pull/163866)

- **Changefeed retry backoff:** Lowered the default value of the `changefeed.max_retry_backoff` cluster setting from `10m` to `30s` to reduce changefeed lag during rolling restarts. [#164874](https://github.com/cockroachdb/cockroach/pull/164874)

- **`ALTER CHANGEFEED ADD` validation:** Using `ALTER CHANGEFEED ADD ...` for a table that is already watched will now return an error: `target already watched by changefeed`. [#164433](https://github.com/cockroachdb/cockroach/pull/164433)

- **PCR reader AOST restriction:** Explicit `AS OF SYSTEM TIME` queries are no longer allowed on a Physical Cluster Replication (PCR) reader virtual cluster, unless the `bypass_pcr_reader_catalog_aost` session variable is set to `true`. This session variable should only be used during investigation or for changing cluster settings specific to the reader virtual cluster. [#165382](https://github.com/cockroachdb/cockroach/pull/165382)

- **Super regions:** The `enable_super_regions` session variable and the `sql.defaults.super_regions.enabled` cluster setting are no longer required to use super regions. Super region DDL operations (`ADD`, `DROP`, and `ALTER SUPER REGION`) now work without any experimental flag. The session variable and cluster setting are deprecated, and existing scripts that set them will continue to work without error. [#165227](https://github.com/cockroachdb/cockroach/pull/165227)

- **`TEMPORARY` database privilege:** Added the `TEMPORARY` database privilege, which controls whether users can create temporary tables and views. On new databases, this privilege is granted to the `public` role by default, matching PostgreSQL behavior. [#165992](https://github.com/cockroachdb/cockroach/pull/165992)

- **`cockroach encode-uri` command:** The `cockroach encode-uri` command has been merged into the `cockroach convert-url` command and `encode-uri` has been deprecated. As a result, the flags `--inline`, `--database`, `--user`, `--password`, `--cluster`, `--certs-dir`, `--ca-cert`, `--cert`, and `--key` have been added to `convert-url`. [#164561](https://github.com/cockroachdb/cockroach/pull/164561)

- **Statement diagnostics bundles:** Statement diagnostics requests with `sampling_probability` and `expires_at` now collect up to 10 bundles (configurable via `sql.stmt_diagnostics.max_bundles_per_request`) instead of a single bundle. Set the cluster setting to `1` to restore single-bundle behavior. [#166159](https://github.com/cockroachdb/cockroach/pull/166159)

- **`crdb_internal` view access checks:** User-defined views that reference `crdb_internal` virtual tables now enforce unsafe access checks. To restore the previous behavior, set the session variable `allow_unsafe_internals` or the cluster setting `sql.override.allow_unsafe_internals.enabled` to `true`. [#167023](https://github.com/cockroachdb/cockroach/pull/167023)

- **`REFRESH MATERIALIZED VIEW` RLS:** `REFRESH MATERIALIZED VIEW` now evaluates row-level security (RLS) policies using the view owner's identity instead of the invoker's, matching PostgreSQL's definer semantics. [#167419](https://github.com/cockroachdb/cockroach/pull/167419)

