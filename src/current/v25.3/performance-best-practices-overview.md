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

- [Insert Data]({% link {{ page.version.version }}/insert-data.md %})
- [Update Data]({% link {{ page.version.version }}/update-data.md %})
- [Delete Data]({% link {{ page.version.version }}/delete-data.md %})
- [How to improve IoT application performance with multi-row DML](https://www.cockroachlabs.com/blog/multi-row-dml/)

### Use `UPSERT` instead of `INSERT ON CONFLICT` on tables with no secondary indexes

{% include {{page.version.version}}/sql/insert-vs-upsert.md %}

## Bulk-insert best practices

### Use multi-row `INSERT` statements for bulk-inserts into existing tables

To bulk-insert data into an existing table, batch multiple rows in one multi-row `INSERT` statement. Experimentally determine the optimal batch size for your application by monitoring the performance for different batch sizes (10 rows, 100 rows, 1000 rows). Do not include bulk `INSERT` statements within an explicit transaction.

{{site.data.alerts.callout_success}}
You can also use the [`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %}) statement to bulk-insert CSV data into an existing table.
{{site.data.alerts.end}}

For more information, see [Insert Multiple Rows]({% link {{ page.version.version }}/insert.md %}#insert-multiple-rows-into-an-existing-table).

{{site.data.alerts.callout_info}}
Large multi-row `INSERT` queries can lead to long-running transactions that result in [transaction retry errors]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}). If a multi-row `INSERT` query results in an error code [`40001` with the message `transaction deadline exceeded`]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}#retry_commit_deadline_exceeded), we recommend breaking up the query up into smaller batches of rows.
{{site.data.alerts.end}}

## Bulk-delete best practices

### Use `TRUNCATE` instead of `DELETE` to delete all rows in a table

The [`TRUNCATE`]({% link {{ page.version.version }}/truncate.md %}) statement removes all rows from a table by dropping the table and recreating a new table with the same name. This performs better than using `DELETE`, which performs multiple transactions to delete all rows.

### Use batch deletes to delete a large number of rows

To delete a large number of rows, we recommend iteratively deleting batches of rows until all of the unwanted rows are deleted. For an example, see [Bulk-delete Data]({% link {{ page.version.version }}/bulk-delete-data.md %}).

### Batch delete "expired" data

{% include {{page.version.version}}/sql/row-level-ttl.md %}

For more information, see [Batch delete expired data with Row-Level TTL]({% link {{ page.version.version }}/row-level-ttl.md %}).

## Assign column families

A column family is a group of columns in a table that is stored as a single key-value pair in the underlying key-value store.

When a table is created, all columns are stored as a single column family. This default approach ensures efficient key-value storage and performance in most cases. However, when frequently updated columns are grouped with seldom updated columns, the seldom updated columns are nonetheless rewritten on every update. Especially when the seldom updated columns are large, it's therefore more performant to [assign them to a distinct column family]({% link {{ page.version.version }}/column-families.md %}).

## Unique ID best practices

The best practices for generating unique IDs in a distributed database like CockroachDB are very different than for a single-node database.

To create unique and non-sequential IDs, we recommend the following approaches (listed in order from best to worst performance):

| Approach                                                                                                    | Pros                                             | Cons                                                                                                          |
|-------------------------------------------------------------------------------------------------------------+--------------------------------------------------+---------------------------------------------------------------------------------------------------------------|
| 1. [Use multi-column primary keys](#use-multi-column-primary-keys)                                          | Potentially fastest, if done right               | Complex, requires up-front design and testing to ensure performance                                           |
| 2. [Use functions to generate unique IDs](#use-functions-to-generate-unique-ids)                            | Good performance; spreads load well; easy choice | May leave some performance on the table; requires other columns to be useful in queries                       |
| 3. [Use `INSERT` with the `RETURNING` clause](#use-insert-with-the-returning-clause-to-generate-unique-ids) | Easy to query against; familiar design           | Slower performance than the other options; higher chance of [transaction contention](#transaction-contention) |

Traditional approaches using monotonically increasing [`INT`]({% link {{ page.version.version }}/int.md %}) or [`SERIAL`]({% link {{ page.version.version }}/serial.md %}) data types will create [hotspots](#hotspots) for both reads and writes in a distributed database like CockroachDB. {% include {{page.version.version}}/performance/use-hash-sharded-indexes.md %}

### Use multi-column primary keys

A well-designed multi-column primary key can yield even better performance than a [UUID primary key](#use-functions-to-generate-unique-ids), but it requires more up-front schema design work. To get the best performance, ensure that any monotonically increasing field is located **after** the first column of the primary key. When done right, such a composite primary key should result in:

- Enough randomness in your primary key to spread the table data / query load relatively evenly across the cluster, which will avoid hotspots. By "enough randomness" we mean that the prefix of the primary key should be relatively uniformly distributed over its domain. Its domain should have at least as many elements as you have nodes.
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

To see why, let's look at the [`EXPLAIN`]({% link {{ page.version.version }}/explain.md %}) output. It shows that the query is fast because it does a point lookup on the indexed column `username` (as shown by the line `spans | /"alyssa"-...`). Furthermore, the column `post_timestamp` is already in an index, and sorted (since it's a monotonically increasing part of the primary key).

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

Note that the above query also follows the [indexing best practice]({% link {{ page.version.version }}/indexes.md %}#best-practices) of indexing all columns in the `WHERE` clause.

### Use functions to generate unique IDs

{% include {{ page.version.version }}/faq/auto-generate-unique-ids.md %}

### Use `INSERT` with the `RETURNING` clause to generate unique IDs

If something prevents you from using [multi-column primary keys](#use-multi-column-primary-keys) or [`UUID`s](#use-functions-to-generate-unique-ids) to generate unique IDs, you might resort to using `INSERT`s with `SELECT`s to return IDs. Instead, [use the `RETURNING` clause with the `INSERT` statement]({% link {{ page.version.version }}/insert.md %}#insert-and-return-values) as shown below for improved performance.

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

See [Secondary Index Best Practices]({% link {{ page.version.version }}/schema-design-indexes.md %}#best-practices).

## Join best practices

See [Join Performance Best Practices]({% link {{ page.version.version }}/joins.md %}#performance-best-practices).

## Subquery best practices

See [Subquery Performance Best Practices]({% link {{ page.version.version }}/subqueries.md %}#performance-best-practices).

## Authorization best practices

See [Authorization Best Practices]({% link {{ page.version.version }}/security-reference/authorization.md %}#authorization-best-practices).

## Table scan best practices

### Avoid `SELECT *` for large tables

For large tables, avoid table scans (that is, reading the entire table data) whenever possible. Instead, define the required fields in a `SELECT` statement.

For example, suppose the table schema is as follows:

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

`SELECT DISTINCT` allows you to obtain unique entries from a query by removing duplicate entries. However, `SELECT DISTINCT` is computationally expensive. As a performance best practice, use [`SELECT` with the `WHERE` clause]({% link {{ page.version.version }}/select-clause.md %}#filter-rows) instead.

### Use secondary indexes to optimize queries

See [Statement Tuning with `EXPLAIN`]({% link {{ page.version.version }}/sql-tuning-with-explain.md %}#issue-full-table-scans).

### Use `AS OF SYSTEM TIME` to decrease conflicts with long-running queries

If you have long-running queries (such as analytics queries that perform full table scans) that can tolerate slightly out-of-date reads, consider using the [`... AS OF SYSTEM TIME` clause]({% link {{ page.version.version }}/select-clause.md %}#select-historical-data-time-travel). Using this, your query returns data as it appeared at a distinct point in the past and will not cause [conflicts]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#transaction-conflicts) with other concurrent transactions, which can increase your application's performance.

However, because `AS OF SYSTEM TIME` returns historical data, your reads might be stale.

### Prevent the optimizer from planning full scans

To avoid overloading production clusters, there are several ways to prevent the [cost-based-optimizer]({% link {{ page.version.version }}/cost-based-optimizer.md %}) from generating query plans with [full table and index scans]({% link {{ page.version.version }}/ui-sql-dashboard.md %}#full-table-index-scans).

#### Use index hints to prevent full scans on tables

{% include {{ page.version.version }}/sql/no-full-scan.md %}

#### Disallow query plans that use full scans

When the `disallow_full_table_scans` [session setting]({% link {{page.version.version}}/set-vars.md %}#disallow-full-table-scans) is enabled, the optimizer will not plan full table or index scans on "large" tables (i.e., those with more rows than [`large_full_scan_rows`]({% link {{ page.version.version }}/set-vars.md %}#large-full-scan-rows)).

{% include {{ page.version.version }}/sql/disallow-full-table-scans.md %}

#### Disallow query plans that scan more than a number of rows

When the `transaction_rows_read_err` [session setting]({% link {{ page.version.version }}/set-vars.md %}#transaction-rows-read-err) is enabled, the [optimizer]({% link {{ page.version.version }}/cost-based-optimizer.md %}) will not create query plans with scans that exceed the specified row limit. See [Disallow transactions from reading or writing many rows](#disallow-transactions-from-reading-or-writing-many-rows).

### Disallow transactions from reading or writing many rows

{% include {{ page.version.version }}/sql/transactions-limit-rows.md %}

<a id="understanding-and-avoiding-transaction-contention"></a>

## Transaction contention

*Transaction contention* occurs when the following three conditions are met:

- There are multiple concurrent transactions or statements (sent by multiple clients connected simultaneously to a single CockroachDB cluster).
- They operate on table rows with the same index key values (either on [primary keys]({% link {{ page.version.version }}/primary-key.md %}) or secondary [indexes]({% link {{ page.version.version }}/indexes.md %})).
- At least one of the transactions holds a [write intent]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#write-intents) or exclusive [locking read]({% link {{ page.version.version }}/select-for-update.md %}#lock-strengths) on the data.

Writing transactions ["lock" rows]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#writing) to prevent interactions with concurrent transactions. Locking reads issued with [`SELECT ... FOR UPDATE`]({% link {{ page.version.version }}/select-for-update.md %}) perform a similar function by placing an [*exclusive lock*]({% link {{ page.version.version }}/select-for-update.md %}#lock-strengths) on rows, which can cause contention.

By default under [`SERIALIZABLE`]({% link {{ page.version.version }}/demo-serializable.md %}) isolation, transactions that operate on the same index key values (specifically, that operate on the same [column family]({% link {{ page.version.version }}/column-families.md %}) for a given index key) are strictly serialized. To maintain this isolation, `SERIALIZABLE` transactions [refresh their reads]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#read-refreshing) at commit time to verify that the values they read were not subsequently updated by other, concurrent transactions. If read refreshing is unsuccessful, then the transaction must be retried.

[When transactions are experiencing contention]({% link {{ page.version.version }}/performance-recipes.md %}#indicators-that-your-application-is-experiencing-transaction-contention), you may observe: 

- [Delays in query completion]({% link {{ page.version.version }}/query-behavior-troubleshooting.md %}#hanging-or-stuck-queries). This occurs when multiple transactions are trying to write to the same "locked" data at the same time, making a transaction unable to complete. This is also known as *lock contention*.
- [Transaction retries]({% link {{ page.version.version }}/transactions.md %}#automatic-retries) performed automatically by CockroachDB. This occurs if a transaction cannot be placed into a serializable ordering among all of the currently-executing transactions. This is also called a *serialization conflict*.
- [Transaction retry errors]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}), which are emitted to your client when an automatic retry is not possible or fails. Under `SERIALIZABLE` isolation, your application must address transaction retry errors with [client-side retry handling]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}#client-side-retry-handling).
- [Cluster hotspots](#hotspots).

To mitigate these effects, [reduce the causes of transaction contention]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#reduce-transaction-contention) and [reduce hotspots]({% link {{ page.version.version }}/understand-hotspots.md %}#reduce-hotspots). For further background on transaction contention, see [What is Database Contention, and Why Should You Care?](https://www.cockroachlabs.com/blog/what-is-database-contention/).

### Reduce transaction contention

You can reduce the causes of transaction contention:

{% include {{ page.version.version }}/performance/reduce-contention.md %}

### Improve transaction performance by sizing and configuring the cluster

To maximize transaction performance, you'll need to maximize the performance of a single [range]({% link {{ page.version.version }}/architecture/glossary.md %}#architecture-range). To achieve this, you can apply multiple strategies:

- Minimize the network distance between the [replicas of a range]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-replica), possibly using [zone configs]({% link {{ page.version.version }}/configure-replication-zones.md %}) and [partitioning]({% link {{ page.version.version }}/partitioning.md %}), or the newer [Multi-region SQL capabilities]({% link {{ page.version.version }}/multiregion-overview.md %}).
- Use the fastest [storage devices]({% link {{ page.version.version }}/recommended-production-settings.md %}#storage) available.
- If the contending transactions operate on different keys within the same range, add [more CPU power (more cores) per node]({% link {{ page.version.version }}/recommended-production-settings.md %}#sizing). However, if the transactions all operate on the same key, this may not provide an improvement.

## Hotspots

A *hotspot* is any location on the cluster receiving significantly more requests than another. Hotspots are a symptom of *resource contention* and can create problems as requests increase, including excessive [transaction contention](#transaction-contention).

For a detailed explanation of hotspot causes and mitigation strategies, refer to [Understand Hotspots]({% link {{ page.version.version }}/understand-hotspots.md %}).

## See also

- If you aren't sure whether SQL query performance needs to be improved on your cluster, see [Identify slow queries]({% link {{ page.version.version }}/query-behavior-troubleshooting.md %}#identify-slow-queries).
- For deployment and data location techniques to minimize network latency in multi-region clusters, see [Topology Patterns]({% link {{ page.version.version }}/topology-patterns.md %}).
- To read more about SQL best practices, see our [SQL Performance Best Practices](https://www.cockroachlabs.com/blog/sql-performance-best-practices/) blog post.
