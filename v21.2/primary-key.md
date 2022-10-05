---
title: Primary Key Constraint
summary: A primary key constraint specifies columns that can be used to uniquely identify rows in a table.
toc: true
docs_area: reference.sql
---

The `PRIMARY KEY` [constraint](constraints.html) specifies that the constrained columns' values must uniquely identify each row. A table can only have one primary key, but it can have multiple [unique constraints](unique.html).

You should explicitly define a table's primary key in the [`CREATE TABLE`](create-table.html) statement. If you don't define a primary key at table creation time, CockroachDB will create a `rowid` column that is `NOT VISIBLE`, use the [`unique_rowid()` function](functions-and-operators.html#id-generation-functions) as its default value, and use that as the table's primary key.

You can [change the primary key](#changing-primary-key-columns) of an existing table with an [`ALTER TABLE ... ALTER PRIMARY KEY`](alter-primary-key.html) statement, or by using [`DROP CONSTRAINT`](drop-constraint.html) and then [`ADD CONSTRAINT`](add-constraint.html) in the same transaction. You cannot fully drop the `PRIMARY KEY` constraint on a table without replacing it as it provides an intrinsic structure to the table's data.

## Syntax

`PRIMARY KEY` constraints can be defined at the [table level](#table-level). However, if you only want the constraint to apply to a single column, it can be applied at the [column level](#column-level).

### Column level

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/primary_key_column_level.html %}
</div>

 Parameter | Description
-----------|-------------
 `table_name` | The name of the table you're creating.
 `column_name` | The name of the Primary Key column. For [multi-region tables](multiregion-overview.html#table-localities), you can use the `crdb_region` column within a composite primary key in the event the original primary key may contain non-unique entries across multiple, unique regions.
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
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/primary_key_table_level.html %}
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

For best practices, see [Schema Design: Select primary key columns](schema-design-table.html#select-primary-key-columns).

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

## Changing primary key columns

You can change the primary key of an existing table by doing one of the following:

- Issuing an [`ALTER TABLE ... ALTER PRIMARY KEY`](alter-primary-key.html) statement. When you change a primary key with `ALTER PRIMARY KEY`, the old primary key index becomes a secondary index. This helps optimize the performance of queries that still filter on the old primary key column.
- Issuing an [`ALTER TABLE ... DROP CONSTRAINT ... PRIMARY KEY`](drop-constraint.html) statement to drop the primary key, followed by an [`ALTER TABLE ... ADD CONSTRAINT ... PRIMARY KEY`](add-constraint.html) statement, in the same transaction, to add a new primary key. This replaces the existing primary key without creating a secondary index from the old primary key. For examples, see the [`ADD CONSTRAINT`](add-constraint.html#examples) and [`DROP CONSTRAINT`](drop-constraint.html#examples) pages.

{{site.data.alerts.callout_info}}
You can use an [`ADD CONSTRAINT ... PRIMARY KEY`](add-constraint.html) statement without a [`DROP CONSTRAINT ... PRIMARY KEY`](drop-constraint.html) if the primary key was not explicitly defined at [table creation](create-table.html), and the current [primary key is on `rowid`](indexes.html#creation).
{{site.data.alerts.end}}

## See also

- [Constraints](constraints.html)
- [`CHECK` constraint](check.html)
- [`DEFAULT` constraint](default-value.html)
- [`REFERENCES` constraint (Foreign Key)](foreign-key.html)
- [`PRIMARY KEY` constraint](primary-key.html)
- [`NOT NULL` constraint](not-null.html)
- [`UNIQUE` constraint](unique.html)
- [`SHOW CONSTRAINTS`](show-constraints.html)
- [`ALTER PRIMARY KEY`](alter-primary-key.html)
- [`ALTER TABLE`](alter-table.html)
