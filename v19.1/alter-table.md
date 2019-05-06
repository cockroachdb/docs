---
title: ALTER TABLE
summary: Use the ALTER TABLE statement to change the schema of a table.
toc: true
---

The `ALTER TABLE` [statement](sql-statements.html) applies a schema change to a table.

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Viewing schema changes

{% include {{ page.version.version }}/misc/schema-change-view-job.md %}

## Subcommands

For information on using `ALTER TABLE`, see the documents for its relevant subcommands.

{{site.data.alerts.callout_success}}
<span class="version-tag">New in v19.1</span>: Some subcommands can be used in combination in a single `ALTER TABLE` statement. For example, you can [atomically rename a column and add a new column with the old name of the existing column](rename-column.html#add-and-rename-columns-atomically).
{{site.data.alerts.end}}

Subcommand | Description | Can combine with other subcommands?
-----------|-------------|------------------------------------
[`ADD COLUMN`](add-column.html) | Add columns to tables. | Yes
[`ADD CONSTRAINT`](add-constraint.html) | Add constraints to columns. | Yes
[`ALTER COLUMN`](alter-column.html) | Change or drop a column's [`DEFAULT` constraint](default-value.html) or drop the [`NOT NULL` constraint](not-null.html). | Yes
[`ALTER TYPE`](alter-type.html) | Change a column's [data type](data-types.html). | Yes
[`CONFIGURE ZONE`](configure-zone.html) | [Configure replication zones](configure-replication-zones.html) for a table. | No
[`DROP COLUMN`](drop-column.html) | Remove columns from tables. | Yes
[`DROP CONSTRAINT`](drop-constraint.html) | Remove constraints from columns. | Yes
[`EXPERIMENTAL_AUDIT`](experimental-audit.html) | Enable per-table audit logs. | Yes
[`PARTITION BY`](partition-by.html)  | Repartition or unpartition a table with partitions ([Enterprise-only](enterprise-licensing.html)). | Yes
[`RENAME COLUMN`](rename-column.html) | Change the names of columns. | Yes
[`RENAME CONSTRAINT`](rename-constraint.html) | Change constraints columns. | Yes
[`RENAME TABLE`](rename-table.html) | Change the names of tables. | No
[`SPLIT AT`](split-at.html) | Force a key-value layer range split at the specified row in the table. | No
[`VALIDATE CONSTRAINT`](validate-constraint.html) | Check whether values in a column match a [constraint](constraints.html) on the column. | Yes

## Viewing schema changes

{% include {{ page.version.version }}/misc/schema-change-view-job.md %}
