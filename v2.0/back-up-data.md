---
title: Back Up Data
summary: Learn how to back up and restore a CockroachDB cluster.
toc: false
---

CockroachDB offers the following methods to back up your cluster's data:

- [`cockroach dump`](sql-dump.html), which is a CLI command to dump/export your database's schema and table data.
- [`BACKUP`](backup.html) (*[enterprise license](https://www.cockroachlabs.com/pricing/) only*), which is a SQL statement that backs up your cluster to cloud or network file storage.

### Details

We recommend creating daily backups of your data as an operational best practice.

However, because CockroachDB is designed with high fault tolerance, backups are primarily needed for disaster recovery (i.e., if your cluster loses a majority of its nodes). Isolated issues (such as small-scale node outages) do not require any intervention.

## Restore

For information about restoring your backed up data, see [Restoring Data](restore-data.html).

## See Also

- [Restore Data](restore-data.html)
- [Use the Built-in SQL Client](use-the-built-in-sql-client.html)
- [Other Cockroach Commands](cockroach-commands.html)
