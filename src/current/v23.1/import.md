---
title: IMPORT
summary: The IMPORT statement imports various types of data into CockroachDB.
toc: true
keywords: gin, gin index, gin indexes, inverted index, inverted indexes, accelerated index, accelerated indexes
docs_area: reference.sql
---

{{site.data.alerts.callout_danger}}
The statements on this page are **deprecated** as of v23.1 and will be removed in a future release. To move data into CockroachDB, use [`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %}) or [`COPY FROM`]({% link {{ page.version.version }}/copy.md %}).
{{site.data.alerts.end}}

The `IMPORT` [statement]({% link {{ page.version.version }}/sql-statements.md %}) imports the following types of data into CockroachDB:

- [PostgreSQL dump files][postgres]
- [MySQL dump files][mysql]

To import CSV, Avro, or delimited data files, see [`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %}).

{{site.data.alerts.callout_danger}}
Certain `IMPORT TABLE` statements that defined the table schema inline are **not** supported in v22.1 and later versions. These include running `IMPORT TABLE ... CREATE USING` and `IMPORT TABLE` with any non-bundle format (`CSV`, `DELIMITED`, `PGCOPY`, or `AVRO`) data types.

To import data into a new table, use [`CREATE TABLE`]({% link {{ page.version.version }}/create-table.md %}) followed by [`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %}).

`IMPORT INTO` supports CSV/TSV, Avro, and delimited data files. For an example, read [Import into a new table from a CSV file]({% link {{ page.version.version }}/import-into.md %}#import-into-a-new-table-from-a-csv-file).
{{site.data.alerts.end}}

## Considerations

- `IMPORT` is a blocking statement. To run an import job asynchronously, use the [`DETACHED`](#options-detached) option.
- `IMPORT` cannot be used within a [rolling upgrade]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}).
- Certain `IMPORT TABLE` statements that defined the table schema inline are **not** supported in v22.1 and later versions. These include running `IMPORT TABLE ... CREATE USING` and `IMPORT TABLE` with any non-bundle format (`CSV`, `DELIMITED`, `PGCOPY`, or `AVRO`) data types. Instead, use `CREATE TABLE` and `IMPORT INTO`; see this [example]({% link {{ page.version.version }}/import-into.md %}#import-into-a-new-table-from-a-csv-file) for more detail.
- For instructions and working examples on how to migrate data from other databases, see the [Migration Overview]({% link molt/migration-overview.md %}).
- `IMPORT` cannot directly import data to `REGIONAL BY ROW` tables that are part of [multi-region databases]({% link {{ page.version.version }}/multiregion-overview.md %}). Instead, use [`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %}) which supports importing into `REGIONAL BY ROW` tables.

{{site.data.alerts.callout_success}}
Optimize import operations in your applications by following our [Import Performance Best Practices]({% link {{ page.version.version }}/import-performance-best-practices.md %}).
{{site.data.alerts.end}}

## Required privileges

### Table privileges

The user must have the `CREATE` [privileges]({% link {{ page.version.version }}/security-reference/authorization.md %}#managing-privileges) on the target database.

### Source privileges

{% include {{ page.version.version }}/misc/external-io-privilege.md %}

Either the `EXTERNALIOIMPLICITACCESS` [system-level privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) or the [`admin`]({% link {{ page.version.version }}/security-reference/authorization.md %}#admin-role) role is required for the following scenarios:

- Interacting with a cloud storage resource using [`IMPLICIT` authentication]({% link {{ page.version.version }}/cloud-storage-authentication.md %}).
- Using a [custom endpoint](https://docs.aws.amazon.com/sdk-for-go/api/aws/endpoints/) on S3.
- Using the [`cockroach nodelocal upload`]({% link {{ page.version.version }}/cockroach-nodelocal-upload.md %}) command.
- Using [HTTP]({% link {{ page.version.version }}/use-a-local-file-server.md %}) or HTTPS.

No special privilege is required for: 

- Interacting with an Amazon S3 and Google Cloud Storage resource using `SPECIFIED` credentials. Azure Storage is always `SPECIFIED` by default.
- Using [Userfile]({% link {{ page.version.version }}/use-userfile-storage.md %}) storage.

{% include {{ page.version.version }}/misc/bulk-permission-note.md %}

{% include {{ page.version.version }}/misc/s3-compatible-warning.md %}

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/import_dump.html %}
</div>

## Parameters

### For import from dump file

Parameter | Description
----------|------------
`table_name` | The name of the table you want to import/create. Use this when the dump file contains a specific table. Leave out `TABLE table_name FROM` when the dump file contains an entire database.
`import_format` | [`PGDUMP`](#import-a-postgresql-database-dump) OR [`MYSQLDUMP`](#import-a-mysql-database-dump)
`file_location` | The [URL](#import-file-location) of a dump file you want to import.
`WITH kv_option_list` | Control your import's behavior with [these options](#import-options).

### Import options

You can control the `IMPORT` process's behavior using any of the following optional key-value pairs as a `kv_option`. To set multiple import options, use a comma-separated list ([see examples](#examples)).

<a name="delimiter"></a>

Key                 | <div style="width:130px">Context</div> | Value                                                                                                                             |
--------------------+-----------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
`decompress`           | General         | The decompression codec to be used: `gzip`, `bzip`, `auto`, or `none`. **Default:** `'auto'`, which guesses based on file extension (`.gz`, `.bz`, `.bz2`). `none` disables decompression.
`row_limit`           | General         | The number of rows to import. Useful for doing a test run of an import and finding errors quickly. This option will import the first *n* rows from each table in the dump file.
`skip_foreign_keys`    | `PGDUMP`, `MYSQLDUMP` | Ignore foreign key constraints in the dump file's DDL. **Default:** `Off`. May be necessary to import a table with unsatisfied foreign key constraints from a full database dump.
`max_row_size`         | `PGDUMP`        | Override limit on line size. **Default:** `0.5MB`. This setting may need to be tweaked if your PostgreSQL dump file has extremely long lines, for example as part of a `COPY` statement.
`ignore_unsupported_statements` | `PGDUMP`  |  Ignore SQL statements in the dump file that are unsupported by CockroachDB.
`log_ignored_statements` | `PGDUMP` |  Log unsupported statements when using `ignore_unsupported_statements` to a specified destination (i.e., [cloud storage]({% link {{ page.version.version }}/use-cloud-storage.md %}) or [userfile storage]({% link {{ page.version.version }}/use-userfile-storage.md %})).
<a name="options-detached"></a>`DETACHED`             | N/A            |  When an import runs in `DETACHED` mode, it will execute asynchronously and the job ID will be returned immediately without waiting for the job to finish. Note that with `DETACHED` specified, further job information and the job completion status will not be returned. For more on the differences between the returned job data, see the [example]({% link {{ page.version.version }}/import.md %}#run-an-import-within-a-transaction) below. To check on the job status, use the [`SHOW JOBS`]({% link {{ page.version.version }}/show-jobs.md %}) statement. <br><br>To run an import within a [transaction]({% link {{ page.version.version }}/transactions.md %}), use the `DETACHED` option.

For examples showing how to use these options, see the [Examples](#examples) section below.

For instructions and working examples showing how to migrate data from other databases and formats, see the [Migration Overview]({% link molt/migration-overview.md %}).

## Requirements

### Before you begin

Before using `IMPORT`, you should have:

- The schema of the table you want to import.
- The data you want to import, preferably hosted on cloud storage. This location must be equally accessible to all nodes using the same import file location. This is necessary because the `IMPORT` statement is issued once by the client, but is executed concurrently across all nodes of the cluster. For more information, see [Import file location](#import-file-location).

For more information on details to consider when running an `IMPORT`, see [Considerations](#considerations).

### Import targets

Imported tables must not exist and must be created in the `IMPORT` statement with the schema and data importing from the same source. If the table you want to import already exists, you must drop it with [`DROP TABLE`]({% link {{ page.version.version }}/drop-table.md %}) or use [`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %}).

You can specify the target database in the table name in the `IMPORT` statement. If it's not specified there, the active database in the SQL session is used.

### Create table

Your `IMPORT` statement must reference an import file that specifies the schema of the data you want to import. You have several options:

- Load a file that already contains a `CREATE TABLE` statement. For an example, see [Import a PostgreSQL database dump](#import-a-postgresql-database-dump) below.

- Use [`CREATE TABLE`]({% link {{ page.version.version }}/create-table.md %}) followed by [`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %}). For an example, see [Import into a new table from a CSV file]({% link {{ page.version.version }}/import-into.md %}#import-into-a-new-table-from-a-csv-file).

We also recommend [specifying all secondary indexes you want to use in the `CREATE TABLE` statement]({% link {{ page.version.version }}/create-table.md %}#create-a-table-with-secondary-and-gin-indexes). It is possible to [add secondary indexes later]({% link {{ page.version.version }}/create-index.md %}), but it is significantly faster to specify them during import. For large imports, read additional guidance in [Import into a schema with secondary indexes]({% link {{ page.version.version }}/import-performance-best-practices.md %}#import-into-a-schema-with-secondary-indexes).

Other support considerations include:

-  `IMPORT` supports [computed columns]({% link {{ page.version.version }}/computed-columns.md %}) for PostgreSQL dump files only.
- By default, the [PostgreSQL][postgres] and [MySQL][mysql] import formats support foreign keys. However, the most common dependency issues during import are caused by unsatisfied foreign key relationships that cause errors like `pq: there is no unique constraint matching given keys for referenced table tablename`. You can avoid these issues by adding the [`skip_foreign_keys`](#import-options) option to your `IMPORT` statement as needed. Ignoring foreign constraints will also speed up data import.

### Available storage

Each node in the cluster is assigned an equal part of the imported data, and so must have enough temp space to store it. In addition, data is persisted as a normal table, and so there must also be enough space to hold the final, replicated data. The node's first-listed/default [`store`]({% link {{ page.version.version }}/cockroach-start.md %}#store) directory must have enough available storage to hold its portion of the data.

On [`cockroach start`]({% link {{ page.version.version }}/cockroach-start.md %}), if you set `--max-disk-temp-storage`, it must also be greater than the portion of the data a node will store in temp space.

### Import file location

CockroachDB uses the URL provided to construct a secure API call to the service you specify. The URL structure depends on the type of file storage you are using. For more information, see the following:

- [Use Cloud Storage]({% link {{ page.version.version }}/use-cloud-storage.md %})
- [Use `userfile` Storage]({% link {{ page.version.version }}/use-userfile-storage.md %})
- [Use a Local File Server]({% link {{ page.version.version }}/use-a-local-file-server.md %})

{% include {{ page.version.version }}/misc/external-connection-note.md %}

### Table users and privileges

Imported tables are treated as new tables, so you must [`GRANT`]({% link {{ page.version.version }}/grant.md %}) privileges to them.

## Performance

- All nodes are used during the import job, which means all nodes' CPU and RAM will be partially consumed by the `IMPORT` task in addition to serving normal traffic.
- To improve performance, import at least as many files as you have nodes (i.e., there is at least one file for each node to import) to increase parallelism.
- To further improve performance, order the data in the imported files by [primary key]({% link {{ page.version.version }}/primary-key.md %}) and ensure the primary keys do not overlap between files.
- An import job will pause if a node in the cluster runs out of disk space. See [Viewing and controlling import jobs](#viewing-and-controlling-import-jobs) for information on resuming and showing the progress of import jobs. {% include {{page.version.version}}/storage/free-up-disk-space.md %}
- An import job will [pause]({% link {{ page.version.version }}/pause-job.md %}) instead of entering a `failed` state if it continues to encounter transient errors once it has retried a maximum number of times. Once the import has paused, you can either [resume]({% link {{ page.version.version }}/resume-job.md %}) or [cancel]({% link {{ page.version.version }}/cancel-job.md %}) it.

For more detail on optimizing import performance, see [Import Performance Best Practices]({% link {{ page.version.version }}/import-performance-best-practices.md %}).

## Viewing and controlling import jobs

After CockroachDB initiates an import, you can view its progress with [`SHOW JOBS`]({% link {{ page.version.version }}/show-jobs.md %}) and on the [**Jobs** page]({% link {{ page.version.version }}/ui-jobs-page.md %}) of the DB Console, and you can control it with [`PAUSE JOB`]({% link {{ page.version.version }}/pause-job.md %}), [`RESUME JOB`]({% link {{ page.version.version }}/resume-job.md %}), and [`CANCEL JOB`]({% link {{ page.version.version }}/cancel-job.md %}).

{{site.data.alerts.callout_info}}
If initiated correctly, the statement returns when the import is finished or if it encounters an error. In some cases, the import can continue after an error has been returned (the error message will tell you that the import has resumed in the background).

 When [resumed]({% link {{ page.version.version }}/resume-job.md %}), [paused]({% link {{ page.version.version }}/pause-job.md %}) imports now continue from their internally recorded progress instead of starting over.
{{site.data.alerts.end}}

## Examples

{% include {{ page.version.version }}/import-export-auth.md %}

### Import a PostgreSQL database dump

{% include_cached copy-clipboard.html %}
~~~ sql
IMPORT PGDUMP 's3://{BUCKET NAME}/{customers.sql}?AWS_ACCESS_KEY_ID={ACCESS KEY}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}'
    WITH ignore_unsupported_statements;
~~~

For this command to succeed, you need to have created the dump file with specific flags to `pg_dump`, and use the `WITH ignore_unsupported_statements` clause. For more information, see [Migrate from PostgreSQL]({% link molt/migrate-to-cockroachdb.md %}).

### Import a table from a PostgreSQL database dump

{% include_cached copy-clipboard.html %}
~~~ sql
IMPORT TABLE employees
    FROM PGDUMP 's3://{BUCKET NAME}/{employees-full.sql}?AWS_ACCESS_KEY_ID={ACCESS KEY}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}'
    WITH skip_foreign_keys WITH ignore_unsupported_statements;
~~~

If the table schema specifies foreign keys into tables that do not exist yet, the `WITH skip_foreign_keys` option may be needed. For more information, see the list of [import options](#import-options).

For this command to succeed, you need to have created the dump file with specific flags to `pg_dump`. For more information, see [Migrate from PostgreSQL]({% link molt/migrate-to-cockroachdb.md %}).

### Import a MySQL database dump

{% include_cached copy-clipboard.html %}
~~~ sql
IMPORT MYSQLDUMP 's3://{BUCKET NAME}/{employees-full.sql}?AWS_ACCESS_KEY_ID={ACCESS KEY}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}';
~~~

For more detailed information about importing data from MySQL, see [Migrate from MySQL]({% link molt/migrate-to-cockroachdb.md %}?filters=mysql).

### Import a table from a MySQL database dump

{% include_cached copy-clipboard.html %}
~~~ sql
IMPORT TABLE employees
    FROM MYSQLDUMP 's3://{BUCKET NAME}/{employees-full.sql}?AWS_ACCESS_KEY_ID={ACCESS KEY}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}' WITH skip_foreign_keys;
~~~

If the table schema specifies foreign keys into tables that do not exist yet, the `WITH skip_foreign_keys` option may be needed. For more information, see the list of [import options](#import-options).

For more detailed information about importing data from MySQL, see [Migrate from MySQL]({% link molt/migrate-to-cockroachdb.md %}?filters=mysql).

### Import a limited number of rows

The `row_limit` option determines the number of rows to import. This option will import the first *n* rows from each table in the dump file. It is useful for finding errors quickly before executing a more time- and resource-consuming import. Imported tables can be inspected for their schema and data, but must be [dropped]({% link {{ page.version.version }}/drop-table.md %}) before running the actual import.

{% include_cached copy-clipboard.html %}
~~~ sql
IMPORT PGDUMP
    's3://{BUCKET NAME}/{customers.sql}?AWS_ACCESS_KEY_ID={ACCESS KEY}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}'
    WITH
      row_limit = '10';
~~~

### Import a compressed file

CockroachDB chooses the decompression codec based on the filename (the common extensions `.gz` or `.bz2` and `.bz`) and uses the codec to decompress the file during import.

{% include_cached copy-clipboard.html %}
~~~ sql
IMPORT TABLE employees
    FROM PGDUMP 's3://{BUCKET NAME}/{employees-full.sql.gz}?AWS_ACCESS_KEY_ID={ACCESS KEY}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}';
~~~

Optionally, you can use the `decompress` option to specify the codec to be used for decompressing the file during import:

{% include_cached copy-clipboard.html %}
~~~ sql
IMPORT TABLE employees
    FROM PGDUMP 's3://{BUCKET NAME}/{employees-full.sql}?AWS_ACCESS_KEY_ID={ACCESS KEY}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}'
    WITH decompress = 'gzip';
~~~

### Run an import within a transaction

 The `DETACHED` option allows an import to be run asynchronously, returning the job ID immediately once initiated. You can run imports within transactions by specifying the `DETACHED` option.

To use the `DETACHED` option with `IMPORT` in a transaction:

{% include_cached copy-clipboard.html %}
~~~ sql
BEGIN;

CREATE DATABASE newdb;

SET DATABASE = newdb;

IMPORT TABLE employees FROM PGDUMP 's3://{BUCKET NAME}/{employees-full.sql}?AWS_ACCESS_KEY_ID={ACCESS KEY}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}' WITH DETACHED;

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
The file system backup location on the NFS drive is relative to the path specified by the `--external-io-dir` flag set while [starting the node]({% link {{ page.version.version }}/cockroach-start.md %}). If the flag is set to `disabled`, then imports from local directories and NFS drives are disabled. Use `self` if you do not want to specify a `nodeID`, and the individual data files will be in the `extern` directories of arbitrary nodes; however, to work correctly, each node must have the [`--external-io-dir` flag]({% link {{ page.version.version }}/cockroach-start.md %}#general) point to the same NFS mount or other network-backed, shared storage.
{{site.data.alerts.end}}

If a `nodeID` is provided, the data files to import will be in the `extern` directory of the specified node:

~~~ shell
cd /tmp/node2 && ls
~~~

~~~
000355.log		      	 cockroach-temp700212211
000357.log		      	 cockroach.advertise-addr
000359.sst		      	 cockroach.advertise-sql-addr
COCKROACHDB_VERSION		 cockroach.http-addr
CURRENT			         cockroach.listen-addr
IDENTITY		         cockroach.sql-addr
LOCK		             extern
MANIFEST-000010		     logs
OPTIONS-000005		  	 temp-dirs-record.txt
auxiliary
~~~

~~~ shell
cd /tmp/node2/extern && ls
~~~

~~~
customers.sql
~~~

Then, specify which node to access by including the `nodeID` in the `IMPORT` statement:

{% include_cached copy-clipboard.html %}
~~~ sql
IMPORT TABLE customers FROM PGDUMP 'nodelocal://2/customers.sql';
~~~

You can also use the [`cockroach nodelocal upload`]({% link {{ page.version.version }}/cockroach-nodelocal-upload.md %}) command to upload a file to the external IO directory on a node's (the gateway node, by default) local file system.


### Import data into your CockroachDB {{ site.data.products.cloud }} cluster

You can import data into your CockroachDB {{ site.data.products.cloud }} cluster using either [`userfile`]({% link {{ page.version.version }}/use-userfile-storage.md %}) or [cloud storage]({% link {{ page.version.version }}/use-cloud-storage.md %}):

<div class="filters clearfix">
  <button class="filter-button" data-scope="userfile"><code>userfile</code></button>
  <button class="filter-button" data-scope="cloud">Cloud storage</button>
</div>

<section class="filter-content" markdown="1" data-scope="userfile">

#### Import using `userfile`

{% include cockroachcloud/userfile-examples/import-into-userfile.md %}

</section>

<section class="filter-content" markdown="1" data-scope="cloud">

#### Import using cloud storage

To import a table into your cluster:

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (
		id UUID PRIMARY KEY,
		name TEXT,
		INDEX name_idx (name)
)
CSV DATA ('s3://{BUCKET NAME}/{customer-data}?AWS_ACCESS_KEY_ID={ACCESS KEY}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}')
;
~~~

</section>

## Known limitation

{% include {{ page.version.version }}/known-limitations/import-high-disk-contention.md %}

## See also

- [Use Cloud Storage]({% link {{ page.version.version }}/use-cloud-storage.md %})
- [Migration Overview]({% link molt/migration-overview.md %})
- [Migrate from MySQL]({% link molt/migrate-to-cockroachdb.md %}?filters=mysql)
- [Migrate from PostgreSQL]({% link molt/migrate-to-cockroachdb.md %})
- [`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %})

{% comment %} Reference Links {% endcomment %}

[postgres]: {% link molt/migrate-to-cockroachdb.md %}
[mysql]: {% link molt/migrate-to-cockroachdb.md %}?filters=mysql
