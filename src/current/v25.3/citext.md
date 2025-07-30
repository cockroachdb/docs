---
title: CITEXT
summary: The CITEXT data type stores case-insensitive text values.
toc: true
docs_area: reference.sql
---

The `CITEXT` [data type]({% link {{ page.version.version }}/data-types.md %}) stores case-insensitive strings.

All `CITEXT` values are folded to lowercase before comparison. This is handled internally with the [`lower()`]({% link {{ page.version.version }}/functions-and-operators.md %}#string-and-byte-functions) function.

For example, the following comparison evaluates to `true`:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT 'Roach'::CITEXT = 'roach'::CITEXT;
~~~

~~~
  ?column?
------------
     t
~~~

With `CITEXT`, equality operators (`=`, `!=`, `<>`), ordering operators (`<`, `>`, etc.), and [`STRING` functions]({% link {{ page.version.version }}/functions-and-operators.md %}#string-and-byte-functions), treat values as case-insensitive by default. Refer to the [example](#example).

Aside from comparisons, `CITEXT` behaves like [`STRING`]({% link {{ page.version.version }}/string.md %}).

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

As with `STRING`, `CITEXT` values should be kept below 64 KB for best performance. Because `CITEXT` values are folded to lowercase on every comparison, `CITEXT` columns and indexes consume marginally more CPU and memory than their `STRING` equivalents, especially on write-heavy workloads.

## Collations

`CITEXT` compares values as a `STRING` column with the `und-u-ks-level2` [collation]({% link {{ page.version.version }}/collate.md %}), meaning it is case-insensitive but accent-sensitive. If you need accent-insensitive behavior, consider using `STRING` with a nondeterministic collation instead.

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
('roach', 'roach@example.com'),
('juno', 'juno@example.com');
~~~

Because `CITEXT` comparisons are case-insensitive, an equality predicate matches regardless of letter case:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM logins WHERE username = 'Roach';
~~~

~~~
  name  |       email
--------+--------------------
  roach | roach@example.com
(1 row)
~~~

An ordering comparison is also case-insensitive with `CITEXT`. In the following eaxmple, `'Xavi'` is folded to lowercase before the comparison:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT username FROM logins WHERE username < 'Xavi';
~~~

~~~ 
  username
------------
  roach
  juno
(2 rows)
~~~

For case-sensitive comparisons on `CITEXT` values, cast to `STRING` explicitly. In the default Unicode ordering, the uppercase value is considered less than the lowercase values in the table:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT username FROM logins WHERE username::STRING < 'Xavi';
~~~

~~~
  username | email
-----------+--------
(0 rows)
~~~

## Supported casting and conversion

`CITEXT` values can be [cast]({% link {{ page.version.version }}/data-types.md %}#data-type-conversions-and-casts) to the following data types:

Type | Details
-----|--------
`STRING` | Preserves case information when casting to `STRING`.

## See also

- [`STRING`]({% link {{ page.version.version }}/string.md %})
- [Data Types]({% link {{ page.version.version }}/data-types.md %})
- [`COLLATE`]({% link {{ page.version.version }}/collate.md %})
