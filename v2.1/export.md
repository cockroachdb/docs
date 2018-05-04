---
title: EXPORT
summary: Export tabular data from CockroachDB cluster in CSV format.
toc: false
---

The `EXPORT` [statement](sql-statements.html) exports tabular data and results of arbitrary `SELECT` statements to CSV files.

{{site.data.alerts.callout_danger}}The <code>EXPORT</code> feature is only available to <a href="https://www.cockroachlabs.com/product/cockroachdb/">enterprise</a> users. Also note that this feature is currently under development and is slated for full release in CockroachDB 2.1. The feature flags and behavior are subject to change. {{site.data.alerts.end}}

`EXPORT` uses the [CockroachDB distributed execution engine](https://www.cockroachlabs.com/docs/stable/architecture/sql-layer.html#distsql) and exports the CSV data in parallel across all nodes, making it possible to export larger data sets significantly faster. If you don't need distributed exports, you can use the [non-enterprise feature to export tabular data in CSV format](#non-distributed-export-using-the-sql-shell).

<div id="toc"></div>

## Export File Location

You can use remote cloud storage (Amazon S3, Google Cloud Platform, etc.) to store the exported CSV data. Alternatively, you can use an [HTTP server](create-a-file-server.html) accessible from all nodes.

For simplicity's sake, it's **strongly recommended** to use cloud/remote storage for the data you want to export. Local files are supported; however, they must be accessible identically from all nodes in the cluster.

## Cancelling Export

After the export has been initiated, you can cancel it with [`CANCEL QUERY`](cancel-query.html).

## Synopsis

<div>{% include sql/{{ page.version.version }}/diagrams/export.html %}</div>

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

### Export File URL

URLs for the file directory location you want to export to must use the following format:

{% include external-urls-v2.0.md %}

You can specify the base directory where you want to store the exported .csv files. CockroachDB will create several files in the specified directory with programmatically generated names (e.g. n1.1.csv, n1.2.csv, n2.1.csv, ...).

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

#### `nullas`

Convert SQL *NULL* values to they match the specified string.

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
  'azure://acme-co/customer-export-data?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
  WITH delimiter = '|' FROM TABLE bank.customers;
~~~

### Export using a `SELECT` statement

{% include copy-clipboard.html %}
~~~ sql
> EXPORT INTO CSV
  'azure://acme-co/customer-export-data?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
  FROM SELECT * FROM bank.customers WHERE id >= 100;
~~~

### Non-Distributed Export Using the SQL Shell

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql -e "SELECT * from bank.customers WHERE id>=100;" --format=csv > my.csv
~~~

## Known Limitation

`EXPORT` may fail with an error if the SQL statements are incompatible with DistSQL. In that case, use the [non-enterprise feature to export tabular data in CSV format](#non-distributed-export-using-the-sql-shell).

## See Also

- [Create a File Server](create-a-file-server.html)
