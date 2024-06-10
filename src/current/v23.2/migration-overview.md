---
title: Migration Overview
summary: Learn how to migrate your database to a CockroachDB cluster.
toc: true
docs_area: migrate
---

This page provides an overview of how to migrate a database to CockroachDB.

{{site.data.alerts.callout_info}}
If you need to migrate data from a CockroachDB {{ site.data.products.serverless }} cluster to a CockroachDB {{ site.data.products.dedicated }} cluster, see [Migrate data from Serverless to Dedicated](https://www.cockroachlabs.com/docs/cockroachcloud/migrate-from-serverless-to-dedicated).
{{site.data.alerts.end}}

A database migration broadly consists of the following phases:

1. [Develop a migration plan:](#develop-a-migration-plan) Evaluate your [downtime requirements](#approach-to-downtime) and [cutover strategy](#cutover-strategy), [size the CockroachDB cluster](#capacity-planning) that you will migrate to, and become familiar with the [application changes](#application-changes) that you need to make for CockroachDB.
1. [Prepare for migration:](#prepare-for-migration) Run a [pre-mortem](#run-a-migration-pre-mortem) (optional), set up [metrics](#set-up-monitoring-and-alerting) (optional), [convert your schema](#convert-the-schema), perform an [initial load of test data](#load-test-data), [validate your application queries](#validate-queries) for correctness and performance, and [perform a dry run](#perform-a-dry-run) of the migration.
1. [Conduct the migration:](#conduct-the-migration) Use a [lift-and-shift](#lift-and-shift) or ["zero-downtime"](#zero-downtime) method to migrate your data, application, and users to CockroachDB.
1. [Complete the migration:](#complete-the-migration) Notify the appropriate parties and summarize the details.

{{site.data.alerts.callout_success}}
If you need help migrating to CockroachDB, contact our <a href="mailto:sales@cockroachlabs.com">sales team</a>.
{{site.data.alerts.end}}

## Develop a migration plan

Consider the following as you plan your migration:

- Who will lead and perform the migration? Which teams are involved, and which aspects are they responsible for?
- Which internal and external parties do you need to inform about the migration?
- Which external or third-party tools (e.g., microservices, analytics, payment processors, aggregators, CRMs) must be tested and migrated along with your application?
- What portion of the data can be inconsistent, and for how long? What is the tolerable percentage of latency and application errors? This comprises your "error budget".
- What is the tolerable [downtime](#approach-to-downtime), and what [cutover strategy](#cutover-strategy) will you use to switch users to CockroachDB?
- Will you set up a "dry-run" environment to test the migration? How many [dry-run migrations](#perform-a-dry-run) will you perform?
- When is the best time to perform this migration to be minimally disruptive to the database's users?
- What is your target date for completing the migration?

Create a document that summarizes the intent of the migration, the technical details, and the team members involved.

### Approach to downtime

A primary consideration is whether your application can tolerate downtime:

- What types of operations can you suspend: reads, writes, or both?
- How long can operations be suspended: seconds, minutes, or hours?
- Should writes be queued while service is suspended?

Take the following two use cases:

- An application that is primarily in use during daytime business hours may be able to be taken offline during a predetermined timeframe without disrupting the user experience and business continuity. In this case, your migration can occur in a [downtime window](#downtime-window).
- An application that must serve writes continuously cannot tolerate a long downtime window. In this case, you will aim for [zero or near-zero downtime](#minimal-downtime).

#### Downtime window

If your application can tolerate downtime, then it will likely be easiest to take your application offline, load a snapshot of the data into CockroachDB, and perform a [cutover](#cutover-strategy) to CockroachDB once the data is migrated. This is known as a *lift-and-shift* migration.

A lift-and-shift approach is the most straightforward. However, it's important to fully [prepare the migration](#prepare-for-migration) in order to be certain that it can be completed successfully during the downtime window.

- *Scheduled downtime* is made known to your users in advance. Once you have [prepared for the migration](#prepare-for-migration), you take the application offline, [conduct the migration](#conduct-the-migration), and bring the application back online on CockroachDB. To succeed, you should estimate the amount of downtime required to migrate your data, and ideally schedule the downtime outside of peak hours. Scheduling downtime is easiest if your application traffic is "periodic", meaning that it varies by the time of day, day of week, or day of month.

- *Unscheduled downtime* impacts as few customers as possible, ideally without impacting their regular usage. If your application is intentionally offline at certain times (e.g., outside business hours), you can migrate the data without users noticing. Alternatively, if your application's functionality is not time-sensitive (e.g., it sends batched messages or emails), then you can queue requests while your system is offline, and process those requests after completing the migration to CockroachDB.

- *Reduced functionality* takes some, but not all, application functionality offline. For example, you can disable writes but not reads while you migrate the application data, and queue data to be written after completing the migration.

For an overview of lift-and-shift migrations to CockroachDB, see [Lift and Shift](#lift-and-shift).

#### Minimal downtime

If your application cannot tolerate downtime, then you should aim for a "zero-downtime" approach. This reduces downtime to an absolute minimum, such that users do not notice the migration.

The minimum possible downtime depends on whether you can tolerate inconsistency in the migrated data:

- Migrations performed using *consistent cutover* reduce downtime to an absolute minimum (i.e., seconds or sub-seconds) while keeping data synchronized between the source database and CockroachDB. **Consistency requires downtime.** In this approach, downtime occurs right before [cutover](#cutover-strategy), as you drain the remaining transactions from the source database to CockroachDB.

- Migrations performed using *immediate cutover* can reduce downtime to zero. These require the most preparation, and typically allow read/write traffic to both databases for at least a short period of time, sacrificing consistency for availability. {% comment %}You can use the CockroachDB Live Migration Service (MOLT LMS) to run application queries simultaneously on your source database and CockroachDB.{% endcomment %} Without stopping application traffic, you perform an **immediate** [cutover](#cutover-strategy), while assuming that some writes will not be replicated to CockroachDB. You may want to manually reconcile these data inconsistencies after switching over.

For an overview of zero-downtime migrations to CockroachDB, see [Zero Downtime](#zero-downtime). {% comment %}For details, see [Migration Strategy: Zero Downtime](migration-strategy-zero-downtime).{% endcomment %}

### Cutover strategy

*Cutover* is the process of switching application traffic from the source database to CockroachDB. Consider the following:

- Will you perform the cutover all at once, or incrementally (e.g., by a subset of users, workloads, or tables)?

	- Switching all at once generally follows a [downtime window](#downtime-window) approach. Once the data is migrated to CockroachDB, you "flip the switch" to route application traffic to the new database, thus ending downtime.

	- Migrations with [zero or near-zero downtime](#minimal-downtime) can switch either all at once or incrementally, since writes are being synchronously replicated and the system can be gradually migrated as you [validate the queries](#validate-queries).

- Will you have a fallback plan that allows you to reverse ("roll back") the migration from CockroachDB to the source database? A fallback plan enables you to fix any issues or inconsistencies that you encounter during or after cutover, then retry the migration.

#### All at once (no rollback)

This is the simplest cutover method, since you won't need to develop and execute a fallback plan.

As part of [migration preparations](#prepare-for-migration), you will have already [tested your queries and performance](#test-query-results-and-performance) to have confidence to migrate without a rollback option. After moving all of the data from the source database to CockroachDB, you switch application traffic to CockroachDB.

#### All at once (rollback)

This method adds a fallback plan to the simple [all-at-once](#all-at-once-no-rollback) cutover.

In addition to moving data to CockroachDB, data is also replicated from CockroachDB back to the source database in case you need to roll back the migration. Continuous replication is already possible when performing a [zero-downtime migration](#zero-downtime) that dual writes to both databases. Otherwise, you will need to ensure that data is replicated in the reverse direction at cutover. The challenge is to find a point at which both the source database and CockroachDB are in sync, so that you can roll back to that point. You should also avoid falling into a circular state where updates continuously travel back and forth between the source database and CockroachDB.

#### Phased rollout

Also known as the ["strangler fig"](https://en.wikipedia.org/wiki/Strangler_fig) approach, a phased rollout migrates a portion of your users, workloads, or tables over time. Until all users, workloads, and/or tables are migrated, the application will continue to write to both databases.

This approach enables you to take your time with the migration, and to pause or roll back as you [monitor the migration](#set-up-monitoring-and-alerting) for issues and performance. Rolling back the migration involves the same caveats and considerations as for the [all-at-once](#all-at-once-rollback) method. Because you can control the blast radius of your migration by routing traffic for a subset of users or services, a phased rollout has reduced business risk and user impact at the cost of increased implementation risk. You will need to figure out how to migrate in phases while ensuring that your application is unaffected.

### Capacity planning

{{site.data.alerts.callout_success}}
If you need help migrating to CockroachDB, contact our <a href="mailto:sales@cockroachlabs.com">sales team</a>.
{{site.data.alerts.end}}

Determine the size of the target CockroachDB cluster. To do this, consider your data volume and workload characteristics:

- What is the total size of the data you will migrate?
- How many active [application connections]({% link {{ page.version.version }}/recommended-production-settings.md %}#connection-pooling) will be running in the CockroachDB environment?

Use this information to size the CockroachDB cluster you will create. If you are migrating to a CockroachDB {{ site.data.products.cloud }} cluster, see [Plan Your Cluster](https://www.cockroachlabs.com/docs/cockroachcloud/plan-your-cluster) for details:

- For CockroachDB {{ site.data.products.dedicated }}, refer to the [example](https://www.cockroachlabs.com/docs/cockroachcloud/plan-your-cluster#dedicated-example) that shows how your data volume, storage requirements, and replication factor affect the recommended node size (number of vCPUs per node) and total number of nodes on the cluster.
- For CockroachDB {{ site.data.products.serverless }}, your cluster will scale automatically to meet your storage and usage requirements. Refer to [Choosing resource limits](https://www.cockroachlabs.com/docs/cockroachcloud/plan-your-cluster-serverless#choose-resource-limits) to learn about how to limit your resource consumption.
- For guidance on sizing for connection pools, see the CockroachDB {{ site.data.products.cloud }} [Production Checklist](https://www.cockroachlabs.com/docs/cockroachcloud/production-checklist#use-a-pool-of-persistent-connections).

If you are migrating to a CockroachDB {{ site.data.products.core }} cluster:

- Refer to our [sizing methodology]({% link {{ page.version.version }}/recommended-production-settings.md %}#sizing) to determine the total number of vCPUs on the cluster and the number of vCPUs per node (which determines the number of nodes on the cluster).
- Refer to our [storage recommendations]({% link {{ page.version.version }}/recommended-production-settings.md %}#storage) to determine the amount of storage to provision on each node.
- For guidance on sizing for connection pools, see the CockroachDB {{ site.data.products.core }} [Production Checklist]({% link {{ page.version.version }}/recommended-production-settings.md %}#connection-pooling).

### Application changes

As you develop your migration plan, consider the application changes that you will need to make. These may relate to the following:

- [Designing a schema that is compatible with CockroachDB.](#schema-design-best-practices)
- [Creating effective indexes on CockroachDB.](#index-creation-best-practices)
- [Handling transaction contention.](#handling-transaction-contention)
- [Unimplemented features and syntax incompatibilities.](#unimplemented-features-and-syntax-incompatibilities)

#### Schema design best practices

Follow these recommendations when [converting your schema](#convert-the-schema) for compatibility with CockroachDB.

{{site.data.alerts.callout_success}}
The [Schema Conversion Tool](https://www.cockroachlabs.com/docs/cockroachcloud/migrations-page) automatically identifies potential improvements to your schema.
{{site.data.alerts.end}}

- You should define an explicit primary key on every table. For more information, see [Primary key best practices]({% link {{ page.version.version }}/schema-design-table.md %}#primary-key-best-practices).

- Do not use a sequence to define a primary key column. Instead, Cockroach Labs recommends that you use [multi-column primary keys]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#use-multi-column-primary-keys) or [auto-generating unique IDs]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#use-functions-to-generate-unique-ids) for primary key columns.

- By default on CockroachDB, `INT` is an alias for `INT8`, which creates 64-bit signed integers. Depending on your source database or application requirements, you may need to change the integer size to `4`. For example, [PostgreSQL defaults to 32-bit integers](https://www.postgresql.org/docs/9.6/datatype-numeric.html). For more information, see [Considerations for 64-bit signed integers]({% link {{ page.version.version }}/int.md %}#considerations-for-64-bit-signed-integers).

#### Index creation best practices

Review the [best practices for creating secondary indexes]({% link {{ page.version.version }}/schema-design-indexes.md %}#best-practices) on CockroachDB. 

{% include {{page.version.version}}/performance/use-hash-sharded-indexes.md %}

#### Handling transaction contention

Optimize your queries against [transaction contention]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#transaction-contention). You may encounter [transaction retry errors]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}) when you [test application queries](#validate-queries), as well as transaction contention due to long-running transactions when you [conduct the migration](#conduct-the-migration) and bulk load data. 

Transaction retry errors are more frequent under CockroachDB's default [`SERIALIZABLE` isolation level]({% link {{ page.version.version }}/demo-serializable.md %}). If you are migrating an application that was built at a `READ COMMITTED` isolation level, you should first [enable `READ COMMITTED` isolation]({% link {{ page.version.version }}/read-committed.md %}#enable-read-committed-isolation) on the CockroachDB cluster for compatibility.

#### Unimplemented features and syntax incompatibilities

Update your queries to resolve differences in functionality and SQL syntax.

{{site.data.alerts.callout_success}}
The [Schema Conversion Tool](https://www.cockroachlabs.com/docs/cockroachcloud/migrations-page) automatically flags syntax incompatibilities and unimplemented features in your schema.
{{site.data.alerts.end}}

CockroachDB supports the [PostgreSQL wire protocol](https://www.postgresql.org/docs/current/protocol.html) and is largely compatible with PostgreSQL syntax. However, the following PostgreSQL features do not yet exist in CockroachDB:

{% include {{page.version.version}}/sql/unsupported-postgres-features.md %}

If your source database uses any of the preceding features, you may need to implement workarounds in your schema design, in your [data manipulation language (DML)]({% link {{ page.version.version }}/sql-statements.md %}#data-manipulation-statements), or in your application code.

For more details on the CockroachDB SQL implementation, see [SQL Feature Support]({% link {{ page.version.version }}/sql-feature-support.md %}).

## Prepare for migration

Once you have a migration plan, prepare the team, application, source database, and CockroachDB cluster for the migration.

### Run a migration "pre-mortem"

{{site.data.alerts.callout_success}}
This step is optional.
{{site.data.alerts.end}}

To minimize issues after [cutover](#cutover-strategy), compose a migration "pre-mortem":

- Clearly describe the roles and processes of each team member performing the migration.
- List the likely failure points and issues that you may encounter as you [conduct the migration](#conduct-the-migration).
- Rank potential issues by severity, and identify ways to reduce risk.
- Create a plan for implementing the actions that would most effectively reduce risk.

### Set up monitoring and alerting

{{site.data.alerts.callout_success}}
This step is optional.
{{site.data.alerts.end}}

Based on the error budget you [defined in your migration plan](#develop-a-migration-plan), identify the metrics that you can use to measure your success criteria and set up monitoring for the migration. These metrics may be identical to those you normally use in production, but can also be specific to your migration needs.

### Update the schema and queries

In the following order:

1. [Convert your schema](#convert-the-schema).
1. [Load test data](#load-test-data).
1. [Validate your application queries](#validate-queries).

<a name="molt"></a>

You can use the following MOLT (Migrate Off Legacy Technology) tools to simplify these steps:

- [Schema Conversion Tool](https://www.cockroachlabs.com/docs/cockroachcloud/migrations-page)
- [MOLT Fetch]({% link molt/molt-fetch.md %})
- [MOLT Verify]({% link molt/molt-verify.md %})

#### Convert the schema

First, convert your database schema to an equivalent CockroachDB schema:

- Use the [Schema Conversion Tool](https://www.cockroachlabs.com/docs/cockroachcloud/migrations-page) to convert your schema line-by-line. This requires a free [CockroachDB {{ site.data.products.cloud }} account](https://www.cockroachlabs.com/docs/cockroachcloud/create-an-account). The tool will convert the syntax, identify [unimplemented features and syntax incompatibilities](#unimplemented-features-and-syntax-incompatibilities) in the schema, and suggest edits according to CockroachDB [best practices](#schema-design-best-practices).
	{{site.data.alerts.callout_info}}
	The Schema Conversion Tool accepts `.sql` files from PostgreSQL, MySQL, Oracle, and Microsoft SQL Server.
	{{site.data.alerts.end}}

- Alternatively, manually convert the schema according to our [schema design best practices](#schema-design-best-practices){% comment %}and data type mappings{% endcomment %}. You can also [export a partially converted schema](https://www.cockroachlabs.com/docs/cockroachcloud/migrations-page#export-the-schema) from the Schema Conversion Tool to finish the conversion manually.

Then import the converted schema to a CockroachDB cluster:

- For CockroachDB {{ site.data.products.cloud }}, use the Schema Conversion Tool to [migrate the converted schema to a new {{ site.data.products.serverless }} or {{ site.data.products.dedicated }} database](https://www.cockroachlabs.com/docs/cockroachcloud/migrations-page#migrate-the-schema).
- For CockroachDB {{ site.data.products.core }}, pipe the [data definition language (DDL)]({% link {{ page.version.version }}/sql-statements.md %}#data-definition-statements) directly into [`cockroach sql`]({% link {{ page.version.version }}/cockroach-sql.md %}). You can [export a converted schema file](https://www.cockroachlabs.com/docs/cockroachcloud/migrations-page#export-the-schema) from the Schema Conversion Tool.
	{{site.data.alerts.callout_success}}
	For the fastest performance, you can use a [local, single-node CockroachDB cluster]({% link {{ page.version.version }}/cockroach-start-single-node.md %}#start-a-single-node-cluster) to convert your schema and [check the results of queries](#test-query-results-and-performance).
	{{site.data.alerts.end}}

#### Load test data

{{site.data.alerts.callout_success}}
Before moving data, Cockroach Labs recommends [dropping any indexes]({% link {{ page.version.version }}/drop-index.md %}) on the CockroachDB database. The indexes can be [recreated]({% link {{ page.version.version }}/create-index.md %}) after the data is loaded. Doing so will optimize performance.
{{site.data.alerts.end}}

After [converting the schema](#convert-the-schema), load your data into CockroachDB so that you can [test your application queries](#validate-queries). Then use [MOLT Fetch]({% link molt/molt-fetch.md %}) to move the source data to CockroachDB.

Alternatively, you can use one of the following methods to migrate the data. Additional tooling may be required to extract or convert the data to a supported file format.

- {% include {{ page.version.version }}/migration/load-data-import-into.md %} Typically during a migration, data is initially loaded before foreground application traffic begins to be served, so the impact of taking the table offline when running `IMPORT INTO` may be minimal.
- {% include {{ page.version.version }}/migration/load-data-third-party.md %} Within the tool, you can select the database tables to migrate to the test cluster.
- {% include {{ page.version.version }}/migration/load-data-copy-from.md %}

#### Validate queries

After you [load the test data](#load-test-data), validate your queries on CockroachDB. You can do this by [shadowing](#shadowing) or by [manually testing](#test-query-results-and-performance) the queries.

Note that CockroachDB defaults to the [`SERIALIZABLE`]({% link {{ page.version.version }}/demo-serializable.md %}) transaction isolation level. If you are migrating an application that was built at a `READ COMMITTED` isolation level on the source database, you must [enable `READ COMMITTED` isolation]({% link {{ page.version.version }}/read-committed.md %}#enable-read-committed-isolation) on the CockroachDB cluster for compatibility.

##### Shadowing

You can "shadow" your production workload by executing your source SQL statements on CockroachDB in parallel. You can then [validate the queries](#test-query-results-and-performance) on CockroachDB for consistency, performance, and potential issues with the migration.

The [CockroachDB Live Migration Service (MOLT LMS)]({% link molt/live-migration-service.md %}) can [perform shadowing]({% link molt/live-migration-service.md %}#shadowing-modes). This is intended only for [testing](#test-query-results-and-performance) or [performing a dry run](#perform-a-dry-run). Shadowing should **not** be used in production when performing a [live migration](#zero-downtime).

##### Test query results and performance

You can manually validate your queries by testing a subset of "critical queries" on an otherwise idle CockroachDB cluster:

- Check the application logs for error messages and the API response time. If application requests are slower than expected, use the **SQL Activity** page on the [CockroachDB {{ site.data.products.cloud }} Console](https://www.cockroachlabs.com/docs/cockroachcloud/statements-page) or [DB Console]({% link {{ page.version.version }}/ui-statements-page.md %}) to find the longest-running queries that are part of that application request. If necessary, tune the queries according to our best practices for [SQL performance]({% link {{ page.version.version }}/performance-best-practices-overview.md %}).

- Compare the results of the queries and check that they are identical in both the source database and CockroachDB. To do this, you can use [MOLT Verify]({% link molt/molt-verify.md %}).

Test performance on a CockroachDB cluster that is appropriately [sized](#capacity-planning) for your workload:

1. Run the application with single- or very low-concurrency and verify the app's performance is acceptable. The cluster should be provisioned with more than enough resources to handle this workload, because you need to verify that the queries will be fast enough when there are zero resource bottlenecks.

1. Run stress tests with at least the production concurrency and rate, but ideally higher in order to verify that the system can handle unexpected spikes in load. This can also uncover [contention]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#transaction-contention) issues that will appear during spikes in app load, which may require [application design changes](#handling-transaction-contention) to avoid.

### Perform a dry run

To further minimize potential surprises when you conduct the migration, practice [cutover](#cutover-strategy) using your application and similar volumes of data on a "dry-run" environment. Use a test or development environment that is as similar as possible to production.

Performing a dry run is highly recommended. In addition to demonstrating how long the migration may take, a dry run also helps to ensure that team members understand what they need to do during the migration, and that changes to the application are coordinated.

## Conduct the migration

Before proceeding, double-check that you are [prepared to migrate](#prepare-for-migration).

Once you are ready to migrate, optionally [drop the database]({% link {{ page.version.version }}/drop-database.md %}) and delete the test cluster so that you can get a clean start:

{% include_cached copy-clipboard.html %}
~~~ sql
DROP DATABASE {database-name} CASCADE;
~~~

Alternatively, [truncate]({% link {{ page.version.version }}/truncate.md %}) each table you used for testing to avoid having to recreate your schema:

{% include_cached copy-clipboard.html %}
~~~ sql
TRUNCATE {table-name} CASCADE;
~~~

Migrate your data to CockroachDB using the method that is appropriate for your [downtime requirements](#approach-to-downtime) and [cutover strategy](#cutover-strategy).

### Lift and Shift

Using this method, consistency is achieved by only performing the cutover once all writes have been replicated from the source database to CockroachDB. This requires downtime during which the application traffic is stopped.

The following is a high-level overview of the migration steps. For considerations and details about the pros and cons of this approach, see [Migration Strategy: Lift and Shift]({% link {{ page.version.version }}/migration-strategy-lift-and-shift.md %}).

1. Stop application traffic to your source database. **This begins downtime.**
1. Use [MOLT Fetch]({% link molt/molt-fetch.md %}) to move the source data to CockroachDB.
1. After the data is migrated, use [MOLT Verify]({% link molt/molt-verify.md %}) to validate the consistency of the data between the source database and CockroachDB.
1. Perform a [cutover](#cutover-strategy) by resuming application traffic, now to CockroachDB.
{% comment %}1. If you want the ability to [roll back](#all-at-once-rollback) the migration, replicate data back to the source database.{% endcomment %}

### Zero Downtime

During a "live migration", downtime is minimized by performing the cutover while writes are still being replicated from the source database to CockroachDB. Inconsistencies are resolved through manual reconciliation.

The following is a high-level overview of the migration steps. The two approaches are mutually exclusive, and each has [tradeoffs](#minimal-downtime). {% comment %}For details on this migration strategy, see [Migration Strategy: Zero Downtime]({% link {{ page.version.version }}/migration-strategy-lift-and-shift.md %}).{% endcomment %}

To prioritize consistency and minimize downtime:

1. Set up the [CockroachDB Live Migration Service (MOLT LMS)]({% link molt/live-migration-service.md %}) to proxy for application traffic between your source database and CockroachDB. Do **not** shadow the application traffic.
1. Use [MOLT Fetch]({% link molt/molt-fetch.md %}) to move the source data to CockroachDB. Use the tool to [**replicate ongoing changes**]({% link molt/molt-fetch.md %}#replication) after it performs the initial load of data into CockroachDB. 
1. As the data is migrating, use [MOLT Verify]({% link molt/molt-verify.md %}) to validate the consistency of the data between the source database and CockroachDB.
1. After nearly all data from your source database has been moved to CockroachDB (for example, with a <1-second delay or <1000 rows), use MOLT LMS to begin a [*consistent cutover*]({% link molt/live-migration-service.md %}#consistent-cutover) and stop application traffic to your source database. **This begins downtime.**
1. Wait for MOLT Fetch to finish replicating changes to CockroachDB.
1. Use MOLT LMS to commit the [consistent cutover]({% link molt/live-migration-service.md %}#consistent-cutover). This resumes application traffic, now to CockroachDB.

To achieve zero downtime with inconsistency:

1. Set up the [CockroachDB Live Migration Service (MOLT LMS)]({% link molt/live-migration-service.md %}) to proxy for application traffic between your source database and CockroachDB. Use a [shadowing mode]({% link molt/live-migration-service.md %}#shadowing-modes) to run application queries simultaneously on your source database and CockroachDB.
1. Use [MOLT Fetch]({% link molt/molt-fetch.md %}) to move the source data to CockroachDB. Use the tool to **replicate ongoing changes** after performing the initial load of data into CockroachDB.
1. As the data is migrating, you can use [MOLT Verify]({% link molt/molt-verify.md %}) to validate the consistency of the data between the source database and CockroachDB.
1. After nearly all data from your source database has been moved to CockroachDB (for example, with a <1 second delay or <1000 rows), perform an [*immediate cutover*](#cutover-strategy) by pointing application traffic to CockroachDB.
1. Manually reconcile any inconsistencies caused by writes that were not replicated during the cutover.
1. Close the connection to the source database when you are ready to finish the migration.

## Complete the migration

After you have successfully [conducted the migration](#conduct-the-migration):

- Notify the teams and other stakeholders impacted by the migration.
- Retire any test or development environments used to verify the migration.
- Extend the document you created when [developing your migration plan](#develop-a-migration-plan) with any issues encountered and follow-up work that needs to be done.

## See also

- [Can a PostgreSQL or MySQL application be migrated to CockroachDB?]({% link {{ page.version.version }}/frequently-asked-questions.md %}#can-a-postgresql-or-mysql-application-be-migrated-to-cockroachdb)
- [PostgreSQL Compatibility]({% link {{ page.version.version }}/postgresql-compatibility.md %})
- [Use the Schema Conversion Tool](https://www.cockroachlabs.com/docs/cockroachcloud/migrations-page)
- [Schema Design Overview]({% link {{ page.version.version }}/schema-design-overview.md %})
- [Create a User-defined Schema]({% link {{ page.version.version }}/schema-design-schema.md %})
- [Primary key best practices]({% link {{ page.version.version }}/schema-design-table.md %}#primary-key-best-practices)
- [Secondary index best practices]({% link {{ page.version.version }}/schema-design-indexes.md %}#best-practices)
- [Transaction contention best practices]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#transaction-contention)
- [Back Up and Restore]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %})
