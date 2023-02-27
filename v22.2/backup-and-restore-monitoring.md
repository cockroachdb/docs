---
title: Backup and Restore Monitoring
summary: An overview of the metrics to monitor backup and restore jobs in CockroachdB.
toc: true
docs_area: manage
---

CockroachDB includes metrics to monitor [backup](backup.html), [restore](restore.html), and [scheduled backup](create-schedule-for-backup.html) jobs. You can use monitoring integrations to alert when there are anomalies, such as backups that have failed or restore jobs encountering a retryable error.

Depending on whether you are using a {{ site.data.products.dedicated }} or {{ site.data.products.core }} cluster, you can use the following to monitor backup and restore metrics for your CockroachDB cluster:

- [Prometheus endpoint](#prometheus-endpoint): {{ site.data.products.dedicated }}, {{ site.data.products.core }}
- [Datadog integration](#datadog-integration): {{ site.data.products.dedicated }}

We recommend setting up monitoring to alert when anomalies occur. You can then use the following SQL statements to inspect details relating to schedules, jobs, and backups:

- [`SHOW SCHEDULES`](show-schedules.html)
- [`SHOW JOBS`](show-jobs.html)
- [`SHOW BACKUP`](show-backup.html)

For detail on [managed-service backups](../cockroachcloud/use-managed-service-backups.html) that Cockroach Labs stores for your {{ site.data.products.db }} cluster, see the **Backups** page in the Cloud Console.

{% include {{ page.version.version }}/backups/metrics-per-node.md %}

## Prometheus endpoint

You can access the [Prometheus endpoint](monitoring-and-alerting.html#prometheus-endpoint) (`http://<host>:<http-port>/_status/vars`) for backup and restore metrics with **{{ site.data.products.dedicated }} or {{ site.data.products.core }}** clusters.

See the [Monitor CockroachDB with Prometheus](monitor-cockroachdb-with-prometheus.html) tutorial for guidance on installing and setting up Prometheus and Alertmanager to track metrics.

### Available metrics

We recommend the following guidelines:

- Use the `schedules_backup_last_completed_time` metric. Configure this metric to monitor the backup schedule you would use in a disaster.
- Monitor for a lack of successful backups rather than failed backups. A stuck scheduled job will not increment the `schedules_backup_failed` metric. Instead, alert on the `schedules_backup_last_completed_time` metric if the timestamp has not moved forward as expected.

Metric | Description 
-------+-------------
`schedules_backup_succeeded` | The number of scheduled backup jobs that have succeeded.
`schedules_backup_started` | The number of scheduled backup jobs that have started.
`schedules_backup_last_completed_time` | The Unix timestamp of the most recently completed scheduled backup specified as maintaining this metric. **Note:** This metric only updates if the schedule was created with the [`updates_cluster_last_backup_time_metric` option](create-schedule-for-backup.html#schedule-options).
`schedules_backup_failed` | The number of scheduled backup jobs that have failed.
`schedules_round_reschedule_wait` | The number of schedules that were rescheduled due to a currently running job. A value greater than 0 indicates that a previous backup was still running when a new scheduled backup was supposed to start. This corresponds to the [`on_previous_running=wait`](create-schedule-for-backup.html#on-previous-running-option) schedule option.
`schedules_round_reschedule_skip` | The number of schedules that were skipped due to a currently running job. A value greater than 0 indicates that a previous backup was still running when a new scheduled backup was supposed to start. This corresponds to the [`on_previous_running=skip`](create-schedule-for-backup.html#on-previous-running-option) schedule option.
`jobs_backup_currently_running` | The number of backup jobs currently running in `Resume` or `OnFailOrCancel` state.
`jobs_backup_fail_or_cancel_retry_error` | The number of backup jobs that failed with a retryable error on their failure or cancelation process.
`jobs_backup_fail_or_cancel_completed` | The number of backup jobs that successfully completed their failure or cancelation process.
`jobs_backup_fail_or_cancel_failed` | The number of backup jobs that failed with a non-retryable error on their failure or cancelation process.
`jobs_backup_resume_failed` | The number of backup jobs that failed with a non-retryable error.
`jobs_backup_resume_retry_error` | The number of backup jobs that failed with a retryable error.
`jobs_restore_resume_retry_error` | The number of restore jobs that failed with a retryable error.
`jobs_restore_resume_completed` | The number of restore jobs that successfully resumed to completion.
`jobs_restore_resume_failed` | The number of restore jobs that failed with a non-retryable error.
`jobs_restore_fail_or_cancel_failed` | The number of restore jobs that failed with a non-retriable error on their failure or cancelation process.
`jobs_restore_fail_or_cancel_retry_error` | The number of restore jobs that failed with a retryable error on their failure or cancelation process.
`jobs_restore_currently_running` | The number of restore jobs currently running in `Resume` or `OnFailOrCancel` state.

## Datadog integration

To use the Datadog integration with your **{{ site.data.products.dedicated }}** cluster, you can:

- Export the following schedule backup metrics to Datadog using the [Cloud API](../cockroachcloud/cloud-api.html). To set this up, see [Export Metrics From a CockroachDB Dedicated Cluster](../cockroachcloud/export-metrics.html?filters=datadog-metrics-export).
- Access the Cloud Console **Monitoring** page to enable the integration. To set this up, see [Monitor CockroachDB Dedicated with Datadog](../cockroachcloud/monitoring-page.html#monitor-cockroachdb-dedicated-with-datadog).

### Available metrics in Datadog

Metric | Description 
-------+-------------
`schedules_backup_succeeded` | The number of scheduled backup jobs that have succeeded.
`schedules_backup_started` | The number of scheduled backup jobs that have started.
`schedules_backup_last_completed_time` | The Unix timestamp of the most recently completed backup by a schedule specified as maintaining this metric.
`schedules_backup_failed` | The number of scheduled backup jobs that have failed.

## See also

- [Third-Party Monitoring Integrations](third-party-monitoring-tools.html)
- [Manage a Backup Schedule](manage-a-backup-schedule.html)
- [Backup and Restore Overview](backup-and-restore-overview.html)
- [Backup Validation](backup-validation.html)