---
title: INTERLEAVE IN PARENT
summary: Interleaving tables improves query performance by optimizing the key-value structure of closely related table's data.
toc: true
toc_not_nested: true
---

{{site.data.alerts.callout_danger}}
`INTERLEAVE IN PARENT` was deprecated in CockroachDB v20.2, disabled by default in v21.1, and permanently removed in v21.2. We do not recommend interleaving tables or indexes in new clusters.

For details, see [Deprecation](#deprecation).
{{site.data.alerts.end}}

## How interleaved tables work

When tables are interleaved, data written to one table (known as the **child**) is inserted directly into another (known as the **parent**) in the key-value store. This is accomplished by matching the child table's Primary Key to the parent's.

### Interleave prefix

For interleaved tables to have Primary Keys that can be matched, the child table must use the parent table's entire Primary Key as a prefix of its own Primary Key––these matching columns are referred to as the **interleave prefix**. It's easiest to think of these columns as representing the same data, which is usually implemented with Foreign Keys.

{{site.data.alerts.callout_success}}To formally enforce the relationship between each table's interleave prefix columns, we recommend using <a href="foreign-key.html">Foreign Key constraints</a>.{{site.data.alerts.end}}

For example, if you want to interleave `orders` into `customers` and the Primary Key of customers is `id`, you need to create a column representing `customers.id` as the first column in the Primary Key of `orders`&mdash;e.g., with a column called `customer`. So the data representing `customers.id` is the interleave prefix, which exists in the `orders` table as the `customer` column.

### Key-value structure

When you write data into the child table, it is inserted into the key-value store immediately after the parent table's key matching the interleave prefix.

For example, if you interleave `orders` into `customers`, the `orders` data is written directly within the `customers` table in the key-value store. The following is a crude, illustrative example of what the keys would look like in this structure:

~~~
/customers/1
/customers/1/orders/1000
/customers/1/orders/1002
/customers/2
/customers/2/orders/1001
/customers/2/orders/1003
...
/customers/n/
/customers/n/orders/<order belonging to n>
~~~

By writing data in this way, related data is more likely to remain on the same key-value range, which can make it much faster to read from and write to. Using the above example, all of customer 1's data is going to be written to the same range, including its representation in both the `customers` and `orders` tables.

### Interleaved hierarchy

Interleaved tables typically work best when the tables form a hierarchy. For example, you could interleave the table `orders` (as the child) into the table `customers` (as the parent, which represents the people who placed the orders). You can extend this example by also interleaving the tables `invoices` (as a child) and `packages` (as a child) into `orders` (as the parent).

The entire set of these relationships is referred to as the **interleaved hierarchy**, which contains all of the tables related through [interleave prefixes](#interleave-prefix).

## Syntax

<div>
{% include {{ page.version.version }}/sql/diagrams/interleave.html %}
</div>

## Parameters

 Parameter | Description
-----------|-------------
 `CREATE TABLE ...` | For help with this section of the syntax, [`CREATE TABLE`](create-table.html).
 `opt_persistence_temp_table` |  Defines the table as a session-scoped temporary table. For more information, see [Temporary Tables](temporary-tables.html).<br><br>Note that the `LOCAL`, `GLOBAL`, and `UNLOGGED` options are no-ops, allowed by the parser for PostgresSQL compatibility.<br><br>**Support for temporary tables is [experimental](experimental-features.html#temporary-objects)**.
 `INTERLEAVE IN PARENT table_name` | The name of the parent table you want to interleave the new child table into.
 `name_list` | A comma-separated list of columns from the child table's Primary Key that represent the parent table's Primary Key (i.e., the interleave prefix).
 `opt_partition_by` | An [Enterprise-only](enterprise-licensing.html) option that lets you define table partitions at the row level. You can define table partitions by list or by range. See [Define Table Partitions](partitioning.html) for more information.
 `WITH storage_parameter` | <span class="version-tag">New in v20.2:</span> A comma-separated list of [spatial index tuning parameters](spatial-indexes.html#index-tuning-parameters). Supported parameters include `fillfactor`, `s2_max_level`, `s2_level_mod`, `s2_max_cells`, `geometry_min_x`, `geometry_max_x`, `geometry_min_y`, and `geometry_max_y`. The `fillfactor` parameter is a no-op, allowed for PostgreSQL-compatibility.<br><br>For details, see [Spatial index tuning parameters](spatial-indexes.html#index-tuning-parameters). For an example, see [Create a spatial index that uses all of the tuning parameters](spatial-indexes.html#create-a-spatial-index-that-uses-all-of-the-tuning-parameters).
 `ON COMMIT PRESERVE ROWS` | This clause is a no-op, allowed by the parser for PostgresSQL compatibility. CockroachDB only supports session-scoped [temporary tables](temporary-tables.html), and does not support the clauses `ON COMMIT DELETE ROWS` and `ON COMMIT DROP`, which are used to define transaction-scoped temporary tables in PostgreSQL.

## Deprecation

Interleaving tables and indexes is deprecated in CockroachDB v20.2 for the following reasons:

- Scans over tables or indexes with interleaved, child objects (i.e., interleaved tables or indexes) are much slower than scans over tables and indexes with no child objects, as the scans must traverse the parent object and all of its child objects.
- Database schema changes are slower for interleaved objects and their parents than they are for non-interleaved objects and objects with no interleaved children. For example, if you add or remove a column to a parent or child table, CockroachDB must rewrite the entire interleaved hierarchy for that table and its parents/children.
- [Internal benchmarks](https://github.com/cockroachdb/cockroach/issues/53455) have shown the performance benefits of interleaving tables and indexes are limited to a small number of use cases.

For more details, see the [GitHub tracking issue](https://github.com/cockroachdb/cockroach/issues/52009).

After [upgrading to v20.2](upgrade-cockroach-version.html), we recommend that you do the following:

- [Convert any existing interleaved tables to non-interleaved tables](#convert-interleaved-tables).
- [Replace any existing interleaved secondary indexes with non-interleaved indexes](#replace-interleaved-indexes).

{{site.data.alerts.callout_success}}
Test your [schema changes](online-schema-changes.html) in a non-production environment before implementing them in production.
{{site.data.alerts.end}}

### Convert interleaved tables

To convert an interleaved table to a non-interleaved table, issue an [`ALTER PRIMARY KEY`](alter-primary-key.html) statement on the table, specifying the existing primary key column(s) for the table, and no `INTERLEAVE IN PARENT` clause.

When converting interleaved tables with `ALTER PRIMARY KEY`, note the following:

- CockroachDB executes `ALTER PRIMARY KEY` statements as [online schema changes](online-schema-changes.html). This means that you can convert your interleaved tables to non-interleaved tables without experiencing any downtime.
- `ALTER PRIMARY KEY` statements can only convert a child table if that table is not a parent. If your cluster has child tables that are also parents, you must start from the bottom of the interleaving hierarchy and work your way up (i.e., start with child tables that are not parents).

For example, suppose you created an interleaved hierarchy between the `customers`, `orders`, and `packages` tables, using the following [`CREATE TABLE`](create-table.html) statements:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE customers (
    id INT PRIMARY KEY,
    name STRING(50)
  );
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE orders (
    customer INT,
    id INT,
    total DECIMAL(20, 5),
    PRIMARY KEY (customer, id),
    CONSTRAINT fk_customer FOREIGN KEY (customer) REFERENCES customers
  ) INTERLEAVE IN PARENT customers (customer);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE packages (
    customer INT,
    "order" INT,
    id INT,
    address STRING(50),
    delivered BOOL,
    delivery_date DATE,
    PRIMARY KEY (customer, "order", id),
    CONSTRAINT fk_order FOREIGN KEY (customer, "order") REFERENCES orders
  ) INTERLEAVE IN PARENT orders (customer, "order");
~~~

The `INTERLEAVE IN PARENT` clauses will appear in `SHOW CREATE` statements for the `packages` and `orders` tables:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE orders;
~~~

~~~
  table_name |                                  create_statement
-------------+-------------------------------------------------------------------------------------
  orders     | CREATE TABLE public.orders (
             |     customer INT8 NOT NULL,
             |     id INT8 NOT NULL,
             |     total DECIMAL(20,5) NULL,
             |     CONSTRAINT "primary" PRIMARY KEY (customer ASC, id ASC),
             |     CONSTRAINT fk_customer FOREIGN KEY (customer) REFERENCES public.customers(id),
             |     FAMILY "primary" (customer, id, total)
             | ) INTERLEAVE IN PARENT public.customers (customer)
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE packages;
~~~

~~~
  table_name |                                        create_statement
-------------+--------------------------------------------------------------------------------------------------
  packages   | CREATE TABLE public.packages (
             |     customer INT8 NOT NULL,
             |     "order" INT8 NOT NULL,
             |     id INT8 NOT NULL,
             |     address STRING(50) NULL,
             |     delivered BOOL NULL,
             |     delivery_date DATE NULL,
             |     CONSTRAINT "primary" PRIMARY KEY (customer ASC, "order" ASC, id ASC),
             |     CONSTRAINT fk_order FOREIGN KEY (customer, "order") REFERENCES public.orders(customer, id),
             |     FAMILY "primary" (customer, "order", id, address, delivered, delivery_date)
             | ) INTERLEAVE IN PARENT public.orders (customer, "order")
(1 row)
~~~

To convert these tables to non-interleaved tables, use `ALTER PRIMARY KEY` statements, starting at the bottom of the hierarchy (i.e., with `packages`):

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE packages ALTER PRIMARY KEY USING COLUMNS (customer, "order", id);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE orders ALTER PRIMARY KEY USING COLUMNS (customer, id);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE orders;
~~~

~~~
  table_name |                                  create_statement
-------------+-------------------------------------------------------------------------------------
  orders     | CREATE TABLE public.orders (
             |     customer INT8 NOT NULL,
             |     id INT8 NOT NULL,
             |     total DECIMAL(20,5) NULL,
             |     CONSTRAINT "primary" PRIMARY KEY (customer ASC, id ASC),
             |     CONSTRAINT fk_customer FOREIGN KEY (customer) REFERENCES public.customers(id),
             |     UNIQUE INDEX orders_customer_id_key (customer ASC, id ASC),
             |     FAMILY "primary" (customer, id, total)
             | )
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE packages;
~~~

~~~
  table_name |                                        create_statement
-------------+--------------------------------------------------------------------------------------------------
  packages   | CREATE TABLE public.packages (
             |     customer INT8 NOT NULL,
             |     "order" INT8 NOT NULL,
             |     id INT8 NOT NULL,
             |     address STRING(50) NULL,
             |     delivered BOOL NULL,
             |     delivery_date DATE NULL,
             |     CONSTRAINT "primary" PRIMARY KEY (customer ASC, "order" ASC, id ASC),
             |     CONSTRAINT fk_order FOREIGN KEY (customer, "order") REFERENCES public.orders(customer, id),
             |     UNIQUE INDEX packages_customer_order_id_key (customer ASC, "order" ASC, id ASC),
             |     FAMILY "primary" (customer, "order", id, address, delivered, delivery_date)
             | )
(1 row)
~~~

### Replace interleaved indexes

Interleaved [secondary indexes](indexes.html) cannot be converted to non-interleaved indexes. You must [drop the existing index](drop-index.html), and then [create a new index](create-index.html) without an `INTERLEAVE IN PARENT` clause.

## See also

- [`CREATE TABLE`](create-table.html)
- [Foreign Keys](foreign-key.html)
- [Column Families](column-families.html)
