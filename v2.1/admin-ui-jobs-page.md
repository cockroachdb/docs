---
title: Jobs Page
toc: true
---

The **Jobs** page of the Admin UI provides details about the backup/restore jobs as well as schema changes performed across all nodes in the cluster. To view these details, [access the Admin UI](admin-ui-access-and-navigate.html#access-the-admin-ui) and then click **Jobs** on the left-hand navigation bar.


## Job details

The **Jobs** table displays the user, description, creation time, and status of each backup and restore job, as well as schema changes performed across all nodes in the cluster.

<img src="{{ 'images/v2.1/admin_ui_jobs_page.png' | relative_url }}" alt="CockroachDB Admin UI Jobs Page" style="border:1px solid #eee;max-width:100%" />

If a description is truncated, click the ellipsis to view the job's the full description.

## Filtering results

You can filter the results based on the status of the jobs or the type of jobs (backups, restores, or schema changes). You can also choose to view either the latest 50 jobs or all the jobs across all nodes.

Filter By | Description
----------|------------
Job Status | From the **Status** menu, select the required status filter.
Job Type | From the **Type** menu, select **Backups**, **Restores**, **Imports**, **Schema Changes**, or **Changefeed**.
Jobs Shown | From the **Show** menu, select **First 50** or **All**.

## See also

- [Troubleshooting Overview](troubleshooting-overview.html)
- [Support Resources](support-resources.html)
- [Raw Status Endpoints](monitoring-and-alerting.html#raw-status-endpoints)
