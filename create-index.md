---
title: CREATE INDEX
summary: The CREATE INDEX statement creates an index for a table. Indexes are used to quickly locate data without having to look through every row of a table.
toc: false
---

The `CREATE INDEX` [statement](sql-statements.html) creates an index for a table. Indexes are used to quickly locate data without having to look through every row of a table. 

{{site.data.alerts.callout_info}}Indexes are automatically created for the primary key of a table and any columns with a unique constraint. To understand how CockroachDB chooses the best index for running a query, see <a href="https://www.cockroachlabs.com/blog/index-selection-cockroachdb-2/">Index Selection in CockroachDB</a>.{{site.data.alerts.end}}

<div id="toc"></div>

## Synopsis

{% include sql/diagrams/create_index.html %}

## Required Privileges

The user must have the `CREATE` [privilege](privileges.html) on the table.

## Parameters

| Parameter | Description |
|-----------|-------------|
|  |  |

## See Also

- [`SHOW INDEX`](show-index.html)
- [`DROP INDEX`](drop-index.html)
- [`RENAME INDEX`](rename-index.html)
- [Other SQL Statements](sql-statements.html)