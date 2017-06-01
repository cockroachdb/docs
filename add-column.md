---
title: ADD COLUMN
summary: Use the ADD COLUMN statement to add columns to tables. 
toc: false
---

The `ADD COLUMN` [statement](sql-statements.html) is part of `ALTER TABLE` and adds columns to tables. 

<div id="toc"></div>

## Synopsis

{% include sql/diagrams/add_column.html %}

## Required Privileges

The user must have the `CREATE` [privilege](privileges.html) on the table. 

## Parameters

| Parameter | Description |
|-----------|-------------|
| `table_name` | The name of the table to which you want to add the column. |
| `name` | The name of the column you want to add. The name must be unique to the database and follow these [identifier rules](keywords-and-identifiers.html#identifiers).  |
| `typename` | [Data type](data-types.html) of the new column. |
| `col_qualification` | A list of column definitions, which may include [column-level constraint](constraints.html), [collation](collate.html), and/or [column family](column-families.html). |

## Examples

### ADD A SINGLE COLUMN

~~~ sql
> ALTER TABLE accounts ADD COLUMN names STRING;
~~~ 

~~~ sql
> SHOW COLUMNS FROM accounts;
~~~ 

~~~
+---------+---------+---------+---------+---------+
| Field	  | Type	| Null	  | Default	| Indices |
+---------+---------+---------+---------+---------+
| id	  | INT		| false	  | NULL	|{primary}|
| balance | DECIMAL	| true	  | NULL	| {}	  |
| names	  | STRING	| true	  | NULL	| {}	  |
+---------+---------+---------+---------+---------+
~~~

### ADD MULTIPLE COLUMNS

~~~ sql
> ALTER TABLE account ADD COLUMN location STRING, ADD COLUMN amount DECIMAL;
~~~

~~~ sql
> SHOW COLUMNS FROM accounts;
~~~ 

~~~
+-----------+-----------+-----------+-----------+-----------+
| Field	  	| Type		| Null	  	| Default	| Indices 	|
+-----------+-----------+-----------+-----------+-----------+
| id	  	| INT		| false	  	| NULL		|{primary}	|
| balance 	| DECIMAL	| true	  	| NULL		| {}	  	|
| names	  	| STRING	| true	  	| NULL		| {}	  	|
| location	| STRING	| true	  	| NULL		| {}	  	|
| amount  	| DECIMAL	| true	  	| NULL		| {}	  	|
+-----------+-----------+-----------+-----------+-----------+

~~~

### ADD A NON NULL COLUMN WITH A DEFAULT VALUE

~~~ sql
> ALTER TABLE account ADD COLUMN amount DECIMAL NOT NULL DEFAULT (DECIMAL '1.3');
~~~ 


### ADD A NON NULL COLUMN WITH UNIQUE VALUES

~~~ sql
> ALTER TABLE account ADD COLUMN amount DECIMAL UNIQUE NOT NULL;
~~~ 
 

### ADD A COLUMN WITH COLLATION

~~~ sql
> ALTER TABLE accounts ADD COLUMN names STRING COLLATE en;
~~~ 
 

### ADD A COLUMN TO A NEW COLUMN FAMILY

~~~ sql
> ALTER TABLE accounts ADD COLUMN location STRING CREATE FAMILY new_family;
~~~ 


### ADD A COLUMN TO AN EXISTING COLUMN FAMILY

~~~ sql
> ALTER TABLE accounts ADD COLUMN location STRING FAMILY existing_family;
~~~

### ADD A COLUMN USING CREATE IF NOT EXISTS FAMILY

Use the CREATE IF NOT EXISTS FAMILY keyword to assign a new column to an existing family or, if the family doesn’t exist, to a new family. For example, the following would assign the new column to the existing family f1; if that family didn’t exist, it would create a new family and assign the column to it:

~~~ sql
> ALTER TABLE accounts ADD COLUMN name STRING CREATE IF NOT EXISTS FAMILY f1;
~~~


## See Also
- [`ALTER TABLE`](alter-table.html)
- [Column-level constraint](constraints.html)
- [Collation](collate.html)
- [Column Family](column-families.html)
