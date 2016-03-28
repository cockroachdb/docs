---
title: DECIMAL
toc: true
---

## Description

The `DECIMAL` [data type](data-types.html) stores exact, fixed-point numbers with no limit on digits to the left and right of the decimal point. This type is used when it is important to preserve exact precision, for example, with monetary data. 

## Synonyms

In CockroachDB, the following are synonyms of `DECIMAL`:

- `DEC` 
- `NUMERIC` 

## Precision and Scale

Precision (the maximum count of digits in a whole number, both to the left and right of the decimal point) and scale (the maximum count of digits to the right of the decimal point) are always unlimited for a `DECIMAL` value. If you specify these limits by declaring `DECIMAL(precision, scale)` on a column, they will not be enforced. 

## Format

When declaring a decimal, format it as `DECIMAL '1.2345'`. This casts the value as a string, which preserves the number's exact precision.

Alternately, you can cast a float as a decimal: `CAST(1.2345 AS DECIMAL)`. However, note that precision will be limited to 17 digits in total (both to the left and right of the decimal point). 

{{site.data.alerts.callout_info}}In an upcoming version, CockroachDB will support declaring a decimal as a literal instead needing to cast from a string or float.{{site.data.alerts.end}}

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