---
title: SHOW BACKUP
summary: The SHOW BACKUP statement lists the contents of a backup.
toc: true
docs_area: reference.sql
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
`debug_ids` |  N/A  | **New in v21.2:** [Display descriptor IDs](#show-a-backup-with-descriptor-ids) of every object in the backup, including the object's database and parent schema.
`as_json`   |  N/A  | **New in v21.2:** [Display the backup's internal metadata](#show-a-backups-internal-metadata) as JSON in the response.

## Response

The following fields are returned:

Field | Description
------|------------
`database_name` | The database name.
`parent_schema_name` | The name of the parent schema.
`object_name` | The name of the [database](create-database.html), [table](create-table.html), [type](create-type.html), or schema.
`object_type` | The type of object: [database](create-database.html), [table](create-table.html), [type](create-type.html), or schema.
`backup_type` | **New in v21.2:** The type of backup: [full](take-full-and-incremental-backups.html#full-backups) or [incremental](take-full-and-incremental-backups.html#incremental-backups).
`start_time` | The time of the earliest data encapsulated in the backup. Note that this only displays for incremental backups. For a full backup, this is `NULL`.
`end_time` | The time to which data can be restored. This is equivalent to the [`AS OF SYSTEM TIME`](as-of-system-time.html) of the backup. If the backup was _not_ taken with [revision history](take-backups-with-revision-history-and-restore-from-a-point-in-time.html), the `end_time` is the _only_ time the data can be restored to. If the backup was taken with revision history, the `end_time` is the latest time the data can be restored to.
`size_bytes` | The size of the backup, in bytes.
`rows` | Number of rows in tables that are part of the backup.
`create_statement` | The `CREATE` statement used to create [table(s)](create-table.html), [view(s)](create-view.html), or [sequence(s)](create-sequence.html) that are stored within the backup. This displays when `SHOW BACKUP SCHEMAS` is used. Note that tables with references to [foreign keys](foreign-key.html) will only display foreign key constraints if the table to which the constraint relates to is also included in the backup.
`is_full_cluster` |  Whether the backup is of a full cluster or not.
`path` |  The list of the [full backup](take-full-and-incremental-backups.html#full-backups)'s subdirectories. This field is returned for `SHOW BACKUPS IN location` only. The path format is `<year>/<month>/<day>-<timestamp>`.

See [Show a backup with descriptor IDs](#show-a-backup-with-descriptor-ids) for the responses displayed when the `WITH debug_ids` option is specified.

## Example

### Show a backup

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW BACKUP 's3://test/backup-test?AWS_ACCESS_KEY_ID=[placeholder]&AWS_SECRET_ACCESS_KEY=[placeholder]';
~~~

~~~
  database_name | parent_schema_name |        object_name         | object_type | backup_type | start_time |          end_time                 | size_bytes | rows | is_full_cluster
----------------+--------------------+----------------------------+-------------+-------------+------------------------------------------------+------------+------+------------------
  NULL          | NULL               | system                     | database    | full        |  NULL       | 2020-09-24 19:05:40.542168+00:00 |       NULL | NULL |      true
  system        | public             | users                      | table       | full        |  NULL       | 2020-09-24 19:05:40.542168+00:00 |        144 |    3 |      true
  system        | public             | zones                      | table       | full        |  NULL       | 2020-09-24 19:05:40.542168+00:00 |        201 |    7 |      true
  system        | public             | settings                   | table       | full        |  NULL       | 2020-09-24 19:05:40.542168+00:00 |        431 |    6 |      true
  system        | public             | ui                         | table       | full        |  NULL       | 2020-09-24 19:05:40.542168+00:00 |          0 |    0 |      true
  system        | public             | jobs                       | table       | full        |  NULL       | 2020-09-24 19:05:40.542168+00:00 |     434302 |   62 |      true
  system        | public             | locations                  | table       | full        |  NULL       | 2020-09-24 19:05:40.542168+00:00 |        261 |    5 |      true
  system        | public             | role_members               | table       | full        |  NULL       | 2020-09-24 19:05:40.542168+00:00 |        184 |    2 |      true
  system        | public             | comments                   | table       | full        |  NULL       | 2020-09-24 19:05:40.542168+00:00 |          0 |    0 |      true
  system        | public             | scheduled_jobs             | table       | full        |  NULL       | 2020-09-24 19:05:40.542168+00:00 |        875 |    2 |      true
  NULL          | NULL               | defaultdb                  | database    | full        |  NULL       | 2020-09-24 19:05:40.542168+00:00 |       NULL | NULL |      true
  NULL          | NULL               | postgres                   | database    | full        |  NULL       | 2020-09-24 19:05:40.542168+00:00 |       NULL | NULL |      true
  NULL          | NULL               | movr                       | database    | full        |  NULL       | 2020-09-24 19:05:40.542168+00:00 |       NULL | NULL |      true
  movr          | public             | users                      | table       | full        |  NULL       | 2020-09-24 19:05:40.542168+00:00 |       4911 |   50 |      true
  movr          | public             | vehicles                   | table       | full        |  NULL       | 2020-09-24 19:05:40.542168+00:00 |       3182 |   15 |      true
  movr          | public             | rides                      | table       | full        |  NULL       | 2020-09-24 19:05:40.542168+00:00 |     156387 |  500 |      true
  movr          | public             | vehicle_location_histories | table       | full        |  NULL       | 2020-09-24 19:05:40.542168+00:00 |      73918 | 1000 |      true
  movr          | public             | promo_codes                | table       | full        |  NULL       | 2020-09-24 19:05:40.542168+00:00 |     216083 | 1000 |      true
  movr          | public             | user_promo_codes           | table       | full        |  NULL       | 2020-09-24 19:05:40.542168+00:00 |          0 |    0 |      true
  defaultdb     | NULL               | org_one                    | schema      | full        |  NULL       | 2020-09-24 19:05:40.542168+00:00 |       NULL | NULL |      true
(20 rows)
~~~

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

{% include_cached new-in.html version="v21.2" %} To view the most recent backup, use the `LATEST` syntax:

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
  database_name | parent_schema_name |        object_name         | object_type | backup_type       | start_time                       |          end_time                | size_bytes | rows | is_full_cluster
----------------+--------------------+----------------------------+-------------+-------------------+----------------------------------+----------------------------------+-------------------------------------
  NULL          | NULL               | system                     | database    | full              | NULL                             | 2020-09-24 20:41:52.880553+00:00 |       NULL | NULL |      true
  system        | public             | users                      | table       | full              | NULL                             | 2020-09-24 20:41:52.880553+00:00 |        144 |    3 |      true
  system        | public             | zones                      | table       | full              | NULL                             | 2020-09-24 20:41:52.880553+00:00 |        201 |    7 |      true
  system        | public             | settings                   | table       | full              | NULL                             | 2020-09-24 20:41:52.880553+00:00 |        875 |    6 |      true
  system        | public             | ui                         | table       | full              | NULL                             | 2020-09-24 20:41:52.880553+00:00 |          0 |    0 |      true
  system        | public             | jobs                       | table       | full              | NULL                             | 2020-09-24 20:41:52.880553+00:00 |     795117 |   80 |      true
  system        | public             | locations                  | table       | full              | NULL                             | 2020-09-24 20:41:52.880553+00:00 |        261 |    5 |      true
  system        | public             | role_members               | table       | full              | NULL                             | 2020-09-24 20:41:52.880553+00:00 |        184 |    2 |      true
  system        | public             | comments                   | table       | full              | NULL                             | 2020-09-24 20:41:52.880553+00:00 |          0 |    0 |      true
  system        | public             | scheduled_jobs             | table       | full              | NULL                             | 2020-09-24 20:41:52.880553+00:00 |       1013 |    2 |      true
  NULL          | NULL               | defaultdb                  | database    | full              | NULL                             | 2020-09-24 20:41:52.880553+00:00 |       NULL | NULL |      true
  NULL          | NULL               | postgres                   | database    | full              | NULL                             | 2020-09-24 20:41:52.880553+00:00 |       NULL | NULL |      true
  NULL          | NULL               | movr                       | database    | full              | NULL                             | 2020-09-24 20:41:52.880553+00:00 |       NULL | NULL |      true
  movr          | public             | users                      | table       | full              | NULL                             | 2020-09-24 20:41:52.880553+00:00 |       4911 |   50 |      true
  movr          | public             | vehicles                   | table       | full              | NULL                             | 2020-09-24 20:41:52.880553+00:00 |       3182 |   15 |      true
  movr          | public             | rides                      | table       | full              | NULL                             | 2020-09-24 20:41:52.880553+00:00 |     156387 |  500 |      true
  movr          | public             | vehicle_location_histories | table       | full              | NULL                             | 2020-09-24 20:41:52.880553+00:00 |      73918 | 1000 |      true
  movr          | public             | promo_codes                | table       | full              | NULL                             | 2020-09-24 20:41:52.880553+00:00 |     216083 | 1000 |      true
  movr          | public             | user_promo_codes           | table       | full              | NULL                             | 2020-09-24 20:41:52.880553+00:00 |          0 |    0 |      true
  defaultdb     | NULL               | org_one                    | schema      | full              | NULL                             | 2020-09-24 20:41:52.880553+00:00 |       NULL | NULL |      true
  NULL          | NULL               | system                     | database    | incremental       | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |       NULL | NULL |      true
  system        | public             | users                      | table       | incremental       | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |          0 |    0 |      true
  system        | public             | zones                      | table       | incremental       | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |          0 |    0 |      true
  system        | public             | settings                   | table       | incremental       | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |          0 |    0 |      true
  system        | public             | ui                         | table       | incremental       | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |          0 |    0 |      true
  system        | public             | jobs                       | table       | incremental       | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |     102381 |    1 |      true
  system        | public             | locations                  | table       | incremental       | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |          0 |    0 |      true
  system        | public             | role_members               | table       | incremental       | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |          0 |    0 |      true
  system        | public             | comments                   | table       | incremental       | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |          0 |    0 |      true
  system        | public             | scheduled_jobs             | table       | incremental       | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |       1347 |    2 |      true
  NULL          | NULL               | defaultdb                  | database    | incremental       | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |       NULL | NULL |      true
  NULL          | NULL               | postgres                   | database    | incremental       | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |       NULL | NULL |      true
  NULL          | NULL               | movr                       | database    | incremental       | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |       NULL | NULL |      true
  movr          | public             | users                      | table       | incremental       | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |          0 |    0 |      true
  movr          | public             | vehicles                   | table       | incremental       | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |          0 |    0 |      true
  movr          | public             | rides                      | table       | incremental       | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |          0 |    0 |      true
  movr          | public             | vehicle_location_histories | table       | incremental       | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |          0 |    0 |      true
  movr          | public             | promo_codes                | table       | incremental       | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |          0 |    0 |      true
  movr          | public             | user_promo_codes           | table       | incremental       | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |          0 |    0 |      true
  defaultdb     | NULL               | org_one                    | schema      | incremental       | 2020-09-24 20:41:52.880553+00:00 | 2020-09-24 20:50:00+00:00        |       NULL | NULL |      true
(40 rows)
~~~

### Show a backup with schemas

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW BACKUP SCHEMAS 's3://test/backup-test?AWS_ACCESS_KEY_ID=[placeholder]&AWS_SECRET_ACCESS_KEY=[placeholder]';
~~~

~~~
database_name | parent_schema_name | object_name | object_type | backup_type |        start_time         |          end_time          | size_bytes | rows | is_full_cluster |                      create_statement
--------------+--------------------+-------------+-------------+-------------+---------------------------+----------------------------+------------+------+-----------------+--------------------------------------------------------------
NULL          | NULL               | movr        | database    | full        | NULL                      | 2021-10-04 15:19:18.25435  |       NULL | NULL |      false      | NULL
movr          | public             | users       | table       | full        | NULL                      | 2021-10-04 15:19:18.25435  |      35876 |  392 |      false      | CREATE TABLE users (
              |                    |             |             |             |                           |                            |            |      |                 |     id UUID NOT NULL,
              |                    |             |             |             |                           |                            |            |      |                 |     city VARCHAR NOT NULL,
              |                    |             |             |             |                           |                            |            |      |                 |     name VARCHAR NULL,
              |                    |             |             |             |                           |                            |            |      |                 |     address VARCHAR NULL,
              |                    |             |             |             |                           |                            |            |      |                 |     credit_card VARCHAR NULL,
              |                    |             |             |             |                           |                            |            |      |                 |     CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC),
              |                    |             |             |             |                           |                            |            |      |                 |     FAMILY "primary" (id, city, name, address, credit_card)
              |                    |             |             |             |                           |                            |            |      |                 | )
NULL          | NULL               | movr        | database    | incremental | 2021-10-04 15:19:18.25435 | 2021-10-04 15:19:38.005984 |       NULL | NULL |      false      | NULL
movr          | public             | users       | table       | incremental | 2021-10-04 15:19:18.25435 | 2021-10-04 15:19:38.005984 |          0 |    0 |      false      | CREATE TABLE users (
              |                    |             |             |             |                           |                            |            |      |                 |     id UUID NOT NULL,
              |                    |             |             |             |                           |                            |            |      |                 |     city VARCHAR NOT NULL,
              |                    |             |             |             |                           |                            |            |      |                 |     name VARCHAR NULL,
              |                    |             |             |             |                           |                            |            |      |                 |     address VARCHAR NULL,
              |                    |             |             |             |                           |                            |            |      |                 |     credit_card VARCHAR NULL,
              |                    |             |             |             |                           |                            |            |      |                 |     CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC),
              |                    |             |             |             |                           |                            |            |      |                 |     FAMILY "primary" (id, city, name, address, credit_card)
              |                    |             |             |             |                           |                            |            |      |                 | )
. . .
~~~

### Show a backup with privileges

Use the `WITH privileges` [option](#options) to view a list of which users and roles had which privileges on each database and table in the backup. This parameter also displays the original owner of objects in the backup:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW BACKUP FROM '2022/07/07-160311.96' IN 's3://{bucket name}?AWS_ACCESS_KEY_ID={placeholder}&AWS_SECRET_ACCESS_KEY={placeholder}' WITH privileges;
~~~

~~~
 database_name  | parent_schema_name |        object_name         | object_type | backup_type | start_time |          end_time          | size_bytes | rows  | is_full_cluster |                                                                                        privileges                                                                                         | owner
----------------+--------------------+----------------------------+-------------+-------------+------------+----------------------------+------------+-------+-----------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+--------
NULL            | NULL               | system                     | database    | full        | NULL       | 2022-07-07 16:03:11.962683 |       NULL |  NULL |      true       | GRANT CONNECT ON DATABASE system TO admin; GRANT CONNECT ON DATABASE system TO root;                                                                                                      | node
system          | public             | users                      | table       | full        | NULL       | 2022-07-07 16:03:11.962683 |         99 |     2 |      true       | GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON TABLE users TO admin; GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON TABLE users TO root;                                                  | node
system          | public             | zones                      | table       | full        | NULL       | 2022-07-07 16:03:11.962683 |        236 |     8 |      true       | GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON TABLE zones TO admin; GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON TABLE zones TO root;                                                  | node
system          | public             | settings                   | table       | full        | NULL       | 2022-07-07 16:03:11.962683 |        423 |     6 |      true       | GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON TABLE settings TO admin; GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON TABLE settings TO root;                                            | root
movr            | NULL               | public                     | schema      | full        | NULL       | 2022-07-07 16:03:11.962683 |       NULL |  NULL |      true       | GRANT ALL ON SCHEMA public TO admin; GRANT CREATE, USAGE ON SCHEMA public TO public; GRANT ALL ON SCHEMA public TO root;                                                                  | admin
movr            | public             | users                      | table       | full        | NULL       | 2022-07-07 16:03:11.962683 |      57787 |   634 |      true       | GRANT ALL ON TABLE users TO admin; GRANT ALL ON TABLE users TO root;                                                                                                                      | root
~~~

You will receive an error if there is a collection of backups in the storage location that you pass to `SHOW BACKUP`. It is necessary to run `SHOW BACKUP` with the specific backup directory rather than the backup collection's top-level directory. Use [`SHOW BACKUPS IN`](#show-backups-in) with your storage location to list the backup directories it contains, which can then be run with `SHOW BACKUP` to inspect the metadata.

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
  database_name | parent_schema_name |        object_name         | object_type | backup_type | start_time |          end_time                 | size_bytes | rows | is_full_cluster
----------------+--------------------+----------------------------+-------------+-------------+------------------------------------------------+------------+------+------------------
  NULL          | NULL               | system                     | database    | full        |  NULL       | 2020-09-24 19:05:40.542168+00:00 |       NULL | NULL |      true
  system        | public             | users                      | table       | full        |  NULL       | 2020-09-24 19:05:40.542168+00:00 |        144 |    3 |      true
  system        | public             | zones                      | table       | full        |  NULL       | 2020-09-24 19:05:40.542168+00:00 |        201 |    7 |      true
  system        | public             | settings                   | table       | full        |  NULL       | 2020-09-24 19:05:40.542168+00:00 |        431 |    6 |      true
  system        | public             | ui                         | table       | full        |  NULL       | 2020-09-24 19:05:40.542168+00:00 |          0 |    0 |      true
  system        | public             | jobs                       | table       | full        |  NULL       | 2020-09-24 19:05:40.542168+00:00 |     434302 |   62 |      true
  system        | public             | locations                  | table       | full        |  NULL       | 2020-09-24 19:05:40.542168+00:00 |        261 |    5 |      true
  system        | public             | role_members               | table       | full        |  NULL       | 2020-09-24 19:05:40.542168+00:00 |        184 |    2 |      true
  system        | public             | comments                   | table       | full        |  NULL       | 2020-09-24 19:05:40.542168+00:00 |          0 |    0 |      true
  system        | public             | scheduled_jobs             | table       | full        |  NULL       | 2020-09-24 19:05:40.542168+00:00 |        875 |    2 |      true
  NULL          | NULL               | defaultdb                  | database    | full        |  NULL       | 2020-09-24 19:05:40.542168+00:00 |       NULL | NULL |      true
  NULL          | NULL               | postgres                   | database    | full        |  NULL       | 2020-09-24 19:05:40.542168+00:00 |       NULL | NULL |      true
  NULL          | NULL               | movr                       | database    | full        |  NULL       | 2020-09-24 19:05:40.542168+00:00 |       NULL | NULL |      true
  movr          | public             | users                      | table       | full        |  NULL       | 2020-09-24 19:05:40.542168+00:00 |       4911 |   50 |      true
  movr          | public             | vehicles                   | table       | full        |  NULL       | 2020-09-24 19:05:40.542168+00:00 |       3182 |   15 |      true
  movr          | public             | rides                      | table       | full        |  NULL       | 2020-09-24 19:05:40.542168+00:00 |     156387 |  500 |      true
  movr          | public             | vehicle_location_histories | table       | full        |  NULL       | 2020-09-24 19:05:40.542168+00:00 |      73918 | 1000 |      true
  movr          | public             | promo_codes                | table       | full        |  NULL       | 2020-09-24 19:05:40.542168+00:00 |     216083 | 1000 |      true
  movr          | public             | user_promo_codes           | table       | full        |  NULL       | 2020-09-24 19:05:40.542168+00:00 |          0 |    0 |      true
  defaultdb     | NULL               | org_one                    | schema      | full        |  NULL       | 2020-09-24 19:05:40.542168+00:00 |       NULL | NULL |      true
(20 rows)
~~~

### Show a backup with descriptor IDs

{% include_cached new-in.html version="v21.2" %} Use `WITH debug_ids` to display the descriptor IDs related to each object in the backup:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW BACKUP '/2021/11/15-150703.21' IN 's3://test/backup-test?AWS_ACCESS_KEY_ID=[placeholder]&AWS_SECRET_ACCESS_KEY=[placeholder]' WITH debug_ids;
~~~

~~~
database_name | database_id | parent_schema_name | parent_schema_id |        object_name         | object_id | object_type | backup_type |         start_time         |          end_time          | size_bytes | rows  | is_full_cluster
--------------+-------------+--------------------+------------------+----------------------------+-----------+-------------+-------------+----------------------------+----------------------------+------------+-------+------------------
NULL          |        NULL | NULL               |             NULL | movr                       |        52 | database    | full        | NULL                       | 2021-10-04 15:18:29.872912 |       NULL |  NULL |      false
movr          |          52 | public             |               29 | users                      |        53 | table       | full        | NULL                       | 2021-10-04 15:18:29.872912 |      35876 |   392 |      false
movr          |          52 | public             |               29 | vehicles                   |        54 | table       | full        | NULL                       | 2021-10-04 15:18:29.872912 |      25404 |   129 |      false
movr          |          52 | public             |               29 | rides                      |        55 | table       | full        | NULL                       | 2021-10-04 15:18:29.872912 |     280020 |   971 |      false
movr          |          52 | public             |               29 | vehicle_location_histories |        56 | table       | full        | NULL                       | 2021-10-04 15:18:29.872912 |     865205 | 12686 |      false
movr          |          52 | public             |               29 | promo_codes                |        57 | table       | full        | NULL                       | 2021-10-04 15:18:29.872912 |     229155 |  1043 |      false
movr          |          52 | public             |               29 | user_promo_codes           |        58 | table       | full        | NULL                       | 2021-10-04 15:18:29.872912 |      10824 |   128 |      false
NULL          |        NULL | NULL               |             NULL | movr                       |        52 | database    | incremental | 2021-10-04 15:18:29.872912 | 2021-10-04 15:18:53.354707 |       NULL |  NULL |      false
movr          |          52 | public             |               29 | users                      |        53 | table       | incremental | 2021-10-04 15:18:29.872912 | 2021-10-04 15:18:53.354707 |          0 |     0 |      false
movr          |          52 | public             |               29 | vehicles                   |        54 | table       | incremental | 2021-10-04 15:18:29.872912 | 2021-10-04 15:18:53.354707 |          0 |     0 |      false
movr          |          52 | public             |               29 | rides                      |        55 | table       | incremental | 2021-10-04 15:18:29.872912 | 2021-10-04 15:18:53.354707 |          0 |     0 |      false
movr          |          52 | public             |               29 | vehicle_location_histories |        56 | table       | incremental | 2021-10-04 15:18:29.872912 | 2021-10-04 15:18:53.354707 |          0 |     0 |      false
movr          |          52 | public             |               29 | promo_codes                |        57 | table       | incremental | 2021-10-04 15:18:29.872912 | 2021-10-04 15:18:53.354707 |          0 |     0 |      false
movr          |          52 | public             |               29 | user_promo_codes           |        58 | table       | incremental | 2021-10-04 15:18:29.872912 | 2021-10-04 15:18:53.354707 |          0 |     0 |      false
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
