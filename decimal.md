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

To limit a decimal column, use `DECIMAL(precision, scale)`, where `precision` is the maximum count of digits both to the left and right of the decimal point, and `scale` is the maximum count of digits to the right of the decimal point.

When inserting a decimal value, if the digits to the right of the decimal point exceed the column's `scale`, CockroachDB rounds to the scale. After rounding, if the total count of digits exceeds the column's `precision`, CockroachDB gives an error.  

## Format

When declaring a decimal, format it as `DECIMAL '1.2345'`. This casts the value as a string, which preserves the number's exact precision.

Alternately, you can cast a float as a decimal: `CAST(1.2345 AS DECIMAL)`. However, note that precision will be limited to 17 digits in total (both to the left and right of the decimal point). 

{{site.data.alerts.callout_info}}A future version of CockroachDB will support declaring a decimal as a literal instead of needing to cast from a string or float.{{site.data.alerts.end}}

## Examples

~~~
CREATE TABLE decimals (a DECIMAL PRIMARY KEY, b NUMERIC);

SHOW COLUMNS FROM decimals;
+-------+---------+-------+---------+
| Field |  Type   | Null  | Default |
+-------+---------+-------+---------+
| a     | DECIMAL | false | NULL    |
| b     | DECIMAL | true  | NULL    |
+-------+---------+-------+---------+

INSERT INTO decimals VALUES (DECIMAL '1.01234567890123456789', CAST('2.01234567890123456789' AS DECIMAL));

SELECT * FROM decimals;
+------------------------+--------------------+
|           a            |         b          |
+------------------------+--------------------+
| 1.01234567890123456789 | 2.0123456789012346 |
+------------------------+--------------------+
# The value in "a" is precise, while the value in "b" has been limited to 17 digits.
~~~

## See Also

[Data Types](data-types.html)