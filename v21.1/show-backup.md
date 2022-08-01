---
title: SHOW BACKUP
summary: The SHOW BACKUP statement lists the contents of a backup.
toc: true
---

The `SHOW BACKUP` [statement](sql-statements.html) lists the contents of a backup created with the [`BACKUP`](backup.html) statement.

## Required privileges

`SHOW BACKUP` requires read permissions to its target destination.

{% include {{ page.version.version }}/misc/non-http-source-privileges.md %}

## Synopsis

<div>
{% include {{ page.version.version }}/sql/generated/diagrams/show_backup.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`SHOW BACKUPS IN location` | List the backup paths in the given [`location`](backup.html#backup-file-urls). [See the example](#view-a-list-of-the-available-full-backup-subdirectories).
`SHOW BACKUP location` | Show the details of the backup in the given [`location`](backup.html#backup-file-urls). [See the example](#show-a-backup).
`SHOW BACKUP LATEST IN location` | Show the most recent backup added in the given [`location`](backup.html#backup-file-urls). [See the example](#show-the-most-recent-backup).
`SHOW BACKUP SCHEMAS location` | Show the schema details of the backup in the given [`location`](backup.html#backup-file-urls). [See the example](#show-a-backup-with-schemas).
`SHOW BACKUP subdirectory IN location` |  List the full and incremental backups that are stored in the given full backup's `subdirectory` within a [`location`](backup.html#backup-file-urls). [See the example](#show-details-for-scheduled-backups).
`kv_option_list` | Control the behavior of `SHOW BACKUP` with a comma-separated list of [these options](#options).

### Options

Option       | Value | Description
-------------+-------+-----------------------------------------------------
`privileges` | N/A   |  List which users and roles had which privileges on each table in the backup. Displays original ownership of the backup.
`encryption_passphrase`<a name="with-encryption-passphrase"></a> | [`STRING`](string.html) |  The passphrase used to [encrypt the files](take-and-restore-encrypted-backups.html) that the `BACKUP` statement generates (the data files and its manifest, containing the backup's metadata).
`as_json`   |  N/A  | [Display the backup's internal metadata](#show-a-backups-internal-metadata) as JSON in the response.

## Response

The following fields are returned:

Field | Description
------|------------
`database_name` | The database name.
`parent_schema_name` | The name of the parent schema.
`object_name` | The name of the [database](create-database.html), [table](create-table.html), [type](create-type.html), or schema.
`object_type` | The type of object: [database](create-database.html), [table](create-table.html), [type](create-type.html), or schema.
`start_time` | The time of the earliest data encapsulated in the backup. Note that this only displays for incremental backups. For a full backup, this is `NULL`.
`end_time` | The time to which data can be restored. This is equivalent to the [`AS OF SYSTEM TIME`](as-of-system-time.html) of the backup. If the backup was _not_ taken with [revision history](take-backups-with-revision-history-and-restore-from-a-point-in-time.html), the `end_time` is the _only_ time the data can be restored to. If the backup was taken with revision history, the `end_time` is the latest time the data can be restored to.
`size_bytes` | The size of the backup, in bytes.
`create_statement` | The `CREATE` statement used to create [table(s)](create-table.html), [view(s)](create-view.html), or [sequence(s)](create-sequence.html) that are stored within the backup. This displays when `SHOW BACKUP SCHEMAS` is used. Note that tables with references to [foreign keys](foreign-key.html) will only display foreign key constraints if the table to which the constraint relates to is also included in the backup.
`is_full_cluster` |  Whether the backup is of a full cluster or not.
`path` |  The list of the [full backup](take-full-and-incremental-backups.html#full-backups)'s subdirectories. This field is returned for `SHOW BACKUPS IN location` only. The path format is `<year>/<month>/<day>-<timestamp>`.

## Example

### Show a backup

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW BACKUP 's3://test/backup-test?AWS_ACCESS_KEY_ID=[placeholder]&AWS_SECRET_ACCESS_KEY=[placeholder]';
~~~

~~~
  database_name | parent_schema_name |        object_name         | object_type | start_time |             end_time             | size_bytes | rows | is_full_cluster
----------------+--------------------+----------------------------+-------------+------------+----------------------------------+------------+------+------------------
  NULL          | NULL               | system                     | database    | NULL       | 2020-09-24 19:05:40.542168+00:00 |       NULL | NULL |      true
  system        | public             | users                      | table       | NULL       | 2020-09-24 19:05:40.542168+00:00 |        144 |    3 |      true
  system        | public             | zones                      | table       | NULL       | 2020-09-24 19:05:40.542168+00:00 |        201 |    7 |      true
  system        | public             | settings                   | table       | NULL       | 2020-09-24 19:05:40.542168+00:00 |        431 |    6 |      true
  system        | public             | ui                         | table       | NULL       | 2020-09-24 19:05:40.542168+00:00 |          0 |    0 |      true
  system        | public             | jobs                       | table       | NULL       | 2020-09-24 19:05:40.542168+00:00 |     434302 |   62 |      true
  system        | public             | locations                  | table       | NULL       | 2020-09-24 19:05:40.542168+00:00 |        261 |    5 |      true
  system        | public             | role_members               | table       | NULL       | 2020-09-24 19:05:40.542168+00:00 |        184 |    2 |      true
  system        | public             | comments                   | table       | NULL       | 2020-09-24 19:05:40.542168+00:00 |          0 |    0 |      true
  system        | public             | scheduled_jobs             | table       | NULL       | 2020-09-24 19:05:40.542168+00:00 |        875 |    2 |      true
  NULL          | NULL               | defaultdb                  | database    | NULL       | 2020-09-24 19:05:40.542168+00:00 |       NULL | NULL |      true
  NULL          | NULL               | postgres                   | database    | NULL       | 2020-09-24 19:05:40.542168+00:00 |       NULL | NULL |      true
  NULL          | NULL               | movr                       | database    | NULL       | 2020-09-24 19:05:40.542168+00:00 |       NULL | NULL |      true
  movr          | public             | users                      | table       | NULL       | 2020-09-24 19:05:40.542168+00:00 |       4911 |   50 |      true
  movr          | public             | vehicles                   | table       | NULL       | 2020-09-24 19:05:40.542168+00:00 |       3182 |   15 |      true
  movr          | public             | rides                      | table       | NULL       | 2020-09-24 19:05:40.542168+00:00 |     156387 |  500 |      true
  movr          | public             | vehicle_location_histories | table       | NULL       | 2020-09-24 19:05:40.542168+00:00 |      73918 | 1000 |      true
  movr          | public             | promo_codes                | table       | NULL       | 2020-09-24 19:05:40.542168+00:00 |     216083 | 1000 |      true
  movr          | public             | user_promo_codes           | table       | NULL       | 2020-09-24 19:05:40.542168+00:00 |          0 |    0 |      true
  defaultdb     | NULL               | org_one                    | schema      | NULL       | 2020-09-24 19:05:40.542168+00:00 |       NULL | NULL |      true
(20 rows)
~~~

You will receive an error if there is a collection of backups in the storage location that you pass to `SHOW BACKUP`. It is necessary to run `SHOW BACKUP` with the specific backup directory rather than the backup collection's top-level directory. Use [`SHOW BACKUPS IN`](#show-backups-in) with your storage location to list the backup directories it contains, which can then be run with `SHOW BACKUP` to inspect the metadata.

### View a list of the available full backup subdirectories

<a name="show-backups-in"></a>To view a list of the available [full backups](take-full-and-incremental-backups.html#full-backups) subdirectories, use the following command:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW BACKUPS IN 's3://test/backup-test?AWS_ACCESS_KEY_ID=[placeholder]&AWS_SECRET_ACCESS_KEY=[placeholder]';
~~~

~~~
          path
------------------------
  2020/09/24-204152.88
  2020/09/24-204623.44
  2020/09/24-205612.40
  2020/09/24-207328.36
(4 rows)
~~~

The path format is `<year>/<month>/<day>-<timestamp>`.

### Show the most recent backup

{% include_cached new-in.html version="v21.1" %} To view the most recent backup, use the `LATEST` syntax:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW BACKUP LATEST IN 's3://{bucket name}?AWS_ACCESS_KEY_ID=[placeholder]&AWS_SECRET_ACCESS_KEY=[placeholder]';
~~~

~~~
database_name | parent_schema_name | object_name | object_type | backup_type | start_time |          end_time          | size_bytes | rows | is_full_cluster
--------------+--------------------+-------------+-------------+-------------+------------+----------------------------+------------+------+------------------
NULL          | NULL               | movr        | database    | full        | NULL       | 2022-03-25 16:53:48.001825 |       NULL | NULL |      false
movr          | NULL               | public      | schema      | full        | NULL       | 2022-03-25 16:53:48.001825 |       NULL | NULL |      false
movr          | public             | users       | table       | full        | NULL       | 2022-03-25 16:53:48.001825 |     135144 | 1474 |      false
(3 rows)
~~~

### View a list of the full and incremental backups in a specific full backup subdirectory

To view a list of the [full](take-full-and-incremental-backups.html#full-backups) and [incremental](take-full-and-incremental-backups.html#incremental-backups) backups in a specific subdirectory, use the following command:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW BACKUP '2020/09/24-204152.88' IN 's3://test/backup-test?AWS_ACCESS_KEY_ID=[placeholder]&AWS_SECRET_ACCESS_KEY=[placeholder]';
~~~

~~~
  database_name | parent_schema_name |        object_name         | object_type |            start_time            |             end_time             | size_bytes | rows | is_full_cluster
----------------+--------------------+----------------------------+-------------+----------------------------------+----------------------------------+------------+------+------------------
  NULL          | NULL               | system                     | database    | NULL                             | 2020-09-24 20:41:52.880553+00:00 |       NULL | NULL |      true
  system        | public             | users                      | table       | NULL                             | 2020-09-24 20:41:52.880553+00:00 |        144 |    3 |      true
  system        | public             | zones                      | table       | NULL                             | 2020-09-24 20:41:52.880553+00:00 |        201 |    7 |      true
  system        | public             | settings                   | table       | NULL                             | 2020-09-24 20:41:52.880553+00:00 |        875 |    6 |      true
  system        | public             | ui                         | table       | NULL                             | 2020-09-24 20:41:52.880553+00:00 |          0 |    0 |      true
  system        | public             | jobs                       | table       | NULL                             | 2020-09-24 20:41:52.880553+00:00 |     795117 |   80 |      true
  system        | public             | locations                  | table       | NULL                             | 2020-09-24 20:41:52.880553+00:00 |        261 |    5 |      true
  system        | public             | role_members               | table       | NULL                             | 2020-09-24 20:41:52.880553+00:00 |        184 |    2 |      true
  system        | public             | comments                   | table       | NULL                             | 2020-09-24 20:41:52.880553+00:00 |          0 |    0 |      true
  system        | public             | scheduled_jobs             | table       | NULL                             | 2020-09-24 20:41:52.880553+00:00 |       1013 |    2 |      true
  NULL          | NULL               | defaultdb                  | database    | NULL                             | 2020-09-24 20:41:52.880553+00:00 |       NULL | NULL |      true
  NULL          | NULL               | postgres                   | database    | NULL                             | 2020-09-24 20:41:52.880553+00:00 |       NULL | NULL |      true
  NULL          | NULL               | movr                       | database    | NULL                             | 2020-09-24 20:41:52.880553+00:00 |       NULL | NULL |      true
  movr          | public             | users                      | table       | NULL                             | 2020-09-24 20:41:52.880553+00:00 |       4911 |   50 |      true
  movr          | public             | vehicles                   | table       | NULL                             | 2020-09-24 20:41:52.880553+00:00 |       3182 |   15 |      true
  movr          | public             | rides                      | table       | NULL                             | 2020-09-24 20:41:52.880553+00:00 |     156387 |  500 |      true
  movr          | public             | vehicle_location_histories | table       | NULL                             | 2020-09-24 20:41:52.880553+00:00 |      73918 | 1000 |      true
  movr          | public             | promo_codes                | table       | NULL                             | 2020-09-24 20:41:52.880553+00:00 |     216083 | 1000 |      true
  movr          | public             | user_promo_codes           | table       | NULL                             | 2020-09-24 20:41:52.880553+00:00 |          0 |    0 |      true
  defaultdb     | NULL               | org_one                    | schema      | NULL                             | 2020-09-24 20:41:52.880553+00:00 |       NULL | NULL |      true
  NULL          | NULL               | system                     | database    | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |       NULL | NULL |      true
  system        | public             | users                      | table       | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |          0 |    0 |      true
  system        | public             | zones                      | table       | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |          0 |    0 |      true
  system        | public             | settings                   | table       | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |          0 |    0 |      true
  system        | public             | ui                         | table       | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |          0 |    0 |      true
  system        | public             | jobs                       | table       | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |     102381 |    1 |      true
  system        | public             | locations                  | table       | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |          0 |    0 |      true
  system        | public             | role_members               | table       | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |          0 |    0 |      true
  system        | public             | comments                   | table       | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |          0 |    0 |      true
  system        | public             | scheduled_jobs             | table       | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |       1347 |    2 |      true
  NULL          | NULL               | defaultdb                  | database    | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |       NULL | NULL |      true
  NULL          | NULL               | postgres                   | database    | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |       NULL | NULL |      true
  NULL          | NULL               | movr                       | database    | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |       NULL | NULL |      true
  movr          | public             | users                      | table       | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |          0 |    0 |      true
  movr          | public             | vehicles                   | table       | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |          0 |    0 |      true
  movr          | public             | rides                      | table       | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |          0 |    0 |      true
  movr          | public             | vehicle_location_histories | table       | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |          0 |    0 |      true
  movr          | public             | promo_codes                | table       | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |          0 |    0 |      true
  movr          | public             | user_promo_codes           | table       | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |          0 |    0 |      true
  defaultdb     | NULL               | org_one                    | schema      | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |       NULL | NULL |      true
(40 rows)

~~~

### Show a backup with schemas

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW BACKUP SCHEMAS 's3://test/backup-test?AWS_ACCESS_KEY_ID=[placeholder]&AWS_SECRET_ACCESS_KEY=[placeholder]';
~~~

~~~
  database_name | parent_schema_name |        object_name         | object_type | start_time |             end_time             | size_bytes | rows | is_full_cluster |                                                        create_statement
----------------+--------------------+----------------------------+-------------+------------+----------------------------------+------------+------+-----------------+----------------------------------------------------------------------------------------------------------------------------------
  NULL          | NULL               | system                     | database    | NULL       | 2020-09-24 19:05:40.542168+00:00 |       NULL | NULL |      true       | NULL
  system        | public             | users                      | table       | NULL       | 2020-09-24 19:05:40.542168+00:00 |        144 |    3 |      true       | CREATE TABLE users (
                |                    |                            |             |            |                                  |            |      |                 |     username STRING NOT NULL,
                |                    |                            |             |            |                                  |            |      |                 |     "hashedPassword" BYTES NULL,
                |                    |                            |             |            |                                  |            |      |                 |     "isRole" BOOL NOT NULL DEFAULT false,
                |                    |                            |             |            |                                  |            |      |                 |     CONSTRAINT "primary" PRIMARY KEY (username ASC),
                |                    |                            |             |            |                                  |            |      |                 |     FAMILY "primary" (username),
                |                    |                            |             |            |                                  |            |      |                 |     FAMILY "fam_2_hashedPassword" ("hashedPassword"),
                |                    |                            |             |            |                                  |            |      |                 |     FAMILY "fam_3_isRole" ("isRole")
                |                    |                            |             |            |                                  |            |      |                 | )
...
  system        | public             | jobs                       | table       | NULL       | 2020-09-24 19:05:40.542168+00:00 |     434302 |   62 |      true       | CREATE TABLE jobs (
                |                    |                            |             |            |                                  |            |      |                 |     id INT8 NOT NULL DEFAULT unique_rowid(),
                |                    |                            |             |            |                                  |            |      |                 |     status STRING NOT NULL,
                |                    |                            |             |            |                                  |            |      |                 |     created TIMESTAMP NOT NULL DEFAULT now():::TIMESTAMP,
                |                    |                            |             |            |                                  |            |      |                 |     payload BYTES NOT NULL,
                |                    |                            |             |            |                                  |            |      |                 |     progress BYTES NULL,
                |                    |                            |             |            |                                  |            |      |                 |     created_by_type STRING NULL,
                |                    |                            |             |            |                                  |            |      |                 |     created_by_id INT8 NULL,
                |                    |                            |             |            |                                  |            |      |                 |     claim_session_id BYTES NULL,
                |                    |                            |             |            |                                  |            |      |                 |     claim_instance_id INT8 NULL,
                |                    |                            |             |            |                                  |            |      |                 |     CONSTRAINT "primary" PRIMARY KEY (id ASC),
                |                    |                            |             |            |                                  |            |      |                 |     INDEX jobs_status_created_idx (status ASC, created ASC),
                |                    |                            |             |            |                                  |            |      |                 |     INDEX jobs_created_by_type_created_by_id_idx (created_by_type ASC, created_by_id ASC) STORING (status),
                |                    |                            |             |            |                                  |            |      |                 |     FAMILY fam_0_id_status_created_payload (id, status, created, payload, created_by_type, created_by_id),
                |                    |                            |             |            |                                  |            |      |                 |     FAMILY progress (progress),
                |                    |                            |             |            |                                  |            |      |                 |     FAMILY claim (claim_session_id, claim_instance_id)
                |                    |                            |             |            |                                  |            |      |                 | )
  system        | public             | locations                  | table       | NULL       | 2020-09-24 19:05:40.542168+00:00 |        261 |    5 |      true       | CREATE TABLE locations (
                |                    |                            |             |            |                                  |            |      |                 |     "localityKey" STRING NOT NULL,
                |                    |                            |             |            |                                  |            |      |                 |     "localityValue" STRING NOT NULL,
                |                    |                            |             |            |                                  |            |      |                 |     latitude DECIMAL(18,15) NOT NULL,
                |                    |                            |             |            |                                  |            |      |                 |     longitude DECIMAL(18,15) NOT NULL,
                |                    |                            |             |            |                                  |            |      |                 |     CONSTRAINT "primary" PRIMARY KEY ("localityKey" ASC, "localityValue" ASC),
                |                    |                            |             |            |                                  |            |      |                 |     FAMILY "fam_0_localityKey_localityValue_latitude_longitude" ("localityKey", "localityValue", latitude, longitude)
                |                    |                            |             |            |                                  |            |      |                 | )
...
~~~

### Show a backup with privileges

Use the `WITH privileges` [option](#options) to view a list of which users and roles had which privileges on each database and table in the backup. This parameter also displays the original owner of objects in the backup:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW BACKUP 's3://test/backup-test?AWS_ACCESS_KEY_ID=[placeholder]&AWS_SECRET_ACCESS_KEY=[placeholder]' WITH privileges;
~~~

~~~
  database_name | parent_schema_name |        object_name         | object_type | start_time |             end_time             | size_bytes | rows | is_full_cluster |                                                                               privileges                                                                                  | owner
----------------+--------------------+----------------------------+-------------+------------+----------------------------------+------------+------+-----------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------+--------
  NULL          | NULL               | system                     | database    | NULL       | 2020-09-24 19:05:40.542168+00:00 |       NULL | NULL |      true       | GRANT GRANT, SELECT ON system TO admin; GRANT GRANT, SELECT ON system TO root;                                                                                            | root
  system        | public             | users                      | table       | NULL       | 2020-09-24 19:05:40.542168+00:00 |        144 |    3 |      true       | GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON users TO admin; GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON users TO root;                                              | root
  system        | public             | zones                      | table       | NULL       | 2020-09-24 19:05:40.542168+00:00 |        201 |    7 |      true       | GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON zones TO admin; GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON zones TO root;                                              | root
  system        | public             | settings                   | table       | NULL       | 2020-09-24 19:05:40.542168+00:00 |        431 |    6 |      true       | GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON settings TO admin; GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON settings TO root;                                        | root
  system        | public             | ui                         | table       | NULL       | 2020-09-24 19:05:40.542168+00:00 |          0 |    0 |      true       | GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON ui TO admin; GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON ui TO root;                                                    | root
  system        | public             | jobs                       | table       | NULL       | 2020-09-24 19:05:40.542168+00:00 |     434302 |   62 |      true       | GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON jobs TO admin; GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON jobs TO root;                                                | root
  system        | public             | locations                  | table       | NULL       | 2020-09-24 19:05:40.542168+00:00 |        261 |    5 |      true       | GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON locations TO admin; GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON locations TO root;                                      | root
  system        | public             | role_members               | table       | NULL       | 2020-09-24 19:05:40.542168+00:00 |        184 |    2 |      true       | GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON role_members TO admin; GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON role_members TO root;                                | root
  system        | public             | comments                   | table       | NULL       | 2020-09-24 19:05:40.542168+00:00 |          0 |    0 |      true       | GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON comments TO admin; GRANT SELECT ON comments TO public; GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON comments TO root;    | root
  system        | public             | scheduled_jobs             | table       | NULL       | 2020-09-24 19:05:40.542168+00:00 |        875 |    2 |      true       | GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON scheduled_jobs TO admin; GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON scheduled_jobs TO root;                            | root
  NULL          | NULL               | defaultdb                  | database    | NULL       | 2020-09-24 19:05:40.542168+00:00 |       NULL | NULL |      true       | GRANT ALL ON defaultdb TO admin; GRANT CREATE ON defaultdb TO max; GRANT ALL ON defaultdb TO root;                                                                        | root
  NULL          | NULL               | postgres                   | database    | NULL       | 2020-09-24 19:05:40.542168+00:00 |       NULL | NULL |      true       | GRANT ALL ON postgres TO admin; GRANT ALL ON postgres TO root;                                                                                                            | root
  NULL          | NULL               | movr                       | database    | NULL       | 2020-09-24 19:05:40.542168+00:00 |       NULL | NULL |      true       | GRANT ALL ON movr TO admin; GRANT ALL ON movr TO root;                                                                                                                    | root
  movr          | public             | users                      | table       | NULL       | 2020-09-24 19:05:40.542168+00:00 |       4911 |   50 |      true       | GRANT ALL ON users TO admin; GRANT ALL ON users TO root;                                                                                                                  | root
  movr          | public             | vehicles                   | table       | NULL       | 2020-09-24 19:05:40.542168+00:00 |       3182 |   15 |      true       | GRANT ALL ON vehicles TO admin; GRANT ALL ON vehicles TO root;                                                                                                            | root
  movr          | public             | rides                      | table       | NULL       | 2020-09-24 19:05:40.542168+00:00 |     156387 |  500 |      true       | GRANT ALL ON rides TO admin; GRANT ALL ON rides TO root;                                                                                                                  | root
  movr          | public             | vehicle_location_histories | table       | NULL       | 2020-09-24 19:05:40.542168+00:00 |      73918 | 1000 |      true       | GRANT ALL ON vehicle_location_histories TO admin; GRANT ALL ON vehicle_location_histories TO root;                                                                        | root
  movr          | public             | promo_codes                | table       | NULL       | 2020-09-24 19:05:40.542168+00:00 |     216083 | 1000 |      true       | GRANT ALL ON promo_codes TO admin; GRANT ALL ON promo_codes TO root;                                                                                                      | root
  movr          | public             | user_promo_codes           | table       | NULL       | 2020-09-24 19:05:40.542168+00:00 |          0 |    0 |      true       | GRANT ALL ON user_promo_codes TO admin; GRANT ALL ON user_promo_codes TO root;                                                                                            | root
  defaultdb     | NULL               | org_one                    | schema      | NULL       | 2020-09-24 19:05:40.542168+00:00 |       NULL | NULL |      true       |                                                                                                                                                                           | root
(20 rows)
~~~

### Show details for scheduled backups

 When a [backup is created by a schedule](create-schedule-for-backup.html), it is stored within a collection of backups in the given location. To view details for a backup created by a schedule, you can use the following:

- `SHOW BACKUPS IN y` statement to [view a list of the available full backup subdirectories](#view-a-list-of-the-available-full-backup-subdirectories).
- `SHOW BACKUP x IN y` statement to [view a list of the full and incremental backups that are stored in a specific full backup's subdirectory](#view-a-list-of-the-full-and-incremental-backups-in-a-specific-full-backup-subdirectory).

### Show an encrypted backup

Depending on how the backup was [encrypted](take-and-restore-encrypted-backups.html), use the [`encryption_passphrase` option](backup.html#with-encryption-passphrase) and the same passphrase that was used to create the backup:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW BACKUP 's3://test/backup-test?AWS_ACCESS_KEY_ID=[placeholder]&AWS_SECRET_ACCESS_KEY=[placeholder]'
      WITH encryption_passphrase = 'password123';
~~~

Or, use the `kms` option and the same KMS URI that was used to create the backup:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW BACKUP 's3://test/backups/test_explicit_kms?AWS_ACCESS_KEY_ID=123&AWS_SECRET_ACCESS_KEY=123'
      WITH kms = 'aws:///arn:aws:kms:us-east-1:123456789:key/1234-abcd-5678-efgh-90ij?AWS_ACCESS_KEY_ID=123456&AWS_SECRET_ACCESS_KEY=123456&REGION=us-east-1';
~~~

~~~
  database_name | parent_schema_name |        object_name         | object_type | start_time |             end_time             | size_bytes | rows | is_full_cluster
----------------+--------------------+----------------------------+-------------+------------+----------------------------------+------------+------+------------------
  NULL          | NULL               | system                     | database    | NULL       | 2020-09-29 18:24:55.784364+00:00 |       NULL | NULL |      true
  system        | public             | users                      | table       | NULL       | 2020-09-29 18:24:55.784364+00:00 |        144 |    3 |      true
  system        | public             | zones                      | table       | NULL       | 2020-09-29 18:24:55.784364+00:00 |        201 |    7 |      true
  system        | public             | settings                   | table       | NULL       | 2020-09-29 18:24:55.784364+00:00 |        431 |    6 |      true
  system        | public             | ui                         | table       | NULL       | 2020-09-29 18:24:55.784364+00:00 |          0 |    0 |      true
  system        | public             | jobs                       | table       | NULL       | 2020-09-29 18:24:55.784364+00:00 |     962415 |   97 |      true
  system        | public             | locations                  | table       | NULL       | 2020-09-29 18:24:55.784364+00:00 |        261 |    5 |      true
  system        | public             | role_members               | table       | NULL       | 2020-09-29 18:24:55.784364+00:00 |        184 |    2 |      true
  system        | public             | comments                   | table       | NULL       | 2020-09-29 18:24:55.784364+00:00 |          0 |    0 |      true
  system        | public             | scheduled_jobs             | table       | NULL       | 2020-09-29 18:24:55.784364+00:00 |       1991 |    4 |      true
  NULL          | NULL               | defaultdb                  | database    | NULL       | 2020-09-29 18:24:55.784364+00:00 |       NULL | NULL |      true
  NULL          | NULL               | postgres                   | database    | NULL       | 2020-09-29 18:24:55.784364+00:00 |       NULL | NULL |      true
  NULL          | NULL               | movr                       | database    | NULL       | 2020-09-29 18:24:55.784364+00:00 |       NULL | NULL |      true
  movr          | public             | users                      | table       | NULL       | 2020-09-29 18:24:55.784364+00:00 |       4911 |   50 |      true
  movr          | public             | vehicles                   | table       | NULL       | 2020-09-29 18:24:55.784364+00:00 |       3182 |   15 |      true
  movr          | public             | rides                      | table       | NULL       | 2020-09-29 18:24:55.784364+00:00 |     156387 |  500 |      true
  movr          | public             | vehicle_location_histories | table       | NULL       | 2020-09-29 18:24:55.784364+00:00 |      73918 | 1000 |      true
  movr          | public             | promo_codes                | table       | NULL       | 2020-09-29 18:24:55.784364+00:00 |     216083 | 1000 |      true
  movr          | public             | user_promo_codes           | table       | NULL       | 2020-09-29 18:24:55.784364+00:00 |          0 |    0 |      true
  defaultdb     | NULL               | org_one                    | schema      | NULL       | 2020-09-29 18:24:55.784364+00:00 |       NULL | NULL |      true
(20 rows)
~~~

### Show a backup's internal metadata

Use the `WITH as_json` option to output a backup's internal metadata, contained in its manifest file, as a JSON value:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW BACKUP '/2021/11/15-150703.21' IN 's3://test/backup-test?AWS_ACCESS_KEY_ID=[placeholder]&AWS_SECRET_ACCESS_KEY=[placeholder]' WITH as_json;
~~~

The response will include a `manifest` column with the file's contents as the JSON value. Use [JSONB functions](functions-and-operators.html#jsonb-functions) to query particular data or edit the format of the response.

{{site.data.alerts.callout_info}}
The response returned from `SHOW BACKUP ... WITH as_json` is a backup's internal metadata. This content is subject to change from version to version of CockroachDB and does not offer the same stability guarantees as the other `SHOW BACKUP` [options](#options) and their [responses](#response). As a result, `as_json` should **only** be used for debugging or general inspection purposes.
{{site.data.alerts.end}}

For example, to return a specific entry from the JSON response as a [`string`](string.html) indented and with newlines use the [`jsonb_pretty()`](functions-and-operators.html#jsonb-functions) function:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT jsonb_pretty(manifest->'entryCounts') AS f FROM [SHOW BACKUP '/2021/11/15-150703.21' IN 's3://test/backup-test?AWS_ACCESS_KEY_ID=[placeholder]&AWS_SECRET_ACCESS_KEY=[placeholder]' with as_json];
~~~

~~~ json
  {
      "dataSize": "458371",
      "indexEntries": "1015",
      "rows": "2565"
  }
~~~

To query for particular data, use the [`jsonb_array_elements()` function](functions-and-operators.html#jsonb-functions) to expand the desired elements from the JSON response. The following query returns the paths to each of the data files within the backup:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT f->>'path' FROM (SELECT jsonb_array_elements(manifest->'files') AS f FROM [SHOW BACKUP '/2021/11/15-150703.21' IN 's3://test/backup-test?AWS_ACCESS_KEY_ID=[placeholder]&AWS_SECRET_ACCESS_KEY=[placeholder]' WITH as_json]);
~~~

~~~
          ?column?
-------------------------------
  data/710798326337404929.sst
  data/710798326337404929.sst
  data/710798328891998209.sst
  data/710798326337404929.sst
  data/710798326337404929.sst
  data/710798328434982913.sst
  data/710798328891998209.sst
  data/710798326337404929.sst
  data/710798326337404929.sst
~~~

## See also

- [`BACKUP`](backup.html)
- [`RESTORE`](restore.html)
