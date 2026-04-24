---
title: Canary Statistics
summary: Test recent statistics on a small group of queries to ensure that CockroachDB is using good plans.
toc: true
docs_area: develop
---

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

<span class="version-tag">New in v26.2:</span> The _canary statistics_ feature improves [query performance]({% link {{ page.version.version }}/performance-best-practices-overview.md %}) by allowing CockroachDB to try newly collected [table statistics]({% link {{ page.version.version }}/cost-based-optimizer.md %}#table-statistics) on a small number of queries before deploying them for all queries. By testing the efficiency of [query plans]({% link {{ page.version.version }}/cost-based-optimizer.md %}) made with new statistics on a fraction of queries, canary statistics blocks bad plans based on inaccurate statistics from impacting the full workload.

## The canary window

When CockroachDB generates new statistics on a table, they begin in canary status. The `sql_stats_canary_window` [table storage parameter]({% link {{ page.version.version }}/with-storage-parameter.md %}#table-parameters) sets a _canary window_ defining how long the statistics remain in canary status before being promoted to stable status. However, if new statistics are generated, the previous statistics are automatically promoted to stable status even if their canary window has not yet elapsed. If `sql_stats_canary_window` is set to 0, the canary statistics feature is disabled.

Example usage:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE t (x int) WITH (sql_stats_canary_window = '1h');
~~~

If you create statistics manually with [`ANALYZE` or `CREATE STATISTICS`]({% link {{ page.version.version }}/create-statistics.md %}), they are also subject to the canary window. However, you can force manually created statistics to take effect immediately using [`ALTER TABLE`]({% link {{ page.version.version }}/alter-table.md %}) with the [`RESET`]({% link {{ page.version.version }}/alter-table.md %}#reset-storage-parameter) subcommand.

Example:

{% include_cached copy-clipboard.html %}
~~~ sql
ANALYZE t;
-- reset the canary window to 0, causing queries to use the new stats immediately
ALTER TABLE t RESET (sql_stats_canary_window);
-- wait 1 hour for the skipped canary widow to elapse, then set the window again
ALTER TABLE t SET (sql_stats_canary_window = '1h');
~~~

## Queries with canary statistics

When the [query optimizer]({% link {{ page.version.version }}/cost-based-optimizer.md %}) makes a plan for a query, it must determine whether to use canary statistics or stable statistics in its calculations. This determination is based on a probability configured in the [`sql.stats.canary_fraction` cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}#setting-sql-stats-canary-fraction). Queries do not mix stastistics types, so if a query is selected to use canary statistics, it uses them for all tables. Setting `sql.stats.canary_fraction` to `0` disables canary statistics across all queries.

Example usage:

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING sql.stats.canary_fraction = 0.2;
~~~

You can override the configured probability of using canary statistics for a particular session using the `canary_stats_mode` [session variable]({% link {{ page.version.version }}/session-variables.md %}#supported-variables). Set `canary_stats_mode` to `force_canary` to use only canary statistics for the duration of the session, or set it to `force_stable` to use only stable statistics. This variable is useful for debugging or troubleshooting specific queries.

Example usage:

{% include_cached copy-clipboard.html %}
~~~ sql
SET canary_stats_mode = 'force_canary';
~~~

## Analytical tools for canary statistics

Analyzing canary statistics allows you to visualize how new statistics affect query performance and catch problematic statistics before they impact your full workload. The [DB Console]({% link {{ page.version.version }}/ui-overview.md %}) contains metrics about canary statistics on the [**Statement Fingerprint** page]({% link {{ page.version.version }}/ui-statements-page.md %}#charts). The **Canary vs Stable Statement Times** chart shows planning and execution latency for each statistics set, and the **Canary vs Stable Plan Distribution** chart shows which plans the [query optimizer]({% link {{ page.version.version }}/cost-based-optimizer.md %}) chose using each statistics set. These charts only appear when canary statistics are enabled.

When using the canary statistics feature, the [`EXPLAIN`]({% link {{ page.version.version }}/explain.md %}) and [`EXPLAIN ANALYZE`]({% link {{ page.version.version }}/explain-analyze.md %}) statements show the table's current canary window and whether a query is using canary statistics or stable statistics. These fields only appear when canary statistics are enabled.

## See also

- [Cost-Based Optimizer]({% link {{ page.version.version }}/cost-based-optimizer.md %})
- [SQL Performance Best Practices]({% link {{ page.version.version }}/performance-best-practices-overview.md %})
- [`WITH (storage parameter)`]({% link {{ page.version.version }}/with-storage-parameter.md %})
- [Cluster Settings]({% link {{ page.version.version }}/cluster-settings.md %})
- [Session Variables]({% link {{ page.version.version }}/session-variables.md %})
- [`EXPLAIN`]({% link {{ page.version.version }}/explain.md %})
- [`EXPLAIN ANALYZE`]({% link {{ page.version.version }}/explain-analyze.md %})
- [Statements Page]({% link {{ page.version.version }}/ui-statements-page.md %})