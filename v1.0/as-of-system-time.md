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
[`STRING`](string.html) | A [`TIMESTAMP`](timestamp.html) or [`INT`](int.html) of nanoseconds.

## Examples

Assuming the following statements are run at `2016-01-01 12:00:00`, they would execute as of `2016-01-01 08:00:00`:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM t AS OF SYSTEM TIME '2016-01-01 08:00:00'
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM t AS OF SYSTEM TIME 1451635200000000000
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM t AS OF SYSTEM TIME '1451635200000000000'
~~~

## See Also

- [Select Historical Data](select.html#select-historical-data-time-travel)
- [Time-Travel Queries](https://www.cockroachlabs.com/blog/time-travel-queries-select-witty_subtitle-the_future/)

## Tech Note

{{site.data.alerts.callout_info}}Although the following format is supported, it is not intended to be used by most users.{{site.data.alerts.end}}

HLC timestamps can be specified using a [`DECIMAL`](decimal.html). The integer part is the wall time in nanoseconds. The fractional part is the logical counter, a 10-digit integer. This is the same format as produced by the `clutser_logical_timestamp()` function.
