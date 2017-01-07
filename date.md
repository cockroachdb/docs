---
title: DATE
summary: The DATE data type stores a year, month, and day.
toc: false
---

The `DATE` [data type](data-types.html) stores a year, month, and day.

<div id="toc"></div>

## Format

When inserting into a `DATE` column, format the value as `DATE '2016-01-25'`.

Alternatively, you can use a string literal, e.g., `'2016-01-25'`, which CockroachDB will resolve into the `DATE` type.

Note that in some contexts, dates may be displayed with hours, minutes, seconds, and timezone set to 0.

## Size

A `DATE` column supports values up to 8 bytes in width, but the total storage size is likely to be larger due to CockroachDB metadata.

## Examples

~~~ sql
> CREATE TABLE dates (a DATE PRIMARY KEY, b INT);

> SHOW COLUMNS FROM dates;
~~~
~~~
+-------+------+-------+---------+
| Field | Type | Null  | Default |
+-------+------+-------+---------+
| a     | DATE | false | NULL    |
| b     | INT  | true  | NULL    |
+-------+------+-------+---------+
~~~
~~~ sql
> INSERT INTO dates VALUES (DATE '2016-03-26', 12345);

> SELECT * FROM dates;
~~~
~~~
+---------------------------------+-------+
|                a                |   b   |
+---------------------------------+-------+
| 2016-03-26 00:00:00 +0000 +0000 | 12345 |
+---------------------------------+-------+
~~~

## Supported Casting & Conversion

`DATE` values support the following [data-type casting](data-types.html#type-casting--conversion):

Type | Supported? | Details
-----|---------|--------
`INT` | ✓ | Converts to number of days since the Unix epoch (Jan. 1, 1970)
`DECIMAL` | ✓ | Converts to number of days since the Unix epoch (Jan. 1, 1970)
`FLOAT` | ✓ | Converts to number of days since the Unix epoch (Jan. 1, 1970)
`BOOL` | ✗ | ––
`TIMESTAMP` | ✓ | ––
`INTERVAL` | ✗ | ––
`STRING` | ✓ | ––
`BYTES` | ✗ | ––

{{site.data.alerts.callout_info}}Because the <a href="serial.html"><code>SERIAL</code> data type</a> represents values automatically generated CockroachDB to uniquely identify rows, you cannot meaningfully cast other data types as <code>SERIAL</code> values.{{site.data.alerts.end}}

## See Also

[Data Types](data-types.html)