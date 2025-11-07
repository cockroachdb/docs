---
title: Troubleshoot Query Plan Regressions
summary: Troubleshooting guide for when the cost-based optimizer chooses a new query plan that slows performance.
keywords: query plan, cost-based optimizer, troubleshooting
toc: true
docs_area: manage
---

This page provides guidance on identifying the source of [query plan]({% link {{page.version.version}}/cost-based-optimizer.md %}) regressions.

For any given SQL statement, if the [cost-based optimizer]({% link {{page.version.version}}/cost-based-optimizer.md %}) chooses a new query plan that slows performance, you may observe an unexpected increase in query latency. There are several reasons that the optimizer might choose a plan that increases execution time. This guide will help you understand, identify, and diagnose query plan regressions using built-in CockroachDB tools.

## Before you begin

- [Understand how the cost-based optimizer chooses query plans]({% link {{page.version.version}}/cost-based-optimizer.md %}) based on table statistics, and how those statistics are refreshed.

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

If instead the latency is associated with a particular action (for example, adding a new user), note the action. Then search through your application's codebase to isolate SQL queries associated with that action.

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

One way of tracking down query plan regressions is to identify SQL statements whose executions are relatively high in latency. These statements might be associated with a latency increase.

1. Go to the [**SQL Activity** page]({% link {{page.version.version}}/ui-overview.md %}#sql-activity) in the DB Console.
2. If you've already identified specific time intervals in Step 1, you can use the time interval selector to create a custom time interval. Click **Apply**.
3. Among the resulting Statement Fingerprints, look for those with high latency. Click on the column headers to sort the results by **Statement Time** or **Max Latency**. 
4. Click on the Statement Fingerprint to go to the page that details the statement and its executions.
{{site.data.alerts.callout_success}}
Look for statements whose **Execution Count** is high. Statements that are run once, such as [`IMPORT INTO`]({% link {{page.version.version}}/import-into.md %}) statements, aren't likely to be the cause of increased latency due to query plan regressions.
{{site.data.alerts.end}}
5. Scroll down to the **Statement Times** graph to see a visual representation of the statement's execution times, and how the latency of those executions has changed over time. A sudden increase with no clear explanation may be caused by a query plan regression.

    If you haven't yet identified a specific point in time at which service latency increased, use this graph to do so for this SQL statement.

You should now have identified one or more statements that are associated with high execution time, and for each of those statements you should have identified a time at which the latency for that statement's executions began to increase. Note that high latency is not necessarily caused by a query plan regression, and query plan regressions might not necessarily increase latency enough to be caught by these methods. These methods will, however, help identify a cluster's high-impact query plan regressions.

### Step 3. Examine the query plans behind suspect statements

For any of the suspect SQL statements that you've identified, it's important to determine if the high latency is being caused by poorly chosen query plans. Repeat the following steps for any of the statements that you suspect may have had a query plan regression:

1. On the Statement Fingerprint page, click on the [**Explain Plans** tab]({% link {{page.version.version}}/ui-statements-page.md %}#explain-plans). The **Explain Plans** tab lists every unique query plan that was used for this statement fingerprint during the given time interval, along with relevant statistics for that plan's executions. By default, these plans are sorted by **Last Execution Time**.
2. Use the time interval selector to create a custom time interval for the Explain Plans table. Create a time interval for the hour just <u>after</u> the statement's latency increase. Click **Apply**.
3. Note which query plan was in use just after the latency increase.
4. Create another custom time interval for the hour just <u>before</u> the statement's latency increase. Click **Apply**.
5. Note which query plan was in use just before the latency increase.
6. Compare the query plans.
    
If the newer plan is the same as the older plan (if it has the same Plan Gist), then there was no query plan regression, because the plan hasn't changed.
    
If the newer plan is different than the older plan, the query plan has changed:
    
- Compare the **Average Execution Time** of the two plans. If the newer plan has a significantly higher average execution time than the older plan, it's possible that this is a query plan regression. It's also possible that the increase in latency is coincidental, or that the plan change was not the actual cause. If the average execution time is approximately the same, or less, this plan change is unlikely to be a regression.
- Compare the **Average Rows Read** of the two plans. If the value for the newer plan is significantly higher than the value for the older plan (as in: an order of magnitude) it's very possible that this is due to a query plan regression. If the value for the newer plan is only moderately higher than the value for the older plan, it's possible that this is due to a query plan regression, but it's also possible that this is due to normal table growth. An increase in this value could be causing an increase in the average execution time.
- For all of the query plan statistics in the table, consider whether the newer query plan's values are expected, based on your knowledge of the application and cluster workloads.

#### Multiple valid query plans

If there are multiple query plans used before and after the latency increase, it's possible that this SQL statement has multiple valid query plans. This might be the case if the query plan is chosen based on the values of literals within the SQL queries (the values that are replaced by the placeholder "_" in the statement fingerprint). The optimizer may decide that different plans are better for different literal values.

In the case of multiple valid query plans, you are not simply looking for a change in the query plan for a certain SQL statement, but rather a change in the _distribution of multiple query plans_ for a certain SQL statement.

- Look at the query plans that were used in the time interval after the latency increase. Note the values in the **Execution Count** column for each plan. Do the same for the query plans in the time interval before the latency increase. This will let you know not only if the same query plans were being used during both intervals, but also if their distributions changed. If the distribution changed such that a plan with a higher average execution time is being used for a higher proportion of executions, this might be due to a query plan regression.

{{site.data.alerts.callout_success}}
If you were unable to identify a specific moment in time when the latency increased, you won't have a specific "before" and "after" to compare. If this is the case, it would still be useful to have a vague sense of the time of the increase (using the methods in Step 1), even if that range is many hours long. You can then use the above methods (in Step 3) to compare query plans on a rolling basis by changing the custom time interval to consecutive hour-long intervals. This might help you discover the specific time interval in which a sudden latency increase occurred.
{{site.data.alerts.end}}

### Step 4. Understand why the query plan changed

For any query plans whose increased execution time seems suspicious, investigate further to understand why the plan changed.

1. In the **Explain Plans** tab, click on the Plan Gist of the more recent plan to see it in more detail.
2. Click on **All Plans** above to return to the list of plans.
3. Click on the Plan Gist of the previous plan to inspect it in more detail. Compare the two plans to understand what changed. They might be using different indexes. They also might be scanning different portions of the table, or using different join strategies.

#### Determine if the table indexes changed

1. Look at the **Used Indexes** column for the older and the newer query plans. If these aren't the same, it's likely that the creation or deletion of an index resulted in a change to the statement's query plan.
2. In the **Explain Plans** tab, click on the Plan Gist of the more recent plan to see it in more detail. Identify the table(s) used in the initial "scan" step of the plan.
3. In your SQL client, run `SHOW INDEXES FROM <table_name>;` for each of those tables.
4. Make sure that the query plan is using a table index that makes sense, given the query and the table's full set of indexes.

It's possible that the new index is well-chosen but that the schema change triggered a statistics refresh that is the root problem. It's also possible that the new index is not ideal. Think about how and when this table gets queried, to determine if the index should be reconsidered. [Check the **Insights** page for index recommendations]({% link {{ page.version.version }}/ui-insights-page.md %}#suboptimal-plan), and read more about [secondary index best practices]({% link {{ page.version.version }}/schema-design-indexes.md %}#best-practices).

#### Determine if the table statistics changed

1. In the **Explain Plans** tab, click on the Plan Gist of the more recent plan to see it in more detail. Identify the table used in the initial "scan" step of the plan.
2. In your SQL client, run `SHOW STATISTICS FOR TABLE <table_name>;` using that table name.

    The results will include statistics that were collected for each column in that table. The value in the "created" column of these results tells you when the statistics were collected. Compare the statistics of each table column across multiple timestamps. A change in the values of `row_count`, `distinct_count`, `null_count`, or other statistics may have affected planning. If the timestamp of the new statistics creation is associated with the time that the query plan changed, there may be a causal relationship between the two.

If you suspect that the query plan change is the cause of the latency increase, and you suspect that the query plan changed due to stale statistics, you may want to [manually refresh the statistics for the table]({% link {{ page.version.version }}/create-statistics.md %}#examples).

#### Determine if a literal in the SQL statement has changed

If the SQL statement fingerprint contains placeholder values ("_"), it's possible that a change in that literal is responsible for a query plan regression. This is also worth considering in the case of [multiple valid query plans](#multiple-valid-query-plans), if a change in the distribution of plans has led to a higher average execution time.

Inspect your application to see if the literals being used within the query executions are changing.

If you suspect that the query plan change is the cause of the latency increase, and you suspect that the query plan changed due to a changed query literal, it's possible that the table statistics don't accurately reflect how the literal values are represented in the data. You may want to [manually refresh the statistics for the table]({% link {{ page.version.version }}/create-statistics.md %}#examples). It's also possible that the table indexes are not helpful for queries with the newer literal value, in which case you may want to [check the **Insights** page for index recommendations]({% link {{ page.version.version }}/ui-insights-page.md %}#suboptimal-plan). 

If this does not fix the issue, a more drastic redesign of the schema or application may be needed.

#### View all events

1. Go to the [**Metrics** page]({% link {{page.version.version}}/ui-overview.md %}#metrics).
2. Go the [**Events** panel]({% link {{page.version.version}}/ui-runtime-dashboard.md %}#events-panel) on the right. Scroll to the bottom, and click **View All Events**.
3. Scroll down to the approximate time when the latency increase began.

    See if any events occured around that time that may have contributed to a query plan regression. These might include schema changes that affect tables involved in the suspect SQL queries, [changed cluster settings]({% link {{ page.version.version }}/set-cluster-setting.md %}), created or dropped indexes, and more. 
    
    A consequential event around the time of the latency increase may have affected the way that the optimizer chose query plans. Inspect changed cluster settings, or [determine if the table indexes changed](#determine-if-the-table-indexes-changed).

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
