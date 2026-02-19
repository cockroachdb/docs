---
title: Classic Bulk Load Migration
summary: Learn what a Classic Bulk Load Migration is, how it relates to the migration considerations, and how to perform it using MOLT tools.
toc: true
docs_area: migrate
---

A *Classic Bulk Load Migration* is the simplest way of [migrating data to CockroachDB]({% link molt/migration-overview.md %}). In this approach, you stop application traffic to the source database and migrate data to the target cluster using [MOLT Fetch]({% link molt/molt-fetch.md %}) during a **significant downtime window**. Application traffic is then cut over to the target after schema finalization and data verification.

- All source data is migrated to the target [at once]({% link molt/migration-considerations-phases.md %}).

- This approach does not utilize [continuous replication]({% link molt/migration-considerations-replication.md %}).

- [Rollback]({% link molt/migration-considerations-rollback.md %}) is manual, but in most cases it's simple, as the source database is preserved and write traffic begins on the target all at once.

This approach is best for small databases (<100 GB), internal tools, dev/staging environments, and production environments that can handle business disruption. It's a simple approach that guarantees full data consistency and is easy to execute with limited resources, but it can only be performed if your system can handle significant downtime.

This page describes an example scenario. While the commands provided can be copy-and-pasted, they may need to be altered or reconsidered to suit the needs of your specific environment.

<div style="text-align: center;">
<img src="{{ 'images/molt/molt_classic_bulk_load_flow.svg' | relative_url }}" alt="Classic Bulk Load Migration flow" style="max-width:100%" />
</div>

## Example scenario

You have a small (50 GB) database that provides the data store for a web application. You want to migrate the entirety of this database to a new CockroachDB cluster. You schedule a maintenance window for Saturday from 2 AM to 6 AM, and announce it to your users several weeks in advance.

The application runs on a Kubernetes cluster.

**Estimated system downtime:** 4 hours.

## Step-by-step walkthroughs

The following walkthroughs demonstrate how to use the MOLT tools to perform this migration for each supported source database:

- [Classic Bulk Load Migration from PostgreSQL]({% link molt/classic-bulk-load-postgres.md %})
- [Classic Bulk Load Migration from MySQL]({% link molt/classic-bulk-load-mysql.md %})
- [Classic Bulk Load Migration from Oracle]({% link molt/classic-bulk-load-oracle.md %})

{% include molt/crdb-to-crdb-migration.md %}

## See also

- [Migration Overview]({% link molt/migration-overview.md %})
- [Migration Considerations]({% link molt/migration-considerations.md %})
- [Phased Bulk Load Migration]({% link molt/migration-approach-phased-bulk-load.md %})
- [MOLT Fetch]({% link molt/molt-fetch.md %})
- [MOLT Verify]({% link molt/molt-verify.md %})
