---
title: FLOAT
toc: true
---

## Description

The `FLOAT` [data type](data-types.html) stores inexact, floating-point numbers with up to 17 digits in total and at least one digit to the right of the decimal point. 

## Synonyms

In CockroachDB, the following are synonyms of `FLOAT`:

- `REAL` 
- `DOUBLE PRECISION` 

## Format

When declaring a float, format it as `1.2345`. 

Alternately, you can use the `CAST()` function to declare a float as `+Inf` (positive infinity), `-Inf` (negative infinity), or `NaN` (not a number):

- `CAST('+Inf' AS FLOAT)`
- `CAST('-Inf' AS FLOAT)`
- `CAST('NaN' AS FLOAT)`

## Examples

~~~
CREATE TABLE floats (a FLOAT PRIMARY KEY, b REAL, c DOUBLE PRECISION);

SHOW COLUMNS FROM floats;
+-------+-------+-------+---------+
| Field | Type  | Null  | Default |
+-------+-------+-------+---------+
| a     | FLOAT | false | NULL    |
| b     | FLOAT | true  | NULL    |
| C     | FLOAT | true  | NULL    |
+-------+-------+-------+---------+

INSERT INTO floats VALUES (1.012345678901, 2.01234567890123456789, CAST('+Inf' AS FLOAT));

SELECT * FROM floats;
+----------------+--------------------+------+
|       a        |         b          |  c   |
+----------------+--------------------+------+
| 1.012345678901 | 2.0123456789012346 | +Inf |
+----------------+--------------------+------+
# Note that the value in "a" has been limited to 17 digits.
~~~

## See Also

[Data Types](data-types.html)