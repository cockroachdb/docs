---
title: Validation Strategy
summary: Learn when and how to validate data during migration to ensure correctness, completeness, and consistency.
toc: true
docs_area: migrate
---

Validation strategies are critical to ensuring a successful data migration. They're how you confirm that the right data has been moved correctly, is complete, and is usable in the new environment. A validation strategy is defined by **what** validations you want to run and **when** you want to run them.

This page explains how to think about different validation strategies and how to use MOLT tooling to enable validation.

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

If performing a migration [in phases]({% link molt/migration-considerations-granularity.md %}), the checkpoints below can be considered in the context of each individual phase. A rigorous validation approach might choose to run validations after each phase, while a more risk-tolerant approach might choose to run them after all of the phases have been migrated but before cutover.

### Pre-migration (design and dry-run)

Validate converted schema and resolve type mapping issues. Run a dry-run migration on test data and begin query validation to catch behavioral differences early.

### After a bulk data load

Run comprehensive validations to confirm schema and row-level parity before re-adding constraints and indexes that were dropped to accelerate load.

### During continuous replication

If using [continuous replication]({% link molt/migration-considerations-replication.md %}), run validation periodically to ensure the target converges with the source. Use live-aware validation to reduce false positives from in-flight changes. This gives you confidence that replication is working correctly.

### Before cutover

Once replication has drained, run final validation on the complete cutover scope and verify critical application queries.

### After cutover

After traffic moves to CockroachDB, run targeted validation on critical tables and application smoke tests to confirm steady state.

## Decision framework

Use these questions to help you determine what validations you want to perform, and when you want to peform them:

**What is your data volume and validation timeline?**
Larger datasets require more validation time. Consider concurrency tuning, phased validation, or off-peak runs to fit within windows.

**Are there intentional schema or type differences?**
Expect validation to flag type conversions and collation differences. Decide upfront whether to accept conditional successes or redesign to enable strict parity.

**What is your organization's risk tolerance?**
High-risk migrations may require comprehensive validation at every checkpoint, including both automated and manual verification. Lower-risk migrations may accept sampling or targeted validation.

**Are you migrating in phases?**
Phased migrations offer natural checkpoints for validation between phases. Decide whether to validate after each phase or defer to pre-cutover validation.

**How will you handle validation failures?**
Determine in advance whether mismatches will block cutover, trigger investigation, or allow conditional proceed. Establish clear thresholds and escalation paths.

## MOLT toolkit support

[MOLT Verify]({% link molt/molt-verify.md %}) performs structural and row-level comparison between the source database and the CockroachDB cluster. MOLT Verify performs the following verifications to ensure data integrity during a migration:

- Table Verification: Check that the structure of tables between the source database and the target database are the same.

- Column Definition Verification: Check that the column names, data types, constraints, nullability, and other attributes between the source database and the target database are the same.

- Row Value Verification: Check that the actual data in the tables is the same between the source database and the target database.

Other validations beyond those supported by MOLT Verify would need to be run by a third-party tool, but could be run in tandem with MOLT Verify.

If performing a [phased migration]({% link molt/migration-considerations-granularity.md %}), you can use MOLT Verify's `--schema-filter` and `--table-filter` flags to specify specific schemas or tables to run the validations on.

If using [continuous replication]({% link molt/migration-considerations-replication.md %}), you can utilize MOLT Verify's [selective data verification]({% link molt/molt-verify.md %}#verify-a-subset-of-data) to validate replicated changes as they are written to the target.

Check MOLT Verify's [known limitations]({% link molt/molt-verify.md %}#known-limitations) to ensure the tool's suitability for your validation strategy.

## See also

- [Migration Overview]({% link molt/migration-overview.md %})
- [Migration Considerations]({% link molt/migration-considerations.md %})
- [Migration Granularity]({% link molt/migration-considerations-granularity.md %})
- [Continuous Replication]({% link molt/migration-considerations-replication.md %})
- [Data Transformation Strategy]({% link molt/migration-considerations-transformation.md %})
- [MOLT Verify]({% link molt/molt-verify.md %})
- [MOLT Fetch]({% link molt/molt-fetch.md %})
- [MOLT Replicator]({% link molt/molt-replicator.md %})
