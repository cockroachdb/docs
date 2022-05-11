---
title: ALTER RANGE
summary: Use the ALTER RANGE statement to configure the replication zone for a system range.
toc: true
docs_area: reference.sql 
---

The `ALTER RANGE` [statement](sql-statements.html) applies a [schema change](online-schema-changes.html) to a range.  For information on using `ALTER RANGE`, see the pages for its [subcommands](#subcommands).

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Subcommands

| Subcommand                                                                             | Description                                                                     |
|----------------------------------------------------------------------------------------+---------------------------------------------------------------------------------|
| [`CONFIGURE ZONE`](configure-zone.html)                                                | [Configure replication zones](configure-replication-zones.html) for a database. |
| <span class="version-tag">New in v22.1:</span> [`RELOCATE`](alter-range-relocate.html) | Move a lease or replica between stores in an emergency situation.               |

## See also

- [Configure Replication Zones](configure-replication-zones.html)
- [Multiregion Capabilities Overview](multiregion-overview.html)
- [Troubleshoot cluster setup](cluster-setup-troubleshooting.html)
- [Replication Layer](architecture/replication-layer.html)
- [`ALTER RANGE ... CONFIGURE ZONE`](configure-zone.html)
- [`ALTER RANGE ... RELOCATE`](alter-range-relocate.html)
- [SQL Statements](sql-statements.html)
