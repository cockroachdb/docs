---
title: STRING
summary: The STRING data type stores a string of Unicode characters.
toc: true
docs_area: reference.sql
---

The `STRING` [data type]({% link {{ page.version.version }}/data-types.md %}) stores a string of Unicode characters.

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
- `NAME`

These types are functionally identical to `STRING`.

CockroachDB also supports the single-byte `"char"` special character type. As in PostgreSQL, this special type is intended for internal use in [system catalogs]({% link {{ page.version.version }}/system-catalogs.md %}), and has a storage size of 1 byte. CockroachDB truncates all values of type `"char"` to a single character.

## Length

To limit the length of a string column, use `STRING(n)`, where `n` is the maximum number of Unicode code points (normally thought of as "characters") allowed. This applies to all related types as well (e.g., to limit the length of a `VARCHAR` type, use `VARCHAR(n)`). To reduce performance issues caused by storing very large string values in indexes, Cockroach Labs recommends setting length limits on string-typed columns.

{{site.data.alerts.callout_danger}}
{% include {{page.version.version}}/sql/add-size-limits-to-indexed-columns.md %}
{{site.data.alerts.end}}

When inserting a `STRING` value or a `STRING`-related-type value:

- If the value is cast with a length limit (e.g., `CAST('hello world' AS STRING(5))`), CockroachDB truncates to the limit. This applies to `STRING(n)` and all related types.
- If the value exceeds the column's length limit, CockroachDB returns an error. This applies to `STRING(n)` and all related types.
- For `STRING(n)` and `VARCHAR(n)`/`CHARACTER VARYING(n)` types, if the value is under the column's length limit, CockroachDB does **not** add space padding to the end of the value.
- For `CHAR(n)`/`CHARACTER(n)` types, if the value is under the column's length limit, CockroachDB adds space padding from the end of the value to the length limit.

                        Type                      |          Length
--------------------------------------------------|------------------------------
`CHARACTER`, `CHARACTER(n)`, `CHAR`, `CHAR(n)`    | Fixed-length
`CHARACTER VARYING(n)`, `VARCHAR(n)`, `STRING(n)` | Variable-length, with a limit
`TEXT`, `VARCHAR`, `CHARACTER VARYING`, `STRING`  | Variable-length, with no limit
`"char"` (special type)                           | 1 byte

## Syntax

A value of type `STRING` can be expressed using a variety of formats.
See [string literals]({% link {{ page.version.version }}/sql-constants.md %}#string-literals) for more details.

When printing out a `STRING` value in the [SQL shell]({% link {{ page.version.version }}/cockroach-sql.md %}), the shell uses the simple
SQL string literal format if the value doesn't contain special character,
or the escaped format otherwise.

### Collations

`STRING` values accept [collations]({% link {{ page.version.version }}/collate.md %}), which lets you sort strings according to language- and country-specific rules.

## Size

The size of a `STRING` value is variable, but it's recommended to keep values under 64 kilobytes to ensure performance. Above that threshold, [write amplification]({% link {{ page.version.version }}/architecture/storage-layer.md %}#write-amplification) and other considerations may cause significant performance degradation.

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
  column_name | data_type | is_nullable | column_default | generation_expression |  indices  | is_hidden
--------------+-----------+-------------+----------------+-----------------------+-----------+------------
  a           | STRING    |    false    | NULL           |                       | {primary} |   false
  b           | STRING(4) |    true     | NULL           |                       | {primary} |   false
  c           | STRING    |    true     | NULL           |                       | {primary} |   false
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
  a           | STRING    |    false    | NULL           |                       | {primary}   |   false
  b           | VARCHAR   |    true     | NULL           |                       | {primary}   |   false
  c           | CHAR      |    true     | NULL           |                       | {primary}   |   false
(3 rows)
~~~

## Supported casting and conversion

`STRING` values can be [cast]({% link {{ page.version.version }}/data-types.md %}#data-type-conversions-and-casts) to any of the following data types:

Type | Details
-----|--------
`ARRAY` | Requires supported [`ARRAY`]({% link {{ page.version.version }}/array.md %}) string format, e.g., `'{1,2,3}'`.<br>Note that string literals can be implicitly cast to any supported `ARRAY` data type except [`BYTES`]({% link {{ page.version.version }}/bytes.md %}), [`ENUM`]({% link {{ page.version.version }}/enum.md %}), [`JSONB`]({% link {{ page.version.version }}/jsonb.md %}), [`SERIAL`](serial.html), and the [spatial data types](architecture/glossary.html#data-types) `Box2D`, `GEOGRAPHY`, and `GEOMETRY`.
`BIT` | Requires supported [`BIT`]({% link {{ page.version.version }}/bit.md %}) string format, e.g., `'101001'` or `'xAB'`.
`BOOL` | Requires supported [`BOOL`]({% link {{ page.version.version }}/bool.md %}) string format, e.g., `'true'`.
`BYTES` | For more details, [see here]({% link {{ page.version.version }}/bytes.md %}#supported-conversions).
`CITEXT` | Preserves the original letter case, but value comparisons are treated case-insensitively. Refer to [`CITEXT`]({% link {{ page.version.version }}/citext.md %}).
`DATE` | Requires supported [`DATE`]({% link {{ page.version.version }}/date.md %}) string format, e.g., `'2016-01-25'`.
`DECIMAL` | Requires supported [`DECIMAL`]({% link {{ page.version.version }}/decimal.md %}) string format, e.g., `'1.1'`.
`FLOAT` | Requires supported [`FLOAT`]({% link {{ page.version.version }}/float.md %}) string format, e.g., `'1.1'`.
`INET` | Requires supported [`INET`]({% link {{ page.version.version }}/inet.md %}) string format, e.g, `'192.168.0.1'`.
`INT` | Requires supported [`INT`]({% link {{ page.version.version }}/int.md %}) string format, e.g., `'10'`.
`INTERVAL` | Requires supported [`INTERVAL`]({% link {{ page.version.version }}/interval.md %}) string format, e.g., `'1h2m3s4ms5us6ns'`.
`JSONPATH` | Requires a valid [`JSONPath`]({% link {{ page.version.version }}/jsonpath.md %}) expression string, e.g., `'$'` or `'$.players[*] ? (@.stats.ppg > 30)'`.
`LTREE` | Requires supported [`LTREE`]({% link {{ page.version.version }}/ltree.md %}) string format, e.g., `'Animals.Mammals.Carnivora'`.
`TIME` | Requires supported [`TIME`]({% link {{ page.version.version }}/time.md %}) string format, e.g., `'01:22:12'` (microsecond precision).
`TIMESTAMP` | Requires supported [`TIMESTAMP`]({% link {{ page.version.version }}/timestamp.md %}) string format, e.g., `'2016-01-25 10:10:10.555555'`.
`TSQUERY` | Requires supported [`TSQUERY`]({% link {{ page.version.version }}/tsquery.md %}) string format, e.g., `'Requires & supported & TSQUERY & string & format'`.<br>Note that casting a string to a `TSQUERY` will not normalize the tokens into lexemes. To do so, [use `to_tsquery()`, `plainto_tsquery()`, or `phraseto_tsquery()`](#convert-string-to-tsquery).
`TSVECTOR` | Requires supported [`TSVECTOR`]({% link {{ page.version.version }}/tsvector.md %}) string format, e.g., `'Requires supported TSVECTOR string format.'`.<br>Note that casting a string to a `TSVECTOR` will not normalize the tokens into lexemes. To do so, [use `to_tsvector()`](#convert-string-to-tsvector).
`UUID` | Requires supported [`UUID`]({% link {{ page.version.version }}/uuid.md %}) string format, e.g., `'63616665-6630-3064-6465-616462656562'`.

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

In this case, [`LENGTH(string)`]({% link {{ page.version.version }}/functions-and-operators.md %}#string-and-byte-functions) measures the number of Unicode code points present in the string, whereas [`LENGTH(bytes)`]({% link {{ page.version.version }}/functions-and-operators.md %}#string-and-byte-functions) measures the number of bytes required to store that value. Each character (or Unicode code point) can be encoded using multiple bytes, hence the difference in output between the two.

#### Translate literals to `STRING` vs. `BYTES`

A literal entered through a SQL client will be translated into a different value based on the type:

+ `BYTES` gives a special meaning to the pair `\x` at the beginning, and translates the rest by substituting pairs of hexadecimal digits to a single byte. For example, `\xff` is equivalent to a single byte with the value of 255. For more information, see [SQL Constants: String literals with character escapes]({% link {{ page.version.version }}/sql-constants.md %}#string-literals-with-character-escapes).
+ `STRING` does not give a special meaning to `\x`, so all characters are treated as distinct Unicode code points. For example, `\xff` is treated as a `STRING` with length 4 (`\`, `x`, `f`, and `f`).

### Cast hexadecimal digits to `BIT`

You can cast a `STRING` value of hexadecimal digits prefixed by `x` or `X` to a `BIT` value.

For example:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT 'XAB'::BIT(8)
~~~

~~~
    bit
------------
  10101011
(1 row)
~~~

### Concatenate `STRING` values with values of other types

 `STRING` values can be concatenated with any non-`ARRAY`, non-`NULL` type, resulting in a `STRING` value.

For example:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT 1 || 'item';
~~~

~~~
  ?column?
------------
  1item
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT true || 'item';
~~~

~~~
  ?column?
------------
  titem
(1 row)
~~~

Concatenating a `STRING` value with a [`NULL` value]({% link {{ page.version.version }}/null-handling.md %}) results in a `NULL` value.

For example:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT NULL || 'item';
~~~

~~~
  ?column?
------------
  NULL
(1 row)
~~~

### Convert `STRING` to `TIMESTAMP`

You can use the [`parse_timestamp()` function]({% link {{ page.version.version }}/functions-and-operators.md %}) to parse strings in `TIMESTAMP` format.

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT parse_timestamp ('2022-05-28T10:53:25.160Z');
~~~

~~~
      parse_timestamp
--------------------------
2022-05-28 10:53:25.16
(1 row)
~~~

### Convert `STRING` to `TSVECTOR`

You can use the [`to_tsvector()` function]({% link {{ page.version.version }}/functions-and-operators.md %}#full-text-search-functions) to parse strings in [`TSVECTOR`]({% link {{ page.version.version }}/tsvector.md %}) format. This will normalize the tokens into lexemes, and will add an integer position to each lexeme.

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT to_tsvector('How do trees get on the internet?');
~~~

~~~
           to_tsvector
---------------------------------
  'get':4 'internet':7 'tree':3
~~~

For more information on usage, see [Full-Text Search]({% link {{ page.version.version }}/full-text-search.md %}).

### Convert `STRING` to `TSQUERY`

You can use the [`to_tsquery()`, `plainto_tsquery()`, and `phraseto_tsquery()` functions]({% link {{ page.version.version }}/functions-and-operators.md %}#full-text-search-functions) to parse strings in [`TSQUERY`]({% link {{ page.version.version }}/tsquery.md %}) format. This will normalize the tokens into lexemes.

When using `to_tsquery()`, the string input must be formatted as a [`TSQUERY`]({% link {{ page.version.version }}/tsquery.md %}#syntax), with operators separating tokens.

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT to_tsquery('How & do & trees & get & on & the & internet?');
~~~

~~~
          to_tsquery
-------------------------------
  'tree' & 'get' & 'internet'
~~~

For more information on usage, see [Full-Text Search]({% link {{ page.version.version }}/full-text-search.md %}).

## See also

- [Data Types]({% link {{ page.version.version }}/data-types.md %})
- [String literal syntax]({% link {{ page.version.version }}/sql-constants.md %}#string-literals)
