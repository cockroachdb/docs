---
title: Import Performance Best Practices
summary: Best practices for optimizing import performance in CockroachDB.
toc: true
docs_area: migrate
---

This page provides best practices for optimizing [import]({% link {{ page.version.version }}/import-into.md %}) performance in CockroachDB.

`IMPORT INTO` is the fastest method to ingest data into CockroachDB but it requires taking the target table offline for the duration of the import. `IMPORT INTO` is a good choice for initial data migrations and data migrations that can tolerate table downtime. If you cannot tolerate table unavailability, we recommend using [`COPY FROM`]({% link {{ page.version.version }}/copy.md %}) instead.

Import performance primarily depends on the amount of data that you want to import. However, there are three actions you should take before importing that have a significant impact on the amount of time it takes to run an import:

- [Choose a performant import format](#choose-a-performant-import-format)
- [Split your data into multiple files](#split-your-data-into-multiple-files)
- [Sort your data](#sort-your-data)

{{site.data.alerts.callout_info}}
If the import size is less than 100 GiB, then you do not need to do anything to optimize performance. For such small datasets, the import should run quickly, regardless of the settings.
{{site.data.alerts.end}}

## Choose a performant import format

Different import file formats do not have the same performance due to the way they are processed by CockroachDB. The fastest import file formats are:

1. [`CSV`](migrate-from-csv.html) or [`DELIMITED DATA`](import-into.html) (both have about the same import performance).
1. [`AVRO`](migrate-from-avro.html).

We recommend formatting your import files as `CSV` or `AVRO`. These formats can be processed in parallel by all the nodes in the cluster, which increases performance. To import in these formats, use [`IMPORT INTO`](import-into.html).

### Import the schema separately from the data

When importing into a new table, split your dump data into two files:

1. A SQL file containing the table schema.
1. A CSV, delimited, or AVRO file containing the table data.

Convert the schema-only file using the [Schema Conversion Tool]({% link cockroachcloud/migrations-page.md %}). The Schema Conversion Tool automatically creates a new CockroachDB {{ site.data.products.cloud }} database with the converted schema. {% include cockroachcloud/migration/sct-self-hosted.md %}

Then use the [`IMPORT INTO`](import-into.html) statement to import the CSV data into the newly created table:

~~~ sql
> IMPORT INTO customers (id, name)
CSV DATA (
    'https://s3-us-west-1.amazonaws.com/cockroachdb-movr/datasets/employees-db/pg_dump/customers.csv'
);
~~~

This method has the added benefit of alerting on potential issues with the import sooner; that is, you will not have to wait for the file to load both the schema and data just to find an error in the schema.

### Import into a schema with secondary indexes

When importing data into a table with [secondary indexes](schema-design-indexes.html), the import job will ingest the table data and required secondary index data concurrently. This may result in a longer import time compared to a table without secondary indexes. However, this typically adds less time to the initial import than following it with a separate pass to add the indexes. As a result, importing tables with their secondary indexes is the default workflow, an effective strategy for most migrations.

However, in **large** imports (that is, datasets larger than 100 GiB in total size), it may be preferable to temporarily [remove the secondary indexes](drop-index.html) from the schema, [perform the import](import-into.html), and then [re-create the indexes separately](schema-design-indexes.html#create-a-secondary-index). Write operations on tables with many secondary indexes take longer to complete, and importing large datasets have a greater risk of timeouts. Removing the table's secondary indexes allows you to separate the initial data import from the secondary index creation operation, and the total import time is lower. Separating these operations also provides increased visibility into each operation's progress, and the ability to retry each operation independently if you encounter errors or timeouts.

When recreating the secondary indexes, execute the [`CREATE INDEX`](create-index.html) statements one at a time for best performance. For example:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE INDEX idx1 ON table1;
CREATE INDEX idx2 ON table1;
CREATE INDEX idx3 ON table1;
~~~

### Temporarily remove foreign keys

When importing data into a table with [foreign keys](foreign-key.html), temporarily remove the foreign keys, and add them after the initial migration with an [`ALTER TABLE` statement](alter-table.html#add-the-foreign-key-constraint-with-cascade).

### Data type sizes

Above a certain size, many data types such as [`STRING`](string.html)s, [`DECIMAL`](decimal.html)s, [`ARRAY`](array.html), [`BYTES`](bytes.html), and [`JSONB`](jsonb.html) may run into performance issues due to [write amplification](architecture/storage-layer.html#write-amplification). See each data type's documentation for its recommended size limits.

## Split your data into multiple files

Splitting the import data into multiple files can have a significant impact on the import performance. The following formats support multi-file import using `IMPORT INTO`:

- `CSV`
- `DELIMITED DATA`
- `AVRO`

For these formats, we recommend splitting your data into at least as many files as there are nodes.

For example, if you have a 3-node cluster, split your data into at least 3 files, create your table schema, and [import into that table]({% link {{ page.version.version }}/import-into.md %}):

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

CockroachDB ingests the files as provided and does not automatically split them further. For example, if you import one large file containing all of your data, CockroachDB will process that file on one node, even if you have more nodes available. However, if you import three files (and your cluster has at least three nodes), each node will process a file in parallel. This is why splitting your data into at least as many files as you have nodes will dramatically decrease the time it takes to import data.

{{site.data.alerts.callout_info}}
You can split the data into **more** files than you have nodes. CockroachDB will process the files in parallel across the cluster. When splitting the data Cockroach Labs recommends splitting it into a multiple of the number of nodes in your cluster, if possible. For example, if you have a 3 node cluster, split the dataset into 9, 27, or 300 files.

Cockroach Labs recommends keeping the files to a maximum file size of 4 GB unless the files are streamed (for example, [cloud storage locations]({% link {{ page.version.version }}/use-cloud-storage.md %}) will stream the data to CockroachDB), and to keep each file size similar across the dataset. For example, if you are importing a 9 GB dataset that was split into 3 files into a 3 node cluster, keep each file around 3 GB in size if possible. Don't split the data into two 4 GB files, and one 1 GB file.
{{site.data.alerts.end}}

For maximum performance each split file should be sorted within and across all files, meaning that if you were to sort the rows in each file there would be no overlapping data in any other file. For example, suppose your table has an alphabetic string primary key and you were importing the data into a 3 node cluster.

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE contacts (email STRING PRIMARY KEY, first_name TEXT, last_name TEXT);
~~~

You should split the files so that the first file contains rows where the [primary key]({% link {{ page.version.version }}/primary-key.md %}) begins with the letters "a" to "i," the second file "j" to "r," and the third file "s" to "z". No file should contain duplicate rows, and within each file the data is sorted alphabetically by the primary key.

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM contacts ORDER BY email;
~~~

~~~
                 email                |  first_name  |     last_name
--------------------------------------+--------------+--------------------
  aallabartonb6@google.co.uk          | Artemas      | Allabarton
  aantonijevicae@simplemachines.org   | Anselma      | Antonijevic
  abaakeo2@washington.edu             | Adolphus     | Baake
  abamellg0@edublogs.org              | Abey         | Bamell
  abasson3w@yelp.com                  | Anastasie    | Basson
  abilverstone1v@omniture.com         | Ajay         | Bilverstone
  ablackleyfe@craigslist.org          | Alberik      | Blackley
  aboutwelln4@msn.com                 | Anabella     | Boutwell
  abremner7j@narod.ru                 | Aveline      | Bremner
  abumpusby@opensource.org            | Ansel        | Bumpus
  acaesaref@fda.gov                   | Allyn        | Caesar
  acottamav@nymag.com                 | Alair        | Cottam
  adackei2@symantec.com               | Andrea       | Dacke
  adaenen@answers.com                 | Alessandra   | Daen
  adalgety1x@shinystat.com            | Aura         | Dalgety
  adenyukhinh2@examiner.com           | Arvy         | Denyukhin
...
~~~

### File storage during import

During migration, all of the features of [`IMPORT INTO`](import-into.html) that interact with external file storage assume that every node has the exact same view of that storage. In other words, in order to import from a file, every node needs to have the same access to that file.

If a node runs out of disk space while processing an import job, CockroachDB will pause the import job. Make sure each node has enough free disk space to process the file and store the data.

## Sort your data

Within each split file with your import data, sort the data based on how it will be stored in CockroachDB. For example, in the previous example where a dataset was partitioned by an alphabetic string primary key, within each split file the data should be sorted by the alphabetic primary key.

In tests performed by Cockroach Labs, the best import performance, measured in both throughput and overall time, was observed when data was split into multiple files and sorted within each file. Imports using an unsplit and unsorted dataset were about 16 times slower than imports using the same dataset with split and sorted files.

If you cannot both split and sort your dataset, the performance of either split or sorted data was similar, around 2 times slower than both split and sorted data, but still much faster than both unsplit and unsorted data.

## See also

- [`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %})
- [Migration Overview]({% link molt/migration-overview.md %})
- [Migrate from Oracle]({% link {{ page.version.version }}/migrate-from-oracle.md %})
- [Migrate from PostgreSQL]({% link molt/migrate-to-cockroachdb.md %})
- [Migrate from MySQL]({% link molt/migrate-to-cockroachdb.md %}?filters=mysql)
- [Migrate from CSV]({% link {{ page.version.version }}/migrate-from-csv.md %})
- [Migrate from Avro]({% link {{ page.version.version }}/migrate-from-avro.md %})
