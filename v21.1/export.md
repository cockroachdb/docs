---
title: EXPORT
summary: Export tabular data from a CockroachDB cluster in CSV format.
toc: true
---

The `EXPORT` [statement](sql-statements.html) exports tabular data or the results of arbitrary `SELECT` statements to CSV files.

Using the [CockroachDB distributed execution engine](https://www.cockroachlabs.com/docs/stable/architecture/sql-layer.html#distsql), `EXPORT` parallelizes CSV creation across all nodes in the cluster, making it possible to quickly get large sets of data out of CockroachDB in a format that can be ingested by downstream systems. If you do not need distributed exports, you can use the [non-enterprise feature to export tabular data in CSV format](#non-distributed-export-using-the-sql-shell).

{{site.data.alerts.callout_info}}
 `EXPORT` no longer requires an enterprise license.
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
 `file_location` | Specify the [URL of the file location](#export-file-url) where you want to store the exported CSV data.<br><br>Note: Exports do not generate unique names across exports, so each export should have a unique destination to avoid overwriting.
 `WITH kv_option` | Control your export's behavior with [these options](#export-options).
 `select_stmt` | Specify the query whose result you want to export to CSV format.
 `table_name` | Specify the name of the table you want to export to CSV format.

### Export file URL

You can specify the base directory where you want to store the exported .csv files. CockroachDB will create the export file(s) in the specified directory with programmatically generated names (e.g., n1.1.csv, n1.2.csv, n2.1.csv, ...). Each export should have a unique destination to avoid overwriting other exports.

For more information, see the following:

- [Use Cloud Storage for Bulk Operations](use-cloud-storage-for-bulk-operations.html)
- [Use a Local File Server for Bulk Operations](use-a-local-file-server-for-bulk-operations.html)

### Export options

You can control the [`EXPORT`](export.html) process's behavior using any of the following key-value pairs as a `kv_option`.

#### `delimiter`

If not using comma as your column delimiter, you can specify another ASCII character as the delimiter.

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
			<td>The ASCII character that delimits columns in your rows</td>
		</tr>
		<tr>
			<td><strong>Example</strong></td>
			<td>To use tab-delimited values: <code>WITH delimiter = e'\t'</code></td>
		</tr>
	</tbody>
</table>

#### `nullas`

Convert SQL *NULL* values so they match the specified string.

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
			<td>The string that should be used to represent <em>NULL</em> values. To avoid collisions, it is important to pick <code>nullas</code> values that does not appear in the exported data.</td>
		</tr>
		<tr>
			<td><strong>Example</strong></td>
			<td>To use empty columns as <em>NULL</em>: <code>WITH nullas = ''</code></td>
		</tr>
	</tbody>
</table>

## Examples

### Export a table

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

### Non-distributed export using the SQL shell

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql -e "SELECT * from bank.customers WHERE id>=100;" --format=csv > my.csv
~~~

### View a running export

View running exports by using [`SHOW QUERIES`](show-queries.html):

{% include copy-clipboard.html %}
~~~ sql
> SHOW QUERIES;
~~~

### Cancel a running export

Use [`SHOW QUERIES`](show-queries.html) to get a running export's `query_id`, which can be used to [cancel the export](cancel-query.html):

{% include copy-clipboard.html %}
~~~ sql
> CANCEL QUERY '14dacc1f9a781e3d0000000000000001';
~~~

## Known limitation

`EXPORT` may fail with an error if the SQL statements are incompatible with DistSQL. In that case, [export tabular data in CSV format](#non-distributed-export-using-the-sql-shell).

## See also

- [Use a Local File Server for Bulk Operations](use-a-local-file-server-for-bulk-operations.html)
