---
title: Managed Backups in CockroachDB Advanced Clusters
summary: Learn about CockroachDB Cloud managed backups.
toc: true
docs_area: manage
cloud: true
---

{% include cockroachcloud/backups/managed-backup-description.md %}

{% include cockroachcloud/filter-tabs/managed-backups.md %}

This page describes managed backups in {{ site.data.products.advanced }} clusters. You can configure the following:

- The [frequency](#frequency) of the backups to meet [recovery point objective (RPO)]({% link {{site.current_cloud_version}}/disaster-recovery-overview.md %}) requirements.
- The [retention](#retention) of the backups to set how long Cockroach Labs retains the backups.

{{site.data.alerts.callout_info}}
In addition to managed backups, you can take manual backups to your own storage bucket with self-managed backups. Refer to the [Take and Restore Self-Managed Backups]({% link cockroachcloud/take-and-restore-self-managed-backups.md %}) page.
{{site.data.alerts.end}}

## Managed backup settings

{{site.data.alerts.callout_info}}
Configurable managed backup settings are available in all [supported versions]({% link releases/release-support-policy.md %}#supported-versions) of CockroachDB on {{ site.data.products.advanced }} clusters.
{{site.data.alerts.end}}

{{ site.data.products.advanced }} clusters take a combination of full and incremental backups in order to meet the set frequency. The type of managed backup the cluster takes is **not** configurable. Each incremental backup is dependent on the last full backup, which has an effect on the managed backups that you can restore in the set retention period.

Full backups in the cluster will be deleted when they reach the set retention period. At this point, any incremental backups dependent on the deleted full backup will also be deleted. The Cloud Console will not list any backups that are beyond the set retention period, or incremental backups that cannot be restored.

For instructions on how to view and configure managed backup settings, use one of the following:

- [Cloud Console](#cloud-console).
- [Cloud API](#cloud-api).
- [CockroachDB {{ site.data.products.cloud }} Terraform provider](#cockroachdb-cloud-terraform-provider).

{% include cockroachcloud/backups/full-backup-setting-change.md %}

### Frequency

You can configure how frequently Cockroach Labs takes backups, which will determine the cluster's [RPO]({% link {{site.current_cloud_version}}/disaster-recovery-overview.md %}).

You can set backup frequency to one of the following options:

{% include cockroachcloud/backups/frequency-settings.md %}

### Retention

You can set your retention duration **once**. After you have adjusted the retention, the duration will only apply to new backups. The available retention options are:

{% include cockroachcloud/backups/retention-settings.md %}

{% include cockroachcloud/backups/costs-link.md %}

{% include cockroachcloud/backups/retention-deleted-cluster.md %}

## Considerations

- Every backup will be stored entirely in a single region, which is chosen at random from the list of cluster regions at the time of cluster creation. This region will be used indefinitely to store backups.
- You can perform a cross-cluster restore across {{ site.data.products.advanced }} clusters that belong to the same organization. However, this cross-cluster restore is not supported for {{ site.data.products.standard }} and {{ site.data.products.basic }} clusters.
- You cannot restore a backup of a multi-region database into a single-region database.
- For details on managed backups and enabling CMEK in {{ site.data.products.advanced }} clusters, refer to [Backup and restore operations on a cluster with CMEK]({% link cockroachcloud/cmek.md %}#backup-and-restore-operations-on-a-cluster-with-cmek).

### Required permissions to restore managed backups

{% include cockroachcloud/backups/managed-backup-perms.md %}

## Cloud Console

### View backups

Click on **Backup and Restore** in the **Data section** of the left-side navigation to access the **Backup Recovery** page.

The **Backups** tab displays a list of your full and incremental cluster backups. Use the calendar drop-down to view all backups taken on a certain date.

For each backup, the following details display:

- **Data From**: The date and time the backup was taken.
- **Status**: The backup's status, `In Progress` or `Complete`.
- **Type**: Whether the backup is a full or incremental backup.
- **Expires In**: The remaining number of days Cockroach Labs will retain the backup.
- [**Databases**](#databases): The number of databases included in the backup.
- **Restore**: [Restore a particular cluster backup](#restore-an-advanced-cluster), click **Restore** in the corresponding row.

#### Databases

To view the databases included in the backup, click the number in the **Databases** column on the **Backups** tab.

For each database in the backup, the following details display:

- The **Name** of the database.
- The number of [**Tables**](#tables) in the database. If a database does not contain tables, it will not display in the **Databases** view.
- **Restore**: To [restore a database](#restore-a-database), click **Restore** in the corresponding row.

    To view the tables in the database, click the number in the [**Tables**](#tables) column.

#### Tables

To view the tables in a database, click the number in the **Tables** column on the [**Databases**](#databases) page for a particular backup.

For each table in the database, the **Name** of the table displays.

To [restore a table](#restore-a-table), click **Restore** in the corresponding row.

### Modify backup settings

{{site.data.alerts.callout_info}}
{% include cockroachcloud/backups/full-backup-setting-change.md %}
{{site.data.alerts.end}}

{% include cockroachcloud/backups/review-settings.md %}

On the **Backup and Restore** page, click on **Settings** and the **Backup Settings** module will open.

The **Enable backups** switch allows you to enable or disable backups.

To modify the [frequency](#frequency) of backups, click on the dropdown under **Schedule backups every**. This will display the option to select one of the following:

{% include cockroachcloud/backups/frequency-settings.md %}

To modify the [retention](#retention) of backups, click on **Retain backups for**. This will display the following options to select:

{% include cockroachcloud/backups/retention-settings.md %}

### Incomplete Backups

To view any failed or pending backups, click the **Incomplete Backups** tab on the **Backup and Restore** page.

For each incomplete backup, the following details display:

- **Started**: The date and time the backup job began.
- **Duration**: The amount of time the backup job ran for.
- **Status**: The error code and message for failed backup jobs.
- **Description**: The SQL command corresponding to the failed or pending backup job.

### Restore data

Users with the [Organization Admin]({% link cockroachcloud/authorization.md %}#organization-admin), [Cluster Operator]({% link cockroachcloud/authorization.md %}#cluster-operator), or [Cluster Admin]({% link cockroachcloud/authorization.md %}#cluster-admin) roles can perform the following from the Console:

- [Restore a cluster](#restore-an-advanced-cluster)
- [Restore a database](#restore-a-database)
- [Restore a table](#restore-a-table)

#### Restore an Advanced cluster

{{site.data.alerts.callout_info}}
Before a cluster can be restored from a managed backup, the destination cluster must be completely wiped of data. A cluster restore job fails if the destination cluster contains any databases/schemas/tables.
{{site.data.alerts.end}}

To restore a cluster:

1. Find the cluster backup on the **Backups** tab.
1. Click **Restore** for the cluster you want to restore.

    The **Restore cluster** module displays with backup details.

1. Select the cluster to restore to. You can restore to either the same cluster or a different {{ site.data.products.advanced }} cluster in the same organization. Incompatible versions cannot be selected. By default, the option shows the current cluster. The dropdown displays options to restore to a different cluster.

    Select the **Skip localities check** box if you want to skip checking localities of a cluster before a restore when there are mismatched cluster regions between the backup's cluster and the destination cluster.

1. Click **Continue**.

1. Enter the name of the destination cluster.

1. Once you have reviewed the restore details, click **Restore**.

    The [**Restore Jobs** tab](#restore-jobs) will show you the status of your restore and update when the restore job has been created successfully.

#### Restore a database

To restore a database:

1. On the **Backups** tab, find the cluster backup containing the database you want to restore, and click the number in the corresponding **Databases** column.
1. In the **Databases** view, click **Restore** for the database you want to restore.

    The **Restore database** module displays with backup details.

1. In the **Restore to** fields:
    - Select the name of the destination cluster.
    - Type the name of the destination database.

    {{site.data.alerts.callout_info}}
    Resolve any naming conflicts by using [`DROP`]({% link {{site.current_cloud_version}}/drop-database.md %}) or [`RENAME`]({% link {{site.current_cloud_version}}/alter-database.md %}#rename-to) on the existing database. If you enter a unique name in the **Restore to** field, a new database will be created.
    {{site.data.alerts.end}}

1. Select any of the **Dependency options** to skip. You can:
    - **Skip missing foreign keys**, which will remove missing [foreign key]({% link {{site.current_cloud_version}}/foreign-key.md %}) constraints (i.e., when the referenced table is not in the backup or is not being restored) before restoring.
    - **Skip missing sequences**, which will ignore [sequence]({% link {{site.current_cloud_version}}/show-sequences.md %}) dependencies (i.e., the `DEFAULT` expression that uses the sequence).
    - **Skip missing views**, which will skip restoring [views]({% link {{site.current_cloud_version}}/views.md %}) that cannot be restored because their dependencies are not being restored at the same time.
    - **Skip localities check**, which will skip checking localities of a cluster before a restore when there are mismatched cluster regions between the backup's cluster and the destination cluster.

1. Click **Continue**.
1. Once you have reviewed the restore details, click **Restore**.

    When the restore job has been created successfully, you will be taken to the [**Restore Jobs** tab](#restore-jobs), which will show you the status of your restore.

When the restore is complete, be sure to set any database-specific [zone configurations]({% link {{site.current_cloud_version}}/configure-replication-zones.md %}) and, if applicable, [grant privileges]({% link {{site.current_cloud_version}}/grant.md %}).

#### Restore a table

To restore a table:

1. Find the cluster backup containing the table you want to restore, and click the number in the corresponding **Databases** column.
1. In the **Databases** view, find the database containing the table you want to restore, and click the number in the corresponding **Tables** column.

    The **Tables** view displays.

1. Click **Restore** for the table you want to restore.

    The **Restore table** module displays with backup details.

1. In the **Restore to** fields:
    - Select the name of the destination cluster.
    - Type the name of the destination database. (Before restoring, ensure that you do not have an existing table with the same name.)

    {{site.data.alerts.callout_info}}
    If you enter the name of an existing database, the table will be restored into that existing database. To use the name of an existing database, first resolve any naming conflicts with existing tables by using [`DROP`]({% link {{site.current_cloud_version}}/drop-table.md %}) or [`RENAME`]({% link {{site.current_cloud_version}}/alter-table.md %}#rename-to) on the table. If you enter a unique name in the **Restore to** field, a new database will be created.
    {{site.data.alerts.end}}

1. Select any of the **Dependency options** to skip. You can:
    - **Skip missing foreign keys**, which will remove missing [foreign key]({% link {{site.current_cloud_version}}/foreign-key.md %}) constraints (i.e., when the referenced table is not in the backup or is not being restored) before restoring.
    - **Skip missing sequences**, which will ignore [sequence]({% link {{site.current_cloud_version}}/show-sequences.md %}) dependencies (i.e., the `DEFAULT` expression that uses the sequence).
    - **Skip missing views**, which will skip restoring [views]({% link {{site.current_cloud_version}}/views.md %}) that cannot be restored because their dependencies are not being restored at the same time.

1. Click **Continue**.
1. Once you have reviewed the restore details, click **Restore**.

   When the restore job has been created successfully, you will be taken to the [**Restore Jobs** tab](#restore-jobs), which will show you the status of your restore.

#### Restore Jobs

To view the status of your restore, click on the **Restore Jobs** tab from the cluster **Backup and Restore** page.

For each restore job, the tab will display:

- **Source > Destination**: The source cluster, database, or table to the destination cluster, database, or table.
- **Restore type**: Whether the job is a cluster, database, table restore.
- **Backup taken on**: The date the backup was originally taken.
- **Status**: The status of the restore job `Preparing`, `Running`, `Succeeded`, `Failed`.
- **Restore start**: The date the restore job was initiated.
- **Restore end**: The date the restore job ened (whether successful or unsuccessful).
- **Job ID**: The job ID of the restore job.

## Cloud API

{% include cockroachcloud/backups/cloud-api-managed-backup-intro.md %}

{% include cockroachcloud/backups/cloud-api-backup-settings.md %}

{% include cockroachcloud/backups/cloud-api-backup-view.md %}

{% include cockroachcloud/backups/cloud-api-restore-endpoint.md %}

## CockroachDB Cloud Terraform provider

You can use the [CockroachDB {{ site.data.products.cloud }} Terraform provider]({% link cockroachcloud/provision-a-cluster-with-terraform.md %}) to specify managed backup settings in {{ site.data.products.advanced }} clusters.

In your `main.tf` Terraform configuration file, use the `backup_config` attribute on the `cockroach_cluster` resource to modify the settings of managed backups. For example:

{% include_cached copy-clipboard.html %}
~~~ hcl
resource "cockroach_cluster" "advanced" {
  name           = "cockroach-advanced"
  cloud_provider = "GCP"
  plan           = "ADVANCED"
  dedicated = {
    storage_gib  = 15
    num_virtual_cpus = 4
  }
  regions = [
    {
      name       = "us-central1"
      node_count = 1
    }
  ]
  delete_protection = true
  backup_config = {
    enabled           = true
    frequency_minutes = 60
    retention_days    = 30
  }
}
~~~

{% include cockroachcloud/backups/terraform-managed-backups.md %}