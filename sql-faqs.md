---
title: SQL FAQs
summary: Get answers to frequently asked questions about CockroachDB SQL.
toc: false
---

<div id="toc"></div>

## How do I bulk insert data into CockroachDB?

Currently, you can bulk insert data with batches of [`INSERT`](insert.html) statements not exceeding a few MB. The size of your rows determines how many you can use, but 1,000 - 10,000 rows typically works best. For more details, see [Import Data](https://www.cockroachlabs.com/docs/import-data.html).

## How do I auto-generate unique row IDs in CockroachDB?

To auto-generate unique row IDs, use the [`SERIAL`](serial.html) data type, which is an alias for [`INT`](int.html) with the `unique_rowid()` [function](functions-and-operators.html#id-generation-functions) as the [default value](default-value.html):

~~~ sql
> CREATE TABLE test (id SERIAL PRIMARY KEY, name STRING);
~~~

On insert, the `unique_rowid()` function generates a default value from the timestamp and ID of the node executing the insert, a combination that is likely to be globally unique except in extreme cases where a very large number of IDs (100,000+) are generated per node per second. In such cases, you should use a [`BYTES`](bytes.html) column with the `uuid_v4()` function as the default value instead:

~~~ sql
> CREATE TABLE test (id BYTES PRIMARY KEY DEFAULT uuid_v4(), name STRING);
~~~

Because `BYTES` values are 128-bit, much larger than `INT` values at 64-bit, there is virtually no chance of generating non-unique values.

The distribution of IDs at the key-value level may also be a consideration. When using `BYTES` with `uuid_v4()` as the default value, consecutively generated IDs will be spread across different key-value ranges (and therefore likely across different nodes), whereas when using `INT` with `unique_rowid()` as the default value, consecutively generated IDs may end up in the same key-value range.

## Does CockroachDB support `JOIN`?

CockroachDB has basic, non-optimized support for SQL `JOIN`, whose performance we're working to improve.

To learn more, see our blog posts on CockroachDB's JOINs:
- [Modesty in Simplicity: CockroachDB's JOIN](https://www.cockroachlabs.com/blog/cockroachdbs-first-join/).
- [On the Way to Better SQL Joins](https://www.cockroachlabs.com/blog/better-sql-joins-in-cockroachdb/)

## When should I use interleaved tables?

Interleaving tables improves query performance by optimizing the key-value structure of closely related tables, attempting to keep data on the same key-value range if it's likely to be read and written together.

You're most likely to benefit from interleaved tables when:

  - Your tables form a [hierarchy](interleave-in-parent.html#interleaved-hierarchy)
  - Queries maximize the [benefits of interleaving](interleave-in-parent.html#benefits)
  - Queries do not suffer too greatly from interleaving's [tradeoffs](interleave-in-parent.html#tradeoffs)

## Does CockroachDB support JSON or Protobuf datatypes?

Not currently, but [we plan to offer JSON/Protobuf datatypes](https://github.com/cockroachdb/cockroach/issues/2969).

## How do I get the last ID/SERIAL value inserted into a table?

There’s no function in CockroachDB for returning last inserted values, but you can use the [`RETURNING` clause](insert.html#insert-and-return-values) of the `INSERT` statement.

For example, this is how you’d use `RETURNING` to return an auto-generated [`SERIAL`](serial.html) value:

~~~ sql
> CREATE TABLE users (id SERIAL, name STRING);

> INSERT INTO users (name) VALUES ('mike') RETURNING id;
~~~

## How do I know which index CockroachDB will select for a query?

To see which indexes CockroachDB is using for a given query, you can use the [`EXPLAIN`](explain.html) statement, which will print out the query plan, including any indexes that are being used:

~~~ sql
> EXPLAIN SELECT col1 FROM tbl1;
~~~

If you'd like to tell the query planner which index to use, you can do so via some [special syntax for index hints](select.html#force-index-selection-index-hints):

~~~ sql
> SELECT col1 FROM tbl1@idx1;
~~~

## Does CockroachDB support a UUID type?

Not at this time, but storing a 16-byte array in a [`BYTES`](bytes.html) column should perform just as well.
