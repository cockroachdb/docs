---
title: Online Schema Changes
summary: Update table schemas without external tools or downtime.
toc: true
---

CockroachDB's online schema changes provide a simple way to update a table schema without imposing any negative consequences on an application — including downtime. The schema change engine is a built-in feature requiring no additional tools, resources, or ad hoc sequencing of operations.

Benefits of online schema changes include:

- Changes to your table schema happen while the database is running.
- The schema change runs as a [background job][show-jobs] without holding locks on the underlying table data.
- Your application's queries can run normally, with no effect on read/write latency. The schema is cached for performance.
- Your data is kept in a safe, [consistent][consistent] state throughout the entire schema change process.

{{site.data.alerts.callout_danger}}
Schema changes consume additional resources, and if they are run when the cluster is near peak capacity, latency spikes can occur. This is especially true for any schema change that adds columns, drops columns, or adds an index. We do not recommend doing more than one schema change at a time while in production.
{{site.data.alerts.end}}

{{site.data.alerts.callout_success}}
Support for schema changes within [transactions][txns] is [limited](#limitations). We recommend doing schema changes outside transactions where possible. When a schema management tool uses transactions on your behalf, we recommend only doing one schema change operation per transaction.
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
You cannot start an online schema change on a table if a [primary key change](alter-primary-key.html) is currently in progress on the same table.
{{site.data.alerts.end}}

## How online schema changes work

At a high level, online schema changes are accomplished by using a bridging strategy involving concurrent uses of multiple versions of the schema. The process is as follows:

1. A user initiates a schema change by executing [`ALTER TABLE`][alter-table], [`CREATE INDEX`][create-index], [`TRUNCATE`][truncate], etc.

2. The schema change engine converts the original schema to the new schema in discrete steps while ensuring that the underlying table data is always in a consistent state. These changes are executed as a [background job][show-jobs], and can be [paused](pause-job.html), [resumed](resume-job.html), and [canceled](cancel-job.html).

This approach allows the schema change engine to roll out a new schema while the previous version is still in use. It then backfills or deletes the underlying table data as needed in the background, while the cluster is still running and servicing reads and writes from your application.

During the backfilling process, the schema change engine updates the underlying table data to make sure all instances of the table are stored according to the requirements of the new schema.

Once backfilling is complete, all nodes will switch over to the new schema, and will allow reads and writes of the table using the new schema.

For more technical details, see [How online schema changes are possible in CockroachDB][blog].

{{site.data.alerts.callout_info}}
If a schema change fails, the schema change job will be cleaned up automatically. However, there are limitations with rolling back schema changes within a transaction; for more information, [see below](#schema-change-ddl-statements-inside-a-multi-statement-transaction-can-fail-while-other-statements-succeed).
{{site.data.alerts.end}}

## Examples

{{site.data.alerts.callout_success}}
For more examples of schema change statements, see the [`ALTER TABLE`][alter-table] subcommands.
{{site.data.alerts.end}}

### Run schema changes inside a transaction with `CREATE TABLE`

As noted in [Limitations](#limitations), you cannot run schema changes inside transactions in general.

However, as of version v2.1, you can run schema changes inside the same transaction as a [`CREATE TABLE`][create-table] statement. For example:

{% include copy-clipboard.html %}
~~~ sql
> BEGIN;
  SAVEPOINT cockroach_restart;
  CREATE TABLE fruits (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name STRING,
        color STRING
    );
  INSERT INTO fruits (name, color) VALUES ('apple', 'red');
  ALTER TABLE fruits ADD COLUMN inventory_count INTEGER DEFAULT 5;
  ALTER TABLE fruits ADD CONSTRAINT name CHECK (name IN ('apple', 'banana', 'orange'));
  SELECT name, color, inventory_count FROM fruits;
  RELEASE SAVEPOINT cockroach_restart;
  COMMIT;
~~~

The transaction succeeds with the following output:

~~~
BEGIN
SAVEPOINT
CREATE TABLE
INSERT 0 1
ALTER TABLE
ALTER TABLE
+-------+-------+-----------------+
| name  | color | inventory_count |
+-------+-------+-----------------+
| apple | red   |               5 |
+-------+-------+-----------------+
(1 row)
COMMIT
COMMIT
~~~

### Run multiple schema changes in a single `ALTER TABLE` statement

As of v19.1, some schema changes can be used in combination in a single `ALTER TABLE` statement. For a list of commands that can be combined, see [`ALTER TABLE`](alter-table.html). For a demonstration, see [Add and rename columns atomically](rename-column.html#add-and-rename-columns-atomically).

### Show all schema change jobs

You can check on the status of the schema change jobs on your system at any time using the [`SHOW JOBS`][show-jobs] statement:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM [SHOW JOBS] WHERE job_type = 'SCHEMA CHANGE';
~~~

~~~
+--------------------+---------------+-----------------------------------------------------------------------------+-----------+-----------+----------------------------+----------------------------+----------------------------+----------------------------+--------------------+-------+----------------+
|             job_id | job_type      | description                                                                 | user_name | status    | created                    | started                    | finished                   | modified                   | fraction_completed | error | coordinator_id |
|--------------------+---------------+-----------------------------------------------------------------------------+-----------+-----------+----------------------------+----------------------------+----------------------------+----------------------------+--------------------+-------+----------------|
| 368863345707909121 | SCHEMA CHANGE | ALTER TABLE test.public.fruits ADD COLUMN inventory_count INTEGER DEFAULT 5 | root      | succeeded | 2018-07-26 20:55:59.698793 | 2018-07-26 20:55:59.739032 | 2018-07-26 20:55:59.816007 | 2018-07-26 20:55:59.816008 |                  1 |       | NULL           |
| 370556465994989569 | SCHEMA CHANGE | ALTER TABLE test.public.foo ADD COLUMN bar VARCHAR                          | root      | pending   | 2018-08-01 20:27:38.708813 | NULL                       | NULL                       | 2018-08-01 20:27:38.708813 |                  0 |       | NULL           |
| 370556522386751489 | SCHEMA CHANGE | ALTER TABLE test.public.foo ADD COLUMN bar VARCHAR                          | root      | pending   | 2018-08-01 20:27:55.830832 | NULL                       | NULL                       | 2018-08-01 20:27:55.830832 |                  0 |       | NULL           |
+--------------------+---------------+-----------------------------------------------------------------------------+-----------+-----------+----------------------------+----------------------------+----------------------------+----------------------------+--------------------+-------+----------------+
(1 row)
~~~

All schema change jobs can be [paused](pause-job.html), [resumed](resume-job.html), and [canceled](cancel-job.html).

## Limitations

### Overview

Schema changes keep your data consistent at all times, but they do not run inside [transactions][txns] in the general case. This is necessary so the cluster can remain online and continue to service application reads and writes.

Specifically, this behavior is necessary because making schema changes transactional would mean requiring a given schema change to propagate across all the nodes of a cluster. This would block all user-initiated transactions being run by your application, since the schema change would have to commit before any other transactions could make progress. This would prevent the cluster from servicing reads and writes during the schema change, requiring application downtime.

### Limited support for schema changes within transactions

{% include {{ page.version.version }}/known-limitations/schema-changes-within-transactions.md %}

### Schema change DDL statements inside a multi-statement transaction can fail while other statements succeed

{% include {{ page.version.version }}/known-limitations/schema-change-ddl-inside-multi-statement-transactions.md %}

### No schema changes between executions of prepared statements

{% include {{ page.version.version }}/known-limitations/schema-changes-between-prepared-statements.md %}

### Examples of statements that fail

The following statements fail due to [limited support for schema changes within transactions](#limited-support-for-schema-changes-within-transactions).

#### Create an index and then run a select against that index inside a transaction

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE foo (id INT PRIMARY KEY, name VARCHAR);
  BEGIN;
  SAVEPOINT cockroach_restart;
  CREATE INDEX foo_idx ON foo (id, name);
  SELECT * from foo@foo_idx;
  RELEASE SAVEPOINT cockroach_restart;
  COMMIT;
~~~

~~~
CREATE TABLE
BEGIN
SAVEPOINT
CREATE INDEX
ERROR:  relation "foo_idx" does not exist
ERROR:  current transaction is aborted, commands ignored until end of transaction block
ROLLBACK
~~~

#### Add a column and then add a constraint against that column inside a transaction

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE foo ();
  BEGIN;
  SAVEPOINT cockroach_restart;
  ALTER TABLE foo ADD COLUMN bar VARCHAR;
  ALTER TABLE foo ADD CONSTRAINT bar CHECK (foo IN ('a', 'b', 'c', 'd'));
  RELEASE SAVEPOINT cockroach_restart;
  COMMIT;
~~~

~~~
CREATE TABLE
BEGIN
SAVEPOINT
ALTER TABLE
ERROR:  column "foo" not found for constraint "foo"
ERROR:  current transaction is aborted, commands ignored until end of transaction block
ROLLBACK
~~~

#### Add a column and then select against that column inside a transaction

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE foo ();
  BEGIN;
  SAVEPOINT cockroach_restart;
  ALTER TABLE foo ADD COLUMN bar VARCHAR;
  SELECT bar FROM foo;
  RELEASE SAVEPOINT cockroach_restart;
  COMMIT;
~~~

~~~
CREATE TABLE
BEGIN
SAVEPOINT
ALTER TABLE
ERROR:  column name "bar" not found
ERROR:  current transaction is aborted, commands ignored until end of transaction block
ROLLBACK
~~~

## See also

+ [How online schema changes are possible in CockroachDB][blog]: Blog post with more technical details about how our schema change engine works.
+ [`ALTER DATABASE`](alter-database.html)
+ [`ALTER INDEX`](alter-index.html)
+ [`ALTER RANGE`](alter-range.html)
+ [`ALTER SEQUENCE`](alter-sequence.html)
+ [`ALTER TABLE`][alter-table]
+ [`ALTER VIEW`](alter-view.html)
+ [`CREATE DATABASE`](create-database.html)
+ [`CREATE INDEX`][create-index]
+ [`CREATE SEQUENCE`](create-sequence.html)
+ [`CREATE TABLE`](create-table.html)
+ [`CREATE VIEW`](create-view.html)
+ [`DROP DATABASE`](drop-database.html)
+ [`DROP INDEX`][drop-index]
+ [`DROP SEQUENCE`](drop-sequence.html)
+ [`DROP TABLE`](drop-table.html)
+ [`DROP VIEW`](drop-view.html)
+ [`TRUNCATE`][truncate]



<!-- Reference Links -->

[alter-table]: alter-table.html
[blog]: https://cockroachlabs.com/blog/how-online-schema-changes-are-possible-in-cockroachdb/
[consistent]: frequently-asked-questions.html#how-is-cockroachdb-strongly-consistent
[create-index]: create-index.html
[drop-index]: drop-index.html
[create-table]: create-table.html
[select]: selection-queries.html
[show-jobs]: show-jobs.html
[sql-client]: cockroach-sql.html
[txns]: transactions.html
[truncate]: truncate.html
