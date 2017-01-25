---
title: Restore Data
summary: Learn how to back up and restore a CockroachDB cluster.
toc: false
---

How you restore your cluster's data depends on how you [backed it up](back-up-data.html) originally:

Backup Type | Restore using...
------------|-----------------
`.sql`, `.csv` | [Import data](import-data.html)
[`BACKUP`](backup.html)<br/>(*[enterprise license](https://www.cockroachlabs.com/pricing/) only*) | [`RESTORE`](restore.html)

## See Also

- [Back up Data](back-up-data.html)
- [Use the Built-in SQL Client](use-the-built-in-sql-client.html)
- [Other Cockroach Commands](cockroach-commands.html)
