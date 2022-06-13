---
title: AS OF SYSTEM TIME
summary: The AS OF SYSTEM TIME clause executes a statement as of a specified time.
toc: true
docs_area: reference.sql
---

The `AS OF SYSTEM TIME timestamp` clause causes statements to execute using the database contents "as of" a specified time in the past.

This clause can be used to read historical data (also known as "[time travel queries](https://www.cockroachlabs.com/blog/time-travel-queries-select-witty_subtitle-the_future/)") and can also be advantageous for performance as it decreases transaction conflicts. For more details, see [SQL Performance Best Practices](performance-best-practices-overview.html#use-as-of-system-time-to-decrease-conflicts-with-long-running-queries).

{{site.data.alerts.callout_info}}
Historical data is available only within the garbage collection window, which is determined by the `ttlseconds` field in the [replication zone configuration](configure-replication-zones.html).
{{site.data.alerts.end}}

## Synopsis

The `AS OF SYSTEM TIME` clause is supported in multiple SQL contexts,
including but not limited to:

- In [`SELECT` clauses](select-clause.html), at the very end of the `FROM` sub-clause.
- In [`BACKUP`](backup.html), after the parameters of the `TO` sub-clause.
- In [`RESTORE`](restore.html), after the parameters of the `FROM` sub-clause.
- In [`BEGIN`](begin-transaction.html), after the `BEGIN` keyword.
- In [`SET`](set-transaction.html), after the `SET TRANSACTION` keyword.

## Parameters

The `timestamp` argument supports the following formats:

Format | Notes
---|---
[`INT`](int.html) | Nanoseconds since the Unix epoch.
negative [`INTERVAL`](interval.html) | Added to `statement_timestamp()`, and thus must be negative.
[`STRING`](string.html) | A [`TIMESTAMP`](timestamp.html), [`INT`](int.html) of nanoseconds, or negative [`INTERVAL`](interval.html).
`follower_read_timestamp()`| A [function](functions-and-operators.html) that returns the [`TIMESTAMP`](timestamp.html) `statement_timestamp() - 4.8s`. Using this function will set the time as close as possible to the present time while remaining safe for [exact staleness follower reads](follower-reads.html#exact-staleness-reads).
`with_min_timestamp(TIMESTAMPTZ, [nearest_only])` | <span class="version-tag">New in v21.2:</span> Defines a minimum [timestamp](timestamp.html) at which to perform the [bounded staleness read](follower-reads.html#bounded-staleness-reads). The actual timestamp of the read may be equal to or later than the provided timestamp, but cannot be before the provided timestamp. This is useful to request a read from nearby followers, if possible, while enforcing causality between an operation at some point in time and any dependent reads. This function accepts an optional `nearest_only` argument that will error if the reads cannot be serviced from a nearby replica.
`with_max_staleness(INTERVAL, [nearest_only])` | <span class="version-tag">New in v21.2:</span> Defines a maximum staleness interval with which to perform the [bounded staleness read](follower-reads.html#bounded-staleness-reads). The timestamp of the read can be at most this stale with respect to the current time. This is useful to request a read from nearby followers, if possible, while placing some limit on how stale results can be. Note that `with_max_staleness(INTERVAL)` is equivalent to `with_min_timestamp(now() - INTERVAL)`. This function accepts an optional `nearest_only` argument that will error if the reads cannot be serviced from a nearby replica.

{{site.data.alerts.callout_success}}
 To set `AS OF SYSTEM TIME follower_read_timestamp()` on all implicit and explicit read-only transactions by default, set the `default_transaction_use_follower_reads` [session variable](set-vars.html) to `on`. When `default_transaction_use_follower_reads=on` and follower reads are enabled, all read-only transactions use follower reads.
{{site.data.alerts.end}}

## Examples

### Select historical data (time-travel)

Imagine this example represents the database's current data:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT name, balance
    FROM accounts
   WHERE name = 'Edna Barath';
~~~
~~~
+-------------+---------+
|    name     | balance |
+-------------+---------+
| Edna Barath |     750 |
| Edna Barath |    2200 |
+-------------+---------+
~~~

We could instead retrieve the values as they were on October 3, 2016 at 12:45 UTC:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT name, balance
    FROM accounts
         AS OF SYSTEM TIME '2016-10-03 12:45:00'
   WHERE name = 'Edna Barath';
~~~
~~~
+-------------+---------+
|    name     | balance |
+-------------+---------+
| Edna Barath |     450 |
| Edna Barath |    2000 |
+-------------+---------+
~~~


### Using different timestamp formats

Assuming the following statements are run at `2016-01-01 12:00:00`, they would execute as of `2016-01-01 08:00:00`:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM t AS OF SYSTEM TIME '2016-01-01 08:00:00'
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM t AS OF SYSTEM TIME 1451635200000000000
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM t AS OF SYSTEM TIME '1451635200000000000'
~~~

{% include_cached copy-clipboard.html %}
~~~sql
> SELECT * FROM t AS OF SYSTEM TIME '-4h'
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM t AS OF SYSTEM TIME INTERVAL '-4h'
~~~

### Selecting from multiple tables

{{site.data.alerts.callout_info}}
It is not yet possible to select from multiple tables at different timestamps. The entire query runs at the specified time in the past.
{{site.data.alerts.end}}

When selecting over multiple tables in a single `FROM` clause, the `AS
OF SYSTEM TIME` clause must appear at the very end and applies to the
entire `SELECT` clause.

For example:

{% include_cached copy-clipboard.html %}
~~~sql
> SELECT * FROM t, u, v AS OF SYSTEM TIME '-4h';
~~~

{% include_cached copy-clipboard.html %}
~~~sql
> SELECT * FROM t JOIN u ON t.x = u.y AS OF SYSTEM TIME '-4h';
~~~

{% include_cached copy-clipboard.html %}
~~~sql
> SELECT * FROM (SELECT * FROM t), (SELECT * FROM u) AS OF SYSTEM TIME '-4h';
~~~

### Using `AS OF SYSTEM TIME` in subqueries

To enable time travel, the `AS OF SYSTEM TIME` clause must appear in
at least the top-level statement. It is not valid to use it only in a
[subquery](subqueries.html).

For example, the following is invalid:

~~~
SELECT * FROM (SELECT * FROM t AS OF SYSTEM TIME '-4h'), u
~~~

To facilitate the composition of larger queries from simpler queries,
CockroachDB allows `AS OF SYSTEM TIME` in sub-queries under the
following conditions:

- The top level query also specifies `AS OF SYSTEM TIME`.
- All the `AS OF SYSTEM TIME` clauses specify the same timestamp.

For example:

{% include_cached copy-clipboard.html %}
~~~sql
> SELECT * FROM (SELECT * FROM t AS OF SYSTEM TIME '-4h') tp
           JOIN u ON tp.x = u.y
           AS OF SYSTEM TIME '-4h'  -- same timestamp as above - OK.
     WHERE x < 123;
~~~

### Using `AS OF SYSTEM TIME` in transactions

You can use the [`BEGIN`](begin-transaction.html) statement to execute the transaction using the database contents "as of" a specified time in the past.

{% include {{ page.version.version }}/sql/begin-transaction-as-of-system-time-example.md %}

Alternatively, you can use the [`SET`](set-transaction.html) statement to execute the transaction using the database contents "as of" a specified time in the past.

{% include {{ page.version.version }}/sql/set-transaction-as-of-system-time-example.md %}

### Using `AS OF SYSTEM TIME` to recover recently lost data

It is possible to recover lost data as a result of an online schema change prior to when [garbage collection](architecture/storage-layer.html#garbage-collection) begins:

{% include_cached copy-clipboard.html %}
~~~sql
> CREATE DATABASE foo;
~~~
~~~
CREATE DATABASE


Time: 3ms total (execution 3ms / network 0ms)
~~~
{% include_cached copy-clipboard.html %}
~~~sql
> CREATE TABLE foo.bar (id INT PRIMARY KEY);
~~~
~~~
CREATE TABLE


Time: 4ms total (execution 3ms / network 0ms)
~~~
{% include_cached copy-clipboard.html %}
~~~sql
> INSERT INTO foo.bar VALUES (1), (2);
~~~
~~~
INSERT 2


Time: 5ms total (execution 5ms / network 0ms)
~~~
{% include_cached copy-clipboard.html %}
~~~sql
> SELECT now();
~~~
~~~
              now
--------------------------------
  2022-02-01 21:11:53.63771+00
(1 row)


Time: 1ms total (execution 0ms / network 0ms)
~~~
{% include_cached copy-clipboard.html %}
~~~sql
> DROP TABLE foo.bar;
~~~
~~~
DROP TABLE


Time: 45ms total (execution 45ms / network 0ms)
~~~
{% include_cached copy-clipboard.html %}
~~~sql
> SELECT * FROM foo.bar AS OF SYSTEM TIME '2022-02-01 21:11:53.63771+00';
~~~
~~~
  id
------
   1
   2
(2 rows)


Time: 2ms total (execution 2ms / network 0ms)
~~~
{% include_cached copy-clipboard.html %}
~~~sql
> SELECT * FROM foo.bar;
~~~
~~~
ERROR: relation "foo.bar" does not exist
SQLSTATE: 42P01
~~~

{{site.data.alerts.callout_danger}}
Once garbage collection has occurred, `AS OF SYSTEM TIME` will no longer be able to recover lost data. For more long-term recovery solutions, consider taking either a [full or incremental backup](take-full-and-incremental-backups.html) of your cluster.
{{site.data.alerts.end}}

## See also

- [Select Historical Data](select-clause.html#select-historical-data-time-travel)
- [Time-Travel Queries](https://www.cockroachlabs.com/blog/time-travel-queries-select-witty_subtitle-the_future/)
- [Follower Reads](follower-reads.html)
- [Follower Reads Topology Pattern](topology-follower-reads.html)

## Tech note

{{site.data.alerts.callout_info}}
Although the following format is supported, it is not intended to be used by most users.
{{site.data.alerts.end}}

HLC timestamps can be specified using a [`DECIMAL`](decimal.html). The
integer part is the wall time in nanoseconds. The fractional part is
the logical counter, a 10-digit integer. This is the same format as
produced by the `cluster_logical_timestamp()` function.
