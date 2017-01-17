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

To express a byte array constant, see the section on
[byte array literals](sql-constants.html#byte-array-literals) for more
details.

When it is not ambiguous, a string literal can also be automatically
interpreted as a byte array.

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

`BYTES` values can be [cast](data-types.html#data-type-conversions--casts) to any of the following data types:

Type | Details
-----|--------
`STRING` | Requires the byte array to contain only valid UTF-8 character encodings.

## See Also

[Data Types](data-types.html)
