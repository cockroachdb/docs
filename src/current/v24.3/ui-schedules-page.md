---
title: Schedules Page
summary: The Schedules page of the DB Console provides details about scheduled tasks performed by your cluster.
toc: true
docs_area: reference.db_console
---

The **Schedules** page of the DB Console provides details about the scheduled tasks performed by your cluster. These can include:

- [Scheduled backups]({% link {{ page.version.version }}/manage-a-backup-schedule.md %})
- [Scheduled auto statistics compaction]({% link {{ page.version.version }}/cost-based-optimizer.md %}#table-statistics)
- [Row-level TTL]({% link {{ page.version.version }}/row-level-ttl.md %})

To view these details, [access the DB console]({% link {{ page.version.version }}/ui-overview.md %}#db-console-access) and click **Schedules** in the left-hand navigation.

## Filter schedules

- Use the **Status** menu to filter schedules by schedule status, displaying all schedules, only active schedules, or only paused schedules.
- Use the **Show** menu to toggle displaying the latest 50 schedules or all schedules on the cluster.

## Schedules list

Use the **Schedules** list to see your active and paused schedules.

- To view schedule details click the schedule ID.
- If you drop a schedule, it will no longer be listed.

The following screenshot shows a list of backups and automated statistics compaction schedules:

<img src="/docs/images/{{ page.version.version }}/schedules-page.png" alt="Schedules Page UI in the DB Console showing a list of schedules" style="border:1px solid #eee;max-width:100%" />

Column               | Description
---------------------+--------------
Schedule ID          | The unique ID for the schedule. This is used to [pause]({% link {{ page.version.version }}/pause-schedules.md %}), [resume]({% link {{ page.version.version }}/resume-schedules.md %}), and [drop]({% link {{ page.version.version }}/drop-schedules.md %}) schedules.
Label                | The label given to the schedule on creation.
Status               | The current status of the schedule, **Active** or **Paused**.
Next Execution Time (UTC)  | The next time at which the scheduled task will run.
Recurrence           | How often the schedule will run.
Jobs Running         | The number of jobs currently running for that schedule.
Owner                | The user that created the schedule.
Creation Time (UTC)       | The time at which the user originally created the schedule.

## Schedule details

Click on a schedule ID to view the full SQL statement that the schedule runs. For example, the following screenshot shows the resulting [`BACKUP`]({% link {{ page.version.version }}/backup.md %}) statement for a full cluster backup recurring every day:

<img src="/docs/images/{{ page.version.version }}/schedule-id-screen.png" alt="UI for each individual schedule ID displaying the CREATE SCHEDULE SQL statement" style="border:1px solid #eee;max-width:100%" />

You may also view a `protected_timestamp_record` on this page. This indicates that the schedule is actively managing its own [protected timestamp]({% link {{ page.version.version }}/architecture/storage-layer.md %}#protected-timestamps) records independently of [GC TTL]({% link {{ page.version.version }}/configure-replication-zones.md %}#gc-ttlseconds). See [Protected timestamps and scheduled backups]({% link {{ page.version.version }}/create-schedule-for-backup.md %}#protected-timestamps-and-scheduled-backups) for more detail.

## See also

- [`CREATE SCHEDULE FOR BACKUP`]({% link {{ page.version.version }}/create-schedule-for-backup.md %})
- [Take Full and Incremental Backups]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %})
