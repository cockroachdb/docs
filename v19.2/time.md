---
title: TIME
summary: CockroachDB's TIME data type stores a time of day in UTC.
toc: true
---
The `TIME` [data type](data-types.html) stores the time of day in UTC.

{% include {{page.version.version}}/sql/vectorized-support.md %}

## Aliases

In CockroachDB, the following are aliases:

`TIME WITHOUT TIME ZONE`

## Syntax

A constant value of type `TIME` can be expressed using an
[interpreted literal](sql-constants.html#interpreted-literals), or a
string literal
[annotated with](scalar-expressions.html#explicitly-typed-expressions)
type `TIME` or
[coerced to](scalar-expressions.html#explicit-type-coercions) type
`TIME`.

The string format for time is `HH:MM:SS.SSSSSS`. For example: `TIME '05:40:00.000001'`.

When it is unambiguous, a simple unannotated [string literal](sql-constants.html#string-literals) can also
be automatically interpreted as type `TIME`.

Note that the fractional portion of `TIME` is optional and is rounded to microseconds (i.e., six digits after the decimal) for compatibility with the [PostgreSQL wire protocol](https://www.postgresql.org/docs/current/static/protocol.html).

## Size

A `TIME` column supports values up to 8 bytes in width, but the total storage size is likely to be larger due to CockroachDB metadata.

## Example

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE time (time_id INT PRIMARY KEY, time_val TIME);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM time;
~~~

~~~
+-------------+-----------+-------------+----------------+-----------------------+-------------+
| column_name | data_type | is_nullable | column_default | generation_expression |   indices   |
+-------------+-----------+-------------+----------------+-----------------------+-------------+
| time_id     | INT       |    false    | NULL           |                       | {"primary"} |
| time_val    | TIME      |    true     | NULL           |                       | {}          |
+-------------+-----------+-------------+----------------+-----------------------+-------------+
(2 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO time VALUES (1, TIME '05:40:00'), (2, TIME '05:41:39');
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM time;
~~~

~~~
+---------+---------------------------+
| time_id |         time_val          |
+---------+---------------------------+
|       1 | 0000-01-01 05:40:00+00:00 |
|       2 | 0000-01-01 05:41:39+00:00 |
+---------+---------------------------+
(2 rows)
~~~

{{site.data.alerts.callout_info}}The <code>cockroach sql</code> shell displays the date and time zone due to the Go SQL driver it uses. Other client drivers may behave similarly. In such cases, however, the date and time zone are not relevant and are not stored in the database.{{site.data.alerts.end}}

Comparing `TIME` values:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT (SELECT time_val FROM time WHERE time_id = 1) < (SELECT time_val FROM time WHERE time_id = 2);
~~~

~~~
+--------------------------------+
|  (SELECT time_val FROM "time"  |
|  WHERE time_id = 1) < (SELECT  |
|   time_val FROM "time" WHERE   |
|          time_id = 2)          |
+--------------------------------+
|              true              |
+--------------------------------+
(1 row)
~~~

## Supported casting & conversion

`TIME` values can be [cast](data-types.html#data-type-conversions-and-casts) to any of the following data types:

Type | Details
-----|--------
`INTERVAL` | Converts to the span of time since midnight (00:00)
`STRING` | Converts to format `'HH:MM:SS.SSSSSS'` (microsecond precision)

## See also

- [Data Types](data-types.html)
- [SQL Feature Support](sql-feature-support.html)
