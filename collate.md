---
title: COLLATE
summary: The COLLATE feature lets you sort strings according to language- and country-specific rules.
toc: false
---

The `COLLATE` feature lets you lets you sort [`STRING`](string.html) values according to language- and country-specific rules, known as collations.

{{site.data.alerts.callout_danger}}You cannot currently use collated strings in indexes, which includes table's primary keys; doing so will crash CockroachDB. You can follow our work to resolve this issue on <a href="https://github.com/cockroachdb/cockroach/issues/2473">GitHub</a>.{{site.data.alerts.end}}

Collated strings are important because different languages have [different rules for alphabetic order](https://en.wikipedia.org/wiki/Alphabetical_order#Language-specific_conventions), especially with respect to accented letters. For example, in German accented letters are sorted with their unaccented counterparts, while in Swedish they are placed at the end of the alphabet. A collation is a set of rules used for ordering and usually corresponds to a language, though some languages have multiple collations with different rules for sorting; for example Portuguese has separate collations for Brazilian and European dialects (`pt-BR` and `pt-PT` respectively).

{{site.data.alerts.callout_info}}Operations on collated strings cannot involve strings with a different collation or strings with no collation. However, it is possible to <a href="#ad-hoc-collation-casting">add or overwrite a collation on the fly</a>.{{site.data.alerts.end}}

<div id="toc"></div>

## Supported Collations

CockroachDB supports the collations provided by Go's [language package](https://godoc.org/golang.org/x/text/language#Tag). The `<collation>` argument is the BCP 47 language tag at the end of each line, immediately preceded by `//`. For example, Afrikaans is supported as the `af` collation.

## SQL Syntax

Collated strings are used as normal strings in SQL, but have a `COLLATE` clause appended to them.

- **Column syntax**: `STRING COLLATE <collation>`. For example:

  ~~~ sql
  > CREATE TABLE foo (a STRING COLLATE en);
  ~~~

  {{site.data.alerts.callout_info}}You can also use any of the <a href="string.html#aliases">aliases for <code>STRING</code></a>.{{site.data.alerts.end}}

- **Value syntax**: `<STRING value> COLLATE <collation>`. For example:

  ~~~ sql
  > INSERT INTO foo VALUES ('dog' COLLATE en);
  ~~~

## Size & Performance

Collated strings are stored on disk in the same way as [`STRING`](string.html) values, i.e., the `COLLATE` feature does not require additional disk space.

However, every time a collated string is constructed or loaded into memory, CockroachDB computes its collation key, whose size is linear in relationship to the length of the collated string. For optimal performance, prefer non-collated strings unless you need the special ordering.

## Examples

### Specify Collation for a Column

You can set a default collation for all values in a `STRING` column.

For example, you can set a column's default collation to German (`de`):

~~~ sql
> CREATE TABLE de_names (name STRING COLLATE de);
~~~

When inserting values into this column, you must specify the collation for every value:

~~~ sql
> INSERT INTO de_names VALUES ('Backhaus' COLLATE de), ('Bär' COLLATE de), ('Baz' COLLATE de);
~~~

The sort will now honor the `de` collation that treats *ä* as *a* in alphabetic sorting:

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

### Order by Non-Default Collation

You can sort a column using a specific collation instead of its default (which also lets you run ad-hoc collation-based sorts on non-collated columns).

For example, you receive different results if you order results by German (`de`) and Swedish (`sv`) collations:

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

### Ad-Hoc Collation Casting

You can cast any string into a collation on the fly.

~~~ sql
> SELECT 'A' COLLATE de < 'Ä' COLLATE de;
~~~
~~~
true
~~~

However, you cannot compare values with different collations:

~~~ sql
SELECT 'Ä' COLLATE sv < 'Ä' COLLATE de;
~~~
~~~
pq: unsupported comparison operator: <collatedstring{sv}> < <collatedstring{de}>
~~~

You can also use casting to remove collations from values.

~~~ sql
> SELECT CAST(name AS STRING) FROM de_names ORDER BY name;
~~~

## See Also

[Data Types](data-types.html)
