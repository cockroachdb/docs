---
title: Online Schema Changes
summary: Update table schemas without external tools or downtime.
toc: true
docs_area: manage
---

CockroachDB's online schema changes provide a simple way to update a table schema without imposing any negative consequences on an application — including downtime. The schema change engine is a built-in feature requiring no additional tools, resources, or ad hoc sequencing of operations.

Benefits of online schema changes include:

- Changes to your table schema happen while the database is running.
- Your application's queries can run normally, with no effect on read/write latency. The schema is cached for performance.
- Your data is kept in a safe, [consistent][consistent] state throughout the entire schema change process.
- The schema change runs as a [background job][show-jobs] without holding locks on the underlying table data.
  - {% include_cached new-in.html version="v26.1" %} As soon as the statement is accepted, CockroachDB returns a SQL `NOTICE` (as shown below) that includes the ID of the background job. To track the job's progress, use [`SELECT * FROM [SHOW JOBS] WHERE job_id = {job_id}`]({% link {{ page.version.version }}/show-jobs.md %}) or view the [DB Console **Jobs Page**]({% link {{ page.version.version }}/ui-jobs-page.md %}).

    ~~~
    NOTICE: waiting for job(s) to complete: 1145445286329516033
    If the statement is canceled, jobs will continue in the background.
    ~~~

{{site.data.alerts.callout_danger}}
Schema changes consume additional resources, and if they are run when the cluster is near peak capacity, latency spikes can occur. This is especially true for any schema change that adds columns, drops columns, or adds an index. We do not recommend doing more than one schema change at a time while in production.
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
CockroachDB [does not support schema changes within explicit transactions](#schema-changes-within-transactions) with full atomicity guarantees. CockroachDB only supports DDL changes within implicit transactions (individual statements). If a schema management tool uses transactions on your behalf, it should only execute one schema change operation per transaction.

Some tools and applications may be able to workaround CockroachDB's lack of transactional schema changes by [enabling a setting that automatically commits before running schema changes inside transactions](#enable-automatic-commit-before-running-schema-changes-inside-transactions).
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

### Improve changefeed performance with `schema_locked`

Set the [`schema_locked` table storage parameter]({% link {{ page.version.version }}/with-storage-parameter.md %}#storage-parameter-schema-locked) to `true` to indicate that a schema change is not currently ongoing on a table. CockroachDB automatically unsets this parameter before performing a schema change and reapplies it when done. Enabling `schema_locked` can help [improve performance of changefeeds]({% link {{ page.version.version }}/create-changefeed.md %}#disallow-schema-changes-on-tables-to-improve-changefeed-performance) running on the table, which can reduce commit-to-emit latency.

Use the [`create_table_with_schema_locked` session variable]({% link {{ page.version.version }}/set-vars.md %}#create_table_with_schema_locked) to set this storage parameter to `true` on every table created in the session. In v26.1 and later, it is enabled by default.

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

As noted in [Known limitations](#known-limitations), you cannot run schema changes inside transactions in general.

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

### Enable automatic commit before running schema changes inside transactions

When the [`autocommit_before_ddl` session setting]({% link {{page.version.version}}/set-vars.md %}#autocommit-before-ddl) is set to `on`, any schema change statement that is sent during an [explicit transaction]({% link {{page.version.version}}/transactions.md %}) will cause the transaction to [commit]({% link {{page.version.version}}/commit-transaction.md %}) before executing the schema change.

This setting can be used to:

- Improve compatibility with some third-party tools that do not work well due to our [limitations on schema changes in explicit transactions](#schema-changes-within-transactions).
- Use schema changes more easily under the [`READ COMMITTED` isolation level]({% link {{page.version.version}}/read-committed.md %}). The error message returned when running schema changes under `READ COMMITTED` isolation includes a hint to use this setting.

With `autocommit_before_ddl` enabled, [`COMMIT`]({% link {{ page.version.version }}/commit-transaction.md %}), [`ROLLBACK`]({% link {{ page.version.version }}/rollback-transaction.md %}), and other statements that normally return **errors** when used outside of an explicit transaction will instead return **warnings**. This behavior change is necessary because this setting can cause a transaction to end earlier than a client application may expect.

To enable this setting for the current [session]({% link {{ page.version.version }}/show-sessions.md %}):

{% include_cached copy-clipboard.html %}
~~~ sql
SET autocommit_before_ddl = on;
~~~

To enable it for [all users]({% link {{ page.version.version }}/alter-role.md %}#set-default-session-variable-values-for-all-users):

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER ROLE ALL SET autocommit_before_ddl = on
~~~

You can also enable the setting [from your application's connection string]({% link {{page.version.version}}/connection-parameters.md %}#supported-options-parameters).

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

## Known limitations

{% include {{ page.version.version }}/known-limitations/online-schema-changes-limitations.md %}

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
