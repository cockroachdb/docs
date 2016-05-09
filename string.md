---
title: STRING
toc: false
---

The `STRING` [data type](data-types.html) stores a string of characters.

<div id="toc"></div>

## Aliases

In CockroachDB, the following are aliases for `STRING`: 

- `CHARACTER`
- `CHAR` 
- `VARCHAR`
- `TEXT`

And the following are aliases for `STRING(n)`:

- `CHARACTER(n)`
- `CHARACTER VARYING(n)`
- `CHAR(n)`
- `CHAR VARYING(n)` 
- `VARCHAR(n)`  

## Length

To limit the length of a string column, use `STRING(n)`, where `n` is the maximum number of characters allowed. 

When inserting a string: 

- If the value exceeds the column's length limit, CockroachDB gives an error.
- If the value is cast as a string with a length limit (e.g., `CAST('hello world' AS STRING(5))`), CockroachDB truncates to the limit.
- If the value is under the column's length limit, CockroachDB does **not** add padding. This applies to `STRING(n)` and all its aliases.

## Format

When inserting a string value, format it as `'a1b2c3'`.

## Storage Size

The storage size for a `STRING` column is variable, but it's recommended to keep values under 64 kilobytes to ensure performance. Above that threshold, [write amplification](https://en.wikipedia.org/wiki/Write_amplification) and other considerations may cause significant performance degredation.   

## Examples

~~~
CREATE TABLE strings (a STRING PRIMARY KEY, b STRING(4), c TEXT);

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