---
title: Validation Strategy
summary: Learn when and how to validate data during migration to ensure correctness, completeness, and consistency.
toc: true
docs_area: migrate
---

Validation strategies are critical to ensuring a successful data migration. They're how you confirm that the right data has been moved correctly, is complete, and is usable in the new environment. A validation strategy is defined by **what** validations you want to run and **when** you want to run them.

This page explains how to think about different validation strategies and how to use MOLT tooling to enable validation.

<!-- In general:

- Validate **early and often** to catch issues when they're easier to fix—during design, after initial load, throughout replication, and before cutover.

- Align validation scope and timing with your **migration pattern**: bulk load requires full validation during downtime; load-then-replicate needs live-aware validation; phased migrations validate each subset independently.

- Combine **automated data comparison** (MOLT Verify) with **application-level testing** to ensure both row-level correctness and end-to-end behavioral equivalence. -->

## What to validate

Running any of the following validations can help you feel confident that the data in the CockroachDB cluster matches the data in the migration source database.

- **Row Count Validation**: Ensures the number of records matches between source and target.

- **Checksum/Hash Validation**: Compares hashed values of rows or columns to detect changes or corruption.

- **Data Sampling**: Randomly sample and manually compare rows between systems.

- **Column-Level Comparison**: Validate individual field values across systems.

- **Business Rule Validation**: Apply domain rules to validate logic or derived values.

- **Boundary Testing**: Ensure edge-case data (nulls, max values, etc.) are correctly migrated.

- **Referential Integrity**: Validate that relationships (foreign keys) are intact in the target.

- **Data Type Validation**: Confirm that fields conform to expected types/formats.

- **Null/Default Value Checks**: Validate expected default values or NULLs post-migration.

- **ETL Process Validation**: Check logs, counts, or errors from migration tools.

- **Automated Testing**: Use scripts or tools to compare results and flag mismatches.

The rigor of your validations (the set of validations you perform) will depend on your organization's risk tolerance and the complexity of the migration.

## When to validate

A migration can be a long process, and depending on the choices made in designing a migration, it can be complex. If the dataset is small or the migration is low in complexity, it may be sufficient to simply run validations when you're ready to cut over application traffic to CockroachDB. However, there are several opportunities to validate your data in advance of cutover.

It's often useful to find natural checkpoints in your migration flow to run validations, and to increase the rigor of those validations as you approach cutover.

If performing a migration [in phases]({% link molt/migration-considerations-phases.md %}), the checkpoints below can be considered in the context of each individual phase. A rigorous validation approach might choose to run validations after each phase, while a more risk-tolerant approach might choose to run them after all of the phases have been migrated but before cutover.

#### Pre-migration (design and dry-run)

Validate converted schema and resolve type mapping issues. Run a dry-run migration on test data and begin query validation to catch behavioral differences early.

#### After a bulk data load

Run comprehensive validations to confirm schema and row-level parity before re-adding constraints and indexes that were dropped to accelerate load.

#### During continuous replication

If using [continuous replication]({% link molt/migration-considerations-replication.md %}), run validation periodically to ensure the target converges with the source. Use live-aware validation to reduce false positives from in-flight changes. This gives you confidence that replication is working correctly.

#### Before cutover

Once replication has drained, run final validation on the complete cutover scope and verify critical application queries.

#### Post-cutover confidence checks

After traffic moves to CockroachDB, run targeted validation on critical tables and application smoke tests to confirm steady state.

## Decision framework

Use these questions to help you determine what validations you want to perform, and when you want to peform them:

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

[MOLT Verify]({% link molt/molt-verify.md %}) performs structural and row-level comparison between the source database and the CockroachDB cluster. MOLT Verify performs the following verifications to ensure data integrity during a migration:

- Table Verification: Check that the structure of tables between the source database and the target database are the same.

- Column Definition Verification: Check that the column names, data types, constraints, nullability, and other attributes between the source database and the target database are the same.

- Row Value Verification: Check that the actual data in the tables is the same between the source database and the target database.

Other validations beyond those supported by MOLT Verify would need to be run by a third-party tool, but could be run in tandem with MOLT Verify.

If performing a [phased migration]({% link molt/migration-considerations-phases.md %}), you can use MOLT Verify's `--schema-filter` and `--table-filter` flags to specify specific schemas or tables to run the validations on. 

If using [continuous replication]({% link molt/migration-considerations-replication.md %}), you can use MOLT Verify's `--continuous` and `--live` flags to enable continuous verification.

Check MOLT Verify's [known limitations]({% link molt/molt-verify.md %}#known-limitations) to ensure the tool's suitability for your validation strategy.

<!-- ### MOLT Fetch

[MOLT Fetch]({% link molt/molt-fetch.md %}) bulk loads data and defines the first validation checkpoint. After Fetch completes, run MOLT Verify before re-adding constraints and indexes that were dropped for performance.

### MOLT Replicator

[MOLT Replicator]({% link molt/molt-replicator.md %}) streams ongoing changes and provides health signals for validation timing:

- Enable metrics (`--metricsAddr`) to monitor replication lag and confirm steady-state.
- Use lag signals to determine when replication has "drained" before running final validation.
- Ensure GC TTL is configured so checkpoint positions remain valid during the migration window. -->

<!-- ## Validation by migration stage

| Stage | Purpose | Approach |
|---|---|---|
| **Design & dry-run** | Catch schema and type issues early | Convert schema, load test data, validate critical queries, note differences to waive or fix |
| **After bulk load** | Prove parity before resuming constraints | Run MOLT Verify on full scope; resolve mismatches; re-add non-PK constraints/indexes |
| **During replication** | Ensure convergence while source is live | Run MOLT Verify with `--live` and optionally `--continuous` on critical tables; monitor Replicator metrics |
| **Pre-cutover gate** | Final correctness guarantee | Confirm Replicator drained; run comprehensive MOLT Verify; validate critical query suite |
| **Post-cutover** | Confidence in steady state | Targeted MOLT Verify on high-risk tables; application smoke tests | -->
<!-- 
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
Active sources can cause transient mismatches. Always use `--live` mode during replication to retry rows before flagging errors. -->

## See also

- [Migration Overview]({% link molt/migration-overview.md %})
- [Migration Considerations]({% link molt/migration-considerations.md %})
- [Migration Granularity]({% link molt/migration-considerations-phases.md %})
- [Continuous Replication]({% link molt/migration-considerations-replication.md %})
- [Data Transformation Strategy]({% link molt/migration-considerations-transformation.md %})
- [MOLT Verify]({% link molt/molt-verify.md %})
- [MOLT Fetch]({% link molt/molt-fetch.md %})
- [MOLT Replicator]({% link molt/molt-replicator.md %})
