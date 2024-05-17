---
title: FLOAT
summary: The FLOAT data type stores inexact, floating-point numbers with up to 17 digits in total and at least one digit to the right of the decimal point.
toc: true
docs_area: reference.sql
---

CockroachDB supports various inexact, floating-point number [data types]({% link {{ page.version.version }}/data-types.md %}) with up to 17 digits of decimal precision.

They are handled internally using the [standard double-precision (64-bit binary-encoded) IEEE754 format](https://wikipedia.org/wiki/IEEE_floating_point).


## Names and Aliases

Name | Aliases
-----|--------
`FLOAT` | None
`REAL` | `FLOAT4`
`DOUBLE PRECISION` | `FLOAT8`

## Syntax

A constant value of type `FLOAT` can be entered as a [numeric literal]({% link {{ page.version.version }}/sql-constants.md %}#numeric-literals).
For example: `1.414` or `-1234`.

The special IEEE754 values for positive infinity, negative infinity
and [NaN (Not-a-Number)](https://wikipedia.org/wiki/NaN) cannot be
entered using numeric literals directly and must be converted using an
[interpreted literal]({% link {{ page.version.version }}/sql-constants.md %}#interpreted-literals) or an
[explicit conversion]({% link {{ page.version.version }}/scalar-expressions.md %}#explicit-type-coercions)
from a string literal instead.

The following values are recognized:

 Syntax                                 | Value
----------------------------------------|------------------------------------------------
 `inf`, `infinity`, `+inf`, `+infinity` | +&#8734;
 `-inf`, `-infinity`                    | -&#8734;
 `nan`                                  | [NaN (Not-a-Number)](https://wikipedia.org/wiki/NaN)

For example:

- `FLOAT '+Inf'`
- `'-Inf'::FLOAT`
- `CAST('NaN' AS FLOAT)`

## Size

A `FLOAT` column supports values up to 8 bytes in width, but the total storage size is likely to be larger due to CockroachDB metadata.

## Examples

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE floats (a FLOAT PRIMARY KEY, b REAL, c DOUBLE PRECISION);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM floats;
~~~

~~~
  column_name | data_type | is_nullable | column_default | generation_expression |  indices  | is_hidden
--------------+-----------+-------------+----------------+-----------------------+-----------+------------
  a           | FLOAT8    |    false    | NULL           |                       | {primary} |   false
  b           | FLOAT4    |    true     | NULL           |                       | {primary} |   false
  c           | FLOAT8    |    true     | NULL           |                       | {primary} |   false
(3 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO floats VALUES (1.012345678901, 2.01234567890123456789, CAST('+Inf' AS FLOAT));
~~~

{% include_cached copy-clipboard.html %}
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

`FLOAT` values can be [cast]({% link {{ page.version.version }}/data-types.md %}#data-type-conversions-and-casts) to any of the following data types:

Type | Details
-----|--------
`INT` | Rounds the float to the nearest integer. If equidistant to two integers, rounds to the even integer. See [Cast `FLOAT` to `INT`](#cast-float-to-int).
`DECIMAL` | Causes an error to be reported if the value is NaN or +/- Inf.
`BOOL` |  **0** converts to `false`; any other value converts to `true`.
`STRING` | --

### Cast `FLOAT` to `INT`

If you cast a float to an integer, it is rounded to the nearest integer. If it is equidistant to two integers, it is rounded to the even integer.

For example:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT f::INT FROM (VALUES (-1.5::FLOAT), (-0.5::FLOAT), (0.5::FLOAT), (1.5::FLOAT)) v(f);
~~~

~~~
  f
------
  -2
   0
   0
   2
~~~

## See also

[Data Types]({% link {{ page.version.version }}/data-types.md %})
