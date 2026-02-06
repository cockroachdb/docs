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

The cost-based optimizer can often find more performant query plans if it has access to statistical data on the contents of your tables. This data needs to be generated from scratch for new tables, and [refreshed periodically](#control-statistics-refresh-rate) for existing tables.

The optimizer can use three types of statistics to plan queries:

- [Full statistics](#full-statistics)
- [Partial statistics](#partial-statistics)
- [Forecasted statistics](#forecasted-statistics)

For best query performance, most users should leave automatic statistics enabled with the default settings. Advanced users can follow the steps provided in the following sections for performance tuning and troubleshooting.

### Full statistics

By default, CockroachDB automatically generates full statistics when tables are [created]({% link {{ page.version.version }}/create-table.md %}) and after [schema changes]({% link {{ page.version.version }}/online-schema-changes.md %}). Full statistics for a table are automatically refreshed when approximately 20% of its rows are updated.

A [background job]({% link {{ page.version.version }}/create-statistics.md %}#view-statistics-jobs) automatically determines which columns to get statistics on. Specifically, the optimizer chooses:

- Columns that are part of the primary key or an index (in other words, all indexed columns).
- Up to 100 non-indexed columns.

By default, CockroachDB also automatically collects [multi-column statistics]({% link {{ page.version.version }}/create-statistics.md %}#create-statistics-on-multiple-columns) on columns that prefix an index.

#### Control statistics refresh rate

Full statistics are refreshed in the following cases:

- When there are no statistics.
- When it has been a long time since the last refresh, where "long time" is based on a moving average of the time across the last several refreshes.
- After a successful [`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %}) or [`RESTORE`]({% link {{ page.version.version }}/restore.md %}) into the table.
- After any schema change affecting the table.
- After each mutation operation ([`INSERT`]({% link {{ page.version.version }}/insert.md %}), [`UPDATE`]({% link {{ page.version.version }}/update.md %}), or [`DELETE`]({% link {{ page.version.version }}/delete.md %})), the probability of a refresh is calculated using a formula that takes the [cluster settings]({% link {{ page.version.version }}/cluster-settings.md %}) shown in the following table as inputs. These settings define the target number of rows in a table that must be stale before statistics on that table are refreshed. Increasing either setting will reduce the frequency of refreshes. In particular, `min_stale_rows` impacts the frequency of refreshes for small tables, while `fraction_stale_rows` has more of an impact on larger tables.

    | Setting                                              | Default Value | Details                                                                               |
    |------------------------------------------------------+---------------+---------------------------------------------------------------------------------------|
    | `sql.stats.automatic_collection.fraction_stale_rows` |           0.2 | Target fraction of stale rows per table that will trigger a statistics refresh.       |
    | `sql.stats.automatic_collection.min_stale_rows`      |           500 | Target minimum number of stale rows per table that will trigger a statistics refresh. |

    {{site.data.alerts.callout_info}}
    Because the formula for statistics refreshes is probabilistic, you will not see statistics update immediately after changing these settings, or immediately after exactly 500 rows have been updated.
    {{site.data.alerts.end}}

The "stale row" cluster settings also have the table setting counterparts `sql_stats_automatic_collection_fraction_stale_rows` and `sql_stats_automatic_collection_min_stale_rows`. For example:

~~~ sql
CREATE TABLE accounts (
    id INT PRIMARY KEY,
    balance DECIMAL)
WITH (sql_stats_automatic_collection_enabled = true,
sql_stats_automatic_collection_min_stale_rows = 1000000,
sql_stats_automatic_collection_fraction_stale_rows= 0.05
);

ALTER TABLE accounts
SET (sql_stats_automatic_collection_fraction_stale_rows = 0.1,
sql_stats_automatic_collection_min_stale_rows = 2000);
~~~

Automatic statistics rules are checked once per minute. While altered automatic statistics table settings take immediate effect for any subsequent DML statements on a table, running row mutations that started prior to modifying the table settings may still trigger statistics collection based on the settings that existed before you ran the `ALTER TABLE ... SET` statement.

##### Small versus large table examples

Suppose the [cluster settings]({% link {{ page.version.version }}/cluster-settings.md %}) `sql.stats.automatic_collection.fraction_stale_rows` and `sql.stats.automatic_collection.min_stale_rows` have the default values .2 and 500 as shown in the preceding table.

If a table has 100 rows and 20 became stale, a re-collection would not be triggered because, even though 20% of the rows are stale, they do not meet the 500-row minimum.

On the other hand, if a table has 1,500,000,000 rows, then 20% of that, or 300,000,000 rows, would have to become stale before automatic statistics collection was triggered. With a table this large, you would have to lower `sql.stats.automatic_collection.fraction_stale_rows` significantly to allow for regular statistics collections. Doing so can cause smaller tables to have statistics collected much more frequently, because it is a global setting that affects automatic statistics collection for all tables.

In such cases, we recommend that you use the [`sql_stats_automatic_collection_enabled` storage parameter](#enable-and-disable-automatic-statistics-collection-for-tables), which lets you configure automatic statistics collection on a per-table basis.

### Partial statistics

*Partial statistics* are collected on a subset of table data without scanning the full table. Partial statistics can improve query performance in large tables where only a portion of rows are regularly updated or queried.

Whereas [full statistics](#full-statistics) refresh infrequently and can allow stale rows to accumulate, partial statistics automatically refresh at a [lower threshold](#automatically-collect-partial-statistics) of stale rows. Partial statistics automatically collect on extreme index values, which is particularly valuable for timestamp indexes where workloads commonly access the most recent data. They can also be [collected manually](#manually-collect-partial-statistics).

Partial statistics have the following constraints:

- Partial statistics can only be collected if [full statistics](#full-statistics) already exist for the table.
- Partial statistics created with `USING EXTREMES` and no `ON` clause are collected on all single-column prefixes of non-inverted indexes. Indexes that are [partial]({% link {{ page.version.version }}/partial-indexes.md %}), [hash-sharded]({% link {{ page.version.version }}/hash-sharded-indexes.md %}), or implicitly partitioned (such as in [`REGIONAL BY ROW` tables]({% link {{ page.version.version }}/regional-tables.md %}#regional-by-row-tables)) are excluded.
- For [manual collection](#manually-collect-partial-statistics) with specific columns, an index must exist with a prefix matching those columns. If no matching index exists or if full statistics were not previously collected on the specified column, the statement returns an error.

The optimizer uses partial statistics for query planning when the [`optimizer_use_merged_partial_statistics`]({% link {{ page.version.version }}/session-variables.md %}#optimizer-use-merged-partial-statistics) session variable is enabled. It merges partial statistics with existing full statistics to produce more accurate cardinality estimates.

#### Automatically collect partial statistics

{% include_cached new-in.html version="v25.1" %} Partial statistics are automatically collected on the highest and lowest index values when:

- Automatic collection is enabled.
- The number of stale rows in a table reaches a specified threshold.

This is particularly beneficial for large tables where only a portion is regularly updated or queried, such as tables with timestamp columns where recent data is frequently accessed.

To control automatic collection of partial statistics, use the following [cluster settings]({% link {{ page.version.version }}/cluster-settings.md %}) to configure behavior across all tables in the cluster:

|                                                                                       Cluster setting                                                                                        |                                                                                            Description                                                                                             |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [`sql.stats.automatic_partial_collection.enabled`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-sql-stats-automatic-partial-collection-enabled)                         | Enable automatic collection of partial table statistics.                                                                                                                                           |
| [`sql.stats.automatic_partial_collection.min_stale_rows`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-sql-stats-automatic-partial-collection-min-stale-rows)           | Minimum number of stale rows that triggers partial statistics collection.                                                                                                                          |
| [`sql.stats.automatic_partial_collection.fraction_stale_rows`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-sql-stats-automatic-partial-collection-fraction-stale-rows) | Target fraction of stale rows that triggers partial statistics collection. If lower than the `0.2` threshold for full statistics, partial statistics refresh more frequently than full statistics. |

Override cluster settings for specific tables using the following [table storage parameters]({% link {{ page.version.version }}/with-storage-parameter.md %}#table-parameters):

|                                                             Table storage parameter                                                              |                                                                                                   Description                                                                                                   |
|--------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [`sql_stats_automatic_partial_collection_enabled`]({% link {{ page.version.version }}/with-storage-parameter.md %}#table-parameters)             | Enable automatic collection of partial statistics on the table.                                                                                                                                                 |
| [`sql_stats_automatic_partial_collection_min_stale_rows`]({% link {{ page.version.version }}/with-storage-parameter.md %}#table-parameters)      | Minimum number of stale rows on the table that triggers partial statistics collection.                                                                                                                          |
| [`sql_stats_automatic_partial_collection_fraction_stale_rows`]({% link {{ page.version.version }}/with-storage-parameter.md %}#table-parameters) | Target fraction of stale rows on the table that triggers partial statistics collection. If lower than the `0.2` threshold for full statistics, partial statistics refresh more frequently than full statistics. |

#### Manually collect partial statistics

You can manually create partial statistics on the highest and lowest index values, when [`enable_create_stats_using_extremes`]({% link {{ page.version.version }}/session-variables.md %}#enable-create-stats-using-extremes) session variable is enabled, using the `USING EXTREMES` clause: [`CREATE STATISTICS stats FROM table USING EXTREMES`]({% link {{ page.version.version }}/create-statistics.md %}#create-partial-statistics-using-extremes).

### Toggle automatic statistics collection 

#### Enable and disable automatic statistics collection for clusters

Automatic statistics collection is enabled by default. To disable automatic [full](#full-statistics) and [partial](#partial-statistics) statistics collection, follow these steps:

1. Set the `sql.stats.automatic_collection.enabled` cluster setting to `false`:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SET CLUSTER SETTING sql.stats.automatic_collection.enabled = false;
    ~~~

1. Use the [`SHOW STATISTICS`]({% link {{ page.version.version }}/show-statistics.md %}) statement to view automatically generated statistics.

1. Delete the automatically generated statistics:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > DELETE FROM system.table_statistics WHERE true;
    ~~~

1. Restart the nodes in your cluster to clear the statistics caches.

To learn how to manually generate statistics, see the [`CREATE STATISTICS` examples]({% link {{ page.version.version }}/create-statistics.md %}#examples).

#### Enable and disable automatic statistics collection for tables

Automatic statistics collection can be expensive for large tables, and you may prefer to defer collection until after data is finished loading or during off-peak hours. Tables that are frequently updated, including small tables, may trigger statistics collection more often, which can lead to unnecessary overhead and unpredictable query plan changes.

You can enable and disable automatic [full](#full-statistics) and [partial](#partial-statistics) statistics collection for individual tables using the `sql_stats_automatic_collection_enabled` [storage parameter]({% link {{ page.version.version }}/with-storage-parameter.md %}#table-parameters). This table setting **takes precedence** over the `sql.stats.automatic_collection.enabled` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) described in [Enable and disable automatic statistics collection for clusters](#enable-and-disable-automatic-statistics-collection-for-clusters).

You can either configure this setting during table creation:

~~~ sql
CREATE TABLE accounts (
    id INT PRIMARY KEY,
    balance DECIMAL)
WITH (sql_stats_automatic_collection_enabled = false);
~~~

Or by using [`ALTER TABLE ... SET`]({% link {{ page.version.version }}/alter-table.md %}#set-storage-parameter):

~~~ sql
CREATE TABLE accounts (
    id INT PRIMARY KEY,
    balance DECIMAL);

ALTER TABLE accounts
SET (sql_stats_automatic_collection_enabled = false);
~~~

The current table settings are shown in the `WITH` clause output of `SHOW CREATE TABLE`:

~~~
  table_name |                    create_statement
-------------+---------------------------------------------------------
  accounts   | CREATE TABLE public.accounts (
             |     id INT8 NOT NULL,
             |     balance DECIMAL NULL,
             |     CONSTRAINT accounts_pkey PRIMARY KEY (id ASC)
             | ) WITH (sql_stats_automatic_collection_enabled = false)
(1 row)
~~~

`ALTER TABLE accounts RESET (sql_stats_automatic_collection_enabled)` removes the table setting, in which case the `sql.stats.automatic_collection.enabled` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) is in effect for the table.

### Configure non-default statistics retention

By default, when CockroachDB refreshes statistics for a column, it deletes the previous statistics for the column (while leaving the most recent 4-5 historical statistics). When CockroachDB refreshes statistics, it also deletes the statistics for any "non-default" column sets, or columns for which statistics are not [collected by default](#table-statistics).

Historical statistics on non-default column sets should not be retained indefinitely, because they will not be refreshed automatically and could cause the optimizer to choose a suboptimal plan if they become stale. Such non-default historical statistics may exist because columns were deleted or removed from an index, and are therefore no longer part of a multi-column statistic.

CockroachDB deletes statistics on non-default columns according to the `sql.stats.non_default_columns.min_retention_period` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}), which defaults to a 24-hour retention period.

### Forecasted statistics

*Forecasted statistics* use a simple regression model that predicts how the statistics have changed since they were last collected. CockroachDB generates forecasted statistics when the following conditions are met:

- There have been at least 3 historical statistics collections.
- The historical statistics closely fit a linear pattern.

You can enable and disable forecasted statistics collection for individual tables using the `sql_stats_forecasts_enabled` [table parameter]({% link {{ page.version.version }}/with-storage-parameter.md %}#table-parameters). This table setting **takes precedence** over the `sql.stats.forecasts.enabled` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}).

You can either configure this setting during table creation:

~~~ sql
CREATE TABLE accounts (
    id INT PRIMARY KEY,
    balance DECIMAL)
WITH (sql_stats_forecasts_enabled = false);
~~~

Or by using [`ALTER TABLE ... SET`]({% link {{ page.version.version }}/alter-table.md %}#set-storage-parameter):

~~~ sql
CREATE TABLE accounts (
    id INT PRIMARY KEY,
    balance DECIMAL);

ALTER TABLE accounts
SET (sql_stats_forecasts_enabled = false);
~~~

The current table settings are shown in the `WITH` clause output of `SHOW CREATE TABLE`:

~~~
  table_name |                 create_statement
-------------+----------------------------------------------------
  accounts   | CREATE TABLE public.accounts (
             |     id INT8 NOT NULL,
             |     balance DECIMAL NULL,
             |     CONSTRAINT accounts_pkey PRIMARY KEY (id ASC)
             | ) WITH (sql_stats_forecasts_enabled = false)
(1 row)
~~~

`ALTER TABLE accounts RESET (sql_stats_forecasts_enabled)` removes the table setting, in which case the `sql.stats.forecasts.enabled` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) is in effect for the table.

### Control histogram collection

By default, the optimizer collects histograms for all index columns (specifically the first column in each index) during automatic statistics collection. If a single column statistic is explicitly requested using manual invocation of [`CREATE STATISTICS`]({% link {{ page.version.version }}/create-statistics.md %}), a histogram will be collected, regardless of whether or not the column is part of an index.

{{site.data.alerts.callout_info}}
CockroachDB does not support:

- Histograms on [`ARRAY`-typed]({% link {{ page.version.version }}/array.md %}) columns. As a result, statistics created on `ARRAY`-typed columns do not include histograms.
- Multi-column histograms.
{{site.data.alerts.end}}

If you are an advanced user and need to disable histogram collection for troubleshooting or performance tuning reasons, change the [`sql.stats.histogram_collection.enabled` cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) by running [`SET CLUSTER SETTING`]({% link {{ page.version.version }}/set-cluster-setting.md %}) as follows:

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING sql.stats.histogram_collection.enabled = false;
~~~

When `sql.stats.histogram_collection.enabled` is set to `false`, histograms are never collected, either as part of automatic statistics collection or by manually invoking [`CREATE STATISTICS`]({% link {{ page.version.version }}/create-statistics.md %}).

### Control whether the `avg_size` statistic is used to cost scans

The `avg_size` table statistic represents the average size of a table column. If a table does not have an average size statistic available for a column, it uses the default value of 4 bytes.

The optimizer uses `avg_size` to cost scans and relevant joins. Costing scans per row regardless of the size of the columns comprising the row doesn't account for time to read or transport a large number of bytes over the network. This can lead to undesirable plans when there are multiple options for scans or joins that read directly from tables.

We recommend that you allow the optimizer to consider column size when costing plans. If you are an advanced user and need to disable using `avg_size` for troubleshooting or performance tuning reasons, set the [`cost_scans_with_default_col_size` session variable]({% link {{ page.version.version }}/set-vars.md %}#cost-scans-with-default-col-size) to `true` with `SET cost_scans_with_default_col_size=true`.

## Control whether the optimizer creates a plan with a full scan

Even if you have [secondary indexes]({% link {{ page.version.version }}/schema-design-indexes.md %}), the optimizer may determine that a full table scan will be faster. For example, if you add a secondary index to a table with a large number of rows and find that a statement plan is not using the secondary index, then it is likely that performing a full table scan using the primary key is faster than doing a secondary index scan plus an [index join]({% link {{ page.version.version }}/indexes.md %}#example).

You can disable statement plans that perform full table scans with the [`disallow_full_table_scans` session variable]({% link {{ page.version.version }}/set-vars.md %}#disallow-full-table-scans).

{% include {{ page.version.version }}/sql/disallow-full-table-scans.md %}

## Control whether the optimizer uses an index

You can specify [whether an index is visible]({% link {{ page.version.version }}/alter-index.md %}#not-visible) to the cost-based optimizer. By default, indexes are visible. If not visible, the index will not be used in queries unless it is specifically selected with an [index hint]({% link {{ page.version.version }}/indexes.md %}#selection). This allows you to create an index and check for query plan changes without affecting production queries. For an example, see [Set an index to be not visible]({% link {{ page.version.version }}/alter-index.md %}#set-an-index-to-be-not-visible).

You can also set an index as [partially visible]({% link {{ page.version.version }}/alter-index.md %}#visibility) within a range of `0.0` to `1.0`, where `0.0` means not visible and `1.0` means visible. Any value between `0.0` and `1.0` means that an index is visible to the specified fraction of queries. {% include {{ page.version.version }}/sql/partially-visible-indexes.md %}

{{site.data.alerts.callout_info}}
Indexes that are not visible are still used to enforce `UNIQUE` and `FOREIGN KEY` [constraints]({% link {{ page.version.version }}/constraints.md %}). For more considerations, see [Index visibility considerations]({% link {{ page.version.version }}/alter-index.md %}#not-visible).
{{site.data.alerts.end}}

You can instruct the optimizer to use indexes marked as not visible with the [`optimizer_use_not_visible_indexes` session variable]({% link {{ page.version.version }}/set-vars.md %}#optimizer-use-not-visible-indexes). By default, the variable is set to `off`.

## Locality optimized search in multi-region clusters

In [multi-region deployments]({% link {{ page.version.version }}/multiregion-overview.md %}) with [regional by row tables]({% link {{ page.version.version }}/table-localities.md %}#regional-by-row-tables), the optimizer, in concert with the [SQL engine]({% link {{ page.version.version }}/architecture/sql-layer.md %}), may perform a *locality optimized search* to attempt to avoid high-latency, cross-region communication between nodes. If there is a possibility that the results of a query all live in local rows, the database will first search for rows in the gateway node's region. The search only continues in remote regions if rows in the local region did not satisfy the query. Examples of queries that can use locality optimized search include unique key lookups and queries with [`LIMIT`]({% link {{ page.version.version }}/limit-offset.md %}) clauses.

Even if a value cannot be read locally, CockroachDB takes advantage of the fact that some of the other regions are much closer than others and thus can be queried with lower latency. Unless [queries are limited to a single region](#control-whether-queries-are-limited-to-a-single-region), CockroachDB performs all lookups against the remote regions in parallel and returns the result once it is retrieved, without having to wait for each lookup to come back. This can lead to increased performance in multi-region deployments, since it means that results can be returned from wherever they are first found without waiting for all of the other lookups to return.

{{site.data.alerts.callout_info}}
The asynchronous parallel lookup behavior does not occur if you [disable vectorized execution]({% link {{ page.version.version }}/vectorized-execution.md %}#configure-vectorized-execution).
{{site.data.alerts.end}}

Locality optimized search is supported for scans that are guaranteed to return 100,000 keys or fewer. This optimization allows the execution engine to avoid visiting remote regions if all requested keys are found in the local region, thus reducing the latency of the query.

### Known limitations

{% include {{ page.version.version }}/known-limitations/locality-optimized-search-limited-records.md %}

{% include {{page.version.version}}/known-limitations/locality-optimized-search-virtual-computed-columns.md %}

## Control whether queries are limited to a single region

Although the optimizer prefers to [read from rows in local regions](#locality-optimized-search-in-multi-region-clusters) when possible, by default, it does not guarantee that any query will not visit a remote region. This can occur if a query has no [home region]({% link {{ page.version.version }}/multiregion-overview.md %}#table-localities) (for example, if it reads from different home regions in a [regional by row table]({% link {{ page.version.version }}/table-localities.md %}#regional-by-row-tables)) or a query's home region differs from the [gateway]({% link {{ page.version.version }}/architecture/life-of-a-distributed-transaction.md %}#gateway) region.

For some latency-sensitive applications, cross-region latency may not be acceptable. In these cases, set the [`enforce_home_region` session variable]({% link {{ page.version.version }}/show-vars.md %}#enforce-home-region) to `on`. This configures the optimizer to return one of the following error types, and in some cases a suggested resolution, if a query cannot be run entirely in a single region:

- `Query has no home region`. The optimizer provides a hint on how to run the query in a single region.
- `Query is not running in its home region`. The optimizer provides a hint containing the home region of the query. The application should disconnect and then reconnect with a [connection string]({% link {{ page.version.version }}/connection-parameters.md %}) specifying a node in the query's home region.

Only tables with `ZONE` [survivability]({% link {{ page.version.version }}/multiregion-survival-goals.md %}#when-to-use-zone-vs-region-survival-goals) can be scanned without error when this setting is enabled.

## Query plan cache

CockroachDB caches some of the query plans generated by the optimizer. Caching query plans leads to faster query execution: rather than generating a new plan each time a query is executed, CockroachDB reuses a query plan that was previously generated.

The *plan cache* is used to cache the following types of statements across sessions:

- Prepared statements.
- Non-prepared statements using identical constant values.

The following statements can use the plan cache: [`SELECT`]({% link {{ page.version.version }}/select-clause.md %}), [`INSERT`]({% link {{ page.version.version }}/insert.md %}), [`UPDATE`]({% link {{ page.version.version }}/update.md %}), [`UPSERT`]({% link {{ page.version.version }}/upsert.md %}), and [`DELETE`]({% link {{ page.version.version }}/delete.md %}).

The plan cache is enabled by default. To disable it, execute the following statement:

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING sql.query_cache.enabled = false;
~~~

{% comment %}Two types of plans can be cached: custom and generic. Refer to [Query plan type](#query-plan-type).{% endcomment %}

### Query plan type

Two types of plans can be cached:

- *Custom* query plans are generated for a given query structure and optimized for specific placeholder values, and are re-optimized on subsequent executions. By default, the optimizer uses custom plans. Custom plans are included in the [plan cache](#query-plan-cache).
- *Generic* query plans are generated and optimized once without considering specific placeholder values, and are **not** regenerated on subsequent executions, unless the plan becomes stale due to [schema changes]({% link {{ page.version.version }}/online-schema-changes.md %}) or new [table statistics](#table-statistics) and must be re-optimized. This approach eliminates most of the query latency attributed to planning. For example:

    ~~~ sql
    PREPARE p AS SELECT ...;
    SET plan_cache_mode = force_generic_plan;
    EXECUTE p; -- The query plan is generated and optimized.
    EXECUTE p; -- The query plan is reused without re-optimizing.
    EXECUTE p; -- The query plan is reused without re-optimizing.
    ~~~

    Generic plans are **not** included in the plan cache, but are cached per session. This means that they must still be re-optimized each time a session prepares a statement using a generic plan. To reuse generic query plans for maximum performance, a prepared statement should be executed multiple times instead of prepared and executed once.

    {{site.data.alerts.callout_success}}
    Generic query plans will only benefit workloads that use prepared statements, which are issued via explicit `PREPARE` statements or by client libraries using the [PostgreSQL extended wire protocol](https://www.postgresql.org/docs/current/protocol-flow.html#PROTOCOL-FLOW-EXT-QUERY). Generic query plans are most beneficial for queries with high planning times, such as queries with many [joins]({% link {{ page.version.version }}/joins.md %}). For more information on reducing planning time for such queries, refer to [Reduce planning time for queries with many joins](#reduce-planning-time-for-queries-with-many-joins).
    {{site.data.alerts.end}}

To change the type of plan that is cached, use the [`plan_cache_mode`]({% link {{ page.version.version }}/session-variables.md %}#plan-cache-mode) session setting. This setting applies when a statement is executed, not when it is prepared. Statements are therefore not associated with a specific query plan type when they are prepared.

The following modes can be set:

- `auto` (default): Automatically determine whether to use custom or generic query plans for prepared statements. Custom plans are used for the first five statement executions. Subsequent executions use a generic plan if its estimated cost is not significantly higher than the average cost of the preceding custom plans.
- `force_custom_plan`: Force the use of custom plans.
- `force_generic_plan`: Force the use of generic plans.

{{site.data.alerts.callout_info}}
Generic plans are always used for non-prepared statements that do not contain placeholders or [stable functions]({% link {{ page.version.version }}/functions-and-operators.md %}#function-volatility), regardless of the `plan_cache_mode` setting.
{{site.data.alerts.end}}

In some cases, generic query plans are less efficient than custom plans. For this reason, Cockroach Labs recommends setting `plan_cache_mode` to `auto` (the default mode) instead of `force_generic_plan`. Under the `auto` setting, the optimizer avoids bad generic plans by falling back to custom plans. For example:

Set `plan_cache_mode` to `auto` at the session level:

{% include_cached copy-clipboard.html %}
~~~ sql
SET plan_cache_mode = auto
~~~

At the [database level]({% link {{ page.version.version }}/alter-database.md %}#set-session-variable):

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE db SET plan_cache_mode = auto;
~~~

At the [role level]({% link {{ page.version.version }}/alter-role.md %}#set-default-session-variable-values-for-a-role):

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER ROLE db_user SET plan_cache_mode = auto;
~~~

To verify the plan type used by a query, check the [`EXPLAIN ANALYZE`]({% link {{ page.version.version }}/explain-analyze.md %}) output for the query.

- If a generic query plan is optimized for the current execution, the `plan type` in the output is `generic, re-optimized`.
- If a generic query plan is reused for the current execution without performing optimization, the `plan type` in the output is `generic, reused`.
- If a custom query plan is used for the current execution, the `plan type` in the output is `custom`.

## Join reordering

For a query involving multiple joins, the cost-based optimizer will explore additional [join orderings]({% link {{ page.version.version }}/joins.md %}) in an attempt to find the lowest-cost execution plan, which can lead to significantly better performance in some cases.

Because this process leads to an exponential increase in the number of possible execution plans for such queries, it's only used to reorder subtrees containing 8 or fewer joins by default.

To change this setting, which is controlled by the `reorder_joins_limit` [session variable]({% link {{ page.version.version }}/set-vars.md %}), run the following statement:

{% include_cached copy-clipboard.html %}
~~~ sql
SET reorder_joins_limit = 0;
~~~

To disable this feature, set the variable to `0`. You can configure the default `reorder_joins_limit` session setting with the [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) `sql.defaults.reorder_joins_limit`, which has a default value of `8`.

{{site.data.alerts.callout_danger}}
To avoid performance degradation, Cockroach Labs strongly recommends setting this value to a maximum of 8. If set too high, the cost of generating and costing execution plans can end up dominating the total execution time of the query.
{{site.data.alerts.end}}

For more information about selecting an optimal join ordering, see our blog post [An Introduction to Join Ordering](https://www.cockroachlabs.com/blog/join-ordering-pt1/).

{% include {{page.version.version}}/sql/sql-defaults-cluster-settings-deprecation-notice.md %}

### Reduce planning time for queries with many joins

The cost-based optimizer explores multiple join orderings to find the lowest-cost plan. If there are many joins or join subtrees in the query, this can increase the number of execution plans the optimizer explores, and therefore the exploration and planning time. If the planning phase of a query takes a long time (on the order of multiple seconds or minutes) to plan, or the query plan involves many joins, consider the following alternatives to reduce the planning time:

- To limit the size of the subtree that can be reordered, set the `reorder_joins_limit` [session variable]({% link {{ page.version.version }}/set-vars.md %}) to a lower value, for example:

    {% include_cached copy-clipboard.html %}
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
- `CROSS HASH JOIN`
- `INNER INVERTED JOIN`
- `LEFT INVERTED JOIN`
- `INNER STRAIGHT JOIN`
- `LEFT STRAIGHT JOIN`
- `RIGHT STRAIGHT JOIN`

{{site.data.alerts.callout_info}}
Due to SQL's implicit `AS` syntax, you cannot specify a join hint with only the join algorithm keyword (e.g., `MERGE`). For example, `a MERGE JOIN b` will be interpreted as having an implicit `AS` and be executed as `a AS MERGE JOIN b`, which is equivalent to `a JOIN b`. Because the resulting query might execute without returning any hint-related error (because it is valid SQL), it will seem like the join hint "worked", but actually it didn't affect which join algorithm was used. The correct syntax is `a INNER MERGE JOIN b`.
{{site.data.alerts.end}}

For a join hint example, see [Use the right join type]({% link {{ page.version.version }}/apply-statement-performance-rules.md %}#rule-3-use-the-right-join-type).

### Supported join algorithms

- `HASH`: Forces a hash join; in other words, it disables merge and lookup joins. A hash join is always possible, even if there are no equality columns: CockroachDB treats a nested loop join without an index as a special case of a hash join, where the hash table effectively has one bucket.

- `MERGE`: Forces a merge join, even if it requires re-sorting both sides of the join.

- `LOOKUP`: Forces a lookup join into the right side; the right side must be a table with a suitable index. `LOOKUP` can be used only with `INNER` and `LEFT` joins.

- `INVERTED`: Forces an inverted join into the right side; the right side must be a table with a suitable [GIN index]({% link {{ page.version.version }}/inverted-indexes.md %}). `INVERTED` can be used only with `INNER` and `LEFT` joins.

    {{site.data.alerts.callout_info}}
    You cannot use inverted joins on [partial GIN indexes]({% link {{ page.version.version }}/inverted-indexes.md %}#partial-gin-indexes).
    {{site.data.alerts.end}}

- `STRAIGHT`: Forces a straight join in the order specified in the query, without hinting a join algorithm. This can potentially override a more efficient query plan. A straight join that turns into another join type behaves as follows: hash or cross joins build and probe the right side; lookup joins probe an index on the right side; inverted joins probe an inverted index on the right side; and merge joins behave as standard merge joins. The join type is independent of whether a `INNER`, `LEFT`, or `RIGHT` straight join is specified.

If it is not possible to use the algorithm specified in the hint, an error is signaled.

{{site.data.alerts.callout_info}}
To make the optimizer prefer lookup joins to merge joins when performing foreign key checks, set the `prefer_lookup_joins_for_fks` [session variable]({% link {{ page.version.version }}/set-vars.md %}) to `on`.
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

### Prevent or force a zigzag join

The optimizer supports index hints to prevent or force a zigzag join. Apply the hints in the same way as other existing [index hints]({% link {{ page.version.version }}/table-expressions.md %}#force-index-selection).

To prevent the optimizer from planning a zigzag join for the specified table, use the hint `NO_ZIGZAG_JOIN`. For example:

~~~ sql
SELECT * FROM abc@{NO_ZIGZAG_JOIN};
~~~

To force the optimizer to plan a zigzag join for the specified table, use the hint `FORCE_ZIGZAG`. For example:

~~~ sql
SELECT * FROM abc@{FORCE_ZIGZAG};
~~~

{{site.data.alerts.callout_danger}}
If you have an index named `FORCE_ZIGZAG` and use the hint `table@{FORCE_ZIGZAG}` it will no longer have the same behavior.
{{site.data.alerts.end}}

## Inverted join examples

{% include {{ page.version.version }}/sql/inverted-joins.md %}

## Known limitations

{% include {{page.version.version}}/known-limitations/stats-refresh-upgrade.md %}
{% include {{ page.version.version }}/known-limitations/forecasted-stats-limitations.md %}

## See also

- [`JOIN` expressions]({% link {{ page.version.version }}/joins.md %})
- [`SET {session variable}`]({% link {{ page.version.version }}/set-vars.md %})
- [`SET CLUSTER SETTING`]({% link {{ page.version.version }}/set-cluster-setting.md %})
- [`RESET CLUSTER SETTING`]({% link {{ page.version.version }}/reset-cluster-setting.md %})
- [`SHOW {session variable}`]({% link {{ page.version.version }}/show-vars.md %})
- [`CREATE STATISTICS`]({% link {{ page.version.version }}/create-statistics.md %})
- [`SHOW STATISTICS`]({% link {{ page.version.version }}/show-statistics.md %})
- [`EXPLAIN`]({% link {{ page.version.version }}/explain.md %})
