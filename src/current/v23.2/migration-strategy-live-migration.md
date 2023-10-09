---
title: "Migration Strategy: Live Migration"
summary: Learn about the 'Live Migration' data migration strategy
toc: true
docs_area: migrate
---

This topic discusses the *live migration* strategy for [migrating your data to CockroachDB]({% link {{ page.version.version }}/migration-overview.md %}). See [Develop a migration plan]({% link {{ page.version.version }}/migration-overview.md %}#develop-a-migration-plan) for detailed information on deciding which migration strategy will work best for your application.

During a live migration you maintain two production databases (the *source* and *target* database) for a period of time, and either replicate using another tool or dual-write data between them until a final cutover to the target database. The purpose of a live migration is to minimize downtime during this final cutover period and therefore, maintain service continuity.

A live migration consists of the following distinct phases:

- The initial phase where the source database is the *source of truth*: the database used by the application to read and write data, and the source for replicating the data to CockroachDB, the target database.
- The cutover phase where CockroachDB is made the source of truth and the source database is the secondary database used for failover.
- The final phase where the source database is removed. The source database is no longer available as a replication target, or a failover database.

There are many possible approaches to performing a live migration. In this topic, we describe two example approaches that have been successful with CockroachDB: consistent cutover, and immediate cutover.

The consistent cutover approach uses only one database that is writable and consistently readable at the application level, with the data replicated on the back end by another service. When using the consistent cutover approach, one database is used by the application at any point in time. During the cutover phase, any current application transactions that use the source database are allowed to complete, and the replication service is allowed to catch up. After this pause, new application sessions are allowed to start using the target database, and the replication service replicates data from the target database to the source database. If any problems arise during the cutover phase and you have to revert back to the initial phase, the same process repeats, moving from the target database back to the source database.

With the immediate cutover approach, the application begins writing to the target database with no pause. This approach can lead to incorrect or inconsistent data between the two databases if there were any active application transactions at the time of the cutover, and may require work after cutover to correct any unacceptable data inconsistencies. Cockroach Labs does not recommend the immediate cutover approach with the live migration strategy.

Cockroach Labs recommends using the consistent cutover approach when using the live migration strategy. Your data remains more consistent and downtime is minimized. [MOLT LMS]({% link {{ page.version.version }}/live-migration-service.md %}#consistent-cutover) only supports consistent cutover.

However, if zero downtime is truly required, the immediate cutover approach may be used at the risk of some data inconsistencies. [Third-party migration tools]({% link {{ page.version.version }}/third-party-database-tools.md %}#data-migration-tools) perform the initial migration into CockroachDB, and replicate ongoing changes. CockroachDB [changefeeds]({% link {{ page.version.version }}/change-data-capture-overview.md %}) allow for replication to the source database after cutover, simplifying the service architecture.

## Advantages and disadvantages of the live migration strategy

{{site.data.alerts.callout_info}}
The information on this page assumes you have already reviewed the [migration overview]({% link {{ page.version.version }}/migration-overview.md %}).
{{site.data.alerts.end}}

When choosing a migration strategy, the fundamental consideration is: Do you want to fix problems related to the migration during the migration, or afterward? The risks of migrating data are very similar between migration strategies, but the strategy you choose will determine when you will have to take the risk.

Choosing the lift-and-shift strategy typically means fixing application and data consistency problems **after** the migration. Choosing live migration typically means fixing application problems **during** the migration, before the cutover, and potentially resolving data inconsistencies after the cutover.

On the spectrum of different data migration strategies, live migration has the following advantages and disadvantages. The terms "lower" and "higher" are not absolute, but relative to other approaches.

Advantages:

- There's greater service availability with live migrations. You can failback to the source database at any point in the migration process, or if there are significant errors after cutover.
- The impact of a migration on users is minimized by having very little downtime.
- There's less internal coordination cost. For example, if other teams use the database, they can update their systems during the initial phase of the migration with no extended outage or maintenance window.
- If you use dual-writes, you can test the viability and scalability of your architecture on live production data. For example, you can tune the performance of CockroachDB before the cutover without affecting the performance of the production application.

Disadvantages:

- It is complex to implement. You need the right application design and replication tools to successfully perform the migration.
- It requires abstracting the database operations in the application. You need complete control over all the applications reading and writing to the database to ensure the data is consistent across both the source and target database.
- During migration there's less certainty about the integrity of the data due to multiple systems being updated.
- Hidden dependencies may reveal themselves after cutover. For example, a microservice that was not accounted for during the migration planning and uses the source database may break after cutover.
- The operational cost of two production systems can be expensive.

## Prepare for a live migration

Before performing a live migration, consider the following:

- It is better to over-provision your cluster during the migration and then scale it back after the migration is complete than to discover you need more cluster resources during the migration.
- The more testing you do before the migration to properly size your cluster and model the performance of your production workload, the more likely it is that your migration will succeed with minimal problems.
- Writes are typically where performance problems arise during live migration. Testing your workload beforehand can help identify areas with slow write performance so they can be fixed before starting the migration.
- After the migration completes, you should factor in time for performance tuning.
- A common way of testing the performance of your workload on CockroachDB is to do gradual testing while the source database is the source of truth, and the CockroachDB cluster's data is replicated from the source database.
- Fallback is typically quite expensive, and it is usually easier to fix any data consistency issues after the cutover to the target database than to fallback to the original source database.

## Live migration tooling

Live migration requires tooling to copy the data from the source database to the target database, and synchronize the data back to the source database after cutover. If you need to import an initial dataset, you can choose to perform the import before the migration, or concurrent with the live migration.

The initial data migration and synchronization can be handled by [third-party migration tools]({% link {{ page.version.version }}/third-party-database-tools.md %}#data-migration-tools).

Many other database systems have built-in change data capture (CDC) services that could be used to stream data to CockroachDB while the source database is the source of truth.

After cutover when CockroachDB is the source of truth, [change data capture]({% link {{ page.version.version }}/change-data-capture-overview.md %}) allows you to stream data to the source database.

## See also

- [Migration Overview]({% link {{ page.version.version }}/migration-overview.md %})
- [Use the Schema Conversion Tool](https://www.cockroachlabs.com/docs/cockroachcloud/migrations-page)
- [Use the Live Migration Service]({% link {{ page.version.version }}/live-migration-service.md %})
- [Migrate with AWS Database Migration Service (DMS)]({% link {{ page.version.version }}/aws-dms.md %})
- [AWS DMS documentation](https://docs.aws.amazon.com/dms/latest/userguide/Welcome.html)
- [Migrate and Replicate Data with Qlik Replicate]({% link {{ page.version.version }}/qlik.md %})
- [Migrate and Replicate Data with Striim]({% link {{ page.version.version }}/striim.md %})
- [Schema Design Overview]({% link {{ page.version.version }}/schema-design-overview.md %})
- [Back Up and Restore]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %})
- [Export data with Changefeeds]({% link {{ page.version.version }}/export-data-with-changefeeds.md %})
- [`COPY FROM`]({% link {{ page.version.version }}/copy-from.md %})
- [`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %})
- [Migrate from CSV]({% link {{ page.version.version }}/migrate-from-csv.md %})
- [Migrate from Avro]({% link {{ page.version.version }}/migrate-from-avro.md %})
- [Client connection parameters]({% link {{ page.version.version }}/connection-parameters.md %})