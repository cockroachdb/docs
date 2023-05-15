---
title: FLOAT
summary: The FLOAT data type stores inexact, floating-point numbers with up to 17 digits in total and at least one digit to the right of the decimal point.
toc: true
---

CockroachDB supports various inexact, floating-point number [data types](data-types.html) with up to 17 digits of decimal precision.

They are handled internally using the [standard double-precision (64-bit binary-encoded) IEEE754 format](https://en.wikipedia.org/wiki/IEEE_floating_point).


## Names and Aliases

Name | Aliases
-----|--------
`FLOAT` | None
`REAL` | `FLOAT4`
`DOUBLE PRECISION` | `FLOAT8`

## Syntax

A constant value of type `FLOAT` can be entered as a [numeric literal](sql-constants.html#numeric-literals).
For example: `1.414` or `-1234`.

The special IEEE754 values for positive infinity, negative infinity
and [NaN (Not-a-Number)](https://en.wikipedia.org/wiki/NaN) cannot be
entered using numeric literals directly and must be converted using an
[interpreted literal](sql-constants.html#interpreted-literals) or an
[explicit conversion](scalar-expressions.html#explicit-type-coercions)
from a string literal instead.

The following values are recognized:

 Syntax                                 | Value
----------------------------------------|------------------------------------------------
 `inf`, `infinity`, `+inf`, `+infinity` | +&#8734;                                                
 `-inf`, `-infinity`                    | -&#8734;                                                
 `nan`                                  | [NaN (Not-a-Number)](https://en.wikipedia.org/wiki/NaN)

For example:

- `FLOAT '+Inf'`
- `'-Inf'::FLOAT`
- `CAST('NaN' AS FLOAT)`

## Size

A `FLOAT` column supports values up to 8 bytes in width, but the total storage size is likely to be larger due to CockroachDB metadata.

## Examples

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE floats (a FLOAT PRIMARY KEY, b REAL, c DOUBLE PRECISION);
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM floats;
~~~

~~~
+-------------+------------------+-------------+----------------+-----------------------+-------------+
| column_name |    data_type     | is_nullable | column_default | generation_expression |   indices   |
+-------------+------------------+-------------+----------------+-----------------------+-------------+
| a           | FLOAT            |    false    | NULL           |                       | {"primary"} |
| b           | REAL             |    true     | NULL           |                       | {}          |
| c           | DOUBLE PRECISION |    true     | NULL           |                       | {}          |
+-------------+------------------+-------------+----------------+-----------------------+-------------+
(3 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO floats VALUES (1.012345678901, 2.01234567890123456789, CAST('+Inf' AS FLOAT));
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM floats;
~~~

~~~
+----------------+--------------------+------+
|       a        |         b          |  c   |
+----------------+--------------------+------+
| 1.012345678901 | 2.0123456789012346 | +Inf |
+----------------+--------------------+------+
(1 row)
# Note that the value in "b" has been limited to 17 digits.
~~~

## Supported casting and conversion

`FLOAT` values can be [cast](data-types.html#data-type-conversions-and-casts) to any of the following data types:

Type | Details
-----|--------
`INT` | Truncates decimal precision and requires values to be between -2^63 and 2^63-1
`DECIMAL` | Causes an error to be reported if the value is NaN or +/- Inf.
`BOOL` |  **0** converts to `false`; all other values convert to `true`
`STRING` | --

## See also

[Data Types](data-types.html)
