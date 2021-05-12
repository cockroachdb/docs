---
title: ALTER DATABASE
summary: Use the ALTER DATABASE statement to change an existing database.
toc: false
---

The `ALTER DATABASE` [statement](sql-statements.html) applies a schema change to a database. For information on using `ALTER DATABASE`, see the pages for its relevant [subcommands](#subcommands).

{% include {{{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Subcommands

Subcommand | Description
-----------|------------
[`CONFIGURE ZONE`](configure-zone.html) | [Configure replication zones](configure-replication-zones.html) for a database.
[`CONVERT TO SCHEMA`](convert-to-schema.html) |  Convert a [database](create-database.html) to a [schema](sql-name-resolution.html).
[`OWNER TO`](owner-to.html) |  Change the owner of a database.
[`RENAME`](rename-database.html) | Change the name of a database.
[`ADD REGION`](add-region.html) | <span class="version-tag">New in v21.1:</span> Add a region to a [multi-region database](multiregion-overview.html).
[`DROP REGION`](drop-region.html) | <span class="version-tag">New in v21.1:</span> Drop a region from a [multi-region database](multiregion-overview.html).
[`SET PRIMARY REGION`](set-primary-region.html) | <span class="version-tag">New in v21.1:</span> Set the primary region of a [multi-region database](multiregion-overview.html).
[`SURVIVE {ZONE,REGION} FAILURE`](survive-failure.html) | <span class="version-tag">New in v21.1:</span> Add a survival goal to a [multi-region database](multiregion-overview.html).

## Viewing schema changes

{% include {{ page.version.version }}/misc/schema-change-view-job.md %}
