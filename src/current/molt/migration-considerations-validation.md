---
title: Validation Strategy
summary: Learn when and how to validate data during migration to ensure correctness, completeness, and consistency.
toc: true
docs_area: migrate
---

A successful migration to CockroachDB requires a clear validation strategy that proves the target holds the right data, in the right shape, and behaves correctly for your application. Validation is not a single step—it occurs at multiple checkpoints throughout the migration process, with increasing rigor as you approach cutover.

This page explains what to validate, when to validate during different migration flows, and how these choices shape your use of MOLT tooling.

In general:

- Validate **early and often** to catch issues when they're easier to fix—during design, after initial load, throughout replication, and before cutover.

- Align validation scope and timing with your **migration pattern**: bulk load requires full validation during downtime; load-then-replicate needs live-aware validation; phased migrations validate each subset independently.

- Combine **automated data comparison** (MOLT Verify) with **application-level testing** to ensure both row-level correctness and end-to-end behavioral equivalence.

## What to validate

Validation occurs in layers, from structural to behavioral:

### Schema parity

Verify that table structure, column names, types, nullability, and constraints match between source and target. This catches DDL conversion issues early.

### Row-level correctness

Confirm that no rows are missing or extraneous, and that row values match. This is the core of data integrity validation.

### Type and collation compatibility

Account for intentional differences: type conversions (e.g., `AUTO_INCREMENT` to `UUID`), collation differences on `STRING` primary keys, and unsupported comparisons (e.g., geospatial types). Plan how to handle these before running validation.

### Application behavior

Validate critical queries and transactions using shadow traffic or targeted tests on a production-sized CockroachDB cluster. This catches semantic differences that row-by-row comparison cannot reveal, such as isolation-level semantics or query plan changes.

## When to validate

Use natural checkpoints in your migration flow, increasing rigor as you approach cutover:

### Pre-migration (design and dry-run)

Validate converted schema and resolve type mapping issues. Run a dry-run migration on test data and begin query validation to catch behavioral differences early.

### After initial data load

Run comprehensive validation to confirm schema and row-level parity before re-adding constraints and indexes that were dropped to accelerate load. This is your first full data integrity checkpoint.

### During continuous replication

If using replication, run validation periodically to ensure the target converges with the source. Use live-aware validation to reduce false positives from in-flight changes. This gives you confidence that replication is working correctly.

### Pre-cutover gate

Once replication has drained (no backlog), run final validation on the complete cutover scope and verify critical application queries. This is your go/no-go decision point.

### Post-cutover confidence checks

After traffic moves to CockroachDB, run targeted validation on critical tables and application smoke tests to confirm steady state.

## How validation changes by migration pattern

Different migration patterns require different validation approaches:

### Bulk load with planned downtime

Run full-schema and full-table validation on all in-scope tables immediately after bulk load. If you dropped constraints and indexes for performance, validate before re-adding them, then re-run on critical tables afterward.

**Characteristics:** Strongest guarantees at a single point in time; requires downtime sufficient for load plus validation.

### Load-then-replicate (minimal downtime)

Validate after initial load, then use live-aware validation during replication to monitor convergence. Wait for replication to drain, then run comprehensive final validation immediately before cutover.

**Characteristics:** Short downtime but longer total calendar time; must coordinate replication lag, GC retention, and validation runtime.

### Phased migration

Validate each phase independently using schema and table filters. Each phase becomes its own mini-cutover with phase-specific validation gates.

**Characteristics:** Smaller blast radius and faster feedback per phase; requires orchestrating multiple validation cycles.

## Tradeoffs

| | Bulk load | Load-then-replicate | Phased |
|---|---|---|---|
| **Validation scope** | Full dataset at once | Full initial + continuous monitoring | Subset per phase |
| **Timing** | During downtime window | After load + during replication + pre-cutover | Repeated per phase |
| **Complexity** | Single comprehensive run | Multiple checkpoints with live awareness | Multiple scoped runs |
| **Downtime impact** | Extends downtime window | Minimal impact on downtime | Minimal per phase |
| **Confidence level** | Strongest single-point guarantee | Continuous convergence verification | Incremental confidence |
| **Best for** | Scheduled maintenance, smaller datasets | Production migrations, large datasets | Risk-averse migrations, natural data partitions |

## Decision framework

Use these questions to guide your validation strategy:

**What is your data volume and validation timeline?**
Larger datasets require more validation time. Consider concurrency tuning, phased validation, or off-peak runs to fit within windows.

**Is the source database active during migration?**
Active sources require live-aware validation and continuous monitoring during replication. Plan for replication drain before final validation.

**Are there intentional schema or type differences?**
Expect validation to flag type conversions and collation differences. Decide upfront whether to accept conditional successes or redesign to enable strict parity.

**Which tables are most critical?**
Prioritize critical data (compliance, transactions, authentication) for comprehensive validation. Use targeted validation loops on high-churn tables during replication.

**Do you have unsupported column types?**
For types that cannot be compared automatically (e.g., geospatial), plan alternative checks like row counts or application-level validation.

## MOLT toolkit support

The MOLT toolkit provides validation capabilities that integrate naturally with migration workflows.

### MOLT Verify

[MOLT Verify]({% link molt/molt-verify.md %}) performs structural and row-level comparison between source and CockroachDB:

- **Schema verification**: Compares table structure, column definitions, types, and constraints.
- **Row verification**: Compares row values and identifies missing, mismatched, or extraneous rows.
- **Scope control**: `--schema-filter` and `--table-filter` restrict validation to specific schemas or tables using regular expressions. Essential for phased migrations.
- **Performance tuning**: `--concurrency` increases parallelism; `--row-batch-size` balances memory and retry granularity.
- **Live awareness**: `--live` retries rows that may change between batches, reducing transient mismatch noise during active imports or replication.
- **Continuous monitoring**: `--continuous` loops validation to observe convergence over time on critical tables during replication.

**Limitations to plan for:**
- Detects collation mismatches on `STRING` primary keys; align collations or plan exceptions.
- Compares one MySQL database to a whole CockroachDB schema (`public` by default); scope accordingly.
- Geospatial types not yet compared; supplement with alternative checks.

### MOLT Fetch

[MOLT Fetch]({% link molt/molt-fetch.md %}) bulk loads data and defines the first validation checkpoint. After Fetch completes, run MOLT Verify before re-adding constraints and indexes that were dropped for performance.

### MOLT Replicator

[MOLT Replicator]({% link molt/molt-replicator.md %}) streams ongoing changes and provides health signals for validation timing:

- Enable metrics (`--metricsAddr`) to monitor replication lag and confirm steady-state.
- Use lag signals to determine when replication has "drained" before running final validation.
- Ensure GC TTL is configured so checkpoint positions remain valid during the migration window.

### Validation checkpoints in MOLT flows

MOLT prescribes natural validation checkpoints:

1. **After initial load**: Before restoring indexes and constraints (all migration patterns).
2. **During replication**: Continuous or periodic validation with `--live` mode (load-then-replicate pattern).
3. **Pre-cutover**: Comprehensive validation after replication drains (minimal-downtime patterns).
4. **Per-phase**: Scoped validation at phase boundaries (phased migrations).

## Validation by migration stage

| Stage | Purpose | Approach |
|---|---|---|
| **Design & dry-run** | Catch schema and type issues early | Convert schema, load test data, validate critical queries, note differences to waive or fix |
| **After bulk load** | Prove parity before resuming constraints | Run MOLT Verify on full scope; resolve mismatches; re-add non-PK constraints/indexes |
| **During replication** | Ensure convergence while source is live | Run MOLT Verify with `--live` and optionally `--continuous` on critical tables; monitor Replicator metrics |
| **Pre-cutover gate** | Final correctness guarantee | Confirm Replicator drained; run comprehensive MOLT Verify; validate critical query suite |
| **Post-cutover** | Confidence in steady state | Targeted MOLT Verify on high-risk tables; application smoke tests |

## Common validation pitfalls

**Collation on STRING primary keys:**
Different collations between source and target can cause validation failures. Align collations where possible or plan documented exceptions.

**Type differences by design:**
Converting `AUTO_INCREMENT` to `UUID` or other intentional type changes will flag column mismatches. Review conditional successes and decide whether to accept or redesign.

**Unsupported comparison types:**
Geospatial and certain other types cannot be automatically compared. Use row counts, subset spot checks, or application-level validation, and document residual risk.

**Validation runtime in tight windows:**
Large datasets may not fit validation within downtime windows. Plan phased validation, increase concurrency, or use off-peak periods for comprehensive runs.

**False positives during live replication:**
Active sources can cause transient mismatches. Always use `--live` mode during replication to retry rows before flagging errors.

## Coordinating validation with migration flow

Your migration pattern determines validation orchestration:

**Bulk load with downtime:**
Single comprehensive validation run after load fits within downtime window. Favor completeness over speed; this is your only checkpoint.

**Load-then-replicate:**
Multiple validation checkpoints with different goals—initial load for bulk correctness, continuous for convergence monitoring, final for cutover readiness. Monitor replication lag to time the final gate.

**Phased migration:**
Repeated scoped validation per phase using schema and table filters. Each phase has independent validation gates, reducing risk but increasing orchestration.

## See also

- [Migration Overview]({% link molt/migration-overview.md %})
- [Migration Considerations]({% link molt/migration-considerations.md %})
- [Migration Granularity]({% link molt/migration-considerations-phases.md %})
- [Continuous Replication]({% link molt/migration-considerations-replication.md %})
- [Data Transformation Strategy]({% link molt/migration-considerations-transformation.md %})
- [MOLT Verify]({% link molt/molt-verify.md %})
- [MOLT Fetch]({% link molt/molt-fetch.md %})
- [MOLT Replicator]({% link molt/molt-replicator.md %})
