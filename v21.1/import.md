---
title: IMPORT
summary: Import data into your CockroachDB cluster.
toc: true
---

The `IMPORT` [statement](sql-statements.html) imports the following types of data into CockroachDB:

- [Avro][avro]
- [CSV/TSV][csv]
- [Postgres dump files][postgres]
- [MySQL dump files][mysql]
- [CockroachDB dump files](cockroach-dump.html)
- [Delimited data files](#delimited-data-files)

{{site.data.alerts.callout_success}}
`IMPORT` only works for creating new tables. For information on how to import into existing tables, see [`IMPORT INTO`](import-into.html). Also, for instructions and working examples on how to migrate data from other databases, see the [Migration Overview](migration-overview.html).
{{site.data.alerts.end}}

{{site.data.alerts.callout_danger}}
`IMPORT` cannot be used within a [transaction](transactions.html) or during a [rolling upgrade](upgrade-cockroach-version.html).
{{site.data.alerts.end}}

## Required privileges

Only members of the `admin` role can run `IMPORT`. By default, the `root` user belongs to the `admin` role.

## Synopsis

**Import a table from CSV or Avro**

<div>
  {% include {{ page.version.version }}/sql/diagrams/import_csv.html %}
</div>

**Import a database or table from dump file**

<div>
  {% include {{ page.version.version }}/sql/diagrams/import_dump.html %}
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
`import_format` | [`PGDUMP`](#import-a-postgres-database-dump), [`MYSQLDUMP`](#import-a-mysql-database-dump), or [`DELIMITED DATA`](#delimited-data-files)
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
`skip_foreign_keys`    | `PGDUMP`, `MYSQLDUMP` | Ignore foreign key constraints in the dump file's DDL. **Default:** Off.  May be necessary to import a table with unsatisfied foreign key constraints from a full database dump.
`max_row_size`         | `PGDUMP`        | Override limit on line size. **Default: 0.5MB**.  This setting may need to be tweaked if your Postgres dump file has extremely long lines, for example as part of a `COPY` statement.
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

<!--
`experimental_save_rejected` | `CSV DATA` | Skip faulty rows during import and save them in a file called `<original_csv_file>.rejected`. Once the rows are fixed, use this file with [`IMPORT INTO`](import-into.html) to finish the import. **Default:** Off -->

For examples showing how to use these options, see the [Examples](#examples) section below.

For instructions and working examples showing how to migrate data from other databases and formats, see the [Migration Overview](migration-overview.html).

## Requirements

### Prerequisites

Before using `IMPORT`, you should have:

- The schema of the table you want to import.
- The data you want to import, preferably hosted on cloud storage. This location must be equally accessible to all nodes using the same import file location.  This is necessary because the `IMPORT` statement is issued once by the client, but is executed concurrently across all nodes of the cluster.  For more information, see the [Import file location](#import-file-location) section below.

### Import targets

Imported tables must not exist and must be created in the `IMPORT` statement. If the table you want to import already exists, you must drop it with [`DROP TABLE`](drop-table.html) or use [`IMPORT INTO`](import-into.html).

You can specify the target database in the table name in the `IMPORT` statement. If it's not specified there, the active database in the SQL session is used.

### Create table

Your `IMPORT` statement must reference a `CREATE TABLE` statement representing the schema of the data you want to import.  You have several options:

- Specify the table's columns explicitly from the [SQL client](cockroach-sql.html). For an example, see [Import a table from a CSV file](#import-a-table-from-a-csv-file) below.

- Load a file that already contains a `CREATE TABLE` statement. For an example, see [Import a Postgres database dump](#import-a-postgres-database-dump) below.

We also recommend [specifying all secondary indexes you want to use in the `CREATE TABLE` statement](create-table.html#create-a-table-with-secondary-and-inverted-indexes). It is possible to [add secondary indexes later](create-index.html), but it is significantly faster to specify them during import.

{{site.data.alerts.callout_info}}
 `IMPORT` supports [computed columns](computed-columns.html) for Avro and Postgres dump files only. To import CSV data to a table with a computed column or `DEFAULT` expression, use [`IMPORT INTO`](import-into.html).
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
By default, the [Postgres][postgres] and [MySQL][mysql] import formats support foreign keys. However, the most common dependency issues during import are caused by unsatisfied foreign key relationships that cause errors like `pq: there is no unique constraint matching given keys for referenced table tablename`. You can avoid these issues by adding the [`skip_foreign_keys`](#import-options) option to your `IMPORT` statement as needed. Ignoring foreign constraints will also speed up data import.
{{site.data.alerts.end}}

### Available storage

Each node in the cluster is assigned an equal part of the imported data, and so must have enough temp space to store it. In addition, data is persisted as a normal table, and so there must also be enough space to hold the final, replicated data. The node's first-listed/default [`store`](cockroach-start.html#store) directory must have enough available storage to hold its portion of the data.

On [`cockroach start`](cockroach-start.html), if you set `--max-disk-temp-storage`, it must also be greater than the portion of the data a node will store in temp space.

### Import file location

CockroachDB uses the URL provided to construct a secure API call to the service you specify. The URL structure depends on the type of file storage you are using. For more information, see the following:

- [Use Cloud Storage for Bulk Operations](use-cloud-storage-for-bulk-operations.html)
-  [Use `userfile` for Bulk Operations](use-userfile-for-bulk-operations.html)
- [Use a Local File Server for Bulk Operations](use-a-local-file-server-for-bulk-operations.html)

### Table users and privileges

Imported tables are treated as new tables, so you must [`GRANT`](grant.html) privileges to them.

## Performance

- All nodes are used during the import job, which means all nodes' CPU and RAM will be partially consumed by the `IMPORT` task in addition to serving normal traffic.
- To improve performance, import at least as many files as you have nodes (i.e., there is at least one file for each node to import) to increase parallelism.
- To further improve performance, order the data in the imported files by [primary key](primary-key.html) and ensure the primary keys do not overlap between files.

## Viewing and controlling import jobs

After CockroachDB initiates an import, you can view its progress with [`SHOW JOBS`](show-jobs.html) and on the [**Jobs** page](ui-jobs-page.html) of the DB Console, and you can control it with [`PAUSE JOB`](pause-job.html), [`RESUME JOB`](resume-job.html), and [`CANCEL JOB`](cancel-job.html).

{{site.data.alerts.callout_info}}
If initiated correctly, the statement returns when the import is finished or if it encounters an error. In some cases, the import can continue after an error has been returned (the error message will tell you that the import has resumed in the background).

 When [resumed](resume-job.html), [paused](pause-job.html) imports now continue from their internally recorded progress instead of starting over.
{{site.data.alerts.end}}

## Examples

### Import a table from a CSV file

To specify the table schema in-line:

Amazon S3:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (
		id UUID PRIMARY KEY,
		name TEXT,
		INDEX name_idx (name)
)
CSV DATA ('s3://acme-co/customers.csv?AWS_ACCESS_KEY_ID=[placeholder]&AWS_SECRET_ACCESS_KEY=[placeholder]&AWS_SESSION_TOKEN=[placeholder]')
;
~~~

Azure:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (
		id UUID PRIMARY KEY,
		name TEXT,
		INDEX name_idx (name)
)
CSV DATA ('azure://acme-co/customer-import-data.csv?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co')
;
~~~

Google Cloud:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (
		id UUID PRIMARY KEY,
		name TEXT,
		INDEX name_idx (name)
)
CSV DATA ('gs://acme-co/customers.csv')
;
~~~

To use a file to specify the table schema:

Amazon S3:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers
CREATE USING 's3://acme-co/customers-create-table.sql?AWS_ACCESS_KEY_ID=[placeholder]&AWS_SECRET_ACCESS_KEY=[placeholder]'
CSV DATA ('s3://acme-co/customers.csv?AWS_ACCESS_KEY_ID=[placeholder]&AWS_SECRET_ACCESS_KEY=[placeholder]')
;
~~~

Azure:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers
CREATE USING 'azure://acme-co/customer-create-table.sql?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
CSV DATA ('azure://acme-co/customer-import-data.csv?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co')
;
~~~

Google Cloud:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers
CREATE USING 'gs://acme-co/customers-create-table.sql'
CSV DATA ('gs://acme-co/customers.csv')
;
~~~

### Import a table from multiple CSV files

#### Using a comma-separated list

Amazon S3:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (
		id UUID PRIMARY KEY,
		name TEXT,
		INDEX name_idx (name)
)
CSV DATA (
    's3://acme-co/customers.csv?AWS_ACCESS_KEY_ID=[placeholder]&AWS_SECRET_ACCESS_KEY=[placeholder]',
    's3://acme-co/customers2.csv?AWS_ACCESS_KEY_ID=[placeholder]&AWS_SECRET_ACCESS_KEY=[placeholder',
    's3://acme-co/customers3.csv?AWS_ACCESS_KEY_ID=[placeholder]&AWS_SECRET_ACCESS_KEY=[placeholder]',
    's3://acme-co/customers4.csv?AWS_ACCESS_KEY_ID=[placeholder]&AWS_SECRET_ACCESS_KEY=[placeholder]',
);
~~~

Azure:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (
		id UUID PRIMARY KEY,
		name TEXT,
		INDEX name_idx (name)
)
CSV DATA (
    'azure://acme-co/customer-import-data1.1.csv?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co',
    'azure://acme-co/customer-import-data1.2.csv?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co',
    'azure://acme-co/customer-import-data1.3.csv?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co',
    'azure://acme-co/customer-import-data1.4.csv?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co',
    'azure://acme-co/customer-import-data1.5.csv?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co',    
);
~~~

Google Cloud:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (
		id UUID PRIMARY KEY,
		name TEXT,
		INDEX name_idx (name)
)
CSV DATA (
    'gs://acme-co/customers.csv',
    'gs://acme-co/customers2.csv',
    'gs://acme-co/customers3.csv',
    'gs://acme-co/customers4.csv',
);
~~~

#### Using a wildcard

You can specify [file patterns to match](https://golang.org/pkg/path/filepath/#Match) instead of explicitly listing every file. Paths are matched Use the `*` wildcard character to include matching files directly under the specified path. A wildcard can be used to include:

- All files in a given directory (e.g.,`s3://bucket-name/path/to/data/*`)
- All files in a given directory that end with a given string (e.g., `s3://bucket-name/files/*.csv`)
- All files in a given directory that start with a given string (e.g., `s3://bucket-name/files/data*`)
- All files in a given directory that start and end with a given string (e.g., `s3://bucket-name/files/data*.csv`)

These only match files directly under the specified path and do not descend into additional directories recursively.

Amazon S3:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (
		id UUID PRIMARY KEY,
		name TEXT,
		INDEX name_idx (name)
)
CSV DATA (
    's3://acme-co/*?AWS_ACCESS_KEY_ID=[placeholder]&AWS_SECRET_ACCESS_KEY=[placeholder]'
);
~~~

Azure:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (
		id UUID PRIMARY KEY,
		name TEXT,
		INDEX name_idx (name)
)
CSV DATA (
    'azure://acme-co/customer-import-data*?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'  
);
~~~

Google Cloud:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (
		id UUID PRIMARY KEY,
		name TEXT,
		INDEX name_idx (name)
)
CSV DATA (
    'gs://acme-co/*'
);
~~~

### Import a table from a TSV file

Amazon S3:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (
		id UUID PRIMARY KEY,
		name TEXT,
		INDEX name_idx (name)
)
CSV DATA ('s3://acme-co/customers.tsv?AWS_ACCESS_KEY_ID=[placeholder]&AWS_SECRET_ACCESS_KEY=[placeholder]')
WITH
	delimiter = e'\t'
;
~~~

Azure:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (
		id UUID PRIMARY KEY,
		name TEXT,
		INDEX name_idx (name)
)
CSV DATA ('azure://acme-co/customer-import-data.tsv?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co')
WITH
	delimiter = e'\t'
;
~~~

Google Cloud:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (
		id UUID PRIMARY KEY,
		name TEXT,
		INDEX name_idx (name)
)
CSV DATA ('gs://acme-co/customers.tsv')
WITH
	delimiter = e'\t'
;
~~~

### Skip commented lines

The `comment` option determines which Unicode character marks the rows in the data to be skipped.

Amazon S3:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (
		id UUID PRIMARY KEY,
		name TEXT,
		INDEX name_idx (name)
)
CSV DATA ('s3://acme-co/customers.csv?AWS_ACCESS_KEY_ID=[placeholder]&AWS_SECRET_ACCESS_KEY=[placeholder]')
WITH
	comment = '#'
;
~~~

Azure:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (
		id UUID PRIMARY KEY,
		name TEXT,
		INDEX name_idx (name)
)
CSV DATA ('azure://acme-co/customer-import-data.csv?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co')
WITH
	comment = '#'
;
~~~

Google Cloud:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (
		id UUID PRIMARY KEY,
		name TEXT,
		INDEX name_idx (name)
)
CSV DATA ('gs://acme-co/customers.csv')
WITH
	comment = '#'
;
~~~

### Skip first *n* lines

The `skip` option determines the number of header rows to skip when importing a file.

Amazon S3:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (
		id UUID PRIMARY KEY,
		name TEXT,
		INDEX name_idx (name)
)
CSV DATA ('s3://acme-co/customers.csv?AWS_ACCESS_KEY_ID=[placeholder]&AWS_SECRET_ACCESS_KEY=[placeholder]')
WITH
	skip = '2'
;
~~~

Azure:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (
		id UUID PRIMARY KEY,
		name TEXT,
		INDEX name_idx (name)
)
CSV DATA ('azure://acme-co/customer-import-data.csv?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co')
WITH
	skip = '2'
;
~~~

Google Cloud:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (
		id UUID PRIMARY KEY,
		name TEXT,
		INDEX name_idx (name)
)
CSV DATA ('gs://acme-co/customers.csv')
WITH
	skip = '2'
;
~~~

### Use blank characters as `NULL`

The `nullif` option defines which string should be converted to `NULL`.

Amazon S3:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (
		id UUID PRIMARY KEY,
		name TEXT,
		INDEX name_idx (name)
)
CSV DATA ('s3://acme-co/employees.csv?AWS_ACCESS_KEY_ID=[placeholder]&AWS_SECRET_ACCESS_KEY=[placeholder]')
WITH
	nullif = ''
;
~~~

Azure:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (
		id UUID PRIMARY KEY,
		name TEXT,
		INDEX name_idx (name)
)
CSV DATA ('azure://acme-co/customer-import-data.csv?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co')
WITH
	nullif = ''
;
~~~

Google Cloud:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (
		id UUID PRIMARY KEY,
		name TEXT,
		INDEX name_idx (name)
)
CSV DATA ('gs://acme-co/customers.csv')
WITH
	nullif = ''
;
~~~

### Import a compressed CSV file

CockroachDB chooses the decompression codec based on the filename (the common extensions `.gz` or `.bz2` and `.bz`) and uses the codec to decompress the file during import.

Amazon S3:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (
		id UUID PRIMARY KEY,
		name TEXT,
		INDEX name_idx (name)
)
CSV DATA ('s3://acme-co/employees.csv.gz?AWS_ACCESS_KEY_ID=[placeholder]&AWS_SECRET_ACCESS_KEY=[placeholder]')
;
~~~

Azure:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (
		id UUID PRIMARY KEY,
		name TEXT,
		INDEX name_idx (name)
)
CSV DATA ('azure://acme-co/customer-import-data.csv.gz?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co')
;
~~~

Google Cloud:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (
		id UUID PRIMARY KEY,
		name TEXT,
		INDEX name_idx (name)
)
CSV DATA ('gs://acme-co/customers.csv.gz')
;
~~~

Optionally, you can use the `decompress` option to specify the codec to be used for decompressing the file during import:

Amazon S3:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (
		id UUID PRIMARY KEY,
		name TEXT,
		INDEX name_idx (name)
)
CSV DATA ('s3://acme-co/employees.csv.gz?AWS_ACCESS_KEY_ID=[placeholder]&AWS_SECRET_ACCESS_KEY=[placeholder]')
WITH
	decompress = 'gzip'
;
~~~

Azure:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (
		id UUID PRIMARY KEY,
		name TEXT,
		INDEX name_idx (name)
)
CSV DATA ('azure://acme-co/customer-import-data.csv.gz.latest?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co')
WITH
	decompress = 'gzip'
;
~~~

Google Cloud:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (
		id UUID PRIMARY KEY,
		name TEXT,
		INDEX name_idx (name)
)
CSV DATA ('gs://acme-co/customers.csv.gz')
WITH
	decompress = 'gzip'
;
~~~

### Import a Postgres database dump

Amazon S3:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT PGDUMP 's3://your-external-storage/employees.sql?AWS_ACCESS_KEY_ID=[placeholder]&AWS_SECRET_ACCESS_KEY=[placeholder]';
~~~

Azure:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT PGDUMP 'azure://acme-co/employees.sql?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co';
~~~

Google Cloud:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT PGDUMP 'gs://acme-co/employees.sql';
~~~

For the commands above to succeed, you need to have created the dump file with specific flags to `pg_dump`. For more information, see [Migrate from Postgres][postgres].

### Import a table from a Postgres database dump

Amazon S3:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE employees FROM PGDUMP 's3://your-external-storage/employees-full.sql?AWS_ACCESS_KEY_ID=[placeholder]&AWS_SECRET_ACCESS_KEY=[placeholder]' WITH skip_foreign_keys;
~~~

Azure:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE employees FROM PGDUMP 'azure://acme-co/employees.sql?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co' WITH skip_foreign_keys;
~~~

Google Cloud:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE employees FROM PGDUMP 'gs://acme-co/employees.sql' WITH skip_foreign_keys;
~~~

If the table schema specifies foreign keys into tables that do not exist yet, the `WITH skip_foreign_keys` shown may be needed. For more information, see the list of [import options](#import-options).

For the command above to succeed, you need to have created the dump file with specific flags to `pg_dump`.  For more information, see [Migrate from Postgres][postgres].

### Import a CockroachDB dump file

Cockroach dump files can be imported using the `IMPORT PGDUMP`.

Amazon S3:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT PGDUMP 's3://your-external-storage/employees-full.sql?AWS_ACCESS_KEY_ID=[placeholder]&AWS_SECRET_ACCESS_KEY=[placeholder]';
~~~

Azure:
{% include copy-clipboard.html %}
~~~ sql
> IMPORT PGDUMP 'azure://acme-co/employees.sql?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co';
~~~

Google Cloud:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT PGDUMP 'gs://acme-co/employees.sql';
~~~

For more information, see [SQL Dump (Export)](cockroach-dump.html).

### Import a MySQL database dump

Amazon S3:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT MYSQLDUMP 's3://your-external-storage/employees-full.sql?AWS_ACCESS_KEY_ID=[placeholder]&AWS_SECRET_ACCESS_KEY=[placeholder]';
~~~

Azure:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT MYSQLDUMP 'azure://acme-co/employees.sql?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co';
~~~

Google Cloud:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT MYSQLDUMP 'gs://acme-co/employees.sql';
~~~

For more detailed information about importing data from MySQL, see [Migrate from MySQL][mysql].

### Import a table from a MySQL database dump

Amazon S3:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE employees FROM MYSQLDUMP 's3://your-external-storage/employees-full.sql?AWS_ACCESS_KEY_ID=[placeholder]&AWS_SECRET_ACCESS_KEY=[placeholder]' WITH skip_foreign_keys;
~~~

Azure:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE employees FROM MYSQLDUMP 'azure://acme-co/employees.sql?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co' WITH skip_foreign_keys;
~~~

Google Cloud:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE employees FROM MYSQLDUMP 'gs://acme-co/employees.sql' WITH skip_foreign_keys;
~~~

If the table schema specifies foreign keys into tables that do not exist yet, the `WITH skip_foreign_keys` shown may be needed.  For more information, see the list of [import options](#import-options).

For more detailed information about importing data from MySQL, see [Migrate from MySQL][mysql].

### Import a delimited data file

Amazon S3:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT DELIMITED DATA 's3://your-external-storage/employees-full.csv?AWS_ACCESS_KEY_ID=[placeholder]&AWS_SECRET_ACCESS_KEY=[placeholder]'
  WITH
    fields_terminated_by='|',
    fields_enclosed_by='"',
    fields_escaped_by='"';
~~~

Azure:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT DELIMITED DATA 'azure://acme-co/employees.csv?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
  WITH
    fields_terminated_by='|',
    fields_enclosed_by='"',
    fields_escaped_by='"';
~~~

Google Cloud:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT DELIMITED DATA 'gs://acme-co/employees.csv'
  WITH
    fields_terminated_by='|',
    fields_enclosed_by='"',
    fields_escaped_by='"';
~~~

{{site.data.alerts.callout_info}}
If you want to escape special symbols, use `fields_escaped_by`.
{{site.data.alerts.end}}

### Import a table from a delimited data file

Amazon S3:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE employees
    FROM DELIMITED DATA 's3://your-external-storage/employees.csv?AWS_ACCESS_KEY_ID=[placeholder]&AWS_SECRET_ACCESS_KEY=[placeholder]'
    WITH
      skip_foreign_keys;
~~~

Azure:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE employees
    FROM DELIMITED DATA 'azure://acme-co/employees.csv?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
    WITH
      skip_foreign_keys;
~~~

Google Cloud:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE employees
    FROM DELIMITED DATA 'gs://acme-co/employees.csv'
    WITH
      skip_foreign_keys;
~~~

If the table schema specifies foreign keys into tables that do not exist yet, the `WITH skip_foreign_keys` shown may be needed. For more information, see the list of [import options](#import-options).

### Import a table from a local file

If a `nodeID` is provided, the data files to import will be in the `extern` directory of the specified node:

~~~
$ cd node2
$ ls

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

~~~
$ cd extern
$ ls

customers.csv
~~~

Then, specify which node to access by including the `nodeID` in the `IMPORT` statement:

{% include copy-clipboard.html %}
~~~
> IMPORT TABLE customers (
		id UUID PRIMARY KEY,
		name STRING,
		INDEX name_idx (name)
)
CSV DATA ('nodelocal://2/customers.csv')
;
~~~

 You can also use the [`cockroach nodelocal upload`](cockroach-nodelocal-upload.html) command to upload a file to the external IO directory on a node's (the gateway node, by default) local file system.

### Import a table from an Avro file

 [Avro OCF data](migrate-from-avro.html#import-an-object-container-file), [JSON records, or binary records](migrate-from-avro.html#import-binary-or-json-records) can be imported. The following are examples of importing Avro OCF data.

To specify the table schema in-line:

Amazon S3:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (
		id UUID PRIMARY KEY,
		name TEXT,
		INDEX name_idx (name)
)
AVRO DATA ('s3://acme-co/customers.avro?AWS_ACCESS_KEY_ID=[placeholder]&AWS_SECRET_ACCESS_KEY=[placeholder]&AWS_SESSION_TOKEN=[placeholder]')
;
~~~

Azure:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (
		id UUID PRIMARY KEY,
		name TEXT,
		INDEX name_idx (name)
)
AVRO DATA ('azure://acme-co/customer-import-data.avro?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co')
;
~~~

Google Cloud:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (
		id UUID PRIMARY KEY,
		name TEXT,
		INDEX name_idx (name)
)
AVRO DATA ('gs://acme-co/customers.avro')
;
~~~

To use a file to specify the table schema:

Amazon S3:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers
CREATE USING 's3://acme-co/customers-create-table.sql?AWS_ACCESS_KEY_ID=[placeholder]&AWS_SECRET_ACCESS_KEY=[placeholder]'
AVRO DATA ('s3://acme-co/customers.avro?AWS_ACCESS_KEY_ID=[placeholder]&AWS_SECRET_ACCESS_KEY=[placeholder]')
;
~~~

Azure:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers
CREATE USING 'azure://acme-co/customer-create-table.sql?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
AVRO DATA ('azure://acme-co/customer-import-data.avro?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co')
;
~~~

Google Cloud:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers
CREATE USING 'gs://acme-co/customers-create-table.sql'
AVRO DATA ('gs://acme-co/customers.avro')
;
~~~

For more detailed information about importing data from Avro and examples, see [Migrate from Avro][avro].

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

<!-- Reference Links -->

[avro]: migrate-from-avro.html
[postgres]: migrate-from-postgres.html
[mysql]: migrate-from-mysql.html
[csv]: migrate-from-csv.html
[datatypes]: migrate-from-avro.html#data-type-mapping
