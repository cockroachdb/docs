---
title: SQL Performance Best Practices
summary: Best practices for optimizing SQL performance in CockroachDB.
toc: true
docs_area: develop
---

This page provides best practices for optimizing query performance in CockroachDB.

## DML best practices

### Use multi-row statements instead of multiple single-row statements

For `INSERT`, `UPSERT`, and `DELETE` statements, a single multi-row statement is faster than multiple single-row statements. Whenever possible, use multi-row statements for DML queries instead of multiple single-row statements.

For more information, see:

- [Insert Data](insert-data.html)
- [Update Data](update-data.html)
- [Delete Data](delete-data.html)
- [How to improve IoT application performance with multi-row DML](https://www.cockroachlabs.com/blog/multi-row-dml/)

### Use `UPSERT` instead of `INSERT ON CONFLICT` on tables with no secondary indexes

When inserting/updating all columns of a table, and the table has no secondary
indexes, Cockroach Labs recommends using an [`UPSERT`](upsert.html) statement instead of the
equivalent [`INSERT ON CONFLICT`](insert.html) statement. Whereas `INSERT ON
CONFLICT` always performs a read to determine the necessary writes, the `UPSERT`
statement writes without reading, making it faster. For tables with secondary
indexes, there is no performance difference between `UPSERT` and `INSERT ON
CONFLICT`.

This issue is particularly relevant when using a simple SQL table of two columns
to [simulate direct KV access](sql-faqs.html#can-i-use-cockroachdb-as-a-key-value-store).
In this case, be sure to use the `UPSERT` statement.

## Bulk-insert best practices

### Use multi-row `INSERT` statements for bulk-inserts into existing tables

To bulk-insert data into an existing table, batch multiple rows in one multi-row `INSERT` statement. Experimentally determine the optimal batch size for your application by monitoring the performance for different batch sizes (10 rows, 100 rows, 1000 rows). Do not include bulk `INSERT` statements within an explicit transaction.

{{site.data.alerts.callout_success}}
You can also use the [`IMPORT INTO`](import-into.html) statement to bulk-insert CSV data into an existing table.
{{site.data.alerts.end}}

For more information, see [Insert Multiple Rows](insert.html#insert-multiple-rows-into-an-existing-table).

{{site.data.alerts.callout_info}}
Large multi-row `INSERT` queries can lead to long-running transactions that result in [transaction retry errors](transaction-retry-error-reference.html). If a multi-row `INSERT` query results in an error code [`40001` with the message `"transaction deadline exceeded"`](transaction-retry-error-reference.html#retry_commit_deadline_exceeded), we recommend breaking up the query up into smaller batches of rows.
{{site.data.alerts.end}}

### Use `IMPORT` instead of `INSERT` for bulk-inserts into new tables

To bulk-insert data into a brand new table, the [`IMPORT`](import.html) statement performs better than `INSERT`.

## Bulk-update best practices

### Use batch updates to delete a large number of rows

To delete a large number of rows, we recommend iteratively deleting batches of rows until all of the unwanted rows are deleted. For an example, see [Bulk-update Data](bulk-update-data.html).

## Bulk-delete best practices

### Use `TRUNCATE` instead of `DELETE` to delete all rows in a table

The [`TRUNCATE`](truncate.html) statement removes all rows from a table by dropping the table and recreating a new table with the same name. This performs better than using `DELETE`, which performs multiple transactions to delete all rows.

### Use batch deletes to delete a large number of rows

To delete a large number of rows, we recommend iteratively deleting batches of rows until all of the unwanted rows are deleted. For an example, see [Bulk-delete Data](bulk-delete-data.html).

### Batch delete "expired" data

{% include {{page.version.version}}/sql/row-level-ttl.md %}

For more information, see [Batch delete expired data with Row-Level TTL](row-level-ttl.html).

## Assign column families

A column family is a group of columns in a table that is stored as a single key-value pair in the underlying key-value store.

When a table is created, all columns are stored as a single column family. This default approach ensures efficient key-value storage and performance in most cases. However, when frequently updated columns are grouped with seldom updated columns, the seldom updated columns are nonetheless rewritten on every update. Especially when the seldom updated columns are large, it's therefore more performant to [assign them to a distinct column family](column-families.html).

## Unique ID best practices

The best practices for generating unique IDs in a distributed database like CockroachDB are very different than for a legacy single-node database. Traditional approaches for generating unique IDs for legacy single-node databases include:

1. Using the [`SERIAL`](serial.html) pseudo-type for a column to generate random unique IDs. This can result in a performance bottleneck because IDs generated temporally near each other have similar values and are located physically near each other in a table's storage.
2. Generating monotonically increasing [`INT`](int.html) IDs by using transactions with roundtrip [`SELECT`](select-clause.html)s, e.g., `INSERT INTO tbl (id, …) VALUES ((SELECT max(id)+1 FROM tbl), …)`. This has a **very high performance cost** since it makes all [`INSERT`](insert.html) transactions wait for their turn to insert the next ID. You should only do this if your application really does require strict ID ordering. In some cases, using [Change Data Capture (CDC)](change-data-capture-overview.html) can help avoid the requirement for strict ID ordering. If you can avoid the requirement for strict ID ordering, you can use one of the higher performance ID strategies outlined below.

The approaches described above are likely to create hot spots for both reads and writes in CockroachDB. To avoid this issue, we recommend the following approaches (listed in order from best to worst performance).

| Approach                                                                             | Pros                                             | Cons                                                                                    |
|--------------------------------------------------------------------------------------+--------------------------------------------------+-----------------------------------------------------------------------------------------|
| 1. [Use multi-column primary keys](#use-multi-column-primary-keys)                   | Potentially fastest, if done right               | Complex, requires up-front design and testing to ensure performance                     |
| 2. [Use `UUID` to generate unique IDs](#use-uuid-to-generate-unique-ids)             | Good performance; spreads load well; easy choice | May leave some performance on the table; requires other columns to be useful in queries |
| 3. [Use `INSERT` with the `RETURNING` clause](#use-insert-with-the-returning-clause-to-generate-unique-ids) | Easy to query against; familiar design           | Slower performance than the other options; higher chance of transaction contention      |

### Use multi-column primary keys

A well-designed multi-column primary key can yield even better performance than a [UUID primary key](#use-uuid-to-generate-unique-ids), but it requires more up-front schema design work. To get the best performance, ensure that any monotonically increasing field is located **after** the first column of the primary key. When done right, such a composite primary key should result in:

- Enough randomness in your primary key to spread the table data / query load relatively evenly across the cluster, which will avoid hot spots. By "enough randomness" we mean that the prefix of the primary key should be relatively uniformly distributed over its domain. Its domain should have at least as many elements as you have nodes.
- A monotonically increasing column that is part of the primary key (and thus indexed) which is also useful in your queries.

For example, consider a social media website. Social media posts are written by users, and on login the user's last 10 posts are displayed. A good choice for a primary key might be `(username, post_timestamp)`. For example:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE posts (
    username STRING,
    post_timestamp TIMESTAMP,
    post_id INT,
    post_content STRING,
    CONSTRAINT posts_pk PRIMARY KEY(username, post_timestamp)
);
~~~

This would make the following query efficient.

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM posts
          WHERE username = 'alyssa'
       ORDER BY post_timestamp DESC
          LIMIT 10;
~~~

~~~
  username |      post_timestamp       | post_id | post_content
+----------+---------------------------+---------+--------------+
  alyssa   | 2019-07-31 18:01:00+00:00 |    ...  | ...
  alyssa   | 2019-07-30 10:22:00+00:00 |    ...  | ...
  alyssa   | 2019-07-30 09:12:00+00:00 |    ...  | ...
  alyssa   | 2019-07-29 13:48:00+00:00 |    ...  | ...
  alyssa   | 2019-07-29 13:47:00+00:00 |    ...  | ...
  alyssa   | 2019-07-29 13:46:00+00:00 |    ...  | ...
  alyssa   | 2019-07-29 13:43:00+00:00 |    ...  | ...
  ...

Time: 924µs
~~~

To see why, let's look at the [`EXPLAIN`](explain.html) output. It shows that the query is fast because it does a point lookup on the indexed column `username` (as shown by the line `spans | /"alyssa"-...`). Furthermore, the column `post_timestamp` is already in an index, and sorted (since it's a monotonically increasing part of the primary key).

{% include_cached copy-clipboard.html %}
~~~ sql
> EXPLAIN (VERBOSE)
    SELECT * FROM posts
            WHERE username = 'alyssa'
         ORDER BY post_timestamp DESC
            LIMIT 10;
~~~

~~~
                              info
----------------------------------------------------------------
  distribution: local
  vectorized: true

  • revscan
    columns: (username, post_timestamp, post_id, post_content)
    ordering: -post_timestamp
    estimated row count: 10 (missing stats)
    table: posts@posts_pk
    spans: /"alyssa"-/"alyssa"/PrefixEnd
    limit: 10
(10 rows)

Time: 1ms total (execution 1ms / network 0ms)
~~~

Note that the above query also follows the [indexing best practice](indexes.html#best-practices) of indexing all columns in the `WHERE` clause.

### Use `UUID` to generate unique IDs

{% include {{ page.version.version }}/faq/auto-generate-unique-ids.html %}

### Use `INSERT` with the `RETURNING` clause to generate unique IDs

If something prevents you from using [multi-column primary keys](#use-multi-column-primary-keys) or [`UUID`s](#use-uuid-to-generate-unique-ids) to generate unique IDs, you might resort to using `INSERT`s with `SELECT`s to return IDs. Instead, [use the `RETURNING` clause with the `INSERT` statement](insert.html#insert-and-return-values) as shown below for improved performance.

#### Generate monotonically-increasing unique IDs

Suppose the table schema is as follows:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE X (
	ID1 INT,
	ID2 INT,
	ID3 INT DEFAULT 1,
	PRIMARY KEY (ID1,ID2)
  );
~~~

The common approach would be to use a transaction with an `INSERT` followed by a `SELECT`:

{% include_cached copy-clipboard.html %}
~~~ sql
> BEGIN;

> INSERT INTO X VALUES (1,1,1)
  	ON CONFLICT (ID1,ID2)
  	DO UPDATE SET ID3=X.ID3+1;

> SELECT * FROM X WHERE ID1=1 AND ID2=1;

> COMMIT;
~~~

However, the performance best practice is to use a `RETURNING` clause with `INSERT` instead of the transaction:

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO X VALUES (1,1,1),(2,2,2),(3,3,3)
	ON CONFLICT (ID1,ID2)
	DO UPDATE SET ID3=X.ID3 + 1
	RETURNING ID1,ID2,ID3;
~~~

#### Generate random unique IDs

Suppose the table schema is as follows:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE X (
	ID1 INT,
	ID2 INT,
	ID3 INT DEFAULT unique_rowid(),
	PRIMARY KEY (ID1,ID2)
  );
~~~

The common approach to generate random Unique IDs is a transaction using a `SELECT` statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> BEGIN;

> INSERT INTO X VALUES (1,1);

> SELECT * FROM X WHERE ID1=1 AND ID2=1;

> COMMIT;
~~~

However, the performance best practice is to use a `RETURNING` clause with `INSERT` instead of the transaction:

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO X VALUES (1,1),(2,2),(3,3)
	RETURNING ID1,ID2,ID3;
~~~

## Secondary index best practices

See [Secondary Index Best Practices](schema-design-indexes.html#best-practices).

## Join best practices

See [Join Performance Best Practices](joins.html#performance-best-practices).

## Subquery best practices

See [Subquery Performance Best Practices](subqueries.html#performance-best-practices).

## Authorization best practices

See [Authorization Best Practices](security-reference/authorization.html#authorization-best-practices).

## Table scan best practices

### Avoid `SELECT *` for large tables

For large tables, avoid table scans (that is, reading the entire table data) whenever possible. Instead, define the required fields in a `SELECT` statement.

#### Example

Suppose the table schema is as follows:

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM ACCOUNTS;
~~~

This query retrieves all data stored in the table. A more efficient query would be:

{% include_cached copy-clipboard.html %}
~~~ sql
 > SELECT CUSTOMER, BALANCE FROM ACCOUNTS;
~~~

This query returns the account balances of the customers.

### Avoid `SELECT DISTINCT` for large tables

`SELECT DISTINCT` allows you to obtain unique entries from a query by removing duplicate entries. However, `SELECT DISTINCT` is computationally expensive. As a performance best practice, use [`SELECT` with the `WHERE` clause](select-clause.html#filter-rows) instead.

### Use `AS OF SYSTEM TIME` to decrease conflicts with long-running queries

If you have long-running queries (such as analytics queries that perform full table scans) that can tolerate slightly out-of-date reads, consider using the [`... AS OF SYSTEM TIME` clause](select-clause.html#select-historical-data-time-travel). Using this, your query returns data as it appeared at a distinct point in the past and will not cause [conflicts](architecture/transaction-layer.html#transaction-conflicts) with other concurrent transactions, which can increase your application's performance.

However, because `AS OF SYSTEM TIME` returns historical data, your reads might be stale.

## Hot spots

A *hot spot* is any location on the cluster receiving significantly more requests than another. Hot spots can cause problems as requests increase.

They commonly occur with transactions that operate on the **same range but different index keys**, which are limited by the overall hardware capacity of [the range leaseholder](architecture/overview.html#cockroachdb-architecture-terms) node.

A hot spot can occur on a range that is indexed on a column of data that is sequential in nature (e.g., [an ordered sequence](sql-faqs.html#what-are-the-differences-between-uuid-sequences-and-unique_rowid), or a series of increasing, non-repeating [`TIMESTAMP`s](timestamp.html)), such that all incoming writes to the range will be the last (or first) item in the index and appended to the end of the range. Because the system is unable to find a split point in the range that evenly divides the traffic, the range cannot benefit from [load-based splitting](load-based-splitting.html). This creates a hot spot at the single range.

Read hot spots can occur if you perform lots of scans of a portion of a table index or a single key.

### Find hot spots

To track down the nodes experiencing hot spots, use the [Hot Ranges page](ui-hot-ranges-page.html) and [Range Report](ui-hot-ranges-page.html#range-report).

### Reduce hot spots

To reduce hot spots:

- Use index keys with a random distribution of values, so that transactions over different rows are more likely to operate on separate data ranges. See the [SQL FAQs](sql-faqs.html#how-do-i-auto-generate-unique-row-ids-in-cockroachdb) on row IDs for suggestions.

- Place parts of the records that are modified by different transactions in different tables. That is, increase [normalization](https://en.wikipedia.org/wiki/Database_normalization). However, there are benefits and drawbacks to increasing normalization.

    - Benefits:

        - Allows separate transactions to modify related underlying data without causing contention.
        - Can improve performance for read-heavy workloads.

    - Drawbacks:

        - More complex data model.
        - Increases the chance of data inconsistency.
        - Increases data redundancy.
        - Can degrade performance for write-heavy workloads.

- If the application strictly requires operating on very few different index keys, consider using [`ALTER ... SPLIT AT`](split-at.html) so that each index key can be served by a separate group of nodes in the cluster.

- If you are working with a table that **must** be indexed on sequential keys, consider using [hash-sharded indexes](hash-sharded-indexes.html). For details about the mechanics and performance improvements of hash-sharded indexes in CockroachDB, see the blog post [Hash Sharded Indexes Unlock Linear Scaling for Sequential Workloads](https://www.cockroachlabs.com/blog/hash-sharded-indexes-unlock-linear-scaling-for-sequential-workloads/). As part of this, we recommend doing thorough performance testing with and without hash-sharded indexes to see which works best for your application.

- To avoid read hot spots:

    - Increase data distribution, which will allow for more ranges. The hot spot exists because the data being accessed is all co-located in one range.
    - Increase load balancing across more nodes in the same range. Most transactional reads must go to the leaseholder in CockroachDB, which means that opportunities for load balancing over replicas are minimal.

        However, the following features do permit load balancing over replicas:

        - Global tables
        - Follower reads (both the bounded staleness and the exact staleness kinds)

        In these cases, more replicas will help, up to the number of nodes in the cluster. They all only help with reads, and they all come with their own tradeoffs.

<a id="understanding-and-avoiding-transaction-contention"></a>

## Transaction contention

Transactions that operate on the _same index key values_ (specifically, that operate on the same [column family](column-families.html) for a given index key) are strictly serialized to obey transaction isolation semantics. To maintain this isolation, writing transactions "lock" rows to prevent hazardous interactions with concurrent transactions. However, locking can lead to processing delays if multiple transactions are trying to access the same "locked" data at the same time. This is referred to as _transaction_ (or _lock_) _contention_.

Transaction contention occurs when the following three conditions are met:

- There are multiple concurrent transactions or statements (sent by multiple clients connected simultaneously to a single CockroachDB cluster).
- They operate on table rows with the _same index key values_ (either on [primary keys](primary-key.html) or secondary [indexes](indexes.html)).
- At least one of the transactions modify the data.

Transactions that experience contention typically show delays in completion or restarts. The possibility of transaction restarts requires clients to implement [transaction retries](transactions.html#client-side-intervention).

For further background on transaction contention, see [What is Database Contention, and Why Should You Care?](https://www.cockroachlabs.com/blog/what-is-database-contention/).

### Find transaction contention

{% include {{ page.version.version }}/performance/statement-contention.md %}

<a id="avoid-transaction-contention"></a>

### Reduce transaction contention

To reduce transaction contention:

- Make transactions smaller, so that each transaction has less work to do. In particular, avoid multiple client-server exchanges per transaction. For example, use [common table expressions](common-table-expressions.html) to group multiple [`SELECT`](select-clause.html) and [`INSERT`](insert.html), [`UPDATE`](update.html), [`DELETE`](delete.html), and [`UPSERT`](upsert.html) clauses together in a single SQL statement.

  - For an example showing how to break up large transactions in an application, see [Break up large transactions into smaller units of work](build-a-python-app-with-cockroachdb-sqlalchemy.html#break-up-large-transactions-into-smaller-units-of-work).
  - If you are experiencing contention (retries) when doing bulk deletes, see [Bulk-delete data](bulk-delete-data.html).

- [Send all of the statements in your transaction in a single batch](transactions.html#batched-statements) so that CockroachDB can automatically retry the transaction for you.

- Use the [`SELECT FOR UPDATE`](select-for-update.html) statement in scenarios where a transaction performs a read and then updates the row(s) it just read. The statement orders transactions by controlling concurrent access to one or more rows of a table. It works by locking the rows returned by a [selection query](selection-queries.html), such that other transactions trying to access those rows are forced to wait for the transaction that locked the rows to finish. These other transactions are effectively put into a queue that is ordered based on when they try to read the value of the locked row(s).

- When replacing values in a row, use [`UPSERT`](upsert.html) and specify values for all columns in the inserted rows. This will usually have the best performance under contention, compared to combinations of [`SELECT`](select-clause.html), [`INSERT`](insert.html), and [`UPDATE`](update.html).

### Improve transaction performance by sizing and configuring the cluster

To maximize transaction performance, you'll need to maximize the performance of a single range. To achieve this, you can apply multiple strategies:

- Minimize the network distance between the replicas of a range, possibly using zone configs and partitioning.
- Use the fastest storage devices available.
- If the contending transactions operate on different keys within the same range, add more CPU power (more cores) per node. However, if the transactions all operate on the same key, this may not provide an improvement.

## See also

If you aren't sure whether SQL query performance needs to be improved on your cluster, see [Identify slow queries](query-behavior-troubleshooting.html#identify-slow-queries).

For deployment and data location techniques to minimize network latency in multi-region clusters, see [Topology Patterns](topology-patterns.html).
