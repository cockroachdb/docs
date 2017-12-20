---
title: Check Constraint
summary: The Check constraint specifies that values for the column in INSERT or UPDATE statements must satisfy a Boolean expression.
toc: false
---

The Check [constraint](constraints.html) specifies that values for the column in [`INSERT`](insert.html) or [`UPDATE`](update.html) statements must return `TRUE` or `NULL` for a Boolean expression. If any values return `FALSE`, the entire statement is rejected.

<div id="toc"></div>

## Details

- If you add a Check constraint to an existing table, existing values are not checked. However, any updates to those values will be.
  {{site.data.alerts.callout_info}}In the future we plan to expand the Check constraint to include a check on any existing values in the column.{{site.data.alerts.end}}
- Check constraints may be specified at the column or table level and can reference other columns within the table. Internally, all column-level Check constraints are converted to table-level constraints so they can be handled consistently.
- You can have multiple Check constraints on a single column but ideally, for performance optimization, these should be combined using the logical operators. For example

  ~~~ sql
  warranty_period INT CHECK (warranty_period >= 0) CHECK (warranty_period <= 24)
  ~~~
  
  should be specified as:
  
  ~~~ sql
  warranty_period INT CHECK (warranty_period BETWEEN 0 AND 24)
  ~~~

## Syntax

Check constraints can be defined at the [table level](#table-level). However, if you only want the constraint to apply to a single column, it can be applied at the [column level](#column-level).

{{site.data.alerts.callout_info}}You can also add the Check constraint to existing tables through <a href="add-constraint.html#add-the-check-constraint"><code>ADD CONSTRAINT</code></a>.{{site.data.alerts.end}}

### Column Level

{% include sql/{{ page.version.version }}/diagrams/check_column_level.html %}

| Parameter | Description |
|-----------|-------------|
| `table_name` | The name of the table you're creating. |
| `column_name` | The name of the constrained column. |
| `column_type` | The constrained column's [data type](data-types.html). |
| `check_expr` | An expression that returns a Boolean value; if the expression evaluates to `FALSE`, the value cannot be inserted.|
| `column_constraints` | Any other column-level [constraints](constraints.html) you want to apply to this column. |
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

### Table Level

{% include sql/{{ page.version.version }}/diagrams/check_table_level.html %}

| Parameter | Description |
|-----------|-------------|
| `table_name` | The name of the table you're creating. |
| `column_def` | Definitions for any other columns in the table. |
| `name` | The name you want to use for the constraint, which must be unique to its table and follow these [identifier rules](keywords-and-identifiers.html#identifiers). |
| `check_expr` | An expression that returns a Boolean value; if the expression evaluates to `FALSE`, the value cannot be inserted.|
| `table_constraints` | Any other table-level [constraints](constraints.html) you want to apply. |

**Example**

~~~ sql
> CREATE TABLE inventories (
    product_id        INT NOT NULL,
    warehouse_id      INT NOT NULL,
    quantity_on_hand  INT NOT NULL,
    PRIMARY KEY (product_id, warehouse_id),
    CONSTRAINT ok_to_supply CHECK (quantity_on_hand > 0 AND warehouse_id BETWEEN 100 AND 200)
  );
~~~

## Usage Example

Check constraints may be specified at the column or table level and can reference other columns within the table. Internally, all column-level Check constraints are converted to table-level constraints so they can be handled in a consistent fashion.

~~~ sql
> CREATE TABLE inventories (
    product_id        INT NOT NULL,
    warehouse_id      INT NOT NULL,
    quantity_on_hand  INT NOT NULL CHECK (quantity_on_hand > 0),
    PRIMARY KEY (product_id, warehouse_id)
  );

> INSERT INTO inventories (product_id, warehouse_id, quantity_on_hand) VALUES (1, 2, 0);
~~~
~~~
pq: failed to satisfy CHECK constraint (quantity_on_hand > 0)
~~~

## See Also

- [Constraints](constraints.html)
- [`DROP CONSTRAINT`](drop-constraint.html)
- [Default Value constraint](default-value.html)
- [Foreign Key constraint](foreign-key.html)
- [Not Null constraint](not-null.html)
- [Primary Key constraint](primary-key.html)
- [Unique constraint](unique.html)
- [`SHOW CONSTRAINTS`](show-constraints.html)
