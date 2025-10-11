---
title: TIME
summary: The TIME data type stores a time of day without a time zone.
toc: true
---
<span class="version-tag">New in v2.0:</span> The `TIME` [data type](data-types.html) stores the time of day without a time zone.


## Aliases

In CockroachDB, the following are aliases:

- `TIME WITHOUT TIME ZONE`

## Syntax

A constant value of type `TIME` can be expressed using an
[interpreted literal](sql-constants.html#interpreted-literals), or a
string literal
[annotated with](scalar-expressions.html#explicitly-typed-expressions)
type `TIME` or
[coerced to](scalar-expressions.html#explicit-type-coercions) type
`TIME`.

The string format for time is `HH:MM:SS.SSSSSS`. For example: `TIME '05:40:00.000001'`.

CockroachDB also supports using uninterpreted
[string literals](sql-constants.html#string-literals) in contexts
where a `TIME` value is otherwise expected.

The fractional portion of `TIME` is optional and is rounded to microseconds (i.e., six digits after the decimal) for compatibility with the PostgreSQL wire protocol.

## Size

A `TIME` column supports values up to 8 bytes in width, but the total storage size is likely to be larger due to CockroachDB metadata.

## Example

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE time (a INT PRIMARY KEY, b TIME);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM time;
~~~
~~~
+-------+------+-------+---------+-------------+
| Field | Type | Null  | Default |   Indices   |
+-------+------+-------+---------+-------------+
| a     | INT  | false | NULL    | {"primary"} |
| b     | TIME | true  | NULL    | {}          |
+-------+------+-------+---------+-------------+
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO time VALUES (1, TIME '05:40:00');
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM time;
~~~
~~~
+---+---------------------------+
| a |             b             |
+---+---------------------------+
| 1 | 0000-01-01 05:40:00+00:00 |
+---+---------------------------+
~~~
{{site.data.alerts.callout_info}}The <code>cockroach sql</code> shell displays the date and timezone due to the Go SQL driver it uses. Other client drivers may behave similarly. In such cases, however, the date and timezone are not relevant and are not stored in the database.{{site.data.alerts.end}}

## Supported Casting & Conversion

`TIME` values can be [cast](data-types.html#data-type-conversions-casts) to any of the following data types:

Type | Details
-----|--------
`INTERVAL` | Converts to the span of time since midnight (00:00)
`STRING` | Converts to format `'HH:MM:SS.SSSSSS'` (microsecond precision)

## See Also

- [Data Types](data-types.html)
- [SQL Feature Support](sql-feature-support.html)
