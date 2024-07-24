---
title: Use Managed-Service Backups
summary: Restore data from a backup in CockroachDB Cloud.
toc: true
docs_area: manage
---

This page describes how to use [_managed-service backups_]({% link cockroachcloud/backup-and-restore-overview.md %}) in CockroachDB {{ site.data.products.serverless }} and CockroachDB {{ site.data.products.dedicated }} clusters.

Managed-service backups are automated backups of CockroachDB Cloud clusters that are stored in Cockroach Labs' cloud storage.

{{site.data.alerts.callout_info}}
In addition to managed-service backups, you can configure manual backups to your own storage bucket with customer-owned backups. Refer to the [Take and Restore Customer-Owned Backups]({% link cockroachcloud/take-and-restore-customer-owned-backups.md %}) page.
{{site.data.alerts.end}}

This table outlines how frequently CockroachDB {{ site.data.products.cloud }} clusters run automated backups and the retention period for each type of backup:

{% include cockroachcloud/backups/managed-service-backups-frequency.md %}

To access your managed-service backups, select a cluster from the [**Clusters** page]({% link cockroachcloud/cluster-management.md %}#view-clusters-page), then click **Backup and Restore** in the **Data** section of the left-side navigation.

Select one of the following filters for your deployment:

<div class="filters clearfix">
    <button class="filter-button page-level" data-scope="serverless"><strong>CockroachDB {{ site.data.products.serverless }}</strong></button>
    <button class="filter-button page-level" data-scope="dedicated"><strong>CockroachDB {{ site.data.products.dedicated }}</strong></button>
</div>

<section class="filter-content" markdown="1" data-scope="serverless">

Click on **Backup and Restore** in the **Data section** of the left-side navigation to access the **Backup Recovery** page.

Once a cluster is deleted, Cockroach Labs retains the full backups for 30 days. The retained backups are not available for restore using the Cloud Console. To restore a backup from a deleted cluster, you must contact the [Cockroach Labs Support team](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/support-resources). If an organization is deleted, you will lose access to all of the managed-service backups that Cockroach Labs has taken of the cluster.

Every backup will be stored entirely in a single region, which is chosen at random from the list of cluster regions at the time of cluster creation. This region will be used indefinitely to store backups.

{{site.data.alerts.callout_info}}
You cannot restore a backup of a multi-region database into a single-region database.
{{site.data.alerts.end}}

</section>

<section class="filter-content" markdown="1" data-scope="dedicated">

Click on **Backup and Restore** in the **Data section** of the left-side navigation to access the **Backup and Restore** page.

Consider the following as you use managed-service backups:

- By default, full backups are retained for 30 days, while incremental backups are retained for 7 days. However, if you delete the backup schedule manually or enable [CMEK]({% link cockroachcloud/cmek.md %}) on the cluster, this will affect the availability of managed backups. Refer to the [CockroachDB Cloud FAQs]({% link cockroachcloud/frequently-asked-questions.md %}#who-is-responsible-for-backup) for more detail.
- Once a cluster is deleted, Cockroach Labs retains the full backups for 30 days and incremental backups for 7 days. The retained backups are not available for restore using the Cloud Console. To restore a backup from a deleted cluster, you must contact the [Cockroach Labs Support team](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/support-resources). If an organization is deleted, you will lose access to all of the managed-service backups that Cockroach Labs has taken of the cluster.
- Every backup will be stored entirely in a single region, which is chosen at random from the list of cluster regions at the time of cluster creation. This region will be used indefinitely to store backups.

{{site.data.alerts.callout_info}}
You cannot restore a backup of a multi-region database into a single-region database.
{{site.data.alerts.end}}

</section>

<div class="filter-content" markdown="1" data-scope="dedicated">

## Backups tab

The **Backups** tab displays a list of your full and incremental cluster backups. Use the calendar drop-down to view all backups taken on a certain date.

For each backup, the following details display:

- **Data From**: The date and time the backup was taken.
- **Type**: Whether the backup is a [full](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/take-full-and-incremental-backups#full-backups) or [incremental](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/take-full-and-incremental-backups#incremental-backups) backup.
- **Expires In**: The remaining number of days Cockroach Labs will retain the backup.
- [**Databases**](#databases): The number of databases included in the backup.

To [restore a particular cluster backup](#restore-a-cluster), click **Restore** in the corresponding row.

</div>

<div class="filter-content" markdown="1" data-scope="serverless">

## Backup Recovery page

The **Backup Recovery** page displays a list of your full cluster backups. Use the calendar drop-down to view all backups taken on a certain date.

For each backup, the following details display:

- **Data From**: The date and time the backup was taken.
- **Status**: Whether the backup is `In Progress` or `Complete`.
- **Expires In**: The remaining number of days Cockroach Labs will retain the backup.

</div>

<div class="filter-content" markdown="1" data-scope="dedicated">

### Databases

To view the databases included in the backup, click the number in the **Databases** column on the cluster view of the **Backups** tab.

For each database in the backup, the following details display:

- The **Name** of the database.
- The number of [**Tables**](#tables) in the database.

    To view the tables in the database, click the number in the [**Tables**](#tables) column.

To [restore a database](#restore-a-database), click **Restore** in the corresponding row.

{{site.data.alerts.callout_info}}
If a database does not contain tables, it will not display in the Databases view.
{{site.data.alerts.end}}

### Tables

To view the tables in a database, click the number in the **Tables** column on the [**Databases**](#databases) page.

For each table in the database, the **Name** of the table displays.

To [restore a table](#restore-a-table), click **Restore** in the corresponding row.

### Incomplete Backups

To view any failed or pending backups, click the **Incomplete Backups** tab on your cluster's **Backup and Restore** page.

For each incomplete backup, the following details display:

- **Started**: The date and time the backup job began.
- **Duration**: The amount of time the backup job ran for.
- **Status**: The error code and message for failed backup jobs.
- **Description**: The SQL command corresponding to the failed or pending backup job.

## Ways to restore data

Users with the [Org Administrator]({% link cockroachcloud/authorization.md %}#org-administrator), [Cluster Operator]({% link cockroachcloud/authorization.md %}#cluster-operator) or [Cluster Administrator]({% link cockroachcloud/authorization.md %}#cluster-administrator) roles can perform the following from the Console:

- [Restore a cluster](#restore-a-cluster)
- [Restore a database](#restore-a-database)
- [Restore a table](#restore-a-table)

Additional ways to restore data:

- [Back up a self-hosted CockroachDB cluster and restore into a CockroachDB {{ site.data.products.cloud }} cluster](#back-up-a-self-hosted-cockroachdb-cluster-and-restore-into-a-cockroachdb-cloud-cluster)
- [Back up and restore data manually]({% link cockroachcloud/take-and-restore-customer-owned-backups.md %})

### Restore a cluster

{{site.data.alerts.callout_info}}
{% include_cached feature-phases/preview.md %}
{{site.data.alerts.end}}

{{site.data.alerts.callout_danger}}
The restore completely erases all data in the destination cluster. All cluster data is replaced with the data from the backup. The destination cluster will be unavailable while the job is in progress.

This operation is disruptive and is to be performed with caution. Use the [Principle of Least Privilege (PoLP)](https://wikipedia.org/wiki/Principle_of_least_privilege) as a golden rule when to designing your system of privilege grants.

{{site.data.alerts.end}}

To restore a cluster:

1. Find the cluster backup on the **Backups** tab.
1. Click **Restore** for the cluster you want to restore.

    The **Restore cluster** module displays with backup details.

1. Select the cluster to restore to. You can restore to: a) the same cluster or b) a different cluster. By default, the option shows the current cluster. The dropdown displays options to restore to a different cluster.

    {{site.data.alerts.callout_info}}
    Only active clusters are displayed. You can perform a cross-cluster restore across clusters that belong to the same organization. Incompatible versions cannot be selected and restoring CockroachDB {{ site.data.products.dedicated }} to CockroachDB {{ site.data.products.serverless }} or vice versa does not work.
    {{site.data.alerts.end}}

1. Click **Continue**.

1. Enter the name of the destination cluster.

1. Once you have reviewed the restore details, click **Restore**.

    The **Restore Jobs** tab will show you the status of your restore and update when the restore job has been created successfully.

### Restore a database

To restore a database:

1. Find the cluster backup containing the database you want to restore, and click the number in the corresponding **Databases** column.
1. In the **Databases** view, click **Restore** for the database you want to restore.

    The **Restore database** module displays with backup details.

1. In the **Restore to** field, enter the name of the destination database.

    {{site.data.alerts.callout_info}}
    [Resolve any naming conflicts](#resolve-a-database-naming-conflict) by using [`DROP`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/drop-database) or [`RENAME`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/alter-database#rename-to) on the existing database. If you enter a unique name in the **Restore to** field, a new database will be created.
    {{site.data.alerts.end}}

1. Select any of the **Dependency options** to skip. You can:
    - **Skip missing foreign keys**, which will remove missing [foreign key](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/foreign-key) constraints (i.e., when the referenced table is not in the backup or is not being restored) before restoring.
    - **Skip missing sequences**, which will ignore [sequence](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/show-sequences) dependencies (i.e., the `DEFAULT` expression that uses the sequence).
    - **Skip missing views**, which will skip restoring [views](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/views) that cannot be restored because their dependencies are not being restored at the same time.

1. Click **Continue**.
1. Once you have reviewed the restore details, click **Restore**.

    When the restore job has been created successfully, you will be taken to the **Restore Jobs** tab, which will show you the status of your restore.

When the restore is complete, be sure to set any database-specific [zone configurations](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/configure-replication-zones) and, if applicable, [grant privileges](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/grant).

### Restore a table

To restore a table:

1. Find the cluster backup containing the table you want to restore, and click the number in the corresponding **Databases** column.
1. In the **Databases** view, find the database containing the table you want to restore, and click the number in the corresponding **Tables** column.

    The **Tables** view displays.

1. Click **Restore** for the table you want to restore.

    The **Restore table** module displays with backup details.

1. In the **Restore to** field, enter the name of the destination database.

    {{site.data.alerts.callout_info}}
    If you enter the name of an existing database, the table will be restored into that existing database. To use the name of an existing database, first [resolve any naming conflicts](#resolve-a-database-naming-conflict) by using [`DROP`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/drop-database) or [`RENAME`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/alter-database#rename-to) on the existing database. If you enter a unique name in the **Restore to** field, a new database will be created.
    {{site.data.alerts.end}}

1. Select any of the **Dependency options** to skip. You can:
    - **Skip missing foreign keys**, which will remove missing [foreign key](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/foreign-key) constraints (i.e., when the referenced table is not in the backup or is not being restored) before restoring.
    - **Skip missing sequences**, which will ignore [sequence](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/show-sequences) dependencies (i.e., the `DEFAULT` expression that uses the sequence).
    - **Skip missing views**, which will skip restoring [views](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/views) that cannot be restored because their dependencies are not being restored at the same time.

1. Click **Continue**.
1. Once you have reviewed the restore details, click **Restore**.

   When the restore job has been created successfully, you will be taken to the **Restore Jobs** tab, which will show you the status of your restore.

### Back up a self-hosted CockroachDB cluster and restore into a CockroachDB {{ site.data.products.cloud }} cluster

To back up a self-hosted CockroachDB cluster into a CockroachDB {{ site.data.products.cloud }} cluster:

1. While [connected to your self-hosted CockroachDB cluster](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/connect-to-the-database), [back up](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/backup) your databases and/or tables to an [external location](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/backup#backup-file-urls):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    BACKUP DATABASE example_database INTO 'gs://{bucket name}/{path/to/backup}?AUTH=specified&CREDENTIALS={encoded key}';
    ~~~

    {{site.data.alerts.callout_danger}}
    If you are backing up the data to AWS or GCP, use the `specified` option for the `AUTH` parameter, as CockroachDB {{ site.data.products.cloud }} will need the `specified` credentials upon [`RESTORE`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/restore). For more information on authentication parameters to cloud storage providers, see [Cloud Storage Authentication](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cloud-storage-authentication).
    {{site.data.alerts.end}}

1. [Connect to your CockroachDB {{ site.data.products.cloud }} cluster]({% link cockroachcloud/connect-to-your-cluster.md %}):

    <div class="filters clearfix">
      <button class="filter-button page-level" data-scope="mac">Mac</button>
      <button class="filter-button page-level" data-scope="linux">Linux</button>
      <button class="filter-button page-level" data-scope="windows">Windows</button>
    </div>

    {% include cockroachcloud/sql-connection-string.md %}


1. [Restore](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/restore) to your CockroachDB {{ site.data.products.cloud }} cluster.

    Use `SHOW BACKUPS` with your external location to find the backup's subdirectory:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SHOW BACKUPS IN 'gs://{bucket name}/{path/to/backup}?AUTH=specified&CREDENTIALS={encoded key}';
    ~~~

    ~~~
            path
    ------------------------
    2021/03/23-213101.37
    2021/03/24-172553.85
    2021/03/24-210532.53
    (3 rows)
    ~~~

    Use the subdirectory to specify the backup to restore:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    RESTORE DATABASE example_database FROM '2021/03/23-213101.37' IN 'gs://{bucket name}/{path/to/backup}?AUTH=specified&CREDENTIALS={encoded key}';
    ~~~

## Known limitations

- For [restoring a cluster](#restore-a-cluster):
    - Restoring a backup taken on cluster running a newer version of CockroachDB into a cluster that is on an earlier version does not work. See [Restoring Backups Across Versions](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/restoring-backups-across-versions).
    - Restoring CockroachDB {{ site.data.products.dedicated }} to CockroachDB {{ site.data.products.serverless }} or vice versa does not work.
    - Restoring to a different cluster is disabled for [CMEK]({% link cockroachcloud/cmek.md %}) clusters.
    - Restores on AWS that take longer than 36 hours may run into authentication errors due to expired credentials.
    - You can perform a cross-cluster restore across clusters that belong to the same organization. Cross-organization restores are not supported.

See [tracking issue](https://github.com/cockroachlabs/managed-service/pull/12211).

## Troubleshooting

### Resolve a database naming conflict

The databases you want to restore cannot have the same name as an existing database in the target cluster. Before you restore a database, verify that the database name is not already in use. To do this, connect to the target cluster with the [CockroachDB SQL client]({% link cockroachcloud/connect-to-your-cluster.md %}#connect-to-your-cluster) and run the following:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW DATABASES;
~~~

If the database's name is already in use, either [drop the existing database](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/drop-database):

{% include_cached copy-clipboard.html %}
~~~ sql
> DROP DATABASE example_database;
~~~

Or [change the existing database's name](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/alter-database#rename-to):

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER DATABASE example_database RENAME TO archived_example_database;
~~~

### Resolve a table naming conflict

The table you want to restore cannot have the same name as an existing table in the target database. Before you restore a table, verify that the table name is not already in use. To do this, connect to the target cluster with the [CockroachDB SQL client]({% link cockroachcloud/connect-to-your-cluster.md %}#connect-to-your-cluster) and run the following:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW TABLES FROM database_name;
~~~

If the table's name is already in use, either [drop the existing table](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/drop-table):

{% include_cached copy-clipboard.html %}
~~~ sql
> DROP TABLE target_database.example_table;
~~~

Or [change the existing table's name](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/alter-table#rename-to):

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE target_database.example_table RENAME TO target_database.archived_example_table;
~~~

</div>

<section class="filter-content" markdown="1" data-scope="serverless">

## Restore a cluster

Find the cluster backup you want to restore, and click **Restore**.

{{site.data.alerts.callout_info}}
CockroachDB {{ site.data.products.serverless }} does not support cross-cluster restores through the CockroachDB {{ site.data.products.cloud }} Console. If you need to restore data into a new or different cluster, use [customer-owned backups]({% link cockroachcloud/take-and-restore-customer-owned-backups.md %}) or [contact support](https://support.cockroachlabs.com).
{{site.data.alerts.end}}

Performing a restore will cause your cluster to be unavailable for the duration of the restore. All current data is deleted, and the cluster will be restored to the state it was in at the time of the backup. There are no automatic incremental backups, and no automatic database or table level backups.

You can [manage your own backups]({% link cockroachcloud/take-and-restore-customer-owned-backups.md %}), including incremental, database, and table level backups. To perform manual backups, you must configure either a [`userfile`]({% link cockroachcloud/take-and-restore-customer-owned-backups.md %}) location or a [cloud storage location]({% link cockroachcloud/take-and-restore-customer-owned-backups.md %}?filters=cloud).

</section>
