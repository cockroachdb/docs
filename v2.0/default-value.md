---
title: Default Value Constraint
summary: The Default Value constraint specifies a value to populate a column with if none is provided.
toc: false
---

The Default Value [constraint](constraints.html) specifies a value to write into the constrained column if one is not defined in an `INSERT` statement. The value may be either a hard-coded literal or an expression that is evaluated at the time the row is created.

<div id="toc"></div>

## Details

- The [data type](data-types.html) of the Default Value must be the same as the data type of the column.
- The Default Value constraint only applies if the column does not have a value specified in the [`INSERT`](insert.html) statement. You can still insert a *NULL* into an optional (nullable) column by explicitly inserting *NULL*. For example, `INSERT INTO foo VALUES (1, NULL);`.

## Syntax

You can only apply the Default Value constraint to individual columns.

{{site.data.alerts.callout_info}}You can also add the Default Value constraint to an existing table through <a href="alter-column.html#set-or-change-a-default-value"><code>ALTER COLUMN</code></a>. {{site.data.alerts.end}}

{% include sql/{{ page.version.version }}/diagrams/default_value_column_level.html %}

| Parameter | Description |
|-----------|-------------|
| `table_name` | The name of the table you're creating. |
| `column_name` | The name of the constrained column. |
| `column_type` | The constrained column's [data type](data-types.html). |
| `default_value` | The value you want to insert by default, which must evaluate to the same [data type](data-types.html) as the `column_type`.|
| `column_constraints` | Any other column-level [constraints](constraints.html) you want to apply to this column. |
| `column_def` | Definitions for any other columns in the table. |
| `table_constraints` | Any table-level [constraints](constraints.html) you want to apply. |

## Usage Example

~~~ sql
> CREATE TABLE inventories (
    product_id        INT,
    warehouse_id      INT,
    quantity_on_hand  INT DEFAULT 100,
    PRIMARY KEY (product_id, warehouse_id)
  );

> INSERT INTO inventories (product_id, warehouse_id) VALUES (1,20);

> INSERT INTO inventories (product_id, warehouse_id, quantity_on_hand) VALUES (2,30, NULL);

> SELECT * FROM inventories;
~~~
~~~
+------------+--------------+------------------+
| product_id | warehouse_id | quantity_on_hand |
+------------+--------------+------------------+
|          1 |           20 |              100 |
|          2 |           30 | NULL             |
+------------+--------------+------------------+
~~~

If the Default Value constraint is not specified and an explicit value is not given, a value of *NULL* is assigned to the column.

## See Also

- [Constraints](constraints.html)
- [`ALTER COLUMN`](alter-column.html)
- [Check constraint](check.html)
- [Foreign Key constraint](foreign-key.html)
- [Not Null constraint](not-null.html)
- [Primary Key constraint](primary-key.html)
- [Unique constraint](unique.html)
- [`SHOW CONSTRAINTS`](show-constraints.html)
