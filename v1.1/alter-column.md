---
title: ALTER COLUMN
summary: Use the ALTER COLUMN statement to change a column's Default constraint.
toc: false
---

The `ALTER COLUMN` [statement](sql-statements.html) is part of `ALTER TABLE` and changes a column's [Default constraint](default-value.html) or drops the [Not Null constraint](not-null.html).

{{site.data.alerts.callout_info}}To manage other constraints, see <a href="add-constraint.html"><code>ADD CONSTRAINT</code></a> and <a href="drop-constraint.html"><code>DROP CONSTRAINT</code></a>{{site.data.alerts.end}}

<div id="toc"></div>

## Synopsis

{% include sql/{{ page.version.version }}/diagrams/alter_column.html %}

## Required Privileges

The user must have the `CREATE` [privilege](privileges.html) on the table. 

## Parameters

| Parameter | Description |
|-----------|-------------|
| `table_name` | The name of the table with the column whose Default Value you want to modify. |
| `name` | The name of the column you want to modify. |
| `a_expr` | The new Default Value you want to use. |

## Viewing Schema Changes

{% include custom/schema-change-view-job.md %}

## Examples

### Set or Change a Default Value

Setting the [Default Value constraint](default-value.html) inserts the value when data's written to the table without explicitly defining the value for the column. If the column already has a Default Value set, you can use this statement to change it.

The below example inserts the Boolean value `true` whenever you inserted data to the `subscriptions` table without defining a value for the `newsletter` column.

``` sql
> ALTER TABLE subscriptions ALTER COLUMN newsletter SET DEFAULT true;
```

### Remove Default Constraint

If the column has a defined [Default Value](default-value.html), you can remove the constraint, which means the column will no longer insert a value by default if one is not explicitly defined for the column.

``` sql
> ALTER TABLE subscriptions ALTER COLUMN newsletter DROP DEFAULT;
```

### Remove Not Null Constraint

If the column has the [Not Null constraint](not-null.html) applied to it, you can remove the constraint, which means the column becomes optional and can have *NULL* values written into it.

``` sql
> ALTER TABLE subscriptions ALTER COLUMN newsletter DROP NOT NULL;
```

## See Also

- [Constraints](constraints.html)
- [`ADD CONSTRAINT`](add-constraint.html)
- [`DROP CONSTRAINT`](drop-constraint.html)
- [`ALTER TABLE`](alter-table.html)
