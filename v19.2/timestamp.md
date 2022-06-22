---
title: TIMESTAMP / TIMESTAMPTZ
summary: The TIMESTAMP and TIMESTAMPTZ data types stores a date and time pair in UTC.
toc: true
---

The `TIMESTAMP` and `TIMESTAMPTZ` [data types](data-types.html) stores a date and time pair in UTC.

{{site.data.alerts.callout_info}}
[Vectorized execution](vectorized-execution.html) is not supported for `TIMESTAMPTZ` in CockroachDB v19.2.
{{site.data.alerts.end}}

## Variants

`TIMESTAMP` has two variants:

- `TIMESTAMP` presents all `TIMESTAMP` values in UTC.

- `TIMESTAMPTZ` converts `TIMESTAMP` values from UTC to the client's session time zone (unless another time zone is specified for the value). However, it is conceptually important to note that `TIMESTAMPTZ` **does not** store any time zone data.

    {{site.data.alerts.callout_info}}
    The default session time zone is UTC, which means that by default `TIMESTAMPTZ` values display in UTC.
    {{site.data.alerts.end}}

The difference between these two variants is that `TIMESTAMPTZ` uses the client's session time zone, while the other simply does not. This behavior extends to functions like `now()` and `extract()` on `TIMESTAMPTZ` values.

<span class="version-tag">New in v19.2:</span> You can use the [`timezone()`](functions-and-operators.html#date-and-time-functions) and [`AT TIME ZONE`](functions-and-operators.html#special-syntax-forms) functions to convert a `TIMESTAMPTZ` into a `TIMESTAMP` at a specified timezone, or to convert a `TIMESTAMP` into a `TIMESTAMPTZ` at a specified timezone.

## Best practices

We recommend always using the `TIMESTAMPTZ` variant because the `TIMESTAMP` variant can sometimes lead to unexpected behaviors when it ignores a session offset. However, we also recommend you avoid setting a session time for your database.

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

## Size

A `TIMESTAMP`/`TIMESTAMPTZ` column supports values up to 12 bytes in width, but the total storage size is likely to be larger due to CockroachDB metadata.

## Examples

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE timestamps (a INT PRIMARY KEY, b TIMESTAMPTZ);
~~~

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO timestamps VALUES (1, TIMESTAMPTZ '2016-03-26 10:10:10-05:00'), (2, TIMESTAMPTZ '2016-03-26');
~~~

{% include_cached copy-clipboard.html %}
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

## Supported casting and conversion

`TIMESTAMP` values can be [cast](data-types.html#data-type-conversions-and-casts) to any of the following data types:

Type | Details
-----|--------
`DECIMAL` | Converts to number of seconds since the Unix epoch (Jan. 1, 1970). This is a CockroachDB experimental feature which may be changed without notice.
`FLOAT` | Converts to number of seconds since the Unix epoch (Jan. 1, 1970). This is a CockroachDB experimental feature which may be changed without notice.
`TIME` | Converts to the time portion (HH:MM:SS) of the timestamp
`INT` | Converts to number of seconds since the Unix epoch (Jan. 1, 1970). This is a CockroachDB experimental feature which may be changed without notice.
`DATE` | --
`STRING` | --

## See also

[Data Types](data-types.html)
