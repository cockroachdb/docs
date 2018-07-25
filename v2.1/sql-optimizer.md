---
title: SQL Optimizer
summary: Learn about the SQL Optimizer
toc: false
---

<span class="version-tag">New in v2.1:</span> The cost-based Optimizer seeks the lowest cost for a query, usually related to time.

In versions prior to v2.1, a heuristic planner was used to generate query execution plans.
In version 2.1, CockroachDB's new **cost-based Optimizer will be enabled by default**, and the legacy heuristic planner will only be used in the following cases:

- If your query uses functionality that is not supported by the cost-based Optimizer
- If you explicitly [turn off the cost-based Optimizer](#how-to-turn-the-optimizer-off)

{% include {{ page.version.version }}/misc/beta-warning.md %}

<div id="toc"></div>

## View query plan


To see whether a given query will be run with the cost-based Optimizer, run the query with `EXPLAIN (OPT)`. If `EXPLAIN (OPT)` returns a query plan tree, that query will be run with the cost-based Optimizer. If it returns `pq: unsupported statement: *tree.Insert`, the query will not be run with the cost-based Optimizer.

For example:

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

The query above will be run with the cost-based Optimizer and `EXPLAIN (OPT)` returns the query plan tree.


{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN (OPT) INSERT INTO x VALUES (1);
~~~

~~~
pq: unsupported statement: *tree.Insert
~~~

The query above will not be run with the cost-based Optimizer.

## How to turn the Optimizer off

With the Optimizer turned on, the performance of some workloads may change. If your workload performs worse than expected (e.g., lower throughput or higher latency), you can turn off the cost-based Optimizer and use the heuristic Optimizer.

To turn the cost-based Optimizer off by session:

{% include copy-clipboard.html %}
~~~ sql
> SET experimental_opt = 'off';
~~~

To change the cost-based Optimizer's default cluster setting:

{% include copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING sql.defaults.optimizer = 'off';
~~~

{{site.data.alerts.callout_info}}
Changing the cluster setting does not immediately turn the Optimizer off; instead, it changes the default session setting to `off`. To see the change, restart your session.
{{site.data.alerts.end}}

## Known limitations

- The optimizer will not support automated use of statistics during this time period.
- Some features present in v2.0 are not supported by the Optimizer; however, the Optimizer will fall back to the v2.0 code path for this functionality. If performance in the new alpha is worse than v2.0, you can [turn the Optimizer off](#how-to-turn-the-optimizer-off) to manually force it to fallback to the heuristic planner.
- Some correlated subqueries are not supported yet.

## See also

- [`SET (session variable)`](set-vars.html)
- [`SET CLUSTER SETTING`](set-cluster-setting.html)
- [`EXPLAIN`](explain.html)
