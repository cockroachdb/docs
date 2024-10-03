##### Exact staleness reads and long-running writes

Long-running write transactions will create [write intents]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#write-intents) with a timestamp near when the transaction began. When an exact staleness follower read encounters a write intent, it will often end up in a ["transaction wait queue"]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#txnwaitqueue), waiting for the operation to complete; however, this runs counter to the benefit exact staleness reads provide.

To counteract this, you can issue all follower reads in explicit [transactions set with `HIGH` priority]({% link {{ page.version.version }}/transactions.md %}#transaction-priorities):

```sql
BEGIN PRIORITY HIGH AS OF SYSTEM TIME follower_read_timestamp();
SELECT ...
SELECT ...
COMMIT;
```

##### Exact staleness read timestamps must be far enough in the past

If an exact staleness read is not using an [`AS OF SYSTEM TIME`]({% link {{ page.version.version }}/as-of-system-time.md %}) value far enough in the past, CockroachDB cannot perform a follower read. Instead, the read must access the [leaseholder replica]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-leaseholder). This adds network latency if the leaseholder is not the closest replica to the gateway node. Most users will [use the `follower_read_timestamp()` function]({% link {{ page.version.version }}/follower-reads.md %}#run-queries-that-use-exact-staleness-follower-reads) to get a timestamp far enough in the past that there is a high probability of getting a follower read.

##### Bounded staleness read limitations

Bounded staleness reads have the following limitations:

- They must be used in a [single-statement (aka implicit) transaction]({% link {{ page.version.version }}/transactions.md %}#individual-statements).
- They must read from a single row.
- They must not require an [index]({% link {{ page.version.version }}/indexes.md %}) [join]({% link {{ page.version.version }}/joins.md %}). In other words, the index used by the read query must be either a [primary]({% link {{ page.version.version }}/primary-key.md %}) [index]({% link {{ page.version.version }}/indexes.md %}), or some other index that covers the entire query by [`STORING`]({% link {{ page.version.version }}/create-index.md %}#store-columns) all columns.

For example, let's look at a read query that cannot be served as a bounded staleness read. We will use a [demo cluster]({% link {{ page.version.version }}/cockroach-demo.md %}), which automatically loads the [MovR dataset]({% link {{ page.version.version }}/movr.md %}).

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach demo
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT code FROM promo_codes AS OF SYSTEM TIME with_max_staleness('10s') LIMIT 1;
ERROR: unimplemented: cannot use bounded staleness for queries that may touch more than one row or require an index join
SQLSTATE: 0A000
HINT: You have attempted to use a feature that is not yet implemented.
See: https://go.crdb.dev/issue-v/67562/v23.2
~~~

As noted by the error message, this query cannot be served as a bounded staleness read because in this case it would touch more than one row. Even though we used a [`LIMIT 1` clause]({% link {{ page.version.version }}/limit-offset.md %}), the query would still have to touch more than one row in order to filter out the additional results.

We can verify that more than one row would be touched by issuing [`EXPLAIN`]({% link {{ page.version.version }}/explain.md %}) on the same query, but without the [`AS OF SYSTEM TIME`]({% link {{ page.version.version }}/as-of-system-time.md %}) clause:

{% include_cached copy-clipboard.html %}
~~~ sql
EXPLAIN SELECT code FROM promo_codes LIMIT 5;
~~~

~~~
                                     info
-------------------------------------------------------------------------------
  distribution: full
  vectorized: true

  • scan
    estimated row count: 1 (0.10% of the table; stats collected 1 minute ago)
    table: promo_codes@primary
    spans: LIMITED SCAN
    limit: 1
(8 rows)
~~~

The output verifies that this query performs a scan of the primary [index]({% link {{ page.version.version }}/indexes.md %}) on the `promo_codes` table, which is why it cannot be used for a bounded staleness read.

For an example showing how to successfully perform a bounded staleness read, see [Run queries that use bounded staleness follower reads]({% link {{ page.version.version }}/follower-reads.md %}#run-queries-that-use-bounded-staleness-follower-reads).
