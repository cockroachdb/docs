---
title: Not Null Constraint
summary: The NOT NULL constraint specifies the column may not contain NULL values.
toc: true
---

The Not Null [constraint](constraints.html) specifies a column may not contain *NULL* values.


## Details

- `INSERT` or `UPDATE` statements containing *NULL* values are rejected. This includes `INSERT` statements that do not include values for any columns that do not have a [Default Value constraint](default-value.html). 

  For example, if the table `foo` has columns `a` and `b` (and `b` *does not* have a Default Value), when you run the following command:

  ~~~ sql
  > INSERT INTO foo (a) VALUES (1);
  ~~~

  CockroachDB tries to write a *NULL* value into column `b`. If that column has the Not Null constraint, the `INSERT` statement is rejected.

- You can only define the Not Null constraint when [creating a table](#syntax); you cannot add it to an existing table. However, you can [migrate data](constraints.html#table-migrations-to-add-or-change-immutable-constraints) from your current table to a new table with the constraint you want to use.
  {{site.data.alerts.callout_info}}In the future we plan to support adding the Not Null constraint to existing tables.{{site.data.alerts.end}}

- For more information about *NULL*, see [Null Handling](null-handling.html).

## Syntax

You can only apply the Not Null constraint to individual columns.

<div>
{% include {{ page.version.version }}/sql/diagrams/not_null_column_level.html %}
</div>

| Parameter | Description |
|-----------|-------------|
| `table_name` | The name of the table you're creating. |
| `column_name` | The name of the constrained column. |
| `column_type` | The constrained column's [data type](data-types.html). |
| `column_constraints` | Any other column-level [constraints](constraints.html) you want to apply to this column. |
| `column_def` | Definitions for any other columns in the table. |
| `table_constraints` | Any table-level [constraints](constraints.html) you want to apply. |

## Usage Example

~~~ sql
> CREATE TABLE IF NOT EXISTS customers (
    customer_id INT         PRIMARY KEY,
    cust_name   STRING(30)  NULL,
    cust_email  STRING(100) NOT NULL
  );

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

## See Also

- [Constraints](constraints.html)
- [`DROP CONSTRAINT`](drop-constraint.html)
- [Check constraint](check.html)
- [Default Value constraint](default-value.html)
- [Foreign Key constraint](foreign-key.html)
- [Primary Key constraint](primary-key.html)
- [Unique constraint](unique.html)
- [`SHOW CONSTRAINTS`](show-constraints.html)
