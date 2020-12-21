---
title: INT
summary: CockroachDB supports various signed integer data types.
toc: true
---

CockroachDB supports various signed integer [data types](data-types.html).

{{site.data.alerts.callout_info}}
For instructions showing how to auto-generate integer values (e.g., to auto-number rows in a table), see [this FAQ entry](sql-faqs.html#how-do-i-auto-generate-unique-row-ids-in-cockroachdb).
{{site.data.alerts.end}}

## Names and Aliases

| Name   | Allowed Width | Aliases                                          | Range                                        |
|--------+---------------+--------------------------------------------------+----------------------------------------------|
| `INT`  | 64-bit        | `INTEGER`<br />`INT8`<br />`INT64`<br />`BIGINT` | -9223372036854775807 to +9223372036854775807 |
| `INT2` | 16-bit        | `SMALLINT`                                       | -32768 to +32767                             |
| `INT4` | 32-bit        | None                                             | -2147483648 to +2147483647                   |
| `INT8` | 64-bit        | `INT`                                            | -9223372036854775807 to +9223372036854775807 |

## Syntax

A constant value of type `INT` can be entered as a [numeric literal](sql-constants.html#numeric-literals).
For example: `42`, `-1234`, or `0xCAFE`.

## Size

The different integer types place different constraints on the range of allowable values, but all integers are stored in the same way regardless of type. Smaller values take up less space than larger ones (based on the numeric value, not the data type).

### Considerations for 64-bit signed integers

By default, `INT` is an alias for `INT8`, which creates 64-bit signed integers. This differs from the Postgres default for `INT`, [which is 32 bits](https://www.postgresql.org/docs/9.6/datatype-numeric.html), and may cause issues for your application if it is not written to handle 64-bit integers, whether due to the language your application is written in, or the ORM/framework it uses to generate SQL (if any).

For example, JavaScript language runtimes represent numbers as 64-bit floats, which means that the JS runtime [can only represent 53 bits of numeric accuracy](http://2ality.com/2012/04/number-encoding.html) and thus has a max safe value of 2<sup>53</sup>, or 9007199254740992.  This means that the maximum size of a default `INT` in CockroachDB is much larger than JavaScript can represent as an integer. Visually, the size difference is as follows:

```
9223372036854775807 # INT default max value
   9007199254740991 # JS integer max value
```

Given the above, if a table contains a column with a default-sized `INT` value, and you are reading from it or writing to it via JavaScript, you will not be able to read and write values to that column correctly. This issue can pop up in a surprising way if you are using a framework that autogenerates both frontend and backend code (such as [twirp](https://github.com/twitchtv/twirp)). In such cases, you may find that your backend code can handle 64-bit signed integers, but the generated client/frontend code cannot.

If your application needs to use an integer size that is different than the CockroachDB default (for these or other reasons), you can change one or both of the settings below. For example, you can set either of the below to `4` to cause `INT` and `SERIAL` to become aliases for `INT4` and `SERIAL4`, which use 32-bit integers.

1. The `default_int_size` [session variable](set-vars.html).
2. The `sql.defaults.default_int_size` [cluster setting](cluster-settings.html).

{{site.data.alerts.callout_success}}
If your application requires arbitrary precision numbers, use the [`DECIMAL`](decimal.html) data type.
{{site.data.alerts.end}}

## Examples

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE ints (a INT PRIMARY KEY, b SMALLINT);
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM ints;
~~~

~~~
  column_name | data_type | is_nullable | column_default | generation_expression |  indices  | is_hidden
--------------+-----------+-------------+----------------+-----------------------+-----------+------------
  a           | INT8      |    false    | NULL           |                       | {primary} |   false
  b           | INT2      |    true     | NULL           |                       | {}        |   false
(2 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO ints VALUES (1, 32);
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM ints;
~~~

~~~
  a | b
----+-----
  1 | 32
(1 row)
~~~

## Supported casting and conversion

`INT` values can be [cast](data-types.html#data-type-conversions-and-casts) to any of the following data types:

Type | Details
-----|--------
`DECIMAL` | ––
`FLOAT` | Loses precision if the `INT` value is larger than 2^53 in magnitude.
`BIT` | Converts to the binary representation of the integer value. If the value is negative, the sign bit is replicated on the left to fill the entire bit array.
`BOOL` | **0** converts to `false`; all other values convert to `true`.
`DATE` | Converts to days since the Unix epoch (Jan. 1, 1970). This is a CockroachDB experimental feature which may be changed without notice.
`TIMESTAMP` | Converts to seconds since the Unix epoch (Jan. 1, 1970). This is a CockroachDB experimental feature which may be changed without notice.
`INTERVAL` | Converts to seconds.
`STRING` | ––

## See also

- [Data Types](data-types.html)
- [`FLOAT`](float.html)
- [`DECIMAL`](decimal.html)
