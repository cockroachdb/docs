---
title: Column Families
summary: 
toc: false
---

As of the `beta-20160629` release, CockroachDB supports **column families**. A column family is a group of columns in a table that are stored as a single key-value pair in the underlying key-value layer. Storing column values in this way significantly reduces storage overhead. 

{{site.data.alerts.callout_info}}Tables created as of <code>beta-20160629</code> are not be compatible with earlier versions of CockroachDB.{{site.data.alerts.end}}

<div id="toc"></div>

## Overview

When a row is inserted into a table with column families, CockroachDB stores the values for each column family as a single key-value pair. For example, consider a table with 2 columns, where the columns are grouped into a column family:

~~~ sql
CREATE TABLE t1 (
    a STRING PRIMARY KEY, 
    b INT,
    FAMILY f1 (a, b) 
);
~~~

Inserting 10 rows into this table would create 10 underlying key-value pairs, 1 per row. In contrast, if the table's columns were not grouped into a family, each column and value would be a distinct key-value pair; thus, inserting 10 rows would create 20 underlying key-value pairs, 2 per row. 

## Using Column Families

Column families are defined at [table creation](create-table.html). Currently, when you create a table, each column is implicitly its own column family, for example:

~~~ sql
CREATE TABLE t2 (
    a STRING PRIMARY KEY, 
    b INT
);

SHOW CREATE TABLE t2;
+-------+--------------------------------------------+
| Table |                CreateTable                 |
+-------+--------------------------------------------+
| t2    | CREATE TABLE t2 (␤                         |
|       |     a STRING NOT NULL,␤                    |
|       |     b INT NULL,␤                           |
|       |     CONSTRAINT "primary" PRIMARY KEY (a),␤ |
|       |     FAMILY "primary" (a),␤                 |
|       |     FAMILY fam_2_b (b)␤                    |
|       | )                                          |
+-------+--------------------------------------------+
(1 row)
~~~

To group columns into multi-column families, you must use the `FAMILY` keyword, for example:

~~~ sql
CREATE TABLE t3 (
    a STRING PRIMARY KEY, 
    b INT, 
    FAMILY f1 (a, b)
);

SHOW CREATE TABLE t3;
+-------+--------------------------------------------+
| Table |                CreateTable                 |
+-------+--------------------------------------------+
| t3    | CREATE TABLE t3 (␤                         |
|       |     a STRING NOT NULL,␤                    |
|       |     b INT NULL,␤                           |
|       |     CONSTRAINT "primary" PRIMARY KEY (a),␤ |
|       |     FAMILY f1 (a, b)␤                      |
|       | )                                          |
+-------+--------------------------------------------+
(1 row)
~~~

## Upcoming Improvements

In an upcoming release, you won't need to define column families manually. Instead, CockroachDB will group columns into families for you when a table is created. CockroachDB's default groupings will ensure optimal storage and performance, but you will still have the option to define your own groups using the `FAMILY` keyword, as show above. 

## See Also

- [`CREATE TABLE`](create-table.html)
- [Data Definition](data-definition.html)