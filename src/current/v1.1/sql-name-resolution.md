---
title: Name Resolution
summary: Table and function names can exist in multiple places. Resolution decides which one to use.
toc: true
---

A SQL client can have access to multiple databases side-by-side. The
same table name (e.g., `orders`) can exist in multiple
databases. When a query specifies a table name without a database
name (e.g., `SELECT * FROM orders`), how does CockroachDB know
which `orders` table is being considered?

This page details how CockroachDB performs **name resolution** to answer
this question.


## Overview

The following **name resolution algorithm** is used both to determine
table names in [table expressions](table-expressions.html) and
function names in [value expressions](sql-expressions.html):

- If the name is *qualified* (i.e., the name already tells where to look), use this information.
  For example, `SELECT * FROM db1.orders` will look up "`orders`" only in `db1`.
- If the name is *unqualified*:
  - Try to find the name in the "default database" as set by [`SET DATABASE`](set-vars.html).
  - Try to find the name using the [search path](#search-path).
  - If the name is not found, produce an error.

## Search Path

In addition to the default database configurable via [`SET DATABASE`](set-vars.html), unqualified names are also looked up in the current session's *search path*.

The search path is a session variable containing a list of databases,
or *namespaces*, where names are looked up.

The current search path can set using `SET SEARCH_PATH` and can be inspected using [`SHOW SEARCH_PATH` or `SHOW ALL`](show-vars.html).

By default, the search path for new columns includes just
`pg_catalog`, so that queries can use PostgreSQL compatibility
functions and virtual tables in that namespace without the need to
prefix them with "`pg_catalog.`" every time.

## See Also

- [`SET`](set-vars.html)
- [`SHOW`](show-vars.html)
