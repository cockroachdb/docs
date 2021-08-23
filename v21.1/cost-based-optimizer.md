---
title: Cost-Based Optimizer
summary: The cost-based optimizer seeks the lowest cost for a query, usually related to time.
toc: true
---

The cost-based optimizer seeks the lowest cost for a query, usually related to time.

## How is cost calculated?

A given SQL query can have thousands of equivalent query plans with vastly different execution times. The cost-based optimizer enumerates these plans and chooses the lowest cost plan.

Cost is roughly calculated by:

- Estimating how much time each node in the query plan will use to process all results
- Modeling how data flows through the query plan

The most important factor in determining the quality of a plan is cardinality (i.e., the number of rows); the fewer rows each SQL operator needs to process, the faster the query will run.

## Table statistics

The cost-based optimizer can often find more performant query plans if it has access to statistical data on the contents of your tables. This data needs to be generated from scratch for new tables, and regenerated periodically for existing tables.

By default, CockroachDB automatically generates table statistics when tables are [created](create-table.html), and as they are [updated](update.html). It does this [using a background job](create-statistics.html#view-statistics-jobs) that automatically determines which columns to get statistics on &mdash; specifically, it chooses:

- Columns that are part of the primary key or an index (in other words, all indexed columns).
- Up to 100 non-indexed columns.

 By default, CockroachDB also automatically collects [multi-column statistics](create-statistics.html#create-statistics-on-multiple-columns) on columns that prefix an index.

{{site.data.alerts.callout_info}}
[Schema changes](online-schema-changes.html) trigger automatic statistics collection for the affected table(s).
{{site.data.alerts.end}}

### Controlling automatic statistics

For best query performance, most users should leave automatic statistics enabled with the default settings. The information provided in this section is useful for troubleshooting or performance tuning by advanced users.

#### Controlling statistics refresh rate

Statistics are refreshed in the following cases:

1. When there are no statistics.
2. When it's been a long time since the last refresh, where "long time" is defined according to a moving average of the time across the last several refreshes.
3. After each mutation operation ([`INSERT`](insert.html), [`UPDATE`](update.html), or [`DELETE`](delete.html)), the probability of a refresh is calculated using a formula that takes the [cluster settings](cluster-settings.html) shown below as inputs. These settings define the target number of rows in a table that should be stale before statistics on that table are refreshed.  Increasing either setting will reduce the frequency of refreshes.  In particular, `min_stale_rows` impacts the frequency of refreshes for small tables, while `fraction_stale_rows` has more of an impact on larger tables.

| Setting                                              | Default Value | Details                                                                              |
|------------------------------------------------------+---------------+--------------------------------------------------------------------------------------|
| `sql.stats.automatic_collection.fraction_stale_rows` |           0.2 | Target fraction of stale rows per table that will trigger a statistics refresh       |
| `sql.stats.automatic_collection.min_stale_rows`      |           500 | Target minimum number of stale rows per table that will trigger a statistics refresh |

{{site.data.alerts.callout_info}}
Because the formula for statistics refreshes is probabilistic, you should not expect to see statistics update immediately after changing these settings, or immediately after exactly 500 rows have been updated.
{{site.data.alerts.end}}

#### Turning off statistics

If you need to turn off automatic statistics collection, follow the steps below:

1. Run the following statement to disable the automatic statistics [cluster setting](cluster-settings.html):

    {% include copy-clipboard.html %}
    ~~~ sql
    > SET CLUSTER SETTING sql.stats.automatic_collection.enabled = false;
    ~~~

2. Use the [`SHOW STATISTICS`](show-statistics.html) statement to view automatically generated statistics.

3. Delete the automatically generated statistics using the following statement:

    {% include copy-clipboard.html %}
    ~~~ sql
    > DELETE FROM system.table_statistics WHERE true;
    ~~~

4. Restart the nodes in your cluster to clear the statistics caches.

For instructions showing how to manually generate statistics, see the examples in the [`CREATE STATISTICS` documentation](create-statistics.html).

#### Controlling histogram collection

By default, the optimizer collects histograms for all index columns (specifically the first column in each index) during automatic statistics collection. If a single column statistic is explicitly requested using manual invocation of [`CREATE STATISTICS`](create-statistics.html), a histogram will be collected, regardless of whether or not the column is part of an index.

{{site.data.alerts.callout_info}}
CockroachDB does not support histograms on [`ARRAY`-typed](array.html) columns. As a result, statistics created on `ARRAY`-typed columns do not include histograms.
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
CockroachDB does not support multi-column histograms yet. See [tracking issue](https://github.com/cockroachdb/cockroach/issues/49698).
{{site.data.alerts.end}}

If you are an advanced user and need to disable histogram collection for troubleshooting or performance tuning reasons, change the [`sql.stats.histogram_collection.enabled` cluster setting](cluster-settings.html) by running [`SET CLUSTER SETTING`](set-cluster-setting.html) as follows:

{% include copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING sql.stats.histogram_collection.enabled = false;
~~~

{{site.data.alerts.callout_info}}
When `sql.stats.histogram_collection.enabled` is set to `false`, histograms are never collected, either as part of automatic statistics collection or by manual invocation of [`CREATE STATISTICS`](create-statistics.html).
{{site.data.alerts.end}}

## Query plan cache

CockroachDB uses a cache for the query plans generated by the optimizer. This can lead to faster query execution since the database can reuse a query plan that was previously calculated, rather than computing a new plan each time a query is executed.

The query plan cache is enabled by default. To disable it, execute the following statement:

{% include copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING sql.query_cache.enabled = false;
~~~

Finally, note that only the following statements use the plan cache:

- [`SELECT`](select-clause.html)
- [`INSERT`](insert.html)
- [`UPDATE`](update.html)
- [`UPSERT`](upsert.html)
- [`DELETE`](delete.html)

## Join reordering

The cost-based optimizer will explore additional [join orderings](joins.html) in an attempt to find the lowest-cost execution plan for a query involving multiple joins, which can lead to significantly better performance in some cases.

Because this process leads to an exponential increase in the number of possible execution plans for such queries, it's only used to reorder subtrees containing 4 or fewer joins by default.

To change this setting, which is controlled by the `reorder_joins_limit` [session variable](set-vars.html), run the statement shown below. To disable this feature, set the variable to `0`.

{% include copy-clipboard.html %}
~~~ sql
> SET reorder_joins_limit = 6;
~~~

{{site.data.alerts.callout_danger}}
We strongly recommend not setting this value higher than 8 to avoid performance degradation. If set too high, the cost of generating and costing execution plans can end up dominating the total execution time of the query.
{{site.data.alerts.end}}

For more information about the difficulty of selecting an optimal join ordering, see our blog post [An Introduction to Join Ordering](https://www.cockroachlabs.com/blog/join-ordering-pt1/).

## Join hints

The optimizer supports hint syntax to force the use of a specific join algorithm even if the optimizer determines that a different plan would have a lower cost. The algorithm is specified between the join type (`INNER`, `LEFT`, etc.) and the `JOIN` keyword, for example:

- `INNER HASH JOIN`
- `OUTER MERGE JOIN`
- `LEFT LOOKUP JOIN`
- `CROSS MERGE JOIN`
- `INNER INVERTED JOIN`
- `LEFT INVERTED JOIN`

Note that the hint cannot be specified with a bare hint keyword (e.g., `MERGE`) - in that case, the `INNER` keyword must be added. For example, `a INNER MERGE JOIN b` will work, but `a MERGE JOIN b` will not work.

{{site.data.alerts.callout_info}}
Join hints cannot be specified with a bare hint keyword (e.g., `MERGE`) due to SQL's implicit `AS` syntax. If you're not careful, you can make `MERGE` be an alias for a table; for example, `a MERGE JOIN b` will be interpreted as having an implicit `AS` and be executed as `a AS MERGE JOIN b`, which is just a long way of saying `a JOIN b`. Because the resulting query might execute without returning any hint-related error (because it is valid SQL), it will seem like the join hint "worked", but actually it didn't affect which join algorithm was used. In this case, the correct syntax is `a INNER MERGE JOIN b`.
{{site.data.alerts.end}}

### Supported join algorithms

- `HASH`: Forces a hash join; in other words, it disables merge and lookup joins. A hash join is always possible, even if there are no equality columns - CockroachDB considers the nested loop join with no index a degenerate case of the hash join (i.e., a hash table with one bucket).

- `MERGE`: Forces a merge join, even if it requires re-sorting both sides of the join.

- `LOOKUP`: Forces a lookup join into the right side; the right side must be a table with a suitable index. Note that `LOOKUP` can only be used with `INNER` and `LEFT` joins.

- `INVERTED`: <span class="version-tag">New in v21.1:</span> Forces an inverted join into the right side; the right side must be a table with a suitable [inverted index](inverted-indexes.html). Note that `INVERTED` can only be used with `INNER` and `LEFT` joins.

{{site.data.alerts.callout_info}}
You cannot use inverted joins on [partial inverted indexes](inverted-indexes.html#partial-inverted-indexes).
{{site.data.alerts.end}}

If it is not possible to use the algorithm specified in the hint, an error is signaled.


{{site.data.alerts.callout_info}}
To make the optimizer prefer lookup joins over merge or hash joins when performing foreign key checks, set the `prefer_lookup_joins_for_fks` [session variable](set-vars.html) to `on` (merge joins are the default for single row inserts, and hash joins are the default for multi row inserts).
{{site.data.alerts.end}}

### Additional considerations

- This syntax is consistent with the [SQL Server syntax for join hints](https://docs.microsoft.com/en-us/sql/t-sql/queries/hints-transact-sql-join?view=sql-server-2017), except that:

   - SQL Server uses `LOOP` instead of `LOOKUP`.

   - CockroachDB does not support `LOOP` and instead supports `LOOKUP` for the specific case of nested loop joins with an index.

- When a join hint is specified, the two tables will not be reordered by the optimizer. The reordering behavior has the following characteristics, which can be affected by hints:

   - Given `a JOIN b`, CockroachDB will not try to commute to `b JOIN a`. This means that you will need to pay attention to this ordering, which is especially important for lookup joins. Without a hint, `a JOIN b` might be executed as `b INNER LOOKUP JOIN a` using an index into `a`, whereas `a INNER LOOKUP JOIN b` requires an index into `b`.

   - `(a JOIN b) JOIN c` might be changed to `a JOIN (b JOIN c)`, but this does not happen if `a JOIN b` uses a hint; the hint forces that particular join to happen as written in the query.

- Hint usage should be reconsidered with each new release of CockroachDB. Due to improvements in the optimizer, hints specified to work with an older version may cause decreased performance in a newer version.

## Examples

### Inverted join examples

{% include {{ page.version.version }}/sql/inverted-joins.md %}

## See also

- [`JOIN` expressions](joins.html)
- [`SET (session variable)`](set-vars.html)
- [`SET CLUSTER SETTING`](set-cluster-setting.html)
- [`RESET CLUSTER SETTING`](reset-cluster-setting.html)
- [`SHOW (session variable)`](show-vars.html)
- [`CREATE STATISTICS`](create-statistics.html)
- [`SHOW STATISTICS`](show-statistics.html)
- [`EXPLAIN`](explain.html)
