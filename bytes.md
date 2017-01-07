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

You can also use these in combination, for example, `b'\141\061\x62\x32\c3'`.

## Size

The size of a `BYTES` value is variable, but it's recommended to keep values under 64 kilobytes to ensure performance. Above that threshold, [write amplification](https://en.wikipedia.org/wiki/Write_amplification) and other considerations may cause significant performance degradation.  

## Example

~~~ sql
> CREATE TABLE bytes (a INT PRIMARY KEY, b BYTES);

> INSERT INTO bytes VALUES (1, 'abc'), (2, b'\141\142\143'), (3, b'\x61\x62\x63'), (4, b'\141\x62\c');

> SELECT * FROM bytes;
~~~
~~~
+---+-----+
| a |  b  |
+---+-----+
| 1 | abc |
| 2 | abc |
| 3 | abc |
| 4 | abc |
+---+-----+
(4 rows)
~~~

## Supported Casting & Conversion 

`BYTES` values support the following [data-type casting](data-types.html#type-casting--conversion):

Type | Supported?
-----|---------
`INT` | ✗
`SERIAL` | ✗
`DECIMAL` | ✗
`FLOAT` | ✗
`BOOL` | ✗
`DATE` | ✗
`TIMESTAMP` | ✗
`INTERVAL` | ✗
`STRING` | ✓

## See Also

[Data Types](data-types.html)