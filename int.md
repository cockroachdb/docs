---
title: INT
summary: The INT data type stores 64-bit signed integers, that is, whole numbers from -9,223,372,036,854,775,808 to 9,223,372,036,854,775,807.
toc: false
---

The `INT` [data type](data-types.html) stores 64-bit signed integers, that is, whole numbers from -9,223,372,036,854,775,808 to 9,223,372,036,854,775,807. 

{{site.data.alerts.callout_info}}To auto-generate globally unique integers, use the <a href="serial.html"><code>SERIAL</code></a> data type.{{site.data.alerts.end}}

<div id="toc"></div>

## Aliases

In CockroachDB, the following are aliases for `INT`: 

- `SMALLINT` 
- `INTEGER`
- `INT8` 
- `INT64` 
- `BIGINT`

## Syntax

A constant value of type `INT` can be entered as a [numeric literal](sql-constants.html#numeric-literals).
For example: `42`, `-1234` or `0xCAFE`.

## Size

An `INT` column supports values up to 8 bytes in width, but the total storage size is likely to be larger due to CockroachDB metadata. 

CockroachDB does not offer multiple integer types for different widths; instead, our compression ensures that smaller integers use less disk space than larger integers. 

## Examples

~~~ sql
> CREATE TABLE ints (a INT PRIMARY KEY, b SMALLINT, c INTEGER);

> SHOW COLUMNS FROM ints;
~~~
~~~
+-------+------+-------+---------+
| Field | Type | Null  | Default |
+-------+------+-------+---------+
| a     | INT  | false | NULL    |
| b     | INT  | true  | NULL    |
| c     | INT  | true  | NULL    |
+-------+------+-------+---------+
~~~
~~~ sql
> INSERT INTO ints VALUES (11111, 22222, 33333);

> SELECT * FROM ints;
~~~
~~~
+-------+-------+-------+
|   a   |   b   |   c   |
+-------+-------+-------+
| 11111 | 22222 | 33333 |
+-------+-------+-------+
~~~

## Supported Casting & Conversion

`INT` values can be [cast](data-types.html#data-type-conversions--casts) to any of the following data types:

Type | Details
-----|--------
`DECIMAL` | ––
`FLOAT` | Loses precision if the `INT` value is larger than 2^53 in magnitude
`BOOL` | **0** converts to `false`; all other values convert to `true`
`DATE` | Converts to days since the Unix epoch (Jan. 1, 1970)
`TIMESTAMP` | Converts to seconds since the Unix epoch (Jan. 1, 1970)
`INTERVAL` | Converts to microseconds
`STRING` | ––

## See Also

[Data Types](data-types.html)
