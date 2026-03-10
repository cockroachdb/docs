---
title: NOT NULL constraint
summary: The NOT NULL constraint specifies the column may not contain NULL values.
toc: true
docs_area: reference.sql
---

The `NOT NULL` [constraint]({% link {{ page.version.version }}/constraints.md %}) specifies a column may not contain [`NULL`]({% link {{ page.version.version }}/null-handling.md %}) values.

## Details

- `INSERT` or `UPDATE` statements containing `NULL` values are rejected. This includes `INSERT` statements that do not include values for any columns that do not have a [`DEFAULT` value constraint]({% link {{ page.version.version }}/default-value.md %}).

  For example, if the table `foo` has columns `a` and `b` (and `b` *does not* have a `DEFAULT VALUE`), when you run the following command:

  ~~~ sql
  > INSERT INTO foo (a) VALUES (1);
  ~~~

  CockroachDB tries to write a `NULL` value into column `b`. If that column has the `NOT NULL` constraint, the `INSERT` statement is rejected.

- To add the `NOT NULL` constraint to an existing table column, use the [`ALTER COLUMN`]({% link {{ page.version.version }}/alter-table.md %}#set-not-null-constraint) statement.

- For more information about `NULL`, see [NULL handling]({% link {{ page.version.version }}/null-handling.md %}).

## Syntax

You can only apply the `NOT NULL` constraint to individual columns.

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/not_null_column_level.html %}
</div>

 Parameter | Description
-----------|-------------
 `table_name` | The name of the table you're creating.
 `column_name` | The name of the constrained column.
 `column_type` | The constrained column's [data type]({% link {{ page.version.version }}/data-types.md %}).
 `column_constraints` | Any other column-level [constraints]({% link {{ page.version.version }}/constraints.md %}) you want to apply to this column.
 `column_def` | Definitions for any other columns in the table.
 `table_constraints` | Any table-level [constraints]({% link {{ page.version.version }}/constraints.md %}) you want to apply.

## Usage example

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE IF NOT EXISTS customers (
    customer_id INT         PRIMARY KEY,
    cust_name   STRING(30)  NULL,
    cust_email  STRING(100) NOT NULL
  );
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO customers (customer_id, cust_name, cust_email) VALUES (1, 'Smith', NULL);
~~~

~~~
pq: null value in column "cust_email" violates not-null constraint
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO customers (customer_id, cust_name) VALUES (1, 'Smith');
~~~

~~~
pq: null value in column "cust_email" violates not-null constraint
~~~

## See also

- [Constraints]({% link {{ page.version.version }}/constraints.md %})
- [`DROP CONSTRAINT`]({% link {{ page.version.version }}/alter-table.md %}#drop-constraint)
- [`CHECK` constraint]({% link {{ page.version.version }}/check.md %})
- [`DEFAULT` constraint]({% link {{ page.version.version }}/default-value.md %})
- [`REFERENCES` constraint (Foreign Key)]({% link {{ page.version.version }}/foreign-key.md %})
- [`PRIMARY KEY` constraint]({% link {{ page.version.version }}/primary-key.md %})
- [`UNIQUE` constraint]({% link {{ page.version.version }}/unique.md %})
- [`SHOW CONSTRAINTS`]({% link {{ page.version.version }}/show-constraints.md %})
- [`NULL HANDLING`]({% link {{ page.version.version }}/null-handling.md %})
