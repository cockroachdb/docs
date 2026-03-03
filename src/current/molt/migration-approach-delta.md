---
title: Delta Migration
summary: Learn what a Delta Migration is, how it relates to the migration considerations, and how to perform it using MOLT tools.
toc: true
docs_area: migrate
---

A *Delta Migration* uses an initial data load, followed by [continuous replication]({% link molt/migration-considerations-replication.md %}), to [migrate data to CockroachDB]({% link molt/migration-overview.md %}). In this approach, you migrate most application data to the target using [MOLT Fetch]({% link molt/molt-fetch.md %}) **before** stopping application traffic to the source database. You then use [MOLT Replicator]({% link molt/molt-replicator.md %}) to keep the target database in sync with any changes in the source database (the migration _delta_), before finally halting traffic to the source and cutting over to the target after schema finalization and data verification.

- All source data is migrated to the target [at once]({% link molt/migration-considerations-granularity.md %}).

- This approach utilizes [continuous replication]({% link molt/migration-considerations-replication.md %}).

- [Failback replication]({% link molt/migration-considerations-rollback.md %}) is supported, though this example will not use it. See [Phased Delta Migration with Failback Replication]({% link molt/migration-approach-phased-delta-failback.md %}) for an example of a migration that uses failback replication.

This approach is best for production environments that need to minimize system downtime.

This page describes an example scenario. While the commands provided can be copy-and-pasted, they may need to be altered or reconsidered to suit the needs of your specific environment.

<div style="text-align: center;">
<img src="{{ 'images/molt/molt_delta_flow.svg' | relative_url }}" alt="Delta migration flow" style="max-width:100%" />
</div>

## Example scenario

You have a small (300 GB) database that provides the data store for a web application. You want to migrate the entirety of this database to a new CockroachDB cluster. Business cannot accommodate a full maintenance window, but it can accommodate a brief (<60 second) halt in traffic.

The application runs on a Kubernetes cluster.

**Estimated system downtime:** 3-5 minutes.

## Step-by-step walkthroughs

The following walkthroughs demonstrate how to use the MOLT tools to perform this migration for each supported source database:

- [Delta Migration from PostgreSQL]({% link molt/delta-migration-postgres.md %})
- [Delta Migration from MySQL]({% link molt/delta-migration-mysql.md %})
- [Delta Migration from Oracle]({% link molt/delta-migration-oracle.md %})

{% include molt/crdb-to-crdb-migration.md %}

## See also

- [Migration Overview]({% link molt/migration-overview.md %})
- [Migration Considerations]({% link molt/migration-considerations.md %})
- [Phased Bulk Load Migration]({% link molt/migration-approach-phased-bulk-load.md %})
- [MOLT Fetch]({% link molt/molt-fetch.md %})
- [MOLT Verify]({% link molt/molt-verify.md %})
