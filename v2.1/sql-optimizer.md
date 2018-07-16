---
title: SQL Optimizer
summary: Learn about the SQL Optimizer
toc: false
---

<span class="version-tag">New in v2.1:</span> The SQL Optimizer seeks the lowest cost for a query, usually related to time. **CockroachDB's cost-based Optimizer is enabled by default**, and the heuristic planner will only be invoked on functionality that is not supported by the Optimizer (i.e., on auto-fallback), or if you explicitly [set a cluster or session variable that disables the cost-based Optimizer](#how-to-turn-the-optimizer-off).

{% include {{ page.version.version }}/misc/beta-warning.md %}

<div id="toc"></div>

## View query plan

To see whether a given query will be run with the SQL Optimizer, run the query with `EXPLAIN (OPT)`:

{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN (OPT) INSERT INTO x VALUES (1);
~~~

~~~
pq: unsupported statement: *tree.Insert
~~~

The query above will not be run with the Optimizer.

{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN (OPT) SELECT * FROM x WHERE a = 3;
~~~

~~~
+--------------------------------------------------------------------------+
|                                   text                                   |
+--------------------------------------------------------------------------+
| select                                                                   |
|  ├── ...                                                                 |
...
|                                                                          |
+--------------------------------------------------------------------------+
~~~

The query above will be run with the Optimizer and `EXPLAIN (OPT)` returns the query plan tree.

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
- Some features present in v2.0 are not supported by the Optimizer; however, the Optimizer will fall back to the v2.0 code path for this functionality. If performance in the new alpha is worse than v2.0, you will need to manually force it to fallback to v2.0 (see [How to turn the Optimizer off](#how-to-turn-the-optimizer-off)).

## See also

- [`SET (session variable)`](set-vars.html)
- [`SET CLUSTER SETTING`](set-cluster-setting.html)
