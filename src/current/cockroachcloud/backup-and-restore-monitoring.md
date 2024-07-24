---
title: Backup and Restore Monitoring
summary: An overview of backup and restore monitoring features for CockroachDB Cloud deployments.
toc: true
---

CockroachDB includes metrics to monitor [backup](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/backup), [restore](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/restore), and [scheduled backup](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/create-schedule-for-backup) jobs. You can use monitoring integrations to alert when there are anomalies, such as backups that have failed or restore jobs encountering a retryable error. We recommend setting up monitoring to alert when anomalies occur.

Depending on whether you are using a CockroachDB {{ site.data.products.dedicated }} or CockroachDB {{ site.data.products.serverless }} cluster, you can use the following to monitor backup and restore metrics for your cluster:

- [Cloud Console **Metrics** page]({% link cockroachcloud/metrics-page.md %}): CockroachDB {{ site.data.products.dedicated }}, CockroachDB {{ site.data.products.serverless }}
- [Prometheus](#prometheus): CockroachDB {{ site.data.products.dedicated }}
- [Datadog](#datadog): CockroachDB {{ site.data.products.dedicated }}

You can then use the following SQL statements to inspect details relating to schedules, jobs, and backups:

- [`SHOW SCHEDULES`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/show-schedules)
- [`SHOW JOBS`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/show-jobs)
- [`SHOW BACKUP`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/show-backup)

For detail on [managed-service backups]({% link cockroachcloud/use-managed-service-backups.md %}) that Cockroach Labs stores for your CockroachDB {{ site.data.products.cloud }} cluster, see the **Backup and Restore** page in the Cloud Console.

{% include cockroachcloud/backups/metrics-per-node.md %}

## Prometheus

This section outlines the available backup and restore job metrics with Prometheus. For instructions on accessing the `metricexport` endpoint for Promethus, refer to [Export Metrics From a CockroachDB Dedicated Cluster]({% link cockroachcloud/export-metrics.md %}).

We recommend the following guidelines:

- Use the `schedules.BACKUP.last-completed-time` metric to monitor the specific backup job or jobs you would use to recover from a disaster.
- Configure alerting on the `schedules.BACKUP.last-completed-time` metric to watch for cases where the timestamp has not moved forward as expected.

Metric | Description
-------+-------------
`schedules.BACKUP.failed` | The number of scheduled backup jobs that have failed. **Note:** A stuck scheduled job will not increment this metric.
`schedules.BACKUP.last-completed-time` | The Unix timestamp of the most recently completed scheduled backup specified as maintaining this metric. **Note:** This metric only updates if the schedule was created with the [`updates_cluster_last_backup_time_metric` option](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/create-schedule-for-backup#schedule-options).
`schedules.BACKUP.protected_age_sec` | The age of the oldest [protected timestamp record](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/create-schedule-for-backup#protected-timestamps-and-scheduled-backups) protected by backup schedules.
`schedules.BACKUP.protected_record_count` | The number of [protected timestamp records](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/create-schedule-for-backup#protected-timestamps-and-scheduled-backups) held by backup schedules.
`schedules.BACKUP.started` | The number of scheduled backup jobs that have started.
`schedules.BACKUP.succeeded` | The number of scheduled backup jobs that have succeeded.
`schedules.round.reschedule_skip` | The number of schedules that were skipped due to a currently running job. A value greater than 0 indicates that a previous backup was still running when a new scheduled backup was supposed to start. This corresponds to the [`on_previous_running=skip`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/create-schedule-for-backup#on-previous-running-option) schedule option.
`schedules.round.reschedule_wait` | The number of schedules that were rescheduled due to a currently running job. A value greater than 0 indicates that a previous backup was still running when a new scheduled backup was supposed to start. This corresponds to the [`on_previous_running=wait`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/create-schedule-for-backup#on-previous-running-option) schedule option.
`jobs.backup.currently_paused` | The number of backup jobs currently considered [paused](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/pause-job).
`jobs.backup.currently_running` | The number of backup jobs currently running in `Resume` or `OnFailOrCancel` state.
`jobs.backup.fail_or_cancel_retry_error` | The number of backup jobs that failed with a retryable error on their failure or cancelation process.
`jobs.backup.fail_or_cancel_completed` | The number of backup jobs that successfully completed their failure or cancelation process.
`jobs.backup.fail_or_cancel_failed` | The number of backup jobs that failed with a non-retryable error on their failure or cancelation process.
`jobs.backup.protected_age_sec` | The age of the oldest [protected timestamp record](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/create-schedule-for-backup#protected-timestamps-and-scheduled-backups) protected by backup jobs.
`jobs.backup.protected_record_count` | The number of [protected timestamp records](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/create-schedule-for-backup#protected-timestamps-and-scheduled-backups) held by backup jobs.
`jobs.backup.resume_failed` | The number of backup jobs that failed with a non-retryable error.
`jobs.backup.resume_retry_error` | The number of backup jobs that failed with a retryable error.
`jobs.restore.currently_paused` | The number of restore jobs currently considered [paused](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/pause-job).
`jobs.restore.currently_running` | The number of restore jobs currently running in `Resume` or `OnFailOrCancel` state.
`jobs.restore.fail_or_cancel_failed` | The number of restore jobs that failed with a non-retriable error on their failure or cancelation process.
`jobs.restore.fail_or_cancel_retry_error` | The number of restore jobs that failed with a retryable error on their failure or cancelation process.
`jobs.restore.protected_age_sec` | The age of the oldest [protected timestamp record](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}//architecture/storage-layer#protected-timestamps) protected by restore jobs.
`jobs.restore.protected_record_count` | The number of [protected timestamp records](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}//architecture/storage-layer#protected-timestamps) held by restore jobs.
`jobs.restore.resume_completed` | The number of restore jobs that successfully resumed to completion.
`jobs.restore.resume_failed` | The number of restore jobs that failed with a non-retryable error.
`jobs.restore.resume_retry_error` | The number of restore jobs that failed with a retryable error.

## Datadog

To use the Datadog integration with your CockroachDB {{ site.data.products.dedicated }} cluster, you can:

- Export the following schedule backup metrics to Datadog using the [Cloud API]({% link cockroachcloud/cloud-api.md %}). To set this up, refer to [Export Metrics From a CockroachDB Dedicated Cluster]({% link cockroachcloud/export-metrics.md %}).
- Access the Cloud Console **Monitoring** page to enable the integration. To set this up, refer to [Monitor CockroachDB Dedicated with Datadog]({% link cockroachcloud/tools-page.md %}#monitor-cockroachdb-dedicated-with-datadog).

### Available metrics in Datadog

Metric | Description
-------+-------------
`schedules.BACKUP.succeeded` | The number of scheduled backup jobs that have succeeded.
`schedules.BACKUP.started` | The number of scheduled backup jobs that have started.
`schedules.BACKUP.last_completed_time` | The Unix timestamp of the most recently completed backup by a schedule specified as maintaining this metric.
`schedules.BACKUP.failed` | The number of scheduled backup jobs that have failed.