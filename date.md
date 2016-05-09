---
title: DATE
toc: false
---

The `DATE` [data type](data-types.html) stores a year, month, and day.

<div id="toc"></div>

## Format

When declaring a `DATE`, format it as `DATE '2016-01-25'`. 

In some contexts, dates may be displayed with hours, minutes, seconds, and timezone set to 0.

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