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

## Response

The following fields are returned.

Field | Description
------|------------
`database_name` | The database name.
`table_name` | The table name.
`start_time` | The time of the earliest data encapsulated in the backup. Note that this only displays for incremental backups. For a full backup, this is `NULL`.
`end_time` | The time to which data can be restored. This is equivalent to the [`AS OF SYSTEM TIME`](as-of-system-time.html) of the backup. If the backup was _not_ taken with [revision history](backup.html#backups-with-revision-history), the `end_time` is the _only_ time the data can be restored to. If the backup was taken with revision history, the `end_time` is the latest time the data can be restored to.
`size_bytes` | The size of the backup, in bytes.
`create_statement` | <span class="version-tag">New in v19.2:</span> The `CREATE` statement used to create [table(s)](create-table.html), [view(s)](create-view.html), or [sequence(s)](create-sequence.html) that are stored within the backup. This displays when `SHOW BACKUP SCHEMAS` is used. Note that tables with references to [foreign keys](foreign-key.html) will only display foreign key constraints if the table to which the constraint relates to is also included in the backup.

## Example

### Show a backup

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW BACKUP 'azure://acme-co-backup/tpch-2017-03-27-full?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co';
~~~

~~~
+---------------+---------------+------------+----------------------------------+------------+
| database_name |  table_name   | start_time |             end_time             | size_bytes |
+---------------+---------------+------------+----------------------------------+------------+
| tpch          | nation        |            | 2017-03-27 13:54:31.371103+00:00 |       3828 |
| tpch          | region        |            | 2017-03-27 13:54:31.371103+00:00 |       6626 |
| tpch          | part          |            | 2017-03-27 13:54:31.371103+00:00 |       8128 |
| tpch          | supplier      |            | 2017-03-27 13:54:31.371103+00:00 |       2834 |
| tpch          | partsupp      |            | 2017-03-27 13:54:31.371103+00:00 |       3884 |
| tpch          | customer      |            | 2017-03-27 13:54:31.371103+00:00 |      12736 |
| tpch          | orders        |            | 2017-03-27 13:54:31.371103+00:00 |       6020 |
| tpch          | lineitem      |            | 2017-03-27 13:54:31.371103+00:00 |     729811 |
+---------------+---------------+------------+----------------------------------+------------+
(8 rows)

Time: 32.540353ms
~~~

### Show a backup with schemas

<span class="version-tag">New in v19.2:</span> You can add number of rows and the schema of the backed up table.

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW BACKUP SCHEMAS 'nodelocal:///extern/employee.sql';
~~~

~~~
  database_name | table_name | start_time |             end_time             | size_bytes | rows |                      create_statement
+---------------+------------+------------+----------------------------------+------------+------+-------------------------------------------------------------+
  movr          | users      | NULL       | 2019-09-19 14:51:03.943785+00:00 |       4913 |   50 | CREATE TABLE users (
                |            |            |                                  |            |      |     id UUID NOT NULL,
                |            |            |                                  |            |      |     city VARCHAR NOT NULL,
                |            |            |                                  |            |      |     name VARCHAR NULL,
                |            |            |                                  |            |      |     address VARCHAR NULL,
                |            |            |                                  |            |      |     credit_card VARCHAR NULL,
                |            |            |                                  |            |      |     CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC),
                |            |            |                                  |            |      |     FAMILY "primary" (id, city, name, address, credit_card)
                |            |            |                                  |            |      | )
(1 row)

Time: 30.337ms
~~~

## See also

- [`BACKUP`](backup.html)
- [`RESTORE`](restore.html)
