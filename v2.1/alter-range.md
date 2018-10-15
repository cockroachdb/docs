---
title: ALTER RANGE
summary: Use the ALTER RANGE statement to change an existing system range.
toc: false
---

<span class="version-tag">New in v2.1:</span> The `ALTER RANGE` [statement](sql-statements.html) applies a schema change to a system range.

{{site.data.alerts.callout_info}}
To understand how CockroachDB changes schema elements without requiring table locking or other user-visible downtime, see [Online Schema Changes in CockroachDB](https://www.cockroachlabs.com/blog/how-online-schema-changes-are-possible-in-cockroachdb/).
{{site.data.alerts.end}}

For information on using `ALTER RANGE`, see the documents for its relevant subcommands.

Subcommand | Description
-----------|------------
[`CONFIGURE ZONE`](configure-zone.html) | [Configure replication zones](configure-replication-zones.html) for a system range.
