---
title: INTERLEAVE IN PARENT
summary: Interleaving tables improves performance of tables that are frequently used together.
toc: true
---

## Interleaved Tables
Interleaving tables improves performance of tables that are often used together by storing the data of the interleaved table (known as the child table) directly within the parent table's data. This ultimately centralizes where your data's written, which makes reads and writes to these tables much more efficient.

### Benefits

- Tables that are read or written together perform much more efficiently.

### Tradeoffs

- Scanning the parent table's Primary Key is slightly slower.
- Scanning or deleting ranges of data in the parent or child tables without referencing both is slightly slower (though scanning or deleting invidual values is unaffected).

### Data Structure

CockroachDB interleaves tables by matching the child table's data to the parent table's Primary Key, which acts like a kind of `JOIN` between the tables. This means the child/interleaved table must use the parent table's Primary Key as a prefix of its own Primary Key. For more detail, see:

- [Requirements](#requirements)
- [Examples](#examples)

## Syntax

{% include sql/diagrams/interleave.html %}

## Parameters

| Parameter | Description |
|-----------|-------------|
| `CREATE TABLE ...` | For help with this section of the syntax, [`CREATE TABLE`](create-table.html).
| `parent_table` | The name of the table you want to interleave the new table into |
| `child_columns` | A comma-separated list of columns from the child table's Primary Key that identify in which order the columns relate to the parent table's Primary Key |

## Requirements

- You can only interleave tables when creating the child table.
- The child table's Primary Key must contain the parent table's Primary Key as a non-strict prefix. For example, if the parent table's primary key is `(a INT, b STRING)`, the child table's primary key could be `(a INT, b STRING, c DECIMAL)`.
	{{site.data.alerts.callout_info}}Strictly speaking, this requirement is enforced only by ensuring that the columns use the same data types. However, we recommend ensuring the columns refer to the same data element by using the Foreign Key constraint.{{site.data.alerts.end}}
- Tables cannot be interleaved into more than 1 parent table. However, each parent table can have many children tables.

## Recommendations

To enforce the relationship between the parent and children table's Primary Keys, use [Foreign Key constraints](constraints.html#foreign-keys) on the child table.

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
  total DECIMAIL, 
  PRIMARY KEY (customer, int), 
  CONSTRAINT fk FOREIGN KEY (customer) REFERENCES customers
) INTERLEAVE IN PARENT customers (customer)
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

Using an illustrative format of the key-value store (keys are represented in colors; values are represented by `> value`), the data would be written like this:

<pre class="highlight">
<span style="color:#62B6CB">[customers]</span><span style="color:#47924a">&lt;customers.id = 1&gt;</span> > "Ha-Yun"
<span style="color:#62B6CB">[customers]</span><span style="color:#47924a">&lt;orders.customer = 1&gt;</span><span style="color:#FC9E4F">[orders]</span><span style="color:#ef2da8">&lt;orders.id = 1000&gt;</span> > 100.00
<span style="color:#62B6CB">[customers]</span><span style="color:#47924a">&lt;orders.customer = 1&gt;</span><span style="color:#FC9E4F">[orders]</span><span style="color:#c4258a">&lt;orders.id = 1002&gt;</span> > 80.00
<span style="color:#62B6CB">[customers]</span><span style="color:#2f6246">&lt;customers.id = 2&gt;</span> > "Emanuela"
<span style="color:#62B6CB">[customers]</span><span style="color:#2f6246">&lt;orders.customer = 2&gt;</span><span style="color:#FC9E4F">[orders]</span><span style="color:#EF2D56">&lt;orders.id = 1001&gt;</span> > 90.00
<span style="color:#62B6CB">[customers]</span><span style="color:#2f6246">&lt;orders.customer = 2&gt;</span><span style="color:#FC9E4F">[orders]</span><span style="color:#c42547">&lt;orders.id = 1003&gt;</span> > 70.00
</pre>

You'll notice that `customers.id` and `orders.customer` are written into the same position in the key-value store. This is how CockroachDB relates the two table's data for the interleaved structure. By storing data this way, accessing any of the `orders` data alongside the `customers` is much faster.

{{site.data.alerts.callout_info}}If we didn't set Foreign Key constraints between <code>customers.id</code> and <code>orders.customer</code> and inserted <code>orders.customer = 3</code>, the data would still get written into the key-value in the expected location next to the <code>customers</code> table identifier, but <code>SELECT * FROM customers WHERE id = 3</code> would not return any values.{{site.data.alerts.end}}

To better understand how CockroachDB writes key-value data, see our blog post [Mapping Table Data to Key-Value Storage](https://www.cockroachlabs.com/blog/sql-in-cockroachdb-mapping-table-data-to-key-value-storage/).

## See Also

- [`CREATE TABLE`](create-table.html)
- [Foreign Keys](constraints.html#foreign-keys)
- [Column Families](column-families.html)
