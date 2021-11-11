CockroachDB's optimizer cannot plan {% if page.name == "cost-based-optimizer.md" %} locality-optimized searches {% else %} [locality-optimized searches](cost-based-optimizer.html#locality-optimized-search-in-multi-region-clusters) {% endif %} for queries that use [partitioned unique indexes](partitioning.html#partition-using-secondary-index) on [virtual computed columns](computed-columns.html#virtual-computed-columns). 

Locality-optimized searches will also not be planned for queries that use partitioned unique [expression indexes](expression-indexes.html).

A workaround for computed columns is to make the virtual computed column a [stored computed column](computed-columns.html#stored-computed-columns) instead.

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/68129)
