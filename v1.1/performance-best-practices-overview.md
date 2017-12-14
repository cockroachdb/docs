---
title: SQL Performance Best Practices
summary: Learn performance best practices for CockroachDB
toc: false
---

This page lists the SQL performance best practices for CockroachDB.

<div id="toc"></div>

## Multi-Row DML Best Practices

### Use Multi-Row DML instead of Multiple Single-Row DMLs

For `INSERT`, `UPSERT`, and `DELETE` statements, a single multi-row DML is faster than multiple single-row DMLs. Whenever possible, use multi-row DML instead of multiple single-row DMLs. To understand why that is so, let's understand single-row DMLs and multi-row DMLs are executed in CockroachDB:

#### Single-row DML execution in CockroachDB

<img src="{{ 'images/insert_singleton_detail.png' | relative_url }}" alt="CockroachDB single-row DML execution" style="border:1px solid #eee;max-width:100%" />

#### How Multi-row DML works with CockroachDB




For more information, see:

- [Insert Multiple Rows](insert.html#insert-multiple-rows)
- [Upsert that Inserts Multiple Rows](upsert.html#upsert-that-inserts-multiple-rows)
- [Delete Multiple Rows](delete.html#delete-specific-rows)
- [How to improve IoT application performance with multi-row DML](https://www.cockroachlabs.com/blog/multi-row-dml/)

### Bulk Insert Best Practices

#### Use Multi-Row `INSERT` Statements for Bulk Inserts into Existing Tables

To bulk-insert data into an existing table, batch 100 rows in one multi-row `INSERT` statement at a time, and do not include the `INSERT` statements within a transaction. 

#### Use `IMPORT` instead of `INSERT` for Bulk Inserts into New Tables

To bulk-insert data into a brand new table, the (experimental) [`IMPORT`](import.html) statement performs better than `INSERT`.

### Use `TRUNCATE` instead of `DELETE` to Delete All Rows in a Large Table

The [`TRUNCATE` statement](truncate.html) removes all rows from a table by dropping the table and recreating a new table with the same name. For large tables, this is much more performant than deleting each of the rows. However, for smaller tables, it's more performant to use a [DELETE statement without a WHERE clause](delete.html#delete-all-rows).

## Assign Column Families

A column family is a group of columns in a table that is stored as a single key-value pair in the underlying key-value store. 

When a table is created, all columns are stored as a single column family. This default approach ensures efficient key-value storage and performance in most cases. However, when frequently updated columns are grouped with seldom updated columns, the seldom updated columns are nonetheless rewritten on every update. Especially when the seldom updated columns are large, it's more performant to split them into a distinct family. [Assigning column families](column-families.html) reduces the number of keys results in a smaller storage overhead and improves performance during `INSERT`, `UPDATE`, and `DELETE` operations. 

## Execute Statements in Parallel

CockroachDB supports parallel execution of [independent](parallel-statement-execution.html#when-to-use-parallel-statement-execution) [`INSERT`](insert.html), [`UPDATE`](update.html), [`UPSERT`](upsert.html), and [`DELETE`](delete.html) statements within a single [transaction](transactions.html). Executing statements in parallel helps reduce aggregate latency and improve performance. To execute statements in parallel, append the `RETURNING NOTHING` clause to the statements in a transaction. For more information, see [Parallel Statement Execution](parallel-statement-execution.html)

## Interleave Tables

[Interleaving tables](interleave-in-parent.html) improves query performance by optimizing the key-value structure of closely related tables, attempting to keep data on the same key-value range if it's likely to be read and written together. This is particularly helpful if the tables are frequently joined on the columns that consist of the interleaving relationship.

## Unique ID Best Practices

The common practice to generate unique IDs includes using transactions with roundtrip `SELECT` to generate monotonically-increasing unique IDs by incrementing an `INT` variable, or generate random unique IDs by using `SERIAL` variables. These common approaches of generating unique IDs hamper performance when used with a distributed database like CockroachDB, because the process of generating unique IDs using these approaches is serial, and CockroachDB improves performance by parallelizing processes whenever possible. The best practice to generate unique IDs with CockroachDB is to use `UUID`. Because the unique IDs generated using `UUID` are random, the process can be parallelized, thus improving performance.

### Use `UUID` to Generate Unique IDs

{% include faq/auto-generate-unique-ids_v1.1.html %}

### Use `INSERT` with the `RETURNING` Clause to Generate Unique IDs

If, for some reason, you cannot use `UUID` to generate the unique IDs, then you might resort to the common practice to generate unique IDs is to use roundtrip `SELECT` in a transaction. Instead, for improved performance, [use the `RETURNING` clause with the `INSERT` statement](insert.html#insert-and-return-values) instead.

#### Generate Monotonically-Increasing Unique IDs

Suppose the table schema is as follows:

~~~ sql
> CREATE TABLE X (
ID1 INT,
ID2 INT,
ID3 INT DEFAULT 1,
PRIMARY KEY (ID1,ID2));
~~~

The common approach to generate monotonically-increasing Unique IDs is a transaction using the `SELECT` statement:

~~~ sql
> BEGIN;

> INSERT INTO X VALUES (1,1,1)

> ON CONFLICT (ID1,ID2)

> DO UPDATE SET ID3=X.ID3+1;

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
ID3 SERIAL,
PRIMARY KEY (ID1,ID2));
~~~

The common approach to generate random Unique IDs is a transaction using the `SELECT` statement:

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

You can improve the performance of queries using columns besides the primary key with secondary indexes. You can create them:

- At the same time as the table with the `INDEX` clause of [`CREATE TABLE`](create-table.html#create-a-table-with-secondary-indexes). In addition to explicitly defined indexes, CockroachDB automatically creates secondary indexes for columns with the [Unique constraint](unique.html).
- For existing tables with [`CREATE INDEX`](create-index.html).
- By applying the Unique constraint to columns with [`ALTER TABLE`](alter-table.html), which automatically creates an index of the constrained columns.

To create the most useful secondary indexes, check out our [best practices](indexes.html#best-practices).

### Create Indexes before Performing `JOIN` Operation

CockroachDB supports both [merge joins](https://en.wikipedia.org/wiki/Sort-merge_join) and [hash joins](https://en.wikipedia.org/wiki/Hash_join). While performing the [`JOIN`](table-expressions.html#join-expressions) operation, CockroachDB uses the merge join instead of the hash join whenever possible, because merge joins are computationally and memory-wise better performant than hash joins. 

#### Why are merge joins faster than hash joins?

Merge joins are performed on the indexed columns of two tables: CockroachDB takes one row from each table, compares them, and returns the rows if they are equal. If the rows are not equal, CockroachDB discards the lower-value row and the repeats the process with the next row, till all rows are processed. Merge join is a fast operation that doesn’t require additional memory. On the other hand, while performing hash joins on two tables, CockroachDB first creates an in-memory hash table on the smaller table. It then uses the hash table and scans the larger table to find matching rows from the smaller table. This process is computationally expensive and requires additional memory. Hence, whenever possible, CockroachDB uses the faster merge joins instead of hash joins.

#### Why create indexes to perform merge joins?

Merge joins requires both tables to be indexed on the merge columns. In case this condition is not met, CockroachDB resorts to the slower hash joins. So while using `JOIN` on two tables, first create indexes on the tables and then use the `JOIN` operator.

Also note that merge `JOIN`s can be used only with [distributed query processing](https://www.cockroachlabs.com/blog/local-and-distributed-processing-in-cockroachdb/). 

### Drop Unused Indexes

Though indexes improve the read performance, they incur an overhead for every write. In some cases, like the use-cases discussed abpve, the tradeoff is worth it. But if an index is unused, it slows down DML operations. Whenever possible, [drop indexes](drop-index.html) that are not used.

## Table Scans Best Practices

### Avoid `SELECT *` for Large Tables

For large tables, avoid table scans (that is, reading the entire table data) whenever possible. Instead, define the required fields in the `SELECT` statement.

#### Example

Suppose the table schema is as follows:

~~~ sql
> CREATE TABLE accounts 
(id INT, 
customer STRING, 
address STRING,
balance INT
nominee STRING);
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
`SELECT DISTINCT` allows you to obtain unique entries from a query by removing duplicate entries. However, `SELECT DISTINCT` is computationally expensive. As a performance best practice, use [`SELECT` with the `WHERE` clause](select.html#filter-rows) instead of `SELECT DISTINCT`.