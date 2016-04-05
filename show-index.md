---
title: SHOW INDEX
toc: true
---

## Description

The `SHOW INDEX` [statement](sql-statements.html) returns index information for a table. 

In CockroachDB, the following are aliases for `SHOW INDEX`: 

- `SHOW INDEXES` 
- `SHOW KEYS`

## Privileges

No privileges are required to show indexes for a table.

## Synopsis

{% include sql/diagrams/show_index.html %}

## Parameters

Parameter | Description
----------|------------
`var_name` | The name of the table to show indexes for. 

## Response

The following fields are returned for each index.

Field | Description
----------|------------
`Table` | The name of the table.
`Name` | The name of the index.
`Unique` | Whether or not values in the indexed column are unique. Possible values: `true` or `false`. 
`Seq` | The position of the column in the index, starting with 1.
`Column` | The indexed column.  
`Direction` | How the column is sorted in the index. Possible values: `ASC` or `DESC` for indexed columns; `N/A` for stored columns. 
`Storing` | Whether or not the `STORING` clause was used to index the column during index creation. Possible values: `true` or `false`. 

## Examples 

~~~
CREATE TABLE table1 (
    a INT PRIMARY KEY,
    b DECIMAL,
    c TIMESTAMP,
    d STRING
);

CREATE INDEX b_c_idx ON table1 (b, c) STORING (d);

SHOW INDEX FROM table1;
+--------+---------+--------+-----+--------+-----------+---------+
| Table  |  Name   | Unique | Seq | Column | Direction | Storing |
+--------+---------+--------+-----+--------+-----------+---------+
| table1 | primary | true   |   1 | a      | ASC       | false   |
| table1 | b_c_idx | false  |   1 | b      | ASC       | false   |
| table1 | b_c_idx | false  |   2 | c      | ASC       | false   |
| table1 | b_c_idx | false  |   3 | d      | N/A       | true    |
+--------+---------+--------+-----+--------+-----------+---------+
~~~

## See Also

[SQL Statements](sql-statements.html)