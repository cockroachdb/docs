---
title: IMPORT INTO
summary: Import CSV data into an existing CockroachDB table.
toc: true
docs_area: reference.sql
---

The `IMPORT INTO` [statement](sql-statements.html) imports CSV, Avro, or delimited data into an [existing table](create-table.html), by appending new rows into the table.

## Considerations

- `IMPORT INTO` works for existing tables. To import data into new tables, read the following [Import into a new table from a CSV file](#import-into-a-new-table-from-a-csv-file) example.
- `IMPORT INTO` takes the table **offline** before importing the data. The table will be online again once the job has completed successfully.
- `IMPORT INTO` cannot be used during a [rolling upgrade](upgrade-cockroach-version.html).
- `IMPORT INTO` is a blocking statement. To run an `IMPORT INTO` job asynchronously, use the [`DETACHED`](#options-detached) option.
- `IMPORT INTO` invalidates all [foreign keys](foreign-key.html) on the target table. To validate the foreign key(s), use the [`VALIDATE CONSTRAINT`](validate-constraint.html) statement.
- `IMPORT INTO` is an insert-only statement; it cannot be used to update existing rows—see [`UPDATE`](update.html). Imported rows cannot conflict with primary keys in the existing table, or any other [`UNIQUE`](unique.html) constraint on the table.
- `IMPORT INTO` does not offer `SELECT` or `WHERE` clauses to specify subsets of rows. To do this, use [`INSERT`](insert.html#insert-from-a-select-statement).
- `IMPORT INTO` will cause any [changefeeds](change-data-capture-overview.html) running on the targeted table to fail.
- See the [`IMPORT`](import.html) page for guidance on importing PostgreSQL and MySQL dump files.

 `IMPORT INTO` now supports importing into [`REGIONAL BY ROW`](set-locality.html#regional-by-row) tables.

{{site.data.alerts.callout_info}}
Optimize import operations in your applications by following our [Import Performance Best Practices](import-performance-best-practices.html).
{{site.data.alerts.end}}

## Required privileges

### Table privileges

The user must have the `INSERT` and `DROP` [privileges](security-reference/authorization.html#managing-privileges) on the specified table. (`DROP` is required because the table is taken offline during the `IMPORT INTO`.)

### Source privileges

{% include {{ page.version.version }}/misc/external-io-privilege.md %}

`EXTERNALIOIMPLICITACCESS` or [`admin`](security-reference/authorization.html#admin-role) is required for the following scenarios:

- To interact with a cloud storage resource using [`IMPLICIT` authentication](use-cloud-storage-for-bulk-operations.html#authentication).
- Use of a [custom endpoint](https://docs.aws.amazon.com/sdk-for-go/api/aws/endpoints/) on S3.
- [Nodelocal](cockroach-nodelocal-upload.html)
- [HTTP](use-a-local-file-server-for-bulk-operations.html) or HTTPS.

No special privilege is required for: 

- Amazon S3 and Google Cloud Storage using `SPECIFIED` credentials. Azure Storage is always `SPECIFIED` by default.
- [Userfile](use-userfile-for-bulk-operations.html)

{% include {{ page.version.version }}/misc/bulk-permission-note.md %}

{% include {{ page.version.version }}/misc/s3-compatible-warning.md %}

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/import_into.html %}
</div>

{{site.data.alerts.callout_info}}
While importing into an existing table, the table is taken offline.
{{site.data.alerts.end}}

## Parameters

Parameter | Description
----------|------------
`table_name` | The name of the table you want to import into.
`column_name` | The table columns you want to import.<br><br>Note: Currently, target columns are not enforced.
`file_location` | The [URL](#import-file-location) of a CSV or Avro file containing the table data. This can be a comma-separated list of URLs. For an example, see [Import into an existing table from multiple CSV files](#import-into-an-existing-table-from-multiple-csv-files) below.
`<option> [= <value>]` | Control your import's behavior with [import options](#import-options).

#### Delimited data files

The `DELIMITED DATA` format can be used to import delimited data from any text file type, while ignoring characters that need to be escaped, like the following:

- The file's delimiter (`\t` by default)
- Double quotes (`"`)
- Newline (`\n`)
- Carriage return (`\r`)

For examples showing how to use the `DELIMITED DATA` format, see the [Examples](#import-into-an-existing-table-from-a-delimited-data-file) section below.

### Import options

You can control the `IMPORT` process's behavior using any of the following key-value pairs as a `<option>  [= <value>]`.

Key                 | <div style="width:130px">Context</div> | Value
--------------------+-----------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
`delimiter`            | `CSV DATA `     | The unicode character that delimits columns in your rows. **Default: `,`**. <br><br> Example: To use tab-delimited values: `IMPORT INTO foo (..) CSV DATA ('file.csv') WITH delimiter = e'\t';`
`comment`              | `CSV DATA `     | The unicode character that identifies rows to skip. <br><br> Example: `IMPORT INTO foo (..) CSV DATA ('file.csv') WITH comment = '#';`
`nullif`               | `CSV DATA `, [`DELIMITED DATA`](#delimited-data-files) | The string that should be converted to *NULL*. <br><br> Example: To use empty columns as *NULL*: `IMPORT INTO foo (..) CSV DATA ('file.csv') WITH nullif = '';`
`skip`                 | `CSV DATA `, [`DELIMITED DATA`](#delimited-data-files) | The number of rows to be skipped while importing a file. **Default: `'0'`**. <br><br> Example: To import CSV files with column headers: `IMPORT INTO ... CSV DATA ('file.csv') WITH skip = '1';`
`decompress`           | General         | The decompression codec to be used: `gzip`, `bzip`, `auto`, or `none`.  **Default: `'auto'`**, which guesses based on file extension (`.gz`, `.bz`, `.bz2`). `none` disables decompression. <br><br> Example: `IMPORT INTO ... WITH decompress = 'bzip';`
`rows_terminated_by`   | [`DELIMITED DATA`](#delimited-data-files)  | The unicode character to indicate new lines in the input file. **Default:** `\n` <br><br> Example: `IMPORT INTO ... WITH rows_terminated_by='\m';`
`fields_terminated_by` | [`DELIMITED DATA`](#delimited-data-files)  | The unicode character used to separate fields in each input line. **Default:** `\t` <br><br> Example: `IMPORT INTO ... WITH fields_terminated_by='.';`
`fields_enclosed_by`   | [`DELIMITED DATA`](#delimited-data-files)  | The unicode character that encloses fields. **Default:** `"` <br><br> Example: `IMPORT INTO ... WITH fields_enclosed_by='"';`
`fields_escaped_by`    | [`DELIMITED DATA`](#delimited-data-files)  | The unicode character, when preceding one of the above `DELIMITED DATA` options, to be interpreted literally. <br><br> Example: `IMPORT INTO ... WITH fields_escaped_by='\';`
`strict_validation`    | `AVRO DATA`    | Rejects Avro records that do not have a one-to-one mapping between Avro fields to the target CockroachDB schema. By default, CockroachDB ignores unknown Avro fields and sets missing SQL fields to `NULL`. CockroachDB will also attempt to convert the Avro field to the CockroachDB [data type][datatypes]; otherwise, it will report an error. <br><br> Example: `IMPORT INTO foo (..) AVRO DATA ('file.avro') WITH strict_validation;`
`records_terminated_by` | `AVRO DATA`   | The unicode character to indicate new lines in the input binary or JSON file. This is not needed for Avro OCF. **Default:** `\n` <br><br> Example: To use tab-terminated records: `IMPORT INTO foo (..) AVRO DATA ('file.csv') WITH records_terminated_by = e'\t';`
`data_as_binary_records` | `AVRO DATA`  | Use when [importing a binary file containing Avro records](migrate-from-avro.html#import-binary-or-json-records).  The schema is not included in the file, so you need to specify the schema with either the `schema` or `schema_uri` option. <br><br> Example: `IMPORT INTO foo (..) AVRO DATA ('file.bjson') WITH data_as_binary_records, schema_uri='..';`
`data_as_json_records` | `AVRO DATA`    | Use when [importing a JSON file containing Avro records](migrate-from-avro.html#import-binary-or-json-records). The schema is not included in the file, so you need to specify the schema with either the `schema` or `schema_uri` option. <br><br> Example: `IMPORT INTO foo (..) AVRO DATA ('file.bjson') WITH data_as_json_records, schema='{ "type": "record",..}';`
`schema`               | `AVRO DATA`    | The schema of the Avro records included in the binary or JSON file. This is not needed for Avro OCF. <br> See `data_as_json_records` example above.
`schema_uri`           | `AVRO DATA`    | The URI of the file containing the schema of the Avro records include in the binary or JSON file. This is not needed for Avro OCF. <br> See `data_as_binary_records` example above.
<a name="options-detached"></a>`DETACHED`             | N/A            |  When an import runs in `DETACHED` mode, it will execute asynchronously and the job ID will be returned immediately without waiting for the job to finish. Note that with `DETACHED` specified, further job information and the job completion status will not be returned. To check on the job status, use the [`SHOW JOBS`](show-jobs.html) statement. <br><br>To run an import within a [transaction](transactions.html), use the `DETACHED` option.

For examples showing how to use these options, see the [Examples section](import-into.html#examples).

For instructions and working examples showing how to migrate data from other databases and formats, see the [Migration Overview](migration-overview.html).

## Requirements

### Prerequisites

Before using `IMPORT INTO`, you should have:

- An existing table to import into (use [`CREATE TABLE`](create-table.html)).

     `IMPORT INTO` supports [computed columns](computed-columns.html) and the [`DEFAULT` expressions listed below](#supported-default-expressions).

- The CSV or Avro data you want to import, preferably hosted on cloud storage. This location must be equally accessible to all nodes using the same import file location. This is necessary because the `IMPORT INTO` statement is issued once by the client, but is executed concurrently across all nodes of the cluster. For more information, see the [Import file location](#import-file-location) section below.

#### Supported `DEFAULT` expressions

`IMPORT INTO` supports [computed columns](computed-columns.html) and the following [`DEFAULT`](default-value.html) expressions:

- `DEFAULT` expressions with [user-defined types](enum.html).

- Constant `DEFAULT` expressions, which are expressions that return the same value in different statements. Examples include:

    - Literals (booleans, strings, integers, decimals, dates)
    - Functions where each argument is a constant expression and the functions themselves depend solely on their arguments (e.g., arithmetic operations, boolean logical operations, string operations).

- Current [`TIMESTAMP`](timestamp.html) functions that record the transaction timestamp, which include:

    - `current_date()`
    - `current_timestamp()`
    - `localtimestamp()`
    - `now()`
    - `statement_timestamp()`
    - `timeofday()`
    - `transaction_timestamp()`

- `random()`
- `gen_random_uuid()`
- `unique_rowid()`
- `nextval()`

### Available storage

Each node in the cluster is assigned an equal part of the imported data, and so must have enough temp space to store it. In addition, data is persisted as a normal table, and so there must also be enough space to hold the final, replicated data. The node's first-listed/default [`store`](cockroach-start.html#store) directory must have enough available storage to hold its portion of the data.

On [`cockroach start`](cockroach-start.html), if you set `--max-disk-temp-storage`, it must also be greater than the portion of the data a node will store in temp space.

### Import file location

CockroachDB uses the URL provided to construct a secure API call to the service you specify. The URL structure depends on the type of file storage you are using. For more information, see the following:

- [Use Cloud Storage for Bulk Operations](use-cloud-storage-for-bulk-operations.html)
- [Use a Local File Server for Bulk Operations](use-a-local-file-server-for-bulk-operations.html)

## Performance

- All nodes are used during the import job, which means all nodes' CPU and RAM will be partially consumed by the `IMPORT` task in addition to serving normal traffic.
- To improve performance, import at least as many files as you have nodes (i.e., there is at least one file for each node to import) to increase parallelism.
- To further improve performance, order the data in the imported files by [primary key](primary-key.html) and ensure the primary keys do not overlap between files.
- An import job will pause if a node in the cluster runs out of disk space. See [Viewing and controlling import jobs](#viewing-and-controlling-import-jobs) for information on resuming and showing the progress of import jobs.
- An import job will [pause](pause-job.html) instead of entering a `failed` state if it continues to encounter transient errors once it has retried a maximum number of times. Once the import has paused, you can either [resume](resume-job.html) or [cancel](cancel-job.html) it.

For more detail on optimizing import performance, see [Import Performance Best Practices](import-performance-best-practices.html).

## Viewing and controlling import jobs

After CockroachDB successfully initiates an import into an existing table, it registers the import as a job, which you can view with [`SHOW JOBS`](show-jobs.html).

After the import has been initiated, you can control it with [`PAUSE JOB`](pause-job.html), [`RESUME JOB`](resume-job.html), and [`CANCEL JOB`](cancel-job.html).

If initiated correctly, the statement returns when the import is finished or if it encounters an error. In some cases, the import can continue after an error has been returned (the error message will tell you that the import has resumed in background).

{{site.data.alerts.callout_danger}}
Pausing and then resuming an `IMPORT INTO` job will cause it to restart from the beginning.
{{site.data.alerts.end}}

## Examples

The following provide connection examples to cloud storage providers. For more information on connecting to different storage options, read [Use Cloud Storage for Bulk Operations](use-cloud-storage-for-bulk-operations.html).

We recommend reading the [Considerations](#considerations) section for important details when working with `IMPORT INTO`.

<div class="filters clearfix">
  <button class="filter-button" data-scope="s3">Amazon S3</button>
  <button class="filter-button" data-scope="azure">Azure Storage</button>
  <button class="filter-button" data-scope="gcs">Google Cloud Storage</button>
</div>

<section class="filter-content" markdown="1" data-scope="s3">

{% include {{ page.version.version }}/backups/aws-auth-note.md %}

### Import into a new table from a CSV file

To import into a new table, use [`CREATE TABLE`](create-table.html) followed by `IMPORT INTO`.

{{site.data.alerts.callout_info}}
 Certain [`IMPORT TABLE`](import.html) statements that defined the table schema inline are **not** supported in v22.1+. We recommend using the following example to import data into a new table.
{{site.data.alerts.end}}

First, create the new table with the necessary columns and data types:

{% include_cached copy-clipboard.html %}
~~~sql
CREATE TABLE users (
        id UUID PRIMARY KEY,
        city STRING,
        name STRING,
        address STRING,
        credit_card STRING
      );
~~~

Next, use `IMPORT INTO` to import the data into the new table:

{% include_cached copy-clipboard.html %}
~~~sql
IMPORT INTO users (id, city, name, address, credit_card)
     CSV DATA (
       's3://{BUCKET NAME}/{customers.csv}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}'
     );
~~~

### Import into an existing table from a CSV file

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT INTO customers (id, name)
    CSV DATA (
      's3://{BUCKET NAME}/{customers.csv}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}'
    );
~~~

{{site.data.alerts.callout_info}}
The column order in your `IMPORT` statement must match the column order in the CSV being imported, regardless of the order in the existing table's schema.
{{site.data.alerts.end}}

### Import into an existing table from multiple CSV files

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT INTO customers (id, name)
    CSV DATA (
      's3://{BUCKET NAME}/{customers.csv}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}',
      's3://{BUCKET NAME}/{customers2.csv}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}',
      's3://{BUCKET NAME}/{customers3.csv}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}',
      's3://{BUCKET NAME}/{customers4.csv}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}',
    );
~~~

### Import into an existing table using a wildcard

You can specify [file patterns to match](https://golang.org/pkg/path/filepath/#Match) instead of explicitly listing every file. Paths are matched using the `*` wildcard character to include matching files directly under the specified path. Use a wildcard to include:

- All files in a given directory (e.g.,`s3://bucket-name/path/to/data/*`).
- All files in a given directory that end with a given string (e.g., `s3://bucket-name/files/*.csv`).
- All files in a given directory that start with a given string (e.g., `s3://bucket-name/files/data*`).
- All files in a given directory that start and end with a given string (e.g., `s3://bucket-name/files/data*.csv`).

These only match files directly under the specified path and do not descend into additional directories recursively.

{% include_cached copy-clipboard.html %}
~~~ sql
IMPORT INTO users (id, city, name, address, credit_card)
  CSV DATA (
    's3://{BUCKET NAME}/*.csv?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}'
  );
~~~

### Import into an existing table from an Avro file

 [Avro OCF data](migrate-from-avro.html#import-an-object-container-file), [JSON records, or binary records](migrate-from-avro.html#import-binary-or-json-records) can be imported. The following are examples of importing Avro OCF data.

To specify the table schema in-line:

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT INTO customers
    AVRO DATA (
      's3://{BUCKET NAME}/{customers.avro}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}'
    );
~~~

For more information about importing data from Avro, including examples, see [Migrate from Avro](migrate-from-avro.html).

### Import into an existing table from a delimited data file

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT INTO customers
    DELIMITED DATA (
      's3://{BUCKET NAME}/{customers.csv}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}'
    )
    WITH
      fields_terminated_by='|',
      fields_enclosed_by='"',
      fields_escaped_by='\';
~~~

</section>

<section class="filter-content" markdown="1" data-scope="azure">

### Import into a new table from a CSV file

To import into a new table, use [`CREATE TABLE`](create-table.html) followed by `IMPORT INTO`.

{{site.data.alerts.callout_info}}
Note that as of v21.2 [`IMPORT TABLE`](import.html) will be deprecated; therefore, we recommend using the following example to import data into a new table.
{{site.data.alerts.end}}

First, create the new table with the necessary columns and data types:

{% include_cached copy-clipboard.html %}
~~~sql
CREATE TABLE users (
        id UUID PRIMARY KEY,
        city STRING,
        name STRING,
        address STRING,
        credit_card STRING
      );
~~~

Next, use `IMPORT INTO` to import the data into the new table:

{% include_cached copy-clipboard.html %}
~~~sql
IMPORT INTO users (id, city, name, address, credit_card)
     CSV DATA (
       'azure://{CONTAINER NAME}/{customers.csv}?AZURE_ACCOUNT_NAME={ACCOUNT NAME}&AZURE_ACCOUNT_KEY={ENCODED KEY}'
     );
~~~

### Import into an existing table from a CSV file

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT INTO customers (id, name)
    CSV DATA (
      'azure://{CONTAINER NAME}/{customers.csv}?AZURE_ACCOUNT_NAME={ACCOUNT NAME}&AZURE_ACCOUNT_KEY={ENCODED KEY}'
    );
~~~

{{site.data.alerts.callout_info}}
The column order in your `IMPORT` statement must match the column order in the CSV being imported, regardless of the order in the existing table's schema.
{{site.data.alerts.end}}

### Import into an existing table from multiple CSV files

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT INTO customers (id, name)
    CSV DATA (
      'azure://{CONTAINER NAME}/{customers.csv}?AZURE_ACCOUNT_NAME={ACCOUNT NAME}&AZURE_ACCOUNT_KEY={ENCODED KEY}',
      'azure://{CONTAINER NAME}/{customers2.csv}?AZURE_ACCOUNT_NAME={ACCOUNT NAME}&AZURE_ACCOUNT_KEY={ENCODED KEY}',
      'azure://{CONTAINER NAME}/{customers3.csv}?AZURE_ACCOUNT_NAME={ACCOUNT NAME}&AZURE_ACCOUNT_KEY={ENCODED KEY}',
      'azure://{CONTAINER NAME}/{customers4.csv}?AZURE_ACCOUNT_NAME={ACCOUNT NAME}&AZURE_ACCOUNT_KEY={ENCODED KEY}',
      'azure://{CONTAINER NAME}/{customers5.csv}?AZURE_ACCOUNT_NAME={ACCOUNT NAME}&AZURE_ACCOUNT_KEY={ENCODED KEY}',
    );
~~~

### Import into an existing table from an Avro file

 [Avro OCF data](migrate-from-avro.html#import-an-object-container-file), [JSON records, or binary records](migrate-from-avro.html#import-binary-or-json-records) can be imported. The following are examples of importing Avro OCF data.

To specify the table schema in-line:

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT INTO customers
    AVRO DATA (
      'azure://{CONTAINER NAME}/{customers.avro}?AZURE_ACCOUNT_NAME={ACCOUNT NAME}&AZURE_ACCOUNT_KEY={ENCODED KEY}'
    );
~~~

For more information about importing data from Avro, including examples, see [Migrate from Avro](migrate-from-avro.html).

### Import into an existing table from a delimited data file

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT INTO customers
    DELIMITED DATA (
      'azure://{CONTAINER NAME}/{customers.csv}?AZURE_ACCOUNT_NAME={ACCOUNT NAME}&AZURE_ACCOUNT_KEY={ENCODED KEY}'
    )
    WITH
      fields_terminated_by='|',
      fields_enclosed_by='"',
      fields_escaped_by='\';
~~~

</section>

<section class="filter-content" markdown="1" data-scope="gcs">

{% include {{ page.version.version }}/backups/gcs-auth-note.md %}

### Import into a new table from a CSV file

To import into a new table, use [`CREATE TABLE`](create-table.html) followed by `IMPORT INTO`.

{{site.data.alerts.callout_info}}
Note that as of v21.2 [`IMPORT TABLE`](import.html) will be deprecated; therefore, we recommend using the following example to import data into a new table.
{{site.data.alerts.end}}

First, create the new table with the necessary columns and data types:

{% include_cached copy-clipboard.html %}
~~~sql
CREATE TABLE users (
        id UUID PRIMARY KEY,
        city STRING,
        name STRING,
        address STRING,
        credit_card STRING
      );
~~~

Next, use `IMPORT INTO` to import the data into the new table:

{% include_cached copy-clipboard.html %}
~~~sql
IMPORT INTO users (id, city, name, address, credit_card)
     CSV DATA (
       'gs://{BUCKET NAME}/{customers.csv}?AUTH=specified&CREDENTIALS={ENCODED KEY}'
     );
~~~

### Import into an existing table from a CSV file

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT INTO customers (id, name)
    CSV DATA (
      'gs://{BUCKET NAME}/{customers.csv}?AUTH=specified&CREDENTIALS={ENCODED KEY}'
    );
~~~

{{site.data.alerts.callout_info}}
The column order in your `IMPORT` statement must match the column order in the CSV being imported, regardless of the order in the existing table's schema.
{{site.data.alerts.end}}

### Import into an existing table from multiple CSV files

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT INTO customers (id, name)
    CSV DATA (
      'gs://{BUCKET NAME}/{customers.csv}?AUTH=specified&CREDENTIALS={ENCODED KEY}',
      'gs://{BUCKET NAME}/{customers2.csv}?AUTH=specified&CREDENTIALS={ENCODED KEY}',
      'gs://{BUCKET NAME}/{customers3.csv}?AUTH=specified&CREDENTIALS={ENCODED KEY}',
      'gs://{BUCKET NAME}/{customers4.csv}?AUTH=specified&CREDENTIALS={ENCODED KEY}',
    );
~~~

### Import into an existing table from an Avro file

 [Avro OCF data](migrate-from-avro.html#import-an-object-container-file), [JSON records, or binary records](migrate-from-avro.html#import-binary-or-json-records) can be imported. The following are examples of importing Avro OCF data.

To specify the table schema in-line:

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT INTO customers
    AVRO DATA (
      'gs://{BUCKET NAME}/{customers.avro}?AUTH=specified&CREDENTIALS={ENCODED KEY}'
    );
~~~

For more information about importing data from Avro, including examples, see [Migrate from Avro](migrate-from-avro.html).

### Import into an existing table from a delimited data file

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT INTO customers
    DELIMITED DATA (
      'gs://{BUCKET NAME}/{customers.csv}?AUTH=specified&CREDENTIALS={ENCODED KEY}'
    )
    WITH
      fields_terminated_by='|',
      fields_enclosed_by='"',
      fields_escaped_by='\';
~~~

</section>

## Known limitations

- You cannot import into a table with [partial indexes](partial-indexes.html).
- While importing into an existing table, the table is taken offline.
- After importing into an existing table, [constraints](constraints.html) will be un-validated and need to be [re-validated](validate-constraint.html).
- Imported rows must not conflict with existing rows in the table or any unique secondary indexes.
- `IMPORT INTO` works for only a single existing table.
- `IMPORT INTO` can sometimes fail with a "context canceled" error, or can restart itself many times without ever finishing. If this is happening, it is likely due to a high amount of disk contention. This can be mitigated by setting the `kv.bulk_io_write.max_rate` [cluster setting](cluster-settings.html) to a value below your max disk write speed. For example, to set it to 10MB/s, execute:
    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SET CLUSTER SETTING kv.bulk_io_write.max_rate = '10MB';
    ~~~

## See also

- [`IMPORT`](import.html)
- [Migration Overview](migration-overview.html)
- [Use Cloud Storage for Bulk Operations](use-cloud-storage-for-bulk-operations.html)
- [Import Performance Best Practices](import-performance-best-practices.html)
