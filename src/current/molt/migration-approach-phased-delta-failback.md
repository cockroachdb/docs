---
title: Phased Delta Migration with Failback Replication
summary: Learn what a Phased Delta Migration with Failback Replication is, how it relates to the migration considerations, and how to perform it using MOLT tools.
toc: true
docs_area: migrate
---

A *Phased Delta Migration with Failback Replication* involves [migrating data to CockroachDB]({% link molt/migration-overview.md %}) in several phases. Data can be sliced per tenant, per service, per region, or per table to suit the needs of the migration. **For each given migration phase**, you use [MOLT Fetch]({% link molt/molt-fetch.md %}) to perform an initial bulk load of the data, you use [MOLT Replicator]({% link molt/molt-replicator.md %}) to update the target database via forward replication and to activate failback replication, and then you cut over application traffic to CockroachDB after schema finalization and data verification. This process is repeated for each phase of data.

- Data is migrated to the target [in phases]({% link molt/migration-considerations-phases.md %}).

- This approach utilizes [continuous replication]({% link molt/migration-considerations-replication.md %}).

- [Rollback]({% link molt/migration-considerations-rollback.md %}) is achieved via failback replication.

This approach is comparable to the [Delta Migration]({% link molt/migration-approach-delta.md %}), but dividing the data into multiple phases allows each downtime window to be shorter, and it allows each phase of the migration to be less complex. Depending on how you divide the data, it also may allow your downtime windows to affect only a subset of users. For example, dividing the data per region could mean that, when migrating the data from Region A, application usage in Region B may remain unaffected. This approach may increase overall migration complexity: its duration is longer, you will need to do the work of partitioning the data, and you will have a longer period when you run both the source and the target database concurrently.

[Failback replication]({% link molt/migration-considerations-rollback.md %}) keeps the source database up to date with changes that occur in the target database once the target database begins receiving write traffic. Failback replication ensures that, if something goes wrong during the migration process, traffic can easily be returned to source database without data loss. Like forward replication, in this approach, failback replication is run on a per-phase basis. It can persist indefinitely, until you're comfortable maintaining the target database as your sole data store.

This approach is best for databases that are too large to migrate all at once, and in business cases where downtime must be minimal. It's also suitable for risk-averse situations in which a safe rollback path must be ensured. It can only be performed if your team can handle the complexity of this approach, and if your source database can easily be divided into the phases you need.

{% include molt/crdb-to-crdb-migration.md %}

This page describes an example scenario. While the commands provided can be copy-and-pasted, they may need to be altered or reconsidered to suit the needs of your specific environment.

<div style="text-align: center;">
<img src="{{ 'images/molt/molt_phased_delta_flow.svg' | relative_url }}" alt="Phased Delta Migration flow" style="max-width:100%" />
</div>

## Example scenario

You have a moderately-sized (500GB) database that provides the data store for a web application. You want to migrate the entirety of this database to a new CockroachDB cluster. You will divide this migration into four geographic regions (A, B, C, and D).

The application runs on a Kubernetes cluster.

**Estimated system downtime:** Less than 60 seconds per region.

## Step-by-step walkthroughs

The following walkthroughs demonstrate how to use the MOLT tools to perform this migration for each supported source database:

- [Phased Delta Migration with Failback Replication from PostgreSQL]({% link molt/phased-delta-failback-postgres.md %})
- [Phased Delta Migration with Failback Replication from MySQL]({% link molt/phased-delta-failback-mysql.md %})
- [Phased Delta Migration with Failback Replication from Oracle]({% link molt/phased-delta-failback-oracle.md %})

## See also

- [Migration Overview]({% link molt/migration-overview.md %})
- [Migration Considerations]({% link molt/migration-considerations.md %})
- [Classic Bulk Load Migration]({% link molt/migration-approach-classic-bulk-load.md %})
- [MOLT Fetch]({% link molt/molt-fetch.md %})
- [MOLT Verify]({% link molt/molt-verify.md %})