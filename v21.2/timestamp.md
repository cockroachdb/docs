---
title: TIMESTAMP / TIMESTAMPTZ
summary: The TIMESTAMP and TIMESTAMPTZ data types stores a date and time pair in UTC.
toc: true
---

The `TIMESTAMP` and `TIMESTAMPTZ` [data types](data-types.html) store a date and time pair in UTC.

## Variants

`TIMESTAMP` has two variants:

- `TIMESTAMP` presents all `TIMESTAMP` values in UTC.

- `TIMESTAMPTZ` converts `TIMESTAMP` values from UTC to the client's session time zone (unless another time zone is specified for the value). However, it is conceptually important to note that `TIMESTAMPTZ` **does not** store any time zone data.

    {{site.data.alerts.callout_info}}
    The default session time zone is UTC, which means that by default `TIMESTAMPTZ` values display in UTC.
    {{site.data.alerts.end}}

The difference between these two variants is that `TIMESTAMPTZ` uses the client's session [time zone](set-vars.html#set-time-zone), while the other simply does not. This behavior extends to functions like `now()` and `extract()` on `TIMESTAMPTZ` values.

You can use the [`timezone()`](functions-and-operators.html#date-and-time-functions) and [`AT TIME ZONE`](functions-and-operators.html#special-syntax-forms) functions to convert a `TIMESTAMPTZ` into a `TIMESTAMP` at a specified timezone, or to convert a `TIMESTAMP` into a `TIMESTAMPTZ` at a specified timezone.

## Best practices

We recommend always using the `TIMESTAMPTZ` variant because the `TIMESTAMP` variant can sometimes lead to unexpected behaviors when it ignores a session offset. However, we also recommend you avoid [setting a session time zone offset](set-vars.html#set-time-zone) for your database.

## Aliases

In CockroachDB, the following are aliases:

- `TIMESTAMP`, `TIMESTAMP WITHOUT TIME ZONE`
- `TIMESTAMPTZ`, `TIMESTAMP WITH TIME ZONE`

## Syntax

A constant value of type `TIMESTAMP`/`TIMESTAMPTZ` can be expressed using an
[interpreted literal](sql-constants.html#interpreted-literals), or a
string literal
[annotated with](scalar-expressions.html#explicitly-typed-expressions)
type `TIMESTAMP`/`TIMESTAMPTZ` or
[coerced to](scalar-expressions.html#explicit-type-coercions) type
`TIMESTAMP`/`TIMESTAMPTZ`.

`TIMESTAMP` constants can be expressed using the
following string literal formats:

Format | Example
-------|--------
Date only | `TIMESTAMP '2016-01-25'`
Date and Time | `TIMESTAMP '2016-01-25 10:10:10.555555'`
ISO 8601 | `TIMESTAMP '2016-01-25T10:10:10.555555'`

To express a `TIMESTAMPTZ` value (with time zone offset from UTC), use
the following format: `TIMESTAMPTZ '2016-01-25 10:10:10.555555-05:00'`

When it is unambiguous, a simple unannotated [string literal](sql-constants.html#string-literals) can also
be automatically interpreted as type `TIMESTAMP` or `TIMESTAMPTZ`.

Note that the fractional portion is optional and is rounded to
microseconds (6 digits after decimal) for compatibility with the
PostgreSQL wire protocol.

 For PostgreSQL compatibility, CockroachDB bounds `TIMESTAMP` values by the lowest and highest `TIMESTAMP` values supported by PostgreSQL. The minimum allowable `TIMESTAMP` value is `4714-11-24 00:00:00+00 BC`, and the highest allowable `TIMESTAMP` value is `294276-12-31 23:59:59.999999`.

{{site.data.alerts.callout_info}}
A time zone offset of `+00:00` is displayed for all [`TIME`](time.html) and `TIMESTAMP` values, but is not stored in the database.
{{site.data.alerts.end}}

## Size

A `TIMESTAMP`/`TIMESTAMPTZ` column supports values up to 12 bytes in width, but the total storage size is likely to be larger due to CockroachDB metadata.

## Precision

 CockroachDB supports precision levels from 0 (seconds) to 6 (microseconds) for `TIMESTAMP`/`TIMESTAMPTZ` values. Precision in time values specifies the number of fractional digits retained in the seconds field. For example, specifying a `TIMESTAMPTZ` value as `TIMESTAMPTZ(3)` truncates the time component to milliseconds. By default, `TIMESTAMP`/`TIMESTAMPTZ` values have a precision of 6 (microseconds).

You can use an [`ALTER COLUMN ... SET DATA TYPE`](alter-column.html) statement to change the precision level of a `TIMESTAMP`/`TIMESTAMPTZ`-typed column. If there is already a non-default precision level specified for the column, the precision level can only be changed to an equal or greater precision level. For an example, see [Create a table with a `TIMESTAMP`-typed column, with precision](#create-a-table-with-a-timestamp-typed-column-with-precision).

## Examples

### Create a table with a `TIMESTAMPTZ`-typed column

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE timestamps (a INT PRIMARY KEY, b TIMESTAMPTZ);
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM timestamps;
~~~

~~~
  column_name |  data_type  | is_nullable | column_default | generation_expression |  indices  | is_hidden
+-------------+-------------+-------------+----------------+-----------------------+-----------+-----------+
  a           | INT8        |    false    | NULL           |                       | {primary} |   false
  b           | TIMESTAMPTZ |    true     | NULL           |                       | {}        |   false
(2 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO timestamps VALUES (1, TIMESTAMPTZ '2016-03-26 10:10:10-05:00'), (2, TIMESTAMPTZ '2016-03-26');
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM timestamps;
~~~

~~~
  a |             b
+---+---------------------------+
  1 | 2016-03-26 15:10:10+00:00
  2 | 2016-03-26 00:00:00+00:00
(2 rows)
~~~

### Create a table with a `TIMESTAMP`-typed column, with precision

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE timestamps (a INT PRIMARY KEY, b TIMESTAMP(3));
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM timestamps;
~~~

~~~
  column_name |  data_type   | is_nullable | column_default | generation_expression |  indices  | is_hidden
--------------+--------------+-------------+----------------+-----------------------+-----------+------------
  a           | INT8         |    false    | NULL           |                       | {primary} |   false
  b           | TIMESTAMP(3) |    true     | NULL           |                       | {}        |   false
(2 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO timestamps VALUES (1, TIMESTAMP '2020-03-25 12:00:00.123456'), (2, TIMESTAMP '2020-03-26 4:00:00.123456');
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM timestamps;
~~~

~~~
  a |               b
----+--------------------------------
  1 | 2020-03-25 12:00:00.123+00:00
  2 | 2020-03-26 04:00:00.123+00:00
(2 rows)
~~~

To change the precision level of a column, you can use an [`ALTER COLUMN ... SET DATA TYPE`](alter-column.html) statement:

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE timestamps ALTER COLUMN b SET DATA TYPE TIMESTAMP(4);
~~~

~~~
ALTER TABLE
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM timestamps;
~~~

~~~
  column_name |  data_type   | is_nullable | column_default | generation_expression |  indices  | is_hidden
--------------+--------------+-------------+----------------+-----------------------+-----------+------------
  a           | INT8         |    false    | NULL           |                       | {primary} |   false
  b           | TIMESTAMP(4) |    true     | NULL           |                       | {}        |   false
(2 rows)
~~~

When changing precision level, `TIMESTAMP` can be changed to `TIMESTAMPTZ`, and `TIMESTAMPTZ` can be changed to `TIMESTAMP`:

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE timestamps ALTER COLUMN b SET DATA TYPE TIMESTAMPTZ(5);
~~~

~~~
ALTER TABLE
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM timestamps;
~~~

~~~
  column_name |   data_type    | is_nullable | column_default | generation_expression |  indices  | is_hidden
--------------+----------------+-------------+----------------+-----------------------+-----------+------------
  a           | INT8           |    false    | NULL           |                       | {primary} |   false
  b           | TIMESTAMPTZ(5) |    true     | NULL           |                       | {}        |   false
(2 rows)
~~~

{{site.data.alerts.callout_info}}
If a non-default precision level has already been specified, you cannot change the precision to a lower level.
{{site.data.alerts.end}}

In this case, the `b` column, which is of type `TIMESTAMPTZ(5)`, cannot be changed to a precision level below `5`:

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE timestamps ALTER COLUMN b SET DATA TYPE TIMESTAMPTZ(3);
~~~

~~~
ERROR: unimplemented: type conversion from TIMESTAMPTZ(5) to TIMESTAMPTZ(3) requires overwriting existing values which is not yet implemented
SQLSTATE: 0A000
~~~

## Supported casting and conversion

`TIMESTAMP` values can be [cast](data-types.html#data-type-conversions-and-casts) to any of the following data types:

Type | Details
-----|--------
`DECIMAL` | Converts to number of seconds since the Unix epoch (Jan. 1, 1970). This is a CockroachDB experimental feature which may be changed without notice.
`FLOAT` | Converts to number of seconds since the Unix epoch (Jan. 1, 1970). This is a CockroachDB experimental feature which may be changed without notice.
`TIME` | Converts to the time portion (HH:MM:SS) of the timestamp.
`INT` | Converts to number of seconds since the Unix epoch (Jan. 1, 1970). This is a CockroachDB experimental feature which may be changed without notice.
`DATE` | --
`STRING` |  Converts to the date and time portion (YYYY-MM-DD HH:MM:SS) of the timestamp and omits the time zone offset.

### Infinity `TIMESTAMP` casts

CockroachDB currently does not support an `infinity`/`-infinity` representation for `TIMESTAMP` casts. Instead, `infinity::TIMESTAMP` evaluates to `294276-12-31 23:59:59.999999+00:00`, the maximum `TIMESTAMP` value supported, and `-infinity::TIMESTAMP` evaluates to `-4713-11-24 00:00:00+00:00`, the minimum `TIMESTAMP` value supported.

Note that this behavior differs from PostgreSQL, for which `infinity` is higher than any allowable `TIMESTAMP` value (including `294276-12-31 23:59:59.999999+00:00`), and `-infinity` is lower than any allowable `TIMESTAMP` value (including `-4713-11-24 00:00:00+00:00`).

For more details, see [tracking issue](https://github.com/cockroachdb/cockroach/issues/41564).

## See also

[Data Types](data-types.html)
