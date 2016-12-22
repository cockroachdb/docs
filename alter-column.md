---
title: ALTER COLUMN
summary: Use the ALTER COLUMN statement to change a column's Default constraint.
toc: false
---

The `ALTER COLUMN` [statement](sql-statements.html) is part of `ALTER TABLE` and changes a column's [Default constraint](default-value.html) or drops the [Not Null constraint](not-null.html).

{{site.data.alerts.callout_info}}To manage other constraints, see <a href="add-constraint.html"><code>ADD CONSTRAINT</code></a> and <a href="drop-constraint.html"><code>DROP CONSTRAINT</code></a>{{site.data.alerts.end}}

<div id="toc"></div>

## Synopsis

{% include sql/diagrams/alter_column.html %}

## Required Privileges

The user must have the `CREATE` [privilege](privileges.html) on the table. 

## Parameters

| Parameter | Description |
|-----------|-------------|
| `table_name` | The name of the table with the column whose Default value you want to modify. |
| `name` | The name of the column you want to modify. |
| `a_expr` | The new Default value you want to use. |

## Examples

### Set a Default Value

``` sql
> ALTER TABLE subscriptions ALTER COLUMN newsletter SET DEFAULT true;
```

### Remove Default Constraint

``` sql
> ALTER TABLE subscriptions ALTER COLUMN newsletter DROP DEFAULT;
```

### Remove Not Null Constraint

``` sql
> ALTER TABLE subscriptions ALTER COLUMN newsletter DROP NOT NULL;
```

## See Also

- [Constraints](constraints.html)
- [`ADD CONSTRAINT`](add-constraint.html)
- [`DROP CONSTRAINT`](drop-constraint.html)
- [`ALTER TABLE`](alter-table.html)
