---
title: IMPORT INTO
summary: Import CSV data into an existing CockroachDB table.
toc: true
---

The `IMPORT INTO` [statement](sql-statements.html) imports CSV or Avro data into an [existing table](create-table.html). `IMPORT INTO` appends new rows onto the table.

## Considerations

- `IMPORT INTO` only works for existing tables. For information on how to import data into new tables, see [`IMPORT`](import.html).
- `IMPORT INTO` cannot be used within a [transaction](transactions.html) or during a [rolling upgrade](upgrade-cockroach-version.html).
- `IMPORT INTO` invalidates all [foreign keys](foreign-key.html) on the target table. To validate the foreign key(s), use the [`VALIDATE CONSTRAINT`](validate-constraint.html) statement.
- `IMPORT INTO` cannot be used to insert data into a column for an existing row. To do this, use [`INSERT`](insert.html).

## Required privileges

Only members of the `admin` role can run `IMPORT INTO`. By default, the `root` user belongs to the `admin` role.

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/import_into.html %}
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
`<option> [= <value>]` | Control your import's behavior with [CSV import options](#csv-import-options) or [Avro import options](#avro-import-options).

### CSV import options

You can control the `IMPORT` process's behavior using any of the following key-value pairs as a `<option>  [= <value>]`.

 Option         | Value   | Example
-------------+---------+---------
`delimiter`  | The unicode character that delimits columns in your rows.<br><br>**Default: `,`**. | To use tab-delimited values: `IMPORT INTO foo (..) CSV DATA ('file.csv') WITH delimiter = e'\t';`
`comment`    | The unicode character that identifies rows to skip. | `IMPORT INTO foo (..) CSV DATA ('file.csv') WITH comment = '#';`
`nullif`     | The string that should be converted to *NULL*. | To use empty columns as *NULL*: `IMPORT INTO foo (..) CSV DATA ('file.csv') WITH nullif = '';`
`skip`       | The number of rows to be skipped while importing a file.<br><br>**Default: `'0'`**. | To import CSV files with column headers: `IMPORT INTO ... CSV DATA ('file.csv') WITH skip = '1';`
`decompress` | The decompression codec to be used: `gzip`, `bzip`, `auto`, or `none`.<br><br>**Default: `'auto'`**, which guesses based on file extension (`.gz`, `.bz`, `.bz2`). `none` disables decompression. | `IMPORT INTO ... WITH decompress = 'bzip';`

For examples showing how to use these options, see the [`IMPORT` - Examples section](import.html#examples).

For instructions and working examples showing how to migrate data from other databases and formats, see the [Migration Overview](migration-overview.html). For information on how to import data into new tables, see [`IMPORT`](import.html).

### Avro import options

 Option  | Description   | Example
 --------+---------------+----------
`strict_validation`      | Rejects Avro records that do not have a one-to-one mapping between Avro fields to the target CockroachDB schema. By default, CockroachDB ignores unknown Avro fields and sets missing SQL fields to `NULL`. CockroachDB will also attempt to convert the Avro field to the CockroachDB [data type](migrate-from-avro.html#data-type-mapping); otherwise, it will report an error. | `IMPORT INTO foo (..) AVRO DATA ('file.avro') WITH strict_validation;`
`records_terminated_by`  | The unicode character to indicate new lines in the input binary or JSON file. This is not needed for Avro OCF. <br><br>**Default:** `\n` | To use tab-terminated records: `IMPORT INTO foo (..) AVRO DATA ('file.csv') WITH records_terminated_by = e'\t';`
`data_as_binary_records` | Use when [importing a binary file containing Avro records](migrate-from-avro.html#import-binary-or-json-records).  The schema is not included in the file, so you need to specify the schema with either the `schema` or `schema_uri` option. | `IMPORT INTO foo (..) AVRO DATA ('file.bjson') WITH data_as_binary_records, schema_uri='..';`
`data_as_json_records`   | Use when [importing a JSON file containing Avro records](migrate-from-avro.html#import-binary-or-json-records). The schema is not included in the file, so you need to specify the schema with either the `schema` or `schema_uri` option. | `IMPORT INTO foo (..) AVRO DATA ('file.bjson') WITH data_as_json_records, schema='{ "type": "record",..}';`
`schema`                 | The schema of the Avro records included in the binary or JSON file. This is not needed for Avro OCF. | See `data_as_json_records` example above.
`schema_uri`             | The URI of the file containing the schema of the Avro records include in the binary or JSON file. This is not needed for Avro OCF. | See `data_as_binary_records` example above.

## Requirements

### Prerequisites

Before using `IMPORT INTO`, you should have:

- An existing table to import into (use [`CREATE TABLE`](create-table.html)).

     `IMPORT INTO` supports [computed columns](computed-columns.html) and the [`DEFAULT` expressions listed below](#supported-default-expressions).

- The CSV or Avro data you want to import, preferably hosted on cloud storage. This location must be equally accessible to all nodes using the same import file location. This is necessary because the `IMPORT INTO` statement is issued once by the client, but is executed concurrently across all nodes of the cluster. For more information, see the [Import file location](#import-file-location) section below.

#### Supported `DEFAULT` expressions

 `IMPORT INTO` supports [computed columns](computed-columns.html) and the following [`DEFAULT`](default-value.html) expressions:

- Constant `DEFAULT` expressions, which are expressions that return the same value in different statements. Examples include:

    - Literals (booleans, strings, integers, decimals, dates)
    - Functions where each argument is a constant expression and the functions themselves depend solely on their arguments (e.g., arithmetic operations, boolean logical operations, string operations).

- Current [`TIMESTAMP`](timestamp.html) functions that record the transcation timestamp, which include:

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

### Available storage

Each node in the cluster is assigned an equal part of the imported data, and so must have enough temp space to store it. In addition, data is persisted as a normal table, and so there must also be enough space to hold the final, replicated data. The node's first-listed/default [`store`](cockroach-start.html#store) directory must have enough available storage to hold its portion of the data.

On [`cockroach start`](cockroach-start.html), if you set `--max-disk-temp-storage`, it must also be greater than the portion of the data a node will store in temp space.

### Import file location

CockroachDB uses the URL provided to construct a secure API call to the service you specify. The URL structure depends on the type of file storage you are using. For more information, see the following:

- [Use Cloud Storage for Bulk Operations](use-cloud-storage-for-bulk-operations.html)
- [Use a Local File Server for Bulk Operations](use-a-local-file-server-for-bulk-operations.html)

## Performance

All nodes are used during the import job, which means all nodes' CPU and RAM will be partially consumed by the `IMPORT` task in addition to serving normal traffic.

## Viewing and controlling import jobs

After CockroachDB successfully initiates an import into an existing table, it registers the import as a job, which you can view with [`SHOW JOBS`](show-jobs.html).

After the import has been initiated, you can control it with [`PAUSE JOB`](pause-job.html), [`RESUME JOB`](resume-job.html), and [`CANCEL JOB`](cancel-job.html).

{{site.data.alerts.callout_info}}
If initiated correctly, the statement returns when the import is finished or if it encounters an error. In some cases, the import can continue after an error has been returned (the error message will tell you that the import has resumed in background).
{{site.data.alerts.end}}

{{site.data.alerts.callout_danger}}
Pausing and then resuming an `IMPORT INTO` job will cause it to restart from the beginning.
{{site.data.alerts.end}}

## Examples

### Import into an existing table from a CSV file

Amazon S3:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT INTO customers (id, name)
    CSV DATA (
      's3://acme-co/customers.csv?AWS_ACCESS_KEY_ID=[placeholder]&AWS_SECRET_ACCESS_KEY=[placeholder]&AWS_SESSION_TOKEN=[placeholder]'
    );
~~~

Azure:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT INTO customers (id, name)
    CSV DATA (
      'azure://acme-co/customer-import-data.csv?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
    );
~~~

Google Cloud:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT INTO customers (id, name)
    CSV DATA (
      'gs://acme-co/customers.csv'
    );
~~~

### Import into an existing table from multiple CSV files

Amazon S3:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT INTO customers (id, name)
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
> IMPORT INTO customers (id, name)
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
> IMPORT INTO customers (id, name)
    CSV DATA (
      'gs://acme-co/customers.csv',
      'gs://acme-co/customers2.csv',
      'gs://acme-co/customers3.csv',
      'gs://acme-co/customers4.csv',
    );
~~~


### Import into an existing table from an Avro file

 [Avro OCF data](migrate-from-avro.html#import-an-object-container-file), [JSON records, or binary records](migrate-from-avro.html#import-binary-or-json-records) can be imported. The following are examples of importing Avro OCF data.

To specify the table schema in-line:

Amazon S3:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT INTO customers
    AVRO DATA (
      's3://acme-co/customers.avro?AWS_ACCESS_KEY_ID=[placeholder]&AWS_SECRET_ACCESS_KEY=[placeholder]&AWS_SESSION_TOKEN=[placeholder]'
    );
~~~

Azure:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT INTO customers
    AVRO DATA (
      'azure://acme-co/customers.avro?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
    );
~~~

Google Cloud:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT INTO customers
    AVRO DATA (
      'gs://acme-co/customers.avro'
    );
~~~

For more detailed information about importing data from Avro and examples, see [Migrate from Avro](migrate-from-avro.html).

## Known limitations

- You cannot import into a table with [partial indexes](partial-indexes.html).
- While importing into an existing table, the table is taken offline.
- After importing into an existing table, [constraints](constraints.html) will be un-validated and need to be [re-validated](validate-constraint.html).
- Imported rows must not conflict with existing rows in the table or any unique secondary indexes.
- `IMPORT INTO` works for only a single existing table, and the table must not be [interleaved](interleave-in-parent.html).
- `IMPORT INTO` cannot be used within a [transaction](transactions.html).
- `IMPORT INTO` can sometimes fail with a "context canceled" error, or can restart itself many times without ever finishing. If this is happening, it is likely due to a high amount of disk contention. This can be mitigated by setting the `kv.bulk_io_write.max_rate` [cluster setting](cluster-settings.html) to a value below your max disk write speed. For example, to set it to 10MB/s, execute:
    {% include copy-clipboard.html %}
    ~~~ sql
    > SET CLUSTER SETTING kv.bulk_io_write.max_rate = '10MB';
    ~~~

## See also

- [`IMPORT`](import.html)
- [Migration Overview](migration-overview.html)
- [Use Cloud Storage for Bulk Operations](use-cloud-storage-for-bulk-operations.html)
