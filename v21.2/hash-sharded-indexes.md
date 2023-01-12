---
title: Hash-sharded Indexes
summary: Hash-sharded indexes can eliminate single-range hot spots and improve write performance on sequentially-keyed indexes at a small cost to read performance
toc: true
docs_area: develop
---

If you are working with a table that must be indexed on sequential keys, you should use **hash-sharded indexes**. Hash-sharded indexes distribute sequential traffic uniformly across ranges, eliminating single-range hot spots and improving write performance on sequentially-keyed indexes at a small cost to read performance.

{% include common/experimental-warning.md %}

## How hash-sharded indexes work

CockroachDB automatically splits ranges of data in [the key-value store](architecture/storage-layer.html) based on [the size of the range](architecture/distribution-layer.html#range-splits), and on [the load streaming to the range](load-based-splitting.html). To split a range based on load, the system looks for a point in the range that evenly divides incoming traffic. If the range is indexed on a column of data that is sequential in nature (e.g., [an ordered sequence](sql-faqs.html#what-are-the-differences-between-uuid-sequences-and-unique_rowid), or a series of increasing, non-repeating [`TIMESTAMP`s](timestamp.html)), then all incoming writes to the range will be the last (or first) item in the index and appended to the end of the range. As a result, the system cannot find a point in the range that evenly divides the traffic, and the range cannot benefit from load-based splitting, creating a [hot spot](performance-best-practices-overview.html#hot-spots) at the single range.

Hash-sharded indexes solve this problem by distributing sequential data across multiple nodes within your cluster, eliminating hotspots. The trade-off to this, however, is a small performance impact on reading sequential data or ranges of data, as it's not guaranteed that sequentially close values will be on the same node.

Hash-sharded indexes create a physical `STORED` [computed column](computed-columns.html), known as a shard column. CockroachDB uses this shard column, as opposed to the sequential column in the index, to control the distribution of values across the index. The shard column is hidden by default but can be seen with [`SHOW COLUMNS`](show-columns.html). 

{{site.data.alerts.callout_danger}}
When dropping a hash-sharded index, the shard column will also be dropped. This will require a rewrite of the table.
{{site.data.alerts.end}}

For details about the mechanics and performance improvements of hash-sharded indexes in CockroachDB, see our [Hash Sharded Indexes Unlock Linear Scaling for Sequential Workloads](https://www.cockroachlabs.com/blog/hash-sharded-indexes-unlock-linear-scaling-for-sequential-workloads/) blog post.

## Create a hash-sharded index

To create a hash-sharded index, set the `experimental_enable_hash_sharded_indexes` [session variable](set-vars.html) to `on`. Then, add the optional [`USING HASH WITH BUCKET_COUNT = n_buckets` clause](sql-grammar.html#opt_hash_sharded) to a [`CREATE INDEX`](create-index.html) statement, to an [`INDEX` definition](sql-grammar.html#index_def) in a [`CREATE TABLE`](create-table.html) statement, or to an [`ALTER PRIMARY KEY`](alter-primary-key.html) statement. When this clause is used, CockroachDB creates `n_buckets` computed columns, shards the index into `n_buckets` shards, and then stores each index shard in the underlying key-value store with one of the computed column's hash as its prefix.

To change the bucket size of an existing hash-sharded primary key index, use an [`ALTER PRIMARY KEY`](alter-primary-key.html) statement with a [`USING HASH WITH BUCKET_COUNT = n_buckets` clause](sql-grammar.html#opt_hash_sharded) that specifies the new bucket size and the existing primary key columns.

## Examples

For an example of a hash-sharded index, see [Create a hash-sharded secondary index](create-index.html#create-a-hash-sharded-secondary-index).

## See also

- [Indexes](indexes.html)
- [`CREATE INDEX`](create-index.html)
