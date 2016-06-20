---
title: INTERVAL
summary: The INTERVAL data type stores a value that represents a span of time.
toc: false
---

The `INTERVAL` [data type](data-types.html) stores a value that represents a span of time. 

<div id="toc"></div>

## Format

When inserting into an `INTERVAL` column, format the value as `INTERVAL '2h30m30s'`, where the following units can be specified either as positive or negative decimal numbers:

- `h` (hour)
- `m` (minute)
- `s` (second)
- `ms` (millisecond)
- `us` (microsecond)
- `ns` (nanosecond)

Alternatively, you can use a string literal, e.g., `'2h30m30s'`, which CockroachDB will resolve into the `INTERVAL` type.

Note that regardless of the units used, the interval is stored as hour, minute, and second, for example, `12h2m1.023s`.

## Size

An `INTERVAL` column supports values up to 24 bytes in width, but the total storage size is likely to be larger due to CockroachDB metadata. 

## Examples

~~~
CREATE TABLE intervals (a INT PRIMARY KEY, b INTERVAL);

SHOW COLUMNS FROM intervals;
+-------+----------+-------+---------+
| Field |   Type   | Null  | Default |
+-------+----------+-------+---------+
| a     | INT      | false | NULL    |
| b     | INTERVAL | true  | NULL    |
+-------+----------+-------+---------+

INSERT INTO intervals VALUES (1111, INTERVAL '2h30m50ns'), (2222, INTERVAL '-2h30m50ns');

SELECT * FROM intervals;
+------+-------------------+
|  a   |         b         |
+------+-------------------+
| 1111 | 2h30m0.00000005s  |
| 2222 | -2h30m0.00000005s |
+------+-------------------+
~~~

## See Also

[Data Types](data-types.html)