---
title: Data Definition
toc: true
---

## Identifiers

When naming a database, table, column, or other object, the identifier you use must follow these rules:

- Must begin with a letter (a-z, but also letters with diacritical marks and non-Latin letters) or an underscore (_). Subsequent characters can be letters, underscores, digits (0-9), or dollar signs ($).
- Must not be a [reserved keyword](sql-grammar.html#reserved_keyword). This rule does not apply to column names.
- Must be unique within its context. For example, you cannot have two identically-named databases in a cluster or two identically-named columns in a single table. 

To bypass either of the first two rules, simply surround the identifier with double-quotes.

## Default Values

Coming soon.

## Constraints

Coming soon.

## Indexes

For index-related SQL statements, see [`CREATE INDEX`](create-index.html), [`DROP INDEX`](drop-index.html), [`RENAME INDEX`](rename-index.html), and [`SHOW INDEX`](show-index.html). To understand how CockroachDB chooses the best index for running a query, see [Index Selection in CockroachDB](https://www.cockroachlabs.com/blog/index-selection-cockroachdb-2/).

More docs on indexes coming soon.