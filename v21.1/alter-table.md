---
title: ALTER TABLE
summary: Use the ALTER TABLE statement to change the schema of a table.
toc: true
---

The `ALTER TABLE` [statement](sql-statements.html) applies a schema change to a table. For information on using `ALTER TABLE`, see the pages for its relevant [subcommands](#subcommands).

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Subcommands

{{site.data.alerts.callout_success}}
Some subcommands can be used in combination in a single `ALTER TABLE` statement. For example, you can [atomically rename a column and add a new column with the old name of the existing column](rename-column.html#add-and-rename-columns-atomically).
{{site.data.alerts.end}}

Subcommand | Description | Can combine with other subcommands?
-----------|-------------|------------------------------------
[`ADD COLUMN`](add-column.html) | Add columns to tables. | Yes
[`ADD CONSTRAINT`](add-constraint.html) | Add constraints to columns. | Yes
[`ALTER COLUMN`](alter-column.html) | Change an existing column. | Yes
[`ALTER PRIMARY KEY`](alter-primary-key.html) |  Change the [primary key](primary-key.html) of a table. | Yesnes.html) for a table. | No
[`DROP COLUMN`](drop-column.html) | Remove columns from tables. | Yes
[`DROP CONSTRAINT`](drop-constraint.html) | Remove constraints from columns. | Yes
[`EXPERIMENTAL_AUDIT`](experimental-audit.html) | Enable per-table audit logs, for security purposes. | Yes
[`OWNER TO`](owner-to.html) |  Change the owner of the table.
[`PARTITION BY`](partition-by.html)  | Partition, re-partition, or un-partition a table ([Enterprise-only](enterprise-licensing.html)). | Yes
[`RENAME COLUMN`](rename-column.html) | Change the names of columns. | Yes
[`RENAME CONSTRAINT`](rename-constraint.html) | Change constraints columns. | Yes
[`RENAME TO`](rename-table.html) | Change the names of tables. | No
[`SET SCHEMA`](set-schema.html) |  Change the [schema](sql-name-resolution.html) of a table. | No
[`SPLIT AT`](split-at.html) | Force a range split at the specified row in the table. | No
[`UNSPLIT AT`](unsplit-at.html) | Remove a range split enforcement at a specified row in the table. | No
[`VALIDATE CONSTRAINT`](validate-constraint.html) | Check whether values in a column match a [constraint](constraints.html) on the column. | Yes

## Viewing schema changes

{% include {{ page.version.version }}/misc/schema-change-view-job.md %}
