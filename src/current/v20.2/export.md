---
title: EXPORT
summary: Export tabular data from a CockroachDB cluster in CSV format.
toc: true
---

The `EXPORT` [statement](sql-statements.html) exports tabular data or the results of arbitrary `SELECT` statements to CSV files.

Using the [CockroachDB distributed execution engine](architecture/sql-layer.html#distsql), `EXPORT` parallelizes CSV creation across all nodes in the cluster, making it possible to quickly get large sets of data out of CockroachDB in a format that can be ingested by downstream systems. If you do not need distributed exports, you can [export tabular data in CSV format](#non-distributed-export-using-the-sql-client).

{{site.data.alerts.callout_info}}
<span class="version-tag">New in v20.2:</span>
`EXPORT` no longer requires an Enterprise license.
{{site.data.alerts.end}}

## Cancelling export

After the export has been initiated, you can cancel it with [`CANCEL QUERY`](cancel-query.html).

## Synopsis

<div>{% include {{ page.version.version }}/sql/diagrams/export.html %}</div>

{{site.data.alerts.callout_info}}The <code>EXPORT</code> statement cannot be used within a <a href=transactions.html>transaction</a>.{{site.data.alerts.end}}

## Required privileges

Only members of the `admin` role can run `EXPORT`. By default, the `root` user belongs to the `admin` role.

## Parameters

 Parameter | Description
-----------|-------------
 `file_location` | Specify the [URL of the file location](#export-file-url) where you want to store the exported CSV data.<br><br>Note: It is best practice to use a unique destination for each export, to avoid mixing files from different exports in one directory.
 `WITH kv_option` | Control your export's behavior with [these options](#export-options).
 `select_stmt` | Specify the query whose result you want to export to CSV format.
 `table_name` | Specify the name of the table you want to export to CSV format.

### Export file URL

You can specify the base directory where you want to store the exported .csv files. CockroachDB will create the export file(s) in the specified directory with programmatically generated names (e.g., `exportabc123-n1.1.csv`, `exportabc123-n1.2.csv`, `exportabc123-n2.1.csv`, ...). Each export should use a unique destination directory to avoid collision with other exports.

The `EXPORT` command [returns](#success-responses) the list of files to which the data was exported. You may wish to record these for use in subsequent imports.

{{site.data.alerts.callout_info}}
<span class="version-tag">New in v20.2:</span>
A hexadecimal hash code (`abc123...` in the file names above) uniquely identifies each export _run_; files sharing the same hash are part of the same export. If you see multiple hash codes within a single destination directory, then the directory contains multiple exports, which will likely cause confusion (duplication) on import. We recommend that you manually clean up the directory, to ensure that it contains only a single export run.
{{site.data.alerts.end}}

For more information, see the following:

- [Use Cloud Storage for Bulk Operations](use-cloud-storage-for-bulk-operations.html)
- [Use a Local File Server for Bulk Operations](use-a-local-file-server-for-bulk-operations.html)

### Export options

You can control the [`EXPORT`](export.html) process's behavior using any of the following key-value pairs as a `kv_option`.

Key                 | <div style="width:130px">Context</div> | Value                                                                                                                             |
--------------------+-----------------+-----------------------------------------------------------------------------------------------------------------------------------------------------------
`delimiter`         |    `CSV DATA`   |  The ASCII character that delimits columns in your rows. If not using comma as your column delimiter, you can specify another ASCII character as the delimiter. **Default:** `,`. <br><br>To use tab-delimited values: `WITH delimiter = e'\t'`
`nullas`            |    `CSV DATA`, `DELIMITED DATA`          |  The string that should be used to represent _NULL_ values. To avoid collisions, it is important to pick `nullas` values that do not appear in the exported data. <br><br>To use empty columns as _NULL_: `WITH nullas = ''`
`compression`       |    `CSV DATA`   |  This instructs export to write `gzip` compressed CSV files to the specified destination. <br><br>See the [example](#export-gzip-compressed-csv-files) below.
`chunk_rows`        |    `CSV DATA`   |  The number of rows to be converted to CSV and written to a single CSV file. **Default:** `100000`. <br><br>For example, `WITH chunk_rows = '5000'` for a table with 10,000 rows would produce two CSV files.

## Success responses

Successful `EXPORT` returns a table of (perhaps multiple) files to which the data was exported:

| Response | Description |
|-----------|-------------|
`filename` | The file to which the data was exported.
`rows` | The number of rows exported to this file.
`bytes` | The file size in bytes.

## Examples

The following provide connection examples to cloud storage providers. For more information on connecting to different storage options, read [Use Cloud Storage for Bulk Operations](use-cloud-storage-for-bulk-operations.html).

<div class="filters clearfix">
  <button class="filter-button" data-scope="s3">Amazon S3</button>
  <button class="filter-button" data-scope="azure">Azure Storage</button>
  <button class="filter-button" data-scope="gcs">Google Cloud Storage</button>
</div>

<section class="filter-content" markdown="1" data-scope="s3">

{% include {{ page.version.version }}/backups/aws-auth-note.md %}

Each of these examples use the `bank` database and the `customers` table; `customer-export-data` is the demonstration path to which we're exporting our customers' data in this example.

### Export a table

{% include_cached copy-clipboard.html %}
~~~ sql
> EXPORT INTO CSV
  's3://{BUCKET NAME}/{customer-export-data}?AWS_ACCESS_KEY_ID={ACCESS KEY}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}'
  WITH delimiter = '|' FROM TABLE bank.customers;
~~~

### Export using a `SELECT` statement

{% include_cached copy-clipboard.html %}
~~~ sql
> EXPORT INTO CSV
  's3://{BUCKET NAME}/{customer-export-data}?AWS_ACCESS_KEY_ID={ACCESS KEY}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}'
  FROM SELECT * FROM bank.customers WHERE id >= 100;
~~~

For more information, see [selection queries](selection-queries.html).

### Non-distributed export using the SQL client

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql -e "SELECT * from bank.customers WHERE id>=100;" --format=csv > my.csv
~~~

For more information, about the SQL client, see [`cockroach sql`](cockroach-sql.html).

### Export gzip compressed CSV files

{% include_cached copy-clipboard.html %}
~~~ sql
> EXPORT INTO CSV
  's3://{BUCKET NAME}/{customer-export-data}?AWS_ACCESS_KEY_ID={ACCESS KEY}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}'
  WITH compression = 'gzip' FROM TABLE bank.customers;
~~~

~~~
filename                                           | rows | bytes
---------------------------------------------------+------+--------
export16808a04292505c80000000000000001-n1.0.csv.gz |   17 |   824
(1 row)
~~~

</section>

<section class="filter-content" markdown="1" data-scope="azure">

Each of these examples use the `bank` database and the `customers` table; `customer-export-data` is the demonstration path to which we're exporting our customers' data in this example.

### Export a table

{% include_cached copy-clipboard.html %}
~~~ sql
> EXPORT INTO CSV
  'azure://{CONTAINER NAME}/{customer-export-data}?AZURE_ACCOUNT_NAME={ACCOUNT NAME}&AZURE_ACCOUNT_KEY={ENCODED KEY}'
  WITH delimiter = '|' FROM TABLE bank.customers;
~~~

### Export using a `SELECT` statement

{% include_cached copy-clipboard.html %}
~~~ sql
> EXPORT INTO CSV
  'azure://{CONTAINER NAME}/{customer-export-data}?AZURE_ACCOUNT_NAME={ACCOUNT NAME}&AZURE_ACCOUNT_KEY={ENCODED KEY}'
  FROM SELECT * FROM bank.customers WHERE id >= 100;
~~~

For more information, see [selection queries](selection-queries.html).

### Non-distributed export using the SQL client

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql -e "SELECT * from bank.customers WHERE id>=100;" --format=csv > my.csv
~~~

For more information, about the SQL client, see [`cockroach sql`](cockroach-sql.html).

### Export gzip compressed CSV files

{% include_cached copy-clipboard.html %}
~~~ sql
> EXPORT INTO CSV
  'azure://{CONTAINER NAME}/{customer-export-data}?AZURE_ACCOUNT_NAME={ACCOUNT NAME}&AZURE_ACCOUNT_KEY={ENCODED KEY}'
  WITH compression = 'gzip' FROM TABLE bank.customers;
~~~

~~~
filename                                           | rows | bytes
---------------------------------------------------+------+--------
export16808a04292505c80000000000000001-n1.0.csv.gz |   17 |   824
(1 row)
~~~

</section>

<section class="filter-content" markdown="1" data-scope="gcs">

{% include {{ page.version.version }}/backups/gcs-auth-note.md %}

Each of these examples use the `bank` database and the `customers` table; `customer-export-data` is the demonstration path to which we're exporting our customers' data in this example.

### Export a table

{% include_cached copy-clipboard.html %}
~~~ sql
> EXPORT INTO CSV
  'gs://{BUCKET NAME}/{customer-export-data}?AUTH=specified&CREDENTIALS={ENCODED KEY}'
  WITH delimiter = '|' FROM TABLE bank.customers;
~~~

### Export using a `SELECT` statement

{% include_cached copy-clipboard.html %}
~~~ sql
> EXPORT INTO CSV
  'gs://{BUCKET NAME}/{customer-export-data}?AUTH=specified&CREDENTIALS={ENCODED KEY}'
  FROM SELECT * FROM bank.customers WHERE id >= 100;
~~~

For more information, see [selection queries](selection-queries.html).

### Non-distributed export using the SQL client

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql -e "SELECT * from bank.customers WHERE id>=100;" --format=csv > my.csv
~~~

For more information, about the SQL client, see [`cockroach sql`](cockroach-sql.html).

### Export gzip compressed CSV files

{% include_cached copy-clipboard.html %}
~~~ sql
> EXPORT INTO CSV
  'gs://{BUCKET NAME}/{customer-export-data}?AUTH=specified&CREDENTIALS={ENCODED KEY}'
  WITH compression = 'gzip' FROM TABLE bank.customers;
~~~

~~~
filename                                           | rows | bytes
---------------------------------------------------+------+--------
export16808a04292505c80000000000000001-n1.0.csv.gz |   17 |   824
(1 row)
~~~

</section>

### View a running export

View running exports by using [`SHOW QUERIES`](show-queries.html):

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW QUERIES;
~~~

### Cancel a running export

Use [`SHOW QUERIES`](show-queries.html) to get a running export's `query_id`, which can be used to [cancel the export](cancel-query.html):

{% include_cached copy-clipboard.html %}
~~~ sql
> CANCEL QUERY '14dacc1f9a781e3d0000000000000001';
~~~

## Known limitation

`EXPORT` may fail with an error if the SQL statements are incompatible with DistSQL. In that case, [export tabular data in CSV format](#non-distributed-export-using-the-sql-client).

## See also

- [Use a Local File Server for Bulk Operations](use-a-local-file-server-for-bulk-operations.html)
