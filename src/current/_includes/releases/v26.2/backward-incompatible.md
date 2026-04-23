This section summarizes changes that can cause applications, scripts, or manual workflows to fail or behave differently than in previous releases. This includes [key cluster setting changes](#v26-2-0-cluster-settings) and [deprecations](#v26-2-0-deprecations).

- The `TG_ARGV` trigger function parameter now uses 0-based indexing to match PostgreSQL behavior. Previously, `TG_ARGV[1]` returned the first argument; now `TG_ARGV[0]` returns the first argument and `TG_ARGV[1]` returns the second argument. Additionally, usage of `TG_ARGV` no longer requires setting the `allow_create_trigger_function_with_argv_references` session variable. [#161925](https://github.com/cockroachdb/cockroach/pull/161925)

- When selecting from a view, the view owner's privileges on the underlying tables are now checked. Previously, no privilege checks were performed on the underlying tables, so a view would continue to work even after the owner lost access to the underlying tables. This also affects row-level security (RLS): the view owner's RLS policies are now enforced instead of the invoker's. If this causes issues, you can restore the previous behavior by setting the cluster setting `sql.auth.skip_underlying_view_privilege_checks.enabled` to `true`. [#164664](https://github.com/cockroachdb/cockroach/pull/164664)

- `REFRESH MATERIALIZED VIEW` now evaluates row-level security (RLS) policies using the view owner's identity instead of the invoker's, matching PostgreSQL's definer semantics. [#167419](https://github.com/cockroachdb/cockroach/pull/167419)

- User-defined views that reference `crdb_internal` virtual tables now enforce unsafe access checks. To restore the previous behavior, set the session variable `allow_unsafe_internals` or the cluster setting `sql.override.allow_unsafe_internals.enabled` to `true`. [#167023](https://github.com/cockroachdb/cockroach/pull/167023)

- Removed the `incremental_location` option from `BACKUP` and `CREATE SCHEDULE FOR BACKUP`. [#159189](https://github.com/cockroachdb/cockroach/pull/159189)

- Removed the `incremental_location` option from `SHOW BACKUP` and `RESTORE`. [#160416](https://github.com/cockroachdb/cockroach/pull/160416)

- `CREATE CHANGEFEED FOR DATABASE` now returns an error stating that the feature is not implemented. [#166920](https://github.com/cockroachdb/cockroach/pull/166920)

- Added the `TEMPORARY` database privilege, which controls whether users can create temporary tables and views. On new databases, this privilege is granted to the `public` role by default, matching PostgreSQL behavior. [#165992](https://github.com/cockroachdb/cockroach/pull/165992)

- Explicit `AS OF SYSTEM TIME` queries are no longer allowed on a Physical Cluster Replication (PCR) reader virtual cluster, unless the `bypass_pcr_reader_catalog_aost` session variable is set to `true`. This session variable should only be used during investigation or for changing cluster settings specific to the reader virtual cluster. [#165382](https://github.com/cockroachdb/cockroach/pull/165382)

- Changed goroutine profile dumps from human-readable `.txt.gz` files to binary proto `.pb.gz` files. This improves the performance of the goroutine dumper by eliminating brief in-process pauses that occurred when collecting goroutine stacks. [#160798](https://github.com/cockroachdb/cockroach/pull/160798)

- Using `ALTER CHANGEFEED ADD ...` for a table that is already watched will now return an error: `target already watched by changefeed`. [#164433](https://github.com/cockroachdb/cockroach/pull/164433)

- Creating or altering a changefeed or Kafka/Pub/Sub external connection now returns an error when the `topic_name` query parameter is explicitly set to an empty string in the sink URI, rather than silently falling back to using the table name as the topic name. Existing changefeeds with an empty `topic_name` are not affected. [#164225](https://github.com/cockroachdb/cockroach/pull/164225)

- The `cockroach debug tsdump` command now defaults to `--format=raw` instead of `--format=text`. The `raw` (gob) format is optimized for Datadog ingestion. A new `--output` flag lets you write output directly to a file, avoiding potential file corruption that can occur with shell redirection. If `--output` is not specified, output is written to `stdout`. [#160538](https://github.com/cockroachdb/cockroach/pull/160538)

- TTL jobs are now owned by the schedule owner instead of the `node` user. This allows users with `CONTROLJOB` privilege to cancel TTL jobs, provided the schedule owner is not an admin (`CONTROLJOB` does not grant control over admin-owned jobs). [#161226](https://github.com/cockroachdb/cockroach/pull/161226)

- The session variable `distsql_prevent_partitioning_soft_limited_scans` is now enabled by default. This prevents scans with soft limits from being planned as multiple TableReaders, which decreases the initial setup costs of some fully-distributed query plans. [#160051](https://github.com/cockroachdb/cockroach/pull/160051)

- The `build.timestamp` Prometheus metric now carries `major` and `minor` labels identifying the release series of the running CockroachDB binary (e.g., `major="26", minor="1"` for any v26.1.x build). [#163834](https://github.com/cockroachdb/cockroach/pull/163834)

- RPC connection metrics now include a `protocol` label. The following metrics are affected: `rpc.connection.avg_round_trip_latency`, `rpc.connection.failures`, `rpc.connection.healthy`, `rpc.connection.healthy_nanos`, `rpc.connection.heartbeats`, `rpc.connection.tcp_rtt`, `rpc.connection.tcp_rtt_var`, `rpc.connection.unhealthy`, `rpc.connection.unhealthy_nanos`, and `rpc.connection.inactive`. In v26.2, the label value is always `grpc`. For example: `rpc_connection_healthy{node_id="1",remote_node_id="0",remote_addr="localhost:26258",class="system",protocol="grpc"} 1` [#162528](https://github.com/cockroachdb/cockroach/pull/162528)

- Calling `information_schema.crdb_rewrite_inline_hints` now requires the `REPAIRCLUSTER` privilege. [#160716](https://github.com/cockroachdb/cockroach/pull/160716)

- Renamed the builtin function `crdb_internal.inject_hint` (introduced in v26.1.0-alpha.2) to `information_schema.crdb_rewrite_inline_hints`. [#160716](https://github.com/cockroachdb/cockroach/pull/160716)

- Changed the unit of measurement for admission control duration metrics from microseconds to nanoseconds. The following metrics are affected: `admission.granter.slots_exhausted_duration.kv`, `admission.granter.cpu_load_short_period_duration.kv`, `admission.granter.cpu_load_long_period_duration.kv`, `admission.granter.io_tokens_exhausted_duration.kv`, `admission.granter.elastic_io_tokens_exhausted_duration.kv`, and `admission.elastic_cpu.nanos_exhausted_duration`. Note that dashboards displaying these metrics will show a discontinuity at upgrade time, with pre-upgrade values appearing much lower due to the unit change. [#160956](https://github.com/cockroachdb/cockroach/pull/160956)

- The **Statement Details** page URL format has changed from `/statement/{implicitTxn}/{statementId}` to `/statement/{statementId}`. As a result, bookmarks using the old URL structure will no longer work. [#159558](https://github.com/cockroachdb/cockroach/pull/159558)

- Added the `server.sql_tcp_user.timeout` cluster setting, which specifies the maximum amount of time transmitted data can remain unacknowledged before the underlying TCP connection is forcefully closed. This setting is enabled by default with a value of 30 seconds and is supported on Linux and macOS (Darwin). [#164037](https://github.com/cockroachdb/cockroach/pull/164037)

