---
title: STRING
summary: The STRING data type stores a string of Unicode characters.
toc: false
---

The `STRING` [data type](data-types.html) stores a string of Unicode characters.

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

## Formats

A `STRING` column accepts Unicode string literals, hexadecimal string literals, and escape strings. 

### String Literal

When inserting a string literal into a `STRING` column, format the value as a valid UTF-8 character sequence within single quotes, e.g., `'a1b2c3'`.

### Hexadecimal-Encoded String Literal

When inserting a hexadecimal-encoded string literal into a `STRING` column, format the value as `x` or `X` followed by hexadecimal digits in single quotes. For example, `x'636174'` or `X'636174'` correspond to the Unicode string literal `'cat'`.

### Escape String

When inserting an escape string into a `STRING` column, format the value as `e` or `E` followed by one or more of the following backslash escape sequences within single quotes:   

Backslash Escape Sequence | Interpretation
--------------------------|---------------
`\b` | backspace
`\f` | form feed
`\n` | newline
`\r` | carriage return
`\t` | tab
`\xHH` | hexadecimal byte value
`\ooo` | octal byte value
`\uXXXX` | 16-bit hexadecimal Unicode character value
`\UXXXXXXXX` | 32-bit hexadecimal Unicode character value

For example, the `e'x61\141\u0061'` escape string represents the hexadecimal byte, octal byte, and 16-bit hexadecimal Unicode character values equivalent to the `'aaa'` string literal. 

Note that any character not in the table above is taken literally in an escape string. Also, when continuing an escape string across lines, write `e` or `E` only before the first opening quote.

## Size

The size of a `STRING` value is variable, but it's recommended to keep values under 64 kilobytes to ensure performance. Above that threshold, [write amplification](https://en.wikipedia.org/wiki/Write_amplification) and other considerations may cause significant performance degradation.   

## Examples

~~~ sql
> CREATE TABLE strings (a STRING PRIMARY KEY, b STRING(4), c TEXT);

> SHOW COLUMNS FROM strings;
~~~
~~~
+-------+-----------+-------+---------+
| Field |  Type     | Null  | Default |
+-------+-----------+-------+---------+
| a     | STRING    | false | NULL    |
| b     | STRING(4) | true  | NULL    |
| c     | STRING    | true  | NULL    |
+-------+-----------+-------+---------+
~~~
~~~ sql
> INSERT INTO strings VALUES ('a1b2c3d4', 'e5f6', 'g7h8i9');

> SELECT * FROM strings;
~~~
~~~
+----------+------+--------+
|    a     |  b   |   c    |
+----------+------+--------+
| a1b2c3d4 | e5f6 | g7h8i9 |
+----------+------+--------+
~~~

## Supported Casting & Conversion

`STRING` values can be [cast](data-types.html#data-type-conversions--casts) to any of the following data types:

Type | Details
-----|--------
`INT` | Requires supported [`INT`](int.html) string format, e.g., `'10'`.
`DECIMAL` | Requires supported [`DECIMAL`](decimal.html) string format, e.g., `'1.1'`.
`FLOAT` | Requires supported [`FLOAT`](float.html) string format, e.g., `'1.1'`.
`BOOL` | Requires supported [`BOOL`](bool.html) string format, e.g., `'true'`.
`DATE` | Requires supported supported [`DATE`](date.html) string format, e.g., `'2016-01-25'`.
`TIMESTAMP` | Requires supported supported [`TIMESTAMP`](timestamp.html) string format, e.g., `''2016-01-25 10:10:10.555555''`.
`INTERVAL` | Requires supported [`INTERVAL`](interval.html) string format, e.g., `'1h2m3s4ms5us6ns'`.
`BYTES` | Requires supported [`BYTES`](bytes.html) string format, e.g., `b'\141\061\142\062\143\063'`.

## See Also

[Data Types](data-types.html)