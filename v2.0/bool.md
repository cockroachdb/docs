---
title: BOOL
summary: The BOOL data type stores Boolean values of false or true.
toc: true
---

The `BOOL` [data type](data-types.html) stores a Boolean value of `false` or `true`. 


## Aliases

In CockroachDB, `BOOLEAN` is an alias for `BOOL`. 

## Syntax

There are two predefined
[named constants](sql-constants.html#named-constants) for `BOOL`:
`TRUE` and `FALSE` (the names are case-insensitive).

Alternately, a boolean value can be obtained by coercing a numeric
value: zero is coerced to `FALSE`, and any non-zero value to `TRUE`.

- `CAST(0 AS BOOL)` (false)
- `CAST(123 AS BOOL)` (true)

## Size

A `BOOL` value is 1 byte in width, but the total storage size is likely to be larger due to CockroachDB metadata.  

## Examples

~~~ sql
> CREATE TABLE bool (a INT PRIMARY KEY, b BOOL, c BOOLEAN);

> SHOW COLUMNS FROM bool;
~~~
~~~
+-------+------+-------+---------+
| Field | Type | Null  | Default |
+-------+------+-------+---------+
| a     | INT  | false | NULL    |
| b     | BOOL | true  | NULL    |
| c     | BOOL | true  | NULL    |
+-------+------+-------+---------+
~~~
~~~ sql
> INSERT INTO bool VALUES (12345, true, CAST(0 AS BOOL));

> SELECT * FROM bool;
~~~
~~~
+-------+------+-------+
|   a   |  b   |   c   |
+-------+------+-------+
| 12345 | true | false |
+-------+------+-------+
~~~

## Supported Casting & Conversion

`BOOL` values can be [cast](data-types.html#data-type-conversions-casts) to any of the following data types:

Type | Details
-----|--------
`INT` | Converts `true` to `1`, `false` to `0`
`DECIMAL` | Converts `true` to `1`, `false` to `0`
`FLOAT` | Converts `true` to `1`, `false` to `0`
`STRING` | ––

## See Also

[Data Types](data-types.html)
