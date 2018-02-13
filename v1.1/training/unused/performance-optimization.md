---
title: Performance Optimization
summary: Learn strategies to optimize the performance of your CockroachDB cluster.
toc: false
sidebar_data: sidebar-data-training.json
---

<div id="toc"></div>

## Presentation

<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vQdeLOMmZDfPaPc-rVmAQpJwcfRd3bJTLr356bBZnTfBMBYhxAoiiAFlN7bjMOZ2kh0eNAJQdWRw1vm/embed?start=false&loop=false" frameborder="0" width="756" height="454" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>

## Lab

In this lab, we'll create a schema that leverages interleaved tables. This can help improve performance of read operations by placing data on the same range (and therefore the same node).

### Before You Begin

To complete this lab, you need a [local cluster of 3 nodes](3-node-local-secure-cluster.html).

### Step 1. Launch the Built-in SQl Shell

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --certs-dir=certs
~~~

### 2. Create the Schema

{% include copy-clipboard.html %}
~~~ sql
> CREATE DATABASE interleaved_tables;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SET DATABASE = interleaved_tables;
~~~

Because interleaved tables work on hierarchical data, we're going to create a three tables representing 3 levels of hierarchy:

- `customers`
- `orders`, whose "parent" is `customers`
- `packages`, whose "parent" is `orders`

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
    ) INTERLEAVE IN PARENT customers (customer)
  ;
~~~

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE packages (
    customer INT,
    "order" INT,
    id INT,
    address STRING,
    delivered BOOL,
    delivery_date DATE,
    PRIMARY KEY (customer, "order", id),
    CONSTRAINT fk_order FOREIGN KEY (customer, "order") REFERENCES orders
    ) INTERLEAVE IN PARENT orders (customer, "order")
  ;
~~~

### Step 3. Understanding how this works

It can be easier to understand what interleaving tables does by seeing what it looks like in the key-value store. For example, using the above example of interleaving `orders` in `customers`, we could insert the following values:

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO customers
  (id, name) VALUES
  (1, 'Ha-Yun'),
  (2, 'Emanuela');

> INSERT INTO orders
  (customer, id, total) VALUES
  (1, 1000, 100.00),
  (2, 1001, 90.00),
  (1, 1002, 80.00),
  (2, 1003, 70.00);
~~~

Using an illustrative format of the key-value store (keys are represented in colors; values are represented by `-> value`), the data would be written like this:

<pre class="highlight">
<span style="color:#62B6CB">/customers/</span><span style="color:#47924a">&lt;customers.id = 1&gt;</span> -> 'Ha-Yun'
<span style="color:#62B6CB">/customers/</span><span style="color:#47924a">&lt;orders.customer = 1&gt;</span><span style="color:#FC9E4F">/orders/</span><span style="color:#ef2da8">&lt;orders.id = 1000&gt;</span> -> 100.00
<span style="color:#62B6CB">/customers/</span><span style="color:#47924a">&lt;orders.customer = 1&gt;</span><span style="color:#FC9E4F">/orders/</span><span style="color:#c4258a">&lt;orders.id = 1002&gt;</span> -> 80.00
<span style="color:#62B6CB">/customers/</span><span style="color:#2f6246">&lt;customers.id = 2&gt;</span> -> 'Emanuela'
<span style="color:#62B6CB">/customers/</span><span style="color:#2f6246">&lt;orders.customer = 2&gt;</span><span style="color:#FC9E4F">/orders/</span><span style="color:#EF2D56">&lt;orders.id = 1001&gt;</span> -> 90.00
<span style="color:#62B6CB">/customers/</span><span style="color:#2f6246">&lt;orders.customer = 2&gt;</span><span style="color:#FC9E4F">/orders/</span><span style="color:#c42547">&lt;orders.id = 1003&gt;</span> -> 70.00
</pre>

You'll notice that `customers.id` and `orders.customer` are written into the same position in the key-value store. This is how CockroachDB relates the two table's data for the interleaved structure. By storing data this way, accessing any of the `orders` data alongside the `customers` is much faster.

{{site.data.alerts.callout_info}}If we didn't set Foreign Key constraints between <code>customers.id</code> and <code>orders.customer</code> and inserted <code>orders.customer = 3</code>, the data would still get written into the key-value in the expected location next to the <code>customers</code> table identifier, but <code>SELECT * FROM customers WHERE id = 3</code> would not return any values.{{site.data.alerts.end}}

To better understand how CockroachDB writes key-value data, see our blog post [Mapping Table Data to Key-Value Storage](https://www.cockroachlabs.com/blog/sql-in-cockroachdb-mapping-table-data-to-key-value-storage/).

## What's Next?
