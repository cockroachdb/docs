---
title: DATE
summary: The DATE data type stores a year, month, and day.
toc: true
---

The `DATE` [data type](data-types.html) stores a year, month, and day.

## Syntax

A constant value of type `DATE` can be expressed using an
[interpreted literal](sql-constants.html#interpreted-literals), or a
string literal
[annotated with](scalar-expressions.html#explicitly-typed-expressions)
type `DATE` or
[coerced to](scalar-expressions.html#explicit-type-coercions) type
`DATE`.

The string format for dates is `YYYY-MM-DD`. For example: `DATE '2016-12-23'`.

CockroachDB also supports using uninterpreted
[string literals](sql-constants.html#string-literals) in contexts
where a `DATE` value is otherwise expected.

{{site.data.alerts.callout_info}}
`DATE` values in CockroachDB are fully [PostgreSQL-compatible](https://www.postgresql.org/docs/current/datatype-datetime.html), including support for special values (e.g. `+/- infinity`). Existing dates outside of the PostgreSQL date range (`4714-11-24 BC` to `5874897-12-31`) are converted to `+/- infinity` dates.
{{site.data.alerts.end}}

## Size

A `DATE` column supports values up to 16 bytes in width, but the total storage size is likely to be larger due to CockroachDB metadata.

## Examples

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE dates (a DATE PRIMARY KEY, b INT);
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM dates;
~~~

~~~
+-------------+-----------+-------------+----------------+-----------------------+-------------+
| column_name | data_type | is_nullable | column_default | generation_expression |   indices   |
+-------------+-----------+-------------+----------------+-----------------------+-------------+
| a           | DATE      |    false    | NULL           |                       | {"primary"} |
| b           | INT       |    true     | NULL           |                       | {}          |
+-------------+-----------+-------------+----------------+-----------------------+-------------+
(2 rows)
~~~

Explicitly typed `DATE` literal:
{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO dates VALUES (DATE '2016-03-26', 12345);
~~~

String literal implicitly typed as `DATE`:
{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO dates VALUES ('2016-03-27', 12345);
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM dates;
~~~

~~~
+---------------------------+-------+
|             a             |   b   |
+---------------------------+-------+
| 2016-03-26 00:00:00+00:00 | 12345 |
| 2016-03-27 00:00:00+00:00 | 12345 |
+---------------------------+-------+
~~~

## Supported casting and conversion

`DATE` values can be [cast](data-types.html#data-type-conversions-and-casts) to any of the following data types:

Type | Details
-----|--------
`DECIMAL` | Converts to number of days since the Unix epoch (Jan. 1, 1970). This is a CockroachDB experimental feature which may be changed without notice.
`FLOAT` | Converts to number of days since the Unix epoch (Jan. 1, 1970). This is a CockroachDB experimental feature which may be changed without notice.
`TIMESTAMP` | Sets the time to 00:00 (midnight) in the resulting timestamp.
`INT` | Converts to number of days since the Unix epoch (Jan. 1, 1970). This is a CockroachDB experimental feature which may be changed without notice.
`STRING` | ––

## See also

[Data Types](data-types.html)
