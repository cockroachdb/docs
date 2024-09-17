---
title: MOLT Fetch
summary: Learn how to use the MOLT Fetch tool to move data from a source database to CockroachDB.
toc: true
docs_area: migrate
---

MOLT Fetch moves data from a source database into CockroachDB as part of a [database migration]({% link {{site.current_cloud_version}}/migration-overview.md %}).

MOLT Fetch uses [`IMPORT INTO`]({% link {{site.current_cloud_version}}/import-into.md %}) or [`COPY FROM`]({% link {{site.current_cloud_version}}/copy-from.md %}) to move the source data to cloud storage (Google Cloud Storage or Amazon S3), a local file server, or local memory. Once the data is exported, MOLT Fetch can load the data into a target CockroachDB database and replicate changes from the source database. For details, see [Usage](#usage).

## Supported databases

The following source databases are currently supported:

- [PostgreSQL]({% link {{site.current_cloud_version}}/migrate-from-postgres.md %})
- [MySQL]({% link {{site.current_cloud_version}}/migrate-from-mysql.md %})
- CockroachDB

## Installation

To install MOLT Fetch, download the binary that matches your system. To download the latest binary:

{% include molt/molt-install.md %}

## Setup

Complete the following items before using MOLT Fetch:

- Follow the recommendations in [Best practices](#best-practices) and [Security recommendations](#security-recommendations).

- Ensure that the source and target schemas are identical, unless you enable automatic schema creation with the [`drop-on-target-and-recreate`](#target-table-handling) option. If you are creating the target schema manually, review the behaviors in [Mismatch handling](#mismatch-handling).

- Ensure that the SQL user running MOLT Fetch has [`SELECT` privileges]({% link {{site.current_cloud_version}}/grant.md %}#supported-privileges) on the source and target CockroachDB databases, along with the required privileges to run [`IMPORT INTO`]({% link {{site.current_cloud_version}}/import-into.md %}#required-privileges) or [`COPY FROM`]({% link {{site.current_cloud_version}}/copy-from.md %}#required-privileges) (depending on the command used for [data movement](#data-movement)) on CockroachDB, as described on their respective pages.

- <a id="replication-setup"></a> If you plan to use continuous replication, using either the MOLT Fetch [replication feature](#load-data-and-replicate-changes) or an [external change data capture (CDC) tool](#cdc-cursor):

	- For PostgreSQL sources, enable logical replication. In `postgresql.conf` or in the SQL shell, set [`wal_level`](https://www.postgresql.org/docs/current/runtime-config-wal.html) to `logical`.

	- For MySQL sources, enable [GTID](https://dev.mysql.com/doc/refman/8.0/en/replication-options-gtids.html) consistency. In `mysql.cnf`, in the SQL shell, or as flags in the `mysql` start command, set `gtid-mode` and `enforce-gtid-consistency` to `ON` and set `binlog_row_metadata` to `full`.

- Percent-encode the connection strings for the source database and [CockroachDB]({% link {{site.current_cloud_version}}/connect-to-the-database.md %}). This ensures that the MOLT tools can parse special characters in your password.

	- Given a password `a$52&`, pass it to the `molt escape-password` command with single quotes:

		{% include_cached copy-clipboard.html %}
		~~~ shell
		molt escape-password 'a$52&'
		~~~

		~~~
		Substitute the following encoded password in your original connection url string:
		a%2452%26
		~~~

	- Use the encoded password in your connection string. For example:

		~~~
		postgres://postgres:a%2452%26@localhost:5432/replicationload
		~~~

- If you plan to use cloud storage for the data migration, follow the steps in [Secure cloud storage](#secure-cloud-storage).

## Best practices

- To prevent connections from terminating prematurely during data export, set the following to high values on the source database:

	- **Maximum allowed number of connections:** MOLT Fetch can export data across multiple connections. The number of connections it will create is the number of shards ([`--export-concurrency`](#global-flags)) multiplied by the number of tables ([`--table-concurrency`](#global-flags)) being exported concurrently.
	- **Maximum lifetime of a connection:** This is particularly important for MySQL sources, which can only use a single connection to move data. See the following note.

- If a MySQL database is set as a [source](#source-and-target-databases), the [`--table-concurrency`](#global-flags) and [`--export-concurrency`](#global-flags) flags **cannot** be set above `1`. If these values are changed, MOLT Fetch returns an error. This guarantees consistency when moving data from MySQL, due to MySQL limitations. MySQL data is migrated to CockroachDB one table and shard at a time, using [`WITH CONSISTENT SNAPSHOT`](https://dev.mysql.com/doc/refman/8.0/en/commit.html) transactions.

- To prevent memory outages during data export of tables with large rows, estimate the amount of memory used to export a table: 

	~~~
	--row-batch-size * --export-concurrency * average size of the table rows
	~~~

	If you are exporting more than one table at a time (i.e., [`--table-concurrency`](#global-flags) is set higher than `1`), add the estimated memory usage for the tables with the largest row sizes. Ensure that you have sufficient memory to run `molt fetch`, and adjust `--row-batch-size` accordingly.

- If a table in the source database is much larger than the other tables, [filter and export the largest table](#schema-and-table-selection) in its own `molt fetch` task. Repeat this for each of the largest tables. Then export the remaining tables in another task.

- When using [`IMPORT INTO`](#data-movement) to load tables into CockroachDB, if the fetch task terminates before the import job completes, the hanging import job on the target database will keep the table offline. To make this table accessible again, [manually resume or cancel the job]({% link {{site.current_cloud_version}}/import-into.md %}#view-and-control-import-jobs). Then resume `molt fetch` using [continuation](#fetch-continuation), or restart the task from the beginning.

## Security recommendations

Cockroach Labs **strongly** recommends the following:

### Secure connections

- Use secure connections to the source and [target CockroachDB database]({% link {{site.current_cloud_version}}/connection-parameters.md %}#additional-connection-parameters) whenever possible.
- By default, insecure connections (i.e., `sslmode=disable` on PostgreSQL; `sslmode` not set on MySQL) are disallowed. When using an insecure connection, `molt fetch` returns an error. To override this check, you can enable the `--allow-tls-mode-disable` flag. Do this **only** for testing, or if a secure SSL/TLS connection to the source or target database is not possible.

### Connection strings

- Avoid plaintext connection strings.
- Provide your connection strings as environment variables. 
- If possible within your security infrastructure, use an external secrets manager to load the environment variables from stored secrets.

	For example, to export connection strings as environment variables:

	~~~ shell
	export SOURCE="postgres://postgres:postgres@localhost:5432/molt?sslmode=verify-full"
	export TARGET="postgres://root@localhost:26257/molt?sslmode=verify-full"
	~~~

	Afterward, to pass the environment variables in `molt fetch` commands:

	~~~ shell
	molt fetch \
	--source $SOURCE \
	--target $TARGET \
	--table-filter 'employees' \
	--bucket-path 's3://molt-test' \
	--table-handling truncate-if-exists
	~~~

### Secure cloud storage

- When using [cloud storage](#cloud-storage) for your intermediate store, ensure that access control is properly configured. 

	- If you are using [Amazon S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-iam.html) for [cloud storage](#cloud-storage):

		- Ensure that the environment variable and access tokens are set appropriately in the terminal running `molt fetch`. For example:

			{% include_cached copy-clipboard.html %}
			~~~ shell
			export AWS_REGION='us-east-1'
			export AWS_SECRET_ACCESS_KEY='key'
			export AWS_ACCESS_KEY_ID='id'
			~~~

		- Alternatively, set the `--use-implicit-auth` flag to use [implicit authentication]({% link {{ site.current_cloud_version }}/cloud-storage-authentication.md %}).

		- Ensure the S3 bucket is created and accessible by CockroachDB.

	- If you are using [Google Cloud Storage](https://cloud.google.com/storage/docs/access-control) for [cloud storage](#cloud-storage):

		- Ensure that your local environment is authenticated using [Application Default Credentials](https://cloud.google.com/docs/authentication/application-default-credentials):

			Using `gcloud`:

			{% include_cached copy-clipboard.html %}
			~~~ shell
			gcloud init
			gcloud auth application-default login
			~~~

			Using the environment variable:

			{% include_cached copy-clipboard.html %}
			~~~ shell
			export GOOGLE_APPLICATION_CREDENTIALS={path_to_cred_json}
			~~~

		- Alternatively, set the `--use-implicit-auth` flag to use [implicit authentication]({% link {{ site.current_cloud_version }}/cloud-storage-authentication.md %}).

		- Ensure the Google Cloud Storage bucket is created and accessible by CockroachDB.

- Do not use public cloud storage in production.

### Perform a dry run

To verify that your connections and configuration work properly, run MOLT Fetch in a staging environment before moving any data in production. Use a test or development environment that is as similar as possible to production.

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

|                      Flag                     |                                                                                                                                                                                                                                          Description                                                                                                                                                                                                                                          |
|-----------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `--source`                                    | (Required) Connection string for the source database. For details, see [Source and target databases](#source-and-target-databases).                                                                                                                                                                                                                                                                                                                                                           |
| `--target`                                    | (Required) Connection string for the target database. For details, see [Source and target databases](#source-and-target-databases).                                                                                                                                                                                                                                                                                                                                                           |
| `--allow-tls-mode-disable`                    | Allow insecure connections to databases. Secure SSL/TLS connections should be used by default. This should be enabled **only** if secure SSL/TLS connections to the source or target database are not possible.                                                                                                                                                                                                                                                                               |
| `--bucket-path`                               | The path within the [cloud storage](#cloud-storage) bucket where intermediate files are written (e.g., `'s3://bucket/path'` or `'gs://bucket/path'`). Only the path is used; query parameters (e.g., credentials) are ignored.                                                                                                                                                                                                                                                                |
| `--cleanup`                                   | Whether to delete intermediate files after moving data using [cloud or local storage](#data-path). **Note:** Cleanup does not occur on [continuation](#fetch-continuation).                                                                                                                                                                                                                                                                                                                   |
| `--compression`                               | Compression method for data when using [`IMPORT INTO`](#data-movement) (`gzip`/`none`).<br><br>**Default:** `gzip`                                                                                                                                                                                                                                                                                                                                                                            |
| `--continuation-file-name`                    | Restart fetch at the specified filename if the task encounters an error. `--fetch-id` must be specified. For details, see [Fetch continuation](#fetch-continuation).                                                                                                                                                                                                                                                                                                                          |
| `--continuation-token`                        | Restart fetch at a specific table, using the specified continuation token, if the task encounters an error. `--fetch-id` must be specified. For details, see [Fetch continuation](#fetch-continuation).                                                                                                                                                                                                                                                                                       |
| `--crdb-pts-duration`                         | The duration for which each timestamp used in data export from a CockroachDB source is protected from garbage collection. This ensures that the data snapshot remains consistent. For example, if set to `24h`, each timestamp is protected for 24 hours from the initiation of the export job. This duration is extended at regular intervals specified in `--crdb-pts-refresh-interval`.<br><br>**Default:** `24h0m0s`                                                                      |
| `--crdb-pts-refresh-interval`                 | The frequency at which the protected timestamp's validity is extended. This interval maintains protection of the data snapshot until data export from a CockroachDB source is completed. For example, if set to `10m`, the protected timestamp's expiration will be extended by the duration specified in `--crdb-pts-duration` (e.g., `24h`) every 10 minutes while export is not complete. <br><br>**Default:** `10m0s`                                                                     |
| `--direct-copy`                               | Enables [direct copy](#direct-copy), which copies data directly from source to target without using an intermediate store.                                                                                                                                                                                                                                                                                                                                                                    |
| `--export-concurrency`                        | Number of shards to export at a time, each on a dedicated thread. This only applies when exporting data from the source database, not when loading data into the target database. The number of concurrent threads is the product of `--export-concurrency` and `--table-concurrency`.<br><br>This value **cannot** be set higher than `1` when moving data from MySQL. Refer to [Best practices](#best-practices).<br><br>**Default:** `4` with a PostgreSQL source; `1` with a MySQL source |
| `--fetch-id`                                  | Restart fetch task corresponding to the specified ID. If `--continuation-file-name` or `--continuation-token` are not specified, fetch restarts for all failed tables.                                                                                                                                                                                                                                                                                                                        |
| `--flush-rows`                                | Number of rows before the source data is flushed to intermediate files. **Note:** If `--flush-size` is also specified, the fetch behavior is based on the flag whose criterion is met first.                                                                                                                                                                                                                                                                                                  |
| `--flush-size`                                | Size (in bytes) before the source data is flushed to intermediate files. **Note:** If `--flush-rows` is also specified, the fetch behavior is based on the flag whose criterion is met first.                                                                                                                                                                                                                                                                                                 |
| `--import-batch-size`                         | The number of files to be imported at a time to the target database. This applies only when using [`IMPORT INTO`](#data-movement) to load data into the target. **Note:** Increasing this value can improve the performance of full-scan queries on the target database shortly after fetch completes, but very high values are not recommended. If any individual file in the import batch fails, you must [retry](#fetch-continuation) the entire batch.<br><br>**Default:** `1000`         |
| `--local-path`                                | The path within the [local file server](#local-file-server) where intermediate files are written (e.g., `data/migration/cockroach`). `--local-path-listen-addr` must be specified.                                                                                                                                                                                                                                                                                                            |
| `--local-path-crdb-access-addr`               | Address of a [local file server](#local-file-server) that is **publicly accessible**. This flag is only necessary if CockroachDB cannot reach the local address specified with `--local-path-listen-addr` (e.g., when moving data to a CockroachDB {{ site.data.products.cloud }} deployment). `--local-path` and `--local-path-listen-addr` must be specified.<br><br>**Default:** Value of `--local-path-listen-addr`.                                                                      |
| `--local-path-listen-addr`                    | Write intermediate files to a [local file server](#local-file-server) at the specified address (e.g., `'localhost:3000'`). `--local-path` must be specified.                                                                                                                                                                                                                                                                                                                                  |
| `--log-file`                                  | Write messages to the specified log filename. If no filename is provided, messages write to `fetch-{datetime}.log`. If `"stdout"` is provided, messages write to `stdout`.                                                                                                                                                                                                                                                                                                                    |
| `--logging`                                   | Level at which to log messages (`trace`/`debug`/`info`/`warn`/`error`/`fatal`/`panic`).<br><br>**Default:** `info`                                                                                                                                                                                                                                                                                                                                                                            |
| `--metrics-listen-addr`                       | Address of the Prometheus metrics endpoint, which has the path `{address}/metrics`. For details on important metrics to monitor, see [Metrics](#metrics).<br><br>**Default:** `'127.0.0.1:3030'`                                                                                                                                                                                                                                                                                              |
| `--mode`                                      | Configure the MOLT Fetch behavior: `data-load`, `data-load-and-replication`, `replication-only`, `export-only`, or `import-only`. For details, refer to [Fetch mode](#fetch-mode).<br><br>**Default:** `data-load`                                                                                                                                                                                                                                                                            |
| `--non-interactive`                           | Run the fetch task without interactive prompts. This is recommended **only** when running `molt fetch` in an automated process (i.e., a job or continuous integration).                                                                                                                                                                                                                                                                                                                       |
| `--pglogical-replication-slot-drop-if-exists` | Drop the replication slot, if specified with `--pglogical-replication-slot-name`. Otherwise, the default replication slot is not dropped.                                                                                                                                                                                                                                                                                                                                                     |
| `--pglogical-replication-slot-name`           | The name of a replication slot to create before taking a snapshot of data (e.g., `'fetch'`). **Required** in order to perform continuous [replication](#load-data-and-replicate-changes) from a source PostgreSQL database.                                                                                                                                                                                                                                                                   |
| `--pglogical-replication-slot-plugin`         | The output plugin used for logical replication under `--pglogical-replication-slot-name`.<br><br>**Default:** `pgoutput`                                                                                                                                                                                                                                                                                                                                                                      |
| `--pprof-listen-addr`                         | Address of the pprof endpoint.<br><br>**Default:** `'127.0.0.1:3031'`                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `--replicator-flags`                          | If continuous [replication](#load-data-and-replicate-changes) is enabled with `--mode data-load-and-replication` or `--mode replication-only`, specify replication flags ([PostgreSQL](https://github.com/cockroachdb/replicator/wiki/PGLogical#postgresql-logical-replication) or [MySQL](https://github.com/cockroachdb/replicator/wiki/MYLogical#mysqlmariadb-replication)) to override.                                                                                                   |
| `--row-batch-size`                            | Number of rows per shard to export at a time. See [Best practices](#best-practices).<br><br>**Default:** `100000`                                                                                                                                                                                                                                                                                                                                                                             |
| `--schema-filter`                             | Move schemas that match a specified [regular expression](https://wikipedia.org/wiki/Regular_expression).<br><br>**Default:** `'.*'`                                                                                                                                                                                                                                                                                                                                                           |
| `--table-concurrency`                         | Number of tables to export at a time. The number of concurrent threads is the product of `--export-concurrency` and `--table-concurrency`.<br><br>This value **cannot** be set higher than `1` when moving data from MySQL. Refer to [Best practices](#best-practices).<br><br>**Default:** `4` with a PostgreSQL source; `1` with a MySQL source                                                                                                                                             |
| `--table-exclusion-filter`                    | Exclude tables that match a specified [POSIX regular expression](https://wikipedia.org/wiki/Regular_expression).<br><br>This value **cannot** be set to `'.*'`, which would cause every table to be excluded. <br><br>**Default:** Empty string                                                                                                                                                                                                                                               |
| `--table-filter`                              | Move tables that match a specified [POSIX regular expression](https://wikipedia.org/wiki/Regular_expression).<br><br>**Default:** `'.*'`                                                                                                                                                                                                                                                                                                                                                      |
| `--table-handling`                            | How tables are initialized on the target database (`none`/`drop-on-target-and-recreate`/`truncate-if-exists`). For details, see [Target table handling](#target-table-handling).<br><br>**Default:** `none`                                                                                                                                                                                                                                                                                   |
| `--transformations-file`                      | Path to a JSON file that defines transformations to be performed on the target schema during the fetch task. Refer to [Transformations](#transformations).                                                                                                                                                                                                                                                                                                                                    |
| `--type-map-file`                             | Path to a JSON file that contains explicit type mappings for automatic schema creation, when enabled with `--table-handling drop-on-target-and-recreate`. For details on the JSON format and valid type mappings, see [type mapping](#type-mapping).                                                                                                                                                                                                                                          |
| `--use-console-writer`                        | Use the console writer, which has cleaner log output but introduces more latency.<br><br>**Default:** `false` (log as structured JSON)                                                                                                                                                                                                                                                                                                                                                        |
| `--use-copy`                                  | Use [`COPY FROM`](#data-movement) to move data. This makes tables queryable during data load, but is slower than using `IMPORT INTO`. For details, refer to [Data movement](#data-movement).                                                                                                                                                                                                                                                                                                  |
| `--use-implicit-auth`                         | Use [implicit authentication]({% link {{ site.current_cloud_version }}/cloud-storage-authentication.md %}) for [cloud storage](#cloud-storage) URIs.                                                                                                                                                                                                                                                                                                                                          |

### `tokens list` flags

|          Flag         |                                                                 Description                                                                 |
|-----------------------|---------------------------------------------------------------------------------------------------------------------------------------------|
| `--conn-string`       | (Required) Connection string for the target database. For details, see [List active continuation tokens](#list-active-continuation-tokens). |
| `-n`, `--num-results` | Number of results to return.                                                                                                                |

## Usage

The following sections describe how to use the `molt fetch` [flags](#flags).

### Source and target databases

{{site.data.alerts.callout_success}}
Follow the recommendations in [Connection strings](#connection-strings).
{{site.data.alerts.end}}

`--source` specifies the connection string of the source database.

PostgreSQL or CockroachDB: 

{% include_cached copy-clipboard.html %}
~~~
--source 'postgresql://{username}:{password}@{host}:{port}/{database}'
~~~

MySQL:

{% include_cached copy-clipboard.html %}
~~~
--source 'mysql://{username}:{password}@{protocol}({host}:{port})/{database}'
~~~

`--target` specifies the [CockroachDB connection string]({% link {{site.current_cloud_version}}/connection-parameters.md %}#connect-using-a-url):

{% include_cached copy-clipboard.html %}
~~~
--target 'postgresql://{username}:{password}@{host}:{port}/{database}
~~~

### Fetch mode

`--mode` specifies the MOLT Fetch behavior:

- [Load data into CockroachDB](#load-data)
- [Load data and replicate changes to CockroachDB](#load-data-and-replicate-changes)
- [Replicate changes to CockroachDB](#replicate-changes)
- [Export the data to storage](#export-data-to-storage)

#### Load data

`data-load` (default) instructs MOLT Fetch to load the source data into CockroachDB. It does not replicate any subsequent changes on the source.

{% include_cached copy-clipboard.html %}
~~~ 
--mode data-load
~~~

#### Load data and replicate changes

{{site.data.alerts.callout_info}}
Before using this option, the source PostgreSQL or MySQL database **must** be configured for continuous replication, as described in [Setup](#replication-setup).
{{site.data.alerts.end}}

`data-load-and-replication` instructs MOLT Fetch to load the source data into CockroachDB, and replicate any subsequent changes on the source. 

{% include_cached copy-clipboard.html %}
~~~ 
--mode data-load-and-replication
~~~

If the source is a PostgreSQL database, you must also specify a replication slot name. For example, the following snippet instructs MOLT Fetch to create a slot named `replication_slot` to use for replication:

{% include_cached copy-clipboard.html %}
~~~ 
--mode data-load-and-replication
--pglogical-replication-slot-name 'replication_slot'
~~~

Continuous replication begins once the initial load is complete, as indicated by a `fetch complete` message in the output.

To cancel replication, enter `ctrl-c` to issue a `SIGTERM` signal. This returns an exit code `0`. If replication fails, a non-zero exit code is returned.

To customize the replication behavior (an advanced use case), use `--replicator-flags` to specify one or more replication-specific flags ([PostgreSQL](https://github.com/cockroachdb/replicator/wiki/PGLogical#postgresql-logical-replication) or [MySQL](https://github.com/cockroachdb/replicator/wiki/MYLogical#mysqlmariadb-replication)) to override.

{% include_cached copy-clipboard.html %}
~~~
--mode data-load-and-replication
--replicator-flags "--applyTimeout '1h' --parallelism 64"
~~~

#### Replicate changes

{{site.data.alerts.callout_info}}
Before using this option, the source PostgreSQL or MySQL database **must** be configured for continuous replication, as described in [Setup](#replication-setup).
{{site.data.alerts.end}}

`replication-only` instructs MOLT Fetch to replicate ongoing changes on the source to CockroachDB, using the specified replication marker.

- For a PostgreSQL source, first create a logical replication slot. For example, to create a replication slot named `replication_slot`:

	{% include_cached copy-clipboard.html %}
	~~~ sql
	SELECT * FROM pg_create_logical_replication_slot('replication_slot', 'pgoutput');
	~~~

	In the `molt fetch` command, specify the replication slot name using `--pglogical-replication-slot-name`. For example:

	{% include_cached copy-clipboard.html %}
	~~~ 
	--mode replication-only 
	--pglogical-replication-slot-name 'replication_slot'
	~~~

- For a MySQL source, first get your GTID record:

	{% include_cached copy-clipboard.html %}
	~~~ sql
	SELECT source_uuid, min(interval_start), max(interval_end)
	  FROM mysql.gtid_executed
	  GROUP BY source_uuid;
	~~~

	In the `molt fetch` command, specify a GTID set using the format `source_uuid:min(interval_start)-max(interval_end)`. For example:

	{% include_cached copy-clipboard.html %}
	~~~ 
	--mode replication-only 
	--replicator-flags "--defaultGTIDSet 'b7f9e0fa-2753-1e1f-5d9b-2402ac810003:3-21'"
	~~~

To cancel replication, enter `ctrl-c` to issue a `SIGTERM` signal. This returns an exit code `0`. If replication fails, a non-zero exit code is returned.

#### Export data to storage

`export-only` instructs MOLT Fetch to export the source data to the specified [cloud storage](#cloud-storage) or [local file server](#local-file-server). It does not load the data into CockroachDB.

{% include_cached copy-clipboard.html %}
~~~ 
--mode export-only
~~~

#### Import data from storage

`import-only` instructs MOLT Fetch to load the source data in the specified [cloud storage](#cloud-storage) or [local file server](#local-file-server) into the CockroachDB target.

{% include_cached copy-clipboard.html %}
~~~ 
--mode import-only
~~~

### Data movement

MOLT Fetch can use either [`IMPORT INTO`]({% link {{site.current_cloud_version}}/import-into.md %}) or [`COPY FROM`]({% link {{site.current_cloud_version}}/copy-from.md %}) to load data into CockroachDB.

By default, MOLT Fetch uses `IMPORT INTO`:

- `IMPORT INTO` achieves the highest throughput, but [requires taking the CockroachDB tables **offline**]({% link {{site.current_cloud_version}}/import-into.md %}#considerations) to achieve its import speed. Tables are taken back online once an [import job]({% link {{site.current_cloud_version}}/import-into.md %}#view-and-control-import-jobs) completes successfully. See [Best practices](#best-practices).
- `IMPORT INTO` supports compression using the `--compression` flag, which reduces the amount of storage used.

`--use-copy` configures MOLT Fetch to use `COPY FROM`:

- `COPY FROM` enables your tables to remain online and accessible. However, it is slower than using [`IMPORT INTO`]({% link {{site.current_cloud_version}}/import-into.md %}).
- `COPY FROM` does not support compression.

{{site.data.alerts.callout_info}}
`COPY FROM` is also used for [direct copy](#direct-copy).
{{site.data.alerts.end}}

### Data path

MOLT Fetch can move the source data to CockroachDB via [cloud storage](#cloud-storage), a [local file server](#local-file-server), or [directly](#direct-copy) without an intermediate store.

#### Cloud storage

{{site.data.alerts.callout_success}}
Only the path specified in `--bucket-path` is used. Query parameters, such as credentials, are ignored. To authenticate cloud storage, follow the steps in [Secure cloud storage](#secure-cloud-storage).
{{site.data.alerts.end}}

`--bucket-path` instructs MOLT Fetch to write intermediate files to a path within a [Google Cloud Storage](https://cloud.google.com/storage/docs/buckets) or [Amazon S3](https://aws.amazon.com/s3/) bucket to which you have the necessary permissions. For example:

Google Cloud Storage:

{% include_cached copy-clipboard.html %}
~~~
--bucket-path 'gs://migration/data/cockroach'
~~~

Amazon S3:

{% include_cached copy-clipboard.html %}
~~~
--bucket-path 's3://migration/data/cockroach'
~~~

Cloud storage can be used to move data with either [`IMPORT INTO` or `COPY FROM`](#data-movement).

#### Local file server

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

A local file server can be used to move data with either [`IMPORT INTO` or `COPY FROM`](#data-movement).

{{site.data.alerts.callout_success}}
[Cloud storage](#cloud-storage) is often preferable to a local file server, which can require considerable disk space.
{{site.data.alerts.end}}

#### Direct copy

`--direct-copy` specifies that MOLT Fetch should use `COPY FROM` to move the source data directly to CockroachDB without an intermediate store:

- Because the data is held in memory, the machine must have sufficient RAM for the data currently in flight: 

	~~~
	average size of each row * --row-batch-size * --export-concurrency * --table-concurrency
	~~~

- Direct copy does not support compression or [continuation](#fetch-continuation).
- The [`--use-copy`](#data-movement) flag is redundant with `--direct-copy`.

### Schema and table selection

By default, MOLT Fetch moves all data from the [`--source`](#source-and-target-databases) database to CockroachDB. Use the following flags to move a subset of data.

`--schema-filter` specifies a range of schema objects to move to CockroachDB, formatted as a POSIX regex string. For example, to move every table in the source database's `public` schema:

{% include_cached copy-clipboard.html %}
~~~
--schema-filter 'public'
~~~

`--table-filter` and `--table-exclusion-filter` specify tables to include and exclude from the migration, respectively, formatted as POSIX regex strings. For example, to move every source table that has "user" in the table name and exclude every source table that has "temp" in the table name:

{% include_cached copy-clipboard.html %}
~~~
--table-filter '.*user.*' --table-exclusion-filter '.*temp.*'
~~~

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

When using the `drop-on-target-and-recreate` option, MOLT Fetch creates a new CockroachDB table to load the source data if one does not already exist. To guide the automatic schema creation, you can [explicitly map source types to CockroachDB types](#type-mapping).

#### Mismatch handling

If either [`none`](#target-table-handling) or [`truncate-if-exists`](#target-table-handling) is set, `molt fetch` loads data into the existing tables on the target CockroachDB database. If the target schema mismatches the source schema, `molt fetch` will exit early in [certain cases](#exit-early), and will need to be re-run from the beginning.

{{site.data.alerts.callout_info}}
This does not apply when [`drop-on-target-and-recreate`](#target-table-handling) is specified, since this option automatically creates a compatible CockroachDB schema.
{{site.data.alerts.end}}

<a id="exit-early"></a>`molt fetch` exits early in the following cases, and will output a log with a corresponding `mismatch_tag` and `failable_mismatch` set to `true`:

- A source table is missing a primary key.
- A source and table primary key have mismatching types.
- A [`STRING`]({% link {{site.current_cloud_version}}/string.md %}) primary key has a different [collation]({% link {{site.current_cloud_version}}/collate.md %}) on the source and target.
- A source and target column have mismatching types that are not [allowable mappings](#type-mapping).
- A target table is missing a column that is in the corresponding source table.
- A source column is nullable, but the corresponding target column is not nullable (i.e., the constraint is more strict on the target).

`molt fetch` can continue in the following cases, and will output a log with a corresponding `mismatch_tag` and `failable_mismatch` set to `false`:

- A target table has a column that is not in the corresponding source table.
- A source column has a `NOT NULL` constraint, and the corresponding target column is nullable (i.e., the constraint is less strict on the target).
- A [`DEFAULT`]({% link {{site.current_cloud_version}}/default-value.md %}), [`CHECK`]({% link {{site.current_cloud_version}}/check.md %}), [`FOREIGN KEY`]({% link {{site.current_cloud_version}}/foreign-key.md %}), or [`UNIQUE`]({% link {{site.current_cloud_version}}/unique.md %}) constraint is specified on a target column and not on the source column.

#### Type mapping

If [`drop-on-target-and-recreate`](#target-table-handling) is set, MOLT Fetch automatically creates a CockroachDB schema that is compatible with the source data. The column types are determined as follows:

- PostgreSQL types are mapped to existing CockroachDB [types]({% link {{site.current_cloud_version}}/data-types.md %}) that have the same [`OID`]({% link {{site.current_cloud_version}}/oid.md %}).
- The following MySQL types are mapped to corresponding CockroachDB types:

	|                      MySQL type                     |                                                  CockroachDB type                                                  |
	|-----------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|
	| `CHAR`, `CHARACTER`, `VARCHAR`, `NCHAR`, `NVARCHAR` | [`VARCHAR`]({% link {{site.current_cloud_version}}/string.md %})                                                   |
	| `TINYTEXT`, `TEXT`, `MEDIUMTEXT`, `LONGTEXT`        | [`STRING`]({% link {{site.current_cloud_version}}/string.md %})                                                    |
	| `GEOMETRY`                                          | [`GEOMETRY`]({% link {{site.current_cloud_version}}/architecture/glossary.md %}#geometry)                          |
	| `LINESTRING`                                        | [`LINESTRING`]({% link {{site.current_cloud_version}}/linestring.md %})                                            |
	| `POINT`                                             | [`POINT`]({% link {{site.current_cloud_version}}/point.md %})                                                      |
	| `POLYGON`                                           | [`POLYGON`]({% link {{site.current_cloud_version}}/polygon.md %})                                                  |
	| `MULTIPOINT`                                        | [`MULTIPOINT`]({% link {{site.current_cloud_version}}/multipoint.md %})                                            |
	| `MULTILINESTRING`                                   | [`MULTILINESTRING`]({% link {{site.current_cloud_version}}/multilinestring.md %})                                  |
	| `MULTIPOLYGON`                                      | [`MULTIPOLYGON`]({% link {{site.current_cloud_version}}/multipolygon.md %})                                        |
	| `GEOMETRYCOLLECTION`, `GEOMCOLLECTION`              | [`GEOMETRYCOLLECTION`]({% link {{site.current_cloud_version}}/geometrycollection.md %})                            |
	| `JSON`                                              | [`JSONB`]({% link {{site.current_cloud_version}}/jsonb.md %})                                                      |
	| `TINYINT`, `INT1`                                   | [`INT2`]({% link {{site.current_cloud_version}}/int.md %})                                                         |
	| `BLOB`                                              | [`BYTES`]({% link {{site.current_cloud_version}}/bytes.md %})                                                      |
	| `SMALLINT`, `INT2`                                  | [`INT2`]({% link {{site.current_cloud_version}}/int.md %})                                                         |
	| `MEDIUMINT`, `INT`, `INTEGER`, `INT4`               | [`INT4`]({% link {{site.current_cloud_version}}/int.md %})                                                         |
	| `BIGINT`, `INT8`                                    | [`INT`]({% link {{site.current_cloud_version}}/int.md %})                                                          |
	| `FLOAT`                                             | [`FLOAT4`]({% link {{site.current_cloud_version}}/float.md %})                                                     |
	| `DOUBLE`                                            | [`FLOAT`]({% link {{site.current_cloud_version}}/float.md %})                                                      |
	| `DECIMAL`, `NUMERIC`, `REAL`                        | [`DECIMAL`]({% link {{site.current_cloud_version}}/decimal.md %}) (Negative scale values are autocorrected to `0`) |
	| `BINARY`, `VARBINARY`                               | [`BYTES`]({% link {{site.current_cloud_version}}/bytes.md %})                                                      |
	| `DATETIME`                                          | [`TIMESTAMP`]({% link {{site.current_cloud_version}}/timestamp.md %})                                              |
	| `TIMESTAMP`                                         | [`TIMESTAMPTZ`]({% link {{site.current_cloud_version}}/timestamp.md %})                                            |
	| `TIME`                                              | [`TIME`]({% link {{site.current_cloud_version}}/time.md %})                                                        |
	| `BIT`                                               | [`VARBIT`]({% link {{site.current_cloud_version}}/bit.md %})                                                       |
	| `DATE`                                              | [`DATE`]({% link {{site.current_cloud_version}}/date.md %})                                                        |
	| `TINYBLOB`, `MEDIUMBLOB`, `LONGBLOB`                | [`BYTES`]({% link {{site.current_cloud_version}}/bytes.md %})                                                      |
	| `BOOL`, `BOOLEAN`                                   | [`BOOL`]({% link {{site.current_cloud_version}}/bool.md %})                                                        |
	| `ENUM`                                              | [`ANY_ENUM`]({% link {{site.current_cloud_version}}/enum.md %})                                                    |

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
    "column-type-map": [
      {
        "column": "*",
        "type-kv": {
          "source-type": "int",
          "crdb-type": "INT2"
        }
      },
      {
        "column": "name",
        "type-kv": {
          "source-type": "varbit",
          "crdb-type": "string"
        }
      }
    ]
  }
]
~~~

- `table` specifies the table that will use the custom type mappings in `column-type-map`, written as `{schema}.{table}`.
- `column` specifies the column that will use the custom type mapping in `type-kv`. If `*` is specified, then all columns in the `table` with the matching `source-type` are converted.
- `type-kv` specifies the `source-type` that maps to the target `crdb-type`.

### Transformations

You can define transformation rules to be performed on the target schema during the fetch task. These can be used to:

- Map [computed columns]({% link {{ site.current_cloud_version }}/computed-columns.md %}) to a target schema.
- Map [partitioned tables]({% link {{ site.current_cloud_version }}/partitioning.md %}) to a single target table.
- Rename tables on the target schema.

Transformation rules are defined in the JSON file indicated by the `--transformations-file` flag. For example:

{% include_cached copy-clipboard.html %}
~~~
--transformations-file 'transformation-rules.json'
~~~

The following JSON example defines two transformation rules:

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
    }
  ]
}
~~~

- `resource_specifier` configures the following options for transformation rules:
	- `schema` specifies the schemas to be affected by the transformation rule, formatted as a POSIX regex string.
	- `table` specifies the tables to be affected by the transformation rule, formatted as a POSIX regex string.
- `column_exclusion_opts` configures the following options for column exclusions and computed columns:
	- `column` specifies source columns to exclude from being mapped to regular columns on the target schema. It is formatted as a POSIX regex string.
	- `add_computed_def`, when set to `true`, specifies that each matching `column` should be mapped to a [computed column]({% link {{ site.current_cloud_version }}/computed-columns.md %}) on the target schema. Instead of being moved from the source, the column data is generated on the target using [`ALTER TABLE ... ADD COLUMN`]({% link {{ site.current_cloud_version }}/alter-table.md %}#add-column) and the computed column definition from the source schema. This assumes that all matching columns are computed columns on the source.
		{{site.data.alerts.callout_danger}}
		Columns that match the `column` regex will **not** be moved to CockroachDB if `add_computed_def` is omitted or set to `false` (default), or if a matching column is a non-computed column.
		{{site.data.alerts.end}}
- `table_rename_opts` configures the following option for table renaming:
	- `value` specifies the table name to which the matching `resource_specifier` is mapped. If only one source table matches `resource_specifier`, it is renamed to `table_rename_opts.value` on the target. If more than one table matches `resource_specifier` (i.e., an n-to-1 mapping), the fetch task assumes that all matching tables are [partitioned tables]({% link {{ site.current_cloud_version }}/partitioning.md %}) with the same schema, and moves their data to a table named `table_rename_opts.value` on the target. Otherwise, the task will error. 
		
		Additionally, in an n-to-1 mapping situation: 

		- Specify [`--use-copy`](#data-movement) or [`--direct-copy`](#direct-copy) for data movement. This is because the data from the source tables is loaded concurrently into the target table.
		- Create the target table schema manually, and do **not** use [`--table-handling drop-on-target-and-recreate`](#target-table-handling) for target table handling.

The preceding JSON example therefore defines two rules:

- Rule `1` maps all source `age` columns on the source database to [computed columns]({% link {{ site.current_cloud_version }}/computed-columns.md %}) on CockroachDB. This assumes that all matching `age` columns are defined as computed columns on the source.
- Rule `2` maps all table names with prefix `charges_part` from the source database to a single `charges` table on CockroachDB (i.e., an n-to-1 mapping). This assumes that all matching `charges_part.*` tables have the same schema.

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

If MOLT Fetch fails while loading data into CockroachDB from intermediate files, it exits with an error message, fetch ID, and [continuation token](#list-active-continuation-tokens) for each table that failed to load on the target database. You can use this information to continue the task from the *continuation point* where it was interrupted. For an example, see [Continue fetch after encountering an error](#continue-fetch-after-encountering-an-error).

Continuation is only possible under the following conditions:

- All data has been exported from the source database into intermediate files on [cloud](#cloud-storage) or [local storage](#local-file-server).
- The *initial load* of source data into the target CockroachDB database is incomplete. This means that ongoing [replication](#load-data-and-replicate-changes) of source data has not begun.

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

A change data capture (CDC) cursor is written to the output as `cdc_cursor` at the beginning and end of the fetch task. For example:

~~~ json
{"level":"info","type":"summary","fetch_id":"735a4fe0-c478-4de7-a342-cfa9738783dc","num_tables":1,"tables":["public.employees"],"cdc_cursor":"0/3F41E40","net_duration_ms":4879.890041,"net_duration":"000h 00m 04s","time":"2024-03-18T12:37:02-04:00","message":"fetch complete"}
~~~

You can use the `cdc_cursor` value with an external change data capture (CDC) tool to continuously replicate subsequent changes on the source data to CockroachDB.

### Metrics

By default, MOLT Fetch exports [Prometheus](https://prometheus.io/) metrics at `127.0.0.1:3030/metrics`. You can configure this endpoint with the `--metrics-listen-addr` [flag](#global-flags).

Cockroach Labs recommends monitoring the following metrics:

|              Metric Name              |                                                    Description                                                     |
|---------------------------------------|--------------------------------------------------------------------------------------------------------------------|
| `molt_fetch_num_tables`               | Number of tables that will be moved from the source.                                                               |
| `molt_fetch_num_task_errors`          | Number of errors encountered by the fetch task.                                                                    |
| `molt_fetch_overall_duration`         | Duration (in seconds) of the fetch task.                                                                           |
| `molt_fetch_rows_exported`            | Number of rows that have been exported from a table. For example:<br>`molt_fetch_rows_exported{table="public.users"}` |
| `molt_fetch_rows_imported`            | Number of rows that have been imported from a table. For example:<br>`molt_fetch_rows_imported{table="public.users"}` |
| `molt_fetch_table_export_duration_ms` | Duration (in milliseconds) of a table's export. For example:<br>`molt_fetch_table_export_duration_ms{table="public.users"}` |
| `molt_fetch_table_import_duration_ms` | Duration (in milliseconds) of a table's import. For example:<br>`molt_fetch_table_import_duration_ms{table="public.users"}` |

## Docker usage

{% include {{ page.version.version }}/molt/molt-docker.md %}

## Examples

The following examples demonstrate how to issue `molt fetch` commands to load data into CockroachDB. These examples assume that [secure connections](#secure-connections) to the source and target database are used.

{{site.data.alerts.callout_success}}
After successfully running MOLT Fetch, you can run [`molt verify`]({% link molt/molt-verify.md %}) to confirm that replication worked successfully without missing or mismatched rows.
{{site.data.alerts.end}}

### Load PostgreSQL data via S3 with continuous replication

The following `molt fetch` command uses `IMPORT INTO` to load a subset of tables from a PostgreSQL database to CockroachDB.

{% include_cached copy-clipboard.html %}
~~~ shell
molt fetch \
--source 'postgres://postgres:postgres@localhost/molt' \
--target 'postgres://root@localhost:26257/defaultdb?sslmode=verify-full' \
--table-handling 'truncate-if-exists' \
--table-filter 'employees' \
--bucket-path 's3://migration/data/cockroach' \
--cleanup \
--pglogical-replication-slot-name 'replication_slot' \
--mode data-load-and-replication
~~~

- `--table-handling` specifies that existing tables on CockroachDB should be truncated before the source data is loaded.
- `--table-filter` filters for tables with the `employees` string in the name.
- `--bucket-path` specifies a directory on an [Amazon S3 bucket](#data-path) where intermediate files will be written.
- `--cleanup` specifies that the intermediate files should be removed after the source data is loaded.
- `--pglogical-replication-slot-name` specifies a replication slot name to be created on the source PostgreSQL database. This is used in continuous [replication](#load-data-and-replicate-changes).
- `--mode data-load-and-replication` starts continuous [replication](#load-data-and-replicate-changes) of data from the source database to CockroachDB after the fetch task succeeds.

If the fetch task succeeds, the output displays a `fetch complete` message like the following:

~~~ json
{"level":"info","type":"summary","fetch_id":"f5cb422f-4bb4-4bbd-b2ae-08c4d00d1e7c","num_tables":1,"tables":["public.employees"],"cdc_cursor":"0/3F41E40","net_duration_ms":6752.847625,"net_duration":"000h 00m 06s","time":"2024-03-18T12:30:37-04:00","message":"fetch complete"}
~~~

{{site.data.alerts.callout_info}}
If the fetch task encounters an error, it will exit and can be [continued](#continue-fetch-after-encountering-an-error).
{{site.data.alerts.end}}

Continuous [replication](#load-data-and-replicate-changes) begins immediately afterward:

~~~ json
{"level":"info","time":"2024-05-13T14:33:07-04:00","message":"starting replicator"}
{"level":"info","time":"2024-05-13T14:36:22-04:00","message":"creating publication"}
~~~

To cancel replication, enter `ctrl-c` to issue a `SIGTERM` signal.

### Load MySQL data via GCP with continuous replication

The following `molt fetch` command uses `COPY FROM` to load a subset of tables from a MySQL database to CockroachDB.

{% include_cached copy-clipboard.html %}
~~~ shell
molt fetch \
--source 'mysql://root:password@localhost/molt?sslcert=.%2fsource_certs%2fclient.root.crt&sslkey=.%2fsource_certs%2fclient.root.key&sslmode=verify-full&sslrootcert=.%2fsource_certs%2fca.crt' \
--target 'postgres://root@localhost:26257/defaultdb?sslmode=verify-full' \
--table-handling 'truncate-if-exists' \
--table-filter 'employees' \
--bucket-path 'gs://migration/data/cockroach' \
--use-copy \
--cleanup \
--mode data-load-and-replication
~~~

- `--source` specifies the MySQL connection string and the certificates in URL-encoded format. Secure connections should be used by default. Refer to [Best practices](#best-practices).
- `--table-handling` specifies that existing tables on CockroachDB should be truncated before the source data is loaded.
- `--table-filter` filters for tables with the `employees` string in the name.
- `--bucket-path` specifies a directory on an [Google Cloud Storage bucket](#data-path) where intermediate files will be written.
- `--use-copy` specifies that `COPY FROM` is used to load the tables, keeping the source tables online and queryable but loading the data more slowly than `IMPORT INTO`.
- `--cleanup` specifies that the intermediate files should be removed after the source data is loaded.
- `--mode data-load-and-replication` starts continuous [replication](#load-data-and-replicate-changes) of data from the source database to CockroachDB after the fetch task succeeds.

If the fetch task succeeds, the output displays a `fetch complete` message like the following:

~~~ json
{"level":"info","type":"summary","fetch_id":"f5cb422f-4bb4-4bbd-b2ae-08c4d00d1e7c","num_tables":1,"tables":["public.employees"],"cdc_cursor":"0/3F41E40","net_duration_ms":6752.847625,"net_duration":"000h 00m 06s","time":"2024-03-18T12:30:37-04:00","message":"fetch complete"}
~~~

{{site.data.alerts.callout_info}}
If the fetch task encounters an error, it will exit and can be [continued](#continue-fetch-after-encountering-an-error).
{{site.data.alerts.end}}

Continuous [replication](#load-data-and-replicate-changes) begins immediately afterward:

~~~ json
{"level":"info","time":"2024-05-13T14:33:07-04:00","message":"starting replicator"}
~~~

To cancel replication, enter `ctrl-c` to issue a `SIGTERM` signal.

### Load CockroachDB data via direct copy

The following `molt fetch` command uses `COPY FROM` to load all tables directly from one CockroachDB database to another.

{% include_cached copy-clipboard.html %}
~~~ shell
molt fetch \
--source 'postgres://root@localhost:26257/defaultdb?sslmode=disable' \
--target 'postgres://root@localhost:26258/defaultdb?sslmode=disable' \
--table-handling 'none' \
--direct-copy \
--allow-tls-mode-disable
~~~

- `--source` specifies `sslmode=disable` to establish an insecure connection. By default, insecure connections are disallowed and should be used **only** for testing or if a secure SSL/TLS connection to the source or target database is not possible.
- `--table-handling` specifies that existing tables on the target CockroachDB database should not be modified before the source data is loaded.
- `--direct-copy` specifies that `COPY FROM` is used to load the tables directly, without creating intermediate files.
- `--allow-tls-mode-disable` enables insecure connections to the source and target databases. Refer to [Secure connections](#secure-connections).

### Continue fetch after encountering an error

If the fetch task encounters an error, it exits with an error message, fetch ID, and continuation token for each table that failed to load on the target database. You can use these values to [continue the fetch task](#fetch-continuation) from where it was interrupted.

~~~ json
{"level":"info","table":"public.tbl1","file_name":"shard_01_part_00000001.csv","message":"creating or updating token for duplicate key value violates unique constraint \"tbl1_pkey\"; Key (id)=(22) already exists."}
{"level":"info","table":"public.tbl1","continuation_token":"5e7c7173-101c-4539-9b8d-28fad37d0240","message":"created continuation token"}
{"level":"info","fetch_id":"87bf8dc0-803c-4e26-89d5-3352576f92a7","message":"continue from this fetch ID"}
~~~

To retry a specific table, reissue the initial `molt fetch` command and include the fetch ID and a continuation token:

{{site.data.alerts.callout_success}}
You can use `molt fetch tokens list` to list all active continuation tokens. Refer to [List active continuation tokens](#list-active-continuation-tokens).
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ shell
molt fetch \
... \
--fetch-id '87bf8dc0-803c-4e26-89d5-3352576f92a7' \
--continuation-token '5e7c7173-101c-4539-9b8d-28fad37d0240'
~~~

To retry all tables that failed, exclude `--continuation-token` from the command. When prompted, type `y` to clear all active continuation tokens. To avoid the prompt (e.g., when running `molt fetch` in a job), include the `--non-interactive` flag:

{% include_cached copy-clipboard.html %}
~~~ shell
molt fetch \
... \
--fetch-id '87bf8dc0-803c-4e26-89d5-3352576f92a7' \
--non-interactive
~~~

## See also

- [MOLT Verify]({% link molt/molt-verify.md %})
- [Migration Overview]({% link {{site.current_cloud_version}}/migration-overview.md %})
- [Migrate from PostgreSQL]({% link {{site.current_cloud_version}}/migrate-from-postgres.md %})
- [Migrate from MySQL]({% link {{site.current_cloud_version}}/migrate-from-mysql.md %})
- [Migrate from CSV]({% link {{site.current_cloud_version}}/migrate-from-csv.md %})
