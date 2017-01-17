---
title: FLOAT
summary: The FLOAT data type stores inexact, floating-point numbers with up to 17 digits in total and at least one digit to the right of the decimal point.
toc: false
---

The `FLOAT` [data type](data-types.html) stores inexact, floating-point numbers with up to 17 digits in total and at least one digit to the right of the decimal point. 

They are handled internally using the [standard double-precision
(64-bit binary-encoded) IEEE754 format](https://en.wikipedia.org/wiki/IEEE_floating_point).

<div id="toc"></div>

## Aliases

In CockroachDB, the following are aliases for `FLOAT`:

- `REAL` 
- `DOUBLE PRECISION` 

## Format

When inserting into a `FLOAT` column, format the value as a numeric literal, e.g., `1.2345` or `1`.

For more details about `FLOAT` numeric formats,
see the section on [SQL constants](sql-constants.html).

The special IEEE754 values for positive infinity, negative infinity
and Not A Number (NaN) cannot be entered using numeric literals directly and
must be converted using an interpreted literal instead. For example:

- `FLOAT '+Inf'`
- `'-Inf':::FLOAT`
- `CAST('NaN' AS FLOAT)`

## Size

A `FLOAT` column supports values up to 8 bytes in width, but the total storage size is likely to be larger due to CockroachDB metadata.  

## Examples

~~~ sql
> CREATE TABLE floats (a FLOAT PRIMARY KEY, b REAL, c DOUBLE PRECISION);

> SHOW COLUMNS FROM floats;
~~~
~~~
+-------+-------+-------+---------+
| Field | Type  | Null  | Default |
+-------+-------+-------+---------+
| a     | FLOAT | false | NULL    |
| b     | FLOAT | true  | NULL    |
| C     | FLOAT | true  | NULL    |
+-------+-------+-------+---------+
~~~
~~~ sql
> INSERT INTO floats VALUES (1.012345678901, 2.01234567890123456789, CAST('+Inf' AS FLOAT));

> SELECT * FROM floats;
~~~
~~~ 
+----------------+--------------------+------+
|       a        |         b          |  c   |
+----------------+--------------------+------+
| 1.012345678901 | 2.0123456789012346 | +Inf |
+----------------+--------------------+------+
# Note that the value in "b" has been limited to 17 digits.
~~~

## Supported Casting & Conversion

`DECIMAL` values can be [cast](data-types.html#data-type-conversions--casts) to any of the following data types:

Type | Details
-----|--------
`INT` | Truncates decimal precision and requires values to be between -2^63 and 2^63-1
`DECIMAL` | ––
`BOOL` |  **0** converts to `false`; all other values convert to `true`

{{site.data.alerts.callout_info}}Because the <a href="serial.html"><code>SERIAL</code> data type</a> represents values automatically generated CockroachDB to uniquely identify rows, you cannot meaningfully cast other data types as <code>SERIAL</code> values.{{site.data.alerts.end}}

## See Also

[Data Types](data-types.html)
