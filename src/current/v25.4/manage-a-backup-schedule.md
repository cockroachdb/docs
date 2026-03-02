---
title: Manage a Backup Schedule
summary: Learn about how to create, manage, and restore from a schedule of periodic backups.
toc: true
docs_area: manage
---

 You can create schedules in CockroachDB for periodic backups. Once a [backup schedule is created](#create-a-new-backup-schedule), you can do the following:

- [Set up monitoring for the backup schedule](#set-up-monitoring-for-the-backup-schedule)
- [View scheduled backup details](#view-scheduled-backup-details)
- [View and control the backup schedule](#view-and-control-the-backup-schedule)
- [View and control a backup initiated by a schedule](#view-and-control-a-backup-initiated-by-a-schedule)
- [Restore from a scheduled backup](#restore-from-a-scheduled-backup)

{% include {{ page.version.version }}/backups/support-products.md %}

## Considerations

### Protected timestamps and scheduled backups

{% include {{ page.version.version }}/backups/protected-timestamps.md %}

### Backup collection storage URI and schedule backups

{% include {{ page.version.version }}/backups/backup-storage-collision.md %}

{% include {{ page.version.version }}/backups/storage-collision-examples.md %}

## Create a new backup schedule

To create a new backup schedule, use the [`CREATE SCHEDULE FOR BACKUP`]({% link {{ page.version.version }}/create-schedule-for-backup.md %}) statement. For example:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE SCHEDULE schedule_label
  FOR BACKUP INTO 's3://test/backups/test_schedule_1?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}'
    WITH revision_history
    RECURRING '@daily'
    WITH SCHEDULE OPTIONS first_run = 'now';
~~~

In this example, a schedule labeled `schedule_label` is created to take daily (incremental) backups with revision history in AWS S3, with the first backup being taken now. A second [schedule for weekly full backups]({% link {{ page.version.version }}/create-schedule-for-backup.md %}#full-backup-clause) is also created by default. Both schedules have the same `label` (i.e., `schedule_label`).

For more information about the different options available when creating a backup schedule, see [`CREATE SCHEDULE FOR BACKUP`]({% link {{ page.version.version }}/create-schedule-for-backup.md %}).

{{site.data.alerts.callout_info}}
Further guidance on connecting to Amazon S3, Google Cloud Storage, Azure Storage, and other storage options is outlined in [Use Cloud Storage]({% link {{ page.version.version }}/use-cloud-storage.md %}).
{{site.data.alerts.end}}

## Set up monitoring for the backup schedule

We recommend that you [monitor your backup schedule with Prometheus]({% link {{ page.version.version }}/prometheus-endpoint.md %}), and alert when there are anomalies such as backups that have failed or no backups succeeding over a certain amount of time—at which point, you can inspect schedules by running [`SHOW SCHEDULES`]({% link {{ page.version.version }}/show-schedules.md %}).

Metrics for scheduled backups fall into two categories:

- Backup schedule-specific metrics, aggregated across all schedules:

    - `schedules.BACKUP.started`: The total number of backups started by a schedule.
    - `schedules.BACKUP.succeeded`: The number of backups started by a schedule that succeeded.
    - `schedules.BACKUP.failed`: The number of backups started by a schedule that failed.

        When `schedules.BACKUP.failed` increments, run [`SHOW SCHEDULES`]({% link {{ page.version.version }}/show-schedules.md %}) to check which schedule is affected and to inspect the error in the `status` column. {% include {{ page.version.version }}/backups/retry-failure.md %}
    - `schedules.BACKUP.protected_age_sec`: The age of the oldest [protected timestamp]({% link {{ page.version.version }}/architecture/storage-layer.md %}#protected-timestamps) record protected by backup schedules.
    - `schedules.BACKUP.protected_record_count`: The number of [protected timestamp]({% link {{ page.version.version }}/architecture/storage-layer.md %}#protected-timestamps) records held by backup schedules.

- Scheduler-specific metrics:

    - `schedules.round.reschedule-wait`: The number of schedules that were rescheduled due to a currently running job. A value greater than 0 indicates that a previous backup was still running when a new scheduled backup was supposed to start. This corresponds to the [`on_previous_running=wait`]({% link {{ page.version.version }}/create-schedule-for-backup.md %}#on-previous-running-option) schedule option.

    - `schedules.round.reschedule-skip`: The number of schedules that were skipped due to a currently running job. A value greater than 0 indicates that a previous backup was still running when a new scheduled backup was supposed to start. This corresponds to the [`on_previous_running=skip`]({% link {{ page.version.version }}/create-schedule-for-backup.md %}#on-previous-running-option) schedule option.

{{site.data.alerts.callout_info}}
`schedules.round.reschedule-wait` and `schedules.round.reschedule-skip` are gauge metrics and can be graphed. A continual positive value for either of these metrics may indicate a misconfigured backup cadence, and you should consider adjusting the cadence to avoid waiting for or skipping the next backup.
{{site.data.alerts.end}}

For a tutorial on how to use Prometheus to set up monitoring and alerting, see [Monitor CockroachDB with Prometheus]({% link {{ page.version.version }}/monitor-cockroachdb-with-prometheus.md %}).

## View scheduled backup details

{% include {{ page.version.version }}/backups/view-scheduled-backups.md %}

## View and control the backup schedule

Once a backup schedule is successfully created, you can [view the schedule](#view-the-schedule), [pause the schedule](#pause-the-schedule), [resume the schedule](#resume-the-schedule), or [drop the schedule](#drop-the-schedule).

### View the schedule

{% include_cached copy-clipboard.html %}
~~~~
> SHOW SCHEDULES FOR BACKUP;
~~~~

For more information, see [`SHOW SCHEDULES`]({% link {{ page.version.version }}/show-schedules.md %}).

### Pause the schedule

To pause a schedule, you can either specify the schedule's `id`:

{% include_cached copy-clipboard.html %}
~~~~ sql
> PAUSE SCHEDULE 589963390487363585;
~~~~

Or nest a [`SELECT` clause]({% link {{ page.version.version }}/select-clause.md %}) that retrieves `id`(s) inside the `PAUSE SCHEDULES` statement:

{% include_cached copy-clipboard.html %}
~~~~ sql
> PAUSE SCHEDULES WITH x AS (SHOW SCHEDULES) SELECT id FROM x WHERE label = 'schedule_database';
~~~~

For more information, see [`PAUSE SCHEDULES`]({% link {{ page.version.version }}/pause-schedules.md %}).

### Resume the schedule

To resume a paused schedule, you can either specify the schedule's `id`:

{% include_cached copy-clipboard.html %}
~~~~ sql
> RESUME SCHEDULE 589963390487363585;
~~~~

Or nest a [`SELECT` clause]({% link {{ page.version.version }}/select-clause.md %}) that retrieves `id`(s) inside the `RESUME SCHEDULES` statement:

{% include_cached copy-clipboard.html %}
~~~~ sql
> RESUME SCHEDULES WITH x AS (SHOW SCHEDULES) SELECT id FROM x WHERE label = 'schedule_database';
~~~~

For more information, see [`RESUME SCHEDULES`]({% link {{ page.version.version }}/resume-schedules.md %}).

### Drop the schedule

To drop a schedule, you can either specify the schedule's `id`:

{% include_cached copy-clipboard.html %}
~~~~ sql
> DROP SCHEDULE 589963390487363585;
~~~~

Or nest a [`SELECT` clause]({% link {{ page.version.version }}/select-clause.md %}) that retrieves `id`(s) inside the `DROP SCHEDULES` statement:

{% include_cached copy-clipboard.html %}
~~~~ sql
> DROP SCHEDULES WITH x AS (SHOW SCHEDULES) SELECT id FROM x WHERE label = 'schedule_database';
~~~~

When `DROP SCHEDULES` removes a [full backup schedule]({% link {{ page.version.version }}/create-schedule-for-backup.md %}#create-a-schedule-for-full-backups-only), it removes the associated [incremental backup schedule]({% link {{ page.version.version }}/create-schedule-for-backup.md %}#incremental-backup-schedules), if it exists. For more information, see [`DROP SCHEDULES`]({% link {{ page.version.version }}/drop-schedules.md %}).

{{site.data.alerts.callout_danger}}
`DROP SCHEDULE` does **not** cancel any in-progress jobs started by the schedule. Before you drop a schedule, [cancel any in-progress jobs]({% link {{ page.version.version }}/cancel-job.md %}) first, as you will not be able to look up the job ID once the schedule is dropped.
{{site.data.alerts.end}}

## View and control a backup initiated by a schedule

After CockroachDB successfully initiates a scheduled backup, it registers the backup as a job. You can [view](#view-the-backup-job), [pause](#pause-the-backup-job), [resume](#resume-the-backup-job), or [cancel](#cancel-the-backup-job) each individual backup job.

### View the backup job

To view jobs for a specific [backup schedule]({% link {{ page.version.version }}/create-schedule-for-backup.md %}), use the schedule's `id`:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW JOBS FOR SCHEDULE 590204387299262465;
~~~
~~~
        job_id       | job_type |                                                                                                             description                                                                                   | statement | user_name | status  | running_status |             created              | started | finished |             modified             | fraction_completed | error | coordinator_id
---------------------+----------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+-----------+-----------+---------+----------------+----------------------------------+---------+----------+----------------------------------+--------------------+-------+-----------------
  590205481558802434 | BACKUP   | BACKUP INTO '/2020/09/15-161444.99' IN 's3://test/scheduled-backup-0915?AWS_ACCESS_KEY_ID=x&AWS_SECRET_ACCESS_KEY=redacted' AS OF SYSTEM TIME '2020-09-15 16:20:00+00:00' WITH revision_history, detached |           | root      | running | NULL           | 2020-09-15 16:20:18.347383+00:00 | NULL    | NULL     | 2020-09-15 16:20:18.347383+00:00 |                  0 |       |              0
(1 row)
~~~

You can also view multiple schedules by nesting a [`SELECT` clause]({% link {{ page.version.version }}/select-clause.md %}) that retrieves `id`(s) inside the `SHOW JOBS` statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW JOBS FOR SCHEDULES WITH x AS (SHOW SCHEDULES) SELECT id FROM x WHERE label = 'test_schedule';
~~~

~~~
        job_id       | job_type |                                                                                                                 description                                                                                      | statement | user_name |  status   | running_status |             created              | started |             finished             |             modified             | fraction_completed | error | coordinator_id
---------------------+----------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+-----------+-----------+-----------+----------------+----------------------------------+---------+----------------------------------+----------------------------------+--------------------+-------+-----------------
  590204496007299074 | BACKUP   | BACKUP INTO '/2020/09/15-161444.99' IN 's3://test/scheduled-backup-0915?AWS_ACCESS_KEY_ID=x&AWS_SECRET_ACCESS_KEY=redacted' AS OF SYSTEM TIME '2020-09-15 16:14:44.991631+00:00' WITH revision_history, detached |           | root      | succeeded | NULL           | 2020-09-15 16:15:17.720725+00:00 | NULL    | 2020-09-15 16:15:20.913789+00:00 | 2020-09-15 16:15:20.910594+00:00 |                  1 |       |              0
  590205481558802434 | BACKUP   | BACKUP INTO '/2020/09/15-161444.99' IN 's3://test/scheduled-backup-0915?AWS_ACCESS_KEY_ID=x&AWS_SECRET_ACCESS_KEY=redacted' AS OF SYSTEM TIME '2020-09-15 16:20:00+00:00' WITH revision_history, detached        |           | root      | succeeded | NULL           | 2020-09-15 16:20:18.347383+00:00 | NULL    | 2020-09-15 16:20:48.37873+00:00  | 2020-09-15 16:20:48.374256+00:00 |                  1 |       |              0
(2 rows)
~~~

For more information, see [`SHOW JOBS`]({% link {{ page.version.version }}/show-jobs.md %}).

### Pause the backup job

To pause jobs for a specific [backup schedule]({% link {{ page.version.version }}/create-schedule-for-backup.md %}), use the schedule's `id`:

{% include_cached copy-clipboard.html %}
~~~ sql
> PAUSE JOBS FOR SCHEDULE 590204387299262465;
~~~
~~~
PAUSE JOBS FOR SCHEDULES 1
~~~

You can also pause multiple schedules by nesting a [`SELECT` clause]({% link {{ page.version.version }}/select-clause.md %}) that retrieves `id`(s) inside the `PAUSE JOBS` statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> PAUSE JOBS FOR SCHEDULES WITH x AS (SHOW SCHEDULES) SELECT id FROM x WHERE label = 'test_schedule';
~~~

~~~
PAUSE JOBS FOR SCHEDULES 2
~~~

For more information, see [`PAUSE JOB`]({% link {{ page.version.version }}/pause-job.md %}).

### Resume the backup job

To resume jobs for a specific [backup schedule]({% link {{ page.version.version }}/create-schedule-for-backup.md %}), use the schedule's `id`:

{% include_cached copy-clipboard.html %}
~~~ sql
> RESUME JOBS FOR SCHEDULE 590204387299262465;
~~~
~~~
RESUME JOBS FOR SCHEDULES 1
~~~

You can also resume multiple schedules by nesting a [`SELECT` clause]({% link {{ page.version.version }}/select-clause.md %}) that retrieves `id`(s) inside the `PAUSE JOBS` statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> RESUME JOBS FOR SCHEDULES WITH x AS (SHOW SCHEDULES) SELECT id FROM x WHERE label = 'test_schedule';
~~~

~~~
RESUME JOBS FOR SCHEDULES 2
~~~

For more information, see [`RESUME JOB`]({% link {{ page.version.version }}/resume-job.md %}).

### Cancel the backup job

To cancel jobs for a specific [backup schedule]({% link {{ page.version.version }}/create-schedule-for-backup.md %}), use the schedule's `id`:

{% include_cached copy-clipboard.html %}
~~~ sql
> CANCEL JOBS FOR SCHEDULE 590204387299262465;
~~~
~~~
CANCEL JOBS FOR SCHEDULES 1
~~~

You can also CANCEL multiple schedules by nesting a [`SELECT` clause]({% link {{ page.version.version }}/select-clause.md %}) that retrieves `id`(s) inside the `CANCEL JOBS` statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> CANCEL JOBS FOR SCHEDULES WITH x AS (SHOW SCHEDULES) SELECT id FROM x WHERE label = 'test_schedule';
~~~

~~~
CANCEL JOBS FOR SCHEDULES 2
~~~

For more information, see [`CANCEL JOB`]({% link {{ page.version.version }}/cancel-job.md %}).

## Restore from a scheduled backup

To restore from a scheduled backup, use the [`RESTORE`]({% link {{ page.version.version }}/restore.md %}) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE
    FROM '2020/08/19-035600.00' IN 's3://test/backups/test_schedule_1?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}'
    AS OF SYSTEM TIME '2020-08-19 03:50:00+00:00';
~~~

To view the backups stored within a collection, use the [`SHOW BACKUP`](#view-scheduled-backup-details) statement.

## See also

- [`CREATE SCHEDULE FOR BACKUP`]({% link {{ page.version.version }}/create-schedule-for-backup.md %})
- [`BACKUP`]({% link {{ page.version.version }}/backup.md %})
- [`RESTORE`]({% link {{ page.version.version }}/restore.md %})
- [`SHOW BACKUP`]({% link {{ page.version.version }}/show-backup.md %})
- [`SHOW SCHEDULES`]({% link {{ page.version.version }}/show-schedules.md %})
- [`PAUSE SCHEDULES`]({% link {{ page.version.version }}/pause-schedules.md %})
- [`RESUME SCHEDULES`]({% link {{ page.version.version }}/resume-schedules.md %})
- [`DROP SCHEDULES`]({% link {{ page.version.version }}/drop-schedules.md %})
- [`PAUSE JOB`]({% link {{ page.version.version }}/pause-job.md %})
- [`RESUME JOB`]({% link {{ page.version.version }}/pause-job.md %})
- [`CANCEL JOB`]({% link {{ page.version.version }}/cancel-job.md %})
- [Take Full and Incremental Backups]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %})
- [Use the Built-in SQL Client]({% link {{ page.version.version }}/cockroach-sql.md %})
- [`cockroach` Commands Overview]({% link {{ page.version.version }}/cockroach-commands.md %})
