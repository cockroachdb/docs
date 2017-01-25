---
title: Back Up and Restore Data
summary: Learn how to back up and restore a CockroachDB cluster.
toc: false
---

CockroachDB offers two methods to back up your cluster's data:

- `cockroach dump`, which creates a `.sql` file containing all of your cluster's data.
- The `BACKUP` SQL statement (available only to our enterprise users), which stores a backup of your cluster's data on a cloud storage services such as GCE or Amazon EC3.

### Details

Even though CockroachDB is highly fault tolerant, We recommend creating backups of your data at least once per day.

## Restore

For information about restoring data you have in a backup, see [Restoring Data](restore-data.html).
## See Also

- [Use the Built-in SQL Client](use-the-built-in-sql-client.html)
- [Other Cockroach Commands](cockroach-commands.html)
