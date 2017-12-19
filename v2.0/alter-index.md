---
title: ALTER INDEX
summary: Use the ALTER INDEX statement to change an existing index.
toc: false
---

The `ALTER INDEX` [statement](sql-statements.html) applies a schema change to an index.

{{site.data.alerts.callout_info}}To understand how CockroachDB changes schema elements without requiring table locking or other user-visible downtime, see <a href="https://www.cockroachlabs.com/blog/how-online-schema-changes-are-possible-in-cockroachdb/">Online Schema Changes in CockroachDB</a>.{{site.data.alerts.end}}

For information on using `ALTER INDEX`, see the documents for its relevant subcommands.

Subcommand | Description
-----------|------------
[`RENAME`](rename-index.html) | Change the name of an index.
`SPLIT AT` | *(Documentation pending)* Potentially improve performance by identifying ideal locations to split data in the key-value layer.
