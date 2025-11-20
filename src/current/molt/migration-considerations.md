---
title: Migration Considerations
summary: Learn what to consider when making high-level decisions about a migration.
toc: true
docs_area: migrate
---

When planning a migration to CockroachDB, you need to make several high-level decisions that will shape your migration approach. This page provides an overview of key migration variables and the factors that influence them. Each variable has multiple options, and the combination you choose will largely define your migration strategy.

For detailed migration sequencing and tool usage, see [Migration Overview]({% link molt/migration-overview.md %}). For detailed planning guidance, see [Migration Strategy]({% link molt/migration-strategy.md %}).

## Migration variables

Learn more about each migration variable by clicking the links in the left-hand column.

| Variable | Description | Options |
|---|---|---|
| [**Migration granularity**]({% link molt/migration-considerations-phases.md %}) <h3 id="migration-granularity" style="visibility:hidden;max-height:0;">Migration granularity</h3> | Do you want to migrate all of your data at once, or do you want to split your data up into phases and migrate one phase at a time? | - All at once <br> - Phased |
| [**Continuous replication**]({% link molt/migration-considerations-replication.md %}) <h3 id="continuous-replication" style="visibility:hidden;max-height:0;">Continuous replication</h3> | After the initial data load (or after the initial load of each phase), do you want to stream further changes to that data from the source to the target? | - Bulk load only <br> - Continuous replication |
| [**Data transformation strategy**]({% link molt/migration-considerations-transformation.md %}) <h3 id="data-transformation-strategy" style="visibility:hidden;max-height:0;">Data transformation strategy</h3> | If there are discrepancies between the source and target schema, how will you define those data transformations, and when will those transformations occur? | - No data transformation <br> - Transform at source <br> - Tranform in flight <br> - Transform at target |
| [**Validation strategy**]({% link molt/migration-considerations-validation.md %}) <h3 id="validation-strategy" style="visibility:hidden;max-height:0;">Validation strategy</h3> | How and when will you verify that the data in CockroachDB matches the source database? | - After initial load <br> During sync <br> After cutover <br> QA sign-off |
| [**Rollback plan**]({% link molt/migration-considerations-rollback.md %}) <h3 id="rollback-plan" style="visibility:hidden;max-height:0;">Rollback plan</h3> | What approach will you use to roll back the migration if issues arise during or after cutover? | - Dual-write <br> - Bidirectional replication <br> - Failback (reverse replication) <br> - Manual reconciliation |
| [**Cutover strategy**]({% link molt/migration-considerations-cutover.md %}) <h3 id="cutover-strategy" style="visibility:hidden;max-height:0;">Cutover strategy</h3> | How will you transition application traffic from the source database to CockroachDB? | - Big-bang cutover <br> - Minimal-downtime cutover (with replication) <br> - Progressive cutover (per-slice) |

The combination of these variables largely defines your migration approach. While you'll typically choose one primary option for each variable, some migrations may involve a hybrid approach depending on your specific requirements.

## Things to consider

When deciding on the options for each migration variable, consider the following business and technical requirements:

### Allowable downtime

How much downtime can your application tolerate during the migration? This is one of the most critical factors in determining your migration approach:

- **Planned downtime**: If you can take the application offline for several hours or more, a simpler bulk load approach may be sufficient. You can load all data during the downtime window, verify it, and then bring the application back online on CockroachDB.

- **Minimal downtime**: If you need to minimize user impact (ideally to seconds or minutes), you'll need to use continuous replication to keep CockroachDB synchronized with the source database. Application writes are paused only briefly to allow the replication stream to drain before cutover.

- **Zero downtime**: For mission-critical applications that cannot tolerate any downtime, consider a phased migration where you progressively move slices of data (e.g., per-tenant or per-service) while maintaining dual-write capabilities or bidirectional replication.

Your downtime tolerance will influence your choices for data transfer approach, validation strategy, and cutover strategy.

### Migration timeframe

When do you need to complete the migration, and how does this timeline affect your approach?

- **Shorter calendar time**: If you need to complete the migration quickly and can tolerate planned downtime, a bulk migration may be the fastest path. However, this concentrates risk into a single event.

- **Longer calendar time**: If you have more time available, a phased migration allows you to reduce risk by migrating in smaller increments. This takes longer overall but provides faster feedback loops and the ability to adjust your approach based on early results.

- **Team availability**: Consider when your migration team and stakeholders are available. Can you schedule a migration during off-peak hours or weekends? Do you need to coordinate with multiple teams?

Your migration timeframe will influence whether you choose a bulk or phased approach, and how aggressively you can schedule cutover windows.

### Risk tolerance

How much risk is your organization willing to accept during the migration?

- **Risk-averse**: Organizations with low risk tolerance should prefer phased migrations that limit the blast radius of any issues. Start with low-risk slices (e.g., a small cohort of tenants or a non-critical service), validate thoroughly, and progressively expand to higher-value workloads.

- **Risk-tolerant**: If you're comfortable with higher risk and can recover quickly from issues, a bulk migration may be acceptable. This is especially true for development or staging environments, or for applications with strong rollback capabilities.

- **Rollback requirements**: Does your organization require the ability to roll back the migration after cutover? This will influence your choice of rollback plan (e.g., failback replication vs. manual reconciliation).

Your risk tolerance will influence your choices for migration granularity, rollback plan, and validation strategy.

### Allowable migration complexity

How complex of a migration can your team execute and maintain?

- **Simple migrations**: Bulk migrations with planned downtime are generally simpler to orchestrate. They involve fewer moving parts and a single cutover event. This is best for teams with limited migration experience or smaller datasets.

- **Complex migrations**: Phased migrations with continuous replication, per-slice validation, and progressive cutover require more sophisticated orchestration. You'll need to manage replication streams, coordinate multiple cutover windows, and maintain clear rollback runbooks for each slice. This is best for experienced teams managing large-scale or mission-critical migrations.

- **Team expertise**: Consider your team's familiarity with the MOLT tools, CockroachDB, and migration best practices. Can you dedicate time for dry runs and rehearsals? Do you have monitoring and alerting in place?

Your team's capacity and expertise will influence the complexity of the migration approach you can successfully execute.

### Additional factors

Other factors that may influence your migration decisions:

- **Data volume**: Larger datasets may require phased migrations to fit within maintenance windows and to manage resource consumption during load.

- **Application architecture**: Multi-tenant applications, microservices, and sharded databases are natural candidates for phased migrations. Monolithic applications may be better suited to bulk migrations.

- **Integration surface area**: Applications with many downstream consumers (ETL pipelines, analytics tools, third-party integrations) may benefit from phased migrations to reduce the risk of integration issues.

- **Compliance and regulatory requirements**: Some industries require specific validation, auditing, or rollback capabilities that will influence your migration approach.

These factors, along with your specific business requirements and constraints, will help determine which options you choose for each migration variable. It's recommended to document your decisions and the reasoning behind them as part of your migration plan.

## See also

- [Migration Overview]({% link molt/migration-overview.md %})
- [Migration Strategy]({% link molt/migration-strategy.md %})
- [Bulk vs. Phased Migration]({% link molt/migration-considerations-phases.md %})
- [MOLT Fetch]({% link molt/molt-fetch.md %})
- [MOLT Replicator]({% link molt/molt-replicator.md %})
- [MOLT Verify]({% link molt/molt-verify.md %})
