---
title: Name Resolution
summary: Table and function names can exist in multiple places. Resolution decides which one to use.
toc: false
---

A SQL client can have access to multiple databases side-by-side. The
same table name, e.g. `orders`, can exist in multiple
databases. When a query specifies a table name without a database
name, for example, `select * from orders`, how does CockroachDB know
which `orders` table is being considered?

This page details how CockroachDB performs *name resolution* to answer
this question.

<div id="toc"></div>

## Overview

The following *name resolution algorithm* is used both to determine
table names in [table expressions](table-expressions.html) and
function names in [value expressions](sql-expressions.html):

- If the given name already tells where to look explicitly, i.e. it is *qualified*, then just use this information.
- Otherwise, i.e. the name is *unqualified*:
  - Try to find the name in the "default database" as set by [`SET DATABASE`](set-database.html).
  - Try to find the name using the [search path](#search-path).
   - If the name was not found so far, produce an error.

## Search path

In addition to the default database configurable via [`SET DATABASE`](set-database.html),
unqualified names are also looked up in the current session's *search path*.

The search path is a session variable containing a list of databases,
or *name spaces*, where names are looked up.

The current search path can be inspected using the statement `SHOW
SEARCH_PATH`, or `SHOW ALL`.

Every new session has a search path initialized to a single item:
`pg_catalog`, so that queries can use PostgreSQL compatibility
functions and virtual tables in that namespace without the need to
prefix them with "`pg_catalog.`" every time.
