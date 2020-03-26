---
title: INTERVAL
summary: The INTERVAL data type stores a value that represents a span of time.
toc: true
---

The `INTERVAL` [data type](data-types.html) stores a value that represents a span of time.

{% include {{page.version.version}}/sql/vectorized-support.md %}

## Aliases

CockroachDB supports using uninterpreted [string literals](sql-constants.html#string-literals) in contexts where an `INTERVAL` value is otherwise expected.

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
SQL Standard | `INTERVAL 'Y-M D H:M:S'`<br><br>`Y-M D`: Using a single value defines days only; using two values defines years and months. Values must be integers.<br><br>`H:M:S`: Using a single value defines seconds only; using two values defines hours and minutes, unless specified otherwise by a [duration field](#duration-fields). Hours and minutes must be integers, and seconds can be integers or floats. If the first element is specified as a float, the interval is parsed as `D:H:M`.<br><br>Note that each side of the interval input is optional.
ISO 8601 | `INTERVAL 'P1Y2M3DT4H5M6S'`
Traditional PostgreSQL | `INTERVAL '1 year 2 months 3 days 4 hours 5 minutes 6 seconds'`
Abbreviated PostgreSQL | `INTERVAL '1 yr 2 mons 3 d 4 hrs 5 mins 6 secs'`

CockroachDB also supports using uninterpreted
[string literals](sql-constants.html#string-literals) in contexts
where an `INTERVAL` value is otherwise expected.

## Size

An `INTERVAL` column supports values up to 24 bytes in width, but the total storage size is likely to be larger due to CockroachDB metadata. Intervals are stored internally as months, days, and microseconds.

## Precision

<span class="version-tag">New in v20.1:</span> CockroachDB supports precision levels from 0 (seconds) to 6 (microseconds) for `INTERVAL` values. Precision in time values specifies the number of fractional digits retained in the seconds field.  By default, `INTERVAL` values have a precision of 6 (microseconds).

For example, specifying a `INTERVAL` value as `INTERVAL(3)` truncates the time precision to milliseconds.

{{site.data.alerts.callout_info}}
If you downgrade to a version of CockroachDB that does not support precision for `INTERVAL` values, all `INTERVAL` values previously specified with precision will be stored with full precision (microseconds).
{{site.data.alerts.end}}

## Duration fields

<span class="version-tag">New in v20.1:</span> CockroachDB supports duration fields for `INTERVAL` values. You can specify `SECOND`, `MINUTE`, `HOUR`, or `DAY` units of duration in the form `INTERVAL ... <unit>` or `INTERVAL ... <unit> TO <unit>`.

Specifying a single duration field truncates the interval at the unit specified. For example, `INTERVAL '1 2:03:04' HOUR` truncates the input to an exact hour, and displays the interval as `1 day 02:00:00`.

If the interval input is ambiguous, specifying two duration fields stores the interval in the units specified. For example, `INTERVAL '02:03' MINUTE TO SECOND` displays the interval in minutes and seconds, `00:02:03`. Without `MINUTE TO SECOND`, the input would be stored as `02:03:00`.


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
--------------+-----------+-------------+----------------+-----------------------+-----------+------------
  a           | INT8      |    false    | NULL           |                       | {primary} |   false
  b           | INTERVAL  |    true     | NULL           |                       | {}        |   false
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
----+--------------------------------
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
`FLOAT` | Converts to number of picoseconds
`STRING` | Converts to `h-m-s` format (microsecond precision)
`TIME` | Converts to `HH:MM:SS.SSSSSS`, the time equivalent to the interval after midnight (microsecond precision)

## See also

[Data Types](data-types.html)
