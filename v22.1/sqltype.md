---
title: SQLType
summary: The SQLType represents the type of a SQL statement.
toc: true
docs_area: reference.sql
---

The `SQLType` [data type](data-types.html) represents the type of a SQL statement. The values are `TypeDDL`, `TypeDML`, `TypeDCL`, and `TypeTCL`.

These types map to the CockroachDB statement types [data definition language (DDL)](sql-statements.html#data-definition-statements), [data manipulation language (DML)](sql-statements.html#data-manipulation-statements), [data control language (DCL)](sql-statements.html#data-control-statements), and [transaction control language (TCL)](sql-statements.html#transaction-control-statements).

The statement statistics collected by CockroachDB include information about the statement type: the [`crdb_internal.statement_statistics` `stmtTyp` table column](crdb-internal.html#metadata-column) is of type `SQLType` and the [Cloud Console Statement](../cockroachcloud/statements-page.html#filter) and [DB Console Statement](ui-statements-page.html#filter) pages allow you to filter statements by statement type.

## See also

- [Data Types](data-types.html)
