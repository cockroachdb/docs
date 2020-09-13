---
title: UPSERT
summary: The UPSERT statement inserts rows when values do not violate uniqueness constraints, and it updates rows when values do violate uniqueness constraints.
toc: true
---

The `UPSERT` [statement](sql-statements.html) is short-hand for [`INSERT ON CONFLICT`](insert.html). It inserts rows in cases where specified values do not violate uniqueness constraints, and it updates rows in cases where values do violate uniqueness constraints.


## Considerations

- `UPSERT` considers uniqueness only for [Primary Key](primary-key.html) columns. `INSERT ON CONFLICT` is more flexible and can be used to consider uniqueness for other columns. For more details, see [How `UPSERT` Transforms into `INSERT ON CONFLICT`](#how-upsert-transforms-into-insert-on-conflict) below.

- When inserting/updating all columns of a table, and the table has no secondary indexes, `UPSERT` will be faster than the equivalent `INSERT ON CONFLICT` statement, as it will write without first reading. This may be particularly useful if you are using a simple SQL table of two columns to [simulate direct KV access](frequently-asked-questions.html#can-i-use-cockroachdb-as-a-key-value-store).

- A single [multi-row `UPSERT`](#upsert-multiple-rows) statement is faster than multiple single-row `UPSERT` statements. Whenever possible, use multi-row `UPSERT` instead of multiple single-row `UPSERT` statements. 

## Required Privileges

The user must have the `INSERT` and `UPDATE` [privileges](privileges.html) on the table.

## Synopsis

{% include {{ page.version.version }}/sql/diagrams/upsert.html %}

## Parameters

Parameter | Description
----------|------------
`qualified_name` | The name of the table.
`AS name` | An alias for the table name. When an alias is provided, it completely hides the actual table name.
`qualified_name_list` | A comma-separated list of column names, in parentheses.
`select_stmt` | A [selection clause](selection-clauses.html). Each value must match the [data type](data-types.html) of its column. Also, if column names are listed (`qualified_name_list`), values must be in corresponding order; otherwise, they must follow the declared order of the columns in the table.
`DEFAULT VALUES` | To fill all columns with their [default values](default-value.html), use `DEFAULT VALUES` in place of `select_stmt`. To fill a specific column with its default value, leave the value out of the `select_stmt` or use `DEFAULT` at the appropriate position.
`RETURNING target_list` | Return values based on rows inserted, where `target_list` can be specific column names from the table, `*` for all columns, or a computation on specific columns.<br><br>Within a [transaction](transactions.html), use `RETURNING NOTHING` to return nothing in the response, not even the number of rows affected.

## How `UPSERT` Transforms into `INSERT ON CONFLICT`

`UPSERT` considers uniqueness only for [primary key](primary-key.html) columns. For example, assuming that columns `a` and `b` are the primary key, the following `UPSERT` and `INSERT ON CONFLICT` statements are equivalent:

~~~ sql
> UPSERT INTO t (a, b, c) VALUES (1, 2, 3);

> INSERT INTO t (a, b, c)
    VALUES (1, 2, 3)
    ON CONFLICT (a, b)
    DO UPDATE SET c = excluded.c;
~~~

`INSERT ON CONFLICT` is more flexible and can be used to consider uniqueness for columns not in the primary key. For more details, see the [Upsert that Fails (Conflict on Non-Primary Key)](#upsert-that-fails-conflict-on-non-primary-key) example below.

## Examples

### Upsert a Row (No Conflict)

In this example, the `id` column is the primary key. Because the inserted `id` value does not conflict with the `id` value of any existing row, the `UPSERT` statement inserts a new row into the table.

~~~ sql
> SELECT * FROM accounts;
~~~
~~~
+----+----------+
| id | balance  |
+----+----------+
|  1 |  10000.5 |
|  2 | 20000.75 |
+----+----------+
~~~
~~~ sql
> UPSERT INTO accounts (id, balance) VALUES (3, 6325.20);

> SELECT * FROM accounts;
~~~
~~~
+----+----------+
| id | balance  |
+----+----------+
|  1 |  10000.5 |
|  2 | 20000.75 |
|  3 |   6325.2 |
+----+----------+
~~~

### Upsert Multiple Rows 

In this example, the `UPSERT` statement inserts multiple rows into the table.

~~~ sql
> SELECT * FROM accounts;
~~~
~~~
+----+----------+
| id | balance  |
+----+----------+
|  1 |  10000.5 |
|  2 | 20000.75 |
|  3 |   6325.2 |
+----+----------+
~~~
~~~ sql
> UPSERT INTO accounts (id, balance) VALUES (4, 1970.4), (5, 2532.9), (6, 4473.0);

> SELECT * FROM accounts;
~~~
~~~
+----+----------+
| id | balance  |
+----+----------+
|  1 |  10000.5 |
|  2 | 20000.75 |
|  3 |   6325.2 |
|  4 |   1970.4 |
|  5 |   2532.9 |
|  6 |   4473.0 |
+----+----------+
~~~

### Upsert that Updates a Row (Conflict on Primary Key)

In this example, the `id` column is the primary key. Because the inserted `id` value is not unique, the `UPSERT` statement updates the row with the new `balance`.

~~~ sql
> SELECT * FROM accounts;
~~~
~~~
+----+----------+
| id | balance  |
+----+----------+
|  1 |  10000.5 |
|  2 | 20000.75 |
|  3 |   6325.2 |
|  4 |   1970.4 |
|  5 |   2532.9 |
|  6 |   4473.0 |
+----+----------+
~~~
~~~ sql
> UPSERT INTO accounts (id, balance) VALUES (3, 7500.83);

> SELECT * FROM accounts;
~~~
~~~
+----+----------+
| id | balance  |
+----+----------+
|  1 |  10000.5 |
|  2 | 20000.75 |
|  3 |  7500.83 |
|  4 |   1970.4 |
|  5 |   2532.9 |
|  6 |   4473.0 |
+----+----------+
~~~

### Upsert that Fails (Conflict on Non-Primary Key)

`UPSERT` will not update rows when the uniquness conflict is on columns not in the primary key. In this example, the `a` column is the primary key, but the `b` column also has the [Unique constraint](unique.html). Because the inserted `b` value is not unique, the `UPSERT` fails.

~~~ sql
> SELECT * FROM unique_test;
~~~
~~~
+---+---+
| a | b |
+---+---+
| 1 | 1 |
| 2 | 2 |
| 3 | 3 |
+---+---+
~~~
~~~ sql
> UPSERT INTO unique_test VALUES (4, 1);
~~~
~~~
pq: duplicate key value (b)=(1) violates unique constraint "unique_test_b_key"
~~~

In such a case, you would need to use the [`INSERT ON CONFLICT`](insert.html) statement to specify the `b` column as the column with the Unique constraint.

~~~ sql
> INSERT INTO unique_test VALUES (4, 1) ON CONFLICT (b) DO UPDATE SET a = excluded.a;

> SELECT * FROM unique_test;
~~~
~~~
+---+---+
| a | b |
+---+---+
| 2 | 2 |
| 3 | 3 |
| 4 | 1 |
+---+---+
~~~

## See Also

- [Selection Clauses](selection-clauses.html)
- [`INSERT`](insert.html)
- [Other SQL Statements](sql-statements.html)
