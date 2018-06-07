---
title: TIME
summary: The TIME data type stores a time of day in UTC, whereas TIMETZ stores a time of day with a time zone offset from UTC.
toc: false
---
The `TIME` [data type](data-types.html) stores the time of day in UTC, whereas `TIMETZ` stores a time of day with a time zone offset from UTC.

<div id="toc"></div>

## Variants

`TIME` has two variants:

- `TIME` presents all `TIME` values in UTC.

- `TIMETZ` converts `TIME` values from UTC to the client's session time zone (unless another time zone is specified for the value). However, it is conceptually important to note that `TIMETZ` **does not** store any time zone data.

<a name="timetz-warning"></a>

{{site.data.alerts.callout_danger}}
Use of `TIMETZ` is not recommended at this time. The current implementation is incomplete.  The feature will be retracted or corrected in a future release.  If corrected, the fix will be backwards-incompatible.  For details, see [cockroachdb#25224](https://github.com/cockroachdb/cockroach/issues/25224).
{{site.data.alerts.end}}

    {{site.data.alerts.callout_info}}The default session time zone is UTC, which means that by default <code>TIMETZ</code> values display in UTC.{{site.data.alerts.end}}

The difference between these two variants is that `TIMETZ` uses the client's session time zone, while `TIME` does not. This behavior extends to [functions like `now()` and `extract()`](functions-and-operators.html#date-and-time-functions) on `TIMETZ` values.

## Best Practices

We recommend always using `TIME` because the `TIMETZ` variant can lead to unexpected behavior when:

- Comparing `TIMETZ` instances using [operators such as `>`](functions-and-operators.html#operators)
- [Ordering query results](query-order.html) which include `TIMETZ` values in time order, e.g., `SELECT * FROM table ORDER BY column_with_timetz_type`.

[Like Postgres](https://www.postgresql.org/docs/current/static/datatype-datetime.html), we implement the `TIMETZ` variant for [SQL standards compliance](sql-feature-support.html), and also because it is used by ORMs like [Hibernate](build-a-java-app-with-cockroachdb-hibernate.html).

## Aliases

The `TIME` data types are aliased as shown below.

| Alias    | Long Version             |
|----------+--------------------------|
| `TIME`   | `TIME WITHOUT TIME ZONE` |
| `TIMETZ` | `TIME WITH TIME ZONE`    |

## Syntax

A constant value of type `TIME`/`TIMETZ` can be expressed using an
[interpreted literal](sql-constants.html#interpreted-literals), or a
string literal
[annotated with](scalar-expressions.html#explicitly-typed-expressions)
type `TIME`/`TIMETZ` or
[coerced to](scalar-expressions.html#explicit-type-coercions) type
`TIME`/`TIMETZ`.

The string format for time is `HH:MM:SS.SSSSSS`. For example: `TIME '05:40:00.000001'`.

To express a `TIMETZ` value (with time zone offset from UTC), use
the following format: `TIMETZ '10:10:10.555555-05:00'`

When it is unambiguous, a simple unannotated [string literal](sql-constants.html#string-literals) can also
be automatically interpreted as type `TIME` or `TIMETZ`.

Note that the fractional portion of `TIME`/`TIMETZ` is optional and is rounded to microseconds (i.e., six digits after the decimal) for compatibility with the [PostgreSQL wire protocol](https://www.postgresql.org/docs/current/static/protocol.html).

## Size

A `TIME`/`TIMETZ` column supports values up to 8 bytes in width, but the total storage size is likely to be larger due to CockroachDB metadata.

## Example

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE time (time_id INT PRIMARY KEY, time_val TIME);
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM time;
~~~
~~~
+----------+------+------+---------+-------------+
|  Field   | Type | Null | Default |   Indices   |
+----------+------+------+---------+-------------+
| time_id  | INT  | f    | NULL    | {"primary"} |
| time_val | TIME | t    | NULL    | {}          |
+----------+------+------+---------+-------------+
(2 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO time VALUES (1, TIME '05:40:00'), (2, TIME '05:41:39');
~~~

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
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
