---
title: CITEXT
summary: The CITEXT data type stores case-insensitive text values.
toc: true
docs_area: reference.sql
---

The `CITEXT` [data type]({% link {{ page.version.version }}/data-types.md %}) represents a case-insensitive string. Like `STRING` values, `CITEXT` values preserve their casing when stored and retrieved. Unlike `STRING` values, comparisons between `CITEXT` values are case-insensitive for all [Unicode characters](https://en.wikipedia.org/wiki/List_of_Unicode_characters) that have a defined uppercase/lowercase mapping (e.g., `'É' = 'é'`).

Equality operators (`=`, `!=`, `<>`) and ordering operators (`<`, `>`, etc.) treat `CITEXT` values as case-insensitive by default. Refer to the [example](#example). 

{{site.data.alerts.callout_success}}
`CITEXT` compares values as a `STRING` column with the `und-u-ks-level2` [collation]({% link {{ page.version.version }}/collate.md %}), meaning it is case-insensitive but accent-sensitive.
{{site.data.alerts.end}}

## Syntax

To declare a `CITEXT` column, use the type name directly in your `CREATE TABLE` statement:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE logins (
    name CITEXT PRIMARY KEY,
    email TEXT NOT NULL
);
~~~

## Size

As with `STRING`, `CITEXT` values should be kept below 64 KB for best performance. Because `CITEXT` values resort to a collation engine on every comparison, `CITEXT` columns and indexes consume marginally more CPU and memory than their `STRING` equivalents.

## Example

Create and populate a table:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE logins (
  username CITEXT,
  email STRING
);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
INSERT INTO logins VALUES
('Roach', 'Roach@example.com'),
('lincoln', 'lincoln@example.com');
~~~

Because `CITEXT` comparisons are case-insensitive, an equality predicate matches regardless of letter case:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM logins WHERE username = 'roach';
~~~

~~~
  username |       email
-----------+--------------------
  Roach    | Roach@example.com
(1 row)
~~~

An ordering comparison is also case-insensitive with `CITEXT`:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT username FROM logins WHERE username < 'Xavi';
~~~

~~~ 
  username
------------
  Roach
  lincoln
(2 rows)
~~~

For case-sensitive comparisons on `CITEXT` values, cast to `STRING` explicitly. In the default Unicode ordering, an uppercase value is considered less than the lowercase value in the table:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT username FROM logins WHERE username::STRING < 'Xavi';
~~~

~~~
  username
------------
  Roach
(1 row)
~~~

## Known limitations

{% include {{ page.version.version }}/known-limitations/citext-limitations.md %}

## See also

- [Data Types]({% link {{ page.version.version }}/data-types.md %})
- [`STRING`]({% link {{ page.version.version }}/string.md %})
- [`COLLATE`]({% link {{ page.version.version }}/collate.md %})