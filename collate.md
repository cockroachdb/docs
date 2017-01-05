---
title: COLLATE
summary: The COLLATE feature lets you choose the alphabetic sorting of ASCII characters in a STRING.
toc: false
---

The collated strings [data type](data-types.html) lets you choose the alphabetic sorting of ASCII characters in a string.

{{site.data.alerts.callout_danger}}Whenever using collated strings, all strings in the operation must be cast to use the same collation. Strings without a collation cannot be used alongside those with one, and strings with different collations cannot be used alongside one another. However, it is possible to <a href="#ad-hoc-collation-casting">add or overwrite a collation on the fly</a>.{{site.data.alerts.end}}

<div id="toc"></div>

## SQL Syntax

Collations appear as normal strings in SQL, but have the `COLLATION` clause appended to them.

- **Column syntax**: `STRING COLLATE <collation>`. For example:

  ~~~ sql
  > CREATE TABLE foo (a STRING COLLATE en);
  ~~~

- **Value syntax**: `<STRING value> COLLATE <collation>`. For example:

  ~~~ sql
  > INSERT INTO foo VALUES ('dog' COLLATE en);
  ~~~

### Supported Collations

CockroachDB offers collations of languages supported in Go's [language package](https://godoc.org/golang.org/x/text/language#Tag). These are identified by the string of characters at the end of each line, immediately preceded by `//`. For example, Afrikaans is supported as the `af` collation.

## Aliases

In CockroachDB, the following are aliases for `STRING COLLATE ...`: 

- `CHARACTER COLLATE ...`
- `CHAR COLLATE ...` 
- `VARCHAR COLLATE ...`
- `TEXT COLLATE ...`

And the following are aliases for `STRING(n) COLLATE ...`:

- `CHARACTER(n) COLLATE ...`
- `CHARACTER VARYING(n) COLLATE ...`
- `CHAR(n) COLLATE ...`
- `CHAR VARYING(n) COLLATE ...` 
- `VARCHAR(n) COLLATE ...`  

## Length

To limit the length of a collated string column, use `STRING(n) COLLATE ...`, where `n` is the maximum number of characters allowed. 

When inserting a string: 

- If the value exceeds the column's length limit, CockroachDB gives an error.
- If the value is cast as a string with a length limit (e.g., `CAST('hello world' AS STRING(5) COLLATE <collation>)`), CockroachDB truncates to the limit.
- If the value is under the column's length limit, CockroachDB does **not** add padding. This applies to `STRING(n) COLLATE ...` and all its aliases.

## Formats

A collated string column accepts Unicode string literals, hexadecimal string literals, and escape strings.

### String Literal

When inserting a string literal into a collated string column, format the value as a valid UTF-8 character sequence within single quotes followed by the `COLLATION` clause, e.g., `'a1b2c3' COLLATE en`.

### Hexadecimal-Encoded String Literal

When inserting a hexadecimal-encoded string literal into a `STRING` column, format the value as `x` or `X` followed by hexadecimal digits in single quotes followed by the `COLLATION` clause. For example, `x'636174' COLLATE en` or `X'636174' COLLATE en` correspond to the Unicode string literal `'cat'`.

### Escape String

When inserting an escape string into a collated string column, format the value as `e` or `E` followed by one or more of the following backslash escape sequences within single quotes:   

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

For example, the `e'x61\141\u0061' COLLATE en` escape string represents the hexadecimal byte, octal byte, and 16-bit hexadecimal Unicode character values equivalent to the `'aaa'` string literal. 

Note that any character not in the table above is taken literally in an escape string. Also, when continuing an escape string across lines, write `e` or `E` only before the first opening quote.

## Size

The size of a collated string value is variable, but it's recommended to keep values under 64 kilobytes to ensure performance. Above that threshold, [write amplification](https://en.wikipedia.org/wiki/Write_amplification) and other considerations may cause significant performance degradation.

## Examples

### Specify Collation for a Column

You can set a default collation for all values in a `STRING` column.

For example, you can set a column's default collation to Filipino:

~~~ sql
> CREATE TABLE fil_names (name STRING COLLATE fil);
~~~

When using `STRING` columns with a collation, you must also specify the collation when inserting values.

~~~ sql
> INSERT INTO fil_names VALUES ('Maricor Esguerra' COLLATE fil), ('Divina Gamboa' COLLATE fil);
~~~

### Order by Non-Default Collation

You can sort a column using a specific collation instead of its default (which also lets you run ad-hoc collation-based sorts on non-collated columns).

For example, you receive different results if you order results by English (`en`) and Danish (`da`) collations:

~~~ sql
> CREATE TABLE sort_example (single_char STRING COLLATE en);

> INSERT INTO sort_example VALUES ('A' COLLATE en), ('X' COLLATE en), ('ü' COLLATE en);

> SELECT * FROM sort_example ORDER BY single_char;
~~~
~~~
+-------------+
| single_char |
+-------------+
| A           |
| ü           |
| X           |
+-------------+
~~~

However, we can change the collation of column to sort by Danish instead:

~~~ sql
> SELECT * FROM sort_example ORDER BY single_char COLLATE da;
~~~
~~~
+-------------+
| single_char |
+-------------+
| A           |
| X           |
| ü           |
+-------------+
~~~

### Ad-Hoc Collation Casting

You can cast any string into a collation on the fly.

For example, you can compare two strings in the Korean (`ko`) collation:

~~~ sql
> SELECT 'X' COLLATE ko < 'ü' COLLATE ko;
~~~
~~~
false
~~~

Or you can specify the Danish (`da`) collation, which uses a different sort order:

~~~ sql
> SELECT 'X' COLLATE da < 'ü' COLLATE da;
~~~
~~~
true
~~~

However, you cannot compare values with different collations:

~~~ sql
SELECT 'X' COLLATE ko < 'ü' COLLATE da;
~~~

## See Also

[Data Types](data-types.html)