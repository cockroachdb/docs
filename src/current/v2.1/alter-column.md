---
title: ALTER COLUMN
summary: Use the ALTER COLUMN statement to set, change, or drop a column's DEFAULT constraint or to drop the NOT NULL constraint.
toc: true
---

The `ALTER COLUMN` [statement](sql-statements.html) is part of `ALTER TABLE` and sets, changes, or drops a column's [`DEFAULT` constraint](default-value.html) or drops the [`NOT NULL` constraint](not-null.html).

{{site.data.alerts.callout_info}}
To manage other constraints, see [`ADD CONSTRAINT`](add-constraint.html) and [`DROP CONSTRAINT`](drop-constraint.html).
{{site.data.alerts.end}}


## Synopsis

<div>
{% include {{ page.version.version }}/sql/diagrams/alter_column.html %}
</div>

## Required privileges

The user must have the `CREATE` [privilege](authorization.html#assign-privileges) on the table.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `table_name` | The name of the table with the column you want to modify. |
| `column_name` | The name of the column you want to modify. |
| `a_expr` | The new [Default Value](default-value.html) you want to use. |

## Viewing schema changes

{% include {{ page.version.version }}/misc/schema-change-view-job.md %}

## Examples

### Set or change a `DEFAULT` value

Setting the [`DEFAULT` value constraint](default-value.html) inserts the value when data's written to the table without explicitly defining the value for the column. If the column already has a `DEFAULT` value set, you can use this statement to change it.

The below example inserts the Boolean value `true` whenever you inserted data to the `subscriptions` table without defining a value for the `newsletter` column.

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE subscriptions ALTER COLUMN newsletter SET DEFAULT true;
~~~

### Remove `DEFAULT` constraint

If the column has a defined [`DEFAULT` value](default-value.html), you can remove the constraint, which means the column will no longer insert a value by default if one is not explicitly defined for the column.

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE subscriptions ALTER COLUMN newsletter DROP DEFAULT;
~~~

### Remove `NOT NULL` constraint

If the column has the [`NOT NULL` constraint](not-null.html) applied to it, you can remove the constraint, which means the column becomes optional and can have *NULL* values written into it.

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE subscriptions ALTER COLUMN newsletter DROP NOT NULL;
~~~

### Convert a computed column into a regular column

<span class="version-tag">New in v2.1:</span> {% include {{ page.version.version }}/computed-columns/convert-computed-column.md %}

## See also

- [Constraints](constraints.html)
- [`ADD CONSTRAINT`](add-constraint.html)
- [`DROP CONSTRAINT`](drop-constraint.html)
- [`ALTER TABLE`](alter-table.html)
