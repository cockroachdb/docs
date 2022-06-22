---
title: ADD COLUMN
summary: Use the ADD COLUMN statement to add columns to tables.
toc: true
---

The `ADD COLUMN` [statement](sql-statements.html) is part of `ALTER TABLE` and adds columns to tables.


## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/add_column.html %}
</div>

## Required Privileges

The user must have the `CREATE` [privilege](privileges.html) on the table.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `table_name` | The name of the table to which you want to add the column. |
| `column_name` | The name of the column you want to add. The column name must follow these [identifier rules](keywords-and-identifiers.html#identifiers) and must be unique within the table but can have the same name as indexes or constraints.  |
| `typename` | The [data type](data-types.html) of the new column. |
| `col_qualification` | An optional list of column definitions, which may include [column-level constraints](constraints.html), [collation](collate.html), or [column family assignments](column-families.html).<br><br>Note that it is not possible to add a column with the [Foreign Key](foreign-key.html) constraint. As a workaround, you can add the column without the constraint, then use [`CREATE INDEX`](create-index.html) to index the column, and then use [`ADD CONSTRAINT`](add-constraint.html) to add the Foreign Key constraint to the column. |

## Viewing Schema Changes

{% include {{ page.version.version }}/misc/schema-change-view-job.md %}

## Examples

### Add a Single Column

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE accounts ADD COLUMN names STRING;
~~~

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE accounts ADD COLUMN location STRING, ADD COLUMN amount DECIMAL;
~~~

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE accounts ADD COLUMN interest DECIMAL NOT NULL DEFAULT (DECIMAL '1.3');
~~~

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE accounts ADD COLUMN cust_number DECIMAL UNIQUE NOT NULL;
~~~

### Add a Column with Collation

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE accounts ADD COLUMN more_names STRING COLLATE en;
~~~

### Add a Column and Assign it to a Column Family

#### Add a Column and Assign it to a New Column Family

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE accounts ADD COLUMN location1 STRING CREATE FAMILY new_family;
~~~

#### Add a Column and Assign it to an Existing Column Family

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE accounts ADD COLUMN location2 STRING FAMILY existing_family;
~~~

#### Add a Column and Create a New Column Family if Column Family Does Not Exist

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE accounts ADD COLUMN new_name STRING CREATE IF NOT EXISTS FAMILY f1;
~~~


## See Also
- [`ALTER TABLE`](alter-table.html)
- [Column-level Constraints](constraints.html)
- [Collation](collate.html)
- [Column Families](column-families.html)
