---
title: FLOAT
summary: The FLOAT data type stores inexact, floating-point numbers with up to 17 digits in total and at least one digit to the right of the decimal point.
toc: false
---

The `FLOAT` [data type](data-types.html) stores inexact, floating-point numbers with up to 17 digits in total and at least one digit to the right of the decimal point. 

<div id="toc"></div>

## Aliases

In CockroachDB, the following are aliases for `FLOAT`:

- `REAL` 
- `DOUBLE PRECISION` 

## Format

When inserting into a `FLOAT` column, format the value as a numeric literal, e.g., `1.2345` or `1`.

Alternately, you can cast `+Inf` (positive infinity), `-Inf` (negative infinity), or `NaN` (not a number) as a float:

- `CAST('+Inf' AS FLOAT)`
- `CAST('-Inf' AS FLOAT)`
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