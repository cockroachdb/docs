---
title: UUID
summary: The UUID data type stores 128-bit Universal Unique Identifiers.
toc: true
docs_area: reference.sql
---

The `UUID` (Universally Unique Identifier) [data type]({% link {{ page.version.version }}/data-types.md %}) implements the UUIDv4 format from [RFC 4122](https://www.ietf.org/rfc/rfc4122.txt). It stores a 128-bit value that is "unique across both space and time, with respect to the space of all UUIDs" as specified by the RFC.

To auto-generate UUIDs:

- Use the `gen_random_uuid()` function as the default value of the `UUID` data type.
- Use the `uuid_v4()` function as the default value of the [`BYTES`]({% link {{ page.version.version }}/bytes.md %}) data type.

For examples, refer to [Create a table with auto-generated unique row IDs](#create-a-table-with-auto-generated-unique-row-ids).

{{site.data.alerts.callout_success}}
{% include {{ page.version.version }}/sql/use-uuidv4.md %}
{{site.data.alerts.end}}

## Syntax

You can express `UUID` values using the following formats:

Format | Description
-------|-------------
Standard [RFC4122](http://www.ietf.org/rfc/rfc4122.txt) (UUIDv4) format | Hyphen-separated groups of 8, 4, 4, 4, and 12 hexadecimal digits.<br><br>Example: `acde070d-8c4c-4f0d-9d8a-162843c10333`
`BYTES` | `UUID` value specified as a [`BYTES`]({% link {{ page.version.version }}/bytes.md %}) value.<br><br>Example: `b'kafef00ddeadbeed'`
Uniform Resource Name | A [Uniform Resource Name (URN)](https://www.ietf.org/rfc/rfc2141.txt) specified as "urn:uuid:" followed by the [RFC4122](http://www.ietf.org/rfc/rfc4122.txt) format.<br><br>Example: `urn:uuid:63616665-6630-3064-6465-616462656564`
Alternate PostgreSQL-supported formats | All [alternate `UUID` formats supported by PostgreSQL](https://www.postgresql.org/docs/current/datatype-uuid.html), including the [RFC4122](http://www.ietf.org/rfc/rfc4122.txt) format surrounded by braces, any supported format with upper-case digits, any supported format with some or all hyphens omitted, and any supported format with hyphens after any group of four digits.<br><br>Examples: `{acde070d-8c4c-4f0d-9d8a-162843c10333}`, `ACDE070D-8C4C-4f0D-9d8A-162843c10333`, `acde070d8c4c4f0d9d8a162843c10333`, `acde-070d-8c4c-4f0d-9d8a-1628-43c1-0333`

CockroachDB displays all `UUID` values in the standard [RFC4122](http://www.ietf.org/rfc/rfc4122.txt) format, and implements the UUIDv4 (random) version from the RFC.

## Size

A `UUID` value is 128 bits in width, but the total storage size is likely to be larger due to CockroachDB metadata.

## Examples

### Create a table with manually-entered `UUID` values

{{site.data.alerts.callout_success}}
{% include {{ page.version.version }}/sql/use-uuidv4.md %}
{{site.data.alerts.end}}

#### Create a table with `UUID` in standard [RFC4122](http://www.ietf.org/rfc/rfc4122.txt)-specified format

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE v (token uuid);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO v VALUES ('63616665-6630-3064-6465-616462656562');
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM v;
~~~

~~~
                 token
----------------------------------------
  63616665-6630-3064-6465-616462656562
(1 row)
~~~

#### Create a table with `UUID` in `BYTE` format

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO v VALUES (b'kafef00ddeadbeed');
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM v;
~~~

~~~
                 token
----------------------------------------
  63616665-6630-3064-6465-616462656562
  6b616665-6630-3064-6465-616462656564
(2 rows)
~~~

#### Create a table with `UUID` used as URN

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO v VALUES ('urn:uuid:63616665-6630-3064-6465-616462656564');
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM v;
~~~

~~~
                 token
----------------------------------------
  63616665-6630-3064-6465-616462656562
  6b616665-6630-3064-6465-616462656564
  63616665-6630-3064-6465-616462656564
(3 rows)
~~~

#### Express UUIDs in alternate formats

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO v VALUES ('{acde070d-8c4c-4f0d-9d8a-162843c10333}'), ('ACDE070D-8C4C-4f0D-9d8A-162843c10333'), ('acde070d8c4c4f0d9d8a162843c10333'), ('acde-070d-8c4c-4f0d-9d8a-1628-43c1-0333');
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM v;
~~~

~~~
                 token
----------------------------------------
  63616665-6630-3064-6465-616462656562
  6b616665-6630-3064-6465-616462656564
  63616665-6630-3064-6465-616462656564
  acde070d-8c4c-4f0d-9d8a-162843c10333
  acde070d-8c4c-4f0d-9d8a-162843c10333
  acde070d-8c4c-4f0d-9d8a-162843c10333
  acde070d-8c4c-4f0d-9d8a-162843c10333
(7 rows)
~~~

### Create a table with auto-generated unique row IDs

{% include {{ page.version.version }}/faq/auto-generate-unique-ids.md %}

## Supported casting and conversion

`UUID` values can be [cast]({% link {{ page.version.version }}/data-types.md %}#data-type-conversions-and-casts) to the following data type:

Type | Details
-----|--------
`BYTES` | Requires supported [`BYTES`]({% link {{ page.version.version }}/bytes.md %}) string format, e.g., `b'\141\061\142\062\143\063'`.

## See also

- [Data Types]({% link {{ page.version.version }}/data-types.md %})
- [What is a UUID, and Why Should You Care?](https://www.cockroachlabs.com/blog/what-is-a-uuid/)
