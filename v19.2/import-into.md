---
title: IMPORT INTO
summary: Incrementally import CSV data into an existing CockroachDB table.
toc: true
---

<span class="version-tag">New in v19.2:</span>The `IMPORT INTO` [statement](sql-statements.html) incrementally imports CSV data into an existing CockroachDB table. To create a table, use [`CREATE TABLE`](create-table.html)

{{site.data.alerts.callout_success}}
`IMPORT INTO` only works for existing tables. For information on how to import data into new tables, see [`IMPORT`](import.html).
{{site.data.alerts.end}}

{{site.data.alerts.callout_danger}}
**This is a prototype and should not be used in production due to correctness issues.** See [Known limitations](#known-limitations) below for more information.
{{site.data.alerts.end}}

## Required privileges

Only members of the `admin` role can run `IMPORT`. By default, the `root` user belongs to the `admin` role.

## Synopsis

~~~
> IMPORT INTO table_name (column_name [, ...])
         CSV DATA ('file_location' [, ...])
         [ WITH <option> [= <value>] [, ...] ];
~~~

## Parameters

Parameter | Description
----------|------------
`table_name` | The name of the table you want to incrememntally import into.
`column_name` | The table columns you want to import.<br><br>Note: Currently, columns are ignored.
`file_location` | The [URL](#import-file-urls) of a CSV file containing the table data. This can be a comma-separated list of URLs to CSV files. For an example, see [Import a table from multiple CSV files](#import-a-table-from-multiple-csv-files) below.
`<option> [= <value>]` | Control your import's behavior with [these options](#import-options).

### Import options

You can control the `IMPORT` process's behavior using any of the following key-value pairs as a `<option>  [= <value>]`.

 Key         | Value   | Required? | Example
-------------+---------+-----------+---------
`delimiter`  | The unicode character that delimits columns in your rows.<br><br>**Default: `,`**. | No | To use tab-delimited values: `IMPORT TABLE foo (..) CSV DATA ('file.csv') WITH delimiter = e'\t'`
`comment`    | The unicode character that identifies rows to skip. | No | `IMPORT TABLE foo (..) CSV DATA ('file.csv') WITH comment = '#'`
`nullif`     | The string that should be converted to *NULL*. | No | To use empty columns as *NULL*: `IMPORT TABLE foo (..) CSV DATA ('file.csv') WITH nullif = ''`
`skip`       | The number of rows to be skipped while importing a file.<br><br>**Default: `'0'`**. | No | To import CSV files with column headers: `IMPORT ... CSV DATA ('file.csv') WITH skip = '1'`
`decompress` | The decompression codec to be used: `gzip`, `bzip`, `auto`, or `none`.<br><br>**Default: `'auto'`**, which guesses based on file extension (`.gz`, `.bz`, `.bz2`). `none` disables decompression. | No | `IMPORT ... WITH decompress = 'bzip'`

For examples showing how to use these options, see the [Examples](#examples) section below.

For instructions and working examples showing how to migrate data from other databases and formats, see the [Migration Overview](migration-overview.html). For information on how to import data into new tables, see [`IMPORT`](import.html).

## Requirements

### Prerequisites

Before using `IMPORT INTO`, you should have:

- An existing table to incrementally import into (use [`CREATE TABLE`](create-table.html)).
- The CSV data you want to import, preferably hosted on cloud storage. This location must be equally accessible to all nodes using the same import file location. This is necessary because the `IMPORT INTO` statement is issued once by the client, but is executed concurrently across all nodes of the cluster. For more information, see the [Import file location](#import-file-location) section below.

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

## Performance

All nodes are used during the import job, which means all nodes' CPU and RAM will be partially consumed by the `IMPORT` task in addition to serving normal traffic.

## Viewing and controlling import jobs

After CockroachDB successfully initiates an incremental import, it registers the import as a job, which you can view with [`SHOW JOBS`](show-jobs.html).

After the import has been initiated, you can control it with [`PAUSE JOB`](pause-job.html), [`RESUME JOB`](resume-job.html), and [`CANCEL JOB`](cancel-job.html).

{{site.data.alerts.callout_danger}}
Pausing and then resuming an `IMPORT` job will cause it to restart from the beginning.
{{site.data.alerts.end}}

## Examples

### Import a table from a CSV file

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

### Import a table from multiple CSV files

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
> IMPORT INTO customers (d, name)
    CSV DATA (
      'gs://acme-co/customers.csv',
      'gs://acme-co/customers2.csv',
      'gs://acme-co/customers3.csv',
      'gs://acme-co/customers4.csv',
    );
~~~

### Skip commented lines

The `comment` option determines which Unicode character marks the rows in the data to be skipped.

Amazon S3:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT INTO customers (id, name)
    CSV DATA (
      's3://acme-co/customers.csv?AWS_ACCESS_KEY_ID=[placeholder]&AWS_SECRET_ACCESS_KEY=[placeholder]'
    )
    WITH comment = '#';
~~~

Azure:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT INTO customers (id, name)
    CSV DATA (
      'azure://acme-co/customer-import-data.csv?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
    )
    WITH comment = '#';
~~~

Google Cloud:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT INTO customers (id, name)
    CSV DATA (
      'gs://acme-co/customers.csv'
    )
    WITH comment = '#';
~~~

### Skip first *n* lines

The `skip` option determines the number of header rows to skip when importing a file.

Amazon S3:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT INTO customers (id, name)
    CSV DATA (
      's3://acme-co/customers.csv?AWS_ACCESS_KEY_ID=[placeholder]&AWS_SECRET_ACCESS_KEY=[placeholder]'
    )
    WITH skip = '2';
~~~

Azure:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT INTO customers (id, name)
    CSV DATA (
      'azure://acme-co/customer-import-data.csv?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
    )
    WITH skip = '2';
~~~

Google Cloud:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT INTO customers (id, name)
    CSV DATA (
      'gs://acme-co/customers.csv'
    )
    WITH skip = '2';
~~~

### Use blank characters as `NULL`

The `nullif` option defines which string should be converted to `NULL`.

Amazon S3:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT INTO customers (id, name)
    CSV DATA (
      's3://acme-co/employees.csv?AWS_ACCESS_KEY_ID=[placeholder]&AWS_SECRET_ACCESS_KEY=[placeholder]'
    )
    WITH nullif = '';
~~~

Azure:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT INTO customers (id, name)
    CSV DATA (
      'azure://acme-co/customer-import-data.csv?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
    )
    WITH nullif = '';
~~~

Google Cloud:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT INTO customers (id, name)
    CSV DATA (
      'gs://acme-co/customers.csv'
    )
    WITH nullif = '';
~~~

### Import a compressed CSV file

CockroachDB chooses the decompression codec based on the filename (the common extensions `.gz` or `.bz2` and `.bz`) and uses the codec to decompress the file during import.

Amazon S3:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT INTO customers (id, name)
    CSV DATA (
      's3://acme-co/employees.csv.gz?AWS_ACCESS_KEY_ID=[placeholder]&AWS_SECRET_ACCESS_KEY=[placeholder]'
    );
~~~

Azure:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT INTO customers (id, name)
    CSV DATA (
      'azure://acme-co/customer-import-data.csv.gz?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
    );
~~~

Google Cloud:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (id, name)
    CSV DATA (
      'gs://acme-co/customers.csv.gz'
    );
~~~

Optionally, you can use the `decompress` option to specify the codec to be used for decompressing the file during import:

Amazon S3:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT INTO customers (id, name)
    CSV DATA (
      's3://acme-co/employees.csv.gz?AWS_ACCESS_KEY_ID=[placeholder]&AWS_SECRET_ACCESS_KEY=[placeholder]'
    )
    WITH decompress = 'gzip';
~~~

Azure:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (id, name)
    CSV DATA (
      'azure://acme-co/customer-import-data.csv.gz.latest?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
    )
    WITH decompress = 'gzip';
~~~

Google Cloud:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (id, name)
    CSV DATA (
      'gs://acme-co/customers.csv.gz'
    )
    WITH decompress = 'gzip';
~~~

## Known limitations

- Only CSV data importing into a single table is supported.
- `IMPORT INTO` does not work on indexed tables.
- `IMPORT` can sometimes fail with a "context canceled" error, or can restart itself many times without ever finishing. If this is happening, it is likely due to a high amount of disk contention. This can be mitigated by setting the `kv.bulk_io_write.max_rate` [cluster setting](cluster-settings.html) to a value below your max disk write speed. For example, to set it to 10MB/s, execute:
    {% include copy-clipboard.html %}
    ~~~ sql
    > SET CLUSTER SETTING kv.bulk_io_write.max_rate = '10MB';
    ~~~
- `IMPORT INTO` cannot be used within a [transaction](transactions.html).

## See also

- [Create a File Server](create-a-file-server.html)
- [`IMPORT`](import.html)
- [Migration Overview](migration-overview.html)
