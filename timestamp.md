---
title: TIMESTAMP
toc: true
---

## Description

The `TIMESTAMP` [data type](data-types.html) stores a date and time pair in UTC. 

## Format

When declaring a `TIMESTAMP`, use one of the following formats:

- Date only: `TIMESTAMP '2016-01-25'`
- Date and Time: `TIMESTAMP '2016-01-25 10:10:10.999999999'`
- With Timezone Offset from UTC: `TIMESTAMP '2016-01-25 10:10:10.999999999-5:00'`
- ISO 8601: `TIMESTAMP '2016-01-25T10:10:10.999999999`

Alternately, you can cast a string as a timestamp: `CAST('2016-01-25' AS TIMESTAMP)`. 

Note that the fractional seconds portion is optional.
 
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