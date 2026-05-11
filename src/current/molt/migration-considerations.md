---
title: Migration Considerations
summary: Learn what to consider when making high-level decisions about a migration.
toc: true
docs_area: migrate
---

When planning a migration to CockroachDB, you need to make several high-level decisions that will shape your migration approach. This page provides an overview of key migration variables and the factors that influence them. Each variable has multiple options, and the combination you choose will largely define your migration strategy.

For detailed migration sequencing and tool usage, refer to [Migration Overview]({% link molt/migration-overview.md %}). For detailed planning guidance, refer to [Migration Best Practices]({% link molt/migration-strategy.md %}).

## Migration variables

The combination of these variables largely defines your migration approach. While you'll typically choose one primary option for each variable, some migrations may involve a hybrid approach depending on your specific requirements.

### Migration granularity

You may choose to migrate all of your data into a CockroachDB cluster at once. However, for larger data stores it's recommended that you migrate data in separate phases. This can help break the migration down into manageable slices, and it can help limit the effects of migration difficulties. Learn more about how to consider [migration granularity]({% link molt/migration-considerations-granularity.md %}).

### Continuous replication

After data is migrated from the source into CockroachDB, you may choose to continue streaming changes to that source data from the source to the target. This is important for migrations that aim to minimize application downtime, as they may require the source database to continue receiving writes until application traffic is fully cut over to CockroachDB. Learn more about how to consider [continuous replication]({% link molt/migration-considerations-replication.md %}).

### Data transformation strategy

If there are discrepancies between the source and target schemas, the rules that determine necessary data transformations need to be defined. These transformations can be applied in the source database, in flight, or in the target database. Learn more about how to consider a [data transformation strategy]({% link molt/migration-considerations-transformation.md %}).

### Validation strategy

There are several different ways of verifying that the data in the source and the target match one another. You must decide what validation checks you want to perform, and when in the migration process you want to perform them. Learn more about how to consider a [validation strategy]({% link molt/migration-considerations-validation.md %}).

### Rollback plan

Until the migration is complete, migration failures may make you decide to roll back application traffic entirely to the source database. You may therefore need a way of keeping the source database up to date with new writes to the target. This is especially important for risk-averse migrations that aim to minimize downtime. Learn more about how to consider a [rollback plan]({% link molt/migration-considerations-rollback.md %}).

## Factors to consider

When deciding on the options for each migration variable, consider the following business and technical requirements. It's recommended that you document these decisions and the reasoning behind them as part of your [migration plan]({% link molt/migration-strategy.md %}#develop-a-migration-plan).

### Permissible downtime

How much downtime can your application tolerate during the migration? This is one of the most critical factors in determining your migration approach, and it may influence your choices for [migration granularity]({% link molt/migration-considerations-granularity.md %}), and [continuous replication]({% link molt/migration-considerations-replication.md %}).

- **Planned downtime** is made known to your users in advance. It involves taking the application offline, conducting the migration, and bringing the application back online on CockroachDB.

    To succeed, you should estimate the amount of downtime required to migrate your data, and ideally schedule the downtime outside of peak hours. Scheduling downtime is easiest if your application traffic is "periodic", meaning that it varies by the time of day, day of week, or day of month.

    If you can support planned downtime, you may want to migrate your data all at once, and _without_ continuous replication.

- **Minimal downtime** impacts as few customers as possible, ideally without impacting their regular usage. If your application is intentionally offline at certain times (e.g., outside business hours), you can migrate the data without users noticing. Alternatively, if your application's functionality is not time-sensitive (e.g., it sends batched messages or emails), you can queue requests while the system is offline and process them after completing the migration to CockroachDB.

In addition to downtime duration, consider whether your application could support windows of **reduced functionality** in which some, but not all, application functionality is brought offline. For example, you can disable writes but not reads while you migrate the application data, and queue data to be written after completing the migration.

### Migration timeframe and allowable complexity

When do you need to complete the migration? How many team members can be allocated for this effort? How much complex orchestration can your team manage? These factors may influence your choices for [migration granularity]({% link molt/migration-considerations-granularity.md %}), [continuous replication]({% link molt/migration-considerations-replication.md %}), and [rollback plan]({% link molt/migration-considerations-rollback.md %}).

- Migrations with a short timeline, or which cannot accommodate high complexity, may want to migrate data all at once, without utilizing continuous replication, and requiring manual reconciliation in the event of migration failure.

- Migrations with a long timeline, or which can accomodate complexity, may want to migrate data in phases. If the migration requires minimal downtime, these migrations may also want to utilize continuous replication. If the migration is low in risk-tolerance, these migrations may also want to enable failback.

### Risk tolerance

How much risk is your organization willing to accept during the migration? This may influence your choices for [migration granularity]({% link molt/migration-considerations-granularity.md %}), [validation strategy]({% link molt/migration-considerations-validation.md %}), and [rollback plan]({% link molt/migration-considerations-rollback.md %}).

- Risk-averse migrations should prefer phased migrations that limit the blast radius of any issues. Start with low-risk slices (e.g., a small cohort of tenants or a non-critical service), validate thoroughly, and progressively expand to higher-value workloads. These migrations may also prefer rollback plans that enable quick recovery in the event of migration issues.

- For risk-tolerant migrations, it may be acceptable to migrate all of your data at once. Less stringent validation strategies and manual reconciliation in the event of a migration failure may also be acceptable.

## Common migration approaches

To better understand how these factors affect some common migration use cases, refer to [Common migration approaches]({% link molt/migration-overview.md %}#common-migration-approaches).

## See also

- [Migration Overview]({% link molt/migration-overview.md %})
- [Migration Best Practices]({% link molt/migration-strategy.md %})
- [Bulk vs. Phased Migration]({% link molt/migration-considerations-granularity.md %})
- [MOLT Fetch]({% link molt/molt-fetch.md %})
- [MOLT Replicator]({% link molt/molt-replicator.md %})
- [MOLT Verify]({% link molt/molt-verify.md %})
