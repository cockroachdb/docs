---
title: BYTES
summary: The BYTES data type stores binary strings of variable length.
toc: false
---

The `BYTES` [data type](data-types.html) stores binary strings of variable length.

<div id="toc"></div>

## Aliases

In CockroachDB, the following are aliases for `BYTES`: 

- `BYTEA` 
- `BLOB` 

## Formats

When inserting into a `BYTES` column, use any of the following formats:

- 1 octet per byte: `b'\141\061\142\062\143\063'`
- 2 hexadecimal digits per byte: `b'\x61\x31\x62\x32\x63\x33'`. 
- String literal: `'a1b2c3'`

## Size

The size of a `BYTES` value is variable, but it's recommended to keep values under 64 kilobytes to ensure performance. Above that threshold, [write amplification](https://en.wikipedia.org/wiki/Write_amplification) and other considerations may cause significant performance degredation.  

## Examples

~~~ sql
> CREATE TABLE bytes (a INT PRIMARY KEY, b BYTES, c BLOB, d BYTEA);

> SHOW COLUMNS FROM bytes;
~~~
~~~
+-------+-------+-------+---------+
| Field | Type  | Null  | Default |
+-------+-------+-------+---------+
| a     | INT   | false | NULL    |
| b     | BYTES | true  | NULL    |
| c     | BYTES | true  | NULL    |
| d     | BYTES | true  | NULL    |
+-------+-------+-------+---------+
(4 rows)
~~~
~~~ sql
> INSERT INTO bytes VALUES (12345, b'\141\061\142\062\143\063', b'\x61\x31\x62\x32\x63\x33', b'12\x01HELLO\xff\xab');

> SELECT * FROM bytes;
~~~
~~~
+-------+--------+--------+-----------------------+
|   a   |   b    |   c    |           d           |
+-------+--------+--------+-----------------------+
| 12345 | a1b2c3 | a1b2c3 | "12\x01HELLO\xff\xab" |
+-------+--------+--------+-----------------------+
~~~

## See Also

[Data Types](data-types.html)