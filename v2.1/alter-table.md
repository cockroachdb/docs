---
title: ALTER TABLE
summary: Use the ALTER TABLE statement to change the schema of a table.
toc: true
---

The `ALTER TABLE` [statement](sql-statements.html) applies a schema change to a table.

{{site.data.alerts.callout_info}}
To understand how CockroachDB changes schema elements without requiring table locking or other user-visible downtime, see [Online Schema Changes](online-schema-changes.html).
{{site.data.alerts.end}}

## Subcommands

For information on using `ALTER TABLE`, see the documents for its relevant subcommands.

Subcommand | Description
-----------|------------
[`ADD COLUMN`](add-column.html) | Add columns to tables.
[`ADD CONSTRAINT`](add-constraint.html) | Add constraints to columns.
[`ALTER COLUMN`](alter-column.html) | Change or drop a column's [`DEFAULT` constraint](default-value.html) or drop the [`NOT NULL` constraint](not-null.html).
[`ALTER TYPE`](alter-type.html) | Change the column's (data type)[data-types.html].
[`DROP COLUMN`](drop-column.html) | Remove columns from tables.
[`DROP CONSTRAINT`](drop-constraint.html) | Remove constraints from columns.
[`RENAME COLUMN`](rename-column.html) | Change the names of columns.
[`RENAME TABLE`](rename-table.html) | Change the names of tables.
[`SPLIT AT`](split-at.html) | Force a key-value layer range split at the specified row in the table.
[`PARTITION BY`](partition-by.html)  | Repartition or unpartition a table with partitions ([Enterprise-only](enterprise-licensing.html)).
[`EXPERIMENTAL_AUDIT`](experimental-audit.html) | Enable per-table audit logs.

## Viewing schema changes

{% include {{ page.version.version }}/misc/schema-change-view-job.md %}
