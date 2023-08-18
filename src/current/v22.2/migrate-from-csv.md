---
title: Migrate from CSV
summary: Learn how to migrate data from CSV files into a CockroachDB cluster.
toc: true
docs_area: migrate
---

This page has instructions for migrating data from CSV files into CockroachDB using [`IMPORT INTO`](import-into.html).

The examples on this page use the [employees data set](https://github.com/datacharmer/test_db) that is also used in the [MySQL docs](https://dev.mysql.com/doc/employee/en/).

The examples pull real data from [Amazon S3](https://aws.amazon.com/s3/). They use the [employees data set](https://github.com/datacharmer/test_db) that is also used in the [MySQL docs](https://dev.mysql.com/doc/employee/en/), dumped as a set of CSV files.

{% include {{ page.version.version }}/misc/import-perf.md %}

{% include {{ page.version.version }}/import-table-deprecate.md %}

## Step 1. Export data to CSV

Refer to the documentation of your database for instructions on exporting data to CSV.

{% include {{ page.version.version }}/sql/export-csv-tsv.md %}

## Step 2. Host the files where the cluster can access them

Each node in the CockroachDB cluster needs to have access to the files being imported. There are several ways for the cluster to access the data; for more information on the types of storage [`IMPORT INTO`](import-into.html) can pull from, see the following:

- [Use Cloud Storage](use-cloud-storage.html)
- [Use `userfile` Storage](use-userfile-storage.html)
- [Use a Local File Server](use-a-local-file-server.html)

{{site.data.alerts.callout_success}}
We strongly recommend using cloud storage such as Amazon S3 or Google Cloud to host the data files you want to import.
{{site.data.alerts.end}}

## Step 3. Import the CSV

You will need to write a [`CREATE TABLE`](create-table.html) statement that matches the schema of the table data you're importing.

For example, to import the data from `employees.csv` into an `employees` table, issue the following statement to create the table:

{% include_cached copy-clipboard.html %}
~~~sql
CREATE TABLE employees (
  emp_no INT PRIMARY KEY,
  birth_date DATE NOT NULL,
  first_name STRING NOT NULL,
  last_name STRING NOT NULL,
  gender STRING NOT NULL,
  hire_date DATE NOT NULL
      );
~~~

Next, use `IMPORT INTO` to import the data into the new table:

{% include_cached copy-clipboard.html %}
~~~sql
IMPORT INTO employees (emp_no, birth_date, first_name, last_name, gender, hire_date)
     CSV DATA (
       'https://s3-us-west-1.amazonaws.com/cockroachdb-movr/datasets/employees-db/csv/employees.csv.gz'
     );
~~~

~~~
       job_id       |  status   | fraction_completed |  rows  | index_entries | system_records |  bytes   
--------------------+-----------+--------------------+--------+---------------+----------------+----------
 381866942129111041 | succeeded |                  1 | 300024 |             0 |              0 | 13258389
(1 row)
~~~

Repeat this process for each CSV file you want to import.

Before importing CSV data, consider the following:

- The column order in your schema must match the column order in the file being imported.
- You will need to run [`ALTER TABLE ... ADD CONSTRAINT`](alter-table.html#add-constraint) to add any foreign key relationships.

## Configuration Options

The following options are available to [`IMPORT ... CSV`][import]:

- [Column delimiter](#column-delimiter)
- [Comment syntax](#comment-syntax)
- [Skip header rows](#skip-header-rows)
- [Null strings](#null-strings)
- [File compression](#file-compression)

### Column delimiter

The `delimiter` option is used to set the Unicode character that marks where each column ends. **Default:** `,`.

Example usage:

{% include_cached copy-clipboard.html %}
~~~sql
IMPORT INTO employees (emp_no, birth_date, first_name, last_name, gender, hire_date)
     CSV DATA (
       'https://s3-us-west-1.amazonaws.com/cockroachdb-movr/datasets/employees-db/csv/employees.csv.gz')
        WITH delimiter = e'\t';
~~~

### Comment syntax

The `comment` option determines which Unicode character marks the rows in the data to be skipped.

Example usage:

{% include_cached copy-clipboard.html %}
~~~sql
IMPORT INTO employees (emp_no, birth_date, first_name, last_name, gender, hire_date)
     CSV DATA (
       'https://s3-us-west-1.amazonaws.com/cockroachdb-movr/datasets/employees-db/csv/employees.csv.gz')
        WITH comment = '#';
~~~

### Skip header rows

The `skip` option determines the number of header rows to skip when importing a file.

Example usage:

{% include_cached copy-clipboard.html %}
~~~sql
IMPORT INTO employees (emp_no, birth_date, first_name, last_name, gender, hire_date)
     CSV DATA (
       'https://s3-us-west-1.amazonaws.com/cockroachdb-movr/datasets/employees-db/csv/employees.csv.gz')
        WITH skip = '2';
~~~

### Null strings

The `nullif` option specifies a column value that should be converted to `NULL`. 

{{site.data.alerts.callout_info}}
To match the `nullif` setting, a CSV input value must be unquoted. For details, see [`IMPORT INTO`](import-into.html#import-options).
{{site.data.alerts.end}}

Example usage:

{% include_cached copy-clipboard.html %}
~~~sql
IMPORT INTO employees (emp_no, birth_date, first_name, last_name, gender, hire_date)
     CSV DATA (
       'https://s3-us-west-1.amazonaws.com/cockroachdb-movr/datasets/employees-db/csv/employees.csv.gz')
        WITH nullif = '';
~~~

### File compression

The `compress` option defines which decompression codec should be used on the CSV file to be imported. Options include:

- `gzip`: Uses the [gzip](https://en.wikipedia.org/wiki/Gzip) algorithm to decompress the file.
- `bzip`: Uses the [bzip](https://en.wikipedia.org/wiki/Bzip2) algorithm to decompress the file.
- `none`: Disables decompression.
- `auto`: **Default**. Guesses based on file extension ('none' for `.csv`, 'gzip' for `.gz`, 'bzip' for `.bz` and `.bz2`).

Example usage:

{% include_cached copy-clipboard.html %}
~~~sql
IMPORT INTO employees (emp_no, birth_date, first_name, last_name, gender, hire_date)
     CSV DATA (
       'https://s3-us-west-1.amazonaws.com/cockroachdb-movr/datasets/employees-db/csv/employees.csv.gz')
        WITH compress = 'gzip';
~~~

## See also

- [`IMPORT`][import]
- [Import Performance Best Practices](import-performance-best-practices.html)
- [Migrate from MySQL][mysql]
- [Migrate from PostgreSQL][postgres]
- [Back Up and Restore Data](take-full-and-incremental-backups.html)
- [Use the Built-in SQL Client](cockroach-sql.html)
- [`cockroach` Commands Overview](cockroach-commands.html)

<!-- Reference Links -->

[postgres]: migrate-from-postgres.html
[mysql]: migrate-from-mysql.html
[import]: import.html
