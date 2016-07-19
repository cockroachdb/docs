---
title: INTERVAL
summary: The INTERVAL data type stores a value that represents a span of time.
toc: false
---

The `INTERVAL` [data type](data-types.html) stores a value that represents a span of time. 

<div id="toc"></div>

## Format

When inserting into an `INTERVAL` column, use one of the following formats:

Format | Description
-------|--------
Golang | `INTERVAL '1h2m3s4ms5us6ns'`, where `ms` is millisecond, `us` is microsecond, and `ns` is nanosecond<br><br>Regardless of the units used, the interval is stored as hour, minute, and second, for example, `1h2m3.004005006s`.
Traditional Postgres | `INTERVAL '1 year 2 months 3 days 4 hours 5 minutes 6 seconds'`<br><br>Regardless of the units used, the interval is stored as month, day, hour, minute, and second, for example, `14m3d4h5m6s`. 
ISO 8601 | `INTERVAL 'P1Y2M3DT4H5M6S'`<br><br>Regardless of the units used, the interval is stored as month, day, hour, minute, and second, for example, `14m3d4h5m6s`.

Alternatively, you can use a string literal, e.g., `'1h2m3s4ms5us6ns'` or`'1 year 2 months 3 days 4 hours 5 minutes 6 seconds'`, which CockroachDB will resolve into the `INTERVAL` type.

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

INSERT INTO intervals VALUES (1, INTERVAL '1h2m3s4ms5us6ns'), (2, INTERVAL '1 year 2 months 3 days 4 hours 5 minutes 6 seconds');

SELECT * FROM intervals;
+---+------------------+
| a |        b         |
+---+------------------+
| 1 | 1h2m3.004005006s |
| 2 | 14m3d4h5m6s      |
+---+------------------+
(2 rows)
~~~

## See Also

[Data Types](data-types.html)