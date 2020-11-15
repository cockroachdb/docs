---
title: Restore Data from a Backup
summary: Restore a table or database from a backup in CockroachCloud.
toc: true
redirect_from:
- ../stable/cockroachcloud-backups-page.html
---

This page describes the **Backups** page and how to restore your data.

Cockroach Labs runs [full backups](../v20.1/backup.html#full-backups) daily and [incremental backups](../v20.1/backup.html#incremental-backups) hourly for every CockroachCloud cluster. The full backups are retained for 30 days, while incremental backups are retained for 7 days.

The backups that Cockroach Labs runs for you can be viewed on the [Backups page](#backups-page).

{{site.data.alerts.callout_info}}
Currently, you cannot access the backups that Cockroach Labs runs to restore your data. In the future, you will be able to restore databases and tables from the CockroachCloud Console.

In the meantime, you can [back up and restore data manually](#back-up-and-restore-data-manually) or [back up from a self-hosted CockroachDB cluster and restore into a CockroachCloud cluster](#back-up-a-self-hosted-cockroachdb-cluster-and-restore-into-a-cockroachcloud-cluster). If you require further assistance, please [contact Support](https://support.cockroachlabs.com/hc/en-us).
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
    If the **Size** listed for a database in an incremental backup is **0.00 B**, it means no changes were made in the database since the last full backup.
    {{site.data.alerts.end}}

- The number of [**Tables**](#tables) in the database

    To view the tables in the database, click the number in the [**Tables**](#tables) column.

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

## Back up a self-hosted CockroachDB cluster and restore into a CockroachCloud cluster

To back up a self-hosted CockroachDB cluster into a CockroachCloud cluster:

1. While [connected to your self-hosted CockroachDB cluster](../v20.1/connect-to-the-database.html), [back up](../v20.1/backup.html) your databases and/or tables to an [external location](../v20.1/backup.html#backup-file-urls):

    {% include copy-clipboard.html %}
    ~~~ sql
    > BACKUP DATABASE example_database TO 'gs://bucket_name/path_to_backup?AUTH=specified';
    ~~~

    {{site.data.alerts.callout_danger}}
    If you are backing up the data to AWS or GCP, use the `specified` option for the `AUTH` parameter.
    {{site.data.alerts.end}}

1. [Connect to your CockroachCloud cluster](connect-to-your-cluster.html):

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --url='postgres://<username>:<password>@<global host>:26257/<database>?sslmode=verify-full&sslrootcert=<path to the CA certificate>'
    ~~~

1. [Restore](../v20.1/restore.html) to your CockroachCloud cluster:

    {% include copy-clipboard.html %}
    ~~~ sql
    > RESTORE DATABASE example_database FROM 'gs://bucket_name/path_to_backup?AUTH=specified';
    ~~~

## Back up and restore data manually

Additionally, you can [back up and restore](../v20.1/backup-and-restore.html) your Cockroach Cloud data manually:

1. [Connect to your CockroachCloud cluster](connect-to-your-cluster.html):

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --url='postgres://<username>:<password>@<global host>:26257/<database>?sslmode=verify-full&sslrootcert=<path to the CA certificate>'
    ~~~

1. [Back up](../v20.1/backup.html) your databases and/or tables to an [external location](../v20.1/backup.html#backup-file-urls):

    {% include copy-clipboard.html %}
    ~~~ sql
    > BACKUP DATABASE example_database TO 'gs://bucket_name/path_to_backup?AUTH=specified';
    ~~~

    {{site.data.alerts.callout_danger}}
    If you are backing up the data to AWS or GCP, use the `specified` option for the `AUTH` parameter.
    {{site.data.alerts.end}}

1. To [restore](../v20.1/restore.html) to your CockroachCloud cluster:

    {% include copy-clipboard.html %}
    ~~~ sql
    > RESTORE DATABASE example_database FROM 'gs://bucket_name/path_to_backup?AUTH=specified';
    ~~~
