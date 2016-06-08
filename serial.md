---
title: SERIAL
toc: false
---

The `SERIAL` [data type](data-types.html) stores 64-bit signed integers and  defaults to a unique value per row. A `SERIAL` column is therefore the same as an [`INT`](int.html) column with the `unique_rowid()` function as the default. 

When inserting into a `SERIAL` column, the default value is the combination of the timestamp and the ID of the node handling the operation. This combination is guaranteed to be globally unique, and because value generation does not require talking to other nodes, it is much faster than sequentially auto-incrementing values, which requires distributed coordination.

{{site.data.alerts.callout_info}}This data type is <strong>experimental</strong>. We believe it is a better solution than PostgeSQL's <code>SERIAL</code> and MySQL's <code>AUTO_INCREMENT</code> types, both of which auto-increment integers but not necessarily in a strictly sequential fashion (see the xxx example below for more details). However, if you find that this feature is incompatible with your application, please file an issue or chat with us on Gitter.{{site.data.alerts.end}}

<div id="toc"></div>

## Format

When inserting into an `SERIAL` column, format the value as a numeric literal, e.g.,  `12345`. 

## Size

A `SERIAL` column supports values up to 8 bytes in width, but the total storage size is likely to be larger due to CockroachDB metadata. 

## Examples

~~~
CREATE TABLE ints (a INT PRIMARY KEY, b SMALLINT, c INTEGER);

SHOW COLUMNS FROM ints;
+-------+------+-------+---------+
| Field | Type | Null  | Default |
+-------+------+-------+---------+
| a     | INT  | false | NULL    |
| b     | INT  | true  | NULL    |
| c     | INT  | true  | NULL    |
+-------+------+-------+---------+

INSERT INTO ints VALUES (11111, 22222, 33333);

SELECT * FROM ints;
+-------+-------+-------+
|   a   |   b   |   c   |
+-------+-------+-------+
| 11111 | 22222 | 33333 |
+-------+-------+-------+
~~~

## See Also

[Data Types](data-types.html)