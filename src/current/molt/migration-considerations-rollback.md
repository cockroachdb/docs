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

**What is your rollback RTO/RPO requirement?**
If rollback must be immediate with near-zero data loss, prefer dual-write or bidirectional replication. For moderate RTO, reverse unidirectional suffices. For generous RTO and low risk, manual may be acceptable.

**What is your write topology and conflict risk?**
If multiple writers can touch the same keys, avoid bidirectional replication unless you have conflict avoidance (partitioning by tenant/service) or deterministic conflict resolution.

**What is your operational maturity?**
Bidirectional replication requires monitoring, alerting, and practiced runbooks. Reverse unidirectional requires a tested activation runbook. Dual-write requires app-layer resiliency and observability across write paths.

**Can you modify the application?**
If app changes are expensive or risky, prefer database-level options (reverse unidirectional or bidirectional) over dual-write.

**What are your source and target capabilities?**
Ensure your source supports required CDC/replication characteristics and retention for the migration window. Verify that CockroachDB changefeeds can deliver necessary backfill for failback in your environment.

## MOLT toolkit support

The MOLT toolkit provides tools that enable different rollback strategies.

### MOLT Replicator (forward and failback)

[MOLT Replicator]({% link molt/molt-replicator.md %}) streams ongoing changes between databases:

- **Forward replication**: Streams changes from PostgreSQL, MySQL, or Oracle to CockroachDB for minimal-downtime migrations.
- **Failback**: Streams changes from CockroachDB back to the source using a CockroachDB changefeed to preserve rollback options.

**Key capabilities for rollback:**

- **Staging database**: Persists checkpoints and metadata in a CockroachDB staging schema (`--stagingSchema`, created with `--stagingCreateSchema`).
- **Connections**: `--targetConn` points to the destination for applied changes; `--stagingConn` points to the CockroachDB staging database.
- **Metrics**: `--metricsAddr` exposes a Prometheus endpoint for replication lag, throughput, and applied mutations.
- **Webhook endpoint**: `--bindAddr` receives changefeed events during failback.
- **Prerequisites**: For self-hosted clusters, enable rangefeeds to support changefeeds in failback workflows.

**Usage by rollback option:**

- **Dual-write**: Use Replicator for forward replication into CockroachDB; keep failback tooling pre-validated on standby.
- **Bidirectional**: Run forward replication and failback concurrently during trial; monitor both metrics endpoints.
- **Reverse unidirectional**: Before cutover, confirm you can start failback quickly with known flags; at rollback time, follow the failback runbook to start Replicator and create the changefeed.
- **Manual**: Not applicable; no automated replication during rollback.

### MOLT Fetch

[MOLT Fetch]({% link molt/molt-fetch.md %}) performs initial one-time data load and pairs with Replicator for minimal-downtime migrations. Rollback choice primarily affects Replicator usage after initial load rather than Fetch.

### MOLT Verify

[MOLT Verify]({% link molt/molt-verify.md %}) compares schema and row-level data between source and CockroachDB to surface discrepancies:

- **Dual-write or bidirectional**: Run Verify to catch drift during the coexistence window.
- **Reverse unidirectional or manual**: Run before activating rollback to estimate catch-up effort; run again after failback or manual repair to confirm consistency.

## See also

- [Migration Overview]({% link molt/migration-overview.md %})
- [Migration Considerations]({% link molt/migration-considerations.md %})
- [Continuous Replication]({% link molt/migration-considerations-replication.md %})
- [Validation Strategy]({% link molt/migration-considerations-validation.md %})
- [MOLT Replicator]({% link molt/molt-replicator.md %})
- [MOLT Fetch]({% link molt/molt-fetch.md %})
- [MOLT Verify]({% link molt/molt-verify.md %})
- [Migrate with Failback]({% link molt/migrate-failback.md %})
