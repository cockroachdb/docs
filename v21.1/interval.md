---
title: INTERVAL
summary: The INTERVAL data type stores a value that represents a span of time.
toc: true
---

The `INTERVAL` [data type](data-types.html) stores a value that represents a span of time.

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
SQL Standard | `INTERVAL 'Y-M D H:M:S'`<br><br>Seconds and days can be expressed as integers or floats. All other input values must be expressed as integers.<br><br>For more details, see [Details on SQL Standard input](#details-on-sql-standard-input).
ISO 8601 | `INTERVAL 'P1Y2M3DT4H5M6S'`
Traditional PostgreSQL | `INTERVAL '1 year 2 months 3 days 4 hours 5 minutes 6 seconds'`
Abbreviated PostgreSQL | `INTERVAL '1 yr 2 mons 3 d 4 hrs 5 mins 6 secs'`

CockroachDB also supports using uninterpreted
[string literals](sql-constants.html#string-literals) in contexts
where an `INTERVAL` value is otherwise expected.

### Details on SQL Standard input

Without a [precision](#precision) or [duration field](#duration-fields) specified, expect the following behavior from SQL Standard input (`Y-M D H:M:S`):

- Using a single value defines seconds only.
  <br>For example, `INTERVAL '1'` is parsed as `00:00:01`.
- Using two colon-separated integers defines hours and minutes.
  <br>For example, `INTERVAL '1:2'` is parsed as `01:02:00`.
- If the second of two colon-separated values is a float, the interval is parsed as minutes and seconds (`M:S.fff`).
  <br>For example, `INTERVAL '1:2.345'` is parsed as `00:01:02.345`.
- If the first element of the input directly preceding a colon is specified as a float, the interval is parsed as `D H:M`.
  <br>For example, `INTERVAL '1.2:03:04'` is parsed as `1 day 07:52:00`.
- If the day is omitted, no day value will be stored.
  <br>For example, `INTERVAL '1-2 3:4:5'` is parsed as `1 year 2 mons 03:04:05`, and `INTERVAL 1-2` is parsed as `1 year 2 mons`.
- If the year and month are omitted, no year or month value will be stored.
  <br>For example, `INTERVAL '1 2:3:4` is parsed as `1 day 02:03:04`.

## Size

An `INTERVAL` column supports values up to 24 bytes in width, but the total storage size is likely to be larger due to CockroachDB metadata. Intervals are stored internally as months, days, and microseconds.

## Precision

 CockroachDB supports precision levels from 0 (seconds) to 6 (microseconds) for `INTERVAL` values. Precision in time values specifies the number of fractional digits retained in the seconds field.  By default, `INTERVAL` values have a precision of 6 (microseconds).

For example, specifying an `INTERVAL` value as `INTERVAL(3)` truncates the time precision to milliseconds.

## Duration fields

 CockroachDB supports duration fields for `INTERVAL` values. You can specify `SECOND`, `MINUTE`, `HOUR`, or `DAY` units of duration in the form `INTERVAL ... <unit>` or `INTERVAL ... <unit> TO <unit>`.

Specifying a single duration field truncates the interval at the unit specified, defining the interval as having the duration field unit as its least-significant unit. For example, `INTERVAL '1 2:03:04' HOUR` truncates the input to an exact hour, and parses the interval as `1 day 02:00:00`.

A single duration field can also resolve ambiguity in the input. For example, `INTERVAL '1'` parses the interval as `00:00:01` (1 second). `INTERVAL '1' MINUTE` parses the interval as `00:01:00` (1 minute).

If the interval input is ambiguous, specifying two duration fields stores the interval in the units specified. For example, `INTERVAL '02:03' MINUTE TO SECOND` parses the interval as `00:02:03` (in minutes and seconds). Without `MINUTE TO SECOND`, the input would be parsed as `02:03:00` (in hours and minutes).

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
