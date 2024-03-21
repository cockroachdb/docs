---
title: MOLT Fetch
summary: Learn how to use the MOLT Fetch tool to move data from a source database to CockroachDB.
toc: true
docs_area: migrate
---

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

MOLT Fetch moves data from a source database into CockroachDB as part of a [database migration]({% link {{ page.version.version }}/migration-overview.md %}).

MOLT Fetch can use `IMPORT INTO` or `COPY FROM` to move the source data to CockroachDB via cloud storage (Google Cloud Storage or Amazon S3), a local file server, or directly without an intermediate store. For details, see [Usage](#usage).

## Supported databases

The following source databases are currently supported:

- [PostgreSQL]({% link {{ page.version.version }}/migrate-from-postgres.md %})
- [MySQL]({% link {{ page.version.version }}/migrate-from-mysql.md %})
- CockroachDB

## Installation

To install MOLT Fetch, download the binary that matches your system. To download the latest binary:

| Operating System |                                    AMD 64-bit                                   |                                    ARM 64-bit                                   |
|------------------|---------------------------------------------------------------------------------|---------------------------------------------------------------------------------|
| Windows          | [Download](https://molt.cockroachdb.com/molt/cli/molt-latest.windows-amd64.tgz) | [Download](https://molt.cockroachdb.com/molt/cli/molt-latest.windows-arm64.tgz) |
| Linux            | [Download](https://molt.cockroachdb.com/molt/cli/molt-latest.linux-amd64.tgz)   | [Download](https://molt.cockroachdb.com/molt/cli/molt-latest.linux-arm64.tgz)   |
| Mac              | [Download](https://molt.cockroachdb.com/molt/cli/molt-latest.darwin-amd64.tgz)  | [Download](https://molt.cockroachdb.com/molt/cli/molt-latest.darwin-arm64.tgz)  |

For previous binaries, see the [MOLT version manifest](https://molt.cockroachdb.com/molt/cli/versions.html). For releases v0.0.6 and earlier, see the [MOLT repository](https://github.com/cockroachdb/molt/releases).

## Setup

Complete the following items before using MOLT Fetch:

- Ensure that the source and target schemas are identical. Tables with mismatching columns may only be partially migrated.

- Ensure that the SQL user running MOLT Fetch has the required privileges to run [`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %}#required-privileges) or [`COPY FROM`]({% link {{ page.version.version }}/copy-from.md %}#required-privileges) statements, depending on your intended [mode](#fetch-mode).

- To enable the [CDC cursor](#cdc-cursor) for ongoing replication:

	- If you are migrating from PostgreSQL, enable logical replication. Set [wal_level](https://www.postgresql.org/docs/current/runtime-config-wal.html) to `logical` in `postgresql.conf` or in the SQL shell.

	- If you are migrating from MySQL, enable [GTID](https://dev.mysql.com/doc/refman/8.0/en/replication-options-gtids.html) consistency. Set `gtid-mode` and `enforce-gtid-consistency` to `ON` in `mysql.cnf`, in the SQL shell, or as flags in the `mysql` start command.

- Percent-encode the connection strings for the source database and [CockroachDB]({% link {{ page.version.version }}/connect-to-the-database.md %}). This ensures that the MOLT tools can parse special characters in your password.

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

	- If you are using Amazon S3 for [cloud storage](#cloud-storage):

		- Ensure that the environment variable and access tokens are set appropriately in the terminal running `molt fetch`. For example:

			{% include_cached copy-clipboard.html %}
			~~~ shell
			export AWS_REGION='us-east-1'
			export AWS_SECRET_ACCESS_KEY='key'
			export AWS_ACCESS_KEY_ID='id'
			~~~

		- Ensure the S3 bucket is created and accessible to CockroachDB.

	- If you are using Google Cloud Storage for [cloud storage](#cloud-storage):

		- Ensure that your local environment is authenticated using [Application Default Credentials](https://cloud.google.com/sdk/gcloud/reference/auth/application-default/login):

			{% include_cached copy-clipboard.html %}
			~~~ shell
			gcloud init
			gcloud auth application-default login
			~~~

		- Ensure the Google Cloud Storage bucket is created and accessible to CockroachDB.
	
## Flags

|                      Flag                     |                                                                                                                                                                                                        Description                                                                                                                                                                                                        |
|-----------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `--source`                                    | (Required) Connection string for the source database. For details, see [Source and target databases](#source-and-target-databases).                                                                                                                                                                                                                                                                                       |
| `--target`                                    | (Required) Connection string for the target database. For details, see [Source and target databases](#source-and-target-databases).                                                                                                                                                                                                                                                                                       |
| `--bucket-path`                               | The path within the [cloud storage](#cloud-storage) bucket where intermediate files are written (e.g., `'s3://bucket/path'` or `'gs://bucket/path'`).                                                                                                                                                                                                                                                                     |
| `--cleanup`                                   | Whether to delete intermediate files after moving data using [cloud or local storage](#data-path). **Note:** Cleanup does not occur on [continuation](#fetch-continuation).                                                                                                                                                                                                                                               |
| `--compression`                               | Compression method for data when using [`IMPORT INTO` mode](#fetch-mode) (`gzip`/`none`).<br><br>**Default:** `gzip`                                                                                                                                                                                                                                                                                                      |
| `--continuation-file-name`                    | Restart fetch at the specified filename if the process encounters an error. `--fetch-id` must be specified. For details, see [Fetch continuation](#fetch-continuation).                                                                                                                                                                                                                                                   |
| `--continuation-token`                        | Restart fetch at a specific table, using the specified continuation token, if the process encounters an error. `--fetch-id` must be specified. For details, see [Fetch continuation](#fetch-continuation).                                                                                                                                                                                                                |
| `--direct-copy`                               | Enables [direct copy mode](#fetch-mode), which copies data directly from source to target without using an intermediate store.                                                                                                                                                                                                                                                                                            |
| `--export-concurrency`                        | Number of concurrent threads to use for data export. **Note:** This number will be multiplied by the number of tables being moved in `--table-concurrency`. Ensure your machine has sufficient resources to handle this level of concurrency.<br><br>**Default:** `4`                                                                                                                                                     |
| `--fetch-id`                                  | Restart fetch process corresponding to the specified ID. If `--continuation-file-name` or `--continuation-token` are not specified, fetch restarts for all failed tables.                                                                                                                                                                                                                                                 |
| `--flush-rows`                                | Number of rows before the source data is flushed to intermediate files. **Note:** If `--flush-size` is also specified, the fetch behavior is based on the flag whose criterion is met first.                                                                                                                                                                                                                              |
| `--flush-size`                                | Size (in bytes) before the source data is flushed to intermediate files. **Note:** If `--flush-rows` is also specified, the fetch behavior is based on the flag whose criterion is met first.                                                                                                                                                                                                                             |
| `--local-path`                                | The path within the [local file server](#local-file-server) where intermediate files are written (e.g., `data/migration/cockroach`). `--local-path-listen-addr` must be specified.                                                                                                                                                                                                                                        |
| `--local-path-crdb-access-addr`               | Address of a [local file server](#local-file-server) that is reachable by CockroachDB. This flag is only necessary if CockroachDB cannot reach the local address specified with `--local-path-listen-addr` (e.g., when moving data to a CockroachDB {{ site.data.products.cloud }} deployment).<br><br>**Default:** Value of `--local-path-listen-addr`. `--local-path` and `--local-path-listen-addr` must be specified. |
| `--local-path-listen-addr`                    | Write intermediate files to a [local file server](#local-file-server) at the specified address (e.g., `'localhost:3000'`). `--local-path` must be specified.                                                                                                                                                                                                                                                              |
| `--log-file`                                  | Write messages to the specified log filename. If not specified, messages are only written to `stdout`.                                                                                                                                                                                                                                                                                                                    |
| `--logging`                                   | Level at which to log messages (`'trace'`/`'debug'`/`'info'`/`'warn'`/`'error'`/`'fatal'`/`'panic'`).<br><br>**Default:** `'info'`                                                                                                                                                                                                                                                                                        |
| `--metrics-listen-addr`                       | Address of the metrics endpoint.<br><br>**Default:** `'127.0.0.1:3030'`                                                                                                                                                                                                                                                                                                                                                   |
| `--pglogical-replication-slot-drop-if-exists` | Drop the replication slot, if specified with `--pglogical-replication-slot-name`. Otherwise, the default replication slot is not dropped.                                                                                                                                                                                                                                                                                 |
| `--pglogical-replication-slot-name`           | The name of a replication slot to create before taking a snapshot of data (e.g., `'fetch'`). This flag is only necessary if you want to use a replication slot other than the default slot.                                                                                                                                                                                                                               |
| `--pglogical-replication-slot-plugin`         | The output plugin used for logical replication under `--pglogical-replication-slot-name`.<br><br>**Default:** `pgoutput`                                                                                                                                                                                                                                                                                                  |
| `--pprof-listen-addr`                         | Address of the pprof endpoint.<br><br>**Default:** `'127.0.0.1:3031'`                                                                                                                                                                                                                                                                                                                                                     |
| `--row-batch-size`                            | Number of rows to select at a time for export from the source database.<br><br>**Default:** `100000`                                                                                                                                                                                                                                                                                                                      |
| `--schema-filter`                             | Move schemas that match a specified [regular expression](https://wikipedia.org/wiki/Regular_expression).<br><br>**Default:** `'.*'`                                                                                                                                                                                                                                                                                       |
| `--table-concurrency`                         | Number of tables to move at a time. **Note:** This number will be multiplied by the value of `--export-concurrency`. Ensure your machine has sufficient resources to handle this level of concurrency.<br><br>**Default:** 4                                                                                                                                                                                              |
| `--table-filter`                              | Move tables that match a specified [regular expression](https://wikipedia.org/wiki/Regular_expression).<br><br>**Default:** `'.*'`                                                                                                                                                                                                                                                                                        |
| `--table-handling`                            | How tables are initialized on the target database (`'none'`/`'drop-on-target-and-recreate'`/`'truncate-if-exists'`). For details, see [Target table handling](#target-table-handling).<br><br>**Default:** `'none'`                                                                                                                                                                                                       |
| `--use-console-writer`                        | Use the console writer, which has cleaner log output but introduces more latency.<br><br>**Default:** `false` (log as structured JSON)                                                                                                                                                                                                                                                                                    |
| `--use-copy`                                  | Use [`COPY FROM` mode](#fetch-mode) to move data. This makes tables queryable during data load, but is slower than `IMPORT INTO` mode. For details, see [Fetch mode](#fetch-mode).                                                                                                                                                                                                                                        |

## Usage

The following sections describe how to use the `molt fetch` [flags](#flags).

### Source and target databases

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

`--target` specifies the [CockroachDB connection string]({% link {{ page.version.version }}/connection-parameters.md %}#connect-using-a-url):

{% include_cached copy-clipboard.html %}
~~~
--target 'postgresql://{username}:{password}@{host}:{port}/{database}
~~~

### Fetch mode

MOLT Fetch can use either [`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %}) or [`COPY FROM`]({% link {{ page.version.version }}/copy-from.md %}) to move data to CockroachDB.

By default, MOLT Fetch uses `IMPORT INTO`:

- `IMPORT INTO` mode achieves the highest throughput, but [requires taking the tables **offline**]({% link {{ page.version.version }}/import-into.md %}#considerations) to achieve its import speed.
- `IMPORT INTO` mode supports compression using the `--compression` flag, which reduces the amount of storage used.

`--use-copy` configures MOLT Fetch to use `COPY FROM`:

- `COPY FROM` mode enables your tables to remain online and accessible. However, it is slower than using [`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %}).
- `COPY FROM` mode does not support compression.

{{site.data.alerts.callout_info}}
`COPY FROM` is also used in [direct copy mode](#direct-copy).
{{site.data.alerts.end}}

### Data path

MOLT Fetch can move the source data to CockroachDB via [cloud storage](#cloud-storage), a [local file server](#local-file-server), or [directly](#direct-copy) without an intermediate store.

#### Cloud storage

`--bucket-path` specifies that MOLT Fetch should write intermediate files to a path within a [Google Cloud Storage](https://cloud.google.com/storage/docs/buckets) or [Amazon S3](https://aws.amazon.com/s3/) bucket to which you have the necessary permissions. For example:

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

Cloud storage can be used with either the [`IMPORT INTO` or `COPY FROM` modes](#fetch-mode).

#### Local file server

`--local-path` specifies that MOLT Fetch should write intermediate files to a path within a [local file server]({% link {{ page.version.version }}/use-a-local-file-server.md %}). `local-path-listen-addr` specifies the address of the local file server. For example:

{% include_cached copy-clipboard.html %}
~~~
--local-path /migration/data/cockroach
--local-path-listen-addr 'localhost:3000'
~~~

In some cases, CockroachDB will not be able to use the local address specified by `--local-path-listen-addr`. This will depend on where CockroachDB is deployed, the runtime OS, and the source dialect.

For example, if you are migrating to CockroachDB {{ site.data.products.cloud }}, such that the {{ site.data.products.cloud }} cluster is in a different physical location than the machine running `molt fetch`, then CockroachDB cannot reach an address such as `localhost:3000`. In these situations, use `--local-path-crdb-access-addr` to specify an address for the local file server that is reachable by CockroachDB. For example:

{% include_cached copy-clipboard.html %}
~~~
--local-path /migration/data/cockroach
--local-path-listen-addr 'localhost:3000'
--local-path-crdb-access-addr '44.55.66.77:3000'
~~~

A local file server can be used with either the [`IMPORT INTO` or `COPY FROM` modes](#fetch-mode).

{{site.data.alerts.callout_success}}
[Cloud storage](#cloud-storage) is often preferable to a local file server, which can require considerable disk space.
{{site.data.alerts.end}}

#### Direct copy

`--direct-copy` specifies that MOLT Fetch should use `COPY FROM` to move the source data directly to CockroachDB without an intermediate store:

- Because the data is held in memory, the machine must have sufficient RAM for the amount of data being moved.
- Direct copy mode does not support compression or [continuation](#fetch-continuation).
- The [`--use-copy`](#fetch-mode) flag is redundant with `--direct-copy`.

### Schema and table selection

By default, MOLT Fetch moves all data from the [`--source`](#source-and-target-databases) database to CockroachDB. Use the following flags to move a subset of data.

`--schema-filter` specifies a range of schema objects to move to CockroachDB, based on a regex string. For example, to move every table in the source database's `public` schema:

{% include_cached copy-clipboard.html %}
~~~
--schema-filter 'public'
~~~

`--table-filter` specifies a range of tables to move to CockroachDB, based on a regex string. For example, to move every table in the source database that has "user" in the title:

{% include_cached copy-clipboard.html %}
~~~
--table-filter '\w*user\w*'
~~~

### Target table handling

`--table-handling` defines how MOLT Fetch loads data on the CockroachDB tables that [match the selection](#schema-and-table-selection).

To load the data without changing the existing data in the tables, use `'none'`:

{% include_cached copy-clipboard.html %}
~~~
--table-handling 'none'
~~~

To [truncate]({% link {{ page.version.version }}/truncate.md %}) tables before loading the data, use `'truncate-if-exists'`:

{% include_cached copy-clipboard.html %}
~~~
--table-handling 'truncate-if-exists'
~~~

To drop existing tables and create new tables before loading the data, use `'drop-on-target-and-recreate'`:

{% include_cached copy-clipboard.html %}
~~~
--table-handling 'drop-on-target-and-recreate'
~~~

With each option, MOLT Fetch creates a new CockroachDB table to load the source data if one does not exist.

### Fetch continuation

If `molt fetch` exits with an error after loading data from [cloud](#cloud-storage) or [local storage](#local-file-server), you can continue the process from the *continuation point* where it was interrupted.

To retry all data starting from the continuation point, include `--fetch-id` and specify the process ID from the `molt fetch` output.

{% include_cached copy-clipboard.html %}
~~~
--fetch-id d44762e5-6f70-43f8-8e15-58b4de10a007
~~~

To retry a specific table that failed, include both `--fetch-id` and `--continuation-token`. The latter flag specifies a token string that corresponds to a specific table on the source database. A continuation token is written in the `molt fetch` output for each failed table. If the fetch process encounters a subsequent error, it generates a new token for each failed table.

{{site.data.alerts.callout_info}}
This will retry only the table that corresponds to the continuation token. If the fetch process succeeds, there may still be source data that is not yet loaded onto CockroachDB.
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~
--fetch-id d44762e5-6f70-43f8-8e15-58b4de10a007
--continuation-token 011762e5-6f70-43f8-8e15-58b4de10a007
~~~

To retry all data starting from a specific file, include both `--fetch-id` and `--continuation-file-name`. The latter flag specifies the filename of an intermediate file in [cloud or local storage](#data-path). All filenames are prepended with `part_` and have the `.tar.gz` or `.csv` extension, depending on compression type (gzip by default). For example: 

{% include_cached copy-clipboard.html %}
~~~
--fetch-id d44762e5-6f70-43f8-8e15-58b4de10a007
--continuation-file-name part_00000003.tar.gz
~~~

{{site.data.alerts.callout_info}}
Continuation is not possible when using [direct copy mode](#direct-copy).
{{site.data.alerts.end}}

### CDC cursor

A change data capture (CDC) cursor is written to the output as `cdc_cursor` at the beginning and end of the fetch process. For example:

~~~ json
{"level":"info","type":"summary","fetch_id":"735a4fe0-c478-4de7-a342-cfa9738783dc","num_tables":1,"tables":["public.employees"],"cdc_cursor":"0/3F41E40","net_duration_ms":4879.890041,"net_duration":"000h 00m 04s","time":"2024-03-18T12:37:02-04:00","message":"fetch complete"}
~~~

You can use the `cdc_cursor` value with an external change data capture (CDC) tool to continuously replicate subsequent changes on the source data to CockroachDB.

## Examples

The following examples demonstrate how to issue `molt fetch` commands to load data onto CockroachDB. 

{{site.data.alerts.callout_success}}
After successfully running MOLT Fetch, you can run [`molt verify`]({% link {{ page.version.version }}/molt-verify.md %}) to confirm that replication worked successfully without missing or mismatched rows.
{{site.data.alerts.end}}

### Load PostgreSQL data via S3

The following `molt fetch` command uses `IMPORT INTO` to load a subset of tables from a PostgreSQL database to CockroachDB.

{% include_cached copy-clipboard.html %}
~~~ shell
molt fetch \
--source 'postgres://postgres:postgres@localhost/molt' \
--target 'postgres://root@localhost:26257/defaultdb?sslmode=verify-full' \
--table-handling 'truncate-if-exists' \
--table-filter 'employees' \
--bucket-path 's3://migration/data/cockroach' \
--cleanup
~~~

- `--table-handling` specifies that existing tables on CockroachDB should be truncated before the source data is loaded.
- `--table-filter` filters for tables with the `employees` string in the name.
- `--bucket-path` specifies a directory on an [Amazon S3 bucket](#data-path) where intermediate files will be written.
- `--cleanup` specifies that the intermediate files should be removed after the source data is loaded.

If the fetch process succeeds, the output displays a `fetch complete` message like the following:

~~~ json
{"level":"info","type":"summary","fetch_id":"f5cb422f-4bb4-4bbd-b2ae-08c4d00d1e7c","num_tables":1,"tables":["public.employees"],"cdc_cursor":"0/3F41E40","net_duration_ms":6752.847625,"net_duration":"000h 00m 06s","time":"2024-03-18T12:30:37-04:00","message":"fetch complete"}
~~~

If the fetch process encounters an error, it will exit and can be [continued](#continue-fetch-after-encountering-an-error).

### Load MySQL data via GCP

The following `molt fetch` command uses `COPY FROM` to load a subset of tables from a MySQL database to CockroachDB.

{% include_cached copy-clipboard.html %}
~~~ shell
molt fetch \
--source 'mysql://root:password@localhost/molt' \
--target 'postgres://root@localhost:26257/defaultdb?sslmode=verify-full' \
--table-handling 'truncate-if-exists' \
--table-filter 'employees' \
--bucket-path 'gs://migration/data/cockroach' \
--use-copy \
--cleanup
~~~

- `--table-handling` specifies that existing tables on CockroachDB should be truncated before the source data is loaded.
- `--table-filter` filters for tables with the `employees` string in the name.
- `--bucket-path` specifies a directory on an [Google Cloud Storage bucket](#data-path) where intermediate files will be written.
- `--use-copy` specifies that `COPY FROM` is used to load the tables, keeping the source tables online and queryable but loading the data more slowly than `IMPORT INTO`.
- `--cleanup` specifies that the intermediate files should be removed after the source data is loaded.

If the fetch process succeeds, the output displays a `fetch complete` message like the following:

~~~ json
{"level":"info","type":"summary","fetch_id":"f5cb422f-4bb4-4bbd-b2ae-08c4d00d1e7c","num_tables":1,"tables":["public.employees"],"cdc_cursor":"0/3F41E40","net_duration_ms":6752.847625,"net_duration":"000h 00m 06s","time":"2024-03-18T12:30:37-04:00","message":"fetch complete"}
~~~

If the fetch process encounters an error, it will exit and can be [continued](#continue-fetch-after-encountering-an-error).

### Load CockroachDB data via direct copy

The following `molt fetch` command uses `COPY FROM` to load all tables directly from one CockroachDB database to another.

{% include_cached copy-clipboard.html %}
~~~ shell
molt fetch \
--source 'postgres://root@localhost:26257/defaultdb?sslmode=verify-full' \
--target 'postgres://root@localhost:26258/defaultdb?sslmode=verify-full' \
--table-handling 'none' \
--direct-copy
~~~

- `--table-handling` specifies that existing tables on the target CockroachDB database should not be modified before the source data is loaded.
- `--direct-copy` specifies that `COPY FROM` is used to load the tables directly, without creating intermediate files.

### Continue fetch after encountering an error

If `molt fetch` encounters an error, it exits with an error message, fetch ID, and continuation token for each table that failed to load on the target database. You can use these values to [continue the fetch process](#fetch-continuation) from where it was interrupted.

~~~ json
{"level":"info","table":"public.tbl1","file_name":"shard_01_part_00000001.csv","message":"creating or updating token for duplicate key value violates unique constraint \"tbl1_pkey\"; Key (id)=(22) already exists."}
{"level":"info","table":"public.tbl1","continuation_token":"5e7c7173-101c-4539-9b8d-28fad37d0240","message":"created continuation token"}
{"level":"info","fetch_id":"87bf8dc0-803c-4e26-89d5-3352576f92a7","message":"continue from this fetch ID"}
~~~

To retry a specific table, reissue the initial `molt fetch` command and include the fetch ID and a continuation token:

{% include_cached copy-clipboard.html %}
~~~ shell
molt fetch \
... \
--fetch-id '87bf8dc0-803c-4e26-89d5-3352576f92a7' \
--continuation-token '5e7c7173-101c-4539-9b8d-28fad37d0240'
~~~

To retry all tables that failed, exclude `--continuation-token` from the command.

## See also

- [MOLT Verify]({% link {{ page.version.version }}/molt-verify.md %})
- [Migration Overview]({% link {{ page.version.version }}/migration-overview.md %})
- [Migrate from PostgreSQL]({% link {{ page.version.version }}/migrate-from-postgres.md %})
- [Migrate from MySQL]({% link {{ page.version.version }}/migrate-from-mysql.md %})
- [Migrate from CSV]({% link {{ page.version.version }}/migrate-from-csv.md %})
