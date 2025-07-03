---
title: Backup and Restore Monitoring
summary: An overview of the metrics to monitor backup and restore jobs in CockroachdB.
toc: true
docs_area: manage
---

CockroachDB includes metrics to monitor [backup]({% link {{ page.version.version }}/backup.md %}), [restore]({% link {{ page.version.version }}/restore.md %}), and [scheduled backup]({% link {{ page.version.version }}/create-schedule-for-backup.md %}) jobs. You can use monitoring integrations to alert when there are anomalies, such as backups that have failed or restore jobs encountering a retryable error.

You can access the [Prometheus Endpoint](#prometheus-endpoint) to track and alert on backup and restore metrics. We recommend setting up monitoring to [alert]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#alerting-tools) when anomalies occur. You can then use the following SQL statements to inspect details relating to schedules, jobs, and backups:

- [`SHOW SCHEDULES`]({% link {{ page.version.version }}/show-schedules.md %})
- [`SHOW JOBS`]({% link {{ page.version.version }}/show-jobs.md %})
- [`SHOW BACKUP`]({% link {{ page.version.version }}/show-backup.md %})

{% include {{ page.version.version }}/backups/metrics-per-node.md %}

## Prometheus endpoint

You can access the [Prometheus endpoint]({% link {{ page.version.version }}/prometheus-endpoint.md %}) for backup and restore metrics.

Refer to the [Monitor CockroachDB with Prometheus]({% link {{ page.version.version }}/monitor-cockroachdb-with-prometheus.md %}) tutorial for guidance on installing and setting up Prometheus and Alertmanager to track metrics.

### Available metrics

We recommend the following guidelines:

- Use the `schedules.BACKUP.last-completed-time` metric to monitor the specific backup job or jobs you would use to recover from a disaster.
- Configure alerting on the `schedules.BACKUP.last-completed-time` metric to watch for cases where the timestamp has not moved forward as expected.

Metric | Description
-------+-------------
`schedules.BACKUP.failed` | The number of scheduled backup jobs that have failed. **Note:** A stuck scheduled job will not increment this metric.
`schedules.BACKUP.last-completed-time` | The Unix timestamp of the most recently completed scheduled backup specified as maintaining this metric. **Note:** This metric only updates if the schedule was created with the [`updates_cluster_last_backup_time_metric` option]({% link {{ page.version.version }}/create-schedule-for-backup.md %}#schedule-options).
`schedules.BACKUP.protected_age_sec` | The age of the oldest [protected timestamp record]({% link {{ page.version.version }}/create-schedule-for-backup.md %}#protected-timestamps-and-scheduled-backups) protected by backup schedules.
`schedules.BACKUP.protected_record_count` | The number of [protected timestamp records]({% link {{ page.version.version }}/create-schedule-for-backup.md %}#protected-timestamps-and-scheduled-backups) held by backup schedules.
`schedules.BACKUP.started` | The number of scheduled backup jobs that have started.
`schedules.BACKUP.succeeded` | The number of scheduled backup jobs that have succeeded.
`schedules.round.reschedule_skip` | The number of schedules that were skipped due to a currently running job. A value greater than 0 indicates that a previous backup was still running when a new scheduled backup was supposed to start. This corresponds to the [`on_previous_running=skip`]({% link {{ page.version.version }}/create-schedule-for-backup.md %}#on-previous-running-option) schedule option.
`schedules.round.reschedule_wait` | The number of schedules that were rescheduled due to a currently running job. A value greater than 0 indicates that a previous backup was still running when a new scheduled backup was supposed to start. This corresponds to the [`on_previous_running=wait`]({% link {{ page.version.version }}/create-schedule-for-backup.md %}#on-previous-running-option) schedule option.
`jobs.backup.currently_paused` | The number of backup jobs currently considered [paused]({% link {{ page.version.version }}/pause-job.md %}).
`jobs.backup.currently_running` | The number of backup jobs currently running in `Resume` or `OnFailOrCancel` state.
`jobs.backup.fail_or_cancel_retry_error` | The number of backup jobs that failed with a retryable error on their failure or cancelation process.
`jobs.backup.fail_or_cancel_completed` | The number of backup jobs that successfully completed their failure or cancelation process.
`jobs.backup.fail_or_cancel_failed` | The number of backup jobs that failed with a non-retryable error on their failure or cancelation process.
`jobs.backup.protected_age_sec` | The age of the oldest [protected timestamp record]({% link {{ page.version.version }}/create-schedule-for-backup.md %}#protected-timestamps-and-scheduled-backups) protected by backup jobs.
`jobs.backup.protected_record_count` | The number of [protected timestamp records]({% link {{ page.version.version }}/create-schedule-for-backup.md %}#protected-timestamps-and-scheduled-backups) held by backup jobs.
`jobs.backup.resume_failed` | The number of backup jobs that failed with a non-retryable error.
`jobs.backup.resume_retry_error` | The number of backup jobs that failed with a retryable error.
`jobs.restore.currently_paused` | The number of restore jobs currently considered [paused]({% link {{ page.version.version }}/pause-job.md %}).
`jobs.restore.currently_running` | The number of restore jobs currently running in `Resume` or `OnFailOrCancel` state.
`jobs.restore.fail_or_cancel_failed` | The number of restore jobs that failed with a non-retriable error on their failure or cancelation process.
`jobs.restore.fail_or_cancel_retry_error` | The number of restore jobs that failed with a retryable error on their failure or cancelation process.
`jobs.restore.protected_age_sec` | The age of the oldest [protected timestamp record]({% link {{ page.version.version }}/architecture/storage-layer.md %}#protected-timestamps) protected by restore jobs.
`jobs.restore.protected_record_count` | The number of [protected timestamp records]({% link {{ page.version.version }}/architecture/storage-layer.md %}#protected-timestamps) held by restore jobs.
`jobs.restore.resume_completed` | The number of restore jobs that successfully resumed to completion.
`jobs.restore.resume_failed` | The number of restore jobs that failed with a non-retryable error.
`jobs.restore.resume_retry_error` | The number of restore jobs that failed with a retryable error.

## See also

- [Third-Party Monitoring Integrations]({% link {{ page.version.version }}/third-party-monitoring-tools.md %})
- [Manage a Backup Schedule]({% link {{ page.version.version }}/manage-a-backup-schedule.md %})
- [Backup and Restore Overview]({% link {{ page.version.version }}/backup-and-restore-overview.md %})
- [Backup Validation]({% link {{ page.version.version }}/backup-validation.md %})
