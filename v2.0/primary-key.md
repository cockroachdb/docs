---
title: Primary Key Constraint
summary: The Primary Key constraint specifies that the columns can be used to uniquely identify rows in a table.
toc: false
---

The Primary Key [constraint](constraints.html) specifies that the constrained columns' values must uniquely identify each row.

Unlike other constraints which have very specific uses, the Primary Key constraint *should be used for every table* because it provides an intrinsic structure to the table's data. This both makes it easier to understand, as well as improving query performance.

{{site.data.alerts.callout_info}}A table's primary key can only be specified in the <a href="create-table.html"><code>CREATE TABLE</code></a> statement. It can't be changed later using <code>ALTER TABLE</code>, though it is possible to <a href="constraints.html#change-constraints">go through a process</a> to create a new table with the new primary key you want and then migrate the data.{{site.data.alerts.end}}

<div id="toc"></div>

## Details

- Tables can only have one primary key.
- To ensure each row has a unique identifier, the Primary Key constraint combines the properties of both the [Unique](unique.html) and [Not Null](not-null.html) constraints. The properties of both constraints are necessary to make sure each row's primary key columns contain distinct sets of values.

  - The properties of the Unique constraint ensure that each value is distinct from all other values.

  - However, because *NULL* values never equal other *NULL* values, the Unique constraint is not enough (two rows can appear the same if one of the values is *NULL*). To prevent the appearance of duplicated values, the Primary Key constraint also enforces the properties of the Not Null constraint.

- The columns in the Primary Key constraint are used to create its `primary` [index](indexes.html), which CockroachDB uses by default to access the table's data.

  This index does not take up additional disk space (unlike secondary indexes, which do) because CockroachDB uses the `primary` index to structure the table's data in the key-value layer. For more information, see our blog post [SQL in CockroachDB: Mapping Table Data to Key-Value Storage](https://www.cockroachlabs.com/blog/sql-in-cockroachdb-mapping-table-data-to-key-value-storage/).

- For optimal performance, we recommend defining a primary key for *every* table. 

  If you create a table without defining a primary key, CockroachDB uses a unique identifier for each row, which it then uses for the `primary` index. Because you cannot meaningfully use this unique row identifier column to filter table data, it does not offer any performance optimization. This means you will always have improved performance by defining a primary key for a table. For more information, see our blog post [Index Selection in CockroachDB](https://www.cockroachlabs.com/blog/index-selection-cockroachdb-2/).

## Syntax

Primary Key constraints can be defined at the [table level](#table-level). However, if you only want the constraint to apply to a single column, it can be applied at the [column level](#column-level).

### Column Level

{% include sql/{{ page.version.version }}/diagrams/primary_key_column_level.html %}

| Parameter | Description |
|-----------|-------------|
| `table_name` | The name of the table you're creating. |
| `column_name` | The name of the Primary Key column. |
| `column_type` | The Primary Key column's [data type](data-types.html). |
| `column_constraints` | Any other column-level [constraints](constraints.html) you want to apply to this column. |
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

### Table Level

{% include sql/{{ page.version.version }}/diagrams/primary_key_table_level.html %}

| Parameter | Description |
|-----------|-------------|
| `table_name` | The name of the table you're creating. |
| `column_def` | Definitions for any other columns in the table. |
| `name` | The name you want to use for the constraint, which must be unique to its table and follow these [identifier rules](keywords-and-identifiers.html#identifiers). |
| `column_name` | The name of the column you want to use as the Primary Key.<br/><br/>The order in which you list columns here affects the structure of the `primary` index.|
| `table_constraints` | Any other table-level [constraints](constraints.html) you want to apply. |

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

