---
title: Features on Develop Branch
toc: false
---

These features and changes are available only when you <a href="install-cockroachdb.html">build a CockroachDB binary</a> from the code on our <code>develop</code> branch. They are not yet included in an official beta release.

Feature | Merge Date
--------|-----------
`INT8` is treated as an alias for the [`INT`](int.html) data type. | [8/29/16](https://github.com/cockroachdb/cockroach/pull/8858) 
[`TIMESTAMP`](timestamp.html) values can no longer be created with nanoseconds. | [8/29/16](https://github.com/cockroachdb/cockroach/pull/8864) 
[`INTERVAL`](interval.html) columns accept the SQL Standard format. | [8/18/16](https://github.com/cockroachdb/cockroach/pull/8657)
