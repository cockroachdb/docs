---
title: SHOW CONSTRAINTS
summary: The SHOW CONSTRAINTS statement lists the constraints on a table.
toc: false
---

The `SHOW CONSTRAINTS` [statement](sql-statements.html) lists the [constraints](constraints.html) on a table.

<div id="toc"></div>

## Required Privileges

No [privileges](privileges.html) are required to list the constraints on a table.

## Aliases

`SHOW CONSTRAINT` is an alias for `SHOW CONSTRAINTS`.

## Synopsis

{% include sql/diagrams/show_constraints.html %}

## Parameters

Parameter | Description
----------|------------
`table_name` | The name of the table to show constraints on.

## Response

The following fields are returned for each constraint. 

Field | Description
------|------------
`Table` | The name of the table.
`Name` | The name of the constraint, if any.
`Type` | The type of constraint.
`Column(s)` | The column(s) to which the constraint applies. For `CHECK` constraints, column information will be in `Details` and this field will be `NULL`.
`Details` | The conditions for a `CHECK` constraint.

## Example

~~~ shell
CREATE TABLE orders (
    id INT PRIMARY KEY,
    date TIMESTAMP NOT NULL,
    priority INT DEFAULT 1,
    customer_id INT UNIQUE,
    status STRING DEFAULT 'open',
    CHECK (priority BETWEEN 1 AND 5),
    CHECK (status in ('open', 'in progress', 'done', 'cancelled')),
    FAMILY (id, date, priority, customer_id, status)
);

SHOW CONSTRAINTS FROM orders;
+--------+------------------------+-------------+---------------+--------------------------------------------------------+
| Table  |          Name          |    Type     |   Column(s)   |                        Details                         |
+--------+------------------------+-------------+---------------+--------------------------------------------------------+
| orders |                        | CHECK       | NULL          | status IN ('open', 'in progress', 'done', 'cancelled') |
| orders |                        | CHECK       | NULL          | priority BETWEEN 1 AND 5                               |
| orders | orders_customer_id_key | UNIQUE      | [customer_id] | NULL                                                   |
| orders | primary                | PRIMARY KEY | [id]          | NULL                                                   |
+--------+------------------------+-------------+---------------+--------------------------------------------------------+
(4 rows)
~~~

## See Also

- [Constraints](constraints.html)
- [`CREATE TABLE`](create-table.html)
