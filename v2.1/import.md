---
title: IMPORT
summary: The IMPORT statement imports various types of data into CockroachDB.
toc: true
---

The `IMPORT` [statement](sql-statements.html) imports the following types of data into CockroachDB:

- [CSV/TSV][csv]
- [Postgres dump files][postgres]
- [MySQL dump files][mysql]
- [CockroachDB dump files](sql-dump.html)

{{site.data.alerts.callout_success}}
This page has reference information about the `IMPORT` statement.  For instructions and working examples showing how to migrate data from other databases and formats, see the [Migration Overview](migration-overview.html).
{{site.data.alerts.end}}

{{site.data.alerts.callout_danger}}
`IMPORT` only works for creating new tables. It does not support adding data to existing tables. Also, `IMPORT` cannot be used within a [transaction](transactions.html).
{{site.data.alerts.end}}

## Required privileges

Only members of the `admin` role can run `IMPORT`. By default, the `root` user belongs to the `admin` role.

## Synopsis

**Import a table from CSV**

<div>
  {% include {{ page.version.version }}/sql/diagrams/import_csv.html %}
</div>

**Import a database or table from dump file**

<div>
  {% include {{ page.version.version }}/sql/diagrams/import_dump.html %}
</div>

## Parameters

### For import from CSV

Parameter | Description
----------|------------
`table_name` | The name of the table you want to import/create.
`table_elem_list` | The table schema you want to use.  
`CREATE USING file_location` | If not specifying the table schema inline via `table_elem_list`, this is the [URL](#import-file-urls) of a CSV file containing the table schema.
`file_location` | The [URL](#import-file-urls) of a CSV file containing the table data. This can be a comma-separated list of URLs to CSV files. For an example, see [Import a table from multiple CSV files](#import-a-table-from-multiple-csv-files) below.
`WITH kv_option_list` | Control your import's behavior with [these options](#import-options).

### For import from dump file

Parameter | Description
----------|------------
`table_name` | The name of the table you want to import/create. Use this when the dump file contains a specific table. Leave out `TABLE table_name FROM` when the dump file contains an entire database.
`import_format` | [PGDUMP](#import-a-postgres-database-dump) or [MYSQLDUMP](#import-a-mysql-database-dump)
`file_location` | The [URL](#import-file-urls) of a dump file you want to import.
`WITH kv_option_list` | Control your import's behavior with [these options](#import-options).

### Import file URLs

URLs for the files you want to import must use the format shown below.  For examples, see [Example file URLs](#example-file-urls).

{% include {{ page.version.version }}/misc/external-urls.md %}

### Import options

You can control the `IMPORT` process's behavior using any of the following key-value pairs as a `kv_option`.

<a name="delimiter"></a>

| Key                 | Context         | Value                                                                                                                                                                                       | Required? | Example                                                                                           |
|---------------------+-----------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+-----------+---------------------------------------------------------------------------------------------------|
| `delimiter`         | CSV             | The unicode character that delimits columns in your rows. **Default: `,`**.                                                                                                                 | No        | To use tab-delimited values: `IMPORT TABLE foo (..) CSV DATA ('file.csv') WITH delimiter = e'\t'` |
| `comment`           | CSV             | The unicode character that identifies rows to skip.                                                                                                                                         | No        | `IMPORT TABLE foo (..) CSV DATA ('file.csv') WITH comment = '#'`                                  |
| `nullif`            | CSV             | The string that should be converted to *NULL*.                                                                                                                                              | No        | To use empty columns as *NULL*: `IMPORT TABLE foo (..) CSV DATA ('file.csv') WITH nullif = ''`    |
| `skip`              | CSV             | The number of rows to be skipped while importing a file. **Default: `'0'`**.                                                                                                                | No        | To import CSV files with column headers: `IMPORT ... CSV DATA ('file.csv') WITH skip = '1'`       |
| `decompress`        | General         | The decompression codec to be used: `gzip`, `bzip`, `auto`, or `none`.  **Default: `'auto'`**, which guesses based on file extension (`.gz`, `.bz`, `.bz2`). `none` disables decompression. | No        | `IMPORT ... WITH decompress = 'bzip'`                                                             |
| `skip_foreign_keys` | Postgres, MySQL | Ignore foreign key constraints in the dump file's DDL. **Off by default**.  May be necessary to import a table with unsatisfied foreign key constraints from a full database dump.          | No        | `IMPORT TABLE foo FROM MYSQLDUMP 'dump.sql' WITH skip_foreign_keys`                               |
| `max_row_size`      | Postgres        | Override limit on line size. **Default: 0.5MB**.  This setting may need to be tweaked if your Postgres dump file has extremely long lines, for example as part of a `COPY` statement.       | No        | `IMPORT PGDUMP DATA ... WITH max_row_size = '5MB'`                                                |

For examples showing how to use these options, see the [Examples](#examples) section below.

For instructions and working examples showing how to migrate data from other databases and formats, see the [Migration Overview](migration-overview.html).

## Requirements

### Prerequisites

Before using `IMPORT`, you should have:

- The schema of the table you want to import.
- The data you want to import, preferably hosted on cloud storage. This location must be equally accessible to all nodes using the same import file location.  This is necessary because the `IMPORT` statement is issued once by the client, but is executed concurrently across all nodes of the cluster.  For more information, see the [Import file location](#import-file-location) section below.

### Import targets

Imported tables must not exist and must be created in the `IMPORT` statement. If the table you want to import already exists, you must drop it with [`DROP TABLE`](drop-table.html).

You can specify the target database in the table name in the `IMPORT` statement. If it's not specified there, the active database in the SQL session is used.

### Create table

Your `IMPORT` statement must reference a `CREATE TABLE` statement representing the schema of the data you want to import.  You have several options:

- Specify the table's columns explicitly from the [SQL client](use-the-built-in-sql-client.html). For an example, see [Import a table from a CSV file](#import-a-table-from-a-csv-file) below.

- Load a file that already contains a `CREATE TABLE` statement. For an example, see [Import a Postgres database dump](#import-a-postgres-database-dump) below.

We also recommend [specifying all secondary indexes you want to use in the `CREATE TABLE` statement](create-table.html#create-a-table-with-secondary-and-inverted-indexes). It is possible to [add secondary indexes later](create-index.html), but it is significantly faster to specify them during import.

#### Skip foreign keys

By default, the [Postgres][postgres] and [MySQL][mysql] import formats support foreign keys. Add the `skip_foreign_keys` [option](#import-options) to speed up data import by ignoring foreign key constraints in the dump file's DDL.  It will also enable you to import individual tables that would otherwise fail due to dependencies on other tables.

{{site.data.alerts.callout_info}}
The most common dependency issues are caused by unsatisfied foreign key relationships. You can avoid these issues by adding the `skip_foreign_keys` option to your `IMPORT` statement as needed. For more information, see the list of [import options](#import-options).

For example, if you get the error message `pq: there is no unique constraint matching given keys for referenced table tablename`, use `IMPORT ... WITH skip_foreign_keys`.
{{site.data.alerts.end}}

### Available storage

Each node in the cluster is assigned an equal part of the imported data, and so must have enough temp space to store it. In addition, data is persisted as a normal table, and so there must also be enough space to hold the final, replicated data. The node's first-listed/default [`store`](start-a-node.html#store) directory must have enough available storage to hold its portion of the data.

On [`cockroach start`](start-a-node.html), if you set `--max-disk-temp-storage`, it must also be greater than the portion of the data a node will store in temp space.

### Import file location

We strongly recommend using cloud/remote storage (Amazon S3, Google Cloud Platform, etc.) for the data you want to import.

Local files are supported; however, they must be accessible to all nodes in the cluster using identical [Import file URLs](#import-file-urls).

To import a local file, you have the following options:

- Option 1. Run a [local file server](create-a-file-server.html) to make the file accessible from all nodes.

- Option 2. Make the file accessible from each local node's store:
    1. Create an `extern` directory on each node's store. The pathname will differ depending on the [`--store` flag passed to `cockroach start` (if any)](start-a-node.html#general), but will look something like `/path/to/cockroach-data/extern/`.
    2. Copy the file to each node's `extern` directory.
    3. Assuming the file is called `data.sql`, you can access it in your `IMPORT` statement using the following [import file URL](#import-file-urls): `'nodelocal:///data.sql'`.

### Table users and privileges

Imported tables are treated as new tables, so you must [`GRANT`](grant.html) privileges to them.

## Performance

All nodes are used during the import job, which means all nodes' CPU and RAM will be partially consumed by the `IMPORT` task in addition to serving normal traffic.

## Viewing and controlling import jobs

After CockroachDB successfully initiates an import, it registers the import as a job, which you can view with [`SHOW JOBS`](show-jobs.html).

After the import has been initiated, you can control it with [`PAUSE JOB`](pause-job.html), [`RESUME JOB`](resume-job.html), and [`CANCEL JOB`](cancel-job.html).

{{site.data.alerts.callout_danger}}Pausing and then resuming an <code>IMPORT</code> job will cause it to restart from the beginning.{{site.data.alerts.end}}

## Examples

### Import a table from a CSV file

To manually specify the table schema:

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		name TEXT,
		INDEX name_idx (name)
)
CSV DATA ('azure://acme-co/customer-import-data.csv?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co')
;
~~~

To use a file to specify the table schema:

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers
CREATE USING 'azure://acme-co/customer-create-table.sql?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
CSV DATA ('azure://acme-co/customer-import-data.csv?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co')
;
~~~

### Import a table from multiple CSV files

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

### Import a table from a TSV file

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		name TEXT,
		INDEX name_idx (name)
)
CSV DATA ('azure://acme-co/customer-import-data.tsv?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co')
WITH
	delimiter = e'\t'
;
~~~

### Skip commented lines

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		name TEXT,
		INDEX name_idx (name)
)
CSV DATA ('azure://acme-co/customer-import-data.csv?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co')
WITH
	comment = '#'
;
~~~

### Skip first *n* lines

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		name TEXT,
		INDEX name_idx (name)
)
CSV DATA ('azure://acme-co/customer-import-data.csv?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co')
WITH
	skip = '2'
;
~~~

### Use blank characters as `NULL`

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		name TEXT,
		INDEX name_idx (name)
)
CSV DATA ('azure://acme-co/customer-import-data.csv?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co')
WITH
	nullif = ''
;
~~~

### Import a compressed CSV file

CockroachDB chooses the decompression codec based on the filename (the common extensions `.gz` or `.bz2` and `.bz`) and uses the codec to decompress the file during import.

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		name TEXT,
		INDEX name_idx (name)
)
CSV DATA ('azure://acme-co/customer-import-data.csv.gz?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co')
;
~~~

Optionally, you can use the `decompress` option to specify the codec to be used for decompressing the file during import:

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		name TEXT,
		INDEX name_idx (name)
)
CSV DATA ('azure://acme-co/customer-import-data.csv.gz.latest?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co')
WITH
	decompress = 'gzip'
;
~~~

### Import a Postgres database dump

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT PGDUMP 's3://your-external-storage/employees-full.sql?AWS_ACCESS_KEY_ID=123&AWS_SECRET_ACCESS_KEY=456';
~~~

For the command above to succeed, you need to have created the dump file with specific flags to `pg_dump`.  For more information, see [Migrate from Postgres][postgres].

### Import a table from a Postgres database dump

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT TABLE employees FROM PGDUMP 's3://your-external-storage/employees-full.sql?AWS_ACCESS_KEY_ID=123&AWS_SECRET_ACCESS_KEY=456' WITH skip_foreign_keys;
~~~

If the table schema specifies foreign keys into tables that do not exist yet, the `WITH skip_foreign_keys` shown may be needed.  For more information, see the list of [import options](#import-options).

For the command above to succeed, you need to have created the dump file with specific flags to `pg_dump`.  For more information, see [Migrate from Postgres][postgres].

### Import a CockroachDB dump file

Cockroach dump files can be imported using the `IMPORT PGDUMP`.

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT PGDUMP 's3://your-external-storage/employees-full.sql?AWS_ACCESS_KEY_ID=123&AWS_SECRET_ACCESS_KEY=456';
~~~

For more information, see [SQL Dump (Export)](sql-dump.html).

### Import a MySQL database dump

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT MYSQLDUMP 's3://your-external-storage/employees-full.sql?AWS_ACCESS_KEY_ID=123&AWS_SECRET_ACCESS_KEY=456';
~~~

For more detailed information about importing data from MySQL, see [Migrate from MySQL][mysql].

### Import a table from a MySQL database dump

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT TABLE employees FROM MYSQLDUMP 's3://your-external-storage/employees-full.sql?AWS_ACCESS_KEY_ID=123&AWS_SECRET_ACCESS_KEY=456' WITH skip_foreign_keys
~~~

If the table schema specifies foreign keys into tables that do not exist yet, the `WITH skip_foreign_keys` shown may be needed.  For more information, see the list of [import options](#import-options).

For more detailed information about importing data from MySQL, see [Migrate from MySQL][mysql].

## Known limitation

`IMPORT` can sometimes fail with a "context canceled" error, or can restart itself many times without ever finishing. If this is happening, it is likely due to a high amount of disk contention. This can be mitigated by setting the `kv.bulk_io_write.max_rate` [cluster setting](cluster-settings.html) to a value below your max disk write speed. For example, to set it to 10MB/s, execute:

{% include_cached copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING kv.bulk_io_write.max_rate = '10MB';
~~~

## See also

- [Create a File Server](create-a-file-server.html)
- [Migration Overview](migration-overview.html)
- [Migrate from MySQL][mysql]
- [Migrate from Postgres][postgres]
- [Migrate from CSV][csv]

<!-- Reference Links -->

[postgres]: migrate-from-postgres.html
[mysql]: migrate-from-mysql.html
[csv]: migrate-from-csv.html
