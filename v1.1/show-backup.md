---
title: SHOW BACKUP
summary: The SHOW BACKUP statement lists the contents of a backup.
toc: false
---

<span class="version-tag">New in v1.1:</span> The `SHOW BACKUP` [statement](sql-statements.html) list the contents of a backup created
with the [`BACKUP` statement](backup.html).

<div id="toc"></div>

## Required Privileges

Only the `root` user can run `SHOW BACKUP`.

## Synopsis

{% include sql/{{ page.version.version }}/diagrams/show_backup.html %}

## Parameters

Parameter | Description
----------|------------
`location` | The location of the backup to inspect.

## Response

The following fields are returned.

Field | Description
------|------------
`database` | The database name.
`table` | The table name.
`start_time` | The time at which the backup was started.
`end_time` | The time at which the backup was completed.
`size_bytes` | The size of the backup, in bytes.

## Example

~~~ sql
> SHOW BACKUP 'azure://acme-co-backup/table-customer-2017-03-27-full?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co';
~~~

## See Also

- [`BACKUP`](backup.html)
- [`RESTORE`](restore.html)
