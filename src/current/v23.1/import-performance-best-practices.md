---
title: Import Performance Best Practices
summary: Best practices for optimizing import performance in CockroachDB.
toc: true
docs_area: migrate
---

This page provides best practices for optimizing [import](import-into.html) performance in CockroachDB.

Import speed primarily depends on the amount of data that you want to import. However, there are four main factors that have can have a large impact on the amount of time it will take to run an import:

- [Split your data into multiple files](#split-your-data-into-multiple-files)
  - [File storage during import](#file-storage-during-import)
- [Sort your data](#sort-your-data)
- [Choose a performant import format](#choose-a-performant-import-format)
  - [Import the schema separately from the data](#import-the-schema-separately-from-the-data)
  - [Import into a schema with secondary indexes](#import-into-a-schema-with-secondary-indexes)
  - [Temporarily remove foreign keys](#temporarily-remove-foreign-keys)
  - [Data type sizes](#data-type-sizes)
- [See also](#see-also)

{{site.data.alerts.callout_info}}
If the import size is small, then you do not need to do anything to optimize performance. In this case, the import should run quickly, regardless of the settings.
{{site.data.alerts.end}}

## Split your data into multiple files

Splitting the import data into multiple files can have a large impact on the import performance. The following formats support multi-file import using `IMPORT INTO`:

- `CSV`
- `DELIMITED DATA`
- `AVRO`

For these formats, we recommend splitting your data into at least as many files as there are nodes.

For example, if you have a 3-node cluster, split your data into at least 3 files, create your table, and [import into that table](import-into.html):

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE customers (id UUID PRIMARY KEY, name TEXT, INDEX name_idx(name));
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
IMPORT INTO customers (id, name)
    CSV DATA (
      's3://{BUCKET NAME}/{customers.csv}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}',
      's3://{BUCKET NAME}/{customers2.csv}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}',
      's3://{BUCKET NAME}/{customers3.csv}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}',
      's3://{BUCKET NAME}/{customers4.csv}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}',
    );
~~~

CockroachDB imports the files that you give it, and does not further split them. For example, if you import one large file for all of your data, CockroachDB will process that file on one node, even if you have more nodes available. However, if you import three files (and your cluster has at least three nodes), each node will process a file in parallel. This is why splitting your data into at least as many files as you have nodes will dramatically decrease the time it takes to import data.

{{site.data.alerts.callout_info}}
You can split the data into **more** files than you have nodes. CockroachDB will process the files in parallel across the cluster. When splitting the data Cockroach Labs recommends splitting it into a multiple of the number of nodes in your cluster, if possible. For example, if you have a 3 node cluster, split the dataset into 9, 27, or 300 files.

Cockroach Labs recommends keeping the files to a maximum file size of 4 GB, and to keep each file size similar across the dataset. For example, if you are importing a 9 GB dataset that was split into 3 files into a 3 node cluster, keep each file around 3 GB in size if possible. Don't split the data into two 4 GB files, and one 1 GB file.
{{site.data.alerts.end}}

For maximum performance each split file should be *partitioned*, meaning that if you were to sort the rows in each file there would be no overlapping data in any other file. For example, if your dataset had an alphabetic string primary key and you were importing the data into a 3 node cluster, you would split the files so that the first file contained rows where the primary key began with the letter "a" to "i", the second file "j" to "r" and the third file "s" to "z". No file should contain duplicate rows.

### File storage during import

During migration, all of the features of [`IMPORT INTO`](import-into.html) that interact with external file storage assume that every node has the exact same view of that storage. In other words, in order to import from a file, every node needs to have the same access to that file.

If a node runs out of disk space while processing an import job, CockroachDB will pause the import job. Make sure each node has enough free disk space to process the file and store the data.

## Sort your data

Within each split file with your import data, sort the data based on how it will be stored in CockroachDB. For example, in the example where a dataset was partitioned by an alphabetic string primary key, within each split file the data should be sorted by the alphabetic primary key.

In tests performed by Cockroach Labs, the best import performance, measured in both throughput and overall time, was observed when data was split into partitioned files and sorted within each partitioned file. Imports using an unpartitioned and unsorted dataset were about 16 times slower than imports using the same dataset with partitioned and sorted files. If you cannot both partition and sort your dataset, the performance of either partitioned or sorted data was similar, around 2 times slower than both partitioned and sorted data, but still much faster than both unpartitioned and unsorted data.

## Choose a performant import format

Import formats do not have the same performance because of the way they are processed. Below, import formats are listed from fastest to slowest:

1. [`CSV`](migrate-from-csv.html) or [`DELIMITED DATA`](import-into.html) (both have about the same import performance).
1. [`AVRO`](migrate-from-avro.html).

We recommend formatting your import files as `CSV`, `DELIMITED DATA`, or `AVRO`. These formats can be processed in parallel by multiple threads, which increases performance. To import in these formats, use [`IMPORT INTO`](import-into.html).

{% include {{ page.version.version }}/import-table-deprecate.md %}

### Import the schema separately from the data

Split your dump data into two files:

1. A SQL file containing the table schema.
1. A CSV file containing the table data.

Convert the schema-only file using the [Schema Conversion Tool](../cockroachcloud/migrations-page.html). The Schema Conversion Tool automatically creates a new {{ site.data.products.serverless }} database with the converted schema. {% include cockroachcloud/migration/sct-self-hosted.md %}

Then use the [`IMPORT INTO`](import-into.html) statement to import the CSV data into the newly created table:

~~~ sql
> IMPORT INTO customers (id, name)
CSV DATA (
    'https://s3-us-west-1.amazonaws.com/cockroachdb-movr/datasets/employees-db/pg_dump/customers.csv'
);
~~~

This method has the added benefit of alerting on potential issues with the import sooner; that is, you will not have to wait for the file to load both the schema and data just to find an error in the schema.

### Import into a schema with secondary indexes

When importing data into a table with secondary indexes, the import job will ingest the table data and required secondary index data concurrently. This may result in a longer import time compared to a table without secondary indexes. However, this typically adds less time to the initial import than following it with a separate pass to add the indexes. As a result, importing tables with their secondary indexes is the default workflow, suitable for most import jobs.

However, in **large** imports, it may be preferable to temporarily remove the secondary indexes from the schema, perform the import, and then re-create the indexes separately. This provides increased visibility into its progress and ability to retry each step independently.

- [Remove the secondary indexes](drop-index.html)
- [Perform the import](import-into.html)
- [Create a secondary index](schema-design-indexes.html#create-a-secondary-index)

### Temporarily remove foreign keys

When importing data into a table with foreign keys, temporarily remove the foreign keys, and add them after the initial migration with an [`ALTER TABLE` statement](alter-table.html#add-the-foreign-key-constraint-with-cascade).

### Data type sizes

Above a certain size, many data types such as [`STRING`](string.html)s, [`DECIMAL`](decimal.html)s, [`ARRAY`](array.html), [`BYTES`](bytes.html), and [`JSONB`](jsonb.html) may run into performance issues due to [write amplification](architecture/storage-layer.html#write-amplification). See each data type's documentation for its recommended size limits.

## See also

- [`IMPORT INTO`](import-into.html)
- [Migration Overview](migration-overview.html)
- [Migrate from Oracle](migrate-from-oracle.html)
- [Migrate from PostgreSQL](migrate-from-postgres.html)
- [Migrate from MySQL](migrate-from-mysql.html)
- [Migrate from CSV](migrate-from-csv.html)
- [Migrate from Avro](migrate-from-avro.html)
