---
title: Migrate from CSV
summary: Learn how to migrate data from CSV files into a CockroachDB cluster.
toc: true
---

This page has instructions for migrating data from CSV files into CockroachDB using [`IMPORT`][import].

The examples below use the [employees data set](https://github.com/datacharmer/test_db) that is also used in the [MySQL docs](https://dev.mysql.com/doc/employee/en/).

The examples below pull real data from [Amazon S3](https://aws.amazon.com/s3/).  They use the [employees data set](https://github.com/datacharmer/test_db) that is also used in the [MySQL docs](https://dev.mysql.com/doc/employee/en/), dumped as a set of CSV files.

{% include {{ page.version.version }}/misc/import-perf.md %}

## Step 1. Export data to CSV

Please refer to the documentation of your database for instructions on exporting data to CSV.

You will need to export one CSV file per table, with the following requirements:

- Files must be in [valid CSV format](https://tools.ietf.org/html/rfc4180), with the caveat that the delimiter must be a single character.  To use a character other than comma (such as a tab), set a custom delimiter using the [`delimiter` option](import.html#delimiter).
- Files must be UTF-8 encoded.
- If one of the following characters appears in a field, the field must be enclosed by double quotes:
    - delimiter (`,` by default)
    - double quote (`"`)
    - newline (`\n`)
    - carriage return (`\r`)
- If double quotes are used to enclose fields, then a double quote appearing inside a field must be escaped by preceding it with another double quote.  For example: `"aaa","b""bb","ccc"`
- If a column is of type [`BYTES`](bytes.html), it can either be a valid UTF-8 string or a [hex-encoded byte literal](sql-constants.html#hexadecimal-encoded-byte-array-literals) beginning with `\x`. For example, a field whose value should be the bytes `1`, `2` would be written as `\x0102`.

## Step 2. Host the files where the cluster can access them

Each node in the CockroachDB cluster needs to have access to the files being imported. There are several ways for the cluster to access the data; for more information on the types of storage [`IMPORT`][import] can pull from, see the following:

- [Use Cloud Storage for Bulk Operations](use-cloud-storage-for-bulk-operations.html)
- [Use a Local File Server for Bulk Operations](use-a-local-file-server-for-bulk-operations.html)

{{site.data.alerts.callout_success}}
We strongly recommend using cloud storage such as Amazon S3 or Google Cloud to host the data files you want to import.
{{site.data.alerts.end}}

## Step 3. Import the CSV

You will need to write an [`IMPORT TABLE`][import] statement that matches the schema of the table data you're importing.

For example, to import the data from `employees.csv` into an `employees` table, issue the following statement:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE employees (
    emp_no INT PRIMARY KEY,
    birth_date DATE NOT NULL,
    first_name STRING NOT NULL,
    last_name STRING NOT NULL,
    gender STRING NOT NULL,
    hire_date DATE NOT NULL
  ) CSV DATA ('https://s3-us-west-1.amazonaws.com/cockroachdb-movr/datasets/employees-db/csv/employees.csv.gz');
~~~

~~~
       job_id       |  status   | fraction_completed |  rows  | index_entries | system_records |  bytes   
--------------------+-----------+--------------------+--------+---------------+----------------+----------
 381866942129111041 | succeeded |                  1 | 300024 |             0 |              0 | 13258389
(1 row)
~~~

Repeat the above for each CSV file you want to import.

{% include {{ page.version.version }}/sql/use-import-into.md %}

{{site.data.alerts.callout_info}}
You will need to run [`ALTER TABLE ... ADD CONSTRAINT`](add-constraint.html) to add any foreign key relationships.
{{site.data.alerts.end}}

## Configuration Options

The following options are available to [`IMPORT ... CSV`][import]:

+ [Column delimiter](#column-delimiter)
+ [Comment syntax](#comment-syntax)
+ [Skip header rows](#skip-header-rows)
+ [Null strings](#null-strings)
+ [File compression](#file-compression)

### Column delimiter

The `delimiter` option is used to set the Unicode character that marks where each column ends.  **Default: `,`**.

Example usage:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE employees (
    emp_no INT PRIMARY KEY,
    birth_date DATE NOT NULL,
    first_name STRING NOT NULL,
    last_name STRING NOT NULL,
    gender STRING NOT NULL,
    hire_date DATE NOT NULL
  )
  CSV DATA ('s3://acme-co/employees.csv?AWS_ACCESS_KEY_ID=123&AWS_SECRET_ACCESS_KEY=456')
        WITH delimiter = e'\t';
~~~

### Comment syntax

The `comment` option determines which Unicode character marks the rows in the data to be skipped.

Example usage:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE employees (
    emp_no INT PRIMARY KEY,
    birth_date DATE NOT NULL,
    first_name STRING NOT NULL,
    last_name STRING NOT NULL,
    gender STRING NOT NULL,
    hire_date DATE NOT NULL
  )
  CSV DATA ('s3://acme-co/employees.csv?AWS_ACCESS_KEY_ID=123&AWS_SECRET_ACCESS_KEY=456')
        WITH comment = '#';
~~~

### Skip header rows

The `skip` option determines the number of header rows to skip when importing a file.

Example usage:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE employees (
    emp_no INT PRIMARY KEY,
    birth_date DATE NOT NULL,
    first_name STRING NOT NULL,
    last_name STRING NOT NULL,
    gender STRING NOT NULL,
    hire_date DATE NOT NULL
  )
  CSV DATA ('s3://acme-co/employees.csv?AWS_ACCESS_KEY_ID=123&AWS_SECRET_ACCESS_KEY=456')
        WITH skip = '2';
~~~

### Null strings

The `nullif` option defines which string should be converted to `NULL`.

Example usage:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE employees (
    emp_no INT PRIMARY KEY,
    birth_date DATE NOT NULL,
    first_name STRING NOT NULL,
    last_name STRING NOT NULL,
    gender STRING NOT NULL,
    hire_date DATE NOT NULL
  )
  CSV DATA ('s3://acme-co/employees.csv?AWS_ACCESS_KEY_ID=123&AWS_SECRET_ACCESS_KEY=456')
        WITH nullif = '';
~~~

### File compression

The `compress` option defines which decompression codec should be used on the CSV file to be imported.  Options include:

+ `gzip`: Uses the [gzip](https://en.wikipedia.org/wiki/Gzip) algorithm to decompress the file.
+ `bzip`: Uses the [bzip](https://en.wikipedia.org/wiki/Bzip2) algorithm to decompress the file.
+ `none`: Disables decompression.
+ `auto`: **Default**. Guesses based on file extension ('none' for `.csv`, 'gzip' for `.gz`, 'bzip' for `.bz` and `.bz2`).

Example usage:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT TABLE employees (
    emp_no INT PRIMARY KEY,
    birth_date DATE NOT NULL,
    first_name STRING NOT NULL,
    last_name STRING NOT NULL,
    gender STRING NOT NULL,
    hire_date DATE NOT NULL
  )
  CSV DATA ('s3://acme-co/employees.csv.gz?AWS_ACCESS_KEY_ID=123&AWS_SECRET_ACCESS_KEY=456')
        WITH compress = 'gzip';
~~~

## See also

- [`IMPORT`][import]
- [Import Performance Best Practices](import-performance-best-practices.html)
- [Migrate from MySQL][mysql]
- [Migrate from Postgres][postgres]
- [SQL Dump (Export)](cockroach-dump.html)
- [Back Up and Restore Data](backup-and-restore.html)
- [Use the Built-in SQL Client](cockroach-sql.html)
- [Other Cockroach Commands](cockroach-commands.html)

<!-- Reference Links -->

[postgres]: migrate-from-postgres.html
[mysql]: migrate-from-mysql.html
[import]: import.html
