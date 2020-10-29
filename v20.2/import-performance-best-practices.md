---
title: Import Performance Best Practices
summary: Best practices for optimizing import performance in CockroachDB.
toc: true
---

This page provides best practices for optimizing [import](import.html) performance in CockroachDB.

Import speed primarily depends on the amount of data the you want to import. However, there are two main factors that have can have a large impact on the amount of time it will take to run an import:

- [Splitting data](#split-your-data-into-multiple-files)
- [Import format](#choose-a-performant-import-format)

{{site.data.alerts.callout_info}}
If the import size is small, then you do not need to do anything to optimize performance. In this case, the import should run quickly, regardless of the settings.
{{site.data.alerts.end}}

## Split your data into multiple files

Splitting the import data into multiple files can have a large impact on the import performance. The following formats support multi-file import:

- `CSV`
- `DELIMITED DATA`
- `AVRO`, when the [schema is provided in-line](#provide-the-table-schema-in-line)

For these formats, we recommend splitting your data into as many files as there are nodes.

For example, if you have a 3-node cluster, split your data into 3 files and [import](import.html):

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (
        id UUID PRIMARY KEY,
        name TEXT,
        INDEX name_idx (name)
)
CSV DATA (
    'https://s3-us-west-1.amazonaws.com/cockroachdb-movr/datasets/employees-db/pg_dump/customers.csv',
    'https://s3-us-west-1.amazonaws.com/cockroachdb-movr/datasets/employees-db/pg_dump/customers_2.csv',
    'https://s3-us-west-1.amazonaws.com/cockroachdb-movr/datasets/employees-db/pg_dump/customers_3.csv',
);
~~~

CockroachDB imports the files that you give it, and does not further split them. For example, if you import one large file for all of your data, CockroachDB will process that file on one node– even if you have more nodes available. However, if you import two files (and your cluster has at least two nodes), each node will process a file in parallel. This is why splitting your data into as many files as you have nodes will dramatically decrease the time it takes to import data.

{{site.data.alerts.callout_info}}
If you split the data into _more_ files than you have nodes, it will not have a large impact on performance.
{{site.data.alerts.end}}

## Choose a performant import format

Import formats do not have the same performance because of the way they are processed. Below, import formats are listed from fastest to slowest:

1. [`CSV`](migrate-from-csv.html) or [`DELIMITED DATA`](import.html#delimited-data-files) (both have about the same import performance)
1. [`AVRO`](migrate-from-avro.html)
1. [`MYSQLDUMP`](migrate-from-mysql.html)
1. [`PGDUMP`](migrate-from-postgres.html)

We recommend formatting your import files as `CSV`, `DELIMITED DATA`, or `AVRO`. These formats can be processed in parallel by multiple threads, which increases performance.

However, `MYSQLDUMP` and `PGDUMP` run a single thread to parse their data, and therefore have substantially slower performance.

`MYSQLDUMP` and `PGDUMP` are two examples of "bundled" data. This means that the dump file contains both the table schema and the data to import. These formats are the slowest to import, with `PGDUMP` being the slower of the two. This is because CockroachDB has to first load the whole file, read the whole file to get the schema, create the table with that schema, and then import the data. While these formats are slow, there are a couple of things you can do to speed up a bundled data import:

- [Provide the table schema in-line](#provide-the-table-schema-in-line)
- [Import the schema separately from the data](#import-the-schema-separately-from-the-data)

### Provide the table schema in-line

When importing bundled data formats, it is often faster to provide schema for the imported table in-line. For example, instead of importing both the table schema and data from the same file:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE employees
FROM PGDUMP
    'https://s3-us-west-1.amazonaws.com/cockroachdb-movr/datasets/employees-db/pg_dump/employees-full.sql'
;
~~~

You can dump the table data into a CSV file and provide the table schema in the statement:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE employees (
        id UUID PRIMARY KEY,
        name STRING
)
CSV DATA (
    'https://s3-us-west-1.amazonaws.com/cockroachdb-movr/datasets/employees-db/pg_dump/employees-full.csv'
);
~~~

{{site.data.alerts.callout_success}}
If you need to import multiple tables, you can start multiple [`IMPORT`](import.html) jobs to import tables in parallel from the same import file.
{{site.data.alerts.end}}

### Import the schema separately from the data

For single-table `MYSQLDUMP` or `PGDUMP` imports, split your dump data into two files:

1. A SQL file containing the table schema
1. A CSV file containing the table data

Then, import the schema-only file:

~~~ sql
> IMPORT TABLE customers
FROM PGDUMP
    'https://s3-us-west-1.amazonaws.com/cockroachdb-movr/datasets/employees-db/pg_dump/customers.sql'
;
~~~

And use the [`IMPORT INTO`](import-into.html) statement to import the CSV data into the newly created table:

~~~ sql
> IMPORT INTO customers (id, name)
CSV DATA (
    'https://s3-us-west-1.amazonaws.com/cockroachdb-movr/datasets/employees-db/pg_dump/customers.csv'
);
~~~

This method has the added benefit of alerting on potential issues with the import sooner; that is, you will not have to wait for the file to load both the schema and data just to find an error in the schema.

## See also

- [`IMPORT`](import.html)
- [Migration Overview](migration-overview.html)
- [Migrate from Oracle](migrate-from-oracle.html)
- [Migrate from Postgres](migrate-from-postgres.html)
- [Migrate from MySQL](migrate-from-mysql.html)
- [Migrate from CSV](migrate-from-csv.html)
- [Migrate from Avro](migrate-from-avro.html)
