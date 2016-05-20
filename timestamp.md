---
title: TIMESTAMP
toc: false
---

The `TIMESTAMP` [data type](data-types.html) stores a date and time pair in UTC. 

<div id="toc"></div>

## Aliases

In CockroachDB, `TIMESTAMPZ` is an alias for `TIMESTAMP`.

## Format

When inserting into a `TIMESTAMP` column, use one of the following formats:

- Date only: `TIMESTAMP '2016-01-25'`
- Date and Time: `TIMESTAMP '2016-01-25 10:10:10.555555'`
- With Timezone Offset from UTC: `TIMESTAMP '2016-01-25 10:10:10.555555-5:00'`
- ISO 8601: `TIMESTAMP '2016-01-25T10:10:10.555555'`

Alternatively, you can cast a string as a timestamp: `CAST('2016-01-25T10:10:10' AS TIMESTAMP)`.

Note that the fractional portion is optional and is rounded to
microseconds (6 digits after decimal) for compatibility with the
PostgreSQL wire protocol. To create a timestamp with nanoseconds, use the
`parse_timestamp_ns(string)` [function](functions-and-operators.html),
which creates a timestamp with nanoseconds from a string. To create a string
with nanosecond precision, use `format_timestamp_ns(ts)`. The `extract`
function supports nanoseconds as well: `extract(nanosecond from ts)`.

## Size

A `TIMESTAMP` column supports values up to 12 bytes in width, but the total storage size is likely to be larger due to CockroachDB metadata. 

## Examples

~~~
CREATE TABLE timestamps (a INT PRIMARY KEY, b TIMESTAMP);

SHOW COLUMNS FROM timestamps;
+-------+-----------+-------+---------+
| Field |   Type    | Null  | Default |
+-------+-----------+-------+---------+
| a     | INT       | false | NULL    |
| b     | TIMESTAMP | true  | NULL    |
+-------+-----------+-------+---------+

INSERT INTO timestamps VALUES (1, TIMESTAMP '2016-03-26 10:10:10-05:00'), (2, TIMESTAMP '2016-03-26');

SELECT * FROM timestamps;
+------+---------------------------------+
|  a   |                b                |
+------+---------------------------------+
|  1   | 2016-03-26 15:10:10 +0000 +0000 |
|  2   | 2016-03-26 00:00:00 +0000 +0000 |
+------+---------------------------------+
# Note that the first timestamp is UTC-05:00, which is the equivalent of EST.
~~~

## See Also

[Data Types](data-types.html)