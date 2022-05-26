---
title: Cost-Based Optimizer
summary: The cost-based optimizer seeks the lowest cost for a query, usually related to time.
toc: true
keywords: gin, gin index, gin indexes, inverted index, inverted indexes, accelerated index, accelerated indexes
docs_area: develop
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

By default, CockroachDB automatically generates table statistics when tables are [created](create-table.html), and as they are [updated](update.html). It does this using a [background job](create-statistics.html#view-statistics-jobs) that automatically determines which columns to get statistics on &mdash; specifically, it chooses:

- Columns that are part of the primary key or an index (in other words, all indexed columns).
- Up to 100 non-indexed columns.

By default, CockroachDB also automatically collects [multi-column statistics](create-statistics.html#create-statistics-on-multiple-columns) on columns that prefix an index.

{{site.data.alerts.callout_info}}
[Schema changes](online-schema-changes.html) trigger automatic statistics collection for the affected table(s).
{{site.data.alerts.end}}

### Control automatic statistics

For best query performance, most users should leave automatic statistics enabled with the default settings. The information provided in this section is useful for troubleshooting or performance tuning by advanced users.

#### Control statistics refresh rate

Statistics are refreshed in the following cases:

- When there are no statistics.
- When it's been a long time since the last refresh, where "long time" is defined according to a moving average of the time across the last several refreshes.
- After a successful [`IMPORT`](import.html) or [`RESTORE`](restore.html) into the table.
- After any schema change affecting the table.
- After each mutation operation ([`INSERT`](insert.html), [`UPDATE`](update.html), or [`DELETE`](delete.html)), the probability of a refresh is calculated using a formula that takes the [cluster settings](cluster-settings.html) shown in the following table as inputs. These settings define the target number of rows in a table that should be stale before statistics on that table are refreshed.  Increasing either setting will reduce the frequency of refreshes. In particular, `min_stale_rows` impacts the frequency of refreshes for small tables, while `fraction_stale_rows` has more of an impact on larger tables.


    | Setting                                              | Default Value | Details                                                                              |
    |------------------------------------------------------+---------------+--------------------------------------------------------------------------------------|
    | `sql.stats.automatic_collection.fraction_stale_rows` |           0.2 | Target fraction of stale rows per table that will trigger a statistics refresh       |
    | `sql.stats.automatic_collection.min_stale_rows`      |           500 | Target minimum number of stale rows per table that will trigger a statistics refresh |

    {{site.data.alerts.callout_info}}
    Because the formula for statistics refreshes is probabilistic, you will not see statistics update immediately after changing these settings, or immediately after exactly 500 rows have been updated.
    {{site.data.alerts.end}}

#### Turn off statistics

To turn off automatic statistics collection, follow these steps:

1. Run the following statement to disable the automatic statistics [cluster setting](cluster-settings.html):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SET CLUSTER SETTING sql.stats.automatic_collection.enabled = false;
    ~~~

1. Use the [`SHOW STATISTICS`](show-statistics.html) statement to view automatically generated statistics.

1. Delete the automatically generated statistics using the following statement:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > DELETE FROM system.table_statistics WHERE true;
    ~~~

1. Restart the nodes in your cluster to clear the statistics caches.

To see how to manually generate statistics, see the [`CREATE STATISTICS` examples](create-statistics.html#examples).

#### Control whether the `avg_size` statistic is used to cost scans

{% include_cached new-in.html version=v22.1 %} The `avg_size` table statistic represents the average size of a table column.
If a table does not have an average size statistic available for a column, it uses the default value of 4 bytes.

The optimizer uses `avg_size` to cost scans and relevant joins. Costing scans per row regardless of the size of the columns comprising the row doesn't account for time
to read or transport a large number of bytes over the network and can lead to undesirable plans when there are multiple options for scans
or joins that read directly from tables.

Cockroach Labs recommends that you allow the optimizer to consider column size when costing plans. If you are an advanced user and need to disable using `avg_size` for troubleshooting or performance tuning reasons, you can disable it by setting the `cost_scans_with_default_col_size` [session variable](set-vars.html) to true with `SET cost_scans_with_default_col_size=true`.

#### Control histogram collection

By default, the optimizer collects histograms for all index columns (specifically the first column in each index) during automatic statistics collection. If a single column statistic is explicitly requested using manual invocation of [`CREATE STATISTICS`](create-statistics.html), a histogram will be collected, regardless of whether or not the column is part of an index.

{{site.data.alerts.callout_info}}
CockroachDB does not support:

- Histograms on [`ARRAY`-typed](array.html) columns. As a result, statistics created on `ARRAY`-typed columns do not include histograms.
- Multi-column histograms.
{{site.data.alerts.end}}

If you are an advanced user and need to disable histogram collection for troubleshooting or performance tuning reasons, change the [`sql.stats.histogram_collection.enabled` cluster setting](cluster-settings.html) by running [`SET CLUSTER SETTING`](set-cluster-setting.html) as follows:

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING sql.stats.histogram_collection.enabled = false;
~~~

When `sql.stats.histogram_collection.enabled` is set to `false`, histograms are never collected, either as part of automatic statistics collection or by manually invoking [`CREATE STATISTICS`](create-statistics.html).

## Locality optimized search in multi-region clusters

In [multi-region deployments](multiregion-overview.html), the optimizer, in concert with the [SQL engine](architecture/sql-layer.html), will avoid sending requests to nodes in other regions when it can instead read a value from a unique column that is stored locally. This capability is known as _locality optimized search_.

Even if a value cannot be read locally, CockroachDB takes advantage of the fact that some of the other regions are much closer than others and thus can be queried with lower latency. In this case, it performs all lookups against the remote regions in parallel and returns the result once it is retrieved, without having to wait for each lookup to come back. This can lead to increased performance in multi-region deployments, since it means that results can be returned from wherever they are first found without waiting for all of the other lookups to return.

{{site.data.alerts.callout_info}}
The asynchronous parallel lookup behavior does not occur if you [disable vectorized execution](vectorized-execution.html#configure-vectorized-execution).
{{site.data.alerts.end}}

Locality optimized search is supported for scans that are guaranteed to return 100,000 keys or fewer. This optimization allows the execution engine to avoid visiting remote regions if all requested keys are found in the local region, thus reducing the latency of the query.

### Limitations

{% include {{page.version.version}}/sql/locality-optimized-search-limited-records.md %}

{% include {{page.version.version}}/sql/locality-optimized-search-virtual-computed-columns.md %}

## Query plan cache

CockroachDB uses a cache for the query plans generated by the optimizer. This can lead to faster query execution since the database can reuse a query plan that was previously calculated, rather than computing a new plan each time a query is executed.

The query plan cache is enabled by default. To disable it, execute the following statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING sql.query_cache.enabled = false;
~~~

Only the following statements use the plan cache:

- [`SELECT`](select-clause.html)
- [`INSERT`](insert.html)
- [`UPDATE`](update.html)
- [`UPSERT`](upsert.html)
- [`DELETE`](delete.html)

## Join reordering

For a query involving multiple joins, the cost-based optimizer will explore additional [join orderings](joins.html) in an attempt to find the lowest-cost execution plan, which can lead to significantly better performance in some cases.

Because this process leads to an exponential increase in the number of possible execution plans for such queries, it's only used to reorder subtrees containing 8 or fewer joins by default.

To change this setting, which is controlled by the `reorder_joins_limit` [session variable](set-vars.html), run the following statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> SET reorder_joins_limit = 0;
~~~

To disable this feature, set the variable to `0`. You can configure the default `reorder_joins_limit` session setting with the [cluster setting](cluster-settings.html) `sql.defaults.reorder_joins_limit`, which has a default value of `8`.

{{site.data.alerts.callout_danger}}
To avoid performance degradation, Cockroach Labs strongly recommends setting this value to a maximum of 8. If set too high, the cost of generating and costing execution plans can end up dominating the total execution time of the query.
{{site.data.alerts.end}}

For more information about selecting an optimal join ordering, see our blog post [An Introduction to Join Ordering](https://www.cockroachlabs.com/blog/join-ordering-pt1/).

### Reduce planning time for queries with many joins

The cost-based optimizer explores multiple join orderings to find the lowest-cost plan. If there are many joins or join subtrees in the query, this can increase the number of execution plans the optimizer explores, and therefore the exploration and planning time. If the planning phase of a query takes a long time (on the order of multiple seconds or minutes) to plan, or the query plan involves many joins, consider the following alternatives to reduce the planning time:

- To limit the size of the subtree that can be reordered, set the `reorder_joins_limit` [session variable](set-vars.html) to a lower value, for example:

    ~~~ sql
    SET reorder_joins_limit = 2;
    ~~~

    If the join ordering inherent in the query is acceptable, for the shortest planning time, you can set `reorder_joins_limit` to `0`. This disables exploration of join orderings entirely.

    By reducing `reorder_joins_limit` CockroachDB reduces the number of plans explored, so a less efficient plan may be chosen by the optimizer.

    If one query has a slow planning time, you can avoid interfering with other query plans by setting `reorder_joins_limit` to the desired lower value before executing that query and resetting the session variable to the default after executing the query.

- If setting and resetting the session variable is cumbersome or if there are multiple independent joins in the query where some may benefit from join reordering, you can use a [join hint](#join-hints). If the join has a hint specifying the type of join to something other than the default `INNER` (i.e., `INNER LOOKUP`, `MERGE`, `HASH`, etc.), join reordering will be disabled and the plan will respect the join order inherent in the way the query is written. This works at the expression level and doesn't affect the entire query (for instance, if you have a union of two joins they are independent join expressions).

## Join hints

To force the use of a specific join algorithm even if the optimizer determines that a different plan would have a lower cost, you can use a _join hint_. You specify a join hint as `<join type> <join algorithm> JOIN`. For example:

- `INNER HASH JOIN`
- `OUTER MERGE JOIN`
- `LEFT LOOKUP JOIN`
- `CROSS MERGE JOIN`
- `INNER INVERTED JOIN`
- `LEFT INVERTED JOIN`

{{site.data.alerts.callout_info}}
Due to SQL's implicit `AS` syntax, you cannot specify a join hint with only the join algorithm keyword (e.g., `MERGE`). For example, `a MERGE JOIN b` will be interpreted as having an implicit `AS` and be executed as `a AS MERGE JOIN b`, which is equivalent to `a JOIN b`. Because the resulting query might execute without returning any hint-related error (because it is valid SQL), it will seem like the join hint "worked", but actually it didn't affect which join algorithm was used. The correct syntax is `a INNER MERGE JOIN b`.
{{site.data.alerts.end}}

For a join hint example, see [Use the right join type](apply-statement-performance-rules.html#rule-3-use-the-right-join-type).

### Supported join algorithms

- `HASH`: Forces a hash join; in other words, it disables merge and lookup joins. A hash join is always possible, even if there are no equality columns - CockroachDB considers the nested loop join with no index a degenerate case of the hash join (i.e., a hash table with one bucket).

- `MERGE`: Forces a merge join, even if it requires re-sorting both sides of the join.

- `LOOKUP`: Forces a lookup join into the right side; the right side must be a table with a suitable index. Note that `LOOKUP` can only be used with `INNER` and `LEFT` joins.

- `INVERTED`:  Forces an inverted join into the right side; the right side must be a table with a suitable [GIN index](inverted-indexes.html). Note that `INVERTED` can only be used with `INNER` and `LEFT` joins.

    {{site.data.alerts.callout_info}}
    You cannot use inverted joins on [partial GIN indexes](inverted-indexes.html#partial-gin-indexes).
    {{site.data.alerts.end}}

If it is not possible to use the algorithm specified in the hint, an error is signaled.

{{site.data.alerts.callout_info}}
To make the optimizer prefer lookup joins to merge joins when performing foreign key checks, set the `prefer_lookup_joins_for_fks` [session variable](set-vars.html) to `on`.
{{site.data.alerts.end}}

### Additional considerations

- This syntax is consistent with the [SQL Server syntax for join hints](https://docs.microsoft.com/en-us/sql/t-sql/queries/hints-transact-sql-join?view=sql-server-2017), except that:

  - SQL Server uses `LOOP` instead of `LOOKUP`.

  - CockroachDB does not support `LOOP` and instead supports `LOOKUP` for the specific case of nested loop joins with an index.

- When you specify a join hint, the two tables will not be reordered by the optimizer. The reordering behavior has the following characteristics, which can be affected by hints:

  - Given `a JOIN b`, CockroachDB will not try to commute to `b JOIN a`. This means that you will need to pay attention to this ordering, which is especially important for lookup joins. Without a hint, `a JOIN b` might be executed as `b INNER LOOKUP JOIN a` using an index into `a`, whereas `a INNER LOOKUP JOIN b` requires an index into `b`.

  - `(a JOIN b) JOIN c` might be changed to `a JOIN (b JOIN c)`, but this does not happen if `a JOIN b` uses a hint; the hint forces that particular join to happen as written in the query.

- You should reconsider hint usage with each new release of CockroachDB. Due to improvements in the optimizer, hints specified to work with an older version may cause decreased performance in a newer version.

## Zigzag joins

The optimizer may plan a zigzag join when there are at least **two secondary indexes on the same table** and the table is filtered in a query with at least two filters constraining different attributes to a constant. A zigzag join works by "zigzagging" back and forth between two indexes and returning only rows with matching primary keys within a specified range. For example:

~~~sql
CREATE TABLE abc (
  a INT,
  b INT,
  INDEX (a),
  INDEX (b)
);

EXPLAIN SELECT * FROM abc WHERE a = 10 AND b = 20;
~~~
~~~
               info
----------------------------------
  distribution: local
  vectorized: true

  • zigzag join
    pred: (a = 10) AND (b = 20)
    left table: abc@abc_a_idx
    left columns: (a)
    left fixed values: 1 column
    right table: abc@abc_b_idx
    right columns: (b)
    right fixed values: 1 column
(11 rows)
~~~

### Prevent zigzag joins

The join hint `NO_ZIGZAG_JOIN` prevents the optimizer from planning a zigzag join for the specified table. Apply the hint in the same way as other existing [index hints](table-expressions.html#force-index-selection). For example:

~~~sql
SELECT * FROM abc@{NO_ZIGZAG_JOIN};
~~~

## Inverted join examples

{% include {{ page.version.version }}/sql/inverted-joins.md %}


## Known limitations

* {% include {{page.version.version}}/known-limitations/old-multi-col-stats.md %}
* {% include {{page.version.version}}/known-limitations/single-col-stats-deletion.md %}
* {% include {{page.version.version}}/known-limitations/stats-refresh-upgrade.md %}

## See also

- [`JOIN` expressions](joins.html)
- [`SET {session variable}`](set-vars.html)
- [`SET CLUSTER SETTING`](set-cluster-setting.html)
- [`RESET CLUSTER SETTING`](reset-cluster-setting.html)
- [`SHOW {session variable}`](show-vars.html)
- [`CREATE STATISTICS`](create-statistics.html)
- [`SHOW STATISTICS`](show-statistics.html)
- [`EXPLAIN`](explain.html)
