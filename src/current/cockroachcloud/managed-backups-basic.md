---
title: Managed Backups in CockroachDB Basic Clusters
summary: Learn about CockroachDB Cloud managed backups.
toc: true
docs_area: manage
cloud: true
---

{% include cockroachcloud/backups/managed-backup-description.md %}

{% include cockroachcloud/filter-tabs/managed-backups.md %}

This page describes managed backups in {{ site.data.products.basic }} clusters, which have a default non-configurable schedule.

{{site.data.alerts.callout_info}}
In addition to managed backups, you can take manual backups to your own storage bucket with self-managed backups. Refer to the [Take and Restore Self-Managed Backups]({% link cockroachcloud/take-and-restore-self-managed-backups.md %}) page.
{{site.data.alerts.end}}

Cockroach Labs will take a managed backup every 24 hours. By default, managed backups will be retained for 30 days in {{ site.data.products.basic }} clusters.

When a {{ site.data.products.basic }} cluster is deleted, or the customer’s agreement with Cockroach Labs has terminated, managed backups taken on the cluster will be retained for 30 days, after which the backups will be deleted.

For details on viewing and managing the backups, refer to the [Cloud Console](#restore-a-cluster) section.

## Upgrades and downgrades

{% include cockroachcloud/backups/managed-backup-upgrade-downgrade.md %}

## Considerations

- Every backup will be stored entirely in a single region, which is chosen at random from the list of cluster regions at the time of cluster creation. This region will be used indefinitely to store backups.

{% include cockroachcloud/backups/costs-link.md %}

### Required permissions to restore managed backups

{% include cockroachcloud/backups/managed-backup-perms.md %}

## Cloud Console

### View backups

Click on **Backup and Restore** in the **Data section** of the left-side navigation to access the **Backup Recovery** page.

This page displays a list of your cluster backups. Use the calendar drop-down to view all backups taken on a certain date.

For each backup, the following details display:

- **Data From**: The date and time the backup was taken.
- **Status**: The backup's status, `In Progress` or `Complete`.
- **Expires In**: The remaining number of days Cockroach Labs will retain the backup.
- **Restore**: Restore a particular cluster backup, click [**Restore**](#restore-a-cluster) in the corresponding row.

### Restore a cluster

{{site.data.alerts.callout_danger}}
The restore completely erases all data in the destination cluster. All cluster data is replaced with the data from the backup. The destination cluster will be unavailable while the job is in progress.

This operation is disruptive and is to be performed with caution. Use the [Principle of Least Privilege (PoLP)](https://wikipedia.org/wiki/Principle_of_least_privilege) as a golden rule when designing your system of privilege grants.
{{site.data.alerts.end}}

Performing a restore will cause your cluster to be unavailable for the duration of the restore. All current data is deleted, and the cluster will be restored to the state it was in at the time of the backup.

To restore a cluster:

1. Find the cluster backup on the **Backup Recovery** page.
1. Click **Restore** for the cluster you want to restore.

    The **Restore cluster** module displays with backup details.

1. You can restore a backup to the same cluster.

    {{site.data.alerts.callout_info}}
    If you need to restore data into a new or different cluster, use [self-managed backups]({% link cockroachcloud/take-and-restore-self-managed-backups.md %}) or [contact support]({% link {{site.current_cloud_version}}/support-resources.md %}).
    {{site.data.alerts.end}}

1. Click **Restore**.