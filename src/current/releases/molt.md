---
title: MOLT Releases
summary: Changelog for MOLT Fetch, Verify, and Replicator
toc: true
docs_area: releases
---

This page has details about each release of the following [MOLT (Migrate Off Legacy Technology) tools]({% link molt/migration-overview.md %}):

- `molt`: [MOLT Fetch]({% link molt/molt-fetch.md %}) and [MOLT Verify]({% link molt/molt-verify.md %})
- `replicator`: [MOLT Replicator]({% link molt/molt-replicator.md %})

Cockroach Labs recommends using the latest available version of each tool. Refer to [Installation](#installation).

## Installation

{% include molt/molt-install.md %}

## Changelog

<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="molt"><code>molt</code></button>
    <button class="filter-button" data-scope="replicator"><code>replicator</code></button>
</div>

### January 22, 2026

<section class="filter-content" markdown="1" data-scope="molt">
`molt` 1.3.5 is [available](#installation):

- Binary downloads now include version-compatible Grafana dashboards.
</section>

<section class="filter-content" markdown="1" data-scope="replicator">
`replicator` 1.3.0 is [available](#installation):

- Added Prometheus metrics for userscript execution (execution time, invocation counts, rows processed/filtered, errors) with schema, table, and function labels.
- Binary downloads now include version-compatible Grafana dashboards.
- Added userscript API `v2` features.
</section>

### December 18, 2025

<section class="filter-content" markdown="1" data-scope="molt">
`molt` 1.3.4 is [available](#installation):

- Deprecated `data-load-and-replication`, `replication-only`, and `failback` modes in Fetch. Replication should now be performed separately with Replicator. Refer to the [MOLT Replicator]({% link molt/molt-replicator.md %}) documentation.
- Oracle-compatible MacOS builds are now available for arm64 and amd64. Refer to [Installation](#installation).
- Fixed a bug where the `--filter-path` flag for MOLT Fetch was hidden. `--filter-path` is now present for selective data movement in MOLT Fetch.
- MOLT Fetch now logs a warning when `--schema-filter` is used with MySQL sources, which do not support schemas.
- Fixed a character escaping bug where MOLT Verify was incorrectly reporting mismatching rows for JSON data in MySQL.
- Added better edge case handling for cleaning up the target database after `IMPORT` runs so that a fresh connection is opened, which mitigates against stale or already broken long-lived connections.
- Added better logging to handle the case where the recreation of a connection fails during a retry.
- Removed fixup mode, live verify mode, and continuous verify mode from MOLT Verify, including the `--continuous` and `--continuous-pause-between-runs` flags.
- Fixed a bug in retry logic to cleanly exit (without hanging) when the context is canceled and report the proper error.
</section>

<section class="filter-content" markdown="1" data-scope="replicator">
`replicator` 1.2.0 is [available](#installation):

- Updated metric names and descriptions and updated the dashboard to reflect these changes. Major metric name updates are as follows:

    - `mutations_{received,success,error}_count` -> `acceptor_mutations_total{type="received|success|error"}`
    - `source_lag_seconds_histogram` -> `core_source_lag_seconds`
    - `target_lag_seconds_histogram` -> `target_apply_transaction_lag_seconds`
    - `target_apply_queue_depth` -> `target_apply_queue_size`
    - `commit_to_stage_lag_seconds` -> `stage_commit_lag_seconds`
    - `apply_mutation_age_seconds` -> `target_apply_mutation_age_seconds`
    - `target_mutations_sent_to_apply_queue_count` -> `target_mutations_sent_to_apply_queue`
    - `checkpoint_proposed_going_backwards_errors` -> `checkpoint_proposed_going_backwards_errors_total`
    - Oracle LogMiner metrics are now prefixed with `oraclelogminer_` (including `oraclecheckpoint` metrics)

    For the rest of the metric name and description changes, run `curl http://localhost:{port}/_/varz` while running `replicator` with the `--metricsAddr` flag set.
- `RAW16` stored `UUID`s on Oracle can now be replicated into CockroachDB `UUID` columns when doing Oracle Log Miner source replication.
- Fixed a bug where Oracle timestamp parsing could use the wrong DST offset, resulting in incorrect UTC times for certain dates.
- Fixed observability for redo log parsing buckets so that the correct buckets and minimum durations are shown. Previously, the default for Prometheus buckets were too large, leading to incorrect redo log parsing time.
- Updated the Replicator sentinel table name to `REPLICATOR_SENTINEL` for Oracle LogMiner operation (Oracle source replication) to address a compatibility issue with JDBC drivers calling `getIndexInfo` on tables with leading underscores.
- Added metrics for the number of mutations sent to the apply queue from the `pglogical` frontend.
</section>

### October 24, 2025

<section class="filter-content" markdown="1" data-scope="molt">
`molt` 1.3.2 is [available](#installation):

- MOLT Fetch replication modes are deprecated in favor of a separate replication workflow using `replicator`. For details, refer to [MOLT Replicator]({% link molt/molt-replicator.md %}).
- Added retry logic to the export phase for CockroachDB and PostgreSQL sources to handle transient errors while maintaining a consistent snapshot point. Not currently supported for Oracle or MySQL sources.
- Added `--export-retry-max-attempts` and `--export-retry-max-duration` flags to control retry behavior for source query exports.
</section>

<section class="filter-content" markdown="1" data-scope="replicator">
`replicator` 1.1.3 is [available](#installation):

- Added `commit_to_stage_lag_seconds` Prometheus histogram metric to track the distribution of source CockroachDB to staged data times.
- Added `core_parallelism_utilization_percent` gauge to track parallelism utilization and identify when the system is nearing parallelism limits, and should be sized up.
- Added `core_flush_count` metric to track the number of flushed batches in the applier flow and the reason for each flush.
</section>

<section class="filter-content" markdown="1" data-scope="molt">
### September 25, 2025

`molt` 1.3.2 is [available](#installation).

- MOLT Fetch replication modes will be deprecated in favor of a separate replication workflow in an upcoming release. This includes the `data-load-and-replication`, `replication-only`, and `failback` modes.
- Fixed a bug with stats-based sharding where PostgreSQL queries were generated incorrectly when the first primary key column did not have sufficient unique values.
- Fixed a bug in `escape-password` where passwords that start with a hyphen were not handled correctly. Users must now pass the `--password` flag when running `escape-password`. For example, `molt escape-password --password 'a$52&'`.
- Added support for assume role authentication during [data export]({% link molt/molt-fetch.md %}#data-export-phase) with MOLT Fetch.
- Added support to `replicator` for retrying unique constraint violations on the target database, which can be temporary in some cases.
- Added exponential backoff to `replicator` for retryable errors when applying mutations to the target database. This reduces load on the target database and prevents exhausting retries prematurely. The new [replication flags]({% link molt/replicator-flags.md %}) `--retryInitialBackoff`, `--retryMaxBackoff`, and `--retryMultiplier` control backoff behavior. The new `--maxRetries` flag configures the maximum number of retries. To retain the previous "immediate retry" behavior, set `--retryMaxBackoff 1ns --retryInitialBackoff 1ns --retryMultiplier 1`.
- Added support to `replicator` for the `source_lag_seconds`, `target_lag_seconds`, `apply_mutation_age_seconds`, and `source_commit_to_apply_lag_seconds` metrics for replication from PostgreSQL and MySQL, and introduced histogram metrics `source_lag_seconds_histogram` and `target_lag_seconds_histogram` for replication from CockroachDB. 

	`source_lag_seconds` measures the delay before data is ready to be processed by `replicator`, while `target_lag_seconds` measures the "end-to-end" delay until `replicator` has written data to the target. A steady increase in `source_lag_seconds` may indicate `replicator` cannot keep up with the source workload, while a steady increase in `target_lag_seconds` may indicate `replicator` cannot keep up with the source workload or that writes on the target database are bottlenecked.

### August 21, 2025

`molt` 1.3.1 is [available](#installation).

- MOLT Fetch now supports [sharding]({% link molt/molt-fetch.md %}#shard-tables-for-concurrent-export) of primary keys of any data type on PostgreSQL 11+ sources. This can be enabled with the [`--use-stats-based-sharding`]({% link molt/molt-fetch-commands-and-flags.md %}#global-flags) flag.
- Added the [`--ignore-replication-check`]({% link molt/molt-fetch-commands-and-flags.md %}#global-flags) flag to allow data loads with planned downtime and no replication setup. The `--pglogical-ignore-wal-check` flag has been removed.
- Added the `--enableParallelApplies` [replication flag]({% link molt/replicator-flags.md %}) to enable parallel application of independent table groups during replication. By default, applies are synchronous. When enabled, this increases throughput at the cost of increased target pool and memory usage.
- Improved cleanup logic for scheduled tasks to ensure progress reporting and prevent indefinite hangs.
- Added parallelism gating to ensure the parallelism setting is smaller than the `targetMaxPoolSize`. This helps prevent a potential indefinite hang.
- Added new metrics that track start and end times for progress reports (`core_progress_reports_started_count` and `core_progress_reports_ended_count`) and error reports (`core_error_reports_started_count` and `core_error_reports_ended_count`). These provide visibility into the core sequencer progress and help identify hangs in the applier and progress tracking pipeline.
- Added new metrics `target_apply_queue_utilization_percent` and `target_apply_queue_depth` to track target apply queue utilization, indicating when the queue should be resized. These metrics apply only to PostgreSQL, Oracle, and CockroachDB sources.
- Oracle sources now support configurable backpressure between the source and target applier. The new `target_apply_queue_depth` metric tracks queue depth.
- Improved visibility into queue depth between each source frontend and the backend applier to the target. Updated logging to use lower log levels with clearer, less alarming messages.
- Improved throughput for tables in the replication stream that have no dependencies on one another. This increases parallelism and minimizes blocking of transactions that are mutually independent.
- The best effort window is now disabled by default to prevent unexpected mode switches that could cause consistency issues or stall replication due to failed target applies.

##### Bug fixes

- Fixed a panic that could occur with `ENUM` types.

### July 24, 2025

`molt` 1.3.0 is [available](#installation).

- Oracle is now supported on Fetch Docker images and standalone binaries.
- Oracle is now supported on Replicator Docker images and standalone binaries.
- Azure Blob Storage is now supported as an intermediate data store for Fetch.
- Added a `--skip-pk-check` flag that lets you run the initial data load even when the source or target table is missing a primary key, or the keys do not match. When this flag is set, Fetch treats every table as keyless, disables sharding, and exports each table in a single batch, ignoring `export-concurrency` and `row-batch-size`. Querying the entire table at once may lead to high memory usage or long-running queries. Duplicate source rows are automatically removed during import when the target has primary key or unique constraints.
- Replication now uses checkpoint polling by default. This is because polling (which periodically queries the staging table for updates) performs comparably to checkpoint streaming (which uses an internal changefeed from the staging table to broadcast real-time updates). To use checkpoint streaming, set `--enableCheckpointStream`. `--disableCheckpointStream` is deprecated and should be removed from replication commands.
- Replaced the `--copierChannel` and `--stageCopierChannelSize` replication flags with a single `--targetApplyQueueSize` flag, which controls downstream apply throughput and memory usage. This feature applies only to CockroachDB and PostgreSQL (`pglogical`) sources.
- Added support for compressed changefeed payloads, improving performance of changefeed-to-Replicator communication. This only affects failback workflows from CockroachDB v25.2 and later.
- Improved apply-side performance by switching to a faster JSON decoder.
- Improved batch-accumulation performance by removing unnecessary sorting.

##### Bug fixes

- Fixed a bug where some error logs were not displayed when replicating to the target database.

### June 19, 2025

`molt` 1.2.7 is [available](#installation).

- Updated the MOLT [Grafana dashboard](https://molt.cockroachdb.com/molt/cli/grafana_dashboard.json) with the following timing metrics to better diagnose performance: Source Side Queries, Convert Source Side Queries to Datums, Writing Datums to Pipe, Preparing CSV files to be uploaded, Uploading CSV files to S3/GCP/local.
- Upgraded the MOLT parser to support new syntax that is valid in CockroachDB v25.2.
- Added more granular replication counter metrics to track data counts at each stage of the mutation pipeline, helping to diagnose data correctness issues.

##### Bug fixes

- MOLT Fetch [failback]({% link molt/migrate-failback.md %}) now reliably creates changefeeds with a sorted list of table names so that create changefeed operations can be properly deduplicated.
- Fixed an issue where shard connections failed to recognize custom types (e.g., `ENUM`) in primary keys during table migration. This occurred because the type map from the original `pgx.Conn` was not cloned. The type map is now properly cloned and attached to each shard connection.
- Fixed a bug that could cause an integer overflow, which impacts retrieving the correct shards for exporting data.

### May 22, 2025

`molt` 1.2.6 is [available](#installation).

- Fixed a bug in [`--direct-copy` mode]({% link molt/molt-fetch.md %}#direct-copy) that occurred when [`--case-sensitive`]({% link molt/molt-fetch-commands-and-flags.md %}#global-flags) was set to `false` (default). Previously, the `COPY` query could use incorrect column names in some cases during data transfer, causing errors. The query now uses the correct column names.
- Fixed a bug in how origin messages were handled during replication from PostgreSQL sources. This allows replication to successfully continue.
- `ENUM` types can now be replicated from MySQL 8.0 sources.

### April 25, 2025

`molt` 1.2.5 is [available](#installation).

- During data export, MOLT Fetch now treats empty `STRING` values on source Oracle databases as `NULL` values on the target database. This is because Oracle does not differentiate between empty `STRING` and `NULL` values.

### April 7, 2025

`molt` 1.2.4 is [available](#installation).

- MOLT Fetch now supports PostgreSQL 11.
- MOLT Fetch failback to CockroachDB is now disallowed.
- MOLT Verify can now compare tables that are named differently on the source and target schemas.
- The `molt` logging date format is now period-delimited for Windows compatibility.
- During replication, an index is now created on all tables by default, improving replication performance. Because index creation can cause the replication process to initialize more slowly, this behavior can be disabled using the `--stageDisableCreateTableReaderIndex` [replication flag]({% link molt/replicator-flags.md %}#stage-disable-create-table-reader-index).
- Added a failback metric that tracks the time to write a source commit to the staging schema for a given mutation.
- Added a failback metric that tracks the time to write a source commit to the target database for a given mutation.

### February 26, 2025

`molt` 1.2.3 is [available](#installation).

- MOLT Fetch users can now set [`--table-concurrency`]({% link molt/molt-fetch-commands-and-flags.md %}#global-flags) and [`--export-concurrency`]({% link molt/molt-fetch-commands-and-flags.md %}#global-flags) to values greater than `1` for MySQL sources.
- MOLT Fetch now supports case-insensitive comparison of table and column names by default. Previously, case-sensitive comparisons could result in `no matching table on target` errors. To disable case-sensitive comparisons explicitly, set [`--case-sensitive=false`]({% link molt/molt-fetch-commands-and-flags.md %}#global-flags). If `=` is **not** included (e.g., `--case-sensitive false`), this is interpreted as `--case-sensitive` (i.e., `--case-sensitive=true`).

### February 5, 2025

`molt` 1.2.2 is [available](#installation).

- Added an [`--import-region`]({% link molt/molt-fetch-commands-and-flags.md %}#global-flags) flag that is used to set the `AWS_REGION` query parameter explicitly in the [`s3` URL]({% link molt/molt-fetch.md %}#bucket-path).
- Fixed the [`truncate-if-exists`]({% link molt/molt-fetch.md %}#handle-target-tables) schema mode for cases where there are uppercase table or schema names.
- Fixed an issue with unsigned `BIGINT` values overflowing in replication.
- Added a `--schemaRefresh` [replication flag]({% link molt/replicator-flags.md %}#schema-refresh) that is used to configure the schema watcher refresh delay in the replication phase. Previously, the refresh delay was set to a constant value of 1 minute. Set the flag as follows: `--replicator-flags "--schemaRefresh {value}"`.

### December 13, 2024

`molt` 1.2.1 is [available](#installation).

- MOLT Fetch users now can use [`--assume-role`]({% link molt/molt-fetch-commands-and-flags.md %}#global-flags) to specify a service account for assume role authentication to cloud storage. `--assume-role` must be used with `--use-implicit-auth`, or the flag will be ignored. 
- MySQL 5.7 and later are now supported with MOLT Fetch replication modes.
- Fetch replication mode now defaults to a less verbose `INFO` logging level. To specify `DEBUG` logging, pass in the `--replicator-flags '-v'` setting, or `--replicator-flags '-vv'` for trace logging.
- MySQL columns of type `BIGINT UNSIGNED` or `SERIAL` are now auto-mapped to [`DECIMAL`]({% link {{ site.current_cloud_version }}/decimal.md %}) type in CockroachDB. MySQL regular `BIGINT` types are mapped to [`INT`]({% link {{ site.current_cloud_version }}/int.md %}) type in CockroachDB.
- The `pglogical` replication workflow was modified in order to enforce safer and simpler defaults for the [`data-load`]({% link molt/molt-fetch.md %}#define-fetch-mode), `data-load-and-replication`, and `replication-only` workflows for PostgreSQL sources. Fetch now ensures that the publication is created before the slot, and that `replication-only` defaults to using publications and slots created either in previous Fetch runs or manually.
- Fixed scan iterator query ordering for `BINARY` and `TEXT` (of same collation) PKs so that they lead to the correct queries and ordering.
- For a MySQL source in `replication-only` mode, the [`--stagingSchema` replicator flag]({% link molt/replicator-flags.md %}#staging-schema) can now be used to resume streaming replication after being interrupted. Otherwise, the [`--defaultGTIDSet` replicator flag]({% link molt/replicator-flags.md %}#default-gtid-set) is used to start initial replication after a previous Fetch run in [`data-load`]({% link molt/molt-fetch.md %}#define-fetch-mode) mode, or as an override to the current replication stream.

### October 29, 2024

`molt` 1.2.0 is [available](#installation).

- Added `failback` mode to MOLT Fetch, which allows the user to replicate changes on CockroachDB back to the initial source database. Failback is supported for MySQL and PostgreSQL databases.
- The [`--pprof-list-addr` flag]({% link molt/molt-fetch-commands-and-flags.md %}#global-flags), which specifies the address of the `pprof` endpoint, is now configurable. The default value is `'127.0.0.1:3031'`.
- [Fetch modes]({% link molt/molt-fetch.md %}#define-fetch-mode) involving replication now state that MySQL 8.0 and later are supported for replication between MySQL and CockroachDB.
- [Partitioned tables]({% link molt/molt-fetch.md %}#define-transformations) can now be moved to CockroachDB using [`IMPORT INTO`]({% link {{ site.current_cloud_version }}/import-into.md %}).
- Improved logging for the [Fetch]({% link molt/molt-fetch.md %}) schema check phases under the `trace` logging level, which is set with [`--logging trace`]({% link molt/molt-fetch-commands-and-flags.md %}#global-flags).
- Added a [sample Grafana dashboard](https://molt.cockroachdb.com/molt/cli/grafana_dashboard.json) for monitoring MOLT tasks. 
- Fetch now logs the name of the staging database in the target CockroachDB cluster used to store metadata for [replication modes]({% link molt/molt-fetch.md %}#define-fetch-mode).
- String [primary keys]({% link {{ site.current_cloud_version }}/primary-key.md %}) that use `C` [collations]({% link {{ site.current_cloud_version }}/collate.md %}) on PostgreSQL can now be compared to the default `en_US.utf8` on CockroachDB.
- MOLT is now distributed under the [Cockroach Labs Product License Agreement](https://www.cockroachlabs.com/cockroach-labs-product-license-agreement/), which is bundled with the binary.

### August 26, 2024

`molt` 1.1.7 is [available](#installation).

- When a [Fetch transformation rule]({% link molt/molt-fetch.md %}#define-transformations) is used to rename a table or map partitioned tables, a script in the format `partitionTableScript.{timestamp}.ts` is now automatically generated to ensure that [replication]({% link molt/molt-fetch.md %}#define-fetch-mode) works properly if enabled.

### August 19, 2024

`molt` 1.1.6 is [available](#installation).

- Fixed a Fetch bug where [`--table-exclusion-filter`]({% link molt/molt-fetch.md %}#schema-and-table-selection) was ignored when `--table-filter` and `--schema-filter` were set to the default (`'.*'`).

### August 15, 2024

`molt` 1.1.5 is [available](#installation).

- **Deprecated** the `--ongoing-replication` flag in favor of `--mode data-load-and-replication`, using the new `--mode` flag. Users should replace all instances of `--ongoing-replication` with `--mode data-load-and-replication`.
- Fetch can now be run in an export-only mode by specifying [`--mode export-only`]({% link molt/molt-fetch.md %}#define-fetch-mode). This will export all the data in `csv` or `csv.gz` format to the specified cloud or local store.
- Fetch can now be run in an import-only mode by specifying [`--mode import-only`]({% link molt/molt-fetch.md %}#define-fetch-mode). This will load all data in the specified cloud or local store into the target CockroachDB database, effectively skipping the export data phase.
- Strings for the `--mode` flag are now word-separated by hyphens instead of underscores. For example, `replication-only` instead of `replication_only`.

### August 8, 2024

`molt` 1.1.4 is [available](#installation).

- Added a replication-only mode for Fetch that allows the user to run ongoing replication without schema creation or initial data load. This requires users to set `--mode replication_only` and `--replicator-flags` to specify the `defaultGTIDSet` ([MySQL](https://github.com/cockroachdb/replicator/wiki/MYLogical)) or `slotName` ([PostgreSQL](https://github.com/cockroachdb/replicator/wiki/PGLogical)).
- Partitioned tables can now be mapped to renamed tables on the target database, using the Fetch [transformations framework]({% link molt/molt-fetch.md %}#define-transformations).
- Added a new `--metrics-scrape-interval` flag to allow users to specify their Prometheus scrape interval and apply a sleep at the end to allow for the final metrics to be scraped.
- Previously, there was a mismatch between the errors logged in log lines and those recorded in the exceptions table when an `IMPORT INTO` or `COPY FROM` operation failed due to a non-PostgreSQL error. Now, all errors will lead to an exceptions table entry that allows the user to continue progress from a certain table's file.
- Fixed a bug that will allow Fetch to properly determine a GTID if there are multiple `source_uuids`.

### July 31, 2024

`molt` 1.1.3 is [available](#installation).

- `'infinity'::timestamp` values can now be moved with Fetch.
- Fixed an issue where connections were not being closed immediately after sharding was completed. This could lead to errors if the [maximum number of connections]({% link molt/molt-fetch-best-practices.md %}#configure-the-source-database-and-connection) was set to a low value.
- Fetch users can now exclude specific tables from migration using the [`--table-exclusion-filter` flag]({% link molt/molt-fetch-commands-and-flags.md %}#global-flags).

### July 18, 2024

`molt` 1.1.2 is [available](#installation).

- Fetch users can now specify columns to exclude from table migrations in order to migrate a subset of their data. This is supported in the schema creation, export, import, and direct copy phases.
- Fetch now automatically maps a partitioned table from a PostgreSQL source to the target CockroachDB schema.
- Fetch now supports column exclusions and computed column mappings via a new [transformations framework]({% link molt/molt-fetch.md %}#define-transformations). 
- The new Fetch [`--transformations-file`]({% link molt/molt-fetch-commands-and-flags.md %}#global-flags) flag specifies a JSON file for schema/table/column transformations, which has validation utilities built in.

### July 10, 2024

`molt` 1.1.1 is [available](#installation).

- Fixed a bug that led to incorrect list continuation file behavior if a trailing slash was provided in [`--bucket-path`]({% link molt/molt-fetch-commands-and-flags.md %}#global-flags).
- Fixed a bug with extracting the filename from a failed import URL. Previously, an older filename was being used, which could result in duplicated data. Now, the filename that is used in import matches what is stored in the exceptions log table.
- Added a [`--use-implicit-auth`]({% link molt/molt-fetch-commands-and-flags.md %}#global-flags) flag that determines whether [implicit authentication]({% link {{ site.current_cloud_version }}/cloud-storage-authentication.md %}) is used for cloud storage import URIs.

### July 8, 2024

`molt` 1.1.0 is [available](#installation).

- Fixed a bug where integer values for `JSONB`/`JSON` types were not correctly handled when migrating from a PostgreSQL or CockroachDB source.
- Optimized the logic for clearing continuation tokens. Now, the clearing option is only presented in the relevant modes and when there are tokens to clear.
- CockroachDB sources now exclusively accept connections from `admin` or `root` users.
- The statement timeout can now be adjusted during the export phase. This guards against hanging queries.

### May 31, 2024

`molt` 1.0.0 is [available](#installation).

- Renamed the `--table-splits` flag to [`--concurrency-per-table`]({% link molt/molt-fetch-commands-and-flags.md %}#global-flags), which is more descriptive.
- Increased the default value of [`--import-batch-size`]({% link molt/molt-fetch-commands-and-flags.md %}#global-flags) to `1000`. This leads to better performance on the target post-migration. Each individual import job will take longer, since more data is now imported in each batch, but the sum total of all jobs should take the same (or less) time.

### May 29, 2024

`molt` 0.3.0 is [available](#installation).

- Added an [`--import-batch-size`]({% link molt/molt-fetch-commands-and-flags.md %}#global-flags) flag, which configures the number of files to be imported in each `IMPORT` job.
- In some cases on the previous version, binaries would not work due to how `molt` was being built. Updated the build method to use static linking, which creates binaries that should be more portable.
- [`VARBIT`]({% link {{ site.current_cloud_version }}/bit.md %}) <> [`BOOL`]({% link {{ site.current_cloud_version }}/bool.md %}) conversion is now allowed for Fetch and Verify. The bit array is first converted to `UINT64`. A resulting `1` or `0` is converted to `true` or `false` accordingly. If the `UINT64` is another value, an error is emitted.

### May 20, 2024

`molt` 0.2.1 is [available](#installation).

- MOLT tools now enforce secure connections to databases as a default. The `--allow-tls-mode-disable` flag allows users to override that behavior if secure access is not possible.
- When using MySQL as a source, [`--table-concurrency`]({% link molt/molt-fetch-commands-and-flags.md %}#global-flags) and [`--export-concurrency`]({% link molt/molt-fetch-commands-and-flags.md %}#global-flags) are strictly set to `1`.
- Fixed a bug involving history retention for [`DECIMAL`]({% link {{ site.current_cloud_version }}/decimal.md %}) values.

### May 3, 2024

`molt` 0.2.0 is [available](#installation).

- Fetch now supports CockroachDB [multi-region tables]({% link {{ site.current_cloud_version }}/multiregion-overview.md %}).
- Fetch now supports continuous replication for PostgreSQL and MySQL source databases via the [`--ongoing-replication`]({% link molt/molt-fetch-commands-and-flags.md %}#global-flags) flag. When Fetch finishes the initial data load phase, it will start the replicator process as a subprocess, which runs indefinitely until the user ends the process with a `SIGTERM` (`ctrl-c`).
- Replicator flags for ([PostgreSQL](https://github.com/cockroachdb/replicator/wiki/PGLogical#postgresql-logical-replication) and [MySQL](https://github.com/cockroachdb/replicator/wiki/MYLogical#mysqlmariadb-replication)) are now supported, allowing users to further configure the [`--ongoing-replication`]({% link molt/molt-fetch-commands-and-flags.md %}#global-flags) mode for their use case.
- Added the [`--type-map-file`]({% link molt/molt-fetch-commands-and-flags.md %}#global-flags) flag, which enables custom type mapping for schema creation.
- Fixed a bug where primary key positions could be missed when creating a schema with multiple primary keys.
- Added a default mode for MySQL sources that ensures consistency and does not leverage parallelism. New text is displayed that alerts the user and links to documentation in cases where fetching from MySQL might not be consistent.
- Logging for continuation tokens is now omitted when data export does not successfully complete.

### April 10, 2024

`molt` 0.1.4 is [available](#installation).

- Fixed an inconsistency where inserting `'null'` as a string into `JSON`/`JSONB` columns did not align with PostgreSQL's case-sensitive null handling.

### March 22, 2024

`molt` 0.1.2 is [available](#installation).

- Fixed a bug where running Verify with a PostgreSQL or CockroachDB source would cause an error when there are dropped columns on the table.

### March 13, 2024

`molt` 0.1.1 is [available](#installation).

- An error is now displayed if the original column is a PostgreSQL nested array.
- Added sharded data export functionality for faster performance.
- Added support for the `--table-handling 'drop-on-target-and-recreate'` flag for MySQL sources, enabling automatic schema recreation.
- Added support for `ENUM` data types in schema creation.
- Deprecated the `--s3-bucket` and `--gcp-bucket` flags in favor of a single `--bucket-path` flag.

### February 22, 2024

`molt` 0.1.0 is [available](#installation).

- Added implicit authentication for GCP sources.
- Resolved a CSV write deadlock issue for large file exports.
- Added new dashboard metrics: `molt_verify_num_tables` (categorizes tables as `verified`, `missing`, or `extraneous`) and `molt_verify_duration_ms` (how long a Verify run took to complete, in milliseconds).
- Previously, if a comparison between heterogeneous column types occurred, Verify would panic and stop execution. Now, Verify no longer panics, but records the error and reports it to logging, and also marks the row as having mismatching columns. The error message is logged at most once per shard to avoid log spewing. Additionally, introduced the concept of conditional success, which means that all comparable row columns were compared and succeeded with the same value. Upon conditional success, the user is instructed to check all warnings and verify the data.
- Marked the `--live` and `--continuous` flags as dependencies for other sub-configuration flags. If a flag is set without its dependency, MOLT will indicate which dependency flag is not correctly set.
- Added the RFC for MOLT Fetch, which explains the architectural decisions and considerations of how Fetch was built. The RFC also outlines limitiations of the current system and further improvements around usability, performance, and integration with replication tools.
- Added logging annotations for data-level errors and information that surfaced during the Verify process, as well as summary status logs about the overall functioning of the job (e.g., 10000 truth rows seen, 5000 mismatches, etc.). These can be filtered so that exact tables and rows can be triaged in one place.
- Changed the output for the running summary statistics so that they are now more easily indexable by log processing tools. Previously, it was more human-readable, but fields were not easily indexable out of the box. Now, there is a balance between readability and downstream processing.
- Added tagging for summary and data logs so that users can filter the logs in a variety of log processing tools, or `grep` in the command line. This solves the pain point of all the logs going to the same location without any differentiation. Now, it is possible to view types of logs one at a time. Summary logs report aggregated results on either a task or step in a task (e.g., task took 10 minutes; 500 tables processed overall). Data logs report on individual or row-level operations and quantitative markers (e.g., 1000 rows completed so far; failed to verify item with PK 1000)
- Marked the `--s3-bucket`, `--gcp-bucket`, and `--local-path` flags as mutually exclusive because they all represent different intermediary stores.
- Adjusted settings for the number of rows and the size of data to be flushed so that only one rule is applied at any given time.
- Fixed a bug where outputs containing special characters were not formatted correctly.
- When running the import query for Fetch, the import statement is now printed if the logger is in debug mode.
- Updated the MOLT README with an OS + Docker-based edge case with Fetch.
- Logging for Fetch and Verify now defaults to structured JSON logging, which contains at least the message, level, and formatted time string. The `--use-console-writer` flag enables prettier console writing that has colored and human-readable log output. Structured logging is the default because it is easier to parse with log ingestion tools and is more efficient for the application to output.
- Task/data logs can now be written to specified log files using `--log-file`. If the flag is left empty, the MOLT tool will only write to `stdout`, which is more efficient.
</section>