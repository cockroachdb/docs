---
title: CHECK Constraint
summary: The CHECK constraint specifies that values for the column in INSERT or UPDATE statements must satisfy a Boolean expression.
toc: true
docs_area: reference.sql
---

The `CHECK` [constraint]({% link {{ page.version.version }}/constraints.md %}) specifies that values for the column in [`INSERT`]({% link {{ page.version.version }}/insert.md %}) or [`UPDATE`]({% link {{ page.version.version }}/update.md %}) statements must return `TRUE` or `NULL` for a Boolean expression. If any values return `FALSE`, the entire statement is rejected.

## Details

- You can specify `CHECK` constraints at the column or table level and can reference other columns within the table. Internally, all column-level `CHECK` constraints are converted to table-level constraints so they can be handled consistently.

- You can add `CHECK` constraints to columns that were created earlier in the same transaction. For an example, see [Add the `CHECK` constraint]({% link {{ page.version.version }}/alter-table.md %}#add-constraints-to-columns-created-during-a-transaction).

- You can have multiple `CHECK` constraints on a single column but for performance optimization you should combine them using logical operators. For example, you should specify:

    ~~~ sql
    warranty_period INT CHECK (warranty_period >= 0) CHECK (warranty_period <= 24)
    ~~~

    as:

    ~~~ sql
    warranty_period INT CHECK (warranty_period BETWEEN 0 AND 24)
    ~~~

- When you drop a column with a `CHECK` constraint, the `CHECK` constraint is also dropped.

## Syntax

You can define `CHECK` constraints at the [column level](#column-level), where the constraint applies only to a single column, and at the [table level](#table-level).

You can also add `CHECK` constraints to a table using [`ADD CONSTRAINT`]({% link {{ page.version.version }}/alter-table.md %}#add-the-check-constraint).

### Column level

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/check_column_level.html %}
</div>

 Parameter | Description
-----------|-------------
`table_name` | The name of the table you're creating.
`column_name` | The name of the constrained column.
`column_type` | The constrained column's [data type]({% link {{ page.version.version }}/data-types.md %}).
`check_expr` | An expression that returns a Boolean value; if the expression evaluates to `FALSE`, the value cannot be inserted.
`column_constraints` | Any other column-level [constraints]({% link {{ page.version.version }}/constraints.md %}) you want to apply to this column.
`column_def` | Definitions for any other columns in the table.
`table_constraints` | Any table-level [constraints]({% link {{ page.version.version }}/constraints.md %}) you want to apply.

#### Example

The following example specifies the column-level `CHECK` constraint that a `quantity_on_hand` value must be greater than `0`.

~~~ sql
> CREATE TABLE inventories (
    product_id        INT NOT NULL,
    warehouse_id      INT NOT NULL,
    quantity_on_hand  INT NOT NULL CHECK (quantity_on_hand > 0),
    PRIMARY KEY (product_id, warehouse_id)
  );
~~~

### Table level

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/check_table_level.html %}
</div>

 Parameter | Description
-----------|-------------
`table_name` | The name of the table you're creating.
`column_def` | Definitions for any other columns in the table.
`constraint_name` | The name to use for the constraint, which must be unique to its table and follow these [identifier rules]({% link {{ page.version.version }}/keywords-and-identifiers.md %}#identifiers).
`check_expr` | An expression that returns a Boolean value. If the expression evaluates to `FALSE`, the value cannot be inserted.
`table_constraints` | Any other table-level [constraints]({% link {{ page.version.version }}/constraints.md %}) to apply.

#### Example

The following example specifies the table-level `CHECK` constraint named `ok_to_supply` that a `quantity_on_hand` value must be greater than `0` and a `warehouse_id` must be between `100` and `200`.

~~~ sql
> CREATE TABLE inventories (
    product_id        INT NOT NULL,
    warehouse_id      INT NOT NULL,
    quantity_on_hand  INT NOT NULL,
    PRIMARY KEY (product_id, warehouse_id),
    CONSTRAINT ok_to_supply CHECK (quantity_on_hand > 0 AND warehouse_id BETWEEN 100 AND 200)
  );
~~~

## Usage example

The following example demonstrates that when you specify the `CHECK` constraint that a `quantity_on_hand` value must be greater than `0`, and you attempt to insert the value `0`, CockroachDB returns an error.

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


## See also

- [Constraints]({% link {{ page.version.version }}/constraints.md %})
- [`DROP CONSTRAINT`]({% link {{ page.version.version }}/alter-table.md %}#drop-constraint)
- [`DEFAULT` constraint]({% link {{ page.version.version }}/default-value.md %})
- [`REFERENCES` constraint (Foreign Key)]({% link {{ page.version.version }}/foreign-key.md %})
- [`NOT NULL` constraint]({% link {{ page.version.version }}/not-null.md %})
- [`PRIMARY KEY` constraint]({% link {{ page.version.version }}/primary-key.md %})
- [`UNIQUE` constraint]({% link {{ page.version.version }}/unique.md %})
- [`SHOW CONSTRAINTS`]({% link {{ page.version.version }}/show-constraints.md %})
