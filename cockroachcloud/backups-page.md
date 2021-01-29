---
title: Restore Data from a Backup
summary: Restore a table or database from a backup in CockroachCloud.
toc: true
redirect_from:
- ../v20.2/cockroachcloud-backups-page.html
---

This page describes the **Backups** page and how to restore your data.

Cockroach Labs runs [full backups](../v20.2/backup.html#full-backups) daily and [incremental backups](../v20.2/backup.html#incremental-backups) hourly for every CockroachCloud cluster. The full backups are retained for 30 days, while incremental backups are retained for 7 days.

The backups that Cockroach Labs runs for you can be viewed on the [Backups page](#backups-page).

{{site.data.alerts.callout_info}}
Currently, you can only restore [databases](#restore-a-database) and [tables](#restore-a-table) to the same cluster that the backup was taken from.

In the meantime, you can [back up and restore data manually](#back-up-and-restore-data-manually) or [back up from a self-hosted CockroachDB cluster and restore into a CockroachCloud cluster](#back-up-a-self-hosted-cockroachdb-cluster-and-restore-into-a-cockroachcloud-cluster).
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

- [Back up a self-hosted CockroachDB cluster and restore into a CockroachCloud cluster](#back-up-a-self-hosted-cockroachdb-cluster-and-restore-into-a-cockroachcloud-cluster)
- [Back up and restore data manually](#back-up-and-restore-data-manually)

### Restore a database

To restore a database:

1. Find the cluster backup containing the database you want to restore, and click the number in the corresponding **Databases** column.
1. In the **Databases** view, click **Restore** for the database you want to restore.

    The **Restore database** module displays with backup details.

1. In the **Restore to** field, enter the name of the destination database.

    {{site.data.alerts.callout_info}}
    [Resolve any naming conflicts](#resolve-a-database-naming-conflict) by using [`DROP`](../v20.2/drop-database.html) or [`RENAME`](../v20.2/rename-database.html) on the existing database. If you enter a unique name in the **Restore to** field, a new database will be created.
    {{site.data.alerts.end}}  

1. Select any of the **Dependency options** to skip. You can:
    - **Skip missing foreign keys**, which will remove missing [foreign key](../v20.2/foreign-key.html) constraints (i.e., when the referenced table is not in the backup or is not being restored) before restoring.
    - **Skip missing sequences**, which will ignore [sequence](../v20.2/show-sequences.html) dependencies (i.e., the `DEFAULT` expression that uses the sequence).
    - **Skip missing views**, which will skip restoring [views](../v20.2/views.html) that cannot be restored because their dependencies are not being restored at the same time.

1. Click **Continue**
1. Once you have reviewed the restore details, click **Restore**.

   When the restore job has been created successfully, you will be taken to the **Restore Jobs** tab, which will show you the status of your restore.

When the restore is complete, be sure to set any database-specific [zone configurations](../v20.2/configure-replication-zones.html) and, if applicable, [grant privileges](../v20.2/grant.html).

### Restore a table

To restore a table:

1. Find the cluster backup containing the table you want to restore, and click the number in the corresponding **Databases** column.
1. In the **Databases** view, find the database containing the table you want to restore, and click the number in the corresponding **Tables** column.

    The **Tables** view displays.

1. Click **Restore** for the table you want to restore.

    The **Restore table** module displays with backup details.

1. In the **Restore to** field, enter the name of the destination database.

    {{site.data.alerts.callout_info}}
    [Resolve any naming conflicts](#resolve-a-table-naming-conflict) by using [`DROP`](../v20.2/drop-table.html) or [`RENAME`](../v20.2/rename-table.html) on the existing table. If you enter a unique name in the **Restore to** field, a new table will be created.
    {{site.data.alerts.end}}  

1. Select any of the **Dependency options** to skip. You can:
    - **Skip missing foreign keys**, which will remove missing [foreign key](../v20.2/foreign-key.html) constraints (i.e., when the referenced table is not in the backup or is not being restored) before restoring.
    - **Skip missing sequences**, which will ignore [sequence](../v20.2/show-sequences.html) dependencies (i.e., the `DEFAULT` expression that uses the sequence).
    - **Skip missing views**, which will skip restoring [views](../v20.2/views.html) that cannot be restored because their dependencies are not being restored at the same time.

1. Click **Continue**
1. Once you have reviewed the restore details, click **Restore**.

   When the restore job has been created successfully, you will be taken to the **Restore Jobs** tab, which will show you the status of your restore.

### Back up a self-hosted CockroachDB cluster and restore into a CockroachCloud cluster

To back up a self-hosted CockroachDB cluster into a CockroachCloud cluster:

1. While [connected to your self-hosted CockroachDB cluster](../v20.2/connect-to-the-database.html), [back up](../v20.2/backup.html) your databases and/or tables to an [external location](../v20.2/backup.html#backup-file-urls):

    {% include copy-clipboard.html %}
    ~~~ sql
    > BACKUP DATABASE example_database TO 'gs://bucket_name/path_to_backup?AUTH=specified';
    ~~~

    {{site.data.alerts.callout_danger}}
    If you are backing up the data to AWS or GCP, use the `specified` option for the `AUTH` parameter, as CockroachCloud will need the `specified` credentials upon [`RESTORE`](../v20.2/restore.html).
    {{site.data.alerts.end}}

1. [Connect to your CockroachCloud cluster](connect-to-your-cluster.html):

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --url='postgres://<username>:<password>@<global host>:26257/<database>?sslmode=verify-full&sslrootcert=<path to the CA certificate>'
    ~~~

1. [Restore](../v20.2/restore.html) to your CockroachCloud cluster:

    {% include copy-clipboard.html %}
    ~~~ sql
    > RESTORE DATABASE example_database FROM 'gs://bucket_name/path_to_backup?AUTH=specified';
    ~~~

### Back up and restore data manually

Additionally, you can [back up and restore](../v20.2/backup-and-restore.html) your Cockroach Cloud data manually:

1. [Connect to your CockroachCloud cluster](connect-to-your-cluster.html):

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --url='postgres://<username>:<password>@<global host>:26257/<database>?sslmode=verify-full&sslrootcert=<path to the CA certificate>'
    ~~~

1. [Back up](../v20.2/backup.html) your databases and/or tables to an [external location](../v20.2/backup.html#backup-file-urls):

    {% include copy-clipboard.html %}
    ~~~ sql
    > BACKUP DATABASE example_database TO 'gs://bucket_name/path_to_backup?AUTH=specified';
    ~~~

    {{site.data.alerts.callout_danger}}
    If you are backing up the data to AWS or GCP, use the `specified` option for the `AUTH` parameter.
    {{site.data.alerts.end}}

1. To [restore](../v20.2/restore.html) to your CockroachCloud cluster:

    {% include copy-clipboard.html %}
    ~~~ sql
    > RESTORE DATABASE example_database FROM 'gs://bucket_name/path_to_backup?AUTH=specified';
    ~~~

## Troubleshooting

### Resolve a database naming conflict

The databases you want to restore cannot have the same name as an existing database in the target cluster. Before you restore a database, verify that the database name is not already in use. To do this, connect to the target cluster with the [CockroachDB SQL client](connect-to-your-cluster.html#step-4-connect-to-your-cluster) and run the following:

{% include copy-clipboard.html %}
~~~ sql
> SHOW DATABASES;
~~~

If the database's name is already in use, either [drop the existing database](../v20.2/drop-database.html):

{% include copy-clipboard.html %}
~~~ sql
> DROP DATABASE example_database;
~~~

Or [change the existing database's name](../v20.2/rename-database.html):

{% include copy-clipboard.html %}
~~~ sql
> ALTER DATABASE example_database RENAME TO archived_example_database;
~~~

### Resolve a table naming conflict

The table you want to restore cannot have the same name as an existing table in the target database. Before you restore a table, verify that the table name is not already in use. To do this, connect to the target cluster with the [CockroachDB SQL client](connect-to-your-cluster.html#step-4-connect-to-your-cluster) and run the following:

{% include copy-clipboard.html %}
~~~ sql
> SHOW TABLES FROM database_name;
~~~   

If the table's name is already in use, either [drop the existing table](../v20.2/drop-table.html):

{% include copy-clipboard.html %}
~~~ sql
> DROP TABLE target_database.example_table;
~~~

Or [change the existing table's name](../v20.2/rename-table.html):

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE target_database.example_table RENAME TO target_database.archived_example_table;
~~~
