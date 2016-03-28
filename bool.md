---
title: BOOL
toc: true
---

## Description

The `BOOL` [data type](data-types.html) stores a Boolean value of `false` or `true`. 

## Synonyms

In CockroachDB, `BOOLEAN` is a synonym of `BOOL`. 

## Format

When declaring a `BOOL`, format it as `false` or `true` (case-insensitive).

Alternately, you can cast `0` or `1` as a `BOOL`:

- `CAST(0 AS BOOL)` (false)
- `CAST(1 AS BOOL)` (true)

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