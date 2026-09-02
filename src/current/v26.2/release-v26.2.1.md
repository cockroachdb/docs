## v26.2.1

Release Date: April 15, 2026

{% include releases/new-release-downloads-docker-image.md release=include.release %}

<h3 id="v26-2-1-sql-language-changes">SQL language changes</h3>

- Renamed the session variable `canary_stats_mode` values to `force_stable` and `force_canary`, allowing users to opt-in for canary statistics on a per-session basis without altering the `sql.stats.canary_fraction` cluster setting. [#168295][#168295]
- The new cluster setting `sql.stats.table_statistics_cache.capacity` controls the maximum number of tables whose statistics are retained in the in-memory LRU cache (default: 256). [#169247][#169247]
- Added the `optimizer_span_limit` session variable to limit planning work for queries with large `IN` lists. The default is now `131072`; set it to `0` to disable the limit. If a query exceeds the limit, it may use a less-selective index scan and apply remaining `IN` conditions as filters. [#168617][#168617]

<h3 id="v26-2-1-operational-changes">Operational changes</h3>

- Four new gauges `mma.overloaded_store.{lease_grace,short_dur,medium_dur,long_dur}.blocked` report overloaded stores that the multi-metric allocator (MMA) deferred because they already had too much pending work. Per duration bucket, success + failure + blocked equals the count of overloaded stores observed. A persistently non-zero value on the `long_dur.blocked` gauge indicates an overloaded store that is repeatedly being deferred and may not be receiving relief. [#169742][#169742]
- Added disk bandwidth admission control metrics to help operators monitor and alert on disk write byte token usage and throttling:
    - Added per-work-type counters `admission.granter.disk_write_byte_tokens_used.{regular,elastic,snapshot}.kv`.
    - Changed `admission.granter.disk_write_byte_tokens_exhausted_duration.kv` to an ESSENTIAL/OVERLOAD metric so it appears in standard monitoring pipelines, including the **Overload dashboard**. [#169713][#169713]
- Updated the cluster settings documentation to include the following Active Session History (ASH) settings:
    - `obs.ash.enabled`
    - `obs.ash.sample_interval`
    - `obs.ash.buffer_size`
    - `obs.ash.log_interval`
    - `obs.ash.log_top_n`
    - `obs.ash.response_limit` [#168799][#168799]

<h3 id="v26-2-1-bug-fixes">Bug fixes</h3>

- Fixed a bug where opening the **DB Console** with `?cluster=<tenant>` could load the wrong virtual cluster, which could cause:
    - The login page to show the wrong tenant configuration (for example, missing the OpenID Connect (OIDC) login button).
    - OIDC sign-in to fail for non-default virtual clusters when returning to `/oidc/v1/callback`. [#169657][#169657]
- Fixed a bug where the `storage.compression.cr` metric excluded blob storage, which could make the reported compression ratio inaccurate. After upgrading, the metric value may change because it now reflects both SST and blob storage. [#170268][#170268]
- Fixed a bug that could cause the multi-metric allocator (MMA) store rebalancer to panic during startup or when no eligible stores were available for rebalancing. [#170254][#170254]
- Fixed a rare bug that could cause a node to panic when running SQL queries that returned no rows. [#169931][#169931]
- Fixed a rare bug that could cause a node to panic when a tenant capability was deleted shortly after the tenant’s capabilities were queried. [#169418][#169418]
- A long-running `BACKUP` to S3 using `AUTH=implicit` no longer fails with an `ExpiredToken` error when it races the rotation of the underlying short-lived credentials. The S3 client now retries `ExpiredToken`, `ExpiredTokenException`, and `RequestExpired` errors the same way the legacy `aws-sdk-go` v1 client did. [#169775][#169775]
- Fixed a data race in the **multi-metric allocator** that caused conflicts during **store load updates** and **lease or replica rebalancing**. [#169590][#169590]
- Fixed a bug where `RESTORE TABLE` could fail for multi-region tables if the backup was taken while `ALTER TABLE ... SET LOCALITY` was still running. [#169425][#169425]
- Fixed a bug where PCR reader tenants could permanently fail authentication after `SetupOrAdvanceStandbyReaderCatalog` rewrote the `system.privileges` namespace entry. A stale cached name→ID mapping was never refreshed, causing every SQL connection to fail with "descriptor not found". [#169389][#169389]
- Fixed a panic during CREATE VECTOR INDEX backfill when the table contained a public column ordered before the vector column that was not stored in the source primary index and was not referenced by the new index. In practice this was triggered by virtual computed columns. The schema change crashed the SQL node processing the backfill instead of completing. [#169250][#169250]
- Fixed a bug where unqualified function calls could fail with incorrect privilege errors when two databases on the same cluster had identically-named functions in custom schemas. The query cache could serve a memo from one database context to another, causing USAGE privilege errors referencing schemas from the wrong database. [#169291][#169291]
- A physical cluster replication reader tenant no longer fails authentication and other queries with errors of the form "resolved <name> to <id> but found no descriptor with id <id>" after the reader tenant ingests a system table at an ID different from the one it was bootstrapped with. Previously, a per-node namespace cache could pin the bootstrap-time ID and require a tenant restart to recover. [#169139][#169139]
- Stopped logging a spurious "declarative schema changer does not support DISCARD" message every time a DISCARD statement was executed. The message had no functional impact but could produce very high log volume on busy clusters that issue DISCARD on every connection checkout. [#169077][#169077]
- Fixed a bug that could leave an unexpected extra index (and additional write overhead) after running `ALTER TABLE ... DROP CONSTRAINT <pk>, ADD PRIMARY KEY (...)` in a single statement. [#168967][#168967]
- Fixed a bug where the **DB Console Databases page** did not correctly resolve role membership chains for `CONNECT` grants. This fix ensures that all inherited `CONNECT` privileges are correctly resolved, allowing users in a role hierarchy to view their authorized databases and tables. [#168496][#168496]
- Fixed a bug where setting `AWS_SKIP_CHECKSUM=true` did not fully suppress request checksums for multipart uploads, which could cause S3 external-storage operations (such as `BACKUP` and `RESTORE`) to fail against S3-compatible services that do not support `CRC32` checksums. [#166551][#166551]
- Fixed a bug where transient I/O errors reading from the `AbortSpan` were misidentified as replica corruption, causing the node to crash. These errors are now returned to the caller as regular errors. [#168014][#168014]

[#166551]: https://github.com/cockroachdb/cockroach/pull/166551
[#168014]: https://github.com/cockroachdb/cockroach/pull/168014
[#168295]: https://github.com/cockroachdb/cockroach/pull/168295
[#168496]: https://github.com/cockroachdb/cockroach/pull/168496
[#168617]: https://github.com/cockroachdb/cockroach/pull/168617
[#168799]: https://github.com/cockroachdb/cockroach/pull/168799
[#168967]: https://github.com/cockroachdb/cockroach/pull/168967
[#169077]: https://github.com/cockroachdb/cockroach/pull/169077
[#169139]: https://github.com/cockroachdb/cockroach/pull/169139
[#169247]: https://github.com/cockroachdb/cockroach/pull/169247
[#169250]: https://github.com/cockroachdb/cockroach/pull/169250
[#169291]: https://github.com/cockroachdb/cockroach/pull/169291
[#169389]: https://github.com/cockroachdb/cockroach/pull/169389
[#169418]: https://github.com/cockroachdb/cockroach/pull/169418
[#169425]: https://github.com/cockroachdb/cockroach/pull/169425
[#169590]: https://github.com/cockroachdb/cockroach/pull/169590
[#169657]: https://github.com/cockroachdb/cockroach/pull/169657
[#169713]: https://github.com/cockroachdb/cockroach/pull/169713
[#169742]: https://github.com/cockroachdb/cockroach/pull/169742
[#169775]: https://github.com/cockroachdb/cockroach/pull/169775
[#169931]: https://github.com/cockroachdb/cockroach/pull/169931
[#170254]: https://github.com/cockroachdb/cockroach/pull/170254
[#170268]: https://github.com/cockroachdb/cockroach/pull/170268