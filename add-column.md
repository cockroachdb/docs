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
| `name` | The name of the column you want to add. The column name must follow these [identifier rules](keywords-and-identifiers.html#identifiers) and must be unique within the table but can have the same name as indexes or constraints.  |
| `typename` | The [data type](data-types.html) of the new column. |
| `col_qualification` | A list of column definitions, which may include [column-level constraints](constraints.html), [collation](collate.html), or [column family assignments](column-families.html). |

## Examples

### Add a Single Column

~~~ sql
> ALTER TABLE accounts ADD COLUMN names STRING;
~~~ 

~~~ sql
> SHOW COLUMNS FROM accounts;
~~~ 

~~~
+-----------+-------------------+-------+---------+-----------+
|   Field   |       Type        | Null  | Default |  Indices  |
+-----------+-------------------+-------+---------+-----------+
| id        | INT               | false | NULL    | {primary} |
| balance   | DECIMAL           | true  | NULL    | {}        |
| names     | STRING            | true  | NULL    | {}        |
+-----------+-------------------+-------+---------+-----------+
~~~

### Add Multiple Columns

~~~ sql
> ALTER TABLE accounts ADD COLUMN location STRING, ADD COLUMN amount DECIMAL;
~~~

~~~ sql
> SHOW COLUMNS FROM accounts;
~~~ 

~~~
+-----------+-------------------+-------+---------+-----------+
|   Field   |       Type        | Null  | Default |  Indices  |
+-----------+-------------------+-------+---------+-----------+
| id        | INT               | false | NULL    | {primary} |
| balance   | DECIMAL           | true  | NULL    | {}        |
| names     | STRING            | true  | NULL    | {}        |
| location  | STRING            | true  | NULL    | {}        |
| amount    | DECIMAL           | true  | NULL    | {}        |
+-----------+-------------------+-------+---------+-----------+

~~~

### Add a Non-Null Column with a Default Value

~~~ sql
> ALTER TABLE accounts ADD COLUMN interest DECIMAL NOT NULL DEFAULT (DECIMAL '1.3');
~~~ 

~~~ sql
> SHOW COLUMNS FROM accounts;
~~~ 
~~~
+-----------+-------------------+-------+---------------------------+-----------+
|   Field   |       Type        | Null  |          Default          |  Indices  |
+-----------+-------------------+-------+---------------------------+-----------+
| id        | INT               | false | NULL                      | {primary} |
| balance   | DECIMAL           | true  | NULL                      | {}        |
| names     | STRING            | true  | NULL                      | {}        |
| location  | STRING            | true  | NULL                      | {}        |
| amount    | DECIMAL           | true  | NULL                      | {}        |
| interest  | DECIMAL           | false | ('1.3':::STRING::DECIMAL) | {}        |
+-----------+-------------------+-------+---------------------------+-----------+
~~~

### Add a Non-Null Column with Unique Values

~~~ sql
> ALTER TABLE accounts ADD COLUMN cust_number DECIMAL UNIQUE NOT NULL;
~~~ 
 
### Add a Column with Collation

~~~ sql
> ALTER TABLE accounts ADD COLUMN more_names STRING COLLATE en;
~~~ 
 
### Add a Column to a Column Family

~~~ sql
# Add a Column to a New Column Family
> ALTER TABLE accounts ADD COLUMN location1 STRING CREATE FAMILY new_family;
~~~ 

~~~ sql
# Add a Column to an Existing Column Family
> ALTER TABLE accounts ADD COLUMN location2 STRING FAMILY existing_family;
~~~

~~~ sql
# Add a Column Using CREATE IF NOT EXISTS FAMILY
> ALTER TABLE accounts ADD COLUMN new_name STRING CREATE IF NOT EXISTS FAMILY f1;
~~~


## See Also
- [`ALTER TABLE`](alter-table.html)
- [Column-level Constraints](constraints.html)
- [Collation](collate.html)
- [Column Families](column-families.html)
