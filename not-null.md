---
title: Not Null Constraint
summary: The NOT NULL constraint specifies the column may not contain NULL values.
toc: false
---

The Not Null [constraint](constraints.html) specifies the column may not contain *NULL* values.

<div id="toc"></div>

## Details

For more information about *NULL*, see [Null Handling](null-handling.html).

## Syntax

{% include sql/diagrams/not_null_column_level.html %}

| Parameter | Description |
|-----------|-------------|
| `table_name` | The name of the table you're creating. |
| `column_name` | The name of the constrained column. |
| `column_type` | The constrained column's [data type](data-types.html). |
| `column_constraints` | Any other column-level [constraints](constraints.html) you want to apply. |
| `column_def` | Definitions for any other columns in the table. |
| `table_constraints` | Any table-level [constraints](constraints.html) you want to apply. |

**Example**

~~~ sql
> CREATE TABLE customers (
    customer_id INT         PRIMARY KEY,
    cust_name   STRING(30)  NULL,
    cust_email  STRING(100) NOT NULL
  );
~~~

{{site.data.alerts.callout_info}}You cannot apply the Not Null constraint to multiple columns (i.e. at the table level).{{site.data.alerts.end}}

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

## See Also

- [Constraints](constraints.html)
- [Check constraint](check.html)
- [Default Value constraint](default-value.html)
- [Foreign Key constraint](foreign-key.html)
- [Primary Key constraint](primary-key.html)
- [Unique constraint](unique.html)
- [`SHOW CONSTRAINTS`](show-constraints.html)
