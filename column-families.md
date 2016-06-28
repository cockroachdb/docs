---
title: Column Families
summary: 
toc: false
---

As of the `beta-20160630` release, CockroachDB supports **column families**. A column family is a group of columns in a table that are stored as a single key-value pair in the underlying key-value layer. The reduced number of keys results in a smaller storage overhead and, even more signifcantly, in improved performance during `INSERT`, `UPDATE`, and `DELETE` operations.

{{site.data.alerts.callout_info}}New tables created with multi-column families will not be compatible with versions of CockroachDB earlier than <code>beta-20160630</code>.{{site.data.alerts.end}}

<div id="toc"></div>

## Overview

When a row is inserted into a table with column families, CockroachDB stores a single key-value pair per family. For example, consider a table with 2 columns, where the columns are grouped into a column family:

~~~ sql
CREATE TABLE t1 (
    a STRING PRIMARY KEY, 
    b INT,
    FAMILY f1 (a, b) 
);
~~~

Inserting 10 rows into this table would create 10 underlying key-value pairs, 1 per row. This is a significant improvement over earlier versions of CockroachDB, where inserting 10 rows would have created 30 underlying key-value pairs, 3 per row: one key-value pair per column plus an extra key-value pair per row.  

## Using Column Families

Column families are defined at [table creation](create-table.html). Currently, when you create a table, each column is implicitly its own column family, for example:

~~~ sql
CREATE TABLE t2 (
    a STRING PRIMARY KEY, 
    b INT,
    c BOOL,
    d TIMESTAMP
);

SHOW CREATE TABLE t2;
+-------+--------------------------------------------+
| Table |                CreateTable                 |
+-------+--------------------------------------------+
| t2    | CREATE TABLE t2 (␤                         |
|       |     a STRING NOT NULL,␤                    |
|       |     b INT NULL,␤                           |
|       |     c BOOL NULL,␤                          |
|       |     d TIMESTAMP NULL,␤                     |
|       |     CONSTRAINT "primary" PRIMARY KEY (a),␤ |
|       |     FAMILY "primary" (a),␤                 |
|       |     FAMILY fam_2_b (b),␤                   |
|       |     FAMILY fam_3_c (c),␤                   |
|       |     FAMILY fam_4_d (d)␤                    |
|       | )                                          |
+-------+--------------------------------------------+
(1 row)
~~~

To group columns into multi-column families, you must use the `FAMILY` keyword, for example:

~~~ sql
CREATE TABLE t3 (
    a STRING PRIMARY KEY, 
    b INT,
    c BOOL,
    d TIMESTAMP,
    FAMILY f1 (a, b),
    FAMILY f2 (c, d)
);

SHOW CREATE TABLE t3;
+-------+--------------------------------------------+
| Table |                CreateTable                 |
+-------+--------------------------------------------+
| t3    | CREATE TABLE t3 (␤                         |
|       |     a STRING NOT NULL,␤                    |
|       |     b INT NULL,␤                           |
|       |     c BOOL NULL,␤                          |
|       |     d TIMESTAMP NULL,␤                     |
|       |     CONSTRAINT "primary" PRIMARY KEY (a),␤ |
|       |     FAMILY f1 (a, b),␤                     |
|       |     FAMILY f2 (c, d)␤                      |
|       | )                                          |
+-------+--------------------------------------------+
(1 row)
~~~

## Restrictions and Recommendations

When defining column families for a table, keep the following in mind:

-   By default, columns that are part of the primary index are assigned to the first column family. If you manually assign primary index columns to a family, it must be the first family listed in the `CREATE TABLE` statement.  

- Since column families reduce the number of underlying keys, it's best for performance to use as few families as is reasonable.

- Avoid grouping columns that get updated a lot with columns that don't. If a small column that gets updated frequently is grouped with a big column that gets updated seldomly, the big column will be rewritten every time the small one is updated.  

-   By default, `STRING` columns with no length limit and `DECIMAL` columns with no precision are assigned to their own families. When you know that such columns will be small, it's best to assign them to families with other columns. For example, for a table such as the following, where you know that user names and addresses will be relatively small, you could assign all of the columns to one family: 

    ~~~ sql
    CREATE TABLE users (
        id SERIAL PRIMARY KEY, 
        name STRING, 
        address STRING, 
        FAMILY f1 (id, name, address)
    );
    ~~~

## Upcoming Improvements

In an upcoming release, you won't need to define column families manually. Instead, CockroachDB will group columns into families for you when a table is created. CockroachDB's default groupings will ensure reasonable storage and performance, but you will still have the option to define your own groups using the `FAMILY` keyword, as show above. 

## See Also

- [`CREATE TABLE`](create-table.html)
- [Data Definition](data-definition.html)
