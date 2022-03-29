---
title: Restore Data from a Backup
summary: Restore a table or database from a backup in CockroachDB Cloud.
toc: true
docs_area: manage
---

This page describes the **Backups** page and how to restore your data.

Cockroach Labs runs [full backups](../{{site.versions["stable"]}}/take-full-and-incremental-backups.html#full-backups) daily and [incremental backups](../{{site.versions["stable"]}}/take-full-and-incremental-backups.html#incremental-backups) hourly for every {{ site.data.products.db }} cluster. The full backups are retained for 30 days, while incremental backups are retained for 7 days.

The backups that Cockroach Labs runs for you can be viewed on the [Backups page](#backups-page).

{{site.data.alerts.callout_info}}
Currently, you can only restore [databases](#restore-a-database) and [tables](#restore-a-table) to the same cluster that the backup was taken from.

In the meantime, you can [back up and restore data manually](run-bulk-operations.html) or [back up from a self-hosted CockroachDB cluster and restore into a {{ site.data.products.db }} cluster](#back-up-a-self-hosted-cockroachdb-cluster-and-restore-into-a-cockroachdb-cloud-cluster). Note that you cannot restore a backup of a multi-region database into a single-region database.
{{site.data.alerts.end}}

## Backups page

A list of your full cluster backups displays on your cluster's **Backups** page.

For each backup, the following details display:

- The date and time the backup was taken (**Data From**)
- The **Status** of the backup
- The **Type** of backup
- The **Size** of the backup
- The remaining number of days the backup will be retained (**Expires In**)
- The number of [**Databases**](#databases) included in the backup

    To view the databases included in the backup, click the number in the [**Databases**](#databases) column.

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
- [Back up and restore data manually](run-bulk-operations.html)

### Restore a database

To restore a database:

1. Find the cluster backup containing the database you want to restore, and click the number in the corresponding **Databases** column.
1. In the **Databases** view, click **Restore** for the database you want to restore.

    The **Restore database** module displays with backup details.

1. In the **Restore to** field, enter the name of the destination database.

    {{site.data.alerts.callout_info}}
    [Resolve any naming conflicts](#resolve-a-database-naming-conflict) by using [`DROP`](../{{site.versions["stable"]}}/drop-database.html) or [`RENAME`](../{{site.versions["stable"]}}/rename-database.html) on the existing database. If you enter a unique name in the **Restore to** field, a new database will be created.
    {{site.data.alerts.end}}  

1. Select any of the **Dependency options** to skip. You can:
    - **Skip missing foreign keys**, which will remove missing [foreign key](../{{site.versions["stable"]}}/foreign-key.html) constraints (i.e., when the referenced table is not in the backup or is not being restored) before restoring.
    - **Skip missing sequences**, which will ignore [sequence](../{{site.versions["stable"]}}/show-sequences.html) dependencies (i.e., the `DEFAULT` expression that uses the sequence).
    - **Skip missing views**, which will skip restoring [views](../{{site.versions["stable"]}}/views.html) that cannot be restored because their dependencies are not being restored at the same time.

1. Click **Continue**
1. Once you have reviewed the restore details, click **Restore**.

   When the restore job has been created successfully, you will be taken to the **Restore Jobs** tab, which will show you the status of your restore.

When the restore is complete, be sure to set any database-specific [zone configurations](../{{site.versions["stable"]}}/configure-replication-zones.html) and, if applicable, [grant privileges](../{{site.versions["stable"]}}/grant.html).

### Restore a table

To restore a table:

1. Find the cluster backup containing the table you want to restore, and click the number in the corresponding **Databases** column.
1. In the **Databases** view, find the database containing the table you want to restore, and click the number in the corresponding **Tables** column.

    The **Tables** view displays.

1. Click **Restore** for the table you want to restore.

    The **Restore table** module displays with backup details.

1. In the **Restore to** field, enter the name of the destination database.

    {{site.data.alerts.callout_info}}
    If you enter the name of an existing database, the table will be restored into that existing database. To use the name of an existing database, first [resolve any naming conflicts](#resolve-a-database-naming-conflict) by using [`DROP`](../{{site.versions["stable"]}}/drop-database.html) or [`RENAME`](../{{site.versions["stable"]}}/rename-database.html) on the existing database. If you enter a unique name in the **Restore to** field, a new database will be created.
    {{site.data.alerts.end}}  

1. Select any of the **Dependency options** to skip. You can:
    - **Skip missing foreign keys**, which will remove missing [foreign key](../{{site.versions["stable"]}}/foreign-key.html) constraints (i.e., when the referenced table is not in the backup or is not being restored) before restoring.
    - **Skip missing sequences**, which will ignore [sequence](../{{site.versions["stable"]}}/show-sequences.html) dependencies (i.e., the `DEFAULT` expression that uses the sequence).
    - **Skip missing views**, which will skip restoring [views](../{{site.versions["stable"]}}/views.html) that cannot be restored because their dependencies are not being restored at the same time.

1. Click **Continue**
1. Once you have reviewed the restore details, click **Restore**.

   When the restore job has been created successfully, you will be taken to the **Restore Jobs** tab, which will show you the status of your restore.

### Back up a self-hosted CockroachDB cluster and restore into a {{ site.data.products.db }} cluster

To back up a self-hosted CockroachDB cluster into a {{ site.data.products.db }} cluster:

1. While [connected to your self-hosted CockroachDB cluster](../{{site.versions["stable"]}}/connect-to-the-database.html), [back up](../{{site.versions["stable"]}}/backup.html) your databases and/or tables to an [external location](../{{site.versions["stable"]}}/backup.html#backup-file-urls):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    BACKUP DATABASE example_database INTO 'gs://{bucket name}/{path/to/backup}?AUTH=specified&CREDENTIALS={encoded key}';
    ~~~

    {{site.data.alerts.callout_danger}}
    If you are backing up the data to AWS or GCP, use the `specified` option for the `AUTH` parameter, as {{ site.data.products.db }} will need the `specified` credentials upon [`RESTORE`](../{{site.versions["stable"]}}/restore.html). For more information on authentication parameters to cloud storage providers, see [Use Cloud Storage for Bulk Operations](../{{site.versions["stable"]}}/use-cloud-storage-for-bulk-operations.html#authentication).
    {{site.data.alerts.end}}

1. [Connect to your {{ site.data.products.db }} cluster](connect-to-your-cluster.html):

    <div class="filters clearfix">
      <button class="filter-button page-level" data-scope="mac">Mac</button>
      <button class="filter-button page-level" data-scope="linux">Linux</button>
      <button class="filter-button page-level" data-scope="windows">Windows</button>
    </div>

    {% include cockroachcloud/sql-connection-string.md %}


1. [Restore](../{{site.versions["stable"]}}/restore.html) to your {{ site.data.products.db }} cluster.

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

If the database's name is already in use, either [drop the existing database](../{{site.versions["stable"]}}/drop-database.html):

{% include_cached copy-clipboard.html %}
~~~ sql
> DROP DATABASE example_database;
~~~

Or [change the existing database's name](../{{site.versions["stable"]}}/rename-database.html):

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

If the table's name is already in use, either [drop the existing table](../{{site.versions["stable"]}}/drop-table.html):

{% include_cached copy-clipboard.html %}
~~~ sql
> DROP TABLE target_database.example_table;
~~~

Or [change the existing table's name](../{{site.versions["stable"]}}/rename-table.html):

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE target_database.example_table RENAME TO target_database.archived_example_table;
~~~
