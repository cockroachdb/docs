{{site.data.alerts.callout_info}}
By default, jobs are deleted every 14 days. You can change this interval using the `jobs.retention_time` [cluster setting](cluster-settings.html).

The Jobs list is designed for you to manage pending work. It is not intended to display the canonical record of all jobs that have run. If you need a historical record of all jobs you have run, you should log this information externally.
{{site.data.alerts.end}}

## Jobs table

Use the **Jobs** table to see recently created and completed jobs.

The following screenshot shows `ALTER TABLE` jobs:

<img src="{{ 'images/v22.2/ui_jobs_page.png' | relative_url }}" alt="DB Console Jobs Page" style="border:1px solid #eee;max-width:100%" />

### Filter jobs

Use the controls to filter jobs:

- Use the **Status** menu to filter jobs by [job status](#job-status).
- Use the **Type** menu to filter jobs by type. [Automatic table statistics](cost-based-optimizer.html#table-statistics) jobs are not displayed even when the **Type** menu is set to **All**. To view these jobs, set **Type** to **Auto-Statistics Creation**.
- Use the **Show** menu to toggle between showing the latest 50 jobs or all jobs on the cluster.

The following are displayed for each job:

Column | Description
----------|------------
Description | SQL statement that created the job.
Status | Current [job status](#job-status) or completion progress.
Job ID | Unique job ID. This value is used to [pause](pause-job.html), [resume](resume-job.html), or [cancel](cancel-job.html) jobs.
User Name | User that created the job.
Creation Time (UTC) | Date and time the job was created.
Modified Time (UTC) | Date and time the job was modified.
Last Execution Time (UTC) | Date and time the job was last executed.
High-water Timestamp  | A checkpoint for a [changefeed job's progress](monitor-and-debug-changefeeds.html#monitor-a-changefeed) that guarantees that all changes before (or at) the timestamp have been emitted. Hover over the high-water timestamp to view the [system time](as-of-system-time.html).
Execution Count | Number of times the job was executed.
Coordinator Node | ID of the coordinating node.

To view [job details](#job-details), click the job description.

### Job status

Status | Description
-------|------------
`PENDING` | Job is created but has not started running.
`PAUSED` | Job is [paused](pause-job.html).
`FAILED` | Job failed to complete.
`SUCCEEDED` | Job successfully completed.
`CANCELED` | Job was [cancelled](cancel-job.html).
`RUNNING`  | Job is running. A job that is running will be displayed with its percent completion and time remaining, rather than the `RUNNING` status.
`REVERTING`| Job failed or was canceled and its changes are being reverted.
`RETRYING` | Job is retrying another job that failed.

## Job details

The job ID, creation time, user, status, and error messages (if any) are also shown.

<img src="{{ 'images/v22.2/ui_jobs_page_details.png' | relative_url }}" alt="DB Console Jobs Page" style="border:1px solid #eee;max-width:100%" />

## See also

- [`SHOW JOBS`](show-jobs.html)
- [Troubleshooting Overview](troubleshooting-overview.html)
- [Support Resources](support-resources.html)
- [Raw Status Endpoints](monitoring-and-alerting.html#raw-status-endpoints)
