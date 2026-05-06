---
title: SQL Feature Support in CockroachDB
summary: Summary of CockroachDB's conformance to the SQL standard and which common extensions it supports.
toc: true
keywords: gin, gin index, gin indexes, inverted index, inverted indexes, accelerated index, accelerated indexes
docs_area: reference.sql
---

CockroachDB {{ page.version.version }} supports the following standard SQL features and common extensions.

- **Component** lists the components that are commonly considered part of SQL.
- **Supported** shows CockroachDB's level of support for the component.
- **Type** indicates whether the component is part of the SQL *Standard* or is an *Extension* created by Cockroach Labs or others.
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
`ARRAY` | ✓ | Standard | [`ARRAY` documentation]({% link {{ page.version.version }}/array.md %})
`AUTO INCREMENT`<br>(Automatic key generation) | Alternative | Common Extension | [Automatic key generation FAQ]({% link {{ page.version.version }}/sql-faqs.md %}#how-do-i-auto-generate-unique-row-ids-in-cockroachdb)
`BIT` | ✓ | Standard | [`BIT` documentation]({% link {{ page.version.version }}/bit.md %})
`BOOLEAN` | ✓ | Standard | [`BOOL` documentation]({% link {{ page.version.version }}/bool.md %})
`BYTES` | ✓ | CockroachDB Extension | [`BYTES` documentation]({% link {{ page.version.version }}/bytes.md %})
`COLLATE` | ✓ | Standard | [`COLLATE` documentation]({% link {{ page.version.version }}/collate.md %})
`DATE` | ✓ | Standard | [`DATE` documentation]({% link {{ page.version.version }}/date.md %})
`DECIMAL`, `NUMERIC` | ✓ | Standard | [`DECIMAL` documentation]({% link {{ page.version.version }}/decimal.md %})
`ENUM` | ✓ | PostgreSQL Extension |  [`ENUM` documentation]({% link {{ page.version.version }}/enum.md %})
`FLOAT`, `REAL` | ✓ | Standard | [`FLOAT` documentation]({% link {{ page.version.version }}/float.md %})
`INET` | ✓ | PostgreSQL Extension | [`INET` documentation]({% link {{ page.version.version }}/inet.md %})
`INT` | ✓ | Standard | [`INT` documentation]({% link {{ page.version.version }}/int.md %})
`INTERVAL` | ✓ | Standard | [`INTERVAL` documentation]({% link {{ page.version.version }}/interval.md %})
`JSON`/`JSONB` | ✓ | Common Extension | [`JSONB` documentation]({% link {{ page.version.version }}/jsonb.md %})
`NULL` | ✓ | Standard | [`NULL`-handling documentation]({% link {{ page.version.version }}/null-handling.md %})
`OID` | ✓ | PostgreSQL Extension | [`OID` documentation]({% link {{ page.version.version }}/oid.md %})
`SERIAL`| ✓ | PostgreSQL Extension | [`SERIAL` documentation]({% link {{ page.version.version }}/serial.md %})
`SET`| ✗ | MySQL| Only allow rows to contain values from a defined set of terms.
`STRING`, `CHARACTER` | ✓ | Standard | [`STRING` documentation]({% link {{ page.version.version }}/string.md %})
`TIME` | ✓ | Standard | [`TIME` documentation]({% link {{ page.version.version }}/time.md %})
`TIMESTAMP`/`TIMESTAMPTZ` | ✓ | Standard | [`TIMESTAMP` documentation]({% link {{ page.version.version }}/timestamp.md %})
`TSQUERY` | ✓ | Standard | [`TSQUERY` documentation]({% link {{ page.version.version }}/tsquery.md %})
`TSVECTOR` | ✓ | Standard | [`TSVECTOR` documentation]({% link {{ page.version.version }}/tsvector.md %})
`UNSIGNED INT` | ✗ | Common Extension | `UNSIGNED INT` causes numerous casting issues, so we do not plan to support it.
`UUID` | ✓ | PostgreSQL Extension | [`UUID` documentation]({% link {{ page.version.version }}/uuid.md %})
Identifiers | ✓ | Standard | [Identifiers documentation]({% link {{ page.version.version }}/keywords-and-identifiers.md %}#identifiers).  See also [SQL Name Resolution]({% link {{ page.version.version }}/sql-name-resolution.md %}).
Key-value pairs | Alternative | Extension | [Key-Value FAQ]({% link {{ page.version.version }}/sql-faqs.md %}#can-i-use-cockroachdb-as-a-key-value-store)
XML | ✗ | Standard | XML data can be stored as `BYTES`, but we do not offer XML parsing.

### Constraints

 Component | Supported | Type | Details
-----------|-----------|------|---------
 Not Null | ✓ | Standard | [Not Null documentation]({% link {{ page.version.version }}/not-null.md %})
 Unique | ✓ | Standard | [Unique documentation]({% link {{ page.version.version }}/unique.md %})
 Primary Key | ✓ | Standard | [Primary Key documentation]({% link {{ page.version.version }}/primary-key.md %})
 Check | ✓ | Standard | [Check documentation]({% link {{ page.version.version }}/check.md %})
 Foreign Key | ✓ | Standard | [Foreign Key documentation]({% link {{ page.version.version }}/foreign-key.md %})
 Default Value | ✓ | Standard | [Default Value documentation]({% link {{ page.version.version }}/default-value.md %})

### Transactions

 Component | Supported | Type | Details
-----------|-----------|------|---------
 Transactions (ACID semantics) | ✓ | Standard | [Transactions documentation]({% link {{ page.version.version }}/transactions.md %})
 `BEGIN` | ✓ | Standard | [`BEGIN` documentation]({% link {{ page.version.version }}/begin-transaction.md %})
 `COMMIT` | ✓ | Standard | [`COMMIT` documentation]({% link {{ page.version.version }}/commit-transaction.md %})
 `ROLLBACK` | ✓ | Standard | [`ROLLBACK` documentation]({% link {{ page.version.version }}/rollback-transaction.md %})
 `SAVEPOINT` | ✓ | Standard with CockroachDB extensions |  CockroachDB supports nested transactions using [`SAVEPOINT`]({% link {{ page.version.version }}/savepoint.md %})

### Indexes

 Component | Supported | Type | Details
-----------|-----------|------|---------
 Indexes | ✓ | Common Extension | [Indexes documentation]({% link {{ page.version.version }}/indexes.md %})
 Multi-column indexes | ✓ | Common Extension | We do not limit on the number of columns indexes can include
 Covering indexes | ✓ | Common Extension | [Storing Columns documentation]({% link {{ page.version.version }}/create-index.md %}#store-columns)
 GIN indexes | ✓ | Common Extension | [GIN indexes documentation]({% link {{ page.version.version }}/inverted-indexes.md %})
 Trigram indexes | ✓ | PostgreSQL Extension | [Trigram indexes documentation]({% link {{ page.version.version }}/trigram-indexes.md %})
 Partial indexes | ✓ | Common Extension | [Partial indexes documentation]({% link {{ page.version.version }}/partial-indexes.md %})
 Spatial indexes | ✓ | Common Extension | [Spatial indexes documentation]({% link {{ page.version.version }}/spatial-indexes.md %})
 Multiple indexes per query | Partial | Common Extension | [Index selection]({% link {{ page.version.version }}/indexes.md %}#selection)
 Full-text indexes | ✓ | Common Extension | [Full-text search documentation]({% link {{ page.version.version }}/full-text-search.md %})
 Expression indexes | ✓ | Common Extension | [Expression indexes]({% link {{ page.version.version }}/expression-indexes.md %})
 Prefix indexes | ✗ | Common Extension | Implement using [Expression indexes]({% link {{ page.version.version }}/expression-indexes.md %})
 Hash indexes | ✗ | Common Extension | Improves performance of queries looking for single, exact values
 Hash-sharded indexes | ✓ | CockroachDB Extension | [Hash-sharded Indexes documentation]({% link {{ page.version.version }}/hash-sharded-indexes.md %})

### Schema changes

 Component | Supported | Type | Details
-----------|-----------|------|---------
 `ALTER TABLE` | ✓ | Standard | [`ALTER TABLE` documentation]({% link {{ page.version.version }}/alter-table.md %})
 Database renames | ✓ | Standard | [`ALTER DATABASE ... RENAME TO` documentation]({% link {{ page.version.version }}/alter-database.md %}#rename-to)
 Table renames | ✓ | Standard | [`ALTER TABLE ... RENAME TO` documentation]({% link {{ page.version.version }}/alter-table.md %}#rename-to)
 Column renames | ✓ | Standard | [`RENAME COLUMN` documentation]({% link {{ page.version.version }}/alter-table.md %}#rename-column)
 Altering a column's data type | ✓ | Standard |  [`ALTER COLUMN` documentation]({% link {{ page.version.version }}/alter-table.md %}#alter-column-data-types)
 Adding columns | ✓ | Standard | [`ADD COLUMN` documentation]({% link {{ page.version.version }}/alter-table.md %}#add-column)
 Removing columns | ✓ | Standard | [`DROP COLUMN` documentation]({% link {{ page.version.version }}/alter-table.md %}#drop-column)
 Adding constraints | ✓ | Standard | [`ADD CONSTRAINT` documentation]({% link {{ page.version.version }}/alter-table.md %}#add-constraint)
 Removing constraints | ✓ | Standard | [`DROP CONSTRAINT` documentation]({% link {{ page.version.version }}/alter-table.md %}#drop-constraint)
 Index renames | ✓ | Standard | [`ALTER INDEX ... RENAME TO` documentation]({% link {{ page.version.version }}/alter-index.md %}#rename-to)
 Adding indexes | ✓ | Standard | [`CREATE INDEX` documentation]({% link {{ page.version.version }}/create-index.md %})
 Removing indexes | ✓ | Standard | [`DROP INDEX` documentation]({% link {{ page.version.version }}/drop-index.md %})
 Altering a primary key | ✓ | Standard | [`ALTER PRIMARY KEY` documentation]({% link {{ page.version.version }}/alter-table.md %}#alter-primary-key)
 Adding user-defined schemas | ✓ | Standard |  [`CREATE SCHEMA` documentation]({% link {{ page.version.version }}/create-schema.md %})
 Removing user-defined schemas | ✓ | Standard |  [`DROP SCHEMA` documentation]({% link {{ page.version.version }}/drop-schema.md %})
 Altering user-defined schemas | ✓ | Standard |  [`ALTER SCHEMA` documentation]({% link {{ page.version.version }}/create-schema.md %})

### Statements

 Component | Supported | Type | Details
-----------|-----------|------|---------
 Common statements | ✓ | Standard, PostgreSQL/CockroachDB Extension | [SQL Statements documentation]({% link {{ page.version.version }}/sql-statements.md %})
 `UPSERT` | ✓ | PostgreSQL, MSSQL Extension | [`UPSERT` documentation]({% link {{ page.version.version }}/upsert.md %})
 `EXPLAIN` | ✓ | Common Extension | [`EXPLAIN` documentation]({% link {{ page.version.version }}/explain.md %})
 `SELECT ... INTO` | ✓ | Common Extension | [PL/pgSQL documentation]({% link {{ page.version.version }}/plpgsql.md %}#declare-a-variable).
 `SELECT FOR UPDATE` | ✓ | Common Extension |  [`SELECT FOR UPDATE` documentation]({% link {{ page.version.version }}/select-for-update.md %})

### Clauses

 Component | Supported | Type | Details
-----------|-----------|------|---------
 Common clauses | ✓ | Standard | [SQL Grammar documentation]({% link {{ page.version.version }}/sql-grammar.md %})
 `LIMIT` | ✓ | Common Extension | Limit the number of rows a statement returns. For more information, see [Limit Query Results]({% link {{ page.version.version }}/limit-offset.md %}).
 `LIMIT` with `OFFSET` | ✓ | Common Extension | Skip a number of rows, and then limit the size of the return set. For more information, see [Limit Query Results]({% link {{ page.version.version }}/limit-offset.md %}).
 `RETURNING` | ✓ | Common Extension | Retrieve a table of rows statements affect. For examples, see the [`INSERT`]({% link {{ page.version.version }}/insert.md %}) and [`DELETE`]({% link {{ page.version.version }}/delete.md %}) documentation.

### Table expressions

 Component | Supported | Type | Details
-----------|-----------|------|---------
 Table and View references | ✓ | Standard | [Table expressions documentation]({% link {{ page.version.version }}/table-expressions.md %}#table-and-view-names)
 `AS` in table expressions | ✓ | Standard | [Aliased table expressions documentation]({% link {{ page.version.version }}/table-expressions.md %}#aliased-table-expressions)
 `JOIN` (`INNER`, `LEFT`, `RIGHT`, `FULL`, `CROSS`) | ✓ | Standard | [`JOIN` expressions documentation]({% link {{ page.version.version }}/table-expressions.md %}#join-expressions)
 Sub-queries as table expressions | Partial | Standard | Non-correlated subqueries are [supported]({% link {{ page.version.version }}/table-expressions.md %}#use-a-subquery), as are most [correlated subqueries]({% link {{ page.version.version }}/subqueries.md %}#correlated-subqueries).
 Table generator functions | Partial | PostgreSQL Extension | [Table generator functions documentation]({% link {{ page.version.version }}/table-expressions.md %}#table-generator-functions)
 `WITH ORDINALITY` | ✓ | CockroachDB Extension | [Ordinality annotation documentation]({% link {{ page.version.version }}/table-expressions.md %}#ordinality-annotation)

### Scalar expressions and Boolean formulas

 Component | Supported | Type | Details
-----------|-----------|------|---------
 Common functions | ✓ | Standard | [Functions calls and SQL special forms documentation]({% link {{ page.version.version }}/scalar-expressions.md %}#function-calls-and-sql-special-forms)
 Common operators | ✓ | Standard | [Operators documentation]({% link {{ page.version.version }}/scalar-expressions.md %}#unary-and-binary-operations)
 `IF`/`CASE`/`NULLIF` | ✓ | Standard | [Conditional expressions documentation]({% link {{ page.version.version }}/scalar-expressions.md %}#conditional-expressions)
 `COALESCE`/`IFNULL` | ✓ | Standard | [Conditional expressions documentation]({% link {{ page.version.version }}/scalar-expressions.md %}#conditional-expressions)
`AND`/`OR` | ✓ | Standard | [Conditional expressions documentation]({% link {{ page.version.version }}/scalar-expressions.md %}#conditional-expressions)
 `LIKE`/`ILIKE`  | ✓ | Standard | [String pattern matching documentation]({% link {{ page.version.version }}/scalar-expressions.md %}#string-pattern-matching)
 `SIMILAR TO` | ✓ | Standard | [SQL regexp pattern matching documentation]({% link {{ page.version.version }}/scalar-expressions.md %}#string-matching-using-sql-regular-expressions)
 Matching using POSIX regular expressions  | ✓ | Common Extension | [POSIX regexp pattern matching documentation]({% link {{ page.version.version }}/scalar-expressions.md %}#string-matching-using-posix-regular-expressions)
 `EXISTS` | Partial | Standard | Non-correlated subqueries are [supported]({% link {{ page.version.version }}/scalar-expressions.md %}#existence-test-on-the-result-of-subqueries), as are most [correlated subqueries]({% link {{ page.version.version }}/subqueries.md %}#correlated-subqueries). Works only with small data sets.
 Scalar subqueries | Partial | Standard | Non-correlated subqueries are [supported]({% link {{ page.version.version }}/scalar-expressions.md %}#scalar-subqueries), as are most [correlated subqueries]({% link {{ page.version.version }}/subqueries.md %}#correlated-subqueries). Works only with small data sets.
 Bitwise arithmetic | ✓ | Common Extension | [Operators documentation]({% link {{ page.version.version }}/scalar-expressions.md %}#unary-and-binary-operations)
 Array constructors and subscripting | Partial | PostgreSQL Extension | Array expression documentation: [Constructor syntax]({% link {{ page.version.version }}/scalar-expressions.md %}#array-constructors) and [Subscripting]({% link {{ page.version.version }}/scalar-expressions.md %}#subscripted-expressions)
 `COLLATE`| ✓ | Standard | [Collation expressions documentation]({% link {{ page.version.version }}/scalar-expressions.md %}#collation-expressions)
 Column ordinal references | ✓ | CockroachDB Extension | [Column references documentation]({% link {{ page.version.version }}/scalar-expressions.md %}#column-references)
 Type annotations | ✓ | CockroachDB Extension | [Type annotations documentation]({% link {{ page.version.version }}/scalar-expressions.md %}#explicitly-typed-expressions)

### Permissions

 Component | Supported | Type | Details
-----------|-----------|------|---------
 Users | ✓ | Standard | [Users documentation]({% link {{ page.version.version }}/security-reference/authorization.md %}#sql-users)
 Roles | ✓ | Standard | [Roles documentation]({% link {{ page.version.version }}/security-reference/authorization.md %}#roles)
 Object ownership | ✓ | Common Extension | [Ownership documentation]({% link {{ page.version.version }}/security-reference/authorization.md %}#object-ownership)
 Privileges | ✓ | Standard | [Privileges documentation]({% link {{ page.version.version }}/security-reference/authorization.md %}#managing-privileges)
 Default privileges | ✓ | PostgreSQL Extension | [Default privileges documentation]({% link {{ page.version.version }}/security-reference/authorization.md %}#default-privileges)

### Miscellaneous

 Component | Supported | Type | Details
-----------|-----------|------|---------
 Column families | ✓ | CockroachDB Extension | [Column Families documentation]({% link {{ page.version.version }}/column-families.md %})
 Computed columns (stored and virtual) | ✓ | Common Extension | [Computed Columns documentation]({% link {{ page.version.version }}/computed-columns.md %})
 `ON UPDATE` expressions | ✓ | MySQL Extension | [`ON UPDATE` expressions documentation]({% link {{ page.version.version }}/create-table.md %}#on-update-expressions)
 Multi-region capabilities | ✓ | CockroachDB Extension | [Multi-region documentation]({% link {{ page.version.version }}/multiregion-overview.md %})
 System catalog schemas | ✓ | Standard, PostgreSQL/CockroachDB Extension | [`crdb_internal`]({% link {{ page.version.version }}/crdb-internal.md %}) (CockroachDB Extension)<br>[`information_schema`]({% link {{ page.version.version }}/information-schema.md %}) (Standard)<br>[`pg_catalog`]({% link {{ page.version.version }}/pg-catalog.md %}) (PostgreSQL Extension)<br>[`pg_extension`]({% link {{ page.version.version }}/pg-extension.md %}) (PostgreSQL Extension)
 Sequences |  ✓ | Common Extension | [`CREATE SEQUENCE` documentation]({% link {{ page.version.version }}/create-sequence.md %})
 Identity columns | ✓ | Common Extension | [Identity columns documentation]({% link {{ page.version.version }}/create-table.md %}#identity-columns)
 Views | ✓ | Standard | [Views documentation]({% link {{ page.version.version }}/views.md %})
 Materialized views | ✓ | Common Extension |  [Materialized views documentation]({% link {{ page.version.version }}/views.md %}#materialized-views)
 Window functions | ✓ | Standard | [Window Functions documentation]({% link {{ page.version.version }}/window-functions.md %})
 Common table expressions | Partial | Common Extension | [Common Table Expressions documentation]({% link {{ page.version.version }}/common-table-expressions.md %})
 Stored procedures | Partial | Common Extension | [Stored procedures documentation]({% link {{ page.version.version }}/stored-procedures.md %})
 Cursors | Partial | Standard | [Cursors documentation]({% link {{ page.version.version }}/cursors.md %})
 Triggers | Partial | Standard | [Triggers documentation]({% link {{ page.version.version }}/triggers.md %})
 Row-level TTL | ✓ | Common Extension | Automatically delete expired rows.  For more information, see [Batch-delete expired data with Row-Level TTL]({% link {{ page.version.version }}/row-level-ttl.md %}).
 User-defined functions | Partial | Standard | [User-Defined Functions documentation]({% link {{ page.version.version }}/user-defined-functions.md %})
 `CREATE EXTENSION "uuid-ossp"` | ✓ | Common Extension | Provides access to several additional [UUID generation functions]({% link {{ page.version.version }}/functions-and-operators.md %}#id-generation-functions). Note that these UUID functions are available without typing `CREATE EXTENSION "uuid-ossp"`. CockroachDB does not have full support for `CREATE EXTENSION`. .
