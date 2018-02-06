---
title: STRING
summary: The STRING data type stores a string of Unicode characters.
toc: false
---

The `STRING` [data type](data-types.html) stores a string of Unicode characters.



<div id="toc"></div>

## Aliases

In CockroachDB, the following are aliases for `STRING`:

- `CHARACTER`
- `CHAR`
- `VARCHAR`
- `TEXT`

And the following are aliases for `STRING(n)`:

- `CHARACTER(n)`
- `CHARACTER VARYING(n)`
- `CHAR(n)`
- `CHAR VARYING(n)`
- `VARCHAR(n)`  

## Length

To limit the length of a string column, use `STRING(n)`, where `n` is the maximum number of Unicode code points (normally thought of as "characters") allowed.

When inserting a string:

- If the value exceeds the column's length limit, CockroachDB gives an error.
- If the value is cast as a string with a length limit (e.g., `CAST('hello world' AS STRING(5))`), CockroachDB truncates to the limit.
- If the value is under the column's length limit, CockroachDB does **not** add padding. This applies to `STRING(n)` and all its aliases.

## Syntax

A value of type `STRING` can be expressed using a variety of formats.
See [string literals](sql-constants.html#string-literals) for more details.

When printing out a `STRING` value in the [SQL shell](use-the-built-in-sql-client.html), the shell uses the simple
SQL string literal format if the value doesn't contain special character,
or the escaped format otherwise.

### Collations

`STRING` values accept [collations](collate.html), which lets you sort strings according to language- and country-specific rules.

{{site.data.alerts.callout_danger}}You cannot current use collated strings in indexes or primary keys; doing so causes CockroachDB to crash. If you're interested in using collated strings in these contexts, you can follow <a href="https://github.com/cockroachdb/cockroach/issues/2473">this issue on GitHub</a> to be notified when it's resolved.{{site.data.alerts.end}}

## Size

The size of a `STRING` value is variable, but it's recommended to keep values under 64 kilobytes to ensure performance. Above that threshold, [write amplification](https://en.wikipedia.org/wiki/Write_amplification) and other considerations may cause significant performance degradation.   

## Examples

~~~ sql
> CREATE TABLE strings (a STRING PRIMARY KEY, b STRING(4), c TEXT);

> SHOW COLUMNS FROM strings;
~~~
~~~
+-------+-----------+-------+---------+
| Field |  Type     | Null  | Default |
+-------+-----------+-------+---------+
| a     | STRING    | false | NULL    |
| b     | STRING(4) | true  | NULL    |
| c     | STRING    | true  | NULL    |
+-------+-----------+-------+---------+
~~~
~~~ sql
> INSERT INTO strings VALUES ('a1b2c3d4', 'e5f6', 'g7h8i9');

> SELECT * FROM strings;
~~~
~~~
+----------+------+--------+
|    a     |  b   |   c    |
+----------+------+--------+
| a1b2c3d4 | e5f6 | g7h8i9 |
+----------+------+--------+
~~~

## Supported Casting & Conversion

`STRING` values can be [cast](data-types.html#data-type-conversions-casts) to any of the following data types:

Type | Details
-----|--------
`BOOL` | Requires supported [`BOOL`](bool.html) string format, e.g., `'true'`.
`BYTES` | Requires supported [`BYTES`](bytes.html) string format, e.g., `b'\141\061\142\062\143\063'`.
`DATE` | Requires supported [`DATE`](date.html) string format, e.g., `'2016-01-25'`.
`DECIMAL` | Requires supported [`DECIMAL`](decimal.html) string format, e.g., `'1.1'`.
`FLOAT` | Requires supported [`FLOAT`](float.html) string format, e.g., `'1.1'`.
`INET` | Requires supported [`INET`](inet.html) string format, e.g, `'192.168.0.1'`.
`INT` | Requires supported [`INT`](int.html) string format, e.g., `'10'`.
`INTERVAL` | Requires supported [`INTERVAL`](interval.html) string format, e.g., `'1h2m3s4ms5us6ns'`.
`TIME` | <span class="version-tag">New in v2.0:</span> Requires supported [`TIME`](time.html) string format, e.g., `'01:22:12'` (microsecond precision).
`TIMESTAMP` | Requires supported [`TIMESTAMP`](timestamp.html) string format, e.g., `'2016-01-25 10:10:10.555555'`.

## See Also

[Data Types](data-types.html)
