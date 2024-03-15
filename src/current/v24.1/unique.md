---
title: Unique Constraint
summary: The UNIQUE constraint specifies that each non-NULL value in the constrained column must be unique.
toc: true
docs_area: reference.sql
---

The `UNIQUE` [constraint]({% link {{ page.version.version }}/constraints.md %}) specifies that each non-`NULL` value in the constrained column must be unique.

## Details

- You can insert `NULL` values into columns with the `UNIQUE` constraint because `NULL` is the absence of a value, so it is never equal to other `NULL` values and not considered a duplicate value. This means that it's possible to insert rows that appear to be duplicates if one of the values is `NULL`.

    If you need to strictly enforce uniqueness, use the [`NOT NULL` constraint]({% link {{ page.version.version }}/not-null.md %}) in addition to the `UNIQUE` constraint. You can also achieve the same behavior through the table's [Primary Key]({% link {{ page.version.version }}/primary-key.md %}).

- Columns with the `UNIQUE` constraint automatically have an [index]({% link {{ page.version.version }}/indexes.md %}) created with the name `<table name>_<columns>_key`. To avoid having two identical indexes, you should not create indexes that exactly match the `UNIQUE` constraint's columns and order.

    The `UNIQUE` constraint depends on the automatically created index, so dropping the index also drops the `UNIQUE` constraint. Conversely, [dropping the `UNIQUE` constraint]({% link {{ page.version.version }}/alter-table.md %}#drop-constraint) also drops the automatically created index.

- When using the `UNIQUE` constraint on multiple columns, the collective values of the columns must be unique. This *does not* mean that each value in each column must be unique, as if you had applied the `UNIQUE` constraint to each column individually.

- You can define the `UNIQUE` constraint when you [create a table](#syntax), or you can add it to an existing table through [`ADD CONSTRAINT`]({% link {{ page.version.version }}/alter-table.md %}#add-the-unique-constraint).

{% include {{page.version.version}}/sql/indexes-regional-by-row.md %}

For an example that uses unique indexes, see [Add a unique index to a `REGIONAL BY ROW` table]({% link {{ page.version.version }}/alter-table.md %}#add-a-unique-index-to-a-regional-by-row-table).

## Syntax

You can define `UNIQUE` constraints at the [table level](#table-level) and at the [column level](#column-level).

### Table level

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/unique_table_level.html %}
</div>

Parameter | Description
----------|------------
`table_name` | The name of the table you are creating.
`column_def` | Definitions for any other columns in the table.
`name` | The name you want to use for the constraint, which must be unique to its table and follow these [identifier rules]({% link {{ page.version.version }}/keywords-and-identifiers.md %}#identifiers).
`column_name` | The name of the column you want to constrain.
`table_constraints` | Any other table-level [constraints]({% link {{ page.version.version }}/constraints.md %}) you want to apply.

**Example**

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE logon (
    login_id  INT PRIMARY KEY,
    customer_id   INT,
    logon_date    TIMESTAMP,
    UNIQUE (customer_id, logon_date)
  );
~~~

### Column level

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/unique_column_level.html %}
</div>

Parameter | Description
----------|------------
`table_name` | The name of the table you are creating.
`column_name` | The name of the constrained column.
`column_type` | The constrained column's [data type]({% link {{ page.version.version }}/data-types.md %}).
`column_constraints` | Any other column-level [constraints]({% link {{ page.version.version }}/constraints.md %}) you want to apply to this column.
`column_def` | Definitions for any other columns in the table.
`table_constraints` | Any table-level [constraints]({% link {{ page.version.version }}/constraints.md %}) you want to apply.

**Example**

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE warehouses (
    warehouse_id    INT        PRIMARY KEY NOT NULL,
    warehouse_name  STRING(35) UNIQUE,
    location_id     INT
  );
~~~

## Usage example

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE IF NOT EXISTS logon (
    login_id INT PRIMARY KEY,
    customer_id   INT NOT NULL,
    sales_id INT,
    UNIQUE (customer_id, sales_id)
  );
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO logon (login_id, customer_id, sales_id) VALUES (1, 2, 1);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO logon (login_id, customer_id, sales_id) VALUES (2, 2, 1);
~~~

~~~
duplicate key value (customer_id,sales_id)=(2,1) violates unique constraint "logon_customer_id_sales_id_key"
~~~

As mentioned in the [details](#details) above, it is possible when using the `UNIQUE` constraint alone to insert `NULL` values in a way that causes rows to appear to have rows with duplicate values.

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO logon (login_id, customer_id, sales_id) VALUES (3, 2, NULL);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO logon (login_id, customer_id, sales_id) VALUES (4, 2, NULL);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT customer_id, sales_id FROM logon;
~~~

~~~
+-------------+----------+
| customer_id | sales_id |
+-------------+----------+
|           2 |        1 |
|           2 | NULL     |
|           2 | NULL     |
+-------------+----------+
~~~

## See also

- [Constraints]({% link {{ page.version.version }}/constraints.md %})
- [`DROP CONSTRAINT`]({% link {{ page.version.version }}/alter-table.md %}#drop-constraint)
- [`CHECK` constraint]({% link {{ page.version.version }}/check.md %})
- [`DEFAULT` value constraint]({% link {{ page.version.version }}/default-value.md %})
- [Foreign key constraint]({% link {{ page.version.version }}/foreign-key.md %})
- [`NOT NULL` constraint]({% link {{ page.version.version }}/not-null.md %})
- [`PRIMARY` key constraint]({% link {{ page.version.version }}/primary-key.md %})
- [`SHOW CONSTRAINTS`]({% link {{ page.version.version }}/show-constraints.md %})
