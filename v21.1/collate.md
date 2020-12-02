---
title: COLLATE
summary: The COLLATE feature lets you sort strings according to language- and country-specific rules.
toc: true
redirect_from: collatedstring.html
---

The `COLLATE` feature lets you sort [`STRING`](string.html) values according to language- and country-specific rules, known as collations.

Collated strings are important because different languages have [different rules for alphabetic order](https://en.wikipedia.org/wiki/Alphabetical_order#Language-specific_conventions), especially with respect to accented letters. For example, in German accented letters are sorted with their unaccented counterparts, while in Swedish they are placed at the end of the alphabet. A collation is a set of rules used for ordering and usually corresponds to a language, though some languages have multiple collations with different rules for sorting; for example Portuguese has separate collations for Brazilian and European dialects (`pt-BR` and `pt-PT` respectively).

## Details

- Operations on collated strings cannot involve strings with a different collation or strings with no collation. However, it is possible to <a href="#ad-hoc-collation-casting">add or overwrite a collation on the fly</a>.

- Only use the collation feature when you need to sort strings by a specific collation. We recommend this because every time a collated string is constructed or loaded into memory, CockroachDB computes its collation key, whose size is linear in relationship to the length of the collated string, which requires additional resources.

- Collated strings can be considerably larger than the corresponding uncollated strings, depending on the language and the string content. For example, strings containing the character `é` produce larger collation keys in the French locale than in Chinese.

- Collated strings that are indexed require additional disk space as compared to uncollated strings. In case of indexed collated strings, collation keys must be stored in addition to the strings from which they are derived, creating a constant factor overhead.

## Supported collations

CockroachDB supports collations identified by [Unicode locale identifiers](http://cldr.unicode.org/core-spec#Identifiers). For example, `en-US` identifies US English, `es` identifies Spanish, and `fr-CA` identifies Canadian French. Collation names are case-insensitive, and hyphens and underscores are interchangeable.

{{site.data.alerts.callout_info}}
If a hyphen is used in a SQL query, the collation name must be enclosed in double quotes, as single quotes are used for SQL string literals.
{{site.data.alerts.end}}

A list of supported collations can be found in the `pg_catalog.pg_collation` table:

{% include copy-clipboard.html %}
~~~ sql
> SELECT collname from pg_catalog.pg_collation;
~~~

~~~
       collname
-----------------------
  und
  aa
  af
  ar
...
(95 rows)
~~~

CockroachDB supports standard aliases for the collations listed in `pg_collation`. For example, `es-419` (Latin American Spanish) and `zh-Hans` (Simplified Chinese) are supported, but they do not appear in the `pg_collations` table because they are equivalent to the `es` and `zh` collations listed in the table.

CockroachDB also supports the following Unicode locale extensions:

- `co` (collation type)
- `ks` (strength)
- `kc` (case level)
- `kb` (backwards second level weight)
- `kn` (numeric)
- `ks` (strength)
- `ka` (alternate handling)

To use a locale extension, append `-u-` to the base locale name, followed by the extension. For example, `en-US-u-ks-level2` is case-insensitive US English. The `ks` modifier changes the "strength" of the collation, causing it to treat certain classes of characters as equivalent (PostgreSQL calls these "non-deterministic collations"). Setting the `ks` to `level2` makes the collation case-insensitive (for languages that have this concept).

For more details on locale extensions, see the [Unicode Collation Algorithm](https://unicode.org/reports/tr10/).

## Collation versioning

While changes to collations are rare, they are possible, especially in languages with a large numbers of characters (e.g., Simplifed and Traditional Chinese). CockroachDB updates its support with new versions of the Unicode standard every year, but there is currently no way to specify the version of Unicode to use. As a result, it is possible for a collation change to invalidate existing collated string data. To prevent collated data from being invalidated by Unicode changes, we recommend storing data in columns with an uncollated string type, and then using a [computed column](computed-columns.html) for the desired collation. In the event that a collation change produces undesired effects, the computed column can be dropped and recreated.

## SQL syntax

Collated strings are used as normal strings in SQL, but have a `COLLATE` clause appended to them.

- **Column syntax**: `STRING COLLATE <collation>`. For example:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE TABLE foo (a STRING COLLATE en PRIMARY KEY);
    ~~~

    {{site.data.alerts.callout_info}}You can also use any of the <a href="string.html#aliases">aliases for <code>STRING</code></a>.{{site.data.alerts.end}}

- **Value syntax**: `<STRING value> COLLATE <collation>`. For example:

    {% include copy-clipboard.html %}
    ~~~ sql
    > INSERT INTO foo VALUES ('dog' COLLATE en);
    ~~~

## Examples

### Specify collation for a column

You can set a default collation for all values in a `STRING` column.

For example, you can set a column's default collation to German (`de`):

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE de_names (name STRING COLLATE de PRIMARY KEY);
~~~

When inserting values into this column, you must specify the collation for every value:

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO de_names VALUES ('Backhaus' COLLATE de), ('Bär' COLLATE de), ('Baz' COLLATE de);
~~~

The sort will now honor the `de` collation that treats *ä* as *a* in alphabetic sorting:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM de_names ORDER BY name;
~~~
~~~
    name
+----------+
  Backhaus
  Bär
  Baz
(3 rows)
~~~

### Specify collations with locale extensions

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE nocase_strings (greeting STRING COLLATE "en-US-u-ks-level2");
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO nocase_strings VALUES ('Hello, friend.' COLLATE "en-US-u-ks-level2"), ('Hi. My name is Petee.' COLLATE "en-US-u-ks-level2");
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM nocase_strings WHERE greeting = ('hi. my name is petee.' COLLATE "en-US-u-ks-level2");
~~~

~~~
        greeting
+-----------------------+
  Hi. My name is Petee.
(1 row)
~~~

### Order by non-default collation

You can sort a column using a specific collation instead of its default.

For example, you receive different results if you order results by German (`de`) and Swedish (`sv`) collations:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM de_names ORDER BY name COLLATE sv;
~~~
~~~
    name
+----------+
  Backhaus
  Baz
  Bär
(3 rows)
~~~

### Ad-hoc collation casting

You can cast any string into a collation on the fly.

{% include copy-clipboard.html %}
~~~ sql
> SELECT 'A' COLLATE de < 'Ä' COLLATE de;
~~~
~~~
  ?column?
+----------+
    true
(1 row)
~~~

However, you cannot compare values with different collations:

{% include copy-clipboard.html %}
~~~ sql
> SELECT 'Ä' COLLATE sv < 'Ä' COLLATE de;
~~~
~~~
pq: unsupported comparison operator: <collatedstring{sv}> < <collatedstring{de}>
~~~

You can also use casting to remove collations from values.

{% include copy-clipboard.html %}
~~~ sql
> SELECT CAST(name AS STRING) FROM de_names ORDER BY name;
~~~
~~~
    name
+----------+
  Backhaus
  Baz
  Bär
(3 rows)
~~~

### Show collation for strings

You can use the `pg_collation_for` [built-in function](functions-and-operators.html#string-and-byte-functions), or its alternative [syntax form](functions-and-operators.html#special-syntax-forms) `COLLATION FOR`, to return the locale name of a collated string.

For example:

{% include copy-clipboard.html %}
~~~ sql
> SELECT pg_collation_for('Bär' COLLATE de);
~~~

~~~
  pg_collation_for
+------------------+
  de
(1 row)
~~~

This is equivalent to:

{% include copy-clipboard.html %}
~~~ sql
> SELECT COLLATION FOR ('Bär' COLLATE de);
~~~

~~~
  pg_collation_for
+------------------+
  de
(1 row)
~~~

## Known limitations

### Collation names that include upper-case or hyphens may cause errors

Using a [collation](collate.html) name with upper-case letters or hyphens may result in errors.

For example, the following SQL will result in an error:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE nocase_strings (s STRING COLLATE "en-US-u-ks-level2");
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO nocase_strings VALUES ('Aaa' COLLATE "en-US-u-ks-level2"), ('Bbb' COLLATE "en-US-u-ks-level2");
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT s FROM nocase_strings WHERE s = ('bbb' COLLATE "en-US-u-ks-level2");
~~~

~~~
ERROR: internal error: "$0" = 'bbb' COLLATE en_us_u_ks_level2: unsupported comparison operator: <collatedstring{en-US-u-ks-level2}> = <collatedstring{en_us_u_ks_level2}>
~~~

As a workaround, only use collation names that have lower-case letters and underscores.

[Tracking GitHub issue](https://github.com/cockroachdb/cockroach/issues/56335)

## See also

[Data Types](data-types.html)
