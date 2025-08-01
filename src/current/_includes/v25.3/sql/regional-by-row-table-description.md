In a _regional by row_ table, each row is optimized for access from a specific home region. Each row's home region is specified in a hidden [`crdb_region` column]({% link {{ page.version.version }}/alter-table.md %}#crdb_region), which defaults to the region of the [gateway node]({% link {{ page.version.version }}/architecture/life-of-a-distributed-transaction.md %}#gateway) that inserted the row. The `REGIONAL BY ROW` setting automatically [partitions]({% link {{ page.version.version }}/partitioning.md %}) the table and all of [its indexes]({% link {{ page.version.version }}/table-localities.md %}#indexes-on-regional-by-row-tables) by region using `crdb_region` as the partition key prefix.

Use regional by row tables when individual rows are frequently accessed from a single region, and your application requires low-latency reads and writes at the row level. A typical `REGIONAL BY ROW` use case is the `users` table in the [MovR application]({% link {{ page.version.version }}/movr.md %}), where user data can be co-located with the user's region for better performance.

To take advantage of regional by row tables:

- Use unique key lookups or queries with [`LIMIT`]({% link {{ page.version.version }}/limit-offset.md %}) clauses to enable [locality optimized searches]({% link {{ page.version.version }}/cost-based-optimizer.md %}#locality-optimized-search-in-multi-region-clusters) that prioritize rows in the gateway node's region. If there is a possibility that the results of the query all live in local rows, CockroachDB will first search for rows in the gateway node's region. The search only continues in remote regions if rows in the local region did not satisfy the query.

- Use [foreign keys]({% link {{ page.version.version }}/foreign-key.md %}#rules-for-creating-foreign-keys) that reference the [`crdb_region` column]({% link {{ page.version.version }}/alter-table.md %}#crdb_region) in [`REGIONAL BY ROW`]({% link {{ page.version.version }}/table-localities.md %}#regional-by-row-tables) tables, unless [auto-rehoming is enabled]({% link {{ page.version.version }}/alter-table.md %}#turn-on-auto-rehoming-for-regional-by-row-tables) for those tables.

- [Turn on auto-rehoming for regional by row tables]({% link {{ page.version.version }}/alter-table.md %}#turn-on-auto-rehoming-for-regional-by-row-tables). A row's home region will be automatically set to the gateway region of any [`UPDATE`]({% link {{ page.version.version }}/update.md %}) or [`UPSERT`]({% link {{ page.version.version }}/upsert.md %}) statements that write to those rows.

For instructions showing how to set a table's locality to `REGIONAL BY ROW` and configure the home regions of its rows, refer to [`ALTER TABLE ... SET LOCALITY`]({% link {{ page.version.version }}/alter-table.md %}#crdb_region).

For more information on regional by row tables, see the [Cockroach Labs blog post](https://www.cockroachlabs.com/blog/regional-by-row/).

{{site.data.alerts.callout_danger}}
{% include {{page.version.version}}/known-limitations/secondary-regions-with-regional-by-row-tables.md %}
{{site.data.alerts.end}}
