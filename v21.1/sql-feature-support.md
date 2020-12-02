---
title: SQL Feature Support in CockroachDB v21.1
summary: Summary of CockroachDB's conformance to the SQL standard and which common extensions it supports.
toc: true
redirect_from: detailed-sql-support.html
---

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

### Row values

 Component | Supported | Type | Details
-----------|-----------|------|---------
 Identifiers | ✓ | Standard | [Identifiers documentation](keywords-and-identifiers.html#identifiers)
 `INT` | ✓ | Standard | [`INT` documentation](int.html)
 `FLOAT`, `REAL` | ✓ | Standard | [`FLOAT` documentation](float.html)
 `BOOLEAN` | ✓ | Standard | [`BOOL` documentation](bool.html)
 `DECIMAL`, `NUMERIC` | ✓ | Standard | [`DECIMAL` documentation](decimal.html)
 `NULL` | ✓ | Standard | [*NULL*-handling documentation](null-handling.html)
 `BYTES` | ✓ | CockroachDB Extension | [`BYTES` documentation](bytes.html)
 Automatic key generation | ✓ | Common Extension | [Automatic key generation FAQ](sql-faqs.html#how-do-i-auto-generate-unique-row-ids-in-cockroachdb)
 `STRING`, `CHARACTER` | ✓ | Standard | [`STRING` documentation](string.html)
 `COLLATE` | ✓ | Standard | [`COLLATE` documentation](collate.html)
 `AUTO INCREMENT` | Alternative | Common Extension | [Automatic key generation FAQ](sql-faqs.html#how-do-i-auto-generate-unique-row-ids-in-cockroachdb)
 Key-value pairs | Alternative | Extension | [Key-Value FAQ](sql-faqs.html#can-i-use-cockroachdb-as-a-key-value-store)
 `ARRAY` | ✓ | Standard | [`ARRAY` documentation](array.html)
 `UUID` | ✓ | PostgreSQL Extension | [`UUID` documentation](uuid.html)
 JSON | ✓ | Common Extension | [`JSONB` documentation](jsonb.html)
 `TIME` | ✓ | Standard | [`TIME` documentation](time.html)
 XML | ✗ | Standard | XML data can be stored as `BYTES`, but we do not offer XML parsing.
 `UNSIGNED INT` | ✗ | Common Extension | `UNSIGNED INT` causes numerous casting issues, so we do not plan to support it.
 `SET`| ✗ | MySQL| Only allow rows to contain values from a defined set of terms.
 `INET` | ✓ | PostgreSQL Extension | [`INET` documentation](inet.html)
 `ENUM` | ✓ | PostgreSQL Extension |  [`ENUM` documentation](enum.html)

### Constraints

 Component | Supported | Type | Details
-----------|-----------|------|---------
 Not Null | ✓ | Standard | [Not Null documentation](not-null.html)
 Unique | ✓ | Standard | [Unique documentation](unique.html)
 Primary Key | ✓ | Standard | [Primary Key documentation](primary-key.html)
 Check | ✓ | Standard | [Check documentation](check.html)
 Foreign Key | ✓ | Standard | [Foreign Key documentation](foreign-key.html)
 Default Value | ✓ | Standard | [Default Value documentation](default-value.html)

### Transactions

 Component | Supported | Type | Details
-----------|-----------|------|---------
 Transactions (ACID semantics) | ✓ | Standard | [Transactions documentation](transactions.html)
 `BEGIN` | ✓ | Standard | [`BEGIN` documentation](begin-transaction.html)
 `COMMIT` | ✓ | Standard | [`COMMIT` documentation](commit-transaction.html)
 `ROLLBACK` | ✓ | Standard | [`ROLLBACK` documentation](rollback-transaction.html)
 `SAVEPOINT` | ✓ | Standard with CockroachDB extensions |  CockroachDB supports nested transactions using [`SAVEPOINT`](savepoint.html)

### Indexes

 Component | Supported | Type | Details
-----------|-----------|------|---------
 Indexes | ✓ | Common Extension | [Indexes documentation](indexes.html)
 Multi-column indexes | ✓ | Common Extension | We do not limit on the number of columns indexes can include
 Covering indexes | ✓ | Common Extension | [Storing Columns documentation](create-index.html#store-columns)
 Inverted indexes | ✓ | Common Extension | [Inverted Indexes documentation](inverted-indexes.html)
 Partial indexes | ✓ | Common Extension |  [Partial indexes documentation](partial-indexes.html)
 Spatial indexes | ✓ | Common Extension |  [Spatial indexes documentation](spatial-indexes.html)
 Multiple indexes per query | Partial | Common Extension | [Use multiple indexes for a single query](https://github.com/cockroachdb/cockroach/issues/2142)
 Full-text indexes | Planned | Common Extension | [GitHub issue tracking full-text index support](https://github.com/cockroachdb/cockroach/issues/7821)
 Prefix/Expression Indexes | Potential | Common Extension | Apply expressions (such as `LOWER()`) to values before indexing them
 Hash indexes | ✗ | Common Extension | Improves performance of queries looking for single, exact values

### Schema changes

 Component | Supported | Type | Details
-----------|-----------|------|---------
 `ALTER TABLE` | ✓ | Standard | [`ALTER TABLE` documentation](alter-table.html)
 Database renames | ✓ | Standard | [`RENAME DATABASE` documentation](rename-database.html)
 Table renames | ✓ | Standard | [`RENAME TABLE` documentation](rename-table.html)
 Column renames | ✓ | Standard | [`RENAME COLUMN` documentation](rename-column.html)
 Altering a column's data type | ✓ | Standard |  [`ALTER COLUMN` documentation](alter-column.html#altering-column-data-types)
 Adding columns | ✓ | Standard | [`ADD COLUMN` documentation](add-column.html)
 Removing columns | ✓ | Standard | [`DROP COLUMN` documentation](drop-column.html)
 Adding constraints | ✓ | Standard | [`ADD CONSTRAINT` documentation](add-constraint.html)
 Removing constraints | ✓ | Standard | [`DROP CONSTRAINT` documentation](drop-constraint.html)
 Index renames | ✓ | Standard | [`RENAME INDEX` documentation](rename-index.html)
 Adding indexes | ✓ | Standard | [`CREATE INDEX` documentation](create-index.html)
 Removing indexes | ✓ | Standard | [`DROP INDEX` documentation](drop-index.html)
 Altering a primary key | ✓ | Standard | [`ALTER PRIMARY KEY` documentation](alter-primary-key.html)
 Adding user-defined schemas | ✓ | Standard |  [`CREATE SCHEMA` documentation](create-schema.html)
 Removing user-defined schemas | ✓ | Standard |  [`DROP SCHEMA` documentation](drop-schema.html)
 Altering user-defined schemas | ✓ | Standard |  [`ALTER SCHEMA` documentation](create-schema.html)
 Converting a database to a user-defined schema | ✓ | CockroachDB Extension |  [`CONVERT TO SCHEMA` documentation](convert-to-schema.html)

### Statements

 Component | Supported | Type | Details
-----------|-----------|------|---------
 Common statements | ✓ | Standard | [SQL Statements documentation](sql-statements.html)
 `UPSERT` | ✓ | PostgreSQL, MSSQL Extension | [`UPSERT` documentation](upsert.html)
 `EXPLAIN` | ✓ | Common Extension | [`EXPLAIN` documentation](explain.html)
 `SELECT INTO` | Alternative | Common Extension | You can replicate similar functionality using [`CREATE TABLE`](create-table.html) and then `INSERT INTO ... SELECT ...`.
 `SELECT FOR UPDATE` | ✓ | Common Extension |  [`SELECT FOR UPDATE` documentation](select-for-update.html)

### Clauses

 Component | Supported | Type | Details
-----------|-----------|------|---------
 Common clauses | ✓ | Standard | [SQL Grammar documentation](sql-grammar.html)  
 `LIMIT` | ✓ | Common Extension | Limit the number of rows a statement returns.
 `LIMIT` with `OFFSET` | ✓ | Common Extension | Skip a number of rows, and then limit the size of the return set.
 `RETURNING` | ✓ | Common Extension | Retrieve a table of rows statements affect.

### Table expressions

 Component | Supported | Type | Details
-----------|-----------|------|---------
 Table and View references | ✓ | Standard | [Table expressions documentation](table-expressions.html#table-or-view-names)
 `AS` in table expressions | ✓ | Standard | [Aliased table expressions documentation](table-expressions.html#aliased-table-expressions)
 `JOIN` (`INNER`, `LEFT`, `RIGHT`, `FULL`, `CROSS`) | [Functional](https://www.cockroachlabs.com/blog/better-sql-joins-in-cockroachdb/) | Standard | [Join expressions documentation](table-expressions.html#join-expressions)
 Sub-queries as table expressions | Partial | Standard | Non-correlated subqueries are [supported](table-expressions.html#subqueries-as-table-expressions), as are most [correlated subqueries](subqueries.html#correlated-subqueries).
 Table generator functions | Partial | PostgreSQL Extension | [Table generator functions documentation](table-expressions.html#table-generator-functions)
 `WITH ORDINALITY` | ✓ | CockroachDB Extension | [Ordinality annotation documentation](table-expressions.html#ordinality-annotation)

### Scalar expressions and boolean formulas

 Component | Supported | Type | Details
-----------|-----------|------|---------
 Common functions | ✓ | Standard | [Functions calls and SQL special forms documentation](scalar-expressions.html#function-calls-and-sql-special-forms)
 Common operators | ✓ | Standard | [Operators documentation](scalar-expressions.html#unary-and-binary-operations)
 `IF`/`CASE`/`NULLIF` | ✓ | Standard | [Conditional expressions documentation](scalar-expressions.html#conditional-expressions)
 `COALESCE`/`IFNULL` | ✓ | Standard | [Conditional expressions documentation](scalar-expressions.html#conditional-expressions)
`AND`/`OR` | ✓ | Standard | [Conditional expressions documentation](scalar-expressions.html#conditional-expressions)
 `LIKE`/`ILIKE`  | ✓ | Standard | [String pattern matching documentation](scalar-expressions.html#string-pattern-matching)
 `SIMILAR TO` | ✓ | Standard | [SQL regexp pattern matching documentation](scalar-expressions.html#string-matching-using-sql-regular-expressions)
 Matching using POSIX regular expressions  | ✓ | Common Extension | [POSIX regexp pattern matching documentation](scalar-expressions.html#string-matching-using-posix-regular-expressions)
 `EXISTS` | Partial | Standard | Non-correlated subqueries are [supported](scalar-expressions.html#existence-test-on-the-result-of-subqueries), as are most [correlated subqueries](subqueries.html#correlated-subqueries). Currently works only with small data sets.
 Scalar subqueries | Partial | Standard | Non-correlated subqueries are [supported](scalar-expressions.html#scalar-subqueries), as are most [correlated subqueries](subqueries.html#correlated-subqueries). Currently works only with small data sets.
 Bitwise arithmetic | ✓ | Common Extension | [Operators documentation](scalar-expressions.html#unary-and-binary-operations)
 Array constructors and subscripting | Partial | PostgreSQL Extension | Array expression documentation: [Constructor syntax](scalar-expressions.html#array-constructors) and [Subscripting](scalar-expressions.html#subscripted-expressions)
 `COLLATE`| ✓ | Standard | [Collation expressions documentation](scalar-expressions.html#collation-expressions)
 Column ordinal references | ✓ | CockroachDB Extension | [Column references documentation](scalar-expressions.html#column-references)
 Type annotations | ✓ | CockroachDB Extension | [Type annotations documentation](scalar-expressions.html#explicitly-typed-expressions)

### Permissions

 Component | Supported | Type | Details
-----------|-----------|------|---------
 Users | ✓ | Standard | [`GRANT` documentation](grant.html)
 Privileges | ✓ | Standard | [Privileges documentation](authorization.html#assign-privileges)

### Miscellaneous

 Component | Supported | Type | Details
-----------|-----------|------|---------
 Column families | ✓ | CockroachDB Extension | [Column Families documentation](column-families.html)
 Interleaved tables | ✓ | CockroachDB Extension | [Interleaved Tables documentation](interleave-in-parent.html)
 Information Schema | ✓ | Standard | [Information Schema documentation](information-schema.html)
 Views | ✓ | Standard | [Views documentation](views.html)
 Materialized views | ✓ | Common Extension |  [Materialized views documentation](views.html#materialized-views)
 Window functions | ✓ | Standard | [Window Functions documentation](window-functions.html)
 Common Table Expressions | Partial | Common Extension | [Common Table Expressions documentation](common-table-expressions.html)
 Stored Procedures | Planned | Common Extension | Execute a procedure explicitly.
 Cursors | ✗ | Standard | Traverse a table's rows.
 Triggers | ✗ | Standard | Execute a set of commands whenever a specified event occurs.
 Sequences |  ✓ | Common Extension | [`CREATE SEQUENCE` documentation](create-sequence.html)
