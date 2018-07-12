---
title: Unique Constraint
summary: The Unique constraint specifies that each non-NULL value in the constrained column must be unique.
toc: true
---

The Unique [constraint](constraints.html) specifies that each non-*NULL* value in the constrained column must be unique.


## Details

- You can insert *NULL* values into columns with the Unique constraint because *NULL* is the absence of a value, so it is never equal to other *NULL* values and not considered a duplicate value. This means that it's possible to insert rows that appear to be duplicates if one of the values is *NULL*.
  
  If you need to strictly enforce uniqueness, use the [Not Null constraint](not-null.html) in addition to the Unique constraint. You can also achieve the same behavior through the table's [Primary Key](primary-key.html).

- Columns with the Unique constraint automatically have an [index](indexes.html) created with the name `<table name>_<columns>_key`. To avoid having two identical indexes, you should not create indexes that exactly match the Unique constraint's columns and order. <br/><br/>The Unique constraint depends on the automatically created index, so dropping the index also drops the Unique constraint.
- When using the Unique constraint on multiple columns, the collective values of the columns must be unique. This *does not* mean that each value in each column must be unique, as if you had applied the Unique constraint to each column individually.
- You can define the Unique constraint when [creating a table](#syntax), or you can add it to existing tables through [`ADD CONSTRAINT`](add-constraint.html#add-the-unique-constraint).

## Syntax

Unique constraints can be defined at the [table level](#table-level). However, if you only want the constraint to apply to a single column, it can be applied at the [column level](#column-level).

### Column Level

<div>
{% include {{ page.version.version }}/sql/diagrams/unique_column_level.html %}
</div>

| Parameter | Description |
|-----------|-------------|
| `table_name` | The name of the table you're creating. |
| `column_name` | The name of the constrained column. |
| `column_type` | The constrained column's [data type](data-types.html). |
| `column_constraints` | Any other column-level [constraints](constraints.html) you want to apply to this column. |
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

### Table Level

<div>
{% include {{ page.version.version }}/sql/diagrams/unique_table_level.html %}
</div>

| Parameter | Description |
|-----------|-------------|
| `table_name` | The name of the table you're creating. |
| `column_def` | Definitions for any other columns in the table. |
| `name` | The name you want to use for the constraint, which must be unique to its table and follow these [identifier rules](keywords-and-identifiers.html#identifiers). |
| `column_name` | The name of the column you want to constrain.|
| `table_constraints` | Any other table-level [constraints](constraints.html) you want to apply. |

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

~~~ sql
> CREATE TABLE IF NOT EXISTS logon (
    login_id INT PRIMARY KEY, 
    customer_id   INT NOT NULL,
    sales_id INT,
    UNIQUE (customer_id, sales_id)
  );

> INSERT INTO logon (login_id, customer_id, sales_id) VALUES (1, 2, 1);

> INSERT INTO logon (login_id, customer_id, sales_id) VALUES (2, 2, 1);
~~~
~~~
duplicate key value (customer_id,sales_id)=(2,1) violates unique constraint "logon_customer_id_sales_id_key"
~~~

As mentioned in the [details](#details) above, it is possible when using the Unique constraint alone to insert *NULL* values in a way that causes rows to appear to have rows with duplicate values.

~~~ sql
> INSERT INTO logon (login_id, customer_id, sales_id) VALUES (3, 2, NULL);

> INSERT INTO logon (login_id, customer_id, sales_id) VALUES (4, 2, NULL);

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

## See Also

- [Constraints](constraints.html)
- [`DROP CONSTRAINT`](drop-constraint.html)
- [Check constraint](check.html)
- [Default Value constraint](default-value.html)
- [Foreign Key constraint](foreign-key.html)
- [Not Null constraint](not-null.html)
- [Primary Key constraint](primary-key.html)
- [`SHOW CONSTRAINTS`](show-constraints.html)
