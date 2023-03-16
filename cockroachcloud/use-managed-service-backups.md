---
title: Use Managed-Service Backups
summary: Restore data from a backup in CockroachDB Cloud.
toc: true
docs_area: manage
---

{% include cockroachcloud/ccloud/backup-types.md %}

This page describes how to use managed-service backups from {{ site.data.products.serverless }} and {{ site.data.products.dedicated }} clusters. 

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
Currently, you can only restore [databases](#restore-a-database) and [tables](#restore-a-table) to the same cluster that the backup was taken from.

In the meantime, you can [back up and restore data manually](take-and-restore-customer-owned-backups.html) or [back up from a self-hosted CockroachDB cluster and restore into a {{ site.data.products.db }} cluster](#back-up-a-self-hosted-cockroachdb-cluster-and-restore-into-a-cockroachdb-cloud-cluster). Note that you cannot restore a backup of a multi-region database into a single-region database.
{{site.data.alerts.end}}

</section>

## Backups page

A list of your full and incremental cluster backups displays on your cluster's **Backups** page.

For each backup, the following details display:

<div class="filter-content" markdown="1" data-scope="dedicated">
- The date and time the backup was taken (**Data From**) 
- The **Status** of the backup 
- The **Type** of backup
- The **Size** of the backup
- The remaining number of days the backup will be retained (**Expires In**)
- The number of [**Databases**](#databases) included in the backup

<img src="{{ 'images/cockroachcloud/backups-dedicated.png' | relative_url }}" alt="Backups Page" style="border:1px solid #eee;max-width:100%" />

</div>

<div class="filter-content" markdown="1" data-scope="serverless">
- The date and time the backup was taken (**Data From**)
- The **Status** of the backup
- The remaining number of days the backup will be retained (**Expires In**)

<img src="{{ 'images/cockroachcloud/backups-serverless.png' | relative_url }}" alt="Backups Page" style="border:1px solid #eee;max-width:100%" />

</div>

<div class="filter-content" markdown="1" data-scope="dedicated">

### Databases

To view the databases included in the backup, click the number in the **Databases** column on the cluster view of the **Backups** page.

For each database in the backup, the following details display:

- The **Name** of the database
- The **Size** of the database data captured in the backup

    {{site.data.alerts.callout_info}}
    If the **Size** listed for a database in an incremental backup is **0 B**, it means no changes were made in the database since the last full backup.
    {{site.data.alerts.end}}

- The number of [**Tables**](#tables) in the database

    To view the tables in the database, click the number in the [**Tables**](#tables) column.

To [restore a database](#restore-a-database), click **Restore** in the corresponding row.

{{site.data.alerts.callout_info}}
If a database does not contain tables, it will not display in the Databases view.
{{site.data.alerts.end}}

### Tables

To view the tables in a database, click the number in the **Tables** column on the [**Databases**](#databases) page.

For each table in the database, the following details display:

- The **Name** of the table
- The **Size** of the table data captured in the backup

    {{site.data.alerts.callout_info}}
    If the **Size** listed for a table in an incremental backup is **0.00 B**, it means no changes were made in the table since the last full backup.
    {{site.data.alerts.end}}

- The number of **Rows** captured in the backup

## Ways to restore data

[Console Admin](console-access-management.html#console-admin) can perform the following from the Console:

- [Restore a database](#restore-a-database)
- [Restore a table](#restore-a-table)

Additional ways to restore data:

- [Back up a self-hosted CockroachDB cluster and restore into a {{ site.data.products.db }} cluster](#back-up-a-self-hosted-cockroachdb-cluster-and-restore-into-a-cockroachdb-cloud-cluster)
- [Back up and restore data manually](take-and-restore-customer-owned-backups.html)

### Restore a database

To restore a database:

1. Find the cluster backup containing the database you want to restore, and click the number in the corresponding **Databases** column.
1. In the **Databases** view, click **Restore** for the database you want to restore.

    The **Restore database** module displays with backup details.

1. In the **Restore to** field, enter the name of the destination database. For multi-region databases on v21.2, see [Restore a multi-region database](#restore-a-multi-region-database-to-a-new-database-in-v21-2).

    {{site.data.alerts.callout_info}}
    [Resolve any naming conflicts](#resolve-a-database-naming-conflict) by using [`DROP`](../{{site.current_cloud_version}}/drop-database.html) or [`RENAME`](../{{site.current_cloud_version}}/alter-database.html#rename-to) on the existing database. If you enter a unique name in the **Restore to** field, a new database will be created.
    {{site.data.alerts.end}}

1. Select any of the **Dependency options** to skip. You can:
    - **Skip missing foreign keys**, which will remove missing [foreign key](../{{site.current_cloud_version}}/foreign-key.html) constraints (i.e., when the referenced table is not in the backup or is not being restored) before restoring.
    - **Skip missing sequences**, which will ignore [sequence](../{{site.current_cloud_version}}/show-sequences.html) dependencies (i.e., the `DEFAULT` expression that uses the sequence).
    - **Skip missing views**, which will skip restoring [views](../{{site.current_cloud_version}}/views.html) that cannot be restored because their dependencies are not being restored at the same time.

1. Click **Continue**
1. Once you have reviewed the restore details, click **Restore**.

   When the restore job has been created successfully, you will be taken to the **Restore Jobs** tab, which will show you the status of your restore.

When the restore is complete, be sure to set any database-specific [zone configurations](../{{site.current_cloud_version}}/configure-replication-zones.html) and, if applicable, [grant privileges](../{{site.current_cloud_version}}/grant.html).

#### Restore a multi-region database to a new database in v21.2

{{site.data.alerts.callout_info}}
The following procedure for restoring a multi-region database to a different database name **is only applicable to clusters running version v21.2**. Clusters running v22.1+ can restore a multi-region database following [Restore a database](#restore-a-database) in the previous section.
{{site.data.alerts.end}}

{% include cockroachcloud/restore-multiregion-dedicated.md %}

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

1. Click **Continue**
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

The databases you want to restore cannot have the same name as an existing database in the target cluster. Before you restore a database, verify that the database name is not already in use. To do this, connect to the target cluster with the [CockroachDB SQL client](connect-to-your-cluster.html#step-3-connect-to-your-cluster) and run the following:

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

The table you want to restore cannot have the same name as an existing table in the target database. Before you restore a table, verify that the table name is not already in use. To do this, connect to the target cluster with the [CockroachDB SQL client](connect-to-your-cluster.html#step-3-connect-to-your-cluster) and run the following:

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

You can [manage your own backups](take-and-restore-customer-owned-backups.html), including incremental, database, and table level backups.  You can take backups locally to [`userfile`](../{{site.current_cloud_version}}/use-userfile-storage.html) or [back up to cloud storage](take-and-restore-customer-owned-backups.html#back-up-data).

</section>
