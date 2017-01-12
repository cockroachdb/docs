---
title: TIMESTAMP
summary: The TIMESTAMP data type stores a date and time pair in UTC, whereas TIMESTAMPTZ stores a date and time pair with a time zone offset from UTC.
toc: false
---

The `TIMESTAMP` [data type](data-types.html) stores a date and time pair in UTC, whereas `TIMESTAMPTZ` stores a date and time pair with a time zone offset from UTC. 

<div id="toc"></div>

## Aliases

In CockroachDB, `TIMESTAMP WITHOUT TIME ZONE` is an alias for `TIMESTAMP` and `TIMESTAMP WITH TIME ZONE` is an alias for `TIMESTAMPTZ`.

## Formats

When inserting into a `TIMESTAMP` column, use one of the following formats:

- Date only: `TIMESTAMP '2016-01-25'`
- Date and Time: `TIMESTAMP '2016-01-25 10:10:10.555555'`
- ISO 8601: `TIMESTAMP '2016-01-25T10:10:10.555555'`

When inserting into a `TIMESTAMPTZ` column (with time zone offset from UTC), use the following format: `TIMESTAMPTZ '2016-01-25 10:10:10.555555-05:00'`

Alternatively, you can use a string literal, e.g., `'2016-01-25T10:10:10'` or `'2016-01-25 10:10:10.555555-05:00'`, which CockroachDB will resolve into the `TIMESTAMP` or `TIMESTAMPTZ` type.

Note that the fractional portion is optional and is rounded to
microseconds (6 digits after decimal) for compatibility with the
PostgreSQL wire protocol. 

## Size

A `TIMESTAMP` column supports values up to 12 bytes in width, but the total storage size is likely to be larger due to CockroachDB metadata. 

## Examples

~~~ sql
> CREATE TABLE timestamps (a INT PRIMARY KEY, b TIMESTAMPTZ);

> SHOW COLUMNS FROM timestamps;
~~~
~~~
+-------+--------------------------+-------+---------+
| Field |           Type           | Null  | Default |
+-------+--------------------------+-------+---------+
| a     | INT                      | false | NULL    |
| b     | TIMESTAMP WITH TIME ZONE | true  | NULL    |
+-------+--------------------------+-------+---------+
(2 rows)
~~~
~~~ sql
> INSERT INTO timestamps VALUES (1, TIMESTAMPTZ '2016-03-26 10:10:10-05:00'), (2, TIMESTAMPTZ '2016-03-26');

> SELECT * FROM timestamps;
~~~
~~~
+------+---------------------------------+
|  a   |                b                |
+------+---------------------------------+
|  1   | 2016-03-26 15:10:10 +0000 +0000 |
|  2   | 2016-03-26 00:00:00 +0000 +0000 |
+------+---------------------------------+
# Note that the first timestamp is UTC-05:00, which is the equivalent of EST.
~~~

## Supported Casting & Conversion

`TIMESTAMP` values can be [cast](data-types.html#data-type-conversions--casts) to any of the following data types:

Type | Details
-----|--------
`INT` | Converts to number of seconds since the Unix epoch (Jan. 1, 1970)
`SERIAL` | Converts to number of seconds since the Unix epoch (Jan. 1, 1970)
`DECIMAL` | Converts to number of seconds since the Unix epoch (Jan. 1, 1970)
`FLOAT` | Converts to number of seconds since the Unix epoch (Jan. 1, 1970)
`DATE` | ––
`STRING` | ––

{{site.data.alerts.callout_info}}Because the <a href="serial.html"><code>SERIAL</code> data type</a> represents values automatically generated CockroachDB to uniquely identify rows, you cannot meaningfully cast other data types as <code>SERIAL</code> values.{{site.data.alerts.end}}

## See Also

[Data Types](data-types.html)