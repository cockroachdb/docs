---
title: EXPORT
summary: Export tabular data from a CockroachDB cluster in CSV format.
toc: true
docs_area: reference.sql
---

{{site.data.alerts.callout_info}}
**Cockroach Labs recommends using [changefeeds to export data]({% link {{ page.version.version }}/export-data-with-changefeeds.md %})** because they provide better performance for growing workloads. Additionally, changefeeds operate as jobs, which offer [observability]({% link {{ page.version.version }}/monitor-and-debug-changefeeds.md %}), [scheduling]({% link {{ page.version.version }}/export-data-with-changefeeds.md %}#create-a-scheduled-changefeed-to-export-filtered-data), and [job management]({% link {{ page.version.version }}/create-and-configure-changefeeds.md %}).
{{site.data.alerts.end}}

The `EXPORT` [statement]({% link {{ page.version.version }}/sql-statements.md %}) exports tabular data or the results of arbitrary `SELECT` statements to the following:

- CSV files
- Parquet files

Using the [CockroachDB distributed execution engine]({% link {{ page.version.version }}/architecture/sql-layer.md %}#distsql), `EXPORT` parallelizes file creation across all nodes in the cluster, making it possible to quickly get large sets of data out of CockroachDB in a format that can be ingested by downstream systems.

If you do not need distributed exports, you can [export tabular data in CSV format](#non-distributed-export-using-the-sql-client).

## Cancelling export

After the export has been initiated, you can cancel it with [`CANCEL QUERY`]({% link {{ page.version.version }}/cancel-query.md %}).

For detail on handling partially complete exports at the destination, refer to [Export File URL](#export-file-url).

## Synopsis

<div>{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/export.html %}</div>

{{site.data.alerts.callout_info}}
The `EXPORT` statement cannot be used within a [transaction]({% link {{ page.version.version }}/transactions.md %}).
{{site.data.alerts.end}}

## Required privileges

 The user must have the `SELECT` [privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#managing-privileges) on the table being exported, unless the [destination URI requires `admin` privileges]({% link {{ page.version.version }}/import-into.md %}#source-privileges).

### Destination privileges

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

## Parameters

Parameter | Description
-----------|-------------
`file_location` | Specify the [URL of the file location](#export-file-url) where you want to store the exported data.<br><br>Note: It is best practice to use a unique destination for each export, to avoid mixing files from different exports in one directory.
`opt_with_options` | Control your export's behavior with [these options](#export-options).
`select_stmt` | Specify the query whose result you want to export.
`table_name` | Specify the name of the table you want to export.

### Export file URL

You can specify the base directory where you want to store the exported files. CockroachDB will create the export file(s) in the specified directory with programmatically generated names (e.g., `exportabc123-n1.1.csv`, `exportabc123-n1.2.csv`, `exportabc123-n2.1.csv`, ...). Each export should use a unique destination directory to avoid collision with other exports.

The `EXPORT` command [returns](#success-responses) the list of files to which the data was exported. You may wish to record these for use in subsequent imports.

If an export encounters some kind of failure or [cancellation](#cancel-a-running-export), it will leave any written files behind in the destination. To run a new export and avoid collision with previously written export files, consider doing the following:

- Change the destination (or destination prefix) that you are exporting to.
- Remove the partial results at the destination from any previously attempted exports.
- Use a [changefeed export]({% link {{ page.version.version }}/export-data-with-changefeeds.md %}) instead because it operates as a job, offering more observability into failures.

{{site.data.alerts.callout_info}}
A hexadecimal hash code (`abc123...` in the file names) uniquely identifies each export **run**; files sharing the same hash are part of the same export. If you see multiple hash codes within a single destination directory, then the directory contains multiple exports, which will likely cause confusion (duplication) on import. We recommend that you manually clean up the directory, to ensure that it contains only a single export run.
{{site.data.alerts.end}}

For more information, see the following:

- [Use Cloud Storage]({% link {{ page.version.version }}/use-cloud-storage.md %})
- [Use a Local File Server]({% link {{ page.version.version }}/use-a-local-file-server.md %})

{% include {{ page.version.version }}/misc/external-connection-note.md %}

### Export options

You can control the [`EXPORT`]({% link {{ page.version.version }}/export.md %}) process's behavior using any of the following key-value pairs as a `kv_option`.

Key                 | <div style="width:130px">Context</div> | Value                                                                                                                             |
--------------------+-----------------+-----------------------------------------------------------------------------------------------------------------------------------------------------------
`delimiter`         |    `CSV DATA`  |  The ASCII character that delimits columns in your rows. If not using comma as your column delimiter, you can specify another ASCII character as the delimiter. **Default:** `,`. <br><br>To use tab-delimited values: `WITH delimiter = e'\t'` <br><br>See the [example](#export-a-table-into-csv).
`nullas`            |    `CSV DATA`, `DELIMITED DATA` |  The string that should be used to represent `NULL` values. To avoid collisions, it is important to pick `nullas` values that do not appear in the exported data. <br><br>To use empty columns as `NULL`: `WITH nullas = ''` <br><br>See the [example](#export-a-table-into-csv).
`compression`       |    `CSV DATA`, `PARQUET DATA`   |  This instructs export to write compressed files to the specified destination.<br><br>For `CSV DATA`, `gzip` compression is supported. For `PARQUET DATA`, both `gzip` and `snappy` compression is supported. <br><br>See the [example](#export-compressed-files).
`chunk_rows`        |    `CSV DATA`, `PARQUET DATA`   |  The number of rows to be converted  and written to a single file. **Default:** `100000`. <br>For example, `WITH chunk_rows = '5000'` for a table with 10,000 rows would produce two files. <br><br>**Note**:`EXPORT` will stop and upload the file whether the configured limit for `chunk_rows` or `chunk_size` is reached first.
`chunk_size`        |    `CSV DATA`, `PARQUET DATA`   | A target size per file that you can specify during an `EXPORT`. Once the target size is reached, the file is uploaded before processing further rows. **Default:** `32MB`. <br>For example, to set the size of each file uploaded during the export to 10MB: `WITH chunk_size = '10MB'`. <br><br>**Note**:`EXPORT` will stop and upload the file whether the configured limit for `chunk_rows` or `chunk_size` is reached first.

## Success responses

Successful `EXPORT` returns a table of (perhaps multiple) files to which the data was exported:

| Response | Description |
|-----------|-------------|
`filename` | The file to which the data was exported.
`rows` | The number of rows exported to this file.
`bytes` | The file size in bytes.

## Parquet types

CockroachDB types map to [Parquet types](https://github.com/apache/parquet-format/blob/master/LogicalTypes.md) listed in the following table. All columns witten to Parquet files will be nullable, therefore the Parquet repetition level is `optional`.

| CockroachDB Type    | Parquet Type | Parquet Logical Type |
--------------------|--------------|----------------------
| [`BOOL`]({% link {{ page.version.version }}/bool.md %}) | `BOOLEAN` | `nil` |
| [`STRING`]({% link {{ page.version.version }}/string.md %}) | byte array | `STRING` |
| [`COLLATE`]({% link {{ page.version.version }}/collate.md %}) | byte array | `STRING` |
| [`INET`]({% link {{ page.version.version }}/inet.md %}) | byte array | `STRING` |
| [`JSONB`]({% link {{ page.version.version }}/jsonb.md %}) | byte array | `JSON` |
| [`INT`]({% link {{ page.version.version }}/int.md %}) [`INT8`]({% link {{ page.version.version }}/int.md %}) | `INT64` | `nil` |
| [`INT2`]({% link {{ page.version.version }}/int.md %}) [`INT4`]({% link {{ page.version.version }}/int.md %}) | `INT32` | `nil` |
| [`FLOAT`]({% link {{ page.version.version }}/float.md %}) [`FLOAT8`]({% link {{ page.version.version }}/float.md %}) | `FLOAT64` | `nil` |
| [`FLOAT4`]({% link {{ page.version.version }}/float.md %}) | `FLOAT32` | `nil` |
| [`DECIMAL`]({% link {{ page.version.version }}/decimal.md %}) | byte array | `DECIMAL` <br>Note: scale and precision data are preserved in the Parquet file. |
| [`UUID`]({% link {{ page.version.version }}/uuid.md %}) | `fixed_len_byte_array` | `nil` |
| [`BYTES`]({% link {{ page.version.version }}/bytes.md %}) | byte array | `nil` |
| [`BIT`]({% link {{ page.version.version }}/bit.md %}) | byte array | `nil` |
| [`ENUM`]({% link {{ page.version.version }}/enum.md %}) | byte array | `ENUM` |
| [`Box2D`]({% link {{ page.version.version }}/data-types.md %}#data-type-conversions-and-casts) | byte array | `STRING` |
| [`GEOGRAPHY`]({% link {{ page.version.version }}/data-types.md %}#data-type-conversions-and-casts) | byte array | `nil` |
| [`GEOMETRY`]({% link {{ page.version.version }}/data-types.md %}#data-type-conversions-and-casts) | byte array | `nil` |
| [`DATE`]({% link {{ page.version.version }}/date.md %}) | byte array | `STRING` |
| [`TIME`]({% link {{ page.version.version }}/time.md %}) | `INT64` | `TIME` <br>Note: microseconds after midnight; <br>exporting to microsecond precision. |
| [`TIMETZ`]({% link {{ page.version.version }}/time.md %}) | byte array | `STRING` <br>Note: exporting to microsecond precision. |
| [`INTERVAL`]({% link {{ page.version.version }}/interval.md %}) | byte array | `STRING` <br>Note: specifically represented as ISO8601. |
| [`TIMESTAMP`]({% link {{ page.version.version }}/timestamp.md %}) | byte array | `STRING` <br>Note: exporting to microsecond precision. |
| [`TIMESTAMPTZ`]({% link {{ page.version.version }}/timestamp.md %}) | byte array | `STRING` <br>Note: exporting to microsecond precision. |
| [`ARRAY`]({% link {{ page.version.version }}/array.md %}) | Encoded as a repeated field; <br>each array value is encoded as per the preceding types. | `nil` |

## Exports and `AS OF SYSTEM TIME`

The [`AS OF SYSTEM TIME`]({% link {{ page.version.version }}/as-of-system-time.md %}) clause is not required in `EXPORT` statements, even though they are long-running queries. If it is omitted, `AS OF SYSTEM TIME` is implicitly set to the start of the statement's execution. The risk of [contention]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#transaction-contention) is low because other transactions would need to have exactly the same transaction start time as the `EXPORT` statement's start time.

## Examples

{% include {{ page.version.version }}/import-export-auth.md %}

Each of these examples use the `bank` database and the `customers` table; `customer-export-data` is the demonstration path to which we're exporting our customers' data in this example.

### Export a table into CSV

This example uses the `delimiter` option to define the ASCII character that delimits columns in your rows:

{% include_cached copy-clipboard.html %}
~~~ sql
> EXPORT INTO CSV
  's3://{BUCKET NAME}/{customer-export-data}?AWS_ACCESS_KEY_ID={ACCESS KEY}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}'
  WITH delimiter = '|' FROM TABLE bank.customers;
~~~

This examples uses the `nullas` option to define the string that represents `NULL` values:

{% include_cached copy-clipboard.html %}
~~~ sql
> EXPORT INTO CSV
  's3://{BUCKET NAME}/{customer-export-data}?AWS_ACCESS_KEY_ID={ACCESS KEY}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}'
  WITH nullas = '' FROM TABLE bank.customers;
~~~

### Export a table into Parquet

~~~ sql
> EXPORT INTO PARQUET
  's3://{BUCKET NAME}/{customer-export-data}?AWS_ACCESS_KEY_ID={ACCESS KEY}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}'
  FROM TABLE bank.customers;
~~~

### Export using a `SELECT` statement

{% include_cached copy-clipboard.html %}
~~~ sql
> EXPORT INTO CSV
  's3://{BUCKET NAME}/{customer-export-data}?AWS_ACCESS_KEY_ID={ACCESS KEY}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}'
  FROM SELECT * FROM bank.customers WHERE id >= 100;
~~~

For more information, see [selection queries]({% link {{ page.version.version }}/selection-queries.md %}).

### Non-distributed export using the SQL client

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql -e "SELECT * from bank.customers WHERE id>=100;" --format=csv > my.csv
~~~

For more information about the SQL client, see [`cockroach sql`]({% link {{ page.version.version }}/cockroach-sql.md %}).

### Export compressed files

`gzip` compression is supported for both `PARQUET` and `CSV` file formats:

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

`PARQUET` data also supports `snappy` compression:

{% include_cached copy-clipboard.html %}
~~~ sql
> EXPORT INTO PARQUET
  's3://{BUCKET NAME}/{customer-export-data}?AWS_ACCESS_KEY_ID={ACCESS KEY}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}'
  WITH compression = 'snappy' FROM TABLE bank.customers;
~~~

~~~
filename                                                   | rows | bytes
-----------------------------------------------------------+------+--------
export16808a04292505c80000000000000001-n1.0.parquet.snappy |   17 |   824
(1 row)
~~~

### Export tabular data with an S3 storage class

To associate your export objects with a [specific storage class]({% link {{ page.version.version }}/use-cloud-storage.md %}#amazon-s3-storage-classes) in your Amazon S3 bucket, use the `S3_STORAGE_CLASS` parameter with the class. For example, the following S3 connection URI specifies the `INTELLIGENT_TIERING` storage class:

{% include_cached copy-clipboard.html %}
~~~ sql
> EXPORT INTO CSV
  's3://{BUCKET NAME}/{customer-export-data}?AWS_ACCESS_KEY_ID={ACCESS KEY}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}&S3_STORAGE_CLASS=INTELLIGENT_TIERING'
  WITH delimiter = '|' FROM TABLE bank.customers;
~~~

{% include {{ page.version.version }}/misc/storage-classes.md %}


### Export data out of CockroachDB {{ site.data.products.cloud }}

Using `EXPORT` with [`userfile`]({% link {{ page.version.version }}/use-userfile-storage.md %}) is not recommended. You can either export data to [cloud storage]({% link {{ page.version.version }}/use-cloud-storage.md %}) or to a local CSV file by using [`cockroach sql --execute`]({% link {{ page.version.version }}/cockroach-sql.md %}#general):

<div class="filters clearfix">
  <button class="filter-button" data-scope="local">local CSV</button>
  <button class="filter-button" data-scope="cloud">Cloud storage</button>
</div>

<section class="filter-content" markdown="1" data-scope="local">

The following example exports the `customers` table from the `bank` database into a local CSV file:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--url 'postgres://{username}:{password}@{host}:26257?sslmode=verify-full&sslrootcert={path/to/certs_dir}/cc-ca.crt' \
--execute "SELECT * FROM bank.customers" --format=csv > /Users/{username}/{path/to/file}/customers.csv
~~~

</section>

<section class="filter-content" markdown="1" data-scope="cloud">

The following example exports the `customers` table from the `bank` database into a cloud storage bucket in CSV format:

~~~sql
EXPORT INTO CSV
  's3://{BUCKET NAME}/{customer-export-data}?AWS_ACCESS_KEY_ID={ACCESS KEY}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}'
  WITH delimiter = '|' FROM TABLE bank.customers;
~~~

</section>

### View a running export

View running exports by using [`SHOW STATEMENTS`]({% link {{ page.version.version }}/show-statements.md %}):

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW STATEMENTS;
~~~

### Cancel a running export

Use [`SHOW STATEMENTS`]({% link {{ page.version.version }}/show-statements.md %}) to get a running export's `query_id`, which can be used to [cancel the export]({% link {{ page.version.version }}/cancel-query.md %}):

{% include_cached copy-clipboard.html %}
~~~ sql
> CANCEL QUERY '14dacc1f9a781e3d0000000000000001';
~~~

For detail on handling partially complete exports at the destination, refer to [Export File URL](#export-file-url).

## Known limitation

`EXPORT` may fail with an error if the SQL statements are incompatible with DistSQL. In that case, [export tabular data in CSV format](#non-distributed-export-using-the-sql-client).

## See also

- [`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %})
- [Use a Local File Server]({% link {{ page.version.version }}/use-a-local-file-server.md %})
- [Use Cloud Storage]({% link {{ page.version.version }}/use-cloud-storage.md %})
