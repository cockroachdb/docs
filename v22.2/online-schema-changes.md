---
title: Online Schema Changes
summary: Update table schemas without external tools or downtime.
toc: true
docs_area: manage
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

{{site.data.alerts.callout_info}}
CockroachDB [does not support schema changes](#limitations) within explicit [transactions][txns] with full atomicity guarantees. CockroachDB only supports DDL changes within implicit transactions (individual statements). If a schema management tool uses transactions on your behalf, it should only execute one schema change operation per transaction.
{{site.data.alerts.end}}

To see a demo of an online schema change, watch the following video:

{% include_cached youtube.html video_id="xvBBQVIGYio" %}

## How online schema changes work

At a high level, online schema changes are accomplished by using a bridging strategy involving concurrent uses of multiple versions of the schema. The process is as follows:

1. You initiate a schema change by executing [`ALTER TABLE`][alter-table], [`CREATE INDEX`][create-index], [`TRUNCATE`][truncate], etc.

1. The schema change engine converts the original schema to the new schema in discrete steps while ensuring that the underlying table data is always in a consistent state. These changes are executed as a [background job][show-jobs], and can be [paused](pause-job.html), [resumed](resume-job.html), and [canceled](cancel-job.html).

This approach allows the schema change engine to roll out a new schema while the previous version is still in use. It then backfills or deletes the underlying table data as needed in the background, while the cluster is still running and servicing reads and writes from your application.

During the backfilling process, the schema change engine updates the underlying table data to make sure all instances of the table are stored according to the requirements of the new schema.

Once backfilling is complete, all nodes will switch over to the new schema, and will allow reads and writes of the table using the new schema.

For more technical details, see [How online schema changes are possible in CockroachDB][blog].

The following online schema changes pause if the node executing the schema change is running out of disk space:

- Changes that trigger an index backfill (adding data to an index).
- The following statements:
  - [`ADD COLUMN`](alter-table.html#add-column) when the statement also features `INDEX` or `UNIQUE`.
  - [`ALTER PRIMARY KEY`](alter-table.html#alter-primary-key)
  - [`CREATE INDEX`](create-index.html)
  - [`CREATE MATERIALIZED VIEW`](views.html#materialized-views)
  - [`CREATE TABLE AS`](create-table-as.html)
  - [`REFRESH`](refresh.html)
  - [`SET LOCALITY`](alter-table.html#set-locality) under one of the following conditions:
      - The locality changes from [`REGIONAL BY ROW`](alter-table.html#regional-by-row) to something that is not `REGIONAL BY ROW`.
      - The locality changes from something that is not `REGIONAL BY ROW` to `REGIONAL BY ROW`.

{{site.data.alerts.callout_info}}
If a schema change job is paused, any jobs waiting on that schema change will stop waiting and return an error.
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
If a schema change fails, the schema change job will be cleaned up automatically. However, there are limitations with rolling back schema changes within a transaction; for more information, see [Schema change DDL statements inside a multi-statement transaction can fail while other statements succeed](#schema-change-ddl-statements-inside-a-multi-statement-transaction-can-fail-while-other-statements-succeed).
{{site.data.alerts.end}}

## Declarative schema changer

CockroachDB only guarantees atomicity for schema changes within single statement transactions, either implicit transactions or in an explicit transaction with a single schema change statement. The declarative schema changer is the next iteration of how schema changes will be performed in CockroachDB. By planning schema change operations in a more principled manner, the declarative schema changer will ultimately make transactional schema changes possible. You can identify jobs that are using the declarative schema changer by running [`SHOW JOBS`](show-jobs.html) and finding jobs with a `job_type` of `NEW SCHEMA CHANGE`.

The following statements use the declarative schema changer by default:

- [`DROP DATABASE`](drop-database.html)
- [`DROP SCHEMA`](drop-schema.html)
- [`DROP TABLE`](drop-table.html)
- [`DROP TYPE`](drop-type.html)

Until all schema change statements are moved to use the declarative schema changer you can enable and disable the declarative schema changer for supported statements using the `sql.defaults.use_declarative_schema_changer` [cluster setting](cluster-settings.html) and the `use_declarative_schema_changer` [session variable](set-vars.html).

{{site.data.alerts.callout_danger}}
Declarative schema changer statements and legacy schema changer statements operating on the same objects cannot exist within the same transaction. Either split the transaction into multiple transactions, or disable the cluster setting or session variable.
{{site.data.alerts.end}}

{% include {{page.version.version}}/sql/sql-defaults-cluster-settings-deprecation-notice.md %}

## Best practices for online schema changes

### Schema changes in multi-region clusters

{% include {{ page.version.version }}/performance/lease-preference-system-database.md %}

## Examples

{{site.data.alerts.callout_success}}
For more examples of schema change statements, see the [`ALTER TABLE`][alter-table] subcommands.
{{site.data.alerts.end}}

### Run schema changes inside a transaction with `CREATE TABLE`

As noted in [Limitations](#limitations), you cannot run schema changes inside transactions in general.

However, you can run schema changes inside the same transaction as a [`CREATE TABLE`][create-table] statement. For example:

{% include_cached copy-clipboard.html %}
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

Some schema changes can be used in combination in a single `ALTER TABLE` statement. For a list of commands that can be combined, see [`ALTER TABLE`](alter-table.html). For a demonstration, see [Add and rename columns atomically](alter-table.html#add-and-rename-columns-atomically).

### Show all schema change jobs

You can check on the status of the schema change jobs on your system at any time using the [`SHOW JOBS`][show-jobs] statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> WITH x AS (SHOW JOBS) SELECT * FROM x WHERE job_type = 'SCHEMA CHANGE';
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

## Undoing a schema change

Prior to [garbage collection](architecture/storage-layer.html#garbage-collection), it's possible to recover data that may have been lost prior to schema changes by using the [`AS OF SYSTEM TIME`](as-of-system-time.html) parameter. However, this solution is limited in terms of time, and doesn't work beyond the designated garbage collection window.

For more long-term recovery solutions, consider taking either a [full or incremental backup](take-full-and-incremental-backups.html) of your cluster.

## Limitations

### Schema changes within transactions

Schema changes should not be performed within an explicit transaction with multiple statements, as they do not have the same atomicity guarantees as other SQL statements. Execute schema changes either as single statements (as an implicit transaction), or in an explicit transaction consisting of the single schema change statement.

Schema changes keep your data consistent at all times, but they do not run inside [transactions][txns] in the general case. Making schema changes transactional would mean requiring a given schema change to propagate across all the nodes of a cluster. This would block all user-initiated transactions being run by your application, since the schema change would have to commit before any other transactions could make progress. This would prevent the cluster from servicing reads and writes during the schema change, requiring application downtime.

{% include {{ page.version.version }}/known-limitations/schema-changes-within-transactions.md %}

### Schema change DDL statements inside a multi-statement transaction can fail while other statements succeed

{% include {{ page.version.version }}/known-limitations/schema-change-ddl-inside-multi-statement-transactions.md %}

### No online schema changes if primary key change in progress

You cannot start an online schema change on a table if a [primary key change](alter-table.html#alter-primary-key) is currently in progress on the same table.

### No online schema changes between executions of prepared statements

{% include {{ page.version.version }}/known-limitations/schema-changes-between-prepared-statements.md %}

### `ALTER TYPE` schema changes cannot be cancelled

You can only [cancel](cancel-job.html) [`ALTER TYPE`](alter-type.html) schema change jobs that drop values. All other `ALTER TYPE` schema change jobs are non-cancellable.

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
