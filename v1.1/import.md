---
title: IMPORT (Experimental)
summary: Import CSV data into your CockroachDB cluster.
toc: true
---

The `IMPORT` [statement](sql-statements.html) imports tabular data (e.g., CSVs) into a single table.

{{site.data.alerts.callout_danger}}<strong>This is an experimental feature</strong>. To enable it, you must run <a href="set-cluster-setting.html"><code>SET CLUSTER SETTING experimental.importcsv.enabled = true</code></a>{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}For details about importing SQL dumps, see <a href="import-data.html">Import Data</a>.{{site.data.alerts.end}}


## Glossary

Term | Definition
-----|-----------
**Import file** | The tabular data file you want to import.
**Processing node** | The single node processing the [`IMPORT`](import.html) statement/
**Temp directory** | A location where the processing node can store data from the import file it converts to CockroachDB-compatible key-value data.<br/><br/>This directory *must* be available to all nodes using the same address (i.e., cannot use the processing node's local file storage).

## Functional Overview

Because importing data is a complex task, it can be useful to have a high-level understanding of the process.

1. A single node receives the [`IMPORT`](import.html) request, which becomes the processing node.
2. The processing node streams the contents of the import file, converting its contents into CockroachDB-compatible key-value data.
3. As the key-value data is generated, the node stores it in the temp directory.
4. Once the entire import file has been converted to key-value data, relevant nodes import key-value data from the temp directory.

After the import has completed, you should also delete the files from your temp directory.

## Preparation

Before using [`IMPORT`](import.html), you should have:

- The schema of the table you want to import.
- The tabular data you want to import (e.g., CSV), preferably hosted on cloud storage.
- A location to store data before it is fully imported into all your nodes (referred to in this document as a "temp" directory). This location *must* be accessible to all nodes using the same address (i.e., cannot use a node's local file storage).

    For ease of use, we recommend using cloud storage. However, if that isn't readily available to you, we also have a [guide on easily creating your own file server](create-a-file-server.html).

## Details

### Import Targets

Imported tables must not exist and must be created in the [`IMPORT`](import.html) statement. If the table you want to import already exists, you must drop it with [`DROP TABLE`](drop-table.html).

You can only import a single table at a time.

### Create Table

Your [`IMPORT`](import.html) statement must include a `CREATE TABLE` statement (representing the schema of the data you want to import) using one of the following methods:

- A reference to a file that contains a `CREATE TABLE` statement
- An inline `CREATE TABLE` statement

We also recommend [all secondary indexes you want to use in the `CREATE TABLE` statement](create-table.html#create-a-table-with-secondary-indexes). It is possible to add secondary indexes later, but it is significantly faster to specify them during import.

### Object Dependencies

When importing tables, you must be mindful of the following rules because [`IMPORT`](import.html) only creates single tables which must not already exist:

- Objects that the imported table depends on must already exist
- Objects that depend on the imported table can only be created after the import completes

### Operational Requirements & Concerns

Because [`IMPORT`](import.html) has a number of moving parts, there are a number of operational concerns in executing the statement, the most important of which is ensuring that the processing node can execute [`IMPORT`](import.html) successfully.

#### Choose Node to Process Request

Because of [`IMPORT`](import.html)'s current implementation, the entire task is executed on a single node. If your deployment is not entirely symmetric, sending the request to a random node might have undesirable effects. Instead, we recommend bypassing any load balancers, connecting to a machine directly, and running the [`IMPORT`](import.html) statement on it.

It's important to note, though, that after the single machine creates the CockroachDB-compatible key-value data, the process of importing the data is distributed among nodes in the cluster.

{{site.data.alerts.callout_info}}Future versions of <code>IMPORT</code> will let you distribute the entire process among many nodes.{{site.data.alerts.end}}

#### Available Storage Requirements

The node's first-listed/default [`store`](start-a-node.html#store) directory must have enough available storage equal to or greater than the size of the file you're importing.

On [`cockroach start`](start-a-node.html), if you set `--max-disk-temp-storage`, it must also be greater than the size of the file you're importing.

For example, if you're importing approximately 10GiB of data, the node that ends up running the [`IMPORT`](import.html) command must have at least 10GiB of available storage in its `store` directory.

### Import File Location

You can store the tabular data you want to import using either a node's local storage or remote cloud storage (Amazon S3, Google Cloud Platform, etc.).

For simplicity's sake, we *highly recommend* using cloud/remote storage for the data you want to import.

However, if you do want to store the file locally to import it, there are a number of things to understand.

#### Importing Data From Local Storage

{{site.data.alerts.callout_info}}Because you must have remote/cloud storage available to complete the <code>IMPORT</code> process, we recommend using it instead of local file storage.<br/><br/>If you do not have access to cloud storage, you can easily create a file server using <a href="create-a-file-server.html">this guide</a>.{{site.data.alerts.end}}

Because CockroachDB is designed as a distributed system, the ergonomics of local file storage require some understanding to use successfully. Though we do not recommend this process, if you do want to use a locally stored file, this procedure is likely to cause you the fewest headaches:

1. Ensure the node you want to use has available storage space at least 2x the size of the data you want to import; 1x for the file itself, and 1x for the converted key-value data.

    For example, if you want to import 10GiB of data, your node needs 20GiB of available storage.
2. Upload the tabular data file to a single node, and then connect to that node.
3. Execute the [`IMPORT`](import.html) statement, importing to the locally stored file with the `nodelocal` prefix, e.g., `nodelocal://backup.csv`.

    However, the "temp" directory you choose must use a location available to all nodes in the cluster (i.e., you cannot use local file storage). You will need to use either cloud storage, a custom HTTP server, or NFS connected to all nodes in the cluster.

### Temp Directory

To distribute the data you want to import to all nodes in your cluster, the [`IMPORT`](import.html) process requires the CockroachDB-compatible key-value data be stored in a location that is accessible to all nodes in the cluster using the same address. To achieve this you can use:

- Cloud storage, such as Amazon S3 or Google Cloud Platform
- Network file storage mounted to every node
- HTTP file server

{{site.data.alerts.callout_info}}If you do not currently have any of these options available, you can easily <a href="create-a-file-server.html">create a file server</a>.{{site.data.alerts.end}}

The temp directory must have at least as much storage space as the size of the data you want to import.

#### Temp Directory Cleanup

After completing the [`IMPORT`](import.html) process, you must manually remove the key-value data stored in the temp directory.

### Table Users and Privileges

Imported tables are treated as new tables, so you must [`GRANT`](grant.html) privileges to them.

## Performance

Currently, [`IMPORT`](import.html) uses a single node to convert your tabular data into key-value data, which means the node's CPU and RAM will be partially consumed by the [`IMPORT`](import.html) task in addition to serving normal traffic.

Later steps of the import process distribute work among many nodes and have less impact on the nodes' resources.

## Synopsis

{% include {{ page.version.version }}/sql/diagrams/import.html %}

## Required Privileges

Only the `root` user can run [`IMPORT`](import.html).

## Parameters

| Parameter | Description |
|-----------|-------------|
| **table_name** | The name of the table you want to import/create. |
| **create_table_file** | The URL of a plain text file containing the [`CREATE TABLE`](create-table.html) statement you want to use (see [this example for syntax](#use-create-table-statement-from-a-file)). |
| **table_elem_list** | The table definition you want to use (see [this example for syntax](#use-create-table-statement-from-a-statement)). |
| **file_to_import** | The URL of the file you want to import.|
| `WITH` **kv_option** | Control your import's behavior with [these options](#import-options). The **temp** option (which represents the [temp directory](#temp-directory)'s URL) is required. |

### Import File & Temp Directory URLs

URLs for the file you want to import and your temp directory must use the following format:

{% include {{ page.version.version }}/misc/external-urls.md %}

#### Notes

[<sup>1</sup>](#import-file-temp-directory-urls) Only supports instance auth.

[<sup>2</sup>](#import-file-temp-directory-urls) You can easily create your own HTTP server with [Caddy or nginx](create-a-file-server.html).

[<sup>3</sup>](#import-file-temp-directory-urls) If using NFS for your temp directory, each node in the cluster must have access to the NFS using the same URL.

### Import Options

You can control the [`IMPORT`](import.html) process's behavior using any of the following key-value pairs as a `kv_option`.

#### `temp`

A directory accessible by all nodes, which is used to store the CockroachDB-compatible key-value data before all nodes import the data.

<table>
	<tbody>
		<tr>
			<td><strong>Required?</strong></td>
			<td>Yes</td>
		</tr>
		<tr>
			<td><strong>Key</strong></td>
			<td><code>temp</code></td>
		</tr>
		<tr>
			<td><strong>Value</strong></td>
			<td>The URL of the temp directory</td>
		</tr>
		<tr>
			<td><strong>Example</strong></td>
			<td><code>WITH temp = 'azure://acme-co/import-temp?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'</code></td>
		</tr>
	</tbody>
</table>


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
WITH
	temp = 'azure://acme-co/temp/?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
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
WITH
	temp = 'azure://acme-co/temp/?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
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
	temp = 'azure://acme-co/temp/?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co',
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
	temp = 'azure://acme-co/temp/?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co',
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
	temp = 'azure://acme-co/temp/?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co',
	nullif = ''
;
~~~

## See Also

- [Create a File Server](create-a-file-server.html)
- [Importing Data](import-data.html)
