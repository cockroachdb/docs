---
title: NOT NULL constraint
summary: The NOT NULL constraint specifies the column may not contain NULL values.
toc: true
---

The `NOT NULL` [constraint](constraints.html) specifies a column may not contain [`NULL`](null-handling.html) values.

## Details

- `INSERT` or `UPDATE` statements containing `NULL` values are rejected. This includes `INSERT` statements that do not include values for any columns that do not have a [`DEFAULT` value constraint](default-value.html).

  For example, if the table `foo` has columns `a` and `b` (and `b` *does not* have a `DEFAULT VALUE`), when you run the following command:

  ~~~ sql
  > INSERT INTO foo (a) VALUES (1);
  ~~~

  CockroachDB tries to write a `NULL` value into column `b`. If that column has the `NOT NULL` constraint, the `INSERT` statement is rejected.

- To add the `NOT NULL` constraint to an existing table column, use the [`ALTER COLUMN`](alter-column.html#set-not-null-constraint) statement.

- For more information about `NULL`, see [NULL handling](null-handling.html).

## Syntax

You can only apply the `NOT NULL` constraint to individual columns.

<div>
  {% include {{ page.version.version }}/sql/diagrams/not_null_column_level.html %}
</div>

 Parameter | Description
-----------|-------------
 `table_name` | The name of the table you're creating.
 `column_name` | The name of the constrained column.
 `column_type` | The constrained column's [data type](data-types.html).
 `column_constraints` | Any other column-level [constraints](constraints.html) you want to apply to this column.
 `column_def` | Definitions for any other columns in the table.
 `table_constraints` | Any table-level [constraints](constraints.html) you want to apply.

## Usage example

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE IF NOT EXISTS customers (
    customer_id INT         PRIMARY KEY,
    cust_name   STRING(30)  NULL,
    cust_email  STRING(100) NOT NULL
  );
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO customers (customer_id, cust_name, cust_email) VALUES (1, 'Smith', NULL);
~~~

~~~
pq: null value in column "cust_email" violates not-null constraint
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO customers (customer_id, cust_name) VALUES (1, 'Smith');
~~~

~~~
pq: null value in column "cust_email" violates not-null constraint
~~~

## See also

- [Constraints](constraints.html)
- [`DROP CONSTRAINT`](drop-constraint.html)
- [`CHECK` constraint](check.html)
- [`DEFAULT` constraint](default-value.html)
- [`REFERENCES` constraint (Foreign Key)](foreign-key.html)
- [`PRIMARY KEY` constraint](primary-key.html)
- [`UNIQUE` constraint](unique.html)
- [`SHOW CONSTRAINTS`](show-constraints.html)
- [`NULL HANDLING`](null-handling.html)
