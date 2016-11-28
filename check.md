---
title: Check Constraint
summary: The Check constraint specifies that the column value must satisfy a Boolean expression.
toc: false
---

The Check [constraints](constraints.html) specifies that the column value must satisfy a Boolean expression.

<div id="toc"></div>

## Details

- Check constraints requires that the column values satisfy a Boolean expression within the constraint. The expression must evaluate to `TRUE` (or *NULL*) for every row affected by an `INSERT` or `UPDATE` statement. The DML statement will fail if the condition evaluates to `FALSE` for any row.
- Check constraints may be specified at the column or table level and can reference other columns within the table. Internally, all column level Check constrints are converted to table level constraints so they can be handled in a consistent fashion.
- You can have multiple Check constraints on a single column but ideally these should be combined using the logical operators. So, for example, 

  ~~~ sql
  warranty_period INT CHECK (warranty_period >= 0) CHECK (warranty_period <= 24)
  ~~~
  
  should be specified as 
  
  ~~~ sql
  warranty_period INT CHECK (warranty_period BETWEEN 0 AND 24)
  ~~~

- Check constraints that refer to multiple columns should be specified at the [table level](#multiple-column-table-level). 

## Syntax

The syntax of the Check constraint depends on whether you want the constraint to use a [single column](#single-column-column-level) or [multiple columns](#multiple-column-table-level).

### Single Column (Column Level)

{% include sql/diagrams/check_column_level.html %}

| Parameter | Description |
|-----------|-------------|
| `table_name` | The name of the table you're creating. |
| `column_name` | The name of the constrained column. |
| `column_type` | The constrained column's [data type](data-types.html). |
| `check_expr` | An expression that returns a Boolean value; if the expression evaluates to `FALSE`, the value cannot be inserted.|
| `column_constraints` | Any other column-level [constraints](constraints.html) you want to apply. |
| `column_def` | Definitions for any other columns in the table. |
| `table_constraints` | Any table-level [constraints](constraints.html) you want to apply. |

**Example**

~~~ sql
> CREATE TABLE inventories (
    product_id        INT NOT NULL,
    warehouse_id      INT NOT NULL,
    quantity_on_hand  INT NOT NULL CHECK (quantity_on_hand > 0),
    PRIMARY KEY (product_id, warehouse_id)
  );
~~~

### Multiple Column (Table Level)

{% include sql/diagrams/check_table_level.html %}

| Parameter | Description |
|-----------|-------------|
| `table_name` | The name of the table you're creating. |
| `column_def` | Definitions for any other columns in the table. |
| `name` | The name you want to use for the constraint, which must be unique to its table and follow these [identifier rules](keywords-and-identifiers.html#identifiers). |
| `check_expr` | An expression that returns a Boolean value; if the expression evaluates to `FALSE`, the value cannot be inserted.|
| `table_constraints` | Any table-level [constraints](constraints.html) you want to apply. |

**Example**

~~~ sql
> CREATE TABLE inventories(
    product_id        INT NOT NULL,
    warehouse_id      INT NOT NULL,
    quantity_on_hand  INT NOT NULL,
    PRIMARY KEY (product_id, warehouse_id),
    CONSTRAINT ok_to_supply CHECK (quantity_on_hand > 0 AND warehouse_id BETWEEN 100 AND 200)
  );
~~~

## Usage Example

Check constraints may be specified at the column or table level and can reference other columns within the table. Internally, all column level Check constrints are converted to table level constraints so they can be handled in a consistent fashion.

~~~ sql
> CREATE TABLE inventories (
    product_id        INT NOT NULL,
    warehouse_id      INT NOT NULL,
    quantity_on_hand  INT NOT NULL CHECK (quantity_on_hand > 0),
    PRIMARY KEY (product_id, warehouse_id)
  );

> INSERT INTO inventories (product_id, warehouse_id, quantity_on_hand) VALUES (1, 2, -20);
~~~
~~~
pq: failed to satisfy CHECK constraint (quantity_on_hand > 0)
~~~

## See Also

- [Constraints](constraints.html)
- [Default Value constraint](default-value.html)
- [Foreign Key constraint](foreign-key.html)
- [Not Null constraint](not-null.html)
- [Primary Key constraint](primary-key.html)
- [Unique constraint](unique.html)
- [`SHOW CONSTRAINTS`](show-constraints.html)
