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
SQL Standard | `INTERVAL 'Y-M-D H:M:S'`<br><br>`Y-M-D`: Using a single value defines days only; using two values defines years and months. Values must be integers.<br><br>`H:M:S`: Using a single value defines seconds only; using two values defines hours and minutes. Values can be integers or floats.<br><br>Note that each side is optional.

Alternatively, you can use a string literal, e.g., `'1h2m3s4ms5us6ns'` or`'1 year 2 months 3 days 4 hours 5 minutes 6 seconds'`, which CockroachDB will resolve into the `INTERVAL` type.

Intervals are stored internally as months, days, and nanoseconds.

## Size

An `INTERVAL` column supports values up to 24 bytes in width, but the total storage size is likely to be larger due to CockroachDB metadata. 

## Example

~~~ sql
> CREATE TABLE intervals (a INT PRIMARY KEY, b INTERVAL);
~~~

~~~
CREATE TABLE
~~~

~~~ sql
> SHOW COLUMNS FROM intervals;
~~~

~~~
+-------+----------+-------+---------+
| Field |   Type   | Null  | Default |
+-------+----------+-------+---------+
| a     | INT      | false | NULL    |
| b     | INTERVAL | true  | NULL    |
+-------+----------+-------+---------+
~~~

~~~ sql
> INSERT INTO intervals VALUES 
  (1, INTERVAL '1h2m3s4ms5us6ns'), 
  (2, INTERVAL '1 year 2 months 3 days 4 hours 5 minutes 6 seconds'), 
  (3, INTERVAL '1-2-3 4:5:6');
~~~

~~~
INSERT 3
~~~

~~~ sql
> SELECT * FROM intervals;
~~~

~~~
+---+------------------+
| a |        b         |
+---+------------------+
| 1 | 1h2m3.004005006s |
| 2 | 14m3d4h5m6s      |
| 3 | 14m3d4h5m6s      |
+---+------------------+
(3 rows)
~~~

## See Also

[Data Types](data-types.html)