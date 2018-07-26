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

{{site.data.alerts.callout_success}}
Support for schema changes within transactions is limited. We recommend doing schema changes outside transactions where possible.  When a schema management tool uses transactions on your behalf, we recommend only doing one schema change operation per transaction.
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
Schema changes keep your data consistent at all times, but they do not run inside user transactions in the general case. This is necessary so the cluster can remain online and continue to service application reads and writes. For more information, see [Limitations](#limitations).
{{site.data.alerts.end}}

<span class="version-tag">New in v2.1:</span> You can run schema changes inside the same transaction as a [`CREATE TABLE`][create-table] statement. For more information, [see this example](#run-schema-changes-inside-a-transaction-with-create-table).

## How online schema changes work

At a high level, online schema changes are accomplished by using a bridging strategy involving concurrent uses of multiple versions of the schema. Schema changes are run as a series of transactions:

1. A user-level transaction initiated by [`ALTER TABLE`][alter-table], [`CREATE INDEX`][create-index], [`TRUNCATE`][truncate], etc. The user-level transaction schedules the schema change for the schema change engine to complete.

2. A series of system-level transactions calculated by the schema change engine that convert the original schema to the new schema in discrete steps while ensuring that the underlying table data is always in a consistent state. These transactions are executed as a [background job][show-jobs].

This approach allows the schema change engine to roll out a new schema while the previous version is still in use. It then backfills or deletes the underlying table data as needed in the background, while the cluster is still running and servicing reads and writes from your application.

During the backfilling process, the schema change engine updates the underlying table data to make sure all instances of the table are stored according to the requirements of the new schema.

Once backfilling is complete, all nodes will switch over to the new schema, and will allow reads and writes of the table using the new schema.

For more technical details, see [How online schema changes are possible in CockroachDB][blog].

## Limitations

Schema changes cannot be performed inside user [transactions][txns] in the general case. Instead, they run as background jobs (that can be viewed with [`SHOW JOBS`][show-jobs]). This behavior is necessary because making schema changes transactional would mean requiring a given schema change transaction to propagate across all the nodes of a cluster. This would block all user-initiated transactions being run by your application, since the schema-change-containing transaction would have to commit before any other transactions could make progress. This would prevent the cluster from servicing reads and writes during the schema change, requiring application downtime.

For example, this means that the following queries will result in errors.

Create an index and then run a select against that index inside a user-level transaction:

{% include copy-clipboard.html %}
~~~ sql
CREATE TABLE foo (id INT PRIMARY KEY, name VARCHAR);
BEGIN;
SAVEPOINT cockroach_restart;
CREATE INDEX foo_idx ON foo (id, name);
SELECT * from foo_idx;
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

Add a column and then add a constraint against that column inside a user-level transaction:

{% include copy-clipboard.html %}
~~~ sql
CREATE TABLE foo ();
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

Add a column and then select against that column inside a user-level transaction:

{% include copy-clipboard.html %}
~~~ sql
CREATE TABLE foo ();
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

{{site.data.alerts.callout_success}}
As of version 2.1, you *can* run schema changes inside the same transaction as a [`CREATE TABLE`][create-table] statement. For more information, [see this example](#run-schema-changes-inside-a-transaction-with-create-table).
{{site.data.alerts.end}}

## Examples

### Run schema changes inside a transaction with `CREATE TABLE`

As noted above, and in the list of [known limitations](known-limitations.html#schema-changes-within-transactions), you cannot run schema changes inside user transactions in general.

However, as of version 2.1, you can run schema changes inside the same transaction as a [`CREATE TABLE`][create-table] statement. For example:

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

### Show all schema change jobs

You can check on the status of the schema change jobs on your system at any time using the [`SHOW JOBS`][show-jobs] statement as shown below.

{% include copy-clipboard.html %}
~~~ sql
SELECT * FROM [SHOW JOBS] WHERE job_type = 'SCHEMA CHANGE';
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

## See Also

+ [How online schema changes are possible in CockroachDB][blog]: Blog post with more technical details about how our schema change engine works.
+ [ALTER TABLE][alter-table]
+ [CREATE INDEX][create-index]
+ [DROP INDEX][drop-index]
+ [TRUNCATE][truncate]

<!-- Reference Links -->

[alter-table]: alter-table.html
[blog]: https://cockroachlabs.com/blog/how-online-schema-changes-are-possible-in-cockroachdb/
[consistent]: strong-consistency.html
[create-index]: create-index.html
[drop-index]: drop-index.html
[create-table]: create-table.html
[select]: selection-queries.html
[show-jobs]: show-jobs.html
[sql-client]: use-the-built-in-sql-client.html
[txns]: transactions.html
[truncate]: truncate.html
