---
title: Migrate to CockroachDB
summary: Learn how to migrate data from a PostgreSQL or MySQL database into a CockroachDB cluster.
toc: true
docs_area: migrate
---

MOLT Fetch supports various migration flows using [MOLT Fetch modes]({% link "molt/molt-fetch.md" %}#fetch-mode).

{% include "molt/crdb-to-crdb-migration.md" %}

|                            Migration flow                           |             Mode             |                                         Description                                         |                                                 Best for                                                |
|---------------------------------------------------------------------|------------------------------|---------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------|
| [Bulk load]({% link "molt/migrate-bulk-load.md" %})                   | `--mode data-load`           | Perform a one-time bulk load of source data into CockroachDB.                               | Testing, migrations with [planned downtime]({% link "molt/migration-strategy.md" %}#approach-to-downtime) |
| [Load and replicate]({% link "molt/migrate-load-replicate.md" %})     | MOLT Fetch + MOLT Replicator | Load source data using MOLT Fetch, then replicate subsequent changes using MOLT Replicator. | [Minimal downtime]({% link "molt/migration-strategy.md" %}#approach-to-downtime) migrations               |
| [Resume replication]({% link "molt/migrate-resume-replication.md" %}) | `--mode replication-only`    | Resume replication from a checkpoint after interruption.                                    | Resuming interrupted migrations, post-load sync                                                         |
| [Failback]({% link "molt/migrate-failback.md" %})                     | `--mode failback`            | Replicate changes from CockroachDB back to the source database.                             | [Rollback]({% link "molt/migrate-failback.md" %}) scenarios                                               |

### Bulk load

For migrations that tolerate downtime, use `data-load` mode to perform a one-time bulk load of source data into CockroachDB. Refer to [Bulk Load]({% link "molt/migrate-bulk-load.md" %}).

### Migrations with minimal downtime

To minimize downtime during migration, MOLT Fetch supports replication streams that sync ongoing changes from the source database to CockroachDB. Instead of performing the entire data load during a planned downtime window, you can perform an initial load followed by continuous replication. Writes are only briefly paused to allow replication to drain before final cutover. The length of the pause depends on the volume of write traffic and the amount of replication lag between the source and CockroachDB.

- Use MOLT Fetch for data loading followed by MOLT Replicator for replication. Refer to [Load and replicate]({% link "molt/migrate-load-replicate.md" %}).

### Recovery and rollback strategies

If the migration is interrupted or you need to abort cutover, MOLT Fetch supports safe recovery flows:

- Use `replication-only` to resume a previously interrupted replication stream. Refer to [Resume Replication]({% link "molt/migrate-resume-replication.md" %}).
- Use `failback` to reverse the migration, syncing changes from CockroachDB back to the original source. This ensures data consistency on the source so that you can retry later. Refer to [Migration Failback]({% link "molt/migrate-failback.md" %}).

## See also

- [Migration Strategy]({% link "molt/migration-strategy.md" %})
- [MOLT Releases]({% link "releases/molt.md" %})