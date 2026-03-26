---
title: BYTES
summary: The BYTES data type stores binary strings of variable length.
toc: true
docs_area: reference.sql
---

The `BYTES` [data type]({% link {{ page.version.version }}/data-types.md %}) stores binary strings of variable length.


## Aliases

In CockroachDB, the following are aliases for `BYTES`:

- `BYTEA`
- `BLOB`

## Syntax

To express a byte array constant, see the section on
[byte array literals]({% link {{ page.version.version }}/sql-constants.md %}#byte-array-literals) for more
details. For example, the following three are equivalent literals for the same
byte array: `b'abc'`, `b'\141\142\143'`, `b'\x61\x62\x63'`.

In addition to this syntax, CockroachDB also supports using
[string literals]({% link {{ page.version.version }}/sql-constants.md %}#string-literals), including the
syntax `'...'`, `e'...'` and `x'....'` in contexts where a byte array
is otherwise expected.

## Size

The size of a `BYTES` value is variable, but it's recommended to keep values under 1 MB to ensure adequate performance. Above that threshold, [write amplification]({% link {{ page.version.version }}/architecture/storage-layer.md %}#write-amplification) and other considerations may cause significant performance degradation.

{{site.data.alerts.callout_danger}}
{% include {{page.version.version}}/sql/add-size-limits-to-indexed-columns.md %}
{{site.data.alerts.end}}

{{site.data.alerts.callout_success}}
If your application requires large binary input in single queries, you can store the blobs somewhere your client can access them (using a cloud storage service, for example), and then reference their addresses from a statement.
{{site.data.alerts.end}}

## Example

~~~ sql
> CREATE TABLE bytes (a INT PRIMARY KEY, b BYTES);

> -- explicitly typed BYTES literals
> INSERT INTO bytes VALUES (1, b'\141\142\143'), (2, b'\x61\x62\x63'), (3, b'\141\x62\c');

> -- string literal implicitly typed as BYTES
> INSERT INTO bytes VALUES (4, 'abc');


> SELECT * FROM bytes;
~~~
~~~
+---+-----+
| a |  b  |
+---+-----+
| 1 | abc |
| 2 | abc |
| 3 | abc |
| 4 | abc |
+---+-----+
(4 rows)
~~~

## Supported conversions

`BYTES` values can be
[cast]({% link {{ page.version.version }}/data-types.md %}#data-type-conversions-and-casts) explicitly to
[`STRING`]({% link {{ page.version.version }}/string.md %}). This conversion always succeeds. Two
conversion modes are supported, controlled by the
[session variable]({% link {{ page.version.version }}/set-vars.md %}#supported-variables) `bytea_output`:

- `hex` (default): The output of the conversion starts with the two
  characters `\`, `x` and the rest of the string is composed by the
  hexadecimal encoding of each byte in the input. For example,
  `x'48AA'::STRING` produces `'\x48AA'`.

- `escape`: The output of the conversion contains each byte in the
  input, as-is if it is an ASCII character, or encoded using the octal
  escape format `\NNN` otherwise. For example, `x'48AA'::STRING`
  produces `'0\252'`.

`STRING` values can be cast explicitly to `BYTES`. This conversion
will fail if the hexadecimal digits are not valid, or if there is an
odd number of them. Two conversion modes are supported:

- If the string starts with the two special characters `\` and `x`
  (e.g., `\xAABB`), the rest of the string is interpreted as a sequence
  of hexadecimal digits. The string is then converted to a byte array
  where each pair of hexadecimal digits is converted to one byte.

- Otherwise, the string is converted to a byte array that contains its
  UTF-8 encoding.

### `STRING` vs. `BYTES`

While both `STRING` and `BYTES` can appear to have similar behavior in many situations, one should understand their nuance before casting one into the other.

`STRING` treats all of its data as characters, or more specifically, Unicode code points. `BYTES` treats all of its data as a byte string. This difference in implementation can lead to dramatically different behavior. For example, let's take a complex Unicode character such as ☃ ([the snowman emoji](https://emojipedia.org/snowman/)):

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT length('☃'::string);
~~~

~~~
  length
+--------+
       1
~~~

~~~ sql
> SELECT length('☃'::bytes);
~~~
~~~
  length
+--------+
       3
~~~

In this case, [`LENGTH(string)`]({% link {{ page.version.version }}/functions-and-operators.md %}#string-and-byte-functions) measures the number of Unicode code points present in the string, whereas [`LENGTH(bytes)`]({% link {{ page.version.version }}/functions-and-operators.md %}#string-and-byte-functions) measures the number of bytes required to store that value. Each character (or Unicode code point) can be encoded using multiple bytes, hence the difference in output between the two.

#### Translating literals to `STRING` vs. `BYTES`

A literal entered through a SQL client will be translated into a different value based on the type:

+ `BYTES` give a special meaning to the pair `\x` at the beginning, and translates the rest by substituting pairs of hexadecimal digits to a single byte. For example, `\xff` is equivalent to a single byte with the value of 255. For more information, see [SQL Constants: String literals with character escapes]({% link {{ page.version.version }}/sql-constants.md %}#string-literals-with-character-escapes).
+ `STRING` does not give a special meaning to `\x`, so all characters are treated as distinct Unicode code points. For example, `\xff` is treated as a `STRING` with length 4 (`\`, `x`, `f`, and `f`).

## See also

[Data Types]({% link {{ page.version.version }}/data-types.md %})
