---
title: Backup Validation
summary: Learn how to validate CockroachDB backups
toc: true
docs_area: manage
---

{% include_cached new-in.html version="v22.2" %} CockroachDB provides backup validation tools to ensure that backups you have in storage are restorable. You can use the following option patterns with [`SHOW BACKUP`](show-backup.html) and [`RESTORE`](restore.html) to validate a [cluster](backup.html#backup-a-cluster), [database](backup.html#backup-a-database), or [table](backup.html#backup-a-table-or-view) backup. The three options result in increasing levels of backup validation:

1. `SHOW BACKUP ... WITH check_files`: Check that all files belonging to a backup are in the expected location in storage. See [Validate backup files](#validate-backup-files) for an example.
1. `RESTORE ... WITH schema_only`: Restore a backup to verify that it is valid without restoring any user table data. See [Validate the restore of a backup](#validate-the-restore-of-a-backup) for an example.
1. `RESTORE ... WITH schema_only, verify_backup_table_data`: Run a `schema_only` restore **and** have the restore read all user data from external storage, verify checksums, and discard the data before writing it to disk. To use `verify_backup_table_data`, you must include `schema_only` in the statement. See [Validate the restore of backup table data](#validate-the-restore-of-backup-table-data) for an example.

The options that give the most validation coverage will increase the runtime of the check. That is, `verify_backup_table_data` will take a longer time to validate a backup compared to `check_files` or `schema_only` alone. Despite that, each of these validation options provide a quicker way to validate a backup over running a "regular" restore.

## Validate backup files 

Using `SHOW BACKUP` with the `check_files` option, you can check that all [SST and metadata files](backup-architecture.html) that belong to a backup are present in the storage location.

First, take a backup that we'll use for each of the examples on this page:

{% include_cached copy-clipboard.html %}
~~~sql
BACKUP DATABASE movr INTO "s3://bucket?AWS_ACCESS_KEY_ID={Access Key ID}&AWS_SECRET_ACCESS_KEY={Secret Access Key}" AS OF SYSTEM TIME "-10s";
~~~

To find a specific backup to validate in the storage location, first show the stored backups in the storage location:

{% include_cached copy-clipboard.html %}
~~~sql
SHOW BACKUPS IN "s3://bucket?AWS_ACCESS_KEY_ID={Access Key ID}&AWS_SECRET_ACCESS_KEY={Secret Access Key}"; 
~~~
~~~
          path
------------------------
  2022/09/19-134123.64
  2022/09/19-134559.68
(2 rows)
~~~

{% include {{ page.version.version }}/backups/check-files-validate.md %}

## Validate the restore of a backup

To validate that a backup is restorable, you can run `RESTORE` with the `schema_only` option, which will complete a restore **without** restoring any user table data. This process is significantly faster than running a [regular restore](restore.html#examples) for the purposes of validation. 

`schema_only` restores produce close to complete validation coverage on backups. However, this restore type does not read or write from any of the SST files, which store the backed-up user table data. You can use `SHOW BACKUP ... WITH check_files` in addition to a `schema_only` restore to check that these files are present for a restore operation. Or, you can use `schema_only` in combination with `verify_backup_table_data`. See [Validate the restore of backup user data](#validate-the-restore-of-backup-table-data).

Run `RESTORE` with either `LATEST` or the specific backup you would like to restore:

{% include_cached copy-clipboard.html %}
~~~sql
RESTORE DATABASE movr FROM "2022/09/19-134123.64" IN "s3://bucket?AWS_ACCESS_KEY_ID={Access Key ID}&AWS_SECRET_ACCESS_KEY={Secret Access Key}" WITH schema_only;
~~~
~~~
        job_id       |  status   | fraction_completed | rows | index_entries | bytes
---------------------+-----------+--------------------+------+---------------+--------
  797982663104856065 | succeeded |                  1 |    0 |             0 |     0
(1 row)
~~~

To verify that the table schemas are in place, check the tables:

{% include_cached copy-clipboard.html %}
~~~sql
SHOW TABLES FROM movr;
~~~
~~~
  schema_name |         table_name         | type  | owner | estimated_row_count | locality
--------------+----------------------------+-------+-------+---------------------+-----------
  public      | promo_codes                | table | root  |                   0 | NULL
  public      | rides                      | table | root  |                   0 | NULL
  public      | user_promo_codes           | table | root  |                   0 | NULL
  public      | users                      | table | root  |                   0 | NULL
  public      | vehicle_location_histories | table | root  |                   0 | NULL
  public      | vehicles                   | table | root  |                   0 | NULL
(6 rows)
~~~

You'll find the tables in place with no user table data.

{% include_cached copy-clipboard.html %}
~~~sql
SELECT * FROM rides;
~~~
~~~
  id | city | vehicle_city | rider_id | vehicle_id | start_address | end_address | start_time | end_time | revenue
-----+------+--------------+----------+------------+---------------+-------------+------------+----------+----------
(0 rows)
~~~

Once you have successfully validated the restore, you can revert the cluster to its pre-restore state by dropping the table or database:

{% include_cached copy-clipboard.html %}
~~~sql
DROP DATABASE movr CASCADE;
~~~

### Cluster-level backup validation

It is important to note that [full cluster restores](restore.html#full-cluster) with `schema_only` will write the system tables to disk. This provides important coverage for validation at the cluster level. Writing the system tables should not have a notable impact on the runtime of this process.

Once you have successfully validated a cluster-level restore, the restore system data cannot be reverted. However, you can drop the databases and tables as per the previous command.

## Validate the restore of backup table data

A restore with the `verify_backup_table_data` option will perform a `schema_only` restore and the following:

1. Read all user data from the storage location. 
1. Checksum the user data to ensure it is not corrupt.
1. Discard the user data before it is written to disk.

In comparison to `schema_only` restores, `verify_backup_table_data` also validates the backup by reading and checksumming the user data.

It is necessary to include `schema_only` when you run a restore with `verify_backup_table_data`:

{% include_cached copy-clipboard.html %}
~~~sql
RESTORE DATABASE movr FROM LATEST IN "s3://bucket?AWS_ACCESS_KEY_ID={Access Key ID}&AWS_SECRET_ACCESS_KEY={Secret Access Key}" WITH schema_only, verify_backup_table_data;
~~~

Similarly, to just `schema_only` restores, you'll find the table schemas restored. You'll also receive estimated row counts as the restore reads the files during the process: 

~~~
  schema_name |         table_name         | type  | owner | estimated_row_count | locality
--------------+----------------------------+-------+-------+---------------------+-----------
  public      | promo_codes                | table | root  |                1000 | NULL
  public      | rides                      | table | root  |                 500 | NULL
  public      | user_promo_codes           | table | root  |                   5 | NULL
  public      | users                      | table | root  |                  50 | NULL
  public      | vehicle_location_histories | table | root  |                1000 | NULL
  public      | vehicles                   | table | root  |                  15 | NULL
(6 rows)
~~~

If a file is not present or unreadable in the backup, you'll receive an error. 

## See also

- [`RESTORE`](restore.html)
- [`BACKUP`](backup.html)
- [`SHOW BACKUP`](show-backup.html)
- [Use Cloud Storage for Bulk Operations](use-cloud-storage-for-bulk-operations.html)