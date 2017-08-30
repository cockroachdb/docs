---
title: ALTER TABLE
summary: Use the ALTER TABLE statement to change the schema of a table. 
toc: false
---

The `ALTER TABLE` [statement](sql-statements.html) applies a schema change to a table.

{{site.data.alerts.callout_info}}To understand how CockroachDB changes schema elements without requiring table locking or other user-visible downtime, see <a href="https://www.cockroachlabs.com/blog/how-online-schema-changes-are-possible-in-cockroachdb/">Online Schema Changes in CockroachDB</a>.{{site.data.alerts.end}}

For information on using `ALTER TABLE`, see the documents for its relevant subcommands.

Subcommand | Description
-----------|------------
[`ADD COLUMN`](add-column.html) | Add columns to tables. 
[`ADD CONSTRAINT`](add-constraint.html) | Add constraints to columns.
[`ALTER COLUMN`](alter-column.html) | Change a column's [Default constraint](default-value.html) or drop the [Not Null constraint](not-null.html).
[`DROP COLUMN`](drop-column.html) | Remove columns from tables.
[`DROP CONSTRAINT`](drop-constraint.html) | Remove constraints from columns.
[`RENAME COLUMN`](rename-column.html) | Change the names of columns.
[`RENAME TABLE`](rename-table.html) | Change the names of tables.
`SPLIT AT` | *(Documentation pending)* Potentially improve performance by identifying ideal locations to split data in the key-value layer.

## Viewing Schema Changes

{% include custom/schema-change-view-job.md %}
