---
title: SQL Feature Support in CockroachDB v2.0
summary: Summary of CockroachDB's conformance to the SQL standard and which common extensions it supports.
---

<div id="toc"></div>

## Overview

Making CockroachDB easy to use is a top priority for us, so we chose to implement SQL. However, even though SQL has a standard, no database implements all of it, nor do any of them have standard implementations of all features.

To understand which standard SQL features we support (as well as common extensions to the standard), use the table below.

- **Component** lists the components that are commonly considered part of SQL.
- **Supported** shows CockroachDB's level of support for the component.
- **Type** indicates whether the component is part of the SQL *Standard* or is an *Extension* created by ourselves or others.
- **Details** provides greater context about the component.

<style>
table tr td:nth-child(2) {
    text-align: center;
}
</style>

## Features

### Row Values

| Component | Supported | Type | Details |
|-----------|-----------|------|---------|
| Identifiers | ✓ | Standard | [Identifiers documentation](keywords-and-identifiers.html#identifiers) |
| `INT` | ✓ | Standard | [`INT` documentation](int.html) |
| `FLOAT`, `REAL` | ✓ | Standard | [`FLOAT` documentation](float.html) |
| `BOOLEAN` | ✓ | Standard | [`BOOL` documentation](bool.html) |
| `DECIMAL`, `NUMERIC` | ✓ | Standard | [`DECIMAL` documentation](decimal.html) |
| `NULL` | ✓ | Standard | [*NULL*-handling documentation](null-handling.html) |
| `BYTES` | ✓ | CockroachDB Extension | [`BYTES` documentation](bytes.html) |
| Automatic key generation | ✓ | Common Extension | [Automatic key generation FAQ](sql-faqs.html#how-do-i-auto-generate-unique-row-ids-in-cockroachdb) |
| `STRING`, `CHARACTER` | ✓ | Standard | [`STRING` documentation](string.html) |
| `COLLATE` | ✓ | Standard | [`COLLATE` documentation](collate.html) |
| `AUTO INCREMENT` | Alternative | Common Extension | [Automatic key generation FAQ](sql-faqs.html#how-do-i-auto-generate-unique-row-ids-in-cockroachdb) |
| Key-value pairs | Alternative | Extension | [Key-Value FAQ](frequently-asked-questions.html#can-i-use-cockroachdb-as-a-key-value-store) |
| <span class="version-tag">New in v1.1:</span> `ARRAY` | ✓ | Standard | [`ARRAY` documentation](array.html) |
| <span class="version-tag">New in v1.1:</span> `UUID` | ✓ | Standard | [`UUID` documentation](uuid.html) |
| JSON | Planned | Common Extension | [GitHub issue tracking JSON support](https://github.com/cockroachdb/cockroach/issues/2969) |
| XML | ✗ | Standard | XML data can be stored as `BYTES`, but we do not offer XML parsing. |
| `UNSIGNED INT` | ✗ | Common Extension | `UNSIGNED INT` causes numerous casting issues, so we don't plan to support it. |
| `SET`, `ENUM` | ✗ | MySQL, PostgreSQL Extension | Only allow rows to contain values from a defined set of terms. |

### Constraints

| Component | Supported | Type | Details |
|-----------|-----------|------|---------|
| Not Null | ✓ | Standard | [Not Null documentation](not-null.html) |
| Unique | ✓ | Standard | [Unique documentation](unique.html) |
| Primary Key | ✓ | Standard | [Primary Key documentation](primary-key.html) |
| Check | ✓ | Standard | [Check documentation](check.html) |
| Foreign Key | ✓ | Standard | [Foreign Key documentation](foreign-key.html) |
| Default Value | ✓ | Standard | [Default Value documentation](default-value.html) |

### Transactions

| Component | Supported | Type | Details |
|-----------|-----------|------|---------|
| Transactions (ACID semantics) | ✓ | Standard | [Transactions documentation](transactions.html) |
| `BEGIN` | ✓ | Standard | [`BEGIN` documentation](begin-transaction.html) |
| `COMMIT` | ✓ | Standard | [`COMMIT` documentation](commit-transaction.html) |
| `ROLLBACK` | ✓ | Standard | [`ROLLBACK` documentation](rollback-transaction.html) |
| `SAVEPOINT` | ✓ | CockroachDB Extension | While `SAVEPOINT` is part of the SQL standard, we only support [our extension of it](transactions.html#transaction-retries) |

### Indexes

| Component | Supported | Type | Details |
|-----------|-----------|------|---------|
| Indexes | ✓ | Common Extension | [Indexes documentation](https://www.cockroachlabs.com/docs/indexes.html) |
| Multi-column indexes | ✓ | Common Extension | We do not limit on the number of columns indexes can include |
| Covering indexes | ✓ | Common Extension | [Storing Columns documentation](create-index.html#store-columns) |
| Multiple indexes per query | Planned | Common Extension | Use multiple indexes to filter the table's values for a single query |
| Full-text indexes | Planned | Common Extension | [GitHub issue tracking full-text index support](https://github.com/cockroachdb/cockroach/issues/7821) |
| Prefix/Expression Indexes | Potential | Common Extension | Apply expressions (such as `LOWER()`) to values before indexing them |
| Geospatial indexes | Potential | Common Extension | Improves performance of queries calculating geospatial data |
| Hash indexes | ✗ | Common Extension | Improves performance of queries looking for single, exact values |
| Partial indexes | ✗ | Common Extension | Only index specific rows from indexed columns |

### Schema Changes

| Component | Supported | Type | Details |
|-----------|-----------|------|---------|
| `ALTER TABLE` | ✓ | Standard | [`ALTER TABLE` documentation](alter-table.html) |
| Database renames | ✓ | Standard | [`RENAME DATABASE` documentation](rename-database.html) |
| Table renames | ✓ | Standard | [`RENAME TABLE` documentation](rename-table.html) |
| Column renames | ✓ | Standard | [`RENAME COLUMN` documentation](rename-column.html) |
| Adding columns | ✓ | Standard | [`ADD COLUMN` documentation](add-column.html) |
| Removing columns | ✓ | Standard | [`DROP COLUMN` documentation](drop-column.html) |
| Adding constraints | ✓ | Standard | [`ADD CONSTRAINT` documentation](add-constraint.html) |
| Removing constraints | ✓ | Standard | [`DROP CONSTRAINT` documentation](drop-constraint.html) |
| Index renames | ✓ | Standard | [`RENAME INDEX` documentation](rename-index.html) |
| Adding indexes | ✓ | Standard | [`CREATE INDEX` documentation](create-index.html) |
| Removing indexes | ✓ | Standard | [`DROP INDEX` documentation](drop-index.html) |

### Statements

| Component | Supported | Type | Details |
|-----------|-----------|------|---------|
| Common statements | ✓ | Standard | [SQL Statements documentation](sql-statements.html) |
| `UPSERT` | ✓ | PostgreSQL, MSSQL Extension | [`UPSERT` documentation](upsert.html) |
| `EXPLAIN` | ✓ | Common Extension | [`EXPLAIN` documentation](explain.html) |
| `SELECT INTO` | Alternative | Common Extension | You can replicate similar functionality using [`CREATE TABLE`](create-table.html) and then `INSERT INTO ... SELECT ...`. |

### Clauses

| Component | Supported | Type | Details |
|-----------|-----------|------|---------|
| Common clauses | ✓ | Standard | [SQL Grammar documentation](sql-grammar.html)  |
| `LIMIT` | ✓ | Common Extension | Limit the number of rows a statement returns. |
| `LIMIT` with `OFFSET` | ✓ | Common Extension | Skip a number of rows, and then limit the size of the return set. |
| `RETURNING` | ✓ | Common Extension | Retrieve a table of rows statements affect. |

### Table Expressions

| Component | Supported | Type | Details |
|-----------|-----------|------|---------|
| Table and View references | ✓ | Standard | [Table expressions documentation](table-expressions.html#table-or-view-names) |
| `AS` in table expressions | ✓ | Standard | [Aliased table expressions documentation](table-expressions.html#aliased-table-expressions) |
| `JOIN` (`INNER`, `LEFT`, `RIGHT`, `FULL`, `CROSS`) | [Functional](https://www.cockroachlabs.com/blog/better-sql-joins-in-cockroachdb/) | Standard | [Join expressions documentation](table-expressions.html#join-expressions) |
| Sub-queries as table expressions | Partial | Standard | Non-correlated subqueries are [supported](table-expressions.html#subqueries-as-table-expressions); correlated are not. |
| Table generator functions | Partial | PostgreSQL Extension | [Table generator functions documentation](table-expressions.html#table-generator-functions) |
| `WITH ORDINALITY` | ✓ | CockroachDB Extension | [Ordinality annotation documentation](table-expressions.html#ordinality-annotation) |

### Value Expressions and Boolean Formulas

| Component | Supported | Type | Details |
|-----------|-----------|------|---------|
| Common functions | ✓ | Standard | [Functions calls and SQL special forms documentation](sql-expressions.html#function-calls-and-sql-special-forms)
| Common operators | ✓ | Standard | [Operators documentation](sql-expressions.html#unary-and-binary-operations) |
| `IF`/`CASE`/`NULLIF` | ✓ | Standard | [Conditional expressions documentation](sql-expressions.html#conditional-expressions-and-boolean-short-circuit-operations) |
| `COALESCE`/`IFNULL` | ✓ | Standard | [Conditional expressions documentation](sql-expressions.html#conditional-expressions-and-boolean-short-circuit-operations) |
| `AND`/`OR` | ✓ | Standard | [Conditional expressions documentation](sql-expressions.html#conditional-expressions-and-boolean-short-circuit-operations) |
| `LIKE`/`ILIKE`  | ✓ | Standard | [String pattern matching documentation](sql-expressions.html#string-pattern-matching) |
| `SIMILAR TO` | ✓ | Standard | [SQL regexp pattern matching documentation](sql-expressions.html#string-matching-using-sql-regular-expressions) |
| Matching using POSIX regular expressions  | ✓ | Common Extension | [POSIX regexp pattern matching documentation](sql-expressions.html#string-matching-using-posix-regular-expressions) |
| `EXISTS` | Partial | Standard | Non-correlated subqueries are [supported](sql-expressions.html#existence-test-on-the-result-of-subqueries); correlated are not. Currently works only with small data sets. |
| Scalar subqueries | Partial | Standard | Non-correlated subqueries are [supported](sql-expressions.html#scalar-subqueries); correlated are not. Currently works only with small data sets. |
| Bitwise arithmetic | ✓ | Common Extension | [Operators documentation](sql-expressions.html#unary-and-binary-operations) |
| Array constructors and subscripting | Partial | PostgreSQL Extension | Array expression documentation: [Constructor syntax](sql-expressions.html#array-constructors) and [Subscripting](sql-expressions.html#subscripted-expressions) |
| `COLLATE`| ✓ | Standard | [Collation expressions documentation](sql-expressions.html#collation-expressions) |
| Column ordinal references | ✓ | CockroachDB Extension | [Column references documentation](sql-expressions.html#column-references) |
| Type annotations | ✓ | CockroachDB Extension | [Type annotations documentation](sql-expressions.html#explicitly-typed-expressions) |

### Permissions

| Component | Supported | Type | Details |
|-----------|-----------|------|---------|
| Users | ✓ | Standard | [`GRANT` documentation](grant.html) |
| Privileges | ✓ | Standard | [Privileges documentation](privileges.html) |

### Miscellaneous

| Component | Supported | Type | Details |
|-----------|-----------|------|---------|
| Column families | ✓ | CockroachDB Extension | [Column Families documentation](https://www.cockroachlabs.com/docs/column-families.html) |
| Interleaved tables | ✓ | CockroachDB Extension | [Interleaved Tables documentation](interleave-in-parent.html) |
| Parallel Statement Execution | ✓ | CockroachDB Extension | [Parallel Statement Execution documentation](parallel-statement-execution.html) |
| Information Schema | ✓ | Standard | [Information Schema documentation](information-schema.html)
| Views | ✓ | Standard | [Views documentation](views.html) |
| Window functions | ✓ | Standard | [Window Functions documentation](window-functions.html) |
| Common Table Expressions | Planned | Common Extension | Similar to Views, though they are not stored. |
| Stored Procedures | Planned | Common Extension | Execute a procedure explicitly. |
| Cursors | ✗ | Standard | Traverse a table's rows. |
| Triggers | ✗ | Standard | Execute a set of commands whenever a specified event occurs. |
| Sequences | Planned | Common Extension | [GitHub issue tracking sequence support.](https://github.com/cockroachdb/cockroach/issues/5811) |
