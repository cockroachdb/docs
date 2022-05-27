---
title: ALTER DATABASE
summary: Use the ALTER DATABASE statement to change an existing database.
toc: false
docs_area: reference.sql 
---

The `ALTER DATABASE` [statement](sql-statements.html) applies a schema change to a database. For information on using `ALTER DATABASE`, see the pages for its relevant [subcommands](#subcommands).

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Subcommands

Subcommand | Description
-----------|------------
[`CONFIGURE ZONE`](configure-zone.html) | [Configure replication zones](configure-replication-zones.html) for a database.
[`CONVERT TO SCHEMA`](convert-to-schema.html) |  Convert a [database](create-database.html) to a [schema](sql-name-resolution.html).
[`OWNER TO`](owner-to.html) |  Change the owner of a database.
[`RENAME`](rename-database.html) | Change the name of a database.
[`ADD REGION`](add-region.html) |  Add a region to a [multi-region database](multiregion-overview.html).
[`DROP REGION`](drop-region.html) |  Drop a region from a [multi-region database](multiregion-overview.html).
[`SET PRIMARY REGION`](set-primary-region.html) |  Set the primary region of a [multi-region database](multiregion-overview.html).
[`SET {session variable}`](alter-role.html#set-default-session-variable-values-for-a-specific-database) | <span class="version-tag">New in v21.2:</span> Set the default session variable values for the database. This syntax is identical to [`ALTER ROLE ALL IN DATABASE SET {session variable}`](alter-role.html).
`RESET {session variable}` | <span class="version-tag">New in v21.2:</span> Reset the default session variable values for the database to the system defaults. This syntax is identical to [`ALTER ROLE ALL IN DATABASE RESET {session variable}`](alter-role.html).
[`SURVIVE {ZONE,REGION} FAILURE`](survive-failure.html) |  Add a survival goal to a [multi-region database](multiregion-overview.html).

## Viewing schema changes

{% include {{ page.version.version }}/misc/schema-change-view-job.md %}
