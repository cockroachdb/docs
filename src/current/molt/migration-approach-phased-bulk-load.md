---
title: Phased Bulk Load Migration
summary: Learn what a Phased Bulk Load Migration is, how it relates to the migration considerations, and how to perform it using MOLT tools.
toc: true
docs_area: migrate
---

A *Phased Bulk Load Migration* involves [migrating data to CockroachDB]({% link molt/migration-overview.md %}) in several phases. Data can be sliced per tenant, per service, per region, or per table to suit the needs of the migration. In this approach, you stop application traffic to the source database _only_ for the tables in a particular slice of data. You then migrate that phase of data to the target cluster using [MOLT Fetch]({% link molt/molt-fetch.md %}) during a **downtime window**. Application traffic is then cut over to those target tables after schema finalization and data verification. This process is repeated for each phase of data.

- Data is migrated to the target [in phases]({% link molt/migration-considerations-granularity.md %}).

- This approach does not utilize [continuous replication]({% link molt/migration-considerations-replication.md %}).

- [Rollback]({% link molt/migration-considerations-rollback.md %}) is manual.

This approach is comparable to the [Classic Bulk Load Migration]({% link molt/migration-approach-classic-bulk-load.md %}), but dividing the data into multiple phases allows each downtime window to be shorter, and it allows each phase of the migration to be less complex. Depending on how you divide the data, it also may allow your downtime windows to affect only a subset of users. For example, dividing the data per region could mean that, when migrating the data from Region A, application usage in Region B may remain unaffected. This approach may increase overall migration complexity: its duration is longer, you will need to do the work of partitioning the data, and you will have a longer period when you run both the source and the target database concurrently.

This approach is best for databases that are too large to migrate all at once, internal tools, dev/staging environments, and production environments that can handle business disruption. It can only be performed if your system can handle downtime for each migration phase, and if your source database can easily be divided into the phases you need.

This page describes an example scenario. While the commands provided can be copy-and-pasted, they may need to be altered or reconsidered to suit the needs of your specific environment.

<div style="text-align: center;">
<img src="{{ 'images/molt/molt_phased_bulk_load_flow.svg' | relative_url }}" alt="Phased Bulk Load Migration flow" style="max-width:100%" />
</div>

## Example scenario

You have a moderately-sized (500GB) database that provides the data store for a web application. You want to migrate the entirety of this database to a new CockroachDB cluster. You will divide this migration into four geographic regions (A, B, C, and D). You schedule a maintenance window for each region over four subsequent evenings, and you announce them to your users (per region) several weeks in advance.

The application runs on a Kubernetes cluster.

**Estimated system downtime:** 4 hours per region.

## Step-by-step walkthroughs

The following walkthroughs demonstrate how to use the MOLT tools to perform this migration for each supported source database:

- [Phased Bulk Load Migration from PostgreSQL]({% link molt/phased-bulk-load-postgres.md %})
- [Phased Bulk Load Migration from MySQL]({% link molt/phased-bulk-load-mysql.md %})
- [Phased Bulk Load Migration from Oracle]({% link molt/phased-bulk-load-oracle.md %})

{% include molt/crdb-to-crdb-migration.md %}

## See also

- [Migration Overview]({% link molt/migration-overview.md %})
- [Migration Considerations]({% link molt/migration-considerations.md %})
- [Classic Bulk Load Migration]({% link molt/migration-approach-classic-bulk-load.md %})
- [MOLT Fetch]({% link molt/molt-fetch.md %})
- [MOLT Verify]({% link molt/molt-verify.md %})