---
title: Schedules Page
summary: The Schedules page of the DB Console provides details about scheduled tasks performed by your cluster.
toc: true
docs_area: reference.db_console
---

The **Schedules** page of the DB Console provides details about the scheduled tasks performed by your cluster. These can include:

- [Scheduled backups](manage-a-backup-schedule.html)
- [Scheduled auto statistics compaction](cost-based-optimizer.html#table-statistics)
- [Row-level TTL](row-level-ttl.html)

To view these details, [access the DB console](ui-overview.html#db-console-access) and click **Schedules** in the left-hand navigation.

## Filter schedules

- Use the **Status** menu to filter schedules by schedule status, displaying all schedules, only active schedules, or only paused schedules.
- Use the **Show** menu to toggle displaying the latest 50 schedules or all schedules on the cluster.

## Schedules list 

Use the **Schedules** list to see your active and paused schedules.

- To view schedule details click the schedule ID.
- If you drop a schedule, it will no longer be listed.

The following screenshot shows a list of backups and automated statistics compaction schedules: 

<img src="{{ 'images/v23.1/schedules-page.png' | relative_url }}" alt="Schedules Page UI in the DB Console showing a list of schedules" style="border:1px solid #eee;max-width:100%" />

Column               | Description
---------------------+--------------
Schedule ID          | The unique ID for the schedule. This is used to [pause](pause-schedules.html), [resume](resume-schedules.html), and [drop](drop-schedules.html) schedules.
Label                | The label given to the schedule on creation.
Status               | The current status of the schedule, **Active** or **Paused**.
Next Execution Time (UTC)  | The next time at which the scheduled task will run.
Recurrence           | How often the schedule will run.
Jobs Running         | The number of jobs currently running for that schedule.
Owner                | The user that created the schedule.
Creation Time (UTC)       | The time at which the user originally created the schedule.

## Schedule details

Click on a schedule ID to view the full SQL statement that the schedule runs. For example, the following screenshot shows the resulting [`BACKUP`](backup.html) statement for a full cluster backup recurring every day:

<img src="{{ 'images/v23.1/schedule-id-screen.png' | relative_url }}" alt="UI for each individual schedule ID displaying the CREATE SCHEDULE SQL statement" style="border:1px solid #eee;max-width:100%" />

You may also view a `protected_timestamp_record` on this page. This indicates that the schedule is actively managing its own [protected timestamp](architecture/storage-layer.html#protected-timestamps) records independently of [GC TTL](configure-replication-zones.html#gc-ttlseconds). See [Protected timestamps and scheduled backups](create-schedule-for-backup.html#protected-timestamps-and-scheduled-backups) for more detail.

## See also

- [`CREATE SCHEDULE FOR BACKUP`](create-schedule-for-backup.html)
- [Take Full and Incremental Backups](take-full-and-incremental-backups.html)