---
title: INET
summary: The INET data type stores an IPv4 or IPv6 address.
toc: true
---
The `INET` [data type](data-types.html) stores an IPv4 or IPv6 address.

## Syntax

A constant value of type `INET` can be expressed using an
[interpreted literal](sql-constants.html#interpreted-literals), or a
string literal
[annotated with](scalar-expressions.html#explicitly-typed-expressions)
type `INET` or
[coerced to](scalar-expressions.html#explicit-type-coercions) type
`INET`.

`INET` constants can be expressed using the following formats:

Format | Description
-------|-------------
IPv4 | Standard [RFC791](https://tools.ietf.org/html/rfc791)-specified format of 4 octets expressed individually in decimal numbers and separated by periods. Optionally, the address can be followed by a subnet mask.<br><br>Examples: `'190.0.0.0'`, `'190.0.0.0/24'`
IPv6 | Standard [RFC8200](https://tools.ietf.org/html/rfc8200)-specified format of 8 colon-separated groups of 4 hexadecimal digits. An IPv6 address can be mapped to an IPv4 address. Optionally, the address can be followed by a subnet mask.<br><br>Examples: `'2001:4f8:3:ba:2e0:81ff:fe22:d1f1'`, `'2001:4f8:3:ba:2e0:81ff:fe22:d1f1/120'`, `'::ffff:192.168.0.1/24'`

{{site.data.alerts.callout_info}}IPv4 addresses will sort before IPv6 addresses, including IPv4-mapped IPv6 addresses.{{site.data.alerts.end}}

## Size

An `INET` value is 32 bits for IPv4 or 128 bits for IPv6.

## Example

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE computers (
    ip INET PRIMARY KEY,
    user_email STRING,
    registration_date DATE
  );
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM computers;
~~~

~~~
+-------------------+-----------+-------------+----------------+-----------------------+-------------+
|    column_name    | data_type | is_nullable | column_default | generation_expression |   indices   |
+-------------------+-----------+-------------+----------------+-----------------------+-------------+
| ip                | INET      |    false    | NULL           |                       | {"primary"} |
| user_email        | STRING    |    true     | NULL           |                       | {}          |
| registration_date | DATE      |    true     | NULL           |                       | {}          |
+-------------------+-----------+-------------+----------------+-----------------------+-------------+
(3 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO computers
  VALUES
    ('192.168.0.1', 'info@cockroachlabs.com', '2018-01-31'),
    ('192.168.0.2/10', 'lauren@cockroachlabs.com', '2018-01-31'),
    ('2001:4f8:3:ba:2e0:81ff:fe22:d1f1/120', 'test@cockroachlabs.com', '2018-01-31');
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM computers;
~~~
~~~
+--------------------------------------+--------------------------+---------------------------+
|                  ip                  |        user_email        |     registration_date     |
+--------------------------------------+--------------------------+---------------------------+
| 192.168.0.1                          | info@cockroachlabs.com   | 2018-01-31 00:00:00+00:00 |
| 192.168.0.2/10                       | lauren@cockroachlabs.com | 2018-01-31 00:00:00+00:00 |
| 2001:4f8:3:ba:2e0:81ff:fe22:d1f1/120 | test@cockroachlabs.com   | 2018-01-31 00:00:00+00:00 |
+--------------------------------------+--------------------------+---------------------------+
~~~

## Supported casting and conversion

`INET` values can be [cast](data-types.html#data-type-conversions-and-casts) to the following data type:

- `STRING` - Converts to format `'Address/subnet'`.

## See also

- [Data Types](data-types.html)
- [Functions and Operators](functions-and-operators.html)
