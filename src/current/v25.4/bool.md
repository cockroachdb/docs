---
title: BOOL
summary: The BOOL data type stores Boolean values of false or true.
toc: true
docs_area: reference.sql
---

The `BOOL` [data type]({% link {{ page.version.version }}/data-types.md %}) stores a Boolean value of `false` or `true`.


## Aliases

In CockroachDB, `BOOLEAN` is an alias for `BOOL`.

## Syntax

There are two predefined [named constants]({% link {{ page.version.version }}/sql-constants.md %}#named-constants) for `BOOL`: `TRUE` and `FALSE` (the names are case-insensitive).

Alternately, a boolean value can be obtained by coercing a numeric value: zero is coerced to `FALSE`, and any non-zero value to `TRUE`.

- `CAST(0 AS BOOL)` (false)
- `CAST(123 AS BOOL)` (true)

## Size

A `BOOL` value is 1 byte in width, but the total storage size is likely to be larger due to CockroachDB metadata.

## Examples

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE bool (a INT PRIMARY KEY, b BOOL, c BOOLEAN);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM bool;
~~~

~~~
  column_name | data_type | is_nullable | column_default | generation_expression |  indices  | is_hidden
--------------+-----------+-------------+----------------+-----------------------+-----------+------------
  a           | INT8      |    false    | NULL           |                       | {primary} |   false
  b           | BOOL      |    true     | NULL           |                       | {primary} |   false
  c           | BOOL      |    true     | NULL           |                       | {primary} |   false
(3 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO bool VALUES (12345, true, CAST(0 AS BOOL));
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM bool;
~~~

~~~
+-------+------+-------+
|   a   |  b   |   c   |
+-------+------+-------+
| 12345 | true | false |
+-------+------+-------+
~~~

## Supported casting and conversion

`BOOL` values can be [cast]({% link {{ page.version.version }}/data-types.md %}#data-type-conversions-and-casts) to any of the following data types:

Type | Details
-----|--------
`INT` | Converts `true` to `1`, `false` to `0`
`DECIMAL` | Converts `true` to `1`, `false` to `0`
`FLOAT` | Converts `true` to `1`, `false` to `0`
`STRING` | ––

## See also

[Data Types]({% link {{ page.version.version }}/data-types.md %})
