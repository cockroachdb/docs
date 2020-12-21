---
title: Migrate from MySQL
summary: Learn how to migrate data from MySQL into a CockroachDB cluster.
toc: true
---

This page has instructions for migrating data from MySQL to CockroachDB using [`IMPORT`](import.html)'s support for reading [`mysqldump`][mysqldump] files.

The examples below use the [employees data set](https://github.com/datacharmer/test_db) that is also used in the [MySQL docs](https://dev.mysql.com/doc/employee/en/).

{% include {{ page.version.version }}/misc/import-perf.md %}

## Considerations

In addition to the general considerations listed in the [Migration Overview](migration-overview.html), there is also the following MySQL-specific information to consider as you prepare your migration.

### String case sensitivity

MySQL strings are case-insensitive by default, but strings in CockroachDB are case-sensitive.  This means that you may need to edit your MySQL dump file to get the results you expect from CockroachDB.  For example, you may have been doing string comparisons in MySQL that will need to be changed to work with CockroachDB.

For more information about the case sensitivity of strings in MySQL, see [Case Sensitivity in String Searches](https://dev.mysql.com/doc/refman/8.0/en/case-sensitivity.html) from the MySQL documentation.  For more information about CockroachDB strings, see [`STRING`](string.html).

### `FIELD` function

The MYSQL `FIELD` function is not supported in CockroachDB. Instead, you can use the [`array_position`](functions-and-operators.html#array-functions) function, which returns the index of the first occurrence of element in the array.

Example usage:

{% include copy-clipboard.html %}
~~~ sql
> SELECT array_position(ARRAY[4,1,3,2],1);
~~~

~~~
  array_position
------------------
               2
(1 row)
~~~

While MYSQL returns 0 when the element is not found, CockroachDB returns `NULL`. So if you are using the `ORDER BY` clause in a statement with the `array_position` function, the caveat is that sort is applied even when the element is not found. As a workaround, you can use the [`COALESCE`](functions-and-operators.html#conditional-and-function-like-operators) operator.

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM table_a ORDER BY COALESCE(array_position(ARRAY[4,1,3,2],5),999);
~~~

## Step 1. Dump the MySQL database

There are several ways to dump data from MySQL to be imported into CockroachDB:

- [Dump the entire database](#dump-the-entire-database)
- [Dump one table at a time](#dump-one-table-at-a-time)

### Dump the entire database

Most users will want to import their entire MySQL database all at once, as shown below in [Import a full database dump](#import-a-full-database-dump).  To dump the entire database, run the [`mysqldump`][mysqldump] command shown below:

{% include copy-clipboard.html %}
~~~ shell
$ mysqldump -uroot employees > /tmp/employees-full.sql
~~~

If you only want to import one table from a database dump, see [Import a table from a full database dump](#import-a-table-from-a-full-database-dump) below.

### Dump one table at a time

To dump the `employees` table from a MySQL database also named `employees`, run the [`mysqldump`][mysqldump] command shown below.  You can import this table using the instructions in [Import a table from a table dump](#import-a-table-from-a-table-dump) below.

{% include copy-clipboard.html %}
~~~ shell
$ mysqldump -uroot employees employees > employees.sql
~~~

## Step 2. Host the files where the cluster can access them

Each node in the CockroachDB cluster needs to have access to the files being imported.  There are several ways for the cluster to access the data; for more information on the types of storage [`IMPORT`][import] can pull from,  see the following:

- [Use Cloud Storage for Bulk Operations](use-cloud-storage-for-bulk-operations.html)
- [Use a Local File Server for Bulk Operations](use-a-local-file-server-for-bulk-operations.html)

{{site.data.alerts.callout_success}}
We strongly recommend using cloud storage such as Amazon S3 or Google Cloud to host the data files you want to import.
{{site.data.alerts.end}}

## Step 3. Import the MySQL dump file

You can choose from several variants of the [`IMPORT`][import] statement, depending on whether you want to import an entire database or just one table:

- [Import a full database dump](#import-a-full-database-dump)
- [Import a table from a full database dump](#import-a-table-from-a-full-database-dump)
- [Import a table from a table dump](#import-a-table-from-a-table-dump)

All of the [`IMPORT`][import] statements in this section pull real data from [Amazon S3](https://aws.amazon.com/s3/) and will kick off background import jobs that you can monitor with [`SHOW JOBS`](show-jobs.html).

{% include {{ page.version.version }}/sql/use-import-into.md %}

### Import a full database dump

This example assumes you [dumped the entire database](#dump-the-entire-database).

The [`IMPORT`][import] statement below reads the data and [DDL](https://en.wikipedia.org/wiki/Data_definition_language) statements (including `CREATE TABLE` and [foreign key constraints](foreign-key.html)) from the full database dump.

{% include copy-clipboard.html %}
~~~ sql
> CREATE DATABASE IF NOT EXISTS employees;
> USE employees;
> IMPORT MYSQLDUMP 'https://s3-us-west-1.amazonaws.com/cockroachdb-movr/datasets/employees-db/mysqldump/employees-full.sql.gz';
~~~

~~~
       job_id       |  status   | fraction_completed |  rows   | index_entries | system_records |   bytes
--------------------+-----------+--------------------+---------+---------------+----------------+-----------
 382716507639906305 | succeeded |                  1 | 3919015 |        331636 |              0 | 110104816
(1 row)
~~~

### Import a table from a full database dump

This example assumes you [dumped the entire database](#dump-the-entire-database).

[`IMPORT`][import] can import one table's data from a full database dump.  It reads the data and applies any `CREATE TABLE` statements from the dump file.

{% include copy-clipboard.html %}
~~~ sql
> CREATE DATABASE IF NOT EXISTS employees;
> USE employees;
> IMPORT TABLE employees FROM MYSQLDUMP 'https://s3-us-west-1.amazonaws.com/cockroachdb-movr/datasets/employees-db/mysqldump/employees.sql.gz';
~~~

~~~
       job_id       |  status   | fraction_completed |  rows  | index_entries | system_records |  bytes
--------------------+-----------+--------------------+--------+---------------+----------------+----------
 383839294913871873 | succeeded |                  1 | 300024 |             0 |              0 | 11534293
(1 row)
~~~

### Import a table from a table dump

The examples below assume you [dumped one table](#dump-one-table-at-a-time).

The simplest way to import a table dump is to run [`IMPORT TABLE`][import] as shown below.  It reads the table data and any `CREATE TABLE` statements from the dump file.

{% include copy-clipboard.html %}
~~~ sql
> CREATE DATABASE IF NOT EXISTS employees;
> USE employees;
> IMPORT TABLE employees FROM MYSQLDUMP 'https://s3-us-west-1.amazonaws.com/cockroachdb-movr/datasets/employees-db/mysqldump/employees.sql.gz';
~~~

~~~
       job_id       |  status   | fraction_completed |  rows  | index_entries | system_records |  bytes   
--------------------+-----------+--------------------+--------+---------------+----------------+----------
 383855569817436161 | succeeded |                  1 | 300024 |             0 |              0 | 11534293
(1 row)
~~~

If you need to specify the table's columns for some reason, you can use an [`IMPORT TABLE`][import] statement like the one below, which will import data but ignore any `CREATE TABLE` statements in the dump file, instead relying on the columns you specify.

{% include copy-clipboard.html %}
~~~ sql
> CREATE DATABASE IF NOT EXISTS employees;
> USE employees;
> IMPORT TABLE employees (
    emp_no INT PRIMARY KEY,
    birth_date DATE NOT NULL,
    first_name STRING NOT NULL,
    last_name STRING NOT NULL,
    gender STRING NOT NULL,
    hire_date DATE NOT NULL
  )
  MYSQLDUMP DATA ('https://s3-us-west-1.amazonaws.com/cockroachdb-movr/datasets/employees-db/mysqldump/employees.sql.gz');
~~~

## Configuration Options

The following options are available to `IMPORT ... MYSQLDUMP`:

+ [Skip foreign keys](#skip-foreign-keys)

### Skip foreign keys

By default, [`IMPORT ... MYSQLDUMP`][import] supports foreign keys.  **Default: false**.  Add the `skip_foreign_keys` option to speed up data import by ignoring foreign key constraints in the dump file's DDL.  It will also enable you to import individual tables that would otherwise fail due to dependencies on other tables.

{{site.data.alerts.callout_info}}
The most common dependency issues are caused by unsatisfied foreign key relationships. You can avoid these issues by adding the `skip_foreign_keys` option to your `IMPORT` statement as needed. For more information, see the list of [import options](import.html#import-options).

For example, if you get the error message `pq: there is no unique constraint matching given keys for referenced table tablename`, use `IMPORT ... WITH skip_foreign_keys`.
{{site.data.alerts.end}}

Example usage:

{% include copy-clipboard.html %}
~~~ sql
> IMPORT MYSQLDUMP 's3://your-external-storage/employees.sql?AWS_ACCESS_KEY_ID=123&AWS_SECRET_ACCESS_KEY=456' WITH skip_foreign_keys;
~~~

[Foreign key constraints](foreign-key.html) can be added by using [`ALTER TABLE ... ADD CONSTRAINT`](add-constraint.html) commands after importing the data.

## See also

- [`IMPORT`](import.html)
- [Import Performance Best Practices](import-performance-best-practices.html)
- [Migrate from CSV][csv]
- [Migrate from Postgres][postgres]
- [Can a Postgres or MySQL application be migrated to CockroachDB?](frequently-asked-questions.html#can-a-postgresql-or-mysql-application-be-migrated-to-cockroachdb)
- [SQL Dump (Export)](cockroach-dump.html)
- [Back up Data](back-up-data.html)
- [Restore Data](restore-data.html)
- [Use the Built-in SQL Client](cockroach-sql.html)
- [Other Cockroach Commands](cockroach-commands.html)

<!-- Reference Links -->

[postgres]: migrate-from-postgres.html
[csv]: migrate-from-csv.html
[import]: import.html
[mysqldump]: https://dev.mysql.com/doc/refman/8.0/en/mysqldump-sql-format.html
