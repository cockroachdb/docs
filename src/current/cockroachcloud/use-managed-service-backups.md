---
title: Use Managed-Service Backups
summary: Restore data from a backup in CockroachDB Cloud.
toc: true
docs_area: manage
---

This page describes how to use [managed-service backups](../{{site.current_cloud_version}}/backup-and-restore-overview.html#cockroachdb-backup-types) from {{ site.data.products.serverless }} and {{ site.data.products.dedicated }} clusters.

To access your managed-service backups, select a cluster from the [**Clusters** page](cluster-management.html#view-clusters-page), then click **Backups** in the **Data** section of the left side navigation.

<div class="filters clearfix">
    <button class="filter-button page-level" data-scope="serverless"><strong>{{ site.data.products.serverless }}</strong></button>
    <button class="filter-button page-level" data-scope="dedicated"><strong>{{ site.data.products.dedicated }}</strong></button>
</div>


This page describes the **Backups** page and how to restore your data.

<section class="filter-content" markdown="1" data-scope="serverless">
Cockroach Labs runs [full cluster backups](../{{site.current_cloud_version}}/take-full-and-incremental-backups.html#full-backups) hourly for every {{ site.data.products.serverless }} cluster. The full backups are retained for 30 days.
</section>

<section class="filter-content" markdown="1" data-scope="dedicated">
Cockroach Labs runs [full cluster backups](../{{site.current_cloud_version}}/take-full-and-incremental-backups.html#full-backups) daily and [incremental cluster backups](../{{site.current_cloud_version}}/take-full-and-incremental-backups.html#incremental-backups) hourly for every {{ site.data.products.dedicated }} cluster. The full backups are retained for 30 days, while incremental backups are retained for 7 days. Backups are stored in the same region that a [single-region cluster](plan-your-cluster.html#cluster-configuration) is running in or the primary region of a [multi-region cluster](plan-your-cluster.html#multi-region-clusters).

{{site.data.alerts.callout_info}}
You cannot restore a backup of a multi-region database into a single-region database.
{{site.data.alerts.end}}

During [limited access](/docs/{{site.versions["stable"]}}/cockroachdb-feature-availability.html), managed backups are not available for {{ site.data.products.dedicated }} clusters on Azure. Customers can [take and restore from their own backups on Azure storage](take-and-restore-customer-owned-backups.html). Refer to [{{ site.data.products.dedicated }} on Azure](cockroachdb-dedicated-on-azure.html).

</section>

## Backups page

<div class="filter-content" markdown="1" data-scope="dedicated">
Your cluster's **Backups** page displays a list of your full and incremental cluster backups. Use the calendar drop-down to view all backups taken on a certain date.

For each backup, the following details display:

- **Data From**: The date and time the backup was taken.
- **Type**: Whether the backup is a [full](../{{site.current_cloud_version}}/take-full-and-incremental-backups.html#full-backups) or [incremental](../{{site.current_cloud_version}}/take-full-and-incremental-backups.html#incremental-backups) backup.
- **Size**: The size of the backup, measured in `KiB`.
- **Expires In**: The remaining number of days Cockroach Labs will retain the backup.
- [**Databases**](#databases): The number of databases included in the backup.

<img src="{{ 'images/cockroachcloud/backups-dedicated.png' | relative_url }}" alt="Backups Page" style="border:1px solid #eee;max-width:100%" />

</div>

<div class="filter-content" markdown="1" data-scope="serverless">
Your cluster's **Backups** page displays a list of your full cluster backups. Use the calendar drop-down to view all backups taken on a certain date.

For each backup, the following details display:

- **Data From**: The date and time the backup was taken.
- **Status**: Whether the backup is `In Progress` or `Complete`.
- **Expires In**: The remaining number of days Cockroach Labs will retain the backup.

<img src="{{ 'images/cockroachcloud/backups-serverless.png' | relative_url }}" alt="Backups Page" style="border:1px solid #eee;max-width:100%" />

</div>

<div class="filter-content" markdown="1" data-scope="dedicated">

### Databases

To view the databases included in the backup, click the number in the **Databases** column on the cluster view of the **Backups** page.

For each database in the backup, the following details display:

- The **Name** of the database.
- The **Size** of the database data captured in the backup.

    {{site.data.alerts.callout_info}}
    If the **Size** listed for a database in an incremental backup is **0 B**, it means no changes were made in the database since the last full backup.
    {{site.data.alerts.end}}

- The number of [**Tables**](#tables) in the database.

    To view the tables in the database, click the number in the [**Tables**](#tables) column.

To [restore a database](#restore-a-database), click **Restore** in the corresponding row.

{{site.data.alerts.callout_info}}
If a database does not contain tables, it will not display in the Databases view.
{{site.data.alerts.end}}

### Tables

To view the tables in a database, click the number in the **Tables** column on the [**Databases**](#databases) page.

For each table in the database, the following details display:

- The **Name** of the table.
- The **Size** of the table data captured in the backup.

    {{site.data.alerts.callout_info}}
    If the **Size** listed for a table in an incremental backup is **0.00 B**, it means no changes were made in the table since the last full backup.
    {{site.data.alerts.end}}

- The number of **Rows** captured in the backup.

### Incomplete Backups

To view any failed or pending backups, click the **Incomplete Backups** tab on your cluster's **Backups** page.

For each incomplete backup, the following details display:

- **Started**: The date and time the backup job began.
- **Duration**: The amount of time the backup job ran for.
- **Status**: The error code and message for failed backup jobs.
- **Description**: The SQL command corresponding to the failed or pending backup job.

## Ways to restore data

[Org Administrators](authorization.html#org-administrator-legacy) can perform the following from the Console:

- [Restore a cluster](#restore-a-cluster)
- [Restore a database](#restore-a-database)
- [Restore a table](#restore-a-table)

Additional ways to restore data:

- [Back up a self-hosted CockroachDB cluster and restore into a {{ site.data.products.db }} cluster](#back-up-a-self-hosted-cockroachdb-cluster-and-restore-into-a-cockroachdb-cloud-cluster)
- [Back up and restore data manually](take-and-restore-customer-owned-backups.html)

### Restore a cluster

{{site.data.alerts.callout_info}}
{% include_cached feature-phases/limited-access.md %}
{{site.data.alerts.end}}

To restore a cluster:

1. Find the cluster backup on the **Backups** page.
1. Click **Restore** for the cluster you want to restore.

    The **Restore cluster** module displays with backup details.

1. Click **Continue**.

    {{site.data.alerts.callout_danger}}
    The restore will completely erase all data in the cluster. All cluster data will be replaced with the data from the backup.
    {{site.data.alerts.end}}

1. Once you have reviewed the restore details, click **Restore**.

    The **Restore Jobs** tab will show you the status of your restore and update when the restore job has been created successfully.

### Restore a database

To restore a database:

1. Find the cluster backup containing the database you want to restore, and click the number in the corresponding **Databases** column.
1. In the **Databases** view, click **Restore** for the database you want to restore.

    The **Restore database** module displays with backup details.

1. In the **Restore to** field, enter the name of the destination database. 

    {{site.data.alerts.callout_info}}
    [Resolve any naming conflicts](#resolve-a-database-naming-conflict) by using [`DROP`](../{{site.current_cloud_version}}/drop-database.html) or [`RENAME`](../{{site.current_cloud_version}}/alter-database.html#rename-to) on the existing database. If you enter a unique name in the **Restore to** field, a new database will be created.
    {{site.data.alerts.end}}

1. Select any of the **Dependency options** to skip. You can:
    - **Skip missing foreign keys**, which will remove missing [foreign key](../{{site.current_cloud_version}}/foreign-key.html) constraints (i.e., when the referenced table is not in the backup or is not being restored) before restoring.
    - **Skip missing sequences**, which will ignore [sequence](../{{site.current_cloud_version}}/show-sequences.html) dependencies (i.e., the `DEFAULT` expression that uses the sequence).
    - **Skip missing views**, which will skip restoring [views](../{{site.current_cloud_version}}/views.html) that cannot be restored because their dependencies are not being restored at the same time.

1. Click **Continue**.
1. Once you have reviewed the restore details, click **Restore**.

    When the restore job has been created successfully, you will be taken to the **Restore Jobs** tab, which will show you the status of your restore.

When the restore is complete, be sure to set any database-specific [zone configurations](../{{site.current_cloud_version}}/configure-replication-zones.html) and, if applicable, [grant privileges](../{{site.current_cloud_version}}/grant.html).

### Restore a table

To restore a table:

1. Find the cluster backup containing the table you want to restore, and click the number in the corresponding **Databases** column.
1. In the **Databases** view, find the database containing the table you want to restore, and click the number in the corresponding **Tables** column.

    The **Tables** view displays.

1. Click **Restore** for the table you want to restore.

    The **Restore table** module displays with backup details.

1. In the **Restore to** field, enter the name of the destination database.

    {{site.data.alerts.callout_info}}
    If you enter the name of an existing database, the table will be restored into that existing database. To use the name of an existing database, first [resolve any naming conflicts](#resolve-a-database-naming-conflict) by using [`DROP`](../{{site.current_cloud_version}}/drop-database.html) or [`RENAME`](../{{site.current_cloud_version}}/alter-database.html#rename-to) on the existing database. If you enter a unique name in the **Restore to** field, a new database will be created.
    {{site.data.alerts.end}}

1. Select any of the **Dependency options** to skip. You can:
    - **Skip missing foreign keys**, which will remove missing [foreign key](../{{site.current_cloud_version}}/foreign-key.html) constraints (i.e., when the referenced table is not in the backup or is not being restored) before restoring.
    - **Skip missing sequences**, which will ignore [sequence](../{{site.current_cloud_version}}/show-sequences.html) dependencies (i.e., the `DEFAULT` expression that uses the sequence).
    - **Skip missing views**, which will skip restoring [views](../{{site.current_cloud_version}}/views.html) that cannot be restored because their dependencies are not being restored at the same time.

1. Click **Continue**.
1. Once you have reviewed the restore details, click **Restore**.

   When the restore job has been created successfully, you will be taken to the **Restore Jobs** tab, which will show you the status of your restore.

### Back up a self-hosted CockroachDB cluster and restore into a {{ site.data.products.db }} cluster

To back up a self-hosted CockroachDB cluster into a {{ site.data.products.db }} cluster:

1. While [connected to your self-hosted CockroachDB cluster](../{{site.current_cloud_version}}/connect-to-the-database.html), [back up](../{{site.current_cloud_version}}/backup.html) your databases and/or tables to an [external location](../{{site.current_cloud_version}}/backup.html#backup-file-urls):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    BACKUP DATABASE example_database INTO 'gs://{bucket name}/{path/to/backup}?AUTH=specified&CREDENTIALS={encoded key}';
    ~~~

    {{site.data.alerts.callout_danger}}
    If you are backing up the data to AWS or GCP, use the `specified` option for the `AUTH` parameter, as {{ site.data.products.db }} will need the `specified` credentials upon [`RESTORE`](../{{site.versions["stable"]}}/restore.html). For more information on authentication parameters to cloud storage providers, see [Cloud Storage Authentication](../{{site.versions["stable"]}}/cloud-storage-authentication.html).
    {{site.data.alerts.end}}

1. [Connect to your {{ site.data.products.db }} cluster](connect-to-your-cluster.html):

    <div class="filters clearfix">
      <button class="filter-button page-level" data-scope="mac">Mac</button>
      <button class="filter-button page-level" data-scope="linux">Linux</button>
      <button class="filter-button page-level" data-scope="windows">Windows</button>
    </div>

    {% include cockroachcloud/sql-connection-string.md %}


1. [Restore](../{{site.current_cloud_version}}/restore.html) to your {{ site.data.products.db }} cluster.

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

## Troubleshooting

### Resolve a database naming conflict

The databases you want to restore cannot have the same name as an existing database in the target cluster. Before you restore a database, verify that the database name is not already in use. To do this, connect to the target cluster with the [CockroachDB SQL client](connect-to-your-cluster.html#connect-to-your-cluster) and run the following:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW DATABASES;
~~~

If the database's name is already in use, either [drop the existing database](../{{site.current_cloud_version}}/drop-database.html):

{% include_cached copy-clipboard.html %}
~~~ sql
> DROP DATABASE example_database;
~~~

Or [change the existing database's name](../{{site.current_cloud_version}}/alter-database.html#rename-to):

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER DATABASE example_database RENAME TO archived_example_database;
~~~

### Resolve a table naming conflict

The table you want to restore cannot have the same name as an existing table in the target database. Before you restore a table, verify that the table name is not already in use. To do this, connect to the target cluster with the [CockroachDB SQL client](connect-to-your-cluster.html#connect-to-your-cluster) and run the following:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW TABLES FROM database_name;
~~~

If the table's name is already in use, either [drop the existing table](../{{site.current_cloud_version}}/drop-table.html):

{% include_cached copy-clipboard.html %}
~~~ sql
> DROP TABLE target_database.example_table;
~~~

Or [change the existing table's name](../{{site.current_cloud_version}}/alter-table.html#rename-to):

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE target_database.example_table RENAME TO target_database.archived_example_table;
~~~

</div>

<section class="filter-content" markdown="1" data-scope="serverless">

## Restore a cluster

Find the cluster backup you want to restore, and click **Restore**.

Performing a restore will cause your cluster to be unavailable for the duration of the restore. All current data is deleted, and the cluster will be restored to the state it was in at the time of the backup. There are no automatic incremental backups, and no automatic database or table level backups.

You can [manage your own backups](take-and-restore-customer-owned-backups.html), including incremental, database, and table level backups. To perform manual backups, you must configure either a [`userfile`](take-and-restore-customer-owned-backups.html) location or a [cloud storage location](take-and-restore-customer-owned-backups.html?filters=cloud).

</section>
