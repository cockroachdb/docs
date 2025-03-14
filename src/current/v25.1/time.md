---
title: TIME / TIMETZ
summary: CockroachDB's TIME data type stores a time of day in UTC.
toc: true
docs_area: reference.sql
---

The `TIME` [data type]({% link {{ page.version.version }}/data-types.md %}) stores the time of day in UTC.

 The `TIMETZ` data type stores a time of day with a time zone offset from UTC.

## Variants

`TIME` has two variants:

- `TIME`, which presents all `TIME` values in UTC.

- `TIMETZ`, which converts `TIME` values with a specified time zone offset from UTC.

    Ordering for `TIMETZ` is done in terms of [epoch](https://wikipedia.org/wiki/Epoch_(computing)). Time zones with lesser values are ranked higher if times are equal. For example, `'2:00-1' > '2:00+0'` and `'12:00-1' > '1:00+0'`.

    [Like PostgreSQL](https://www.postgresql.org/docs/current/static/datatype-datetime.html), we implement the `TIMETZ` variant for [SQL standards compliance]({% link {{ page.version.version }}/sql-feature-support.md %}). We also implement the `TIMETZ` variant for compatibility with ORMs, like [Hibernate](build-a-java-app-with-cockroachdb-hibernate.html).

You can use the [`timezone()`]({% link {{ page.version.version }}/functions-and-operators.md %}#date-and-time-functions) and [`AT TIME ZONE`]({% link {{ page.version.version }}/functions-and-operators.md %}#special-syntax-forms) functions to convert a `TIMETZ` into a `TIME` at a specified timezone, or to convert a `TIME` into a `TIMETZ` at a specified timezone.

{{site.data.alerts.callout_success}}
We recommend always using `TIME` instead of `TIMETZ`. Convert UTC values to the appropriate time zone on the client side.
{{site.data.alerts.end}}

## Aliases

In CockroachDB, the following are aliases:

Alias    | Long Version
---------|-------------
`TIME`   | `TIME WITHOUT TIME ZONE`
`TIMETZ` | `TIME WITH TIME ZONE`

## Syntax

### `TIME`

A constant value of type `TIME` can be expressed using an [interpreted literal]({% link {{ page.version.version }}/sql-constants.md %}#interpreted-literals), or a string literal [annotated with]({% link {{ page.version.version }}/scalar-expressions.md %}#explicitly-typed-expressions) type `TIME` or  [coerced to]({% link {{ page.version.version }}/scalar-expressions.md %}#explicit-type-coercions) type `TIME`. When it is unambiguous, a simple unannotated [string literal]({% link {{ page.version.version }}/sql-constants.md %}#string-literals) can also be automatically interpreted as type `TIME`.

The string format for `TIME` is `HH:MM:SS.SSSSSS`. For example: `TIME '05:40:00.000001'`. The fractional portion is optional and is rounded to microseconds (i.e., six digits after the decimal) for compatibility with the [PostgreSQL wire protocol](https://www.postgresql.org/docs/current/static/protocol.html).

{{site.data.alerts.callout_info}}
A date of `0000-01-01` is displayed for all `TIME`/`TIMETZ` values, but is not stored in the database. To print without a date, you can cast the type to a `STRING`.

A time zone offset of `+00:00` is also displayed for all `TIME` and [`TIMESTAMP`]({% link {{ page.version.version }}/timestamp.md %}) values, but is not stored in the database.
{{site.data.alerts.end}}

### `TIMETZ`

To express a `TIMETZ` value with a time zone offset from UTC, you can add an offset to a `TIME` value. For example, `TIMETZ '10:10:10.555555-05:00'` offsets from UTC by -5.

If no time zone is specified for a `TIMETZ` value, the `timezone` [session variable]({% link {{ page.version.version }}/show-vars.md %}#supported-variables) is used. For example, if you [set the `timezone`]({% link {{ page.version.version }}/set-vars.md %}#set-time-zone) for a session using `SET TIME ZONE -2`, and you define the `TIMETZ` as `TIMETZ '10:10:10.55'`, the value will be displayed with an offset of -2 from UTC.

`TIMETZ` is not affected by session-scoped offsets (unlike [`TIMESTAMPTZ`]({% link {{ page.version.version }}/timestamp.md %})). Time zone offsets only apply to values inserted after the offset has been set, and do not affect existing `TIMETZ` values, or `TIMETZ` values with a time zone offset specified.

## Size

A `TIME` column supports values up to 8 bytes in width, but the total storage size is likely to be larger due to CockroachDB metadata.

A `TIMETZ` column supports values up to 12 bytes in width, but the total storage size is likely to be larger due to CockroachDB metadata.

## Precision

 CockroachDB supports precision levels from 0 (seconds) to 6 (microseconds) for `TIME`/`TIMETZ` values. Precision in time values specifies the number of fractional digits retained in the seconds field. For example, specifying a `TIME` value as `TIME(3)` truncates the time precision to milliseconds. By default, `TIME`/`TIMETZ` values have a precision of 6 (microseconds).

You can use an [`ALTER COLUMN ... SET DATA TYPE`]({% link {{ page.version.version }}/alter-table.md %}#alter-column) statement to change the precision level of a `TIME`-typed column. If there is already a non-default precision level specified for the column, the precision level can only be changed to an equal or greater precision level. For an example, see [Create a table with a `TIME`-typed column, with precision](#create-a-table-with-a-time-typed-column-with-precision).

## Examples

### Create a table with a `TIME`-typed column

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE IF NOT EXISTS time (time_id INT PRIMARY KEY, time_val TIME);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM time;
~~~

~~~
  column_name | data_type | is_nullable | column_default | generation_expression |  indices  | is_hidden
+-------------+-----------+-------------+----------------+-----------------------+-----------+-----------+
  time_id     | INT8      |    false    | NULL           |                       | {primary} |   false
  time_val    | TIME      |    true     | NULL           |                       | {primary} |   false
(2 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> UPSERT INTO time VALUES (1, TIME '05:40:00'), (2, TIME '05:41:39');
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM time;
~~~

~~~
  time_id |         time_val
+---------+---------------------------+
        1 | 0000-01-01 05:40:00+00:00
        2 | 0000-01-01 05:41:39+00:00
(2 rows)
~~~

{{site.data.alerts.callout_info}}
The SQL shell displays the date and time zone due to the Go SQL driver it uses. Other client drivers may behave similarly. In such cases, however, the date and time zone are not relevant and are not stored in the database.
{{site.data.alerts.end}}

Comparing `TIME` values:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT (SELECT time_val FROM time WHERE time_id = 1) < (SELECT time_val FROM time WHERE time_id = 2);
~~~

~~~
< (SELECT time_val FROM time WHERE time_id = 2);
  ?column?
+----------+
    true
(1 row)
~~~

### Create a table with a `TIME`-typed column, with precision

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE IF NOT EXISTS time_precise (time_id INT PRIMARY KEY, time_val TIME(4));
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM time_precise;
~~~

~~~
  column_name | data_type | is_nullable | column_default | generation_expression |       indices       | is_hidden
--------------+-----------+-------------+----------------+-----------------------+---------------------+------------
  time_id     | INT8      |      f      | NULL           |                       | {time_precise_pkey} |     f
  time_val    | TIME(4)   |      t      | NULL           |                       | {time_precise_pkey} |     f
(2 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> UPSERT INTO time_precise VALUES (1, TIME '05:40:00.123456'), (2, TIME '05:41:39.12345');
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM time_precise;
~~~

~~~
  time_id |   time_val
----------+----------------
        1 | 05:40:00.1235
        2 | 05:41:39.1235
(2 rows)
~~~

To change the precision level of a column, you can use an [`ALTER COLUMN ... SET DATA TYPE`]({% link {{ page.version.version }}/alter-table.md %}#alter-column) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE time_precise ALTER COLUMN time_val SET DATA TYPE TIME(5);
~~~

~~~
ALTER TABLE
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM time_precise;
~~~

~~~
  column_name | data_type | is_nullable | column_default | generation_expression |       indices       | is_hidden
--------------+-----------+-------------+----------------+-----------------------+---------------------+------------
  time_id     | INT8      |      f      | NULL           |                       | {time_precise_pkey} |     f
  time_val    | TIME(5)   |      t      | NULL           |                       | {time_precise_pkey} |     f
(2 rows)
~~~

You can reduce the precision of the values of `DECIMAL`, `TIMESTAMP`, and `TIMESTAMPTZ` columns; this yields the same behavior as the PostgreSQL implementation.

For example, to lower the precision of the `time_val` column, which is of type `TIME(5)`, use the following statement:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE time_precise ALTER COLUMN time_val SET DATA TYPE TIME(3);
~~~

## Supported casting & conversion

`TIME`/`TIMETZ` values can be [cast]({% link {{ page.version.version }}/data-types.md %}#data-type-conversions-and-casts) to any of the following data types:

Type | Details
-----|--------
`INTERVAL` | Converts to the span of time since midnight (00:00)
`STRING` | Converts to format `'HH:MM:SS.SSSSSS'` (microsecond precision)

{{site.data.alerts.callout_info}}
CockroachDB displays `TIME '24:00:00'` and `TIMETZ '24:00:00'` as `0000-01-01 00:00:00`. To display the proper stored value (`24:00:00`), you can [cast the data type to a `STRING`]({% link {{ page.version.version }}/time.md %}#supported-casting-conversion).
{{site.data.alerts.end}}

## See also

- [Data Types]({% link {{ page.version.version }}/data-types.md %})
- [SQL Feature Support]({% link {{ page.version.version }}/sql-feature-support.md %})
