---
title: IMPORT
summary: Import CSV data into your CockroachDB cluster.
toc: false
---

The `IMPORT` [statement](sql-statements.html) imports tabular data (e.g. CSVs) into a single table.

{{site.data.alerts.callout_success}}For details about importing SQL dumps, see <a href="import-data.html">Import Data</a>.{{site.data.alerts.end}}

<div id="toc"></div>

## Glossary

Term | Definition
-----|-----------
**Import file** | The tabular data file you want to import
**Processing node** | The single node processing the `IMPORT` statement
**Temp directory** | A location where the processing node can store data from the import file it converts to CockroachDB-compatible key-value data.<br/><br/>This directory *must* be available to all nodes using the same address (i.e., cannot use the processing node's local file storage).

## Functional Overview

Because importing data is a complex task, it can be useful to have a high-level understanding of the process.

1. A single node receives the `IMPORT` request, which becomes the processing node.
2. The processing node streams the contents of the import file, converting its contents into CockroachDB-compatible key-value data.
3. As the key-value data is generated, the node stores it in the temp directory.
4. Once the entire import file has been converted to key-value data, relevant nodes import key-value data from the temp directory.
5. The processing node deletes the key-value data from the temp directory.

## Preparation

Before using `IMPORT`, you should have the following:

- The tabular data you want to import (e.g., CSV), preferably hosted on cloud storage
- A location to store data before it is fully imported into all your nodes (referred to in this document as a "temp" directory). This location *must* be accessible to all nodes using the same address (i.e. cannot use a node's local file storage).
  
    For ease of use, we recommend using cloud storage. However, if that isn't readily available to you, we also have a [guide on easily creating your own file server](create-a-file-server.html).

- The schema of the table you want to import

## Details

### Import Targets

Imported tables must not exist and must be created in the `IMPORT` statement. If the table you want to import already exists, you must drop it with [`DROP TABLE`](drop-table.html).

You can only import a single table at a time.

### Create Table

Your `IMPORT` statement must include a `CREATE TABLE` statement (representing the schema of the data you want to import) using one of the following methods:

- A reference to a file that contains a `CREATE TABLE` statement
- An inline `CREATE TABLE` statement

We also recommend [all secondary indexes you want to use in the `CREATE TABLE` statement](create-table.html#create-a-table-with-secondary-indexes).

### Object Dependencies

When importing tables, you must be mindful of the following rules because `IMPORT` only creates single tables which must not already exist:

- Objects that the imported table depends on must already exist
- Objects that depend on the imported table can only be created after the import completes

### Choose Node to Process Request

Because of `IMPORT`'s current implementation, the entire task is executed on a single node.

If you issue the statement to your cluster, your load balancer is likely to send the request to a random node. If your deployment is not entirely symmetric, this might cause undesirable effects, so you might want to choose a specific node to process the `IMPORT` statement.

To choose which node processes the request, we recommend bypassing your load balancer and directly connecting to the individual machine you want to use. 

It's important to note, though, that after the single machine creates the CockroachDB-compatible key-value data, which is stored in the temp directory, the process of importing the data is distributed among nodes in the cluster.

### Available Storage Requirements

The node processing the `IMPORT` task must have enough available storage in its [`store`](start-a-node.html#store) directory for *all* of the data you're importing.

For example, if you're importing approximately 10GB of data, the node that ends up running the `IMPORT` command must have at least 10GB of available storage in its `store` directory.

### Tabular Data File Location

You can store the tabular data you want to import using either a node's local storage or remote cloud storage (Amazon S3, Google Cloud Platform, etc.).

For simplicity's sake, we **highly recommend** using cloud/remote storage for the data you want to import.

However, if you do want to store the file locally to import it, there are a number of things to understand.

#### Importing Data From Local Storage

{{site.data.alerts.callout_info}}Because you must have remote/cloud storage available to complete the <code>IMPORT</code> process, we recommend using it instead of local file storage.<br/><br/>If you do not have access to cloud storage, you can easily create a file server using <a href="create-a-file-server.html">this guide</a>.{{site.data.alerts.end}}

Because CockroachDB is designed as a distributed system, the ergonomics of local file storage require some understanding to use successfully. Though we don't recommend this process, if you do want to use a locally stored file, this procedure is likely to cause you the fewest headaches:

1. Ensure the node you want to use has available storage space at least 2x the size of the data you want to import; 1x for the file itself, and 1x for the converted key-value data.

    For example, if you want to import 10GiB of data, your node needs 20GiB of available storage.
2. Upload the tabular data file to a single node, and then connect to that node.
3. Execute the `IMPORT` statement, importing to the locally stored file with the `nodelocal` prefix, e.g. `nodelocal://backup.csv`.

    However, the "temp" directory you choose must use a location available to all nodes in the cluster (i.e., you cannot use local file storage). You will need to use either cloud storage, a custom HTTP server, or NFS connected to all nodes in the cluster.

### Temp Directory

To distribute the data you want to import to all nodes in your cluster, the `IMPORT` process requires the CockroachDB-compatible key-value data be stored in a location that is accessible to all nodes in the cluster using the same address. To achieve this you can use:

- Cloud storage, such as Amazon S3 or Google Cloud Platform
- Network file storage mounted to every node
- HTTP file server

If you don't currently have any of these options available, you can easily [create a file server](create-a-file-server.html).

The temp directory must have at least as much storage space as the size of the data you want to import.

### Table Users and Privileges

Imported tables are treated as new tables, so you must [`GRANT`](grant.html) privileges to them.

## Performance

Currently, `IMPORT` uses a single node to convert your tabular data into key-value data, which means the node's CPU and RAM will be partially consumed by the `IMPORT` task in addition to serving normal traffic.

Later steps of the import process distribute work among many nodes and have less impact on the nodes' resources.

## Synopsis

{% include sql/{{ page.version.version }}/diagrams/import.html %}

## Required Privileges

Only the `root` user can run `IMPORT`.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `table_name` | The name of the table you want to import/create. |
| `create_table_file` | The URL of a plain text file containing the [`CREATE TABLE`](create-table.html) statement you want to use. |
| `create_table_statement` | The [`CREATE TABLE`](create-table.html) statement you want to use. |
| `file_to_import` | The URL of the file you want to import.|
| `kv_option` | Control your import's behavior with [these options](#import-options). {{site.data.alerts.callout_info}}The <a href="#temp-required"><code>temp</code></a> option is required.{{site.data.alerts.end}} |

### Import & Temp File URLs

URLs for the file you want to import and your temp directory must use the following format:

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
| Google Cloud <sup>1</sup> | `gs` | Bucket name | None |
| HTTP <sup>2</sup> | `http` | Remote host | N/A |
| NFS/Local <sup>3</sup> | `nodelocal` | File system location | N/A |

#### Notes

<sup>1</sup> Only supports instance auth.

<sup>2</sup> You can easily create your own HTTP server with [Caddy or nginx](create-a-file-server.html).

<sup>3</sup> If using NFS for your temp directory, each node in the cluster must have access to the NFS using the same URL.

### Import Options

You can include the following options as key-value pairs in the `kv_option_list` to control the restore process's behavior.

#### `temp` (Required)

- **Description**: A directory accessible by all nodes, which will be used to store the CockroachDB-compatible key-value data before being imported by all nodes
- **Key**: `temp`
- **Value**: The URL of the file you want to import
- **Example**: `WITH OPTIONS ('temp' = 'azure://acme-co/import-temp?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co')`


#### `delimiter`

- **Description**: If not using comma as your column delimiter, you can specify another unicode character as the delimiter
- **Key**: `delimiter`
- **Value**: The unicode character that delimits columns in your rows
- **Example**: To use tab-separated values: `WITH OPTIONS (..., 'delimiter' = 'U+0009')`


#### `comment`

- **Description**: Do not import rows that begin with this character.
- **Key**: `comment`
- **Value**: The unicode character that identifies rows to skip
- **Example**: `WITH OPTIONS (..., 'comment' = '//')`


#### `nullif`

- **Description**: Convert values to SQL `null` if they match the specified character
- **Key**: `nullif`
- **Value**: The unicode character that should be converted to *NULL*
- **Example**: To use empty columns as *NULL* `WITH OPTIONS (..., 'nullif' = '')`

## Examples

### Use Create Table Statement from a File

~~~ sql
> IMPORT TABLE customers
CREATE USING 'azure://acme-co/customer-create-table.sql?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
CSV DATA ('azure://acme-co/customer-import-data.csv?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co')
WITH OPTIONS ('temp' = 'azure://acme-co/temp/?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co');
~~~

### Use Create Table Statement from a Statement

~~~ sql
> IMPORT TABLE customers
(
	CREATE TABLE customers (
		id SERIAL PRIMARY KEY,
		name TEXT,
		INDEX name_idx (name)
	)
)
CSV DATA ('azure://acme-co/customer-import-data.csv?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co')
WITH OPTIONS ('temp' = 'azure://acme-co/temp/?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co');
~~~

### Import a Tab-Separated File

~~~ sql
> IMPORT TABLE customers
(
	CREATE TABLE customers (
		id SERIAL PRIMARY KEY,
		name TEXT,
		INDEX name_idx (name)
	)
)
CSV DATA ('azure://acme-co/customer-import-data.tsc?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co')
WITH OPTIONS (
	'temp' = 'azure://acme-co/temp/?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co',
	'delimiter' = 'U+0009')
);
~~~

### Skip Commented Lines

~~~ sql
> IMPORT TABLE customers
(
	CREATE TABLE customers (
		id SERIAL PRIMARY KEY,
		name TEXT,
		INDEX name_idx (name)
	)
)
CSV DATA ('azure://acme-co/customer-import-data.tsc?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co')
WITH OPTIONS (
	'temp' = 'azure://acme-co/temp/?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co',
	'comment' = '//')
);
~~~

### Use Blank Characters as *NULL*

~~~ sql
> IMPORT TABLE customers
(
	CREATE TABLE customers (
		id SERIAL PRIMARY KEY,
		name TEXT,
		INDEX name_idx (name)
	)
)
CSV DATA ('azure://acme-co/customer-import-data.tsc?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co')
WITH OPTIONS (
	'temp' = 'azure://acme-co/temp/?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co',
	'nullif' = '')
);
~~~

## See Also

- [Create a File Server](create-a-file-server.html)
- [Importing Data](import-data.html)
