---
title: MOLT Releases
summary: Changelog for MOLT Fetch and Verify
toc: true
docs_area: releases
---

This page has details about each release of the following [MOLT (Migrate Off Legacy Technology) tools]({% link molt/migration-overview.md %}):

- [Fetch]({% link molt/molt-fetch.md %})
- [Verify]({% link molt/molt-verify.md %})

Cockroach Labs recommends using the latest available version of each tool. See [Installation](#installation).

## Installation

{% include molt/molt-install.md %}

## August 21, 2025

MOLT Fetch/Verify 1.3.1 is [available](#installation).

- MOLT Fetch now supports [sharding]({% link molt/molt-fetch.md %}#table-sharding) primary keys of any data type on PostgreSQL 11+ sources. This can be enabled with the [`--use-stats-based-sharding`]({% link molt/molt-fetch.md %}#global-flags) flag.
- Added the [`--ignore-replication-check`]({% link molt/molt-fetch.md %}#global-flags) flag to allow data loads with planned downtime and no [replication setup]({% link molt/molt-fetch.md %}#replication-setup). The `--pglogical-ignore-wal-check` flag has been removed.
- Added the `--enableParallelApplies` [replication flag]({% link molt/molt-fetch.md %}#replication-flags) to enable parallel application of independent table groups during replication. By default, applies are synchronous. When enabled, this increases throughput at the cost of higher target pool usage and memory usage.
- Improved cleanup logic for scheduled tasks to ensure progress reporting and prevent indefinite hangs.
- Added parallelism gating to ensure the parallelism setting remains smaller than the `targetMaxPoolSize`. This helps prevent a potential indefinite hang.
- Added new metrics for progress report start and end times, as well as error report timing. These provide visibility into the core sequencer progress and help identify hangs in the applier and progress tracking pipeline.
- Added a new metric to track target apply queue utilization, indicating when the queue should be resized.
- Oracle sources now support configurable backpressure between the source and target applier, with a new metric to track queue depth.
- Improved visibility into queue depth between each source frontend and the backend applier to the target. Updated logging to use lower log levels with clearer, less alarming wording.
- Improved throughput for tables in the replication stream that have no dependencies on one another. This increases parallelism and minimizes blocking of transactions that are mutually independent.
- The best effort window is now disabled by default to prevent unexpected mode switches that can lead to consistency issues and stalled replication due to failed target applies.
- Added checkpointing support for the Pebble stager in CockroachDB-to-X replication mode to better handle failures and ensure minimal data replay for consistency.

#### Bug fixes

- Fixed a panic that could occur with `ENUM` types.

## July 24, 2025

MOLT Fetch/Verify 1.3.0 is [available](#installation).

- Oracle is now supported on Fetch Docker images and standalone binaries.
- Oracle is now supported on Replicator Docker images and standalone binaries.
- Azure Blob Storage is now supported as an intermediate data store for Fetch.
- Added a `--skip-pk-check` flag that lets you run the initial data load even when the source or target table is missing a primary key, or the keys do not match. When this flag is set, Fetch treats every table as keyless, disables sharding, and exports each table in a single batch, ignoring `export-concurrency` and `row-batch-size`. Querying the entire table at once may lead to high memory usage or long-running queries. Duplicate source rows are automatically removed during import when the target has primary key or unique constraints.
- Replication now uses checkpoint polling by default. This is because polling (which periodically queries the staging table for updates) performs comparably to checkpoint streaming (which uses an internal changefeed from the staging table to broadcast real-time updates). To use checkpoint streaming, set `--enableCheckpointStream`. `--disableCheckpointStream` is deprecated and should be removed from replication commands.
- Replaced the `--copierChannel` and `--stageCopierChannelSize` replication flags with a single `--targetApplyQueueSize` flag, which controls downstream apply throughput and memory usage. This feature applies only to CockroachDB and PostgreSQL (`pglogical`) sources.
- Added support for compressed changefeed payloads, improving performance of changefeed-to-Replicator communication. This only affects failback workflows from CockroachDB v25.2 and later.
- Improved apply-side performance by switching to a faster JSON decoder.
- Improved batch-accumulation performance by removing unnecessary sorting.

#### Bug fixes

- Fixed a bug where some error logs were not displayed when replicating to the target database.

## June 19, 2025

MOLT Fetch/Verify 1.2.7 is [available](#installation).

- Updated the MOLT [Grafana dashboard](https://molt.cockroachdb.com/molt/cli/grafana_dashboard.json) with the following timing metrics to better diagnose performance: Source Side Queries, Convert Source Side Queries to Datums, Writing Datums to Pipe, Preparing CSV files to be uploaded, Uploading CSV files to S3/GCP/local.
- Upgraded the MOLT parser to support new syntax that is valid in CockroachDB v25.2.
- Added more granular replication counter metrics to track data counts at each stage of the mutation pipeline, helping to diagnose data correctness issues.

#### Bug fixes

- MOLT Fetch [failback]({% link molt/migrate-failback.md %}) now reliably creates changefeeds with a sorted list of table names so that create changefeed operations can be properly deduplicated.
- Fixed an issue where shard connections failed to recognize custom types (e.g., `ENUM`) in primary keys during table migration. This occurred because the type map from the original `pgx.Conn` was not cloned. The type map is now properly cloned and attached to each shard connection.
- Fixed a bug that could cause an integer overflow, which impacts retrieving the correct shards for exporting data.

## May 22, 2025

MOLT Fetch/Verify 1.2.6 is [available](#installation).

- Fixed a bug in [`--direct-copy` mode]({% link molt/molt-fetch.md %}#direct-copy) that occurred when [`--case-sensitive`]({% link molt/molt-fetch.md %}#global-flags) was set to `false` (default). Previously, the `COPY` query could use incorrect column names in some cases during data transfer, causing errors. The query now uses the correct column names.
- Fixed a bug in how origin messages were handled during replication from PostgreSQL sources. This allows replication to successfully continue.
- `ENUM` types can now be replicated from MySQL 8.0 sources.

## April 25, 2025

MOLT Fetch/Verify 1.2.5 is [available](#installation).

- During data export, MOLT Fetch now treats empty `STRING` values on source Oracle databases as `NULL` values on the target database. This is because Oracle does not differentiate between empty `STRING` and `NULL` values.

## April 7, 2025

MOLT Fetch/Verify 1.2.4 is [available](#installation).

- MOLT Fetch now supports PostgreSQL 11.
- MOLT Fetch [failback]({% link molt/molt-fetch.md %}#failback) to CockroachDB is now disallowed.
- MOLT Verify can now compare tables that are named differently on the source and target schemas.
- The `molt` logging date format is now period-delimited for Windows compatibility.
- During replication, an index is now created on all tables by default, improving replication performance. Because index creation can cause the replication process to initialize more slowly, this behavior can be disabled using the `--stageDisableCreateTableReaderIndex` [replication flag]({% link molt/molt-fetch.md %}#replication-flags).
- Added a failback metric that tracks the time to write a source commit to the staging schema for a given mutation.
- Added a failback metric that tracks the time to write a source commit to the target database for a given mutation.

## February 26, 2025

MOLT Fetch/Verify 1.2.3 is [available](#installation).

- MOLT Fetch users can now set [`--table-concurrency`]({% link molt/molt-fetch.md %}#global-flags) and [`--export-concurrency`]({% link molt/molt-fetch.md %}#global-flags) to values greater than `1` for MySQL sources.
- MOLT Fetch now supports case-insensitive comparison of table and column names by default. Previously, case-sensitive comparisons could result in `no matching table on target` errors. To disable case-sensitive comparisons explicitly, set [`--case-sensitive=false`]({% link molt/molt-fetch.md %}#global-flags). If `=` is **not** included (e.g., `--case-sensitive false`), this is interpreted as `--case-sensitive` (i.e., `--case-sensitive=true`).

## February 5, 2025

MOLT Fetch/Verify 1.2.2 is [available](#installation).

- Added an [`--import-region`]({% link molt/molt-fetch.md %}#global-flags) flag that is used to set the `AWS_REGION` query parameter explicitly in the [`s3` URL]({% link molt/molt-fetch.md %}#bucket-path).
- Fixed the [`truncate-if-exists`]({% link molt/molt-fetch.md %}#target-table-handling) schema mode for cases where there are uppercase table or schema names.
- Fixed an issue with unsigned `BIGINT` values overflowing in replication.
- Added a `--schemaRefresh` [replication flag]({% link molt/molt-fetch.md %}#replication-flags) that is used to configure the schema watcher refresh delay in the replication phase. Previously, the refresh delay was set to a constant value of 1 minute. Set the flag as follows: `--replicator-flags "--schemaRefresh {value}"`.

## December 13, 2024

MOLT Fetch/Verify 1.2.1 is [available](#installation).

- MOLT Fetch users now can use [`--assume-role`]({% link molt/molt-fetch.md %}#global-flags) to specify a service account for assume role authentication to cloud storage. `--assume-role` must be used with `--use-implicit-auth`, or the flag will be ignored. 
- MySQL 5.7 and later are now supported with MOLT Fetch replication modes. For details on setup, refer to the [MOLT Fetch documentation]({% link molt/molt-fetch.md %}#replication-setup).
- Fetch replication mode now defaults to a less verbose `INFO` logging level. To specify `DEBUG` logging, pass in the `--replicator-flags '-v'` setting, or `--replicator-flags '-vv'` for trace logging.
- MySQL columns of type `BIGINT UNSIGNED` or `SERIAL` are now auto-mapped to [`DECIMAL`]({% link {{ site.current_cloud_version }}/decimal.md %}) type in CockroachDB. MySQL regular `BIGINT` types are mapped to [`INT`]({% link {{ site.current_cloud_version }}/int.md %}) type in CockroachDB.
- The `pglogical` replication workflow was modified in order to enforce safer and simpler defaults for the [`data-load`]({% link molt/molt-fetch.md %}#data-load), [`data-load-and-replication`]({% link molt/molt-fetch.md %}#data-load-and-replication), and [`replication-only`]({% link molt/molt-fetch.md %}#replication-only) workflows for PostgreSQL sources. Fetch now ensures that the publication is created before the slot, and that `replication-only` defaults to using publications and slots created either in previous Fetch runs or manually.
- Fixed scan iterator query ordering for `BINARY` and `TEXT` (of same collation) PKs so that they lead to the correct queries and ordering.
- For a MySQL source in [`replication-only`]({% link molt/molt-fetch.md %}#replication-only) mode, the [`--stagingSchema` replicator flag]({% link molt/molt-fetch.md %}#replication-flags) can now be used to resume streaming replication after being interrupted. Otherwise, the [`--defaultGTIDSet` replicator flag]({% link molt/molt-fetch.md %}#mysql-replication-flags) is used to start initial replication after a previous Fetch run in [`data-load`]({% link molt/molt-fetch.md %}#data-load) mode, or as an override to the current replication stream.

## October 29, 2024

MOLT Fetch/Verify 1.2.0 is [available](#installation).

- Added [`failback` mode]({% link molt/molt-fetch.md %}#failback) to MOLT Fetch, which allows the user to replicate changes on CockroachDB back to the initial source database. Failback is supported for MySQL and PostgreSQL databases.
- The [`--pprof-list-addr` flag]({% link molt/molt-fetch.md %}#global-flags), which specifies the address of the `pprof` endpoint, is now configurable. The default value is `'127.0.0.1:3031'`.
- [Fetch modes]({% link molt/molt-fetch.md %}#fetch-mode) involving replication now state that MySQL 8.0 and later are supported for replication between MySQL and CockroachDB.
- [Partitioned tables]({% link molt/molt-fetch.md %}#transformations) can now be moved to CockroachDB using [`IMPORT INTO`]({% link {{ site.current_cloud_version }}/import-into.md %}).
- Improved logging for the [Fetch]({% link molt/molt-fetch.md %}) schema check phases under the `trace` logging level, which is set with [`--logging trace`]({% link molt/molt-fetch.md %}#global-flags).
- Added a [sample Grafana dashboard](https://molt.cockroachdb.com/molt/cli/grafana_dashboard.json) for monitoring MOLT tasks. 
- Fetch now logs the name of the staging database in the target CockroachDB cluster used to store metadata for [replication modes]({% link molt/molt-fetch.md %}#fetch-mode).
- String [primary keys]({% link {{ site.current_cloud_version }}/primary-key.md %}) that use `C` [collations]({% link {{ site.current_cloud_version }}/collate.md %}) on PostgreSQL can now be compared to the default `en_US.utf8` on CockroachDB.
- MOLT is now distributed under the [Cockroach Labs Product License Agreement](https://www.cockroachlabs.com/cockroach-labs-product-license-agreement/), which is bundled with the binary.

## August 26, 2024

MOLT Fetch/Verify 1.1.7 is [available](#installation).

- When a [Fetch transformation rule]({% link molt/molt-fetch.md %}#transformations) is used to rename a table or map partitioned tables, a script in the format `partitionTableScript.{timestamp}.ts` is now automatically generated to ensure that [replication]({% link molt/molt-fetch.md %}#fetch-mode) works properly if enabled.

## August 19, 2024

MOLT Fetch/Verify 1.1.6 is [available](#installation).

- Fixed a Fetch bug where [`--table-exclusion-filter`]({% link molt/molt-fetch.md %}#schema-and-table-selection) was ignored when `--table-filter` and `--schema-filter` were set to the default (`'.*'`).

## August 15, 2024

MOLT Fetch/Verify 1.1.5 is [available](#installation).

- **Deprecated** the `--ongoing-replication` flag in favor of [`--mode data-load-and-replication`]({% link molt/molt-fetch.md %}#data-load-and-replication), using the new `--mode` flag. Users should replace all instances of `--ongoing-replication` with `--mode data-load-and-replication`.
- Fetch can now be run in an export-only mode by specifying [`--mode export-only`]({% link molt/molt-fetch.md %}#export-only-and-import-only). This will export all the data in `csv` or `csv.gz` format to the specified cloud or local store.
- Fetch can now be run in an import-only mode by specifying [`--mode import-only`]({% link molt/molt-fetch.md %}#export-only-and-import-only). This will load all data in the specified cloud or local store into the target CockroachDB database, effectively skipping the export data phase.
- Strings for the `--mode` flag are now word-separated by hyphens instead of underscores. For example, `replication-only` instead of `replication_only`.

## August 8, 2024

MOLT Fetch/Verify 1.1.4 is [available](#installation).

- Added a replication-only mode for Fetch that allows the user to run ongoing replication without schema creation or initial data load. This requires users to set `--mode replication_only` and `--replicator-flags` to specify the `defaultGTIDSet` ([MySQL](https://github.com/cockroachdb/replicator/wiki/MYLogical)) or `slotName` ([PostgreSQL](https://github.com/cockroachdb/replicator/wiki/PGLogical)).
- Partitioned tables can now be mapped to renamed tables on the target database, using the Fetch [transformations framework]({% link molt/molt-fetch.md %}#transformations).
- Added a new `--metrics-scrape-interval` flag to allow users to specify their Prometheus scrape interval and apply a sleep at the end to allow for the final metrics to be scraped.
- Previously, there was a mismatch between the errors logged in log lines and those recorded in the exceptions table when an `IMPORT INTO` or `COPY FROM` operation failed due to a non-PostgreSQL error. Now, all errors will lead to an exceptions table entry that allows the user to continue progress from a certain table's file.
- Fixed a bug that will allow Fetch to properly determine a GTID if there are multiple `source_uuids`.

## July 31, 2024

MOLT Fetch/Verify 1.1.3 is [available](#installation).

- `'infinity'::timestamp` values can now be moved with Fetch.
- Fixed an issue where connections were not being closed immediately after sharding was completed. This could lead to errors if the [maximum number of connections]({% link molt/molt-fetch.md %}#best-practices) was set to a low value.
- Fetch users can now exclude specific tables from migration using the [`--table-exclusion-filter` flag]({% link molt/molt-fetch.md %}#global-flags).

## July 18, 2024

MOLT Fetch/Verify 1.1.2 is [available](#installation).

- Fetch users can now specify columns to exclude from table migrations in order to migrate a subset of their data. This is supported in the schema creation, export, import, and direct copy phases.
- Fetch now automatically maps a partitioned table from a PostgreSQL source to the target CockroachDB schema.
- Fetch now supports column exclusions and computed column mappings via a new [transformations framework]({% link molt/molt-fetch.md %}#transformations). 
- The new Fetch [`--transformations-file`]({% link molt/molt-fetch.md %}#global-flags) flag specifies a JSON file for schema/table/column transformations, which has validation utilities built in.

## July 10, 2024

MOLT Fetch/Verify 1.1.1 is [available](#installation).

- Fixed a bug that led to incorrect list continuation file behavior if a trailing slash was provided in [`--bucket-path`]({% link molt/molt-fetch.md %}#global-flags).
- Fixed a bug with extracting the filename from a failed import URL. Previously, an older filename was being used, which could result in duplicated data. Now, the filename that is used in import matches what is stored in the exceptions log table.
- Added a [`--use-implicit-auth`]({% link molt/molt-fetch.md %}#global-flags) flag that determines whether [implicit authentication]({% link {{ site.current_cloud_version }}/cloud-storage-authentication.md %}) is used for cloud storage import URIs.

## July 8, 2024

MOLT Fetch/Verify 1.1.0 is [available](#installation).

- Fixed a bug where integer values for `JSONB`/`JSON` types were not correctly handled when migrating from a PostgreSQL or CockroachDB source.
- Optimized the logic for clearing continuation tokens. Now, the clearing option is only presented in the relevant modes and when there are tokens to clear.
- CockroachDB sources now exclusively accept connections from `admin` or `root` users.
- The statement timeout can now be adjusted during the export phase. This guards against hanging queries.

## May 31, 2024

MOLT Fetch/Verify 1.0.0 is [available](#installation).

- Renamed the `--table-splits` flag to [`--concurrency-per-table`]({% link molt/molt-fetch.md %}#global-flags), which is more descriptive.
- Increased the default value of [`--import-batch-size`]({% link molt/molt-fetch.md %}#global-flags) to `1000`. This leads to better performance on the target post-migration. Each individual import job will take longer, since more data is now imported in each batch, but the sum total of all jobs should take the same (or less) time.

## May 29, 2024

MOLT Fetch/Verify 0.3.0 is [available](#installation).

- Added an [`--import-batch-size`]({% link molt/molt-fetch.md %}#global-flags) flag, which configures the number of files to be imported in each `IMPORT` job.
- In some cases on the previous version, binaries would not work due to how `molt` was being built. Updated the build method to use static linking, which creates binaries that should be more portable.
- [`VARBIT`]({% link {{ site.current_cloud_version }}/bit.md %}) <> [`BOOL`]({% link {{ site.current_cloud_version }}/bool.md %}) conversion is now allowed for Fetch and Verify. The bit array is first converted to `UINT64`. A resulting `1` or `0` is converted to `true` or `false` accordingly. If the `UINT64` is another value, an error is emitted.

## May 20, 2024

MOLT Fetch/Verify 0.2.1 is [available](#installation).

- MOLT tools now enforce secure connections to databases as a default. The `--allow-tls-mode-disable` flag allows users to override that behavior if secure access is not possible.
- When using MySQL as a source, [`--table-concurrency`]({% link molt/molt-fetch.md %}#global-flags) and [`--export-concurrency`]({% link molt/molt-fetch.md %}#global-flags) are strictly set to `1`.
- Fixed a bug involving history retention for [`DECIMAL`]({% link {{ site.current_cloud_version }}/decimal.md %}) values.

## May 3, 2024

MOLT Fetch/Verify 0.2.0 is [available](#installation).

- Fetch now supports CockroachDB [multi-region tables]({% link {{ site.current_cloud_version }}/multiregion-overview.md %}).
- Fetch now supports continuous replication for PostgreSQL and MySQL source databases via the [`--ongoing-replication`]({% link molt/molt-fetch.md %}#global-flags) flag. When Fetch finishes the initial data load phase, it will start the replicator process as a subprocess, which runs indefinitely until the user ends the process with a `SIGTERM` (`ctrl-c`).
- Replicator flags for ([PostgreSQL](https://github.com/cockroachdb/replicator/wiki/PGLogical#postgresql-logical-replication) and [MySQL](https://github.com/cockroachdb/replicator/wiki/MYLogical#mysqlmariadb-replication)) are now supported, allowing users to further configure the [`--ongoing-replication`]({% link molt/molt-fetch.md %}#global-flags) mode for their use case.
- Added the [`--type-map-file`]({% link molt/molt-fetch.md %}#global-flags) flag, which enables custom type mapping for schema creation.
- Fixed a bug where primary key positions could be missed when creating a schema with multiple primary keys.
- Added a default mode for MySQL sources that ensures consistency and does not leverage parallelism. New text is displayed that alerts the user and links to documentation in cases where fetching from MySQL might not be consistent.
- Logging for continuation tokens is now omitted when data export does not successfully complete.

## April 10, 2024

MOLT Fetch/Verify 0.1.4 is [available](#installation).

- Fixed an inconsistency where inserting `'null'` as a string into `JSON`/`JSONB` columns did not align with PostgreSQL's case-sensitive null handling.

## March 22, 2024

MOLT Fetch/Verify 0.1.2 is [available](#installation).

- Fixed a bug where running Verify with a PostgreSQL or CockroachDB source would cause an error when there are dropped columns on the table.

## March 13, 2024

MOLT Fetch/Verify 0.1.1 is [available](#installation).

- An error is now displayed if the original column is a PostgreSQL nested array.
- Added sharded data export functionality for faster performance.
- Added support for the `--table-handling 'drop-on-target-and-recreate'` flag for MySQL sources, enabling automatic schema recreation.
- Added support for `ENUM` data types in schema creation.
- Deprecated the `--s3-bucket` and `--gcp-bucket` flags in favor of a single `--bucket-path` flag.

## February 22, 2024

MOLT Fetch/Verify 0.1.0 is [available](#installation).

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
