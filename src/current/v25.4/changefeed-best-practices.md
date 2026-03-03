---
title: Changefeed Best Practices
summary: A selection of best practices for starting and running changefeeds.
toc: true
---

This page describes best practices to consider when starting changefeeds on a CockroachDB cluster. We recommend referring to this information while planning your cluster's changefeeds and following the links in each of the sections for more details on a topic.

{{site.data.alerts.callout_info}}
To help in planning your cluster's changefeeds on CockroachDB {{ site.data.products.cloud }} clusters, refer to the [Understand CockroachDB Cloud Costs]({% link cockroachcloud/costs.md %}) page for detail on how CDC is billed monthly based on usage.
{{site.data.alerts.end}}

## Plan the number of watched tables for a single changefeed

When creating a changefeed, it's important to consider the number of changefeeds versus the number of tables to include in a single changefeed:

- Changefeeds each have their own memory overhead, so every running changefeed will increase total memory usage.
- Creating a single changefeed that will watch hundreds of tables can affect the performance of a changefeed by introducing coupling, where the performance of a target table affects the performance of the changefeed watching it. For example, any [schema change]({% link {{ page.version.version }}/changefeed-messages.md %}#schema-changes) on any of the tables will affect the entire changefeed's performance.

To watch multiple tables, we recommend creating a changefeed with a comma-separated list of tables. However, we do **not** recommend creating a single changefeed for watching hundreds of tables.

{% include {{ page.version.version }}/cdc/recommendation-monitoring-pts.md %}

## Maintain system resources and running changefeeds

When you are running more than 10 changefeeds on a cluster, it is important to monitor the [CPU usage]({% link {{ page.version.version }}/ui-overload-dashboard.md %}). A larger cluster will be able to run more changefeeds concurrently compared to a smaller cluster with more limited resources.

{{site.data.alerts.callout_info}}
{% include {{ page.version.version }}/cdc/changefeed-number-limit.md %}
{{site.data.alerts.end}}

To maintain a high number of changefeeds in your cluster:

- Connect to different nodes to [create]({% link {{ page.version.version }}/create-changefeed.md %}) each changefeed. The node on which you start the changefeed will become the _coordinator_ node for the changefeed job. The coordinator node acts as an administrator: keeping track of all other nodes during job execution and the changefeed work as it completes. As a result, this node will use more resources for the changefeed job. For more detail, refer to [How does a changefeed work?]({% link {{ page.version.version }}/how-does-a-changefeed-work.md %}).
- Consider logically grouping the target tables into one changefeed. When a changefeed [pauses]({% link {{ page.version.version }}/pause-job.md %}), it will stop emitting messages for the target tables. Grouping tables of related data into a single changefeed may make sense for your workload. However, we do not recommend watching hundreds of tables in a single changefeed. For more detail on protecting data from garbage collection when a changefeed is paused, refer to [Garbage collection and changefeeds]({% link {{ page.version.version }}/protect-changefeed-data.md %}).

## Monitor changefeeds

We recommend starting the changefeed with the [`metrics_label` option]({% link {{ page.version.version }}/monitor-and-debug-changefeeds.md %}#using-changefeed-metrics-labels), which allows you to measure metrics per changefeed. Metrics label information is sent with time-series metrics to the Prometheus endpoint.

The key areas to monitor when running changefeeds:

- [Retryable errors]({% link {{ page.version.version }}/monitor-and-debug-changefeeds.md %}#recommended-changefeed-metrics-to-track): `changefeed.error_retries`
- [Failures]({% link {{ page.version.version }}/monitor-and-debug-changefeeds.md %}#recommended-changefeed-metrics-to-track): `changefeed.failures`
- [CPU usage](#maintain-system-resources-and-running-changefeeds) for more than 10 changefeeds: [Overload Dashboard]({% link {{ page.version.version }}/ui-overload-dashboard.md %})
- [Protected timestamp and garbage collection]({% link {{ page.version.version }}/protect-changefeed-data.md %}): 
    - `jobs.changefeed.protected_age_sec`
    - `jobs.changefeed.currently_paused`
    - `jobs.changefeed.expired_pts_records`
    - `jobs.changefeed.protected_record_count`

## Manage changefeeds and schema changes

When a schema change is issued that causes a column backfill, it can result in a changefeed emitting [duplicate messages]({% link {{ page.version.version }}/changefeed-messages.md %}#schema-changes-with-column-backfill) for an event. We recommend issuing schema changes **outside of explicit transactions**. For more details on schema changes and column backfill generally, refer to the [Online Schema Changes]({% link {{ page.version.version }}/online-schema-changes.md %}) page.

You can also use the [`schema_change_events`]({% link {{ page.version.version }}/create-changefeed.md %}#schema-change-events) and [`schema_change_policy`]({% link {{ page.version.version }}/create-changefeed.md %}#schema-change-policy) options to define a schema change type and an associated policy that will modify how the changefeed behaves under the schema change.

## Lock the schema on changefeed watched tables

To apply `schema_locked` automatically to new tables, set the [`create_table_with_schema_locked` session variable]({% link {{ page.version.version }}/set-vars.md %}#create_table_with_schema_locked).

{% include {{ page.version.version }}/cdc/cdc-schema-locked-example.md %}

## See also

For details on tuning changefeeds for throughput, durability, and improving latency, refer to the [Advanced Changefeed Configuration]({% link {{ page.version.version }}/advanced-changefeed-configuration.md %}) page.

