## v26.2.1

Release Date: April 15, 2026

{% include releases/new-release-downloads-docker-image.md release=include.release %}

<h3 id="v26-2-1-sql-language-changes">SQL language changes</h3>

- Changed the `canary_stats_mode` session variable values from `off`/`on` to `force_stable`/`force_canary`, letting you opt in per session without enabling canary statistics cluster-wide.
- Added the cluster setting `sql.stats.table_statistics_cache.capacity`, which controls the maximum number of tables whose statistics are kept in memory.
- Added the `optimizer_span_limit` session variable, which lets you cap how many spans query planning can generate for a constrained index scan when large `IN` lists would otherwise create too many spans.

<h3 id="v26-2-1-operational-changes">Operational changes</h3>

- Added the `mma.overloaded_store.<bucket>.skipped` gauges, which help you track overloaded stores that were detected but deferred from rebalancing in the current pass.
    - `lease_grace`
    - `short_dur`
    - `medium_dur`
    - `long_dur`
  
  For each bucket, `success + failure + skipped` now matches the total number of overloaded stores observed.
- Three new admission control metrics are now available for monitoring disk bandwidth token usage: admission.granter.disk_write_byte_tokens_used.regular.kv, admission.granter.disk_write_byte_tokens_used.elastic.kv, and admission.granter.disk_write_byte_tokens_used.snapshot.kv. The existing admission.granter.disk_write_byte_tokens_exhausted_duration.kv metric is now marked as essential and will appear on the Overload dashboard.
- Documented the following cluster settings:
    - `obs.ash.enabled`
    - `obs.ash.sample_interval`
    - `obs.ash.buffer_size`
    - `obs.ash.log_interval`
    - `obs.ash.log_top_n`
    - `obs.ash.response_limit`

<h3 id="v26-2-1-bug-fixes">Bug fixes</h3>

- Fixed a bug where query planning could hang when you ran a query with a `JOIN` and a `LIMIT` value greater than `4294967295`.This is edited draft
- Fixed a bug where using the pgwire extended query protocol to prepare a statement after rolling back to a savepoint could cause an internal error ("read sequence number is ignored after savepoint rollback"). This affected client drivers that use the Parse message (extended protocol) rather than simple query execution.
- Fixed a bug where histogram charts in the **DB Console** could show zero values for virtual clusters even when metrics had data. Edited
- Fixed a bug where the **Jobs** page could show duplicate titles when viewed in the **CockroachDB Cloud Console** with **new navigation** enabled.
- Fixed a bug where `IMPORT INTO` from Parquet files could crash a node when you specified a target column list that omitted a non-final table column, which could also lead to repeated node crashes as the import job moved between nodes.
- Fixed a bug where opening the **DB Console** with the `?cluster=<tenant>` URL parameter could hide the **OIDC login** button and prevent OpenID Connect (OIDC) sign-in for non-default virtual clusters.
- Updated the `storage.compression.cr` metric to include blob files, improving the accuracy of the reported compression ratio.
- Fixed a bug that could cause a node to crash during startup if rebalancing ran before any stores were available.
- Fixed a rare bug that could crash a node while running internal SQL queries.
- Fixed a rare nil pointer dereference panic in the tenant capabilities watcher that could occur when a tenant entry was removed before it was fully populated by the rangefeed.
- Fixed a bug where long-running `BACKUP` operations to Amazon S3 using `AUTH=implicit` could fail with credential-expiration errors (for example, `ExpiredToken`) during credential rotation.
- Fixed a data race in the multi-metric allocator between gossip-driven store load updates and concurrent lease/replica rebalancing decisions.
- Fixed a bug where `RESTORE TABLE` could fail with a descriptor rewrite error when restoring a multi-region table from a backup taken while an `ALTER TABLE ... SET LOCALITY` schema change was in progress.
- Fixed a bug where Physical Cluster Replication (PCR) reader tenants could fail to authenticate after replication progressed, causing your SQL connections to fail with `descriptor not found`.
- Fixed a bug where `CREATE VECTOR INDEX` could crash during backfill and fail the schema change when the table had a virtual computed column defined before the vector column.
- Fixed a bug where unqualified function calls could fail with misleading privilege errors when multiple databases had identically named functions in custom schemas and a query plan was reused across databases.
- A physical cluster replication reader tenant no longer fails authentication and other queries with errors of the form "resolved <name> to <id> but found no descriptor with id <id>" after the reader tenant ingests a system table at an ID different from the one it was bootstrapped with. Previously, a per-node namespace cache could pin the bootstrap-time ID and require a tenant restart to recover.
- Stopped logging a spurious "declarative schema changer does not support DISCARD" message every time a DISCARD statement was executed. The message had no functional impact but could produce very high log volume on busy clusters that issue DISCARD on every connection checkout.
- Fixed a bug where `ALTER TABLE ... DROP CONSTRAINT <pk>, ADD PRIMARY KEY (...)` could leave behind an unintended unique secondary index on the former primary key columns.
- Fixed a bug where users could see an empty **Databases** page in the **DB Console** or get `404` responses even when they had `CONNECT` privileges through role membership.
- Fixed a bug where setting `AWS_SKIP_CHECKSUM=true` for S3-compatible external storage might not disable checksums for multipart uploads, which could cause uploads to fail on services that do not support CRC checksums.
- Fixed a bug where transient I/O errors reading from the AbortSpan were misidentified as replica corruption, causing the node to crash. These errors are now returned to the caller as regular errors. Epic: none

<h3 id="v26-2-1-build-changes">Build changes</h3>

- Migrated cluster-ui npm publishing workflow to OIDC trusted publishers.
