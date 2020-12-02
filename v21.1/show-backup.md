---
title: SHOW BACKUP
summary: The SHOW BACKUP statement lists the contents of a backup.
toc: true
---

The `SHOW BACKUP` [statement](sql-statements.html) lists the contents of a backup created with the [`BACKUP`](backup.html) statement.

## Required privileges

Only members of the `admin` role can run `SHOW BACKUP`. By default, the `root` user belongs to the `admin` role.

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/show_backup.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`SHOW BACKUP location` | Show the details of the backup in the given [`location`](backup.html#backup-file-urls). [See the example below](#show-a-backup).
`SHOW BACKUP SCHEMAS location` | Show the schema details of the backup in the given [`location`](backup.html#backup-file-urls). [See the example below](#show-a-backup-with-schemas).
`SHOW BACKUPS IN location` |  List the full backup's subdirectories in the given [`location`](backup.html#backup-file-urls). [See the example below](#show-details-for-scheduled-backups).
`SHOW BACKUP subdirectory IN location` |  List the full and incremental backups that are stored in the given full backup's `subdirectory` within a [`location`](backup.html#backup-file-urls). [See the example below](#show-details-for-scheduled-backups).
`kv_option_list` | Control the show behavior with a comma-separated list of [these options](#options).

### Options

Option       | Value | Description
-------------+-------+-----------------------------------------------------
`privileges` | N/A   |  List which users and roles had which privileges on each table in the backup.
`encryption_passphrase`<a name="with-encryption-passphrase"></a> | [`STRING`](string.html) |  The passphrase used to [encrypt the files](take-and-restore-encrypted-backups.html) (`BACKUP` manifest and data files) that the `BACKUP` statement generates.

## Response

The following fields are returned.

Field | Description
------|------------
`database_name` | The database name.
`parent_schema_name` |  The name of the parent schema.
`object_name` |  The name of the [database](create-database.html), [table](create-table.html), [type](create-type.html), or schema. Note: This column was called `table_name` in previous versions of CockroachDB. **Note: This is a breaking change.**
`object_type` |  The type of object: [database](create-database.html), [table](create-table.html), [type](create-type.html), or schema.
`start_time` | The time of the earliest data encapsulated in the backup. Note that this only displays for incremental backups. For a full backup, this is `NULL`.
`end_time` | The time to which data can be restored. This is equivalent to the [`AS OF SYSTEM TIME`](as-of-system-time.html) of the backup. If the backup was _not_ taken with [revision history](take-backups-with-revision-history-and-restore-from-a-point-in-time.html), the `end_time` is the _only_ time the data can be restored to. If the backup was taken with revision history, the `end_time` is the latest time the data can be restored to.
`size_bytes` | The size of the backup, in bytes.
`create_statement` | The `CREATE` statement used to create [table(s)](create-table.html), [view(s)](create-view.html), or [sequence(s)](create-sequence.html) that are stored within the backup. This displays when `SHOW BACKUP SCHEMAS` is used. Note that tables with references to [foreign keys](foreign-key.html) will only display foreign key constraints if the table to which the constraint relates to is also included in the backup.
`is_full_cluster` |  Whether the backup is of a full cluster or not.
`path` |  The list of the full backup's subdirectories. This field is returned for `SHOW BACKUPS IN LOCATION` only. The path format is `<year>/<month>/<day>-<timestamp>`.

## Example

### Show a backup

{% include copy-clipboard.html %}
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

### Show a backup with schemas

{% include copy-clipboard.html %}
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

To view a list of which users and roles had which privileges on each database and table in the backup, use the `WITH privileges` [parameter](#parameters):

{% include copy-clipboard.html %}
~~~ sql
> SHOW BACKUP 's3://test/backup-test?AWS_ACCESS_KEY_ID=[placeholder]&AWS_SECRET_ACCESS_KEY=[placeholder]' WITH privileges;
~~~

~~~
  database_name | parent_schema_name |        object_name         | object_type | start_time |             end_time             | size_bytes | rows | is_full_cluster |                                                                               privileges
----------------+--------------------+----------------------------+-------------+------------+----------------------------------+------------+------+-----------------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  NULL          | NULL               | system                     | database    | NULL       | 2020-09-24 19:05:40.542168+00:00 |       NULL | NULL |      true       | GRANT GRANT, SELECT ON system TO admin; GRANT GRANT, SELECT ON system TO root;
  system        | public             | users                      | table       | NULL       | 2020-09-24 19:05:40.542168+00:00 |        144 |    3 |      true       | GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON users TO admin; GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON users TO root;
  system        | public             | zones                      | table       | NULL       | 2020-09-24 19:05:40.542168+00:00 |        201 |    7 |      true       | GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON zones TO admin; GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON zones TO root;
  system        | public             | settings                   | table       | NULL       | 2020-09-24 19:05:40.542168+00:00 |        431 |    6 |      true       | GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON settings TO admin; GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON settings TO root;
  system        | public             | ui                         | table       | NULL       | 2020-09-24 19:05:40.542168+00:00 |          0 |    0 |      true       | GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON ui TO admin; GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON ui TO root;
  system        | public             | jobs                       | table       | NULL       | 2020-09-24 19:05:40.542168+00:00 |     434302 |   62 |      true       | GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON jobs TO admin; GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON jobs TO root;
  system        | public             | locations                  | table       | NULL       | 2020-09-24 19:05:40.542168+00:00 |        261 |    5 |      true       | GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON locations TO admin; GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON locations TO root;
  system        | public             | role_members               | table       | NULL       | 2020-09-24 19:05:40.542168+00:00 |        184 |    2 |      true       | GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON role_members TO admin; GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON role_members TO root;
  system        | public             | comments                   | table       | NULL       | 2020-09-24 19:05:40.542168+00:00 |          0 |    0 |      true       | GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON comments TO admin; GRANT SELECT ON comments TO public; GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON comments TO root;
  system        | public             | scheduled_jobs             | table       | NULL       | 2020-09-24 19:05:40.542168+00:00 |        875 |    2 |      true       | GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON scheduled_jobs TO admin; GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON scheduled_jobs TO root;
  NULL          | NULL               | defaultdb                  | database    | NULL       | 2020-09-24 19:05:40.542168+00:00 |       NULL | NULL |      true       | GRANT ALL ON defaultdb TO admin; GRANT CREATE ON defaultdb TO max; GRANT ALL ON defaultdb TO root;
  NULL          | NULL               | postgres                   | database    | NULL       | 2020-09-24 19:05:40.542168+00:00 |       NULL | NULL |      true       | GRANT ALL ON postgres TO admin; GRANT ALL ON postgres TO root;
  NULL          | NULL               | movr                       | database    | NULL       | 2020-09-24 19:05:40.542168+00:00 |       NULL | NULL |      true       | GRANT ALL ON movr TO admin; GRANT ALL ON movr TO root;
  movr          | public             | users                      | table       | NULL       | 2020-09-24 19:05:40.542168+00:00 |       4911 |   50 |      true       | GRANT ALL ON users TO admin; GRANT ALL ON users TO root;
  movr          | public             | vehicles                   | table       | NULL       | 2020-09-24 19:05:40.542168+00:00 |       3182 |   15 |      true       | GRANT ALL ON vehicles TO admin; GRANT ALL ON vehicles TO root;
  movr          | public             | rides                      | table       | NULL       | 2020-09-24 19:05:40.542168+00:00 |     156387 |  500 |      true       | GRANT ALL ON rides TO admin; GRANT ALL ON rides TO root;
  movr          | public             | vehicle_location_histories | table       | NULL       | 2020-09-24 19:05:40.542168+00:00 |      73918 | 1000 |      true       | GRANT ALL ON vehicle_location_histories TO admin; GRANT ALL ON vehicle_location_histories TO root;
  movr          | public             | promo_codes                | table       | NULL       | 2020-09-24 19:05:40.542168+00:00 |     216083 | 1000 |      true       | GRANT ALL ON promo_codes TO admin; GRANT ALL ON promo_codes TO root;
  movr          | public             | user_promo_codes           | table       | NULL       | 2020-09-24 19:05:40.542168+00:00 |          0 |    0 |      true       | GRANT ALL ON user_promo_codes TO admin; GRANT ALL ON user_promo_codes TO root;
  defaultdb     | NULL               | org_one                    | schema      | NULL       | 2020-09-24 19:05:40.542168+00:00 |       NULL | NULL |      true       |
(20 rows)
~~~

### Show details for scheduled backups

 When a [backup is created by a schedule](create-schedule-for-backup.html), it is stored within a collection of backups in the given location. To view details for a backup created by a schedule, you can use the following:

- `SHOW BACKUPS IN y` statement to [view a list of the full backup's subdirectories](#view-a-list-of-the-full-backups-subdirectories).
- `SHOW BACKUP x IN y` statement to [view a list of the full and incremental backups that are stored in a specific full backup's subdirectory](#view-a-list-of-the-full-and-incremental-backups-in-a-specific-full-backup-subdirectory).

{% include {{ page.version.version }}/backups/show-scheduled-backups.md %}

### Show an encrypted backup

Depending on how the backup was [encrypted](take-and-restore-encrypted-backups.html), use the [`encryption_passphrase` option](backup.html#with-encryption-passphrase) and the same passphrase that was used to create the backup:

{% include copy-clipboard.html %}
~~~ sql
> SHOW BACKUP 's3://test/backup-test?AWS_ACCESS_KEY_ID=[placeholder]&AWS_SECRET_ACCESS_KEY=[placeholder]'
      WITH encryption_passphrase = 'password123';
~~~

Or, use the `kms` option and the same KMS URI that was used to create the backup:

{% include copy-clipboard.html %}
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

## See also

- [`BACKUP`](backup.html)
- [`RESTORE`](restore.html)
