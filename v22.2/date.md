---
title: DATE
summary: CockroachDB's DATE data type stores a year, month, and day.
toc: true
docs_area: reference.sql
---

The `DATE` [data type](data-types.html) stores a year, month, and day.

## Syntax

You can express a constant value of type `DATE` using an [interpreted literal](sql-constants.html#interpreted-literals), or a string literal [annotated with](scalar-expressions.html#explicitly-typed-expressions) type `DATE` or [coerced to](scalar-expressions.html#explicit-type-coercions) type `DATE`.

CockroachDB also supports using uninterpreted [string literals](sql-constants.html#string-literals) in contexts where a `DATE` value is otherwise expected. By default, CockroachDB parses the following string formats for dates:

- `YYYY-MM-DD`
- `MM-DD-YYYY`
- `MM-DD-YY` (default)/`YY-MM-DD`/`DD-MM-YY`

To change the input format of truncated dates (e.g., `12-16-06`) from `MM-DD-YY` to `YY-MM-DD` or `DD-MM-YY`, set the `datestyle` [session variable](set-vars.html) or the `sql.defaults.datestyle ` [cluster setting](cluster-settings.html).

## PostgreSQL compatibility

`DATE` values in CockroachDB are fully [PostgreSQL-compatible](https://www.postgresql.org/docs/current/datatype-datetime.html), including support for special values (e.g., `+/- infinity`). Existing dates outside of the PostgreSQL date range (`4714-11-24 BC` to `5874897-12-31`) are converted to `+/- infinity` dates.

## Size

A `DATE` column supports values up to 16 bytes in width, but the total storage size is likely to be larger due to CockroachDB metadata.

## Examples

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE dates (a DATE PRIMARY KEY, b INT);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM dates;
~~~

~~~
  column_name | data_type | is_nullable | column_default | generation_expression |  indices  | is_hidden
--------------+-----------+-------------+----------------+-----------------------+-----------+------------
  a           | DATE      |    false    | NULL           |                       | {primary} |   false
  b           | INT8      |    true     | NULL           |                       | {primary} |   false
(2 rows)
~~~

Explicitly typed `DATE` literal:

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO dates VALUES (DATE '2016-03-26', 12345);
~~~

String literal implicitly typed as `DATE`:

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO dates VALUES ('03-27-16', 12345);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM dates;
~~~

~~~
      a      |   b
-------------+--------
  2016-03-26 | 12345
  2016-03-27 | 12345
(2 rows)
~~~

## Supported casting and conversion

`DATE` values can be [cast](data-types.html#data-type-conversions-and-casts) to any of the following data types:

Type | Details
-----|--------
`DECIMAL` | Converts to number of days since the Unix epoch (Jan. 1, 1970).
`FLOAT` | Converts to number of days since the Unix epoch (Jan. 1, 1970).
`TIMESTAMP` | Sets the time to 00:00 (midnight) in the resulting timestamp.
`INT` | Converts to number of days since the Unix epoch (Jan. 1, 1970).
`STRING` | ––

## See also

[Data Types](data-types.html)
