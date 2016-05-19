---
title: UPSERT
toc: false
---

The `UPSERT` [statement](sql-statements.html) is short-hand for [`INSERT ... ON CONFLICT`](insert.html). It inserts rows in cases where specified values do not violate uniqueness constraints, and it updates rows in cases where values do violate uniqueness constraints. 

Note that `UPSERT` does not let you specify the column with the unique constraint; it assumes that the column is the primary key. Using `INSERT ... ON CONFLICT` is therefore more flexible.

<div id="toc"></div>

## Required Privileges

## Synopsis

{% include sql/diagrams/upsert.html %}

## Parameters

Parameter | Description
----------|------------
`qualified_name` | The name of the table.
`AS name` | An alias for the table name. When an alias is provided, it completely hides the actual table name. 
`qualified_name_list` | A comma-separated list of column names, in parentheses.
`select_stmt` | A comma-separated list of column values for a single row, in parentheses. To upsert values into multiple rows, use a comma-separated list of parentheses. Alternately, you can use [`SELECT`](select.html) statements to retrieve values from other tables and upsert them. See the [Insert a Single Row](#insert-a-single-row), [Insert Multiple Rows](#insert-multiple-rows), [Insert from a `SELECT` Statement](#insert-from-a-select-statement) examples below.<br><br>Each value must match the [data type](data-types.html) of its column. Also, if column names are listed (`qualified_name_list`), values must be in corresponding order; otherwise, they must follow the declared order of the columns in the table. 
`DEFAULT VALUES` | To fill all columns with their [default values](data-definition.html#default-value), use `DEFAULT VALUES` in place of `select_stmt`. To fill a specific column with its default value, leave the value out of the `select_stmt` or use `DEFAULT` at the appropriate position. See the [Insert Default Values](#insert-default-values) examples below.