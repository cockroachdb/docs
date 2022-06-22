---
title: STRING
summary: The STRING data type stores a string of Unicode characters.
toc: true
---

The `STRING` [data type](data-types.html) stores a string of Unicode characters.

{{site.data.alerts.callout_info}}
`STRING` is not a data type supported by PostgreSQL. For PostgreSQL compatibility, CockroachDB supports additional [aliases](#aliases) and [`STRING`-related types](#related-types).
{{site.data.alerts.end}}

## Aliases

CockroachDB supports the following alias for `STRING`:

- `TEXT`

## Related types

For PostgreSQL compatibility, CockroachDB supports the following `STRING`-related types and their aliases:

- `VARCHAR` (and alias `CHARACTER VARYING`)
- `CHAR` (and alias `CHARACTER`)

These types are functionality identical to `STRING`.

## Length

To limit the length of a string column, use `STRING(n)`, where `n` is the maximum number of Unicode code points (normally thought of as "characters") allowed. This applies to all related types as well (e.g., to limit the length of a `VARCHAR` type, use `VARCHAR(n)`).

When inserting a `STRING` value or a `STRING`-related-type value:

- If the value is cast with a length limit (e.g., `CAST('hello world' AS STRING(5))`), CockroachDB truncates to the limit. This applies to `STRING(n)` and all related types.
- If the value exceeds the column's length limit, CockroachDB returns an error. This applies to `STRING(n)` and all related types.
- For `STRING(n)` and `VARCHAR(n)`/`CHARACTER VARYING(n)` types, if the value is under the column's length limit, CockroachDB does **not** add space padding to the end of the value.

                        Type                      |          Length                  
--------------------------------------------------|------------------------------
`CHARACTER`, `CHARACTER(n)`, `CHAR`, `CHAR(n)`    | Fixed-length                
`CHARACTER VARYING(n)`, `VARCHAR(n)`, `STRING(n)` | Variable-length, with a limit  
`TEXT`, `VARCHAR`, `CHARACTER VARYING`, `STRING`  | Variable-length, with no limit

## Syntax

A value of type `STRING` can be expressed using a variety of formats.
See [string literals](sql-constants.html#string-literals) for more details.

When printing out a `STRING` value in the [SQL shell](cockroach-sql.html), the shell uses the simple
SQL string literal format if the value doesn't contain special character,
or the escaped format otherwise.

### Collations

`STRING` values accept [collations](collate.html), which lets you sort strings according to language- and country-specific rules.

## Size

The size of a `STRING` value is variable, but it's recommended to keep values under 1 MB to ensure performance. Above that threshold, [write amplification](https://en.wikipedia.org/wiki/Write_amplification) and other considerations may cause significant performance degradation.

## Examples

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE strings (a STRING PRIMARY KEY, b STRING(4), c TEXT);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM strings;
~~~

~~~
  column_name | data_type | is_nullable | column_default | generation_expression |   indices   | is_hidden
+-------------+-----------+-------------+----------------+-----------------------+-------------+-----------+
  a           | STRING    |    false    | NULL           |                       | {"primary"} |   false
  b           | STRING(4) |    true     | NULL           |                       | {}          |   false
  c           | STRING    |    true     | NULL           |                       | {}          |   false
(3 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO strings VALUES ('a1b2c3d4', 'e5f6', 'g7h8i9');
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM strings;
~~~

~~~
     a     |  b   |   c
+----------+------+--------+
  a1b2c3d4 | e5f6 | g7h8i9
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE aliases (a STRING PRIMARY KEY, b VARCHAR, c CHAR);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM aliases;
~~~

~~~
  column_name | data_type | is_nullable | column_default | generation_expression |   indices   | is_hidden
+-------------+-----------+-------------+----------------+-----------------------+-------------+-----------+
  a           | STRING    |    false    | NULL           |                       | {"primary"} |   false
  b           | VARCHAR   |    true     | NULL           |                       | {}          |   false
  c           | CHAR      |    true     | NULL           |                       | {}          |   false
(3 rows)
~~~

## Supported casting and conversion

`STRING` values can be [cast](data-types.html#data-type-conversions-and-casts) to any of the following data types:

Type | Details
-----|--------
`ARRAY` | Requires supported [`ARRAY`](array.html) string format, e.g., `'{1,2,3}'`.<br>Limited to `ARRAY`s of type [`INT`](int.html) and [`DECIMAL`](decimal.html).
`BIT` | Requires supported [`BIT`](bit.html) string format, e.g., `'101001'`.
`BOOL` | Requires supported [`BOOL`](bool.html) string format, e.g., `'true'`.
`BYTES` | For more details, [see here](bytes.html#supported-conversions).
`DATE` | Requires supported [`DATE`](date.html) string format, e.g., `'2016-01-25'`.
`DECIMAL` | Requires supported [`DECIMAL`](decimal.html) string format, e.g., `'1.1'`.
`FLOAT` | Requires supported [`FLOAT`](float.html) string format, e.g., `'1.1'`.
`INET` | Requires supported [`INET`](inet.html) string format, e.g, `'192.168.0.1'`.
`INT` | Requires supported [`INT`](int.html) string format, e.g., `'10'`.
`INTERVAL` | Requires supported [`INTERVAL`](interval.html) string format, e.g., `'1h2m3s4ms5us6ns'`.
`TIME` | Requires supported [`TIME`](time.html) string format, e.g., `'01:22:12'` (microsecond precision).
`TIMESTAMP` | Requires supported [`TIMESTAMP`](timestamp.html) string format, e.g., `'2016-01-25 10:10:10.555555'`.

### `STRING` vs. `BYTES`

While both `STRING` and `BYTES` can appear to have similar behavior in many situations, one should understand their nuance before casting one into the other.

`STRING` treats all of its data as characters, or more specifically, Unicode code points. `BYTES` treats all of its data as a byte string. This difference in implementation can lead to dramatically different behavior. For example, let's take a complex Unicode character such as ☃ ([the snowman emoji](https://emojipedia.org/snowman/)):

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT length('☃'::string);
~~~

~~~
  length
+--------+
       1
~~~

~~~ sql
> SELECT length('☃'::bytes);
~~~
~~~
  length
+--------+
       3
~~~

In this case, [`LENGTH(string)`](functions-and-operators.html#string-and-byte-functions) measures the number of Unicode code points present in the string, whereas [`LENGTH(bytes)`](functions-and-operators.html#string-and-byte-functions) measures the number of bytes required to store that value. Each character (or Unicode code point) can be encoded using multiple bytes, hence the difference in output between the two.

#### Translating literals to `STRING` vs. `BYTES`

A literal entered through a SQL client will be translated into a different value based on the type:

+ `BYTES` give a special meaning to the pair `\x` at the beginning, and translates the rest by substituting pairs of hexadecimal digits to a single byte. For example, `\xff` is equivalent to a single byte with the value of 255. For more information, see [SQL Constants: String literals with character escapes](sql-constants.html#string-literals-with-character-escapes).
+ `STRING` does not give a special meaning to `\x`, so all characters are treated as distinct Unicode code points. For example, `\xff` is treated as a `STRING` with length 4 (`\`, `x`, `f`, and `f`).

## See also

- [Data Types](data-types.html)
- [String literal syntax](sql-constants.html#string-literals)
