---
title: DELETE
summary: The DELETE statement deletes rows from a table.
toc: false
---

The `DELETE` [statement](sql-statements.html) deletes rows from a table.

{{site.data.alerts.callout_info}}To delete columns (known as <code>DROP COLUMN</code>), see <a href="alter-table.html"><code>ALTER TABLE</code></a>.{{site.data.alerts.end}}

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
|`relation_expr` | The name of the table you want to delete rows from.<br><br>Deleting from multiple tables in a single statement is not supported.|
|`AS name` | Create an alias for the table name, completely hiding its original name. All subsequent references to the table must use its alias.<br><br>Aliases are primarily used with `JOIN`, which is not yet supported but is coming in a [future release](https://github.com/cockroachdb/cockroach/issues/2970).|
|`WHERE a_expr`| `a_expr` must be an expression that returns Boolean values using columns (e.g. `<column> = <value>`). Delete rows that return `TRUE`.<br><br/>__Without a `WHERE` clause in your statement, `DELETE` removes all rows from the table.__|
|`RETURNING ...`<br>| Retrieve a table of deleted rows using [all columns](#use-all-columns) (`*`) or [specific columns](#use-specific-columns) (named in `a_expr`).|
|`AS col_label`| In the retrieved table, change the column label from `a_expr` to `col_label`.<br><br>You can also change column labels with an `identifier`, but must follow [these rules](keywords-and-identifiers.html#identifiers).|

## Success Responses

Successful `DELETE` statements return one of the following:

| Response | Description |
|-----------|-------------|
|`DELETE` _`int`_ | _int_ rows were deleted.<br><br>`DELETE` statements that don't delete any rows respond with `DELETE 0`.|
|Retrieved table | Including the `RETURNING` clause retrieves the deleted rows, using the columns identified by the clause's parameters.<br><br>[See an example.](#return-deleted-rows)|

## Examples

### Delete All Rows

You can delete all rows from a table by not including a `WHERE` clause in your `DELETE` statement.

~~~ sql
DELETE FROM account_details;
DELETE 7
~~~

This is roughly equivalent to [`TRUNCATE`](truncate.html).

~~~ sql
TRUNCATE account_details;
TRUNCATE
~~~

As you can see, one difference is that `TRUNCATE` does not return the number of rows it deleted.

### Delete Specific Rows

When deleting specific rows from a table, the most important decision you make is which columns to use in your `WHERE` clause. When making that choice, consider the potential impact of using [`PRIMARY KEY`](constraints.html#primary-key)/[`UNIQUE`](constraints.html#unique) columns versus non-unique ones.

#### Delete Rows Using Primary Key/Unique Columns

Using your table's `PRIMARY KEY` or `UNIQUE` columns to delete rows ensures your statement is unambiguous&mdash;no two rows contain the same column value, so it's less likely to delete data unintentionally.

In this example, `account_id` is our `PRIMARY KEY` and we want to delete the row where it equals 1. Because we're positive no other rows have that value in the `account_id` column, there's no risk of accidentally removing another row.

~~~ sql
DELETE FROM account_details WHERE account_id = 1 RETURNING *;

+------------+---------+--------------+
| account_id | balance | account_type |
+------------+---------+--------------+
|          1 |   32000 | Savings      |
+------------+---------+--------------+
~~~ 

#### Delete Rows Using Non-Unique Columns

Deleting rows using non-unique columns removes _every_ row that returns `TRUE` for the `WHERE` clause's `a_expr`. This can easily result in deleting data you didn't intend to.

~~~ sql
DELETE FROM account_details WHERE balance = 30000 RETURNING *;

+------------+---------+--------------+
| account_id | balance | account_type |
+------------+---------+--------------+
|          2 |   30000 | Checking     |
|          3 |   30000 | Savings      |
+------------+---------+--------------+
~~~

The example statement deleted two rows, which might be unexpected.

### Return Deleted Rows

To see which rows your statement deleted, include the `RETURNING` clause to retrieve them using the columns you specify.

#### Use All Columns
By specifying `*`, you retrieve all columns of the delete rows.

~~~ sql
DELETE FROM account_details WHERE balance < 23000 RETURNING *;

+------------+---------+--------------+
| account_id | balance | account_type |
+------------+---------+--------------+
|          4 |   22000 | Savings      |
+------------+---------+--------------+
~~~

#### Use Specific Columns

To retrieve specific columns, name them in the `RETURNING` clause.

~~~ sql
DELETE FROM account_details WHERE account_id = 5 RETURNING account_id, account_type;

+------------+--------------+
| account_id | account_type |
+------------+--------------+
|          5 | Checking     |
+------------+--------------+
~~~

#### Change Column Labels

When `RETURNING` specific columns, you can change their labels using `AS`.

~~~ sql
DELETE FROM account_details WHERE balance < 22500 RETURNING account_id, balance AS final_balance;

+------------+---------------+
| account_id | final_balance |
+------------+---------------+
|          6 |         23500 |
+------------+---------------+
~~~


## See Also

- [`INSERT`](insert.html)
- [`TRUNCATE`](truncate.html)
- [`ALTER TABLE`](alter-table.html)
- [`DROP TABLE`](drop-table.html)
- [`DROP DATABASE`](drop-database.html)
- [Other SQL Statements](sql-statements.html)
