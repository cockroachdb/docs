---
title: UPSERT
toc: false
---

The `UPSERT` [statement](sql-statements.html) is short-hand for [`INSERT ON CONFLICT`](insert.html). It inserts rows in cases where specified values do not violate uniqueness constraints, and it updates rows in cases where values do violate uniqueness constraints. 

Note that `UPSERT` considers uniqueness only for [`PRIMARY KEY`](data-definition.html#primary-key) columns. `INSERT ON CONFLICT` is more flexible and can be used to consider uniqueness for other columns. For more details, see [How `UPSERT` Transforms into `INSERT ON CONFLICT`](#how-upsert-transforms-into-insert-on-conflict) below.

<div id="toc"></div>

## Required Privileges

When there is no uniqueness conflict on the primary key, the user must have the `INSERT` [privilege](privileges.html) on the table. When there is a uniqueness conflict on the primary key, the user must have the `UPDATE` privilege on the table. 

## Synopsis

{% include sql/diagrams/upsert.html %}

## Parameters

Parameter | Description
----------|------------
`qualified_name` | The name of the table.
`AS name` | An alias for the table name. When an alias is provided, it completely hides the actual table name. 
`qualified_name_list` | A comma-separated list of column names, in parentheses.
`select_stmt` | A comma-separated list of column values for a single row, in parentheses. To upsert values into multiple rows, use a comma-separated list of parentheses. Alternately, you can use [`SELECT`](select.html) statements to retrieve values from other tables and upsert them.<br><br>Each value must match the [data type](data-types.html) of its column. Also, if column names are listed (`qualified_name_list`), values must be in corresponding order; otherwise, they must follow the declared order of the columns in the table. 
`DEFAULT VALUES` | To fill all columns with their [default values](data-definition.html#default-value), use `DEFAULT VALUES` in place of `select_stmt`. To fill a specific column with its default value, leave the value out of the `select_stmt` or use `DEFAULT` at the appropriate position.

## How `UPSERT` Transforms into `INSERT ON CONFLICT`

`UPSERT` considers uniqueness only for [`PRIMARY KEY`](data-definition.html#primary-key) columns. For example, assuming that columns `a` and `b` are the primary key, the following `UPSERT` and `INSERT ON CONFLICT` statements are equivalent:

~~~
UPSERT INTO t (a, b, c) VALUES (1, 2, 3);

INSERT INTO t (a, b, c) 
    VALUES (1, 2, 3)
    ON CONFLICT (a, b)
    DO UPDATE SET c = excluded.c;
~~~

`INSERT ON CONFLICT` is more flexible and can be used to consider uniqueness for columns not in the primary key. For more details, see the [Upsert that Fails (Conflict on Non-Primay Key)](#upsert-that-fails-conflict-on-non-primay-key) example below.

## Examples

### Upsert that Inserts a Row (No Conflict)

In this example, the `id` column is the primary key. Because the inserted `id` value does not conflict with the `id` value of any existing row, the `UPSERT` statement inserts a new row into the table.

~~~
SELECT * FROM accounts;
+----+----------+
| id | balance  |
+----+----------+
|  1 |  10000.5 |
|  2 | 20000.75 |
+----+----------+

UPSERT INTO accounts (id, balance) VALUES (3, 6325.20);
INSERT 1

SELECT * FROM accounts;
+----+----------+
| id | balance  |
+----+----------+
|  1 |  10000.5 |
|  2 | 20000.75 |
|  3 |   6325.2 |
+----+----------+
~~~

### Upsert that Updates a Row (Conflict on Primary Key)

In this example, the `id` column is the primary key. Because the inserted `id` value is not unique, the `UPSERT` statement updates the row with the new `balance`.

~~~
SELECT * FROM accounts;
+----+----------+
| id | balance  |
+----+----------+
|  1 |  10000.5 |
|  2 | 20000.75 |
|  3 |   6325.2 |
+----+----------+

UPSERT INTO accounts (id, balance) VALUES (3, 7500.83);
INSERT 1

SELECT * FROM accounts;
+----+----------+
| id | balance  |
+----+----------+
|  1 |  10000.5 |
|  2 | 20000.75 |
|  3 |  7500.83 |
+----+----------+
~~~

### Upsert that Fails (Conflict on Non-Primay Key)

`UPSERT` will not update rows when the uniquness conflict is on columns not in the primary key. In this example, the `a` column is the primary key, but the `b` column also has the [`UNIQUE`](data-definition.html#unique) constraint. Because the inserted `b` value is not unique, the `UPSERT` fails.

~~~
SELECT * FROM unique_test;
+---+---+
| a | b |
+---+---+
| 1 | 1 |
| 2 | 2 |
| 3 | 3 |
+---+---+

UPSERT INTO unique_test VALUES (4, 1);
pq: duplicate key value (b)=(1) violates unique constraint "unique_test_b_key"
~~~

In such a case, you would need to use the [`INSERT ON CONFLICT`](insert.html) statement to specify the `b` column as the column with the `UNIQUE` constraint.

~~~
INSERT INTO unique_test VALUES (4, 1) ON CONFLICT (b) DO UPDATE SET a = excluded.a;
INSERT 1

SELECT * FROM unique_test;
+---+---+
| a | b |
+---+---+
| 2 | 2 |
| 3 | 3 |
| 4 | 1 |
+---+---+
~~~

## See Also

- [`INSERT`](insert.html)
- [Other SQL Statements](sql-statements.html)