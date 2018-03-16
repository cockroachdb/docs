---
title: IMPORT
summary: Import CSV data into your CockroachDB cluster.
toc: false
---

The `IMPORT` [statement](sql-statements.html) imports tabular data (e.g. CSVs) into a single table.

{{site.data.alerts.callout_info}}For details about importing SQL dumps, see <a href="import-data.html">Import Data</a>.{{site.data.alerts.end}}

<div id="toc"></div>

## Requirements

Before using [`IMPORT`](import.html), you should have:

- The schema of the table you want to import.
- The tabular data you want to import (e.g., CSV), preferably hosted on cloud storage. This location *must* be accessible to all nodes using the same address. This means that you cannot use a node's local file storage.

    For ease of use, we recommend using cloud storage. However, if that isn't readily available to you, we also have a [guide on easily creating your own file server](create-a-file-server.html).

## Details

### Import Targets

Imported tables must not exist and must be created in the [`IMPORT`](import.html) statement. If the table you want to import already exists, you must drop it with [`DROP TABLE`](drop-table.html).

You can only import a single table at a time.

You can specify the target database in the table name in the [`IMPORT`](import.html) statement. If it's not specified there, the active database in the SQL session is used.

### Create Table

Your [`IMPORT`](import.html) statement must include a `CREATE TABLE` statement (representing the schema of the data you want to import) using one of the following methods:

- A reference to a file that contains a `CREATE TABLE` statement
- An inline `CREATE TABLE` statement

We also recommend [all secondary indexes you want to use in the `CREATE TABLE` statement](create-table.html#create-a-table-with-secondary-and-inverted-indexes-new-in-v2-0). It is possible to add secondary indexes later, but it is significantly faster to specify them during import.

### Object Dependencies

When importing tables, you must be mindful of the following rules because [`IMPORT`](import.html) only creates single tables which must not already exist:

- Objects that the imported table depends on must already exist
- Objects that depend on the imported table can only be created after the import completes

### Available Storage Requirements

Each node in the cluster is assigned an equal part of the converted CSV data, and so must have enough temp space to store it. In addition, data is persisted as a normal table, and so there must also be enough space to hold the final, replicated data. The node's first-listed/default [`store`](start-a-node.html#store) directory must have enough available storage to hold its portion of the data.

On [`cockroach start`](start-a-node.html), if you set `--max-disk-temp-storage`, it must also be greater than the portion of the data a node will store in temp space.

### Import File Location

You can store the tabular data you want to import using remote cloud storage (Amazon S3, Google Cloud Platform, etc.). Alternatively, you can use an [HTTP server](create-a-file-server.html) accessible from all nodes.

For simplicity's sake, it's **strongly recommended** to use cloud/remote storage for the data you want to import. Local files are supported; however, they must be accessible identically from all nodes in the cluster.

### Table Users and Privileges

Imported tables are treated as new tables, so you must [`GRANT`](grant.html) privileges to them.

## Performance

All nodes are used during tabular data conversion into key-value data, which means all nodes' CPU and RAM will be partially consumed by the [`IMPORT`](import.html) task in addition to serving normal traffic.

## Synopsis

{% include sql/{{ page.version.version }}/diagrams/import.html %}

## Required Privileges

Only the `root` user can run [`IMPORT`](import.html).

## Parameters

| Parameter | Description |
|-----------|-------------|
| `table_name` | The name of the table you want to import/create. |
| `create_table_file` | The URL of a plain text file containing the [`CREATE TABLE`](create-table.html) statement you want to use (see [this example for syntax](#use-create-table-statement-from-a-file)). |
| `table_elem_list` | The table definition you want to use (see [this example for syntax](#use-create-table-statement-from-a-statement)). |
| `file_to_import` | The URL of the file you want to import.|
| `WITH kv_option` | Control your import's behavior with [these options](#import-options). |

### Import File URLs

URLs for the files you want to import must use the following format:

~~~
[scheme]://[host]/[path]?[parameters]
~~~

<style>
	table td:nth-child(2) {
	    min-width: 130px;
	}
</style>

| Location | scheme | host | parameters |
|----------|--------|------|------------|
| Amazon S3 | `s3` | Bucket name | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` |
| Azure | `azure` | Container name | `AZURE_ACCOUNT_KEY`, `AZURE_ACCOUNT_NAME` |
| Google Cloud [<sup>1</sup>](#considerations) | `gs` | Bucket name | None |
| HTTP [<sup>2</sup>](#considerations) | `http` | Remote host | N/A |
| NFS/Local [<sup>3</sup>](#considerations) | `nodelocal` | File system location | N/A |
| S3-compatible services | `s3` | Bucket name | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_ENDPOINT` |

#### Considerations

- [<sup>1</sup>](#import-file-urls) Only supports instance auth.

- [<sup>2</sup>](#import-file-urls) You can easily create your own HTTP server with [Caddy or nginx](create-a-file-server.html).

- [<sup>3</sup>](#import-file-urls) The file system backup location on the NFS drive is relative to the path specified by the `--external-io-dir` flag set while [starting the node](start-a-node.html). If the flag is set to `disabled`, then imports from local directories and NFS drives are disabled.

- The location parameters often contain special characters that need to be URI-encoded. Use Javascript's [encodeURIComponent](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent) function or Go language's [url.QueryEscape](https://golang.org/pkg/net/url/#QueryEscape) function to URI-encode the parameters. Other languages provide similar functions to URI-encode special characters.

### Import Options

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
			<td>To use tab-delimited values: <code>WITH temp = '...', delimiter = e'\t'</code></td>
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
			<td><code>WITH temp = '...', comment = '#'</code></td>
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
			<td>To use empty columns as <em>NULL</em>: <code>WITH temp = '...', nullif = ''</code></td>
		</tr>
	</tbody>
</table>

## Examples

### Use Create Table Statement from a File

~~~ sql
> IMPORT TABLE customers
CREATE USING 'azure://acme-co/customer-create-table.sql?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
CSV DATA ('azure://acme-co/customer-import-data.csv?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co')
;
~~~

### Use Create Table Statement from a Statement

~~~ sql
> IMPORT TABLE customers (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		name TEXT,
		INDEX name_idx (name)
)
CSV DATA ('azure://acme-co/customer-import-data.csv?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co')
;
~~~

### Import a Tab-Separated File

~~~ sql
> IMPORT TABLE customers (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		name TEXT,
		INDEX name_idx (name)
)
CSV DATA ('azure://acme-co/customer-import-data.tsc?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co')
WITH
	delimiter = e'\t'
;
~~~

### Skip Commented Lines

~~~ sql
> IMPORT TABLE customers (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		name TEXT,
		INDEX name_idx (name)
)
CSV DATA ('azure://acme-co/customer-import-data.tsc?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co')
WITH
	comment = '#'
;
~~~

### Use Blank Characters as *NULL*

~~~ sql
> IMPORT TABLE customers (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		name TEXT,
		INDEX name_idx (name)
)
CSV DATA ('azure://acme-co/customer-import-data.tsc?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co')
WITH
	nullif = ''
;
~~~

## Known Limitation

`IMPORT` can sometimes fail with a "context canceled" error, or can restart itself many times without ever finishing. If this is happening, it is likely due to a high amount of disk contention. This can be mitigated by setting the `kv.bulk_io_write.max_rate` [cluster setting](cluster-settings.html) to a value below your max disk write speed. For example, to set it to 10MB/s, execute:

~~~ sql
> SET CLUSTER SETTING kv.bulk_io_write.max_rate = '10MB';
~~~

## See Also

- [Create a File Server](create-a-file-server.html)
- [Importing Data](import-data.html)
