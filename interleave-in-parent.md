---
title: INTERLEAVE IN PARENT
summary: Interleaving tables improves queries' performance by optimizing the key-value structure of closely related table's data.
toc: false
toc_not_nested: true
---

Interleaving tables improves queries' performance by optimizing the key-value structure of closely related tables.

<div id="toc"></div>

## How do interleaved tables work?

Interleaving tables writes the data from one table (known as the **child**) directly into another (known as the **parent**) in they key-value store by matching the two table's Primary Keys (acting as a kind of join between the tables).

For this matching to work, the child table must use entire the parent table's Primary Key as a prefix of its own Primary Key––these columns are referred to as the **interleave prefix**. It's easiest to think of these columns as representing the same piece of data that correlates your interleaved tables.

For example, if want to interleave `orders` into `customers` and the Primary Key of customers is `id`, you need to create a column representing `customers.id` as the first column in the Primary Key of `orders`&mdash;e.g., with a column called `customer`. So the data representing `customers.id` is the interleave prefix, which exists in `orders` as `orders.customer`.

{{site.data.alerts.callout_success}}To enforce the relationship between each table's interleave prefix columns, we recommend using <a href="constraints.html#foreign-keys">Foreign Key constraints</a>.{{site.data.alerts.end}}

## When should I interleave tables?

Interleaved tables work best when the tables form a hierarchy. For example, you could interleave the table `orders` (as the child) into the table `customers` (as the parent, which represents the people who placed the orders). You could then extend this by interleaving the tables `invoices` (as a child) and `shippingData` (as a child) into `orders` (as the parent). The set of these relationships is referred to as the **interleaved hierarchy**, which are related through the interleave prefix columns.

However, deciding to interleave tables depends on your query patterns closely aligning with the feature's benefits, while not being hindered by its tradeoffs.

### Benefits

- Reading from or writing into child tables using the parent's Primary Key are dramatically faster.<br/><br/>For example, a query like "Get all of a specific user's orders" would execute more quickly if `orders` was interleaved into `customers`. However, a query like "Get all users who placed an order today" would not be improved.
- Writing data into tables in the interleaved hierarchy when they're stored on the same node is exponentially faster. This is because you can completely mitigate the overhead in coordinating writes between two nodes.
- `JOIN`s between tables in the interleaved hierarchy using the interleave prefix are much faster.

### Tradeoffs

- Retrieving or deleting ranges of data in either tables is slower (though scanning or deleting individual values is unaffected).
- If the amount of interleaved data stored for any Primary Key value of the parent table is larger than the range size (64MB by default), the interleaved optimizations will be lessened. For example, if one customer has 500MB of order data, that one customer's data will be spread across multiple ranges and CockroachDB will not be able to access it as quickly, despite it being interleaved.

## Syntax

{% include sql/diagrams/interleave.html %}

## Parameters

| Parameter | Description |
|-----------|-------------|
| `CREATE TABLE ...` | For help with this section of the syntax, [`CREATE TABLE`](create-table.html).
| `parent_table` | The name of the parent table you want to interleave the new child table into |
| `child_columns` | A comma-separated list of columns from the child table's Primary Key that represent the interleave prefix |

## Requirements

- You can only interleave tables when creating the child table.
- Each child table's Primary Key must contain its parent table's Primary Key as a non-strict prefix. For example, if the parent table's primary key is `(a INT, b STRING)`, the child table's primary key could be `(a INT, b STRING, c DECIMAL)`.
	{{site.data.alerts.callout_info}}Strictly speaking, this requirement is enforced only by ensuring that the columns use the same data types. However, we recommend ensuring the columns refer to the same data element by using the Foreign Key constraint.{{site.data.alerts.end}}
- Tables cannot be interleaved into more than 1 parent table. However, each parent table can have many children tables. Children tables can also be parents of other tables.

## Recommendations

- Use interleaved tables when your schema forms a hierarchy, and the Primary Key of the root table (often a "user ID" or "account ID") is a parameter to most of your queries.
- To enforce the relationship between the parent and children table's Primary Keys, use [Foreign Key constraints](constraints.html#foreign-keys) on the child table.
- In cases where you're uncertain if interleaving tables will improve your queries' performance, test how tables perform under load when they're interleaved and when they aren't.

## Examples

### Interleaving Tables

This example interleaves the `orders` table into `customers` and creates a Foreign Key relationship between `customers.id` and `orders.customer`. You'll also see that the Primary Key of `orders` includes the Primary Key of `customers` as a prefix.

~~~ sql
> CREATE TABLE customers (
    id INT PRIMARY KEY,
    name STRING
  );

> CREATE TABLE orders (
    customer INT, 
    id INT,
    total DECIMAL, 
    PRIMARY KEY (customer, int), 
    CONSTRAINT fk FOREIGN KEY (customer) REFERENCES customers
    ) INTERLEAVE IN PARENT customers (customer)
  ;

> CREATE TABLE invoices (
    customer INT,
    "order" INT,
    id INT,
    address STRING
    paid BOOL,
    PRIMARY KEY (customer, "order", id),
    CONSTRAINT fk FOREIGN KEY (customer, "order") REFERENCES orders
    ) INTERLEAVE IN PARENT orders (customer, "order")
  ;
~~~

### Key-Value Storage Example

It can be easier to understand what interleaving tables does by seeing what it looks like in the key-value store. For example, using the above example of interleaving `orders` in `customers`, we could insert the following values:

~~~ sql
> INSERT INTO customers 
  (id, name) VALUES 
  (1, "Ha-Yun"),
  (2, "Emanuela");

> INSERT INTO orders 
  (customer, id, total) VALUES 
  (1, 1000, 100.00),
  (2, 1001, 90.00),
  (1, 1002, 80.00),
  (2, 1003, 70.00);
~~~

Using an illustrative format of the key-value store (keys are represented in colors; values are represented by `-> value`), the data would be written like this:

<pre class="highlight">
<span style="color:#62B6CB">[customers]</span><span style="color:#47924a">&lt;customers.id = 1&gt;</span> -> "Ha-Yun"
<span style="color:#62B6CB">[customers]</span><span style="color:#47924a">&lt;orders.customer = 1&gt;</span><span style="color:#FC9E4F">[orders]</span><span style="color:#ef2da8">&lt;orders.id = 1000&gt;</span> -> 100.00
<span style="color:#62B6CB">[customers]</span><span style="color:#47924a">&lt;orders.customer = 1&gt;</span><span style="color:#FC9E4F">[orders]</span><span style="color:#c4258a">&lt;orders.id = 1002&gt;</span> -> 80.00
<span style="color:#62B6CB">[customers]</span><span style="color:#2f6246">&lt;customers.id = 2&gt;</span> -> "Emanuela"
<span style="color:#62B6CB">[customers]</span><span style="color:#2f6246">&lt;orders.customer = 2&gt;</span><span style="color:#FC9E4F">[orders]</span><span style="color:#EF2D56">&lt;orders.id = 1001&gt;</span> -> 90.00
<span style="color:#62B6CB">[customers]</span><span style="color:#2f6246">&lt;orders.customer = 2&gt;</span><span style="color:#FC9E4F">[orders]</span><span style="color:#c42547">&lt;orders.id = 1003&gt;</span> -> 70.00
</pre>

You'll notice that `customers.id` and `orders.customer` are written into the same position in the key-value store. This is how CockroachDB relates the two table's data for the interleaved structure. By storing data this way, accessing any of the `orders` data alongside the `customers` is much faster.

{{site.data.alerts.callout_info}}If we didn't set Foreign Key constraints between <code>customers.id</code> and <code>orders.customer</code> and inserted <code>orders.customer = 3</code>, the data would still get written into the key-value in the expected location next to the <code>customers</code> table identifier, but <code>SELECT * FROM customers WHERE id = 3</code> would not return any values.{{site.data.alerts.end}}

To better understand how CockroachDB writes key-value data, see our blog post [Mapping Table Data to Key-Value Storage](https://www.cockroachlabs.com/blog/sql-in-cockroachdb-mapping-table-data-to-key-value-storage/).

## See Also

- [`CREATE TABLE`](create-table.html)
- [Foreign Keys](constraints.html#foreign-keys)
- [Column Families](column-families.html)



