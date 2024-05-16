---
title: MOLT Fetch
summary: Learn how to use the MOLT Fetch tool to move data from a source database to CockroachDB.
toc: true
docs_area: migrate
---

MOLT Fetch moves data from a source database into CockroachDB as part of a [database migration]({% link {{ page.version.version }}/migration-overview.md %}).

MOLT Fetch uses [`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %}) or [`COPY FROM`]({% link {{ page.version.version }}/copy-from.md %}) to move the source data to cloud storage (Google Cloud Storage or Amazon S3), a local file server, or local memory. Once the data is exported, MOLT Fetch loads the data onto a target CockroachDB database. For details, see [Usage](#usage).

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

- Follow the recommendations in [Best practices](#best-practices).

- Ensure that the source and target schemas are identical, unless you enable automatic schema creation with the [`'drop-on-target-and-recreate'`](#target-table-handling) option.

- Ensure that the SQL user running MOLT Fetch has [`SELECT` privileges]({% link {{ page.version.version }}/grant.md %}#supported-privileges) on the source and target CockroachDB databases, along with the required privileges to run [`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %}#required-privileges) or [`COPY FROM`]({% link {{ page.version.version }}/copy-from.md %}#required-privileges) (depending on the [fetch mode](#fetch-mode)) on CockroachDB, as described on their respective pages.

- If you plan to use continuous replication (using either [`--ongoing-replication`](#replication) or the [CDC cursor](#cdc-cursor)):

	- If you are migrating from PostgreSQL, enable logical replication. In `postgresql.conf` or in the SQL shell, set [`wal_level`](https://www.postgresql.org/docs/current/runtime-config-wal.html) to `logical`.

	- If you are migrating from MySQL, enable [GTID](https://dev.mysql.com/doc/refman/8.0/en/replication-options-gtids.html) consistency. In `mysql.cnf`, in the SQL shell, or as flags in the `mysql` start command, set `gtid-mode` and `enforce-gtid-consistency` to `ON` and set `binlog_row_metadata` to `full`.

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

## Best practices

- To prevent connections from prematurely terminating during data export, set the following to high values on the source database:

	- **Maximum allowed number of connections.** MOLT Fetch can export data across multiple connections. The number of connections it will create is the number of shards ([`--export-concurrency`](#global-flags)) multiplied by the number of tables ([`--table-concurrency`](#global-flags)) being exported concurrently.
	- **Maximum lifetime of a connection.** This is particularly important for MySQL sources, which can only use a single connection to move data. See the following note.

- If a MySQL database is set as a [source](#source-and-target-databases), the [`--table-concurrency`](#global-flags) and [`--export-concurrency`](#global-flags) flags **cannot** be set above `1`. If these values are changed, MOLT Fetch returns an error. This is required in order to guarantee consistency when moving data from MySQL, due to MySQL limitations. MySQL data is migrated to CockroachDB one table and shard at a time, using [`WITH CONSISTENT SNAPSHOT`](https://dev.mysql.com/doc/refman/8.0/en/commit.html) transactions.

## Commands

| Command |                                               Usage                                               |
|---------|---------------------------------------------------------------------------------------------------|
| `fetch` | Start the fetch process. This loads data from a source database to a target CockroachDB database. |

### Subcommands

The following subcommands are run after the `fetch` command.

|   Command    |                                Usage                                 |
|--------------|----------------------------------------------------------------------|
| `token list` | List active [continuation tokens](#list-active-continuation-tokens). |

## Flags

### Global flags

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
| `--export-concurrency`                        | Number of shards to export at a time, each on a dedicated thread. **Note:** The number of concurrent threads is the product of `--export-concurrency` and `--table-concurrency`. See [Best practices](#best-practices).<br><br>This value **cannot** be set higher than `1` when moving data from MySQL. See [Best practices](#best-practices).<br><br>**Default:** `4` with a PostgreSQL source; `1` with a MySQL source |
| `--fetch-id`                                  | Restart fetch process corresponding to the specified ID. If `--continuation-file-name` or `--continuation-token` are not specified, fetch restarts for all failed tables.                                                                                                                                                                                                                                                 |
| `--flush-rows`                                | Number of rows before the source data is flushed to intermediate files. **Note:** If `--flush-size` is also specified, the fetch behavior is based on the flag whose criterion is met first.                                                                                                                                                                                                                              |
| `--flush-size`                                | Size (in bytes) before the source data is flushed to intermediate files. **Note:** If `--flush-rows` is also specified, the fetch behavior is based on the flag whose criterion is met first.                                                                                                                                                                                                                             |
| `--local-path`                                | The path within the [local file server](#local-file-server) where intermediate files are written (e.g., `data/migration/cockroach`). `--local-path-listen-addr` must be specified.                                                                                                                                                                                                                                        |
| `--local-path-crdb-access-addr`               | Address of a [local file server](#local-file-server) that is reachable by CockroachDB. This flag is only necessary if CockroachDB cannot reach the local address specified with `--local-path-listen-addr` (e.g., when moving data to a CockroachDB {{ site.data.products.cloud }} deployment).<br><br>**Default:** Value of `--local-path-listen-addr`. `--local-path` and `--local-path-listen-addr` must be specified. |
| `--local-path-listen-addr`                    | Write intermediate files to a [local file server](#local-file-server) at the specified address (e.g., `'localhost:3000'`). `--local-path` must be specified.                                                                                                                                                                                                                                                              |
| `--log-file`                                  | Write messages to the specified log filename. If not specified, messages are only written to `stdout`.                                                                                                                                                                                                                                                                                                                    |
| `--logging`                                   | Level at which to log messages (`'trace'`/`'debug'`/`'info'`/`'warn'`/`'error'`/`'fatal'`/`'panic'`).<br><br>**Default:** `'info'`                                                                                                                                                                                                                                                                                        |
| `--metrics-listen-addr`                       | Address of the metrics endpoint.<br><br>**Default:** `'127.0.0.1:3030'`                                                                                                                                                                                                                                                                                                                                                   |
| `--non-interactive`                           | Run the fetch process without interactive prompts. This is recommended **only** when running `molt fetch` in an automated process (i.e., a job or continuous integration).                                                                                                                                                                                                                                                |
| `--ongoing-replication`                       | Enable continuous [replication](#replication) to begin after the fetch process succeeds (i.e., initial source data is loaded into CockroachDB).                                                                                                                                                                                                                                                                           |
| `--pglogical-replication-slot-drop-if-exists` | Drop the replication slot, if specified with `--pglogical-replication-slot-name`. Otherwise, the default replication slot is not dropped.                                                                                                                                                                                                                                                                                 |
| `--pglogical-replication-slot-name`           | The name of a replication slot to create before taking a snapshot of data (e.g., `'fetch'`). **Required** in order to perform continuous [replication](#replication) from a source PostgreSQL database.                                                                                                                                                                                                                   |
| `--pglogical-replication-slot-plugin`         | The output plugin used for logical replication under `--pglogical-replication-slot-name`.<br><br>**Default:** `pgoutput`                                                                                                                                                                                                                                                                                                  |
| `--pprof-listen-addr`                         | Address of the pprof endpoint.<br><br>**Default:** `'127.0.0.1:3031'`                                                                                                                                                                                                                                                                                                                                                     |
| `--replicator-flags`                          | If continuous [replication](#replication) is enabled with `--ongoing-replication`, specify Replicator flags ([PostgreSQL](https://github.com/cockroachdb/replicator/wiki/PGLogical#postgresql-logical-replication) or [MySQL](https://github.com/cockroachdb/replicator/wiki/MYLogical#mysqlmariadb-replication)) to override.                                                                                            |
| `--row-batch-size`                            | Number of rows to select at a time for export from the source database.<br><br>**Default:** `100000`                                                                                                                                                                                                                                                                                                                      |
| `--schema-filter`                             | Move schemas that match a specified [regular expression](https://wikipedia.org/wiki/Regular_expression).<br><br>**Default:** `'.*'`                                                                                                                                                                                                                                                                                       |
| `--table-concurrency`                         | Number of tables to export at a time. **Note:** The number of concurrent threads is the product of `--export-concurrency` and `--table-concurrency`. See [Best practices](#best-practices).<br><br>This value **cannot** be set higher than `1` when moving data from MySQL. See [Best practices](#best-practices).<br><br>**Default:** `4` with a PostgreSQL source; `1` with a MySQL source                             |
| `--table-filter`                              | Move tables that match a specified [regular expression](https://wikipedia.org/wiki/Regular_expression).<br><br>**Default:** `'.*'`                                                                                                                                                                                                                                                                                        |
| `--table-handling`                            | How tables are initialized on the target database (`'none'`/`'drop-on-target-and-recreate'`/`'truncate-if-exists'`). For details, see [Target table handling](#target-table-handling).<br><br>**Default:** `'none'`                                                                                                                                                                                                       |
| `--type-map-file`                             | Path to a JSON file that contains explicit type mappings for automatic schema creation, when enabled with `--table-handling 'drop-on-target-and-recreate'`. For details on the JSON format and valid type mappings, see [type mapping](#type-mapping).                                                                                                                                                                    |
| `--use-console-writer`                        | Use the console writer, which has cleaner log output but introduces more latency.<br><br>**Default:** `false` (log as structured JSON)                                                                                                                                                                                                                                                                                    |
| `--use-copy`                                  | Use [`COPY FROM` mode](#fetch-mode) to move data. This makes tables queryable during data load, but is slower than `IMPORT INTO` mode. For details, see [Fetch mode](#fetch-mode).                                                                                                                                                                                                                                        |

### `token list` flags

|          Flag         |                                                                 Description                                                                 |
|-----------------------|---------------------------------------------------------------------------------------------------------------------------------------------|
| `--conn-string`       | (Required) Connection string for the target database. For details, see [List active continuation tokens](#list-active-continuation-tokens). |
| `-n`, `--num-results` | Number of results to return.                                                                                                                |

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

When using the `'drop-on-target-and-recreate'` option, MOLT Fetch creates a new CockroachDB table to load the source data if one does not already exist. To guide the automatic schema creation, you can [explicitly map source types to CockroachDB types](#type-mapping).

#### Type mapping

If [`'drop-on-target-and-recreate'`](#target-table-handling) is set, MOLT Fetch automatically creates a CockroachDB schema that is compatible with the source data. The column types are determined as follows:

- PostgreSQL types are mapped to existing CockroachDB [types]({% link {{ page.version.version }}/data-types.md %}) that have the same [`OID`]({% link {{ page.version.version }}/oid.md %}).
- The following MySQL types are mapped to corresponding CockroachDB types:

	|                      MySQL type                     |                                                CockroachDB type                                                |
	|-----------------------------------------------------|----------------------------------------------------------------------------------------------------------------|
	| `CHAR`, `CHARACTER`, `VARCHAR`, `NCHAR`, `NVARCHAR` | [`VARCHAR`]({% link {{ page.version.version }}/string.md %})                                                   |
	| `TINYTEXT`, `TEXT`, `MEDIUMTEXT`, `LONGTEXT`        | [`STRING`]({% link {{ page.version.version }}/string.md %})                                                    |
	| `GEOMETRY`                                          | [`GEOMETRY`]({% link {{ page.version.version }}/architecture/glossary.md %}#geometry)                          |
	| `LINESTRING`                                        | [`LINESTRING`]({% link {{ page.version.version }}/linestring.md %})                                            |
	| `POINT`                                             | [`POINT`]({% link {{ page.version.version }}/point.md %})                                                      |
	| `POLYGON`                                           | [`POLYGON`]({% link {{ page.version.version }}/polygon.md %})                                                  |
	| `MULTIPOINT`                                        | [`MULTIPOINT`]({% link {{ page.version.version }}/multipoint.md %})                                            |
	| `MULTILINESTRING`                                   | [`MULTILINESTRING`]({% link {{ page.version.version }}/multilinestring.md %})                                  |
	| `MULTIPOLYGON`                                      | [`MULTIPOLYGON`]({% link {{ page.version.version }}/multipolygon.md %})                                        |
	| `GEOMETRYCOLLECTION`, `GEOMCOLLECTION`              | [`GEOMETRYCOLLECTION`]({% link {{ page.version.version }}/geometrycollection.md %})                            |
	| `JSON`                                              | [`JSONB`]({% link {{ page.version.version }}/jsonb.md %})                                                      |
	| `TINYINT`, `INT1`                                   | [`INT2`]({% link {{ page.version.version }}/int.md %})                                                         |
	| `BLOB`                                              | [`BYTES`]({% link {{ page.version.version }}/bytes.md %})                                                      |
	| `SMALLINT`, `INT2`                                  | [`INT2`]({% link {{ page.version.version }}/int.md %})                                                         |
	| `MEDIUMINT`, `INT`, `INTEGER`, `INT4`               | [`INT4`]({% link {{ page.version.version }}/int.md %})                                                         |
	| `BIGINT`, `INT8`                                    | [`INT`]({% link {{ page.version.version }}/int.md %})                                                          |
	| `FLOAT`                                             | [`FLOAT4`]({% link {{ page.version.version }}/float.md %})                                                     |
	| `DOUBLE`                                            | [`FLOAT`]({% link {{ page.version.version }}/float.md %})                                                      |
	| `DECIMAL`, `NUMERIC`, `REAL`                        | [`DECIMAL`]({% link {{ page.version.version }}/decimal.md %}) (Negative scale values are autocorrected to `0`) |
	| `BINARY`, `VARBINARY`                               | [`BYTES`]({% link {{ page.version.version }}/bytes.md %})                                                      |
	| `DATETIME`                                          | [`TIMESTAMP`]({% link {{ page.version.version }}/timestamp.md %})                                              |
	| `TIMESTAMP`                                         | [`TIMESTAMPTZ`]({% link {{ page.version.version }}/timestamp.md %})                                            |
	| `TIME`                                              | [`TIME`]({% link {{ page.version.version }}/time.md %})                                                        |
	| `BIT`                                               | [`VARBIT`]({% link {{ page.version.version }}/bit.md %})                                                       |
	| `DATE`                                              | [`DATE`]({% link {{ page.version.version }}/date.md %})                                                        |
	| `TINYBLOB`, `MEDIUMBLOB`, `LONGBLOB`                | [`BYTES`]({% link {{ page.version.version }}/bytes.md %})                                                      |
	| `BOOL`, `BOOLEAN`                                   | [`BOOL`]({% link {{ page.version.version }}/bool.md %})                                                        |
	| `ENUM`                                              | [`ANY_ENUM`]({% link {{ page.version.version }}/enum.md %})                                                    |

- Source types can be explicitly mapped to target CockroachDB types, thus overriding the preceding default mappings for automatic schema creation. These are specified using a JSON file and `--type-map-file`. The allowable custom mappings are valid CockroachDB aliases, casts, and the following mappings specific to MOLT Fetch and [Verify]({% link {{ page.version.version }}/molt-verify.md %}):

	- [`TIMESTAMP`]({% link {{ page.version.version }}/timestamp.md %}) <> [`TIMESTAMPTZ`]({% link {{ page.version.version }}/timestamp.md %})
	- [`VARCHAR`]({% link {{ page.version.version }}/string.md %}) <> [`UUID`]({% link {{ page.version.version }}/uuid.md %})
	- [`BOOL`]({% link {{ page.version.version }}/bool.md %}) <> [`INT2`]({% link {{ page.version.version }}/int.md %})
	- [`VARBIT`]({% link {{ page.version.version }}/bit.md %}) <> [`TEXT`]({% link {{ page.version.version }}/string.md %})
	- [`JSONB`]({% link {{ page.version.version }}/jsonb.md %}) <> [`TEXT`]({% link {{ page.version.version }}/string.md %})
	- [`INET`]({% link {{ page.version.version }}/inet.md %}) <> [`TEXT`]({% link {{ page.version.version }}/string.md %})

`--type-map-file` specifies the path to the JSON file containing the explicit type mappings. For example:

{% include_cached copy-clipboard.html %}
~~~
--type-map-file 'type-mappings.json'
~~~

The JSON is formatted as follows:

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

### Fetch continuation

If `molt fetch` fails while loading data into CockroachDB from intermediate files, it exits with an error message, fetch ID, and [continuation token](#list-active-continuation-tokens) for each table that failed to load on the target database. You can use this information to continue the process from the *continuation point* where it was interrupted. For an example, see [Continue fetch after encountering an error](#continue-fetch-after-encountering-an-error).

Continuation is only possible under the following conditions:

- All data has been exported from the source database into intermediate files on [cloud](#cloud-storage) or [local storage](#local-file-server).
- The *initial load* of source data to the target CockroachDB database is incomplete. This means that ongoing [replication](#replication) of source data has not begun.

{{site.data.alerts.callout_info}}
Only one fetch ID and set of continuation tokens, each token corresponding to a table, are active at any time. See [List active continuation tokens](#list-active-continuation-tokens).
{{site.data.alerts.end}}

To retry all data starting from the continuation point, reissue the `molt fetch` command and include the `--fetch-id`.

{% include_cached copy-clipboard.html %}
~~~
--fetch-id d44762e5-6f70-43f8-8e15-58b4de10a007
~~~

To retry a specific table that failed, include both `--fetch-id` and `--continuation-token`. The latter flag specifies a token string that corresponds to a specific table on the source database. A continuation token is written in the `molt fetch` output for each failed table. If the fetch process encounters a subsequent error, it generates a new token for each failed table. See [List active continuation tokens](#list-active-continuation-tokens).

{{site.data.alerts.callout_info}}
This will retry only the table that corresponds to the continuation token. If the fetch process succeeds, there may still be source data that is not yet loaded into CockroachDB.
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
Continuation is not possible when using [direct copy mode](#direct-copy).
{{site.data.alerts.end}}

#### List active continuation tokens

To view all active continuation tokens, issue a `molt fetch token list` command along with `--conn-string`, which specifies the [connection string]({% link {{ page.version.version }}/connection-parameters.md %}#connect-using-a-url) for the target CockroachDB database. For example:

{% include_cached copy-clipboard.html %}
~~~ shell
molt fetch token list \
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

### Replication

`--ongoing-replication` enables logical replication from the source database to the target CockroachDB database. 

{% include_cached copy-clipboard.html %}
~~~
--ongoing-replication
~~~

When the `--ongoing-replication` flag is set, changes on the source database are continuously replicated on CockroachDB. This begins only after the fetch process succeeds—i.e., the initial source data is loaded into CockroachDB—as indicated by a `fetch complete` message in the output.

Before using this feature, complete the following:

- Install the Replicator binary. Before running `molt fetch` with continuous replication, [download the binary that matches your system](https://github.com/cockroachdb/replicator/wiki/Installing#automated-builds). The Replicator binary **must** be located in the same directory as your [`molt` binary](#installation).
- Configure the source PostgreSQL or MySQL database for continuous replication, as described in [Setup](#setup).

If the source is a PostgreSQL database, you must also specify a replication slot name:

{% include_cached copy-clipboard.html %}
~~~
--ongoing-replication
--pglogical-replication-slot-name 'replication_slot'
~~~

If you need to customize the Replicator behavior, use `--replicator-flags` to specify one or more Replicator flags ([PostgreSQL](https://github.com/cockroachdb/replicator/wiki/PGLogical#postgresql-logical-replication) or [MySQL](https://github.com/cockroachdb/replicator/wiki/MYLogical#mysqlmariadb-replication)) to override. This will only be necessary for advanced use cases.

{% include_cached copy-clipboard.html %}
~~~
--ongoing-replication
--replicator-flags "--applyTimeout '1h' --parallelism 64"
~~~

To cancel replication, enter `ctrl-c` to issue a `SIGTERM` signal. This returns an exit code `0`. If replication fails, a non-zero exit code is returned.

### CDC cursor

A change data capture (CDC) cursor is written to the output as `cdc_cursor` at the beginning and end of the fetch process. For example:

~~~ json
{"level":"info","type":"summary","fetch_id":"735a4fe0-c478-4de7-a342-cfa9738783dc","num_tables":1,"tables":["public.employees"],"cdc_cursor":"0/3F41E40","net_duration_ms":4879.890041,"net_duration":"000h 00m 04s","time":"2024-03-18T12:37:02-04:00","message":"fetch complete"}
~~~

You can use the `cdc_cursor` value with an external change data capture (CDC) tool to continuously replicate subsequent changes on the source data to CockroachDB.

## Examples

The following examples demonstrate how to issue `molt fetch` commands to load data into CockroachDB. 

{{site.data.alerts.callout_success}}
After successfully running MOLT Fetch, you can run [`molt verify`]({% link {{ page.version.version }}/molt-verify.md %}) to confirm that replication worked successfully without missing or mismatched rows.
{{site.data.alerts.end}}

### Load PostgreSQL data via S3 with ongoing replication

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
--ongoing-replication
~~~

- `--table-handling` specifies that existing tables on CockroachDB should be truncated before the source data is loaded.
- `--table-filter` filters for tables with the `employees` string in the name.
- `--bucket-path` specifies a directory on an [Amazon S3 bucket](#data-path) where intermediate files will be written.
- `--cleanup` specifies that the intermediate files should be removed after the source data is loaded.
- `--pglogical-replication-slot-name` specifies a replication slot name to be created on the source PostgreSQL database. This is used in continuous [replication](#replication).
- `--ongoing-replication` starts continuous [replication](#replication) of data from the source database to CockroachDB after the fetch process succeeds.

If the fetch process succeeds, the output displays a `fetch complete` message like the following:

~~~ json
{"level":"info","type":"summary","fetch_id":"f5cb422f-4bb4-4bbd-b2ae-08c4d00d1e7c","num_tables":1,"tables":["public.employees"],"cdc_cursor":"0/3F41E40","net_duration_ms":6752.847625,"net_duration":"000h 00m 06s","time":"2024-03-18T12:30:37-04:00","message":"fetch complete"}
~~~

{{site.data.alerts.callout_info}}
If the fetch process encounters an error, it will exit and can be [continued](#continue-fetch-after-encountering-an-error).
{{site.data.alerts.end}}

Continuous [replication](#replication) begins immediately afterward:

~~~ json
{"level":"info","time":"2024-05-13T14:33:07-04:00","message":"starting replicator"}
{"level":"info","time":"2024-05-13T14:36:22-04:00","message":"creating publication"}
~~~

To cancel replication, enter `ctrl-c` to issue a `SIGTERM` signal.

### Load MySQL data via GCP with ongoing replication

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
- `--ongoing-replication` starts continuous [replication](#replication) of data from the source database to CockroachDB after the fetch process succeeds.

If the fetch process succeeds, the output displays a `fetch complete` message like the following:

~~~ json
{"level":"info","type":"summary","fetch_id":"f5cb422f-4bb4-4bbd-b2ae-08c4d00d1e7c","num_tables":1,"tables":["public.employees"],"cdc_cursor":"0/3F41E40","net_duration_ms":6752.847625,"net_duration":"000h 00m 06s","time":"2024-03-18T12:30:37-04:00","message":"fetch complete"}
~~~

{{site.data.alerts.callout_info}}
If the fetch process encounters an error, it will exit and can be [continued](#continue-fetch-after-encountering-an-error).
{{site.data.alerts.end}}

Continuous [replication](#replication) begins immediately afterward:

~~~ json
{"level":"info","time":"2024-05-13T14:33:07-04:00","message":"starting replicator"}
~~~

To cancel replication, enter `ctrl-c` to issue a `SIGTERM` signal.

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

If the fetch process encounters an error, it exits with an error message, fetch ID, and continuation token for each table that failed to load on the target database. You can use these values to [continue the fetch process](#fetch-continuation) from where it was interrupted.

~~~ json
{"level":"info","table":"public.tbl1","file_name":"shard_01_part_00000001.csv","message":"creating or updating token for duplicate key value violates unique constraint \"tbl1_pkey\"; Key (id)=(22) already exists."}
{"level":"info","table":"public.tbl1","continuation_token":"5e7c7173-101c-4539-9b8d-28fad37d0240","message":"created continuation token"}
{"level":"info","fetch_id":"87bf8dc0-803c-4e26-89d5-3352576f92a7","message":"continue from this fetch ID"}
~~~

To retry a specific table, reissue the initial `molt fetch` command and include the fetch ID and a continuation token:

{{site.data.alerts.callout_success}}
To list all active continuation tokens, run a `molt fetch token list` command. See [List active continuation tokens](#list-active-continuation-tokens).
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

- [MOLT Verify]({% link {{ page.version.version }}/molt-verify.md %})
- [Migration Overview]({% link {{ page.version.version }}/migration-overview.md %})
- [Migrate from PostgreSQL]({% link {{ page.version.version }}/migrate-from-postgres.md %})
- [Migrate from MySQL]({% link {{ page.version.version }}/migrate-from-mysql.md %})
- [Migrate from CSV]({% link {{ page.version.version }}/migrate-from-csv.md %})
