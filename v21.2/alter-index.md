---
title: ALTER INDEX
summary: Use the ALTER INDEX statement to change an existing index.
toc: true
---

The `ALTER INDEX` [statement](sql-statements.html) applies a schema change to an index. For information on using `ALTER INDEX`, see the pages for its relevant [subcommands](#subcommands).

{% include {{{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Subcommands

Subcommand | Description
-----------|------------
[`CONFIGURE ZONE`](configure-zone.html) | [Configure replication zones](configure-replication-zones.html) for an index.
[`PARTITION BY`](partition-by.html)  | Partition, re-partition, or un-partition an index. ([Enterprise-only](enterprise-licensing.html)).
[`RENAME`](rename-index.html) | Change the name of an index.
[`SPLIT AT`](split-at.html) | Force a range split at the specified row in the index.
[`UNSPLIT AT`](unsplit-at.html) | Remove a range split enforcement at a specified row in the index.

## Viewing schema changes

{% include {{ page.version.version }}/misc/schema-change-view-job.md %}
