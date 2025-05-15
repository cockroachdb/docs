---
title: Migration Strategy
summary: Build a migration strategy before performing a database migration to CockroachDB.
toc: true
docs_area: migrate
---

A successful migration to CockroachDB requires planning for downtime, application changes, observability, and rollback. 

This page outlines key decisions, infrastructure considerations, and best practices for a resilient and repeatable high-level migration strategy:

- [Develop a migration plan](#develop-a-migration-plan).
- Evaluate your [downtime approach](#approach-to-downtime).
- [Size the target CockroachDB cluster](#capacity-planning).
- Implement [application changes](#application-changes) to address necessary [schema changes](#schema-design-best-practices), [transaction contention](#handling-transaction-contention), and [unimplemented features](#unimplemented-features-and-syntax-incompatibilities).
- [Prepare for migration](#prepare-for-migration) by running a [pre-mortem](#run-a-migration-pre-mortem), setting up [metrics](#set-up-monitoring-and-alerting), [loading test data](#load-test-data), [validating application queries](#validate-queries) for correctness and performance, performing a [migration dry run](#perform-a-dry-run), and reviewing your [cutover strategy](#cutover-strategy).
{% assign variable = value %}
{{site.data.alerts.callout_success}}
For help migrating to CockroachDB, contact our <a href="mailto:sales@cockroachlabs.com">sales team</a>.
{{site.data.alerts.end}}

### Develop a migration plan

Consider the following as you plan your migration:

- Who will lead and perform the migration? Which teams are involved, and which aspects are they responsible for?
- Which internal and external parties do you need to inform about the migration?
- Which external or third-party tools (e.g., microservices, analytics, payment processors, aggregators, CRMs) must be tested and migrated along with your application?
- When is the best time to perform this migration to be minimally disruptive to the database's users?
- What is your target date for completing the migration?

Create a document that summarizes the intent of the migration, the technical details, and the team members involved.

### Approach to downtime

It's important to fully [prepare the migration](#prepare-for-migration) in order to be certain that the migration can be completed successfully during the downtime window.

- *Scheduled downtime* is made known to your users in advance. Once you have [prepared for the migration](#prepare-for-migration), you take the application offline, [conduct the migration]({% link molt/migration-overview.md %}), and bring the application back online on CockroachDB. To succeed, you should estimate the amount of downtime required to migrate your data, and ideally schedule the downtime outside of peak hours. Scheduling downtime is easiest if your application traffic is "periodic", meaning that it varies by the time of day, day of week, or day of month.

- *Unscheduled downtime* impacts as few customers as possible, ideally without impacting their regular usage. If your application is intentionally offline at certain times (e.g., outside business hours), you can migrate the data without users noticing. Alternatively, if your application's functionality is not time-sensitive (e.g., it sends batched messages or emails), then you can queue requests while your system is offline, and process those requests after completing the migration to CockroachDB.

- *Reduced functionality* takes some, but not all, application functionality offline. For example, you can disable writes but not reads while you migrate the application data, and queue data to be written after completing the migration.

The [MOLT tools]({% link molt/migration-overview.md %}) enable migrations with minimal downtime. Refer to [Cutover strategy](#cutover-strategy).

### Capacity planning

Determine the size of the target CockroachDB cluster. To do this, consider your data volume and workload characteristics:

- What is the total size of the data you will migrate?
- How many active [application connections]({% link {{ site.current_cloud_version }}/recommended-production-settings.md %}#connection-pooling) will be running in the CockroachDB environment?

Use this information to size the CockroachDB cluster you will create. If you are migrating to a CockroachDB {{ site.data.products.cloud }} cluster, see [Plan Your Cluster]({% link cockroachcloud/plan-your-cluster.md %}) for details:

- For CockroachDB {{ site.data.products.standard }} and {{ site.data.products.basic }}, your cluster will scale automatically to meet your storage and usage requirements. Refer to the [CockroachDB {{ site.data.products.standard }}]({% link cockroachcloud/plan-your-cluster-basic.md %}#request-units) and [CockroachDB {{ site.data.products.basic }}]({% link cockroachcloud/plan-your-cluster-basic.md %}#request-units) documentation to learn about how to limit your resource consumption.
- For CockroachDB {{ site.data.products.advanced }}, refer to the [example]({% link cockroachcloud/plan-your-cluster-advanced.md %}#example) that shows how your data volume, storage requirements, and replication factor affect the recommended node size (number of vCPUs per node) and total number of nodes on the cluster.
- For guidance on sizing for connection pools, see the CockroachDB {{ site.data.products.cloud }} [Production Checklist]({% link cockroachcloud/production-checklist.md %}#sql-connection-handling).

If you are migrating to a CockroachDB {{ site.data.products.core }} cluster:

- Refer to our [sizing methodology]({% link {{ site.current_cloud_version }}/recommended-production-settings.md %}#sizing) to determine the total number of vCPUs on the cluster and the number of vCPUs per node (which determines the number of nodes on the cluster).
- Refer to our [storage recommendations]({% link {{ site.current_cloud_version }}/recommended-production-settings.md %}#storage) to determine the amount of storage to provision on each node.
- For guidance on sizing for connection pools, see the CockroachDB {{ site.data.products.core }} [Production Checklist]({% link {{ site.current_cloud_version }}/recommended-production-settings.md %}#connection-pooling).

### Application changes

As you develop your migration plan, consider the application changes that you will need to make. These may relate to the following:

- [Handling transaction contention.](#handling-transaction-contention)
- [Unimplemented features and syntax incompatibilities.](#unimplemented-features-and-syntax-incompatibilities)

#### Schema design best practices

{% include molt/migration-schema-design-practices.md %}

#### Handling transaction contention

Optimize your queries against [transaction contention]({% link {{ site.current_cloud_version }}/performance-best-practices-overview.md %}#transaction-contention). You may encounter [transaction retry errors]({% link {{ site.current_cloud_version }}/transaction-retry-error-reference.md %}) when you [test application queries](#validate-queries), as well as transaction contention due to long-running transactions when you [conduct the migration]({% link molt/migration-overview.md %}) and bulk load data.

Transaction retry errors are more frequent under CockroachDB's default [`SERIALIZABLE` isolation level]({% link {{ site.current_cloud_version }}/demo-serializable.md %}). If you are migrating an application that was built at a `READ COMMITTED` isolation level, you should first [enable `READ COMMITTED` isolation]({% link {{ site.current_cloud_version }}/read-committed.md %}#enable-read-committed-isolation) on the CockroachDB cluster for compatibility.

#### Unimplemented features and syntax incompatibilities

Update your queries to resolve differences in functionality and SQL syntax.

CockroachDB supports the [PostgreSQL wire protocol](https://www.postgresql.org/docs/current/protocol.html) and is largely [compatible with PostgreSQL syntax]({% link {{ site.current_cloud_version }}/postgresql-compatibility.md %}).

For full compatibility with CockroachDB, you may need to implement workarounds in your schema design, in your [data manipulation language (DML)]({% link {{ site.current_cloud_version }}/sql-statements.md %}#data-manipulation-statements), or in your application code.

For more details on the CockroachDB SQL implementation, refer to [SQL Feature Support]({% link {{ site.current_cloud_version }}/sql-feature-support.md %}).

### Prepare for migration

Once you have a migration plan, prepare the team, application, source database, and CockroachDB cluster for the migration.

#### Run a migration "pre-mortem"

To minimize issues after cutover, compose a migration "pre-mortem":

1. Clearly describe the roles and processes of each team member performing the migration.
1. List the likely failure points and issues that you may encounter as you [conduct the migration]({% link molt/migration-overview.md %}).
1. Rank potential issues by severity, and identify ways to reduce risk.
1. Create a plan for implementing the actions that would most effectively reduce risk.

#### Set up monitoring and alerting

Based on the error budget you [defined in your migration plan](#develop-a-migration-plan), identify the metrics that you can use to measure your success criteria and set up monitoring for the migration. These metrics may be identical to those you normally use in production, but can also be specific to your migration needs.

#### Load test data

It's useful to load test data into CockroachDB so that you can [test your application queries](#validate-queries). Refer to the steps in [Migrate to CockroachDB in Phases]({% link molt/migrate-in-phases.md %}).

#### Validate queries

After you [load the test data](#load-test-data), validate your queries on CockroachDB. You can do this by [shadowing](#shadowing) or by [manually testing](#test-query-results-and-performance) the queries.

Note that CockroachDB defaults to the [`SERIALIZABLE`]({% link {{ site.current_cloud_version }}/demo-serializable.md %}) transaction isolation level. If you are migrating an application that was built at a `READ COMMITTED` isolation level on the source database, you must [enable `READ COMMITTED` isolation]({% link {{ site.current_cloud_version }}/read-committed.md %}#enable-read-committed-isolation) on the CockroachDB cluster for compatibility.

##### Shadowing

You can "shadow" your production workload by executing your source SQL statements on CockroachDB in parallel. You can then [validate the queries](#test-query-results-and-performance) on CockroachDB for consistency, performance, and potential issues with the migration.

##### Test query results and performance

You can manually validate your queries by testing a subset of "critical queries" on an otherwise idle CockroachDB cluster:

- Check the application logs for error messages and the API response time. If application requests are slower than expected, use the **SQL Activity** page on the [CockroachDB {{ site.data.products.cloud }} Console]({% link cockroachcloud/statements-page.md %}) or [DB Console]({% link {{ site.current_cloud_version }}/ui-statements-page.md %}) to find the longest-running queries that are part of that application request. If necessary, tune the queries according to our best practices for [SQL performance]({% link {{ site.current_cloud_version }}/performance-best-practices-overview.md %}).

- Compare the results of the queries and check that they are identical in both the source database and CockroachDB. To do this, you can use [MOLT Verify]({% link molt/molt-verify.md %}).

Test performance on a CockroachDB cluster that is appropriately [sized](#capacity-planning) for your workload:

1. Run the application with single- or very low-concurrency and verify the app's performance is acceptable. The cluster should be provisioned with more than enough resources to handle this workload, because you need to verify that the queries will be fast enough when there are zero resource bottlenecks.

1. Run stress tests with at least the production concurrency and rate, but ideally higher in order to verify that the system can handle unexpected spikes in load. This can also uncover [contention]({% link {{ site.current_cloud_version }}/performance-best-practices-overview.md %}#transaction-contention) issues that will appear during spikes in app load, which may require [application design changes](#handling-transaction-contention) to avoid.

#### Perform a dry run

To further minimize potential surprises when you conduct the migration, practice cutover using your application and similar volumes of data on a "dry-run" environment. Use a test or development environment that is as similar as possible to production.

Performing a dry run is highly recommended. In addition to demonstrating how long the migration may take, a dry run also helps to ensure that team members understand what they need to do during the migration, and that changes to the application are coordinated.

### Cutover strategy

*Cutover* is the process of switching application traffic from the source database to CockroachDB. Once the source data is fully migrated to CockroachDB, you "flip the switch" to route application traffic to the new database, thus ending downtime.

The MOLT toolkit enables [migrations with minimal downtime]({% link molt/migration-overview.md %}#migrations-with-minimal-downtime), using continuous replication of source changes to CockroachDB.

To safely cut over when using replication:

1. Stop application traffic on the source database.
1. Wait for the replication stream to drain.
1. When your [monitoring](#set-up-monitoring-and-alerting) indicates that replication is idle, use [MOLT Verify]({% link molt/molt-verify.md %}) to validate the CockroachDB data.
1. Start application traffic on CockroachDB.

When you are ready to migrate, refer to [Migrate to CockroachDB]({% link molt/migrate-to-cockroachdb.md %}) or [Migrate to CockroachDB in Phases]({% link molt/migrate-in-phases.md %}) for practical examples of the migration steps.

## See also

- [Migration Overview]({% link molt/migration-overview.md %})
- [Migrate to CockroachDB]({% link molt/migrate-to-cockroachdb.md %})
- [Migrate to CockroachDB in Phases]({% link molt/migrate-in-phases.md %})
- [Migration Failback]({% link molt/migrate-failback.md %})
- [Schema Design Overview]({% link {{ site.current_cloud_version }}/schema-design-overview.md %})
- [Primary key best practices]({% link {{ site.current_cloud_version }}/schema-design-table.md %}#primary-key-best-practices)
- [Secondary index best practices]({% link {{ site.current_cloud_version }}/schema-design-indexes.md %}#best-practices)
- [Transaction contention best practices]({% link {{ site.current_cloud_version }}/performance-best-practices-overview.md %}#transaction-contention)