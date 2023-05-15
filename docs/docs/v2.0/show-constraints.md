---
title: SHOW CONSTRAINTS
summary: The SHOW CONSTRAINTS statement lists the constraints on a table.
toc: true
---

The `SHOW CONSTRAINTS` [statement](sql-statements.html) lists all named [constraints](constraints.html) as well as any unnamed Check constraints on a table.

{{site.data.alerts.callout_danger}}The <code>SHOW CONSTRAINTS</code> statement is under development; the exact output will continue to change.{{site.data.alerts.end}}


## Required Privileges

The user must have any [privilege](privileges.html) on the target table.

## Aliases

`SHOW CONSTRAINT` is an alias for `SHOW CONSTRAINTS`.

## Synopsis

<div>
{% include {{ page.version.version }}/sql/diagrams/show_constraints.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`table_name` | The name of the table for which to show constraints.

## Response

The following fields are returned for each constraint. 

{{site.data.alerts.callout_danger}}The <code>SHOW CONSTRAINTS</code> statement is under development; the exact output will continue to change.{{site.data.alerts.end}}

Field | Description
------|------------
`Table` | The name of the table.
`Name` | The name of the constraint.
`Type` | The type of constraint.
`Column(s)` | The columns to which the constraint applies. For [Check constraints](check.html), column information will be in `Details` and this field will be `NULL`.
`Details` | The conditions for a Check constraint.

## Example

~~~ sql
> CREATE TABLE orders (
    id INT PRIMARY KEY,
    date TIMESTAMP NOT NULL,
    priority INT DEFAULT 1,
    customer_id INT UNIQUE,
    status STRING DEFAULT 'open',
    CHECK (priority BETWEEN 1 AND 5),
    CHECK (status in ('open', 'in progress', 'done', 'cancelled')),
    FAMILY (id, date, priority, customer_id, status)
);

> SHOW CONSTRAINTS FROM orders;
~~~
~~~
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
- [Information Schema](information-schema.html)
- [Other SQL Statements](sql-statements.html)
