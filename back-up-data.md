---
title: Back Up Data
summary: Learn how to back up and restore a CockroachDB cluster.
toc: false
---

CockroachDB offers two methods to back up your cluster's data:

- [`cockroach dump`](sql-dump.html), which is a CLI command to dump/export your database's schema and table data.
- [`BACKUP`](backup.html) (*[enterprise license](https://www.cockroachlabs.com/pricing/) only*), which is a SQL statement that backs up your cluster to cloud or network file storage.

### Details

We recommend creating daily backups of your data for general as an operational best practice.

## Restore

For information about restoring data you have in a backup, see [Restoring Data](restore-data.html).

## See Also

- [Restore Data](restore-data.html)
- [Use the Built-in SQL Client](use-the-built-in-sql-client.html)
- [Other Cockroach Commands](cockroach-commands.html)
