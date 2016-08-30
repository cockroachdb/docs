---
title: Column Families
summary: A column family is a group of columns in a table that are stored as a single key-value pair in the underlying key-value store.
toc: false
---

A column family is a group of columns in a table that are stored as a single key-value pair in the underlying key-value store. The reduced number of keys results in a smaller storage overhead and, even more significantly, in improved performance during `INSERT`, `UPDATE`, and `DELETE` operations.

This page explains how CockroachDB organizes columns into families as well as cases in which you might want to manually override the default behavior.

<div id="toc"></div>

## Default Behavior

When a table is created, CockroachDB automatically groups columns into families as follows:

- Fixed-size columns are stored as a single column family: `INT`, `DECIMAL` with precision, `FLOAT`, `BOOL`, `DATE`, `TIMESTAMP`, `INTERVAL`, and `STRING` with length limit. 
- Each unbounded column is stored as its own column family: `STRING` without length limit, `DECIMAL` without precision, and `BYTES`.

This default approach ensures efficient key-value storage and performance in most cases. However, in special cases, you may want to manually override this logic.

## Manual Override

### Reasons to Manually Assign Column Families

There are are few cases when you might want to manually group columns into column families:

- As mentioned above, `STRING` columns with no length limit, `DECIMAL` columns with no precision, and `BYTES` columns are assigned to their own families by default. When you know that such columns will be small, it's best to assign them to families with other columns to reduce the number of underlying keys. 

- When frequently updated columns are grouped with seldom updated columns, the seldom updated columns are nonetheless rewritten on every update. It's therefore more performant to split frequently updated columns into a distinct family. 

### Assign Column Families on Table Creation

To manually assign a column family on [table creation](create-table.html), use the `FAMILY` keyword.  

For example, let's say we want to create a `users` table to store user IDs (`id INT`), date and time when users joined (`joined TIMESTAMP`), and user names (`name STRING`). We don't know how long a name will be, so we leave it unbounded. However, since names are generally short, we use the `FAMILY` keyword to group `name` with the other columns:

~~~ sql
> CREATE TABLE users (
    id INT PRIMARY KEY, 
    joined TIMESTAMP,
    name STRING,
    FAMILY f1 (id, joined, name)
);

> SHOW CREATE TABLE users;
~~~
~~~
+-------+---------------------------------------------+
| Table |                 CreateTable                 |
+-------+---------------------------------------------+
| users | CREATE TABLE users (␤                       |
|       |     id INT NOT NULL,␤                       |
|       |     joined TIMESTAMP NULL,␤                 |
|       |     name STRING NULL,␤                      |
|       |     CONSTRAINT "primary" PRIMARY KEY (id),␤ |
|       |     FAMILY f1 (id, joined, name)␤           |
|       | )                                           |
+-------+---------------------------------------------+
(1 row)
~~~

{{site.data.alerts.callout_info}}Columns that are part of the primary index are always assigned to the first column family. If you manually assign primary index columns to a family, it must therefore be the first family listed in the <code>CREATE TABLE</code> statement.{{site.data.alerts.end}} 

### Assign Column Families When Adding Columns

When using the [`ALTER TABLE`](alter-table.html) statement to add a column to a table, you can assign the column to a new or existing column family. 

- Use the `CREATE FAMILY` keyword to assign a new column to a **new family**. For example, the following would add a `data BYTES` column to the `users` table above and assign it to a new column family: 

  ~~~ sql
  > ALTER TABLE users ADD COLUMN data BYTES CREATE FAMILY f2;
  ~~~

- Use the `FAMILY` keyword to assign a new column to an **existing family**. For example, the following would add a `data BYTES` colum to the `users` table above and assign it to family `f1`:

  ~~~ sql
  > ALTER TABLE users ADD COLUMN data BYTES FAMILY f1;
  ~~~

- Use the `CREATE IF NOT EXISTS FAMILY` keyword to assign a new column to an **existing family or, if the family doesn't exist, to a new family**. For example, the following would assign the new column to the existing `f1` family; if that family didn't exist, it would create a new family and assign the column to it:

  ~~~ sql
  > ALTER TABLE users ADD COLUMN data BYTES CREATE IF NOT EXISTS FAMILY f1;
  ~~~

## Compatibility with Past Releases

Using the [`beta-20160714`](beta-20160714.html) release makes your data incompatible with versions earlier than the [`beta-20160629`](beta-20160629.html) release. 

## See Also

- [`CREATE TABLE`](create-table.html)
- [Other SQL Statements](sql-statements.html)
