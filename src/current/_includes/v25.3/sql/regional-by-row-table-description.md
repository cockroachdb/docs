In a _regional by row_ table, each row is optimized for access from a specific home region. Each row's home region is specified in a hidden [`crdb_region` column]({% link {{ page.version.version }}/alter-table.md %}#crdb_region), which defaults to the region of the [gateway node]({% link {{ page.version.version }}/architecture/life-of-a-distributed-transaction.md %}#gateway) that inserted the row. The `REGIONAL BY ROW` setting automatically [partitions]({% link {{ page.version.version }}/partitioning.md %}) the table and all of [its indexes]({% link {{ page.version.version }}/table-localities.md %}#indexes-on-regional-by-row-tables) by region using `crdb_region` as the partition key prefix.

Use regional by row tables when individual rows are frequently accessed from a single region, and your application requires low-latency reads and writes at the row level. A typical `REGIONAL BY ROW` use case is the `users` table in the [MovR application]({% link {{ page.version.version }}/movr.md %}), where user data can be co-located with the user's region for better performance.

{% include_cached new-in.html version="v25.3" %} CockroachDB can also infer a row's home region from a foreign key constraint. By enabling the cluster setting [`feature.infer_rbr_region_col_using_constraint.enabled`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-feature-infer-rbr-region-col-using-constraint-enabled) and setting the table storage parameter [`infer_rbr_region_col_using_constraint`]({% link {{ page.version.version }}/with-storage-parameter.md %}#table-parameters) to a foreign key constraint that references a `crdb_region` column, CockroachDB automatically assigns the appropriate region for `INSERT`, `UPDATE`, and `UPSERT` statements. It does this by performing a locality-optimized lookup join on the referenced row and copying its region value. {% include feature-phases/preview.md %}

To take full advantage of regional by row tables:

- Use unique key lookups or queries with [`LIMIT`]({% link {{ page.version.version }}/limit-offset.md %}) to enable [locality-optimized searches]({% link {{ page.version.version }}/cost-based-optimizer.md %}#locality-optimized-search-in-multi-region-clusters) that prioritize rows in the gateway node's region. If the query can be satisfied by rows in the gateway region, CockroachDB will avoid remote lookups.

- Choose a home-region strategy per table:

	- When inserting or updating rows that reference a `REGIONAL BY ROW` table via a foreign key, enable region inference by setting [`infer_rbr_region_col_using_constraint`]({% link {{ page.version.version }}/with-storage-parameter.md %}#table-parameters). This ensures that [`INSERT`]({% link {{ page.version.version }}/insert.md %}), [`UPDATE`]({% link {{ page.version.version }}/update.md %}), and [`UPSERT`]({% link {{ page.version.version }}/upsert.md %}) queries do not need to specify `crdb_region` to ensure that writes are placed in the same region as the referenced row. This requires **disabling** auto-rehoming. For an example, refer to the [`ALTER TABLE` documentation]({% link {{ page.version.version }}/alter-table.md %}#infer-a-rows-home-region-from-a-foreign-key).

	- When rows should move to the region of the latest writer, enable [auto-rehoming]({% link {{ page.version.version }}/alter-table.md %}#turn-on-auto-rehoming-for-regional-by-row-tables). On any [`UPDATE`]({% link {{ page.version.version }}/update.md %}) or [`UPSERT`]({% link {{ page.version.version }}/upsert.md %}), CockroachDB automatically updates the row's `crdb_region` to match the gateway node's region. Auto-rehoming **cannot** be used on tables that are referenced by foreign keys. For an example, refer to the [`ALTER TABLE` documentation]({% link {{ page.version.version }}/alter-table.md %}#turn-on-auto-rehoming-for-regional-by-row-tables).

For instructions showing how to set a table's locality to `REGIONAL BY ROW` and configure the home regions of its rows, refer to [`ALTER TABLE ... SET LOCALITY`]({% link {{ page.version.version }}/alter-table.md %}#crdb_region).

For more information on regional by row tables, see the [Cockroach Labs blog post](https://www.cockroachlabs.com/blog/regional-by-row/).

{{site.data.alerts.callout_danger}}
{% include {{page.version.version}}/known-limitations/secondary-regions-with-regional-by-row-tables.md %}
{{site.data.alerts.end}}
