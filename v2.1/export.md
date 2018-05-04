---
title: EXPORT
summary: Export tabular data from CockroachDB cluster in CSV format.
toc: false
---

The `EXPORT` [statement](sql-statements.html) exports tabular data to CSV files.

{{site.data.alerts.callout_danger}}The <code>EXPORT</code> feature is only available to <a href="https://www.cockroachlabs.com/product/cockroachdb/">enterprise</a> users. Also note that this feature is currently under development and is slated for full release in CockroachDB 2.1. The feature flags and behavior are subject to change. {{site.data.alerts.end}}

<div id="toc"></div>

## Export File Location

You can use remote cloud storage (Amazon S3, Google Cloud Platform, etc.) to store the exported CSV data. Alternatively, you can use an [HTTP server](create-a-file-server.html) accessible from all nodes.

For simplicity's sake, it's **strongly recommended** to use cloud/remote storage for the data you want to export. Local files are supported; however, they must be accessible identically from all nodes in the cluster.

## Performance

All nodes are used during tabular data conversion into CSV data, which means all nodes' CPU and RAM will be partially consumed by the [`EXPORT`](export.html) task in addition to serving normal traffic.

## Cancelling Export Jobs

After the export has been initiated, you can cancel it with [`CANCEL JOB`](cancel-job.html).

## Synopsis

{% include sql/{{ page.version.version }}/diagrams/export.html %}

{{site.data.alerts.callout_info}}The <code>EXPORT</code> statement cannot be used within a <a href=transactions.html>transaction</a>.{{site.data.alerts.end}}

## Required Privileges

Only the `root` user can run [`EXPORT`](export.html).

## Parameters

| Parameter | Description |
|-----------|-------------|
| `file_location` | Specify the URL of the file location where you want to store the exported CSV data.|
| `WITH kv_option` | Control your export's behavior with [these options](#export-options). |
| `select_stmt` | Specify the query whose result you want to export to CSV format. |
| `table_name` | Specify the name of the table you want to export to CSV format. |

### Export File URLs

URLs for the files you want to export to must use the following format:

{% include external-urls-v2.0.md %}

### Export Options

You can control the [`EXPORT`](export.html) process's behavior using any of the following key-value pairs as a `kv_option`.

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

Do not export rows that begin with this character.

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

#### `nullas`

Convert values to SQL *NULL* if they match the specified string.

<table>
	<tbody>
		<tr>
			<td><strong>Required?</strong></td>
			<td>No</td>
		</tr>
		<tr>
			<td><strong>Key</strong></td>
			<td><code>nullas</code></td>
		</tr>
		<tr>
			<td><strong>Value</strong></td>
			<td>The string that should be converted to <em>NULL</em></td>
		</tr>
		<tr>
			<td><strong>Example</strong></td>
			<td>To use empty columns as <em>NULL</em>: <code>WITH temp = '...', nullas = ''</code></td>
		</tr>
	</tbody>
</table>

## Examples

### Export a Table

{% include copy-clipboard.html %}
~~~ sql
> EXPORT INTO CSV
  'azure://acme-co/customer-export-data.csv?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
  WITH delimiter = '|' FROM TABLE bank.customers;
~~~

### Export using a `SELECT` statement

{% include copy-clipboard.html %}
~~~ sql
> EXPORT INTO CSV
  'azure://acme-co/customer-export-data.csv?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
  FROM SELECT * FROM bank.customers WHERE id >= 100;
~~~

## Known Limitation

`EXPORT` may fail with an error if the SQL statements are incompatible with DistSQL. In that case, use the non-enterprise feature to export tabular data in CSV format:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql -e "SELECT * from bank.customers WHERE id>=100;" --format=csv > my.csv
~~~

## See Also

- [Create a File Server](create-a-file-server.html)
