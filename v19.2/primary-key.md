---
title: Primary Key Constraint
summary: A primary key constraint specifies columns that can be used to uniquely identify rows in a table.
toc: true
---

The `PRIMARY KEY` [constraint](constraints.html) specifies that the constrained columns' values must uniquely identify each row.

Unlike other constraints which have very specific uses, the `PRIMARY KEY` constraint *must be used for every table* because it provides an intrinsic structure to the table's data.

A table's primary key should be explicitly defined in the [`CREATE TABLE`](create-table.html) statement. Tables can only have one primary key.

{{site.data.alerts.callout_info}}
A table's primary key can only be specified in the [`CREATE TABLE`](create-table.html) statement. It cannot be changed later using `ALTER TABLE`, though it is possible to [go through a process](constraints.html#change-constraints) to create a new table with the new primary key you want and then migrate the data.
{{site.data.alerts.end}}

## Syntax

`PRIMARY KEY` constraints can be defined at the [table level](#table-level). However, if you only want the constraint to apply to a single column, it can be applied at the [column level](#column-level).

### Column level

<div>
  {% include {{ page.version.version }}/sql/diagrams/primary_key_column_level.html %}
</div>

 Parameter | Description
-----------|-------------
 `table_name` | The name of the table you're creating.
 `column_name` | The name of the Primary Key column.
 `column_type` | The Primary Key column's [data type](data-types.html).
 `column_constraints` | Any other column-level [constraints](constraints.html) you want to apply to this column.
 `column_def` | Definitions for any other columns in the table.
 `table_constraints` | Any table-level [constraints](constraints.html) you want to apply.

**Example**

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE orders (
    order_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_date      TIMESTAMP NOT NULL,
    order_mode      STRING(8),
    customer_id     INT,
    order_status    INT
  );
~~~

### Table level

<div>
  {% include {{ page.version.version }}/sql/diagrams/primary_key_table_level.html %}
</div>

 Parameter | Description
-----------|-------------
 `table_name` | The name of the table you're creating.
 `column_def` | Definitions for any other columns in the table.
 `name` | The name you want to use for the constraint, which must be unique to its table and follow these [identifier rules](keywords-and-identifiers.html#identifiers).
 `column_name` | The name of the column you want to use as the `PRIMARY KEY`.<br/><br/>The order in which you list columns here affects the structure of the `primary` index.
 `table_constraints` | Any other table-level [constraints](constraints.html) you want to apply.

**Example**

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE IF NOT EXISTS inventories (
    product_id        INT,
    warehouse_id      INT,
    quantity_on_hand  INT NOT NULL,
    PRIMARY KEY (product_id, warehouse_id)
  );
~~~

## Details

The columns in the `PRIMARY KEY` constraint are used to create its `primary` [index](indexes.html), which CockroachDB uses by default to access the table's data. This index does not take up additional disk space (unlike secondary indexes, which do) because CockroachDB uses the `primary` index to structure the table's data in the key-value layer. For more information, see our blog post [SQL in CockroachDB: Mapping Table Data to Key-Value Storage](https://www.cockroachlabs.com/blog/sql-in-cockroachdb-mapping-table-data-to-key-value-storage/).

To ensure each row has a unique identifier, the `PRIMARY KEY` constraint combines the properties of both the [`UNIQUE`](unique.html) and [`NOT NULL`](not-null.html) constraints. The properties of both constraints are necessary to make sure each row's primary key columns contain distinct sets of values. The properties of the `UNIQUE` constraint ensure that each value is distinct from all other values. However, because *NULL* values never equal other *NULL* values, the `UNIQUE` constraint is not enough (two rows can appear the same if one of the values is *NULL*). To prevent the appearance of duplicated values, the `PRIMARY KEY` constraint also enforces the properties of the `NOT NULL` constraint.

## Performance considerations

When defining a primary key constraint, it's important to consider:

- How the data in the primary key column(s) is [distributed across a cluster](architecture/distribution-layer.html).

    Non-uniform data distributions can lead to hotspots on a single range, or cause [transaction contention](transactions.html#transaction-contention).

- The [data type](data-types.html) of the primary key column(s).

    A primary key column's data type can determine where its row data is stored on a cluster. For example, some data types are sequential in nature (e.g., [`TIMESTAMP`](timestamp.html)). Defining primary keys on columns of sequential data can result in data being concentrated in a smaller number of ranges, which can negatively affect performance.

For optimal performance, we recommend that you do the following:

- Define a primary key for every table.

    If you create a table without defining a primary key, CockroachDB will automatically create a primary key over a hidden, [`INT`](int.html)-typed column named `rowid`. By default, sequential, unique identifiers are generated for each row in the `rowid` column with the [`unique_rowid()` function](functions-and-operators.html#built-in-functions). The sequential nature of the `rowid` values can lead to a poor distribution of the data across a cluster, which can negatively affect performance. Furthermore, because you cannot meaningfully use the `rowid` column to filter table data, the primary key index on `rowid` does not offer any performance optimization. This means you will always have improved performance by defining a primary key for a table. For more information, see our blog post [Index Selection in CockroachDB](https://www.cockroachlabs.com/blog/index-selection-cockroachdb-2/).

- Define primary key constraints over multiple columns (i.e., use [composite primary keys](https://en.wikipedia.org/wiki/Composite_key)).

    When defining composite primary keys, make sure the data in the first column of the primary key prefix is well-distributed across the nodes in the cluster. To improve the performance of [ordered queries](query-order.html), you can add monotonically increasing primary key columns after the first column of the primary key prefix. For an example, see [Use multi-column primary keys](performance-best-practices-overview.html#use-multi-column-primary-keys) on the [SQL Performance Best Practices](performance-best-practices-overview.html) page.

- For single-column primary keys, use [`UUID`](uuid.html)-typed columns with [randomly-generated default values](performance-best-practices-overview.html#use-uuid-to-generate-unique-ids).

    Randomly generating `UUID` values ensures that the primary key values will be unique and well-distributed across a cluster.

- Avoid defining primary keys over a single column of sequential data.

    Querying a table with a primary key on a single sequential column (e.g., an auto-incrementing [`INT`](int.html) column) can result in single-range hotspots that negatively affect performance. Instead, use a composite key with a non-sequential prefix, or use a `UUID`-typed column.

## Example

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE IF NOT EXISTS inventories (
    product_id        INT,
    warehouse_id      INT,
    quantity_on_hand  INT NOT NULL,
    PRIMARY KEY (product_id, warehouse_id)
  );
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO inventories VALUES (1, 1, 100);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO inventories VALUES (1, 1, 200);
~~~

~~~
pq: duplicate key value (product_id,warehouse_id)=(1,1) violates unique constraint "primary"
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO inventories VALUES (1, NULL, 100);
~~~

~~~
pq: null value in column "warehouse_id" violates not-null constraint
~~~

## See also

- [Constraints](constraints.html)
- [`CHECK` constraint](check.html)
- [`DEFAULT` constraint](default-value.html)
- [`REFERENCES` constraint (Foreign Key)](foreign-key.html)
- [`PRIMARY KEY` constraint](primary-key.html)
- [`NOT NULL` constraint](not-null.html)
- [`UNIQUE` constraint](unique.html)
- [`SHOW CONSTRAINTS`](show-constraints.html)
