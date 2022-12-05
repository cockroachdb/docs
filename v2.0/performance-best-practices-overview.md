---
title: SQL Performance Best Practices
summary: Best practices for optimizing SQL performance in CockroachDB.
toc: true
---

This page provides best practices for optimizing SQL performance in CockroachDB.

{{site.data.alerts.callout_success}}
For a demonstration of some of these techniques, see [Performance Tuning](performance-tuning.html).
{{site.data.alerts.end}}

## Multi-Row DML Best Practices

### Use Multi-Row DML instead of Multiple Single-Row DMLs

For `INSERT`, `UPSERT`, and `DELETE` statements, a single multi-row DML is faster than multiple single-row DMLs. Whenever possible, use multi-row DML instead of multiple single-row DMLs.

For more information, see:

- [Insert Multiple Rows](insert.html#insert-multiple-rows-into-an-existing-table)
- [Upsert Multiple Rows](upsert.html#upsert-multiple-rows)
- [Delete Multiple Rows](delete.html#delete-specific-rows)
- [How to improve IoT application performance with multi-row DML](https://www.cockroachlabs.com/blog/multi-row-dml/)

### Use `TRUNCATE` instead of `DELETE` to Delete All Rows in a Table

The [`TRUNCATE`](truncate.html) statement removes all rows from a table by dropping the table and recreating a new table with the same name. This performs better than using `DELETE`, which performs multiple transactions to delete all rows.

## Bulk Insert Best Practices

### Use Multi-Row `INSERT` Statements for Bulk Inserts into Existing Tables

To bulk-insert data into an existing table, batch multiple rows in one multi-row `INSERT` statement and do not include the `INSERT` statements within a transaction. Experimentally determine the optimal batch size for your application by monitoring the performance for different batch sizes (10 rows, 100 rows, 1000 rows). For more information, see [Insert Multiple Rows](insert.html#insert-multiple-rows-into-an-existing-table).

### Use `IMPORT` instead of `INSERT` for Bulk Inserts into New Tables

To bulk-insert data into a brand new table, the [`IMPORT`](import.html) statement performs better than `INSERT`.

## Execute Statements in Parallel

CockroachDB supports parallel execution of [independent](parallel-statement-execution.html#when-to-use-parallel-statement-execution) [`INSERT`](insert.html), [`UPDATE`](update.html), [`UPSERT`](upsert.html), and [`DELETE`](delete.html) statements within a single [transaction](transactions.html). Executing statements in parallel helps reduce aggregate latency and improve performance. To execute statements in parallel, append the `RETURNING NOTHING` clause to the statements in a transaction. For more information, see [Parallel Statement Execution](parallel-statement-execution.html).

## Assign Column Families

A column family is a group of columns in a table that is stored as a single key-value pair in the underlying key-value store.

When a table is created, all columns are stored as a single column family. This default approach ensures efficient key-value storage and performance in most cases. However, when frequently updated columns are grouped with seldom updated columns, the seldom updated columns are nonetheless rewritten on every update. Especially when the seldom updated columns are large, it's therefore more performant to [assign them to a distinct column family](column-families.html).

## Interleave Tables

[Interleaving tables](interleave-in-parent.html) improves query performance by optimizing the key-value structure of closely related tables, attempting to keep data on the same key-value range if it's likely to be read and written together. This is particularly helpful if the tables are frequently joined on the columns that consist of the interleaving relationship.

## Unique ID Best Practices

A traditional approach for generating unique IDs is one of the following:

- Monotonically increase `INT` IDs by using transactions with roundtrip `SELECT`s.
- Use the [`SERIAL`](serial.html) pseudo-type for a column to generate random unique IDs.

The first approach does not take advantage of the parallelization possible in a distributed database like CockroachDB.

The bottleneck with the second approach is that IDs generated temporally near each other have similar values and are located physically near each other in a table. This can cause a hotspot for reads and writes in a table.

The best practice in CockroachDB is to generate unique IDs using the `UUID` type, which generates random unique IDs in parallel, thus improving performance.

### Use `UUID` to Generate Unique IDs

{% include {{ page.version.version }}/faq/auto-generate-unique-ids.html %}

### Use `INSERT` with the `RETURNING` Clause to Generate Unique IDs

If something prevents you from using `UUID` to generate unique IDs, you might resort to using `INSERT`s with `SELECT`s to return IDs. Instead, [use the `RETURNING` clause with the `INSERT` statement](insert.html#insert-and-return-values) for improved performance.

#### Generate Monotonically-Increasing Unique IDs

Suppose the table schema is as follows:

~~~ sql
> CREATE TABLE X (
	ID1 INT,
	ID2 INT,
	ID3 INT DEFAULT 1,
	PRIMARY KEY (ID1,ID2)
	);
~~~

The common approach would be to use a transaction with an `INSERT` followed by a `SELECT`:

~~~ sql
> BEGIN;

> INSERT INTO X VALUES (1,1,1)
  	ON CONFLICT (ID1,ID2)
  	DO UPDATE SET ID3=X.ID3+1;

> SELECT * FROM X WHERE ID1=1 AND ID2=1;

> COMMIT;
~~~

However, the performance best practice is to use a `RETURNING` clause with `INSERT` instead of the transaction:

~~~ sql
> INSERT INTO X VALUES (1,1,1),(2,2,2),(3,3,3)
	ON CONFLICT (ID1,ID2)
	DO UPDATE SET ID3=X.ID3 + 1
	RETURNING ID1,ID2,ID3;
~~~

#### Generate Random Unique IDs

Suppose the table schema is as follows:

~~~ sql
> CREATE TABLE X (
	ID1 INT,
	ID2 INT,
	ID3 INT DEFAULT unique_rowid(),
	PRIMARY KEY (ID1,ID2)
	);
~~~

The common approach to generate random Unique IDs is a transaction using a `SELECT` statement:

~~~ sql
> BEGIN;

> INSERT INTO X VALUES (1,1);

> SELECT * FROM X WHERE ID1=1 AND ID2=1;

> COMMIT;
~~~

However, the performance best practice is to use a `RETURNING` clause with `INSERT` instead of the transaction:

~~~ sql
> INSERT INTO X VALUES (1,1),(2,2),(3,3)
	RETURNING ID1,ID2,ID3;
~~~

## Indexes Best Practices

### Use Secondary Indexes

You can use secondary indexes to improve the performance of queries using columns not in a table's primary key. You can create them:

- At the same time as the table with the `INDEX` clause of [`CREATE TABLE`](create-table.html#create-a-table-with-secondary-and-inverted-indexes-new-in-v2-0). In addition to explicitly defined indexes, CockroachDB automatically creates secondary indexes for columns with the [Unique constraint](unique.html).
- For existing tables with [`CREATE INDEX`](create-index.html).
- By applying the Unique constraint to columns with [`ALTER TABLE`](alter-table.html), which automatically creates an index of the constrained columns.

To create the most useful secondary indexes, check out our [best practices](indexes.html#best-practices).

### Use Indexes for Faster Joins

CockroachDB supports both [merge joins](https://en.wikipedia.org/wiki/Sort-merge_join) and [hash joins](https://en.wikipedia.org/wiki/Hash_join). CockroachDB uses merge joins whenever possible because they are more performant than hash joins computationally and in terms of memory. However, merge joins are possible only when the tables being joined are indexed on the relevant columns; when this condition is not met, CockroachDB resorts to the slower hash joins.

#### Why are merge joins faster than hash joins?

Merge joins are computationally less expensive and do not require additional memory. They are performed on the indexed columns of two tables as follows:

- CockroachDB takes one row from each table and compares them.
- If the rows are equal, CockroachDB returns the rows.
- If the rows are not equal, CockroachDB discards the lower-value row and repeats the process with the next row until all rows are processed.

In contrast, hash joins are computationally expensive and require additional memory. They are performed on two tables as follows:

- CockroachDB creates an in-memory hash table on the smaller table.
- CockroachDB then uses the hash table and scans the larger table to find matching rows from the smaller table.

#### Why create indexes to perform merge joins?

A merge join requires both tables to be indexed on the merge columns. In case this condition is not met, CockroachDB resorts to the slower hash joins. So while using `JOIN` on two tables, first create indexes on the tables and then use the `JOIN` operator.

Also note that merge joins can be used only with [distributed query processing](https://www.cockroachlabs.com/blog/local-and-distributed-processing-in-cockroachdb/).

### Drop Unused Indexes

Though indexes improve read performance, they incur an overhead for every write. In some cases, like the use cases discussed above, the tradeoff is worth it. However, if an index is unused, it slows down DML operations. Therefore, [drop unused indexes](drop-index.html) whenever possible.

## Join Best Practices

See [Join Performance Best Practices](joins.html#performance-best-practices).

## Subquery Best Practices

See [Subquery Performance Best Practices](subqueries.html#performance-best-practices).

## Table Scans Best Practices

### Avoid `SELECT *` for Large Tables

For large tables, avoid table scans (that is, reading the entire table data) whenever possible. Instead, define the required fields in a `SELECT` statement.

#### Example

Suppose the table schema is as follows:

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

~~~ sql
> SELECT * FROM ACCOUNTS;
~~~

This query retrieves all data stored in the table. A more efficient query would be:

~~~ sql
 > SELECT CUSTOMER, BALANCE FROM ACCOUNTS;
~~~

This query returns the account balances of the customers.

### Avoid `SELECT DISTINCT` for Large Tables

`SELECT DISTINCT` allows you to obtain unique entries from a query by removing duplicate entries. However, `SELECT DISTINCT` is computationally expensive. As a performance best practice, use [`SELECT` with the `WHERE` clause](select-clause.html#filter-rows) instead.

### Use `AS OF SYSTEM TIME` to Decrease Conflicts with Long-Running Queries

If you have long-running queries (such as analytics queries that perform full table scans) that can tolerate slightly out-of-date reads, consider using the [`... AS OF SYSTEM TIME` clause](select-clause.html#select-historical-data-time-travel). Using this, your query returns data as it appeared at a distinct point in the past and will not cause [conflicts](architecture/transaction-layer.html#transaction-conflicts) with other concurrent transactions, which can increase your application's performance.

However, because `AS OF SYSTEM TIME` returns historical data, your reads might be stale.

## Understanding and Avoiding Transaction Contention

Transaction contention occurs when the following three conditions are met:

- There are multiple concurrent transactions or statements (sent by
  multiple clients connected simultaneously to a single CockroachDB
  cluster).
- They operate on the same data, specifically over table rows with the
  same index key values (either on [primary keys](primary-key.html) or
  secondary [indexes](indexes.html), or via
  [interleaving](interleave-in-parent.html)) or using index key values
  that are close to each other, and thus place the indexed data on the
  same [data ranges](architecture/index.html).
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
