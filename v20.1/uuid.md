---
title: UUID
summary: The UUID data type stores 128-bit Universal Unique Identifiers.
toc: true
---

The `UUID` (Universally Unique Identifier) [data type](data-types.html) stores a 128-bit value that is [unique across both space and time](https://www.ietf.org/rfc/rfc4122.txt).

{{site.data.alerts.callout_success}}
To auto-generate unique row IDs, we recommend using [`UUID`](uuid.html) with the `gen_random_uuid()` function as the default value. See the [example](#create-a-table-with-auto-generated-unique-row-ids) below for more details.
{{site.data.alerts.end}}


## Syntax
A `UUID` value can be expressed using the following formats:

Format | Description
-------|-------------
Standard [RFC4122](http://www.ietf.org/rfc/rfc4122.txt)-specified format | Hyphen-separated groups of 8, 4, 4, 4, 12 hexadecimal digits.<br><br> Example: `acde070d-8c4c-4f0d-9d8a-162843c10333`
With braces | The standard [RFC4122](http://www.ietf.org/rfc/rfc4122.txt)-specified format with braces.<br><br>Example: `{acde070d-8c4c-4f0d-9d8a-162843c10333}`
As `BYTES` | `UUID` value specified as bytes.<br><br>Example: `b'kafef00ddeadbeed'`
`UUID` used as a URN | `UUID` can be used as a Uniform Resource Name (URN). In that case, the format is [specified](https://www.ietf.org/rfc/rfc2141.txt) as "urn:uuid:" followed by standard [RFC4122](http://www.ietf.org/rfc/rfc4122.txt)-specified format.<br><br>Example: `urn:uuid:63616665-6630-3064-6465-616462656564`

## Size
A `UUID` value is 128 bits in width, but the total storage size is likely to be larger due to CockroachDB metadata.

## Examples

### Create a table with manually-entered `UUID` values

#### Create a table with `UUID` in standard [RFC4122](http://www.ietf.org/rfc/rfc4122.txt)-specified format

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE v (token uuid);
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO v VALUES ('63616665-6630-3064-6465-616462656562');
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM v;
~~~

~~~
+--------------------------------------+
|                token                 |
+--------------------------------------+
| 63616665-6630-3064-6465-616462656562 |
+--------------------------------------+
(1 row)
~~~

#### Create a table with `UUID` in standard [RFC4122](http://www.ietf.org/rfc/rfc4122.txt)-specified format with braces

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO v VALUES ('{63616665-6630-3064-6465-616462656563}');
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM v;
~~~

~~~
+--------------------------------------+
|                token                 |
+--------------------------------------+
| 63616665-6630-3064-6465-616462656562 |
| 63616665-6630-3064-6465-616462656563 |
+--------------------------------------+
(2 rows)
~~~

#### Create a table with `UUID` in byte format

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO v VALUES (b'kafef00ddeadbeed');
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM v;
~~~

~~~
+--------------------------------------+
|                token                 |
+--------------------------------------+
| 63616665-6630-3064-6465-616462656562 |
| 63616665-6630-3064-6465-616462656563 |
| 6b616665-6630-3064-6465-616462656564 |
+--------------------------------------+
(3 rows)
~~~

#### Create a table with `UUID` used as URN

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO v VALUES ('urn:uuid:63616665-6630-3064-6465-616462656564');
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM v;
~~~

~~~
+--------------------------------------+
|                token                 |
+--------------------------------------+
| 63616665-6630-3064-6465-616462656562 |
| 63616665-6630-3064-6465-616462656563 |
| 6b616665-6630-3064-6465-616462656564 |
| 63616665-6630-3064-6465-616462656564 |
+--------------------------------------+
(4 rows)
~~~

### Create a table with auto-generated unique row IDs

{% include {{ page.version.version }}/faq/auto-generate-unique-ids.html %}

## Supported casting and conversion

`UUID` values can be [cast](data-types.html#data-type-conversions-and-casts) to the following data type:

Type | Details
-----|--------
`BYTES` | Requires supported [`BYTES`](bytes.html) string format, e.g., `b'\141\061\142\062\143\063'`.

## See also

[Data Types](data-types.html)
