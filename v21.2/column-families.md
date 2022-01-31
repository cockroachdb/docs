---
title: Column Families
summary: A column family is a group of columns in a table that are stored as a single key-value pair in the underlying key-value store.
toc: true
---

A column family is a group of columns in a table that are stored as a single key-value pair in the [underlying key-value store](architecture/storage-layer.html). Column families reduce the number of keys stored in the key-value store, resulting in improved performance during [`INSERT`](insert.html), [`UPDATE`](update.html), and [`DELETE`](delete.html) operations.

This page explains how CockroachDB organizes columns into families as well as cases in which you might want to manually override the default behavior.

 [Secondary indexes](indexes.html) respect the column family definitions applied to tables. When you define a secondary index, CockroachDB breaks the secondary index key-value pairs into column families, according to the family and stored column configurations.

## Default behavior

When a table is created, all columns are stored as a single column family.  

This default approach ensures efficient key-value storage and performance in most cases. However, when frequently updated columns are grouped with seldom updated columns, the seldom updated columns are nonetheless rewritten on every update. Especially when the seldom updated columns are large, it's more performant to split them into a distinct family.

## Manual override

### Assign column families on table creation

To manually assign a column family on [table creation](create-table.html), use the `FAMILY` keyword.  

For example, let's say we want to create a table to store an immutable blob of data (`data BYTES`) with a last accessed timestamp (`last_accessed TIMESTAMP`). Because we know that the blob of data will never get updated, we use the `FAMILY` keyword to break it into a separate column family:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE test (
    id INT PRIMARY KEY,
    last_accessed TIMESTAMP,
    data BYTES,
    FAMILY f1 (id, last_accessed),
    FAMILY f2 (data)
);
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW CREATE test;
~~~

~~~
  table_name |                create_statement
-------------+-------------------------------------------------
  test       | CREATE TABLE test (
             |     id INT8 NOT NULL,
             |     last_accessed TIMESTAMP NULL,
             |     data BYTES NULL,
             |     CONSTRAINT "primary" PRIMARY KEY (id ASC),
             |     FAMILY f1 (id, last_accessed),
             |     FAMILY f2 (data)
             | )
(1 row)
~~~


### Assign column families when adding columns

When using the [`ALTER TABLE .. ADD COLUMN`](add-column.html) statement to add a column to a table, you can assign the column to a new or existing column family.

- Use the `CREATE FAMILY` keyword to assign a new column to a **new family**. For example, the following would add a `data2 BYTES` column to the `test` table above and assign it to a new column family:

  {% include copy-clipboard.html %}
  ~~~ sql
  > ALTER TABLE test ADD COLUMN data2 BYTES CREATE FAMILY f3;
  ~~~

- Use the `FAMILY` keyword to assign a new column to an **existing family**. For example, the following would add a `name STRING` column to the `test` table above and assign it to family `f1`:

  {% include copy-clipboard.html %}
  ~~~ sql
  > ALTER TABLE test ADD COLUMN name STRING FAMILY f1;
  ~~~

- Use the `CREATE IF NOT EXISTS FAMILY` keyword to assign a new column to an **existing family or, if the family doesn't exist, to a new family**. For example, the following would assign the new column to the existing `f1` family; if that family didn't exist, it would create a new family and assign the column to it:

  {% include copy-clipboard.html %}
  ~~~ sql
  > ALTER TABLE test ADD COLUMN name STRING CREATE IF NOT EXISTS FAMILY f1;
  ~~~

- If a column is added to a table and the family is not specified, it will be added to the first column family. For example, the following would add the new column to the `f1` family, since that is the first column family:

  {% include copy-clipboard.html %}
  ~~~ sql
  > ALTER TABLE test ADD COLUMN last_name STRING;
  ~~~

## See also

- [`CREATE TABLE`](create-table.html)
- [`ADD COLUMN`](add-column.html)
- [Other SQL Statements](sql-statements.html)
