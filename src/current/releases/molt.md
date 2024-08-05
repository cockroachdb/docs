---
title: MOLT Releases
summary: Changelog for MOLT Fetch, Verify, and Live Migration Service
toc: true
docs_area: releases
---

This page has details about each release of the following [MOLT (Migrate Off Legacy Technology) tools]({% link molt/molt-overview.md %}):

- [Fetch]({% link molt/molt-fetch.md %}) and [Verify]({% link molt/molt-verify.md %})
- [Live Migration Service (LMS)]({% link molt/live-migration-service.md %})

Cockroach Labs recommends using the latest available version of each tool. See [Installation](#installation).

<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="fetch_verify">Fetch/Verify</button>
    <button class="filter-button" data-scope="lms">LMS</button>
</div>

## Installation

<section class="filter-content" markdown="1" data-scope="fetch_verify">
To download the latest MOLT Fetch/Verify binary:

{% include molt/molt-install.md %}

{{site.data.alerts.callout_info}}
[MOLT Fetch]({% link molt/molt-fetch.md %}) is supported on Red Hat Enterprise Linux (RHEL) 9 and above.
{{site.data.alerts.end}}
</section>

<section class="filter-content" markdown="1" data-scope="lms">
To install the LMS, refer to [MOLT Live Migration Service]({% link molt/live-migration-service.md %}#installation).

To update the LMS once installed, configure the following [Helm chart values](https://github.com/cockroachdb/molt-helm-charts/blob/main/lms/values.yaml):

{% include molt/update-lms-version.md %}

For more information, refer to [Configuration]({% link molt/live-migration-service.md %}#configuration).
</section>

<section class="filter-content" markdown="1" data-scope="fetch_verify">
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
</section>

<section class="filter-content" markdown="1" data-scope="lms">
## May 31, 2024

LMS 0.2.6 is [available](#installation).

## May 30, 2024

LMS 0.2.5 is [available](#installation).

## January 26, 2024

LMS 0.2.4 is [available](#installation).

- Added a restriction for [shadowing mode]({% link molt/live-migration-service.md %}#shadowing-modes) according to the cutover type. Consistent cutover **must** be executed without any shadowing (i.e., must be performed with the non-sync mode).

</section>