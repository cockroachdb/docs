---
title: Troubleshoot Query Plan Regressions
summary: Troubleshooting guide for when the cost-based optimizer chooses a new query plan that slows performance.
keywords: query plan, cost-based optimizer, troubleshooting
toc: true
docs_area: manage
---

This page provides guidance on identifying the source of [query plan]({% link {{page.version.version}}/cost-based-optimizer.md %}) regressions.

If the [cost-based optimizer]({% link {{page.version.version}}/cost-based-optimizer.md %}) chooses a new query plan that slows performance, you may observe an unexpected increase in query latency. There are several reasons that the optimizer might choose a plan that increases execution time. This guide will help you understand, identify, and diagnose query plan regressions using built-in CockroachDB tools.

## Before you begin

- [Understand how the cost-based optimizer chooses query plans]({% link {{page.version.version}}/cost-based-optimizer.md %}) based on table statistics, and how those statistics are refreshed.

## Query plan regressions vs. suboptimal plans

The DB Console's [**Insights** page]({% link {{page.version.version}}/ui-insights-page.md %}) keeps track of [suboptimal plans]({% link {{page.version.version}}/ui-insights-page.md %}#suboptimal-plan). A suboptimal plan is a query plan whose execution time exceeds a certain threshold (configurable with the `sql.insights.latency_threshold` cluster setting) and whose slow execution has caused CockroachDB to generate an index recommendation for the table. Table statistics that were once valid, but which are now stale, can lead to a suboptimal plan scenario. A suboptimal plan scenario does not imply that the query plan has changed, and in fact a failure to change the query plan is often the root problem. The **Insights** page identifies these scenarios and provides recommendations on how to fix them.

A query plan regression occurs when the cost-based optimizer chooses an optimal query plan, but then later it changes that query plan to a less optimal one. It is not the same thing as a suboptimal plan, though it is possible that the conditions that triggered a suboptimal plan insight were caused by a query plan regression.

A suboptimal plan scenario that is not a regression will not increase query latency, as the query plan has not changed. A suboptimal plan scenario is instead the system's failure to decrease latency when it could have. A query plan regression will likely increase query latency.

Though these two scenarios are conceptually different, both scenarios will likely require an update to the problematic query plan.

## What to look out for

Query plan regressions only increase the execution time of SQL statements that use that plan. This means that the overall service latency of the cluster will only be affected during the execution of statements that are run with the problematic query plan. 

This might make those latency spikes harder to identify. For example, if the problematic plan only affects a query that's run on an infrequent, ad-hoc basis, it might be difficult to notice a pattern among the graphs on the [**Metrics** page]({% link {{page.version.version}}/ui-overview.md %}#metrics).

In order to identify and fix query plan regressions, you must be able to identify that certain statement executions are associated with increased service latency. Then you need to notice that that statement's query plan has changed. Finally, you need to use CockroachDB's tools to understand why that query plan has changed, so that you can be confident that the query plan change has directly caused the latency increase.

## Troubleshooting

### Step 1. Observe high cluster latency

You might not be certain that any particular SQL statement has had a query plan regression. However, if you've observed cluster activity that is slower than usual, noting specific time intervals or application uses that are associated with that latency can help you identify problematic statements.

#### Notice a recent latency increase in your application

If you observe that your application is responding more slowly than usual, and this behavior hasn't been explained by recent changes to table schemas or data, or by changes to cluster workloads, it's worth considering a query plan regression.

If application activity slows at a particular time of day, note the time interval so that you can isolate SQL statements that tend to run in that interval. 

If instead the latency is associated with a particular action (for example, adding a new user), note the action. Then search through your application's codebase to isolate SQL statements associated with that action.

#### Identify trends in cluster metrics

Knowing what service latency to expect, based on your cluster's usual activity, makes it easier to notice deviations from healthy cluster activity.

1. Open the [DB Console]({% link {{page.version.version}}/ui-overview.md %}).
2. Go to the [**Metrics** page]({% link {{page.version.version}}/ui-overview.md %}#metrics).
3. Look at the graphs on the [**Overview Dashboard**]({% link {{page.version.version}}/ui-overview-dashboard.md %}). By default, the graphs display cluster data from the past hour, but you can adjust this with the time interval selector.
4. Find the **Service Latency: SQL Statements, 99th percentile** graph. Use it to identify instances when service latency is higher than expected, based on typical use. This will depend on your own specific business and technical considerations.
5. If you notice an unexplained latency increase, it's worth considering a query plan regression. Hover your cursor on the line in the graph at the beginning of the increase. The box that appears will indicate the time when the increase began.

<img src="{{ 'images/v25.4/troubleshooting-query-plan-regressions-1.png' | relative_url }}" alt="Query Plan Regression metrics graph"  style="border:1px solid #eee;max-width:100%" />

The above is a very clean example. Note that on a production cluster, an increase like this might be obscured by the normal latency of your cluster's many other statement executions.

### Step 2. Identify high-latency statements

One way of tracking down query plan regressions is to identify SQL statements whose executions are relatively high in latency. Use one or both of the following methods to identify queries that might be associated with a latency increase.

#### Use workload insights

1. Go to the [**Insights** page]({% link {{page.version.version}}/ui-insights-page.md %}) in the DB Console.
2. Go to the [**Workload Insights** tab]({% link {{page.version.version}}/ui-insights-page.md %}#workload-insights-tab).
3. If you've already identified specific time intervals or statements in Step 1, you can use the **Search Statements** input to find particular queries and the time interval selector to create a custom time interval. Otherwise, consider all of the statements in the table.
4. Use the filters to find statements whose **Workload Insight Type** is "Slow Execution" or "Suboptimal Plan."
5. Click on the **Statement Fingerprint ID** to get more information about the SQL statement and its executions.

#### Sort SQL activity

1. Go to the [**SQL Activity** page]({% link {{page.version.version}}/ui-overview.md %}#sql-activity) in the DB Console.
2. If you've already identified specific time intervals in Step 1, you can use the time interval selector to create a custom time interval. Click **Apply**.
3. Among the resulting Statement Fingerprints, look for those with high latency. Click on the column headers to sort the results by **Statement Time** or **Max Latency**. 
4. Click on the Statement Fingerprint to go to the page that details the statement and its executions.
{{site.data.alerts.callout_success}}
Look for statements whose **Execution Count** is high. Statements that are run once, such as import statements, aren't likely to be the cause of increased latency due to query plan regressions.
{{site.data.alerts.end}}

Whether you arrived via the Insights page or the SQL Activity page, once you're on the Statement Fingerprint page, scroll down to the **Statement Times** graph to see a visual representation of the statement's execution times, and how the latency of those executions has changed over time. A sudden increase with no clear explanation may be caused by a query plan regression.

You should now have identified one or more statements that are associated with high execution time. Note that high latency is not necessarily caused by a query plan regression, and query plan regressions might not necessarily increase latency enough to be caught by these methods. These methods will, however, help identify a cluster's high-impact query plan regressions.

### Step 3. Examine the query plans behind suspect statements

For any of the suspect SQL statements that you've identified, it's important to determine the cause of the high latency. Repeat the following steps for any of the statements that you suspect may have had a query plan regression:

1. On the Statement Fingerprint page, click on the [**Explain Plans** tab]({% link {{page.version.version}}/ui-statements-page.md %}#explain-plans).
2. If you've already identified specific time intervals in Step 1, you can use the time interval selector to create a custom time interval. Click **Apply**.
3. If there is only one plan in the resulting table, there was only one plan used for this statement fingerprint during this time interval, and therefore a query plan regression could not have occurred. If there are multiple plans listed in the resulting table, the query plan changed within the given time interval. By default, the table is sorted from most recent to least recent query plan. Compare the **Average Execution Time** of the different plans.

If a plan in the table has a significantly higher average execution time than the one that preceded it, it's possible that this is a query plan regression. It's also possible that the increase in latency is coincidental, or that the plan change was not the actual cause. For example, if the average execution time of the latest query plan is significantly higher than the average execution time of the previous query plan, this could be explained by a significant increase in the **Average Rows Read** column.

### Step 4. Understand why the query plan changed

For any query plans whose increased execution time remains unexplained, investigate further to understand why the plan changed.

1. In the **Explain Plans** tab, click on the Plan Gist of the more recent plan to see it in more detail.
2. Click on **All Plans** above to return to the list of plans.
3. Click on the Plan Gist of the previous plan to see it in more detail. Compare the two plans to understand what changed. Do the plans use different indexes? Are they scanning the different portions of the table? Do they use different join strategies?
4. Note the **Last Execution Time** of the older plan. This might give some indication of when the plan changed.

#### Determine if the table indexes changed

1. Look at the **Used Indexes** column for the older and the newer query plans. If these aren't the same, it's likely that the creation or deletion of an index resulted in a change to the statement's query plan.
2. In the **Explain Plans** tab, click on the Plan Gist of the more recent plan to see it in more detail. Identify the table used in the initial "scan" step of the plan.
3. In your SQL client, run `SHOW INDEXES FROM <table_name>;` using that table name.
4. Make sure that the query plan is using an index that makes sense, given the query and the table's full set of indexes.

It's possible that the new index is well-chosen but that the schema change triggered a statistics refresh that is the root problem. It's also possible that the new index is not ideal. Think about how and when this table gets queried, to determine if the index should be reconsidered. Read more about [secondary index best practices]({% link {{ page.version.version }}/schema-design-indexes.md %}#best-practices).

#### Determine if the table statistics changed

1. In the **Explain Plans** tab, click on the Plan Gist of the more recent plan to see it in more detail. Identify the table used in the initial "scan" step of the plan.
2. In your SQL client, run `SHOW STATISTICS FOR TABLE <table_name>;` using that table name.

    The results will include statistics that were collected for each column in that table. The value in the "created" column of these results tells you when the statistics were collected. Compare the statistics of each table column across multiple timestamps. A change in the values of `row_count`, `distinct_count`, `null_count`, or other statistics may have affected planning. If the timestamp of the new statistics creation is associated with the time that the query plan changed, there may be a causal relationship between the two.

If you suspect that the query plan change is the cause of the latency increase, and you suspect that the query plan changed due to stale statistics, you may want to [manually refresh the statistics for the table]({% link {{ page.version.version }}/create-statistics.md %}#examples).

#### Determine if a literal in the SQL statement has changed

[NOTE FROM BRANDON: I need more information on this case, mainly how to identify that this is the case, and what to do about it.]

If you suspect that the query plan change is the cause of the latency increase, and you suspect that the query plan changed due to a changed query literal, [what should you do]

<br><br>

If none of the above methods are conclusive, consider [activating diagnostics]({% link {{ page.version.version }}/ui-statements-page.md %}#diagnostics) for the suspect statement fingerprints, or [contact support]({% link {{ page.version.version }}/support-resources.md %}).

## See also

- [Cost-Based Optimizer]({% link {{page.version.version}}/cost-based-optimizer.md %})
- [Insights Page]({% link {{page.version.version}}/ui-insights-page.md %})
- [Troubleshooting Overview]({% link {{page.version.version}}/troubleshooting-overview.md %})
- [Support Resources]({% link {{page.version.version}}/support-resources.md %})
