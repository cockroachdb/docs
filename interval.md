---
title: INTERVAL
summary: The INTERVAL data type stores a value that represents a span of time.
toc: false
---

The `INTERVAL` [data type](data-types.html) stores a value that represents a span of time. 

<div id="toc"></div>

## Formats

When inserting into an `INTERVAL` column, use one of the following formats:

Format | Description
-------|--------
Golang | `INTERVAL '1h2m3s4ms5us6ns'`<br><br>Note that `ms` is milliseconds, `us` is microseconds, and `ns` is nanoseconds. Also, all fields support both integers and floats.
Traditional Postgres | `INTERVAL '1 year 2 months 3 days 4 hours 5 minutes 6 seconds'` 
ISO 8601 | `INTERVAL 'P1Y2M3DT4H5M6S'`
SQL Standard | {% include develop-paragraph.md %}<br><br>`INTERVAL 'H:M:S'`<br><br>Using a single field defines seconds only, and using two fields defines hours and minutes. Also, all fields support both integers and floats.

Alternatively, you can use a string literal, e.g., `'1h2m3s4ms5us6ns'` or`'1 year 2 months 3 days 4 hours 5 minutes 6 seconds'`, which CockroachDB will resolve into the `INTERVAL` type.

Intervals are stored internally as months, days, and nanoseconds.

## Size

An `INTERVAL` column supports values up to 24 bytes in width, but the total storage size is likely to be larger due to CockroachDB metadata. 

## Example

~~~
> CREATE TABLE intervals (a INT PRIMARY KEY, b INTERVAL);
CREATE TABLE

> SHOW COLUMNS FROM intervals;
+-------+----------+-------+---------+
| Field |   Type   | Null  | Default |
+-------+----------+-------+---------+
| a     | INT      | false | NULL    |
| b     | INTERVAL | true  | NULL    |
+-------+----------+-------+---------+

> INSERT INTO intervals VALUES 
    (1, INTERVAL '1h2m3s4ms5us6ns'), 
    (2, INTERVAL '1 year 2 months 3 days 4 hours 5 minutes 6 seconds'), 
    (3, INTERVAL '4:5:6')
;
INSERT 3

+---+------------------+
| a |        b         |
+---+------------------+
| 1 | 1h2m3.004005006s |
| 2 | 14m3d4h5m6s      |
| 3 | 4h5m6s           |
+---+------------------+
(3 rows)
~~~

## See Also

[Data Types](data-types.html)