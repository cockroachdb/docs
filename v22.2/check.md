---
title: CHECK Constraint
summary: The CHECK constraint specifies that values for the column in INSERT or UPDATE statements must satisfy a Boolean expression.
toc: true
docs_area: reference.sql
---

{% assign rd = site.data.releases | where_exp: "rd", "rd.major_version == page.version.version" | first %}

{% if rd %}
{% assign remote_include_version = page.version.version | replace: "v", "" %}
{% else %}
{% assign remote_include_version = site.versions["stable"] | replace: "v", "" %}
{% endif %}

The `CHECK` [constraint](constraints.html) specifies that values for the column in [`INSERT`](insert.html) or [`UPDATE`](update.html) statements must return `TRUE` or `NULL` for a Boolean expression. If any values return `FALSE`, the entire statement is rejected.

## Details

- You can specify `CHECK` constraints at the column or table level and can reference other columns within the table. Internally, all column-level `CHECK` constraints are converted to table-level constraints so they can be handled consistently.

- You can add `CHECK` constraints to columns that were created earlier in the same transaction. For an example, see [Add the `CHECK` constraint](add-constraint.html#add-constraints-to-columns-created-during-a-transaction).

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

You can also add `CHECK` constraints to a table using [`ADD CONSTRAINT`](add-constraint.html#add-the-check-constraint).

### Column level

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-{{ remote_include_version }}/grammar_svg/check_column_level.html %}
</div>

 Parameter | Description
-----------|-------------
`table_name` | The name of the table you're creating.
`column_name` | The name of the constrained column.
`column_type` | The constrained column's [data type](data-types.html).
`check_expr` | An expression that returns a Boolean value; if the expression evaluates to `FALSE`, the value cannot be inserted.
`column_constraints` | Any other column-level [constraints](constraints.html) you want to apply to this column.
`column_def` | Definitions for any other columns in the table.
`table_constraints` | Any table-level [constraints](constraints.html) you want to apply.

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
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-{{ remote_include_version }}/grammar_svg/check_table_level.html %}
</div>

 Parameter | Description
-----------|-------------
`table_name` | The name of the table you're creating.
`column_def` | Definitions for any other columns in the table.
`constraint_name` | The name to use for the constraint, which must be unique to its table and follow these [identifier rules](keywords-and-identifiers.html#identifiers).
`check_expr` | An expression that returns a Boolean value. If the expression evaluates to `FALSE`, the value cannot be inserted.
`table_constraints` | Any other table-level [constraints](constraints.html) to apply.

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

- [Constraints](constraints.html)
- [`DROP CONSTRAINT`](drop-constraint.html)
- [`DEFAULT` constraint](default-value.html)
- [`REFERENCES` constraint (Foreign Key)](foreign-key.html)
- [`NOT NULL` constraint](not-null.html)
- [`PRIMARY KEY` constraint](primary-key.html)
- [`UNIQUE` constraint](unique.html)
- [`SHOW CONSTRAINTS`](show-constraints.html)
