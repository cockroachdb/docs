---
title: IMPORT INTO
summary: Import CSV data into an existing CockroachDB table.
toc: true
---

<span class="version-tag">New in v19.2:</span> The `IMPORT INTO` [statement](sql-statements.html) imports CSV data into an [existing table](create-table.html). `IMPORT INTO` appends new rows onto the table.

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
`file_location` | The [URL](#import-file-urls) of a CSV file containing the table data. This can be a comma-separated list of URLs to CSV files. For an example, see [Import into an existing table from multiple CSV files](#import-into-an-existing-table-from-multiple-csv-files) below.
`<option> [= <value>]` | Control your import's behavior with [these options](#import-options).

### Import file URLs

URLs for the files you want to import must use the format shown below. For examples, see [Example file URLs](#example-file-urls).

{% include {{ page.version.version }}/misc/external-urls.md %}

### Import options

You can control the `IMPORT` process's behavior using any of the following key-value pairs as a `<option>  [= <value>]`.

 Key         | Value   | Required? | Example
-------------+---------+-----------+---------
`delimiter`  | The unicode character that delimits columns in your rows.<br><br>**Default: `,`**. | No | To use tab-delimited values: `IMPORT INTO foo (..) CSV DATA ('file.csv') WITH delimiter = e'\t'`
`comment`    | The unicode character that identifies rows to skip. | No | `IMPORT INTO foo (..) CSV DATA ('file.csv') WITH comment = '#'`
`nullif`     | The string that should be converted to *NULL*. | No | To use empty columns as *NULL*: `IMPORT INTO foo (..) CSV DATA ('file.csv') WITH nullif = ''`
`skip`       | The number of rows to be skipped while importing a file.<br><br>**Default: `'0'`**. | No | To import CSV files with column headers: `IMPORT INTO ... CSV DATA ('file.csv') WITH skip = '1'`
`decompress` | The decompression codec to be used: `gzip`, `bzip`, `auto`, or `none`.<br><br>**Default: `'auto'`**, which guesses based on file extension (`.gz`, `.bz`, `.bz2`). `none` disables decompression. | No | `IMPORT INTO ... WITH decompress = 'bzip'`

For examples showing how to use these options, see the [`IMPORT` - Examples section](import.html#examples).

For instructions and working examples showing how to migrate data from other databases and formats, see the [Migration Overview](migration-overview.html). For information on how to import data into new tables, see [`IMPORT`](import.html).

## Requirements

### Prerequisites

Before using `IMPORT INTO`, you should have:

- An existing table to import into (use [`CREATE TABLE`](create-table.html)).
- The CSV data you want to import, preferably hosted on cloud storage. This location must be equally accessible to all nodes using the same import file location. This is necessary because the `IMPORT INTO` statement is issued once by the client, but is executed concurrently across all nodes of the cluster. For more information, see the [Import file location](#import-file-location) section below.

{% include {{ page.version.version }}/sql/import-into-default-value.md %}

### Available storage

Each node in the cluster is assigned an equal part of the imported data, and so must have enough temp space to store it. In addition, data is persisted as a normal table, and so there must also be enough space to hold the final, replicated data. The node's first-listed/default [`store`](cockroach-start.html#store) directory must have enough available storage to hold its portion of the data.

On [`cockroach start`](cockroach-start.html), if you set `--max-disk-temp-storage`, it must also be greater than the portion of the data a node will store in temp space.

### Import file location

We strongly recommend using cloud/remote storage (Amazon S3, Google Cloud Platform, etc.) for the data you want to import.

Local files are supported; however, they must be accessible to all nodes in the cluster using identical [Import file URLs](#import-file-urls).

To import a local file, you have the following options:

- Option 1. Run a [local file server](create-a-file-server.html) to make the file accessible from all nodes.

- Option 2. Make the file accessible from each local node's store:
    1. Create an `extern` directory on each node's store. The pathname will differ depending on the [`--store` flag passed to `cockroach start` (if any)](cockroach-start.html#general), but will look something like `/path/to/cockroach-data/extern/`.
    2. Copy the file to each node's `extern` directory.
    3. Assuming the file is called `data.sql`, you can access it in your `IMPORT` statement using the following [import file URL](#import-file-urls): `'nodelocal:///data.sql'`.

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

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT INTO customers (id, name)
    CSV DATA (
      's3://acme-co/customers.csv?AWS_ACCESS_KEY_ID=[placeholder]&AWS_SECRET_ACCESS_KEY=[placeholder]&AWS_SESSION_TOKEN=[placeholder]'
    );
~~~

Azure:

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT INTO customers (id, name)
    CSV DATA (
      'azure://acme-co/customer-import-data.csv?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
    );
~~~

Google Cloud:

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT INTO customers (id, name)
    CSV DATA (
      'gs://acme-co/customers.csv'
    );
~~~

### Import into an existing table from multiple CSV files

Amazon S3:

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT INTO customers (id, name)
    CSV DATA (
      'gs://acme-co/customers.csv',
      'gs://acme-co/customers2.csv',
      'gs://acme-co/customers3.csv',
      'gs://acme-co/customers4.csv',
    );
~~~

## Known limitations

- While importing into an existing table, the table is taken offline.
- After importing into an existing table, [constraints](constraints.html) will be un-validated and need to be [re-validated](validate-constraint.html).
- Imported rows must not conflict with existing rows in the table or any unique secondary indexes.
- `IMPORT INTO` works for only a single existing table, and the table must not be [interleaved](interleave-in-parent.html).
- `IMPORT INTO` cannot be used within a [transaction](transactions.html).
- `IMPORT INTO` can sometimes fail with a "context canceled" error, or can restart itself many times without ever finishing. If this is happening, it is likely due to a high amount of disk contention. This can be mitigated by setting the `kv.bulk_io_write.max_rate` [cluster setting](cluster-settings.html) to a value below your max disk write speed. For example, to set it to 10MB/s, execute:
    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SET CLUSTER SETTING kv.bulk_io_write.max_rate = '10MB';
    ~~~
- `IMPORT INTO` cannot be used on a table with a [`DEFAULT`](default-value.html) expression for any of its columns.

## See also

- [Create a File Server](create-a-file-server.html)
- [`IMPORT`](import.html)
- [Migration Overview](migration-overview.html)
