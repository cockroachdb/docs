---
title: ALTER INDEX
summary: Use the ALTER INDEX statement to change an existing index.
toc: false
---

The `ALTER INDEX` [statement](sql-statements.html) applies a schema change to an index.

{{site.data.alerts.callout_info}}
To understand how CockroachDB changes schema elements without requiring table locking or other user-visible downtime, see [Online Schema Changes in CockroachDB](https://www.cockroachlabs.com/blog/how-online-schema-changes-are-possible-in-cockroachdb/).
{{site.data.alerts.end}}

For information on using `ALTER INDEX`, see the documents for its relevant subcommands.

Subcommand | Description
-----------|------------
[`CONFIGURE ZONE`](configure-zone.html) | <span class="version-tag">New in v2.1:</span> [Configure replication zones](configure-replication-zones.html) for an index.
[`RENAME`](rename-index.html) | Change the name of an index.
[`SPLIT AT`](split-at.html) | Force a key-value layer range split at the specified row in the index.
