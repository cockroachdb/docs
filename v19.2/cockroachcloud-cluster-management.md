---
title: Cluster Management
summary: Manage your cluster's schema, data, and users.
toc: true
build_for: [cockroachcloud]
---

## Manage cluster configuration

Although you can leverage [geo-partitioning](partitioning.html), advanced [replication controls](configure-replication-zones.html), and [CDC](change-data-capture.html) without intervention from Cockroach Labs, we recommend [reaching out](https://support.cockroachlabs.com) for initial guidance and best practices.

To add or remove nodes, please contact [Support](https://support.cockroachlabs.com). Our team will work with you to update your cluster configurations. We expect this to be self-service next year.

## Restore data from a backup

Cockroach Labs runs full backups daily and incremental backups hourly for every CockroachCloud cluster. The full backups are retained for 30 days and incremental backups for 7 days.

{{site.data.alerts.callout_alert}}
All databases are not backed up at the same time. Each database is backed up every hour based on the time of creation. For larger databases, you might see an hourly CPU spike while the database is being backed up.
{{site.data.alerts.end}}

To restore your data, [contact us](https://support.cockroachlabs.com).

Additionally, you can [backup and restore](backup-and-restore.html) data on your own.

### Backup and restore from a self-hosted CockroachDB cluster to a CockroachCloud cluster.

You can [backup](backup.html) your self-hosted CockroachDB databases to an [external location](backup.html#backup-file-urls) and then [restore](restore.html) to your CockroachCloud cluster.

{{site.data.alerts.callout_danger}}
If you are backing up the data to AWS or GCP, do not use the `implicit` option for the `AUTH` parameter.
{{site.data.alerts.end}}

## Delete cluster

{{site.data.alerts.callout_danger}}
Deleting a cluster will delete all cluster data.
{{site.data.alerts.end}}

Proceed with the following steps only if you are sure you want to delete a cluster:

1. Navigate to the Cluster Overview page for the cluster you want to delete.
2. On the right-hand side, select **Delete cluster** from the **Actions** drop-down.
3. In the confirmation window, enter the name of the cluster and click **Delete**.
