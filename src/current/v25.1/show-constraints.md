---
title: SHOW CONSTRAINTS
summary: The SHOW CONSTRAINTS statement lists the constraints on a table.
toc: true
docs_area: reference.sql
---

The `SHOW CONSTRAINTS` [statement]({{ page.version.version }}/sql-statements.md) lists all named [constraints]({{ page.version.version }}/constraints.md) as well as any unnamed [`CHECK`]({{ page.version.version }}/check.md) constraints on a table.

## Required privileges

The user must have any [privilege]({{ page.version.version }}/security-reference/authorization.md#managing-privileges) on the target table.

## Aliases

`SHOW CONSTRAINT` is an alias for `SHOW CONSTRAINTS`.

## Synopsis

<div>
</div>

## Parameters

Parameter | Description
----------|------------
`table_name` | The name of the table for which to show constraints.

## Response

The following fields are returned for each constraint.

Field | Description
------|------------
`table_name` | The name of the table.
`constraint_name` | The name of the constraint.
`constraint_type` | The type of constraint.
`details` | The definition of the constraint, including the column(s) to which it applies.
`validated` | Whether values in the column(s) match the constraint.

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
~~~

~~~ sql
> SHOW CONSTRAINTS FROM orders;
~~~

~~~
+------------+------------------------+-----------------+--------------------------------------------------------------------------+-----------+
| table_name |    constraint_name     | constraint_type |                                 details                                  | validated |
+------------+------------------------+-----------------+--------------------------------------------------------------------------+-----------+
| orders     | check_priority         | CHECK           | CHECK (priority BETWEEN 1 AND 5)                                         |   true    |
| orders     | check_status           | CHECK           | CHECK (status IN ('open':::STRING, 'in progress':::STRING,               |   true    |
|            |                        |                 | 'done':::STRING, 'cancelled':::STRING))                                  |           |
| orders     | orders_customer_id_key | UNIQUE          | UNIQUE (customer_id ASC)                                                 |   true    |
| orders     | primary                | PRIMARY KEY     | PRIMARY KEY (id ASC)                                                     |   true    |
+------------+------------------------+-----------------+--------------------------------------------------------------------------+-----------+
(4 rows)
~~~

## See also

- [Constraints]({{ page.version.version }}/constraints.md)
- [`ADD CONSTRAINT`]({{ page.version.version }}/alter-table.md#add-constraint)
- [`RENAME CONSTRAINT`]({{ page.version.version }}/alter-table.md#rename-constraint)
- [`DROP CONSTRAINT`]({{ page.version.version }}/alter-table.md#drop-constraint)
- [`VALIDATE CONSTRAINT`]({{ page.version.version }}/alter-table.md#validate-constraint)
- [`CREATE TABLE`]({{ page.version.version }}/create-table.md)
- [Information Schema]({{ page.version.version }}/information-schema.md)
- [SQL Statements]({{ page.version.version }}/sql-statements.md)