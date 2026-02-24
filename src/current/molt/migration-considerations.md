---
title: Migration Considerations
summary: Learn what to consider when making high-level decisions about a migration.
toc: true
docs_area: migrate
---

When planning a migration to CockroachDB, you need to make several high-level decisions that will shape your migration approach. This page provides an overview of key migration variables and the factors that influence them. Each variable has multiple options, and the combination you choose will largely define your migration strategy.

For detailed migration sequencing and tool usage, see [Migration Overview]({% link molt/migration-overview.md %}). For detailed planning guidance, see [Migration Best Practices]({% link molt/migration-strategy.md %}).

## Migration variables

Learn more about each migration variable by clicking the links in the left-hand column.

| Variable | Description |
|---|---|
| [**Migration granularity**]({% link molt/migration-considerations-granularity.md %}) <h3 id="migration-granularity" style="visibility:hidden;max-height:0;">Migration granularity</h3> | Do you want to migrate all of your data at once, or do you want to split your data up into phases and migrate one phase at a time? |
| [**Continuous replication**]({% link molt/migration-considerations-replication.md %}) <h3 id="continuous-replication" style="visibility:hidden;max-height:0;">Continuous replication</h3> | After the initial data load (or after the initial load of each phase), do you want to stream further changes to that data from the source to the target? |
| [**Data transformation strategy**]({% link molt/migration-considerations-transformation.md %}) <h3 id="data-transformation-strategy" style="visibility:hidden;max-height:0;">Data transformation strategy</h3> | If there are discrepancies between the source and target schema, how will you define those data transformations, and when will those transformations occur? |
| [**Validation strategy**]({% link molt/migration-considerations-validation.md %}) <h3 id="validation-strategy" style="visibility:hidden;max-height:0;">Validation strategy</h3> | How and when will you verify that the data in CockroachDB matches the source database? |
| [**Rollback plan**]({% link molt/migration-considerations-rollback.md %}) <h3 id="rollback-plan" style="visibility:hidden;max-height:0;">Rollback plan</h3> | What approach will you use to roll back the migration if issues arise during or after cutover? |

The combination of these variables largely defines your migration approach. While you'll typically choose one primary option for each variable, some migrations may involve a hybrid approach depending on your specific requirements.

## Factors to consider

When deciding on the options for each migration variable, consider the following business and technical requirements:

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

___

These factors are only a subset of what you will want to consider in designing your CockroachDB migration, along with your specific business requirements and technical constraints. It's recommended that you document these decisions and the reasoning behind them as part of your [migration plan]({% link molt/migration-strategy.md %}#develop-a-migration-plan).

## See also

- [Migration Overview]({% link molt/migration-overview.md %})
- [Migration Best Practices]({% link molt/migration-strategy.md %})
- [Bulk vs. Phased Migration]({% link molt/migration-considerations-granularity.md %})
- [MOLT Fetch]({% link molt/molt-fetch.md %})
- [MOLT Replicator]({% link molt/molt-replicator.md %})
- [MOLT Verify]({% link molt/molt-verify.md %})
