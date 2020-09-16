---
title: Manage a Backup Schedule
summary: Learn about how to create, manage, and restore from a schedule of periodic backups.
toc: true
---

<span class="version-tag">New in v20.2:</span> You can create schedules in CockroachDB for periodic backups. Once a [backup schedule is created](#create-a-new-backup-schedule), you can do the following:

- [Set up monitoring for the backup schedule](#set-up-monitoring-for-the-backup-schedule)
- [View and control the backup schedule](#view-and-control-the-backup-schedule)
- [View and control a backup initiated by a schedule](#view-and-control-a-backup-initiated-by-a-schedule)

## Create a new backup schedule

To create a new backup schedule, use the [`CREATE SCHEDULE FOR BACKUP`](create-schedule-for-backup.html) statement:

{% include copy-clipboard.html %}
~~~ sql
> CREATE SCHEDULE schedule_name
  FOR BACKUP INTO 's3://test/backups/test_schedule_1?AWS_ACCESS_KEY_ID=123&AWS_SECRET_ACCESS_KEY=123'
    WITH revision_history
    RECURRING '@daily'
    WITH SCHEDULE OPTIONS first_run = '2020-09-15 00:00:00.00';
~~~

In this example, a schedule called `schedule_name` is created to take daily backups with revision history in AWS S3, with the first backup being taken at midnight on September 15, 2020.

For more information, see [`CREATE SCHEDULE FOR BACKUP`](create-schedule-for-backup.html).

## Set up monitoring for the backup schedule

We recommend that you monitor your backup schedule and alert on metrics that will confirm that your backups are completing, but also that they're not running more concurrently than you expectFor more information, see [Monitor CockroachDB with Prometheus](monitor-cockroachdb-with-prometheus.html).

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
