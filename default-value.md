---
title: Default Value Constraint
summary: The Default Value constraint specifies a value to populate a column with if none is provided.
toc: false
---

The Default Value [constraints](constraints.html) specifies a value to populate a column with if none is provided. It supplies a value to a column if one is not provided on insert. The value may be a hard-coded literal or an expression that is evaluated at the time the row is inserted.

<div id="toc"></div>

## Details

- The [data type](data-types.html) of the Default Value or expression should be the same as the data type of the column.
- The Default Value constraint only applies on insert if the column is not specified in the [`INSERT`](insert.html) statement. You can still insert a *NULL* into an optional (nullable) column by explicitly stating the column and the *NULL* value.

## Syntax

{% include sql/diagrams/default_value_column_level.html %}

| Parameter | Description |
|-----------|-------------|
| `table_name` | The name of the table you're creating. |
| `column_name` | The name of the constrained column. |
| `column_type` | The constrained column's [data type](data-types.html). |
| `default_value` | The value you want to insert by default, which must evaluate to the same [data type](data-types.html) as the `column_type`.|
| `column_constraints` | Any other column-level [constraints](constraints.html) you want to apply. |
| `column_def` | Definitions for any other columns in the table. |
| `table_constraints` | Any table-level [constraints](constraints.html) you want to apply. |

**Example**

~~~ sql
> CREATE TABLE inventories (
    product_id        INT,
    warehouse_id      INT,
    quantity_on_hand  INT DEFAULT 100,
    PRIMARY KEY (product_id, warehouse_id)
  );
~~~

{{site.data.alerts.callout_info}}You cannot apply the Default constraint to multiple columns (i.e. at the table level).{{site.data.alerts.end}}

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

If no `DEFAULT` constraint is specified and an explicit value is not given, a value of *NULL* is assigned to the column. This may cause an error if the column has a `NOT NULL` constraint.

## See Also

- [Constraints](constraints.html)
- [Check constraint](check.html)
- [Foreign Key constraint](foreign-key.html)
- [Not Null constraint](not-null.html)
- [Primary Key constraint](primary-key.html)
- [Unique constraint](unique.html)
- [`SHOW CONSTRAINTS`](show-constraints.html)
