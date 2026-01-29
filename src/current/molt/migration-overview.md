---
title: Migration Overview
summary: Learn how to migrate your database to a CockroachDB cluster.
toc: true
docs_area: migrate
---

A migration involves transfering data from a pre-existing **source** database onto a **target** CockroachDB cluster. Migrating data is a complex, multi-step process, and a data migration can take many different forms depending on your specific business and technical constraints.

Cockroach Labs provides a MOLT (Migrate Off Legacy Technology) toolkit to aid in migrations.

This page provides an overview of the following:

- Overall [migration sequence](#migration-sequence)
- [MOLT tools](#molt-tools)

## Migration sequence

A migration to CockroachDB generally follows this sequence:

1. **Assess and discover**: Inventory the source database, flag unsupported features, make a migration plan.
1. **Prepare the environment**: Configure networking, users and permissions, bucket locations, replication settings, and more.
1. **Convert the source schema**: Generate CockroachDB-compatible [DDL]({% link {{ site.current_cloud_version }}/sql-statements.md %}#data-definition-statements). Apply the converted schema to the target database. Drop constraints and indexes to facilitate data load.
1. **Load data into CockroachDB**: Bulk load the source data into the CockroachDB cluster.
1. **Finalize target schema**: Recreate indexes or constraints on CockroachDB that you previously dropped to facilitate data load.
1. **_(Optional)_ Replicate ongoing changes**: Keep CockroachDB in sync with the source. This may be necessary for migrations that minimize downtime.
1. **Stop application traffic**: Limit user read/write traffic to the source database. _This begins application downtime._
1. **Verify data consistency**: Confirm that the CockroachDB data is consistent with the source.
1. **_(Optional)_ Enable failback**: Replicate data from the target back to the source, enabling a reversion to the source database in the event of migration failure.
1. **Cut over application traffic**: Resume normal application use, with the CockroachDB cluster as the target database. _This ends application downtime._

The MOLT (Migrate Off Legacy Technology) toolkit enables safe, minimal-downtime database migrations to CockroachDB. MOLT combines schema transformation, distributed data load, continuous replication, and row-level validation into a highly configurable workflow that adapts to diverse production environments.

<!-- <img src="{{ 'images/molt/migration_flow.svg' | relative_url }}" alt="MOLT tooling overview" style="max-width:100%" /> -->
<div style="text-align: center;">
<img src="{{ 'images/molt/molt_flows_1.svg' | relative_url }}" alt="MOLT tooling overview" style="max-width:100%" />
</div>

## MOLT tools

[MOLT (Migrate Off Legacy Technology)]({% link releases/molt.md %}) is a set of tools for schema conversion, data load, replication, and validation. Migrations with MOLT are resilient, restartable, and scalable to large data sets.

MOLT [Fetch](#fetch), [Replicator](#replicator), and [Verify](#verify) are CLI-based to maximize control, automation, and visibility during the data load and replication stages.

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
    <td>Initial data load</td>
    <td>PostgreSQL 11-16, MySQL 5.7-8.0+, Oracle Database 19c (Enterprise Edition) and 21c (Express Edition), CockroachDB</td>
    <td>GA</td>
  </tr>
  <tr>
    <td class="comparison-chart__feature"><a href="#replicator"><b>Replicator</b></a></td>
    <td>Continuous replication</td>
    <td>CockroachDB, PostgreSQL 11-16, MySQL 5.7+ and 8.0+, Oracle Database 19c+</td>
    <td>GA</td>
  </tr>
  <tr>
    <td class="comparison-chart__feature"><a href="#verify"><b>Verify</b></a></td>
    <td>Schema and data validation</td>
    <td>PostgreSQL 12-16, MySQL 5.7-8.0+, Oracle Database 19c (Enterprise Edition) and 21c (Express Edition), CockroachDB</td>
    <td><a href="{% link {{ site.current_cloud_version }}/cockroachdb-feature-availability.md %}">Preview</a></td>
  </tr>
</table>

{% include molt/crdb-to-crdb-migration.md %}

### Schema Conversion Tool

The [MOLT Schema Conversion Tool]({% link cockroachcloud/migrations-page.md %}) converts a source database schema to a CockroachDB-compatible schema. The tool performs the following actions:

- Identifies [unimplemented features]({% link molt/migration-strategy.md %}#unimplemented-features-and-syntax-incompatibilities).
- Rewrites unsupported [DDL syntax]({% link {{ site.current_cloud_version }}/sql-statements.md %}#data-definition-statements).
- Applies CockroachDB [schema best practices]({% link molt/migration-strategy.md %}#schema-design-best-practices).

### Fetch

[MOLT Fetch]({% link molt/molt-fetch.md %}) performs the initial data load to CockroachDB. It supports:

- Multiple migration flows via `IMPORT INTO` or `COPY FROM`.
- Data movement via [cloud storage, local file servers, or direct copy]({% link molt/molt-fetch.md %}#define-intermediate-storage).
- [Concurrent data export]({% link molt/molt-fetch-best-practices.md %}) from multiple source tables and shards.
- [Schema transformation rules]({% link molt/molt-fetch.md %}#define-transformations).
- After exporting data with `IMPORT INTO`, safe [continuation]({% link molt/molt-fetch.md %}#continue-molt-fetch-after-interruption) to retry failed or interrupted tasks from specific checkpoints.

### Replicator

[MOLT Replicator]({% link molt/molt-replicator.md %}) provides continuous replication capabilities for minimal-downtime migrations. It supports:

- Continuous replication from source databases to CockroachDB.
- [Multiple consistency modes]({% link molt/molt-replicator.md %}#consistency-modes) for balancing throughput and transactional guarantees.
- Failback replication from CockroachDB back to source databases.
- [Performance tuning]({% link molt/molt-replicator-best-practices.md %}#optimize-performance) for high-throughput workloads.

### Verify

[MOLT Verify]({% link molt/molt-verify.md %}) checks for data and schema discrepancies between the source database and CockroachDB. It performs the following verifications:

- Table structure.
- Column definition.
- Row-level data.

<!-- ## Migration flows

{{site.data.alerts.callout_success}}
Before you begin the migration, review [Migration Strategy]({% link molt/migration-strategy.md %}).
{{site.data.alerts.end}}

MOLT supports various migration flows using [MOLT Fetch]({% link molt/molt-fetch.md %}) for data loading and [MOLT Replicator]({% link molt/molt-replicator.md %}) for ongoing replication.

|                             Migration flow                             |            Tools             |                                         Description                                          |                                                 Best for                                                |
|------------------------------------------------------------------------|------------------------------|----------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------|
| [Bulk load]                      | MOLT Fetch                   | Perform a one-time bulk load of source data into CockroachDB.                                | Testing, migrations with [planned downtime]({% link molt/migration-strategy.md %}#approach-to-downtime) |
| [Data load and replication] | MOLT Fetch + MOLT Replicator | Load source data with Fetch, then replicate subsequent changes continuously with Replicator. | [Minimal downtime]({% link molt/migration-strategy.md %}#approach-to-downtime) migrations               |
| [Resume replication]    | MOLT Replicator              | Resume replication from a checkpoint after interruption.                                     | Resuming interrupted migrations, post-load sync                                                         |
| [Failback]                        | MOLT Replicator              | Replicate changes from CockroachDB back to the source database.                              | [Rollback] scenarios                                               | -->

## Migration variables

You must decide how you want your migration to handle each of the following variables. These decisions will depend on your specific business and technical considerations. The MOLT toolkit supports any set of decisions made for the [supported source databases](#molt-tools).

### Migration granularity

You may choose to migrate all of your data into a CockroachDB cluster at once. However, for larger data stores it's recommended that you migrate data in separate phases. This can help break the migration down into manageable slices, and it can help limit the effects of migration difficulties.

### Continuous replication

After data is migrated from the source into CockroachDB, you may choose to continue streaming changes to that source data from the source to the target. This is important for migrations that aim to minimize application downtime, as they may require the source database to continue receiving writes until application traffic is fully cut over to CockroachDB.

### Data transformation strategy

If there are discrepencies between the source and target schemas, the rules that determine necessary data transformations need to be defined. These transformations can be applied in the source database, in flight, or in the target database.

### Validation strategy

There are several different ways of verifying that the data in the source and the target match one another. You must decide what validation checks you want to perform, and when in the migration process you want to perform them.

### Rollback plan

Until the migration is complete, migration failures may make you decide to roll back application traffic entirely to the source database. You may therefore need a way of keeping the source database up to date with new writes to the target. This is especially important for risk-averse migrations that aim to minimize downtime.

---

[Learn more about the different migration variables]({% link molt/migration-considerations.md %}), how you should consider the different options for each variable, and how to use the MOLT toolkit for each variable.

## See also

- [Migration Strategy]({% link molt/migration-strategy.md %})
- [MOLT Releases]({% link releases/molt.md %})
