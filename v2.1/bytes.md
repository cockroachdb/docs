---
title: BYTES
summary: The BYTES data type stores binary strings of variable length.
toc: true
---

The `BYTES` [data type](data-types.html) stores binary strings of variable length.


## Aliases

In CockroachDB, the following are aliases for `BYTES`:

- `BYTEA`
- `BLOB`

## Syntax

To express a byte array constant, see the section on
[byte array literals](sql-constants.html#byte-array-literals) for more
details. For example, the following three are equivalent literals for the same
byte array: `b'abc'`, `b'\141\142\143'`, `b'\x61\x62\x63'`.

In addition to this syntax, CockroachDB also supports using
[string literals](sql-constants.html#string-literals), including the
syntax `'...'`, `e'...'` and `x'....'` in contexts where a byte array
is otherwise expected.

## Size

The size of a `BYTES` value is variable, but it's recommended to keep values under 1 MB to ensure performance. Above that threshold, [write amplification](https://en.wikipedia.org/wiki/Write_amplification) and other considerations may cause significant performance degradation.  

## Example

~~~ sql?nofmt
> CREATE TABLE bytes (a INT PRIMARY KEY, b BYTES);

> -- explicitly typed BYTES literals
> INSERT INTO bytes VALUES (1, b'\141\142\143'), (2, b'\x61\x62\x63'), (3, b'\141\x62\c');

> -- string literal implicitly typed as BYTES
> INSERT INTO bytes VALUES (4, 'abc');


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

## Supported conversions

`BYTES` values can be
[cast](data-types.html#data-type-conversions-and-casts) explicitly to
`STRING`. The conversion verifies that the byte array contains only
valid UTF-8 byte sequences; an error is reported otherwise.

`STRING` values can be cast explicitly to `BYTES`. This conversion
always succeeds.

## See also

[Data Types](data-types.html)
