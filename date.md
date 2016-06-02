---
title: DATE
toc: false
---

The `DATE` [data type](data-types.html) stores a year, month, and day.

<div id="toc"></div>

## Format

When inserting into a `DATE` column, format the value as `DATE '2016-01-25'`.

Alternatively, you can use a string literal, e.g., `'2016-01-25'`, which CockroachDB will resolve into the `DATE` type.

Note that in some contexts, dates may be displayed with hours, minutes, seconds, and timezone set to 0.

## Size

A `DATE` column supports values up to 8 bytes in width, but the total storage size is likely to be larger due to CockroachDB metadata.

## Examples

~~~
CREATE TABLE dates (a DATE PRIMARY KEY, b INT);

SHOW COLUMNS FROM dates;
+-------+------+-------+---------+
| Field | Type | Null  | Default |
+-------+------+-------+---------+
| a     | DATE | false | NULL    |
| b     | INT  | true  | NULL    |
+-------+------+-------+---------+

INSERT INTO dates VALUES (DATE '2016-03-26', 12345);

SELECT * FROM dates;
+---------------------------------+-------+
|                a                |   b   |
+---------------------------------+-------+
| 2016-03-26 00:00:00 +0000 +0000 | 12345 |
+---------------------------------+-------+
~~~

## See Also

[Data Types](data-types.html)