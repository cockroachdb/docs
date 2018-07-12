---
title: INTERVAL
summary: The INTERVAL data type stores a value that represents a span of time.
toc: true
---

The `INTERVAL` [data type](data-types.html) stores a value that represents a span of time. 


## Syntax

A constant value of type `INTERVAL` can be expressed using an
[interpreted literal](sql-constants.html#interpreted-literals), or a
string literal
[annotated with](sql-expressions.html#explicitly-typed-expressions)
type `INTERVAL` or
[coerced to](sql-expressions.html#explicit-type-coercions) type
`INTERVAL`.

`INTERVAL` constants can be expressed using the following formats:

Format | Description
-------|--------
SQL Standard | `INTERVAL 'Y-M D H:M:S'`<br><br>`Y-M D`: Using a single value defines days only; using two values defines years and months. Values must be integers.<br><br>`H:M:S`: Using a single value defines seconds only; using two values defines hours and minutes. Values can be integers or floats.<br><br>Note that each side is optional.
ISO 8601 | `INTERVAL 'P1Y2M3DT4H5M6S'`
Traditional PostgreSQL | `INTERVAL '1 year 2 months 3 days 4 hours 5 minutes 6 seconds'`
Golang | `INTERVAL '1h2m3s4ms5us6ns'`<br><br>Note that `ms` is milliseconds, `us` is microseconds, and `ns` is nanoseconds. Also, all fields support both integers and floats.

CockroachDB also supports using uninterpreted
[string literals](sql-constants.html#string-literals) in contexts
where a `INTERVAL` value is otherwise expected.

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
  (3, INTERVAL '1-2 3 4:5:6');
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

## Supported Casting & Conversion

`INTERVAL` values can be [cast](data-types.html#data-type-conversions-casts) to any of the following data types:

Type | Details
-----|--------
`INT` | Converts to number of seconds (second precision)
`DECIMAL` | Converts to number of seconds (nanosecond precision)
`FLOAT` | Converts to number of picoseconds
`STRING` | Converts to `h-m-s` format (nanosecond precision)

## See Also

[Data Types](data-types.html)
