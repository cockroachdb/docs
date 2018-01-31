---
title: INET
summary: The INET data type stores an IPv4 or IPv6 host address.
toc: false
---
<span class="version-tag">New in v2.0:</span> The `INET` [data type](data-types.html) stores an IPv4 or IPv6 address.

<div id="toc"></div>

## Syntax



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
+-------------------+--------+-------+---------+-------------+
|       Field       |  Type  | Null  | Default |   Indices   |
+-------------------+--------+-------+---------+-------------+
| ip                | INET   | false | NULL    | {"primary"} |
| user_email        | STRING | true  | NULL    | {}          |
| registration_date | DATE   | true  | NULL    | {}          |
+-------------------+--------+-------+---------+-------------+
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO computers
  VALUES
    ('192.168.0.1', 'info@cockroachlabs.com', '2018-01-31'),
    ('192.168.0.2/10', 'lauren@cockroachlabs.com', '2018-01-31');
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM computers;
~~~
~~~
+----------------+--------------------------+---------------------------+
|       id       |        user_email        |     registration_date     |
+----------------+--------------------------+---------------------------+
| 192.168.0.1    | info@cockroachlabs.com   | 2018-01-31 00:00:00+00:00 |
| 192.168.0.2/10 | lauren@cockroachlabs.com | 2018-01-31 00:00:00+00:00 |
+----------------+--------------------------+---------------------------+
~~~

## Supported Casting & Conversion

`INET` values can be [cast](data-types.html#data-type-conversions-casts) to the following data type:

Type | Details
-----|--------
`BYTES` | Requires supported [`BYTES`](bytes.html) string format, e.g., `b'\141\061\142\062\143\063'`.
`STRING` | ––

## See Also

[Data Types](data-types.html)
[Functions and Operators](functions-and-operators.html)
