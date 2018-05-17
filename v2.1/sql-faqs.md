---
title: SQL FAQs
summary: Get answers to frequently asked questions about CockroachDB SQL.
toc: false
toc_not_nested: true
---

<div id="toc"></div>

## How do I bulk insert data into CockroachDB?

Currently, you can bulk insert data with batches of [`INSERT`](insert.html) statements not exceeding a few MB. The size of your rows determines how many you can use, but 1,000 - 10,000 rows typically works best. For more details, see [Import Data](import-data.html).

## How do I auto-generate unique row IDs in CockroachDB?

{% include faq/auto-generate-unique-ids_v1.1.html %}

## How do I generate unique, slowly increasing sequential numbers in CockroachDB?

{% include faq/sequential-numbers.md %}

## What are the differences between `UUID`, sequences, and `unique_rowid()`?

{% include faq/differences-between-numberings.md %}

## How do I order writes to a table to closely follow time in CockroachDB?

{% include faq/sequential-transactions.md %}

## How do I get the last ID/SERIAL value inserted into a table?

There’s no function in CockroachDB for returning last inserted values, but you can use the [`RETURNING` clause](insert.html#insert-and-return-values) of the `INSERT` statement.

For example, this is how you’d use `RETURNING` to return an auto-generated [`SERIAL`](serial.html) value:

~~~ sql
> CREATE TABLE users (id SERIAL, name STRING);

> INSERT INTO users (name) VALUES ('mike') RETURNING id;
~~~

## What is transaction contention?

Transaction contention occurs when the following three conditions hold
together:

- There are multiple concurrent transactions or statements (sent by
  multiple clients connected simultaneously to a single CockroachDB
  cluster).
- They operate on the same data, specifically
  over table rows with the same index key values (either on [primary
  keys](primary-key.html) or secondary [indexes](indexes.html)) or using
  index key values that are close to each other, and thus place the
  indexed data on the same [data ranges](architecture/overview.html).
- At least some of the transactions write or modify the data.

Transaction contention will cause contended transactions to be
restricted in performance to the maximum processing speed of a single
node (limited horizontal scalability). Non-contended transactions are not
affected in this way.

There are two levels of contention:

- Transactions that operate on the same range but different index key
  values will be limited by the overall hardware capacity of a single
  node (the range lease holder). Performance can increase if CockroachDB
  can utilize multiple hardware processors, i.e. some horizontal
  scalability via multi-core parallelism is possible.

- Transactions that operate on the same index key values
  (specifically, that operate on the same [column
  family](column-families.html) for a given index key) will be more
  strictly serialized to obey transaction isolation semantics. In that
  case, performance will likely not increase with multiple cores.

Transaction contention can also increase the rate of transaction
restarts, and thus make the proper implementation of [client-side
transaction
retries](transactions.html#client-side-transaction-retries) more
critical.

To avoid contention, multiple strategies can be applied:

- Use index key values with a more random distribution of values, so
  that transactions over different rows are more likely to operate on
  separate data ranges. See the previous FAQs on row IDs for
  suggestions.

- Increase
  [normalization](https://en.wikipedia.org/wiki/Database_normalization)
  of the data to place parts of the same records that are modified by
  different transactions in different tables.

- If the application strictly requires operating on very few different
  primary key values, consider using [`ALTER ... SPLIT
  AT`](split-at.html) so that each index key value can be served by
  a separate group of nodes in the cluster.

- Make transactions smaller, so that each transaction has less work to
  do. In particular, avoid multiple client-server exchanges per
  transaction. For example, use [common table
  expressions](common-table-expressions.html) to group multiple
  [`SELECT`](select-clause.html) and
  [`INSERT`](insert.html)/[`UPDATE`](update.html)/[`DELETE`](delete.html)/[`UPSERT`](upsert.html)
  clauses together in a single SQL statement.

## Does CockroachDB support `JOIN`?

[CockroachDB supports uncorrelated SQL joins](joins.html).  We are
working to improve their execution performance.

At this time, `LATERAL` (correlated) joins are not yet supported.

## When should I use interleaved tables?

[Interleaving tables](interleave-in-parent.html) improves query performance by optimizing the key-value structure of closely related tables, attempting to keep data on the same key-value range if it's likely to be read and written together.

{% include faq/when-to-interleave-tables.html %}

## Does CockroachDB support JSON or Protobuf datatypes?

Yes, as of v2.0, the [`JSONB`](jsonb.html) data type is supported.

## How do I know which index CockroachDB will select for a query?

To see which indexes CockroachDB is using for a given query, you can use the [`EXPLAIN`](explain.html) statement, which will print out the query plan, including any indexes that are being used:

~~~ sql
> EXPLAIN SELECT col1 FROM tbl1;
~~~

If you'd like to tell the query planner which index to use, you can do so via some [special syntax for index hints](table-expressions.html#force-index-selection):

~~~ sql
> SELECT col1 FROM tbl1@idx1;
~~~

## How do I log SQL queries?

{% include faq/sql-query-logging.md %}

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

~~~ javascript
// Schema: CREATE TABLE users (id INT DEFAULT unique_rowid(), name STRING);
pgClient.query("SELECT id FROM users WHERE name = 'Roach' LIMIT 1", function(err, res) {
  var idString = res.rows[0].id;
  // idString === '235191684988928001'
  // typeof idString === 'string'
});
~~~

To perform another query using the value of `idString`, you can simply use `idString` directly, even where an `INT` type is expected. The string will automatically be coerced into a CockroachDB `INT`.

~~~ javascript
pgClient.query("UPDATE users SET name = 'Ms. Roach' WHERE id = $1", [idString], function(err, res) {
  // All should be well!
});
~~~

If you instead need to perform arithmetic on `INT`s in JavaScript, you will need to use a big integer library like [Long.js](https://www.npmjs.com/package/long). Do _not_ use the built-in `parseInt` function.

~~~ javascript
parseInt(idString, 10) + 1; // WRONG: returns 235191684988928000
require('long').fromString(idString).add(1).toString(); // GOOD: returns '235191684988928002'
~~~

## See Also

- [Product FAQs](frequently-asked-questions.html)
- [Operational FAQS](operational-faqs.html)
