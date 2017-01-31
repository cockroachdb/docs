---
title: Name Resolution
summary: Table and function names can exist in multiple places. Resolution decides which one to use.
toc: false
---

Table and function names can exist in multiple places. Resolution decides which one to use.

<div id="toc"></div>

## Overview

A SQL client can have access to multiple databases side-by-side. The
same table name, for example, `orders`, can exist in multiple
databases. When a query specifies a table name without a database
name, for example, `select * from orders`, how does CockroachDB know
which `orders` table is being considered?

The answer to this question is defined by the name resolution algorithm:

- If the given name already tells where to look explicitly, i.e. it is *qualified*, then just use this information.
- Otherwise, i.e. the name is *unqualified*:
  - Try to find the name in the "default database" as set by [`SET DATABASE`](set-database.html).
  - Try to find the name using the [search path](#search-path).
   - If the name was not found so far, produce an error.

This algorithm is followed both to look up tables in
[table expressions](table-expressions.html) and functions in
[value expressions](sql-expressions.html).

## Search path

In addition to the default database configurable via [`SET DATABASE`](set-database.html),
unqualified names are also looked up in the current session's *search path*.

The search path is a session variable containing a list of databases
or *name spaces* where names are looked up.

The current search path can be inspected using the statement `SHOW
SEARCH_PATH`, or `SHOW ALL`.

Every new session has a search path initialized to a single item:
`pg_catalog`, so that queries can use PostgreSQL compatibility
functions and virtual tables in that namespace without the need to
prefix them with "`pg_catalog.`" every time.
