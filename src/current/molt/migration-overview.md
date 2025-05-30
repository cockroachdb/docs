---
title: Migration Overview
summary: Learn how to migrate your database to a CockroachDB cluster.
toc: true
docs_area: migrate
---

The MOLT (Migrate Off Legacy Technology) toolkit enables safe, minimal-downtime database migrations to CockroachDB. MOLT combines schema transformation, distributed data load, continuous replication, and row-level validation into a highly configurable workflow that adapts to diverse production environments.

This page provides an overview of the following:

- Overall [migration flow](#migration-flow)
- [MOLT tools](#molt-tools)
- Supported [migration and failback modes](#migration-modes)

## Migration flow

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
1. Replicate ongoing changes: Enable continuous replication with [MOLT Fetch]({% link molt/molt-fetch.md %}#replicate-changes) to keep CockroachDB in sync with the source.
1. Verify consistency before cutover: Use [MOLT Verify]({% link molt/molt-verify.md %}) to confirm that the CockroachDB data is consistent with the source.
1. Cut over to CockroachDB: Redirect application traffic to the CockroachDB cluster.

For a practical example of the preceding steps, refer to [Migrate to CockroachDB]({% link molt/migrate-to-cockroachdb.md %}).

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
    <td>PostgreSQL 11-16, MySQL 5.7-8.0+, CockroachDB</td>
    <td>GA</td>
  </tr>
  <tr>
    <td class="comparison-chart__feature"><a href="#verify"><b>Verify</b></a></td>
    <td>Schema and data validation</td>
    <td>PostgreSQL 12-16, MySQL 5.7-8.0+, CockroachDB</td>
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

- [Multiple migration modes](#migration-modes) via `IMPORT INTO` or `COPY FROM`.
- Data movement via [cloud storage, local file servers, or direct copy]({% link molt/molt-fetch.md %}#data-path).
- [Concurrent data export]({% link molt/molt-fetch.md %}#best-practices) from multiple source tables and shards.
- [Continuous replication]({% link molt/molt-fetch.md %}#replicate-changes), enabling you to minimize downtime before cutover.
- [Schema transformation rules]({% link molt/molt-fetch.md %}#transformations).
- After exporting data with `IMPORT INTO`, safe [continuation]({% link molt/molt-fetch.md %}#fetch-continuation) to retry failed or interrupted tasks from specific checkpoints.
- [Failback]({% link molt/molt-fetch.md %}#fail-back-to-source-database), which replicates changes from CockroachDB back to the original source via a secure changefeed.

### Verify

[MOLT Verify]({% link molt/molt-verify.md %}) checks for data and schema discrepancies between the source database and CockroachDB. It performs the following verifications:

- Table structure.
- Column definition.
- Row-level data.

## Migration modes

MOLT Fetch supports [multiple data migration modes]({% link molt/molt-fetch.md %}#fetch-mode). These can be combined based on your testing and cutover strategy.

|                     Mode                    |                                 Description                                  |                                                                                        Best For                                                                                        |
|---------------------------------------------|------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `--mode data-load`                          | Performs one-time load of source data into CockroachDB                       | Testing, migrations with [planned downtime]({% link molt/migration-strategy.md %}#approach-to-downtime), migrations with [minimal downtime]({% link molt/migrate-to-cockroachdb.md %}) |
| `--mode data-load-and-replication`          | Loads source data and starts continuous replication from the source database | [Migrations with minimal downtime]({% link molt/migrate-to-cockroachdb.md %})                                                                                                          |
| `--mode replication-only`                   | Starts replication from a previously loaded source                           | [Migrations with minimal downtime]({% link molt/migrate-to-cockroachdb.md %}), post-load sync                                                                                          |
| `--mode failback`                           | Replicates changes on CockroachDB back to the original source                | [Rollback scenarios]({% link molt/migrate-failback.md %})                                                                                                                              |
| `--mode export-only` / `--mode import-only` | Separates data export and import phases                                      | Local performance testing                                                                                                                                                              |
| `--direct-copy`                             | Loads data directly using `COPY FROM`, without intermediate storage          | Local testing, limited-infrastructure environments                                                                                                                                     |

## Migrations with minimal downtime

MOLT simplifies and streamlines migrations by using a replication stream to minimize downtime. Rather than load all data into CockroachDB during a [planned downtime]({% link molt/migration-strategy.md %}#approach-to-downtime) window, you perform an initial data load and continuously replicate any subsequent changes to CockroachDB. Writes are only briefly paused to allow replication to drain before final cutover. The length of the pause depends on the volume of write traffic and the amount of replication lag between the source and CockroachDB.

Run MOLT Fetch in either `data-load-and-replication` mode, or `data-load` mode followed by `replication-only`, to load the initial source data and continuously replicate subsequent changes to CockroachDB. When ready, pause application traffic to allow replication to drain, validate data consistency with MOLT Verify, then cut over to CockroachDB. For example steps, refer to [Migrate to CockroachDB]({% link molt/migrate-to-cockroachdb.md %}).

## Migration failback

If issues arise during the migration, start MOLT Fetch in `failback` mode after stopping replication and before sending new writes to CockroachDB. Failback mode replicates changes from CockroachDB back to the original source database, ensuring that data is consistent on the original source so that you can retry the migration later. For example steps, refer to [Migration Failback]({% link molt/migrate-failback.md %}).

## See also

- [Migrate to CockroachDB]({% link molt/migrate-to-cockroachdb.md %})
- [Migrate to CockroachDB in Phases]({% link molt/migrate-in-phases.md %})
- [Migration Failback]({% link molt/migrate-failback.md %})
- [Migration Strategy]({% link molt/migration-strategy.md %})
- [MOLT Releases]({% link releases/molt.md %})