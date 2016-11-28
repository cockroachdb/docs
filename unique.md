---
title: Unique Constraint
summary: The Unique constraint specifies that the columns values are unique, though they may contain NULL values.
toc: false
---

The Unique [constraints](constraints.html) specifies that the columns values are unique, though they may contain *NULL* values.

<div id="toc"></div>

## Details

- Be aware that if a table has a `UNIQUE` constraint on column(s) that are optional (nullable), it is still possible to insert duplicate rows that appear to violate the constraint if they contain a *NULL* value in at least one of the columns. This is because *NULL*s are never considered equal and hence don't violate the uniqueness constraint.

## Syntax

### Single Column (Column Level)

{% include sql/diagrams/unique_column_level.html %}

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
> CREATE TABLE warehouses (
    warehouse_id    INT        PRIMARY KEY NOT NULL,
    warehouse_name  STRING(35) UNIQUE,
    location_id     INT
  );
~~~

### Multiple Column (Table Level)

{% include sql/diagrams/unique_table_level.html %}

| Parameter | Description |
|-----------|-------------|
| `table_name` | The name of the table you're creating. |
| `column_def` | Definitions for any other columns in the table. |
| `name` | The name you want to use for the constraint, which must be unique to its table and follow these [identifier rules](keywords-and-identifiers.html#identifiers). |
| `column_name` | The name of the column you want to constrain.|
| `table_constraints` | Any table-level [constraints](constraints.html) you want to apply. |

**Example**

~~~ sql
> CREATE TABLE logon (
    login_id  INT PRIMARY KEY, 
    customer_id   INT,
    logon_date    TIMESTAMP,
    UNIQUE (customer_id, logon_date)
  );
~~~

## Usage Example

Be aware that if a table has a `UNIQUE` constraint on column(s) that are optional (nullable), it is still possible to insert duplicate rows that appear to violate the constraint if they contain a *NULL* value in at least one of the columns. This is because *NULL*s are never considered equal and hence don't violate the uniqueness constraint.

~~~ sql
> CREATE TABLE IF NOT EXISTS logon (
    login_id INT PRIMARY KEY, 
    customer_id   INT NOT NULL,
    sales_id INT,
    UNIQUE (customer_id, sales_id)
  );

> INSERT INTO logon (login_id, customer_id, sales_id) VALUES (1, 2, NULL);
> INSERT INTO logon (login_id, customer_id, sales_id) VALUES (2, 2, NULL);
> SELECT * FROM logon;
~~~
~~~
+----------+-------------+----------+
| login_id | customer_id | sales_id |
+----------+-------------+----------+
|        1 |           2 | NULL     |
|        2 |           2 | NULL     |
+----------+-------------+----------+
~~~

## See Also

- [Constraints](constraints.html)
- [Check constraint](check.html)
- [Default Value constraint](default-value.html)
- [Foreign Key constraint](foreign-key.html)
- [Not Null constraint](not-null.html)
- [Primary Key constraint](primary-key.html)
- [`SHOW CONSTRAINTS`](show-constraints.html)
