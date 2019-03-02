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

~~~ sql
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
[`STRING`](string.html). This conversion always succeeds. Two
conversion modes are supported, controlled by the
[session variable](set-vars.html#supported-variables) `bytea_output`:

- `hex` (default): The output of the conversion starts with the two
  characters `\`, `x` and the rest of the string is composed by the
  hexadecimal encoding of each byte in the input. For example,
  `x'48AA'::STRING` produces `'\x48AA'`.

- `escape`: The output of the conversion contains each byte in the
  input, as-is if it is an ASCII character, or encoded using the octal
  escape format `\NNN` otherwise. For example, `x'48AA'::STRING`
  produces `'0\252'`.

`STRING` values can be cast explicitly to `BYTES`. This conversion
will fail if the hexadecimal digits are not valid, or if there is an
odd number of them. Two conversion modes are supported:

- If the string starts with the special two characters `\`, `x`
  (e.g. `\xAABB`), the rest of the string is interpreted as a sequence
  of hexadecimal digits. The string is then converted to a byte array
  where each pair of hexadecimal digits is converted to one byte.

- Otherwise, the string is converted to a byte array that contains its
  UTF-8 encoding.

## See also

[Data Types](data-types.html)
