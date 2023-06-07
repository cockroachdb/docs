---
title: SQL FAQs
summary: Get answers to frequently asked questions about CockroachDB SQL.
toc: true
toc_not_nested: true
docs_area: get_started
---

## How do I bulk insert data into CockroachDB?

- To bulk-insert data into an existing table, batch multiple rows in one [multi-row `INSERT`](insert.html#insert-multiple-rows-into-an-existing-table) statement and do not include the `INSERT` statements within a transaction. Experimentally determine the optimal batch size for your application by monitoring the performance for different batch sizes (10 rows, 100 rows, 1000 rows).

    {{site.data.alerts.callout_info}}
    You can also use the [`IMPORT INTO`](import-into.html) statement to bulk-insert CSV data into an existing table.
    {{site.data.alerts.end}}
- To bulk-insert data into a new table, the [`IMPORT`](import.html) statement performs better than `INSERT`. `IMPORT` can also be used to [migrate data from other databases](migration-overview.html) like MySQL, Oracle, and PostgreSQL.

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
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO users (name) VALUES ('mike') RETURNING id;
~~~

## What is transaction contention?

Transaction contention occurs when transactions issued from multiple clients at the same time
operate on the same data. This can cause transactions to wait on each other and decrease
performance, like when many people try to check out with the same cashier at a store.

For more information about contention, see [Transaction Contention](performance-best-practices-overview.html#transaction-contention).

## Does CockroachDB support `JOIN`?

[CockroachDB supports SQL joins](joins.html).

## Does CockroachDB support JSON or Protobuf datatypes?

Yes, the [`JSONB`](jsonb.html) data type is supported.

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

You can enable the CockroachDB [logging channels](logging-overview.html#logging-channels) that record SQL events.

## Does CockroachDB support a UUID type?

Yes. For more details, see [`UUID`](uuid.html).

## How does CockroachDB sort results when `ORDER BY` is not used?

When an [`ORDER BY`](order-by.html) clause is not used in a query, rows are processed or returned in a
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

## Does CockroachDB support full text search?

If you need full text search in a production environment, Cockroach Labs recommends that you use a search engine like [Elasticsearch](https://www.elastic.co/elasticsearch) or [Solr](https://solr.apache.org/). You can use CockroachDB [change data capture (CDC)](change-data-capture-overview.html) to set up a [changefeed](changefeed-messages.html) to keep Elasticsearch and Solr indexes synchronized to your CockroachDB tables.

Depending on your use case, you may be able to get by using [trigram indexes](trigram-indexes.html) to do fuzzy string matching and pattern matching. For more information about use cases for trigram indexes that could make having full text search unnecessary, see the 2022 blog post [Use cases for trigram indexes (when not to use Full Text Search)](https://www.cockroachlabs.com/blog/use-cases-trigram-indexes/).

For an example showing how to build a simplified full text indexing and search solution using CockroachDB's support for [generalized inverted indexes (also known as GIN indexes)](inverted-indexes.html), see the 2020 blog post [Full Text Indexing and Search in CockroachDB](https://www.cockroachlabs.com/blog/full-text-indexing-search/).

## See also

- [Product FAQs](frequently-asked-questions.html)
- [Operational FAQS](operational-faqs.html)
