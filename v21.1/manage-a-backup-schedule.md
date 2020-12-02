---
title: Manage a Backup Schedule
summary: Learn about how to create, manage, and restore from a schedule of periodic backups.
toc: true
---

 You can create schedules in CockroachDB for periodic backups. Once a [backup schedule is created](#create-a-new-backup-schedule), you can do the following:

- [Set up monitoring for the backup schedule](#set-up-monitoring-for-the-backup-schedule)
- [View scheduled backup details](#view-scheduled-backup-details)
- [View and control the backup schedule](#view-and-control-the-backup-schedule)
- [View and control a backup initiated by a schedule](#view-and-control-a-backup-initiated-by-a-schedule)
- [Restore from a scheduled backup](#restore-from-a-scheduled-backup)

## Create a new backup schedule

To create a new backup schedule, use the [`CREATE SCHEDULE FOR BACKUP`](create-schedule-for-backup.html) statement. For example:

{% include copy-clipboard.html %}
~~~ sql
> CREATE SCHEDULE schedule_label
  FOR BACKUP INTO 's3://test/backups/test_schedule_1?AWS_ACCESS_KEY_ID=123&AWS_SECRET_ACCESS_KEY=123'
    WITH revision_history
    RECURRING '@daily'
    WITH SCHEDULE OPTIONS first_run = 'now';
~~~

In this example, a schedule labeled `schedule_label` is created to take daily (incremental) backups with revision history in AWS S3, with the first backup being taken now. A second [schedule for weekly full backups](create-schedule-for-backup.html#full-backup-clause) is also created by default. Both schedules have the same `label` (i.e., `schedule_label`).

For more information about the different options available when creating a backup schedule, see [`CREATE SCHEDULE FOR BACKUP`](create-schedule-for-backup.html).

## Set up monitoring for the backup schedule

We recommend that you [monitor your backup schedule with Prometheus](monitoring-and-alerting.html#prometheus-endpoint), and alert when there are anomalies such as backups that have failed or no backups succeeding over a certain amount of time&mdash; at which point, you can inspect schedules by running [`SHOW SCHEDULES`](show-schedules.html).

Metrics for scheduled backups fall into two categories:

- Backup schedule-specific metrics, aggregated across all schedules:

    - `schedules_BACKUP_started`: A counter for the total number of backups started by a schedule
    - `schedules_BACKUP_succeeded`: A counter for the number of backups started by a schedule that succeeded
    - `schedules_BACKUP_failed`: A counter for the number of backups started by a schedule that failed

        When `schedules_BACKUP_failed` increments, run [`SHOW SCHEDULES`](show-schedules.html) to check which schedule is affected and to inspect the error in the `status` column.

- Scheduler-specific metrics:

    - `schedules.round.reschedule-wait`: The number of schedules that were rescheduled due to a currently running job. A value greater than 0 indicates that a previous backup was still running when a new scheduled backup was supposed to start. This corresponds to the [`on_previous_running=wait`](create-schedule-for-backup.html#on-previous-running-option) schedule option.

    - `schedules.round.reschedule-skip`: The number of schedules that were skipped due to a currently running job. A value greater than 0 indicates that a previous backup was still running when a new scheduled backup was supposed to start. This corresponds to the [`on_previous_running=skip`](create-schedule-for-backup.html#on-previous-running-option) schedule option.

{{site.data.alerts.callout_info}}
`schedules.round.reschedule-wait` and `schedules.round.reschedule-skip` are gauge metrics and can be graphed. A continual positive value for either of these metrics may indicate a misconfigured backup cadence, and you should consider adjusting the cadence to avoid waiting for or skipping the next backup.
{{site.data.alerts.end}}

For a tutorial on how to use Prometheus to set up monitoring and alerting, see [Monitor CockroachDB with Prometheus](monitor-cockroachdb-with-prometheus.html).

## View scheduled backup details

 When a [backup is created by a schedule](create-schedule-for-backup.html), it is stored within a collection of backups in the given location. To view details for a backup created by a schedule, you can use the following:

- `SHOW BACKUPS IN y` statement to [view a list of the full backup's subdirectories](#view-a-list-of-the-full-backups-subdirectories).
- `SHOW BACKUP x IN y` statement to [view a list of the full and incremental backups that are stored in a specific full backup's subdirectory](#view-a-list-of-the-full-and-incremental-backups-in-a-specific-full-backup-subdirectory).

For more details, see [`SHOW BACKUP`](show-backup.html).

{% include {{ page.version.version }}/backups/show-scheduled-backups.md %}

## View and control the backup schedule

Once a backup schedule is successfully created, you can [view the schedule](#view-the-schedule), [pause the schedule](#pause-the-schedule), [resume the schedule](#resume-the-schedule), or [drop the schedule](#drop-the-schedule).

### View the schedule

{% include copy-clipboard.html %}
~~~~
> SHOW SCHEDULES;
~~~~

For more information, see [`SHOW SCHEDULES`](show-schedules.html).

### Pause the schedule

To pause a schedule, you can either specify the schedule's `id`:

{% include copy-clipboard.html %}
~~~~ sql
> PAUSE SCHEDULE 589963390487363585;
~~~~

Or nest a [`SELECT` clause](select-clause.html) that retrieves `id`(s) inside the `PAUSE SCHEDULES` statement:

{% include copy-clipboard.html %}
~~~~ sql
> PAUSE SCHEDULES SELECT id FROM [SHOW SCHEDULES] WHERE label = 'schedule_database';
~~~~

For more information, see [`PAUSE SCHEDULES`](pause-schedules.html).

### Resume the schedule

To resume a paused schedule, you can either specify the schedule's `id`:

{% include copy-clipboard.html %}
~~~~ sql
> RESUME SCHEDULE 589963390487363585;
~~~~

Or nest a [`SELECT` clause](select-clause.html) that retrieves `id`(s) inside the `RESUME SCHEDULES` statement:

{% include copy-clipboard.html %}
~~~~ sql
> RESUME SCHEDULES SELECT id FROM [SHOW SCHEDULES] WHERE label = 'schedule_database';
~~~~

For more information, see [`RESUME SCHEDULES`](resume-schedules.html).

### Drop the schedule

To drop a schedule, you can either specify the schedule's `id`:

{% include copy-clipboard.html %}
~~~~ sql
> DROP SCHEDULE 589963390487363585;
~~~~

Or nest a [`SELECT` clause](select-clause.html) that retrieves `id`(s) inside the `DROP SCHEDULES` statement:

{% include copy-clipboard.html %}
~~~~ sql
> DROP SCHEDULES SELECT id FROM [SHOW SCHEDULES] WHERE label = 'schedule_database';
~~~~

For more information, see [`DROP SCHEDULES`](drop-schedules.html).

{{site.data.alerts.callout_danger}}
`DROP SCHEDULE` does **not** cancel any in -rogress jobs started by the schedule. Before you drop a schedule, [cancel any in-progress jobs](cancel-job.html) first, as you will not be able to look up the job ID once the schedule is dropped.
{{site.data.alerts.end}}

## View and control a backup initiated by a schedule

After CockroachDB successfully initiates a scheduled backup, it registers the backup as a job. You can [view](#view-the-backup-job), [pause](#pause-the-backup-job), [resume](#resume-the-backup-job), or [cancel](#cancel-the-backup-job) each individual backup job.

### View the backup job

To view jobs for a specific [backup schedule](create-schedule-for-backup.html), use the schedule's `id`:

{% include copy-clipboard.html %}
~~~ sql
> SHOW JOBS FOR SCHEDULE 590204387299262465;
~~~
~~~
        job_id       | job_type |                                                                                                             description                                                                                   | statement | user_name | status  | running_status |             created              | started | finished |             modified             | fraction_completed | error | coordinator_id
---------------------+----------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+-----------+-----------+---------+----------------+----------------------------------+---------+----------+----------------------------------+--------------------+-------+-----------------
  590205481558802434 | BACKUP   | BACKUP INTO '/2020/09/15-161444.99' IN 's3://test/scheduled-backup-0915?AWS_ACCESS_KEY_ID=x&AWS_SECRET_ACCESS_KEY=redacted' AS OF SYSTEM TIME '2020-09-15 16:20:00+00:00' WITH revision_history, detached |           | root      | running | NULL           | 2020-09-15 16:20:18.347383+00:00 | NULL    | NULL     | 2020-09-15 16:20:18.347383+00:00 |                  0 |       |              0
(1 row)
~~~

You can also view multiple schedules by nesting a [`SELECT` clause](select-clause.html) that retrieves `id`(s) inside the `SHOW JOBS` statement:

{% include copy-clipboard.html %}
~~~ sql
> SHOW JOBS FOR SCHEDULES SELECT id FROM [SHOW SCHEDULES] WHERE label = 'test_schedule';
~~~

~~~
        job_id       | job_type |                                                                                                                 description                                                                                      | statement | user_name |  status   | running_status |             created              | started |             finished             |             modified             | fraction_completed | error | coordinator_id
---------------------+----------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+-----------+-----------+-----------+----------------+----------------------------------+---------+----------------------------------+----------------------------------+--------------------+-------+-----------------
  590204496007299074 | BACKUP   | BACKUP INTO '/2020/09/15-161444.99' IN 's3://test/scheduled-backup-0915?AWS_ACCESS_KEY_ID=x&AWS_SECRET_ACCESS_KEY=redacted' AS OF SYSTEM TIME '2020-09-15 16:14:44.991631+00:00' WITH revision_history, detached |           | root      | succeeded | NULL           | 2020-09-15 16:15:17.720725+00:00 | NULL    | 2020-09-15 16:15:20.913789+00:00 | 2020-09-15 16:15:20.910594+00:00 |                  1 |       |              0
  590205481558802434 | BACKUP   | BACKUP INTO '/2020/09/15-161444.99' IN 's3://test/scheduled-backup-0915?AWS_ACCESS_KEY_ID=x&AWS_SECRET_ACCESS_KEY=redacted' AS OF SYSTEM TIME '2020-09-15 16:20:00+00:00' WITH revision_history, detached        |           | root      | succeeded | NULL           | 2020-09-15 16:20:18.347383+00:00 | NULL    | 2020-09-15 16:20:48.37873+00:00  | 2020-09-15 16:20:48.374256+00:00 |                  1 |       |              0
(2 rows)
~~~

For more information, see [`SHOW JOBS`](show-jobs.html).

### Pause the backup job

To pause jobs for a specific [backup schedule](create-schedule-for-backup.html), use the schedule's `id`:

{% include copy-clipboard.html %}
~~~ sql
> PAUSE JOBS FOR SCHEDULE 590204387299262465;
~~~
~~~
PAUSE JOBS FOR SCHEDULES 1
~~~

You can also pause multiple schedules by nesting a [`SELECT` clause](select-clause.html) that retrieves `id`(s) inside the `PAUSE JOBS` statement:

{% include copy-clipboard.html %}
~~~ sql
> PAUSE JOBS FOR SCHEDULES SELECT id FROM [SHOW SCHEDULES] WHERE label = 'test_schedule';
~~~

~~~
PAUSE JOBS FOR SCHEDULES 2
~~~

For more information, see [`PAUSE JOB`](pause-job.html).

### Resume the backup job

To resume jobs for a specific [backup schedule](create-schedule-for-backup.html), use the schedule's `id`:

{% include copy-clipboard.html %}
~~~ sql
> RESUME JOBS FOR SCHEDULE 590204387299262465;
~~~
~~~
RESUME JOBS FOR SCHEDULES 1
~~~

You can also resume multiple schedules by nesting a [`SELECT` clause](select-clause.html) that retrieves `id`(s) inside the `PAUSE JOBS` statement:

{% include copy-clipboard.html %}
~~~ sql
> RESUME JOBS FOR SCHEDULES SELECT id FROM [SHOW SCHEDULES] WHERE label = 'test_schedule';
~~~

~~~
RESUME JOBS FOR SCHEDULES 2
~~~

For more information, see [`RESUME JOB`](resume-job.html).

### Cancel the backup job

To cancel jobs for a specific [backup schedule](create-schedule-for-backup.html), use the schedule's `id`:

{% include copy-clipboard.html %}
~~~ sql
> CANCEL JOBS FOR SCHEDULE 590204387299262465;
~~~
~~~
CANCEL JOBS FOR SCHEDULES 1
~~~

You can also CANCEL multiple schedules by nesting a [`SELECT` clause](select-clause.html) that retrieves `id`(s) inside the `CANCEL JOBS` statement:

{% include copy-clipboard.html %}
~~~ sql
> CANCEL JOBS FOR SCHEDULES SELECT id FROM [SHOW SCHEDULES] WHERE label = 'test_schedule';
~~~

~~~
CANCEL JOBS FOR SCHEDULES 2
~~~

For more information, see [`CANCEL JOB`](cancel-job.html).

## Restore from a scheduled backup

To restore from a scheduled backup, use the [`RESTORE`](restore.html) statement:

{% include copy-clipboard.html %}
~~~ sql
> RESTORE
    FROM 's3://test/backups/test_schedule_1/2020/08/19-035600.00?AWS_ACCESS_KEY_ID=x&AWS_SECRET_ACCESS_KEY=x'
    AS OF SYSTEM TIME '2020-08-19 03:50:00+00:00';
~~~

To view the backups stored within a collection, use the [`SHOW BACKUP`](#view-scheduled-backup-details) statement.

## See also

- [`CREATE SCHEDULE FOR BACKUP`](create-schedule-for-backup.html)
- [`BACKUP`](backup.html)
- [`RESTORE`](restore.html)
- [`SHOW BACKUP`](show-backup.html)
- [`SHOW SCHEDULES`](show-schedules.html)
- [`PAUSE SCHEDULES`](pause-schedules.html)
- [`RESUME SCHEDULES`](resume-schedules.html)
- [`DROP SCHEDULES`](drop-schedules.html)
- [`PAUSE JOB`](pause-job.html)
- [`RESUME JOB`](pause-job.html)
- [`CANCEL JOB`](cancel-job.html)
- [Take Full and Incremental Backups](take-full-and-incremental-backups.html)
- [Use the Built-in SQL Client](cockroach-sql.html)
- [Other Cockroach Commands](cockroach-commands.html)
