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
`start_time` | The time at which the backup was started. For a full backup, this will be empty.
`end_time` | The time at which the backup was completed.
`size_bytes` | The size of the backup, in bytes.

## Example

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

## See also

- [`BACKUP`](backup.html)
- [`RESTORE`](restore.html)
