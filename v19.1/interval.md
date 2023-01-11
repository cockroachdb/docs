---
title: INTERVAL
summary: The INTERVAL data type stores a value that represents a span of time.
toc: true
---

The `INTERVAL` [data type](data-types.html) stores a value that represents a span of time.

## Aliases

There are no aliases for the interval type. However, CockroachDB supports using uninterpreted [string literals](sql-constants.html#string-literals) in contexts where an `INTERVAL` value is otherwise expected.

## Syntax

A constant value of type `INTERVAL` can be expressed using an
[interpreted literal](sql-constants.html#interpreted-literals), or a
string literal
[annotated with](scalar-expressions.html#explicitly-typed-expressions)
type `INTERVAL` or
[coerced to](scalar-expressions.html#explicit-type-coercions) type
`INTERVAL`.

`INTERVAL` constants can be expressed using the following formats:

Format | Description
-------|--------
SQL Standard | `INTERVAL 'Y-M D H:M:S'`<br><br>`Y-M D`: Using a single value defines days only; using two values defines years and months. Values must be integers.<br><br>`H:M:S`: Using a single value defines seconds only; using two values defines hours and minutes. Values can be integers or floats.<br><br>Note that each side is optional.
ISO 8601 | `INTERVAL 'P1Y2M3DT4H5M6S'`
Traditional PostgreSQL | `INTERVAL '1 year 2 months 3 days 4 hours 5 minutes 6 seconds'`
Abbreviated PostgreSQL | `INTERVAL '1 yr 2 mons 3 d 4 hrs 5 mins 6 secs'`

CockroachDB also supports using uninterpreted
[string literals](sql-constants.html#string-literals) in contexts
where an `INTERVAL` value is otherwise expected.

## Size

An `INTERVAL` column supports values up to 24 bytes in width, but the total storage size is likely to be larger due to CockroachDB metadata. Intervals are stored internally as months, days, and microseconds.

## Precision

<span class="version-tag">New in v19.1</span>: Intervals are stored with microsecond precision instead of nanoseconds, and it is no longer possible to create intervals with nanosecond precision.  As a result, parsing from a [string](string.html) or converting from a [float](float.html) or [decimal](decimal.html) will round to the nearest microsecond, as will any arithmetic [operation](functions-and-operators.html#supported-operations) (add, sub, mul, div) on intervals. CockroachDB rounds (instead of truncating) to match the behavior of Postgres.

{{site.data.alerts.callout_danger}}
When upgrading to 19.1, existing intervals with nanoseconds will no longer be able to return their nanosecond part. An existing table `t` with nanoseconds in intervals of column `s` can round them to the nearest microsecond with `UPDATE t SET s = s + '0s'`. Note that this could cause uniqueness problems if the interval is being used as a [primary key](primary-key.html).
{{site.data.alerts.end}}

## Example

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE intervals (a INT PRIMARY KEY, b INTERVAL);
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM intervals;
~~~

~~~
 column_name | data_type | is_nullable | column_default | generation_expression |  indices  | is_hidden 
-------------+-----------+-------------+----------------+-----------------------+-----------+-----------
 a           | INT8      | f           |                |                       | {primary} | f
 b           | INTERVAL  | t           |                |                       | {}        | f
(2 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO
    intervals
    VALUES (1, INTERVAL '1 year 2 months 3 days 4 hours 5 minutes 6 seconds'), 
           (2, INTERVAL '1-2 3 4:5:6'),
           (3, '1-2 3 4:5:6');
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM intervals;
~~~

~~~
 a |               b               
---+-------------------------------
 1 | 1 year 2 mons 3 days 04:05:06
 2 | 1 year 2 mons 3 days 04:05:06
 3 | 1 year 2 mons 3 days 04:05:06
(3 rows)
~~~

## Supported casting and conversion

`INTERVAL` values can be [cast](data-types.html#data-type-conversions-and-casts) to any of the following data types:

Type | Details
-----|--------
`INT` | Converts to number of seconds (second precision)
`DECIMAL` | Converts to number of seconds (microsecond precision)
`FLOAT` | Converts to number of seconds (microsecond precision)
`STRING` | Converts to `h-m-s` format (microsecond precision)
`TIME` | Converts to `HH:MM:SS.SSSSSS`, the time equivalent to the interval after midnight (microsecond precision)

## See also

[Data Types](data-types.html)
