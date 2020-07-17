---
title: Restore Data from a Backup
summary: Restore a table or database from a backup in CockroachCloud.
toc: true
build_for: [cockroachcloud]
---

This page describes the **Backups** page and how to restore your data.

Cockroach Labs runs [full backups](backup.html#full-backups) daily and [incremental backups](backup.html#incremental-backups) hourly for every CockroachCloud cluster. The full backups are retained for 30 days, while incremental backups are retained for 7 days.

{{site.data.alerts.callout_info}}
All databases are not backed up at the same time. Each database is backed up every hour based on the time of creation. For larger databases, you might see an hourly CPU spike while the database is being backed up.
{{site.data.alerts.end}}

The backups that Cockroach Labs takes for you can be viewed on the [Backups page](#backups-page), where you can:

- [Restore a cluster](#restore-a-cluster)
- [Restore a database](#restore-a-cluster)
- [Restore a table](#restore-a-cluster)

You can also:

- [Back up and restore from a self-hosted CockroachDB cluster](#back-up-and-restore-from-a-self-hosted-cockroachdb-cluster)
- [Back up and restore data manually](#back-up-and-restore-data-manually)

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

<!-- - Additional **Recovery Info**. -->

You can [restore these clusters](#restore-a-cluster).

<!--To view additional details or [to restore a cluster](#restore-a-cluster), click **View** in the **Recovery Info** column. -->

### Databases

To view the databases included in the backup, click the number in the **Databases** column on the cluster view of the **Backups** page.

For each database in the backup, the following details display:

- The **Name** of the database
- The **Size** of the database
- The number of [**Tables**](#tables) in the database

    To view the tables in the database, click the number in the [**Tables**](#tables) column.
<!--
- Additional **Recovery Info** -->

{{site.data.alerts.callout_info}}
If a database does not contain tables, it will not display in the databases view.
{{site.data.alerts.end}}

You can [restore these databases](#restore-a-database).
<!--
To view additional details or [to restore a database](#restore-a-database), click **View** in the **Recovery Info** column. -->

### Tables

To view the tables in a database, click the number in the **Tables** column on the [**Databases**](#databases) page.

For each table in the database, the following details display:

- The **Name** of the table
- The **Size** of the table
- The number of **Rows** in the table
<!-- - Additional **Recovery Info** -->

You can [restore these tables](#restore-a-table).
<!--
To view additional details or [to restore a table](#restore-a-table), click **View** in the **Recovery Info** column. -->

## Restore a cluster

To restore a cluster:

1. Using your cluster's **Backup** page, note the backup you want to use (**Data From**).

1. [Contact Support](https://support.cockroachlabs.com/hc/en-us) for the path to the backup.

1. [Restore each database](#restore-a-database).

1. [Configure replication zones](configure-replication-zones.html).

1. If you are restoring to a new cluster, configure the [cluster settings](cluster-settings.html).

1. If you are restoring to a new cluster, [create users and roles](create-role.html), and [grant privileges](grant.html).

1. If applicable, [add comments](comment-on.html) to databases and tables.

<!--
1. Click **View** for the cluster backup you want to restore.

    The **Recovery information** module displays.

1. Verify that you have enough space to restore the backup file.

    For daily backups, you need at least the space listed in the **Size** field above. For hourly backups, you need the **Size** plus the **Daily backup size**.

1. Verify that the target cluster does not have any user-created databases or tables. If you do not have a fresh cluster, `CREATE` a new one.

1. Copy the populated `RESTORE` statement.

1. In your command line interface, run the `RESTORE` statement. -->

## Restore a database

To restore a database:

<!-- 1. Find the cluster backup containing the database you want to restore, and click the number in the corresponding **Databases** column.

    The Databases view displays.

1. Click **View** for the database you want to restore.

    The **Recovery information** module displays. -->

1. Using your cluster's **Backup** page, note the backup you want to use (**Data From**).

1. [Contact Support](https://support.cockroachlabs.com/hc/en-us) for the path to the backup.

1. Verify that the name of the database you want to restore is not already in use in the target cluster:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SHOW DATABASES;
    ~~~

1. If the database's name is already in use, either:

    [Drop the existing database](drop-database.html):

    {% include copy-clipboard.html %}
    ~~~ sql
    > DROP DATABASE example_database;
    ~~~

    Or [change the existing database's name](rename-database.html):

    {% include copy-clipboard.html %}
    ~~~ sql
    > ALTER DATABASE example_database RENAME TO archived_example_database;
    ~~~

1. [Restore](restore.html) the database to the target cluster:

    {% include copy-clipboard.html %}
    ~~~ sql
    > RESTORE DATABASE example_database FROM 'path_to_backup';
    ~~~

## Restore a table

To restore a table:

<!-- 1.  Find the cluster backup containing the table you want to restore, and click the number in the corresponding **Databases** column.

    The Databases view displays.

1. Find the database containing the table you want to restore, and click the number in the corresponding **Tables** column.

    The Tables view displays.

1. Click **View** for the table you want to restore.

    The **Recovery information** module displays. -->

1. Using your cluster's **Backup** page, note the backup you want to use (**Data From**).

1. [Contact Support](https://support.cockroachlabs.com/hc/en-us) for the path to the backup.

1. Verify that the name of the table you want to restore is not already in use in the target database:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SHOW TABLES FROM example_database;
    ~~~

1. If the table's name is already in use, either:

    [Drop the existing database](drop-table.html):

    {% include copy-clipboard.html %}
    ~~~ sql
    > DROP TABLE example_table;
    ~~~

    Or [change the existing table's name](rename-table.html):

    {% include copy-clipboard.html %}
    ~~~ sql
    > ALTER TABLE example_database.example_table RENAME TO example_database.archived_example_table;
    ~~~

    You can also restore to a different database by changing the target database name:

    ~~~ sql
    > RESTORE TABLE new_target_database.example_table FROM 'path_to_backup';
    ~~~

1. [Restore](restore.html) the table to the target cluster:

    {% include copy-clipboard.html %}
    ~~~ sql
    > RESTORE TABLE example_database.example_table FROM 'path_to_backup';
    ~~~

## Back up and restore from a self-hosted CockroachDB cluster

To back up and restore from a self-hosted CockroachDB cluster:

1. While [connected to your self-hosted CockroachDB cluster](connect-to-the-database.html), [back up](backup.html) your databases and/or tables to an [external location](backup.html#backup-file-urls):

    {% include copy-clipboard.html %}
    ~~~ sql
    > BACKUP DATABASE example_database TO 'gs://bucket_name/path_to_backup?AUTH=specified';
    ~~~

    {{site.data.alerts.callout_danger}}
    If you are backing up the data to AWS or GCP, use the `specified` option for the `AUTH` parameter.
    {{site.data.alerts.end}}

1. [Connect to your CockroachCloud cluster](cockroachcloud-connect-to-your-cluster.html):

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --url='postgres://<username>:<password>@<global host>:26257/<database>?sslmode=verify-full&sslrootcert=<path to the CA certificate>'
    ~~~

1. [Restore](restore.html) to your CockroachCloud cluster:

    {% include copy-clipboard.html %}
    ~~~ sql
    > RESTORE DATABASE example_database FROM 'gs://bucket_name/path_to_backup?AUTH=specified';
    ~~~

## Back up and restore data manually

Additionally, you can [back up and restore](backup-and-restore.html) your Cockroach Cloud data manually:

1. [Connect to your CockroachCloud cluster](cockroachcloud-connect-to-your-cluster.html):

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --url='postgres://<username>:<password>@<global host>:26257/<database>?sslmode=verify-full&sslrootcert=<path to the CA certificate>'
    ~~~

1. [Back up](backup.html) your databases and/or tables to an [external location](backup.html#backup-file-urls):

    {% include copy-clipboard.html %}
    ~~~ sql
    > BACKUP DATABASE example_database TO 'gs://bucket_name/path_to_backup?AUTH=specified';
    ~~~

    {{site.data.alerts.callout_danger}}
    If you are backing up the data to AWS or GCP, use the `specified` option for the `AUTH` parameter.
    {{site.data.alerts.end}}

1. To [restore](restore.html) to your CockroachCloud cluster:

    {% include copy-clipboard.html %}
    ~~~ sql
    > RESTORE DATABASE example_database FROM 'gs://bucket_name/path_to_backup?AUTH=specified';
    ~~~
