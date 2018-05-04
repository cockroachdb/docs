---
title: TIME
summary: The TIME data type stores a time of day in UTC, whereas TIMETZ stores a time of day with a time zone offset from UTC.
toc: false
---
<span class="version-tag">New in v2.0:</span> The `TIME` [data type](data-types.html) stores the time of day in UTC, whereas `TIMETZ` stores a time of day with a time zone offset from UTC.

<div id="toc"></div>

## Variants

`TIME` has two variants:

- `TIME` presents all `TIME` values in UTC.

- `TIMETZ` converts `TIME` values from UTC to the client's session time zone (unless another time zone is specified for the value). However, it is conceptually important to note that `TIMETZ` **does not** store any time zone data.

    {{site.data.alerts.callout_info}}The default session time zone is UTC, which means that by default <code>TIMETZ</code> values display in UTC.{{site.data.alerts.end}}

The difference between these two variants is that `TIMETZ` uses the client's session time zone, while the other simply does not. This behavior extends to functions like `now()` and `extract()` on `TIMETZ` values.

## Best Practices

We recommend always using the `TIMETZ` variant because the `TIME` variant can sometimes lead to unexpected behaviors when it ignores a session offset. However, we also recommend you avoid setting a session time for your database.

## Aliases

In CockroachDB, the following are aliases:

- `TIME`, `TIME WITHOUT TIME ZONE`
- `TIMETZ`, `TIME WITH TIME ZONE`

## Syntax

A constant value of type `TIME`/`TIMETZ` can be expressed using an
[interpreted literal](sql-constants.html#interpreted-literals), or a
string literal
[annotated with](scalar-expressions.html#explicitly-typed-expressions)
type `TIME`/`TIMETZ` or
[coerced to](scalar-expressions.html#explicit-type-coercions) type
`TIME`/`TIMETZ`.

The string format for time is `HH:MM:SS.SSSSSS`. For example: `TIME '05:40:00.000001'`.

To express a `TIMETZ` value (with time zone offset from UTC), use
the following format: `TIMETZ '10:10:10.555555-05:00'`

When it is unambiguous, a simple unannotated [string literals](sql-constants.html#string-literals) can also
be automatically interpreted as type `TIME` or `TIMETZ`.

Note that the fractional portion of `TIME`/`TIMETZ` is optional and is rounded to microseconds (i.e., six digits after the decimal) for compatibility with the PostgreSQL wire protocol.

## Size

A `TIME`/`TIMETZ` column supports values up to 8 bytes in width, but the total storage size is likely to be larger due to CockroachDB metadata.

## Example

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE time (a INT PRIMARY KEY, b TIMETZ);
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM time;
~~~
~~~
+-------+--------+-------+---------+-------------+
| Field |  Type  | Null  | Default |   Indices   |
+-------+--------+-------+---------+-------------+
| a     | INT    | false | NULL    | {"primary"} |
| b     | TIMETZ | true  | NULL    | {}          |
+-------+--------+-------+---------+-------------+
(2 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO time VALUES (1, TIMETZ '05:40:00-05:00'), (2, TIMETZ '05:40:00');
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM time;
~~~
~~~
+---+---------------------------+
| a |             b             |
+---+---------------------------+
| 1 | 0000-01-01 10:40:00+00:00 |
| 2 | 0000-01-01 05:40:00+00:00 |
+---+---------------------------+
(2 rows)
# Note that the first timestamp is UTC-05:00, which is the equivalent of EST.
~~~

{{site.data.alerts.callout_info}}The <code>cockroach sql</code> shell displays the data and time zone due to the Go SQL driver it uses. Other client drivers may behave similarly. In such cases, however, the date and time zone are not relevant and are not stored in the database.{{site.data.alerts.end}}

## Supported Casting & Conversion

`TIME` values can be [cast](data-types.html#data-type-conversions-casts) to any of the following data types:

Type | Details
-----|--------
`INTERVAL` | Converts to the span of time since midnight (00:00)
`STRING` | Converts to format `'HH:MM:SS.SSSSSS'` (microsecond precision)

## See Also

[Data Types](data-types.html)
