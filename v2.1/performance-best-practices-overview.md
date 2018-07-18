---
title: SQL Performance Best Practices
summary: Best practices for optimizing SQL performance in CockroachDB.
toc: true
---

This page provides best practices for optimizing SQL performance in CockroachDB.


## Multi-row DML best practices

### Use multi-row DML instead of multiple single-row DMLs

For `INSERT`, `UPSERT`, and `DELETE` statements, a single multi-row DML is faster than multiple single-row DMLs. Whenever possible, use multi-row DML instead of multiple single-row DMLs.

For more information, see:

- [Insert Multiple Rows](insert.html#insert-multiple-rows-into-an-existing-table)
- [Upsert Multiple Rows](upsert.html#upsert-multiple-rows)
- [Delete Multiple Rows](delete.html#delete-specific-rows)
- [How to improve IoT application performance with multi-row DML](https://www.cockroachlabs.com/blog/multi-row-dml/)

### Use `TRUNCATE` instead of `DELETE` to delete all rows in a table

The [`TRUNCATE`](truncate.html) statement removes all rows from a table by dropping the table and recreating a new table with the same name. This performs better than using `DELETE`, which performs multiple transactions to delete all rows.

## Bulk insert best tractices

### Use multi-row `INSERT` statements for bulk inserts into existing tables

To bulk-insert data into an existing table, batch multiple rows in one multi-row `INSERT` statement and do not include the `INSERT` statements within a transaction. Experimentally determine the optimal batch size for your application by monitoring the performance for different batch sizes (10 rows, 100 rows, 1000 rows). For more information, see [Insert Multiple Rows](insert.html#insert-multiple-rows-into-an-existing-table).

### Use `IMPORT` instead of `INSERT` for bulk inserts into new tables

To bulk-insert data into a brand new table, the [`IMPORT`](import.html) statement performs better than `INSERT`.

## Execute statements in parallel

CockroachDB supports parallel execution of [independent](parallel-statement-execution.html#when-to-use-parallel-statement-execution) [`INSERT`](insert.html), [`UPDATE`](update.html), [`UPSERT`](upsert.html), and [`DELETE`](delete.html) statements within a single [transaction](transactions.html). Executing statements in parallel helps reduce aggregate latency and improve performance. To execute statements in parallel, append the `RETURNING NOTHING` clause to the statements in a transaction. For more information, see [Parallel Statement Execution](parallel-statement-execution.html).

## Assign column families

A column family is a group of columns in a table that is stored as a single key-value pair in the underlying key-value store.

When a table is created, all columns are stored as a single column family. This default approach ensures efficient key-value storage and performance in most cases. However, when frequently updated columns are grouped with seldom updated columns, the seldom updated columns are nonetheless rewritten on every update. Especially when the seldom updated columns are large, it's therefore more performant to [assign them to a distinct column family](column-families.html).

## Interleave tables

[Interleaving tables](interleave-in-parent.html) improves query performance by optimizing the key-value structure of closely related tables, attempting to keep data on the same key-value range if it's likely to be read and written together. This is particularly helpful if the tables are frequently joined on the columns that consist of the interleaving relationship.

## Unique ID best practices

The common approach for generating unique IDs is one of the following:

 - Monotonically increase `INT` IDs by using transactions with roundtrip `SELECT`s
 - Use `SERIAL` variables to generate random unique IDs

The first approach does not take advantage of the parallelization possible in a distributed database like CockroachDB. The bottleneck with the second approach is that IDs generated temporally near each other have similar values and are located physically near each other in a table. This can cause a hotspot for reads and writes in a table.

The best practice in CockroachDB is to generate unique IDs using the `UUID` type, which generates random unique IDs in parallel, thus improving performance.

### Use `UUID` to generate unique IDs

{% include {{ page.version.version }}/faq/auto-generate-unique-ids.html %}

### Use `INSERT` with the `RETURNING` clause to generate unique IDs

If something prevents you from using `UUID` to generate unique IDs, you might resort to using `INSERT`s with `SELECT`s to return IDs. Instead, [use the `RETURNING` clause with the `INSERT` statement](insert.html#insert-and-return-values) for improved performance.

#### Generate monotonically-increasing unique IDs

Suppose the table schema is as follows:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE x (id1 INT, id2 INT, id3 INT DEFAULT 1, PRIMARY KEY (id1, id2));
~~~

The common approach would be to use a transaction with an `INSERT` followed by a `SELECT`:

{% include copy-clipboard.html %}
~~~ sql?nofmt
> BEGIN;

> INSERT
INTO
  x
VALUES
  (1, 1, 1)
ON CONFLICT
  (id1, id2)
DO
  UPDATE SET id3 = x.id3 + 1;

> SELECT * FROM x WHERE id1 = 1 AND id2 = 1;

> COMMIT;
~~~

However, the performance best practice is to use a `RETURNING` clause with `INSERT` instead of the transaction:

{% include copy-clipboard.html %}
~~~ sql
> INSERT
INTO
  x
VALUES
  (1, 1, 1), (2, 2, 2), (3, 3, 3)
ON CONFLICT
  (id1, id2)
DO
  UPDATE SET id3 = x.id3 + 1
RETURNING
  id1, id2, id3;
~~~

#### Generate random unique IDs

Suppose the table schema is as follows:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE x (id1 INT, id2 INT, id3 SERIAL, PRIMARY KEY (id1, id2));
~~~

The common approach to generate random Unique IDs is a transaction using a `SELECT` statement:

{% include copy-clipboard.html %}
~~~ sql?nofmt
> BEGIN;

> INSERT INTO x VALUES (1, 1);

> SELECT * FROM x WHERE id1 = 1 AND id2 = 1;

> COMMIT;
~~~

However, the performance best practice is to use a `RETURNING` clause with `INSERT` instead of the transaction:

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO x VALUES (1, 1), (2, 2), (3, 3) RETURNING id1, id2, id3;
~~~

## Indexes best practices

### Use secondary indexes

You can use secondary indexes to improve the performance of queries using columns not in a table's primary key. You can create them:

- At the same time as the table with the `INDEX` clause of [`CREATE TABLE`](create-table.html#create-a-table-with-secondary-and-inverted-indexes). In addition to explicitly defined indexes, CockroachDB automatically creates secondary indexes for columns with the [Unique constraint](unique.html).
- For existing tables with [`CREATE INDEX`](create-index.html).
- By applying the Unique constraint to columns with [`ALTER TABLE`](alter-table.html), which automatically creates an index of the constrained columns.

To create the most useful secondary indexes, check out our [best practices](indexes.html#best-practices).

### Use indexes for faster joins

See [Join Performance Best Practices](joins.html#performance-best-practices).

### Drop unused indexes

Though indexes improve read performance, they incur an overhead for every write. In some cases, like the use cases discussed above, the tradeoff is worth it. However, if an index is unused, it slows down DML operations. Therefore, [drop unused indexes](drop-index.html) whenever possible.

## Join best practices

See [Join Performance Best Practices](joins.html#performance-best-practices).

## Subquery best practices

See [Subquery Performance Best Practices](subqueries.html#performance-best-practices).

## Table scans best practices

### Avoid `SELECT *` for large tables

For large tables, avoid table scans (that is, reading the entire table data) whenever possible. Instead, define the required fields in a `SELECT` statement.

#### Example

Suppose the table schema is as follows:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE accounts (
	id INT,
	customer STRING,
	address STRING,
	balance INT
	nominee STRING
	);
~~~

Now if we want to find the account balances of all customers, an inefficient table scan would be:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM accounts;
~~~

This query retrieves all data stored in the table. A more efficient query would be:

{% include copy-clipboard.html %}
~~~ sql
 > SELECT customer, balance FROM accounts;
~~~

This query returns the account balances of the customers.

### Avoid `SELECT DISTINCT` for large tables

`SELECT DISTINCT` allows you to obtain unique entries from a query by removing duplicate entries. However, `SELECT DISTINCT` is computationally expensive. As a performance best practice, use [`SELECT` with the `WHERE` clause](select-clause.html#filter-rows) instead.

### Use `AS OF SYSTEM TIME` to decrease conflicts with long-running queries

If you have long-running queries (such as analytics queries that perform full table scans) that can tolerate slightly out-of-date reads, consider using the [`... AS OF SYSTEM TIME` clause](select-clause.html#select-historical-data-time-travel). Using this, your query returns data as it appeared at a distinct point in the past and will not cause [conflicts](architecture/transaction-layer.html#transaction-conflicts) with other concurrent transactions, which can increase your application's performance.

However, because `AS OF SYSTEM TIME` returns historical data, your reads might be stale.

## Understanding and avoiding transaction contention

Transaction contention occurs when the following three conditions are met:

- There are multiple concurrent transactions or statements (sent by
  multiple clients connected simultaneously to a single CockroachDB
  cluster).
- They operate on the same data, specifically over table rows with the
  same index key values (either on [primary keys](primary-key.html) or
  secondary [indexes](indexes.html), or via
  [interleaving](interleave-in-parent.html)) or using index key values
  that are close to each other, and thus place the indexed data on the
  same [data ranges](architecture/overview.html).
- At least some of the transactions write or modify the data.

A set of transactions that all contend on the same keys will be
limited in performance to the maximum processing speed of a single
node (limited horizontal scalability). Non-contended transactions are
not affected in this way.

There are two levels of contention:

- Transactions that operate on the same range but different index key
  values will be limited by the overall hardware capacity of a single
  node (the range lease holder).

- Transactions that operate on the same index key values
  (specifically, that operate on the same [column
  family](column-families.html) for a given index key) will be more
  strictly serialized to obey transaction isolation semantics.

Transaction contention can also increase the rate of transaction
restarts, and thus make the proper implementation of [client-side
transaction
retries](transactions.html#client-side-transaction-retries) more
critical.

To avoid contention, multiple strategies can be applied:

- Use index key values with a more random distribution of values, so
  that transactions over different rows are more likely to operate on
  separate data ranges. See the [SQL FAQs](sql-faqs.html) on row IDs for
  suggestions.

- Make transactions smaller, so that each transaction has less work to
  do. In particular, avoid multiple client-server exchanges per
  transaction. For example, use [common table
  expressions](common-table-expressions.html) to group multiple
  [`SELECT`](select-clause.html) and
  [`INSERT`](insert.html)/[`UPDATE`](update.html)/[`DELETE`](delete.html)/[`UPSERT`](upsert.html)
  clauses together in a single SQL statement.

- When replacing values in a row, use [`UPSERT`](upsert.html) and
  specify values for all columns in the inserted rows. This will
  usually have the best performance under contention, compared to
  combinations of [`SELECT`](select-clause.html),
  [`INSERT`](insert.html), and [`UPDATE`](update.html).

- Increase
  [normalization](https://en.wikipedia.org/wiki/Database_normalization)
  of the data to place parts of the same records that are modified by
  different transactions in different tables. Note however that this
  is a double-edged sword, because denormalization can also increase
  performance by creating multiple copies of often-referenced data in
  separate ranges.

- If the application strictly requires operating on very few different
  index key values, consider using [`ALTER ... SPLIT
  AT`](split-at.html) so that each index key value can be served by
  a separate group of nodes in the cluster.

It is always best to avoid contention as much as possible via the
design of the schema and application. However, sometimes contention is
unavoidable. To maximize performance in the presence of contention,
you'll need to maximize the performance of a single range.
To achieve this, multiple strategies can be applied:

- Minimize the network distance between the replicas of a range,
  possibly using zone configs and partitioning.
- Use the fastest storage devices available.
- If the contending transactions operate on different keys within the
  same range, add more CPU power (more cores) per node. Note however
  that this is less likely to provide an improvement if the
  transactions all operate on the same key.
