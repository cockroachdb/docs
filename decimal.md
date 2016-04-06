---
title: DECIMAL
toc: true
---

## Description

The `DECIMAL` [data type](data-types.html) stores exact, fixed-point numbers. This type is used when it is important to preserve exact precision, for example, with monetary data. 

In CockroachDB, the following are aliases for `DECIMAL`:

- `DEC` 
- `NUMERIC` 

## Precision and Scale

To limit a decimal column, use `DECIMAL(precision, scale)`, where `precision` is the **maximum** count of digits both to the left and right of the decimal point and `scale` is the **exact** count of digits to the right of the decimal point. Note that using `DECIMAL(precision)` is equivalent to `DECIMAL(precision, 0)`.

When inserting into a decimal column with specied precision and scale:

- If digits to the right of the decimal point exceed the column's `scale`, CockroachDB rounds to the scale. 
- If digits to the right of the decimal point are less than the column's `scale`, CockroachDB pads to the scale with `0`s.
- If digits to the left and right of the decimal point exceed the column's `precision`, CockroachDB gives an error.  

## Format

When inserting a decimal value, format it as `DECIMAL '1.2345'`. This casts the value as a string, which preserves the number's exact precision.

Alternately, you can cast a float as a decimal: `CAST(1.2345 AS DECIMAL)`. However, note that precision will be limited to 17 digits in total (both to the left and right of the decimal point). 

{{site.data.alerts.callout_info}}A future version of CockroachDB will support declaring a decimal as a literal instead of needing to cast from a string or float.{{site.data.alerts.end}}

## Examples

~~~
create table decimals (a DECIMAL PRIMARY KEY, b DECIMAL(10,5), c NUMERIC);

SHOW COLUMNS FROM decimals;
+-------+---------------+-------+---------+
| Field |     Type      | Null  | Default |
+-------+---------------+-------+---------+
| a     | DECIMAL       | false | NULL    |
| b     | DECIMAL(10,5) | true  | NULL    |
| c     | DECIMAL       | true  | NULL    |
+-------+---------------+-------+---------+

INSERT INTO decimals VALUES (DECIMAL '1.01234567890123456789', DECIMAL '1.01234567890123456789', CAST(1.01234567890123456789 AS DECIMAL));

SELECT * FROM decimals;
+------------------------+---------+--------------------+
|           a            |    b    |         c          |
+------------------------+---------+--------------------+
| 1.01234567890123456789 | 1.01235 | 1.0123456789012346 |
+------------------------+---------+--------------------+
# The value in "a" matches what was inserted exactly.
# The value in "b" has been rounded to the column's scale.
# The value in "c" has been limited to 17 digits.
~~~

## See Also

[Data Types](data-types.html)