---
title: Cost-Based Optimizer
summary: Learn about the cost-based optimizer
toc: true
redirect_from: sql-optimizer.html
---

The cost-based optimizer seeks the lowest cost for a query, usually related to time.

In versions prior to 2.1, a heuristic planner was used to generate query execution plans. The heuristic planner is only used in the following cases:

- If your query uses functionality that is not yet supported by the cost-based optimizer. For more information about the types of queries that are supported, see [Types of statements supported by the cost-based optimizer](#types-of-statements-supported-by-the-cost-based-optimizer).
- If you explicitly turn off the optimizer. For more information, see [How to turn the optimizer off](#how-to-turn-the-optimizer-off).

{% include {{ page.version.version }}/misc/beta-warning.md %}

## How is cost calculated?

A given SQL query can have thousands of equivalent query plans with vastly different execution times. The cost-based optimizer enumerates these plans and chooses the lowest cost plan.

Cost is roughly calculated by:

- Estimating how much time each node in the query plan will use to process all results
- Modeling how data flows through the query plan

The most important factor in determining the quality of a plan is cardinality (i.e., the number of rows); the fewer rows each SQL operator needs to process, the faster the query will run.

## View query plan

To see whether a query will be run with the cost-based optimizer, run the query with [`EXPLAIN (OPT)`](explain.html#opt-option). The `OPT` option displays a query plan tree, along with some information that was used to plan the query. If the query is unsupported (i.e., it returns an error like `pq: unsupported statement: *tree.Insert` or `pq: aggregates with FILTER are not supported yet`), the query will not be run with the cost-based optimizer and will be run with the legacy heuristic planner.

For example, the following query (which uses [CockroachDB's TPC-H data set](https://github.com/cockroachdb/cockroach/tree/b1a57102d8e99b301b74c97527c1b8ffd4a4f3f1/pkg/workload/tpch)) returns the query plan tree, which means that it will be run with the cost-based optimizer:

{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN(OPT) SELECT l_shipmode, avg(l_extendedprice) from lineitem GROUP BY l_shipmode;
~~~

~~~
                                     text
+-----------------------------------------------------------------------------+
group-by
├── columns: l_shipmode:15(string!null) avg:17(float)
├── grouping columns: l_shipmode:15(string!null)
├── stats: [rows=700, distinct(15)=700]
├── cost: 1207
├── key: (15)
├── fd: (15)-->(17)
├── prune: (17)
├── scan lineitem
│    ├── columns: l_extendedprice:6(float!null) l_shipmode:15(string!null)
│    ├── stats: [rows=1000, distinct(15)=700]
│    ├── cost: 1180
│    └── prune: (6,15)
└── aggregations [outer=(6)]
└── avg [type=float, outer=(6)]
└── variable: l_extendedprice [type=float, outer=(6)]
(16 rows)
~~~

In contrast, this query returns `pq: unsupported statement: *tree.Insert`, which means that it will use the legacy heuristic planner instead of the cost-based optimizer:

{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN (OPT) INSERT INTO l_shipmode VALUES ("truck");
~~~

~~~
pq: unsupported statement: *tree.Insert
~~~

## Types of statements supported by the cost-based optimizer

The cost-based optimizer supports most SQL statements. Specifically, the following types of statements are supported:

- [`CREATE TABLE`](create-table.html)
- [`INSERT`](insert.html)
- [Sequences](create-sequence.html)
- [Views](views.html)

The following additional statements are supported by the optimizer if you set the `experimental_optimizer_updates` [cluster setting](set-cluster-setting.html) to `true`:

- [`UPDATE`](update.html)
- [`UPSERT`](upsert.html)

For instructions showing how to check whether a particular query will be run with the cost-based optimizer, see the [View query plan](#view-query-plan) section.

## Table statistics

The cost-based optimizer can often find more performant query execution plans if it has access to statistical data on the contents of your database's tables. This statistical data needs to be generated from scratch for new tables, and regenerated periodically for existing tables.

There are several ways to generate table statistics:

1. Run the [`CREATE STATISTICS`](create-statistics.html) statement manually.
2. <span class="version-tag">New in v2.2</span> Enable the automatic table statistics feature.

Each method is described below.

### Manually generating table statistics

To manually generate statistics for a table, run a [`CREATE STATISTICS`](create-statistics.html) statement like the one shown below. It automatically figures out which columns to get statistics on -- specifically, it chooses columns which are part of the primary key or an index.

{% include copy-clipboard.html %}
~~~ sql
> CREATE STATISTICS __auto__ FROM employees;
~~~

### Automatic table statistics

<span class="version-tag">New in v2.2</span>: CockroachDB can generate table statistics automatically as tables are updated.

To turn on this feature:

1. For each table in the database, run [`CREATE STATISTICS`](create-statistics.html) manually **before** enabling the automatic statistics flag. This is necessary to prevent the system from getting too overloaded right after the feature is enabled.

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE STATISTICS __auto__ FROM table1;  -- Repeat for table2, table3, ..., tableN.
    ~~~

2. Run the following statement to turn on the automatic statistics system:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SET sql.defaults.experimental_automatic_statistics=true
    ~~~

## Query plan cache

<span class="version-tag">New in v2.2</span>: CockroachDB can use a cache for the query plans generated by the optimizer. This can lead to faster query execution since the database can reuse a query plan that was previously calculated, rather than computing a new plan each time a query is executed.

The query plan cache is disabled by default. To enable it, execute the following statement:

{% include copy-clipboard.html %}
~~~ sql
> SET sql.query_cache.enabled=true;
~~~

{{site.data.alerts.callout_info}}
The query plan cache is still under development and has the following limitations:  
- The cache is only used for non-prepared statements (i.e., queries that correspond to the ["simple query" pgwire message](https://www.postgresql.org/docs/10/protocol-flow.html#id-1.10.5.7.4)).  
- The cache has simplistic memory management: it uses a fixed number of "slots" and rejects all plans above a certain size.  
- If you use the query plan cache in conjunction with table statistics, cached plans do not yet get invalidated when new statistics are created.
{{site.data.alerts.end}}

## Join reordering

<span class="version-tag">New in v2.2</span>: The cost-based optimizer will explore additional join orderings in an attempt to find the lowest-cost execution plan for a query involving multiple joins, which can lead to significantly better performance in some cases.

Because this process leads to an exponential increase in the number of possible execution plans for such queries, it's only used to reorder subtrees containing 4 or fewer joins by default.

To change this setting, which is controlled by the `experimental_reorder_joins_limit` [session variable](set-vars.html), run the statement shown below.  To disable this feature, set the variable to `0`.

{% include copy-clipboard.html %}
~~~ sql
> SET experimental_reorder_joins_limit = 6;
~~~

{{site.data.alerts.callout_danger}}
We strongly recommend not setting this value higher than 8 to avoid performance degradation. If set too high, the cost of generating and costing execution plans can end up dominating the total execution time of the query.
{{site.data.alerts.end}}

For more information about the difficulty of selecting an optimal join ordering, see our blog post [An Introduction to Join Ordering](https://www.cockroachlabs.com/blog/join-ordering-pt1/).

## How to turn the optimizer off

With the optimizer turned on, the performance of some workloads may change. If your workload performs worse than expected (e.g., lower throughput or higher latency), you can turn off the cost-based optimizer and use the heuristic planner.

To turn the cost-based optimizer off for the current session:

{% include copy-clipboard.html %}
~~~ sql
> SET optimizer = 'off';
~~~

To turn the cost-based optimizer off for all sessions:

{% include copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING sql.defaults.optimizer = 'off';
~~~

{{site.data.alerts.callout_info}}
Changing the cluster setting does not immediately turn the optimizer off; instead, it changes the default session setting to `off`. To see the change, restart your session.
{{site.data.alerts.end}}

## Known limitations

- Some features are not supported by the cost-based optimizer; however, the optimizer will fall back to the heuristic planner for this functionality. If performance is worse than in previous versions of CockroachDB, you can [turn the optimizer off](#how-to-turn-the-optimizer-off) to manually force it to fallback to the heuristic planner.
- Some [correlated subqueries](subqueries.html#correlated-subqueries) are not supported by the cost-based optimizer yet. If you come across an unsupported correlated subquery, please [file a Github issue](file-an-issue.html).

## See also

- [`SET (session variable)`](set-vars.html)
- [`SET CLUSTER SETTING`](set-cluster-setting.html)
- [`SHOW (session variable)`](show-vars.html)
- [`CREATE STATISTICS`](create-statistics.html)
- [`SHOW STATISTICS`](show-statistics.html)
- [`EXPLAIN`](explain.html)
