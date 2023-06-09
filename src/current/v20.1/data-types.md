---
title: Data Types
summary: Learn about the data types supported by CockroachDB.
toc: true
---

## Supported types

CockroachDB supports the following data types. Click a type for more details.

Type | Description | Example | [Vectorized Execution](vectorized-execution.html)
-----|-------------|---------|----------
[`ARRAY`](array.html) | A 1-dimensional, 1-indexed, homogeneous array of any non-array data type. | `{"sky","road","car"}` | Not supported
[`BIT`](bit.html) | A string of binary digits (bits).  | `B'10010101'` | Not supported
[`BOOL`](bool.html) | A Boolean value. | `true` | Supported
[`BYTES`](bytes.html) | A string of binary characters. | `b'\141\061\142\062\143\063'` | Supported
[`COLLATE`](collate.html) | The `COLLATE` feature lets you sort [`STRING`](string.html) values according to language- and country-specific rules, known as collations.  | `'a1b2c3' COLLATE en` | Not supported
[`DATE`](date.html) | A date.  | `DATE '2016-01-25'` | Supported
[`DECIMAL`](decimal.html) | An exact, fixed-point number.  | `1.2345` | Supported
[`FLOAT`](float.html) | A 64-bit, inexact, floating-point number.  | `1.2345` | Supported
[`INET`](inet.html) | An IPv4 or IPv6 address.  | `192.168.0.1` | Not supported
[`INT`](int.html) | A signed integer, up to 64 bits. | `12345` | Supported
[`INTERVAL`](interval.html) | A span of time.  | `INTERVAL '2h30m30s'` | Supported
[`JSONB`](jsonb.html) | JSON (JavaScript Object Notation) data.  | `'{"first_name": "Lola", "last_name": "Dog", "location": "NYC", "online" : true, "friends" : 547}'` | Not supported
[`SERIAL`](serial.html) | A pseudo-type that combines an [integer type](int.html) with a [`DEFAULT` expression](default-value.html).  | `148591304110702593` | Not supported
[`STRING`](string.html) | A string of Unicode characters. | `'a1b2c3'` | Supported
[`TIME`<br>`TIMETZ`](time.html) | `TIME` stores a time of day in UTC.<br><span class="version-tag">New in v20.1:</span> `TIMETZ` converts `TIME` values with a specified time zone offset from UTC. | `TIME '01:23:45.123456'`<br> `TIMETZ '01:23:45.123456-5:00'` | Not supported
[`TIMESTAMP`<br>`TIMESTAMPTZ`](timestamp.html) | `TIMESTAMP` stores a date and time pairing in UTC.<br>`TIMESTAMPTZ` converts `TIMESTAMP` values with a specified time zone offset from UTC. | `TIMESTAMP '2016-01-25 10:10:10'`<br>`TIMESTAMPTZ '2016-01-25 10:10:10-05:00'` | Supported
[`UUID`](uuid.html) | A 128-bit hexadecimal value. | `7f9c24e8-3b12-4fef-91e0-56a2d5a246ec` | Supported

## Data type conversions and casts

CockroachDB supports explicit type conversions using the following methods:

- `<type> 'string literal'`, to convert from the literal representation of a value to a value of that type. For example:
  `DATE '2008-12-21'`, `INT '123'`, or `BOOL 'true'`.

- `<value>::<data type>`, or its equivalent longer form `CAST(<value> AS <data type>)`, which converts an arbitrary expression of one built-in type to another (this is also known as type coercion or "casting"). For example:
  `NOW()::DECIMAL`, `VARIANCE(a+2)::INT`.

    {{site.data.alerts.callout_success}}
    To create constant values, consider using a
    <a href="scalar-expressions.html#explicitly-typed-expressions">type annotation</a>
    instead of a cast, as it provides more predictable results.
    {{site.data.alerts.end}}

- Other [built-in conversion functions](functions-and-operators.html) when the type is not a SQL type, for example `from_ip()`, `to_ip()` to convert IP addresses between `STRING` and `BYTES` values.

<span class="version-tag">New in v20.1:</span> CockroachDB also supports implicit casting from string literals to `INT` and `DECIMAL` [`ARRAY`](array.html)s, where appropriate. For an example, see [Implicit casting to `INT` and `DECIMAL` `ARRAY`s](array.html#implicit-casting-to-int-and-decimal-arrays).

You can find each data type's supported conversion and casting on its
respective page in its section **Supported casting & conversion**.
