---
title: STRING
toc: true
---

## Description

The `STRING` [data type](data-types.html) stores a string of characters.

In CockroachDB, the following are aliases for `STRING` and `STRING(n)`: 

- `CHARACTER`
- `CHARACTER(n)`
- `CHAR` 
- `CHAR(n)` 
- `VARCHAR`
- `VARCHAR(n)` 
- `TEXT`

## Length

To limit the length of a string column, use `CHARCTER(n)`, `CHAR(n)` or `VARCHAR(n)`, where `n` is the maximum number of characters allowed.

When inserting a string, if the value exceeds the column's length limit, Cockroach gives an error. However, when a value is cast as a string with a length limit (e.g., `CAST('hello world' AS CHAR(5))`), CockroachDB truncates to the limit.

## Format

When inserting a string value, format it as `'a1b2c3'`.

## Examples

~~~
CREATE TABLE strings (a STRING PRIMARY KEY, b CHAR(4), c TEXT);

SHOW COLUMNS FROM strings;
+-------+-----------+-------+---------+
| Field |  Type     | Null  | Default |
+-------+-----------+-------+---------+
| a     | STRING    | false | NULL    |
| b     | STRING(4) | true  | NULL    |
| c     | STRING    | true  | NULL    |
+-------+-----------+-------+---------+

INSERT INTO strings VALUES ('a1b2c3d4', 'e5f6', 'g7h8i9');

SELECT * FROM strings;
+----------+------+--------+
|    a     |  b   |   c    |
+----------+------+--------+
| a1b2c3d4 | e5f6 | g7h8i9 |
+----------+------+--------+
~~~

## See Also

[Data Types](data-types.html)