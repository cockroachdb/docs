---
title: SQL FAQs
summary: Get answers to frequently asked questions about CockroachDB SQL.
toc: false
---

<div id="toc"></div>

## How do I bulk insert data into CockroachDB?

Currently, you can bulk insert data with batches of [`INSERT`](insert.html) statements not exceeding a few MB. The size of your rows determines how many you can use, but 1,000 - 10,000 rows typically works best. For more details, see [Import Data](https://www.cockroachlabs.com/docs/import-data.html).

## How do I auto-generate unique row IDs in CockroachDB?

{% include faq/auto-generate-unique-ids.html %}

## How do I get the last ID/SERIAL value inserted into a table?

There’s no function in CockroachDB for returning last inserted values, but you can use the [`RETURNING` clause](insert.html#insert-and-return-values) of the `INSERT` statement.

For example, this is how you’d use `RETURNING` to return an auto-generated [`SERIAL`](serial.html) value:

~~~ sql
> CREATE TABLE users (id SERIAL, name STRING);

> INSERT INTO users (name) VALUES ('mike') RETURNING id;
~~~

## Does CockroachDB support `JOIN`?

CockroachDB has basic, non-optimized support for SQL `JOIN`, whose performance we're working to improve.

To learn more, see our blog posts on CockroachDB's JOINs:
- [Modesty in Simplicity: CockroachDB's JOIN](https://www.cockroachlabs.com/blog/cockroachdbs-first-join/).
- [On the Way to Better SQL Joins](https://www.cockroachlabs.com/blog/better-sql-joins-in-cockroachdb/)

## When should I use interleaved tables?

[Interleaving tables](interleave-in-parent.html) improves query performance by optimizing the key-value structure of closely related tables, attempting to keep data on the same key-value range if it's likely to be read and written together.

{% include faq/when-to-interleave-tables.html %}

## Does CockroachDB support JSON or Protobuf datatypes?

Not currently, but [we plan to offer JSON/Protobuf datatypes](https://github.com/cockroachdb/cockroach/issues/2969).

## How do I know which index CockroachDB will select for a query?

To see which indexes CockroachDB is using for a given query, you can use the [`EXPLAIN`](explain.html) statement, which will print out the query plan, including any indexes that are being used:

~~~ sql
> EXPLAIN SELECT col1 FROM tbl1;
~~~

If you'd like to tell the query planner which index to use, you can do so via some [special syntax for index hints](select.html#force-index-selection-index-hints):

~~~ sql
> SELECT col1 FROM tbl1@idx1;
~~~

## How do I log SQL queries?

For production clusters, the best way to log queries is to turn on the [cluster-wide setting](cluster-settings.html) `sql.trace.log_statement_execute`:

~~~ sql
> SET CLUSTER SETTING sql.trace.log_statement_execute = true;
~~~

With this setting on, each node of the cluster writes all SQL queries it executes to its log file. When you no longer need to log queries, you can turn the setting back off:

~~~ sql
> SET CLUSTER SETTING sql.trace.log_statement_execute = false;
~~~

Alternatively, if you are testing CockroachDB locally and want to log queries executed just by a specific node, you can pass `--vmodule=executor=2` to the [`cockroach start`](start-a-node.html) command when starting the node. For example, to start a single node locally and log all SQL queries it executes, you'd run:

~~~ shell
$ cockroach start --insecure --host=localhost --vmodule=executor=2
~~~

## Does CockroachDB support a UUID type?

Not at this time, but storing a 16-byte array in a [`BYTES`](bytes.html) column should perform just as well.

## See Also

- [Product FAQs](frequently-asked-questions.html)
- [Operational FAQS](operational-faqs.html)
