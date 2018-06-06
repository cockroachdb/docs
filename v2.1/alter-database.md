---
title: ALTER DATABASE
summary: Use the ALTER DATABASE statement to change an existing database.
toc: false
---

The `ALTER DATABASE` [statement](sql-statements.html) applies a schema change to a database.

{{site.data.alerts.callout_info}}
To understand how CockroachDB changes schema elements without requiring table locking or other user-visible downtime, see [Online Schema Changes in CockroachDB](https://www.cockroachlabs.com/blog/how-online-schema-changes-are-possible-in-cockroachdb/).
{{site.data.alerts.end}}

For information on using `ALTER DATABASE`, see the documents for its relevant subcommands.

Subcommand | Description
-----------|------------
[`RENAME`](rename-database.html) | Change the name of a database.
