---
title: Rollback Plan
summary: Learn how to plan rollback options to limit risk and preserve data integrity during migration.
toc: true
docs_area: migrate
---

A rollback plan defines how you will undo or recover from a failed migration. A clear rollback strategy limits risk during migration, minimizes business impact, and preserves data integrity so that you can retry the migration with confidence.

This page explains four common rollback options, their trade-offs, and how the MOLT toolkit supports each approach.

In general:

- **Manual reconciliation** is sufficient for low-risk systems or low-complexity migrations where automated rollback is not necessary.

- Utilize **failback replication** to maintain synchronization between the CockroachDB cluster and the original source database after cutover to CockroachDB.

- Utilize **bidirectional replication** (simultaneous forward and failback replication) to maximize database synchronization without requiring app changes, accepting the operational overhead of running two replication streams.

- Choose a **dual-write** strategy for the fastest rollback with minimal orchestration, accepting higher application complexity during the trial window.

## Why plan for rollback

Many things can go wrong during a migration. Performance issues may surface under production load that didn't appear in testing. Application compatibility problems might emerge that require additional code changes. Data discrepancies could be discovered that necessitate investigation and remediation. In any of these scenarios, the ability to quickly and safely return to the source database is critical to minimizing business impact.

Your rollback strategy should align with your migration's risk profile, downtime tolerance, and operational capabilities. High-stakes production migrations typically require faster rollback paths with minimal data loss, while test environments or low-traffic systems can tolerate simpler manual approaches.

### Failback replication

[Continuous (forward) replication]({% link molt/migration-considerations-replication.md %}), which serves to minimize downtime windows, keeps two databases in sync by replicating changes from the source to the target. In contrast, **failback replication** synchronizes data in the opposite direction, from the target back to the source.

Failback replication is useful for rollback because it keeps the source database synchronized with writes that occur on CockroachDB after cutover. If problems emerge during your trial period and you need to roll back, the source database already has all the data that was written to CockroachDB. This enables a quick rollback without data loss.

Failback and forward replication can be used simultaneously (**bidirectional replication**). This is especially useful if the source and the target databases can receive simultaneous, but disparate write traffic. In that case, bidirectional replication is necessary to ensure that both databases stay in sync. It's also useful if downtime windows are long or if cutover is gradual, increasing the likelihood that the two databases receive independent writes.

### Dual-write

Failback replication requires an external replication system (like [MOLT Replicator]({% link molt/molt-replicator.md %})) to keep two databases synchronized. Alternatively, you can modify the application code itself to enable **dual-writes**, wherein the application writes to both the source database and CockroachDB during a trial window. If rollback is needed, you can then redirect traffic to the source without additional data movement.

This enables faster rollback, but increases application complexity as you need to manage two write paths.

## Tradeoffs

| | Manual reconciliation | Failback replication (on-demand) | Bidirectional replication | Dual-write |
|---|---|---|---|---|
| **Rollback speed (RTO)** | Slow | Moderate | Fast | Fast |
| **Data loss risk (RPO)** | Medium-High | Low | Low | Low-Medium (app-dependent) |
| **Synchronization mechanism** | None (backups/scripts) | Activate failback when needed | Continuous forward + failback | Application writes to both |
| **Application changes** | None | None | None | Required |
| **Operational complexity** | Low (tooling), High (manual) | Medium (runbook activation) | High (two replication streams) | High (app layer) |
| **Overhead during trial** | Low | Low-Medium | High (two replication streams) | Medium (two write paths) |
| **Best for** | Low-risk systems, simple migrations | Moderate RTO tolerance, lower ongoing cost | Strict RTO/RPO, long or complex cutovers | Short trials, resilient app teams |

## Decision framework

Use these questions to guide your rollback strategy:

**How quickly do you need to roll back if problems occur?**
If you need immediate rollback, choose dual-write or bidirectional replication. If you can tolerate some delay to activate failback replication, one-way failback replication is sufficient. For low-risk migrations with generous time windows, manual reconciliation may be acceptable.

**How much data can you afford to lose during rollback?**
If you cannot lose any data written after cutover, choose bidirectional replication or on-demand failback (both preserve all writes). Dual-write can also preserve data if implemented carefully. Manual reconciliation typically accepts some data loss.

**Will writes occur to both databases during the trial period?**
If traffic might split between source and target (e.g., during gradual cutover or in multi-region scenarios), bidirectional replication keeps both databases synchronized. If traffic cleanly shifts from source to target, on-demand failback or dual-write is sufficient.

**Can you modify the application code?**
If application changes are expensive or risky, use database-level replication (bidirectional or on-demand failback) instead of dual-write.

**What is your team's operational capacity?**
Bidirectional replication requires monitoring and managing two active replication streams. On-demand failback requires a tested runbook for activating failback quickly. Dual-write requires application-layer resilience and observability. Manual reconciliation has the lowest operational complexity.

**What are your database capabilities?**
Ensure your source database supports the change data capture requirements for the migration window. Verify that CockroachDB changefeeds can provide the necessary failback support for your environment.

## MOLT toolkit support

[MOLT Replicator]({% link molt/molt-replicator.md %}) uses change data to stream changes from one database to another. It's used for both [forward replication]({% link molt/migration-considerations-replication.md %}) and [failback replication](#failback-replication).

To use MOLT Replicator in failback mode, run the [`replicator start`]({% link molt/replicator-flags.md %}#commands) command with its various [flags]({% link molt/replicator-flags.md %}).

When enabling failback replication, the original source database becomes the replication target, and the original target CockroachDB cluster becomes the replication source. Use the `--sourceConn` flag to indicate the CockroachDB cluster, and use the `--targetConn` flag to indicate the PostgreSQL, MySQL, or Oracle database from which data is being migrated.

MOLT Replicator can be stopped after cutover, or it can remain online to continue streaming changes indefinitely. This could be useful for as long as you want as you want the migration source database to serve as a backup to the new CockroachDB cluster.

Rollback plans that do not utilize failback replication will require external tooling, or in the case of a dual-write strategy, changes to application code. You can still use [MOLT Verify]({% link molt/molt-verify.md %}) to ensure parity between the two databases.

## See also

- [Migration Overview]({% link molt/migration-overview.md %})
- [Migration Considerations]({% link molt/migration-considerations.md %})
- [Continuous Replication]({% link molt/migration-considerations-replication.md %})
- [Validation Strategy]({% link molt/migration-considerations-validation.md %})
- [MOLT Replicator]({% link molt/molt-replicator.md %})
- [MOLT Fetch]({% link molt/molt-fetch.md %})
- [MOLT Verify]({% link molt/molt-verify.md %})
