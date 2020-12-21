---
title: Jobs Page
toc: true
redirect_from: admin-ui-jobs-page.html
---

The **Jobs** page of the DB Console provides details about long-running tasks performed by your cluster. These can include:

{% include {{ page.version.version }}/sql/schema-changes.md %}.
- [`IMPORT`](import.html).
- Enterprise [`BACKUP`](backup.html) and [`RESTORE`](restore.html).
- [User-created table statistics](create-statistics.html) created for use by the [cost-based optimizer](cost-based-optimizer.html).
- [Automatic table statistics](cost-based-optimizer.html#table-statistics).
- [Changefeeds](stream-data-out-of-cockroachdb-using-changefeeds.html).

{{site.data.alerts.callout_success}}
All users can see their own jobs, and `admin` users can view all jobs performed across all nodes in the cluster.
{{site.data.alerts.end}}

To view these details, [access the DB Console](ui-overview.html#db-console-access) and click **Jobs** in the left-hand navigation.

## Filter jobs

Use the **Status** menu to filter jobs by [job status](#job-status).

Use the **Type** menu to filter jobs by type.

You can toggle between showing the latest 50 jobs or all jobs on the cluster.

{{site.data.alerts.callout_info}}
Jobs are deleted every 14 days. This interval can be changed via the `jobs.retention_time` [cluster setting](cluster-settings.html).

The Jobs list is designed for you to manage pending work. It is not intended to display the canonical record of all jobs that have run. If you need a historical record of all jobs you have run, you should log this information externally.
{{site.data.alerts.end}}

## Jobs list

Use the **Jobs** list to see your recently created and completed jobs.

- For changefeeds, the table displays a [high-water timestamp that advances as the changefeed progresses](stream-data-out-of-cockroachdb-using-changefeeds.html#monitor-a-changefeed). This is a guarantee that all changes before or at the timestamp have been emitted. Hover over the high-water timestamp to view the [system time](as-of-system-time.html).

- [Automatic table statistics](cost-based-optimizer.html#table-statistics) jobs are not displayed even when the **Type** menu is set to **All**. To view these jobs, set **Type** to **Automatic-Statistics Creation** as described [above](#filter-jobs).

- To view [job details](#job-details), click on the job description.

<img src="{{ 'images/v21.1/ui_jobs_page_new.png' | relative_url }}" alt="DB Console Jobs Page" style="border:1px solid #eee;max-width:100%" />

Parameter | Description
----------|------------
Description | SQL statement that created the job.
Job ID | Unique job ID. This value is used to [pause](pause-job.html), [resume](resume-job.html), or [cancel](cancel-job.html) jobs.
Users | User that created the job.
Creation Time | Date and time the job was created.
Status | Current [job status](#job-status) or completion progress.

### Job status

Status | Description
-------|------------
`PENDING` | Job is created but has not started running.
`PAUSED` | Job is [paused](pause-job.html).
`FAILED` | Job failed to complete.
`SUCCEEDED` | Job successfully completed.
`CANCELED` | Job was [cancelled](cancel-job.html).

A job that is currently running will be displayed with its percent completion and time remaining, rather than the `RUNNING` status.

## Job details

Click any description on the [jobs list](#jobs-list) to see the full SQL statement that created the job.

The job ID, creation time, users, and status are also shown.

<img src="{{ 'images/v21.1/ui_jobs_page_details.png' | relative_url }}" alt="DB Console Jobs Page" style="border:1px solid #eee;max-width:100%" />

## See also

- [`SHOW JOBS`](show-jobs.html)
- [Troubleshooting Overview](troubleshooting-overview.html)
- [Support Resources](support-resources.html)
- [Raw Status Endpoints](monitoring-and-alerting.html#raw-status-endpoints)
