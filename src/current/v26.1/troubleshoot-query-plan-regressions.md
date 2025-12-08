---
title: Troubleshoot Query Plan Regressions
summary: Troubleshooting guide for when the cost-based optimizer chooses a new query plan that slows performance.
keywords: query plan, cost-based optimizer, troubleshooting
toc: true
docs_area: manage
---

This page provides guidance on identifying the source of [query plan]({% link {{page.version.version}}/cost-based-optimizer.md %}) regressions.

For any given SQL statement, if the [cost-based optimizer]({% link {{page.version.version}}/cost-based-optimizer.md %}) chooses a new query plan that slows performance, you may observe an unexpected increase in query latency. This is considered a query plan regression. There are several reasons that the optimizer might choose a plan that increases execution time. This guide helps you understand, identify, and diagnose query plan regressions using built-in CockroachDB tools.

## Before you begin

- [Understand how the cost-based optimizer chooses query plans]({% link {{page.version.version}}/cost-based-optimizer.md %}) based on table statistics and how those statistics are refreshed.

## What to look out for

Query plan regressions only increase the execution time of SQL statements that use the affected plan. This means that the overall service latency of the cluster will only be affected during the execution of statements that are run with the problematic query plan.

As a result, these latency spikes can be hard to identify. For example, if the problematic plan only affects a query that's run on an infrequent, ad-hoc basis, it might be difficult to notice a pattern among the graphs on the [**Metrics** page]({% link {{page.version.version}}/ui-overview.md %}#metrics).

To identify and fix query plan regressions, you must determine whether certain statement executions are associated with increased service latency. Next, check whether the statement’s query plan has changed. Finally, use CockroachDB tools to understand why the query plan changed, so you can confirm that the change directly caused the latency increase.

## Troubleshooting

### Step 1. Observe high cluster latency

You might not be certain whether any particular SQL statement has experienced a query plan regression. However, if you've observed cluster activity that is slower than usual, noting specific time intervals or application uses associated with the latency can help identify problematic statements.

#### Notice a recent latency increase in your application

If you observe that your application is responding more slowly than usual, and this behavior isn’t explained by recent changes to table schemas, data, or cluster workloads, it's worth considering a query plan regression.

If performance slows at a particular time of day, note the time interval to help isolate SQL statements that typically run during that time.

If instead the latency is associated with a particular action (for example, adding a new user), note the action. Then search through your application's codebase to isolate SQL queries associated with that action.

#### Identify trends in cluster metrics

Knowing what service latency to expect, based on your cluster's usual activity, makes it easier to notice deviations from healthy cluster activity.

1. Open the [DB Console]({% link {{page.version.version}}/ui-overview.md %}).
2. Go to the [**Metrics** page]({% link {{page.version.version}}/ui-overview.md %}#metrics).
3. Look at the graphs on the [**Overview Dashboard**]({% link {{page.version.version}}/ui-overview-dashboard.md %}). By default, the graphs display cluster data from the past hour, but you can adjust this with the time interval selector.
4. Find the **Service Latency: SQL Statements, 99th percentile** graph. Use it to identify instances when service latency is higher than expected, based on typical use. This will depend on your own specific business and technical considerations.
5. If you notice an unexplained latency increase, it's worth considering a query plan regression. Hover your cursor on the line in the graph at the beginning of the increase. The box that appears will indicate the time when the increase began.

    <img src="{{ 'images/v26.1/troubleshooting-query-plan-regressions-1.png' | relative_url }}" alt="Query Plan Regression metrics graph"  style="border:1px solid #eee;max-width:100%" />

    The above is a very clean example. Note that on a production cluster, an increase like this might be obscured by the normal latency of your cluster's many other statement executions.

### Step 2. Identify high-latency statements

One way to track down query plan regressions is to identify SQL statements with relatively high execution latency. These statements may be associated with increased latency.

1. Go to the [**SQL Activity** > **Statements** page]({% link {{page.version.version}}/ui-statements-page.md %}) in the DB Console.
2. If you identified specific time intervals in Step 1, use the time interval selector to define a custom interval. Click **Apply**.
3. Among the resulting Statement Fingerprints, look for those with high latency. Sort the results by clicking the column headers for **Statement Time** or **Max Latency**. 
4. Click on the Statement Fingerprint to go to the page that details the statement and its executions.
{{site.data.alerts.callout_success}}
Look for statements whose **Execution Count** is high. Statements that are run once, such as [`IMPORT INTO`]({% link {{page.version.version}}/import-into.md %}) statements, are unlikely to cause increased latency due to query plan regressions.
{{site.data.alerts.end}}
5. Scroll down to the **Statement Times** graph to view a visual representation of the statement's execution times and how their latency has changed over time. A sudden increase with no clear explanation may be caused by a query plan regression.

    If you haven't yet identified a specific point in time at which service latency increased, use this graph to do so for this SQL statement.

By now, you should have identified one or more statements with high execution time and the point when their latency began to increase. High latency isn’t always caused by a query plan regression, and some regressions may not increase latency enough to be detected by these methods. However, these methods can help identify high-impact query plan regressions in your cluster.

### Step 3. Examine the query plans behind suspect statements

For each suspect SQL statement, determine whether the high latency is caused by a suboptimal query plan. Repeat the following steps for each statement you suspect may have experienced a query plan regression:

1. On the Statement Fingerprint page, click on the [**Explain Plans** tab]({% link {{page.version.version}}/ui-statements-page.md %}#explain-plans). The **Explain Plans** tab lists every unique query plan that was used for this statement fingerprint during the given time interval, along with relevant statistics for that plan's executions. By default, these plans are sorted by **Last Execution Time**.
2. Use the time interval selector to create a custom time interval for the Explain Plans table. Create a time interval for the hour just <u>after</u> the statement's latency increase. Click **Apply**.
3. Note which query plan was in use just after the latency increase, and record the values in the **Plan Gist**, **Average Execution Time**, and **Average Rows Read** columns.
4. Create another custom time interval for the hour just <u>before</u> the statement's latency increase. Click **Apply**.
5. Note which query plan was in use just before the latency increase, and record the values in the **Plan Gist**, **Average Execution Time**, and **Average Rows Read** columns.
6. Compare the query plans.
    
If the newer plan matches the older plan (that is, it has the same **Plan Gist**), there was no query plan regression.
    
If the newer plan differs from the older plan, the query plan has changed:
    
- Compare the **Average Execution Time** of the two plans. If the newer plan’s average execution time is significantly higher than the older plan’s, it may indicate a query plan regression. It's also possible that the increase in latency is coincidental, or that the plan change was not the actual cause. If the average execution time is approximately the same, or less, this plan change is unlikely to be a regression.
- Compare the **Average Rows Read** of the two plans. If the newer plan’s value is significantly higher (such as an order of magnitude greater), it likely indicates a query plan regression. If the value for the newer plan is only moderately higher than the value for the older plan, it's possible that this is due to a query plan regression, but it's also possible that this is due to normal table growth. This increase may contribute to higher average execution time.
- For all of the query plan statistics in the table, consider whether the newer query plan's values are expected, based on your knowledge of the application and cluster workloads.

#### Multiple valid query plans

If multiple query plans were used before and after the latency increase, the SQL statement may have multiple valid query plans. This can occur when the optimizer chooses a plan based on literal values in the SQL query, those replaced by the "_" placeholder in the statement fingerprint. The optimizer may decide that different plans are better for different literal values.

With multiple valid query plans, you’re not just looking for a plan change, but for a shift in the _distribution of plans_ used for the statement.

- Look at the query plans that were used in the time interval after the latency increase. Note the values in the **Execution Count** column for each plan. Repeat the process for the interval before the latency increase. This will let you know not only if the same query plans were being used during both intervals, but also if their distributions changed. If the distribution shifts toward a plan with higher average execution time, it may indicate a query plan regression.

{{site.data.alerts.callout_success}}
If you couldn’t identify a specific moment when latency increased, you won’t have a clear "before" and "after" to compare. In this case, it’s still helpful to have a general sense of when the increase occurred (using the methods from Step 1) even if the range spans several hours. You can then use the above methods (in Step 3) to compare query plans on a rolling basis by changing the custom time interval to consecutive hour-long intervals. This approach can help identify the specific interval when the latency spike occurred.
{{site.data.alerts.end}}

### Step 4. Understand why the query plan changed

For any query plans whose increased execution time seems suspicious, investigate further to understand why the plan changed.

1. In the **Explain Plans** tab, click the **Plan Gist** of the more recent plan to view its details.
2. Click on **All Plans** above to return to the full list.
3. Click on the Plan Gist of the previous plan to inspect it in more detail. Compare the two plans to understand what changed. They may use different indexes. They may also scan different parts of the table or use different join strategies.

#### Determine if the table indexes changed

1. Check the **Used Indexes** column for both the older and newer query plans. If these differ, it's likely that the creation or deletion of an index resulted in a change to the statement's query plan.
2. In the **Explain Plans** tab, click the **Plan Gist** of the more recent plan to view its details. Identify the table(s) used in the initial "scan" step of the plan.
3. In your SQL client, run `SHOW INDEXES FROM <table_name>;` for each of those tables.
4. Make sure that the query plan is using a table index that makes sense, given the query and the table's full set of indexes.

The new index may be well-chosen, but the schema change could have triggered a statistics refresh that caused the issue. It's also possible that the new index is not ideal. Consider how and when the table is queried to determine whether the index should be reconsidered. [Check the **Insights** page for index recommendations]({% link {{ page.version.version }}/ui-insights-page.md %}#suboptimal-plan), and read more about [secondary index best practices]({% link {{ page.version.version }}/schema-design-indexes.md %}#best-practices).

#### Determine if the table statistics changed

1. In the **Explain Plans** tab, click the Plan Gist of the more recent plan to view its details. Identify the table used in the initial "scan" step of the plan.
2. In your SQL client, run `SHOW STATISTICS FOR TABLE <table_name>;` using that table name.

    The results will include statistics that were collected for each column in that table. The value in the "created" column of these results tells you when the statistics were collected. Compare the statistics of each table column across multiple timestamps. A change in the values of `row_count`, `distinct_count`, `null_count`, or other statistics may have affected planning. If the timestamp of the new statistics creation is associated with the time that the query plan changed, there may be a causal relationship between the two.

If you suspect that stale statistics caused the plan change and resulting latency increase, consider [manually refreshing the table’s statistics]({% link {{ page.version.version }}/create-statistics.md %}#examples).

You may also want to consider the rare case in which sampling for [histogram]({% link {{ page.version.version }}/cost-based-optimizer.md %}#control-histogram-collection) collection missed important values that would impact planning. You might want to increase the [number of rows sampled for histograms]({% link {{ page.version.version }}/cluster-settings.md %}#setting-sql-stats-histogram-samples-count) before refreshing the table statistics.

#### Determine if a literal in the SQL statement has changed

If the SQL statement fingerprint contains placeholder values ("_"), a change in a literal may be responsible for a query plan regression. This is also worth considering in the case of [multiple valid query plans](#multiple-valid-query-plans), if a change in the distribution of plans has led to a higher average execution time.

Inspect your application to determine whether the query literals are changing between executions.

If you suspect the plan change caused the latency increase and was triggered by a changed query literal, table statistics may not accurately reflect how those values appear in the data. You may want to [manually refresh the statistics for the table]({% link {{ page.version.version }}/create-statistics.md %}#examples). It’s also possible that the current indexes aren’t effective for queries with the new literal value. In that case, [check the **Insights** page for index recommendations]({% link {{ page.version.version }}/ui-insights-page.md %}#suboptimal-plan). 

If the issue persists, a more substantial redesign of the schema or application may be required.

#### View all events

1. Go to the [**Metrics** page]({% link {{page.version.version}}/ui-overview.md %}#metrics).
2. Go to the [**Events** panel]({% link {{page.version.version}}/ui-runtime-dashboard.md %}#events-panel) on the right. Scroll to the bottom, and click **View All Events**.
3. Scroll down to the approximate time when the latency increase began.

    Check for any events around that time that may have contributed to a query plan regression. These may include schema changes affecting tables in suspect SQL queries, [modified cluster settings]({% link {{ page.version.version }}/set-cluster-setting.md %}), created or dropped indexes, and more. 
    
    An event around the time of the latency increase may have influenced how the optimizer selected query plans. Inspect changed cluster settings, or [determine if the table indexes changed](#determine-if-the-table-indexes-changed).

    {{site.data.alerts.callout_success}}
    If your cluster recently underwent a CockroachDB version upgrade, note when that went into effect. An upgrade may have affected default cluster settings or planning heuristics in a way that caused a query plan regression. You may want to [manually refresh the statistics for tables]({% link {{ page.version.version }}/create-statistics.md %}#examples) that are affected by a suspect SQL statement.
    {{site.data.alerts.end}}

<br>

If none of the above methods are conclusive in diagnosing or fixing a query plan regression, consider [activating diagnostics]({% link {{ page.version.version }}/ui-statements-page.md %}#diagnostics) for the suspect statement fingerprints, or [contact support]({% link {{ page.version.version }}/support-resources.md %}).

## See also

- [Cost-Based Optimizer]({% link {{page.version.version}}/cost-based-optimizer.md %})
- [Insights Page]({% link {{page.version.version}}/ui-insights-page.md %})
- [Troubleshooting Overview]({% link {{page.version.version}}/troubleshooting-overview.md %})
- [Support Resources]({% link {{page.version.version}}/support-resources.md %})
