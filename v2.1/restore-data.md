---
title: Restore Data
summary: Learn how to back up and restore a CockroachDB cluster.
toc: false
---

How you restore your cluster's data depends on the type of [backup](backup.html) originally:

Backup Type | Restore using...
------------|-----------------
[`cockroach dump`](sql-dump.html) | [Import data](import-data.html#import-from-generic-sql-dump)
[`BACKUP`](backup.html)<br/>(*[enterprise license](https://www.cockroachlabs.com/pricing/) only*) | [`RESTORE`](restore.html)

If you created a back up from another database and want to import it into CockroachDB, see [Import data](import-data.html).

## See also

- [Use the Built-in SQL Client](use-the-built-in-sql-client.html)
- [Other Cockroach Commands](cockroach-commands.html)
