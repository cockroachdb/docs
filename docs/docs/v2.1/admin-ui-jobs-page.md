---
title: Jobs Page
toc: true
---

The **Jobs** page of the Admin UI provides details about the backup/restore jobs as well as schema changes performed across all nodes in the cluster. To view these details, [access the Admin UI](admin-ui-access-and-navigate.html#access-the-admin-ui) and then click **Jobs** on the left-hand navigation bar.


## Job details

The **Jobs** table displays the ID, description, user, creation time, and status of each backup and restore job, as well as schema changes performed across all nodes in the cluster. To view the job's the full description, click the drop-down arrow in the first column.

<img src="{{ 'images/v2.1/admin_ui_jobs_page_new.png' | relative_url }}" alt="CockroachDB Admin UI Jobs Page" style="border:1px solid #eee;max-width:100%" />

For changefeeds, the table displays a [high-water timestamp that advances as the changefeed progresses](change-data-capture.html#monitor-a-changefeed). This is a guarantee that all changes before or at the timestamp have been emitted. Hover over the high-water timestamp to view the [system time](as-of-system-time.html).

## Filtering results

You can filter the results based on the status of the jobs or the type of jobs (backups, restores, schema changes, or changefeeds). You can also choose to view either the latest 50 jobs or all the jobs across all nodes.

Filter By | Description
----------|------------
Job Status | From the **Status** menu, select the required status filter.
Job Type | From the **Type** menu, select **Backups**, **Restores**, **Imports**, **Schema Changes**, or **Changefeed**.
Jobs Shown | From the **Show** menu, select **First 50** or **All**.

## See also

- [Troubleshooting Overview](troubleshooting-overview.html)
- [Support Resources](support-resources.html)
- [Raw Status Endpoints](monitoring-and-alerting.html#raw-status-endpoints)
