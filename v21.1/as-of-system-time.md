---
title: AS OF SYSTEM TIME
summary: The AS OF SYSTEM TIME clause executes a statement as of a specified time.
toc: true
---

The `AS OF SYSTEM TIME timestamp` clause causes statements to execute
using the database contents "as of" a specified time in the past.

This clause can be used to read historical data (also known as "[time
travel queries](https://www.cockroachlabs.com/blog/time-travel-queries-select-witty_subtitle-the_future/)") and can also be advantageous for performance as it decreases
transaction conflicts. For more details, see [SQL Performance Best
Practices](performance-best-practices-overview.html#use-as-of-system-time-to-decrease-conflicts-with-long-running-queries).

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
`follower_read_timestamp()`| A [function](functions-and-operators.html) that runs your queries at a time as close as possible to the present time known as the [follower read timestamp](follower-reads.html#run-queries-that-use-follower-reads), while remaining safe for [follower reads](follower-reads.html).

## Examples

### Select historical data (time-travel)

Imagine this example represents the database's current data:

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM t AS OF SYSTEM TIME '2016-01-01 08:00:00'
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM t AS OF SYSTEM TIME 1451635200000000000
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM t AS OF SYSTEM TIME '1451635200000000000'
~~~

{% include copy-clipboard.html %}
~~~sql
> SELECT * FROM t AS OF SYSTEM TIME '-4h'
~~~

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
~~~sql
> SELECT * FROM t, u, v AS OF SYSTEM TIME '-4h';
~~~

{% include copy-clipboard.html %}
~~~sql
> SELECT * FROM t JOIN u ON t.x = u.y AS OF SYSTEM TIME '-4h';
~~~

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
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
