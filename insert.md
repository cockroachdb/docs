---
title: INSERT
toc: false
---

The `INSERT` [statement](sql-statements.html) inserts one or more rows into a table. In cases where inserted values violate uniqueness constraints, the `ON CONFLICT` clause can be used to update rather than insert rows. 

<div id="toc"></div>

## Required Privileges

The user must have the `INSERT` [privilege](privileges.html) on the table. 

## Synopsis

{% include sql/diagrams/insert.html %}

## Parameters

Parameter | Description
----------|------------
`qualified_name` | The name of the table to insert into.
`AS name` | An alias for the table name. When an alias is provided, it completely hides the actual table name. 
`qualified_name_list` | A comma-separated list of column names, in parentheses. If column names are listed, the `VALUES` clause must list values in corresponding order. If column names are not listed, the `INSERT` will use the columns of the table in their declared order.
`VALUES` | A comma-separated list of column values for a single row, in parentheses. To insert values into multiple rows, use a comma-separated list of parentheses.
`DEFAULT VALUES` | To fill all columns with their [default values](data-definition.html#default-value), use `DEFAULT VALUES` in place of a `VALUES` clause. To fill a specific column with its default value, use `DEFAULT` at the appropriate position in the `VALUES` clause or just leave a value out of the clause. 
`select_stmt` | A [`SELECT`](select.html) statement to retrieve values from another table and insert them as new rows. The target columns in the `SELECT` statement must match the type of the columns being inserted into.
`opt_on_conflict` |
`opt_on_conflict` | 
`RETURNING target_list` |

## Examples

### Basic Insert

To insert a row into a table, use the `INSERT INTO` statement followed by the table name, the target columns in parenthesis, the `VALUES` keyword, and then the column values in parentheses:

~~~ sql
INSERT INTO accounts (id, balance) VALUES (1, 10000.50);
~~~

If you don't list column names, the statement will use the columns of the table in their declared order.

To insert multiple rows into a table, use a comma-separated list of parentheses, each containing column values for one row:

~~~ sql
INSERT INTO accounts (id, balance) VALUES (3, 8100.73), (4, 9400.10);
~~~

### Insert from a `SELECT` Statement

Instead of explicitly specifying column values, you can use a `SELECT` statement to retrieve values from another table and insert them as new rows:

~~~ sql
INSERT INTO table1 (a, b) SELECT b, c FROM table2   
~~~

The target columns in the `SELECT` statement must match the type of the columns being inserted into.

### Default Values

[Defaults values](data-definition.html) are used when you leave specific columns out of your statement, or when you explicitly request default values. For example, both of the following statements would create a row with `balance` filled with its default value, in this case `NULL`:

~~~ sql
INSERT INTO accounts (id, balance) VALUES (5);

INSERT INTO accounts (id, balance) VALUES (6, DEFAULT);
~~~

To fill all columns with default values, use just the table name and the expression `DEFAULT VALUES`:

~~~ sql
INSERT INTO accounts DEFAULT VALUES;
~~~

### Returning Values

To return values based on rows inserted, use the `RETURNING` keyword followed by the column you want to return:

~~~ sql
INSERT INTO accounts (id, balance) VALUES (6, DEFAULT) RETURNING balance;
~~~
~~~
+---------+
| balance |
+---------+
| NULL    |
+---------+
~~~

To return all columns of the inserted rows, use the `*` character:

~~~ sql
INSERT INTO accounts (id, balance) VALUES (6, DEFAULT) RETURNING *;
~~~
~~~
+----+---------+
| id | balance |
+----+---------+
|  6 | NULL    |
+----+---------+
~~~

You can also compute and return values based on rows inserted:

~~~ sql
INSERT INTO accounts (id, balance) VALUES (1, 5000.50), (2, 7500.50) RETURNING balance * 2;
~~~
~~~
+------------------------+
|      balance * 2       |
+------------------------+
| 10001.0000000000000000 |
| 15001.0000000000000000 |
+------------------------+
~~~

### Update Values `ON CONFLICT`

Normally, when inserted values conflict with a `UNIQUE` constraint on one or more columns, CockroachDB returns an error. To update the affected rows instead, use an `ON CONFLICT` clause containing the column with the unique conflict and the `DO UPDATE SET` expression set to the columns to be updated:

~~~ sql
INSERT INTO table1 (a, b, c) VALUES (1, 2, 3) ON CONFLICT (a) DO UPDATE SET b = excluded.b, c = excluded.c;
~~~ 

When a unique conflict is detected, CockroachDB temporarily stores the row(s) in a table called `excluded`. As you can see above, you set the columns to be update to the corresponding columns in the temporary `excluded` table.

Note the following limitations:

-   It's not possible to update the same row twice with a single `INSERT ... ON CONFLICT` statement. For example, the following would not be allowed:
-   If the values in the `SET` expression cause uniqueness conflicts, CockroachDB will return an error. 

{{site.data.alerts.callout_info}}As a short-hand alternative to the <code>ON CONFLICT</code> clause, you can use the <code><a href="https://cockroachlabs.com/docs/upsert.html">UPSERT</a></code> statement. However, note that <code>UPSERT</code> does not let you specify the column with the unique conflict; it assumes that the conflict column is the primary key. Using <code>ON CONFLICT</code> is therefore more flexible.{{site.data.alerts.end}}

### Ignore Insert `ON CONFLICT`

To avoid an error in case an insert conflicts with a `UNIQUE` constraint, set the `ON CONFLICT` clause to `DO NOTHING`:

~~~ sql
INSERT INTO table1 (a, b, c) VALUES (1, 2, 3) ON CONFLICT (a) DO NOTHING;
~~~

## See Also