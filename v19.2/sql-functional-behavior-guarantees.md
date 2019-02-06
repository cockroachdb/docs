---
title: SQL functional behavior guarantees
summary: Which part of SQL execution can be considered forward-compatible.
toc: true
---

This page details the various facets of CockroachDB's SQL dialect and
which [programmability and forward compatibility
guarantees](compatibility-and-programmability-guarantees.html) are
provided for each of them.

## Built-in functions

| Component                                                                                   | Status if feature documented on this site                                                    | Status if not documented on this site |
|---------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------|---------------------------------------|
| Built-in function exists both in CockroachDB and PostgreSQL, and behaves like in PostgreSQL | [public and programmable]                                                                    | [public and programmable]             |
| Built-in function exists both in CockroachDB and PostgreSQL, and behaves unlike PostgreSQL  | [public and programmable]                                                                    | [reserved]                            |
| Name of built-in function exists in namespace `crdb_internal`                               | [reserved]                                                                                   | [reserved]                            |
| Description of built-in function says function is “experimental”                            | [public and programmable] with  [“experimental” status](experimental-feature-lifecycle.html) | [reserved]                            |
| Description of built-in function says function is “for internal use”                        | [reserved]                                                                                   | [reserved]                            |
| Built-in function exists only in CockroachDB                                                | [public and programmable]                                                                    | [reserved]                            |
| Other built-in functions, other than above                                                  | [public and programmable]                                                                    | [reserved]                            |

For a list of supported built-in functions, see [Functions and Operators](functions-and-operators.html).

## Data manipulation language

Interface common to `SELECT`, `TABLE`, `VALUES`, `INSERT`, `UPDATE`, `DELETE`, `UPSERT`:

| Component                                                                                 | Status if feature documented on this site | Status if not documented on this site |
|-------------------------------------------------------------------------------------------|-------------------------------------------|---------------------------------------|
| SQL inputs, when query valid both in CockroachDB and PostgreSQL                           | [public and programmable]                 | [public and programmable]             |
| SQL inputs, when query valid only in CockroachDB                                          | [public and programmable]                 | [reserved]                            |
| Output row set (regardless of order), when query valid both in CockroachDB and PostgreSQL | [public and programmable]                 | [public and programmable]             |
| Output row set (regardless of order), when query valid only in CockroachDB                | [public and programmable]                 | [reserved]                            |
| Output row order, when query is ordered and valid both in CockroachDB and PostgreSQL      | [public and programmable]                 | [public and non-programmable]         |
| Output row count, when query valid both in CockroachDB and PostgreSQL                     | [public and programmable]                 | [public and non-programmable]         |
| Output row order, when query is ordered and valid only in CockroachDB                     | [public and programmable]                 | [reserved]                            |
| Output row count, when query valid only in CockroachDB                                    | [public and programmable]                 | [reserved]                            |
| Output row order, when query is not ordered                                               | [public and non-programmable]             | [reserved]                            |

For more details about row ordering, see [Ordering of Query Results](query-order.html).

## Data definition language

Interface common to DDL statements: `CREATE`, `DROP`, `ALTER`, `TRUNCATE` on database objects (databases, tables, views, sequences, etc.):

| Component                                                                                                                                | Status if feature documented on this site | Status if not documented on this site |
|------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------|---------------------------------------|
| SQL inputs, when query valid both in CockroachDB and PostgreSQL                                                                          | [public and programmable]                 | [public and programmable]             |
| SQL inputs, when query valid only in CockroachDB                                                                                         | [public and programmable]                 | [reserved]                            |
| Effect and isolation when ran as a standalone statement outside of BEGIN/COMMIT, when statement valid both in CockroachDB and PostgreSQL | [public and programmable]                 | [public and programmable]             |
| Effect and isolation when ran as a standalone statement outside of BEGIN/COMMIT, when statement valid only in CockroachDB                | [public and programmable]                 | [public and non-programmable]         |
| Effect and isolation when ran inside BEGIN/COMMIT                                                                                        | [public and programmable]                 | [public and non-programmable]         |
| Output row count                                                                                                                         | [reserved]                                | [reserved]                            |

## Privilege management

Interface common to `CREATE`/`DROP` for  `USER` or `ROLE`, `GRANT`, `REVOKE`:

| Component                                                       | Status if feature documented on this site | Status if not documented on this site |
|-----------------------------------------------------------------|-------------------------------------------|---------------------------------------|
| SQL inputs, when query valid both in CockroachDB and PostgreSQL | [public and programmable]                 | [public and programmable]             |
| SQL inputs, when query valid only in CockroachDB                | [public and programmable]                 | [reserved]                            |
| Effect and isolation                                            | [public and programmable]                 | [public and non-programmable]         |
| Output row count                                                | [public and programmable]                 | [reserved]                            |

## Bulk I/O statements

| Component                                    | Status if feature documented on this site | Status if not documented on this site |
|----------------------------------------------|-------------------------------------------|---------------------------------------|
| `BACKUP`/`EXPORT` SQL parameters and output  | [public and programmable]                 | [reserved]                            |
| `BACKUP` result data files                   | [reserved], see note 1 below              | [reserved], see note 1 below          |
| `EXPORT` result data files                   | [public and programmable]                 | [reserved]                            |
| `RESTORE`/`IMPORT` SQL parameters and output | [public and programmable]                 | [reserved]                            |
| `RESTORE` input data files                   | [reserved], see note 1 below              | [reserved], see note 1 below          |
| `IMPORT` input data files                    | [public and programmable]                 | [reserved]                            |

Note 1: the output format of `BACKUP` may change between revisions, but
the following guarantee is preserved: the database and table contents
that result from `RESTORE`ing a backup into another CockroachDB instance
will be stable in the same way as other public and programmable
interfaces.

## Other SQL statements or constructs

| Component                                                                      | Status if feature documented on this site                                                | Status if not documented on this site |
|--------------------------------------------------------------------------------|------------------------------------------------------------------------------------------|---------------------------------------|
| `EXPLAIN` inputs and outputs                                                   | [public and non-programmable]                                                            | [reserved]                            |
| `SHOW` inputs                                                                  | [public and programmable]                                                                | [reserved]                            |
| `SHOW` outputs                                                                 | [public and non-programmable]                                                            | [reserved]                            |
| `CANCEL`, `PAUSE`, `RESUME` inputs                                             | [public and programmable]                                                                | [reserved]                            |
| `CANCEL`, `PAUSE`, `RESUME` success/error status                               | [public and programmable]                                                                | [reserved]                            |
| `CANCEL`, `PAUSE`, `RESUME` outputs                                            | [public and non-programmable]                                                            | [reserved]                            |
| `SCRUB` inputs and outputs                                                     | [public and programmable] in [“experimental” phase](experimental-feature-lifecycle.html) | [reserved]                            |
| Tabular data produced by set-generating functions also supported in PostgreSQL | [public and programmable]                                                                | [public and programmable]             |
| Tabular data produced by set-generating functions specific to CockroachDB      | [public and programmable]                                                                | [reserved]                            |

## See also

- [Interface types](interface-types.html)
- [Compatibility and programmability guarantees](compatibility-and-programmability-guarantees.html)
- [Experimental feature lifecycle](experimental-feature-lifecycle.html)
- [Overview of APIs and interfaces](overview-of-apis-and-interfaces.html)

[public and programmable]: interface-types.html#public-and-programmable-interfaces
[public and non-programmable]: interface-types.html#public-and-non-programmable-interfaces
[reserved]: interface-types.html#reserved-interfaces
