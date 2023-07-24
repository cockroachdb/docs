---
title: DECIMAL
summary: The DECIMAL data type stores exact, fixed-point numbers.
toc: true
---

The `DECIMAL` [data type](data-types.html) stores exact, fixed-point numbers. This type is used when it is important to preserve exact precision, for example, with monetary data. 


## Aliases

In CockroachDB, the following are aliases for `DECIMAL`:

- `DEC` 
- `NUMERIC` 

## Precision and Scale

To limit a decimal column, use `DECIMAL(precision, scale)`, where `precision` is the **maximum** count of digits both to the left and right of the decimal point and `scale` is the **exact** count of digits to the right of the decimal point. The `precision` must not be smaller than the `scale`. Also note that using `DECIMAL(precision)` is equivalent to `DECIMAL(precision, 0)`.

When inserting a decimal value:

- If digits to the right of the decimal point exceed the column's `scale`, CockroachDB rounds to the scale. 
- If digits to the right of the decimal point are fewer than the column's `scale`, CockroachDB pads to the scale with `0`s.
- If digits to the left and right of the decimal point exceed the column's `precision`, CockroachDB gives an error.  
- If the column's `precision` and `scale` are identical, the inserted value must round to less than 1.

## Syntax

A constant value of type `DECIMAL` can be entered as a [numeric literal](sql-constants.html#numeric-literals).
For example: `1.414` or `-1234`.

## Size

The size of a `DECIMAL` value is variable, starting at 9 bytes. It's recommended to keep values under 64 kilobytes to ensure performance. Above that threshold, [write amplification](https://en.wikipedia.org/wiki/Write_amplification) and other considerations may cause significant performance degradation.  

## Examples

~~~ sql
> CREATE TABLE decimals (a DECIMAL PRIMARY KEY, b DECIMAL(10,5), c NUMERIC);

> SHOW COLUMNS FROM decimals;
~~~
~~~
+-------+---------------+-------+---------+
| Field |     Type      | Null  | Default |
+-------+---------------+-------+---------+
| a     | DECIMAL       | false | NULL    |
| b     | DECIMAL(10,5) | true  | NULL    |
| c     | DECIMAL       | true  | NULL    |
+-------+---------------+-------+---------+
~~~
~~~ sql
> INSERT INTO decimals VALUES (1.01234567890123456789, 1.01234567890123456789, 1.01234567890123456789);

> SELECT * FROM decimals;
~~~
~~~
+------------------------+---------+-----------------------+
|           a            |    b    |         c             |
+------------------------+---------+-----------------------+
| 1.01234567890123456789 | 1.01235 | 1.0123456789012346789 |
+------------------------+---------+-----------------------+
# The value in "a" matches what was inserted exactly.
# The value in "b" has been rounded to the column's scale.
# The value in "c" is handled like "a" because NUMERIC is an alias.
~~~

## Supported Casting & Conversion

`DECIMAL` values can be [cast](data-types.html#data-type-conversions-casts) to any of the following data types:

Type | Details
-----|--------
`INT` | Truncates decimal precision
`FLOAT` | Loses precision and may round up to +/- infinity if the value is too large in magnitude, or to +/-0 if the value is too small in magnitude
`BOOL` |  **0** converts to `false`; all other values convert to `true`
`STRING` | ––

## See Also

[Data Types](data-types.html)
