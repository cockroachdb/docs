---
title: INTERVAL
toc: true
---

## Description

The `INTERVAL` [data type](data-types.html) stores a value that represents a span of time. 

## Format

When declaring an `INTERVAL`, format it as `INTERVAL '2h30m30s'`, where the following units can be specified either as positive or negative decimal numbers:

- `h` (hour)
- `m` (minute)
- `s` (second)
- `ms` (millisecond)
- `us` (microsecond)
- `ns` (nanosecond)

Regardless of the units used, the interval is stored as hour, minute, and second, for example, `12h2m1.023s`.

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