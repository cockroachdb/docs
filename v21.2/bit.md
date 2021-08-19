---
title: BIT
summary: The BIT and BIT VARYING data types stores bit arrays.
toc: true
---

The `BIT` and `VARBIT` [data types](data-types.html) stores bit arrays.
With `BIT`, the length is fixed; with `VARBIT`, the length can be variable.

## Aliases

The name `BIT VARYING` is an alias for `VARBIT`.

## Syntax

Bit array constants are expressed as literals. For example, `B'100101'` denotes an array of 6 bits.

For more information about bit array constants, see the [constants documentation on bit array literals](sql-constants.html#bit-array-literals).

For usage, see the [Example](#example) below.

## Size

The number of bits in a `BIT` value is determined as follows:

| Type declaration | Logical size                      |
|------------------|-----------------------------------|
| BIT              | 1 bit                             |
| BIT(N)           | N bits                            |
| VARBIT           | variable with no maximum          |
| VARBIT(N)        | variable with a maximum of N bits |

The effective size of a `BIT` value is larger than its logical number
of bits by a bounded constant factor. Internally, CockroachDB stores
bit arrays in increments of 64 bits plus an extra integer value to
encode the length.

The total size of a `BIT` value can be arbitrarily large, but it is
recommended to keep values under 1 MB to ensure performance. Above
that threshold, [write
amplification](https://en.wikipedia.org/wiki/Write_amplification) and
other considerations may cause significant performance degradation.

## Example

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE b (x BIT, y BIT(3), z VARBIT, w VARBIT(3));
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM b;
~~~

~~~
  column_name | data_type | is_nullable | column_default | generation_expression |  indices  | is_hidden
+-------------+-----------+-------------+----------------+-----------------------+-----------+-----------+
  x           | BIT       |    true     | NULL           |                       | {}        |   false
  y           | BIT(3)    |    true     | NULL           |                       | {}        |   false
  z           | VARBIT    |    true     | NULL           |                       | {}        |   false
  w           | VARBIT(3) |    true     | NULL           |                       | {}        |   false
  rowid       | INT       |    false    | unique_rowid() |                       | {primary} |   true
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO b(x, y, z, w) VALUES (B'1', B'101', B'1', B'1');
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM b;
~~~

~~~
  x |  y  | z | w
+---+-----+---+---+
  1 | 101 | 1 | 1
~~~

For type `BIT`, the value must match exactly the specified size:

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO b(x) VALUES (B'101');
~~~

~~~
pq: bit string length 3 does not match type BIT
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO b(y) VALUES (B'10');
~~~

~~~
pq: bit string length 2 does not match type BIT(3)
~~~

For type `VARBIT`, the value must not be larger than the specified maximum size:

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO b(w) VALUES (B'1010');
~~~

~~~
pq: bit string length 4 too large for type VARBIT(3)
~~~

## Supported casting and conversion

`BIT` values can be [cast](data-types.html#data-type-conversions-and-casts) to any of the following data types:

Type | Details
-----|---------
`INT` | Converts the bit array to the corresponding numeric value, interpreting the bits as if the value was encoded using [two's complement](https://en.wikipedia.org/wiki/Two%27s_complement). If the bit array is larger than the integer type, excess bits on the left are ignored. For example, `B'1010'::INT` equals 10.
`STRING` | Prints out the binary digits as a string. This recovers the literal representation. For example, `B'1010'::INT` equals `'1010'`.

## See also

[Data Types](data-types.html)
