---
title: Canary Statistics
summary: Test recent statistics on a small group of queries to ensure that you use good plans.
toc: true
docs_area: develop
---

<span class="version-tag">New in v26.2:</span> The _canary statistics_ feature improves [query performance]({% link {{ page.version.version }}/performance-best-practices-overview.md %}) by allowing CockroachDB to try newly collected [table statistics]({% link {{ page.version.version }}/cost-based-optimizer.md %}#table-statistics) on a small number of queries before deploying them for all queries. By testing the efficiency of [query plans]({% link {{ page.version.version }}/cost-based-optimizer.md %}) made with new statistics on a fraction of queries, canary statistics blocks bad plans based on inaccurate statistics from impacting the full workload.

## The canary window

When CockroachDB generates new statistics on a table, they begin in canary status. The `sql_stats_canary_window` [table storage parameter]({% link {{ page.version.version }}/with-storage-parameter.md %}#table-parameters) sets a _canary window_ defining how long the statistics remain in canary status before being promoted to stable status. However, if new statistics are generated, the previous statistics are automatically promoted to stable status even if their canary window has not yet elapsed.

## Queries with canary statistics

When the [query optimizer]({% link {{ page.version.version }}/cost-based-optimizer.md %}) makes a plan for a query, it must determine whether to use canary statistics or stable statistics in its calculations. This determination is random but based on a probability configured in the [`sql.stats.canary_fraction` cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}#setting-sql-stats-canary-fraction). Queries do not mix stastistics statuses, so if a query is selected to use canary statistics, it uses them for all tables. Setting `sql.stats.canary_fraction` to `0` disables canary statistics across all queries.

You can override the configured probability of using canary statistics for a particular session using the `canary_stats_mode` [session variable]({% link {{ page.version.version }}/session-variables.md %}#supported-variables). Set `canary_stats_mode` to `force_canary` to use only canary statistics for the duration of the session, or set it to `force_stable` to use only stable statistics. This variable is useful for debugging or troubleshooting specific queries.

You can also use the `stats_as_of` [session variable]({% link {{ page.version.version }}/session-variables.md %}#supported-variables) to use statistics as of a specified timestamp for the duration of the session. This variable is useful for analyzing how statistics have affected query performance over time.

## Analytical tools for canary statistics

Analyzing canary statistics allows you to visualize how new statistics affect query performance and catch problematic statistics before they impact your full workload. The [DB Console]({% link {{ page.version.version }}/ui-overview.md %}) contains metrics about canary statistics on the [**Statement Fingerprint** page]({% link {{ page.version.version }}/ui-statements-page.md %}#charts). The **Canary vs Stable Statement Times** chart shows planning and execution latency for each statistics set, and the **Canary vs Stable Plan Distribution** chart shows which plans the [query optimizer]({% link {{ page.version.version }}/cost-based-optimizer.md %}) chose using each statistics set.

When using the canary statistics feature, the [`EXPLAIN`]({% link {{ page.version.version }}/explain.md %}) and [`EXPLAIN ANALYZE`]({% link {{ page.version.version }}/explain-analyze.md %}) statements show the table's current canary window and whether a query is using canary statistics or stable statistics.