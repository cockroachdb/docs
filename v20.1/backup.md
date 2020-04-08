---
title: BACKUP
summary: Back up your CockroachDB cluster to a cloud storage services such as AWS S3, Google Cloud Storage, or other NFS.
toc: true
---

{{site.data.alerts.callout_info}}
`BACKUP` is an [enterprise-only](https://www.cockroachlabs.com/product/cockroachdb/) feature. For non-enterprise backups, see [`cockroach dump`](cockroach-dump.html).
{{site.data.alerts.end}}

CockroachDB's `BACKUP` [statement](sql-statements.html) allows you to create full or incremental backups of your cluster's schema and data that are consistent as of a given timestamp. Backups can be with or without [revision history](#backups-with-revision-history).

Because CockroachDB is designed with high fault tolerance, these backups are designed primarily for disaster recovery (i.e., if your cluster loses a majority of its nodes) through [`RESTORE`](restore.html). Isolated issues (such as small-scale node outages) do not require any intervention.

{{site.data.alerts.callout_info}}
To view the contents of an enterprise backup created with the `BACKUP` statement, use [`SHOW BACKUP`](show-backup.html).
{{site.data.alerts.end}}

## Functional details

### Backup targets

<span class="version-tag">New in v20.1:</span> You can backup a full cluster, which includes:

- All user tables
- Relevant system tables
- All [databases](create-database.html)
- All [tables](create-table.html) (which automatically includes their [indexes](indexes.html))
- All [views](views.html)

You can also back up individual tables (which automatically includes their indexes) or [views](views.html). Backing up an individual database will back up all of its tables and views.

{{site.data.alerts.callout_info}}
`BACKUP` only offers table-level granularity; it _does not_ support backing up subsets of a table.
{{site.data.alerts.end}}

### Object dependencies

Dependent objects must be backed up at the same time as the objects they depend on.

Object | Depends On
-------|-----------
Table with [foreign key](foreign-key.html) constraints | The table it `REFERENCES`; however, this dependency can be [removed during the restore](restore.html#skip_missing_foreign_keys).
Table with a [sequence](create-sequence.html) | The sequence it uses; however, this dependency can be [removed during the restore](restore.html#skip_missing_sequences).
[Views](views.html) | The tables used in the view's `SELECT` statement.
[Interleaved tables](interleave-in-parent.html) | The parent table in the [interleaved hierarchy](interleave-in-parent.html#interleaved-hierarchy).

### Users and privileges

The `system.users` table stores your users and their passwords. To restore your users and privilege [grants](grant.html), do a full cluster backup and restore the cluster to a fresh cluster with no user data. You can also backup the `system.users` table, and then use [this procedure](restore.html#restoring-users-from-system-users-backup).

### Backup types

CockroachDB offers two types of backups: [full](#full-backups) and [incremental](#incremental-backups).

#### Full backups

Full backups contain an unreplicated copy of your data and can always be used to restore your cluster. These files are roughly the size of your data and require greater resources to produce than incremental backups. You can take full backups as of a given timestamp and (optionally) include the available [revision history](backup.html#backups-with-revision-history).

#### Incremental backups

Incremental backups are smaller and faster to produce than full backups because they contain only the data that has changed since a base set of backups you specify (which must include one full backup, and can include many incremental backups). You can take incremental backups either as of a given timestamp or with full [revision history](#backups-with-revision-history).

{{site.data.alerts.callout_danger}}
Incremental backups can only be created within the garbage collection period of the base backup's most recent timestamp. This is because incremental backups are created by finding which data has been created or modified since the most recent timestamp in the base backup––that timestamp data, though, is deleted by the garbage collection process.

You can configure garbage collection periods using the `ttlseconds` [replication zone setting](configure-replication-zones.html).
{{site.data.alerts.end}}

For an example of an incremental backup, see the [Create incremental backups](#create-incremental-backups) section.

### Backups with revision history

You can create full or incremental backups [with revision history](#with-revision-history):

- Taking full backups with revision history allows you to back up every change made within the garbage collection period leading up to and including the given timestamp.
- Taking incremental backups with revision history allows you to back up every change made since the last backup and within the garbage collection period leading up to and including the given timestamp. You can take incremental backups with revision history even when your previous full or incremental backups were taken without revision history.

You can configure garbage collection periods using the `ttlseconds` [replication zone setting](configure-replication-zones.html). Taking backups with revision history allows for point-in-time restores within the revision history.

### Encrypted backups

{% include {{ page.version.version }}/backups/encrypted-backup-description.md %}

## Performance

The `BACKUP` process minimizes its impact to the cluster's performance by distributing work to all nodes. Each node backs up only a specific subset of the data it stores (those for which it serves writes; more details about this architectural concept forthcoming), with no two nodes backing up the same data.

For best performance, we also recommend always starting backups with a specific [timestamp](timestamp.html) at least 10 seconds in the past. For example:

~~~ sql
> BACKUP...AS OF SYSTEM TIME '-10s';
~~~

This improves performance by decreasing the likelihood that the `BACKUP` will be [retried because it contends with other statements/transactions](transactions.html#transaction-retries). However, because `AS OF SYSTEM TIME` returns historical data, your reads might be stale.

## Automating backups

We recommend automating daily backups of your cluster.

To automate backups, you must have a client send the `BACKUP` statement to the cluster.

Once the backup is complete, your client will receive a `BACKUP` response.

## Viewing and controlling backups jobs

After CockroachDB successfully initiates a backup, it registers the backup as a job, and you can do the following:

- View the backup status with [`SHOW JOBS`](show-jobs.html)
- Pause the backup with [`PAUSE JOB`](pause-job.html)
- Resume the backup with [`RESUME JOB`](resume-job.html)
- Cancel the backup [`CANCEL JOB`](cancel-job.html)

The `BACKUP` statement will return when the backup is finished or if it encounters an error.

{{site.data.alerts.callout_info}}
The presence of a `BACKUP-CHECKPOINT` file in the backup destination usually means the backup is not complete. This file is created when a backup is initiated, and is replaced with a `BACKUP` file once the backup is finished.
{{site.data.alerts.end}}

## Synopsis

<div>
{% include {{ page.version.version }}/sql/diagrams/backup.html %}
</div>

## Parameters

 Parameter | Description
------------|-------------
`table_pattern` | The table(s) or [view(s)](views.html) you want to back up.
`database_name` | The name of the database(s) you want to back up (i.e., create backups of all tables and views in the database).|
`destination` | The URL where you want to store the backup.<br/><br/>For information about this URL structure, see [Backup File URLs](#backup-file-urls).
`timestamp` | Back up data as it existed as of [`timestamp`](as-of-system-time.html). The `timestamp` must be more recent than your cluster's last garbage collection (which defaults to occur every 25 hours, but is [configurable per table](configure-replication-zones.html#replication-zone-variables)).
`full_backup_location` | Create an incremental backup using the full backup stored at the URL `full_backup_location` as its base. For information about this URL structure, see [Backup File URLs](#backup-file-urls).<br><br>**Note:** It is not possible to create an incremental backup if one or more tables were [created](create-table.html), [dropped](drop-table.html), or [truncated](truncate.html) after the full backup. In this case, you must create a new [full backup](#full-backups).
`incremental_backup_location` | Create an incremental backup that includes all backups listed at the provided URLs. <br/><br/>Lists of incremental backups must be sorted from oldest to newest. The newest incremental backup's timestamp must be within the table's garbage collection period. <br/><br/>For information about this URL structure, see [Backup File URLs](#backup-file-urls). <br/><br/>For more information about garbage collection, see [Configure Replication Zones](configure-replication-zones.html#replication-zone-variables).
`kv_option_list` | Control the backup behavior with [these options](#options).

{{site.data.alerts.callout_info}}
The `BACKUP` statement cannot be used within a [transaction](transactions.html).
{{site.data.alerts.end}}

## Options

 Option                                                          | Value                   | Description
-----------------------------------------------------------------+-------------------------+------------------------------
`revision_history`<a name="with-revision-history"></a>           | N/A                     | Create a backup with full [revision history](#backups-with-revision-history), which records every change made to the cluster within the garbage collection period leading up to and including the given timestamp.
`encryption_passphrase`<a name="with-encryption-passphrase"></a> | [`STRING`](string.html) | <span class="version-tag">New in v20.1:</span> The passphrase used to encrypt the files (`BACKUP` manifest and data files) that the `BACKUP` statement generates. This same passphrase is needed to decrypt the file when it is used to [restore](restore.html).

## Required privileges

Only members of the `admin` role can run `BACKUP`. By default, the `root` user belongs to the `admin` role.

### Backup file URLs

We will use the URL provided to construct a secure API call to the service you specify. The path to each backup must be unique, and the URL for your backup's destination/locations must use the following format:

{% include {{ page.version.version }}/misc/external-urls.md %}

## Examples

Per our guidance in the [Performance](#performance) section, we recommend starting backups from a time at least 10 seconds in the past using [`AS OF SYSTEM TIME`](as-of-system-time.html).

### Backup a cluster

<span class="version-tag">New in v20.1:</span> To backup a full cluster:

{% include copy-clipboard.html %}
~~~ sql
> BACKUP TO \
'gs://acme-co-backup/test-cluster' \
AS OF SYSTEM TIME '-10s';
~~~

### Backup a single table or view

{% include copy-clipboard.html %}
~~~ sql
> BACKUP bank.customers \
TO 'gs://acme-co-backup/bank-customers-2017-03-27-weekly' \
AS OF SYSTEM TIME '-10s';
~~~

### Backup multiple tables

{% include copy-clipboard.html %}
~~~ sql
> BACKUP bank.customers, bank.accounts \
TO 'gs://acme-co-backup/database-bank-2017-03-27-weekly' \
AS OF SYSTEM TIME '-10s';
~~~

### Backup an entire database

{% include copy-clipboard.html %}
~~~ sql
> BACKUP DATABASE bank \
TO 'gs://acme-co-backup/database-bank-2017-03-27-weekly' \
AS OF SYSTEM TIME '-10s';
~~~

### Backup with revision history

{% include copy-clipboard.html %}
~~~ sql
> BACKUP TO \
'gs://acme-co-backup/test-cluster-2017-03-27-weekly' \
AS OF SYSTEM TIME '-10s' WITH revision_history;
~~~

### Create incremental backups

<span class="version-tag">New in v20.1:</span> If you backup to a destination already containing a backup, an incremental backup will be produced in a subdirectory with a date-based name (e.g., `destination/day/time_1`, `destination/day/time_2`):

{% include copy-clipboard.html %}
~~~ sql
> BACKUP TO \
'gs://acme-co-backup/test-cluster' \
AS OF SYSTEM TIME '-10s' WITH revision_history;
~~~

To explicitly control where your incremental backups go, use the `INCREMENTAL FROM` syntax:

{% include copy-clipboard.html %}
~~~ sql
> BACKUP DATABASE bank \
TO 'gs://acme-co-backup/db/bank/2017-03-29-nightly' \
AS OF SYSTEM TIME '-10s' \
INCREMENTAL FROM 'gs://acme-co-backup/database-bank-2017-03-27-weekly', 'gs://acme-co-backup/database-bank-2017-03-28-nightly' WITH revision_history;
~~~

The examples above show incremental backups [with revision history](#with-revision-history).

### Create locality-aware backups

You can create locality-aware backups such that each node writes files only to the backup destination that matches the [node locality](configure-replication-zones.html#descriptive-attributes-assigned-to-nodes) configured at [node startup](cockroach-start.html).

A locality-aware backup is specified by a list of URIs, each of which has a `COCKROACH_LOCALITY` URL parameter whose single value is either `default` or a single locality key-value pair such as `region=us-east`. At least one `COCKROACH_LOCALITY` must be the `default`.

Backup file placement is determined by leaseholder placement, as each node is responsible for backing up the ranges for which it is the leaseholder.  Nodes write files to the backup storage location whose locality matches their own node localities, with a preference for more specific values in the locality hierarchy.  If there is no match, the `default` locality is used.

{{site.data.alerts.callout_info}}
Note that the locality query string parameters must be [URL-encoded](https://en.wikipedia.org/wiki/Percent-encoding) as [shown below](#example-create-a-locality-aware-backup).
{{site.data.alerts.end}}

#### Example - Create a locality-aware backup

For example, to create a locality-aware backup where nodes with the locality `region=us-west` write backup files to `s3://us-west-bucket`, and all other nodes write to `s3://us-east-bucket` by default, run:

{% include copy-clipboard.html %}
~~~ sql
BACKUP DATABASE bank TO ('s3://us-east-bucket?COCKROACH_LOCALITY=default', 's3://us-west-bucket?COCKROACH_LOCALITY=region%3Dus-west');
~~~

The backup created above can be restored by running:

{% include copy-clipboard.html %}
~~~ sql
RESTORE FROM ('s3://us-east-bucket', 's3://us-west-bucket');
~~~

#### Example - Create an incremental locality-aware backup

To make an incremental locality-aware backup from a full locality-aware backup, the syntax is just like for [regular incremental backups](#create-incremental-backups):

{% include copy-clipboard.html %}
~~~ sql
> BACKUP TO \
'gs://acme-co-backup/test-cluster' \
AS OF SYSTEM TIME '-10s' WITH revision_history;
~~~

And if you want to explicitly control where your incremental backups go, use the `INCREMENTAL FROM` syntax:

{% include copy-clipboard.html %}
~~~ sql
BACKUP TO (${uri_1}, ${uri_2}, ...) INCREMENTAL FROM ${full_backup_uri} ...;
~~~

For example, to create an incremental locality-aware backup from a previous full locality-aware backup where nodes with the locality `region=us-west` write backup files to `s3://us-west-bucket`, and all other nodes write to `s3://us-east-bucket` by default, run:

{% include copy-clipboard.html %}
~~~ sql
> BACKUP TO \
('s3://us-east-bucket/test-cluster-2019-10-08-nightly?COCKROACH_LOCALITY=default', 's3://us-west-bucket/test-cluster-2019-10-08-nightly?COCKROACH_LOCALITY=region%3Dus-west')
INCREMENTAL FROM 's3://us-east-bucket/test-cluster-2019-10-07-weekly';
~~~

{{site.data.alerts.callout_info}}
Note that only the backup URIs you set as the `default` when you created the previous backup(s) are needed in the `INCREMENTAL FROM` clause of your incremental `BACKUP` statement (as shown in the example). This is because the `default` destination for a locality-aware backup contains a manifest file that contains all the metadata required to create additional incremental backups based on it.
{{site.data.alerts.end}}

#### Example - Create an incremental locality-aware backup from a previous locality-aware backup

To make an incremental locality-aware backup from another locality-aware backup, the syntax is as follows:

{% include copy-clipboard.html %}
~~~ sql
BACKUP TO ({uri_1}, {uri_2}, ...) INCREMENTAL FROM {full_backup}, {incr_backup_1}, {incr_backup_2}, ...;
~~~

For example, let's say you normally run a full backup every Monday, followed by incremental backups on the remaining days of the week.

By default, all nodes send their backups to your `s3://us-east-bucket`, except for nodes in `region=us-west`, which will send their backups to `s3://us-west-bucket`.

If today is Thursday, October 10th, 2019, your `BACKUP` statement will list the following backup URIs:

- The full locality-aware backup URI from Monday, e.g.,
  - `s3://us-east-bucket/test-cluster-2019-10-07-weekly`
- The incremental backup URIs from Tuesday and Wednesday, e.g.,
  - `s3://us-east-bucket/test-cluster-2019-10-08-nightly`
  - `s3://us-east-bucket/test-cluster-2019-10-09-nightly`

Given the above, to take the incremental locality-aware backup scheduled for today (Thursday), you will run:

{% include copy-clipboard.html %}
~~~ sql
BACKUP TO
	('s3://us-east-bucket/test-cluster-2019-10-10-nightly?COCKROACH_LOCALITY=default', 's3://us-west-bucket/test-cluster-2019-10-10-nightly?COCKROACH_LOCALITY=region%3Dus-west')
INCREMENTAL FROM
	's3://us-east-bucket/test-cluster-2019-10-07-weekly',
	's3://us-east-bucket/test-cluster-2019-10-08-nightly',
	's3://us-east-bucket/test-cluster-2019-10-09-nightly';
~~~

{{site.data.alerts.callout_info}}
Note that only the backup URIs you set as the `default` when you created the previous backup(s) are needed in the `INCREMENTAL FROM` clause of your incremental `BACKUP` statement (as shown in the example). This is because the `default` destination for a locality-aware backup contains a manifest file that contains all the metadata required to create additional incremental backups based on it.
{{site.data.alerts.end}}

### Create an encrypted backup

<span class="version-tag">New in v20.1:</span> To create an [encrypted backup](#encrypted-backups), use the `encryption_passphrase` option:

{% include copy-clipboard.html %}
~~~ sql
> BACKUP TO \
'gs://acme-co-backup/test-cluster' \
WITH encryption_passphrase = 'password123';
~~~
~~~
        job_id       |  status   | fraction_completed | rows | index_entries | bytes
---------------------+-----------+--------------------+------+---------------+---------
  543214409874014209 | succeeded |                  1 | 2597 |          1028 | 467701
(1 row)
~~~

To [restore](restore.html), use the same `encryption_passphrase`:

{% include copy-clipboard.html %}
~~~ sql
> RESTORE FROM \
'gs://acme-co-backup/test-cluster' \
WITH encryption_passphrase = 'password123';
~~~
~~~
        job_id       |  status   | fraction_completed | rows | index_entries | bytes
---------------------+-----------+--------------------+------+---------------+---------
  543217488273801217 | succeeded |                  1 | 2597 |          1028 | 467701
(1 row)
~~~

## See also

- [`SHOW BACKUP`](show-backup.html)
- [`RESTORE`](restore.html)
- [Backup and Restore Data](backup-and-restore.html)
- [Configure Replication Zones](configure-replication-zones.html)
