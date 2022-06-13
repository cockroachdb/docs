---
title: Migrate from Postgres
summary: Learn how to migrate data from Postgres into a CockroachDB cluster.
toc: true
---

This page has instructions for migrating data from Postgres to CockroachDB using [`IMPORT`][import]'s support for reading [`pg_dump`][pgdump] files.

The examples below pull real data from [Amazon S3](https://aws.amazon.com/s3/).  They use the [employees data set](https://github.com/datacharmer/test_db) that is also used in the [MySQL docs](https://dev.mysql.com/doc/employee/en/).  The data was imported to Postgres using [pgloader][pgloader], and then modified for use here as explained below.

{% include {{ page.version.version }}/misc/import-perf.md %}

## Step 1. Dump the Postgres database

There are several ways to dump data from Postgres to be imported into CockroachDB:

- [Dump the entire database](#dump-the-entire-database)
- [Dump one table at a time](#dump-one-table-at-a-time)

The import will fail if the dump file contains functions or type definitions.  In addition to calling [`pg_dump`][pgdump] as shown below, you may need to edit the dump file to remove functions and data types.

Also, note that CockroachDB's [`IMPORT`][import] does not support automatically importing data from Postgres' non-public [schemas][pgschema].  As a workaround, you can edit the dump file to change the table and schema names in the `CREATE TABLE` statements.

### Dump the entire database

Most users will want to import their entire Postgres database all at once, as shown below in [Import a full database dump](#import-a-full-database-dump).

To dump the entire database, run the [`pg_dump`][pgdump] command shown below.

{% include_cached copy-clipboard.html %}
~~~ shell
$ pg_dump employees > /tmp/employees-full.sql
~~~

For this data set, the Postgres dump file required the following edits, which have already been performed on the files used in the examples below:

- The type of the `employees.gender` column in the `CREATE TABLE` statement had to be changed from `employees.employees_gender` to [`STRING`](string.html) since Postgres represented the employee's gender using a [`CREATE TYPE`](https://www.postgresql.org/docs/10/static/sql-createtype.html) statement that is not supported by CockroachDB.

- A `CREATE TYPE employee ...` statement needed to be removed.

If you only want to import one table from a database dump, see [Import a table from a full database dump](#import-a-table-from-a-full-database-dump) below.

### Dump one table at a time

To dump the `employees` table from a Postgres database also named `employees`, run the [`pg_dump`][pgdump] command shown below.  You can import this table using the instructions in [Import a table from a table dump](#import-a-table-from-a-table-dump) below.

{% include_cached copy-clipboard.html %}
~~~ shell
$ pg_dump -t employees  employees > /tmp/employees.sql
~~~

For this data set, the Postgres dump file required the following edits, which have already been performed on the files used in the examples below.

- The type of the `employees.gender` column in the `CREATE TABLE` statement had to be changed from `employees.employees_gender` to [`STRING`](string.html) since Postgres represented the employee's gender using a [`CREATE TYPE`](https://www.postgresql.org/docs/10/static/sql-createtype.html) statement that is not supported by CockroachDB.

## Step 2. Host the files where the cluster can access them

Each node in the CockroachDB cluster needs to have access to the files being imported. There are several ways for the cluster to access the data; for more information on the types of storage [`IMPORT`](import.html) can pull from, see the following:

- [Use Cloud Storage for Bulk Operations](use-cloud-storage-for-bulk-operations.html)
- [Use a Local File Server for Bulk Operations](use-a-local-file-server-for-bulk-operations.html)

{{site.data.alerts.callout_success}}
We strongly recommend using cloud storage such as Amazon S3 or Google Cloud to host the data files you want to import.
{{site.data.alerts.end}}

## Step 3. Import the Postgres dump file

You can choose from several variants of the [`IMPORT`][import] statement, depending on whether you want to import a full database or a single table:

- [Import a full database dump](#import-a-full-database-dump)
- [Import a table from a full database dump](#import-a-table-from-a-full-database-dump)
- [Import a table from a table dump](#import-a-table-from-a-table-dump)

Note that all of the [`IMPORT`][import] statements in this section pull real data from [Amazon S3](https://aws.amazon.com/s3/) and will kick off background import jobs that you can monitor with [`SHOW JOBS`](show-jobs.html).

{% include {{ page.version.version }}/sql/use-import-into.md %}

### Import a full database dump

This example assumes you [dumped the entire database](#dump-the-entire-database).

The [`IMPORT`][import] statement below reads the data and [DDL](https://en.wikipedia.org/wiki/Data_definition_language) statements (including existing foreign key relationships) from the full database dump file.

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT PGDUMP 'https://s3-us-west-1.amazonaws.com/cockroachdb-movr/datasets/employees-db/pg_dump/employees-full.sql.gz' WITH ignore_unsupported_statements;
~~~

~~~
       job_id       |  status   | fraction_completed |  rows  | index_entries | system_records |  bytes
--------------------+-----------+--------------------+--------+---------------+----------------+----------
 381845110403104769 | succeeded |                  1 | 300024 |             0 |              0 | 11534293
(1 row)
~~~

### Import a table from a full database dump

This example assumes you [dumped the entire database](#dump-the-entire-database).

[`IMPORT`][import] can import one table's data from a full database dump.  It reads the data and applies any `CREATE TABLE` statements from the file.

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE DATABASE IF NOT EXISTS employees;
> USE employees;
> IMPORT TABLE employees FROM PGDUMP 'https://s3-us-west-1.amazonaws.com/cockroachdb-movr/datasets/employees-db/pg_dump/employees-full.sql.gz' WITH ignore_unsupported_statements;
~~~

~~~
       job_id       |  status   | fraction_completed |  rows  | index_entries | system_records |  bytes
--------------------+-----------+--------------------+--------+---------------+----------------+----------
 383839294913871873 | succeeded |                  1 | 300024 |             0 |              0 | 11534293
(1 row)
~~~

### Import a table from a table dump

The examples below assume you [dumped one table](#dump-one-table-at-a-time).

The simplest way to import a table dump is to run [`IMPORT TABLE`][import] as shown below.  It reads the table data and any `CREATE TABLE` statements from the file.

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE DATABASE IF NOT EXISTS employees;
> USE employees;
> IMPORT PGDUMP 'https://s3-us-west-1.amazonaws.com/cockroachdb-movr/datasets/employees-db/pg_dump/employees.sql.gz' WITH ignore_unsupported_statements;
~~~

~~~
       job_id       |  status   | fraction_completed |  rows  | index_entries | system_records |  bytes   
--------------------+-----------+--------------------+--------+---------------+----------------+----------
 383855569817436161 | succeeded |                  1 | 300024 |             0 |              0 | 11534293
(1 row)
~~~

If you need to specify the table's columns for some reason, you can use an [`IMPORT TABLE`][import] statement like the one below, which will import data but ignore any `CREATE TABLE` statements in the file, instead relying on the columns you specify.

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT TABLE employees (
    emp_no INT PRIMARY KEY,
    birth_date DATE NOT NULL,
    first_name STRING NOT NULL,
    last_name STRING NOT NULL,
    gender STRING NOT NULL,
    hire_date DATE NOT NULL
  )
  PGDUMP DATA ('https://s3-us-west-1.amazonaws.com/cockroachdb-movr/datasets/employees-db/pg_dump/employees.sql.gz') WITH ignore_unsupported_statements;
~~~

## Configuration Options

The following options are available to `IMPORT ... PGDUMP`:

+ [Max row size](#max-row-size)
+ {% include_cached new-in.html version="v21.1" %} [Row limit](#row-limit)
+ {% include_cached new-in.html version="v21.1" %} [Ignore unsupported statements](#ignore-unsupported-statements)
+ {% include_cached new-in.html version="v21.1" %} [Log unsupported statements](#log-unsupported-statements)
+ [Skip foreign keys](#skip-foreign-keys)

### Max row size

The `max_row_size` option is used to override limits on line size.  **Default: 0.5MB**.  This setting may need to be tweaked if your Postgres dump file has extremely long lines, for example as part of a `COPY` statement.

Example usage:

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT TABLE employees (
    emp_no INT PRIMARY KEY,
    birth_date DATE NOT NULL,
    first_name STRING NOT NULL,
    last_name STRING NOT NULL,
    gender STRING NOT NULL,
    hire_date DATE NOT NULL
  )
  PGDUMP DATA ('s3://your-external-storage/employees.sql?AWS_ACCESS_KEY_ID=123&AWS_SECRET_ACCESS_KEY=456') WITH max_row_size = '5MB';
~~~

### Row limit

{% include_cached new-in.html version="v21.1" %} The `row_limit` option determines the number of rows to import. If you are importing one table, setting `row_limit = 'n'` will import the first *n* rows of the table. If you are importing an entire database, this option will import the first *n* rows from each table in the dump file. It is useful for finding errors quickly before executing a more time- and resource-consuming import.

Example usage:

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT PGDUMP 's3://your-external-storage/employees.sql?AWS_ACCESS_KEY_ID=123&AWS_SECRET_ACCESS_KEY=456' WITH row_limit = '10';
~~~

### Ignore unsupported statements

{% include_cached new-in.html version="v21.1" %} The [`ignore_unsupported_statements` option](import.html#import-options) specifies whether the import will ignore unsupported statements in the `PGDUMP` file. **Default: false**.

If `ignore_unsupported_statements` is omitted, the import will fail if it encounters a statement that is unsupported by CockroachDB. Use `ignore_unsupported_statements` with `log_ignored_statements` to log unsupported statements.

Example usage:

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT PGDUMP 's3://your-external-storage/employees.sql?AWS_ACCESS_KEY_ID=123&AWS_SECRET_ACCESS_KEY=456' WITH ignore_unsupported_statements;
~~~

### Log unsupported statements

{% include_cached new-in.html version="v21.1" %} The `log_ignored_statements` option is used with the `ignore_unsupported_statements` option to log unsupported statements in the `PGDUMP` file to specified a destination file.

Example usage:

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT PGDUMP 's3://your-external-storage/employees.sql?AWS_ACCESS_KEY_ID=123&AWS_SECRET_ACCESS_KEY=456' WITH ignore_unsupported_statements, log_ignored_statements='userfile://defaultdb.public.userfiles_root/unsupported-statements.log';
~~~

### Skip foreign keys

By default, [`IMPORT ... PGDUMP`][import] supports foreign keys.  **Default: false**.  Add the `skip_foreign_keys` option to speed up data import by ignoring foreign key constraints in the dump file's DDL.  It will also enable you to import individual tables that would otherwise fail due to dependencies on other tables.

{{site.data.alerts.callout_info}}
The most common dependency issues are caused by unsatisfied foreign key relationships. You can avoid these issues by adding the `skip_foreign_keys` option to your `IMPORT` statement as needed. For more information, see the list of [import options](import.html#import-options).

For example, if you get the error message `pq: there is no unique constraint matching given keys for referenced table tablename`, use `IMPORT ... WITH skip_foreign_keys`.
{{site.data.alerts.end}}

Example usage:

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT TABLE employees (
    emp_no INTEGER PRIMARY KEY,
    birth_date DATE NOT NULL,
    first_name STRING NOT NULL,
    last_name STRING NOT NULL,
    gender STRING NOT NULL,
    hire_date DATE NOT NULL
  ) PGDUMP DATA ('s3://your-external-storage/employees.sql?AWS_ACCESS_KEY_ID=123&AWS_SECRET_ACCESS_KEY=456') WITH skip_foreign_keys;
~~~

[Foreign key constraints](foreign-key.html) can be added by using [`ALTER TABLE ... ADD CONSTRAINT`](add-constraint.html) commands after importing the data.

## See also

- [`IMPORT`][import]
- [Import Performance Best Practices](import-performance-best-practices.html)
- [Migrate from CSV][csv]
- [Migrate from MySQL][mysql]
- [Can a Postgres or MySQL application be migrated to CockroachDB?](frequently-asked-questions.html#can-a-postgresql-or-mysql-application-be-migrated-to-cockroachdb)
- [SQL Dump (Export)](cockroach-dump.html)
- [Back up Data](take-full-and-incremental-backups.html)
- [Restore Data](take-full-and-incremental-backups.html)
- [Use the Built-in SQL Client](cockroach-sql.html)
- [Other Cockroach Commands](cockroach-commands.html)

<!-- Reference Links -->

[csv]: migrate-from-csv.html
[mysql]: migrate-from-mysql.html
[import]: import.html
[pgdump]: https://www.postgresql.org/docs/current/static/app-pgdump.html
[postgres]: migrate-from-postgres.html
[pgschema]: https://www.postgresql.org/docs/current/static/ddl-schemas.html
[pgloader]: https://pgloader.io/

<!-- Notes

These instructions were prepared with the following versions:

- Postgres 10.5

- CockroachDB CCL v2.2.0-alpha.00000000-757-gb33c49ff73
  (x86_64-apple-darwin16.7.0, built 2018/09/12 19:30:43, go1.10.3)
  (built from master on Wednesday, September 12, 2018)

- /usr/local/bin/mysql Ver 14.14 Distrib 5.7.22, for osx10.12 (x86_64)
  using EditLine wrapper

-->
