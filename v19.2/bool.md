---
title: BOOL
summary: The BOOL data type stores Boolean values of false or true.
toc: true
---

The `BOOL` [data type](data-types.html) stores a Boolean value of `false` or `true`.


## Aliases

In CockroachDB, `BOOLEAN` is an alias for `BOOL`.

## Syntax

There are two predefined [named constants](sql-constants.html#named-constants) for `BOOL`: `TRUE` and `FALSE` (the names are case-insensitive).

Alternately, a boolean value can be obtained by coercing a numeric value: zero is coerced to `FALSE`, and any non-zero value to `TRUE`.

- `CAST(0 AS BOOL)` (false)
- `CAST(123 AS BOOL)` (true)

## Size

A `BOOL` value is 1 byte in width, but the total storage size is likely to be larger due to CockroachDB metadata.  

## Examples

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE bool (a INT PRIMARY KEY, b BOOL, c BOOLEAN);
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM bool;
~~~

~~~
+-------------+-----------+-------------+----------------+-----------------------+-------------+
| column_name | data_type | is_nullable | column_default | generation_expression |   indices   |
+-------------+-----------+-------------+----------------+-----------------------+-------------+
| a           | INT       |    false    | NULL           |                       | {"primary"} |
| b           | BOOL      |    true     | NULL           |                       | {}          |
| c           | BOOL      |    true     | NULL           |                       | {}          |
+-------------+-----------+-------------+----------------+-----------------------+-------------+
(3 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO bool VALUES (12345, true, CAST(0 AS BOOL));
~~~

{% include copy-clipboard.html %}
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

`BOOL` values can be [cast](data-types.html#data-type-conversions-and-casts) to any of the following data types:

Type | Details
-----|--------
`INT` | Converts `true` to `1`, `false` to `0`
`DECIMAL` | Converts `true` to `1`, `false` to `0`
`FLOAT` | Converts `true` to `1`, `false` to `0`
`STRING` | ––

## See also

[Data Types](data-types.html)
