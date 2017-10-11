---
title: INT
summary: CockroachDB supports various 64-bit and 32-bit signed integer data types.
toc: false
---

CockroachDB supports various 64-bit and 32-bit signed integer [data types](data-types.html).

{{site.data.alerts.callout_info}}To auto-generate globally unique integers, use the <a href="uuid.html"><code>UUID</code></a> or <a href="serial.html"><code>SERIAL</code></a> data type.{{site.data.alerts.end}}

<div id="toc"></div>

## Names and Aliases

Name | Width | Aliases
-----|-------|--------
`INT` | 64-bit | None
`INTEGER` | 64-bit | None
`BIGINT` | 64-bit | `INT8`<br>`INT64`
`SMALLINT` | 32-bit | `INT2`

## Syntax

A constant value of type `INT` can be entered as a [numeric literal](sql-constants.html#numeric-literals).
For example: `42`, `-1234`, or `0xCAFE`.

## Size

All integers are stored as 64-bit (8 bytes) in width, but the total storage size is likely to be larger due to CockroachDB metadata.

Aside from the 64-bit and 32-bit types mentioned above, CockroachDB does not offer integer types for different widths; instead, our compression ensures that smaller integers use less disk space than larger integers. However, you can use the `BIT(n)` type, with `n` from 1 to 64, to constrain integers based on their corresponding binary values. For example, `BIT(5)` would allow `31` because it corresponds to the five-digit binary integer `11111`, but would not allow `32` because it corresponds to the six-digit binary integer `100000`, which is 1 bit too long. See the [example](#examples) below for a demonstration.

{{site.data.alerts.callout_info}}<code>BIT</code> values are input and displayed in decimal format by default like all other integers, not in binary format. Also note that <code>BIT</code> is equivalent to <code>BIT(1)</code>.{{site.data.alerts.end}}

## Examples

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE ints (a INT PRIMARY KEY, b SMALLINT, c BIT(5));
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM ints;
~~~

~~~
+-------+----------+-------+---------+-------------+
| Field |   Type   | Null  | Default |   Indices   |
+-------+----------+-------+---------+-------------+
| a     | INT      | false | NULL    | {"primary"} |
| b     | SMALLINT | true  | NULL    | {}          |
| c     | BIT(5)   | true  | NULL    | {}          |
+-------+----------+-------+---------+-------------+
(3 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO ints VALUES (1, 32, 32);
~~~

~~~
pq: bit string too long for type BIT(5) (column "c")
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO ints VALUES (1, 32, 31);
~~~

~~~
INSERT 1
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM ints;
~~~

~~~
+---+----+----+
| a | b  | c  |
+---+----+----+
| 1 | 32 | 31 |
+---+----+----+
(1 row)
~~~

## Supported Casting & Conversion

`INT` values can be [cast](data-types.html#data-type-conversions-casts) to any of the following data types:

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
