---
title: Cost-Based Optimizer
summary: Learn about the cost-based optimizer
toc: true
---

<span class="version-tag">New in v2.1:</span> The cost-based optimizer seeks the lowest cost for a query, usually related to time.

In version 2.1, CockroachDB's new **cost-based optimizer is enabled by default**. In versions prior to v2.1, a heuristic planner was used to generate query execution plans. The heuristic planner will only be used in the following cases:

- If your query uses functionality that is not supported by the cost-based optimizer
- If you explicitly [turn off the cost-based optimizer](#how-to-turn-the-optimizer-off)

{% include {{ page.version.version }}/misc/beta-warning.md %}

## How is cost calculated?

A given SQL query can have thousands of equivalent query plans with vastly different execution times. The cost-based optimizer enumerates these plans and chooses the lowest cost plan when generating a query execution plan.

Cost is roughly calculated by:

- Estimating how much time each node in the query plan will use to process all results
- Modeling how data flows through the query plan

The most important factor in determining the quality of a plan is cardinality (i.e., the number of rows); the fewer the rows each SQL operator needs to process, the faster the query will run.

## View query plan

To see whether a query will be run with the cost-based optimizer, run the query with [`EXPLAIN (OPT)`](explain.html#opt-option). The `OPT` option displays a query plan tree, along with some information that was used to plan the query. If it returns `pq: unsupported statement: *tree.Insert`, the query will not be run with the cost-based optimizer and will be run with the legacy heuristic planner.

For example, the following query returns the query plan tree, which means that it will be run with the cost-based optimizer:

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

- The cost-based optimizer will not support automated use of statistics during this time period.
- Some features present in v2.0 are not supported by the cost-based optimizer; however, the optimizer will fall back to the v2.0 code path for this functionality. If performance in the new alpha is worse than v2.0, you can [turn the optimizer off](#how-to-turn-the-optimizer-off) to manually force it to fallback to the heuristic planner.
- Some [correlated subqueries](subqueries.html#correlated-subqueries) are not supported by the cost-based optimizer yet. If you come across an unsupported correlated subquery, please [file a Github issue](file-an-issue.html).

## See also

- [`SET (session variable)`](set-vars.html)
- [`SET CLUSTER SETTING`](set-cluster-setting.html)
- [`SHOW (session variable)`](show-vars.html)
- [`EXPLAIN`](explain.html)
