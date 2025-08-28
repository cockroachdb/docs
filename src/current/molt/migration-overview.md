---
title: Migration Overview
summary: Learn how to migrate your database to a CockroachDB cluster.
toc: true
docs_area: migrate
---

The MOLT (Migrate Off Legacy Technology) toolkit enables safe, minimal-downtime database migrations to CockroachDB. MOLT combines schema transformation, distributed data load, continuous replication, and row-level validation into a highly configurable workflow that adapts to diverse production environments.

This page provides an overview of the following:

- Overall [migration sequence](#migration-sequence)
- [MOLT tools](#molt-tools)
- Supported [migration flows](#migration-flows)

## Migration sequence

{{site.data.alerts.callout_success}}
Before you begin the migration, review [Migration Strategy]({% link molt/migration-strategy.md %}).
{{site.data.alerts.end}}

A migration to CockroachDB generally follows this sequence:

<div style="text-align: center;">
<img src="{{ 'images/molt/migration_flow.svg' | relative_url }}" alt="MOLT tooling overview" style="max-width:100%" />
</div><br>

1. Prepare the source database: Configure users, permissions, and replication settings as needed.
1. Convert the source schema: Use the [Schema Conversion Tool]({% link cockroachcloud/migrations-page.md %}) to generate CockroachDB-compatible [DDL]({% link {{ site.current_cloud_version }}/sql-statements.md %}#data-definition-statements). Apply the converted schema to the target database. Drop constraints and indexes to facilitate data load.
1. Load data into CockroachDB: Use [MOLT Fetch]({% link molt/molt-fetch.md %}) to bulk-ingest your source data.
1. (Optional) Verify consistency before replication: Use [MOLT Verify]({% link molt/molt-verify.md %}) to confirm that the data loaded into CockroachDB is consistent with the source.
1. Finalize target schema: Recreate indexes or constraints on CockroachDB that you previously dropped to facilitate data load.
1. Replicate ongoing changes: Enable continuous replication with [MOLT Fetch]({% link molt/molt-fetch.md %}#replication-only) to keep CockroachDB in sync with the source.
1. Verify consistency before cutover: Use [MOLT Verify]({% link molt/molt-verify.md %}) to confirm that the CockroachDB data is consistent with the source.
1. Cut over to CockroachDB: Redirect application traffic to the CockroachDB cluster.

For more details, refer to [Migration flows](#migration-flows).

## MOLT tools

[MOLT (Migrate Off Legacy Technology)]({% link releases/molt.md %}) is a set of tools for schema conversion, data load, replication, and validation. Migrations with MOLT are resilient, restartable, and scalable to large data sets.

MOLT [Fetch](#fetch) and [Verify](#verify) are CLI-based to maximize control, automation, and visibility during the data load and replication stages.

<table class="comparison-chart">
  <tr>
    <th>Tool</th>
    <th>Usage</th>
    <th>Tested and supported sources</th>
    <th>Release status</th>
  </tr>
  <tr>
    <td class="comparison-chart__feature"><a href="#schema-conversion-tool"><b>Schema Conversion Tool</b></a></td>
    <td>Schema conversion</td>
    <td>PostgreSQL, MySQL, Oracle, SQL Server</td>
    <td>GA (Cloud only)</td>
  </tr>
  <tr>
    <td class="comparison-chart__feature"><a href="#fetch"><b>Fetch</b></a></td>
    <td>Initial data load; optional continuous replication</td>
    <td>PostgreSQL 11-16, MySQL 5.7-8.0+, Oracle Database 19c (Enterprise Edition) and 21c (Express Edition), CockroachDB</td>
    <td>GA</td>
  </tr>
  <tr>
    <td class="comparison-chart__feature"><a href="#verify"><b>Verify</b></a></td>
    <td>Schema and data validation</td>
    <td>PostgreSQL 12-16, MySQL 5.7-8.0+, Oracle Database 19c (Enterprise Edition) and 21c (Express Edition), CockroachDB</td>
    <td><a href="{% link {{ site.current_cloud_version }}/cockroachdb-feature-availability.md %}">Preview</a></td>
  </tr>
</table>

### Schema Conversion Tool

The [MOLT Schema Conversion Tool]({% link cockroachcloud/migrations-page.md %}) converts a source database schema to a CockroachDB-compatible schema. The tool performs the following actions:

- Identifies [unimplemented features]({% link molt/migration-strategy.md %}#unimplemented-features-and-syntax-incompatibilities).
- Rewrites unsupported [DDL syntax]({% link {{ site.current_cloud_version }}/sql-statements.md %}#data-definition-statements).
- Applies CockroachDB [schema best practices]({% link molt/migration-strategy.md %}#schema-design-best-practices).

### Fetch

[MOLT Fetch]({% link molt/molt-fetch.md %}) performs the core data migration to CockroachDB. It supports:

- [Multiple migration flows](#migration-flows) via `IMPORT INTO` or `COPY FROM`.
- Data movement via [cloud storage, local file servers, or direct copy]({% link molt/molt-fetch.md %}#data-path).
- [Concurrent data export]({% link molt/molt-fetch.md %}#best-practices) from multiple source tables and shards.
- [Continuous replication]({% link molt/molt-fetch.md %}#replication-only), enabling you to minimize downtime before cutover.
- [Schema transformation rules]({% link molt/molt-fetch.md %}#transformations).
- After exporting data with `IMPORT INTO`, safe [continuation]({% link molt/molt-fetch.md %}#fetch-continuation) to retry failed or interrupted tasks from specific checkpoints.
- [Failback]({% link molt/molt-fetch.md %}#failback), which replicates changes from CockroachDB back to the original source via a secure changefeed.

### Verify

[MOLT Verify]({% link molt/molt-verify.md %}) checks for data and schema discrepancies between the source database and CockroachDB. It performs the following verifications:

- Table structure.
- Column definition.
- Row-level data.

## Migration flows

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

To minimize downtime during migration, MOLT Fetch supports replication streams that continuously synchronize changes from the source database to CockroachDB. Instead of loading all data during a planned downtime window, you can run an initial load followed by continuous replication. Writes are paused only briefly to allow replication to drain before the final cutover. The duration of this pause depends on the volume of write traffic and the replication lag between the source and CockroachDB.

- Use `data-load-and-replication` mode to perform both steps in one task. Refer to [Load and Replicate]({% link molt/migrate-data-load-and-replication.md %}).
- Use `data-load` followed by `replication-only` to perform the steps separately. Refer to [Load and Replicate Separately]({% link molt/migrate-data-load-replicate-only.md %}).

### Recovery and rollback strategies

If the migration is interrupted or cutover must be aborted, MOLT Fetch provides safe recovery options:

- Use `replication-only` to resume a previously interrupted replication stream. Refer to [Resume Replication]({% link molt/migrate-replicate-only.md %}).
- Use `failback` to reverse the migration, synchronizing changes from CockroachDB back to the original source. This ensures data consistency on the source so that you can retry the migration later. Refer to [Migration Failback]({% link molt/migrate-failback.md %}).

## See also

- [Migration Strategy]({% link molt/migration-strategy.md %})
- [MOLT Releases]({% link releases/molt.md %})