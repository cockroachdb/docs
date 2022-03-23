---
title: Performance Features Overview
summary: Describes the features CockroachDB provides to improve query performance.
toc: false
docs_area: develop
---

CockroachDB provides many features to improve query performance.

[Indexes](indexes.html) improve query performance by helping CockroachDB locate data without having to look through every row of a table. You typically add and tune indexes when [designing your database schema](schema-design-overview.html#indexes).

The following features are automatically configured by CockroachDB and employed during query planning and execution:

- The [cost-based optimizer](cost-based-optimizer.html) seeks the lowest cost for a query, usually related to time.
- The [vectorized execution engine](vectorized-execution.html) supports column-oriented ("vectorized") query execution on all CockroachDB data types.
- [Load-based splitting](load-based-splitting.html) distributes load evenly across your cluster.
