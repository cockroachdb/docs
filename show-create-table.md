---
title: SHOW CREATE TABLE
summary: The SHOW CREATE TABLE statement shows the CREATE TABLE statement for an existing table. 
toc: false
---

The `SHOW CREATE TABLE` [statement](sql-statements.html) shows the `CREATE TABLE` statement for an existing table. 

<div id="toc"></div>

## Required Privileges

The user must have any [privilege](privileges.html) on the target table.

## Synopsis

{% include sql/diagrams/show_create_table.html %}

## Parameters

Parameter | Description
----------|------------
`table_name` | The name of the table for which to show the `CREATE TABLE` statement.

## Response

The following fields are returned for each column. 

Field | Description
------|------------
`Table` | The name of the table.
`CreateTable` | The [`CREATE TABLE`](create-table.html) statement for the table. 

## Example

~~~ shell
> CREATE TABLE orders (
    id INT PRIMARY KEY DEFAULT unique_rowid(),
    date TIMESTAMP NOT NULL,
    priority INT DEFAULT 1,
    customer_id INT UNIQUE,
    status STRING DEFAULT 'open',
    CHECK (priority BETWEEN 1 AND 5),
    CHECK (status in ('open', 'in progress', 'done', 'cancelled')),
    FAMILY (id, date, priority, customer_id, status)
);

> SHOW CREATE TABLE orders;
+--------+--------------------------------------------------------------------------------------------------+
| Table  |                                           CreateTable                                            |
+--------+--------------------------------------------------------------------------------------------------+
| orders | CREATE TABLE orders (␤                                                                           |
|        |     id INT NOT NULL DEFAULT unique_rowid(),␤                                                     |
|        |     date TIMESTAMP NOT NULL,␤                                                                    |
|        |     priority INT NULL DEFAULT 1,␤                                                                |
|        |     customer_id INT NULL,␤                                                                       |
|        |     status STRING NULL DEFAULT 'open',␤                                                          |
|        |     CONSTRAINT "primary" PRIMARY KEY (id),␤                                                      |
|        |     UNIQUE INDEX orders_customer_id_key (customer_id),␤                                          |
|        |     FAMILY fam_0_id_date_priority_customer_id_status (id, date, priority, customer_id, status),␤ |
|        |     CHECK (priority BETWEEN 1 AND 5),␤                                                           |
|        |     CHECK (status IN ('open', 'in progress', 'done', 'cancelled'))␤                              |
|        | )                                                                                                |
+--------+--------------------------------------------------------------------------------------------------+
(1 row)
~~~

## See Also

- [`CREATE TABLE`](create-table.html)
