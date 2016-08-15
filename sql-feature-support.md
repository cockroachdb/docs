---
title: SQL Feature Support
summary: Find CockroachDB's conformance to the SQL standard and which common extensions it supports.
---

## Overview
Making CockroachDB easy to use was a top priority for us, so we chose to implement SQL. However, even though SQL has a standard, no database implements all of it, nor do any of them have standard implementations of all features.

To understand which standard SQL features we support (as well as common extensions to the standard), use the table below.

- __Component__ lists the components that are commonly considered part of SQL.
- __Supported__ shows CockroachDB's level of support for the component.
- __Type__ indicates whether the component is part of the SQL _Standard_ or is an _Extension_ created by ourselves or others.
- __Details__ provides greater context about the component.

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
| `STRING`, `CHARACTER` | ✓ | Standard | [`STRING` documentation](string.html) |
| `NULL` | ✓ | Standard | [_NULL_-handling documentation](null-handling.html) |
| `BYTES` | ✓ | CockroachDB Extension | [`BYTES` documentation](bytes.html) |
| Automatic key generation | ✓ | Common Extension | [`SERIAL` documentation](serial.html) |
| `AUTO INCREMENT` | Alternative | Common Extension | [`SERIAL`](serial.html) replaces support for this component. |
| Key-value pairs | Alternative | Extension | [Key-Value FAQ](frequently-asked-questions.html#can-i-use-cockroachdb-as-a-key-value-store) |
| Arrays | Planned | Standard | [GitHub Issue tracking array support](https://github.com/cockroachdb/cockroach/issues/2115) |
| JSON | Planned | Common Extension | [GitHub Issue tracking JSON support](https://github.com/cockroachdb/cockroach/issues/2969) |
| XML | ✗ | Standard | XML data can be stored as `BYTES`, but we do not offer XML parsing. |
| `UNSIGNED INT` | ✗ | Common Extension | `UNSIGNED INT` causes numerous casting issues, so we don't plan to support it. |
| `SET`, `ENUM` | ✗ | MySQL, Postgres Extension | Only allow rows to contain values from a defined set of terms. |

### Constraints

| Component | Supported | Type | Details |
|-----------|-----------|------|---------|
| `NOT NULL` | ✓ | Standard | [`NOT NULL` documentation](constraints.html#not-null) |
| `UNIQUE` | ✓ | Standard | [`UNIQUE` documentation](constraints.html#unique) |
| `PRIMARY KEY` | ✓ | Standard | [`PRIMARY KEY` documentation](constraints.html#primary-key) |
| `CHECK` | ✓ | Standard | [`CHECK` documentation](constraints.html#check) |
| `FOREIGN KEY` | ✓ | Standard | [`FOREIGN KEY` documentation](constraints.html#foreign-keys) |
| `DEFAULT VALUE` | ✓ | Standard | [`DEFAULT VALUE` documentation](constraints.html#default-value) |

### Joins

| Component | Supported | Type | Details |
|-----------|-----------|------|---------|
| `INNER JOIN` | ✓ | Standard | [`JOIN` blog post](https://www.cockroachlabs.com/blog/cockroachdbs-first-join/) |
| `LEFT JOIN` | ✓ | Standard | [`JOIN` blog post](https://www.cockroachlabs.com/blog/cockroachdbs-first-join/) |
| `RIGHT JOIN` | ✓ | Standard | [`JOIN` blog post](https://www.cockroachlabs.com/blog/cockroachdbs-first-join/) |
| `FULL JOIN` | ✓ | Standard | [`JOIN` blog post](https://www.cockroachlabs.com/blog/cockroachdbs-first-join/) |
| `CROSS JOIN` | ✓ | Standard | [`JOIN` blog post](https://www.cockroachlabs.com/blog/cockroachdbs-first-join/) |

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
| Multi-column indexes | ✓ | Common Extension | We do not imit on the number of columns indexes can include |
| Covering indexes | ✓ | Common Extension | [Storing Columns documentation](create-index.html#store-columns) |
| Full-text indexes | Planned | Common Extension | [GitHub Issue tracking full-text index support](https://github.com/cockroachdb/cockroach/issues/7821) |
| Expression Indexes | Potential | Common Extension | Apply expressions (such as `LOWER()`) to values before indexing them |
| Geospatial indexes | Potential | Common Extension | Improves performance of queries calculating geospatial data |
| Hash indexes | ✗ | Common Extension | Improves performance of queries looking for single, exact values |
| Multiple indexes per query | ✗ | Common Extension | Use multiple indexes to filter the table's values for a single query |
| Partial indexes | ✗ | Common Extension | Only index specific rows |
| Prefix indexes | ✗ | Common Extension | Only index the beginning of a value instead of its entirety |

### Permissions

| Component | Supported | Type | Details |
|-----------|-----------|------|---------|
| Users | ✓ | Standard | [`GRANT` documentation](grant.html) |
| Priveleges | ✓ | Standard | [Privileges documentation](privileges.html) |

### Schema Changes

| Component | Supported | Type | Details |
|-----------|-----------|------|---------|
| `ALTER TABLE` | ✓ | Standard | [`ALTER TABLE documentation`](alter-table.html) |
| Database renames | ✓ | Standard | [`RENAME DATABASE documentation`](rename-database.html) |
| Table renames | ✓ | Standard | [`RENAME TABLE documentation`](rename-table.html) |
| Column renames | ✓ | Standard | [`RENAME COLUMN documentation`](rename-column.html) |
| Adding columns | ✓ | Standard | [`ALTER TABLE documentation`](alter-table.html) |
| Removing columns | ✓ | Standard | [`ALTER TABLE documentation`](alter-table.html) |
| Adding indexes | ✓ | Standard | [`CREATE INDEX documentation`](create-index.html) |
| Removing indexes | ✓ | Standard | [`DROP INDEX documentation`](drop-index.html) |

### Statements

| Component | Supported | Type | Details |
|-----------|-----------|------|---------|
| Common stamtents | ✓ | Standard | [SQL Statements documentation](sql-statements.html) |
| `UPSERT` | ✓ | Postgres, MSSQL Extension | [`UPSERT` documentation](upsert.html) |
| `EXPLAIN` | ✓ | Common Extension | [`EXPLAIN` documentation](explain.html) |
| `SELECT INTO` | ✗ | Common Extension | Move selected data into another table. |

### Clauses

| Component | Supported | Type | Details |
|-----------|-----------|------|---------|
| Common clauses | ✓ | Standard | [SQL Grammar documentation](sql-grammar.html)  |
| `LIMIT` | ✓ | Common Extension | Limit the number of rows a statement returns. |
| `LIMIT` with `OFFSET` | ✓ | Common Extension | Skip a number of rows, and then limit the size of the return set. |
| `RETURNING` | ✓ | Common Extension | Retrieve a table of rows statements affect. |
| Subqueries | Partial | Standard | Non-correlated subqueries are supported; correlated are not. |
| `EXISTS` | Partial | Standard | Non-correlated subqueries are supported; correlated are not. |
| `COLLATE` | Planned | Standard | Collations offer different modes of ASCII sorting. |


### Functions

| Component | Supported | Type | Details |
|-----------|-----------|------|---------|
| Common functions | ✓ | Standard | [Functions documentation](functions-and-operators.html#built-in-functions) |
| Common operators | ✓ | Standard | [Operators documentation](functions-and-operators.html#operators) |

### Conditional Expressions

| Component | Supported | Type | Details |
|-----------|-----------|------|---------|
| `CASE` | ✓ | Standard | Return values based on if/then cases. |
| `NULLIF` | ✓ | Standard | Return _NULL_ if values are equal. |
| `COALESCE` | ✓ | Standard | Return the first non-<em>NULL</em> column. |

### Miscellaneous

| Component | Supported | Type | Details |
|-----------|-----------|------|---------|
| Column families | ✓ | CockroachDB Extension | [Column Families documentation](https://www.cockroachlabs.com/docs/column-families.html) |
| Interleaved tables | ✓ | CockroachDB Extension | Increase performance by storing multiple tables' data in the same ranges |
| Views | Planned | Standard | A virtual table created by a statement. |
| Common Table Expressions | Planned | Common Extension | Similar to Views, though they are not stored. |
| Cursors | ✗ | Standard | Traverse a table's rows. |
| Triggers | ✗ | Standard | Execute a set of commands whenever a specified event occurs. |
| Stored Procedures | ✗ | Common Extension | Execute a procedure explicitly. |
| Window functions | ✗ | Common Extension | Perform calculations related to a selected row. |
| Sequences | ✗ | Common Extension | Create a numeric sequence. Given CockroachDB's distributed architecture, sequences are not viable. |
