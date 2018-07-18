---
title: IMPORT
summary: Import CSV data into your CockroachDB cluster.
toc: true
---

The `IMPORT` [statement](sql-statements.html) imports tabular data (e.g., CSVs) into a single table.

{{site.data.alerts.callout_info}}For details about importing SQL dumps, see <a href="import-data.html">Import Data</a>.{{site.data.alerts.end}}


## Requirements

Before using [`IMPORT`](import.html), you should have:

- The schema of the table you want to import.
- The tabular data you want to import (e.g., CSV), preferably hosted on cloud storage. This location *must* be accessible to all nodes using the same address. This means that you cannot use a node's local file storage.

    For ease of use, we recommend using cloud storage. However, if that isn't readily available to you, we also have a [guide on easily creating your own file server](create-a-file-server.html).

## Details

### Import targets

Imported tables must not exist and must be created in the [`IMPORT`](import.html) statement. If the table you want to import already exists, you must drop it with [`DROP TABLE`](drop-table.html).

You can only import a single table at a time.

You can specify the target database in the table name in the [`IMPORT`](import.html) statement. If it's not specified there, the active database in the SQL session is used.

### Create table

Your [`IMPORT`](import.html) statement must include a `CREATE TABLE` statement (representing the schema of the data you want to import) using one of the following methods:

- A reference to a file that contains a `CREATE TABLE` statement
- An inline `CREATE TABLE` statement

We also recommend [all secondary indexes you want to use in the `CREATE TABLE` statement](create-table.html#create-a-table-with-secondary-and-inverted-indexes). It is possible to add secondary indexes later, but it is significantly faster to specify them during import.

### CSV data

The tabular data to import must be valid [CSV files](https://tools.ietf.org/html/rfc4180), with the caveat that the comma [delimiter](#delimiter) can be set to another single character. In particular:

- Files must be UTF-8 encoded.
- If the delimiter (`,` by default), a double quote (`"`), newline (`\n`), or carriage return (`\r`) appears in a field, the field must be enclosed by double quotes.
- If double quotes are used to enclose fields, then a double quote appearing inside a field must be escaped by preceding it with another double quote.  For example:
  `"aaa","b""bb","ccc"`

CockroachDB-specific requirements:

- If a column is of type [`BYTES`](bytes.html), it can either be a valid UTF-8 string or a [hex-encoded byte literal](sql-constants.html#hexadecimal-encoded-byte-array-literals) beginning with `\x`. For example, a field whose value should be the bytes `1`, `2` would be written as `\x0102`.

### Object dependencies

When importing tables, you must be mindful of the following rules because [`IMPORT`](import.html) only creates single tables which must not already exist:

- Objects that the imported table depends on must already exist
- Objects that depend on the imported table can only be created after the import completes

### Available storage requirements

Each node in the cluster is assigned an equal part of the converted CSV data, and so must have enough temp space to store it. In addition, data is persisted as a normal table, and so there must also be enough space to hold the final, replicated data. The node's first-listed/default [`store`](start-a-node.html#store) directory must have enough available storage to hold its portion of the data.

On [`cockroach start`](start-a-node.html), if you set `--max-disk-temp-storage`, it must also be greater than the portion of the data a node will store in temp space.

### Import file location

You can store the tabular data you want to import using remote cloud storage (Amazon S3, Google Cloud Platform, etc.). Alternatively, you can use an [HTTP server](create-a-file-server.html) accessible from all nodes.

For simplicity's sake, it's **strongly recommended** to use cloud/remote storage for the data you want to import. Local files are supported; however, they must be accessible identically from all nodes in the cluster.

### Table users and privileges

Imported tables are treated as new tables, so you must [`GRANT`](grant.html) privileges to them.

## Performance

All nodes are used during tabular data conversion into key-value data, which means all nodes' CPU and RAM will be partially consumed by the [`IMPORT`](import.html) task in addition to serving normal traffic.

## Viewing and controlling import jobs

After CockroachDB successfully initiates an import, it registers the import as a job, which you can view with [`SHOW JOBS`](show-jobs.html).

After the import has been initiated, you can control it with [`PAUSE JOB`](pause-job.html), [`RESUME JOB`](resume-job.html), and [`CANCEL JOB`](cancel-job.html).

{{site.data.alerts.callout_danger}}Pausing and then resuming an <code>`IMPORT`</code> job will cause it to restart from the beginning.{{site.data.alerts.end}}

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/import.html %}
</div>

{{site.data.alerts.callout_info}}The <code>IMPORT</code> statement cannot be used within a <a href=transactions.html>transaction</a>.{{site.data.alerts.end}}

## Required privileges

Only the `root` user can run [`IMPORT`](import.html).

## Parameters

 Parameter | Description
-----------|-------------
 `table_name` | The name of the table you want to import/create.
 `create_table_file` | The URL of a plain text file containing the [`CREATE TABLE`](create-table.html) statement you want to use (see [this example for syntax](#use-create-table-statement-from-a-file)).
 `table_elem_list` | The table definition you want to use (see [this example for syntax](#use-create-table-statement-from-a-statement)).
 `file_to_import` | The URL of the file you want to import.
 `WITH kv_option` | Control your import's behavior with [these options](#import-options).

### Import file URLs

URLs for the files you want to import must use the following format:

{% include {{ page.version.version }}/misc/external-urls.md %}

### Import options

You can control the [`IMPORT`](import.html) process's behavior using any of the following key-value pairs as a `kv_option`.

#### `delimiter`

If not using comma as your column delimiter, you can specify another Unicode character as the delimiter.

<table>
	<tbody>
		<tr>
			<td><strong>Required?</strong></td>
			<td>No</td>
		</tr>
		<tr>
			<td><strong>Key</strong></td>
			<td><code>delimiter</code></td>
		</tr>
		<tr>
			<td><strong>Value</strong></td>
			<td>The unicode character that delimits columns in your rows</td>
		</tr>
		<tr>
			<td><strong>Example</strong></td>
			<td>To use tab-delimited values: <code>WITH delimiter = e'\t'</code></td>
		</tr>
	</tbody>
</table>

#### `comment`

Do not import rows that begin with this character.

<table>
	<tbody>
		<tr>
			<td><strong>Required?</strong></td>
			<td>No</td>
		</tr>
		<tr>
			<td><strong>Key</strong></td>
			<td><code>comment</code></td>
		</tr>
		<tr>
			<td><strong>Value</strong></td>
			<td>The unicode character that identifies rows to skip</td>
		</tr>
		<tr>
			<td><strong>Example</strong></td>
			<td><code>WITH comment = '#'</code></td>
		</tr>
	</tbody>
</table>

#### `nullif`

Convert values to SQL *NULL* if they match the specified string.

<table>
	<tbody>
		<tr>
			<td><strong>Required?</strong></td>
			<td>No</td>
		</tr>
		<tr>
			<td><strong>Key</strong></td>
			<td><code>nullif</code></td>
		</tr>
		<tr>
			<td><strong>Value</strong></td>
			<td>The string that should be converted to <em>NULL</em></td>
		</tr>
		<tr>
			<td><strong>Example</strong></td>
			<td>To use empty columns as <em>NULL</em>: <code>WITH nullif = ''</code></td>
		</tr>
	</tbody>
</table>

#### `skip`

Skip the first *n* lines of a CSV file.

<table>
	<tbody>
		<tr>
			<td><strong>Required?</strong></td>
			<td>No</td>
		</tr>
		<tr>
			<td><strong>Key</strong></td>
			<td><code>skip</code></td>
		</tr>
		<tr>
			<td><strong>Value</strong></td>
			<td>The number of rows to be skipped while importing a file</td>
		</tr>
		<tr>
			<td><strong>Example</strong></td>
			<td>To import CSV files with column headers: <code>WITH skip = '1'</code></td>
		</tr>
	</tbody>
</table>

#### `decompress`

Import compressed files.

<table>
	<tbody>
		<tr>
			<td><strong>Required?</strong></td>
			<td>No</td>
		</tr>
		<tr>
			<td><strong>Key</strong></td>
			<td><code>decompress</code></td>
		</tr>
		<tr>
			<td><strong>Value</strong></td>
			<td>The decompression codec to be used: <code>gzip</code>, <code>bzip</code>, <code>auto</code>, or <code>none</code>. <br><br>The default option is <code>auto</code> which guesses the codec based on the filename, matching the common extensions `.gz` or `.bz2` and `.bz` <br><br> <code>none</code> can be used to disable any attempts at decompression.</td>
		</tr>
		<tr>
			<td><strong>Example</strong></td>
			<td>To import a file compressed using the <code>bzip</code> codec: <code>WITH decompress = 'bzip'</code></td>
		</tr>
	</tbody>
</table>



## Examples

### Use `CREATE TABLE` statement from a file

{% include copy-clipboard.html %}
~~~ sql
> IMPORT
TABLE
  customers
CREATE USING
  'azure://acme-co/customer-create-table.sql?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
CSV
  DATA (
    'azure://acme-co/customer-import-data.csv?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
  );
~~~

### Use `CREATE TABLE` statement from a statement

{% include copy-clipboard.html %}
~~~ sql
> IMPORT
TABLE
  customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name STRING,
    INDEX name_idx (name)
  )
CSV
  DATA (
    'azure://acme-co/customer-import-data.csv?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
  );
~~~

### Import a tab-separated file

{% include copy-clipboard.html %}
~~~ sql
> IMPORT
TABLE
  customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name STRING,
    INDEX name_idx (name)
  )
CSV
  DATA (
    'azure://acme-co/customer-import-data.tsv?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
  )
WITH
  delimiter = e'\t';
~~~

### Skip commented lines

{% include copy-clipboard.html %}
~~~ sql
> IMPORT
TABLE
  customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name STRING,
    INDEX name_idx (name)
  )
CSV
  DATA (
    'azure://acme-co/customer-import-data.csv?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
  )
WITH
  comment = '#';
~~~

### Skip first *n* lines

{% include copy-clipboard.html %}
~~~ sql
> IMPORT
TABLE
  customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name STRING,
    INDEX name_idx (name)
  )
CSV
  DATA (
    'azure://acme-co/customer-import-data.csv?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
  )
WITH
  skip = '2';
~~~

### Use blank characters as `NULL`

{% include copy-clipboard.html %}
~~~ sql
> IMPORT
TABLE
  customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name STRING,
    INDEX name_idx (name)
  )
CSV
  DATA (
    'azure://acme-co/customer-import-data.csv?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
  )
WITH
  "nullif" = '';
~~~

### Import a compressed CSV file

CockroachDB chooses the decompression codec based on the filename (the common extensions `.gz` or `.bz2` and `.bz`) and uses the codec to decompress the file during import.

{% include copy-clipboard.html %}
~~~ sql
> IMPORT
TABLE
  customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name STRING,
    INDEX name_idx (name)
  )
CSV
  DATA (
    'azure://acme-co/customer-import-data.csv.gz?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
  );
~~~

Optionally, you can use the `decompress` option to specify the codec to be used for decompressing the file during import:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT
TABLE
  customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name STRING,
    INDEX name_idx (name)
  )
CSV
  DATA (
    'azure://acme-co/customer-import-data.csv.gz.latest?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
  )
WITH
  decompress = 'gzip';
~~~

## Known limitation

`IMPORT` can sometimes fail with a "context canceled" error, or can restart itself many times without ever finishing. If this is happening, it is likely due to a high amount of disk contention. This can be mitigated by setting the `kv.bulk_io_write.max_rate` [cluster setting](cluster-settings.html) to a value below your max disk write speed. For example, to set it to 10MB/s, execute:

{% include copy-clipboard.html %}
~~~ sql?nofmt
> SET CLUSTER SETTING kv.bulk_io_write.max_rate = '10MB';
~~~

## See also

- [Create a File Server](create-a-file-server.html)
- [Importing Data](import-data.html)
