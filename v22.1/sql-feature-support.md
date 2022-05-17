---
title: SQL Feature Support in CockroachDB v22.1
summary: Summary of CockroachDB's conformance to the SQL standard and which common extensions it supports.
toc: true
keywords: gin, gin index, gin indexes, inverted index, inverted indexes, accelerated index, accelerated indexes
docs_area: reference.sql
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
 `ARRAY` | ✓ | Standard | [`ARRAY` documentation](array.html)
 `AUTO INCREMENT`<br>(Automatic key generation) | Alternative | Common Extension | [Automatic key generation FAQ](sql-faqs.html#how-do-i-auto-generate-unique-row-ids-in-cockroachdb)
 `BIT` | ✓ | Standard | [`BIT` documentation](bit.html)
 `BYTES` | ✓ | CockroachDB Extension | [`BYTES` documentation](bytes.html)
 `BOOLEAN` | ✓ | Standard | [`BOOL` documentation](bool.html)
 `COLLATE` | ✓ | Standard | [`COLLATE` documentation](collate.html)
 `DATE` | ✓ | Standard | [`DATE` documentation](date.html)
 `DECIMAL`, `NUMERIC` | ✓ | Standard | [`DECIMAL` documentation](decimal.html)
 `ENUM` | ✓ | PostgreSQL Extension |  [`ENUM` documentation](enum.html)
 `FLOAT`, `REAL` | ✓ | Standard | [`FLOAT` documentation](float.html)
 `INET` | ✓ | PostgreSQL Extension | [`INET` documentation](inet.html)
 `INT` | ✓ | Standard | [`INT` documentation](int.html)
 `INTERVAL` | ✓ | Standard | [`INTERVAL` documentation](interval.html)
 `JSON`/`JSONB` | ✓ | Common Extension | [`JSONB` documentation](jsonb.html)
 `NULL` | ✓ | Standard | [*NULL*-handling documentation](null-handling.html)
 `SERIAL`| ✓ | PostgreSQL Extension | [`SERIAL` documentation](serial.html)
 `SET`| ✗ | MySQL| Only allow rows to contain values from a defined set of terms.
 `STRING`, `CHARACTER` | ✓ | Standard | [`STRING` documentation](string.html)
 `TIME` | ✓ | Standard | [`TIME` documentation](time.html)
 `TIMESTAMP`/`TIMESTAMPTZ` | ✓ | Standard | [`TIMESTAMP` documentation](timestamp.html)
 `UNSIGNED INT` | ✗ | Common Extension | `UNSIGNED INT` causes numerous casting issues, so we do not plan to support it.
 `UUID` | ✓ | PostgreSQL Extension | [`UUID` documentation](uuid.html)
  Identifiers | ✓ | Standard | [Identifiers documentation](keywords-and-identifiers.html#identifiers)
  Key-value pairs | Alternative | Extension | [Key-Value FAQ](sql-faqs.html#can-i-use-cockroachdb-as-a-key-value-store)
  XML | ✗ | Standard | XML data can be stored as `BYTES`, but we do not offer XML parsing.

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
 GIN indexes | ✓ | Common Extension | [GIN Indexes documentation](inverted-indexes.html)
 Partial indexes | ✓ | Common Extension | [Partial indexes documentation](partial-indexes.html)
 Spatial indexes | ✓ | Common Extension | [Spatial indexes documentation](spatial-indexes.html)
 Multiple indexes per query | Partial | Common Extension | [Index selection](indexes.html#selection)
 Full-text indexes | ✗ | Common Extension | [GitHub issue tracking full-text index support](https://github.com/cockroachdb/cockroach/issues/7821)
 Expression indexes | ✓ | Common Extension | [Expression indexes](expression-indexes.html)
 Prefix indexes | ✗ | Common Extension | Implement using [Expression indexes](expression-indexes.html)
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

### Statements

 Component | Supported | Type | Details
-----------|-----------|------|---------
 Common statements | ✓ | Standard, PostgreSQL/CockroachDB Extension | [SQL Statements documentation](sql-statements.html)
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
 `JOIN` (`INNER`, `LEFT`, `RIGHT`, `FULL`, `CROSS`) | [Functional](https://www.cockroachlabs.com/blog/better-sql-joins-in-cockroachdb/) | Standard | [`JOIN` expressions documentation](table-expressions.html#join-expressions)
 Sub-queries as table expressions | Partial | Standard | Non-correlated subqueries are [supported](table-expressions.html#subqueries-as-table-expressions), as are most [correlated subqueries](subqueries.html#correlated-subqueries).
 Table generator functions | Partial | PostgreSQL Extension | [Table generator functions documentation](table-expressions.html#table-generator-functions)
 `WITH ORDINALITY` | ✓ | CockroachDB Extension | [Ordinality annotation documentation](table-expressions.html#ordinality-annotation)

### Scalar expressions and Boolean formulas

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
 `EXISTS` | Partial | Standard | Non-correlated subqueries are [supported](scalar-expressions.html#existence-test-on-the-result-of-subqueries), as are most [correlated subqueries](subqueries.html#correlated-subqueries). Works only with small data sets.
 Scalar subqueries | Partial | Standard | Non-correlated subqueries are [supported](scalar-expressions.html#scalar-subqueries), as are most [correlated subqueries](subqueries.html#correlated-subqueries). Works only with small data sets.
 Bitwise arithmetic | ✓ | Common Extension | [Operators documentation](scalar-expressions.html#unary-and-binary-operations)
 Array constructors and subscripting | Partial | PostgreSQL Extension | Array expression documentation: [Constructor syntax](scalar-expressions.html#array-constructors) and [Subscripting](scalar-expressions.html#subscripted-expressions)
 `COLLATE`| ✓ | Standard | [Collation expressions documentation](scalar-expressions.html#collation-expressions)
 Column ordinal references | ✓ | CockroachDB Extension | [Column references documentation](scalar-expressions.html#column-references)
 Type annotations | ✓ | CockroachDB Extension | [Type annotations documentation](scalar-expressions.html#explicitly-typed-expressions)

### Permissions

 Component | Supported | Type | Details
-----------|-----------|------|---------
 Users | ✓ | Standard | [Users documentation](security-reference/authorization.html#sql-users)
 Roles | ✓ | Standard | [Roles documentation](security-reference/authorization.html#roles)
 Object ownership | ✓ | Common Extension | [Ownership documentation](security-reference/authorization.html#object-ownership)
 Privileges | ✓ | Standard | [Privileges documentation](security-reference/authorization.html#managing-privileges)
 Default privileges | Partial | PostgreSQL Extension | [Default privileges documentation](security-reference/authorization.html#default-privileges)

### Miscellaneous

 Component | Supported | Type | Details
-----------|-----------|------|---------
 Column families | ✓ | CockroachDB Extension | [Column Families documentation](column-families.html)
 Computed columns (stored and virtual) | ✓ | Common Extension | [Computed Columns documentation](computed-columns.html)
 `ON UPDATE` expressions | ✓ | MySQL Extension | [`ON UPDATE` expressions documentation](create-table.html#on-update-expressions)
 Multi-region capabilities | ✓ | CockroachDB Extension | [Multi-region documentation](multiregion-overview.html)
 System catalog schemas | ✓ | Standard, PostgreSQL/CockroachDB Extension | [`crdb_internal`](crdb-internal.html) (CockroachDB Extension)<br>[`information_schema`](information-schema.html) (Standard)<br>[`pg_catalog`](pg-catalog.html) (PostgreSQL Extension)<br>[`pg_extension`](pg-extension.html) (PostgreSQL Extension)
 Sequences |  ✓ | Common Extension | [`CREATE SEQUENCE` documentation](create-sequence.html)
 Identity columns | ✓ | Common Extension | [Identity columns documentation](create-table.html#identity-columns)
 Views | ✓ | Standard | [Views documentation](views.html)
 Materialized views | ✓ | Common Extension |  [Materialized views documentation](views.html#materialized-views)
 Window functions | ✓ | Standard | [Window Functions documentation](window-functions.html)
 Common table expressions | Partial | Common Extension | [Common Table Expressions documentation](common-table-expressions.html)
 Stored procedures | ✗ | Common Extension | Execute a procedure explicitly. [GitHub issue tracking stored procedures support](https://github.com/cockroachdb/cockroach/issues/17511).
 Cursors | ✗ | Standard | Traverse a table's rows.
 Triggers | ✗ | Standard | Execute a set of commands whenever a specified event occurs. [GitHub issue tracking trigger support](https://github.com/cockroachdb/cockroach/issues/28296).
 Row-level TTL | ✓ | Common Extension | Automatically delete expired rows.  For more information, see [Batch-delete expired data with Row-Level TTL](row-level-ttl.html).
