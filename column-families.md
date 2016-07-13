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

- Fixed-size columns are stored as a single column family: `INT`, `DECIMAL` with precision, `FLOAT`, `BOOL`, `DATE`, `TIMESTAMP`, `INTERVAL`, `STRING` with length limit, and `BYTES`. 
- Each variable-size column is stored as its own column family: `STRING` without length limit, `DECIMAL` without precision, and `BYTES`.

This default approach ensures efficient key-value storage and performance in most cases. However, in special cases, you may want to manually override this logic.

## Manual Override

### Reasons to Manually Assign Column Families
There are are few cases when you might want to manually group columns into column families:

- As mentioned above, `STRING` columns with no length limit, `DECIMAL` columns with no precision, and `BYTES` columns are assigned to their own families by default. When you know that such columns will be small, it's best to assign them to families with other columns to reduce the number of underlying keys. 

- When frequently updated columns are grouped with seldom update columns, the seldom updated columns are nonetheless rewritten on every update. It's therefore more performant to split frequently updated columns into a distinct family. 

### How to Manually Assign Column Families

To manually create a column family, you use the `FAMILY` keyword on table creation. 

For example, let's say we want to create a `users` table containing `id` and `last_login` columns. Since both of these columns are of a fixed size, CockroachDB would assign them to a single column family by default. However, since it's very likely that the `last_login` column will be updated more often than the `id` column, we can use the `FAMILY` keyword to make sure the columns are assigned to separate families:

~~~
CREATE TABLE users (
    id INT PRIMARY KEY, 
    last_login TIMESTAMP,
    FAMILY f1 (id),
    FAMILY f2 (last_login)
);

SHOW CREATE TABLE users;
+-------+---------------------------------------------+
| Table |                 CreateTable                 |
+-------+---------------------------------------------+
| users | CREATE TABLE users (␤                       |
|       |     id INT NOT NULL,␤                       |
|       |     last_login TIMESTAMP NULL,␤             |
|       |     CONSTRAINT "primary" PRIMARY KEY (id),␤ |
|       |     FAMILY f1 (id),␤                        |
|       |     FAMILY f2 (last_login)␤                 |
|       | )                                           |
+-------+---------------------------------------------+
(1 row)
~~~

{{site.data.alerts.callout_info}}Columns that are part of the primary index are always assigned to the first column family. If you manually assign primary index columns to a family, it must therefore be the first family listed in the <code>CREATE TABLE</code> statement.{{site.data.alerts.end}} 

## Compatibility with Past Releases

As of the [`beta-20160714`](beta-20160714.html) release, creating a new table makes your data incompatible with earlier versions. 

## See Also

- [`CREATE TABLE`](create-table.html)
- [Data Definition](data-definition.html)
