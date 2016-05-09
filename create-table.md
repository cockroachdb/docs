---
title: CREATE TABLE
toc: false
---

The `CREATE TABLE` [statement](sql-statements.html) creates a new table in a database.

<div id="toc"></div>

## Synopsis

{% include sql/diagrams/create_table.html %}

## Required Privileges

The user must have the `CREATE` [privilege](privileges.html) on the parent database. 

## Parameters

### IF NOT EXISTS

Do not throw a `table already exists` error if a table of the same name in the same database already exists. Note that there is no guarantee that the existing table is anything like the one that would have been created.

#### any_name

The [name](data-definition.html#identifiers) (optionally schema-qualified) of the table to be created.

#### column_def

An optional comma separated list of any [column names](data-definition.html#identifiers), their [data types](data-types.html), and any [column level constraints](data-definition.html#column-level-constraints).

#### index_def

An optional comma separated list of any [index definitions](data-definition.html#indexes).


#### table_constraint

An optional comma separated list of any [table level constraints](data-definition.html#table-level-constraints)

## Usage

### Tables without a `PRIMARY KEY` Constraint

If the table does not have a `PRIMARY KEY` constraint defined, a mandatory column called `rowid` of type `INT` will be added and automatically populated with a unique along with a unique index called `primary`. The column and index will still be added if the table has an `UNIQUE` constrant but no `PRIMARY KEY` constraint.




## Examples

As the syntax diagram suggests, you can create a table without any columns like you can in PostgreSQL. The table does have a column called `rowid` that was added because the table does not have a `PRIMARY KEY` or `UNIQUE` defined.

~~~ sql
CREATE TABLE table_name ();
CREATE TABLE

SHOW COLUMNS FROM table_name;
+-------+------+-------+----------------+
| Field | Type | Null  |    Default     |
+-------+------+-------+----------------+
| rowid | INT  | false | unique_rowid() |
+-------+------+-------+----------------+
~~~



## See Also

- [`ALTER TABLE`](alter-table.html)
- [`DROP TABLE`](drop-table.html)
- [`RENAME TABLE`](rename-table.html)
- [`TRUNCATE`](truncate.html)
- [Other SQL Statements](sql-statements.html)