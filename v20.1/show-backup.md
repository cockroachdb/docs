---
title: SHOW BACKUP
summary: The SHOW BACKUP statement lists the contents of a backup.
toc: true
---

The `SHOW BACKUP` [statement](sql-statements.html) lists the contents of an enterprise backup created with the [`BACKUP`](backup.html) statement.

## Required privileges

Only members of the `admin` role can run `SHOW BACKUP`. By default, the `root` user belongs to the `admin` role.

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/show_backup.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`location` | The location of the backup to inspect. For more details, see [Backup File URLs](backup.html#backup-file-urls).
`kv_option_list` | Control the show behavior with a comma-separated list of [these options](#options).

### Options

Option       | Value | Description
-------------+-------+-----------------------------------------------------
`privileges` | N/A   | <span class="version-tag">New in v20.1:</span> List which users and roles had which privileges on each table in the backup.
`encryption_passphrase`<a name="with-encryption-passphrase"></a> | [`STRING`](string.html) | <span class="version-tag">New in v20.1:</span> The passphrase used to [encrypt the files](backup-and-restore.html) (`BACKUP` manifest and data files) that the `BACKUP` statement generates.

## Response

The following fields are returned.

Field | Description
------|------------
`database_name` | The database name.
`table_name` | The table name.
`start_time` | The time of the earliest data encapsulated in the backup. Note that this only displays for incremental backups. For a full backup, this is `NULL`.
`end_time` | The time to which data can be restored. This is equivalent to the [`AS OF SYSTEM TIME`](as-of-system-time.html) of the backup. If the backup was _not_ taken with [revision history](backup-and-restore.html), the `end_time` is the _only_ time the data can be restored to. If the backup was taken with revision history, the `end_time` is the latest time the data can be restored to.
`size_bytes` | The size of the backup, in bytes.
`create_statement` | The `CREATE` statement used to create [table(s)](create-table.html), [view(s)](create-view.html), or [sequence(s)](create-sequence.html) that are stored within the backup. This displays when `SHOW BACKUP SCHEMAS` is used. Note that tables with references to [foreign keys](foreign-key.html) will only display foreign key constraints if the table to which the constraint relates to is also included in the backup.
`is_full_cluster` | <span class="version-tag">New in v20.1:</span> Whether the backup is of a full cluster or not.

## Example

### Show a backup

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW BACKUP 's3://test/backup-test?AWS_ACCESS_KEY_ID=[placeholder]&AWS_SECRET_ACCESS_KEY=[placeholder]';
~~~

~~~
  database_name |         table_name         | start_time |             end_time             | size_bytes | rows | is_full_cluster
----------------+----------------------------+------------+----------------------------------+------------+------+------------------
  system        | users                      | NULL       | 2020-04-08 14:38:45.288266+00:00 |         99 |    2 |      true
  system        | zones                      | NULL       | 2020-04-08 14:38:45.288266+00:00 |        268 |    7 |      true
  system        | settings                   | NULL       | 2020-04-08 14:38:45.288266+00:00 |        374 |    5 |      true
  system        | ui                         | NULL       | 2020-04-08 14:38:45.288266+00:00 |          0 |    0 |      true
  system        | jobs                       | NULL       | 2020-04-08 14:38:45.288266+00:00 |       9588 |   16 |      true
  system        | locations                  | NULL       | 2020-04-08 14:38:45.288266+00:00 |        261 |    5 |      true
  system        | role_members               | NULL       | 2020-04-08 14:38:45.288266+00:00 |         94 |    1 |      true
  system        | comments                   | NULL       | 2020-04-08 14:38:45.288266+00:00 |          0 |    0 |      true
  movr          | users                      | NULL       | 2020-04-08 14:38:45.288266+00:00 |       4911 |   50 |      true
  movr          | vehicles                   | NULL       | 2020-04-08 14:38:45.288266+00:00 |       3182 |   15 |      true
  movr          | rides                      | NULL       | 2020-04-08 14:38:45.288266+00:00 |     156387 |  500 |      true
  movr          | vehicle_location_histories | NULL       | 2020-04-08 14:38:45.288266+00:00 |      73918 | 1000 |      true
  movr          | promo_codes                | NULL       | 2020-04-08 14:38:45.288266+00:00 |     219973 | 1000 |      true
  movr          | user_promo_codes           | NULL       | 2020-04-08 14:38:45.288266+00:00 |          0 |    0 |      true
(14 rows)
~~~

### Show a backup with schemas

You can add number of rows and the schema of the backed up table.

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW BACKUP SCHEMAS 's3://test/backup-test?AWS_ACCESS_KEY_ID=[placeholder]&AWS_SECRET_ACCESS_KEY=[placeholder]';
~~~

~~~
  database_name |         table_name         | start_time |             end_time             | size_bytes | rows | is_full_cluster |                                                        create_statement
----------------+----------------------------+------------+----------------------------------+------------+------+-----------------+----------------------------------------------------------------------------------------------------------------------------------
...
  movr          | users                      | NULL       | 2020-04-08 14:38:45.288266+00:00 |       4911 |   50 |      true       | CREATE TABLE users (
                |                            |            |                                  |            |      |                 |     id UUID NOT NULL,
                |                            |            |                                  |            |      |                 |     city VARCHAR NOT NULL,
                |                            |            |                                  |            |      |                 |     name VARCHAR NULL,
                |                            |            |                                  |            |      |                 |     address VARCHAR NULL,
                |                            |            |                                  |            |      |                 |     credit_card VARCHAR NULL,
                |                            |            |                                  |            |      |                 |     CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC),
                |                            |            |                                  |            |      |                 |     FAMILY "primary" (id, city, name, address, credit_card)
                |                            |            |                                  |            |      |                 | )
  movr          | vehicles                   | NULL       | 2020-04-08 14:38:45.288266+00:00 |       3182 |   15 |      true       | CREATE TABLE vehicles (
                |                            |            |                                  |            |      |                 |     id UUID NOT NULL,
                |                            |            |                                  |            |      |                 |     city VARCHAR NOT NULL,
                |                            |            |                                  |            |      |                 |     type VARCHAR NULL,
                |                            |            |                                  |            |      |                 |     owner_id UUID NULL,
                |                            |            |                                  |            |      |                 |     creation_time TIMESTAMP NULL,
                |                            |            |                                  |            |      |                 |     status VARCHAR NULL,
                |                            |            |                                  |            |      |                 |     current_location VARCHAR NULL,
                |                            |            |                                  |            |      |                 |     ext JSONB NULL,
                |                            |            |                                  |            |      |                 |     CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC),
                |                            |            |                                  |            |      |                 |     CONSTRAINT fk_city_ref_users FOREIGN KEY (city, owner_id) REFERENCES users(city, id),
                |                            |            |                                  |            |      |                 |     INDEX vehicles_auto_index_fk_city_ref_users (city ASC, owner_id ASC),
                |                            |            |                                  |            |      |                 |     FAMILY "primary" (id, city, type, owner_id, creation_time, status, current_location, ext)
                |                            |            |                                  |            |      |                 | )
...

(14 rows)
~~~

### Show a backup with privileges

<span class="version-tag">New in v20.1:</span>  To view a list of which users and roles had which privileges on each database and table in the backup, use the `WITH privileges` [parameter](#parameters):

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW BACKUP 's3://test/backup-test?AWS_ACCESS_KEY_ID=[placeholder]&AWS_SECRET_ACCESS_KEY=[placeholder]' WITH privileges;
~~~

~~~
  database_name |         table_name         | start_time |             end_time             | size_bytes | rows | is_full_cluster |                                                                               privileges
----------------+----------------------------+------------+----------------------------------+------------+------+-----------------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  system        | users                      | NULL       | 2020-04-08 14:38:45.288266+00:00 |         99 |    2 |      true       | GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON users TO admin; GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON users TO root;
  system        | zones                      | NULL       | 2020-04-08 14:38:45.288266+00:00 |        268 |    7 |      true       | GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON zones TO admin; GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON zones TO root;
  system        | settings                   | NULL       | 2020-04-08 14:38:45.288266+00:00 |        374 |    5 |      true       | GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON settings TO admin; GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON settings TO root;
  system        | ui                         | NULL       | 2020-04-08 14:38:45.288266+00:00 |          0 |    0 |      true       | GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON ui TO admin; GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON ui TO root;
  system        | jobs                       | NULL       | 2020-04-08 14:38:45.288266+00:00 |       9588 |   16 |      true       | GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON jobs TO admin; GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON jobs TO root;
  system        | locations                  | NULL       | 2020-04-08 14:38:45.288266+00:00 |        261 |    5 |      true       | GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON locations TO admin; GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON locations TO root;
  system        | role_members               | NULL       | 2020-04-08 14:38:45.288266+00:00 |         94 |    1 |      true       | GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON role_members TO admin; GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON role_members TO root;
  system        | comments                   | NULL       | 2020-04-08 14:38:45.288266+00:00 |          0 |    0 |      true       | GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON comments TO admin; GRANT SELECT ON comments TO public; GRANT DELETE, GRANT, INSERT, SELECT, UPDATE ON comments TO root;
  movr          | users                      | NULL       | 2020-04-08 14:38:45.288266+00:00 |       4911 |   50 |      true       | GRANT ALL ON users TO admin; GRANT ALL ON users TO root;
  movr          | vehicles                   | NULL       | 2020-04-08 14:38:45.288266+00:00 |       3182 |   15 |      true       | GRANT ALL ON vehicles TO admin; GRANT ALL ON vehicles TO root;
  movr          | rides                      | NULL       | 2020-04-08 14:38:45.288266+00:00 |     156387 |  500 |      true       | GRANT ALL ON rides TO admin; GRANT ALL ON rides TO root;
  movr          | vehicle_location_histories | NULL       | 2020-04-08 14:38:45.288266+00:00 |      73918 | 1000 |      true       | GRANT ALL ON vehicle_location_histories TO admin; GRANT ALL ON vehicle_location_histories TO root;
  movr          | promo_codes                | NULL       | 2020-04-08 14:38:45.288266+00:00 |     219973 | 1000 |      true       | GRANT ALL ON promo_codes TO admin; GRANT ALL ON promo_codes TO root;
  movr          | user_promo_codes           | NULL       | 2020-04-08 14:38:45.288266+00:00 |          0 |    0 |      true       | GRANT ALL ON user_promo_codes TO admin; GRANT ALL ON user_promo_codes TO root;
(14 rows)
~~~

## See also

- [`BACKUP`](backup.html)
- [`RESTORE`](restore.html)
