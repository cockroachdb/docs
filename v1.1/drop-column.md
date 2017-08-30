---
title: DROP COLUMN
summary: Use the ALTER COLUMN statement to remove columns from tables.
toc: false
---

The `DROP COLUMN` [statement](sql-statements.html) is part of `ALTER TABLE` and removes columns from a table.

<div id="toc"></div>

## Synopsis

{% include sql/{{ page.version.version }}/diagrams/drop_column.html %}

## Required Privileges

The user must have the `CREATE` [privilege](privileges.html) on the table. 

## Parameters

| Parameter | Description |
|-----------|-------------|
| `table_name` | The name of the table with the column you want to drop. |
| `name` | The name of the column you want to drop. |
| `CASCADE` | Drop the column even if objects (such as [views](views.html)) depend on it; drop the dependent objects, as well.<br/><br/>`CASCADE` does not list objects it drops, so should be used cautiously.<br/><br/>However, `CASCADE` will not drop dependent indexes; you must use [`DROP INDEX`](drop-index.html). This also prevents `CASCADE` from dropping columns with Foreign Key constraints. |
| `RESTRICT` | *(Default)* Do not drop the column if any objects (such as [views](views.html)) depend on it. |

## Viewing Schema Changes

{% include custom/schema-change-view-job.md %}

## Examples

### Drop Columns

If you no longer want a column in a table, you can drop it.

``` sql
> ALTER TABLE orders DROP COLUMN billing_zip;
```

### Prevent Dropping Columns with Dependent Objects (`RESTRICT`)

If the column has dependent objects, such as [views](views.html), CockroachDB will not drop the column by default; however, if you want to be sure of the behavior you can include the `RESTRICT` clause.

``` sql
> ALTER TABLE orders DROP COLUMN customer RESTRICT;
```
```
pq: cannot drop column "customer" because view "customer_view" depends on it
```

### Drop Column & Dependent Objects (`CASCADE`)

If you want to drop the column and all of its dependent options, include the `CASCADE` clause.

{{site.data.alerts.callout_danger}}<code>CASCADE</code> does not list objects it drops, so should be used cautiously.{{site.data.alerts.end}}

``` sql
> SHOW CREATE VIEW customer_view;
```
```
+---------------+----------------------------------------------------------------+
|     View      |                          CreateView                            |
+---------------+----------------------------------------------------------------+
| customer_view | CREATE VIEW customer_view AS SELECT customer FROM store.orders |
+---------------+----------------------------------------------------------------+
```
``` sql
> ALTER TABLE orders DROP COLUMN customer CASCADE;
> SHOW CREATE VIEW customer_view;
```
```
pq: view "customer_view" does not exist
```

## See Also

- [`DROP CONSTRAINT`](drop-constraint.html)
- [`DROP INDEX`](drop-index.html)
- [`ALTER TABLE`](alter-table.html)
