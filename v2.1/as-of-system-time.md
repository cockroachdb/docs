---
title: AS OF SYSTEM TIME
summary: The AS OF SYSTEM TIME clause executes a statement as of a specified time.
toc: false
---

The `AS OF SYSTEM TIME timestamp` clause is available in some statements to execute them as of the specified time.

The `timestamp` argument supports various formats.

Format | Notes
---|---
[`INT`](int.html) | Nanoseconds since the Unix epoch.
negative [`INTERVAL`](interval.html) | Added to `statement_timestamp()`, and thus must be negative.
[`STRING`](string.html) | A [`TIMESTAMP`](timestamp.html), [`INT`](int.html) of nanoseconds, or negative [`INTERVAL`](interval.html).

## Examples

Assuming a statement is ran by a user at `2016-01-01 12:00:00`, all of the following examples will execute as of `2016-01-01 08:00:00`.

~~~ sql
SELECT * FROM t AS OF SYSTEM TIME '2016-01-01 08:00:00'
SELECT * FROM t AS OF SYSTEM TIME 1451635200000000000
SELECT * FROM t AS OF SYSTEM TIME '1451635200000000000'
SELECT * FROM t AS OF SYSTEM TIME '-4h'
SELECT * FROM t AS OF SYSTEM TIME INTERVAL '-4h'
~~~

## See Also

[Time-Travel Queries](https://www.cockroachlabs.com/blog/time-travel-queries-select-witty_subtitle-the_future/)

## Tech Note

Although the following format is supported, it is not intended to be used by most users.

HLC timestamps can be specified using a [`DECIMAL`](decimal.html). The integer part is the wall time in nanoseconds. The fractional part is the logical counter, a 10-digit integer. This is the same format as produced by the `clutser_logical_timestamp()` function.
