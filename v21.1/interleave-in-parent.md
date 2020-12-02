---
title: INTERLEAVE IN PARENT
summary: Interleaving tables improves query performance by optimizing the key-value structure of closely related table's data.
toc: true
toc_not_nested: true
---

Interleaving tables improves query performance by optimizing the key-value structure of closely related tables, attempting to keep data on the same [key-value range](frequently-asked-questions.html#how-does-cockroachdb-scale) if it's likely to be read and written together.

{{site.data.alerts.callout_info}}Interleaving tables does not affect their behavior within SQL.{{site.data.alerts.end}}


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

## When to interleave tables

{% include {{ page.version.version }}/faq/when-to-interleave-tables.html %}

### Interleaved hierarchy

Interleaved tables typically work best when the tables form a hierarchy. For example, you could interleave the table `orders` (as the child) into the table `customers` (as the parent, which represents the people who placed the orders). You can extend this example by also interleaving the tables `invoices` (as a child) and `packages` (as a child) into `orders` (as the parent).

The entire set of these relationships is referred to as the **interleaved hierarchy**, which contains all of the tables related through [interleave prefixes](#interleave-prefix).

### Benefits

In general, reads, writes, and joins of values related through the interleave prefix are *much* faster. However, you can also improve performance with any of the following:

- Filtering more columns in the interleave prefix (from left to right).

    For example, if the interleave prefix of `packages` is `(customer, order)`, filtering on `customer` would be fast, but filtering on `customer` *and* `order` would be faster.

- Using only tables in the interleaved hierarchy.

<a name="fast-path-deletes"></a>

Fast deletes are available for interleaved tables that use [`ON DELETE CASCADE`](add-constraint.html#add-the-foreign-key-constraint-with-cascade).  Deleting rows from such tables will use an optimized code path and run much faster, as long as the following conditions are met:

- The table or any of its interleaved tables do not have any secondary indices.
- The table or any of its interleaved tables are not referenced by any other table outside of them by foreign key.
- All of the interleaved relationships use `ON DELETE CASCADE` clauses.

The performance boost when using this fast path is several orders of magnitude, potentially reducing delete times from seconds to nanoseconds.

For an example showing how to create tables that meet these criteria, see [Interleaved fast path deletes](#interleaved-fast-path-deletes) below.

### Tradeoffs

- In general, reads and deletes over ranges of table values (e.g., `WHERE column > value`) in interleaved tables are slower.

    However, an exception to this is performing operations on ranges of table values in the greatest descendant in the interleaved hierarchy that filters on all columns of the interleave prefix with constant values.

    For example, if the interleave prefix of `packages` is `(customer, order)`, filtering on the entire interleave prefix with constant values while calculating a range of table values on another column, like `WHERE customer = 1 AND order = 1001 AND delivery_date > DATE '2016-01-25'`, would still be fast.

    Another exception is the [fast path delete optimization](#fast-path-deletes), which is available if you set up your tables according to certain criteria.

- If the amount of interleaved data stored for any Primary Key value of the root table is larger than [a key-value range's maximum size](configure-replication-zones.html#replication-zone-variables) (512 MiB by default), the interleaved optimizations will be diminished.

    For example, if one customer has 200MB of order data, their data is likely to be spread across multiple key-value ranges and CockroachDB will not be able to access it as quickly, despite it being interleaved.

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
 `opt_partition_by` | An [enterprise-only](enterprise-licensing.html) option that lets you define table partitions at the row level. You can define table partitions by list or by range. See [Define Table Partitions](partitioning.html) for more information.
 `WITH storage_parameter` |  A comma-separated list of [spatial index tuning parameters](spatial-indexes.html#index-tuning-parameters). Supported parameters include `fillfactor`, `s2_max_level`, `s2_level_mod`, `s2_max_cells`, `geometry_min_x`, `geometry_max_x`, `geometry_min_y`, and `geometry_max_y`. The `fillfactor` parameter is a no-op, allowed for PostgreSQL-compatibility.<br><br>For details, see [Spatial index tuning parameters](spatial-indexes.html#index-tuning-parameters). For an example, see [Create a spatial index that uses all of the tuning parameters](spatial-indexes.html#create-a-spatial-index-that-uses-all-of-the-tuning-parameters).
 `ON COMMIT PRESERVE ROWS` | This clause is a no-op, allowed by the parser for PostgresSQL compatibility. CockroachDB only supports session-scoped [temporary tables](temporary-tables.html), and does not support the clauses `ON COMMIT DELETE ROWS` and `ON COMMIT DROP`, which are used to define transaction-scoped temporary tables in PostgreSQL.

## Requirements

- You can only interleave tables when creating the child table.

- Each child table's Primary Key must contain its parent table's Primary Key as a prefix (known as the **interleave prefix**).

    For example, if the parent table's primary key is `(a INT, b STRING)`, the child table's primary key could be `(a INT, b STRING, c DECIMAL)`.

    {{site.data.alerts.callout_info}}This requirement is enforced only by ensuring that the columns use the same data types. However, we recommend ensuring the columns refer to the same values by using the  <a href="foreign-key.html">Foreign Key constraint</a>.{{site.data.alerts.end}}

- Interleaved tables cannot be the child of more than 1 parent table. However, each parent table can have many children tables. Children tables can also be parents of interleaved tables.

- You cannot interleave a [hash-sharded index]((indexes.html#hash-sharded-indexes).

## Recommendations

- Use interleaved tables when your schema forms a hierarchy, and the Primary Key of the root table (for example, a "user ID" or "account ID") is a parameter to most of your queries.

- To enforce the relationship between the parent and children table's Primary Keys, use [Foreign Key constraints](foreign-key.html) on the child table.

- In cases where you're uncertain if interleaving tables will improve your queries' performance, test how tables perform under load when they're interleaved and when they aren't.

## Examples

### Interleaving tables

This example creates an interleaved hierarchy between `customers`, `orders`, and `packages`, as well as the appropriate Foreign Key constraints. You can see that each child table uses its parent table's Primary Key as a prefix of its own Primary Key (the **interleave prefix**).

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE customers (
    id INT PRIMARY KEY,
    name STRING(50)
  );
~~~

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE orders (
    customer INT,
    id INT,
    total DECIMAL(20, 5),
    PRIMARY KEY (customer, id),
    CONSTRAINT fk_customer FOREIGN KEY (customer) REFERENCES customers
  ) INTERLEAVE IN PARENT customers (customer);
~~~

{% include copy-clipboard.html %}
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

### Interleaved fast path deletes

This example shows how to create interleaved tables that enable our SQL engine to use a code path optimized to run much faster when deleting rows from these tables.  For more information about the criteria for enabling this optimization, see [fast path deletes](#fast-path-deletes) above.

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE items (id INT PRIMARY KEY);
~~~

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE IF NOT EXISTS bundles (
    id INT,
    item_id INT,
    PRIMARY KEY (item_id, id),
    FOREIGN KEY (item_id) REFERENCES items (id) ON DELETE CASCADE ON UPDATE CASCADE
  )
  INTERLEAVE IN PARENT items (item_id);
~~~

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE IF NOT EXISTS suppliers (
    id INT,
    item_id INT,
    PRIMARY KEY (item_id, id),
    FOREIGN KEY (item_id) REFERENCES items (id) ON DELETE CASCADE ON UPDATE CASCADE
  )
  INTERLEAVE IN PARENT items (item_id);
~~~

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE IF NOT EXISTS orders (
    id INT,
    item_id INT,
    bundle_id INT,
    FOREIGN KEY (item_id, bundle_id) REFERENCES bundles (item_id, id) ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY (item_id, bundle_id, id)
  )
  INTERLEAVE IN PARENT bundles (item_id, bundle_id);
~~~

The following statement will delete some rows from the `parent` table, very quickly:

{% include copy-clipboard.html %}
~~~ sql
> DELETE FROM items WHERE id <= 5;
~~~

### Key-value storage example

It can be easier to understand what interleaving tables does by seeing what it looks like in the key-value store. For example, using the above example of interleaving `orders` in `customers`, we could insert the following values:

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO customers (id, name) VALUES
    (1, 'Ha-Yun'),
    (2, 'Emanuela');
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO orders (customer, id, total) VALUES
    (1, 1000, 100.00),
    (2, 1001, 90.00),
    (1, 1002, 80.00),
    (2, 1003, 70.00);
~~~

Using an illustrative format of the key-value store (keys are on the left; values are represented by `-> value`), the data would be written like this:

~~~
/customers/<customers.id = 1> -> 'Ha-Yun'
/customers/<orders.customer = 1>/orders/<orders.id = 1000> -> 100.00
/customers/<orders.customer = 1>/orders/<orders.id = 1002> -> 80.00
/customers/<customers.id = 2> -> 'Emanuela'
/customers/<orders.customer = 2>/orders/<orders.id = 1001> -> 90.00
/customers/<orders.customer = 2>/orders/<orders.id = 1003> -> 70.00
~~~

You'll notice that `customers.id` and `orders.customer` are written into the same position in the key-value store. This is how CockroachDB relates the two table's data for the interleaved structure. By storing data this way, accessing any of the `orders` data alongside the `customers` is much faster.

{{site.data.alerts.callout_info}}If we didn't set Foreign Key constraints between <code>customers.id</code> and <code>orders.customer</code> and inserted <code>orders.customer = 3</code>, the data would still get written into the key-value in the expected location next to the <code>customers</code> table identifier, but <code>SELECT * FROM customers WHERE id = 3</code> would not return any values.{{site.data.alerts.end}}

To better understand how CockroachDB writes key-value data, see our blog post [Mapping Table Data to Key-Value Storage](https://www.cockroachlabs.com/blog/sql-in-cockroachdb-mapping-table-data-to-key-value-storage/).

## See also

- [`CREATE TABLE`](create-table.html)
- [Foreign Keys](foreign-key.html)
- [Column Families](column-families.html)
