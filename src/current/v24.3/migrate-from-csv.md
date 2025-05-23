---
title: Migrate from CSV
summary: Learn how to migrate data from CSV files into a CockroachDB cluster.
toc: true
docs_area: migrate
---

This page has instructions for migrating data from CSV files into CockroachDB using [`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %}).

The examples on this page use the [employees data set](https://github.com/datacharmer/test_db) that is also used in the [MySQL docs](https://dev.mysql.com/doc/employee/en/).

The examples pull real data from [Amazon S3](https://aws.amazon.com/s3/). They use the [employees data set](https://github.com/datacharmer/test_db) that is also used in the [MySQL docs](https://dev.mysql.com/doc/employee/en/), dumped as a set of CSV files.

{% include {{ page.version.version }}/misc/import-perf.md %}

## Step 1. Export data to CSV

Please refer to the documentation of your database for instructions on exporting data to CSV.

You will need to export one CSV file per table, with the following requirements:

- Files must be in [valid CSV format](https://tools.ietf.org/html/rfc4180), with the caveat that the delimiter must be a single character. To use a character other than comma (such as a tab), set a custom delimiter using the [`delimiter` option]({% link {{ page.version.version }}/import-into.md %}#import-options).
- Files must be UTF-8 encoded.
- If one of the following characters appears in a field, the field must be enclosed by double quotes:
    - delimiter (`,` by default)
    - double quote (`"`)
    - newline (`\n`)
    - carriage return (`\r`)
- If double quotes are used to enclose fields, then a double quote appearing inside a field must be escaped by preceding it with another double quote. For example: `"aaa","b""bb","ccc"`.
- If a column is of type [`BYTES`]({% link {{ page.version.version }}/bytes.md %}), it can either be a valid UTF-8 string or a [hex-encoded byte literal]({% link {{ page.version.version }}/sql-constants.md %}#hexadecimal-encoded-byte-array-literals) beginning with `\x`. For example, a field whose value should be the bytes `1`, `2` would be written as `\x0102`.

## Step 2. Host the files where the cluster can access them

Each node in the CockroachDB cluster needs to have access to the files being imported. There are several ways for the cluster to access the data; for more information on the types of storage [`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %}) can pull from, see the following:

- [Use Cloud Storage]({% link {{ page.version.version }}/use-cloud-storage.md %})
- [Use `userfile` Storage]({% link {{ page.version.version }}/use-userfile-storage.md %})
- [Use a Local File Server]({% link {{ page.version.version }}/use-a-local-file-server.md %})

{{site.data.alerts.callout_success}}
We strongly recommend using cloud storage such as Amazon S3 or Google Cloud to host the data files you want to import.
{{site.data.alerts.end}}

## Step 3. Import the CSV

You will need to write a [`CREATE TABLE`]({% link {{ page.version.version }}/create-table.md %}) statement that matches the schema of the table data you're importing.

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
- You will need to run [`ALTER TABLE ... ADD CONSTRAINT`]({% link {{ page.version.version }}/alter-table.md %}#add-constraint) to add any foreign key relationships.

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
To match the `nullif` setting, a CSV input value must be unquoted. For details, see [`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %}#import-options).
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

- `gzip`: Uses the [gzip](https://wikipedia.org/wiki/Gzip) algorithm to decompress the file.
- `bzip`: Uses the [bzip](https://wikipedia.org/wiki/Bzip2) algorithm to decompress the file.
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

- [`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %})
- [Import Performance Best Practices]({% link {{ page.version.version }}/import-performance-best-practices.md %})
- [Migrate from MySQL]({% link molt/migrate-to-cockroachdb.md %}?filters=mysql)
- [Migrate from PostgreSQL]({% link molt/migrate-to-cockroachdb.md %})
- [Back Up and Restore Data]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %})
- [Use the Built-in SQL Client]({% link {{ page.version.version }}/cockroach-sql.md %})
- [`cockroach` Commands Overview]({% link {{ page.version.version }}/cockroach-commands.md %})

{% comment %} Reference Links {% endcomment %}

[postgres]: migrate-from-postgres.html
[mysql]: migrate-from-mysql.html
