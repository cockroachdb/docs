---
title: Backup Validation
summary: Ensure that your backups are restorable with backup validation.
toc: true
docs_area: manage
---

CockroachDB provides backup validation tools to check that backups you have in storage are restorable. Although a successful restore completely validates a backup, the validation tools offer a faster alternative and return an error message if a backup is not valid.

You can validate a backup of a [cluster]({% link {{ page.version.version }}/backup.md %}#back-up-a-cluster), [database]({% link {{ page.version.version }}/backup.md %}#back-up-a-database), or [table]({% link {{ page.version.version }}/backup.md %}#back-up-a-table-or-view) backup with one of the following [`SHOW BACKUP`]({% link {{ page.version.version }}/show-backup.md %}) or [`RESTORE`]({% link {{ page.version.version }}/restore.md %}) statements. The three options result in increasing levels of backup validation:

1. `SHOW BACKUP ... WITH check_files`: Check that all files belonging to a backup are in the expected location in storage. Refer to [Validate backup files](#validate-backup-files) for an example.
1. `RESTORE ... WITH schema_only`: Restore the schema from the backup to verify that it is valid without restoring any rows. Refer to [Validate a backup is restorable](#validate-a-backup-is-restorable) for an example.
1. `RESTORE ... WITH schema_only, verify_backup_table_data`: Run a `schema_only` restore **and** have the restore read all rows from external storage, verify checksums, and discard the rows before writing them to disk. To use `verify_backup_table_data`, you must include `schema_only` in the statement. Refer to [Validate backup table data is restorable](#validate-backup-table-data-is-restorable) for an example.

The options that give the most validation coverage will increase the runtime of the check. That is, `verify_backup_table_data` will take a longer time to validate a backup compared to `check_files` or `schema_only` alone. Despite that, each of these validation options provide a quicker way to validate a backup over running a "regular" restore.

{{site.data.alerts.callout_success}}
{% include {{ page.version.version }}/backups/external-storage-check-tip.md %}
{{site.data.alerts.end}}

## Recommendations

Cockroach Labs recommends implementing the following validation plan to test your backups:

1. Very frequent [`schema_only`](#validate-a-backup-is-restorable) restores: Checks your credentials, schema issues, and version compatibility.
1. Frequent [`verify_backup_table_data`](#validate-backup-table-data-is-restorable) restores: Tests that all data files are present and uncorrupted.
1. Somewhat frequent ["full"]({% link {{ page.version.version }}/restore.md %}) restores: Validates a backup completely.

A `schema_only` restore provides high confidence in the recoverability of your backup and a `verify_backup_table_data` restore provides a slightly higher confidence as it checks for corruptions. Only a complete `RESTORE` can provide full confidence in validating a backup. The actual frequency you should run backup validation tests depends on the criticality of your data, the rate of change in your database, and your organization's disaster recovery and business continuity requirements.

{% include {{ page.version.version }}/backups/support-products.md %}

## Validate backup files

Using `SHOW BACKUP` with the `check_files` option, you can check that all [SST and metadata files]({% link {{ page.version.version }}/backup-architecture.md %}) that belong to a backup are present in the storage location.

1. Take a backup that we'll use for each of the examples on this page:

    {% include_cached copy-clipboard.html %}
    ~~~sql
    BACKUP DATABASE movr INTO "s3://bucket?AWS_ACCESS_KEY_ID={Access Key ID}&AWS_SECRET_ACCESS_KEY={Secret Access Key}" AS OF SYSTEM TIME "-10s";
    ~~~

1. To find a specific backup to validate in the storage location, show the stored backups in the storage location:

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

## Validate a backup is restorable

To validate that a backup is restorable, you can run `RESTORE` with the `schema_only` option, which will complete a restore **without** restoring any rows. This process is significantly faster than running a [regular restore]({% link {{ page.version.version }}/restore.md %}#examples) for the purposes of validation.

A `schema_only` restore produces close to complete validation coverage on backups. However, this restore type does not read or write from any of the SST files, which store the backed-up rows. You can use `SHOW BACKUP ... WITH check_files` in addition to a `schema_only` restore to check that these SST files are present for a restore operation. Or, you can use `schema_only` in combination with `verify_backup_table_data`. Refer to [Validate backup table data is restorable](#validate-backup-table-data-is-restorable).

{% include {{ page.version.version }}/backups/full-cluster-restore-validation.md %}

Run `RESTORE` with the `schema_only` option, specifying either `LATEST` or the specific backup you would like to restore:

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

You can also use the [`new_db_name` option]({% link {{ page.version.version }}/restore.md %}#rename-a-database-on-restore) to restore a database to a different name. For example, `new_db_name = test_movr`.

Verify that the table schemas have been restored, but that the tables contain no rows:

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

You'll find the tables in place with no rows.

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

## Validate backup table data is restorable

A restore with the `verify_backup_table_data` option will perform a [`schema_only` restore](#validate-a-backup-is-restorable), and:

1. Read all rows from the storage location.
1. Checksum the rows to ensure they are not corrupt.
1. Discard the rows before they are written to disk.

{% include {{ page.version.version }}/backups/full-cluster-restore-validation.md %}

Similarly, to just `schema_only` restores, you'll find the table schemas restored. If a file is not present or unreadable in the backup, you'll receive an error.

Unlike a `schema_only` restore, a `verify_backup_table_data` restore also reads and checksums the rows to validate the backup.

It is necessary to include `schema_only` when you run a restore with `verify_backup_table_data`:

{% include_cached copy-clipboard.html %}
~~~sql
RESTORE DATABASE movr FROM LATEST IN "s3://bucket?AWS_ACCESS_KEY_ID={Access Key ID}&AWS_SECRET_ACCESS_KEY={Secret Access Key}" WITH schema_only, verify_backup_table_data;
~~~

## See also

- [`RESTORE`]({% link {{ page.version.version }}/restore.md %})
- [`BACKUP`]({% link {{ page.version.version }}/backup.md %})
- [`SHOW BACKUP`]({% link {{ page.version.version }}/show-backup.md %})
- [Use Cloud Storage]({% link {{ page.version.version }}/use-cloud-storage.md %})
