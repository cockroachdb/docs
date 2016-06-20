---
title: BOOL
summary: The BOOL data type stores Boolean values of false or true.
toc: false
---

The `BOOL` [data type](data-types.html) stores a Boolean value of `false` or `true`. 

<div id="toc"></div>

## Aliases

In CockroachDB, `BOOLEAN` is an alias for `BOOL`. 

## Format

When inserting into a `BOOL` column, format the value as `false` or `true` (case-insensitive).

Alternately, you can cast `0` or `1` as a `BOOL`:

- `CAST(0 AS BOOL)` (false)
- `CAST(1 AS BOOL)` (true)

## Size

A `BOOL` value is 1 byte in width, but the total storage size is likely to be larger due to CockroachDB metadata.  

## Examples

~~~
CREATE TABLE bool (a INT PRIMARY KEY, b BOOL, c BOOLEAN);

SHOW COLUMNS FROM bool;
+-------+------+-------+---------+
| Field | Type | Null  | Default |
+-------+------+-------+---------+
| a     | INT  | false | NULL    |
| b     | BOOL | true  | NULL    |
| c     | BOOL | true  | NULL    |
+-------+------+-------+---------+

INSERT INTO bool VALUES (12345, true, CAST(0 AS BOOL));

SELECT * FROM bool;
+-------+------+-------+
|   a   |  b   |   c   |
+-------+------+-------+
| 12345 | true | false |
+-------+------+-------+
~~~

## See Also

[Data Types](data-types.html)