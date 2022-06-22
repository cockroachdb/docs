---
title: SQL FAQs
summary: Get answers to frequently asked questions about CockroachDB SQL.
toc: true
toc_not_nested: true
---


## How do I bulk insert data into CockroachDB?

Currently, you can bulk insert data with batches of [`INSERT`](insert.html) statements not exceeding a few MB. The size of your rows determines how many you can use, but 1,000 - 10,000 rows typically works best. For more details, see [Import Data](migration-overview.html).

## How do I auto-generate unique row IDs in CockroachDB?

{% include {{ page.version.version }}/faq/auto-generate-unique-ids.html %}

## How do I generate unique, slowly increasing sequential numbers in CockroachDB?

{% include {{ page.version.version }}/faq/sequential-numbers.md %}

## What are the differences between `UUID`, sequences, and `unique_rowid()`?

{% include {{ page.version.version }}/faq/differences-between-numberings.md %}

## How do I order writes to a table to closely follow time in CockroachDB?

{% include {{ page.version.version }}/faq/sequential-transactions.md %}

## How do I get the last ID/SERIAL value inserted into a table?

There’s no function in CockroachDB for returning last inserted values, but you can use the [`RETURNING` clause](insert.html#insert-and-return-values) of the `INSERT` statement.

For example, this is how you’d use `RETURNING` to return a value auto-generated via `unique_rowid()` or [`SERIAL`](serial.html):

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE users (id INT DEFAULT unique_rowid(), name STRING);

> INSERT INTO users (name) VALUES ('mike') RETURNING id;
~~~

## What is transaction contention?

Transaction contention occurs when transactions issued from multiple
clients at the same time operate on the same data.
This can cause transactions to wait on each other and decrease
performance, like when many people try to check out with the same
cashier at a store.

For more information about contention, see [Understanding and Avoiding
Transaction
Contention](performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention).

## Does CockroachDB support `JOIN`?

[CockroachDB supports SQL joins](joins.html).

At this time `LATERAL` joins are not yet supported.  For details, see [this Github issue](https://github.com/cockroachdb/cockroach/issues/24560).

## When should I use interleaved tables?

[Interleaving tables](interleave-in-parent.html) improve query performance by optimizing the key-value structure of closely related tables, attempting to keep data on the same key-value range if it's likely to be read and written together.

{% include {{ page.version.version }}/faq/when-to-interleave-tables.html %}

## Does CockroachDB support JSON or Protobuf datatypes?

Yes, as of v2.0, the [`JSONB`](jsonb.html) data type is supported.

## How do I know which index CockroachDB will select for a query?

To see which indexes CockroachDB is using for a given query, you can use the [`EXPLAIN`](explain.html) statement, which will print out the query plan, including any indexes that are being used:

{% include_cached copy-clipboard.html %}
~~~ sql
> EXPLAIN SELECT col1 FROM tbl1;
~~~

If you'd like to tell the query planner which index to use, you can do so via some [special syntax for index hints](table-expressions.html#force-index-selection):

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT col1 FROM tbl1@idx1;
~~~

## How do I log SQL queries?

{% include {{ page.version.version }}/faq/sql-query-logging.md %}

## Does CockroachDB support a UUID type?

Yes. For more details, see [`UUID`](uuid.html).

## How does CockroachDB sort results when `ORDER BY` is not used?

When an [`ORDER BY`](query-order.html) clause is not used in a query, rows are processed or returned in a
non-deterministic order. "Non-deterministic" means that the actual order
can depend on the logical plan, the order of data on disk, the topology
of the CockroachDB cluster, and is generally variable over time.

## Why are my `INT` columns returned as strings in JavaScript?

In CockroachDB, all `INT`s are represented with 64 bits of precision, but JavaScript numbers only have 53 bits of precision. This means that large integers stored in CockroachDB are not exactly representable as JavaScript numbers. For example, JavaScript will round the integer `235191684988928001` to the nearest representable value, `235191684988928000`. Notice that the last digit is different. This is particularly problematic when using the `unique_rowid()` [function](functions-and-operators.html), since `unique_rowid()` nearly always returns integers that require more than 53 bits of precision to represent.

To avoid this loss of precision, Node's [`pg` driver](https://github.com/brianc/node-postgres) will, by default, return all CockroachDB `INT`s as strings.

{% include_cached copy-clipboard.html %}
~~~ javascript
// Schema: CREATE TABLE users (id INT DEFAULT unique_rowid(), name STRING);
pgClient.query("SELECT id FROM users WHERE name = 'Roach' LIMIT 1", function(err, res) {
  var idString = res.rows[0].id;
  // idString === '235191684988928001'
  // typeof idString === 'string'
});
~~~

To perform another query using the value of `idString`, you can simply use `idString` directly, even where an `INT` type is expected. The string will automatically be coerced into a CockroachDB `INT`.

{% include_cached copy-clipboard.html %}
~~~ javascript
pgClient.query("UPDATE users SET name = 'Ms. Roach' WHERE id = $1", [idString], function(err, res) {
  // All should be well!
});
~~~

If you instead need to perform arithmetic on `INT`s in JavaScript, you will need to use a big integer library like [Long.js](https://www.npmjs.com/package/long). Do _not_ use the built-in `parseInt` function.

{% include_cached copy-clipboard.html %}
~~~ javascript
parseInt(idString, 10) + 1; // WRONG: returns 235191684988928000
require('long').fromString(idString).add(1).toString(); // GOOD: returns '235191684988928002'
~~~

## Can I use CockroachDB as a key-value store?

{% include {{ page.version.version }}/faq/simulate-key-value-store.html %}

## Why are my deletes getting slower over time?

> I need to delete a large amount of data. I'm iteratively deleting a certain number of rows using a [`DELETE`](delete.html) statement with a [`LIMIT`](limit-offset.html) clause, but it's getting slower over time. Why?

CockroachDB relies on [multi-version concurrency control (MVCC)](architecture/storage-layer.html#mvcc) to process concurrent requests while guaranteeing [strong consistency](frequently-asked-questions.html#how-is-cockroachdb-strongly-consistent). As such, when you delete a row, it is not immediately removed from disk. The MVCC values for the row will remain until the garbage collection period defined by the [`gc.ttlseconds`](configure-replication-zones.html#gc-ttlseconds) variable in the applicable [zone configuration](show-zone-configurations.html) has passed.  By default, this period is 25 hours.

This means that with the default settings, each iteration of your `DELETE` statement must scan over all of the rows previously marked for deletion within the last 25 hours. This means that if you try to delete 10,000 rows 10 times within the same 25 hour period, the 10th command will have to scan over the 90,000 rows previously marked for deletion.

If you need to iteratively delete rows in constant time, you can [alter your zone configuration](configure-replication-zones.html#overview) and change `gc.ttlseconds` to a low value like 5 minutes (i.e., `300`), and run your `DELETE` statement once per GC interval. We strongly recommend returning `gc.ttlseconds` to the default value after your large deletion is completed.

For instructions showing how to delete specific rows, see [Delete specific rows](delete.html#delete-specific-rows).

## See also

- [Product FAQs](frequently-asked-questions.html)
- [Operational FAQS](operational-faqs.html)
