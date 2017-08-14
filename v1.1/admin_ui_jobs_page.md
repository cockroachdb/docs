---
title: Jobs Page
toc: false
feedback: false
---

The Jobs page of the Admin UI provides details of the backup and restore jobs, as well as schema changes performed across all nodes in the cluster.

<div id="toc"></div>

## Access the Jobs Page
1. [Access the Admin UI](explore-the-admin-ui.html#access-the-admin-ui)
2. In the left-hand navigation bar, click **Jobs**.

The Jobs page appears.
<img src="{{ 'images/admin_ui_jobs_page.png' | relative_url }}" alt="CockroachDB Admin UI Jobs Page" style="border:1px solid #eee;max-width:100%" />

The Jobs table displays the user, description, creation time, and status of each backup and restore job, as well as schema changes performed across all nodes in the cluster.
You can filter the results based on the status of the jobs or the type of jobs (backups, restores, or schema changes). You can also choose to view either the latest 50 jobs or all the jobs across all nodes.

### Filter Jobs by Status
1. [Access the Jobs page](admin_ui_jobs_page.html#access-the-jobs-page).
2. From the **Status** drop-down menu, select the required status filter.

### Filter Jobs by Type
1. [Access the Jobs page](admin_ui_jobs_page.html#access-the-jobs-page).
2. From the **Type** drop-down menu, select **Backups**, **Restores** or **Schema Changes**.

### Filter Jobs by Duration
1. [Access the Jobs page](admin_ui_jobs_page.html#access-the-jobs-page).
2. From the **Show** drop-down menu, select **First 50** or **All**.



