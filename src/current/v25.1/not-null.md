---
title: NOT NULL constraint
summary: The NOT NULL constraint specifies the column may not contain NULL values.
toc: true
docs_area: reference.sql
---

The `NOT NULL` [constraint]({{ page.version.version }}/constraints.md) specifies a column may not contain [`NULL`]({{ page.version.version }}/null-handling.md) values.

## Details

- `INSERT` or `UPDATE` statements containing `NULL` values are rejected. This includes `INSERT` statements that do not include values for any columns that do not have a [`DEFAULT` value constraint]({{ page.version.version }}/default-value.md).

  For example, if the table `foo` has columns `a` and `b` (and `b` *does not* have a `DEFAULT VALUE`), when you run the following command:

  ~~~ sql
  > INSERT INTO foo (a) VALUES (1);
  ~~~

  CockroachDB tries to write a `NULL` value into column `b`. If that column has the `NOT NULL` constraint, the `INSERT` statement is rejected.

- To add the `NOT NULL` constraint to an existing table column, use the [`ALTER COLUMN`]({{ page.version.version }}/alter-table.md#set-not-null-constraint) statement.

- For more information about `NULL`, see [NULL handling]({{ page.version.version }}/null-handling.md).

## Syntax

You can only apply the `NOT NULL` constraint to individual columns.

<div>
</div>

 Parameter | Description
-----------|-------------
 `table_name` | The name of the table you're creating.
 `column_name` | The name of the constrained column.
 `column_type` | The constrained column's [data type]({{ page.version.version }}/data-types.md).
 `column_constraints` | Any other column-level [constraints]({{ page.version.version }}/constraints.md) you want to apply to this column.
 `column_def` | Definitions for any other columns in the table.
 `table_constraints` | Any table-level [constraints]({{ page.version.version }}/constraints.md) you want to apply.

## Usage example

~~~ sql
> CREATE TABLE IF NOT EXISTS customers (
    customer_id INT         PRIMARY KEY,
    cust_name   STRING(30)  NULL,
    cust_email  STRING(100) NOT NULL
  );
~~~

~~~ sql
> INSERT INTO customers (customer_id, cust_name, cust_email) VALUES (1, 'Smith', NULL);
~~~

~~~
pq: null value in column "cust_email" violates not-null constraint
~~~

~~~ sql
> INSERT INTO customers (customer_id, cust_name) VALUES (1, 'Smith');
~~~

~~~
pq: null value in column "cust_email" violates not-null constraint
~~~

## See also

- [Constraints]({{ page.version.version }}/constraints.md)
- [`DROP CONSTRAINT`]({{ page.version.version }}/alter-table.md#drop-constraint)
- [`CHECK` constraint]({{ page.version.version }}/check.md)
- [`DEFAULT` constraint]({{ page.version.version }}/default-value.md)
- [`REFERENCES` constraint (Foreign Key)]({{ page.version.version }}/foreign-key.md)
- [`PRIMARY KEY` constraint]({{ page.version.version }}/primary-key.md)
- [`UNIQUE` constraint]({{ page.version.version }}/unique.md)
- [`SHOW CONSTRAINTS`]({{ page.version.version }}/show-constraints.md)
- [`NULL HANDLING`]({{ page.version.version }}/null-handling.md)