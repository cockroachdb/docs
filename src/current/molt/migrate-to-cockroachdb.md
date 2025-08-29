---
title: Migrate to CockroachDB
summary: Learn how to migrate data from a PostgreSQL or MySQL database into a CockroachDB cluster.
toc: true
docs_area: migrate
---

MOLT Fetch supports various migration flows using [MOLT Fetch modes]({% link molt/molt-fetch.md %}#fetch-mode).

|                                     Migration flow                                     |                        Mode                        |                            Description                             |                                                 Best for                                                |
|----------------------------------------------------------------------------------------|----------------------------------------------------|--------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------|
| [Bulk load]({% link molt/migrate-bulk-load.md %})                                      | `--mode data-load`                                 | Perform a one-time bulk load of source data into CockroachDB.      | Testing, migrations with [planned downtime]({% link molt/migration-strategy.md %}#approach-to-downtime) |
| [Data load and replication]({% link molt/migrate-data-load-and-replication.md %})      | `--mode data-load-and-replication`                 | Load source data, then replicate subsequent changes continuously.  | [Minimal downtime]({% link molt/migration-strategy.md %}#approach-to-downtime) migrations               |
| [Data load then replication-only]({% link molt/migrate-data-load-replicate-only.md %}) | `--mode data-load`, then `--mode replication-only` | Load source data first, then start replication in a separate task. | [Minimal downtime]({% link molt/migration-strategy.md %}#approach-to-downtime) migrations               |
| [Resume replication]({% link molt/migrate-replicate-only.md %})                        | `--mode replication-only`                          | Resume replication from a checkpoint after interruption.           | Resuming interrupted migrations, post-load sync                                                         |
| [Failback]({% link molt/migrate-failback.md %})                                        | `--mode failback`                                  | Replicate changes from CockroachDB back to the source database.    | [Rollback]({% link molt/migrate-failback.md %}) scenarios                                               |

### Bulk load

For migrations that tolerate downtime, use `data-load` mode to perform a one-time bulk load of source data into CockroachDB. Refer to [Bulk Load]({% link molt/migrate-bulk-load.md %}).

### Migrations with minimal downtime

To minimize downtime during migration, MOLT Fetch supports replication streams that sync ongoing changes from the source database to CockroachDB. Instead of performing the entire data load during a planned downtime window, you can perform an initial load followed by continuous replication. Writes are only briefly paused to allow replication to drain before final cutover. The length of the pause depends on the volume of write traffic and the amount of replication lag between the source and CockroachDB.

- Use `data-load-and-replication` mode to perform both steps in one task. Refer to [Load and Replicate]({% link molt/migrate-data-load-and-replication.md %}).
- Use `data-load` followed by `replication-only` to perform the steps separately. Refer to [Load and Replicate Separately]({% link molt/migrate-data-load-replicate-only.md %}).

### Recovery and rollback strategies

If the migration is interrupted or you need to abort cutover, MOLT Fetch supports safe recovery flows:

- Use `replication-only` to resume a previously interrupted replication stream. Refer to [Resume Replication]({% link molt/migrate-replicate-only.md %}).
- Use `failback` to reverse the migration, syncing changes from CockroachDB back to the original source. This ensures data consistency on the source so that you can retry later. Refer to [Migration Failback]({% link molt/migrate-failback.md %}).

## See also

- [Migration Strategy]({% link molt/migration-strategy.md %})
- [MOLT Releases]({% link releases/molt.md %})