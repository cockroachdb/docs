---
title: Migration Overview
summary: Learn how to migrate your database to a CockroachDB cluster.
toc: true
docs_area: migrate
---

The MOLT (Migrate Off Legacy Technology) toolkit enables safe, minimal-downtime database migrations to CockroachDB. MOLT combines schema transformation, distributed data load, continuous replication, and row-level validation into a highly configurable workflow that adapts to diverse production environments.

This page has an overview of the following:

- Overall [migration flow](#migration-flow)
- [MOLT tools](#molt-tools)
- Supported [migration and failback modes](#migration-modes)

## Migration flow

{{site.data.alerts.callout_success}}
Before you begin the migration, review [Migration Strategy]({% link {{ page.version.version }}/migration-strategy.md %}).
{{site.data.alerts.end}}

A migration to CockroachDB generally follows this sequence:

<div style="text-align: center;">
<img src="{{ 'images/molt/migration_flow.svg' | relative_url }}" alt="MOLT tooling overview" style="max-width:100%" />
</div><br>

1. Prepare the source database: Configure users, permissions, and replication settings as needed.
1. Convert the source schema: Use the [Schema Conversion Tool]({% link cockroachcloud/migrations-page.md %}) to generate CockroachDB-compatible [DDL]({% link {{ page.version.version }}/sql-statements.md %}#data-definition-statements). Apply the converted schema to the target database. Drop constraints and indexes to facilitate data load.
1. Load data into CockroachDB: Use [MOLT Fetch]({% link molt/molt-fetch.md %}) to bulk-ingest your source data.
1. (Optional) Verify consistency before replication: Use [MOLT Verify]({% link molt/molt-verify.md %}) to confirm that the data loaded into CockroachDB is consistent with the source.
1. Replicate ongoing changes. Enable continuous replication to keep CockroachDB in sync with the source.
1. Verify consistency before cutover. Use MOLT Verify to confirm that the CockroachDB data is consistent with the source.
1. Finalize target schema: Recreate indexes or constraints on CockroachDB that you previously dropped to facilitate data load.
1. Cut over to CockroachDB. Redirect application traffic to the CockroachDB cluster.

For a practical example of the preceding steps, refer to [Migrate to CockroachDB]({% link {{ page.version.version }}/migrate-to-cockroachdb.md %}).

## MOLT tools

[MOLT (Migrate Off Legacy Technology)]({% link releases/molt.md %}) is a set of tools for schema conversion, data load, replication, and validation.

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
    <td>PostgreSQL 11-14, MySQL 5.7-8.0+, CockroachDB</td>
    <td>GA</td>
  </tr>
  <tr>
    <td class="comparison-chart__feature"><a href="#verify"><b>Verify</b></a></td>
    <td>Schema and data validation</td>
    <td>PostgreSQL 12-14, MySQL 5.7-8.0+, CockroachDB</td>
    <td><a href="{% link {{ site.current_cloud_version }}/cockroachdb-feature-availability.md %}">Preview</a></td>
  </tr>
</table>

### Schema Conversion Tool

The [MOLT Schema Conversion Tool]({% link cockroachcloud/migrations-page.md %}) converts a source database schema to a CockroachDB-compatible schema:

- Identifies [unimplemented features]({% link {{ site.current_cloud_version }}/migration-strategy.md %}#unimplemented-features-and-syntax-incompatibilities)
- Rewrites unsupported [DDL syntax]({% link {{ site.current_cloud_version }}/sql-statements.md %}#data-definition-statements)
- Applies CockroachDB [schema best practices]({% link {{ site.current_cloud_version }}/migration-strategy.md %}#schema-design-best-practices)

### Fetch

[MOLT Fetch]({% link molt/molt-fetch.md %}) performs the core data migration to CockroachDB. It supports:

- [Multiple migration modes](#migration-modes) via `IMPORT INTO` or `COPY FROM`
- Concurrent data export from multiple source tables
- [Continuous replication]({% link molt/molt-fetch.md %}#replicate-changes), enabling you to minimize downtime before cutover
- [Schema transformation rules]({% link molt/molt-fetch.md %}#transformations)
- Safe [continuation]({% link molt/molt-fetch.md %}#fetch-continuation) for interrupted tasks
- [Failback]({% link molt/molt-fetch.md %}#fail-back-to-source-database) to replicate changes from CockroachDB back to the original source via a secure changefeed

### Verify

[MOLT Verify]({% link molt/molt-verify.md %}) checks for data and schema discrepancies between the source database and CockroachDB. It performs:

- Table structure verification
- Column definition verification
- Row-level data verification
- Continuous, live, or one-time verification

## Migration modes

MOLT Fetch supports multiple data migration modes. These can be combined based on your testing and cutover strategy.

|              Mode             |                                 Description                                  |                                                          Best For                                                          |
|-------------------------------|------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------|
| `data-load`                   | Performs one-time load of source data into CockroachDB                       | Testing, migrations with planned downtime, [phased migrations]({% link {{ page.version.version }}/migrate-in-phases.md %}) |
| `data-load-and-replication`   | Loads source data and starts continuous replication from the source database | [Migrations with minimal downtime]({% link {{ page.version.version }}/migrate-to-cockroachdb.md %})                        |
| `replication-only`            | Starts replication from a previously loaded source                           | [Phased migrations]({% link {{ page.version.version }}/migrate-in-phases.md %}), post-load sync                            |
| `failback`                    | Replicates changes on CockroachDB back to the original source                | [Rollback scenarios]({% link {{ page.version.version }}/migrate-failback.md %})                                            |
| `export-only` / `import-only` | Separates data export and import phases                                      | Large-scale migrations, custom storage pipelines                                                                           |
| `direct-copy`                 | Loads data without intermediate storage using `COPY FROM`                    | Local testing, limited infra environments                                                                                  |

## Migrations with minimal downtime

MOLT simplifies and streamlines the following migration patterns that use a replication stream to minimize downtime. Rather than load all data into CockroachDB during a planned downtime window, you perform an initial data load and continuously replicate any subsequent changes to CockroachDB. Writes are only briefly paused to allow replication to drain before final cutover.

### Full migration with minimal downtime

Run MOLT Fetch in `data-load-and-replication` mode to load the initial source data into CockroachDB. Continuous replication starts automatically after the initial load. When ready, pause application traffic to allow replication to drain, validate data consistency with MOLT Verify, then cut over to CockroachDB. For example steps, refer to [Migrate to CockroachDB]({% link {{ page.version.version }}/migrate-to-cockroachdb.md %}).

### Phased migration with minimal downtime

Run MOLT Fetch in `data-load` mode to incrementally load and validate data in batches. After loading the initial source data, switch to `replication-only` mode to sync ongoing changes. When ready, pause application traffic to allow replication to drain, validate again with MOLT Verify, then cut over to CockroachDB. For example steps, refer to [Migrate in Phases]({% link {{ page.version.version }}/migrate-in-phases.md %}).

## Migration failback

If issues arise post-cutover, run MOLT Fetch in `failback` mode to replicate changes from CockroachDB back to the original source database. This ensures that data is consistent on the original source so that you can retry the migration later. For example steps, refer to [Migration Failback]({% link {{ page.version.version }}/migrate-failback.md %}).

## See also

- [Migrate to CockroachDB]({% link {{ page.version.version }}/migrate-to-cockroachdb.md %})
- [Migrate to CockroachDB in Phases]({% link {{ page.version.version }}/migrate-in-phases.md %})
- [Migration Failback]({% link {{ page.version.version }}/migrate-failback.md %})
- [Migration Strategy]({% link {{ page.version.version }}/migration-strategy.md %})
- [MOLT Releases]({% link releases/molt.md %})