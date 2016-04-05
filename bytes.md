---
title: BYTES
toc: true
---

## Description

The `BYTES` [data type](data-types.html) stores binary strings of variable length.

In CockroachDB, the following are aliases for `BYTES`: 

- `BYTEA` 
- `BLOB` 

## Format

When declaring a `BYTES` string, use either of the following byte escape formats:

- 1 octet per byte: `b'\141\061\142\062\143\063'`
- 2 hexadecimal digits per byte: `b'\x61\x31\x62\x32\x63\x33'`. 

## Examples

~~~
CREATE TABLE bytes (a INT PRIMARY KEY, b BYTES, c BLOB);

SHOW COLUMNS FROM bytes;
+-------+-------+-------+---------+
| Field | Type  | Null  | Default |
+-------+-------+-------+---------+
| a     | INT   | false | NULL    |
| b     | BYTES | true  | NULL    |
| c     | BYTES | true  | NULL    |
+-------+-------+-------+---------+

INSERT INTO bytes VALUES (12345, b'\141\061\142\062\143\063', b'\x61\x31\x62\x32\x63\x33');

SELECT * FROM bytes;
+-------+--------+--------+
|   a   |   b    |   c    |
+-------+--------+--------+
| 12345 | a1b2c3 | a1b2c3 |
+-------+--------+--------+
~~~

## See Also

[Data Types](data-types.html)