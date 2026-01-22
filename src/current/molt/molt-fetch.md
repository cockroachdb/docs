---
title: MOLT Fetch
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

## Prerequisites

### Supported databases

The following source databases are supported:

- PostgreSQL 11-16
- MySQL 5.7, 8.0 and later
- Oracle Database 19c (Enterprise Edition) and 21c (Express Edition)

### Database configuration

Ensure that the source and target schemas are identical, unless you enable automatic schema creation with the [`drop-on-target-and-recreate`](#target-table-handling) option. If you are creating the target schema manually, review the behaviors in [Mismatch handling](#mismatch-handling).

{{site.data.alerts.callout_info}}
MOLT Fetch does not support migrating sequences. If your source database contains sequences, refer to the [guidance on indexing with sequential keys]({% link {{site.current_cloud_version}}/sql-faqs.md %}#how-do-i-generate-unique-slowly-increasing-sequential-numbers-in-cockroachdb). If a sequential key is necessary in your CockroachDB table, you must create it manually. After using MOLT Fetch to load the data onto the target, but before cutover, make sure to update each sequence's current value using [`setval()`]({% link {{site.current_cloud_version}}/functions-and-operators.md %}#sequence-functions) so that new inserts continue from the correct point.
{{site.data.alerts.end}}

If you plan to use cloud storage for the data migration, follow the steps in [Cloud storage security](#cloud-storage-security).

### User permissions

The SQL user running MOLT Fetch requires specific privileges on both the source and target databases:

|      Database      |                                                                                                                                                           Required Privileges                                                                                                                                                            |                                                           Details                                                            |
|--------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------|
| PostgreSQL source  | <ul><li>`CONNECT` on database.</li><li>`USAGE` on schema.</li><li>`SELECT` on tables to migrate.</li></ul>                                                                                                                                                                                                                               | [Create PostgreSQL migration user]({% link molt/migrate-bulk-load.md %}#create-migration-user-on-source-database)            |
| MySQL source       | <ul><li>`SELECT` on tables to migrate.</li></ul>                                                                                                                                                                                                                                                                                         | [Create MySQL migration user]({% link molt/migrate-bulk-load.md %}?filters=mysql#create-migration-user-on-source-database)   |
| Oracle source      | <ul><li>`CONNECT` and `CREATE SESSION`.</li><li>`SELECT` and `FLASHBACK` on tables to migrate.</li><li>`SELECT` on metadata views (`ALL_USERS`, `DBA_USERS`, `DBA_OBJECTS`, `DBA_SYNONYMS`, `DBA_TABLES`).</li></ul>                                                                                                                     | [Create Oracle migration user]({% link molt/migrate-bulk-load.md %}?filters=oracle#create-migration-user-on-source-database) |
| CockroachDB target | <ul><li>`ALL` on target database.</li><li>`CREATE` on schema.</li><li>`SELECT`, `INSERT`, `UPDATE`, `DELETE` on target tables.</li><li>For `IMPORT INTO`: `SELECT`, `INSERT`, `DROP` on target tables. Optionally `EXTERNALIOIMPLICITACCESS` for implicit cloud storage authentication.</li><li>For `COPY FROM`: `admin` role.</li></ul> | [Create CockroachDB user]({% link molt/migrate-bulk-load.md %}#create-the-sql-user)                                          |

## Installation

{% include molt/molt-install.md %}

### Docker usage

{% include molt/molt-docker.md %}

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

## Commands

| Command |                                               Usage                                               |
|---------|---------------------------------------------------------------------------------------------------|
| `fetch` | Start the fetch task. This loads data from a source database to a target CockroachDB database. |

### Subcommands

|   Command    |                                Usage                                 |
|--------------|----------------------------------------------------------------------|
| `tokens list` | List active [continuation tokens](#list-active-continuation-tokens). |

## Flags

### Global flags

|                         Flag                         |                                                                                                                                                                                                                                                                                Description                                                                                                                                                                                                                                                                                 |
|------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `--source`                                           | (Required) Connection string used to connect to the Oracle PDB (in a CDB/PDB architecture) or to a standalone database (non‑CDB). For details, refer to [Source and target databases](#source-and-target-databases).                                                                                                                                                                                                                                                                                                                                                       |
| `--source-cdb`                                       | Connection string for the Oracle container database (CDB) when using a multitenant (CDB/PDB) architecture. Omit this flag on a non‑multitenant Oracle database. For details, refer to [Source and target databases](#source-and-target-databases).                                                                                                                                                                                                                                                                                                                         |
| `--target`                                           | (Required) Connection string for the target database. For details, refer to [Source and target databases](#source-and-target-databases).                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `--allow-tls-mode-disable`                           | Allow insecure connections to databases. Secure SSL/TLS connections should be used by default. This should be enabled **only** if secure SSL/TLS connections to the source or target database are not possible.                                                                                                                                                                                                                                                                                                                                                            |
| `--assume-role`                                      | Service account to use for assume role authentication. `--use-implicit-auth` must be included. For example, `--assume-role='user-test@cluster-ephemeral.iam.gserviceaccount.com' --use-implicit-auth`. For details, refer to [Cloud Storage Authentication]({% link {{ site.current_cloud_version }}/cloud-storage-authentication.md %}).                                                                                                                                                                                                                                  |
| `--bucket-path`                                      | The path within the [cloud storage](#bucket-path) bucket where intermediate files are written (e.g., `'s3://bucket/path'` or `'gs://bucket/path'`). Only the URL path is used; query parameters (e.g., credentials) are ignored. To pass in query parameters, use the appropriate flags: `--assume-role`, `--import-region`, `--use-implicit-auth`.                                                                                                                                                                                                                        |
| `--case-sensitive`                                   | Toggle case sensitivity when comparing table and column names on the source and target. To disable case sensitivity, set `--case-sensitive=false`. If `=` is **not** included (e.g., `--case-sensitive false`), the flag is interpreted as `--case-sensitive` (i.e., `--case-sensitive=true`).<br><br>**Default:** `false`                                                                                                                                                                                                                                                 |
| `--cleanup`                                          | Whether to delete intermediate files after moving data using [cloud or local storage](#data-path). **Note:** Cleanup does not occur on [continuation](#fetch-continuation).                                                                                                                                                                                                                                                                                                                                                                                                |
| `--compression`                                      | Compression method for data when using [`IMPORT INTO`](#data-load-mode) (`gzip`/`none`).<br><br>**Default:** `gzip`                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `--continuation-file-name`                           | Restart fetch at the specified filename if the task encounters an error. `--fetch-id` must be specified. For details, see [Fetch continuation](#fetch-continuation).                                                                                                                                                                                                                                                                                                                                                                                                       |
| `--continuation-token`                               | Restart fetch at a specific table, using the specified continuation token, if the task encounters an error. `--fetch-id` must be specified. For details, see [Fetch continuation](#fetch-continuation).                                                                                                                                                                                                                                                                                                                                                                    |
| `--crdb-pts-duration`                                | The duration for which each timestamp used in data export from a CockroachDB source is protected from garbage collection. This ensures that the data snapshot remains consistent. For example, if set to `24h`, each timestamp is protected for 24 hours from the initiation of the export job. This duration is extended at regular intervals specified in `--crdb-pts-refresh-interval`.<br><br>**Default:** `24h0m0s`                                                                                                                                                   |
| `--crdb-pts-refresh-interval`                        | The frequency at which the protected timestamp's validity is extended. This interval maintains protection of the data snapshot until data export from a CockroachDB source is completed. For example, if set to `10m`, the protected timestamp's expiration will be extended by the duration specified in `--crdb-pts-duration` (e.g., `24h`) every 10 minutes while export is not complete. <br><br>**Default:** `10m0s`                                                                                                                                                  |
| `--direct-copy`                                      | Enables [direct copy](#direct-copy), which copies data directly from source to target without using an intermediate store.                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `--export-concurrency`                               | Number of shards to export at a time per table, each on a dedicated thread. This controls how many shards are created for each individual table during the [data export phase](#data-export-phase) and is distinct from `--table-concurrency`, which controls how many tables are processed simultaneously. The total number of concurrent threads is the product of `--export-concurrency` and `--table-concurrency`. Tables can be sharded with a range-based or stats-based mechanism. For details, refer to [Table sharding](#table-sharding).<br><br>**Default:** `4` |
| `--export-retry-max-attempts`                        | Maximum number of retry attempts for source export queries when connection failures occur. Only supported for PostgreSQL and CockroachDB sources.<br><br>**Default:** `3`                                                                                                                                                                                                                                                                                                                                                                                                  |
| `--export-retry-max-duration`                        | Maximum total duration for retrying source export queries. If `0`, no time limit is enforced. Only supported for PostgreSQL and CockroachDB sources.<br><br>**Default:** `5m0s`                                                                                                                                                                                                                                                                                                                                                                                            |
| `--filter-path`                                      | Path to a JSON file defining row-level filters for the [data import phase](#data-import-phase). Refer to [Selective data movement](#selective-data-movement).                                                                                                                                                                                                                                                                                                                                                                                                              |
| `--fetch-id`                                         | Restart fetch task corresponding to the specified ID. If `--continuation-file-name` or `--continuation-token` are not specified, fetch restarts for all failed tables.                                                                                                                                                                                                                                                                                                                                                                                                     |
| `--flush-rows`                                       | Number of rows before the source data is flushed to intermediate files. **Note:** If `--flush-size` is also specified, the fetch behavior is based on the flag whose criterion is met first.                                                                                                                                                                                                                                                                                                                                                                               |
| `--flush-size`                                       | Size (in bytes) before the source data is flushed to intermediate files. **Note:** If `--flush-rows` is also specified, the fetch behavior is based on the flag whose criterion is met first.                                                                                                                                                                                                                                                                                                                                                                              |
| `--ignore-replication-check`                         | Skip querying for replication checkpoints such as `pg_current_wal_insert_lsn()` on PostgreSQL, `gtid_executed` on MySQL, and `CURRENT_SCN` on Oracle. This option is intended for use during bulk load migrations or when doing a one-time data export from a read replica.                                                                                                                                                                                                                                                                                                |
| `--import-batch-size`                                | The number of files to be imported at a time to the target database during the [data import phase](#data-import-phase). This applies only when using [`IMPORT INTO`](#data-load-mode) for data movement. **Note:** Increasing this value can improve the performance of full-scan queries on the target database shortly after fetch completes, but very high values are not recommended. If any individual file in the import batch fails, you must [retry](#fetch-continuation) the entire batch.<br><br>**Default:** `1000`                                             |
| `--import-region`                                    | The region of the [cloud storage](#bucket-path) bucket. This applies only to [Amazon S3 buckets](#bucket-path). Set this flag only if you need to specify an `AWS_REGION` explicitly when using [`IMPORT INTO`](#data-load-mode) for data movement. For example, `--import-region=ap-south-1`.                                                                                                                                                                                                                                                                             |
| `--local-path`                                       | The path within the [local file server](#local-path) where intermediate files are written (e.g., `data/migration/cockroach`). `--local-path-listen-addr` must be specified.                                                                                                                                                                                                                                                                                                                                                                                                |
| `--local-path-crdb-access-addr`                      | Address of a [local file server](#local-path) that is **publicly accessible**. This flag is only necessary if CockroachDB cannot reach the local address specified with `--local-path-listen-addr` (e.g., when moving data to a CockroachDB {{ site.data.products.cloud }} deployment). `--local-path` and `--local-path-listen-addr` must be specified.<br><br>**Default:** Value of `--local-path-listen-addr`.                                                                                                                                                          |
| `--local-path-listen-addr`                           | Write intermediate files to a [local file server](#local-path) at the specified address (e.g., `'localhost:3000'`). `--local-path` must be specified.                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `--log-file`                                         | Write messages to the specified log filename. If no filename is provided, messages write to `fetch-{datetime}.log`. If `"stdout"` is provided, messages write to `stdout`.                                                                                                                                                                                                                                                                                                                                                                                                 |
| `--logging`                                          | Level at which to log messages (`trace`/`debug`/`info`/`warn`/`error`/`fatal`/`panic`).<br><br>**Default:** `info`                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `--metrics-listen-addr`                              | Address of the Prometheus metrics endpoint, which has the path `{address}/metrics`. For details on important metrics to monitor, refer to [Monitoring](#monitoring).<br><br>**Default:** `'127.0.0.1:3030'`                                                                                                                                                                                                                                                                                                                                                                |
| `--mode`                                             | Configure the MOLT Fetch behavior: `data-load`, `export-only`, or `import-only`. For details, refer to [Fetch mode](#fetch-mode).<br><br>**Default:** `data-load`                                                                                                                                                                                                                                                                                                                                                                                                          |
| `--non-interactive`                                  | Run the fetch task without interactive prompts. This is recommended **only** when running `molt fetch` in an automated process (i.e., a job or continuous integration).                                                                                                                                                                                                                                                                                                                                                                                                    |
| `--pglogical-replication-slot-name`                  | Name of a PostgreSQL replication slot that will be created before taking a snapshot of data. Must match the slot name specified with `--slotName` in the [MOLT Replicator command]({% link molt/molt-replicator.md %}#replication-checkpoints). For details, refer to [Load before replication](#load-before-replication).                                                                                                                                                                                                                                                 |
| `--pglogical-publication-and-slot-drop-and-recreate` | Drop the PostgreSQL publication and replication slot if they exist, then recreate them. Creates a publication named `molt_fetch` and the replication slot specified with `--pglogical-replication-slot-name`. For details, refer to [Load before replication](#load-before-replication).<br><br>**Default:** `false`                                                                                                                                                                                                                                                       |
| `--pprof-listen-addr`                                | Address of the pprof endpoint.<br><br>**Default:** `'127.0.0.1:3031'`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `--row-batch-size`                                   | Number of rows per shard to export at a time. For details on sharding, refer to [Table sharding](#table-sharding). See also [Best practices](#best-practices).<br><br>**Default:** `100000`                                                                                                                                                                                                                                                                                                                                                                                |
| `--schema-filter`                                    | Move schemas that match a specified [regular expression](https://wikipedia.org/wiki/Regular_expression). Not used with MySQL sources. For Oracle sources, this filter is case-insensitive.<br><br>**Default:** `'.*'`                                                                                                                                                                                                                                                                                                                                                      |
| `--skip-pk-check`                                    | Skip primary-key matching to allow data load when source or target tables have missing or mismatched primary keys. Disables sharding and bypasses `--export-concurrency` and `--row-batch-size` settings. Refer to [Skip primary key matching](#skip-primary-key-matching).<br><br>**Default:** `false`                                                                                                                                                                                                                                                                    |
| `--table-concurrency`                                | Number of tables to export at a time. The number of concurrent threads is the product of `--export-concurrency` and `--table-concurrency`.<br><br>**Default:** `4`                                                                                                                                                                                                                                                                                                                                                                                                         |
| `--table-exclusion-filter`                           | Exclude tables that match a specified [POSIX regular expression](https://wikipedia.org/wiki/Regular_expression).<br><br>This value **cannot** be set to `'.*'`, which would cause every table to be excluded. <br><br>**Default:** Empty string                                                                                                                                                                                                                                                                                                                            |
| `--table-filter`                                     | Move tables that match a specified [POSIX regular expression](https://wikipedia.org/wiki/Regular_expression).<br><br>**Default:** `'.*'`                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `--table-handling`                                   | How tables are initialized on the target database (`none`/`drop-on-target-and-recreate`/`truncate-if-exists`). For details, see [Target table handling](#target-table-handling).<br><br>**Default:** `none`                                                                                                                                                                                                                                                                                                                                                                |
| `--transformations-file`                             | Path to a JSON file that defines transformations to be performed on the target schema during the fetch task. Refer to [Transformations](#transformations).                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `--type-map-file`                                    | Path to a JSON file that contains explicit type mappings for automatic schema creation, when enabled with `--table-handling drop-on-target-and-recreate`. For details on the JSON format and valid type mappings, see [type mapping](#type-mapping).                                                                                                                                                                                                                                                                                                                       |
| `--use-console-writer`                               | Use the console writer, which has cleaner log output but introduces more latency.<br><br>**Default:** `false` (log as structured JSON)                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `--use-copy`                                         | Use [`COPY FROM`](#data-load-mode) to move data. This makes tables queryable during data load, but is slower than using `IMPORT INTO`. For details, refer to [Data load mode](#data-load-mode).                                                                                                                                                                                                                                                                                                                                                                            |
| `--use-implicit-auth`                                | Use [implicit authentication]({% link {{ site.current_cloud_version }}/cloud-storage-authentication.md %}) for [cloud storage](#bucket-path) URIs.                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `--use-stats-based-sharding`                         | Enable statistics-based sharding for PostgreSQL sources. This allows sharding of tables with primary keys of any data type and can create more evenly distributed shards compared to the default numerical range sharding. Requires PostgreSQL 11+ and access to `pg_stats`. For details, refer to [Table sharding](#table-sharding).                                                                                                                                                                                                                                      |


### `tokens list` flags

|          Flag         |                                                                 Description                                                                 |
|-----------------------|---------------------------------------------------------------------------------------------------------------------------------------------|
| `--conn-string`       | (Required) Connection string for the target database. For details, see [List active continuation tokens](#list-active-continuation-tokens). |
| `-n`, `--num-results` | Number of results to return.                                                                                                                |


## Usage

The following sections describe how to use the `molt fetch` [flags](#flags).

### Source and target databases

{{site.data.alerts.callout_success}}
Follow the recommendations in [Connection security](#connection-security).
{{site.data.alerts.end}}

`--source` specifies the connection string of the source database.

PostgreSQL or CockroachDB connection string:

{% include_cached copy-clipboard.html %}
~~~
--source 'postgresql://{username}:{password}@{host}:{port}/{database}'
~~~

MySQL connection string:

{% include_cached copy-clipboard.html %}
~~~
--source 'mysql://{username}:{password}@{protocol}({host}:{port})/{database}'
~~~

Oracle connection string:

{% include_cached copy-clipboard.html %}
~~~
--source 'oracle://{username}:{password}@{host}:{port}/{service_name}'
~~~

For Oracle Multitenant databases, `--source-cdb` specifies the container database (CDB) connection. `--source` specifies the pluggable database (PDB):

{% include_cached copy-clipboard.html %}
~~~
--source 'oracle://{username}:{password}@{host}:{port}/{pdb_service_name}'
--source-cdb 'oracle://{username}:{password}@{host}:{port}/{cdb_service_name}'
~~~

`--target` specifies the [CockroachDB connection string]({% link {{site.current_cloud_version}}/connection-parameters.md %}#connect-using-a-url):

{% include_cached copy-clipboard.html %}
~~~
--target 'postgresql://{username}:{password}@{host}:{port}/{database}'
~~~

### Fetch mode

`--mode` specifies the MOLT Fetch behavior.

`data-load` (default) instructs MOLT Fetch to load the source data into CockroachDB:

{% include_cached copy-clipboard.html %}
~~~
--mode data-load
~~~

`export-only` instructs MOLT Fetch to export the source data to the specified [cloud storage](#bucket-path) or [local file server](#local-path). It does not load the data into CockroachDB:

{% include_cached copy-clipboard.html %}
~~~
--mode export-only
~~~

`import-only` instructs MOLT Fetch to load the source data in the specified [cloud storage](#bucket-path) or [local file server](#local-path) into the CockroachDB target:

{% include_cached copy-clipboard.html %}
~~~
--mode import-only
~~~

### Data load mode

MOLT Fetch can use either [`IMPORT INTO`]({% link {{site.current_cloud_version}}/import-into.md %}) or [`COPY FROM`]({% link {{site.current_cloud_version}}/copy.md %}) to load data into CockroachDB.

By default, MOLT Fetch uses `IMPORT INTO`:

- `IMPORT INTO` achieves the highest throughput, but [requires taking the CockroachDB tables **offline**]({% link {{site.current_cloud_version}}/import-into.md %}#considerations) to achieve its import speed. Tables are taken back online once an [import job]({% link {{site.current_cloud_version}}/import-into.md %}#view-and-control-import-jobs) completes successfully. See [Best practices](#best-practices).
- `IMPORT INTO` supports compression using the `--compression` flag, which reduces the amount of storage used.

`--use-copy` configures MOLT Fetch to use `COPY FROM`:

- `COPY FROM` enables your tables to remain online and accessible. However, it is slower than using [`IMPORT INTO`]({% link {{site.current_cloud_version}}/import-into.md %}).
- `COPY FROM` does not support compression.

{{site.data.alerts.callout_info}}
`COPY FROM` is also used for [direct copy](#direct-copy).
{{site.data.alerts.end}}

### Table sharding

During the [data export phase](#data-export-phase), MOLT Fetch can divide large tables into multiple shards for concurrent export.

To control the number of shards created per table, use the `--export-concurrency` flag. For example:

{% include_cached copy-clipboard.html %}
~~~
--export-concurrency=4
~~~

{{site.data.alerts.callout_success}}
For performance considerations with concurrency settings, refer to [Best practices](#best-practices).
{{site.data.alerts.end}}

Two sharding mechanisms are available:

- **Range-based sharding (default):** Tables are divided based on numerical ranges found in primary key values. Only tables with [`INT`]({% link {{ site.current_cloud_version }}/int.md %}), [`FLOAT`]({% link {{ site.current_cloud_version }}/float.md %}), or [`UUID`]({% link {{ site.current_cloud_version }}/uuid.md %}) primary keys can use range-based sharding. Tables with other primary key data types export as a single shard.

- **Stats-based sharding (PostgreSQL only):** Enable with [`--use-stats-based-sharding`](#global-flags) for PostgreSQL 11+ sources. Tables are divided by analyzing the [`pg_stats`](https://www.postgresql.org/docs/current/view-pg-stats.htm) view to create more evenly distributed shards, up to a maximum of 200 shards. Primary keys of any data type are supported.

Stats-based sharding requires that the user has `SELECT` permissions on source tables and on each table's `pg_stats` view. The latter permission is automatically granted to users that can read the table.

To optimize stats-based sharding, run [`ANALYZE`](https://www.postgresql.org/docs/current/sql-analyze.html) on source tables before migration to ensure that table statistics are up-to-date and shards are evenly distributed. This requires `MAINTAIN` or `OWNER` permissions on the table. You can analyze specific primary key columns or the entire table. For example:

{% include_cached copy-clipboard.html %}
~~~ sql
ANALYZE table_name(PK1, PK2, PK3);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
ANALYZE table_name;
~~~

Large tables may take time to analyze, but `ANALYZE` can run in the background. You can run `ANALYZE` with `MAINTAIN` or `OWNER` privileges during migration preparation, then perform the actual migration with standard `SELECT` privileges. 

{{site.data.alerts.callout_info}}
Migration without running `ANALYZE` will still work, but shard distribution may be less even.
{{site.data.alerts.end}}

When using `--use-stats-based-sharding`, monitor the log output for each table you want to migrate.

If stats-based sharding is successful on a table, MOLT logs the following `INFO` message:

~~~
Stats based sharding enabled for table {table_name}
~~~

If stats-based sharding fails on a table, MOLT logs the following `WARNING` message and defaults to range-based sharding:

~~~
Warning: failed to shard table {table_name} using stats based sharding: {reason_for_failure}, falling back to non stats based sharding
~~~

The number of shards is dependent on the number of distinct values in the first primary key column of the table to be migrated. If this is different from the number of shards requested with `--export-concurrency`, MOLT logs the following `WARNING` and continues with the migration:

~~~
number of shards formed: {num_shards_formed} is not equal to number of shards requested: {num_shards_requested} for table {table_name}
~~~

Because stats-based sharding analyzes the entire table, running `--use-stats-based-sharding` with [`--filter-path`](#global-flags) (refer to [Selective data movement](#selective-data-movement)) will cause imbalanced shards to form.

### Data path

MOLT Fetch can move the source data to CockroachDB via [cloud storage](#bucket-path), a [local file server](#local-path), or [directly](#direct-copy) without an intermediate store.

#### Bucket path

{{site.data.alerts.callout_success}}
Only the path specified in `--bucket-path` is used. Query parameters, such as credentials, are ignored. To authenticate cloud storage, follow the steps in [Secure cloud storage](#cloud-storage-security).
{{site.data.alerts.end}}

`--bucket-path` instructs MOLT Fetch to write intermediate files to a path within [Google Cloud Storage](https://cloud.google.com/storage/docs/buckets), [Amazon S3](https://aws.amazon.com/s3/), or [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) to which you have the necessary permissions. Use additional [flags](#global-flags), shown in the following examples, to specify authentication or region parameters as required for bucket access.

Connect to a Google Cloud Storage bucket with [implicit authentication]({% link {{ site.current_cloud_version }}/cloud-storage-authentication.md %}#google-cloud-storage-implicit) and [assume role]({% link {{ site.current_cloud_version }}/cloud-storage-authentication.md %}#set-up-google-cloud-storage-assume-role):

{% include_cached copy-clipboard.html %}
~~~
--bucket-path 'gs://migration/data/cockroach'
--assume-role 'user-test@cluster-ephemeral.iam.gserviceaccount.com'
--use-implicit-auth
~~~

Connect to an Amazon S3 bucket and explicitly specify the `ap_south-1` region: 

{% include_cached copy-clipboard.html %}
~~~
--bucket-path 's3://migration/data/cockroach'
--import-region 'ap-south-1'
~~~

{{site.data.alerts.callout_info}}
When `--import-region` is set, `IMPORT INTO` must be used for [data movement](#data-load-mode).
{{site.data.alerts.end}}

Connect to an Azure Blob Storage container with [implicit authentication]({% link {{ site.current_cloud_version }}/cloud-storage-authentication.md %}?filters=azure#azure-blob-storage-implicit-authentication):

{% include_cached copy-clipboard.html %}
~~~
--bucket-path 'azure-blob://migration/data/cockroach'
--use-implicit-auth
~~~

#### Local path

`--local-path` instructs MOLT Fetch to write intermediate files to a path within a [local file server]({% link {{site.current_cloud_version}}/use-a-local-file-server.md %}). `local-path-listen-addr` specifies the address of the local file server. For example:

{% include_cached copy-clipboard.html %}
~~~
--local-path /migration/data/cockroach
--local-path-listen-addr 'localhost:3000'
~~~

In some cases, CockroachDB will not be able to use the local address specified by `--local-path-listen-addr`. This will depend on where CockroachDB is deployed, the runtime OS, and the source dialect.

For example, if you are migrating to CockroachDB {{ site.data.products.cloud }}, such that the {{ site.data.products.cloud }} cluster is in a different physical location than the machine running `molt fetch`, then CockroachDB cannot reach an address such as `localhost:3000`. In these situations, use `--local-path-crdb-access-addr` to specify an address for the local file server that is **publicly accessible**. For example:

{% include_cached copy-clipboard.html %}
~~~
--local-path /migration/data/cockroach
--local-path-listen-addr 'localhost:3000'
--local-path-crdb-access-addr '44.55.66.77:3000'
~~~

{{site.data.alerts.callout_success}}
[Cloud storage](#bucket-path) is often preferable to a local file server, which can require considerable disk space.
{{site.data.alerts.end}}

#### Direct copy

`--direct-copy` specifies that MOLT Fetch should use `COPY FROM` to move the source data directly to CockroachDB without an intermediate store:

- Because the data is held in memory, the machine must have sufficient RAM for the data currently in flight: 

	~~~
	average size of each row * --row-batch-size * --export-concurrency * --table-concurrency
	~~~

- Direct copy does not support compression or [continuation](#fetch-continuation).
- The [`--use-copy`](#data-load-mode) flag is redundant with `--direct-copy`.

### Schema and table selection

By default, MOLT Fetch moves all data from the [`--source`](#source-and-target-databases) database to CockroachDB. Use the following flags to move a subset of data.

`--schema-filter` specifies a range of schema objects to move to CockroachDB, formatted as a POSIX regex string. For example, to move every table in the source database's `migration_schema` schema:

{% include_cached copy-clipboard.html %}
~~~
--schema-filter 'migration_schema'
~~~

{{site.data.alerts.callout_info}}
`--schema-filter` does not apply to MySQL sources because MySQL tables belong directly to the database specified in the connection string, not to a separate schema.
{{site.data.alerts.end}}

`--table-filter` and `--table-exclusion-filter` specify tables to include and exclude from the migration, respectively, formatted as POSIX regex strings. For example, to move every source table that has "user" in the table name and exclude every source table that has "temp" in the table name:

{% include_cached copy-clipboard.html %}
~~~
--table-filter '.*user.*' --table-exclusion-filter '.*temp.*'
~~~

### Selective data movement

Use `--filter-path` to specify the path to a JSON file that defines row-level filtering for data load. This enables you to move a subset of data in a table, rather than all data in the table. To apply row-level filters during replication, use [MOLT Replicator]({% link molt/molt-replicator.md %}) with userscripts.

{% include_cached copy-clipboard.html %}
~~~
--filter-path 'data-filter.json'
~~~

The JSON file should contain one or more entries in `filters`, each with a `resource_specifier` (`schema` and `table`) and a SQL expression `expr`. For example, the following example exports only rows from `migration_schema.t1` where `v > 100`:

~~~ json
{
  "filters": [
    {
      "resource_specifier": {
        "schema": "migration_schema",
        "table": "t1"
      },
      "expr": "v > 100"
    }
  ]
}
~~~

`expr` is case-sensitive and must be valid in your source dialect. For example, when using Oracle as the source, quote all identifiers and escape embedded quotes:

~~~ json
{
  "filters": [
    {
      "resource_specifier": {
        "schema": "C##FETCHORACLEFILTERTEST",
        "table": "FILTERTBL"
      },
      "expr": "ABS(\"X\") > 10 AND CEIL(\"X\") < 100 AND FLOOR(\"X\") > 0 AND ROUND(\"X\", 2) < 100.00 AND TRUNC(\"X\", 0) > 0 AND MOD(\"X\", 2) = 0 AND FLOOR(\"X\" / 3) > 1"
    }
  ]
}
~~~

{{site.data.alerts.callout_info}}
If the expression references columns that are not indexed, MOLT Fetch will emit a warning like: `filter expression ‘v > 100' contains column ‘v' which is not indexed. This may lead to performance issues.`
{{site.data.alerts.end}}

{% comment %}
#### `--filter-path` userscript for replication

To use `--filter-path` with replication, create and save a TypeScript userscript (e.g., `filter-script.ts`). The following script ensures that only rows where `v > 100` are replicated to `defaultdb.migration_schema.t1`:

{% include_cached copy-clipboard.html %}
~~~ ts
import * as api from "replicator@v1";
function disp(doc, meta) {
    if (Number(doc.v) > 100) {
        return { "defaultdb.migration_schema.t1" : [ doc ] };
    }
}
// Always put target schema.
api.configureSource("defaultdb.migration_schema", {
    deletesTo: disp,
    dispatch: disp,
});
~~~

Apply the userscript with the `--userscript` replication flag:

{% include_cached copy-clipboard.html %}
~~~ 
--userscript 'filter-script.ts'
~~~
{% endcomment %}

### Target table handling

`--table-handling` defines how MOLT Fetch loads data on the CockroachDB tables that [match the selection](#schema-and-table-selection).

To load the data without changing the existing data in the tables, use `none`:

{% include_cached copy-clipboard.html %}
~~~
--table-handling none
~~~

To [truncate]({% link {{site.current_cloud_version}}/truncate.md %}) tables before loading the data, use `truncate-if-exists`:

{% include_cached copy-clipboard.html %}
~~~
--table-handling truncate-if-exists
~~~

To drop existing tables and create new tables before loading the data, use `drop-on-target-and-recreate`:

{% include_cached copy-clipboard.html %}
~~~
--table-handling drop-on-target-and-recreate
~~~

When using the `drop-on-target-and-recreate` option, MOLT Fetch creates a new CockroachDB table to load the source data if one does not already exist. To guide the automatic schema creation, you can [explicitly map source types to CockroachDB types](#type-mapping). `drop-on-target-and-recreate` does **not** create indexes or constraints other than [`PRIMARY KEY`]({% link {{site.current_cloud_version}}/primary-key.md %}) and [`NOT NULL`]({% link {{site.current_cloud_version}}/not-null.md %}).

#### Mismatch handling

If either [`none`](#target-table-handling) or [`truncate-if-exists`](#target-table-handling) is set, `molt fetch` loads data into the existing tables on the target CockroachDB database. If the target schema mismatches the source schema, `molt fetch` will exit early in certain cases, and will need to be re-run from the beginning. For details, refer to [Fetch exits early due to mismatches](#fetch-exits-early-due-to-mismatches).

{{site.data.alerts.callout_info}}
This does not apply when [`drop-on-target-and-recreate`](#target-table-handling) is specified, since this option automatically creates a compatible CockroachDB schema.
{{site.data.alerts.end}}

#### Skip primary key matching

`--skip-pk-check` removes the [requirement that source and target tables share matching primary keys](#fetch-exits-early-due-to-mismatches) for data load. When this flag is set:

- The data load proceeds even if the source or target table lacks a primary key, or if their primary key columns do not match.
- [Table sharding](#table-sharding) is disabled. Each table is exported in a single batch within one shard, bypassing `--export-concurrency` and `--row-batch-size`. As a result, memory usage and execution time may increase due to full table scans.
- If the source table contains duplicate rows but the target has [`PRIMARY KEY`]({% link {{ site.current_cloud_version }}/primary-key.md %}) or [`UNIQUE`]({% link {{ site.current_cloud_version }}/unique.md %}) constraints, duplicate rows are deduplicated during import.

When `--skip-pk-check` is set, all tables are treated as if they lack a primary key, and are thus exported in a single unsharded batch. To avoid performance issues, use this flag with `--table-filter` to target only tables **without** a primary key.

For example:

{% include_cached copy-clipboard.html %}
~~~ shell
molt fetch \
  --mode data-load \
  --table-filter 'nopktbl' \
  --skip-pk-check
~~~

Example log output when `--skip-pk-check` is enabled:

~~~json
{"level":"info","message":"sharding is skipped for table public.nopktbl - flag skip-pk-check is specified and thus no PK for source table is specified"}
~~~

#### Type mapping

If [`drop-on-target-and-recreate`](#target-table-handling) is set, MOLT Fetch automatically creates a CockroachDB schema that is compatible with the source data. The column types are determined as follows:

- PostgreSQL types are mapped to existing CockroachDB [types]({% link {{site.current_cloud_version}}/data-types.md %}) that have the same [`OID`]({% link {{site.current_cloud_version}}/oid.md %}).
- The following MySQL types are mapped to corresponding CockroachDB types:

	|                      MySQL type                     |                                      CockroachDB type                                     |                            Notes                             |
	|-----------------------------------------------------|-------------------------------------------------------------------------------------------|--------------------------------------------------------------|
	| `CHAR`, `CHARACTER`, `VARCHAR`, `NCHAR`, `NVARCHAR` | [`VARCHAR`]({% link {{site.current_cloud_version}}/string.md %})                          | Varying-length string; raises warning if BYTE semantics used |
	| `TINYTEXT`, `TEXT`, `MEDIUMTEXT`, `LONGTEXT`        | [`STRING`]({% link {{site.current_cloud_version}}/string.md %})                           | Unlimited-length string                                      |
	| `GEOMETRY`                                          | [`GEOMETRY`]({% link {{site.current_cloud_version}}/architecture/glossary.md %}#geometry) | Spatial type (PostGIS-style)                                 |
	| `LINESTRING`                                        | [`LINESTRING`]({% link {{site.current_cloud_version}}/linestring.md %})                   | Spatial type (PostGIS-style)                                 |
	| `POINT`                                             | [`POINT`]({% link {{site.current_cloud_version}}/point.md %})                             | Spatial type (PostGIS-style)                                 |
	| `POLYGON`                                           | [`POLYGON`]({% link {{site.current_cloud_version}}/polygon.md %})                         | Spatial type (PostGIS-style)                                 |
	| `MULTIPOINT`                                        | [`MULTIPOINT`]({% link {{site.current_cloud_version}}/multipoint.md %})                   | Spatial type (PostGIS-style)                                 |
	| `MULTILINESTRING`                                   | [`MULTILINESTRING`]({% link {{site.current_cloud_version}}/multilinestring.md %})         | Spatial type (PostGIS-style)                                 |
	| `MULTIPOLYGON`                                      | [`MULTIPOLYGON`]({% link {{site.current_cloud_version}}/multipolygon.md %})               | Spatial type (PostGIS-style)                                 |
	| `GEOMETRYCOLLECTION`, `GEOMCOLLECTION`              | [`GEOMETRYCOLLECTION`]({% link {{site.current_cloud_version}}/geometrycollection.md %})   | Spatial type (PostGIS-style)                                 |
	| `JSON`                                              | [`JSONB`]({% link {{site.current_cloud_version}}/jsonb.md %})                             | CRDB's native JSON format                                    |
	| `TINYINT`, `INT1`                                   | [`INT2`]({% link {{site.current_cloud_version}}/int.md %})                                | 2-byte integer                                               |
	| `BLOB`                                              | [`BYTES`]({% link {{site.current_cloud_version}}/bytes.md %})                             | Binary data                                                  |
	| `SMALLINT`, `INT2`                                  | [`INT2`]({% link {{site.current_cloud_version}}/int.md %})                                | 2-byte integer                                               |
	| `MEDIUMINT`, `INT`, `INTEGER`, `INT4`               | [`INT4`]({% link {{site.current_cloud_version}}/int.md %})                                | 4-byte integer                                               |
	| `BIGINT`, `INT8`                                    | [`INT`]({% link {{site.current_cloud_version}}/int.md %})                                 | 8-byte integer                                               |
	| `FLOAT`                                             | [`FLOAT4`]({% link {{site.current_cloud_version}}/float.md %})                            | 32-bit float                                                 |
	| `DOUBLE`                                            | [`FLOAT`]({% link {{site.current_cloud_version}}/float.md %})                             | 64-bit float                                                 |
	| `DECIMAL`, `NUMERIC`, `REAL`                        | [`DECIMAL`]({% link {{site.current_cloud_version}}/decimal.md %})                         | Validates scale ≤ precision; warns if precision > 19         |
	| `BINARY`, `VARBINARY`                               | [`BYTES`]({% link {{site.current_cloud_version}}/bytes.md %})                             | Binary data                                                  |
	| `DATETIME`                                          | [`TIMESTAMP`]({% link {{site.current_cloud_version}}/timestamp.md %})                     | Date and time (no time zone)                                 |
	| `TIMESTAMP`                                         | [`TIMESTAMPTZ`]({% link {{site.current_cloud_version}}/timestamp.md %})                   | Date and time with time zone                                 |
	| `TIME`                                              | [`TIME`]({% link {{site.current_cloud_version}}/time.md %})                               | Time of day (no date)                                        |
	| `BIT`                                               | [`VARBIT`]({% link {{site.current_cloud_version}}/bit.md %})                              | Variable-length bit array                                    |
	| `DATE`                                              | [`DATE`]({% link {{site.current_cloud_version}}/date.md %})                               | Date only (no time)                                          |
	| `TINYBLOB`, `MEDIUMBLOB`, `LONGBLOB`                | [`BYTES`]({% link {{site.current_cloud_version}}/bytes.md %})                             | Binary data                                                  |
	| `BOOL`, `BOOLEAN`                                   | [`BOOL`]({% link {{site.current_cloud_version}}/bool.md %})                               | Boolean                                                      |

- The following Oracle types are mapped to CockroachDB types:

    |             Oracle type(s)            |                                                                 CockroachDB type                                                                 |                                  Notes                                  |
    |---------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------|
    | `NCHAR`, `CHAR`, `CHARACTER`          | [`CHAR`]({% link {{site.current_cloud_version}}/string.md %})(n) or [`CHAR`]({% link {{site.current_cloud_version}}/string.md %})                | Fixed-length character; falls back to unbounded if length not specified |
    | `VARCHAR`, `VARCHAR2`, `NVARCHAR2`    | [`VARCHAR`]({% link {{site.current_cloud_version}}/string.md %})(n) or [`VARCHAR`]({% link {{site.current_cloud_version}}/string.md %})          | Varying-length string; raises warning if BYTE semantics used            |
    | `STRING`                              | [`STRING`]({% link {{site.current_cloud_version}}/string.md %})                                                                                  | Unlimited-length string                                                 |
    | `SMALLINT`                            | [`INT2`]({% link {{site.current_cloud_version}}/int.md %})                                                                                       | 2-byte integer                                                          |
    | `INTEGER`, `INT`, `SIMPLE_INTEGER`    | [`INT4`]({% link {{site.current_cloud_version}}/int.md %})                                                                                       | 4-byte integer                                                          |
    | `LONG`                                | [`INT8`]({% link {{site.current_cloud_version}}/int.md %})                                                                                       | 8-byte integer                                                          |
    | `FLOAT`, `BINARY_FLOAT`, `REAL`       | [`FLOAT4`]({% link {{site.current_cloud_version}}/float.md %})                                                                                   | 32-bit float                                                            |
    | `DOUBLE`, `BINARY_DOUBLE`             | [`FLOAT8`]({% link {{site.current_cloud_version}}/float.md %})                                                                                   | 64-bit float                                                            |
    | `DEC`, `NUMBER`, `DECIMAL`, `NUMERIC` | [`DECIMAL`]({% link {{site.current_cloud_version}}/decimal.md %})(p, s) or [`DECIMAL`]({% link {{site.current_cloud_version}}/decimal.md %})     | Validates scale ≤ precision; warns if precision > 19                    |
    | `DATE`                                | [`DATE`]({% link {{site.current_cloud_version}}/date.md %})                                                                                      | Date only (no time)                                                     |
    | `BLOB`, `RAW`, `LONG RAW`             | [`BYTES`]({% link {{site.current_cloud_version}}/bytes.md %})                                                                                    | Binary data                                                             |
    | `JSON`                                | [`JSONB`]({% link {{site.current_cloud_version}}/jsonb.md %})                                                                                    | CRDB's native JSON format                                               |
    | `CLOB`, `NCLOB`                       | [`STRING`]({% link {{site.current_cloud_version}}/string.md %})                                                                                  | Treated as large text                                                   |
    | `BOOLEAN`                             | [`BOOL`]({% link {{site.current_cloud_version}}/bool.md %})                                                                                      | Boolean                                                                 |
    | `TIMESTAMP`                           | [`TIMESTAMP`]({% link {{site.current_cloud_version}}/timestamp.md %}) or [`TIMESTAMPTZ`]({% link {{site.current_cloud_version}}/timestamp.md %}) | If `WITH TIME ZONE` → `TIMESTAMPTZ`, else `TIMESTAMP`                   |
    | `ROWID`, `UROWID`                     | [`STRING`]({% link {{site.current_cloud_version}}/string.md %})                                                                                  | Treated as opaque identifier                                            |
    | `SDO_GEOMETRY`                        | [`GEOMETRY`]({% link {{site.current_cloud_version}}/architecture/glossary.md %}#geometry)                                                        | Spatial type (PostGIS-style)                                            |
    | `XMLTYPE`                             | [`STRING`]({% link {{site.current_cloud_version}}/string.md %})                                                                                  | Stored as text                                                          |

- To override the default mappings for automatic schema creation, you can map source to target CockroachDB types explicitly. These are defined in the JSON file indicated by the `--type-map-file` flag. The allowable custom mappings are valid CockroachDB aliases, casts, and the following mappings specific to MOLT Fetch and [Verify]({% link molt/molt-verify.md %}):

	- [`TIMESTAMP`]({% link {{site.current_cloud_version}}/timestamp.md %}) <> [`TIMESTAMPTZ`]({% link {{site.current_cloud_version}}/timestamp.md %})
	- [`VARCHAR`]({% link {{site.current_cloud_version}}/string.md %}) <> [`UUID`]({% link {{site.current_cloud_version}}/uuid.md %})
	- [`BOOL`]({% link {{site.current_cloud_version}}/bool.md %}) <> [`INT2`]({% link {{site.current_cloud_version}}/int.md %})
	- [`VARBIT`]({% link {{site.current_cloud_version}}/bit.md %}) <> [`TEXT`]({% link {{site.current_cloud_version}}/string.md %})
	- [`VARBIT`]({% link {{site.current_cloud_version}}/bit.md %}) <> [`BOOL`]({% link {{site.current_cloud_version}}/bool.md %})
	- [`JSONB`]({% link {{site.current_cloud_version}}/jsonb.md %}) <> [`TEXT`]({% link {{site.current_cloud_version}}/string.md %})
	- [`INET`]({% link {{site.current_cloud_version}}/inet.md %}) <> [`TEXT`]({% link {{site.current_cloud_version}}/string.md %})

`--type-map-file` specifies the path to the JSON file containing the explicit type mappings. For example:

{% include_cached copy-clipboard.html %}
~~~
--type-map-file 'type-mappings.json'
~~~

The following JSON example defines two type mappings:

~~~ json
 [
  {
    "table": "public.t1",
    "column_type_map": [
      {
        "column": "*",
        "source_type": "int",
        "crdb_type": "INT2"
      },
      {
        "column": "name",
        "source_type": "varbit",
        "crdb_type": "string"
      }
    ]
  }
]
~~~

- `table` specifies the table that will use the custom type mappings in `column_type_map`. The value is written as `{schema}.{table}`.
- `column` specifies the column that will use the custom type mapping. If `*` is specified, then all columns in the `table` with the matching `source_type` are converted.
- `source_type` specifies the source type to be mapped.
- `crdb_type` specifies the target CockroachDB [type]({% link {{ site.current_cloud_version }}/data-types.md %}) to be mapped.

### Transformations

You can define transformation rules to be performed on the target database during the fetch task. These can be used to:

- Map [computed columns]({% link {{ site.current_cloud_version }}/computed-columns.md %}) from source to target.
- Map [partitioned tables]({% link {{ site.current_cloud_version }}/partitioning.md %}) to a single target table.
- Rename tables on the target database.
- Rename database schemas.

Transformation rules are defined in the JSON file indicated by the `--transformations-file` flag. For example:

{% include_cached copy-clipboard.html %}
~~~
--transformations-file 'transformation-rules.json'
~~~

#### Transformation rules example

The following JSON example defines three transformation rules: rule `1` [maps computed columns](#column-exclusions-and-computed-columns), rule `2` [renames tables](#table-renaming), and rule `3` [renames schemas](#schema-renaming).

~~~ json
{
  "transforms": [
    {
      "id": 1,
      "resource_specifier": {
        "schema": ".*",
        "table": ".*"
      },
      "column_exclusion_opts": {
        "add_computed_def": true,
        "column": "^age$"
      }
    },
    {
      "id": 2,
      "resource_specifier": {
        "schema": "public",
        "table": "charges_part.*"
      },
      "table_rename_opts": {
        "value": "charges"
      }
    },
    {
      "id": 3,
      "resource_specifier": {
        "schema": "previous_schema"
      },
      "schema_rename_opts": {
        "value": "new_schema"
      }
    }
  ]
}
~~~

#### Column exclusions and computed columns

- `resource_specifier`: Identifies which schemas and tables to transform.
	- `schema`: POSIX regex matching source schemas.
	- `table`: POSIX regex matching source tables.
- `column_exclusion_opts`: Exclude columns or map them as computed columns.
	- `column`: POSIX regex matching source columns to exclude.
	- `add_computed_def`: When `true`, map matching columns as [computed columns]({% link {{ site.current_cloud_version }}/computed-columns.md %}) on target tables using [`ALTER TABLE ... ADD COLUMN`]({% link {{ site.current_cloud_version }}/alter-table.md %}#add-column) and the source column definition. All matching columns must be computed columns on the source.
		{{site.data.alerts.callout_danger}}
		Columns matching `column` are **not** moved to CockroachDB if `add_computed_def` is `false` (default) or if matching columns are not computed columns.
		{{site.data.alerts.end}}

[Example rule `1`](#transformation-rules-example) maps all source `age` columns to [computed columns]({% link {{ site.current_cloud_version }}/computed-columns.md %}) on CockroachDB. This assumes that all matching `age` columns are defined as computed columns on the source:

~~~ json
{
  "id": 1,
  "resource_specifier": {
    "schema": ".*",
    "table": ".*"
  },
  "column_exclusion_opts": {
    "add_computed_def": true,
    "column": "^age$"
  }
},
~~~

#### Table renaming

- `resource_specifier`: Identifies which schemas and tables to transform.
	- `schema`: POSIX regex matching source schemas.
	- `table`: POSIX regex matching source tables.
- `table_rename_opts`: Rename tables on the target.
	- `value`: Target table name. For a single matching source table, renames it to this value. For multiple matches (n-to-1), consolidates matching [partitioned tables]({% link {{ site.current_cloud_version }}/partitioning.md %}) with the same table definition into a single table with this name.

		For n-to-1 mappings:

		- Use [`--use-copy`](#data-load-mode) or [`--direct-copy`](#direct-copy) for data movement.
		- Manually create the target table. Do not use [`--table-handling drop-on-target-and-recreate`](#target-table-handling).

[Example rule `2`](#transformation-rules-example) maps all table names with prefix `charges_part` to a single `charges` table on CockroachDB (an n-to-1 mapping). This assumes that all matching `charges_part.*` tables have the same table definition:

~~~ json
{
  "id": 2,
  "resource_specifier": {
    "schema": "public",
    "table": "charges_part.*"
  },
  "table_rename_opts": {
    "value": "charges"
  }
},
~~~

#### Schema renaming

- `resource_specifier`: Identifies which schemas and tables to transform.
	- `schema`: POSIX regex matching source schemas.
	- `table`: POSIX regex matching source tables.
- `schema_rename_opts`: Rename database schemas on the target.
	- `value`: Target schema name. For example, `previous_schema.table1` becomes `new_schema.table1`.

[Example rule `3`](#transformation-rules-example) renames the database schema `previous_schema` to `new_schema` on CockroachDB:

~~~ json
{
  "id": 3,
  "resource_specifier": {
    "schema": "previous_schema"
  },
  "schema_rename_opts": {
    "value": "new_schema"
  }
}
~~~

#### General notes

Each rule is applied in the order it is defined. If two rules overlap, the later rule will override the earlier rule.

To verify that the logging shows that the computed columns are being created:

When running `molt fetch`, set `--logging debug` and look for `ALTER TABLE ... ADD COLUMN` statements with the `STORED` or `VIRTUAL` keywords in the log output:

~~~ json
{"level":"debug","time":"2024-07-22T12:01:51-04:00","message":"running: ALTER TABLE IF EXISTS public.computed ADD COLUMN computed_col INT8 NOT NULL AS ((col1 + col2)) STORED"}
~~~

After running `molt fetch`, issue a `SHOW CREATE TABLE` statement on CockroachDB:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW CREATE TABLE computed;
~~~

~~~
  table_name |                         create_statement
-------------+-------------------------------------------------------------------
  computed   | CREATE TABLE public.computed (
  ...
             |     computed_col INT8 NOT NULL AS (col1 + col2) STORED
             | )
~~~

### Fetch continuation

If MOLT Fetch fails while loading data into CockroachDB from intermediate files, it exits with an error message, fetch ID, and [continuation token](#list-active-continuation-tokens) for each table that failed to load on the target database. You can use this information to continue the task from the *continuation point* where it was interrupted.

Continuation is only possible under the following conditions:

- All data has been exported from the source database into intermediate files on [cloud](#bucket-path) or [local storage](#local-path).
- The *initial load* of source data into the target CockroachDB database is incomplete.

{{site.data.alerts.callout_info}}
Only one fetch ID and set of continuation tokens, each token corresponding to a table, are active at any time. See [List active continuation tokens](#list-active-continuation-tokens).
{{site.data.alerts.end}}

To retry all data starting from the continuation point, reissue the `molt fetch` command and include the `--fetch-id`.

{% include_cached copy-clipboard.html %}
~~~
--fetch-id d44762e5-6f70-43f8-8e15-58b4de10a007
~~~

To retry a specific table that failed, include both `--fetch-id` and `--continuation-token`. The latter flag specifies a token string that corresponds to a specific table on the source database. A continuation token is written in the `molt fetch` output for each failed table. If the fetch task encounters a subsequent error, it generates a new token for each failed table. See [List active continuation tokens](#list-active-continuation-tokens).

{{site.data.alerts.callout_info}}
This will retry only the table that corresponds to the continuation token. If the fetch task succeeds, there may still be source data that is not yet loaded into CockroachDB.
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~
--fetch-id d44762e5-6f70-43f8-8e15-58b4de10a007
--continuation-token 011762e5-6f70-43f8-8e15-58b4de10a007
~~~

To retry all data starting from a specific file, include both `--fetch-id` and `--continuation-file-name`. The latter flag specifies the filename of an intermediate file in [cloud or local storage](#data-path). All filenames are prepended with `part_` and have the `.csv.gz` or `.csv` extension, depending on compression type (gzip by default). For example: 

{% include_cached copy-clipboard.html %}
~~~
--fetch-id d44762e5-6f70-43f8-8e15-58b4de10a007
--continuation-file-name part_00000003.csv.gz
~~~

{{site.data.alerts.callout_info}}
Continuation is not possible when using [direct copy](#direct-copy).
{{site.data.alerts.end}}

#### List active continuation tokens

To view all active continuation tokens, issue a `molt fetch tokens list` command along with `--conn-string`, which specifies the [connection string]({% link {{site.current_cloud_version}}/connection-parameters.md %}#connect-using-a-url) for the target CockroachDB database. For example:

{% include_cached copy-clipboard.html %}
~~~ shell
molt fetch tokens list \
--conn-string 'postgres://root@localhost:26257/defaultdb?sslmode=verify-full'
~~~

~~~
+--------------------------------------+--------------------------------------+------------------+----------------------+
|                  ID                  |               FETCH ID               |    TABLE NAME    |      FILE NAME       |
+--------------------------------------+--------------------------------------+------------------+----------------------+
| f6f0284c-d9c1-43c9-8fde-af609d0dbd82 | 66443597-5689-4df3-a7b9-9fc5e27180eb | public.employees | part_00000001.csv.gz |
+--------------------------------------+--------------------------------------+------------------+----------------------+
Continuation Tokens.
~~~

### CDC cursor

A change data capture (CDC) cursor is written to the output as `cdc_cursor` at the beginning and end of the fetch task.

For MySQL:

~~~ json
{"level":"info","type":"summary","fetch_id":"735a4fe0-c478-4de7-a342-cfa9738783dc","num_tables":1,"tables":["public.employees"],"cdc_cursor":"b7f9e0fa-2753-1e1f-5d9b-2402ac810003:3-21","net_duration_ms":4879.890041,"net_duration":"000h 00m 04s","time":"2024-03-18T12:37:02-04:00","message":"fetch complete"}
~~~

For Oracle:

~~~ json
{"level":"info","type":"summary","fetch_id":"735a4fe0-c478-4de7-a342-cfa9738783dc","num_tables":3,"tables":["migration_schema.employees"],"cdc_cursor":"backfillFromSCN=26685444,scn=26685786","net_duration_ms":6752.847625,"net_duration":"000h 00m 06s","time":"2024-03-18T12:37:02-04:00","message":"fetch complete"}
~~~

Use the `cdc_cursor` value as the checkpoint for MySQL or Oracle replication with [MOLT Replicator]({% link molt/molt-replicator.md %}#replication-checkpoints).

You can also use the `cdc_cursor` value with an external change data capture (CDC) tool to continuously replicate subsequent changes from the source database to CockroachDB.

## Security

Cockroach Labs strongly recommends the following security practices.

### Connection security

{% include molt/molt-secure-connection-strings.md %}

{{site.data.alerts.callout_info}}
By default, insecure connections (i.e., `sslmode=disable` on PostgreSQL; `sslmode` not set on MySQL) are disallowed. When using an insecure connection, `molt fetch` returns an error. To override this check, you can enable the `--allow-tls-mode-disable` flag. Do this **only** when testing, or if a secure SSL/TLS connection to the source or target database is not possible.
{{site.data.alerts.end}}

### Cloud storage security

{% include molt/fetch-secure-cloud-storage.md %}

## Common workflows

### Bulk data load

<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="postgres">PostgreSQL</button>
    <button class="filter-button" data-scope="mysql">MySQL</button>
    <button class="filter-button" data-scope="oracle">Oracle</button>
</div>

To perform a bulk data load migration from your source database to CockroachDB, run the `molt fetch` command with the required flags.

Specify the source and target database connections. For connection string formats, refer to [Source and target databases](#source-and-target-databases).

<section class="filter-content" markdown="1" data-scope="postgres mysql">
{% include_cached copy-clipboard.html %}
~~~
--source $SOURCE
--target $TARGET
~~~
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
For Oracle Multitenant (CDB/PDB) sources, also include `--source-cdb` to specify the container database (CDB) connection string.

{% include_cached copy-clipboard.html %}
~~~
--source $SOURCE
--source-cdb $SOURCE_CDB
--target $TARGET
~~~
</section>

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

Optionally, filter the source data to migrate. By default, all schemas and tables are migrated. For details, refer to [Schema and table selection](#schema-and-table-selection).

<section class="filter-content" markdown="1" data-scope="postgres">
{% include_cached copy-clipboard.html %}
~~~
--schema-filter 'migration_schema'
--table-filter '.*user.*'
~~~
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
For Oracle sources, `--schema-filter` is case-insensitive. You can use either lowercase or uppercase:

{% include_cached copy-clipboard.html %}
~~~
--schema-filter 'migration_schema'
--table-filter '.*user.*'
~~~
</section>

<section class="filter-content" markdown="1" data-scope="mysql">
For MySQL sources, omit `--schema-filter` because MySQL tables belong directly to the database specified in the connection string, not to a separate schema. If needed, use `--table-filter` to select specific tables:

{% include_cached copy-clipboard.html %}
~~~
--table-filter '.*user.*'
~~~
</section>

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

<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="postgres">PostgreSQL</button>
    <button class="filter-button" data-scope="mysql">MySQL</button>
    <button class="filter-button" data-scope="oracle">Oracle</button>
</div>

To perform an initial data load before setting up ongoing replication with [MOLT Replicator]({% link molt/molt-replicator.md %}), run the `molt fetch` command without `--ignore-replication-check`. This captures replication checkpoints during the data load.

The workflow is the same as [Bulk data load](#bulk-data-load), except:

- Exclude `--ignore-replication-check`. MOLT Fetch will query and record replication checkpoints.
<section class="filter-content" markdown="1" data-scope="postgres">
- You must include `--pglogical-replication-slot-name` and `--pglogical-publication-and-slot-drop-and-recreate` to automatically create the publication and replication slot during the data load.
</section>
- After the data load completes, check the [CDC cursor](#cdc-cursor) in the output for the checkpoint value to use with MOLT Replicator.

At minimum, the `molt fetch` command should include the source, target, and data path flags:

<section class="filter-content" markdown="1" data-scope="postgres">
{% include_cached copy-clipboard.html %}
~~~ shell
molt fetch \
--source $SOURCE \
--target $TARGET \
--bucket-path 's3://bucket/path' \
--pglogical-replication-slot-name molt_slot \
--pglogical-publication-and-slot-drop-and-recreate
~~~
</section>

<section class="filter-content" markdown="1" data-scope="mysql">
{% include_cached copy-clipboard.html %}
~~~ shell
molt fetch \
--source $SOURCE \
--target $TARGET \
--bucket-path 's3://bucket/path'
~~~
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
{% include_cached copy-clipboard.html %}
~~~ shell
molt fetch \
--source $SOURCE \
--source-cdb $SOURCE_CDB \
--target $TARGET \
--bucket-path 's3://bucket/path'
~~~
</section>

The output will include a `cdc_cursor` value at the end of the fetch task:

~~~ json
{"level":"info","type":"summary","fetch_id":"735a4fe0-c478-4de7-a342-cfa9738783dc","num_tables":1,"tables":["public.employees"],"cdc_cursor":"b7f9e0fa-2753-1e1f-5d9b-2402ac810003:3-21","net_duration_ms":4879.890041,"net_duration":"000h 00m 04s","time":"2024-03-18T12:37:02-04:00","message":"fetch complete"}
~~~

<section class="filter-content" markdown="1" data-scope="mysql oracle">
Use this `cdc_cursor` value when starting MOLT Replicator to ensure replication begins from the correct position. For detailed steps, refer to [Load and replicate]({% link molt/migrate-load-replicate.md %}).
</section>

## Monitoring

### Metrics

By default, MOLT Fetch exports [Prometheus](https://prometheus.io/) metrics at `127.0.0.1:3030/metrics`. You can configure this endpoint with the `--metrics-listen-addr` [flag](#global-flags).

Cockroach Labs recommends monitoring the following metrics:

|              Metric Name              |                                                         Description                                                         |
|---------------------------------------|-----------------------------------------------------------------------------------------------------------------------------|
| `molt_fetch_num_tables`               | Number of tables that will be moved from the source.                                                                        |
| `molt_fetch_num_task_errors`          | Number of errors encountered by the fetch task.                                                                             |
| `molt_fetch_overall_duration`         | Duration (in seconds) of the fetch task.                                                                                    |
| `molt_fetch_rows_exported`            | Number of rows that have been exported from a table. For example:<br>`molt_fetch_rows_exported{table="public.users"}`       |
| `molt_fetch_rows_imported`            | Number of rows that have been imported from a table. For example:<br>`molt_fetch_rows_imported{table="public.users"}`       |
| `molt_fetch_table_export_duration_ms` | Duration (in milliseconds) of a table's export. For example:<br>`molt_fetch_table_export_duration_ms{table="public.users"}` |
| `molt_fetch_table_import_duration_ms` | Duration (in milliseconds) of a table's import. For example:<br>`molt_fetch_table_import_duration_ms{table="public.users"}` |

To visualize the preceding metrics, use the Grafana dashboard [bundled with your binary]({% link molt/molt-fetch.md %}#installation) (`grafana_dashboard.json`). The bundled dashboard matches your binary version. Alternatively, you can download the [latest dashboard](https://molt.cockroachdb.com/molt/cli/grafana_dashboard.json).

## Best practices

### Test and validate

To verify that your connections and configuration work properly, run MOLT Fetch in a staging environment before migrating any data in production. Use a test or development environment that closely resembles production.

### Configure the source database and connection

- To prevent connections from terminating prematurely during the [data export phase](#data-export-phase), set the following to high values on the source database:

	- **Maximum allowed number of connections.** MOLT Fetch can export data across multiple connections. The number of connections it will create is the number of shards ([`--export-concurrency`](#global-flags)) multiplied by the number of tables ([`--table-concurrency`](#global-flags)) being exported concurrently.

		{{site.data.alerts.callout_info}}
		With the default numerical range sharding, only tables with [primary key]({% link {{ site.current_cloud_version }}/primary-key.md %}) types of [`INT`]({% link {{ site.current_cloud_version }}/int.md %}), [`FLOAT`]({% link {{ site.current_cloud_version }}/float.md %}), or [`UUID`]({% link {{ site.current_cloud_version }}/uuid.md %}) can be sharded. PostgreSQL users can enable [`--use-stats-based-sharding`](#global-flags) to use statistics-based sharding for tables with primary keys of any data type. For details, refer to [Table sharding](#table-sharding).
		{{site.data.alerts.end}}

	- **Maximum lifetime of a connection.**

- If a PostgreSQL database is set as a [source](#source-and-target-databases), ensure that [`idle_in_transaction_session_timeout`](https://www.postgresql.org/docs/current/runtime-config-client.html#GUC-IDLE-IN-TRANSACTION-SESSION-TIMEOUT) on PostgreSQL is either disabled or set to a value longer than the duration of the [data export phase](#data-export-phase). Otherwise, the connection will be prematurely terminated. To estimate the time needed to export the PostgreSQL tables, you can perform a dry run and sum the value of [`molt_fetch_table_export_duration_ms`](#monitoring) for all exported tables.

### Optimize performance

- {% include molt/molt-drop-constraints-indexes.md %}

- For PostgreSQL sources using [`--use-stats-based-sharding`](#global-flags), run [`ANALYZE`]({% link {{ site.current_cloud_version }}/create-statistics.md %}) on source tables before migration to ensure optimal shard distribution. This is especially important for large tables where even distribution can significantly improve export performance.

- To prevent memory outages during `READ COMMITTED` [data export](#data-export-phase) of tables with large rows, estimate the amount of memory used to export a table:

	~~~
	--row-batch-size * --export-concurrency * average size of the table rows
	~~~

	If you are exporting more than one table at a time (i.e., [`--table-concurrency`](#global-flags) is set higher than `1`), add the estimated memory usage for the tables with the largest row sizes. Ensure that you have sufficient memory to run `molt fetch`, and adjust `--row-batch-size` accordingly. For details on how concurrency and sharding interact, refer to [Table sharding](#table-sharding).

- If a table in the source database is much larger than the other tables, [filter and export the largest table](#schema-and-table-selection) in its own `molt fetch` task. Repeat this for each of the largest tables. Then export the remaining tables in another task.

- Ensure that the machine running MOLT Fetch is large enough to handle the amount of data being migrated. Fetch performance can sometimes be limited by available resources, but should always be making progress. To identify possible resource constraints, observe the `molt_fetch_rows_exported` [metric](#monitoring) for decreases in the number of rows being processed. You can use the [sample Grafana dashboard](https://molt.cockroachdb.com/molt/cli/grafana_dashboard.json) to view metrics. For details on optimizing export performance through sharding, refer to [Table sharding](#table-sharding).

### Import and continuation handling

- When using [`IMPORT INTO`](#data-load-mode) during the [data import phase](#data-import-phase) to load tables into CockroachDB, if the fetch task terminates before the import job completes, the hanging import job on the target database will keep the table offline. To make this table accessible again, [manually resume or cancel the job]({% link {{site.current_cloud_version}}/import-into.md %}#view-and-control-import-jobs). Then resume `molt fetch` using [continuation](#fetch-continuation), or restart the task from the beginning.

## Troubleshooting

<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="postgres">PostgreSQL</button>
    <button class="filter-button" data-scope="mysql">MySQL</button>
    <button class="filter-button" data-scope="oracle">Oracle</button>
</div>

{% include molt/molt-troubleshooting-fetch.md %}

## See also

- [Migration Overview]({% link molt/migration-overview.md %})
- [Migration Strategy]({% link molt/migration-strategy.md %})
- [MOLT Replicator]({% link molt/molt-replicator.md %})
- [MOLT Verify]({% link molt/molt-verify.md %})
- [Load and replicate]({% link molt/migrate-load-replicate.md %})
- [Resume Replication]({% link molt/migrate-resume-replication.md %})
- [Migration Failback]({% link molt/migrate-failback.md %})