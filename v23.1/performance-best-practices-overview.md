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
Large multi-row `INSERT` queries can lead to long-running transactions that result in [transaction retry errors](transaction-retry-error-reference.html). If a multi-row `INSERT` query results in an error code [`40001` with the message `transaction deadline exceeded`](transaction-retry-error-reference.html#retry_commit_deadline_exceeded), we recommend breaking up the query up into smaller batches of rows.
{{site.data.alerts.end}}

### Use `IMPORT` instead of `INSERT` for bulk-inserts into new tables

To bulk-insert data into a brand new table, the [`IMPORT`](import.html) statement performs better than `INSERT`.

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
1. Generating monotonically increasing [`INT`](int.html) IDs by using transactions with roundtrip [`SELECT`](select-clause.html)s, e.g., `INSERT INTO tbl (id, …) VALUES ((SELECT max(id)+1 FROM tbl), …)`. This has a **very high performance cost** since it makes all [`INSERT`](insert.html) transactions wait for their turn to insert the next ID. You should only do this if your application really does require strict ID ordering. In some cases, using [Change Data Capture (CDC)](change-data-capture-overview.html) can help avoid the requirement for strict ID ordering. If you can avoid the requirement for strict ID ordering, you can use one of the higher performance ID strategies outlined below.

The approaches described above are likely to create hot spots for both reads and writes in CockroachDB. To avoid this issue, we recommend the following approaches (listed in order from best to worst performance).

| Approach                                                                             | Pros                                             | Cons                                                                                    |
|--------------------------------------------------------------------------------------+--------------------------------------------------+-----------------------------------------------------------------------------------------|
| 1. [Use multi-column primary keys](#use-multi-column-primary-keys)                   | Potentially fastest, if done right               | Complex, requires up-front design and testing to ensure performance                     |
| 2. [Use `UUID` to generate unique IDs](#use-uuid-to-generate-unique-ids)             | Good performance; spreads load well; easy choice | May leave some performance on the table; requires other columns to be useful in queries |
| 3. [Use `INSERT` with the `RETURNING` clause](#use-insert-with-the-returning-clause-to-generate-unique-ids) | Easy to query against; familiar design           | Slower performance than the other options; higher chance of [transaction contention](#transaction-contention)      |

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

<a id="understanding-and-avoiding-transaction-contention"></a>

## Transaction contention

Transactions that operate on the *same index key values* (specifically, that operate on the same [column family](column-families.html) for a given index key) are strictly serialized to obey transaction isolation semantics. To maintain this isolation, writing transactions ["lock" rows](architecture/transaction-layer.html#writing) to prevent hazardous interactions with concurrent transactions.

*Transaction contention* occurs when the following three conditions are met:

- There are multiple concurrent transactions or statements (sent by multiple clients connected simultaneously to a single CockroachDB cluster).
- They operate on table rows with the _same index key values_ (either on [primary keys](primary-key.html) or secondary [indexes](indexes.html)).
- At least one of the transactions modifies the data.

[When transactions are experiencing contention](performance-recipes.html#indicators-that-your-application-is-experiencing-transaction-contention), you may observe: 

- [Delays in query completion](query-behavior-troubleshooting.html#hanging-or-stuck-queries). This occurs when multiple transactions are trying to write to the same "locked" data at the same time, making a transaction unable to complete. This is also known as *lock contention*.
- [Transaction retries](transactions.html#automatic-retries) performed automatically by CockroachDB. This occurs if a transaction cannot be placed into a [serializable ordering](demo-serializable.html) among all of the currently-executing transactions.
- [Transaction retry errors](transaction-retry-error-reference.html), which are emitted to your client when an automatic retry is not possible or fails. Your application must address transaction retry errors with [client-side retry handling](transaction-retry-error-reference.html#client-side-retry-handling).
- [Cluster hot spots](#hot-spots).

To mitigate these effects, [reduce the causes of transaction contention](performance-best-practices-overview.html#reduce-transaction-contention) and [reduce hot spots](#reduce-hot-spots). For further background on transaction contention, see [What is Database Contention, and Why Should You Care?](https://www.cockroachlabs.com/blog/what-is-database-contention/).

### Reduce transaction contention

You can reduce the causes of transaction contention:

{% include {{ page.version.version }}/performance/reduce-contention.md %}

### Improve transaction performance by sizing and configuring the cluster

To maximize transaction performance, you'll need to maximize the performance of a single [range](architecture/glossary.html#architecture-range). To achieve this, you can apply multiple strategies:

- Minimize the network distance between the [replicas of a range](architecture/overview.html#architecture-replica), possibly using [zone configs](configure-replication-zones.html) and [partitioning](partitioning.html), or the newer [Multi-region SQL capabilities](multiregion-overview.html).
- Use the fastest [storage devices](recommended-production-settings.html#storage) available.
- If the contending transactions operate on different keys within the same range, add [more CPU power (more cores) per node](recommended-production-settings.html#sizing). However, if the transactions all operate on the same key, this may not provide an improvement.

## Hot spots

A *hot spot* is any location on the cluster receiving significantly more requests than another. Hot spots are a symptom of *resource contention* and can create problems as requests increase, including excessive [transaction contention](#transaction-contention).

[Hot spots occur](performance-recipes.html#indicators-that-your-cluster-has-hot-spots) when an imbalanced workload access pattern causes significantly more reads and writes on a subset of data. For example:

- Transactions operate on the **same range but different index keys**. These operations are limited by the overall hardware capacity of [the range leaseholder](architecture/overview.html#cockroachdb-architecture-terms) node.
- A range is indexed on a column of data that is sequential in nature (e.g., [an ordered sequence](sql-faqs.html#what-are-the-differences-between-uuid-sequences-and-unique_rowid), or a series of increasing, non-repeating [`TIMESTAMP`s](timestamp.html)), such that all incoming writes to the range will be the last (or first) item in the index and appended to the end of the range. Because the system is unable to find a split point in the range that evenly divides the traffic, the range cannot benefit from [load-based splitting](load-based-splitting.html). This creates a hot spot at the single range.

Read hot spots can occur if you perform lots of scans of a portion of a table index or a single key.

### Reduce hot spots

{% include {{ page.version.version }}/performance/reduce-hot-spots.md %}

## See also

- If you aren't sure whether SQL query performance needs to be improved on your cluster, see [Identify slow queries](query-behavior-troubleshooting.html#identify-slow-queries).
- For deployment and data location techniques to minimize network latency in multi-region clusters, see [Topology Patterns](topology-patterns.html).
- To read more about SQL best practices, see our [SQL Performance Best Practices](https://www.cockroachlabs.com/blog/sql-performance-best-practices/) blog post.
