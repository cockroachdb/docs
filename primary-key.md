---
title: Primary Key Constraint
summary: The Primary Key constraint specifics that the columns can be used to uniquely identify rows in a table; this means it combines both the Unique and Not Null constraints.
toc: false
---

The Primary Key [constraints](constraints.html) specifics that the columns can be used to uniquely identify rows in a table; this means it combines both the Unique and Not Null constraints.

{{site.data.alerts.callout_info}}The Primary Key for a table can only be specified in the <a href="create-table.html"><code>CREATE TABLE</code></a> statement. It can't be changed later using <code>ALTER TABLE</code>.{{site.data.alerts.end}}

<div id="toc"></div>

## Details

- A Primary Key constraint requires that the column values are unique and **do not** contain *NULL* values. You can optionally give the constraint a name using the `CONSTRAINT name` syntax, otherwise the constraint and its associated unique index are called **primary**. 
   {{site.data.alerts.callout_info}}Strictly speaking, a primary key's unique index is not created, it's derived from the keys under which the data is stored so it takes no additional space. However, it appears as a normal unique index when using commands like <code>SHOW INDEXES</code>.{{site.data.alerts.end}}
- Columns that are part of a Primary Key are mandatory (NOT NULL). If an optional (nullable) column is made part of a Primary Key, it is made mandatory (NOT NULL). 

## Syntax

### Single Column (Column Level)

{% include sql/diagrams/primary_key_column_level.html %}

| Parameter | Description |
|-----------|-------------|
| `table_name` | The name of the table you're creating. |
| `column_name` | The name of the Primary Key column. |
| `column_type` | The Primary Key column's [data type](data-types.html). |
| `column_constraints` | Any other column-level [constraints](constraints.html) you want to apply. |
| `column_def` | Definitions for any other columns in the table. |
| `table_constraints` | Any table-level [constraints](constraints.html) you want to apply. |

**Example**

~~~ sql 
> CREATE TABLE orders (
    order_id        INT PRIMARY KEY,
    order_date      TIMESTAMP NOT NULL,
    order_mode      STRING(8),
    customer_id     INT,
    order_status    INT
  );
~~~

### Multiple Column (Table Level)

{% include sql/diagrams/primary_key_table_level.html %}

| Parameter | Description |
|-----------|-------------|
| `table_name` | The name of the table you're creating. |
| `column_def` | Definitions for any other columns in the table. |
| `name` | The name you want to use for the constraint, which must be unique to its table and follow these [identifier rules](keywords-and-identifiers.html#identifiers). |
| `column_name` | The name of the column you want to use as the Primary Key.<br/><br/>The order in which you list columns here affects the structure of the `primary` index.|
| `table_constraints` | Any table-level [constraints](constraints.html) you want to apply. |

**Example**

~~~ sql
> CREATE TABLE IF NOT EXISTS inventories (
    product_id        INT,
    warehouse_id      INT,
    quantity_on_hand  INT NOT NULL,
    PRIMARY KEY (product_id, warehouse_id)
  );
~~~

## Usage Example

~~~ sql
> CREATE TABLE IF NOT EXISTS inventories (
    product_id        INT,
    warehouse_id      INT,
    quantity_on_hand  INT NOT NULL,
    PRIMARY KEY (product_id, warehouse_id)
  );

> INSERT INTO inventories VALUES (1, 1, 100);
> INSERT INTO inventories VALUES (1, 1, 200);
~~~
~~~
pq: duplicate key value (product_id,warehouse_id)=(1,1) violates unique constraint "primary"
~~~
~~~ sql
> INSERT INTO inventories VALUES (1, NULL, 100);
~~~
~~~
pq: null value in column "warehouse_id" violates not-null constraint
~~~





## See Also

- [Constraints](constraints.html)
- [Check constraint](check.html)
- [Default Value constraint](default-value.html)
- [Foreign Key constraint](foreign-key.html)
- [Not Null constraint](not-null.html)
- [Unique constraint](unique.html)
- [`SHOW CONSTRAINTS`](show-constraints.html)
