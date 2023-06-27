---
title: Migrate Your Database to CockroachDB
summary: Learn how to migrate your database to a CockroachDB cluster.
toc: true
docs_area: migrate
---

This page provides an overview of how to migrate a database to CockroachDB.

{{site.data.alerts.callout_info}}
If you need to migrate data from a {{ site.data.products.serverless }} cluster to a {{ site.data.products.dedicated }} cluster, see [Migrate data from Serverless to Dedicated](../cockroachcloud/migrate-from-serverless-to-dedicated.html).
{{site.data.alerts.end}}

A database migration broadly consists of the following phases:

1. [Develop a migration plan:](#develop-a-migration-plan) Evaluate your [downtime requirements](#approach-to-downtime) and [cutover strategy](#cutover-strategy), [size the CockroachDB cluster](#capacity-planning) that you will migrate to, and become familiar with the [application changes](#application-changes) that you need to make for CockroachDB.
1. [Prepare for migration:](#prepare-for-migration) Run a [pre-mortem](#run-a-migration-pre-mortem), set up [metrics](#set-up-monitoring-and-alerting), [convert your schema](#convert-the-schema), perform an [initial load of test data](#load-test-data), and [validate your application queries](#validate-queries) for consistency and performance.
1. [Conduct the migration:](#conduct-the-migration) Use a [lift-and-shift](#lift-and-shift) or ["zero-downtime"](#zero-downtime) method to migrate your data, application, and users to CockroachDB.

## Develop a migration plan

Consider the following as you plan your migration:

- Who will lead and perform the migration? Which teams are involved, and which aspects are they responsible for?
- Which internal and external parties do you need to inform about the migration?
- What portion of the data can be inconsistent, and for how long? What percentage of latency and application errors can you tolerate?
- How much [downtime](#approach-to-downtime) can you tolerate, and what [cutover strategy](#cutover-strategy) will you use to switch users to CockroachDB? 
- What is your target date for completing the migration?

### Approach to downtime

A primary consideration is whether your application can tolerate downtime:

- What types of operations can you suspend: reads, writes, or both?
- How long can operations be suspended: seconds, minutes, or hours?
- Should writes be queued while service is suspended?

Take the following two use cases:

- An application that is primarily in use during daytime business hours can be taken offline during a predetermined timeframe without disrupting the user experience and business continuity. In this case, your migration can occur in a [downtime window](#downtime-window).
- An application that must serve writes continuously cannot tolerate a long downtime window. In this case, you will aim for [zero or near-zero downtime](#zero-or-near-zero-downtime).

In general, migrating with less downtime raises the possibility of data inconsistencies that have to be reconciled.

#### Downtime window

If your application can tolerate downtime, then you will take your application offline, load a snapshot of the data onto CockroachDB, and perform a [cutover](#cutover-strategy) to CockroachDB once the data is migrated. This is known as a *lift-and-shift* migration.

A lift-and-shift approach is the most straightforward. However, it's important to fully [prepare the migration](#prepare-for-migration) in order to be certain that it can be completed successfully during the downtime window.

- *Planned downtime* is announced to your users in advance. Once you have [prepared for the migration](#prepare-for-migration), you take the application offline, [conduct the migration](#conduct-the-migration), and bring the application back online on CockroachDB. To succeed, you should estimate the amount of downtime required to migrate your data, and ideally schedule the downtime outside of peak hours. Scheduling downtime is easiest if your application traffic is "seasonal", meaning that it is less active during predictable hours.

- *Unannounced downtime* impacts as few customers as possible, ideally without impacting their regular usage. If your application is intentionally offline at certain times (e.g., outside business hours), you can migrate the data without users noticing. Alternatively, if your application's functionality is not time-sensitive (e.g., it sends batched messages or emails), then you can queue requests while your system is offline, and process those requests after completing the migration to CockroachDB.

- *Reduced functionality* takes some, but not all, application functionality offline. For example, you can disable writes but not reads while you migrate the application data, and queue data to be written after completing the migration.

For an overview of lift-and-shift migrations to CockroachDB, see [Lift and Shift](#lift-and-shift). {% comment %}For details, see [Migration Strategy: Lift and Shift](migration-strategy-lift-and-shift).{% endcomment %}

#### Zero or near-zero downtime

If your application cannot tolerate downtime, then you should aim for a "zero-downtime" approach. "Zero" means that downtime is reduced to either an absolute minimum or zero, such that users do not notice the migration.

The minimum possible downtime depends on whether you can tolerate inconsistency in the migrated data:

- *Consistent* migrations reduce downtime to an absolute minimum (i.e., from 30 seconds to sub-seconds) while keeping data synchronized between the legacy database and CockroachDB. **Consistency requires downtime.** In this approach, downtime occurs right before [cutover](#cutover-strategy), as you drain the remaining transactions on the legacy database.

- *Inconsistent* migrations reduce downtime to zero. These require the most preparation, and typically involve "dual writing" to both databases in lockstep. This means forking the workload and applying writes to both the legacy database and CockroachDB, side-by-side. {% comment %}You can use the CockroachDB Live Migration Service (MOLT LMS) to run application queries simultaneously on your legacy database and CockroachDB.{% endcomment %} Without stopping application traffic, you perform an immediate [cutover](#cutover-strategy), while assuming that some writes will not be replicated to CockroachDB. You must manually reconcile these data inconsistencies after switching over.

For an overview of zero-downtime migrations to CockroachDB, see [Zero Downtime](#zero-downtime). {% comment %}For details, see [Migration Strategy: Zero Downtime](migration-strategy-zero-downtime).{% endcomment %}

### Cutover strategy

*Cutover* is the process of switching application traffic from the legacy database to CockroachDB. Consider the following:

- Will you perform the cutover all at once, or incrementally (e.g., by a subset of users, workload, or tables)?

	- Switching all at once generally follows a [downtime window](#downtime-window). Once the data is migrated to CockroachDB, you "flip the switch" to route application traffic to the new database, thus ending downtime.

	- Migrations with [zero or near-zero downtime](#zero-or-near-zero-downtime) can switch either all at once or incrementally, since writes are being synchronously replicated and the system can be gradually migrated as you [validate the queries](#validate-queries).

- Will you have a fallback plan in which you reverse ("roll back") the migration from CockroachDB to the legacy database? A fallback plan enables you to fix any issues or inconsistencies that you encounter during or after cutover, then retry the migration.

#### All at once (no rollback)

This is the simplest cutover plan, since you won't need to develop and execute a fallback method. It is typically used with [lift-and-shift migrations](#lift-and-shift).

After moving all of the data from the legacy database to CockroachDB, you switch application traffic to CockroachDB. Since you cannot roll back the migration after switching over, you **must** [validate your queries](#validate-queries) first.

#### All at once (rollback)

This method can be used for [lift-and-shift migrations](#lift-and-shift), as well as for [zero-downtime migrations](#zero-downtime).

In addition to moving data to CockroachDB, data is also replicated from CockroachDB back to the legacy database. Continuous replication is already possible when performing a zero-downtime migration that dual writes to both databases. Otherwise, you will need to ensure that writes are consistent in both directions.

#### Phased rollout

Also known as the ["strangler fig"](https://en.wikipedia.org/wiki/Strangler_fig) approach, a phased rollout migrates a portion of your users, workload, or tables over time. Meanwhile, the application continues writing to the legacy database.

This approach enables you to take your time with the migration, and to pause or roll back as you [monitor the migration](#set-up-monitoring-and-alerting) for issues and performance. A phased rollout has the least risk and user impact, since you can control the blast radius of your migration by routing traffic for a subset of users or services. However, it has the highest development effort, since you will need to figure out how to migrate in phases while maintaining consistency.

### Capacity planning

Determine the size of the target CockroachDB cluster. To do this, consider your data volume and workload characteristics:

- What is the total size of the data you will migrate?
- How many active [application connections](recommended-production-settings.html#connection-pooling) will be running in the CockroachDB environment?

Use this information to size the CockroachDB cluster you will create. If you are migrating to a {{ site.data.products.db }} cluster, see [Plan Your Cluster](../cockroachcloud/plan-your-cluster.html) for details:

- For {{ site.data.products.dedicated }}, refer to the [example](../cockroachcloud/plan-your-cluster.html#dedicated-example) that shows how your data volume, storage requirements, and replication factor affect the recommended node size (number of vCPUs per node) and total number of nodes on the cluster.
- For {{ site.data.products.serverless }}, your cluster will scale automatically to meet your storage and usage requirements. Refer to [Choosing resource limits](../cockroachcloud/learn-about-pricing.html#choosing-resource-limits) to learn about how to limit your resource consumption.
- For guidance on sizing for connection pools, see the {{ site.data.products.db }} [Production Checklist](../cockroachcloud/production-checklist.html#use-a-pool-of-persistent-connections).

If you are migrating to a {{ site.data.products.core }} cluster:

- Refer to our [sizing methodology](recommended-production-settings.html#sizing) to determine the total number of vCPUs on the cluster and the number of vCPUs per node (which determines the number of nodes on the cluster).
- Refer to our [storage recommendations](recommended-production-settings.html#storage) to determine the amount of storage to provision on each node.
- For guidance on sizing for connection pools, see the {{ site.data.products.core }} [Production Checklist](recommended-production-settings.html#connection-pooling).

### Application changes

As you develop your migration plan, consider the application changes that you will need to make. These may relate to the following:

- [Designing a schema that is compatible with CockroachDB.](#schema-design-best-practices)
- [Creating effective indexes on CockroachDB.](#index-creation-best-practices)
- [Handling transaction contention.](#handling-transaction-contention)
- [Unimplemented features and syntax incompatibilities.](#unimplemented-features-and-syntax-incompatibilities)

#### Schema design best practices

Follow these recommendations when [converting your schema](#convert-the-schema) for compatibility with CockroachDB.

{{site.data.alerts.callout_success}}
The [Schema Conversion Tool](../cockroachcloud/migrations-page.html) automatically identifies potential improvements to your schema.
{{site.data.alerts.end}}

- You should define an explicit primary key on every table. For more information, see [Primary key best practices](schema-design-table.html#primary-key-best-practices).

- Do not use a sequence to define a primary key column. Instead, Cockroach Labs recommends that you use [multi-column primary keys](performance-best-practices-overview.html#use-multi-column-primary-keys) or [auto-generating unique IDs](sql-faqs.html#how-do-i-auto-generate-unique-row-ids-in-cockroachdb) for primary key columns. For more information, see [`CREATE SEQUENCE`](create-sequence.html#considerations).

- By default on CockroachDB, `INT` is an alias for `INT8`, which creates 64-bit signed integers. Depending on your source database or application requirements, you may need to change the integer size to `4`. For example, [PostgreSQL defaults to 32-bit integers](https://www.postgresql.org/docs/9.6/datatype-numeric.html). For more information, see [Considerations for 64-bit signed integers](int.html#considerations-for-64-bit-signed-integers).

#### Index creation best practices

Review the [best practices for creating secondary indexes](schema-design-indexes.html#best-practices) on CockroachDB. 

{% include {{page.version.version}}/performance/use-hash-sharded-indexes.md %}

#### Handling transaction contention

Optimize your queries against [transaction contention](performance-best-practices-overview.html#transaction-contention). You will likely encounter [transaction retry errors](transaction-retry-error-reference.html) related to CockroachDB's [`SERIALIZABLE` isolation level](demo-serializable.html) when you [test application queries](#validate-queries), as well as transaction contention due to long-running transactions when you [conduct the migration](#conduct-the-migration) and bulk load data.

#### Unimplemented features and syntax incompatibilities

Update your queries to resolve differences in functionality and SQL syntax.

{{site.data.alerts.callout_success}}
The [Schema Conversion Tool](../cockroachcloud/migrations-page.html) automatically flags syntax incompatibilities and unimplemented features in your schema.
{{site.data.alerts.end}}

CockroachDB supports the [PostgreSQL wire protocol](https://www.postgresql.org/docs/current/protocol.html) and is largely compatible with PostgreSQL syntax. However, the following PostgreSQL features do not yet exist in CockroachDB:

{% include {{page.version.version}}/sql/unsupported-postgres-features.md %}

If your source database uses any of the preceding features, you may need to implement workarounds in your schema design, in your [data manipulation language (DML)](sql-statements.html#data-manipulation-statements), or in your application code](#step-3-test-and-update-your-application).

For more details on the CockroachDB SQL implementation, see [SQL Feature Support](sql-feature-support.html).

## Prepare for migration

Once you have a migration plan, prepare the team, application, legacy database, and CockroachDB cluster for the migration.

### Run a migration "pre-mortem"

To minimize issues after [cutover](#cutover-strategy), compose a migration "pre-mortem":

- Clearly describe the roles and processes of each team member performing the migration.
- List the likely failure points and issues that you may encounter as you [conduct the migration](#conduct-the-migration).
- Rank potential issues by severity, and identify ways to reduce risk.

### Set up monitoring and alerting

Based on the error budget you [defined in your migration plan](#develop-a-migration-plan), identify the metrics that you can use to measure your success criteria and set up monitoring for the migration. These metrics may be identical to those you normally use in production, but can also be specific to your migration needs.

### Update the schema and queries

Do the following in order:

1. [Convert your schema](#convert-the-schema).
1. [Load test data](#load-test-data).
1. [Validate your application queries](#validate-queries).

#### Convert the schema

First, convert your database schema to an equivalent CockroachDB schema:

- Use the [Schema Conversion Tool](../cockroachcloud/migrations-page.html) to convert your schema line-by-line. This requires a [{{ site.data.products.db }} account](../cockroachcloud/create-an-account.html). The tool will convert the syntax, identify [unimplemented features and syntax incompatibilities](#unimplemented-features-and-syntax-incompatibilities) in the schema, and suggest edits according to CockroachDB [best practices](#schema-design-best-practices).
	{{site.data.alerts.callout_info}}
	The Schema Conversion Tool accepts `.sql` files from PostgreSQL, MySQL, Oracle, and Microsoft SQL Server.
	{{site.data.alerts.end}}

- Alternatively, manually convert the schema according to our [schema design best practices](#schema-design-best-practices){% comment %}and data type mappings{% endcomment %}. You can also [export a partially converted schema](../cockroachcloud/migrations-page.html#export-the-schema) from the Schema Conversion Tool to finish the conversion manually.

Then import the converted schema to a CockroachDB cluster:

- For {{ site.data.products.serverless }}, use the Schema Conversion Tool to [migrate the converted schema to a new {{ site.data.products.serverless }} database](../cockroachcloud/migrations-page.html#migrate-the-schema).
- For {{ site.data.products.core }} or {{ site.data.products.dedicated }}, pipe the [data definition language (DDL)](sql-statements.html#data-definition-statements) directly into [`cockroach sql`](cockroach-sql.html). You can [export a converted schema file](../cockroachcloud/migrations-page.html#export-the-schema) from the Schema Conversion Tool.
	{{site.data.alerts.callout_success}}
	For the fastest performance, you can use a [local, single-node CockroachDB cluster](cockroach-start-single-node.html#start-a-single-node-cluster) to convert your schema and [check the results of queries](#test-query-results-and-performance).
	{{site.data.alerts.end}}

#### Load test data

After [converting the schema](#convert-the-schema), load a subset of your data onto CockroachDB so that you can [test your application queries](#validate-queries). Use the legacy database's tooling to extract the data to a `.sql` file. Then use one of the following methods to migrate the data:

- {% include {{ page.version.version }}/migration/load-data-import-into.md %}
- {% include {{ page.version.version }}/migration/load-data-third-party.md %} Within the tool, you can select a subset of database tables to migrate to the test cluster.
- {% include {{ page.version.version }}/migration/load-data-copy-from.md %}

#### Validate queries

After you [load the test data](#load-test-data), validate your queries on CockroachDB. You can do this by [shadowing](#shadowing) or by [manually testing](#test-query-results-and-performance) the queries.

##### Shadowing

You can "shadow" your production workload by replicating all writes from the legacy database to CockroachDB. To do this, use a [change data capture (CDC)](cdc-queries.html) service such as Kafka. {% comment %}The CockroachDB Live Migration Service (MOLT LMS) can also write queries to both databases simultaneously.{% endcomment %} You can then [test the queries](#test-query-results-and-performance) on CockroachDB for consistency, performance, and potential issues with the migration.

Shadowing may not be necessary or practical for your workload. For example, because transactions are serialized on CockroachDB, this will limit your ability to validate the performance of high-throughput workloads.

##### Test query results and performance

You can manually validate your queries by testing a subset of "critical queries" on an otherwise idle CockroachDB cluster:

- Check the application logs for error messages and the API response time. If application requests are slow, use the **SQL Activity** page on the [{{ site.data.products.db }} Console](../cockroachcloud/statements-page.html) or [DB Console](ui-statements-page.html) to find the longest-running queries that are part of that application request. If necessary, tune the queries according to our best practices for [SQL performance](performance-best-practices-overview.html).

- Compare the results of the queries and check that they are identical in both the legacy database and CockroachDB.

Test performance on a CockroachDB cluster that is appropriately [sized](#capacity-planning) for your workload:

1. Run the application with single- or very low-concurrency and verify the app's performance is acceptable. The cluster should be provisioned with more than enough resources to handle this workload, because you need to verify that the queries will be fast enough when there are zero resource bottlenecks.

1. Run "bulk load tests" with at least the production concurrency and rate, but ideally higher in order to verify that the system can handle unexpected spikes in load. This can also uncover [contention](performance-best-practices-overview.html#transaction-contention) issues that will appear during spikes in app load, which may require [application design changes](#handling-transaction-contention) to avoid.

### Perform a dry run

To further minimize potential surprises when you conduct the migration, practice [cutover](#cutover-strategy) by using a test application, cluster, and similar volumes of data.

## Conduct the migration

Before proceeding, double-check that you are [prepared to migrate](#prepare-for-migration).

Once you are ready to migrate, delete the test cluster so that you can get a clean start:

{% include_cached copy-clipboard.html %}
~~~ sql
DROP DATABASE {database-name} CASCADE;
~~~

Migrate your data to CockroachDB using the method that is appropriate for your [downtime requirements](#approach-to-downtime) and [cutover strategy](#cutover-strategy).

### Lift and Shift

Using this method, consistency is achieved by only performing the cutover once all writes have been replicated from the source database to CockroachDB. This requires downtime during which the application traffic is stopped.

The following is a high-level overview of the migration steps. {% comment %}For details on this migration strategy, see [Migration Strategy: Lift-and-shift](migration-strategy-lift-and-shift.html).{% endcomment %}

1. Stop application traffic to your source database. **This begins downtime.**
1. Move data in one of the following ways:
	- {% include {{ page.version.version }}/migration/load-data-import-into.md %}
	- {% include {{ page.version.version }}/migration/load-data-third-party.md %}
	- {% include {{ page.version.version }}/migration/load-data-copy-from.md %}
1. After the data is migrated, you can use [`molt verify`](https://github.com/cockroachdb/molt) to validate the consistency of the data between the legacy database and CockroachDB.
1. Perform a [cutover](#cutover-strategy) by resuming application traffic, now to CockroachDB.
{% comment %}1. If you want the ability to [roll back](#all-at-once-rollback) the migration, replicate data back to the legacy database.{% endcomment %}

### Zero Downtime

Using this method, downtime is minimized by performing the cutover while writes are still being replicated from the source database to CockroachDB. Inconsistencies are resolved through manual reconciliation.

The following is a high-level overview of the migration steps. {% comment %}For details on this migration strategy, see [Migration Strategy: Zero Downtime](migration-strategy-lift-and-shift.html).{% endcomment %}

To prioritize consistency and minimize downtime:

1. {% include {{ page.version.version }}/migration/load-data-third-party.md %} Select the tool's option to **replicate ongoing changes** after performing the initial load of data onto CockroachDB. 
1. As the data is migrating, you can use [`molt verify`](https://github.com/cockroachdb/molt) to validate the consistency of the data between the legacy database and CockroachDB.
1. Once nearly all data from your source database has been moved to CockroachDB (for example, with a <1 second delay or <1000 rows), stop application traffic to your source database. **This begins downtime.**
1. Wait for replication to CockroachDB to complete.
1. Perform a [cutover](#cutover-strategy) by resuming application traffic, now to CockroachDB.

To achieve zero downtime with inconsistency:

1. {% include {{ page.version.version }}/migration/load-data-third-party.md %} Select the tool's option to replicate ongoing changes after performing the initial load of data onto CockroachDB.
1. As the data is migrating, you can use [`molt verify`](https://github.com/cockroachdb/molt) to validate the consistency of the data between the legacy database and CockroachDB.
1. Once nearly all data from your source database has been moved to CockroachDB (for example, with a <1 second delay or <1000 rows), perform a [cutover](#cutover-strategy) by pointing application traffic to CockroachDB.
1. Manually reconcile any inconsistencies caused by writes that were not replicated during the cutover.
1. Close the connection to the legacy database when you are ready to finish the migration.

## See also

- [Can a PostgreSQL or MySQL application be migrated to CockroachDB?](frequently-asked-questions.html#can-a-postgresql-or-mysql-application-be-migrated-to-cockroachdb)
- [PostgreSQL Compatibility](postgresql-compatibility.html)
- [Use the Schema Conversion Tool](../cockroachcloud/migrations-page.html)
- [Schema Design Overview](schema-design-overview.html)
- [Create a User-defined Schema](schema-design-schema.html)
- [Primary key best practices](schema-design-table.html#primary-key-best-practices)
- [Secondary index best practices](schema-design-indexes.html#best-practices)
- [Transaction contention best practices](performance-best-practices-overview.html#transaction-contention)
- [Back Up and Restore](take-full-and-incremental-backups.html)