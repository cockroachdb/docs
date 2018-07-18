---
title: SQL Optimizer
summary: Learn about the SQL optimizer
toc: true
---

<span class="version-tag">New in v2.1:</span> The cost-based optimizer seeks the lowest cost for a query, usually related to time.

In versions prior to v2.1, a heuristic planner was used to generate query execution plans.
In version 2.1, CockroachDB's new **cost-based optimizer will be enabled by default**, and the heuristic planner will only be used in the following cases:

- If your query uses functionality that is not supported by the cost-based optimizer
- If you explicitly [turn off the cost-based optimizer](#how-to-turn-the-optimizer-off)

{% include {{ page.version.version }}/misc/beta-warning.md %}

<div id="toc"></div>

## View query plan

To see whether a query will be run with the cost-based optimizer, run the query with [`EXPLAIN (OPT)`](explain.html#opt-option). If `EXPLAIN (OPT)` returns a query plan tree, the query will use the cost-based optimizer. If it returns `pq: unsupported statement: *tree.Insert`, the query will use the heuristic planner.

For example, the following query returns the query plan tree, which means that it will be run with the cost-based optimizer:

{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN (OPT) SELECT * FROM x WHERE a = 3;
~~~

~~~
+--------------------------------------------------------------------------+
|                                   text                                   |
+--------------------------------------------------------------------------+
| select                                                                   |
|  ├── columns: a:1(int!null) b:2(jsonb)                                   |
|  ├── stats: [rows=1.42857143, distinct(1)=1]                             |
|  ├── cost: 1060                                                          |
|  ├── fd: ()-->(1)                                                        |
|  ├── prune: (2)                                                          |
|  ├── scan x                                                              |
|  │    ├── columns: x.a:1(int) x.b:2(jsonb)                               |
|  │    ├── stats: [rows=1000, distinct(1)=700]                            |
|  │    ├── cost: 1050                                                     |
|  │    └── prune: (1,2)                                                   |
|  └── filters [type=bool, outer=(1), constraints=(/1: [/3 - /3]; tight),  |
| fd=()-->(1)]                                                             |
|       └── eq [type=bool, outer=(1), constraints=(/1: [/3 - /3]; tight)]  |
|            ├── variable: x.a [type=int, outer=(1)]                       |
|            └── const: 3 [type=int]                                       |
+--------------------------------------------------------------------------+
(15 rows)
~~~

In contrast, this query returns `pq: unsupported statement: *tree.Insert`, which means that it will use the legacy heuristic planner instead of the cost-based optimizer:

{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN (OPT) INSERT INTO x VALUES (1);
~~~

~~~
pq: unsupported statement: *tree.Insert
~~~

## How to turn the optimizer off

With the optimizer turned on, the performance of some workloads may change. If your workload performs worse than expected (e.g., lower throughput or higher latency), you can turn off the cost-based optimizer and use the heuristic planner.

To turn the cost-based optimizer off for the current session:

{% include copy-clipboard.html %}
~~~ sql
> SET experimental_opt = 'off';
~~~

To turn the cost-based optimizer off for all sessions:

{% include copy-clipboard.html %}
~~~ sql?nofmt
> SET CLUSTER SETTING sql.defaults.optimizer = 'off';
~~~

{{site.data.alerts.callout_info}}
Changing the cluster setting does not immediately turn the optimizer off; instead, it changes the default session setting to `off`. To see the change, restart your session.
{{site.data.alerts.end}}

## Known limitations

- The cost-based optimizer will not support automated use of statistics during this time period.
- Some features present in v2.0 are not supported by the cost-based optimizer; however, the optimizer will fall back to the v2.0 code path for this functionality. If performance in the new alpha is worse than v2.0, you can [turn the optimizer off](#how-to-turn-the-optimizer-off) to manually force it to fallback to the heuristic planner.
- Some correlated subqueries are not supported yet.

## See also

- [`SET (session variable)`](set-vars.html)
- [`SET CLUSTER SETTING`](set-cluster-setting.html)
- [`EXPLAIN`](explain.html)
