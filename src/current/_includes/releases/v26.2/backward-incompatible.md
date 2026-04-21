This section summarizes changes that can cause applications, scripts, or manual workflows to fail or behave differently than in previous releases. This includes [key cluster setting changes](#key-cluster-setting-changes) and [deprecations](#deprecations).

- The `TG_ARGV` trigger function parameter now uses 0-based indexing to match PostgreSQL behavior. Previously, `TG_ARGV[1]` returned the first argument; now `TG_ARGV[0]` returns the first argument and `TG_ARGV[1]` returns the second argument. Additionally, usage of `TG_ARGV` no longer requires setting the `allow_create_trigger_function_with_argv_references` session variable. [#161925](https://github.com/cockroachdb/cockroach/pull/161925)

- The session variable `distsql_prevent_partitioning_soft_limited_scans` is now enabled by default. This prevents scans with soft limits from being planned as multiple TableReaders, which decreases the initial setup costs of some fully-distributed query plans. [#160051](https://github.com/cockroachdb/cockroach/pull/160051)

- Creating or altering a changefeed or Kafka/Pub/Sub external connection now returns an error when the `topic_name` query parameter is explicitly set to an empty string in the sink URI, rather than silently falling back to using the table name as the topic name. Existing changefeeds with an empty `topic_name` are not affected. [#164225](https://github.com/cockroachdb/cockroach/pull/164225)

- TTL jobs are now owned by the schedule owner instead of the `node` user. This allows users with `CONTROLJOB` privilege to cancel TTL jobs, provided the schedule owner is not an admin (`CONTROLJOB` does not grant control over admin-owned jobs). [#161226](https://github.com/cockroachdb/cockroach/pull/161226)

- Calling `information_schema.crdb_rewrite_inline_hints` now requires the `REPAIRCLUSTER` privilege. [#160716](https://github.com/cockroachdb/cockroach/pull/160716)

- The **Statement Details** page URL format has changed from `/statement/{implicitTxn}/{statementId}` to `/statement/{statementId}`. As a result, bookmarks using the old URL structure will no longer work. [#159558](https://github.com/cockroachdb/cockroach/pull/159558)

- Changed the unit of measurement for admission control duration metrics from microseconds to nanoseconds. The following metrics are affected: `admission.granter.slots_exhausted_duration.kv`, `admission.granter.cpu_load_short_period_duration.kv`, `admission.granter.cpu_load_long_period_duration.kv`, `admission.granter.io_tokens_exhausted_duration.kv`, `admission.granter.elastic_io_tokens_exhausted_duration.kv`, and `admission.elastic_cpu.nanos_exhausted_duration`. Note that dashboards displaying these metrics will show a discontinuity at upgrade time, with pre-upgrade values appearing much lower due to the unit change. [#160956](https://github.com/cockroachdb/cockroach/pull/160956)

- Renamed the builtin function `crdb_internal.inject_hint` (introduced in v26.1.0-alpha.2) to `information_schema.crdb_rewrite_inline_hints`. [#160716](https://github.com/cockroachdb/cockroach/pull/160716)

- Removed the `incremental_location` option from `BACKUP` and `CREATE SCHEDULE FOR BACKUP`. [#159189](https://github.com/cockroachdb/cockroach/pull/159189)

- Removed the `incremental_location` option from `SHOW BACKUP` and `RESTORE`. [#160416](https://github.com/cockroachdb/cockroach/pull/160416)

- When selecting from a view, the view owner's privileges on the underlying tables are now checked. Previously, no privilege checks were performed on the underlying tables, so a view would continue to work even after the owner lost access to the underlying tables. This also affects row-level security (RLS): the view owner's RLS policies are now enforced instead of the invoker's. If this causes issues, you can restore the previous behavior by setting the cluster setting `sql.auth.skip_underlying_view_privilege_checks.enabled` to `true`. [#164664](https://github.com/cockroachdb/cockroach/pull/164664)

- Using `ALTER CHANGEFEED ADD ...` for a table that is already watched will now return an error: `target already watched by changefeed`. [#164433](https://github.com/cockroachdb/cockroach/pull/164433)

- Explicit `AS OF SYSTEM TIME` queries are no longer allowed on a Physical Cluster Replication (PCR) reader virtual cluster, unless the `bypass_pcr_reader_catalog_aost` session variable is set to `true`. This session variable should only be used during investigation or for changing cluster settings specific to the reader virtual cluster. [#165382](https://github.com/cockroachdb/cockroach/pull/165382)

- Added the `TEMPORARY` database privilege, which controls whether users can create temporary tables and views. On new databases, this privilege is granted to the `public` role by default, matching PostgreSQL behavior. [#165992](https://github.com/cockroachdb/cockroach/pull/165992)

- Statement diagnostics requests with `sampling_probability` and `expires_at` now collect up to 10 bundles (configurable via `sql.stmt_diagnostics.max_bundles_per_request`) instead of a single bundle. Set the cluster setting to `1` to restore single-bundle behavior. [#166159](https://github.com/cockroachdb/cockroach/pull/166159)

- User-defined views that reference `crdb_internal` virtual tables now enforce unsafe access checks. To restore the previous behavior, set the session variable `allow_unsafe_internals` or the cluster setting `sql.override.allow_unsafe_internals.enabled` to `true`. [#167023](https://github.com/cockroachdb/cockroach/pull/167023)

- `REFRESH MATERIALIZED VIEW` now evaluates row-level security (RLS) policies using the view owner's identity instead of the invoker's, matching PostgreSQL's definer semantics. [#167419](https://github.com/cockroachdb/cockroach/pull/167419)

