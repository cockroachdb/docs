---
title: SQL Optimizer
summary: Learn about the SQL Optimizer
toc: false
---

<span class="version-tag">New in v2.1:</span> The SQL Optimizer seeks the lowest cost for a query, usually related to time. **CockroachDB's cost-based Optimizer is enabled by default**, and the heuristic planner will only be invoked on functionality that is not supported by the Optimizer (i.e., on auto-fallback), or if you explicitly [set a cluster or session variable that disables the cost-based Optimizer](#how-to-turn-the-optimizer-off).

{% include beta-warning.md %}

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

With the Optimizer turned on, your workloads may perform worse than expected (e.g., lower throughput, higher latency).

To turn the Optimizer off by session:

{% include copy-clipboard.html %}
~~~ sql
SET experimental_opt = 'off';
~~~

To turn the Optimizer off by cluster:

{% include copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING sql.defaults.optimizer = 'off';
~~~

## Known limitations

- The optimizer will not support automated use of statistics during this time period.
- Many optimizations present in 2.0 may not be supported; however, the optimizer will fall back to the v2.0 code path for this functionality. If performance in the new alpha is worse than v2.0, you will need to manually force it to fallback to v2.0 (see [How to turn the Optimizer off](#how-to-turn-the-optimizer-off)).

## See also

- [`SET (session variable)`](set-vars.html)
- [`SET CLUSTER SETTING`](set-cluster-setting.html)
