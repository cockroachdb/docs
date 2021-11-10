CockroachDB's optimizer cannot plan {% if page.name == "cost-based-optimizer.md" %} locality-optimized searches {% else %} [locality-optimized searches](cost-based-optimizer.html#locality-optimized-search-in-multi-region-clusters) {% endif %} for queries that use [partitioned unique indexes](partitioning.html#partition-using-secondary-index) on [virtual computed columns](computed-columns.html#virtual-computed-columns).

The workaround is to make the virtual computed column a [stored computed columns](computed-columns.html#stored-computed-columns) instead.

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/68129)
