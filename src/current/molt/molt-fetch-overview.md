---
title: MOLT Fetch Overview
summary: Learn how to use the MOLT Fetch tool to move data from a source database to CockroachDB.
toc: true
docs_area: migrate
---

MOLT Fetch moves data from a source database into CockroachDB as part of a [database migration]({% link molt/migration-overview.md %}).

MOLT Fetch uses [`IMPORT INTO`]({% link {{site.current_cloud_version}}/import-into.md %}) or [`COPY FROM`]({% link {{site.current_cloud_version}}/copy.md %}) to move the source data to cloud storage (Google Cloud Storage, Amazon S3, or Azure Blob Storage), a local file server, or local memory. Once the data is exported, MOLT Fetch loads the data into a target CockroachDB database. For details, refer to [Migration phases](#migration-phases).

## Terminology

- *Shard*: A portion of a table's data exported concurrently during the data export phase. Tables are divided into shards to enable parallel processing. For details, refer to [Table sharding](#table-sharding).
- *Continuation token*: An identifier that marks the progress of a fetch task. Used to resume data loading from the point of interruption if a fetch task fails. For details, refer to [Fetch continuation](#fetch-continuation).
- *Intermediate files*: Temporary data files written to cloud storage or a local file server during the data export phase. These files are used to stage exported data before importing it into CockroachDB during the data import phase. For details, refer to [Data path](#data-path).


## Migration phases

MOLT Fetch operates in distinct phases to move data from source databases to CockroachDB. For details on available modes, refer to [Fetch mode](#fetch-mode).

### Data export phase

MOLT Fetch connects to the source database and exports table data to intermediate storage. Data is written to [cloud storage](#bucket-path) (Amazon S3, Google Cloud Storage, Azure Blob Storage), a [local file server](#local-path), or [directly to CockroachDB memory](#direct-copy). Multiple tables and table shards can be exported simultaneously using [`--table-concurrency`](#global-flags) and [`--export-concurrency`](#global-flags), with large tables divided into shards for parallel processing. For details, refer to:

- [Fetch mode](#fetch-mode)
- [Table sharding](#table-sharding)

### Data import phase  

MOLT Fetch loads the exported data into the target CockroachDB database. The process uses [`IMPORT INTO`]({% link {{site.current_cloud_version}}/import-into.md %}) (faster, tables offline during import) or [`COPY FROM`]({% link {{site.current_cloud_version}}/copy.md %}) (slower, tables remain queryable) to move data. Data files are imported in configurable batches using [`--import-batch-size`](#global-flags), and target tables can be automatically created, truncated, or left unchanged based on [`--table-handling`](#global-flags) settings. For details, refer to:

- [Data movement](#data-load-mode)
- [Target table handling](#target-table-handling)

## Common workflows

### Bulk data load

To perform a bulk data load migration from your source database to CockroachDB, run the `molt fetch` command with the required flags.

Specify the source and target database connections. For connection string formats, refer to [Source and target databases](#source-and-target-databases):

{% include_cached copy-clipboard.html %}
~~~
--source $SOURCE
--target $TARGET
~~~

Specify how to move data to CockroachDB. Use [cloud storage](#bucket-path) for intermediate file storage:

{% include_cached copy-clipboard.html %}
~~~
--bucket-path 's3://bucket/path'
~~~

Alternatively, use a [local file server](#local-path) for intermediate storage:

{% include_cached copy-clipboard.html %}
~~~
--local-path /migration/data/cockroach
--local-path-listen-addr 'localhost:3000'
~~~

Alternatively, use [direct copy](#direct-copy) to move data directly without intermediate storage:

{% include_cached copy-clipboard.html %}
~~~
--direct-copy
~~~

Optionally, filter which schemas and tables to migrate. By default, all schemas and tables are migrated. For details, refer to [Schema and table selection](#schema-and-table-selection):

{% include_cached copy-clipboard.html %}
~~~
--schema-filter 'public'
--table-filter '.*user.*'
~~~

Specify how to handle target tables. By default, `--table-handling` is set to `none`, which loads data without changing existing data in the tables. For details, refer to [Target table handling](#target-table-handling):

{% include_cached copy-clipboard.html %}
~~~
--table-handling truncate-if-exists
~~~

When performing a bulk load without subsequent replication, use `--ignore-replication-check` to skip querying for replication checkpoints (such as `pg_current_wal_insert_lsn()` on PostgreSQL, `gtid_executed` on MySQL, and `CURRENT_SCN` on Oracle). This is appropriate when:

- Performing a one-time data migration with no plan to replicate ongoing changes.
- Exporting data from a read replica where replication checkpoints are unavailable.

{% include_cached copy-clipboard.html %}
~~~
--ignore-replication-check
~~~

At minimum, the `molt fetch` command should include the source, target, data path, and `--ignore-replication-check` flags:

{% include_cached copy-clipboard.html %}
~~~ shell
molt fetch \
--source $SOURCE \
--target $TARGET \
--bucket-path 's3://bucket/path' \
--ignore-replication-check
~~~

For detailed steps, refer to [Bulk load migration]({% link molt/migrate-bulk-load.md %}).

### Load before replication

To perform an initial data load before setting up ongoing replication with [MOLT Replicator]({% link molt/molt-replicator.md %}), run the `molt fetch` command without `--ignore-replication-check`. This captures replication checkpoints during the data load.

The workflow is the same as [Bulk data load](#bulk-data-load), except:

- Exclude `--ignore-replication-check`. MOLT Fetch will query and record replication checkpoints.
- After the data load completes, check the [CDC cursor](#cdc-cursor) in the output for the checkpoint value to use with MOLT Replicator.

At minimum, the `molt fetch` command should include the source, target, and data path flags:

{% include_cached copy-clipboard.html %}
~~~ shell
molt fetch \
--source $SOURCE \
--target $TARGET \
--bucket-path 's3://bucket/path'
~~~

The output will include a `cdc_cursor` value at the end of the fetch task:

~~~ json
{"level":"info","type":"summary","fetch_id":"735a4fe0-c478-4de7-a342-cfa9738783dc","num_tables":1,"tables":["public.employees"],"cdc_cursor":"b7f9e0fa-2753-1e1f-5d9b-2402ac810003:3-21","net_duration_ms":4879.890041,"net_duration":"000h 00m 04s","time":"2024-03-18T12:37:02-04:00","message":"fetch complete"}
~~~

Use this `cdc_cursor` value when starting MOLT Replicator to ensure replication begins from the correct position. For detailed steps, refer to [Load and replicate]({% link molt/migrate-load-replicate.md %}).

## See also

- X