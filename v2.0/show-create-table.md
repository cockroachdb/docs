---
title: SHOW CREATE TABLE
summary: The SHOW CREATE TABLE statement shows the CREATE TABLE statement that would create a copy of the specified table.
toc: false
---

The `SHOW CREATE TABLE` [statement](sql-statements.html) shows the `CREATE TABLE` statement that would create a copy of the specified table.

<div id="toc"></div>

## Required Privileges

The user must have any [privilege](privileges.html) on the target table.

## Synopsis

{% include sql/{{ page.version.version }}/diagrams/show_create_table.html %}

## Parameters

Parameter | Description
----------|------------
`table_name` | The name of the table for which to show the `CREATE TABLE` statement.

## Response

Field | Description
------|------------
`Table` | The name of the table.
`CreateTable` | The [`CREATE TABLE`](create-table.html) statement for creating a copy of the specified table.

## Example

~~~ sql
> CREATE TABLE customers (id INT PRIMARY KEY, email STRING UNIQUE);
~~~

~~~ sql
> CREATE TABLE products (sku STRING PRIMARY KEY, price DECIMAL(9,2));
~~~

~~~ sql
> CREATE TABLE orders (
    id INT PRIMARY KEY,
    product STRING NOT NULL REFERENCES products,
    quantity INT,
    customer INT NOT NULL CONSTRAINT valid_customer REFERENCES customers (id),
    CONSTRAINT id_customer_unique UNIQUE (id, customer),
    INDEX (product),
    INDEX (customer)
);
~~~

~~~ sql
> SHOW CREATE TABLE customer;
~~~


~~~
+-----------+----------------------------------------------------+
|   Table   |                    CreateTable                     |
+-----------+----------------------------------------------------+
| customers | CREATE TABLE customers (␤                          |
|           |     id INT NOT NULL,␤                              |
|           |     email STRING NULL,␤                            |
|           |     CONSTRAINT "primary" PRIMARY KEY (id ASC),␤    |
|           |     UNIQUE INDEX customers_email_key (email ASC),␤ |
|           |     FAMILY "primary" (id, email)␤                  |
|           | )                                                  |
+-----------+----------------------------------------------------+
(1 row)
~~~

~~~ sql
> SHOW CREATE TABLE products;
~~~

~~~
+----------+--------------------------------------------------+
|  Table   |                   CreateTable                    |
+----------+--------------------------------------------------+
| products | CREATE TABLE products (␤                         |
|          |     sku STRING NOT NULL,␤                        |
|          |     price DECIMAL(9,2) NULL,␤                    |
|          |     CONSTRAINT "primary" PRIMARY KEY (sku ASC),␤ |
|          |     FAMILY "primary" (sku, price)␤               |
|          | )                                                |
+----------+--------------------------------------------------+
(1 row)
~~~

~~~ sql
> SHOW CREATE TABLE orders;
~~~

~~~
+--------+------------------------------------------------------------------------------------------+
| Table  |                                       CreateTable                                        |
+--------+------------------------------------------------------------------------------------------+
| orders | CREATE TABLE orders (␤                                                                   |
|        |     id INT NOT NULL,␤                                                                    |
|        |     product STRING NOT NULL,␤                                                            |
|        |     quantity INT NULL,␤                                                                  |
|        |     customer INT NOT NULL,␤                                                              |
|        |     CONSTRAINT "primary" PRIMARY KEY (id ASC),␤                                          |
|        |     UNIQUE INDEX id_customer_unique (id ASC, customer ASC),␤                             |
|        |     CONSTRAINT fk_product_ref_products FOREIGN KEY (product) REFERENCES products (sku),␤ |
|        |     INDEX orders_product_idx (product ASC),␤                                             |
|        |     CONSTRAINT valid_customer FOREIGN KEY (customer) REFERENCES customers (id),␤         |
|        |     INDEX orders_customer_idx (customer ASC),␤                                           |
|        |     FAMILY "primary" (id, product, quantity, customer)␤                                  |
|        | )                                                                                        |
+--------+------------------------------------------------------------------------------------------+
(1 row)
~~~

## See Also

- [`CREATE TABLE`](create-table.html)
- [Information Schema](information-schema.html)
- [Other SQL Statements](sql-statements.html)
