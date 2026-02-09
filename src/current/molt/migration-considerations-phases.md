---
title: Migration Granularity
summary: Learn how to think about phased data migration, and whether or not to approach your migration in phases.
toc: true
docs_area: migrate
---

You may choose to migrate all of your data into a CockroachDB cluster at once. However, for larger data stores it's recommended that you migrate data in separate phases. This can help break the migration down into manageable slices, and it can help limit the effects of migration difficulties. 

This page explains when to choose each approach, how to define phases, and how to use MOLT tools effectively in either context.

In general:

- Choose to migrate your data **all at once** if your data volume is modest, if you want to minimize migration complexity, or if you don't mind taking on a greater risk of something going wrong.

- Choose a **phased migration** if your data volume is large, especially if you can naturally partition workload by tenant, service/domain, table/shard, geography, or time. A phased migration helps to reduce risk by limiting the workloads that would be adversely affected by a migration failure. It also helps to limit the downtime per phase, and allows the application to continue serving unaffected subsets of data during the migration of a phase.

## How to divide migrations into phases

Here are some common ways to divide migrations:

* **Per-tenant**: Multi-tenant apps route traffic and data per customer/tenant. Migrate a small cohort first, then migrate progressively larger cohorts. This aligns with access controls and isolates blast radius.

* **Per-service/domain**: In microservice architectures, migrate data owned by a service or domain (e.g., billing, catalog) and route only that service to CockroachDB while others continue on the source. This requires clear data ownership and integration contracts.

* **Per-table or shard**: Start with non-critical tables, large-but-isolated tables, or shard ranges. For monolith schemas, you can still phase by tables with few foreign-key dependencies and clear read/write paths.

* **Per-region/market**: If traffic is regionally segmented, migrate one region/market at a time and validate latency, capacity, and routing rules before expanding.

Tips for picking slices:

- Prefer slices with clear routing keys (tenant_id, region_id) to simplify cutover and verification.

- Start with lower-impact slices to exercise the migration process before migrating high-value cohorts.

## Tradeoffs

| | All at once | Phased |
|---|---|---|
| Downtime | A single downtime window, but it affects the whole database | Multiple short windows, each with limited impact |
| Risk | Higher blast radius if issues surface post-cutover | Lower blast radius, issues confined to a slice |
| Complexity | Simpler orchestration, enables a single cutover | More orchestration, repeated verify and cutover steps |
| Validation | One-time, system-wide | Iterative per slice; faster feedback loops |
| Timeline | Shorter migration time | Longer calendar time but safer path |
| Best for | Small/medium datasets, simple integrations | Larger datasets, data with natural partitions or multiple tenants, risk-averse migrations |

## Decision framework

Use these questions to guide your approach:

**How large is your dataset and how long will a full migration take?**
If you can migrate the entire dataset within an acceptable downtime window, all-at-once is simpler. If the migration would take hours or days, phased migrations reduce the risk and downtime per phase.

**Does your data have natural partitions?**
If you can clearly partition by tenant, service, region, or table with minimal cross-dependencies, phased migration is well-suited. If your data is highly interconnected with complex foreign-key relationships, all-at-once may be easier.

**What is your risk tolerance?**
If a migration failure affecting the entire system is unacceptable, phased migration limits the blast radius. If you can afford to roll back the entire migration in case of issues, all-at-once is faster.

**How much downtime can you afford per cutover?**
Phased migrations spread downtime across multiple smaller windows, each affecting only a subset of users or services. All-at-once requires a single larger window affecting everyone.

**What is your team's capacity for orchestration?**
Phased migrations require repeated cycles of migration, validation, and cutover, with careful coordination of routing and monitoring. All-at-once is a single coordinated event.

**Can you route traffic selectively?**
Phased migrations may require the ability to route specific tenants, services, or regions to CockroachDB while others remain on the source. If your application can't easily support this, all-at-once may be necessary.

## MOLT toolkit support

Phased and unphased migrations are both supported natively by MOLT.

By default, [MOLT Fetch]({% link molt/molt-fetch.md %}) moves all data from the source database to CockroachDB. However, you can use the [`--schema-filter`]({% link molt/molt-fetch-commands-and-flags.md %}#schema-filter), [`--table-filter`]({% link molt/molt-fetch-commands-and-flags.md %}#table-filter), and [`--filter-path`]({% link molt/molt-fetch-commands-and-flags.md %}#filter-path) flags to selective migrate data from the source to the target. Learn more about [schema and table selection]({% link molt/molt-fetch.md %}#schema-and-table-selection) and [selective data movement]({% link molt/molt-fetch.md %}#select-data-to-migrate), both of which can enable a phased migration.

Similarly, you can use [MOLT Verify]({% link molt/molt-verify.md %})'s `--schema-filter` and `--table-filter` flags to run validation checks on subsets of the data in your source and target databases. In a phased migration, you will likely want to verify data at the end of each migration phase, rather than at the end of the entire migration.

[MOLT Replicator]({% link molt/molt-replicator.md %}) replicates full tables by default. If you choose to combine phased migration with [continuous replication]({% link molt/migration-considerations-replication.md %}), you will either need to select phases that include whole tables, or else use [userscripts]({% link molt/userscript-overview.md %}) to select rows to replicate.

## See Also

- [Migration Overview]({% link molt/migration-overview.md %})
- [Migration Considerations]({% link molt/migration-considerations.md %})
- [Continuous Replication]({% link molt/migration-considerations-replication.md %})
- [MOLT Fetch]({% link molt/molt-fetch.md %})
