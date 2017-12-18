---
title: VALIDATE CONSTRAINT
summary: Use the ADD COLUMN statement to add columns to tables.
toc: false
section: reference
---

The `VALIDATE CONSTRAINT` [statement](sql-statements.html) is part of `ALTER TABLE` and checks whether values in a column match a [constraint](constraints.html) on the column.

This statement is especially useful after applying a constraint to an existing column via [`ADD CONSTRAINT`](add-constraint.html). In this case, `VALIDATE CONSTRAINT` can be used to find values already in the column that do not match the constraint.

<div id="toc"></div>

## Required Privileges

The user must have the `CREATE` [privilege](privileges.html) on the table.

## Synopsis

{% include sql/{{ page.version.version }}/diagrams/validate_constraint.html %}

## Parameters

| Parameter | Description |
|-----------|-------------|
| | |
| | |

## Examples


## See Also
- [Constraints](constraints.html)
- [`ADD CONSTRAINT`](add-constraint.html)
