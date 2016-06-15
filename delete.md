---
title: DELETE
toc: false
---

The `DELETE` [statement](sql-statements.html) deletes rows from a table.

<div id="toc"></div>

## Required Privileges

The user must have the `DELETE` and `SELECT` [privileges](privileges.html) on the table. 

## Synopsis

{% include sql/diagrams/delete.html %}

## Parameters

<style>
table td:first-child {
    min-width: 225px;
}
</style>

| Parameter | Description |
|-----------|-------------|
|`FROM relation_expr` | The name of the table you want to delete rows from<br><br>Deleting from multiple tables in a single statement is not supported.|
|`AS name` | An alias for the table name, completely hiding its original name; all subsequent references to the table must use its alias<br><br>The `AS` in this clause is optional.<br><br>Aliases are primarily used with `JOIN`, which is not yet supported but is coming in a [future release](https://github.com/cockroachdb/cockroach/issues/2970). <br>|
|`WHERE a_expr`  | A Boolean expression to select the rows you want to delete<br><br/>__Without a `WHERE` clause in your statement, `DELETE` removes all rows from the table.__|
|<code>RETURNING <em>[clauses]</em><code> | Retrieve rows deleted by the statement, using the columns identified by _`[clauses]`_<br><br>_`[clauses]`_ accepts either a `*` or `a_expr`s (1 or more)<br><br>[See an example.](#return-deleted-rows)|
|`*`<br>_use with RETURNING_ | Retrieve all of the table's columns|
|`a_expr`<br>_use with RETURNING_ | The names of columns you want to retrieve|
|`AS col_label`<br><em>use with RETURNING a_expr</em>| Change the label of the column named in `a_expr` to `col_label`<br><br>You can also change column labels with an `identifier`, but must observe [these rules](keywords-and-identifiers.html#rules-for-all-identifiers).|

## Success Responses

Successful `DELETE` statements return one of the following:

| Response | Description |
|-----------|-------------|
|<code>DELETE <em>int</em></code> | _int_ number of rows were deleted<br><br>`DELETE` statements that don't delete any rows respond with `DELETE 0`.|
|Retrieved rows | Including the `RETURNING` clause retrieves the deleted rows, using the columns identified by the clause's parameters<br><br>[See an example.](#return-deleted-rows)|

## Examples

Because we're going to remove data repeatedly, we'll start with a large database.

~~~ sql
CREATE TABLE account_balances (
   account_id INT PRIMARY KEY NOT NULL, 
   balance DECIMAL
   );

INSERT INTO account_balances VALUES
   (1, 32000),
   (2, 25000),
   (3, 30000),
   (4, 22000),
   (5, 30000),
   (6, 22500),
   (7, 36000)
   ;
~~~

### Delete all rows

You can delete all rows from a table by not including a `WHERE` clause in your `DELETE` statement.

~~~ sql
DELETE FROM account_balances;
~~~ 
~~~
DELETE 7
~~~

This command is roughly equivalent to [`TRUNCATE`](truncate.html).

~~~ sql
TRUNCATE account_balances;
~~~ 
~~~ 
TRUNCATE
~~~

As you can see, the difference is that `TRUNCATE` does not return the number of rows it deleted. If you ran these commands consecutively, `TRUNCATE` didn't remove any rows (the table was already empty), but didn't indicate that.

To show that all of the rows have been deleted, you can `SELECT` all columns from the table.

~~~ sql
SELECT * FROM account_balances;
~~~ 
~~~ 
+------------+---------+
| account_id | balance |
+------------+---------+
+------------+---------+
~~~

Go ahead and `INSERT` the example values again. (Promise that we won't make you load the database a third time.)

### Return deleted rows

If you want to see which rows were deleted, include the `RETURNING` clause in your statement to retrieve them, using columns you specify.

By specifying `*`, you get all of the columns from the rows that were deleted.

~~~ sql
DELETE FROM account_balances WHERE account_id=6 RETURNING *;
~~~ 
~~~ 
+------------+---------+
| account_id | balance |
+------------+---------+
|          6 |   22500 |
+------------+---------+
~~~

#### Return specific rows

If you don't need all of the columns from the deleted rows, you can specify those you _do_ want by naming them in the parameter of the `RETURNING` clause.

~~~ sql
DELETE FROM account_balances WHERE balance>33000 RETURNING account_id;
~~~ 
~~~ 
+------------+
| account_id |
+------------+
|          7 |
+------------+
~~~


### Delete specific rows

When deleting specific rows, the largest decision you have to make is which columns to use. Whenever making that choice, you should consider the potential impact of using [`PRIMARY KEY`](constraints.html#primary-key)/[`UNIQUE`](constraints.html#unique) columns versus non-unique ones.

#### Delete rows using primary key/unique columns

Deleting rows using your table's `PRIMARY KEY` or `UNIQUE` columns ensures your `DELETE` is unambiguous – no two rows contain the same column value, so it's less likely to unintentionally delete data.

In this example, we'll remove the row with the `account_id` of 1. We are positive no other rows have that value in the `account_id` column because it's the `PRIMARY KEY`, so there's no risk of accidentally removing another row.

~~~ sql
DELETE FROM account_balances WHERE account_id=1 RETURNING *;
~~~ 
~~~ 
+------------+---------+
| account_id | balance |
+------------+---------+
|          1 |   32000 |
+------------+---------+
~~~ 

#### Delete rows using non-unique columns

Deleting rows using non-unique column values removes _all_ rows that match the expression. This can easily result in deleting data you didn't intend to.

To illustrate, let's remove all rows with a `balance` of 30,000.

~~~ sql
DELETE FROM account_balances WHERE balance=30000 RETURNING *;
~~~ 
~~~ 
+------------+---------+
| account_id | balance |
+------------+---------+
|          3 |   30000 |
|          5 |   30000 |
+------------+---------+
~~~

As you can see, we removed two rows. Maybe that's not what we expected.


### Change returned column labels

When `RETURNING` deleted rows, you can change column labels using `AS`.

~~~ sql
DELETE FROM account_balances WHERE balance<22500 RETURNING account_id, balance AS final_balance;
~~~ 
~~~ 
+------------+---------------+
| account_id | final_balance |
+------------+---------------+
|          4 |         22000 |
+------------+---------------+
~~~

 This function is not available when you return all rows with `*`.

### Create a table alias

`DELETE` supports creating aliases for tables.

Aliases are used primarily with `JOIN` ([which is not supported yet](https://github.com/cockroachdb/cockroach/issues/2970)), but this example demonstrates that the `AS` clause lets you alias a table, and then refer to its columns using _`table_name.column_name`_ notation.

~~~ sql
DELETE FROM account_balances AS accounts WHERE accounts.account_id=2 RETURNING *;
~~~ 
~~~ 
+------------+---------+
| account_id | balance |
+------------+---------+
|          2 |   25000 |
+------------+---------+
~~~

## See Also

- [`INSERT`](insert.html)
- [`TRUNCATE`](truncate.html)
- [`DROP TABLE`](drop-table.html)
- [`DROP DATABASE`](drop-database.html)
- [Other SQL Statements](sql-statements.html)
