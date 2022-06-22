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

CockroachDB supports the collations provided by Go's [language package](https://godoc.org/golang.org/x/text/language#Tag). The `<collation>` argument is the BCP 47 language tag at the end of each line, immediately preceded by `//`. For example, Afrikaans is supported as the `af` collation.

## SQL syntax

Collated strings are used as normal strings in SQL, but have a `COLLATE` clause appended to them.

- **Column syntax**: `STRING COLLATE <collation>`. For example:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE TABLE foo (a STRING COLLATE en PRIMARY KEY);
    ~~~

    {{site.data.alerts.callout_info}}You can also use any of the <a href="string.html#aliases">aliases for <code>STRING</code></a>.{{site.data.alerts.end}}

- **Value syntax**: `<STRING value> COLLATE <collation>`. For example:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > INSERT INTO foo VALUES ('dog' COLLATE en);
    ~~~

## Examples

### Specify collation for a column

You can set a default collation for all values in a `STRING` column.

For example, you can set a column's default collation to German (`de`):

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE de_names (name STRING COLLATE de PRIMARY KEY);
~~~

When inserting values into this column, you must specify the collation for every value:

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO de_names VALUES ('Backhaus' COLLATE de), ('Bär' COLLATE de), ('Baz' COLLATE de);
~~~

The sort will now honor the `de` collation that treats *ä* as *a* in alphabetic sorting:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM de_names ORDER BY name;
~~~
~~~
+----------+
|   name   |
+----------+
| Backhaus |
| Bär      |
| Baz      |
+----------+
~~~

### Order by non-default collation

You can sort a column using a specific collation instead of its default.

For example, you receive different results if you order results by German (`de`) and Swedish (`sv`) collations:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM de_names ORDER BY name COLLATE sv;
~~~
~~~
+----------+
|   name   |
+----------+
| Backhaus |
| Baz      |
| Bär      |
+----------+
~~~

### Ad-hoc collation casting

You can cast any string into a collation on the fly.

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT 'A' COLLATE de < 'Ä' COLLATE de;
~~~
~~~
true
~~~

However, you cannot compare values with different collations:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT 'Ä' COLLATE sv < 'Ä' COLLATE de;
~~~
~~~
pq: unsupported comparison operator: <collatedstring{sv}> < <collatedstring{de}>
~~~

You can also use casting to remove collations from values.

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT CAST(name AS STRING) FROM de_names ORDER BY name;
~~~

## See also

[Data Types](data-types.html)
