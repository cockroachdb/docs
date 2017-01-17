---
title: SQL Constant values
summary: SQL Constants represent a simple value that doesn't change.
toc: false
---

SQL Constants represent a simple value that doesn't change.

<div id="toc"></div>

## Introduction

There are five categories of constants in CockroachDB:

- string literals: these define string values but their actual data type will
  be inferred from context, for example `'hello'`;
- numeric literals: these define numeric values but their actual data
  type will be inferred from context, for example `-12.3`;
- byte array literals: these define byte array values with data type
  `BYTES`, for example `b'hello'`;
- interpreted literals: these define arbitrary values with an explicit
  type, for example `INTERVAL '3 days'`.
- named constants: these have predefined values with a predefined
  type, for example `TRUE` or `NULL`.

## String literals

CockroachDB supports multiple formats for string literals:

- standard SQL string literals
- string literals with C escape sequences
- hexadecimal-encoded strings

The first two formats also allow arbitrary Unicode characters encoded as UTF-8.

In all these cases, the actual data type of a string literal is determined 
using the context where it appears.

For example:

| Expression | Data type of the string literal |
|------------|---------------------------------|
| `length('hello')` | `STRING` |
| `now() + '3 day'`  | `INTERVAL` |
| `INSERT INTO tb(date_col) VALUES ('2013-01-02')` | `DATE` |

In general, the data type of a string literal is that demanded by the
context if there is no ambiguity, or `STRING` otherwise.

Check our blog for
[more information about the typing of string literals](https://www.cockroachlabs.com/blog/revisiting-sql-typing-in-cockroachdb/).

### Standard SQL string literals

SQL string literals are formed by an arbitrary sequence of characters
enclosed between single quotes (`'`), for example `'hello world'`. 
to include a single quote in the string, use a double single quote.

For example:

```sql
SELECT 'hello' as a, 'it''s a beautiful day' as b;
+-------+----------------------+
|   a   |          b           |
+-------+----------------------+
| hello | it's a beautiful day |
+-------+----------------------+
```

For compatibility with the SQL standard, CockroachDB also recognizes
the following special syntax: two simple string literals separated by
a newline character are automatically concatenated together to form a
single constant. For example:

```sql
SELECT 'hello'
' world!' as a;
+--------------+
|      a       |
+--------------+
| hello world! |
+--------------+
```

(This special syntax only works if the two simple literals are
separated by a newline character. For example `'hello' ' world!'`
doesn't work. This is mandated by the SQL standard.)

### String literals with character escapes

CockroachDB also supports string literals containing escape sequences
like in the programming language C. These are constructed by prefixing
the string literal with the letter `e`, for example
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

### Hexadecimal-encoded string literals

This is a CockroachDB-specific extension to express string literals: the
delimiter `x'` followed by an arbitrary sequence of hexadecimal
digits, followed by a closing `'`.

For example, `x'636174'` or `X'636174'` are equivalent to `'cat'`.

## Numeric literals

Numeric literals can have the following forms:

```
  [+-]9999
  [+-]9999.[9999][e[+-]999]
  [+-][9999].9999[e[+-]999]
  [+-]9999e[+-]999
  
  [+-]0xAAAA
```

Some examples:

```
   +4269
   3.1415
   -.001
   6.626e-34
   50e6
   0xcafe111
```

The actual data type of a numeric constant depends both on the context
where it is used, its literal format and its numeric value.

| Syntax | Possible data types |
|--------|---------------------|
| Contains a decimal separator | `FLOAT`, `DECIMAL` |
| Contains an exponent | `FLOAT`, `DECIMAL` |
| Contains a value larger than 2^64 in magnitude | `FLOAT`, `DECIMAL` |
| Otherwise | `INT`, `DECIMAL`, `FLOAT` |

Of the possible data types, which one is actually used is then further
refined depending on context.

Check our blog for
[more information about the typing of numeric literals](https://www.cockroachlabs.com/blog/revisiting-sql-typing-in-cockroachdb/).

## Byte array literals

A byte array literal uses the same syntax as string literals containing character escapes,
using a `b` prefix instead of `e`. Any character escapes are interpreted like they
would be for string literals.

For example: `b'hello,\x32world'`

The two differences between byte array literals and string literals with character escapes are:

- byte array literals always have data type `BYTES`, whereas the data
  type of a string literal depends on context;
- byte array literals may contain invalid UTF-8 byte sequences,
  whereas string literals must always contain valid UTF-8 sequences.

## Interpreted literals

A constant of any data type can be formed using either of the following formats:

```
   type 'string'
   'string':::type
```

The value of the string part is used as input for the conversion function to the
specified data type, and the result is used as a constant with that data type.

Examples:

```
   DATE '2013-12-23'
   BOOL 'FALSE'
   '42.69':::INT
   'TRUE':::BOOL
   '3 days':::INTERVAL
```

Additionally, for compatibility with PostgreSQL, the notation
`'string'::type` and `CAST('string' AS type)` is also recognized as an
interpreted literal. These are special cases of
[cast expressions](sql-expressions.html).

## Named constants

CockroachDB recognizes the following SQL named constants:

- `TRUE` and `FALSE`, the two possible values of data type `BOOL`;
- `NULL`, the special SQL symbol that indicates "no value present".

Note that `NULL` is a valid constant for any type: its actual data
type during expression evaluation is determined based on context.

## See Also

- [Expressions](sql-expressions.html)
- [Data Types](data-types.html)

