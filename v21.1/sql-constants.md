---
title: Constant Values
summary: SQL Constants represent a simple value that doesn't change.
toc: true
---

SQL Constants represent a simple value that doesn't change.


## Introduction

There are five categories of constants in CockroachDB:

- [String literals](#string-literals): these define string values but their actual data type will
  be inferred from context, for example, `'hello'`.
- [Numeric literals](#numeric-literals): these define numeric values but their actual data
  type will be inferred from context, for example, `-12.3`.
- [Bit array literals](#bit-array-literals): these define bit array values with data type
  `BIT`, for example, `B'1001001'`.
- [Byte array literals](#byte-array-literals): these define byte array values with data type
  `BYTES`, for example, `b'hello'`.
- [Interpreted literals](#interpreted-literals): these define arbitrary values with an explicit
  type, for example, `INTERVAL '3 days'`.
- [Named constants](#named-constants): these have predefined values with a predefined
  type, for example, `TRUE` or `NULL`.

## String literals

CockroachDB supports the following formats for string literals:

- [Standard SQL string literals](#standard-sql-string-literals).
- [String literals with C escape sequences](#string-literals-with-character-escapes).
- [Dollar-quoted string literals](#dollar-quoted-string-literals)

These formats also allow arbitrary Unicode characters encoded as UTF-8.

In any case, the actual data type of a string literal is determined
using the context where it appears.

For example:

 Expression | Data type of the string literal 
------------|---------------------------------
 `length('hello')` | `STRING` 
 `now() + '3 day'`  | `INTERVAL` 
 `INSERT INTO tb(date_col) VALUES ('2013-01-02')` | `DATE` 

In general, the data type of a string literal is that demanded by the
context if there is no ambiguity, or `STRING` otherwise.

Check our blog for
[more information about the typing of string literals](https://www.cockroachlabs.com/blog/revisiting-sql-typing-in-cockroachdb/).

### Standard SQL string literals

SQL string literals are formed by an arbitrary sequence of characters
enclosed between single quotes (`'`), for example, `'hello world'`.

To include a single quote in the string, use a double single quote.
For example:

{% include copy-clipboard.html %}
~~~ sql
> SELECT 'hello' as a, 'it''s a beautiful day' as b;
~~~

~~~
+-------+----------------------+
|   a   |          b           |
+-------+----------------------+
| hello | it's a beautiful day |
+-------+----------------------+
~~~

For compatibility with the SQL standard, CockroachDB also recognizes
the following special syntax: two simple string literals separated by
a newline character are automatically concatenated together to form a
single constant. For example:

{% include copy-clipboard.html %}
~~~ sql
> SELECT 'hello'
' world!' as a;
~~~

~~~
+--------------+
|      a       |
+--------------+
| hello world! |
+--------------+
~~~

This special syntax only works if the two simple literals are
separated by a newline character. For example `'hello' ' world!'`
doesn't work. This is mandated by the SQL standard.

### String literals with character escapes

CockroachDB also supports string literals containing escape sequences
like in the programming language C. These are constructed by prefixing
the string literal with the letter `e`, for example,
`e'hello\nworld!'`.

The following escape sequences are supported:

Escape Sequence | Interpretation
----------------|---------------
`\a` | ASCII code 7 (BEL)
`\b` | backspace (ASCII 8)
`\t` | tab (ASCII 9)
`\n` | newline (ASCII 10)
`\v` | vertical tab (ASCII 11)
`\f` | form feed (ASCII 12)
`\r` | carriage return (ASCII 13)
`\xHH` | hexadecimal byte value
`\ooo` | octal byte value
`\uXXXX` | 16-bit hexadecimal Unicode character value
`\UXXXXXXXX` | 32-bit hexadecimal Unicode character value

For example, the `e'x61\141\u0061'` escape string represents the
hexadecimal byte, octal byte, and 16-bit hexadecimal Unicode character
values equivalent to the `'aaa'` string literal.

### Dollar-quoted string literals

 To make it easier to write certain types of string constants in SQL code, CockroachDB supports dollar-quoted string literals.  This is particularly useful for strings that need to contain lots of single quotes (`'`) or backslashes (`\`).

At a high level, the dollar-quoting behavior works similarly to ["heredocs"](https://en.wikipedia.org/wiki/Here_document) as used in UNIX shells and some programming languages.

Dollar-quoted strings have the form: `$` + (optional) tag + `$` + arbitrary text + `$` + (optional) tag + `$`

For example:

{% include copy-clipboard.html %}
~~~ sql
SELECT char_length($MyCoolString$
You can put anything you want in this string -- for example, here's a Windows filesystem pathname: 'C:\Users\foo\Downloads\file.zip'

You can even nest additional dollar-quoted strings inside each other.  For example, here is a regular expression using backticks: $myRegex$[foo\tbar]$myRegex$

Finally, you can use $stand-alone dollar signs without the optional tag$.
$MyCoolString$);
~~~

~~~
  char_length
---------------
          369
(1 row)
~~~

## Numeric literals

Numeric literals can have the following forms:

~~~
[+-]9999
[+-]9999.[9999][e[+-]999]
[+-][9999].9999[e[+-]999]
[+-]9999e[+-]999
[+-]0xAAAA
~~~

Some examples:

~~~
+4269
3.1415
-.001
6.626e-34
50e6
0xcafe111
~~~

The actual data type of a numeric constant depends both on the context
where it is used, its literal format, and its numeric value.

 Syntax | Possible data types 
--------|---------------------
 Contains a decimal separator | `FLOAT`, `DECIMAL` 
 Contains an exponent | `FLOAT`, `DECIMAL` 
 Contains a value outside of the range -2^63...(2^63)-1 | `FLOAT`, `DECIMAL` 
 Otherwise | `INT`, `DECIMAL`, `FLOAT` 

Of the possible data types, which one is actually used is then further
refined depending on context.

Check our blog for
[more information about the typing of numeric literals](https://www.cockroachlabs.com/blog/revisiting-sql-typing-in-cockroachdb/).

## Bit array literals

Bit array literals consist of the `B` prefix followed by a string of
binary digits (bits) enclosed in single quotes.

For example: `B'1001010101'`

Bit array literals are acceptable both when values of types
[`BIT`](bit.html) or [`VARBIT`](bit.html) (`BIT VARYING`) are
expected.

The number of bits is arbitrary. An empty bit array is denoted `B''`;
the number of bits need not be a multiple of 8, and bit arrays can
contain more than 64 bits.

## Byte array literals

CockroachDB supports two formats for byte array literals:

- [Byte array literals with C escape sequences](#byte-array-literals-with-character-escapes)
- [Hexadecimal-encoded byte array literals](#hexadecimal-encoded-byte-array-literals)

### Byte array literals with character escapes

This uses the same syntax as [string literals containing character escapes](#string-literals-with-character-escapes),
using a `b` prefix instead of `e`. Any character escapes are interpreted like they
would be for string literals.

For example: `b'hello,\x32world'`

The two differences between byte array literals and string literals
with character escapes are as follows:

- Byte array literals always have data type `BYTES`, whereas the data
  type of a string literal depends on context.
- Byte array literals may contain invalid UTF-8 byte sequences,
  whereas string literals must always contain valid UTF-8 sequences.

### Hexadecimal-encoded byte array literals

This is a CockroachDB-specific extension to express byte array
literals: the delimiter `x'` followed by an arbitrary sequence of
hexadecimal digits, followed by a closing `'`.

For example, all the following formats are equivalent to `b'cat'`:

- `x'636174'`
- `X'636174'`

## Interpreted literals

A constant of any data type can be formed using either of the following formats:

~~~
type 'string'
'string':::type
~~~

The value of the string part is used as input for the conversion function to the
specified data type, and the result is used as a constant with that data type.

Examples:

~~~
DATE '2013-12-23'
BOOL 'FALSE'
'42.69':::INT
'TRUE':::BOOL
'3 days':::INTERVAL
~~~

Additionally, for compatibility with PostgreSQL, the notation
`'string'::type` and `CAST('string' AS type)` is also recognized as an
interpreted literal. These are special cases of
[cast expressions](scalar-expressions.html).

For more information about the allowable format of interpreted
literals, refer to the "Syntax" section of the respective data types:
[`DATE`](date.html#syntax), [`INET`](inet.html#syntax), [`INTERVAL`](interval.html#syntax), [`TIME`](time.html#syntax),
[`TIMESTAMP`/`TIMESTAMPTZ`](timestamp.html#syntax).

## Named constants

CockroachDB recognizes the following SQL named constants:

- `TRUE` and `FALSE`, the two possible values of data type `BOOL`.
- `NULL`, the special SQL symbol that indicates "no value present".

Note that `NULL` is a valid constant for any type: its actual data
type during expression evaluation is determined based on context.

## See also

- [Scalar Expressions](scalar-expressions.html)
- [Data Types](data-types.html)
