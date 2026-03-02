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

## How online schema changes work

At a high level, online schema changes are accomplished by using a bridging strategy involving concurrent uses of multiple versions of the schema. The process is as follows:

1. You initiate a schema change by executing [`ALTER TABLE`][alter-table], [`CREATE INDEX`][create-index], [`TRUNCATE`][truncate], etc.

1. The schema change engine converts the original schema to the new schema in discrete steps while ensuring that the underlying table data is always in a consistent state. These changes are executed as a [background job][show-jobs], and can be [paused]({% link {{ page.version.version }}/pause-job.md %}), [resumed]({% link {{ page.version.version }}/resume-job.md %}), and [canceled]({% link {{ page.version.version }}/cancel-job.md %}).

This approach allows the schema change engine to roll out a new schema while the previous version is still in use. It then backfills or deletes the underlying table data as needed in the background, while the cluster is still running and servicing reads and writes from your application.

During the backfilling process, the schema change engine updates the underlying table data to make sure all instances of the table are stored according to the requirements of the new schema.

Once backfilling is complete, all nodes will switch over to the new schema, and will allow reads and writes of the table using the new schema.

For more technical details, see [How online schema changes are possible in CockroachDB][blog].

The following online schema changes pause if the node executing the schema change is running out of disk space:

- Changes that trigger an index backfill (adding data to an index).
- The following statements:
  - [`ADD COLUMN`]({% link {{ page.version.version }}/alter-table.md %}#add-column) when the statement also features `INDEX` or `UNIQUE`.
  - [`ALTER PRIMARY KEY`]({% link {{ page.version.version }}/alter-table.md %}#alter-primary-key)
  - [`CREATE INDEX`]({% link {{ page.version.version }}/create-index.md %})
  - [`CREATE MATERIALIZED VIEW`]({% link {{ page.version.version }}/views.md %}#materialized-views)
  - [`CREATE TABLE AS`]({% link {{ page.version.version }}/create-table-as.md %})
  - [`REFRESH`]({% link {{ page.version.version }}/refresh.md %})
  - [`SET LOCALITY`]({% link {{ page.version.version }}/alter-table.md %}#set-locality) under one of the following conditions:
    - The locality changes from [`REGIONAL BY ROW`]({% link {{ page.version.version }}/alter-table.md %}#regional-by-row) to something that is not `REGIONAL BY ROW`.
    - The locality changes from something that is not `REGIONAL BY ROW` to `REGIONAL BY ROW`.

{{site.data.alerts.callout_info}}
If a schema change job is paused, any jobs waiting on that schema change will stop waiting and return an error.
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
If a schema change fails, the schema change job will be cleaned up automatically. However, there are limitations with rolling back schema changes within a transaction; for more information, see [Schema change DDL statements inside a multi-statement transaction can fail while other statements succeed](#schema-change-ddl-statements-inside-a-multi-statement-transaction-can-fail-while-other-statements-succeed).
{{site.data.alerts.end}}

For advice about how to avoid running out of space during an online schema change, refer to [Estimate your storage capacity before performing online schema changes](#estimate-your-storage-capacity-before-performing-online-schema-changes).

## Best practices for online schema changes

### Estimate your storage capacity before performing online schema changes

Some schema change operations, like adding or dropping columns or altering primary keys, will temporarily increase a cluster's storage consumption. Specifically, these operations may temporarily require up to three times more storage space  for the range size while the schema change is being applied, and this may cause the cluster to run out of storage space or fail to apply the schema change.

To estimate the size of the indexes in your table, use the [`SHOW RANGES`]({% link {{ page.version.version }}/show-ranges.md %}) statement.

{% include_cached copy-clipboard.html %}
~~~ shell
SHOW RANGES FROM TABLE {table name} WITH DETAILS, KEYS, INDEXES;
~~~

The output includes a `range_size_mb` column that shows the size of the range in megabytes for each index.

In many cases this range size is trivial, but when the range size is many gigabytes or terabytes, you will need at least three times that amount of free storage space to successfully apply an online schema change.

#### Example of finding the range size of an index

1. Start a 3 node [`cockroach demo`]({% link {{ page.version.version }}/cockroach-demo.md %}) cluster with the MovR dataset.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach demo --nodes 3
    ~~~

1. Turn off the deprecated behavior of `SHOW RANGES`:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SET CLUSTER SETTING sql.show_ranges_deprecated_behavior.enabled TO 'false';
    ~~~

1. Find the range size of the indexes in the `movr.vehicles` table:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    WITH x AS (
            SHOW RANGES FROM TABLE movr.vehicles WITH DETAILS, KEYS, INDEXES
         )
    SELECT index_name,
           round(range_size_mb, 4) as range_size_mb
      FROM x;
    ~~~

    ~~~
                  index_name               | range_size_mb
    ----------------------------------------+----------------
      vehicles_pkey                         |        0.0005
      vehicles_pkey                         |        0.0002
      vehicles_pkey                         |        0.0005
      vehicles_pkey                         |        0.0006
      vehicles_pkey                         |        0.0002
      vehicles_pkey                         |        0.0002
      vehicles_pkey                         |        0.0002
      vehicles_pkey                         |        0.0002
      vehicles_pkey                         |        0.0103
      vehicles_auto_index_fk_city_ref_users |        0.0103
    (10 rows)
    ~~~

### Run schema changes with large backfills during off-peak hours

Online schema changes that result in large backfill operations (for example, [`ALTER TABLE ... ALTER COLUMN`]({% link {{ page.version.version }}/alter-table.md %}#alter-column) statements) are computationally expensive, and can result in degraded performance. The [admission control system]({% link {{ page.version.version }}/admission-control.md %}) will help keep high-priority operations running, but it's recommended to run backfill-heavy schema changes during times when the cluster is under relatively low loads.

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

Some schema changes can be used in combination in a single `ALTER TABLE` statement. For a list of commands that can be combined, refer to [`ALTER TABLE`]({% link {{ page.version.version }}/alter-table.md %}#subcommands). For examples, refer to [Add and rename columns atomically]({% link {{ page.version.version }}/alter-table.md %}#add-and-rename-columns-atomically) and [Drop and add a primary key constraint]({% link {{ page.version.version }}/alter-table.md %}#drop-and-add-a-primary-key-constraint).

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

All schema change jobs can be [paused]({% link {{ page.version.version }}/pause-job.md %}), [resumed]({% link {{ page.version.version }}/resume-job.md %}), and [canceled]({% link {{ page.version.version }}/cancel-job.md %}).

## Demo videos

### Updating primary key columns

To see a demo of an online schema change against a primary key column, watch the following video:

{% include_cached youtube.html video_id="xvBBQVIGYio" %}

### Updating foreign key columns

To see a demo of an online schema change against a foreign key column, watch the following video:

{% include_cached youtube.html video_id="HXAIB6bJuZQ" %}

## Undoing a schema change

Prior to [garbage collection]({% link {{ page.version.version }}/architecture/storage-layer.md %}#garbage-collection), it's possible to recover data that may have been lost prior to schema changes by using the [`AS OF SYSTEM TIME`]({% link {{ page.version.version }}/as-of-system-time.md %}) parameter. However, this solution is limited in terms of time, and doesn't work beyond the designated garbage collection window.

For more long-term recovery solutions, consider taking either a [full or incremental backup]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}) of your cluster.

## Limitations

### Schema changes within transactions

Most schema changes should not be performed within an explicit transaction with multiple statements, as they do not have the same atomicity guarantees as other SQL statements. Execute schema changes either as single statements (as an implicit transaction), or in an explicit transaction consisting of the single schema change statement. There are some exceptions to this, detailed below.

Schema changes keep your data consistent at all times, but they do not run inside [transactions][txns] in the general case. Making schema changes transactional would mean requiring a given schema change to propagate across all the nodes of a cluster. This would block all user-initiated transactions being run by your application, since the schema change would have to commit before any other transactions could make progress. This would prevent the cluster from servicing reads and writes during the schema change, requiring application downtime.

Some schema change operations can be run within explicit, multiple statement transactions. `CREATE TABLE` and `CREATE INDEX` statements can be run within the same transaction with the same atomicity guarantees as other SQL statements. There are no performance or rollback issues when using these statements within a multiple statement transaction.

{% include {{ page.version.version }}/known-limitations/schema-changes-within-transactions.md %}

### Schema change DDL statements inside a multi-statement transaction can fail while other statements succeed

{% include {{ page.version.version }}/known-limitations/schema-change-ddl-inside-multi-statement-transactions.md %}

### No online schema changes if primary key change in progress

You cannot start an online schema change on a table if a [primary key change]({% link {{ page.version.version }}/alter-table.md %}#alter-primary-key) is currently in progress on the same table.

### No online schema changes between executions of prepared statements

{% include {{ page.version.version }}/known-limitations/schema-changes-between-prepared-statements.md %}

### `ALTER TYPE` schema changes cannot be cancelled

You can only [cancel]({% link {{ page.version.version }}/cancel-job.md %}) [`ALTER TYPE`]({% link {{ page.version.version }}/alter-type.md %}) schema change jobs that drop values. All other `ALTER TYPE` schema change jobs are non-cancellable.

## See also

+ [How online schema changes are possible in CockroachDB][blog]: Blog post with more technical details about how our schema change engine works.
+ [`ALTER DATABASE`]({% link {{ page.version.version }}/alter-database.md %})
+ [`ALTER INDEX`]({% link {{ page.version.version }}/alter-index.md %})
+ [`ALTER RANGE`]({% link {{ page.version.version }}/alter-range.md %})
+ [`ALTER SEQUENCE`]({% link {{ page.version.version }}/alter-sequence.md %})
+ [`ALTER TABLE`][alter-table]
+ [`ALTER VIEW`]({% link {{ page.version.version }}/alter-view.md %})
+ [`CREATE DATABASE`]({% link {{ page.version.version }}/create-database.md %})
+ [`CREATE INDEX`][create-index]
+ [`CREATE SEQUENCE`]({% link {{ page.version.version }}/create-sequence.md %})
+ [`CREATE TABLE`]({% link {{ page.version.version }}/create-table.md %})
+ [`CREATE VIEW`]({% link {{ page.version.version }}/create-view.md %})
+ [`DROP DATABASE`]({% link {{ page.version.version }}/drop-database.md %})
+ [`DROP INDEX`][drop-index]
+ [`DROP SEQUENCE`]({% link {{ page.version.version }}/drop-sequence.md %})
+ [`DROP TABLE`]({% link {{ page.version.version }}/drop-table.md %})
+ [`DROP VIEW`]({% link {{ page.version.version }}/drop-view.md %})
+ [`TRUNCATE`][truncate]



{% comment %} Reference Links {% endcomment %}

[alter-table]: {% link {{ page.version.version }}/alter-table.md %}
[blog]: https://cockroachlabs.com/blog/how-online-schema-changes-are-possible-in-cockroachdb/
[consistent]: frequently-asked-questions.html#how-is-cockroachdb-strongly-consistent
[create-index]: {% link {{ page.version.version }}/create-index.md %}
[drop-index]: drop-index.html
[create-table]: create-table.html
[select]: selection-queries.html
[show-jobs]: {% link {{ page.version.version }}/show-jobs.md %}
[sql-client]: cockroach-sql.html
[txns]: transactions.html
[truncate]: truncate.html
