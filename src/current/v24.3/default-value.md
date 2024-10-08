---
title: Default Value Constraint
summary: The DEFAULT constraint specifies a value to populate a column with if none is provided.
toc: true
docs_area: reference.sql
---

The `DEFAULT` value [constraint]({% link {{ page.version.version }}/constraints.md %}) specifies a value to write into the constrained column if one is not defined in an `INSERT` statement. The value may be either a hard-coded literal or an expression that is evaluated at the time the row is created.

## Details

- The [data type]({% link {{ page.version.version }}/data-types.md %}) of the `DEFAULT` value must be the same as the data type of the column.
- The `DEFAULT` value constraint only applies if the column does not have a value specified in the [`INSERT`]({% link {{ page.version.version }}/insert.md %}) statement. You can still insert a `NULL` into an optional (nullable) column by explicitly inserting `NULL`. For example, `INSERT INTO foo VALUES (1, NULL);`.

## Syntax

You can only apply the `DEFAULT` value constraint to individual columns.

{{site.data.alerts.callout_info}}
You can also add the `DEFAULT` value constraint to an existing table through [`ALTER COLUMN`]({% link {{ page.version.version }}/alter-table.md %}#set-or-change-a-default-value).
{{site.data.alerts.end}}

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/default_value_column_level.html %}
</div>

 Parameter | Description
-----------|-------------
 `table_name` | The name of the table you're creating.
 `column_name` | The name of the constrained column.
 `column_type` | The constrained column's [data type]({% link {{ page.version.version }}/data-types.md %}).
 `default_value` | The value you want to insert by default, which must evaluate to the same [data type]({% link {{ page.version.version }}/data-types.md %}) as the `column_type`.
 `column_constraints` | Any other column-level [constraints]({% link {{ page.version.version }}/constraints.md %}) you want to apply to this column.
 `column_def` | Definitions for any other columns in the table.
 `table_constraints` | Any table-level [constraints]({% link {{ page.version.version }}/constraints.md %}) you want to apply.

## Example

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE inventories (
    product_id        INT,
    warehouse_id      INT,
    quantity_on_hand  INT DEFAULT 100,
    PRIMARY KEY (product_id, warehouse_id)
  );
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO inventories (product_id, warehouse_id) VALUES (1,20);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO inventories (product_id, warehouse_id, quantity_on_hand) VALUES (2,30, NULL);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
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

If the `DEFAULT` value constraint is not specified and an explicit value is not given, a value of `NULL` is assigned to the column.

## See also

- [Constraints]({% link {{ page.version.version }}/constraints.md %})
- [`ALTER COLUMN`]({% link {{ page.version.version }}/alter-table.md %}#alter-column)
- [`CHECK` constraint]({% link {{ page.version.version }}/check.md %})
- [`REFERENCES` constraint (Foreign Key)]({% link {{ page.version.version }}/foreign-key.md %})
- [`NOT NULL` constraint]({% link {{ page.version.version }}/not-null.md %})
- [`PRIMARY KEY` constraint]({% link {{ page.version.version }}/primary-key.md %})
- [`UNIQUE` constraint]({% link {{ page.version.version }}/unique.md %})
- [`SHOW CONSTRAINTS`]({% link {{ page.version.version }}/show-constraints.md %})
