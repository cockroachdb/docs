---
title: SHOW BACKUP
summary: The SHOW BACKUP statement lists the contents of a backup.
toc: true
docs_area: reference.sql
---

The `SHOW BACKUP` [statement]({% link {{ page.version.version }}/sql-statements.md %}) lists the contents of a backup created with the [`BACKUP`]({% link {{ page.version.version }}/backup.md %}) statement.

{{site.data.alerts.callout_danger}}
The `SHOW BACKUP` syntax **without** the `IN` keyword has been removed from CockroachDB v24.3 and later.

For guidance on the syntax for `SHOW BACKUP FROM`, refer to the [Synopsis](#synopsis) and [examples](#examples) on this page.
{{site.data.alerts.end}}

## Required privileges

`SHOW BACKUP` requires read permissions to its target destination.

{% include {{ page.version.version }}/misc/external-io-privilege.md %}

Either the `EXTERNALIOIMPLICITACCESS` [system-level privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) or the [`admin`]({% link {{ page.version.version }}/security-reference/authorization.md %}#admin-role) role is required for the following scenarios:

- Interacting with a cloud storage resource using [`IMPLICIT` authentication]({% link {{ page.version.version }}/cloud-storage-authentication.md %}).
- Using a [custom endpoint](https://docs.aws.amazon.com/sdk-for-go/api/aws/endpoints/) on S3.
- Using the [`cockroach nodelocal upload`]({% link {{ page.version.version }}/cockroach-nodelocal-upload.md %}) command.

No special privilege is required for:

- Interacting with an Amazon S3 and Google Cloud Storage resource using `SPECIFIED` credentials. Azure Storage is always `SPECIFIED` by default.
- Using [Userfile]({% link {{ page.version.version }}/use-userfile-storage.md %}) storage.

We recommend using [cloud storage]({% link {{ page.version.version }}/use-cloud-storage.md %}).

## Synopsis

<div>
{% include {{ page.version.version }}/backups/show-backup-replace-diagram.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`SHOW BACKUPS IN collectionURI` | List the backup paths in the given [collection URI]({% link {{ page.version.version }}/backup.md %}#backup-file-urls). [See the example](#view-a-list-of-the-available-full-backup-subdirectories).
`SHOW BACKUP FROM subdirectory IN collectionURI` | Show the details of backups in the subdirectory at the given [collection URI]({% link {{ page.version.version }}/backup.md %}#backup-file-urls). Also, use `FROM LATEST in collectionURI` to show the most recent backup. [See the example](#show-the-most-recent-backup).
`SHOW BACKUP SCHEMAS FROM subdirectory IN collectionURI` | Show the schema details of the backup in the given [collection URI]({% link {{ page.version.version }}/backup.md %}#backup-file-urls). [See the example](#show-a-backup-with-schemas).
`collectionURI` | The URI for the [backup storage]({% link {{ page.version.version }}/use-cloud-storage.md %}). <br>Note that `SHOW BACKUP` does not support listing backups if the [`nodelocal`]({% link {{ page.version.version }}/cockroach-nodelocal-upload.md %}) storage location is a symlink. Cockroach Labs recommends using remote storage for backups.
`kv_option_list` | Control the behavior of `SHOW BACKUP` with a comma-separated list of [these options](#options).

### Options

Option        | Value | Description
--------------+-------+-----------------------------------------------------
`as_json`   |  N/A  | [Display the backup's internal metadata](#show-a-backups-internal-metadata) as JSON in the response.
`check_files` |  N/A  | Validate that all files belonging to a backup are in the expected location in storage. See [Validate a backup's files](#validate-a-backups-files) for an example.
`debug_ids` |  N/A  |  [Display descriptor IDs](#show-a-backup-with-descriptor-ids) of every object in the backup, including the object's database and parent schema.
`encryption_passphrase`<a name="with-encryption-passphrase"></a> | [`STRING`]({% link {{ page.version.version }}/string.md %}) |  The passphrase used to [encrypt the files]({% link {{ page.version.version }}/take-and-restore-encrypted-backups.md %}) that the `BACKUP` statement generates (the data files and its manifest, containing the backup's metadata).
`kms`                                                            | [`STRING`]({% link {{ page.version.version }}/string.md %}) |  The URI of the cryptographic key stored in a key management service (KMS), or a comma-separated list of key URIs, used to [take and restore encrypted backups]({% link {{ page.version.version }}/take-and-restore-encrypted-backups.md %}#examples). Refer to [URI Formats]({% link {{ page.version.version }}/take-and-restore-encrypted-backups.md %}#uri-formats).
`incremental_location` | [`STRING`]({% link {{ page.version.version }}/string.md %}) | [List the details of an incremental backup](#show-a-backup-taken-with-the-incremental-location-option) taken with the [`incremental_location` option]({% link {{ page.version.version }}/backup.md %}#incr-location).
`privileges`  | N/A   |  List which users and roles had which privileges on each table in the backup. Displays original ownership of the backup.

## Response

The following fields are returned:

Field | Value | Description
------|-------|------------
`database_name` | [`STRING`]({% link {{ page.version.version }}/string.md %}) | The database name.
`parent_schema_name` | [`STRING`]({% link {{ page.version.version }}/string.md %}) | The name of the parent schema.
`object_name` | [`STRING`]({% link {{ page.version.version }}/string.md %}) | The name of the [database]({% link {{ page.version.version }}/create-database.md %}), [table]({% link {{ page.version.version }}/create-table.md %}), [type]({% link {{ page.version.version }}/create-type.md %}), or schema.
`object_type` | [`STRING`]({% link {{ page.version.version }}/string.md %}) | The type of object: [database]({% link {{ page.version.version }}/create-database.md %}), [table]({% link {{ page.version.version }}/create-table.md %}), [type]({% link {{ page.version.version }}/create-type.md %}), or schema.
`backup_type` | [`STRING`]({% link {{ page.version.version }}/string.md %}) | The type of backup: [full]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}#full-backups) or [incremental]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}#incremental-backups).
`start_time` | [`TIMESTAMPTZ`]({% link {{ page.version.version }}/timestamp.md %}) | The time of the earliest data encapsulated in the backup. Note that this only displays for incremental backups. For a full backup, this is `NULL`.
`end_time` | [`TIMESTAMPTZ`]({% link {{ page.version.version }}/timestamp.md %}) | The time to which data can be restored. This is equivalent to the [`AS OF SYSTEM TIME`]({% link {{ page.version.version }}/as-of-system-time.md %}) of the backup. If the backup was _not_ taken with [revision history]({% link {{ page.version.version }}/take-backups-with-revision-history-and-restore-from-a-point-in-time.md %}), the `end_time` is the _only_ time the data can be restored to. If the backup was taken with revision history, the `end_time` is the latest time the data can be restored to.
`size_bytes` | [`INT`]({% link {{ page.version.version }}/int.md %}) | The size of the backup objects, in bytes. Note that `size_bytes` indicates the logical size of the table objects, which is computed as the sum of the size of each key value pair. See `file_bytes` in this table for more detail.
`rows` | [`INT`]({% link {{ page.version.version }}/int.md %}) | Number of rows in tables that are part of the backup.
`create_statement` | [`STRING`]({% link {{ page.version.version }}/string.md %}) | The `CREATE` statement used to create [table(s)]({% link {{ page.version.version }}/create-table.md %}), [view(s)]({% link {{ page.version.version }}/create-view.md %}), or [sequence(s)]({% link {{ page.version.version }}/create-sequence.md %}) that are stored within the backup. This displays when `SHOW BACKUP SCHEMAS` is used. Note that tables with references to [foreign keys]({% link {{ page.version.version }}/foreign-key.md %}) will only display foreign key constraints if the table to which the constraint relates to is also included in the backup.
`is_full_cluster` |  [`BOOL`]({% link {{ page.version.version }}/bool.md %}) | Whether the backup is of a full cluster or not.
`regions` | [`STRING`]({% link {{ page.version.version }}/string.md %}) | The [`ALTER DATABASE`]({% link {{ page.version.version }}/alter-database.md %}) statement(s) used to configure [multiple database regions]({% link {{ page.version.version }}/multiregion-overview.md %}#database-regions), if they exist. If the database is a part of a single region cluster configuration, `NULL` will show.
`file_bytes` | [`INT`]({% link {{ page.version.version }}/int.md %}) | (With the `check_files` option only) The estimated bytes in external storage for a particular table object. This is the physical bytes that a given table object is taking up. For example, when the files are written to disk in storage they could be compressed. If you total all file bytes, the result is the physical bytes in your storage location. Note that for smaller tables the byte size in `file_bytes` may be larger than `size_bytes` because of the overhead required to create an SST file.
`path` | [`STRING`]({% link {{ page.version.version }}/string.md %}) | The list of the [full backup]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}#full-backups)'s subdirectories. This field is returned for `SHOW BACKUPS IN collectionURI` only. The path format is `<year>/<month>/<day>-<timestamp>`.

See [Show a backup with descriptor IDs](#show-a-backup-with-descriptor-ids) for the responses displayed when the `WITH debug_ids` option is specified.

## Examples

{% include {{ page.version.version }}/backups/bulk-auth-options.md %}

### View a list of the available full backup subdirectories

<a name="show-backups-in"></a>To view a list of the available [full backups]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}#full-backups) subdirectories, use the following command:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW BACKUPS IN 'external://backup_s3';
~~~

~~~
        path
-------------------------
/2022/04/13-202334.48
/2022/04/13-202413.70
(2 rows)
~~~

The path format is `<year>/<month>/<day>-<timestamp>`.

### Show the most recent backup

To view the most recent backup, use the `LATEST` syntax:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW BACKUP FROM LATEST IN 'external://backup_s3';
~~~

~~~
database_name | parent_schema_name |        object_name         | object_type | backup_type | start_time |          end_time          | size_bytes | rows | is_full_cluster |                                             regions
----------------+--------------------+----------------------------+-------------+-------------+------------+----------------------------+------------+------+-----------------+--------------------------------------------------------------------------------------------------
NULL          | NULL               | movr                       | database    | full        | NULL       | 2023-05-23 15:27:33.251745 |       NULL | NULL |        f        | ALTER DATABASE movr SET PRIMARY REGION "us-east-2"; ALTER DATABASE movr ADD REGION "us-west-1";
movr          | NULL               | public                     | schema      | full        | NULL       | 2023-05-23 15:27:33.251745 |       NULL | NULL |        f        | NULL
movr          | public             | users                      | table       | full        | NULL       | 2023-05-23 15:27:33.251745 |      30069 |  327 |        f        | NULL
movr          | public             | vehicles                   | table       | full        | NULL       | 2023-05-23 15:27:33.251745 |      17456 |   88 |        f        | NULL
movr          | public             | rides                      | table       | full        | NULL       | 2023-05-23 15:27:33.251745 |     251254 |  862 |        f        | NULL
movr          | public             | vehicle_location_histories | table       | full        | NULL       | 2023-05-23 15:27:33.251745 |     660910 | 9649 |        f        | NULL
movr          | public             | promo_codes                | table       | full        | NULL       | 2023-05-23 15:27:33.251745 |     227789 | 1020 |        f        | NULL
movr          | public             | user_promo_codes           | table       | full        | NULL       | 2023-05-23 15:27:33.251745 |       6973 |   83 |        f        | NULL
movr          | public             | crdb_internal_region       | type        | full        | NULL       | 2023-05-23 15:27:33.251745 |       NULL | NULL |        f        | NULL
movr          | public             | _crdb_internal_region      | type        | full        | NULL       | 2023-05-23 15:27:33.251745 |       NULL | NULL |        f        | NULL
(10 rows)
~~~

### View a list of the full and incremental backups in a specific full backup subdirectory

To view a list of the [full]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}#full-backups) and [incremental]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}#incremental-backups) backups in a specific subdirectory, use the following command:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW BACKUP FROM '2022/04/08-142355.33' IN 'external://backup_s3';
~~~

~~~
database_name | parent_schema_name |        object_name         | object_type | backup_type |        start_time         |          end_time          | size_bytes | rows  | is_full_cluster
--------------+--------------------+----------------------------+-------------+-------------+---------------------------+----------------------------+------------+-------+------------------
NULL          | NULL               | movr                       | database    | full        | NULL                      | 2022-04-08 14:23:55.33557  |       NULL |  NULL |      false
movr          | NULL               | public                     | schema      | full        | NULL                      | 2022-04-08 14:23:55.33557  |       NULL |  NULL |      false
movr          | public             | users                      | table       | full        | NULL                      | 2022-04-08 14:23:55.33557  |      25856 |   281 |      false
NULL          | NULL               | system                     | database    | incremental | 2022-04-08 14:23:55.33557 | 2022-04-08 14:26:01.699694 |       NULL |  NULL |      true
system        | public             | users                      | table       | incremental | 2022-04-08 14:23:55.33557 | 2022-04-08 14:26:01.699694 |         99 |     2 |      true
system        | public             | zones                      | table       | incremental | 2022-04-08 14:23:55.33557 | 2022-04-08 14:26:01.699694 |        236 |     8 |      true
system        | public             | settings                   | table       | incremental | 2022-04-08 14:23:55.33557 | 2022-04-08 14:26:01.699694 |        372 |     5 |      true
system        | public             | ui                         | table       | incremental | 2022-04-08 14:23:55.33557 | 2022-04-08 14:26:01.699694 |          0 |     0 |      true
system        | public             | jobs                       | table       | incremental | 2022-04-08 14:23:55.33557 | 2022-04-08 14:26:01.699694 |      30148 |    23 |      true
system        | public             | locations                  | table       | incremental | 2022-04-08 14:23:55.33557 | 2022-04-08 14:26:01.699694 |        261 |     5 |      true
system        | public             | role_members               | table       | incremental | 2022-04-08 14:23:55.33557 | 2022-04-08 14:26:01.699694 |         94 |     1 |      true
. . .
~~~

### Show a backup taken with the incremental location option

To view an incremental backup that was taken with the `incremental_location` option, run `SHOW BACKUP` with the full backup and incremental backup location following the original `BACKUP` statement.

You can use the option to show the most recent backup where `incremental_location` has stored the backup:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW BACKUP FROM LATEST IN {'full backup collectionURI'} WITH incremental_location = {'incremental backup collectionURI'};
~~~

~~~
database_name | parent_schema_name |        object_name         | object_type | backup_type |         start_time         |          end_time          | size_bytes | rows  | is_full_cluster
--------------+--------------------+----------------------------+-------------+-------------+----------------------------+----------------------------+------------+-------+------------------
NULL          | NULL               | movr                       | database    | full        | NULL                       | 2022-04-13 20:01:15.177739 |       NULL |  NULL |      false
movr          | NULL               | public                     | schema      | full        | NULL                       | 2022-04-13 20:01:15.177739 |       NULL |  NULL |      false
movr          | public             | rides                      | table       | full        | NULL                       | 2022-04-13 20:01:15.177739 |     395716 |  1415 |      false
NULL          | NULL               | system                     | database    | incremental | 2022-04-13 20:01:15.177739 | 2022-04-13 20:05:04.2049   |       NULL |  NULL |      true
system        | public             | users                      | table       | incremental | 2022-04-13 20:01:15.177739 | 2022-04-13 20:05:04.2049   |         99 |     2 |      true
system        | public             | scheduled_jobs             | table       | incremental | 2022-04-13 20:01:15.177739 | 2022-04-13 20:05:04.2049   |        250 |     1 |      true
system        | public             | database_role_settings     | table       | incremental | 2022-04-13 20:01:15.177739 | 2022-04-13 20:05:04.2049   |          0 |     0 |      true
system        | public             | tenant_settings            | table       | incremental | 2022-04-13 20:01:15.177739 | 2022-04-13 20:05:04.2049   |          0 |     0 |      true
NULL          | NULL               | defaultdb                  | database    | incremental | 2022-04-13 20:01:15.177739 | 2022-04-13 20:05:04.2049   |       NULL |  NULL |      true
defaultdb     | NULL               | public                     | schema      | incremental | 2022-04-13 20:01:15.177739 | 2022-04-13 20:05:04.2049   |       NULL |  NULL |      true
NULL          | NULL               | postgres                   | database    | incremental | 2022-04-13 20:01:15.177739 | 2022-04-13 20:05:04.2049   |       NULL |  NULL |      true
postgres      | NULL               | public                     | schema      | incremental | 2022-04-13 20:01:15.177739 | 2022-04-13 20:05:04.2049   |       NULL |  NULL |      true
NULL          | NULL               | movr                       | database    | incremental | 2022-04-13 20:01:15.177739 | 2022-04-13 20:05:04.2049   |       NULL |  NULL |      true
movr          | NULL               | public                     | schema      | incremental | 2022-04-13 20:01:15.177739 | 2022-04-13 20:05:04.2049   |       NULL |  NULL |      true
movr          | public             | users                      | table       | incremental | 2022-04-13 20:01:15.177739 | 2022-04-13 20:05:04.2049   |      81098 |   892 |      true
movr          | public             | vehicles                   | table       | incremental | 2022-04-13 20:01:15.177739 | 2022-04-13 20:05:04.2049   |      57755 |   296 |      true
. . .
~~~

### Show locality-aware backups

{% include {{ page.version.version }}/backups/locality-aware-backups.md %}

### Show a backup with schemas

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW BACKUP SCHEMAS FROM '2022/04/08-142601.69' IN 'external://backup_s3';
~~~

~~~
database_name | parent_schema_name |        object_name         | object_type | backup_type |        start_time         |          end_time          | size_bytes | rows  | is_full_cluster |                                                                                                                create_statement
--------------+--------------------+----------------------------+-------------+-------------+---------------------------+----------------------------+------------+-------+-----------------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
NULL          | NULL               | movr                       | database    | full        | NULL                      | 2022-04-08 14:23:55.33557  |       NULL |  NULL |      false      | NULL
movr          | NULL               | public                     | schema      | full        | NULL                      | 2022-04-08 14:23:55.33557  |       NULL |  NULL |      false      | NULL
movr          | public             | users                      | table       | full        | NULL                      | 2022-04-08 14:23:55.33557  |      25856 |   281 |      false      | CREATE TABLE users (
              |                    |                            |             |             |                           |                            |            |       |                 |     id UUID NOT NULL,
              |                    |                            |             |             |                           |                            |            |       |                 |     city VARCHAR NOT NULL,
              |                    |                            |             |             |                           |                            |            |       |                 |     name VARCHAR NULL,
              |                    |                            |             |             |                           |                            |            |       |                 |     address VARCHAR NULL,
              |                    |                            |             |             |                           |                            |            |       |                 |     credit_card VARCHAR NULL,
              |                    |                            |             |             |                           |                            |            |       |                 |     CONSTRAINT users_pkey PRIMARY KEY (city ASC, id ASC)
              |                    |                            |             |             |                           |                            |            |       |                 | )
NULL          | NULL               | system                     | database    | incremental | 2022-04-08 14:23:55.33557 | 2022-04-08 14:26:01.699694 |       NULL |  NULL |      true       | NULL
system        | public             | users                      | table       | incremental | 2022-04-08 14:23:55.33557 | 2022-04-08 14:26:01.699694 |         99 |     2 |      true       | CREATE TABLE users (
              |                    |                            |             |             |                           |                            |            |       |                 |     username STRING NOT NULL,
              |                    |                            |             |             |                           |                            |            |       |                 |     "hashedPassword" BYTES NULL,
              |                    |                            |             |             |                           |                            |            |       |                 |     "isRole" BOOL NOT NULL DEFAULT false,
              |                    |                            |             |             |                           |                            |            |       |                 |     CONSTRAINT "primary" PRIMARY KEY (username ASC),
              |                    |                            |             |             |                           |                            |            |       |                 |     FAMILY "primary" (username),
              |                    |                            |             |             |                           |                            |            |       |                 |     FAMILY "fam_2_hashedPassword" ("hashedPassword"),
              |                    |                            |             |             |                           |                            |            |       |                 |     FAMILY "fam_3_isRole" ("isRole")
              |                    |                            |             |             |                           |                            |            |       |                 | )
. . .
~~~

### Show a backup with privileges

Use the `WITH privileges` [option](#options) to view a list of which users and roles had which privileges on each database and table in the backup. This parameter also displays the original owner of objects in the backup:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW BACKUP FROM '2022/07/07-160311.96' IN 'external://backup_s3' WITH privileges;
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

 When a [backup is created by a schedule]({% link {{ page.version.version }}/create-schedule-for-backup.md %}), it is stored within a collection of backups in the given collection URI. To view details for a backup created by a schedule, you can use the following:

- `SHOW BACKUPS IN collectionURI` statement to [view a list of the available full backup subdirectories](#view-a-list-of-the-available-full-backup-subdirectories).
- `SHOW BACKUP FROM subdirectory IN collectionURI` statement to [view a list of the full and incremental backups that are stored in a specific full backup's subdirectory](#view-a-list-of-the-full-and-incremental-backups-in-a-specific-full-backup-subdirectory).

### Show an encrypted backup

Depending on how the backup was [encrypted]({% link {{ page.version.version }}/take-and-restore-encrypted-backups.md %}), use the [`encryption_passphrase` option]({% link {{ page.version.version }}/backup.md %}#with-encryption-passphrase) and the same passphrase that was used to create the backup:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW BACKUP FROM '2020/09/24-190540.54' IN 's3://{bucket name}?AWS_ACCESS_KEY_ID={placeholder}&AWS_SECRET_ACCESS_KEY={placeholder}'
      WITH encryption_passphrase = 'password123';
~~~

Or, use the `kms` option and the same KMS URI that was used to create the backup:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW BACKUP FROM '2020/09/24-190540.54' IN 's3://test/backups/test_explicit_kms?AWS_ACCESS_KEY_ID=123&AWS_SECRET_ACCESS_KEY=123'
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

 Use `WITH debug_ids` to display the descriptor IDs related to each object in the backup:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW BACKUP FROM '/2021/11/15-150703.21' IN 'external://backup_s3' WITH debug_ids;
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

### Validate a backup's files

{% include {{ page.version.version }}/backups/check-files-validate.md %}

For more information on validating a backup, see the [Backup Validation]({% link {{ page.version.version }}/backup-validation.md %}) page.

### Show a backup's internal metadata

Use the `WITH as_json` option to output a backup's internal metadata, contained in its manifest file, as a JSON value:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW BACKUP FROM '/2021/11/15-150703.21' IN 'external://backup_s3' WITH as_json;
~~~

The response will include a `manifest` column with the file's contents as the JSON value. Use [JSONB functions]({% link {{ page.version.version }}/functions-and-operators.md %}#jsonb-functions) to query particular data or edit the format of the response.

{{site.data.alerts.callout_info}}
The response returned from `SHOW BACKUP FROM ... WITH as_json` is a backup's internal metadata. This content is subject to change from version to version of CockroachDB and does not offer the same stability guarantees as the other `SHOW BACKUP` [options](#options) and their [responses](#response). As a result, `as_json` should **only** be used for debugging or general inspection purposes.
{{site.data.alerts.end}}

For example, to return a specific entry from the JSON response as a [`string`]({% link {{ page.version.version }}/string.md %}) indented and with newlines use the [`jsonb_pretty()`]({% link {{ page.version.version }}/functions-and-operators.md %}#jsonb-functions) function:

{% include_cached copy-clipboard.html %}
~~~ sql
WITH x AS (SHOW BACKUP FROM '/2021/11/15-150703.21' IN 'external://backup_s3' with as_json) SELECT jsonb_pretty(manifest->'entryCounts') AS f FROM x;
~~~

~~~ json
  {
      "dataSize": "458371",
      "indexEntries": "1015",
      "rows": "2565"
  }
~~~

To query for particular data, use the [`jsonb_array_elements()` function]({% link {{ page.version.version }}/functions-and-operators.md %}#jsonb-functions) to expand the desired elements from the JSON response. The following query returns the paths to each of the data files within the backup:

{% include_cached copy-clipboard.html %}
~~~ sql
WITH x AS (SHOW BACKUP FROM '/2021/11/15-150703.21' IN 'external://backup_s3' WITH as_json) SELECT f->>'path' FROM (SELECT jsonb_array_elements(manifest->'files') AS f FROM x);
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

- [`BACKUP`]({% link {{ page.version.version }}/backup.md %})
- [`RESTORE`]({% link {{ page.version.version }}/restore.md %})
