---
title: RESTORE
summary: Restore your CockroachDB cluster to a cloud storage services such as AWS S3, Google Cloud Storage, or other NFS.
toc: false
---

{{site.data.alerts.callout_danger}}The <code>RESTORE</code> feature is only available to our <a href="https://www.cockroachlabs.com/pricing/">enterprise license</a> only users. For non-enterprise restores, see <a href="restore-data.html">Restore Data</a>.{{site.data.alerts.end}}

The `RESTORE` [statement](sql-statements.html) restores your cluster's schemas and data from [an enterprise license-generated backup](backup.html) stored on a services such as AWS S3, Google Cloud Storage, NFS, or HTTP storage.

Because CockroachDB is designed with high fault tolerance, restores are designed primarily for disaster recovery, i.e., restarting your cluster if it loses a majority of its nodes. Isolated issues (such as small-scale node outages) do not require any intervention.

<div id="toc"></div>

## Functional Details

### Restore Targets

You can restore entire tables (which automatically includes their indexes) or [views](views.html) from a backup. This process uses the data stored in the backup to create entirely new tables or views in the [target database](#target-database).

The notion of "restoring a database" simply restores all of the tables and views that belong to the database, but does not create the database. For more information, see [Target Database](#target-database).

{{site.data.alerts.callout_info}}<code>RESTORE</code> only offers table-level granularity; it <em>does not</em> support restoring subsets of a table.{{site.data.alerts.end}}

Because this process is designed for disaster recovery, CockroachDB expects that the tables do not currently exist in the [target database](#target-database). This means the target database must have not have tables or views with the same name as the restored table or view. If any of the restore target's names are being used, you can:

- [`DROP TABLE`](drop-table.html) or [`DROP VIEW`](drop-view.html) and then restore them.
- [Restore the table or view into a different database](#into_db).

### Object Dependencies

Dependent objects must be restored at the same time as the objects they depend on.

Object | Depends On
-------|-----------
Table with [foreign key](foreign-key.html) constraints | The table it `REFERENCES` (however, this dependency can be [removed during the restore](#skip_missing_foreign_keys))
[Views](views.html) | The tables used in the view's `SELECT` statement
[Interleaved tables](interleave-in-parent.html) | The parent table in the [interleaved hierarchy](interleave-in-parent.html#interleaved-hierarchy)

### Target Database

By default, tables and views are restored into a database with the name of the database from which they were backed up. However, also consider:

- You can choose to [change the target database](#into_db).
- If it no longer exists, you must [create the target database](create-database.html).

The target database must have not have tables or views with the same name as the tables or views you're restoring.

### Users and Privileges

Table and view users/privileges are not restored. Restored tables and views instead inherit the privileges of the database into which they're restored.

However, every backup includes `system.users`, so you can [restore users and their passwords](#restoring-users-from-system-users-backup).

Table-level privileges must be [granted to users](grant.html) after the restore is complete.

### Restore Types

You can either restore from a full backup or from a full backup with incremental backups, based on the backup files you include.

Restore Type | Parameters
----|----------
**Full backup** | Include only the path to the full backup.
**Full backup + <br/>incremental backups** | Include the path to the full backup as the first argument and the subsequent incremental backups from oldest to newest as the following arguments.

## Performance

The `RESTORE` process minimizes its impact to the cluster's performance by distributing work to all nodes. Subsets of the restored data (known as ranges) are evenly distributed among randomly selected nodes, with each range initially restored to only one node. Once the range is restored, the node begins replicating it others.

## Viewing and Controlling Restore Jobs

Whenever you initiate a restore, CockroachDB registers it as a job, which you can view with [`SHOW JOBS`](show-jobs.html).

After the restore has been initiated, you can control it with [`PAUSE JOB`](pause-job.html), [`RESUME JOB`](resume-job.html), and [`CANCEL JOB`](cancel-job.html).

{{site.data.alerts.callout_info}}Job-related statements require CockroachDB v1.1 or greater.{{site.data.alerts.end}}

## Synopsis

{% include sql/{{ page.version.version }}/diagrams/restore.html %}

## Required Privileges

Only the `root` user can run `RESTORE`.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `table_pattern` | The table or [view](views.html) you want to restore. |
| `full_backup_location` | The URL where the full backup is stored. <br/><br/>For information about this URL structure, see [Backup File URLs](#backup-file-urls). |
| `incremental_backup_location` | The URL where an incremental backup is stored.  <br/><br/>Lists of incremental backups must be sorted from oldest to newest. The newest incremental backup's timestamp must be within the table's garbage collection period.<br/><br/>For information about this URL structure, see [Backup File URLs](#backup-file-urls). <br/><br/>For more information about garbage collection, see [Configure Replication Zones](configure-replication-zones.html#replication-zone-format). |
| `kv_option_list` | Control your backup's behavior with [these options](#restore-option-list). |

### Backup File URLs

The URL for your backup's locations must use the following format:

~~~
[scheme]://[host]/[path to backup]?[parameters]
~~~

`[path to backup]` must be unique for each backup, but the other values depend on where you stored the backup.

| Backup Location | scheme | host | parameters |
|-----------------|--------|------|------------|
| Amazon S3 | `s3` | Bucket name | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` |
| Azure | `azure` | Container name | `AZURE_ACCOUNT_KEY`, `AZURE_ACCOUNT_NAME` |
| Google Cloud Storage | `gs` | Bucket name | None––currently only supports instance auth, but we can build non-instance auth at a customer's request |
| HTTP | `http` | Remote host | N/A |
| NFS | `nodelocal` | File system location | N/A |

{{site.data.alerts.callout_info}}Backups stored on NFSes work only if each node in the cluster accesses the drive in the same way.{{site.data.alerts.end}}

### Restore Option List

You can include the following options as key-value pairs in the `kv_option_list` to control the restore process's behavior.

#### `into_db`

- **Description**: If you want to restore a table or view into a database other than the one it originally existed in, you can [change the target database](#restore-into-a-different-database). This is useful if you want to restore a table that currently exists, but don't want to drop it.
- **Key**: `into_db`
- **Value**: The name of the database you want to use
- **Example**: `WITH OPTIONS ('into_db' = 'newdb')`

#### `skip_missing_foreign_keys`

- **Description**: If you want to restore a table with a foreign key but don't want to restore the table it references, you can [drop the Foreign Key constraint from the table](#skip_missing_foreign_keys) and then have it restored.
- **Key**: `skip_missing_foreign_keys`
- **Value**: *No value*
- **Example**: `WITH OPTIONS ('skip_missing_foreign_keys')`

## Examples

### Restore a Single Table

``` sql
> RESTORE bank.customers FROM 'azure://acme-co-backup/table-customer-2017-03-27-full?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co';
```

### Restore Multiple Tables

``` sql
> RESTORE bank.customers, accounts FROM 'azure://acme-co-backup/tables-accounts-customers-2017-03-27-full?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co';
```

### Restore All Tables and Views from a Database

``` sql
> RESTORE bank.* FROM 'azure://acme-co-backup/database-bank-2017-03-27-full?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co';
```

### Restore from Incremental Backups

``` sql
> RESTORE bank.customers FROM 'azure://acme-co-backup/database-bank-2017-03-27-full?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
, 'azure://acme-co-backup/database-bank-2017-03-28-incremental?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
, 'azure://acme-co-backup/database-bank-2017-03-29-incremental?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co';
```

### Restore into a Different Database

By default, tables and views are restored to the database they originally belonged to. However, using the [`into_db`](#into_db) option, you can control the target database.

~~~ sql
> RESTORE bank.customers FROM 'azure://acme-co-backup/table-customer-2017-03-27-full?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
WITH OPTIONS ('into_db' = 'newdb');
~~~

### Remove the Foreign Key Before Restore

By default, tables with [Foreign Key](foreign-key.html) constraints must be restored at the same time as the tables they reference. However, using the [`skip_missing_foreign_keys`](#skip_missing_foreign_keys) option you can remove the Foreign Key constraint from the table and then restore it.

~~~ sql
> RESTORE bank.accounts FROM 'azure://acme-co-backup/table-customer-2017-03-27-full?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
WITH OPTIONS ('skip_missing_foreign_keys');
~~~

### Restoring Users from `system.users` Backup

Every full backup contains the `system.users` table, which you can use to restore your cluster's usernames and their hashed passwords. However, to restore them, you must restore the `system.users` table into a new database because you cannot drop the existing `system.users` table.

After it's restored into a new database, you can write the restored `users` table data to the cluster's existing `system.users` table.

~~~ sql
> RESTORE system.users FROM 'azure://acme-co-backup/table-users-2017-03-27-full?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
WITH OPTIONS ('into_db' = 'newdb');

> INSERT INTO system.users SELECT * FROM newdb.users;

> DROP TABLE newdb.users;
~~~

## See Also

- [`BACKUP`](backup.html)
- [Configure Replication Zones](configure-replication-zones.html)
