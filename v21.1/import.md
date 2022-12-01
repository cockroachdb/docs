---
title: IMPORT
summary: The IMPORT statement imports various types of data into CockroachDB.
toc: true
keywords: gin, gin index, gin indexes, inverted index, inverted indexes, accelerated index, accelerated indexes
---

The `IMPORT` [statement](sql-statements.html) imports the following types of data into CockroachDB:

- [Avro][avro]
- [CSV/TSV][csv]
- [PostgreSQL dump files][postgres]
- [MySQL dump files][mysql]
- [CockroachDB dump files](cockroach-dump.html)
- [Delimited data files](#delimited-data-files)

{% include {{ page.version.version }}/import-table-deprecate.md %}

## Considerations

- `IMPORT` is a blocking statement. To run an import job asynchronously, use the [`DETACHED`](#options-detached) option.
- `IMPORT` cannot be used within a [rolling upgrade](upgrade-cockroach-version.html).
- As of v21.2, certain `IMPORT TABLE` statements that defined the table schema inline are **deprecated**. These include running `IMPORT TABLE ... CREATE USING` and `IMPORT TABLE` with any non-bundle format (`CSV`, `DELIMITED`, `PGCOPY`, or `AVRO`) data types. Instead, use `CREATE TABLE` and `IMPORT INTO`; see this [example](import-into.html#import-into-a-new-table-from-a-csv-file) for more detail.
- `IMPORT` can only import data to a new table. For information on how to import into existing tables, see [`IMPORT INTO`](import-into.html).
- For instructions and working examples on how to migrate data from other databases, see the [Migration Overview](migration-overview.html).
- `IMPORT` cannot be used with [user-defined types](create-type.html). Use [`IMPORT INTO`](import-into.html) instead.
- {% include {{page.version.version}}/sql/import-into-regional-by-row-table.md %}

{{site.data.alerts.callout_success}}
Optimize import operations in your applications by following our [Import Performance Best Practices](import-performance-best-practices.html).
{{site.data.alerts.end}}

## Required privileges

#### Table privileges

The user must have the `CREATE` [privileges](authorization.html#assign-privileges) on the target database.

#### Source privileges

{% include {{ page.version.version }}/misc/source-privileges.md %}

## Synopsis

**Import a table from CSV or Avro**

<div>
{% include {{ page.version.version }}/sql/generated/diagrams/import_csv.html %}
</div>

**Import a database or table from dump file**

<div>
{% include {{ page.version.version }}/sql/generated/diagrams/import_dump.html %}
</div>

## Parameters

### For import from CSV or Avro

Parameter | Description
----------|------------
`table_name` | The name of the table you want to import/create.
`table_elem_list` | The table schema you want to use.
`CREATE USING file_location` | If not specifying the table schema inline via `table_elem_list`, this is the [URL](#import-file-location) of a SQL file containing the table schema.
`file_location` | The [URL](#import-file-location) of a CSV file containing the table data. This can be [a comma-separated list of URLs to CSV files](#using-a-comma-separated-list) or [specified by a `*` wildcard character](#using-a-wildcard) to include matching files under the specified path.
`WITH kv_option_list` | Control your import's behavior with [these options](#import-options).

### For import from dump file

Parameter | Description
----------|------------
`table_name` | The name of the table you want to import/create. Use this when the dump file contains a specific table. Leave out `TABLE table_name FROM` when the dump file contains an entire database.
`import_format` | [`PGDUMP`](#import-a-postgresql-database-dump), [`MYSQLDUMP`](#import-a-mysql-database-dump), or [`DELIMITED DATA`](#delimited-data-files)
`file_location` | The [URL](#import-file-location) of a dump file you want to import.
`WITH kv_option_list` | Control your import's behavior with [these options](#import-options).

#### Delimited data files

The `DELIMITED DATA` format can be used to import delimited data from any text file type, while ignoring characters that need to be escaped, like the following:

- The file's delimiter (`\t` by default)
- Double quotes (`"`)
- Newline (`\n`)
- Carriage return (`\r`)

For examples showing how to use the `DELIMITED DATA` format, see the [Examples](#import-a-delimited-data-file) section below.

### Import options

You can control the `IMPORT` process's behavior using any of the following optional key-value pairs as a `kv_option`. To set multiple import options, use a comma-separated list ([see examples](#import-a-delimited-data-file)).

<a name="delimiter"></a>

Key                 | <div style="width:130px">Context</div> | Value                                                                                                                             |
--------------------+-----------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
`delimiter`            | `CSV DATA `     | The unicode character that delimits columns in your rows. **Default: `,`**.
`comment`              | `CSV DATA `     | The unicode character that identifies rows to skip.
`strict_quotes`        | `CSV DATA`      | Use if CSV import files have quotes (`""`) within rows to prevent multiple rows from being treated as single rows. **Default:** Off
`nullif`               | `CSV DATA `, [`DELIMITED DATA`](#delimited-data-files) | The string that should be converted to *NULL*.
`skip`                 | `CSV DATA `, [`DELIMITED DATA`](#delimited-data-files) | The number of rows to be skipped while importing a file. **Default: `'0'`**.
`decompress`           | General         | The decompression codec to be used: `gzip`, `bzip`, `auto`, or `none`.  **Default: `'auto'`**, which guesses based on file extension (`.gz`, `.bz`, `.bz2`). `none` disables decompression.
`row_limit`           | General         |**New in v21.1:** The number of rows to import. Useful for doing a test run of an import and finding errors quickly. For non-bundled formats, setting `row_limit = 'n'` will import the first *n* rows of a table. For bundled formats, this option will import the first *n* rows from each table in the dump file.
`skip_foreign_keys`    | `PGDUMP`, `MYSQLDUMP` | Ignore foreign key constraints in the dump file's DDL. **Default:** Off.  May be necessary to import a table with unsatisfied foreign key constraints from a full database dump.
`max_row_size`         | `PGDUMP`        | Override limit on line size. **Default: 0.5MB**.  This setting may need to be tweaked if your PostgreSQL dump file has extremely long lines, for example as part of a `COPY` statement.
`ignore_unsupported_statements` | `PGDUMP`  | **New in v21.1:** Ignore SQL statements in the dump file that are unsupported by CockroachDB.
`log_ignored_statements` | `PGDUMP` | **New in v21.1:** Log unsupported statements when using `ignore_unsupported_statements` to a specified destination (i.e., [cloud storage](use-cloud-storage-for-bulk-operations.html) or [userfile storage](use-userfile-for-bulk-operations.html).
`rows_terminated_by`   | [`DELIMITED DATA`](#delimited-data-files)  | The unicode character to indicate new lines in the input file. **Default:** `\n`
`fields_terminated_by` | [`DELIMITED DATA`](#delimited-data-files)  | The unicode character used to separate fields in each input line. **Default:** `\t`
`fields_enclosed_by`   | [`DELIMITED DATA`](#delimited-data-files)  | The unicode character that encloses fields. **Default:** `"`
`fields_escaped_by`    | [`DELIMITED DATA`](#delimited-data-files)  | The unicode character, when preceding one of the above `DELIMITED DATA` options, to be interpreted literally.
`strict_validation`    | `AVRO DATA`    | Rejects Avro records that do not have a one-to-one mapping between Avro fields to the target CockroachDB schema. By default, CockroachDB ignores unknown Avro fields and sets missing SQL fields to `NULL`. CockroachDB will also attempt to convert the Avro field to the CockroachDB [data type][datatypes]; otherwise, it will report an error.
`records_terminated_by` | `AVRO DATA`   | The unicode character to indicate new lines in the input binary or JSON file. This is not needed for Avro OCF. <br><br>**Default:** `\n`
`data_as_binary_records` | `AVRO DATA`  | Use when [importing a binary file containing Avro records](migrate-from-avro.html#import-binary-or-json-records).  The schema is not included in the file, so you need to specify the schema with either the `schema` or `schema_uri` option.
`data_as_json_records` | `AVRO DATA`    | Use when [importing a JSON file containing Avro records](migrate-from-avro.html#import-binary-or-json-records). The schema is not included in the file, so you need to specify the schema with either the `schema` or `schema_uri` option.
`schema`               | `AVRO DATA`    | The schema of the Avro records included in the binary or JSON file. This is not needed for Avro OCF.
`schema_uri`           | `AVRO DATA`    | The URI of the file containing the schema of the Avro records include in the binary or JSON file. This is not needed for Avro OCF.
<a name="options-detached"></a>`DETACHED`             | N/A            | **New in v21.1:** When an import runs in `DETACHED` mode, it will execute asynchronously and the job ID will be returned immediately without waiting for the job to finish. Note that with `DETACHED` specified, further job information and the job completion status will not be returned. For more on the differences between the returned job data, see the [example](import.html#run-an-import-within-a-transaction) below. To check on the job status, use the [`SHOW JOBS`](show-jobs.html) statement. <br><br>To run an import within a [transaction](transactions.html), use the `DETACHED` option.

For examples showing how to use these options, see the [Examples](#examples) section below.

For instructions and working examples showing how to migrate data from other databases and formats, see the [Migration Overview](migration-overview.html).

## Requirements

### Prerequisites

Before using `IMPORT`, you should have:

- The schema of the table you want to import.
- The data you want to import, preferably hosted on cloud storage. This location must be equally accessible to all nodes using the same import file location.  This is necessary because the `IMPORT` statement is issued once by the client, but is executed concurrently across all nodes of the cluster.  For more information, see the [Import file location](#import-file-location) section below.

For more information on details to consider when running an IMPORT, see [Considerations](#considerations).

### Import targets

{% include {{ page.version.version }}/import-table-deprecate.md %}

To use `IMPORT` in v21.1 and prior, imported tables must not exist and must be created in the `IMPORT` statement. If the table you want to import already exists, you must drop it with [`DROP TABLE`](drop-table.html) or use [`IMPORT INTO`](import-into.html).

You can specify the target database in the table name in the `IMPORT` statement. If it's not specified there, the active database in the SQL session is used.

### Create table

Your `IMPORT` statement must reference a `CREATE TABLE` statement representing the schema of the data you want to import.  You have several options:

- Specify the table's columns explicitly from the [SQL client](cockroach-sql.html). For an example, see [Import a table from a CSV file](#import-a-table-from-a-csv-file) below.

- Load a file that already contains a `CREATE TABLE` statement. For an example, see [Import a PostgreSQL database dump](#import-a-postgresql-database-dump) below.

- **Recommended**: Since `IMPORT TABLE` will be deprecated from v21.2, use [`CREATE TABLE`](create-table.html) followed by [`IMPORT INTO`](import-into.html). For an example, see [Import into a new table from a CSV file](import-into.html#import-into-a-new-table-from-a-csv-file).

We also recommend [specifying all secondary indexes you want to use in the `CREATE TABLE` statement](create-table.html#create-a-table-with-secondary-and-gin-indexes). It is possible to [add secondary indexes later](create-index.html), but it is significantly faster to specify them during import.

{{site.data.alerts.callout_info}}
 `IMPORT` supports [computed columns](computed-columns.html) for Avro and PostgreSQL dump files only. To import CSV data to a table with a computed column or `DEFAULT` expression, use [`IMPORT INTO`](import-into.html).
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
By default, the [PostgreSQL][postgres] and [MySQL][mysql] import formats support foreign keys. However, the most common dependency issues during import are caused by unsatisfied foreign key relationships that cause errors like `pq: there is no unique constraint matching given keys for referenced table tablename`. You can avoid these issues by adding the [`skip_foreign_keys`](#import-options) option to your `IMPORT` statement as needed. Ignoring foreign constraints will also speed up data import.
{{site.data.alerts.end}}

### Available storage

Each node in the cluster is assigned an equal part of the imported data, and so must have enough temp space to store it. In addition, data is persisted as a normal table, and so there must also be enough space to hold the final, replicated data. The node's first-listed/default [`store`](cockroach-start.html#store) directory must have enough available storage to hold its portion of the data.

On [`cockroach start`](cockroach-start.html), if you set `--max-disk-temp-storage`, it must also be greater than the portion of the data a node will store in temp space.

### Import file location

CockroachDB uses the URL provided to construct a secure API call to the service you specify. The URL structure depends on the type of file storage you are using. For more information, see the following:

- [Use Cloud Storage for Bulk Operations](use-cloud-storage-for-bulk-operations.html)
- [Use `userfile` for Bulk Operations](use-userfile-for-bulk-operations.html)
- [Use a Local File Server for Bulk Operations](use-a-local-file-server-for-bulk-operations.html)

### Table users and privileges

Imported tables are treated as new tables, so you must [`GRANT`](grant.html) privileges to them.

## Performance

- All nodes are used during the import job, which means all nodes' CPU and RAM will be partially consumed by the `IMPORT` task in addition to serving normal traffic.
- To improve performance, import at least as many files as you have nodes (i.e., there is at least one file for each node to import) to increase parallelism.
- To further improve performance, order the data in the imported files by [primary key](primary-key.html) and ensure the primary keys do not overlap between files.

For more detail on optimizing import performance, see [Import Performance Best Practices](import-performance-best-practices.html).

## Viewing and controlling import jobs

After CockroachDB initiates an import, you can view its progress with [`SHOW JOBS`](show-jobs.html) and on the [**Jobs** page](ui-jobs-page.html) of the DB Console, and you can control it with [`PAUSE JOB`](pause-job.html), [`RESUME JOB`](resume-job.html), and [`CANCEL JOB`](cancel-job.html).

{{site.data.alerts.callout_info}}
If initiated correctly, the statement returns when the import is finished or if it encounters an error. In some cases, the import can continue after an error has been returned (the error message will tell you that the import has resumed in the background).

 When [resumed](resume-job.html), [paused](pause-job.html) imports now continue from their internally recorded progress instead of starting over.
{{site.data.alerts.end}}

## Examples

{% include {{ page.version.version }}/backups/bulk-auth-options.md %}

{% include {{ page.version.version }}/import-table-deprecate.md %}

### Import a table from a CSV file

To specify the table schema in-line:

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (
		id UUID PRIMARY KEY,
		name TEXT,
		INDEX name_idx (name)
)
CSV DATA ('s3://{BUCKET NAME}/{customers.csv}?AWS_ACCESS_KEY_ID={ACCESS KEY}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}')
;
~~~

To use a file to specify the table schema:

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers
CREATE USING 's3://{BUCKET NAME}/{customers-create-table.sql}?AWS_ACCESS_KEY_ID={ACCESS KEY}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}'
CSV DATA ('s3://{BUCKET NAME}/{customers.csv}?AWS_ACCESS_KEY_ID={ACCESS_KEY}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}')
;
~~~

{% include {{ page.version.version }}/misc/csv-import-callout.md %}

### Import a table from multiple CSV files

#### Using a comma-separated list

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (
		id UUID PRIMARY KEY,
		name TEXT,
		INDEX name_idx (name)
)
CSV DATA (
    's3://{BUCKET NAME}/{customers.csv}?AWS_ACCESS_KEY_ID={ACCESS KEY}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}',
    's3://{BUCKET NAME}/{customers2.csv}?AWS_ACCESS_KEY_ID={ACCESS KEY}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}',
    's3://{BUCKET NAME}/{customers3.csv}?AWS_ACCESS_KEY_ID={ACCESS KEY}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}',
    's3://{BUCKET NAME}/{customers4.csv}?AWS_ACCESS_KEY_ID={ACCESS KEY}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}',
);
~~~

#### Using a wildcard

You can specify [file patterns to match](https://golang.org/pkg/path/filepath/#Match) instead of explicitly listing every file. Paths are matched using the `*` wildcard character to include matching files directly under the specified path. A wildcard can be used to include:

- All files in a given directory (e.g.,`s3://bucket-name/path/to/data/*`)
- All files in a given directory that end with a given string (e.g., `s3://bucket-name/files/*.csv`)
- All files in a given directory that start with a given string (e.g., `s3://bucket-name/files/data*`)
- All files in a given directory that start and end with a given string (e.g., `s3://bucket-name/files/data*.csv`)

These only match files directly under the specified path and do not descend into additional directories recursively.

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (
		id UUID PRIMARY KEY,
		name TEXT,
		INDEX name_idx (name)
)
CSV DATA (
    's3://{BUCKET NAME}/*?AWS_ACCESS_KEY_ID={ACCESS KEY}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}'
);
~~~

### Import a table from a TSV file

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (
		id UUID PRIMARY KEY,
		name TEXT,
		INDEX name_idx (name)
)
CSV DATA ('s3://{BUCKET NAME}/{customers.tsv}?AWS_ACCESS_KEY_ID={ACCESS KEY}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}')
WITH
	delimiter = e'\t'
;
~~~

### Skip commented lines

The `comment` option determines which Unicode character marks the rows in the data to be skipped.

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (
		id UUID PRIMARY KEY,
		name TEXT,
		INDEX name_idx (name)
)
CSV DATA ('s3://{BUCKET NAME}/{customers.csv}?AWS_ACCESS_KEY_ID={ACCESS KEY}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}')
WITH
	comment = '#'
;
~~~

### Skip first *n* lines

The `skip` option determines the number of header rows to skip when importing a file.

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (
		id UUID PRIMARY KEY,
		name TEXT,
		INDEX name_idx (name)
)
CSV DATA ('s3://{BUCKET NAME}/{customers.csv}?AWS_ACCESS_KEY_ID={ACCESS KEY}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}')
WITH
	skip = '2'
;
~~~

### Import a limited number of rows

{% include_cached new-in.html version="v21.1" %} The `row_limit` option determines the number of rows to import. For non-bundled formats, setting `row_limit = 'n'` will import the first *n* rows of a table. For bundled formats, this option will import the first *n* rows from each table in the dump file. It is useful for finding errors quickly before executing a more time- and resource-consuming import. Imported tables can be inspected for their schema and data, but must be [dropped](drop-table.html) before running the actual import.

The examples below use CSV data, but `row_limit` is also an option for [Avro files](migrate-from-avro.html#step-3-import-the-avro), [delimited data files](#import-a-delimited-data-file), [PostgreSQL dump files](migrate-from-postgres.html#row-limit), and [MySQL dump files](migrate-from-mysql.html#row-limit).

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (
		id UUID PRIMARY KEY,
		name TEXT,
		INDEX name_idx (name)
)
CSV DATA ('s3://{BUCKET NAME}/{customers.csv}?AWS_ACCESS_KEY_ID={ACCESS KEY}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}')
WITH
	row_limit = '10'
;
~~~

### Use blank characters as `NULL`

The `nullif` option defines which string should be converted to `NULL`.

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (
		id UUID PRIMARY KEY,
		name TEXT,
		INDEX name_idx (name)
)
CSV DATA ('s3://{BUCKET NAME}/{customers.csv}?AWS_ACCESS_KEY_ID={ACCESS KEY}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}')
WITH
	nullif = ''
;
~~~

### Import a compressed CSV file

CockroachDB chooses the decompression codec based on the filename (the common extensions `.gz` or `.bz2` and `.bz`) and uses the codec to decompress the file during import.

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (
		id UUID PRIMARY KEY,
		name TEXT,
		INDEX name_idx (name)
)
CSV DATA ('s3://{BUCKET NAME}/{customers.csv.gz}?AWS_ACCESS_KEY_ID={ACCESS KEY}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}')
;
~~~

Optionally, you can use the `decompress` option to specify the codec to be used for decompressing the file during import:

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (
		id UUID PRIMARY KEY,
		name TEXT,
		INDEX name_idx (name)
)
CSV DATA ('s3://{BUCKET NAME}/{customers.csv.gz}?AWS_ACCESS_KEY_ID={ACCESS KEY}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}')
WITH
	decompress = 'gzip'
;
~~~

### Import a PostgreSQL database dump

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT PGDUMP 's3://{BUCKET NAME}/{customers.sql}?AWS_ACCESS_KEY_ID={ACCESS KEY}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}' WITH ignore_unsupported_statements;
~~~

For this command to succeed, you need to have created the dump file with specific flags to `pg_dump`, and starting in v21.1 use the `WITH ignore_unsupported_statements` clause. For more information, see [Migrate from Postgres](migrate-from-postgres.html).

### Import a table from a PostgreSQL database dump

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT TABLE employees FROM PGDUMP 's3://{BUCKET NAME}/{employees-full.sql}?AWS_ACCESS_KEY_ID={ACCESS KEY}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}' WITH skip_foreign_keys WITH ignore_unsupported_statements;
~~~

If the table schema specifies foreign keys into tables that do not exist yet, the `WITH skip_foreign_keys` shown may be needed. For more information, see the list of [import options](#import-options).

For this command to succeed, you need to have created the dump file with specific flags to `pg_dump`.  For more information, see [Migrate from Postgres](migrate-from-postgres.html).

### Import a CockroachDB dump file

Cockroach dump files can be imported using the `IMPORT PGDUMP` statement.

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT PGDUMP 's3://{BUCKET NAME}/{employees-full.sql}?AWS_ACCESS_KEY_ID={ACCESS KEY}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}';
~~~

For more information, see [SQL Dump (Export)](cockroach-dump.html).

### Import a MySQL database dump

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT MYSQLDUMP 's3://{BUCKET NAME}/{employees-full.sql}?AWS_ACCESS_KEY_ID={ACCESS KEY}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}';
~~~

For more detailed information about importing data from MySQL, see [Migrate from MySQL](migrate-from-mysql.html).

### Import a table from a MySQL database dump

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT TABLE employees FROM MYSQLDUMP 's3://{BUCKET NAME}/{employees-full.sql}?AWS_ACCESS_KEY_ID={ACCESS KEY}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}' WITH skip_foreign_keys;
~~~

If the table schema specifies foreign keys into tables that do not exist yet, the `WITH skip_foreign_keys` shown may be needed.  For more information, see the list of [import options](#import-options).

For more detailed information about importing data from MySQL, see [Migrate from MySQL](migrate-from-mysql.html).

### Import a delimited data file

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT DELIMITED DATA 's3://{BUCKET NAME}/{employees-full.csv}?AWS_ACCESS_KEY_ID={ACCESS KEY}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}'
  WITH
    fields_terminated_by='|',
    fields_enclosed_by='"',
    fields_escaped_by='"';
~~~

{{site.data.alerts.callout_info}}
If you want to escape special symbols, use `fields_escaped_by`.
{{site.data.alerts.end}}

### Import a table from a delimited data file

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT TABLE employees
    FROM DELIMITED DATA 's3://{BUCKET NAME}/{employees.csv}?AWS_ACCESS_KEY_ID={ACCESS KEY}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}'
    WITH
      skip_foreign_keys;
~~~

If the table schema specifies foreign keys into tables that do not exist yet, the `WITH skip_foreign_keys` shown may be needed. For more information, see the list of [import options](#import-options).

### Import a table from an Avro file

[Avro OCF data](migrate-from-avro.html#import-an-object-container-file), [JSON records, or binary records](migrate-from-avro.html#import-binary-or-json-records) can be imported. The following are examples of importing Avro OCF data.

To specify the table schema in-line:

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (
		id UUID PRIMARY KEY,
		name TEXT,
		INDEX name_idx (name)
)
AVRO DATA ('s3://{BUCKET NAME}/{customers.avro}?AWS_ACCESS_KEY_ID={ACCESS KEY}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}')
;
~~~

To use a file to specify the table schema:

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers
CREATE USING 's3://{BUCKET NAME}/{customers-create-table.sql}?AWS_ACCESS_KEY_ID={ACCESS KEY}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}'
AVRO DATA ('s3://{BUCKET NAME}/{customers.avro}?AWS_ACCESS_KEY_ID={ACCESS KEY}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}')
;
~~~

For more information about importing data from Avro, including examples, see [Migrate from Avro](migrate-from-avro.html).

### Run an import within a transaction

{% include_cached new-in.html version="v21.1" %} The `DETACHED` option allows an import to be run asynchronously, returning the job ID immediately once initiated. You can run imports within transactions by specifying the `DETACHED` option.

The following transactions use CSV data as an example. To use the `DETACHED` option with `IMPORT` in a transaction:

{% include_cached copy-clipboard.html %}
~~~ sql
> BEGIN;

CREATE DATABASE newdb;

SET DATABASE = newdb;

IMPORT TABLE customers (
		id UUID PRIMARY KEY,
		name TEXT,
		INDEX name_idx (name)
)
CSV DATA ('s3://{BUCKET NAME}/{customers.csv}?AWS_ACCESS_KEY_ID={ACCESS KEY}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}')
WITH DETACHED;

COMMIT;
~~~

The job ID is returned immediately without waiting for the job to finish:

~~~
        job_id
----------------------
  592786066399264769
(1 row)
~~~

**Without** the `DETACHED` option, `IMPORT` will block the SQL connection until the job completes. Once finished, the job status and more detailed job data is returned:

~~~
job_id             |  status   | fraction_completed | rows | index_entries | bytes
---------------------+-----------+--------------------+------+---------------+--------
652471804772712449 | succeeded |                  1 |   50 |             0 |  4911
(1 row)
~~~

### Import a table from a local file

You can import a file from `nodelocal`, which is the external IO directory on a node's local file system. To import from `nodelocal`,  a `nodeID` is required and the data files will be in the `extern` directory of the specified node.

{{site.data.alerts.callout_info}}
The file system backup location on the NFS drive is relative to the path specified by the `--external-io-dir` flag set while [starting the node](cockroach-start.html). If the flag is set to `disabled`, then imports from local directories and NFS drives are disabled. Use `self` if you do not want to specify a `nodeID`, and the individual data files will be in the `extern` directories of arbitrary nodes; however, to work correctly, each node must have the [`--external-io-dir` flag](cockroach-start.html#general) point to the same NFS mount or other network-backed, shared storage.
{{site.data.alerts.end}}

If a `nodeID` is provided, the data files to import will be in the `extern` directory of the specified node:

~~~ shell
cd /tmp/node2 && ls
~~~

~~~
000355.log		      	cockroach-temp700212211
000357.log		      	cockroach.advertise-addr
000359.sst		      	cockroach.advertise-sql-addr
COCKROACHDB_VERSION		cockroach.http-addr
CURRENT			        	cockroach.listen-addr
IDENTITY		        	cockroach.sql-addr
LOCK		          		extern
MANIFEST-000010		    logs
OPTIONS-000005		  	temp-dirs-record.txt
auxiliary
~~~

~~~ shell
cd /tmp/node2/extern && ls
~~~

~~~
customers.csv
~~~

Then, specify which node to access by including the `nodeID` in the `IMPORT` statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (
		id UUID PRIMARY KEY,
		name STRING,
		INDEX name_idx (name)
)
CSV DATA ('nodelocal://2/customers.csv')
;
~~~

 You can also use the [`cockroach nodelocal upload`](cockroach-nodelocal-upload.html) command to upload a file to the external IO directory on a node's (the gateway node, by default) local file system.

## Known limitation

{% include {{ page.version.version }}/known-limitations/import-high-disk-contention.md %}

## See also

- [Use Cloud Storage for Bulk Operations](use-cloud-storage-for-bulk-operations.html)
- [Migration Overview](migration-overview.html)
- [Migrate from MySQL][mysql]
- [Migrate from Postgres][postgres]
- [Migrate from CSV][csv]
- [Migrate from Avro][avro]
- [`IMPORT INTO`](import-into.html)
- [Import Performance Best Practices](import-performance-best-practices.html)

<!-- Reference Links -->

[avro]: migrate-from-avro.html
[postgres]: migrate-from-postgres.html
[mysql]: migrate-from-mysql.html
[csv]: migrate-from-csv.html
[datatypes]: migrate-from-avro.html#data-type-mapping
