---
title: INT
summary: CockroachDB supports various signed integer data types.
toc: true
---

CockroachDB supports various signed integer [data types](data-types.html).

{{site.data.alerts.callout_info}}To auto-generate globally unique values, use the <a href="uuid.html"><code>UUID</code></a> or <a href="serial.html"><code>SERIAL</code></a> data type.{{site.data.alerts.end}}


## Names and Aliases

Name | Allowed Width | Aliases
-----|-------|--------
`INT` | 64-bit | `INTEGER`<br>`INT8`<br>`INT64`<br>`BIGINT`
`INT4` | 32-bit | None
`INT2` | 16-bit | `SMALLINT`

## Syntax

A constant value of type `INT` can be entered as a [numeric literal](sql-constants.html#numeric-literals).
For example: `42`, `-1234`, or `0xCAFE`.

## Size

The different integer types place different constraints on the range of allowable values, but all integers are stored in the same way regardless of type. Smaller values take up less space than larger ones (based on the numeric value, not the data type).

## Examples

{% include copy-clipboard.html %}
~~~ sql?nofmt
> CREATE TABLE ints (a INT PRIMARY KEY, b SMALLINT);
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM ints;
~~~

~~~
+-------------+-----------+-------------+----------------+-----------------------+-------------+
| column_name | data_type | is_nullable | column_default | generation_expression |   indices   |
+-------------+-----------+-------------+----------------+-----------------------+-------------+
| a           | INT       |    false    | NULL           |                       | {"primary"} |
| b           | SMALLINT  |    true     | NULL           |                       | {}          |
+-------------+-----------+-------------+----------------+-----------------------+-------------+
(3 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO ints VALUES (1, 32);
~~~

~~~
INSERT 1
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM ints;
~~~

~~~
+---+----+
| a | b  |
+---+----+
| 1 | 32 |
+---+----+
(1 row)
~~~

## Supported casting and conversion

`INT` values can be [cast](data-types.html#data-type-conversions-and-casts) to any of the following data types:

Type | Details
-----|--------
`DECIMAL` | ––
`FLOAT` | Loses precision if the `INT` value is larger than 2^53 in magnitude
`BOOL` | **0** converts to `false`; all other values convert to `true`
`DATE` | Converts to days since the Unix epoch (Jan. 1, 1970)
`TIMESTAMP` | Converts to seconds since the Unix epoch (Jan. 1, 1970)
`INTERVAL` | Converts to microseconds
`STRING` | ––

## See also

[Data Types](data-types.html)
