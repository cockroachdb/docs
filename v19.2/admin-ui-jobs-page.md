---
title: Jobs Page
toc: true
---

{{site.data.alerts.callout_info}}
On a secure cluster, this area of the Admin UI can only be accessed by an `admin` user. See [Admin UI access](admin-ui-overview.html#admin-ui-access).
{{site.data.alerts.end}}

The **Jobs** page of the Admin UI provides details about the backup/restore jobs, schema changes, [user-created table statistics](create-statistics.html) and [automatic table statistics](cost-based-optimizer.html#table-statistics) jobs, and changefeeds performed across all nodes in the cluster. To view these details, [access the Admin UI](admin-ui-access-and-navigate.html#access-the-admin-ui) and then click **Jobs** on the left-hand navigation bar.


## Job details

The **Jobs** table displays the ID, description, user, creation time, and status of each backup and restore job, schema changes, user-created table statistics and automatic table statistics jobs, and changefeeds performed across all nodes in the cluster. To view the job's full description, click the drop-down arrow in the first column.

<img src="{{ 'images/v19.2/admin_ui_jobs_page_new.png' | relative_url }}" alt="CockroachDB Admin UI Jobs Page" style="border:1px solid #eee;max-width:100%" />

For changefeeds, the table displays a [high-water timestamp that advances as the changefeed progresses](change-data-capture.html#monitor-a-changefeed). This is a guarantee that all changes before or at the timestamp have been emitted. Hover over the high-water timestamp to view the [system time](as-of-system-time.html).

The automatic table statistics jobs are not displayed even when the **TYPE** drop-down is set to **All**. To view the automatic statistics creation jobs, filter the results to **Automatic-Statistics Creation** as described in the [Filtering results](#filtering-results) section.

## Filtering results

You can filter the results based on the status of the jobs or the type of jobs (backups, restores, schema changes, changefeeds, user-created table statistics, and automatic table statistics). You can also choose to view either the latest 50 jobs or all the jobs across all nodes.

Filter By | Description
----------|------------
Job Status | From the **Status** menu, select the required status filter.
Job Type | From the **Type** menu, select **Backups**, **Restores**, **Imports**, **Schema Changes**, **Changefeed**, **Statistics Creation**, or **Auto-Statistics Creation**.
Jobs Shown | From the **Show** menu, select **First 50** or **All**.

## See also

- [Troubleshooting Overview](troubleshooting-overview.html)
- [Support Resources](support-resources.html)
- [Raw Status Endpoints](monitoring-and-alerting.html#raw-status-endpoints)
