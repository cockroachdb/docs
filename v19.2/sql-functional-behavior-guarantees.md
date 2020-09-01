---
title: SQL Interface Stability Guarantees
summary: Which part of SQL execution can be considered forward-compatible.
toc: true
---

This page includes the [programmability and forward compatibility guarantees](compatibility-and-programmability-guarantees.html) for CockroachDB's SQL interface, including [built-in functions](functions-and-operators.html) and the [standard SQL statements](sql-statements.html).

## Built-in functions

| Function description                                                                                   | Interface type (if documented)                                                    | Interface type (if not documented) |
|---------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------|---------------------------------------|
| Supported in PostgreSQL and CockroachDB, with PostgreSQL-like behavior. | [Programmable]                                                                    | [Programmable]             |
| Supported in PostgreSQL and CockroachDB, with behavior unlike PostgreSQL. | [Programmable]                                                                    | [Reserved]                            |
| Supported only in CockroachDB.                                                | [Programmable]                                                                    | [Reserved]                            |
| Name exists in namespace `crdb_internal`.                               | [Reserved]                                                                                   | [Reserved]                            |
| [Function help](use-the-built-in-sql-client.html#help) labels function as “experimental”.                            | [Programmable] with  [“experimental” status](experimental-feature-lifecycle.html) | [Reserved]                            |
| [Function help](use-the-built-in-sql-client.html#help) labels function as “for internal use”.                        | [Reserved]                                                                                   | [Reserved]                            |
| Other                                                  | [Programmable]                                                                    | [Reserved]                            |

For a list of supported built-in functions, see [Functions and Operators](functions-and-operators.html).

## Data manipulation language

<!-- [`DELETE`](delete.html), [`EXPORT`](export.html), [`IMPORT`](import.html), [`INSERT`](insert.html), [`SELECT`](select-clause.html), [`TABLE`](selection-queries.html#table-clause), [`TRUNCATE`](truncate.html), [`UPDATE`](update.html), [`UPSERT`](upsert.html), and [`VALUES`](selection-queries.html#values-clause)-->

[DML statements](sql-statements.html#data-manipulation-statements):

| Description                                                                                 | Interface type (if documented) | Interface type (if not documented) |
|-------------------------------------------------------------------------------------------|-------------------------------------------|---------------------------------------|
| SQL inputs, when query is valid in CockroachDB and PostgreSQL                           | [Programmable]                 | [Programmable]             |
| SQL inputs, when query is valid only in CockroachDB                                          | [Programmable]                 | [Reserved]                            |
| Output row set, regardless of order, when query is valid in CockroachDB and PostgreSQL | [Programmable]                 | [Programmable]             |
| Output row set, regardless of order, when query is valid only in CockroachDB                | [Programmable]                 | [Reserved]                            |
| Output row order, when query is ordered and valid in CockroachDB and PostgreSQL      | [Programmable]                 | [Non-programmable]         |
| Output row order, when query is ordered and valid only in CockroachDB                     | [Programmable]                 | [Reserved]                            |
| Output row order, when query is not ordered                                               | [Non-programmable]             | [Reserved]
| Output row count, when query is valid in CockroachDB and PostgreSQL                     | [Programmable]                 | [Non-programmable]         |
| Output row count, when query is valid only in CockroachDB                                    | [Programmable]                 | [Reserved]                            |
                           |

For more details about row ordering, see [Ordering of Query Results](query-order.html).

## Data definition language

[DDL statements](sql-statements.html#data-definition-statements) on database objects (e.g., databases, tables, views, and sequences):

| Description                                                                                                                                | Interface type (if documented) | Interface type (if not documented) |
|------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------|---------------------------------------|
| SQL inputs, when query is valid in CockroachDB and PostgreSQL                                                                          | [Programmable]                 | [Programmable]             |
| SQL inputs, when query is valid only in CockroachDB                                                                                         | [Programmable]                 | [Reserved]                            |
| Effect and isolation when ran as a standalone statement outside of [`BEGIN`](begin-transaction.html)/[`COMMIT`](commit-transaction.html), and statement is valid in CockroachDB and PostgreSQL | [Programmable]                 | [Programmable]             |
| Effect and isolation when ran as a standalone statement outside of `BEGIN`/`COMMIT`, and statement is valid only in CockroachDB                | [Programmable]                 | [Non-programmable]         |
| Effect and isolation when ran inside `BEGIN`/`COMMIT`                                                                                        | [Programmable]                 | [Non-programmable]         |
| Output row count                                                                                                                         | [Reserved]                                | [Reserved]                            |

## Access management

[Access management statements](sql-statements.html#access-management-statements):

| Description                                                       | Interface type (if documented) | Interface type (if not documented) |
|-----------------------------------------------------------------|-------------------------------------------|---------------------------------------|
| SQL inputs, when query is valid in CockroachDB and PostgreSQL | [Programmable]                 | [Programmable]             |
| SQL inputs, when query is valid only in CockroachDB                | [Programmable]                 | [Reserved]                            |
| Effect and isolation                                            | [Programmable]                 | [Non-programmable]         |
| Output row count                                                | [Programmable]                 | [Reserved]                            |

## Bulk I/O statements

| Description                                  | Interface type (if documented) | Interface type (if not documented) |
|----------------------------------------------|-------------------------------------------|---------------------------------------|
| [`BACKUP`](backup.html)/[`EXPORT`](export.html) SQL parameters and output  | [Programmable]                 | [Reserved]                            |
| `BACKUP` result data files                   | [Reserved]<br>See [note below](#backup-restore-note).             | [Reserved]<br>See [note below](#backup-restore-note).          |
| `EXPORT` result data files                   | [Programmable]                 | [Reserved]                            |
| [`RESTORE`](restore.html)/[`IMPORT`](import.html) SQL parameters and output | [Programmable]                 | [Reserved]                            |
| `RESTORE` input data files                   | [Reserved]<br>See [note below](#backup-restore-note).              | [Reserved]<br>See [note below](#backup-restore-note).         |
| `IMPORT` input data files                    | [Programmable]                 | [Reserved]                            |


<a name="backup-restore-note"></a>


{{site.data.alerts.callout_info}}
The output format of [`BACKUP`](backup.html) may change across revisions. [`RESTORE`](restore.html) retains Programmable stability guarantees across revisions when used to load database and table contents from a backup into another CockroachDB instance.
{{site.data.alerts.end}}

## Other SQL statements or constructs

| Description                                  | Interface type (if documented) | Interface type (if not documented) |
|--------------------------------------------------------------------------------|------------------------------------------------------------------------------------------|---------------------------------------|
| [`EXPLAIN`](explain.html) inputs and outputs                                                   | [Non-programmable]                                                            | [Reserved]                            |
| [`SHOW`](show-vars.html) inputs                                                                  | [Programmable]                                                                | [Reserved]                            |
| `SHOW` outputs                                                                 | [Non-programmable]                                                            | [Reserved]                            |
| [`CANCEL`](cancel-job.html), [`PAUSE`](pause-job.html), [`RESUME`](resume-job.html) inputs                                             | [Programmable]                                                                | [Reserved]                            |
| `CANCEL`, `PAUSE`, `RESUME` success/error status                               | [Programmable]                                                                | [Reserved]                            |
| `CANCEL`, `PAUSE`, `RESUME` outputs                                            | [Non-programmable]                                                            | [Reserved]                            |
| [`SCRUB`](experimental-features.html#check-for-constraint-violations-with-scrub) inputs and outputs                                                     | [Programmable] in [“experimental” phase](experimental-feature-lifecycle.html) | [Reserved]                            |
| Tabular data produced by set-generating functions supported in PostgreSQL and CockroachDB | [Programmable]                                                                | [Programmable]             |
| Tabular data produced by set-generating functions supported only in CockroachDB      | [Programmable]                                                                | [Reserved]                            |

## Time and memory cost model

The following table uses [big-O notation](https://en.wikipedia.org/wiki/Big_O_notation) to indicate
the expected performance class of various SQL relational operators.

The variables are:

- **n**  number of rows processed,
- **r** number of data ranges accessed,
- **p** number of logical processors performing the computation during execution,
- **g**  number of aggregation groups,
- **m** for the max data size of rows,
- **N** for n x m,
- **k** for the max data size of key, aggregation or sort columns,
- **K** for n x k,

| Operation                                             | Time complexity | Space complexity | Status                      |
|-------------------------------------------------------|-----------------|------------------|-----------------------------|
| Point lookups in tables or indexes                    | O(1)            | O(m x p=r)       | [Non-programmable] |
| Range scans in tables or indexes                      | O(K/p=r)        | O(m x p=r)       | [Non-programmable] |
| Ordered inner joins                                   | O(K/p)          | O(N)             | [Non-programmable] |
| Outer joins                                           | O(K/p+K)        | O(Np)            | [Non-programmable] |
| Sorts                                                 | O(K/p log K/p)  | O(N)             | [Non-programmable] |
| Non-expanding aggregations<br>See [note below](#aggregation-note).       | O(K/p)          | O(kg)            | [Non-programmable] |
| Expanding aggregations<br>See [note below](#aggregation-note).             | O(K/p)          | O(K)             | [Non-programmable] |
| Access to virtual tables or set-generating functions | O(N)            | O(1)             | [Non-programmable] |
| Sequence access or increment                          | O(1)            | O(1)             | [Non-programmable] |
| Window function application                           | O(N^2)          | O(N)             | [Non-programmable] |


<a name="aggregation-note"></a>


{{site.data.alerts.callout_info}}
Aggregations operators like `array_agg` produce results with a size proportional to the sum of the size of the inputs.
This can cause large memory usage during an aggregation if applied to a large number of inputs.
{{site.data.alerts.end}}

## See also

- [Interface types](interface-types.html)
- [Compatibility and programmability guarantees](compatibility-and-programmability-guarantees.html)
- [Experimental feature lifecycle](experimental-feature-lifecycle.html)
- [Overview of APIs and interfaces](overview-of-apis-and-interfaces.html)

[Programmable]: interface-types.html#programmable-interfaces
[Non-programmable]: interface-types.html#non-programmable-interfaces
[Reserved]: interface-types.html#reserved-interfaces
