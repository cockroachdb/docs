---
title: SHOW BACKUP
summary: The SHOW BACKUP statement lists the contents of a backup.
toc: true
---

<span class="version-tag">New in v1.1:</span> The `SHOW BACKUP` [statement](sql-statements.html) lists the contents of an enterprise backup created with the [`BACKUP`](backup.html) statement.


## Required Privileges

Only the `root` user can run `SHOW BACKUP`.

## Synopsis

{% include {{ page.version.version }}/sql/diagrams/show_backup.html %}

## Parameters

Parameter | Description
----------|------------
`location` | The location of the backup to inspect. For more details, see [Backup File URLs](backup.html#backup-file-urls).

## Response

The following fields are returned.

Field | Description
------|------------
`database` | The database name.
`table` | The table name.
`start_time` | The time at which the backup was started. For a full backup, this will be empty.
`end_time` | The time at which the backup was completed.
`size_bytes` | The size of the backup, in bytes.

## Example

~~~ sql
> SHOW BACKUP 'azure://acme-co-backup/tpch-2017-03-27-full?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co';
~~~

~~~
+----------+----------+------------+----------------------------------+------------+
| database |  table   | start_time |             end_time             | size_bytes |
+----------+----------+------------+----------------------------------+------------+
| tpch     | nation   |            | 2017-03-27 13:54:31.371103+00:00 |       3828 |
| tpch     | region   |            | 2017-03-27 13:54:31.371103+00:00 |       6626 |
| tpch     | part     |            | 2017-03-27 13:54:31.371103+00:00 |       8128 |
| tpch     | supplier |            | 2017-03-27 13:54:31.371103+00:00 |       2834 |
| tpch     | partsupp |            | 2017-03-27 13:54:31.371103+00:00 |       3884 |
| tpch     | customer |            | 2017-03-27 13:54:31.371103+00:00 |      12736 |
| tpch     | orders   |            | 2017-03-27 13:54:31.371103+00:00 |       6020 |
| tpch     | lineitem |            | 2017-03-27 13:54:31.371103+00:00 |     729811 |
+----------+----------+------------+----------------------------------+------------+
(8 rows)

Time: 32.540353ms
~~~

## See Also

- [`BACKUP`](backup.html)
- [`RESTORE`](restore.html)
